# `ToFormat` 类

> 对应英文：[The ToFormat Class](https://lean-lang.org/doc/reference/latest/Interacting-with-Lean/#The-Lean-Language-Reference--Interacting-with-Lean--Formatted-Output--Format--The--ToFormat--Class)，抓取日期：2026-06-16。

`ToFormat` class 描述“某个类型如何转成结构化文档 `Std.Format`”。它比直接返回 `String` 更适合交互式输出，因为结果仍保留布局信息，能继续被 pretty-printer 调整。

## 作用

若某类型有 `ToFormat` instance，则：

- 可更自然地出现在 Lean 消息和诊断中；
- 能与 `Format` 组合器协同，而不是过早丢失结构；
- 在复杂嵌套结构中通常比 `ToString` 更可读。

## 与其他显示类的关系

- `ToString`：只产出平面字符串。
- `ToFormat`：产出带结构的文档。
- `Repr`：通常产出更接近 Lean 语法的表示，常用于 `#eval`。

很多情况下，一个类型既会有 `ToFormat` instance，也会有 `Repr` instance，但它们目标不同：

- `ToFormat` 偏“消息展示”；
- `Repr` 偏“值表示”。

## 何时自己写 `ToFormat`

当类型：

- 有层级结构；
- 需要多行展示；
- 需要按宽度自动换行；
- 希望与其他文档块更自然组合；

时，自己写 `ToFormat` 通常比只给 `ToString` 更合适。

## 实践建议

- 简单原子类型可只实现 `ToString` 或 `Repr`；
- 对树状、嵌套、证明诊断结构，优先考虑 `ToFormat`；
- 写 `ToFormat` 时应尽量复用 `Std.Format` 组合器，而不是先拼接长字符串再包回文档。