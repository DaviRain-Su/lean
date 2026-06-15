# 合取与双向蕴含

合取符号 `∧` 表示「与」。**`constructor`** 策略可先证 `A` 再证 `B` 以证明 `A ∧ B`：

```lean
example {x y : ℝ} (h₀ : x ≤ y) (h₁ : ¬y ≤ x) : x ≤ y ∧ x ≠ y := by
  constructor
  · assumption
  intro h
  apply h₁
  rw [h]
```

**`assumption`** 让 Lean 在假设中找可解决目标的项。最终 `rw` 用 `≤` 的自反性完成目标。也可用匿名构造子：

```lean
example {x y : ℝ} (h₀ : x ≤ y) (h₁ : ¬y ≤ x) : x ≤ y ∧ x ≠ y :=
  ⟨h₀, fun h ↦ h₁ (by rw [h])⟩

example {x y : ℝ} (h₀ : x ≤ y) (h₁ : ¬y ≤ x) : x ≤ y ∧ x ≠ y :=
  have h : x ≠ y := by
    contrapose! h₁
    rw [h₁]
  ⟨h₀, h⟩
```

**使用**合取（而非证明合取）需拆包两部分，可用 `rcases`、`rintro` 或模式匹配 `fun`，类似存在量词：

```lean
example {x y : ℝ} (h : x ≤ y ∧ x ≠ y) : ¬y ≤ x := by
  rcases h with ⟨h₀, h₁⟩
  contrapose! h₁
  exact le_antisymm h₀ h₁

example {x y : ℝ} : x ≤ y ∧ x ≠ y → ¬y ≤ x := by
  rintro ⟨h₀, h₁⟩ h'
  exact h₁ (le_antisymm h₀ h')

example {x y : ℝ} : x ≤ y ∧ x ≠ y → ¬y ≤ x :=
  fun ⟨h₀, h₁⟩ h' ↦ h₁ (le_antisymm h₀ h')
```

类比 `obtain`，有模式匹配 **`have`**：

```lean
example {x y : ℝ} (h : x ≤ y ∧ x ≠ y) : ¬y ≤ x := by
  have ⟨h₀, h₁⟩ := h
  contrapose! h₁
  exact le_antisymm h₀ h₁
```

与 `rcases` 不同，`have` 保留 `h` 在上下文中。也可从 `h : A ∧ B` 用 `h.left`、`h.right`（或 `h.1`、`h.2`）提取：

```lean
example {x y : ℝ} (h : x ≤ y ∧ x ≠ y) : ¬y ≤ x := by
  intro h'
  apply h.right
  exact le_antisymm h.left h'

example {x y : ℝ} (h : x ≤ y ∧ x ≠ y) : ¬y ≤ x :=
  fun h' ↦ h.right (le_antisymm h.left h')
```

试用多种技巧证明：

```lean
example {m n : ℕ} (h : m ∣ n ∧ m ≠ n) : m ∣ n ∧ ¬n ∣ m :=
  sorry
```

可嵌套使用 `∃` 与 `∧` 的匿名构造子、`rintro`、`rcases`：

```lean
example : ∃ x : ℝ, 2 < x ∧ x < 4 :=
  ⟨5 / 2, by norm_num, by norm_num⟩

example (x y : ℝ) : (∃ z : ℝ, x < z ∧ z < y) → x < y := by
  rintro ⟨z, xltz, zlty⟩
  exact lt_trans xltz zlty

example (x y : ℝ) : (∃ z : ℝ, x < z ∧ z < y) → x < y :=
  fun ⟨_z, xltz, zlty⟩ ↦ lt_trans xltz zlty
```

前缀下划线表示不打算使用 `z`，否则 Lean 会警告未使用。也可用 `use`：

```lean
example : ∃ x : ℝ, 2 < x ∧ x < 4 := by
  use 5 / 2
  constructor <;> norm_num

example : ∃ m n : ℕ, 4 < m ∧ m < n ∧ n < 10 ∧ Nat.Prime m ∧ Nat.Prime n := by
  use 5
  use 7
  norm_num

example {x y : ℝ} : x ≤ y ∧ x ≠ y → x ≤ y ∧ ¬y ≤ x := by
  rintro ⟨h₀, h₁⟩
  use h₀
  exact fun h' ↦ h₁ (le_antisymm h₀ h')
```

`constructor` 后的 `<;>` 表示对产生的两个子目标都执行 `norm_num`。

Lean 中 `A ↔ B` **并非**定义为 `(A → B) ∧ (B → A)`，但行为相近。可用 `h.mp`、`h.mpr` 或 `h.1`、`h.2` 取两个方向；也可用 `cases` 等。证双向蕴含可用 `constructor` 或尖括号，如同证合取：

```lean
example {x y : ℝ} (h : x ≤ y) : ¬y ≤ x ↔ x ≠ y := by
  constructor
  · contrapose!
    rintro rfl
    rfl
  contrapose!
  exact le_antisymm h

example {x y : ℝ} (h : x ≤ y) : ¬y ≤ x ↔ x ≠ y :=
  ⟨fun h₀ h₁ ↦ h₀ (by rw [h₁]), fun h₀ h₁ ↦ h₀ (le_antisymm h h₁)⟩
```

写这类证明项时可用下划线查看 Lean 期望。试证：

```lean
example {x y : ℝ} : x ≤ y ∧ ¬y ≤ x ↔ x ≤ y ∧ x ≠ y :=
  sorry
```

更有趣的练习：对任意实数 `x`、`y`，`x^2 + y^2 = 0` 当且仅当 `x = 0` 且 `y = 0`。建议用 `linarith`、`pow_two_nonneg`、`eq_zero_of_pow_eq_zero` 证辅助引理：

```lean
theorem aux {x y : ℝ} (h : x ^ 2 + y ^ 2 = 0) : x = 0 :=
  have h' : x ^ 2 = 0 := by sorry
  eq_zero_of_pow_eq_zero h'

example (x y : ℝ) : x ^ 2 + y ^ 2 = 0 ↔ x = 0 ∧ y = 0 :=
  sorry
```

双向蕴含在 Lean 中有双重身份：既可当合取拆用两部分，又是命题间的自反、对称、传递关系，可与 `calc`、`rw` 联用。下例用 `abs_lt` 将 `|x| < y` 换为 `-y < x ∧ x < y`，用 `Nat.dvd_gcd_iff` 将 `m ∣ Nat.gcd n k` 换为 `m ∣ n ∧ m ∣ k`：

```lean
section

example (x : ℝ) : |x + 3| < 5 → -8 < x ∧ x < 2 := by
  rw [abs_lt]
  intro h
  constructor <;> linarith

example : 3 ∣ Nat.gcd 6 15 := by
  rw [Nat.dvd_gcd_iff]
  constructor <;> norm_num

end
```

用下列定理配合 `rw` 简短证明取负不是非递减函数（`push_neg` 不会替你展开定义，故定理证明中需要 `rw [Monotone]`）：

```lean
theorem not_monotone_iff {f : ℝ → ℝ} : ¬Monotone f ↔ ∃ x y, x ≤ y ∧ f x > f y := by
  rw [Monotone]
  push_neg
  rfl

example : ¬Monotone fun x : ℝ ↦ -x := by
  sorry
```

**偏序**（partial order）是传递、自反、反对称的二元关系；更弱的**预序**（preorder）只需自反与传递。对任意预序 `≤`，Lean 用 `a < b ↔ a ≤ b ∧ ¬ b ≤ a` 公理化严格预序。若 `≤` 为偏序，证 `a < b` 等价于 `a ≤ b ∧ a ≠ b`：

```lean
section
variable {α : Type*} [PartialOrder α]
variable (a b : α)

example : a < b ↔ a ≤ b ∧ a ≠ b := by
  rw [lt_iff_le_not_ge]
  sorry

end
```

即使 `≤` 仅为预序，用 `le_refl`、`le_trans`、`le_antisymm` 即可证严格序不可自反且传递。第二例用 **`simp`** 而非 `rw` 表达 `<`；`simp` 会反复使用给定引理（即使需对不同值实例化）：

```lean
section
variable {α : Type*} [Preorder α]
variable (a b c : α)

example : ¬a < a := by
  rw [lt_iff_le_not_ge]
  sorry

example : a < b → b < c → a < c := by
  simp only [lt_iff_le_not_ge]
  sorry

end
```