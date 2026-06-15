# 集合

对任意类型 `α`，类型 `Set α` 由 `α` 的元素组成的集合构成，支持通常的集合运算与关系。例如 `s ⊆ t` 表示 `s` 是 `t` 的子集，`s ∩ t` 为交，`s ∪ t` 为并。子集可输入 `\ss` 或 `\sub`，交 `\i` 或 `\cap`，并 `\un` 或 `\cup`。库还定义全类 `univ`（`α` 中所有元素）与空集 `∅`（`\empty`）。`x : α`、`s : Set α` 时，`x ∈ s` 表示 `x` 属于 `s`；涉及成员关系的定理名常含 `mem`。`x ∉ s` 缩写为 `¬ x ∈ s`；`∈` 用 `\in` 或 `\mem`，`∉` 用 `\notin`。

证明集合事实的一种方式是 `rw` 或化简器展开定义。下例用 `simp only` 指定化简器只使用给定恒等式，不用完整数据库。与 `rw` 不同，`simp` 可在全称或存在量词内部化简：

```lean
section
variable {α : Type*}
variable (s t u : Set α)
open Set

example (h : s ⊆ t) : s ∩ u ⊆ t ∩ u := by
  rw [subset_def, inter_def, inter_def]
  rw [subset_def] at h
  simp only [mem_setOf]
  rintro x ⟨xs, xu⟩
  exact ⟨h _ xs, xu⟩

example (h : s ⊆ t) : s ∩ u ⊆ t ∩ u := by
  simp only [subset_def, mem_inter_iff] at *
  rintro x ⟨xs, xu⟩
  exact ⟨h _ xs, xu⟩
```

`open Set` 可使用较短定理名；其实可删去 `rw` 与 `simp`：

```lean
example (h : s ⊆ t) : s ∩ u ⊆ t ∩ u := by
  intro x xsu
  exact ⟨h xsu.1, xsu.2⟩

example (h : s ⊆ t) : s ∩ u ⊆ t ∩ u :=
  fun _x ⟨xs, xu⟩ ↦ ⟨h xs, xu⟩
```

这是**定义归约**（definitional reduction）：`intro` 与匿名构造子迫使 Lean 展开定义。

处理并集可用 `Set.union_def`、`Set.mem_union`；`x ∈ s ∪ t` 展开为 `x ∈ s ∨ x ∈ t`，故可用 `cases` 强制定义归约：

```lean
example : s ∩ (t ∪ u) ⊆ s ∩ t ∪ s ∩ u := by
  intro x hx
  have xs : x ∈ s := hx.1
  have xtu : x ∈ t ∪ u := hx.2
  rcases xtu with xt | xu
  · left
    show x ∈ s ∩ t
    exact ⟨xs, xt⟩
  · right
    show x ∈ s ∩ u
    exact ⟨xs, xu⟩

example : s ∩ (t ∪ u) ⊆ s ∩ t ∪ s ∩ u := by
  rintro x ⟨xs, xt | xu⟩
  · left; exact ⟨xs, xt⟩
  · right; exact ⟨xs, xu⟩
```

交比并结合更紧，括号常可省略。试证反向包含：

```lean
example : s ∩ t ∪ s ∩ u ⊆ s ∩ (t ∪ u) := by
  sorry
```

用 `rintro` 时，析取模式 `h1 | h2` 有时需加括号以便 Lean 正确解析。

库还定义差集 `s \ t`（反斜杠为 Unicode，输入 `\\`）。`x ∈ s \ t` 展开为 `x ∈ s ∧ x ∉ t`。可用 `Set.diff_eq`、`dsimp` 或 `Set.mem_diff`，也可避免显式使用：

```lean
example : (s \ t) \ u ⊆ s \ (t ∪ u) := by
  intro x xstu
  have xs : x ∈ s := xstu.1.1
  have xnt : x ∉ t := xstu.1.2
  have xnu : x ∉ u := xstu.2
  constructor
  · exact xs
  intro xtu
  rcases xtu with xt | xu
  · show False; exact xnt xt
  · show False; exact xnu xu

example : (s \ t) \ u ⊆ s \ (t ∪ u) := by
  rintro x ⟨⟨xs, xnt⟩, xnu⟩
  use xs
  rintro (xt | xu) <;> contradiction
```

试证反向包含：

```lean
example : s \ (t ∪ u) ⊆ (s \ t) \ u := by
  sorry
```

证两集相等，只需证彼此互为子集；此原则称为**外延性**（extensionality），**`ext`** 策略专为此设计：

```lean
example : s ∩ t = t ∩ s := by
  ext x
  simp only [mem_inter_iff]
  constructor
  · rintro ⟨xs, xt⟩; exact ⟨xt, xs⟩
  · rintro ⟨xt, xs⟩; exact ⟨xs, xt⟩

example : s ∩ t = t ∩ s :=
  Set.ext fun _x ↦ ⟨fun ⟨xs, xt⟩ ↦ ⟨xt, xs⟩, fun ⟨xt, xs⟩ ↦ ⟨xs, xt⟩⟩

example : s ∩ t = t ∩ s := by ext x; simp [and_comm]

example : s ∩ t = t ∩ s := by
  apply Subset.antisymm
  · rintro x ⟨xs, xt⟩; exact ⟨xt, xs⟩
  · rintro x ⟨xt, xs⟩; exact ⟨xs, xt⟩
```

也可用 `Subset.antisymm` 先证 `s ⊆ t` 再证 `t ⊆ s`。可用下划线代替 `sorry`，悬停可见 Lean 期望的类型。

一些集合恒等式练习：

```lean
example : s ∩ (s ∪ t) = s := by sorry
example : s ∪ s ∩ t = s := by sorry
example : s \ t ∪ t = s ∪ t := by sorry
example : s \ t ∪ t \ s = (s ∪ t) \ (s ∩ t) := by sorry
```

## 集合的底层含义

类型论中，类型 `α` 上的**性质**（property）或**谓词**（predicate）就是函数 `P : α → Prop`：给定 `a : α`，`P a` 即「`P` 对 `a` 成立」的命题。库中 `Set α` 定义为 `α → Prop`，`x ∈ s` 定义为 `s x`——集合实为当作对象处理的性质。

库还提供集合构造记法 `{ y | P y }` 展开为 `(fun y ↦ P y)`，故 `x ∈ { y | P y }` 归约为 `P x`：

```lean
def evens : Set ℕ :=
  { n | Even n }

def odds : Set ℕ :=
  { n | ¬Even n }

example : evens ∪ odds = univ := by
  rw [evens, odds]
  ext n
  simp [-Nat.not_even_iff_odd]
  apply Classical.em
```

建议逐步执行该证明。我们告诉化简器不要用 `Nat.not_even_iff`，以在目标中保留 `¬ Even n`。删去 `rw [evens, odds]` 证明仍成立。

集合构造记法实际定义了：

- `s ∩ t` 为 `{x | x ∈ s ∧ x ∈ t}`
- `s ∪ t` 为 `{x | x ∈ s ∨ x ∈ t}`
- `∅` 为 `{x | False}`
- `univ` 为 `{x | True}`

常需显式标明 `∅`、`univ` 的类型，因 Lean 难以猜测：

```lean
example (x : ℕ) (h : x ∈ (∅ : Set ℕ)) : False :=
  h

example (x : ℕ) : x ∈ (univ : Set ℕ) :=
  trivial
```

练习：证下列包含。用 `intro n` 展开子集定义，用化简器将集合构造化为逻辑；推荐 `Nat.Prime.eq_two_or_odd`、`Nat.odd_iff`：

```lean
example : { n | Nat.Prime n } ∩ { n | n > 2 } ⊆ { n | ¬Even n } := by
  sorry
```

注意库中有多个版本的 `Prime`：最一般者在任意带零元的交换幺半群上有意义；`Nat.Prime` 专指自然数。有定理表明在后者情形下两者一致，可互相重写：

```lean
#print Prime
#print Nat.Prime

example (n : ℕ) : Prime n ↔ Nat.Prime n :=
  Nat.prime_iff.symm

example (n : ℕ) (h : Prime n) : Nat.Prime n := by
  rw [Nat.prime_iff]
  exact h

example (n : ℕ) (h : Prime n) : Nat.Prime n := by
  rwa [Nat.prime_iff]
```

**`rwa`** 在重写后接 `assumption` 策略。

## 有界量词

Lean 用 `∀ x ∈ s, ...` 缩写 `∀ x, x ∈ s → ...`（「对 `s` 中每个 `x` …」），用 `∃ x ∈ s, ...` 表示「存在 `s` 中的 `x` 使得 …」。这些称为**有界量词**（bounded quantifiers），将意义限制在集合 `s` 上。库中相关定理名常含 `ball` 或 `bex`。`bex_def` 断言 `∃ x ∈ s, ...` 等价于 `∃ x, x ∈ s ∧ ...`，但与 `rintro`、`use`、匿名构造子联用时两者行为大致相同，通常不必显式用 `bex_def` 变换：

```lean
section
variable (s t : Set ℕ)

example (h₀ : ∀ x ∈ s, ¬Even x) (h₁ : ∀ x ∈ s, Prime x) : ∀ x ∈ s, ¬Even x ∧ Prime x := by
  intro x xs
  constructor
  · apply h₀ x xs
  apply h₁ x xs

example (h : ∃ x ∈ s, ¬Even x ∧ Prime x) : ∃ x ∈ s, Prime x := by
  rcases h with ⟨x, xs, _, prime_x⟩
  use x, xs
```

在 `s ⊆ t` 下试证变体：

```lean
section
variable (ssubt : s ⊆ t)

example (h₀ : ∀ x ∈ t, ¬Even x) (h₁ : ∀ x ∈ t, Prime x) : ∀ x ∈ s, ¬Even x ∧ Prime x := by
  sorry

example (h : ∃ x ∈ s, ¬Even x ∧ Prime x) : ∃ x ∈ t, Prime x := by
  sorry

end
```

## 指标并交

集合列 \(A_0, A_1, \ldots\) 可建模为 `A : ℕ → Set α`；`⋃ i, A i` 为其并，`⋂ i, A i` 为其交。`ℕ` 可换为任意指标类型 `I`：

```lean
section
variable {α I : Type*}
variable (A B : I → Set α)
variable (s : Set α)
open Set

example : (s ∩ ⋃ i, A i) = ⋃ i, A i ∩ s := by
  ext x
  simp only [mem_inter_iff, mem_iUnion]
  constructor
  · rintro ⟨xs, ⟨i, xAi⟩⟩
    exact ⟨i, xAi, xs⟩
  rintro ⟨i, xAi, xs⟩
  exact ⟨xs, ⟨i, xAi⟩⟩

example : (⋂ i, A i ∩ B i) = (⋂ i, A i) ∩ ⋂ i, B i := by
  ext x
  simp only [mem_inter_iff, mem_iInter]
  constructor
  · intro h
    constructor
    · intro i
      exact (h i).1
    intro i
    exact (h i).2
  rintro ⟨h1, h2⟩ i
  constructor
  · exact h1 i
  exact h2 i
```

指标并交的括号常不可少，因绑定变量作用域尽可能延伸。试证（一个方向需经典逻辑！推荐在适当时用 `by_cases xs : x ∈ s`）：

```lean
example : (s ∪ ⋂ i, A i) = ⋂ i, A i ∪ s := by
  sorry
```

Mathlib 还有**有界并交**，可用 `mem_iUnion₂`、`mem_iInter₂` 拆义；化简器也会自动处理：

```lean
def primes : Set ℕ :=
  { x | Nat.Prime x }

example : (⋃ p ∈ primes, { x | p ^ 2 ∣ x }) = { x | ∃ p ∈ primes, p ^ 2 ∣ x } := by
  ext
  rw [mem_iUnion₂]
  simp

example : (⋃ p ∈ primes, { x | p ^ 2 ∣ x }) = { x | ∃ p ∈ primes, p ^ 2 ∣ x } := by
  ext
  simp

example : (⋂ p ∈ primes, { x | ¬p ∣ x }) ⊆ { x | x = 1 } := by
  intro x
  contrapose!
  simp
  apply Nat.exists_prime_and_dvd
```

类似练习：输入 `eq_univ` 时补全提示 `apply eq_univ_of_forall` 是好起点；推荐 `Nat.exists_infinite_primes`：

```lean
example : (⋃ p ∈ primes, { x | x ≤ p }) = univ := by
  sorry
```

对集合族 `s : Set (Set α)`，其并 `⋃₀ s`（`sUnion`）为 `{x | ∃ t ∈ s, x ∈ t}`，交 `⋂₀ s`（`sInter`）为 `{x | ∀ t ∈ s, x ∈ t}`：

```lean
section
open Set
variable {α : Type*} (s : Set (Set α))

example : ⋃₀ s = ⋃ t ∈ s, t := by
  ext x
  rw [mem_iUnion₂]
  simp

example : ⋂₀ s = ⋂ t ∈ s, t := by
  ext x
  rw [mem_iInter₂]
  rfl

end
```

库中名为 `sUnion_eq_biUnion`、`sInter_eq_biInter`。