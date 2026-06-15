# 否定

符号 `¬` 表示否定：`¬ x < y` 说 `x` 不小于 `y`，`¬ x = y`（即 `x ≠ y`）说 `x` 不等于 `y`，`¬ ∃ z, x < z ∧ z < y` 说 `x` 与 `y` 之间不存在严格介于其中的 `z`。在 Lean 中 `¬ A` 缩写为 `A → False`，可理解为 `A` 蕴含矛盾。故证明 `¬ A`：引入假设 `h : A` 并证 `False`；若有 `h : ¬ A` 与 `h' : A`，则 `h h'` 得 `False`。

严格序的不可自反性 `lt_irrefl` 说对每个 `a` 有 `¬ a < a`。非对称性 `lt_asymm` 说 `a < b → ¬ b < a`。下面从 `lt_irrefl` 推出 `lt_asymm`：

```lean
section
variable (a b : ℝ)

example (h : a < b) : ¬b < a := by
  intro h'
  have : a < a := lt_trans h h'
  apply lt_irrefl a this

end
```

`have` 未给标签时 Lean 用名 `this`，便于引用。`intro` 后目标为 `False`，最终用 `lt_irrefl` 于 `a < a` 的证明。

用 `FnHasUb`（函数有上界）再举一例：

```lean
def FnUb (f : ℝ → ℝ) (a : ℝ) : Prop :=
  ∀ x, f x ≤ a

def FnLb (f : ℝ → ℝ) (a : ℝ) : Prop :=
  ∀ x, a ≤ f x

def FnHasUb (f : ℝ → ℝ) :=
  ∃ a, FnUb f a

def FnHasLb (f : ℝ → ℝ) :=
  ∃ a, FnLb f a

variable (f : ℝ → ℝ)

example (h : ∀ a, ∃ x, f x > a) : ¬FnHasUb f := by
  intro fnub
  rcases fnub with ⟨a, fnuba⟩
  rcases h a with ⟨x, hx⟩
  have : f x ≤ a := fnuba x
  linarith
```

目标由上下文中的线性等式与不等式推出时，常用 `linarith`。试类似证明：

```lean
example (h : ∀ a, ∃ x, f x < a) : ¬FnHasLb f :=
  sorry

example : ¬FnHasUb fun x ↦ x :=
  sorry
```

Mathlib 提供序与否定相关的有用定理：

```lean
#check (not_le_of_gt : a > b → ¬a ≤ b)
#check (not_lt_of_ge : a ≥ b → ¬a < b)
#check (lt_of_not_ge : ¬a ≥ b → a < b)
#check (le_of_not_gt : ¬a > b → a ≤ b)
```

用它们证明：

```lean
example (h : Monotone f) (h' : f a < f b) : a < b := by
  sorry

example (h : a ≤ b) (h' : f b < f a) : ¬Monotone f := by
  sorry
```

将 `<` 换为 `≤` 时，上一节第一个例子无法证明。可通过反例否定全称量化陈述：

```lean
example : ¬∀ {f : ℝ → ℝ}, Monotone f → ∀ {a b}, f a ≤ f b → a ≤ b := by
  intro h
  let f := fun x : ℝ ↦ (0 : ℝ)
  have monof : Monotone f := by sorry
  have h' : f 1 ≤ f 0 := le_refl _
  sorry
```

**`let`** 策略在上下文中添加**局部定义**。`let` 后可见 `f : ℝ → ℝ := fun x ↦ 0`；Lean 需要时会展开 `f`。用 `le_of_not_gt` 证明：

```lean
example (x : ℝ) (h : ∀ ε > 0, x < ε) : x ≤ 0 := by
  sorry
```

对任意性质 `P`，「不存在具有 `P` 的对象」等价于「一切对象都不具有 `P`」；「并非一切对象都具有 `P`」等价于「存在不具有 `P` 的对象」。下列四条蕴含均成立（其中一条需经典推理）：

```lean
section
variable {α : Type*} (P : α → Prop) (Q : Prop)

example (h : ¬∃ x, P x) : ∀ x, ¬P x := by
  sorry

example (h : ∀ x, ¬P x) : ¬∃ x, P x := by
  sorry

example (h : ¬∀ x, P x) : ∃ x, ¬P x := by
  sorry

example (h : ∃ x, ¬P x) : ¬∀ x, P x := by
  sorry

end
```

第一、二、四条较直接；第三条从「非存在性矛盾」推出存在对象，属**经典**数学推理，可用反证法：

```lean
example (h : ¬∀ x, P x) : ∃ x, ¬P x := by
  by_contra h'
  apply h
  intro x
  show P x
  by_contra h''
  exact h' ⟨x, h''⟩
```

**`by_contra`** 允许假设 `¬ Q` 并推出矛盾以证 `Q`，等价于使用 `not_not : ¬ ¬ Q ↔ Q`。可用 `by_contra` 证正向，反向由普通否定规则得出：

```lean
example (h : ¬¬Q) : Q := by
  sorry

example (h : Q) : ¬¬Q := by
  sorry
```

用反证法建立下列结论（`¬FnHasUb f` 的逆，提示先用 `intro`）：

```lean
section
variable (f : ℝ → ℝ)

example (h : ¬FnHasUb f) : ∀ a, ∃ x, f x > a := by
  sorry

end
```

处理前置否定的复合陈述往往繁琐；数学上常将否定向内推。**`push_neg`** 以这种方式重述目标；`push_neg at h` 重述假设 `h`：

```lean
example (h : ¬∀ a, ∃ x, f x > a) : FnHasUb f := by
  push_neg at h
  exact h

example (h : ¬FnHasUb f) : ∀ a, ∃ x, f x > a := by
  dsimp only [FnHasUb, FnUb] at h
  push_neg at h
  exact h
```

第二例用 `dsimp` 展开 `FnHasUb`、`FnUb`（量词作用域内须用 `dsimp` 而非 `rw`）。尚不熟悉合取符号时，也可用 `push_neg` 证明：

```lean
example (h : ¬Monotone f) : ∃ x y, x ≤ y ∧ f y < f x := by
  sorry
```

**`contrapose`** 将目标 `A → B` 变为 `¬B → ¬A`；给定 `h : A` 证 `B` 时，`contrapose h` 留下从 `¬B` 证 `¬A` 的目标。`contrapose!` 还对目标与相关假设使用 `push_neg`：

```lean
example (h : ¬FnHasUb f) : ∀ a, ∃ x, f x > a := by
  contrapose! h
  exact h

example (x : ℝ) (h : ∀ ε > 0, x ≤ ε) : x ≤ 0 := by
  contrapose! h
  use x / 2
  constructor <;> linarith
```

`constructor` 与分号用法见下一节。

**Ex falso**（从假证任意）：Lean 用 `False.elim` 表示 `False → P`（对任意命题 `P`）。分情形证明时，某情形可能矛盾，需断言矛盾可推出目标。**`exfalso`** 将当前目标换为证 `False`；`absurd h h'` 在 `h : P`、`h' : ¬ P` 时建立任意命题；**`contradiction`** 在假设中寻找矛盾（如 `h : P` 与 `h' : ¬ P`）：

```lean
section
variable (a : ℕ)

example (h : 0 < 0) : a > 37 := by
  exfalso
  apply lt_irrefl 0 h

example (h : 0 < 0) : a > 37 :=
  absurd h (lt_irrefl 0)

example (h : 0 < 0) : a > 37 := by
  have h' : ¬0 < 0 := lt_irrefl 0
  contradiction

end
```

本例中 `linarith` 也可奏效。