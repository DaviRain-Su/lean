# `Repr`

> 对应英文：[Repr](https://lean-lang.org/doc/reference/latest/Interacting-with-Lean/#repr)，抓取日期：2026-06-16。

`Repr` class 描述“如何把某个值显示成接近 Lean 语法的表示”。`#eval` 在显示结果时会优先尝试 `ToExpr`、`Repr` 或 `ToString`；因此 `Repr` 是运行结果展示中最常见的显示类之一。

## 核心接口

`Repr` 的核心方法通常是：

- `repr`
- `reprStr`

它们负责把值表示成一段更适合调试和阅读的文本/文档。

## 目标

一个好的 `Repr` instance 通常应满足：

- 输出可读；
- 尽量接近 Lean 表达式形状；
- 嵌套时能处理括号、参数优先级和构造器样式；
- 有助于 `#eval` 和调试，而不是只追求“对人自然语言友好”。

因此 `Repr` 和 `ToString` 的关注点并不相同。

## 典型用途

- `#eval` 打印返回值；
- 交互式调试内部状态；
- 在测试中检查结构化数据的可读表示；
- 为复杂数据类型提供稳定、接近源码的展示形式。

## 与 `Format` / `ToFormat` 的关系

- `Repr` 偏“值的表示”；
- `ToFormat` 偏“消息布局”；
- `Format` 是底层文档结构。

很多复杂类型会在内部用 `Format` 或其组合器辅助实现 `Repr`，以便处理缩进和括号。