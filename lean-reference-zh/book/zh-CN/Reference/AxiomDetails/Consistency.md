# 一致性

> 对应英文：[Consistency](https://lean-lang.org/doc/reference/latest/Axioms/#The-Lean-Language-Reference--Axioms--Consistency)，抓取日期：2026-06-16。

使用 axiom 的根本风险在于：Lean 无法替你检查新 axiom 是否彼此一致，或是否与已有逻辑原则兼容。

## 为什么危险

axiom 会引入“某个类型的一个项”。如果这个类型是 proposition，那么这个项就直接是该 proposition 的 proof。因此，只要你引入了不合理 axiom，就可能：

- 证明原本为假的命题；
- 让后续所有依赖该 axiom 的 theorem 一并失去可信度；
- 使整个开发建立在错误前提上。

## 可信度来自哪里

一个依赖 axiom 的 proof，只能在以下条件下被信任：

- 该 axiom 本身为真；
- 它与所有一同使用的 axiom 彼此一致。

Lean 本身不会做这类元理论验证，因此一致性责任在使用者和库维护者。

## 实际含义

- 少量、清晰、广为接受的 axiom 还能被审计；
- 数量越多、含义越复杂，整体风险越大；
- 一旦团队中混入未说明来源的 axiom，调试证明可靠性就会变得非常困难。

## 使用建议

- 引入 axiom 时，同时记录其数学解释和必要性。
- 若某个 proof 依赖 axiom，应把它看作“在这些假设下成立”，而不是无条件定理。
- 公开库接口时，尽量让依赖 axiom 的部分与纯定理部分分层清晰。