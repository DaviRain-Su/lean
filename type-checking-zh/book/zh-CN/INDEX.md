# Lean 4 类型检查

> 英文社区资料 · 同步自 [Lean-zh/type-checking-in-lean-zh](https://github.com/Lean-zh/type-checking-in-lean-zh)

## 说明

介绍 Lean 4 内核、类型检查、可信代码基与导出格式，偏实现与验证视角。

### 前言

- [标题页](title_page.md)
- [前言](foreword.md)

### 内核与信任

- [什么是内核](whats_a_kernel.md)
- [信任](trust/trust.md) — [非安全声明](trust/unsafe_declarations.md)、[对抗性输入](trust/adversarial_inputs.md)
- [导出格式](export_format.md)

### 基本概念

- [内核的基本概念](kernel_concepts/kernel_concepts.md) — [概览](kernel_concepts/the_big_picture.md)、[术语](kernel_concepts/clarifying_language.md)、[实例化与抽象化](kernel_concepts/instantiation_and_abstraction.md)、[弱归约与强归约](kernel_concepts/weak_and_strong_reduction.md)
- [名称](names.md)
- [宇宙层级](levels.md)

### 表达式与声明

- [表达式](expressions/expressions.md) — [实现注意事项](expressions/implementing_expressions.md)
- [声明](declarations/declarations.md) — [归纳类型](declarations/inductive.md)

### 类型检查

- [类型推断](type_checking/type_inference.md)
- [定义等价](type_checking/definitional_equality.md)
- [归约](type_checking/reduction.md)

### 附录

- [未来工作](future_work.md)
- [延伸阅读](further_reading.md)