# Boxing

> 对应英文：[Boxing](https://lean-lang.org/doc/reference/latest/Run-Time-Code/Boxing/)，抓取日期：2026-06-16。

Lean 运行时里的值有两种表示方式：

- **boxed**
- **unboxed**

## boxed 值

boxed 值要么是：

- 指向堆对象的指针；
- 要么是经过位移/掩码编码的立即值。

Lean 用最低位来区分这两类：

- 最低位为 `0`：表示普通指针；
- 最低位为 `1`：表示立即值，此时真实值需右移一位解码。

## unboxed 值

unboxed 值无需间接访问，运行时可直接使用。某些类型在编译器确信其具体类型时，会以原生 C 类型表示，例如：

- `UInt8`
- 枚举型归纳类型（如 `Bool`）

## 为什么有时还得装箱

即使某个类型“原则上可 unboxed”，在多态容器中仍可能被强制 boxing。例如：

- `Bool.not` 的参数和返回值通常是 unboxed 的 `uint8_t`
- 但 `Array Bool` 中的每个 `Bool` 元素仍需 boxed

原因是：像 `Array` 这样的通用容器在运行时要统一存放“任意 Lean 值”，因此需要 boxing 来抹平具体表示差异。

## 字段中的表现

- 若某个归纳类型构造子字段的类型本身可 unboxed，则该字段可用 unboxed 表示；
- 若该字段是某个多态位置的具体实例化，则它可能被 boxed。

## 使用建议

- 读性能问题时，要区分“类型本身支持 unboxed”与“当前上下文真的用 unboxed”；
- 多态容器常是 boxing 发生的热点；
- `Bool`、小整数等即便逻辑上简单，放进容器后也可能有不同运行时成本。