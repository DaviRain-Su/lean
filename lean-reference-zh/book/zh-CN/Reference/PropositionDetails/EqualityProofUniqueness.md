# 等式证明的唯一性

> 对应英文：[Uniqueness of Equality Proofs](https://lean-lang.org/doc/reference/latest/Basic-Propositions/Propositional-Equality/#The-Lean-Language-Reference--Basic-Propositions--Propositional-Equality--Uniqueness-of-Equality-Proofs)，抓取日期：2026-06-16。

由于 Lean 具有 definitional proof irrelevance，同一命题相等的两个证明本身也彼此相等。换言之：两个数学对象不可能“以两种不同方式相等”。

## `Eq.unique`

英文页给出的核心定理是：

- `Eq.unique`

它表达：若 `p1 : x = y` 且 `p2 : x = y`，那么 `p1 = p2`。

这并不是“某个额外 axiom”，而是由 Lean 的 proof irrelevance 推出的结果。

## Streicher 的 axiom K

英文页进一步指出：Streicher 的 axiom K 也是 proof irrelevance 的推论。它可看作 propositional equality 的一个替代 recursor 形式。

直觉上，axiom K 表达的是：若你已经知道某个对象与自己相等，那么要对这类自反相等证明做消去时，不会存在“多个本质不同的证明路径”需要分别处理。

## 为什么这重要

- 它说明等式证明在 Lean 中不会像程序数据一样保留可区分信息；
- 它强化了“proof 只是命题成立的证据，而不是可观察运行时对象”这一理念；
- 它也解释了为什么某些 proof-level 分支在 Lean 中比直觉上更容易合并。

## 使用建议

- 在普通证明里，你通常不需要显式调用 `Eq.unique`；
- 但在元理论、依赖模式匹配、递归器设计或想理解 proof irrelevance 后果时，这一页很关键。