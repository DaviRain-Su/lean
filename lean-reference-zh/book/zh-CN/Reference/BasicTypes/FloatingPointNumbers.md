# 浮点数

> 对应英文：[Floating-Point Numbers](https://lean-lang.org/doc/reference/latest/Basic-Types/Floating-Point-Numbers/)，抓取日期：2026-06-16。

Lean 提供浮点数类型，用于数值计算和与底层运行时/外部系统交互。它们更接近机器浮点而不是数学实数，因此证明和编程时都应谨慎对待。

## 主要类型

英文页以 `Float` 为中心，并给出相关语法与 API。浮点数的重点不是逻辑上“精确的连续量”，而是高效数值近似。

## 语法

浮点数字面量可直接写在源码中。它们属于单独的字面量类别，不等同于先写整数再手工转型。

## API 概览

英文页把浮点数 API 分为：

- properties
- syntax
- conversions
- comparisons
- arithmetic
- roots
- logarithms
- scaling
- rounding
- trigonometry
- negation and absolute value

### comparisons

包括常见比较与不等式相关操作。由于浮点数存在 `NaN`、舍入误差等问题，比较行为不应被想当然地当作“与实数完全一样”。

### arithmetic / roots / logs / trigonometry

常见操作包括：

- 加减乘除
- 平方根
- 对数
- 缩放
- 四舍五入/向上/向下取整
- 三角函数
- 绝对值与取负

### conversions

浮点数可与 `Nat`、`Int`、固定宽度整数等互转；这些转换通常可能丢失精度。

## 使用建议

- 数值计算、性能敏感近似计算或外部接口适合用浮点数。
- 严格数学证明中，不要把浮点等式直接当作实数等式；应明确模型与误差界。
- 若需要精确离散语义，优先考虑 `Nat`、`Int`、`Rat` 或 bitvector/定长整数。