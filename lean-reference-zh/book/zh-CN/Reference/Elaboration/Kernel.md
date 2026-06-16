# Kernel

> 对应英文：[The Kernel](https://lean-lang.org/doc/reference/latest/Elaboration-and-Compilation/#The-Lean-Language-Reference--Elaboration-and-Compilation--The-Kernel)，抓取日期：2026-06-16。

Lean 的 kernel 是受信任的、小而健壮的核心类型论 type checker。它负责检查 elaborator 产出的结果是否符合 Lean 类型论规则。

## kernel 不做什么

kernel 不包含：

- 高层语法层面的 termination checker；
- unification；
- tactic 执行；
- 用户友好语法解释。

这些工作都在 elaboration 或更上层完成。kernel 只看核心语言表达式和声明。

## 为什么要小

Lean 的核心设计目标之一，是让“最终真正需要信任的部分”尽量小。因为：

- 更小的 kernel 更容易审查；
- 更容易写独立实现；
- tactic / macro / compiler 的 bug 不应直接导致错误定理被接受。

## 类型论特性

英文页列出的 Lean 核心理论特性包括：

- 完整依赖类型；
- inductive type 与嵌套递归；
- impredicative、proof-irrelevant、extensional 的 propositions universe；
- predicative universe hierarchy；
- quotient type 及其 definitional computation rule；
- propositional function extensionality；
- function 和 product 的 definitional eta-equality；
- universe-polymorphic definition；
- 一致性：在无额外公理下不能构造 `False` 的 closed proof。

## 独立实现

Lean kernel 用 C++ 实现，但也有独立实现，例如 Rust 中的 `nanoda_lib` 以及 Lean 中的 `lean4lean`。多个实现彼此交叉检查，有助于提升对 kernel 正确性的信心。

## 与 soundness 的关系

elaborator、tactic 和 macro 可以很复杂，但只要它们最终交给 kernel 的项不能通过检查，就不会污染逻辑 soundness。也正因如此，很多交互式特性、自动化和扩展性都能建立在较大代码基之上，同时把最终可信边界压缩到 kernel。
