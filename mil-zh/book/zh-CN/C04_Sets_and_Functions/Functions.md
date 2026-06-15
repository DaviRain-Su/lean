# 函数

若 `f : α → β` 为函数，`p` 为 `β` 中元素的集合，库定义 **原像**（preimage）`preimage f p`，记作 `f ⁻¹' p`，为 `{x | f x ∈ p}`。`x ∈ f ⁻¹' p` 归约为 `f x ∈ p`，常很方便：

```lean
section
variable {α β : Type*}
variable (f : α → β)
variable (s t : Set α)
variable (u v : Set β)
open Function
open Set

example : f ⁻¹' (u ∩ v) = f ⁻¹' u ∩ f ⁻¹' v := by
  ext
  rfl

end
```

若 `s` 为 `α` 中元素的集合，**像**（image）`image f s` 记作 `f '' s`，为 `{y | ∃ x, x ∈ s ∧ f x = y}`。故假设 `y ∈ f '' s` 可分解为 `⟨x, xs, xeq⟩`，其中 `xs : x ∈ s`、`xeq : f x = y`。`rintro` 中的 `rfl` 标签（见[存在量词](../C03_Logic/ExistentialQuantifier.md)）正为此设计：

```lean
example : f '' (s ∪ t) = f '' s ∪ f '' t := by
  ext y; constructor
  · rintro ⟨x, xs | xt, rfl⟩
    · left
      use x, xs
    right
    use x, xt
  rintro (⟨x, xs, rfl⟩ | ⟨x, xt, rfl⟩)
  · use x, Or.inl xs
  use x, Or.inr xt
```

`use` 在能闭合目标时会自动应用 `rfl`。

```lean
example : s ⊆ f ⁻¹' (f '' s) := by
  intro x xs
  show f x ∈ f '' s
  use x, xs
```

`use x, xs` 可换为 `apply mem_image_of_mem f xs`。了解像由存在量词定义往往更方便。

好练习：

```lean
example : f '' s ⊆ v ↔ s ⊆ f ⁻¹' v := by
  sorry
```

这表明 `image f` 与 `preimage f` 构成 `Set α` 与 `Set β`（按子集关系偏序）之间的 **Galois 对应**；库中名为 `image_subset_iff`。实践中右端常更有用：`x ∈ f ⁻¹' t` 展开为 `f x ∈ t`，而 `y ∈ f '' s` 需拆存在量词。

下列集合恒等式可慢慢做，不必一次做完：

```lean
example (h : Injective f) : f ⁻¹' (f '' s) ⊆ s := by sorry
example : f '' (f ⁻¹' u) ⊆ u := by sorry
example (h : Surjective f) : u ⊆ f '' (f ⁻¹' u) := by sorry
example (h : s ⊆ t) : f '' s ⊆ f '' t := by sorry
example (h : u ⊆ v) : f ⁻¹' u ⊆ f ⁻¹' v := by sorry
example : f ⁻¹' (u ∪ v) = f ⁻¹' u ∪ f ⁻¹' v := by sorry
example : f '' (s ∩ t) ⊆ f '' s ∩ f '' t := by sorry
example (h : Injective f) : f '' s ∩ f '' t ⊆ f '' (s ∩ t) := by sorry
example : f '' s \ f '' t ⊆ f '' (s \ t) := by sorry
example : f ⁻¹' u \ f ⁻¹' v ⊆ f ⁻¹' (u \ v) := by sorry
example : f '' s ∩ v = f '' (s ∩ f ⁻¹' v) := by sorry
example : f '' (s ∩ f ⁻¹' u) ⊆ f '' s ∩ u := by sorry
example : s ∩ f ⁻¹' u ⊆ f ⁻¹' (f '' s ∩ u) := by sorry
example : s ∪ f ⁻¹' u ⊆ f ⁻¹' (f '' s ∪ u) := by sorry
```

下一组刻画像与原像关于指标并交的行为；第三例中参数 `i : I` 用于保证指标集非空。推荐用 `ext` 或 `intro` 展开等式/包含，再 `simp` 拆成员条件：

```lean
variable {I : Type*} (A : I → Set α) (B : I → Set β)

example : (f '' ⋃ i, A i) = ⋃ i, f '' A i := by sorry
example : (f '' ⋂ i, A i) ⊆ ⋂ i, f '' A i := by sorry
example (i : I) (injf : Injective f) : (⋂ i, f '' A i) ⊆ f '' ⋂ i, A i := by sorry
example : (f ⁻¹' ⋃ i, B i) = ⋃ i, f ⁻¹' B i := by sorry
example : (f ⁻¹' ⋂ i, B i) = ⋂ i, f ⁻¹' B i := by sorry
```

## 在子集上的单射

库定义 `InjOn f s` 表示 `f` 在 `s` 上单射：

```lean
example : InjOn f s ↔ ∀ x₁ ∈ s, ∀ x₂ ∈ s, f x₁ = f x₂ → x₁ = x₂ :=
  Iff.refl _
```

`Injective f` 可证等价于 `InjOn f univ`；`range f` 定义为 `{x | ∃y, f y = x}`，故与 `f '' univ` 相等。Mathlib 常见主题：许多函数性质相对全定义域陈述，也有相对化到子集上的版本。

```lean
section
open Set Real

example : InjOn log { x | x > 0 } := by
  intro x xpos y ypos e
  calc
    x = exp (log x) := by rw [exp_log xpos]
    _ = exp (log y) := by rw [e]
    _ = y := by rw [exp_log ypos]

example : range exp = { y | y > 0 } := by
  ext y; constructor
  · rintro ⟨x, rfl⟩
    apply exp_pos
  intro ypos
  use log y
  rw [exp_log ypos]
```

试证：

```lean
example : InjOn sqrt { x | x ≥ 0 } := by sorry
example : InjOn (fun x ↦ x ^ 2) { x : ℝ | x ≥ 0 } := by sorry
example : sqrt '' { x | x ≥ 0 } = { y | y ≥ 0 } := by sorry
example : (range fun x ↦ x ^ 2) = { y : ℝ | y ≥ 0 } := by sorry
```

## 逆函数与选择公理

定义 `f : α → β` 的逆需两点：任意 Lean 类型可能为空，当不存在满足 `f x = y` 的 `x` 时，须在 `α` 中指定默认值；添加 `[Inhabited α]` 即假设 `α` 有首选元 `default`。第二，若多个 `x` 满足 `f x = y`，逆函数须**选择**其一，需**选择公理**；便捷途径是经典 **`choose`** 算子：

```lean
section
variable {α β : Type*} [Inhabited α]

#check (default : α)

variable (P : α → Prop) (h : ∃ x, P x)

#check Classical.choose h

example : P (Classical.choose h) :=
  Classical.choose_spec h
```

给定 `h : ∃ x, P x`，`Classical.choose h` 是满足 `P x` 的某个 `x`；`Classical.choose_spec h` 说明其满足规格。

```lean
noncomputable section
open Classical

def inverse (f : α → β) : β → α := fun y : β ↦
  if h : ∃ x, f x = y then Classical.choose h else default

theorem inverse_spec {f : α → β} (y : β) (h : ∃ x, f x = y) : f (inverse f y) = y := by
  rw [inverse, dif_pos h]
  exact Classical.choose_spec h
```

`noncomputable section` 与 `open Classical` 因本质使用经典逻辑。`inverse f y` 若有 `x` 使 `f x = y` 则返回 `Classical.choose h`，否则返回 `default`；这是**依赖 if** 构造。`dif_pos h` 在 `h : e` 时将 `if h : e then a else b` 重写为 `a`；`dif_neg h` 在 `h : ¬ e` 时重写为 `b`。`inverse_spec` 说明 `inverse f` 满足规格前半。

仅凭 `inverse_spec` 应能证：`inverse f` 是左逆当且仅当 `f` 单射，是右逆当且仅当 `f` 满射。在 VS Code 中查看 `LeftInverse`、`RightInverse` 的定义，试证（纸笔先想清楚，每证约半打短行）：

```lean
variable (f : α → β)
open Function

example : Injective f ↔ LeftInverse (inverse f) f := by sorry
example : Surjective f ↔ RightInverse (inverse f) f := by sorry
```

## 康托尔定理

以类型论形式陈述康托尔著名定理：不存在从集合到其幂集的满射函数。理解证明后补全缺失两行：

```lean
section
variable {α : Type*}
open Function

theorem Cantor : ∀ f : α → Set α, ¬Surjective f := by
  intro f surjf
  let S := { i | i ∉ f i }
  rcases surjf S with ⟨j, h⟩
  have h₁ : j ∉ f j := by
    intro h'
    have : j ∉ f j := by rwa [h] at h'
    contradiction
  have h₂ : j ∈ S := by sorry
  have h₃ : j ∉ S := by sorry
  contradiction

end
```