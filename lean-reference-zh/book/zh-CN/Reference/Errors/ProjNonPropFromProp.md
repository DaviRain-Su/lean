# projNonPropFromProp

> 对应英文：[About: projNonPropFromProp](https://lean-lang.org/doc/reference/latest/Error-Explanations/About___--projNonPropFromProp/)，抓取日期：2026-06-16。

错误码：`lean.projNonPropFromProp`

含义：试图从 proof 中投影非 proposition 数据。

严重性：Error。起始版本：4.23.0。

这个错误发生在尝试用 index projection 从某个 proposition 的 proof 中取出数据时。例如，若 `h` 是 existential proposition 的 proof，写 `h.1` 试图提取 witness 就会触发这个错误。

这样做被禁止，因为它可能违反 Lean 禁止从 `Prop` large elimination 的规则。proof 只应被用于构造 proof；不能随意从 proof 中抽取运行时数据。

## 修复方向

不要使用 `h.1` 这样的 index projection。从 proposition 到 proposition 的消去应使用：

- pattern-matching `let`；
- `match` expression；
- `cases` tactic。

但要注意：消去结果也必须在 `Prop` 中。如果消去结果是普通数据类型，例如 `Nat` 或某个 `Type` 中的值，会触发 `lean.propRecLargeElim`。

## 典型场景

证明目标是 `∃ x, ...` 时，可以 pattern match 已有 existential proof，并用 witness 构造新的 existential proof。不要把 witness 提取成普通数据返回。

## 示例

```lean
variable (P : Nat → Prop)

-- 错误：对命题证明做字段投影
example (h : ∃ n, P n) : ∃ m, P m := by
  exact ⟨h.1, h.2⟩   -- projNonPropFromProp

-- 正确：用 match / cases，且结果仍在 Prop
example (h : ∃ n, P n) : ∃ m, P m := by
  rcases h with ⟨n, hn⟩
  exact ⟨n, hn⟩
```

`rcases`、`cases`、`match` 在**目标仍是命题**时是允许的；`h.1` 这类投影会被拒绝。
