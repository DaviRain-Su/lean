# Format

> 对应英文：[Formatted Output / Format](https://lean-lang.org/doc/reference/latest/Interacting-with-Lean/#Format)，抓取日期：2026-06-16。

Lean 的消息、pretty printer 和很多诊断输出并不是直接拼字符串，而是先构造一种结构化文档表示：`Std.Format`。这样输出系统可以根据宽度和布局规则，决定在哪里换行、缩进、加括号。

## 文档（Documents）

`Std.Format` 是一类“可渲染文档”。它能表示：

- 原子文本；
- 文档序列；
- 缩进块；
- 括号/方括号包围；
- 可按布局规则折叠/展开的部分。

此外，Lean 还提供 `FlattenBehavior` 等机制，帮助格式化器控制某块内容是否可被压平成一行。

## 空文档

常见判定函数包括：

- `isEmpty`
- `isNil`

它们用于检测某段格式化结果是否真的包含内容。构造复杂 pretty-printer 时，这有助于避免多余分隔符或空行。

## 序列

用于组合文档的常见操作包括：

- `join`
- `joinSep`
- `prefixJoin`
- `joinSuffix`

这些 API 让你能把若干子文档按统一规则拼在一起，同时仍保留结构化布局，而不是提前把它们转成字符串。

## 缩进

缩进相关函数包括：

- `nestD`
- `defIndent`
- `indentD`

它们控制某块文档在换行后的缩进深度。许多 Lean 错误消息之所以可读，就是因为使用了这类缩进组合器，而不是简单字符串拼接。

## 括号与方括号

常见构造包括：

- `bracket`
- `sbracket`
- `paren`
- `bracketFill`

它们不仅添加字面括号，还把换行、缩进与内容块一起组织起来，因此适合打印参数列表、列表文字、tuple 或嵌套表达式。

## 渲染

真正把 `Format` 变成可显示内容时，会用到：

- `pretty`
- `defWidth`
- `prettyM`
- `MonadPrettyFormat`

这一步会综合考虑：

- 最大显示宽度；
- 哪些块可折叠成一行；
- 何处需要换行和缩进。

## 为什么重要

如果你在写：

- 自定义错误消息；
- 自定义 pretty-printer；
- `Repr` / `ToFormat` instance；
- 交互式工具输出；

那你实际上就在决定 Lean 如何“对人说话”。`Format` 是这一层最核心的底层文档结构。
