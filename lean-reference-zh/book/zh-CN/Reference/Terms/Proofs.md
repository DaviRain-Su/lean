# 证明

> 对应英文：[Proofs](https://lean-lang.org/doc/reference/latest/Terms/Proofs/)，抓取日期：2026-06-16。

在 Lean 中，proof 本身也是 term。也就是说，证明命题与构造某个 type 的 inhabitant 在语言层面是同一件事。命题对应 `Prop` 中的 type，而 proof 是该 type 的 inhabitant。

本页本身很短。它主要提示：使用 `by` 调用 tactic 的语法，见证明章节说明。也就是说，term 语言中的 proof 与 tactic proof 章节是相互连接的：

- term 角度：proof 是表达式；
- tactic 角度：`by ...` 会逐步构造这个表达式。

因此，理解 Lean 证明可以从两条线索进入：

1. 把 proof 当作普通 term，例如函数、pair、constructor 和 match；
2. 把 proof 当作 tactic 脚本生成的核心 proof term。

当需要交互式证明体验时，应继续阅读 `Tactic Proofs` 章节。