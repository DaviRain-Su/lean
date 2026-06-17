# predicativity

> 对应英文：[Predicativity](https://lean-lang.org/doc/reference/latest/The-Type-System/Universes/#The-Lean-Language-Reference--The-Type-System--Universes--Predicativity)，抓取日期：2026-06-16。

Lean 的 universe 规则在 `Prop` 和 `Type u` 之间刻意不同。

## `Prop` 是 impredicative

若函数类型的结果仍是 proposition，那么参数类型可以来自任意 universe，而整个函数类型依然留在 `Prop`。

这让命题可以量化所有类型，也让“关于所有命题的命题”仍然是 proposition。

## `Type u` 是 predicative

对 `Type 1` 及以上的数据 universe，函数类型的 universe 由参数和结果的 universe 决定，取它们的最小上界。

直觉上：

- 若函数可能返回 `Type v` 中的数据；
- 且其参数来自 `Type u`；
- 那么这个函数类型至少要放在足够大的 universe 中容纳两者。

## 不累积性

Lean 的 universe 默认 **不累积**：某个类型属于恰好一个 universe，不会自动也属于更高的 `Type (u+1)`。

这和某些类型论系统不同。遇到相关错误时，通常要显式用 universe polymorphism 或 `ULift` / `PLift` 修正，而不是指望“自动往上放”。

## 为什么重要

- 解释为何 `Prop` 可更自由地量化；
- 解释为何某些数据类型构造会触发 universe mismatch；
- 解释为何 `PLift` / `ULift` 在某些定义中是必要的。