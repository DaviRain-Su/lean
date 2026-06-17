# `Format` 文档块

> 对应英文：[Documents](https://lean-lang.org/doc/reference/latest/Interacting-with-Lean/#The-Lean-Language-Reference--Interacting-with-Lean--Formatted-Output--Format--Documents)，抓取日期：2026-06-16。

`Std.Format` 不是普通字符串，而是结构化文档表示。它的基本思想是：先描述“文本块之间如何组合”，再由渲染器根据宽度决定换行和缩进。

## 为什么不用直接字符串

若直接拼字符串：

- 很难根据终端宽度重排；
- 很难统一控制缩进、括号和折行；
- 错误消息或 pretty-printer 输出会迅速失去可读性。

而 `Format` 把这些布局信息保留下来。

## `Std.Format`

它可以表示：

- 原子文本
- 文档序列
- 可缩进块
- 括号 / 方括号包裹
- 可折叠的 group
- 换行提示

## `FlattenBehavior`

某些文档块既可以多行显示，也可以在“空间足够时”压平成一行。`FlattenBehavior` 就是控制这类“压平”策略的内部机制之一。

## `fill`

`fill` 用于“尽量把一组文档填进当前行”，空间不够时再换行。它特别适合：

- 参数列表
- 结构化子项并列
- 既希望紧凑又要自动折行的输出

## 使用建议

- 需要结构化消息时，优先构造 `Format`，最后再渲染；
- 只有输出极其简单、永远单行时，才考虑直接字符串。