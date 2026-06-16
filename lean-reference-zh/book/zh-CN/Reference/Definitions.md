# 定义

> 对应英文：[Definitions](https://lean-lang.org/doc/reference/latest/Definitions/)，抓取日期：2026-06-16。

Lean 中以下 command 都类似 definition：

- `def`
- `abbrev`
- `example`
- `theorem`
- `opaque`

所有这些 command 都会基于某个 signature 让 Lean elaborates 一个 term。除了 `example` 会丢弃结果之外，elaboration 得到的 Lean 核心语言 expression 会保存到 environment 中，以供后续使用。

`instance` command 也是 declaration command；它在 Type Classes 章节的 instance declaration 小节中说明。

## 后续小节

英文参考手册随后把本章展开为：

- 7.1 Modifiers
- 7.2 Headers and Signatures
- 7.3 Definitions
- 7.4 Theorems
- 7.5 Example Declarations
- 7.6 Recursive Definitions

这些小节详细说明 declaration modifier、header、signature、普通 definition、theorem、`example`，以及递归定义如何被 elaboration 为 Lean kernel 可检查的形式。