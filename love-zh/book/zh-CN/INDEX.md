# 逻辑验证漫游指南（LoVe 2026）

> 英文原版：[logical_verification_2025](https://github.com/lean-forward/logical_verification_2025) · PDF：[Lean-zh/LoVe-zh](https://github.com/Lean-zh/LoVe-zh)

## 说明

阿姆斯特丹自由大学《逻辑验证》课程教材。**全书 14 章已译完**：第 1–8 章对照 Lean-zh 中文版 PDF 校对；第 9–14 章对照英文原版 PDF 翻译并多轮润色（`proofread-compare.mjs` 比对节结构，`tag-code-fences.mjs` 标注 `lean`/`text` 代码块）。Lean-zh 第三、四部分中文版 PDF 尚未发布，发布后可 `node scripts/extract-from-pdf.mjs` 重新对齐。已校对章节在重新提取时会自动跳过。

### 前言

- [前言](Foreword.md)

### 第一部分 基础

- [第 1 章 类型与项](ch01_TypesAndTerms.md)
- [第 2 章 程序与定理](ch02_ProgramsAndTheorems.md)
- [第 3 章 逆向证明](ch03_BackwardProofs.md)
- [第 4 章 正向证明](ch04_ForwardProofs.md)

### 第二部分 函数式与逻辑编程

- [第 5 章 函数式编程](ch05_FunctionalProgramming.md)
- [第 6 章 归纳谓词](ch06_InductivePredicates.md)
- [第 7 章 带作用的编程](ch07_EffectfulProgramming.md)
- [第 8 章 元编程](ch08_Metaprogramming.md)

### 第三部分 程序语义

- [第 9 章 操作语义](ch09_OperationalSemantics.md) — 大步/小步语义、WHILE 语言
- [第 10 章 Hoare 逻辑](ch10_HoareLogic.md) — Hoare 三元组、验证条件

### 第四部分 数学

- [第 11 章 指称语义](ch11_DenotationalSemantics.md) — 不动点、程序等价
- [第 12 章 数学的逻辑基础](ch12_LogicalFoundations.md) — 宇宙、子类型、商类型
- [第 13 章 基本数学结构](ch13_BasicStructures.md) — 群、域、序类型类
- [第 14 章 有理数与实数](ch14_RealNumbers.md) — ℚ、ℝ 的构造

### 附录

- [参考文献](References.md)