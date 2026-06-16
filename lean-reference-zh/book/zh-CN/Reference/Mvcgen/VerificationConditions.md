# verification condition

> 对应英文：[Verification Conditions](https://lean-lang.org/doc/reference/latest/The--mvcgen--tactic/Verification-Conditions/)，抓取日期：2026-06-16。

`mvcgen` 会把形如 weakest precondition / Hoare triple 的原始目标，转换成一组 invariants 与 verification conditions。只要这些子目标都能证明，原始目标就成立。

## 转换流程

英文页给出的流程大致是：

1. 先做若干 simplification 与 rewrite。
2. 目标应变成 `P ⊢ₛ wp⟦e⟧ Q` 的形状。
3. 展开 `e` 中可约定义，以及标记为 `@[spec]` 的定义。
4. 若 `e` 是 matcher、`ite` 或 `dite`，则尽量化简；若无法消除，就对每个分支产生新 goal。
5. 若 `e` 是常量应用，则按优先级尝试对应 `@[spec]` lemma。
6. 若某些 entailment / invariant 不能立刻自动 discharge，它们就保留下来，成为 verification condition。
7. 若某个新目标本身仍是 `P ⊢ₛ wp⟦e⟧ Q` 形状，则递归继续生成 verification condition。

## 什么会成为 verification condition

典型剩余目标包括：

- loop invariant；
- 一个 statement 的 postcondition 推出下一 statement precondition 的证明；
- 某个 specification lemma 无法自动实例化时留下的 entailment；
- 无法继续化简的分支条件。

## 为什么 specification lemma 很重要

好的 `@[spec]` lemma 会减少生成的 verification condition 数量。若 library 的 spec lemma 精确，且 simp normal form 设计合理，很多 pattern match 和 conditional 都能提前消掉。

## 使用建议

- `mvcgen` 不是替代证明，而是把程序验证拆成更小证明任务；
- invariant 质量直接决定 verification condition 的难度；
- 若 VC 太多，优先检查 specification lemma 是否足够精确，以及 simp normal form 是否便于模式匹配和简化。
