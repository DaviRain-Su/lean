# 滤子

类型 `X` 上的**滤子**（filter）是 `X` 的子集族，满足下面将给出的三条公理。该概念支撑两个相关思想：

- **极限**：包括上文讨论的各种极限——序列的有限与无限极限、函数在一点或无穷处的有限与无限极限等。
- **最终发生**：包括「对足够大的 `n : ℕ`」「在点 `x` 足够近处」「点对足够接近」「在测度论意义下几乎处处」等。对偶地，滤子也可表达**经常发生**：对任意大的 `n`、在给定点任意邻域内某处等。

与这些描述对应的滤子将在本节稍后定义，但可先命名：

- `atTop : Filter ℕ`：由含 `{n | n ≥ N}`（某 `N`）的 `ℕ` 子集构成
- `𝓝 x`：拓扑空间中 `x` 的邻域
- `𝓤 X`：一致空间（uniform space）的围集（entourage）；一致空间推广了度量空间与拓扑群
- `μ.ae`：补集关于测度 `μ` 为零的集合（「几乎所有点」）

一般定义如下：滤子 `F : Filter X` 是集合族 `F.sets : Set (Set X)`，满足：

- `F.univ_sets : univ ∈ F.sets`
- `F.sets_of_superset : ∀ {U V}, U ∈ F.sets → U ⊆ V → V ∈ F.sets`
- `F.inter_sets : ∀ {U V}, U ∈ F.sets → V ∈ F.sets → U ∩ V ∈ F.sets`

第一条说 `X` 的全集属于 `F.sets`。第二条说若 `U` 属于 `F.sets`，则任何包含 `U` 的集合也属于 `F.sets`。第三条说 `F.sets` 在有限交下封闭。

在 Mathlib 中，滤子 `F` 是捆绑 `F.sets` 及其三条性质的结构体，但性质不携带额外数据，混淆 `F` 与 `F.sets` 很方便。因此定义 `U ∈ F` 表示 `U ∈ F.sets`。这解释了为何某些提到 `U ∈ F` 的引理名里带有 `sets`。

可把滤子想成定义「足够大」集合的概念：第一条说 `univ` 足够大；第二条说包含足够大集合的集合足够大；第三条说两个足够大集合的交足够大。

更有用的是：把 `X` 上的滤子看作 `Set X` 的**广义元**。例如 `atTop` 是「非常大的数」的集合，`𝓝 x₀` 是「非常接近 `x₀` 的点」的集合。这一观点的一种体现是：对任意 `s : Set X` 可关联**主滤子**（principal filter），由所有包含 `s` 的集合构成。该定义已在 Mathlib 中，记号为 `𝓟`（在 `Filter` 命名空间）。为演示，请在此自行给出定义：

```lean
def principal {α : Type*} (s : Set α) : Filter α
    where
  sets := { t | s ⊆ t }
  univ_sets := sorry
  sets_of_superset := sorry
  inter_sets := sorry
```

第二个例子：请定义滤子 `atTop : Filter ℕ`（也可用带预序的任意类型代替 `ℕ`）：

```lean
example : Filter ℕ :=
  { sets := { s | ∃ a, ∀ b, a ≤ b → b ∈ s }
    univ_sets := sorry
    sets_of_superset := sorry
    inter_sets := sorry }
```

也可直接定义任意 `x : ℝ` 的邻域滤子 `𝓝 x`。在实数中，`x` 的邻域是包含开区间 $(x_0 - \varepsilon, x_0 + \varepsilon)$ 的集合，在 Mathlib 中为 `Ioo (x₀ - ε) (x₀ + ε)`。（这只是 Mathlib 中更一般构造的特例。）

有了这些例子，可定义函数 `f : X → Y` 沿 `F : Filter X` **趋于** `G : Filter Y`：

```lean
def Tendsto₁ {X Y : Type*} (f : X → Y) (F : Filter X) (G : Filter Y) :=
  ∀ V ∈ G, f ⁻¹' V ∈ F
```

当 `X` 为 `ℕ`、`Y` 为 `ℝ` 时，`Tendsto₁ u atTop (𝓝 x)` 等价于序列 `u : ℕ → ℝ` 收敛到实数 `x`。当 `X`、`Y` 都是 `ℝ` 时，`Tendsto f (𝓝 x₀) (𝓝 y₀)` 等价于熟悉的 $\lim_{x \to x₀} f(x) = y₀$。引言中提到的其他极限，也都是对合适的源与目标滤子选取的 `Tendsto₁` 的实例。

`Tendsto₁` 与 Mathlib 中定义的 `Tendsto` 定义等价，但后者更抽象。`Tendsto₁` 的问题在于暴露了量词与 `G` 的元素，且掩盖了把滤子看作广义集合的直觉。可用更多代数与集合论工具隐藏 `∀ V`，使直觉更突出。

第一个工具是任意映射 `f : X → Y` 的**推前**（pushforward）$f_*$，在 Mathlib 中为 `Filter.map f`。给定 `X` 上的滤子 `F`，`Filter.map f F : Filter Y` 按定义满足 `V ∈ Filter.map f F ↔ f ⁻¹' V ∈ F`。示例文件已打开 `Filter` 命名空间，故可写 `map` 代替 `Filter.map`。于是可用 `Filter Y` 上的序关系改写 `Tendsto` 的定义——该序为成员集合的**反向包含**。即给定 `G H : Filter Y`，有 `G ≤ H ↔ ∀ V : Set Y, V ∈ H → V ∈ G`。

```lean
def Tendsto₂ {X Y : Type*} (f : X → Y) (F : Filter X) (G : Filter Y) :=
  map f F ≤ G

example {X Y : Type*} (f : X → Y) (F : Filter X) (G : Filter Y) :
    Tendsto₂ f F G ↔ Tendsto₁ f F G :=
  Iff.rfl
```

滤子上的序关系看似反向。但记住可通过嵌入 `𝓟 : Set X → Filter X`（把集合映到对应主滤子）把 `X` 上的滤子看作 `Set X` 的广义元；该嵌入保序，故 `Filter` 上的序可视为广义集合间的自然包含。在此类比下，推前类似直接像。确实 `map f (𝓟 s) = 𝓟 (f '' s)`。

由此可直观理解：序列 `u : ℕ → ℝ` 收敛到 `x₀` 当且仅当 `map u atTop ≤ 𝓝 x₀`——即「`u` 下非常大的自然数」的直接像「包含在」「非常接近 `x₀` 的点」中。

如所承诺，`Tendsto₂` 的定义不出现量词或集合，且利用推前的代数性质：每个 `Filter.map f` 单调；`Filter.map` 与复合相容。

```lean
#check (@Filter.map_mono : ∀ {α β} {m : α → β}, Monotone (map m))

#check
  (@Filter.map_map :
    ∀ {α β γ} {f : Filter α} {m : α → β} {m' : β → γ}, map m' (map m f) = map (m' ∘ m) f)
```

二者合起来可证极限的复合，一次得到引言所述 512 种复合引理变体及更多。请用 `Tendsto₁` 的全称量词定义，或代数定义配合上面两条引理，证明：

```lean
example {X Y Z : Type*} {F : Filter X} {G : Filter Y} {H : Filter Z} {f : X → Y} {g : Y → Z}
    (hf : Tendsto₁ f F G) (hg : Tendsto₁ g G H) : Tendsto₁ (g ∘ f) F H :=
  sorry
```

推前用映射把滤子从源推到目标；还有**拉回**（pullback）`Filter.comap`，方向相反，推广集合的原像。对任意 `f`，`Filter.map f` 与 `Filter.comap f` 构成 **Galois 连接**：

`Filter.map_le_iff_le_comap : Filter.map f F ≤ G ↔ F ≤ Filter.comap f G`

对任意 `F`、`G` 成立。`comap` 也可给出与 Mathlib 中 `Tendsto` 定义等价（但非定义等价）的表述。

`comap` 可用来把滤子限制到子类型。例如设 `f : ℝ → ℝ`、`x₀ y₀ : ℝ`，要表述当 `x` 在**有理数**中趋于 `x₀` 时 `f x` 趋于 `y₀`：用强制映射 `(↑) : ℚ → ℝ` 拉回 `𝓝 x₀`，陈述 `Tendsto (f ∘ (↑) : ℚ → ℝ) (comap (↑) (𝓝 x₀)) (𝓝 y₀)`。

```lean
variable (f : ℝ → ℝ) (x₀ y₀ : ℝ)

#check comap ((↑) : ℚ → ℝ) (𝓝 x₀)

#check Tendsto (f ∘ (↑)) (comap ((↑) : ℚ → ℝ) (𝓝 x₀)) (𝓝 y₀)
```

拉回也与复合相容，但是**反变**的——交换参数顺序：

```lean
section
variable {α β γ : Type*} (F : Filter α) {m : γ → β} {n : β → α}

#check (comap_comap : comap m (comap n F) = comap (n ∘ m) F)

end
```

转向平面 `ℝ × ℝ`：点 `(x₀, y₀)` 的邻域与 `𝓝 x₀`、`𝓝 y₀` 有何关系？有积运算 `Filter.prod : Filter X → Filter Y → Filter (X × Y)`，记号 `×ˢ`：

```lean
example : 𝓝 (x₀, y₀) = 𝓝 x₀ ×ˢ 𝓝 y₀ :=
  nhds_prod_eq
```

积运算用拉回与 `inf` 定义：

`F ×ˢ G = (comap Prod.fst F) ⊓ (comap Prod.snd G)`

对任意 `X`，`inf` 指 `Filter X` 上的格结构：`F ⊓ G` 是同时小于 `F` 与 `G` 的最大滤子，推广了集合的交。

Mathlib 中大量证明用 `map`、`comap`、`inf`、`sup`、`prod` 的代数性质，从不提及滤子成员，给出关于收敛的代数证明。请证明下列引理（必要时展开 `Tendsto` 与 `Filter.prod`）：

```lean
#check le_inf_iff

example (f : ℕ → ℝ × ℝ) (x₀ y₀ : ℝ) :
    Tendsto f atTop (𝓝 (x₀, y₀)) ↔
      Tendsto (Prod.fst ∘ f) atTop (𝓝 x₀) ∧ Tendsto (Prod.snd ∘ f) atTop (𝓝 y₀) :=
  sorry
```

有序类型 `Filter X` 实际是**完备格**（complete lattice）：有底元、顶元，且 `X` 上任意滤子族有 `Inf` 与 `Sup`。

注意滤子定义第二条（若 `U ∈ F` 则任何更大的集合也在 `F` 中）下，第一条（全体 inhabitant 的集合在 `F` 中）等价于 `F` 不是空集族。这与空集是否**属于** `F` 是更微妙的问题。定义不禁止 `∅ ∈ F`，但若空集在 `F` 中则每个集合都在 `F` 中，即 `∀ U : Set X, U ∈ F`。此时 `F` 是平凡滤子，恰为 `Filter X` 完备格的底元。这与 Bourbaki 的滤子定义不同——后者不允许含空集的滤子。

因定义包含平凡滤子，有时须在引理中显式假设**非平凡**（nontriviality）。回报是理论的全局性质更好：有底元；可定义 `principal : Set X → Filter X` 把 `∅` 映到 `⊥`，无需排除空集的前提；拉回也可无条件定义。事实上可有 `comap f F = ⊥` 而 `F ≠ ⊥`：例如给定 `x₀ : ℝ` 与 `s : Set ℝ`，从对应 `s` 的子类型强制拉回 `𝓝 x₀` 非平凡当且仅当 `x₀` 属于 `s` 的闭包。

管理需假设滤子非平凡的引理时，Mathlib 有类型类 `Filter.NeBot`，库中引理假设 `(F : Filter X) [F.NeBot]`。实例库知道例如 `(atTop : Filter ℕ).NeBot`，且推前非平凡滤子仍非平凡。故假设 `[F.NeBot]` 的引理自动适用于任意序列 `u` 的 `map u atTop`。

关于滤子代数性质与极限关系的巡礼基本结束，但尚未说明我们确实恢复了通常的极限概念。表面上 `Tendsto u atTop (𝓝 x₀)` 似乎比[序列与收敛](../C03_Logic/SequencesAndConvergence.md)中的收敛更强——要求**每个** `x₀` 的邻域的原像属于 `atTop`，而通常定义只要求标准邻域 `Ioo (x₀ - ε) (x₀ + ε)`。关键是按定义每个邻域都包含这样的标准开区间。这引向**滤子基**（filter basis）概念。

给定 `F : Filter X`，族 `s : ι → Set X` 是 `F` 的基，若对每个集合 `U`，有 `U ∈ F` 当且仅当 `U` 包含某个 `s i`。形式地：`∀ U : Set X, U ∈ F ↔ ∃ i, s i ⊆ U`。更灵活的是对指标 `ι` 加谓词，只选部分 `i`。对 `𝓝 x₀`，取 `ι` 为 `ℝ`，写 `ε` 代替 `i`，谓词选正 `ε`。于是 `Ioo (x₀ - ε) (x₀ + ε)` 构成 `ℝ` 邻域拓扑的基：

```lean
example (x₀ : ℝ) : HasBasis (𝓝 x₀) (fun ε : ℝ ↦ 0 < ε) fun ε ↦ Ioo (x₀ - ε) (x₀ + ε) :=
  nhds_basis_Ioo_pos x₀
```

`atTop` 也有好的基。引理 `Filter.HasBasis.tendsto_iff` 可在给定 `F`、`G` 的基时改写 `Tendsto f F G`。合起来即[序列与收敛](../C03_Logic/SequencesAndConvergence.md)中用过的收敛概念：

```lean
example (u : ℕ → ℝ) (x₀ : ℝ) :
    Tendsto u atTop (𝓝 x₀) ↔ ∀ ε > 0, ∃ N, ∀ n ≥ N, u n ∈ Ioo (x₀ - ε) (x₀ + ε) := by
  have : atTop.HasBasis (fun _ : ℕ ↦ True) Ici := atTop_basis
  rw [this.tendsto_iff (nhds_basis_Ioo_pos x₀)]
  simp
```

滤子还便于处理「对足够大的数」或「对足够接近给定点的点」成立的性质。在[序列与收敛](../C03_Logic/SequencesAndConvergence.md)中，常遇到：知道某性质 `P n` 对足够大的 `n` 成立，另一性质 `Q n` 也对足够大的 `n` 成立。用两次 `cases` 得 `N_P`、`N_Q` 满足 `∀ n ≥ N_P, P n` 与 `∀ n ≥ N_Q, Q n`；令 `N := max N_P N_Q` 可证 `∀ n ≥ N, P n ∧ Q n`。反复如此很累。

更好的是注意到「`P n` 与 `Q n` 对足够大的 `n` 成立」即 `{n | P n} ∈ atTop` 且 `{n | Q n} ∈ atTop`。`atTop` 为滤子 ⇒ 两个 `atTop` 元素的交仍在 `atTop` 中，故 `{n | P n ∧ Q n} ∈ atTop`。写 `{n | P n} ∈ atTop` 不直观，可用更提示性的记号 `∀ᶠ n in atTop, P n`：上标 `f` 表示 Filter——「对所有在『非常大的数』集合中的 `n`，`P n` 成立」。`∀ᶠ` 表示 `Filter.Eventually`；引理 `Filter.Eventually.and` 用滤子的交性质完成上述操作：

```lean
example (P Q : ℕ → Prop) (hP : ∀ᶠ n in atTop, P n) (hQ : ∀ᶠ n in atTop, Q n) :
    ∀ᶠ n in atTop, P n ∧ Q n :=
  hP.and hQ
```

记号如此方便，也有等式、不等式的专门化。例如设 `u`、`v` 为两个实数序列，证明：若对足够大的 `n` 有 `u n = v n`，则 `u` 趋于 `x₀` 当且仅当 `v` 趋于 `x₀`。先用一般 `Eventually`，再用等式专门化 `EventuallyEq`；二者定义等价，同一证明适用：

```lean
example (u v : ℕ → ℝ) (h : ∀ᶠ n in atTop, u n = v n) (x₀ : ℝ) :
    Tendsto u atTop (𝓝 x₀) ↔ Tendsto v atTop (𝓝 x₀) :=
  tendsto_congr' h

example (u v : ℕ → ℝ) (h : u =ᶠ[atTop] v) (x₀ : ℝ) :
    Tendsto u atTop (𝓝 x₀) ↔ Tendsto v atTop (𝓝 x₀) :=
  tendsto_congr' h
```

用 `Eventually` 回顾滤子定义很有启发。给定 `F : Filter X`，对 `X` 上任意谓词 `P`、`Q`：

- `univ ∈ F` 保证 `(∀ x, P x) → ∀ᶠ x in F, P x`
- `U ∈ F → U ⊆ V → V ∈ F` 保证 `(∀ᶠ x in F, P x) → (∀ x, P x → Q x) → ∀ᶠ x in F, Q x`
- `U ∈ F → V ∈ F → U ∩ V ∈ F` 保证 `(∀ᶠ x in F, P x) → (∀ᶠ x in F, Q x) → ∀ᶠ x in F, P x ∧ Q x`

```lean
#check Eventually.of_forall
#check Eventually.mono
#check Eventually.and
```

第二项对应 `Eventually.mono`，与 `Eventually.and` 结合可优雅地使用滤子；**`filter_upwards`** 策略可组合它们。比较：

```lean
example (P Q R : ℕ → Prop) (hP : ∀ᶠ n in atTop, P n) (hQ : ∀ᶠ n in atTop, Q n)
    (hR : ∀ᶠ n in atTop, P n ∧ Q n → R n) : ∀ᶠ n in atTop, R n := by
  apply (hP.and (hQ.and hR)).mono
  rintro n ⟨h, h', h''⟩
  exact h'' ⟨h, h'⟩

example (P Q R : ℕ → Prop) (hP : ∀ᶠ n in atTop, P n) (hQ : ∀ᶠ n in atTop, Q n)
    (hR : ∀ᶠ n in atTop, P n ∧ Q n → R n) : ∀ᶠ n in atTop, R n := by
  filter_upwards [hP, hQ, hR] with n h h' h''
  exact h'' ⟨h, h'⟩
```

懂测度论的读者会注意到：补集测度为零的滤子 `μ.ae`（「几乎所有点」）作为 `Tendsto` 的源或目标不太有用，但可与 `Eventually` 合用，说某性质对几乎所有点成立。

`∀ᶠ x in F, P x` 有对偶版本，偶尔有用：`∃ᶠ x in F, P x` 表示 `{x | ¬P x} ∉ F`。例如 `∃ᶠ n in atTop, P n` 表示有任意大的 `n` 使 `P n` 成立。`∃ᶠ` 表示 `Filter.Frequently`。

更复杂的例子：设序列 `u`、集合 `M`、值 `x`。若 `u` 收敛到 `x`，且对足够大的 `n` 有 `u n ∈ M`，则 `x` 在 `M` 的闭包中。形式化为：

`Tendsto u atTop (𝓝 x) → (∀ᶠ n in atTop, u n ∈ M) → x ∈ closure M`

这是拓扑库中 `mem_closure_of_tendsto` 的特例。请用所引引理证明，记住 `ClusterPt x F` 表示 `(𝓝 x ⊓ F).NeBot`，且假设 `∀ᶠ n in atTop, u n ∈ M` 按定义即 `M ∈ map u atTop`：

```lean
#check mem_closure_iff_clusterPt
#check le_principal_iff
#check neBot_of_le

example (u : ℕ → ℝ) (M : Set ℝ) (x : ℝ) (hux : Tendsto u atTop (𝓝 x))
    (huM : ∀ᶠ n in atTop, u n ∈ M) : x ∈ closure M :=
  sorry
```