# 初始化

> 对应英文：[Initialization](https://lean-lang.org/doc/reference/latest/Elaboration-and-Compilation/#initialization)，抓取日期：2026-06-16。

在 elaborator 真正开始工作前，Lean 必须先正确初始化。初始化不仅是“加载一些模块”，还关系到：

- environment extension 数量与布局；
- builtin initializer 的执行；
- 依赖模块的 initializer 顺序；
- compiler / elaborator 所需的内部状态构造。

## 初始化流程概览

1. 先运行 Lean 自身的 builtin initializer，准备 compiler 与基础环境。
2. 解析 module header，加载依赖 `.olean`。
3. 构造 pre-environment，包含依赖 environment 的并集。
4. 运行依赖指定的初始化代码。
5. 在知道全部 environment extension 数量后，把 pre-environment 重新分配为正式 environment。

## 为什么 environment extension 很关键

许多 Lean 功能都不只是一张“名字到定义”的表，还会把额外信息保存在 environment extension 中，例如：

- simp lemma 表；
- pretty-printer 扩展；
- compiler 中间结果索引；
- 自定义 attribute 支撑结构。

因为这些 extension 通过数组索引访问，所以在真正构造最终 environment 前，Lean 必须先知道一共有多少 extension。

## `initialize`

`initialize` block 会把初始化代码加入当前 module 的 initializer 列表。它的内容按 `IO` monad 中的 `do` block 处理。

常见用途：

- 设置某些全局可变引用；
- 注册自定义 attribute、simproc、pretty-printer；
- 初始化 extension 的默认状态；
- 构造需要在 elaboration 开始前存在的辅助值。

## `builtin_initialize`

Lean 自身实现中还有必须在加载任何 module 前就运行的初始化代码。这类代码用 `builtin_initialize` 声明。它主要服务于 Lean 编译器自身的 bootstrapping，不应在普通项目中使用。

## 使用建议

- 普通库若需要初始化，优先用 `initialize`；
- 除非在做 Lean 自身或非常底层的系统工作，不要使用 `builtin_initialize`；
- 遇到“某扩展在导入后不可用”的问题时，要检查对应 initializer 是否真的被执行。
