# Theorem Proving in Lean 4（中文版）目录

本目录为 *Theorem Proving in Lean 4* 的中文翻译。**全书 12 章已全部译完。**

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

### 第 5 章：策略

- [策略](Tactics.md) — 策略模式、`apply`/`intro`/`cases`、`rw`/`simp`、`calc`、策略组合子

### 第 6 章：与 Lean 交互

- [与 Lean 交互](InteractingWithLean.md) — 消息、`#check`/`#eval`、记号、属性、实例、强制转换

### 第 7 章：归纳类型

- [归纳类型](InductiveTypes.md) — `inductive`、命题归纳、自然数、列表、归纳族、互递归

### 第 8 章：归纳与递归

- [归纳与递归](InductionAndRecursion.md) — 模式匹配、结构递归、良基递归、函数归纳、`match`

### 第 9 章：结构体与记录

- [结构体与记录](StructuresAndRecords.md) — `structure`、投影、点记法、记录更新、继承

### 第 10 章：类型类

- [类型类](TypeClasses.md) — 实例、输出参数、默认/局部实例、`Decidable`、强制转换

### 第 11 章：转换策略模式

- [转换策略模式](Conv.md) — `conv` 模式、`lhs`/`rhs`、`congr`、绑定子下重写

### 第 12 章：公理与计算

- [公理与计算](AxiomsComputation.md) — 命题/函数外延性、商、选择、排中律、经典与构造

## 对应英文源文件

各章 Verso 源备份位于 `book/TPiL/`；目录与元信息见 `book/TPiL.lean`。

## 学习路径建议

1. 本书（TPIL4）— 依赖类型论与证明基础  
2. [Functional Programming in Lean](../fp-lean-zh/book/zh-CN/INDEX.md) — 编程与元编程  
3. [Mathematics in Lean](../mil-zh/book/zh-CN/INDEX.md) — Mathlib 与形式化数学