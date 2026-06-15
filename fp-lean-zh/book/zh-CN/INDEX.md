# Lean 函数式编程（中文版）目录

本目录包含 *Functional Programming in Lean* 的中文翻译。全书内容已全部译完（Meta 章在原书中为空）。

## 已翻译章节

### 前言与说明

- [README](README.md) — 原书 README 的中文翻译
- [前言](Intro.md) — 本书介绍、安装说明与排版约定

### 第 1 章：认识 Lean

- [认识 Lean（本章概述）](GettingToKnow.md)
- [求值表达式](GettingToKnow/Evaluating.md)
- [类型](GettingToKnow/Types.md)
- [函数与定义](GettingToKnow/FunctionsDefinitions.md)
- [结构体](GettingToKnow/Structures.md)
- [数据类型与模式匹配](GettingToKnow/DatatypesPatterns.md)
- [多态性](GettingToKnow/Polymorphism.md)
- [更多便利特性](GettingToKnow/Conveniences.md)
- [小结](GettingToKnow/Summary.md)

### 第 2 章：Hello, World!

- [Hello, World!（本章概述）](HelloWorld.md)
- [运行一个程序](HelloWorld/RunningAProgram.md)
- [逐步执行](HelloWorld/StepByStep.md)
- [启动一个项目](HelloWorld/StartingAProject.md)
- [实践示例：cat](HelloWorld/Cat.md)
- [便利特性](HelloWorld/Conveniences.md)
- [小结](HelloWorld/Summary.md)

### 插章：命题、证明与索引

- [命题、证明与索引](PropsProofsIndexing.md)

### 插章：策略、归纳与证明

- [策略、归纳与证明](TacticsInductionProofs.md)

### 第 3 章：单子

- [单子（本章概述）](Monads.md)
- [单子类型类](Monads/Class.md)
- [示例：单子中的算术](Monads/Arithmetic.md)
- [单子的 do 记法](Monads/Do.md)
- [IO 单子](Monads/IO.md)
- [更多便利特性](Monads/Conveniences.md)
- [小结](Monads/Summary.md)

### 第 4 章：函子、应用函子与单子

- [函子、应用函子与单子（本章概述）](FunctorApplicativeMonad.md)
- [结构体与继承](FunctorApplicativeMonad/Inheritance.md)
- [应用函子](FunctorApplicativeMonad/Applicative.md)
- [应用函子约定](FunctorApplicativeMonad/ApplicativeContract.md)
- [Alternative](FunctorApplicativeMonad/Alternative.md)
- [宇宙（Universes）](FunctorApplicativeMonad/Universes.md)
- [完整定义](FunctorApplicativeMonad/Complete.md)
- [小结](FunctorApplicativeMonad/Summary.md)

### 第 5 章：单子变换器

- [单子变换器（本章概述）](MonadTransformers.md)
- [组合 IO 与 Reader](MonadTransformers/ReaderIO.md)
- [单子构造工具箱](MonadTransformers/Transformers.md)
- [单子变换器的顺序](MonadTransformers/Order.md)
- [单子变换器的 do 记法](MonadTransformers/Do.md)
- [更多便利特性](MonadTransformers/Conveniences.md)
- [小结](MonadTransformers/Summary.md)

### 第 6 章：重载与类型类

- [重载与类型类（本章概述）](TypeClasses.md)
- [正数](TypeClasses/Pos.md)
- [类型类中的多态性](TypeClasses/Polymorphism.md)
- [输出参数](TypeClasses/OutParams.md)
- [索引](TypeClasses/Indexing.md)
- [标准类型类](TypeClasses/StandardClasses.md)
- [强制转换](TypeClasses/Coercions.md)
- [更多便利特性](TypeClasses/Conveniences.md)
- [小结](TypeClasses/Summary.md)

### 第 7 章：依赖类型

- [用依赖类型编程（本章概述）](DependentTypes.md)
- [索引族](DependentTypes/IndexedFamilies.md)
- [宇宙模式](DependentTypes/UniversePattern.md)
- [类型化查询](DependentTypes/TypedQueries.md)
- [索引、参数与宇宙](DependentTypes/IndicesParametersUniverses.md)
- [常见陷阱](DependentTypes/Pitfalls.md)
- [小结](DependentTypes/Summary.md)

### 第 8 章：编程、证明与性能

- [编程、证明与性能（本章概述）](ProgramsProofs.md)
- [尾递归](ProgramsProofs/TailRecursion.md)
- [尾递归证明](ProgramsProofs/TailRecursionProofs.md)
- [数组与终止性](ProgramsProofs/ArraysTermination.md)
- [不等式](ProgramsProofs/Inequalities.md)
- [Fin](ProgramsProofs/Fin.md)
- [插入排序](ProgramsProofs/InsertionSort.md)
- [特殊类型](ProgramsProofs/SpecialTypes.md)
- [小结](ProgramsProofs/Summary.md)

### 下一步

- [下一步](NextSteps.md)

## 翻译说明

- **元编程（Meta）**：原书仓库中 `FPLean/Meta/` 目前为空文件，暂无内容可译。
- 保留所有 Lean 代码、命令行命令和程序输出原文，便于直接运行。
- 术语首次出现时给出英文原词，帮助读者对照原书与官方文档。
- 翻译过程中会保持原书的渐进式教学风格。
