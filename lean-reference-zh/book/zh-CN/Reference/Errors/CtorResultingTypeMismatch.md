# ctorResultingTypeMismatch

> 对应英文：[About: ctorResultingTypeMismatch](https://lean-lang.org/doc/reference/latest/Error-Explanations/About___--ctorResultingTypeMismatch/)，抓取日期：2026-06-16。

错误码：`lean.ctorResultingTypeMismatch`

含义：constructor 的 resulting type 不是正在声明的 inductive type。

严重性：Error。起始版本：4.22.0。

在 inductive declaration 中，每个 constructor 的最终返回 type 必须是当前正在声明的 inductive type。换言之，某个 inductive type 的每个 constructor 都必须返回该 type 的值；如果返回了别的 type，Lean 会报这个错误。

如果正在定义的 inductive type 没有 index，constructor 的 resulting type 可以省略。一旦给 constructor 写了完整 type annotation，就必须写出完整 type，包括最后的 resulting type。

## 常见原因

- constructor 返回 type 拼写错误，例如 `Treee α` 而不是 `Tree α`。
- 把 constructor 参数误写成 constructor 的返回 type。
- 对有参数的 inductive type，忘记在 constructor type 最后写回当前 inductive type。

## 修复方向

- 检查 constructor type 的最后一段是否精确返回正在声明的 inductive type。
- 如果只是 constructor 参数，使用 named binder 或普通参数语法，而不是把它写成 resulting type。
- 对有 index 的 inductive type，确认参数和 index 出现在正确位置。

## 示例

```lean
-- 错误：constructor 返回了拼错的类型名
inductive Tree (α : Type) where
  | leaf : α
  | node : Tree α → α → Treee α   -- Treee 拼写错误

-- 正确
inductive Tree (α : Type) where
  | leaf : α
  | node : Tree α → α → Tree α
```

有 index 时必须写回完整 family：

```lean
inductive Vec (α : Type) : Nat → Type where
  | nil  : Vec α 0
  | cons (a : α) (n : Nat) (v : Vec α n) : Vec α (n + 1)   -- 末尾必须是 Vec α (n+1)
```
