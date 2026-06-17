# 外部函数接口

> 对应英文：[Foreign Function Interface](https://lean-lang.org/doc/reference/latest/Run-Time-Code/Foreign-Function-Interface/)，抓取日期：2026-06-16。

Lean 提供与任何支持 C ABI 的语言高效互操作的能力。当前接口主要面向 Lean 内部与高级用户，英文页也明确说明它仍应视为不稳定接口。

## 两类关键 attribute

### `@[extern sym]`

把某个 Lean 声明绑定到外部符号 `sym`。编译后的 Lean 代码会把该声明实现视为这个外部函数。

### `@[export sym]`

把某个 Lean 常量导出为名为 `sym` 的未混淆符号，使外部 C 代码可直接调用它。

## Lean ABI

Lean 的 FFI 以 C ABI 为基础。某个 Lean 声明的类型会被翻译成对应的 C 声明：

- 若没有参数，则更像一个导出值/零参函数入口；
- 若有参数，则参数和返回值都按 Lean 类型映射到对应的 C 类型。

## 常见类型映射

英文页给出例如：

- `UInt8`…`UInt64`、`USize` → 对应 C 无符号整数类型
- `Char` → `uint32_t`
- `Float` → `double`
- `Nat`、`Int` → `lean_object *`（可能是 boxed 大整数，也可能是标量编码）
- proposition / irrelevant 类型 → 运行时被擦除或映射到 `lean_box(0)`

## Borrowing

默认情况下，`extern` 函数接收的 `lean_object *` 参数被视为**拥有权转移**。若想声明它只是借用，可在 Lean 侧参数类型前加：

- `@&`

这让外部代码知道：

- 该对象不可被消费掉；
- 如需长期持有，应显式 `lean_inc`。

## 初始化

在外部程序中嵌入 Lean 代码时，不能直接跳过初始化。英文页给出了一整套初始化顺序，包括：

- `lean_initialize_runtime_module()`
- `lean_initialize()`
- `lean_setup_args(...)`
- 各模块的 `initialize_...` 函数
- 必要时的 `lean_initialize_thread()` / `lean_finalize_thread()`

这一步若做错，后续任何 Lean 声明调用都不可信。

## 使用建议

- 普通项目里，除非真的需要跨语言互操作，否则不必直接下探到这一层；
- 一旦涉及 `extern` / `export`，应同时理解 ABI、ownership、初始化和运行时表示；
- FFI 不只是“能调就行”，而是与 Lean 运行时模型紧密绑定的接口。