# setoid 与等价关系

> 对应英文：[Setoids / Equivalence Relations](https://lean-lang.org/doc/reference/latest/The-Type-System/Quotients/#setoids)，抓取日期：2026-06-16。

quotient type 建立在 **setoid** 上。setoid 就是“一个类型，加上一条被指定为等价关系的关系”。

## `Setoid`

给定类型 `α`，`Setoid α` 提供：

- 关系 `r : α → α → Prop`
- 该关系满足等价关系的证明

Lean 还通过 `HasEquiv` 提供记号：

```text
x ≈ y
```

表示“`x` 与 `y` 在当前指定等价关系下等价”。

## 等价关系需要什么

一条关系要成为 equivalence relation，必须满足：

- reflexive
- symmetric
- transitive

英文页中的 `Equivalence` 结构正是显式打包了这三条性质。

## setoid 与 quotient 的关系

- setoid 只给出“哪两个东西应视为等价”；
- quotient 则进一步把这种等价提升为真正的不可区分相等。

也就是说，setoid 本身还没有建立完全抽象屏障；quotient 才有。

## 何时直接用 setoid

有时只需要一条“指定的等价关系”供推理使用，而不需要真正构造商类型。此时直接用 setoid 更轻量。

## 使用建议

- 需要明确写出一个等价关系并复用时，先定义 `Setoid`。
- 只有当你需要“所有函数都必须尊重这个等价关系”的抽象边界时，再进一步构造 `Quotient`。