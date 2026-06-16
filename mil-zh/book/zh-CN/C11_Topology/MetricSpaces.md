# 度量空间

上一节侧重实数序列。本节提高一点一般性，聚焦**度量空间**（metric space）：类型 `X` 配备距离函数 `dist : X → X → ℝ`，推广 `X = ℝ` 时 `fun x y ↦ |x - y|` 的情形。

引入这样的空间很容易；下面检查距离函数所需的全部性质。

```lean
variable {X : Type*} [MetricSpace X] (a b c : X)

#check (dist a b : ℝ)
#check (dist_nonneg : 0 ≤ dist a b)
#check (dist_eq_zero : dist a b = 0 ↔ a = b)
#check (dist_comm a b : dist a b = dist b a)
#check (dist_triangle a b c : dist a c ≤ dist a b + dist b c)
```

还有变体：距离可为无穷（`EMetricSpace`），或 `dist a b = 0` 不必推出 `a = b`（`PseudoMetricSpace`、`PseudoEMetricSpace`；此处 "e" 表示 extended）。

从 `ℝ` 到度量空间跳过了**赋范空间**（normed space）这一特例——它还需线性代数，将在微积分章说明。

## 收敛与连续

有了距离，可在度量空间之间定义收敛序列与连续函数。它们其实在下一节更一般的设定中已定义，但有引理用距离重述定义。

```lean
example {u : ℕ → X} {a : X} :
    Tendsto u atTop (𝓝 a) ↔ ∀ ε > 0, ∃ N, ∀ n ≥ N, dist (u n) a < ε :=
  Metric.tendsto_atTop

example {X Y : Type*} [MetricSpace X] [MetricSpace Y] {f : X → Y} :
    Continuous f ↔
      ∀ x : X, ∀ ε > 0, ∃ δ > 0, ∀ x', dist x' x < δ → dist (f x') (f x) < ε :=
  Metric.continuous_iff
```

许多引理带连续性假设，故常证连续性结果；有专门的 **`continuity`** 策略。下面证明下一练习需要的连续性。Lean 把两个度量空间的积当作度量空间，取 sup 范数，故 `dist (x₁, y₁) (x₂, y₂) = max (dist x₁ x₂) (dist y₁ y₂)` 按 reflexivity 成立。因此考虑从 `X × X` 到 `ℝ` 的连续函数有意义；特别地，（未 curry 的）距离函数即此类函数。

```lean
example {X Y : Type*} [MetricSpace X] [MetricSpace Y] {f : X → Y} (hf : Continuous f) :
    Continuous fun p : X × X ↦ dist (f p.1) (f p.2) := by continuity
```

该策略略慢，手写也有用。`fun p : X × X ↦ f p.1` 连续，因为它是连续函数 `f`（假设 `hf`）与投影 `prod.fst`（`continuous_fst`）的复合；复合为 `Continuous.comp`，在 `Continuous` 命名空间，可用点记号 `hf.comp continuous_fst`。对第二分量同理。用 `Continuous.prod_mk` 组装得 `(hf.comp continuous_fst).prod_mk (hf.comp continuous_snd)`，再复合一次得完整证明。

```lean
example {X Y : Type*} [MetricSpace X] [MetricSpace Y] {f : X → Y} (hf : Continuous f) :
    Continuous fun p : X × X ↦ dist (f p.1) (f p.2) :=
  continuous_dist.comp ((hf.comp continuous_fst).prodMk (hf.comp continuous_snd))
```

`Continuous.prod_mk` 与 `continuous_dist` 经 `Continuous.comp` 组合略显笨重。更严重的是需要较多规划：Lean 接受上述证明项，因为它是与目标定义等价的完整项，关键要展开的是函数复合的定义。目标函数 `fun p : X × X ↦ dist (f p.1) (f p.2)` 并未呈现为复合；证明项证明的是 `dist ∘ (fun p : X × X ↦ (f p.1, f p.2))` 的连续性，与目标定义相等。但若用策略从 `apply continuous_dist.comp` 逐步构造，elaborator 常认不出复合而拒绝应用该引理；涉及积类型时尤其糟糕。

此处更好的引理是 `Continuous.dist {f g : X → Y} : Continuous f → Continuous g → Continuous (fun x ↦ dist (f x) (g x))`，对 elaborator 更友好，直接给证明项也更短：

```lean
example {X Y : Type*} [MetricSpace X] [MetricSpace Y] {f : X → Y} (hf : Continuous f) :
    Continuous fun p : X × X ↦ dist (f p.1) (f p.2) := by
  apply Continuous.dist
  exact hf.comp continuous_fst
  exact hf.comp continuous_snd

example {X Y : Type*} [MetricSpace X] [MetricSpace Y] {f : X → Y} (hf : Continuous f) :
    Continuous fun p : X × X ↦ dist (f p.1) (f p.2) :=
  (hf.comp continuous_fst).dist (hf.comp continuous_snd)
```

若无复合带来的 elaboration 问题，还可用 `Continuous.prod_map` 压缩证明。最后在「利于 elaboration」与「打字更短」之间，`Continuous.fst'` 把 `hf.comp continuous_fst` 压成 `hf.fst'`（`snd` 同理），得到最终证明：

```lean
example {X Y : Type*} [MetricSpace X] [MetricSpace Y] {f : X → Y} (hf : Continuous f) :
    Continuous fun p : X × X ↦ dist (f p.1) (f p.2) :=
  hf.fst'.dist hf.snd'
```

轮到你了：先试 `continuity` 策略，再用手证，需要 `Continuous.add`、`continuous_pow`、`continuous_id`：

```lean
example {f : ℝ → X} (hf : Continuous f) : Continuous fun x : ℝ ↦ f (x ^ 2 + x) :=
  sorry
```

迄今连续性是全局概念；也可定义在一点处的连续。

```lean
example {X Y : Type*} [MetricSpace X] [MetricSpace Y] (f : X → Y) (a : X) :
    ContinuousAt f a ↔ ∀ ε > 0, ∃ δ > 0, ∀ {x}, dist x a < δ → dist (f x) (f a) < ε :=
  Metric.continuousAt_iff
```

## 球、开集与闭集

有了距离，最重要的几何定义是（开）球与闭球。

```lean
variable (r : ℝ)

example : Metric.ball a r = { b | dist b a < r } :=
  rfl

example : Metric.closedBall a r = { b | dist b a ≤ r } :=
  rfl
```

此处 `r` 为任意实数，无符号限制；部分陈述需要半径条件。

```lean
example (hr : 0 < r) : a ∈ Metric.ball a r :=
  Metric.mem_ball_self hr

example (hr : 0 ≤ r) : a ∈ Metric.closedBall a r :=
  Metric.mem_closedBall_self hr
```

有了球可定义开集——其实在下一节更一般设定中已定义，有引理用球重述：

```lean
example (s : Set X) : IsOpen s ↔ ∀ x ∈ s, ∃ ε > 0, Metric.ball x ε ⊆ s :=
  Metric.isOpen_iff
```

闭集是补集为开的集合；重要性质是在极限下封闭。闭包是包含它的最小闭集。

```lean
example {s : Set X} : IsClosed s ↔ IsOpen (sᶜ) :=
  isOpen_compl_iff.symm

example {s : Set X} (hs : IsClosed s) {u : ℕ → X} (hu : Tendsto u atTop (𝓝 a))
    (hus : ∀ n, u n ∈ s) : a ∈ s :=
  hs.mem_of_tendsto hu (Eventually.of_forall hus)

example {s : Set X} : a ∈ closure s ↔ ∀ ε > 0, ∃ b ∈ s, a ∈ Metric.ball b ε :=
  Metric.mem_closure_iff
```

下一练习请勿使用 `mem_closure_iff_seq_limit`：

```lean
example {u : ℕ → X} (hu : Tendsto u atTop (𝓝 a)) {s : Set X} (hs : ∀ n, u n ∈ s) :
    a ∈ closure s := by
  sorry
```

记住滤子一节中邻域滤子很重要。在度量空间语境下，关键是球为邻域滤子提供基。主要引理是 `Metric.nhds_basis_ball` 与 `Metric.nhds_basis_closedBall`，对正半径的开球与闭球断言此事。中心点为隐式参数，可像下面一样调用 `Filter.HasBasis.mem_iff`：

```lean
example {x : X} {s : Set X} : s ∈ 𝓝 x ↔ ∃ ε > 0, Metric.ball x ε ⊆ s :=
  Metric.nhds_basis_ball.mem_iff

example {x : X} {s : Set X} : s ∈ 𝓝 x ↔ ∃ ε > 0, Metric.closedBall x ε ⊆ s :=
  Metric.nhds_basis_closedBall.mem_iff
```

## 紧性

**紧性**（compactness）是重要拓扑概念，区分度量空间中与实数线段相比更「像线段」的子集：

- 取值在紧集内的任意序列有收敛于该集的子列
- 非空紧集上取值于实数的连续函数有界且在某处达到上下界（极值定理）
- 紧集是闭集

先验证实数单位区间确是紧集，再检查一般度量空间中紧集的上述性质。第二项只需在给定集合上连续，用 `ContinuousOn` 而非 `Continuous`，最小与最大分开陈述。这些结果都来自更一般版本，部分后文讨论。

```lean
example : IsCompact (Set.Icc 0 1 : Set ℝ) :=
  isCompact_Icc

example {s : Set X} (hs : IsCompact s) {u : ℕ → X} (hu : ∀ n, u n ∈ s) :
    ∃ a ∈ s, ∃ φ : ℕ → ℕ, StrictMono φ ∧ Tendsto (u ∘ φ) atTop (𝓝 a) :=
  hs.tendsto_subseq hu

example {s : Set X} (hs : IsCompact s) (hs' : s.Nonempty) {f : X → ℝ}
      (hfs : ContinuousOn f s) :
    ∃ x ∈ s, ∀ y ∈ s, f x ≤ f y :=
  hs.exists_isMinOn hs' hfs

example {s : Set X} (hs : IsCompact s) (hs' : s.Nonempty) {f : X → ℝ}
      (hfs : ContinuousOn f s) :
    ∃ x ∈ s, ∀ y ∈ s, f y ≤ f x :=
  hs.exists_isMaxOn hs' hfs

example {s : Set X} (hs : IsCompact s) : IsClosed s :=
  hs.isClosed
```

还可用额外 `Prop` 值类型类说明度量空间**整体紧**：

```lean
example {X : Type*} [MetricSpace X] [CompactSpace X] : IsCompact (univ : Set X) :=
  isCompact_univ
```

在紧度量空间中任何闭集紧：`IsClosed.isCompact`。

```lean
#check IsCompact.isClosed
```

## 一致连续函数

转向度量空间上的一致性概念：一致连续函数、Cauchy 序列与完备性。它们也在更一般语境中定义，度量命名空间有引理访问初等定义。从一致连续开始：

```lean
example {X : Type*} [MetricSpace X] {Y : Type*} [MetricSpace Y] {f : X → Y} :
    UniformContinuous f ↔
      ∀ ε > 0, ∃ δ > 0, ∀ {a b : X}, dist a b < δ → dist (f a) (f b) < ε :=
  Metric.uniformContinuous_iff
```

为练习这些定义，证明：从紧度量空间到度量空间的连续函数一致连续（后文有更一般版本）。

非正式草图：设 `f : X → Y` 从紧度量空间到度量空间连续。固定 `ε > 0`，找 `δ`。

令 `φ : X × X → ℝ := fun p ↦ dist (f p.1) (f p.2)`，`K := { p : X × X | ε ≤ φ p }`。`φ` 连续（`f` 与距离连续）。`K` 显然闭（用 `isClosed_le`），故紧——`X` 紧且 Lean 知紧空间的积仍紧。

用 `eq_empty_or_nonempty` 分两种情况。若 `K` 空则显然完成（例如 `δ = 1`）。设 `K` 非空，用极值定理选 `(x₀, x₁)` 达到 `K` 上距离函数的下确界，令 `δ = dist x₀ x₁` 并验证。

```lean
example {X : Type*} [MetricSpace X] [CompactSpace X]
      {Y : Type*} [MetricSpace Y] {f : X → Y}
    (hf : Continuous f) : UniformContinuous f := by
  sorry
```

## 完备性

度量空间中的 **Cauchy 序列**是项彼此越来越接近的序列。有几种等价表述；收敛序列是 Cauchy 的。逆命题仅在所谓**完备**（complete）空间中成立。

```lean
example (u : ℕ → X) :
    CauchySeq u ↔ ∀ ε > 0, ∃ N : ℕ, ∀ m ≥ N, ∀ n ≥ N, dist (u m) (u n) < ε :=
  Metric.cauchySeq_iff

example (u : ℕ → X) :
    CauchySeq u ↔ ∀ ε > 0, ∃ N : ℕ, ∀ n ≥ N, dist (u n) (u N) < ε :=
  Metric.cauchySeq_iff'

example [CompleteSpace X] (u : ℕ → X) (hu : CauchySeq u) :
    ∃ x, Tendsto u atTop (𝓝 x) :=
  cauchySeq_tendsto_of_complete hu
```

用该定义练习证明一个便利准则（Mathlib 中更一般准则的特例），也是几何背景下练习大求和的好机会。除滤子节的说明外，可能还需 `tendsto_pow_atTop_nhds_zero_of_lt_one`、`Tendsto.mul`、`dist_le_range_sum_dist`。

```lean
open BigOperators

open Finset

theorem cauchySeq_of_le_geometric_two' {u : ℕ → X}
    (hu : ∀ n : ℕ, dist (u n) (u (n + 1)) ≤ (1 / 2) ^ n) : CauchySeq u := by
  rw [Metric.cauchySeq_iff']
  intro ε ε_pos
  obtain ⟨N, hN⟩ : ∃ N : ℕ, 1 / 2 ^ N * 2 < ε := by sorry
  use N
  intro n hn
  obtain ⟨k, rfl : n = N + k⟩ := le_iff_exists_add.mp hn
  calc
    dist (u (N + k)) (u N) = dist (u (N + 0)) (u (N + k)) := sorry
    _ ≤ ∑ i  ∈ range k, dist (u (N + i)) (u (N + (i + 1))) := sorry
    _ ≤ ∑ i  ∈ range k, (1 / 2 : ℝ) ^ (N + i) := sorry
    _ = 1 / 2 ^ N * ∑ i  ∈ range k, (1 / 2 : ℝ) ^ i := sorry
    _ ≤ 1 / 2 ^ N * 2 := sorry
    _ < ε := sorry
```

本节最终挑战：完备度量空间的 **Baire 定理**！下面证明骨架展示有趣技巧：在感叹号变体中使用 **`choose`** 策略（可试去掉感叹号），以及在证明中间用 `Nat.recOn` 归纳定义对象。

```lean
open Metric

example [CompleteSpace X] (f : ℕ → Set X) (ho : ∀ n, IsOpen (f n)) (hd : ∀ n, Dense (f n)) :
    Dense (⋂ n, f n) := by
  let B : ℕ → ℝ := fun n ↦ (1 / 2) ^ n
  have Bpos : ∀ n, 0 < B n :=
    sorry
  have :
    ∀ (n : ℕ) (x : X),
      ∀ δ > 0, ∃ y : X, ∃ r > 0, r ≤ B (n + 1) ∧ closedBall y r ⊆ closedBall x δ ∩ f n :=
    by sorry
  choose! center radius Hpos HB Hball using this
  intro x
  rw [mem_closure_iff_nhds_basis nhds_basis_closedBall]
  intro ε εpos
  let F : ℕ → X × ℝ := fun n ↦
    Nat.recOn n (Prod.mk x (min ε (B 0)))
      fun n p ↦ Prod.mk (center n p.1 p.2) (radius n p.1 p.2)
  let c : ℕ → X := fun n ↦ (F n).1
  let r : ℕ → ℝ := fun n ↦ (F n).2
  have rpos : ∀ n, 0 < r n := by sorry
  have rB : ∀ n, r n ≤ B n := by sorry
  have incl : ∀ n, closedBall (c (n + 1)) (r (n + 1)) ⊆ closedBall (c n) (r n) ∩ f n := by
    sorry
  have cdist : ∀ n, dist (c n) (c (n + 1)) ≤ B n := by sorry
  have : CauchySeq c := cauchySeq_of_le_geometric_two' cdist
  rcases cauchySeq_tendsto_of_complete this with ⟨y, ylim⟩
  use y
  have I : ∀ n, ∀ m ≥ n, closedBall (c m) (r m) ⊆ closedBall (c n) (r n) := by sorry
  have yball : ∀ n, y ∈ closedBall (c n) (r n) := by sorry
  sorry
```