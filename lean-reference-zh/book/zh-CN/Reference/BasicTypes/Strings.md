# 字符串

> 对应英文：[Strings](https://lean-lang.org/doc/reference/latest/Basic-Types/Strings/)，抓取日期：2026-06-16。

`String` 表示 Unicode 文本。Lean 对字符串提供专门支持：

- 逻辑模型以 UTF-8 `ByteArray` 描述字符串行为；
- compiled code 中使用优化的运行时表示，并缓存字符长度；
- 提供普通字符串、插值字符串和 raw string literal 语法。

## 逻辑模型

逻辑上，`String` 是一个结构体，核心字段包括：

- `toByteArray`：字符串的 UTF-8 编码；
- `isValidUTF8`：证明这些字节确实构成合法 UTF-8。

这种模型既接近底层实现，又便于在证明中用 `ByteArray` 理解字符串操作。

旧版本 Lean 曾把字符串逻辑模型表示为字符列表。这个视角仍可通过 `String.ofList` 与 `String.toList` 使用，但这些转换在运行时是线性时间和线性空间操作。

## 运行时表示

运行时字符串是 UTF-8 字节数组，并额外缓存：

- 字节长度；
- 字符个数；
- 当前容量；
- 实际字节数据。

由于 UTF-8 是变宽编码，一个字符可能占 1 到 4 个字节。因此，字符串 API 明确暴露了“按 UTF-8 位置访问”的概念。

## 为什么没有 `s[n : Nat]`

Lean 不鼓励用自然数直接索引字符串中的“第 n 个字符”，因为 UTF-8 使这种操作容易成为性能陷阱。相反，字符串使用 `String.Pos` 作为位置类型，它内部记录字节位置，并带有该位置确实落在 UTF-8 字符边界上的证明。

这意味着：

- 位置移动应通过 `next` / `prev` 一类操作完成；
- 遍历字符串时，通常使用 iterator 或 position，而不是用 `Nat` 直接索引字符。

## 字符串语法

Lean 支持三类字符串字面量：

- 普通 string literal
- interpolated string literal（如 `s!"...{x}..."`）
- raw string literal

### 插值字符串

`s!` 前缀会把花括号内内容解析为 Lean expression，并在运行时转换为字符串拼接；`m!` 则生成 `MessageData`，用于 Lean 内部消息系统。

### Raw string

raw string literal 中没有转义或 string gap，每个字符都按字面出现，适合写正则、代码片段或大量反斜杠文本。

## API 概览

英文页的字符串 API 很大，主要包括：

- 构造：`singleton`、`append`、`join`、`intercalate`
- 转换：`toList`、`toNat?`、`toInt?`、`toFormat`
- 性质：`isEmpty`、`length`
- 位置：`String.Pos` 与 `String.Pos.Raw`
- 查找与修改：`extract`、`dropPrefix?`、`replace`、`trimAscii`
- fold / aggregation：`map`、`foldl`、`foldr`、`all`、`any`
- 比较：`isPrefixOf`、`startsWith`、`endsWith`
- slice、raw substring、encoding、FFI

## 性能建议

- 把字符串当作 UTF-8 序列，而不是常数时间可随机索引的字符数组。
- 频繁遍历时优先使用 iterator / `String.Pos`。
- `String.toList`、`String.toByteArray` 等转换在运行时通常是线性代价。
