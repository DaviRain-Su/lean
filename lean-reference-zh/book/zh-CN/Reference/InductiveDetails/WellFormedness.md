# 归纳类型的良构性要求

> 对应英文：[Well-Formedness Requirements](https://lean-lang.org/doc/reference/latest/The-Type-System/Inductive-Types/#well-formed-inductives)，抓取日期：2026-06-16。

Lean 不是允许任意“看起来像归纳定义”的写法。为了保持逻辑一致性，归纳类型必须满足一系列良构性要求。

## 主要检查点

### 1. universe level

归纳类型的 universe 必须和参数、索引、constructor 结果类型匹配。错误的 universe 设计会导致类型本身无法一致地放进某个 `Sort` 中。

### 2. strict positivity

被定义的归纳类型只能出现在“严格正位置”。简单说：

- 可以出现在 constructor 参数结果的正向位置；
- 不能出现在函数参数左边那样的负位置。

这是避免悖论的关键约束之一。

### 3. `Prop` 与 `Type` 的区别

归纳定义若落在 `Prop` 中，会有更受限的 elimination 规则；落在 `Type` 中则更偏可计算数据。Lean 会在生成 recursor 和允许的消去方式上据此做区分。

## 终止检查辅助构造

英文页还讨论了一组“为终止检查服务的构造”，例如 `SizeOf`。这些并不是额外的归纳类型规则，而是帮助 Lean 证明某些递归定义安全的基础设施。

## 使用建议

- 若某个 inductive 定义被拒绝，优先检查 positivity、universe 和参数/索引区分；
- 当你需要把自引用放进函数参数位置时，通常说明模型设计需要重构，而不是 Lean “太保守”。