# 基础命题

> 对应英文：[Basic Propositions](https://lean-lang.org/doc/reference/latest/Basic-Propositions/)，抓取日期：2026-06-16。

除了 implication 和 universal quantification 之外，Lean 中的 logical connective 和 quantifier 都实现为 `Prop` universe 中的 inductive type。从某种意义上说，本章描述的 connective 并不特殊：任何用户都可以实现它们。不过，这些基础 connective 在标准库和内建 proof automation 中被广泛使用。

## Implication 与 universal quantification

implication `P → Q` 和 universal quantification `∀ x, P x` 不是普通 inductive connective。它们由 Lean 核心函数类型承担：证明 `P → Q` 是一个函数，它把 `P` 的 proof 转换为 `Q` 的 proof；证明 `∀ x, P x` 是一个函数，它对任意 `x` 产生 `P x` 的 proof。

这种设计使逻辑蕴含和全称量词与依赖函数类型直接统一。

## Inductive proposition

其他基础命题构造通常是 inductive type。例如：

- truth / falsehood；
- conjunction；
- disjunction；
- existential quantification；
- propositional equality。

这些 proposition 的 proof 是对应 inductive type 的 inhabitant。证明规则由 constructor、recursor 和 pattern matching 给出。

## 标准库与自动化

虽然用户可以定义自己的 connective，但标准 connective 有稳定名称和库支持。许多 tactic、simp rule、eliminator 和 notation 都围绕它们工作。使用标准 connective 可以获得更好的自动化和库互操作。

## 后续小节

英文参考手册随后把本章展开为：

- 19.1 Truth
- 19.2 Logical Connectives
- 19.3 Quantifiers
- 19.4 Propositional Equality