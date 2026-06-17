# 命题相等的基础 API

> 对应英文：[Propositional Equality](https://lean-lang.org/doc/reference/latest/Basic-Propositions/Propositional-Equality/)，抓取日期：2026-06-16。本页整理其中关于 `Eq` 基础定理的高频部分。

`Eq` 是 Lean 中最核心的命题相等关系。它不仅有“两个项相等”这一声明意义，还附带一套基础 API，支撑几乎所有后续 rewrite 与等式推理。

## 构造子：`Eq.refl` 与 `rfl`

`Eq` 只有一个构造子：

- `Eq.refl`

常用简写是：

- `rfl`

它的关键点在于：虽然表面类型是 `a = a`，Lean 会允许任何与该类型 definitionally equal 的目标使用 `rfl`。因此像：

- `2 + 2 = 4`

这类命题，若两边可通过 definitional equality 化成同一项，也能直接由 `rfl` 证明。

## 对称性与传递性

最基础的等价关系定理包括：

- `Eq.symm`
- `Eq.trans`

它们分别表达：

- 若 `a = b`，则 `b = a`
- 若 `a = b` 且 `b = c`，则 `a = c`

在 `Eq` namespace 下，常可写成：

- `h.symm`
- `h1.trans h2`

## 替换原则：`Eq.subst`

等式不仅是等价关系，更重要的是**可替换性**。若 `a = b` 且某命题/性质对 `a` 成立，那么把其中的 `a` 换成 `b` 后仍然成立。

对应定理：

- `Eq.subst`

这正是很多重写工具的逻辑基础。Lean 的 `rw` tactic 本质上就在为 `Eq.subst` 自动寻找合适的 motive。

## `▸` 记号

Lean 还提供：

```text
h ▸ t
```

它是建立在 `Eq.subst` 与 `Eq.symm` 之上的记法，用于把某项沿相等式重写到另一侧。

## 为什么这些 API 重要

- `rfl` 对应 definitional equality 的最直接入口；
- `symm` / `trans` 提供最基础的等式拼接；
- `subst` 提供“在上下文中重写”的核心原则；
- 许多 tactic 的行为都可回溯到这些基本定理。

## 使用建议

- 能用 definitional equality 解决时，优先试 `rfl`；
- 多步等式链条可用 `trans` 和 `symm` 组织；
- 若想理解 `rw`、`change`、`subst` 这类 tactic 的底层逻辑，先吃透 `Eq.subst`。