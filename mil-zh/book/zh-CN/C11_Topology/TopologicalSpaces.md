# 拓扑空间

## 基础

我们提高一般性，引入**拓扑空间**（topological space）。将回顾定义拓扑空间的两种主要方式，并说明拓扑空间范畴比度量空间范畴行为好得多。此处不用 Mathlib 范畴论，只持 somewhat 范畴化的观点。

从度量空间到拓扑空间的第一种想法：只记住开集（或等价地闭集）的概念。在此观点下，拓扑空间是配备称为开集的集合族的类型；该族须满足下面公理（该族略冗余，我们忽略）。闭集则定义为补集为开的集合。拓扑空间之间的函数**（全局）连续**，若开集的原像都是开的。

```lean
section
variable {X : Type*} [TopologicalSpace X]

example : IsOpen (univ : Set X) :=
  isOpen_univ

example : IsOpen (∅ : Set X) :=
  isOpen_empty

example {ι : Type*} {s : ι → Set X} (hs : ∀ i, IsOpen (s i)) : IsOpen (⋃ i, s i) :=
  isOpen_iUnion hs

example {ι : Type*} [Fintype ι] {s : ι → Set X} (hs : ∀ i, IsOpen (s i)) :
    IsOpen (⋂ i, s i) :=
  isOpen_iInter_of_finite hs
```

```lean
variable {Y : Type*} [TopologicalSpace Y]

example {f : X → Y} : Continuous f ↔ ∀ s, IsOpen s → IsOpen (f ⁻¹' s) :=
  continuous_def
```

此定义已可见：相比度量空间，拓扑空间只保留足以讨论连续函数的信息——两种拓扑结构相同当且仅当连续函数相同（恒等映射双向连续当且仅当开集相同）。

但一谈到在一点连续，基于开集的方法就显局限。Mathlib 常把拓扑空间看作：每点 `x` 附带邻域滤子 `𝓝 x`（对应函数 `X → Filter X` 满足下文条件）。记住[滤子](Filters.md)中这些对象的两重角色：第一，`𝓝 x` 是 `X` 中「接近 `x`」的点的广义集合；第二，对谓词 `P : X → Prop` 表达「在足够接近 `x` 的点处 `P` 成立」。`f : X → Y` 在 `x` **连续**，纯滤子说法是：`f` 下「接近 `x`」的广义集合的直接像包含在「接近 `f x`」中，即 `map f (𝓝 x) ≤ 𝓝 (f x)` 或 `Tendsto f (𝓝 x) (𝓝 (f x))`。

```lean
example {f : X → Y} {x : X} : ContinuousAt f x ↔ map f (𝓝 x) ≤ 𝓝 (f x) :=
  Iff.rfl
```

也可用邻域的普通集合与广义集合表述：「对 `f x` 的任意邻域 `U`，所有接近 `x` 的点都映到 `U`」。证明仍是 `Iff.rfl`——该观点与上一定义等价。

```lean
example {f : X → Y} {x : X} : ContinuousAt f x ↔ ∀ U ∈ 𝓝 (f x), ∀ᶠ x in 𝓝 x, f x ∈ U :=
  Iff.rfl
```

现在说明如何在两种观点间转换。用开集时，可定义 `𝓝 x` 的成员为包含某开集且该开集含 `x` 的集合：

```lean
example {x : X} {s : Set X} : s ∈ 𝓝 x ↔ ∃ t, t ⊆ s ∧ IsOpen t ∧ x ∈ t :=
  mem_nhds_iff
```

反向需讨论 `𝓝 : X → Filter X` 成为邻域函数须满足的条件。

第一约束：`𝓝 x` 作为广义集合须包含 `{x}` 对应的广义集合 `pure x`（名字由来略去）。等价地，若谓词对接近 `x` 的点成立，则在 `x` 处成立。

```lean
example (x : X) : pure x ≤ 𝓝 x :=
  pure_le_nhds x

example (x : X) (P : X → Prop) (h : ∀ᶠ y in 𝓝 x, P y) : P x :=
  h.self_of_nhds
```

更微妙的要求：对任意谓词 `P : X → Prop` 与 `x`，若对接近 `x` 的 `y` 有 `P y`，则对接近 `x` 的 `y` 与接近 `y` 的 `z`，有 `P z`。更精确：

```lean
example {P : X → Prop} {x : X} (h : ∀ᶠ y in 𝓝 x, P y) : ∀ᶠ y in 𝓝 x, ∀ᶠ z in 𝓝 y, P z :=
  eventually_eventually_nhds.mpr h
```

这两条刻画了哪些 `X → Filter X` 是某拓扑结构的邻域函数。仍有 `TopologicalSpace.mkOfNhds : (X → Filter X) → TopologicalSpace X`，但仅当满足上述两约束时，其邻域函数才与输入一致。引理 `TopologicalSpace.nhds_mkOfNhds` 以另一种方式陈述；下一练习从我们的表述推出该方式。

```lean
#check TopologicalSpace.mkOfNhds

#check TopologicalSpace.nhds_mkOfNhds

example {α : Type*} (n : α → Filter α) (H₀ : ∀ a, pure a ≤ n a)
    (H : ∀ a : α, ∀ p : α → Prop, (∀ᶠ x in n a, p x) → ∀ᶠ y in n a, ∀ᶠ x in n y, p x) :
    ∀ a, ∀ s ∈ n a, ∃ t ∈ n a, t ⊆ s ∧ ∀ a' ∈ t, s ∈ n a' := by
  sorry
end
```

`TopologicalSpace.mkOfNhds` 不常用，但值得知道邻域滤子在何种精确意义下就是拓扑结构的全部。

要在 Mathlib 中高效使用拓扑空间，须熟知 `TopologicalSpace : Type u → Type u` 的形式性质。纯数学上，这些性质干净地说明拓扑空间如何弥补度量空间的缺陷：度量空间函子性很弱、范畴性质普遍很差——且已讨论过度量空间含大量与拓扑无关的几何信息。

先看函子性：度量空间结构可诱导在子集上，等价地可由单射拉回；但仅此而已——一般映射不能拉回，满射也不能推前。特别地，度量空间的商或不可数积上没有合理的距离。例如 `ℝ → ℝ` 视为以 `ℝ` 为指标的 `ℝ` 的积，我们希望函数列的点态收敛是 respectable 的收敛概念，但没有距离给出该收敛；也没有距离使 `f : X → (ℝ → ℝ)` 连续当且仅当对每个 `t : ℝ`，`fun x ↦ f x t` 连续。

下面回顾解决这些问题的数据。首先任意 `f : X → Y` 可把拓扑从一侧推或拉到另一侧；两运算构成 Galois 连接。

```lean
variable {X Y : Type*}

example (f : X → Y) : TopologicalSpace X → TopologicalSpace Y :=
  TopologicalSpace.coinduced f

example (f : X → Y) : TopologicalSpace Y → TopologicalSpace X :=
  TopologicalSpace.induced f

example (f : X → Y) (T_X : TopologicalSpace X) (T_Y : TopologicalSpace Y) :
    TopologicalSpace.coinduced f T_X ≤ T_Y ↔ T_X ≤ TopologicalSpace.induced f T_Y :=
  coinduced_le_iff_le_induced
```

与函数复合相容：推前协变，拉回反变，见 `coinduced_compose`、`induced_compose`。纸上用 $f_*T$ 表示 `TopologicalSpace.coinduced f T`，$f^*T$ 表示 `TopologicalSpace.induced f T`。

```lean
#check coinduced_compose

#check induced_compose
```

对任意 `X`，`TopologicalSpace X` 有**完备格**结构。若把拓扑主要看作开集数据，可能期望 `TopologicalSpace X` 的序来自 `Set (Set X)`，即 `t ≤ t'` 当 `t` 中开的 `u` 在 `t'` 中也开。但 Mathlib 更关注邻域，故对每个 `x : X` 希望 `fun T : TopologicalSpace X ↦ @nhds X T x` 保序。`Filter X` 上的序设计为使 `principal : Set X → Filter X` 保序，从而把滤子看作广义集合。因此 `TopologicalSpace X` 上的序与来自 `Set (Set X)` 的序**相反**：

```lean
example {T T' : TopologicalSpace X} : T ≤ T' ↔ ∀ s, T'.IsOpen s → T.IsOpen s :=
  Iff.rfl
```

现在可结合推前（或拉回）与序关系恢复连续性：

```lean
example (T_X : TopologicalSpace X) (T_Y : TopologicalSpace Y) (f : X → Y) :
    Continuous f ↔ TopologicalSpace.coinduced f T_X ≤ T_Y :=
  continuous_iff_coinduced_le
```

此定义与推前和复合的相容性，免费得到泛性质：对任意拓扑空间 $Z$，函数 $g : Y → Z$ 对拓扑 $f_*T_X$ 连续当且仅当 $g \circ f$ 连续。

$$g \text{ 连续 } \Leftrightarrow g_*(f_*T_X) \leq T_Z \Leftrightarrow (g \circ f)_* T_X \leq T_Z \Leftrightarrow g \circ f \text{ 连续}$$

```lean
example {Z : Type*} (f : X → Y) (T_X : TopologicalSpace X) (T_Z : TopologicalSpace Z)
      (g : Y → Z) :
    @Continuous Y Z (TopologicalSpace.coinduced f T_X) T_Z g ↔
      @Continuous X Z T_X T_Z (g ∘ f) := by
  rw [continuous_iff_coinduced_le, coinduced_compose, continuous_iff_coinduced_le]
```

由此得到商拓扑（用投影作 `f`）。这尚未用到 `TopologicalSpace X` 对任意 `X` 为完备格。现在看该结构如何用抽象 nonsense 证明积拓扑存在。上文考虑过 `ℝ → ℝ`；一般地考虑 `Π i, X i`（`ι : Type*`、`X : ι → Type*`）。希望对任意拓扑空间 `Z` 与 `f : Z → Π i, X i`，`f` 连续当且仅当对每个 `i`，`(fun x ↦ x i) ∘ f` 连续。用记号 $p_i$ 表示投影 `(fun (x : Π i, X i) ↦ x i)`「在纸上」探索：

$$(\forall i,\, p_i \circ f \text{ 连续}) \Leftrightarrow \forall i,\, (p_i)_* f_* T_Z \leq T_{X_i} \Leftrightarrow f_* T_Z \leq \inf_i \big[(p_i)^* T_{X_i}\big]$$

可见 `Π i, X i` 上想要的拓扑是：

```lean
example (ι : Type*) (X : ι → Type*) (T_X : ∀ i, TopologicalSpace (X i)) :
    (Pi.topologicalSpace : TopologicalSpace (∀ i, X i)) =
      ⨅ i, TopologicalSpace.induced (fun x ↦ x i) (T_X i) :=
  rfl
```

至此结束 Mathlib 如何看待拓扑空间通过更函子化的理论与每类型完备格结构弥补度量空间理论缺陷的巡礼。

## 分离性与可数性

拓扑空间范畴性质很好，代价是存在相当病态的空间。可加若干假设使行为更接近度量空间。最重要的是 **`T2Space`**（Hausdorff），保证极限唯一。更强的分离性是 **`T3Space`**，还保证 `RegularSpace`：每点有闭邻域基。

```lean
example [TopologicalSpace X] [T2Space X] {u : ℕ → X} {a b : X} (ha : Tendsto u atTop (𝓝 a))
    (hb : Tendsto u atTop (𝓝 b)) : a = b :=
  tendsto_nhds_unique ha hb

example [TopologicalSpace X] [RegularSpace X] (a : X) :
    (𝓝 a).HasBasis (fun s : Set X ↦ s ∈ 𝓝 a ∧ IsClosed s) id :=
  closed_nhds_basis a
```

每个拓扑空间中，每点按定义有开邻域基：

```lean
example [TopologicalSpace X] {x : X} :
    (𝓝 x).HasBasis (fun t : Set X ↦ t ∈ 𝓝 x ∧ IsOpen t) id :=
  nhds_basis_opens' x
```

主要目标是证明允许**按连续延拓**的基本定理。来自 Bourbaki《一般拓扑》I.8.5 定理 1（只取非平凡方向）：

设 $X$ 为拓扑空间，$A$ 为 $X$ 的稠密子集，$f : A \to Y$ 为到 $T_3$ 空间 $Y$ 的连续映射。若对每个 $x \in X$，当 $y$ 在 $A$ 中趋于 $x$ 时 $f(y)$ 在 $Y$ 中趋于某极限，则存在 $f$ 到 $X$ 的连续延拓 $\varphi$。

Mathlib 有更一般版本 `IsDenseInducing.continuousAt_extend`，此处坚持 Bourbaki 版本。

给定 `A : Set X`，`↥A` 是对应子类型，Lean 需要时会自动插入强制 `(↑) : A → X`。假设「在 $A$ 中趋于 $x$」对应拉回滤子 `comap (↑) (𝓝 x)`。

先证辅助引理（简化上下文；此处 $Y$ 不必是拓扑空间）：

```lean
theorem aux {X Y A : Type*} [TopologicalSpace X] {c : A → X}
      {f : A → Y} {x : X} {F : Filter Y}
      (h : Tendsto f (comap c (𝓝 x)) F) {V' : Set Y} (V'_in : V' ∈ F) :
    ∃ V ∈ 𝓝 x, IsOpen V ∧ c ⁻¹' V ⊆ f ⁻¹' V' := by
  sorry
```

转向主证明。Lean 需要 `↥A` 上的拓扑时自动用诱导拓扑；相关引理为 `nhds_induced (↑) : ∀ a : ↥A, 𝓝 a = comap (↑) (𝓝 ↑a)`（诱导拓扑的一般引理）。

证明概要：主假设与选择公理给出 `φ` 使 `∀ x, Tendsto f (comap (↑) (𝓝 x)) (𝓝 (φ x))`（$Y$ Hausdorff 时 $\varphi$ 完全确定，但证明延拓性质前不必用）。

先证 $\varphi$ 连续。固定 `x : X`。因 $Y$ 正则，只需对每个**闭**邻域 `V'` of `φ x` 检查 `φ ⁻¹' V' ∈ 𝓝 x`。极限假设经辅助引理给出某 `V ∈ 𝓝 x` 使 `IsOpen V ∧ (↑) ⁻¹' V ⊆ f ⁻¹' V'`。因 `V ∈ 𝓝 x`，只需证 `V ⊆ φ ⁻¹' V'`，即 `∀ y ∈ V, φ y ∈ V'`。固定 `y ∈ V`：因 `V` **开**，它是 `y` 的邻域，故 `(↑) ⁻¹' V ∈ comap (↑) (𝓝 y)`，从而 `f ⁻¹' V' ∈ comap (↑) (𝓝 y)`。又 `comap (↑) (𝓝 y) ≠ ⊥`（因 `A` 稠密）。由 `Tendsto f (comap (↑) (𝓝 y)) (𝓝 (φ y))` 得 `φ y ∈ closure V'`，`V'` 闭故 `φ y ∈ V'`。

还须证 $\varphi$ 延拓 $f$；此处用到 $f$ 的连续性与 $Y$ 的 Hausdorff 性。

```lean
example [TopologicalSpace X] [TopologicalSpace Y] [T3Space Y] {A : Set X}
    (hA : ∀ x, x ∈ closure A) {f : A → Y} (f_cont : Continuous f)
    (hf : ∀ x : X, ∃ c : Y, Tendsto f (comap (↑) (𝓝 x)) (𝓝 c)) :
    ∃ φ : X → Y, Continuous φ ∧ ∀ a : A, φ a = f a := by
  sorry
```

除分离性外，使拓扑空间更接近度量空间的主要假设是**可数性**。最重要的是**第一可数**（first countability）：每点有可数邻域基；特别保证闭包可用序列理解。

```lean
example [TopologicalSpace X] [FirstCountableTopology X]
      {s : Set X} {a : X} :
    a ∈ closure s ↔ ∃ u : ℕ → X, (∀ n, u n ∈ s) ∧ Tendsto u atTop (𝓝 a) :=
  mem_closure_iff_seq_limit
```

## 紧性

讨论拓扑空间中紧性的定义。照例有多种想法，Mathlib 取滤子版本。

先定义滤子的**聚点**（cluster point）。拓扑空间 `X` 上滤子 `F` 的 `x : X` 是聚点，若 `F` 作为广义集合与「接近 `x` 的点」的广义集合交非空。

于是集合 `s` **紧**，若每个含于 `s` 的非空广义集合 `F`（即 `F ≤ 𝓟 s`）在 `s` 中有聚点。

```lean
variable [TopologicalSpace X]

example {F : Filter X} {x : X} : ClusterPt x F ↔ NeBot (𝓝 x ⊓ F) :=
  Iff.rfl

example {s : Set X} :
    IsCompact s ↔ ∀ (F : Filter X) [NeBot F], F ≤ 𝓟 s → ∃ a ∈ s, ClusterPt a F :=
  Iff.rfl
```

例如若 `F` 为 `map u atTop`（`u : ℕ → X` 下 `atTop` 的像），`F ≤ 𝓟 s` 表示对足够大的 `n` 有 `u n ∈ s`。说 `x` 是 `map u atTop` 的聚点，即「非常大的数」的像与「接近 `x` 的点」相交。若 `𝓝 x` 有可数基，可解读为 `u` 有收敛到 `x` 的子列——回到度量空间中的紧性样子。

```lean
example [FirstCountableTopology X] {s : Set X} {u : ℕ → X} (hs : IsCompact s)
    (hu : ∀ n, u n ∈ s) : ∃ a ∈ s, ∃ φ : ℕ → ℕ, StrictMono φ ∧ Tendsto (u ∘ φ) atTop (𝓝 a) :=
  hs.tendsto_subseq hu
```

聚点与连续函数配合良好：

```lean
variable [TopologicalSpace Y]

example {x : X} {F : Filter X} {G : Filter Y} (H : ClusterPt x F) {f : X → Y}
    (hfx : ContinuousAt f x) (hf : Tendsto f F G) : ClusterPt (f x) G :=
  ClusterPt.map H hfx hf
```

**练习**：证明紧集在连续映射下的像是紧的。除已见内容外，用 `Filter.push_pull` 与 `NeBot.of_map`：

```lean
example [TopologicalSpace Y] {f : X → Y} (hf : Continuous f) {s : Set X} (hs : IsCompact s) :
    IsCompact (f '' s) := by
  intro F F_ne F_le
  have map_eq : map f (𝓟 s ⊓ comap f F) = 𝓟 (f '' s) ⊓ F := by sorry
  have Hne : (𝓟 s ⊓ comap f F).NeBot := by sorry
  have Hle : 𝓟 s ⊓ comap f F ≤ 𝓟 s := inf_le_left
  sorry
```

还可用开覆盖表述紧性：`s` 紧当且仅当覆盖 `s` 的每个开集族有有限子覆盖。

```lean
example {ι : Type*} {s : Set X} (hs : IsCompact s) (U : ι → Set X) (hUo : ∀ i, IsOpen (U i))
    (hsU : s ⊆ ⋃ i, U i) : ∃ t : Finset ι, s ⊆ ⋃ i ∈ t, U i :=
  hs.elim_finite_subcover U hUo hsU
```