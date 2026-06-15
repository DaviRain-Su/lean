# 析取

证明析取 `A ∨ B` 的标准方法是证 `A` 或证 `B`。**`left`** 选 `A`，**`right`** 选 `B`：

```lean
section
variable {x y : ℝ}

example (h : y > x ^ 2) : y > 0 ∨ y < -1 := by
  left
  linarith [pow_two_nonneg x]

example (h : -y > x ^ 2 + 1) : y > 0 ∨ y < -1 := by
  right
  linarith [pow_two_nonneg x]

end
```

不能用匿名构造子证「或」，因 Lean 无法猜测选哪一支。写证明项时用 **`Or.inl`**、**`Or.inr`**（introduction left/right）显式选择：

```lean
example (h : y > 0) : y > 0 ∨ y < -1 :=
  Or.inl h

example (h : y < -1) : y > 0 ∨ y < -1 :=
  Or.inr h
```

实践中哪一支成立常取决于假设中的显式或隐式分情形。**`rcases`** 可处理 `A ∨ B` 形式的假设：与合取或存在量词不同，此处产生**两个**目标，结论相同，但第一支假设 `A` 真，第二支假设 `B` 真——即**分情形证明**（proof by cases）。可指定假设名；下例两分支均用 `h`：

```lean
example : x < |y| → x < y ∨ x < -y := by
  rcases le_or_gt 0 y with h | h
  · rw [abs_of_nonneg h]
    intro h; left; exact h
  · rw [abs_of_neg h]
    intro h; right; exact h
```

合取用模式 `⟨h₀, h₁⟩`，析取用 `h₀ | h₁`：前者匹配**同时**含两者，后者匹配**其一**。绝对值满足 `x ≥ 0` 时 `|x| = x`（`abs_of_nonneg`），`x < 0` 时 `|x| = -x`（`abs_of_neg`）；`le_or_gt 0 x` 给出 `0 ≤ x ∨ x < 0`。

也可用 `cases` 为各 `case` 命名，假设靠近使用处：

```lean
example : x < |y| → x < y ∨ x < -y := by
  cases le_or_gt 0 y
  case inl h =>
    rw [abs_of_nonneg h]
    intro h; left; exact h
  case inr h =>
    rw [abs_of_neg h]
    intro h; right; exact h
```

`inl`、`inr` 即 intro left/right。不在乎分支顺序可用 `next` 或 `match`：

```lean
example : x < |y| → x < y ∨ x < -y := by
  cases le_or_gt 0 y
  next h =>
    rw [abs_of_nonneg h]
    intro h; left; exact h
  next h =>
    rw [abs_of_neg h]
    intro h; right; exact h

example : x < |y| → x < y ∨ x < -y := by
  match le_or_gt 0 y with
    | Or.inl h =>
      rw [abs_of_nonneg h]
      intro h; left; exact h
    | Or.inr h =>
      rw [abs_of_neg h]
      intro h; right; exact h
```

本书一般用 `rcases` 处理析取分情形。用下两定理（与 Mathlib 同名）试证三角不等式：

```lean
namespace MyAbs

theorem le_abs_self (x : ℝ) : x ≤ |x| := by
  sorry

theorem neg_le_abs (x : ℝ) : -x ≤ |x| := by
  sorry

theorem abs_add_le (x y : ℝ) : |x + y| ≤ |x| + |y| := by
  sorry

end MyAbs
```

还想练手可试：

```lean
theorem lt_abs : x < |y| ↔ x < y ∨ x < -y := by
  sorry

theorem abs_lt : |x| < y ↔ -y < x ∧ x < y := by
  sorry
```

`rcases`、`rintro` 也适用于嵌套析取；产生真正分情形时，各新目标的模式用竖线 `|` 分隔：

```lean
example {x : ℝ} (h : x ≠ 0) : x < 0 ∨ x > 0 := by
  rcases lt_trichotomy x 0 with xlt | xeq | xgt
  · left
    exact xlt
  · contradiction
  · right; exact xgt
```

仍可嵌套模式并用 `rfl` 代入等式：

```lean
example {m n k : ℕ} (h : m ∣ n ∨ m ∣ k) : m ∣ n * k := by
  rcases h with ⟨a, rfl⟩ | ⟨b, rfl⟩
  · rw [mul_assoc]
    apply dvd_mul_right
  · rw [mul_comm, mul_assoc]
    apply dvd_mul_right
```

试用一行（可较长）证明：用 `rcases` 拆假设、分情形，`<;> linarith` 解决各分支：

```lean
example {z : ℝ} (h : ∃ x y, z = x ^ 2 + y ^ 2 ∨ z = x ^ 2 + y ^ 2 + 1) : z ≥ 0 := by
  sorry
```

实数上 `x * y = 0` 意味着 `x = 0` 或 `y = 0`（`eq_zero_or_eq_zero_of_mul_eq_zero`）。试证：

```lean
example {x : ℝ} (h : x ^ 2 = 1) : x = 1 ∨ x = -1 := by
  sorry

example {x y : ℝ} (h : x ^ 2 = y ^ 2) : x = y ∨ x = -y := by
  sorry
```

可用 `ring` 辅助计算。在环 \(R\) 中，若存在非零 \(y\) 使 \(xy = 0\)，则 \(x\) 为**左零因子**；\(yx = 0\) 则为**右零因子**；二者之一即**零因子**。`eq_zero_or_eq_zero_of_mul_eq_zero` 表明实数无非平凡零因子；具此性质的交换环称为**整环**（integral domain）。上述两定理证明在任意整环中同样有效：

```lean
section
variable {R : Type*} [CommRing R] [IsDomain R]
variable (x y : R)

example (h : x ^ 2 = 1) : x = 1 ∨ x = -1 := by
  sorry

example (h : x ^ 2 = y ^ 2) : x = y ∨ x = -y := by
  sorry

end
```

仔细处理时，第一个定理不必假设乘法交换，只需 `Ring` 而非 `CommRing`。

有时需按某命题真或假分情形。对任意命题 `P`，可用 **`em P : P ∨ ¬ P`**（排中律，excluded middle）：

```lean
example (P : Prop) : ¬¬P → P := by
  intro h
  cases em P
  · assumption
  · contradiction
```

也可用 **`by_cases`**：

```lean
example (P : Prop) : ¬¬P → P := by
  intro h
  by_cases h' : P
  · assumption
  contradiction
```

`by_cases` 可为各分支引入带标签的假设（如 `h' : P` 与 `h' : ¬ P`）；省略标签时默认 `h`。试用 `by_cases` 证一个方向：

```lean
example (P Q : Prop) : P → Q ↔ ¬P ∨ Q := by
  sorry
```