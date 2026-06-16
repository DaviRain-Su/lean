# Sum 类型

> 对应英文：[Sum Types](https://lean-lang.org/doc/reference/latest/Basic-Types/Sum-Types/)，抓取日期：2026-06-16。

sum type 表示“两个类型中的一个”。它也被称为：

- disjoint union
- discriminated union
- tagged union

一个 sum 的值不仅包含左侧或右侧的值，还携带“它来自哪一边”的信息。

## 两种主要类型

### `Sum`

```lean
Sum α β
α ⊕ β
```

它始终位于 `Type` 中，是最常用的 sum type。

### `PSum`

```lean
PSum α β
α ⊕' β
```

它允许两侧是任意 `Sort`，也就是 proposition 或 type 都行。普通手写代码里几乎总优先使用 `Sum`；`PSum` 更多用于 proof automation 的内部实现，因为它更容易触发困难的 universe 约束。

## 构造子

- `Sum.inl`
- `Sum.inr`

以及 `PSum` 的对应版本。

它们可被理解为“把某个值注入左侧或右侧”。

## 语法

大多数代码不会显式写 `Sum α β`，而是用：

```lean
α ⊕ β
```

若需要 potentially-propositional 版本，则用：

```lean
α ⊕' β
```

## 常见 API

### case distinction

- `isLeft`
- `isRight`

### extracting values

- `elim`
- `getLeft`
- `getLeft?`
- `getRight`
- `getRight?`

### transformations

- `map`
- `swap`

### inhabited

英文页还列出：

- `Sum.inhabitedLeft`
- `Sum.inhabitedRight`
- `PSum.inhabitedLeft`
- `PSum.inhabitedRight`

这些不是自动注册为 instance 的默认方案，因为当左右两侧都可 `Inhabited` 时，默认选左还是右并不 canonical。

## 与 `Option` 的关系

`Option α` 可被看作一个特化的 sum：

- `none`
- `some x`

但 `Option` 更轻量，也更符合“可能缺失一个值”的语义；而 `Sum α β` 更适合表达两种不同类型的分支结果。

## 使用建议

- “两种不同返回类型中的一种”优先用 `Sum`。
- “可能没有值”优先用 `Option`。
- 若只在逻辑上表达析取，通常应使用命题层的 `Or`，而不是 `Sum`。