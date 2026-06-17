# 文档序列

> 对应英文：[Sequences](https://lean-lang.org/doc/reference/latest/Interacting-with-Lean/#The-Lean-Language-Reference--Interacting-with-Lean--Formatted-Output--Format--Sequences)，抓取日期：2026-06-16。

多数 pretty-printer 的工作，本质上都是“把一串小文档按某种规则拼起来”。`Format` 提供一组专门的序列组合器来做这件事。

## 常见组合器

英文页列出：

- `join`
- `joinSep`
- `prefixJoin`
- `joinSuffix`

## 它们分别解决什么问题

### `join`

把若干子文档直接连起来，适合那些中间没有额外分隔符的场景。

### `joinSep`

按统一分隔符拼接，适合：

- 参数列表
- 项列表
- 逗号分隔的结构

### `prefixJoin`

适合“每一项前都有统一前缀”的场景，例如：

- 多行 bullet
- 统一前导标记

### `joinSuffix`

适合“每一项后都可能带统一后缀”的场景，例如：

- 逐项补逗号
- 行尾附加固定标记

## 使用建议

- 优先用现成序列组合器，而不是手工字符串拼接；
- 当输出结构本质是“列表”，就让 API 层面也保持列表，而不是提前折叠成一个大文档。