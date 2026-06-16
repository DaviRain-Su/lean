# `mvcgen` 概览

> 对应英文：[Overview](https://lean-lang.org/doc/reference/latest/The--mvcgen--tactic/Overview/)，抓取日期：2026-06-16。

`mvcgen` 的工作流大致分为四步：

1. 用 predicate transformer semantics 重新解释 monadic 程序；
2. 把 `do`-block 中的每条语句组合成整体程序语义；
3. 把“原始目标”转换成一组更小的 verification condition；
4. 自动或手工证明这些 verification condition。

## 程序如何被解释

对 `mvcgen` 来说，程序不是“从输入值到输出值”的普通函数，而是“从任意 postcondition 到最弱 precondition”的变换器。这个解释由 monad 的 `WP` instance 决定。

## Hoare triple 与 loop invariant

程序由更小的语句组合而成。每条语句都与一个 Hoare triple 关联：

- 前置条件；
- 语句本身；
- 后置条件。

顺序组合时，前一条语句的 postcondition 必须足以推出后一条语句的 precondition。循环则需要额外给出 loop invariant。

## `mvcgen` 产出什么

`mvcgen` 不会替你完成所有证明，而是：

- 展开程序结构；
- 使用 specification lemma 尽量自动 discharge 局部步骤；
- 把剩下缺失的环节（例如 invariant、entailment、局部正确性条件）变成新的 subgoal。

这些新 subgoal 就是 verification condition。

## 实际使用

实际工作中，给出合理 invariant 后，很多 verification condition 可以自动关闭；剩余部分可用 `mvcgen` proof mode 或普通 Lean tactic 继续证明。
