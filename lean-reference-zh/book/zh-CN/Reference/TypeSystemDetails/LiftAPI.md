# `PLift` 与 `ULift` 细节

> 对应英文：[PLift / ULift](https://lean-lang.org/doc/reference/latest/The-Type-System/Universes/#PLift___up)，抓取日期：2026-06-16。

`PLift` 和 `ULift` 都是“改变 universe 外壳，但不改变底层值/信息”的工具。它们最常见的接口分别是：

- `PLift.up`
- `PLift.down`
- `ULift.up`
- `ULift.down`

## `PLift`

`PLift` 适用于任意类型，包括 proposition。它非常适合“把 proof 搬进普通数据世界”这一类问题。

核心直觉：

- `PLift α` 里仍是一个 `α`
- 只是它现在被包装到更高 universe 层级里

## `ULift`

`ULift` 则专门针对非 proposition 类型，允许把某个普通数据类型抬升到任意更高 universe。

## `up` / `down`

- `up`：把底层值装进 lifted 版本
- `down`：把 lifted 值还原回底层值

它们不是“转换数据内容”，而只是“改变外层宇宙壳”。

## 何时直接看这些 API

大多数时候，知道 `PLift` / `ULift` 的概念就够了；但当你：

- 真正手写 universe-polymorphic library
- 在定理陈述里来回搬运类型
- 读到底层 recursor / 内建定义中显式出现 `PLift.up` / `ULift.up`

时，理解这些 API 细节会更重要。

## 使用建议

- 需要 proposition 也被提升时，用 `PLift`；
- 只处理普通数据 universe 时，优先 `ULift`；
- 若发现自己频繁显式写 `up` / `down`，可以考虑上层 API 是否该重新设计，以减少使用者负担。