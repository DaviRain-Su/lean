# Theorem Proving in Lean 4（中文版）目录

本目录为 *Theorem Proving in Lean 4* 的中文翻译。当前已完成第 1–4 章。

原书作者：Jeremy Avigad、Leonardo de Moura、Soonho Kong、Sebastian Ullrich（Lean 社区贡献）。

## 已翻译章节

### 第 1 章：引言

- [引言](Intro.md) — 形式化验证、Lean 简介、本书说明

### 第 2 章：依赖类型论

- [依赖类型论](DependentTypeTheory.md) — 简单类型论、宇宙、lambda、`def`/`let`、命名空间、依赖类型、隐式参数

### 第 3 章：命题与证明

- [命题与证明](PropositionsAndProofs.md) — 命题即类型、Curry-Howard、`theorem`/`example`、命题逻辑联结词、经典逻辑

### 第 4 章：量词与相等

- [量词与相等](QuantifiersEquality.md) — 全称/存在量词、相等与替换、`calc`、`match`、证明语言扩展

## 待翻译
- 第 5 章：[策略](https://lean-lang.org/theorem_proving_in_lean4/Tactics/) — `Tactics.lean`
- 第 6 章：[与 Lean 交互](https://lean-lang.org/theorem_proving_in_lean4/Interacting-with-Lean/) — `InteractingWithLean.lean`
- 第 7 章：[归纳类型](https://lean-lang.org/theorem_proving_in_lean4/Inductive-Types/) — `InductiveTypes.lean`
- 第 8 章：[归纳与递归](https://lean-lang.org/theorem_proving_in_lean4/Induction-and-Recursion/) — `InductionAndRecursion.lean`
- 第 9 章：[结构体与记录](https://lean-lang.org/theorem_proving_in_lean4/Structures-and-Records/) — `StructuresAndRecords.lean`
- 第 10 章：[类型类](https://lean-lang.org/theorem_proving_in_lean4/Type-Classes/) — `TypeClasses.lean`
- 第 11 章：[转换策略模式](https://lean-lang.org/theorem_proving_in_lean4/The-Conversion-Tactic-Mode/) — `Conv.lean`
- 第 12 章：[公理与计算](https://lean-lang.org/theorem_proving_in_lean4/Axioms-and-Computation/) — `AxiomsComputation.lean`

## 对应英文源文件

各章 Verso 源备份位于 `book/TPiL/`；目录与元信息见 `book/TPiL.lean`。

## 学习路径建议

1. 本书（TPIL4）— 依赖类型论与证明基础  
2. [Functional Programming in Lean](../fp-lean-zh/book/zh-CN/INDEX.md) — 编程与元编程  
3. [Mathematics in Lean](../mil-zh/book/zh-CN/INDEX.md) — Mathlib 与形式化数学