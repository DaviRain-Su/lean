# 计数论证

计数是组合数学的核心。Mathlib 包含若干关于 finset 元素计数的基本恒等式：

```lean
open Finset

variable {α β : Type*} [DecidableEq α] [DecidableEq β] (s t : Finset α) (f : α → β)

example : #(s ×ˢ t) = #s * #t := by rw [card_product]
example : #(s ×ˢ t) = #s * #t := by simp

example : #(s ∪ t) = #s + #t - #(s ∩ t) := by rw [card_union]

example (h : Disjoint s t) : #(s ∪ t) = #s + #t := by rw [card_union_of_disjoint h]
example (h : Disjoint s t) : #(s ∪ t) = #s + #t := by simp [h]

example (h : Function.Injective f) : #(s.image f) = #s := by rw [card_image_of_injective _ h]

example (h : Set.InjOn f s) : #(s.image f) = #s := by rw [card_image_of_injOn h]
```

`open Finset` 后可用 `#s` 表示 `s.card`，并缩短使用 `card_union` 等名称。

Mathlib 也可对 fintypes 计数：

```lean
open Fintype

variable {α β : Type*} [Fintype α] [Fintype β]

example : card (α × β) = card α * card β := by simp

example : card (α ⊕ β) = card α + card β := by simp

example (n : ℕ) : card (Fin n → α) = (card α)^n := by simp

variable {n : ℕ} {γ : Fin n → Type*} [∀ i, Fintype (γ i)]

example : card ((i : Fin n) → γ i) = ∏ i, card (γ i) := by simp

example : card (Σ i, γ i) = ∑ i, card (γ i) := by simp
```

未 `open Fintype` 时需写 `Fintype.card` 而非 `card`。

下面是计算 finset 基数的例子：将 `range n` 与平移超过 n 的 `range n` 副本作并。计算需证并中两集 **不相交**（disjoint）；证明首行产生副作用条件 `Disjoint (range n) (image (fun i ↦ m + i) (range n))`，在证明末尾建立。`Disjoint` 谓词过泛，但定理 `disjoint_iff_ne` 给出可用形式：

```lean
#check Disjoint

example (m n : ℕ) (h : m ≥ n) :
    card (range n ∪ (range n).image (fun i ↦ m + i)) = 2 * n := by
  rw [card_union_of_disjoint, card_range, card_image_of_injective, card_range]; omega
  . apply add_right_injective
  . simp [disjoint_iff_ne]; omega
```

本节中 `omega` 将大量用于算术计算与不等式。

更有趣的例子：考虑 {0,…,n} × {0,…,n} 中满足 i < j 的对 (i, j)。视为坐标平面格点，它们构成以 (0,0) 与 (n,n) 为角、不含对角线的正方形上三角。全正方形基数为 (n+1)²；去掉对角线长度再折半，得三角形基数 n(n+1)/2。

另一种看法：三角形各行大小为 0, 1, …, n，基数为前 n 个正整数之和。下面证明第一个 `have` 将三角形表为各行之并，第 j 行为 0, 1, …, j−1 与 j 配对。记号 `(., j)` 缩写 `fun i ↦ (i, j)`。其余为 finset 基数计算：

```lean
def triangle (n : ℕ) : Finset (ℕ × ℕ) := {p ∈ range (n+1) ×ˢ range (n+1) | p.1 < p.2}

example (n : ℕ) : #(triangle n) = (n + 1) * n / 2 := by
  have : triangle n = (range (n+1)).biUnion (fun j ↦ (range j).image (., j)) := by
    ext p
    simp only [triangle, mem_filter, mem_product, mem_range, mem_biUnion, mem_image]
    constructor
    . rintro ⟨⟨hp1, hp2⟩, hp3⟩
      use p.2, hp2, p.1, hp3
    . rintro ⟨p1, hp1, p2, hp2, rfl⟩
      omega
  rw [this, card_biUnion]; swap
  · -- take care of disjointness first
    intro x _ y _ xney
    simp [disjoint_iff_ne, xney]
  -- continue the calculation
  transitivity (∑ i ∈ range (n + 1), i)
  · congr; ext i
    rw [card_image_of_injective, card_range]
    intros i1 i2; simp
  rw [sum_range_id]; rfl
```

下列变体用 fintypes 而非 finsets 计算。类型 `α ≃ β` 为 α 与 β 之间的 **等价**（equivalence），含正向映射、反向映射及互逆证明。证明第一个 `have` 表明 `triangle n` 等价于 i 遍历 `Fin (n+1)` 时 `Fin i` 的不交并。有趣的是正、反向函数用策略构造而非显式书写；它们仅搬运数据与信息，`rfl` 即证互逆。

之后 `rw [←Fintype.card_coe]` 将 `#(triangle n)` 重写为子类型 `{ x // x ∈ triangle n }` 的基数，其余为计算：

```lean
example (n : ℕ) : #(triangle n) = (n + 1) * n / 2 := by
  have : triangle n ≃ Σ i : Fin (n + 1), Fin i.val :=
    { toFun := by
        rintro ⟨⟨i, j⟩, hp⟩
        have : (i ≤ n ∧ j ≤ n) ∧ i < j := by simpa [triangle] using hp
        exact ⟨⟨j, by linarith⟩, ⟨i, by linarith⟩⟩
      invFun := by
        rintro ⟨i, j⟩
        use ⟨j, i⟩
        suffices j ≤ n ∧ i ≤ n by simpa [triangle]
        constructor <;> linarith [i.2, j.2]
      left_inv := by intro i; rfl
      right_inv := by intro i; rfl }
  rw [←Fintype.card_coe]
  trans; apply (Fintype.card_congr this)
  rw [Fintype.card_sigma, sum_fin_eq_sum_range]
  convert Finset.sum_range_id (n + 1)
  simp_all
```

第三种思路：证明首行将问题化为 `2 * #(triangle n) = (n + 1) * n`，通过说明两份三角形恰好填满矩形 `range n ×ˢ range (n + 1)`。练习：补全计算步骤；解答中倒数第二步大量依赖 `omega`，但仍需不少手工推导：

```lean
example (n : ℕ) : #(triangle n) = (n + 1) * n / 2 := by
  apply Nat.eq_div_of_mul_eq_right (by norm_num)
  let turn (p : ℕ × ℕ) : ℕ × ℕ := (n - 1 - p.1, n - p.2)
  calc 2 * #(triangle n)
      = #(triangle n) + #(triangle n) := by
          sorry
    _ = #(triangle n) + #(triangle n |>.image turn) := by
          sorry
    _ = #(range n ×ˢ range (n + 1)) := by
          sorry
    _ = (n + 1) * n := by
          sorry
```

将 n 换为 n+1、将 `<` 换为 `≤` 可得下移的同样三角形。下列练习请用此事实证两三角形大小相同：

```lean
def triangle' (n : ℕ) : Finset (ℕ × ℕ) := {p ∈ range n ×ˢ range n | p.1 ≤ p.2}

example (n : ℕ) : #(triangle' n) = #(triangle n) := by sorry
```

## 双计数与鸽巢原理

以 Bhavik Mehta 在 2023 年 *Lean for the Curious Mathematician* 组合学[教程](https://www.youtube.com/watch?v=_cJctOIXWE4&list=PLlF-CfQhukNn7xEbfL38eLgkveyk9_myQ&index=8&t=2737s&ab_channel=leanprovercommunity)中的例子收束本节。设二部图顶点集为 `s` 与 `t`：对每个 a ∈ s 至少有三条出边，对每个 b ∈ t 至多一条入边。则边总数至少为 3·#s、至多为 #t，故 3·#s ≤ #t。下列定理实现该论证，用关系 `r` 表示图的边；证明是优雅的计算：

```lean
open Classical
variable (s t : Finset ℕ) (a b : ℕ)

theorem doubleCounting {α β : Type*} (s : Finset α) (t : Finset β)
    (r : α → β → Prop)
    (h_left : ∀ a ∈ s, 3 ≤ #{b ∈ t | r a b})
    (h_right : ∀ b ∈ t, #{a ∈ s | r a b} ≤ 1) :
    3 * #(s) ≤ #(t) := by
  calc 3 * #(s)
      = ∑ a ∈ s, 3                               := by simp [mul_comm]
    _ ≤ ∑ a ∈ s, #({b ∈ t | r a b})              := sum_le_sum h_left
    _ = ∑ a ∈ s, ∑ b ∈ t, if r a b then 1 else 0 := by simp
    _ = ∑ b ∈ t, ∑ a ∈ s, if r a b then 1 else 0 := sum_comm
    _ = ∑ b ∈ t, #({a ∈ s | r a b})              := by simp
    _ ≤ ∑ b ∈ t, 1                               := sum_le_sum h_right
    _ ≤ #(t)                                     := by simp
```

下列练习亦来自 Mehta 教程。设 A 为 `range (2 * n)` 的子集且含 n+1 个元素，则 A 必含两个连续整数，从而两个 **互素** 元素。教程中曾花大力气建立下列事实，现由 `omega` 自动证明：

```lean
example (m k : ℕ) (h : m ≠ k) (h' : m / 2 = k / 2) : m = k + 1 ∨ k = m + 1 := by omega
```

Mehta 练习的解答用 **鸽巢原理**（pigeonhole principle），形式为 `exists_lt_card_fiber_of_mul_lt_card_of_maps_to`，说明 A 中有相异 m、k 使 `m / 2 = k / 2`。请补全该事实的论证并完成证明：

```lean
example {n : ℕ} (A : Finset ℕ)
    (hA : #(A) = n + 1)
    (hA' : A ⊆ range (2 * n)) :
    ∃ m ∈ A, ∃ k ∈ A, Nat.Coprime m k := by
  have : ∃ t ∈ range n, 1 < #({u ∈ A | u / 2 = t}) := by
    apply exists_lt_card_fiber_of_mul_lt_card_of_maps_to
    · sorry
    · sorry
  rcases this with ⟨t, ht, ht'⟩
  simp only [one_lt_card, mem_filter] at ht'
  sorry
```