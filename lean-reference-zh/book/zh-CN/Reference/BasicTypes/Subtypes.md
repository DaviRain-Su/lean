# 子类型

> 对应英文：[Subtypes](https://lean-lang.org/doc/reference/latest/Basic-Types/Subtypes/)，抓取日期：2026-06-16。

`Subtype` 表示满足某个 predicate 的类型元素。它在数学和编程里都大量使用：在数学中，它类似 subset；在编程中，它把“某值已知满足某性质”编码成 Lean 逻辑可见的类型信息。

常见写法：

```lean
{ x : α // p x }
{ x // p x }
```

这表示所有满足 `p` 的 `α` 类型值。

## 逻辑含义

`Subtype p` 的元素由两部分组成：

- 一个底层值 `val : α`
- 一个证明 `property : p val`

它和 dependent pair `Sigma` 的区别在于：第二部分是 proposition 的 proof，而不是普通数据；它和 existential quantification `∃ x, p x` 的区别在于：整个 `Subtype` 是一个 **type**，不是 proposition。

因此，虽然语法上像 pair，最好把 `Subtype` 理解为“带有证明义务的底层值”。

## 运行时表示

`Subtype` 是 trivial wrapper。在编译后代码中，它与底层类型表示相同，不额外增加运行时开销。也就是说，proof 在运行时本质上被擦除，只保留值本身。

## Coercion

Lean 提供从 `{ x : α // p x }` 到 `α` 的 coercion，因此在需要底层类型的位置，可以直接使用 subtype 值。

这让 subtype 在程序中很方便：

- 证明里保留 predicate 信息；
- 运行时仍像普通值一样使用。

## 典型例子

- `{ n : Nat // n % 2 = 0 }`：偶数类型。
- `{ xs : Array String // xs.size = 5 }`：长度为 5 的字符串数组。
- `List { x : α // x ∈ xs }`：所有元素都来自某个列表 `xs` 的列表。

## 等价与证明

由于 proof irrelevance 和 η-equality，若两个 subtype 元素的底层值 definitionally equal，则这两个 subtype 元素也是 definitionally equal。

在证明中，若目标是两个 subtype 元素相等，可以用 `ext` tactic 把问题化成它们底层 `val` 相等。

## 使用建议

- 当某个不变量应该成为类型一部分时，用 `Subtype` 很自然。
- 如果第二部分是普通数据而非 proposition，使用 `Sigma` 而不是 `Subtype`。
- 如果只需要“存在某值满足性质”而不需要把它当作编程中的值使用，则用 `∃` 更合适。
