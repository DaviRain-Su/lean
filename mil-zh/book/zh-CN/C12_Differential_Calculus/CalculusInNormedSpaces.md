# 赋范空间上的微分学

## 赋范空间

微分可借助**赋范向量空间**（normed vector space）推广到 `ℝ` 之外；它同时刻画方向与距离。先从**赋范群**（normed group）开始：带实值范数函数的加法交换群，满足：

```lean
section

variable {E : Type*} [NormedAddCommGroup E]

example (x : E) : 0 ≤ ‖x‖ :=
  norm_nonneg x

example {x : E} : ‖x‖ = 0 ↔ x = 0 :=
  norm_eq_zero

example (x y : E) : ‖x + y‖ ≤ ‖x‖ + ‖y‖ :=
  norm_add_le x y
```

每个赋范空间都是度量空间，距离为 $d(x, y) = \|x - y\|$，因而也是拓扑空间。Lean 与 Mathlib 知道这一点：

```lean
example : MetricSpace E := by infer_instance

example {X : Type*} [TopologicalSpace X] {f : X → E} (hf : Continuous f) :
    Continuous fun x ↦ ‖f x‖ :=
  hf.norm
```

为在线性代数语境中使用范数，在 `NormedAddGroup E` 之上再加假设 `NormedSpace ℝ E`：即 `E` 为 `ℝ` 上向量空间，且标量乘法满足：

```lean
variable [NormedSpace ℝ E]

example (a : ℝ) (x : E) : ‖a • x‖ = |a| * ‖x‖ :=
  norm_smul a x
```

完备的赋范空间称为 **Banach 空间**（Banach space）。每个有限维向量空间完备：

```lean
example [FiniteDimensional ℝ E] : CompleteSpace E := by infer_instance
```

前述例子都以实数为底域。更一般地，可在任意**非平凡赋范域**（nontrivially normed field）上的向量空间中做微积分：配备实值范数，乘法性，且并非每个元的范数都是 0 或 1（等价地，存在范数大于 1 的元）。

```lean
example (𝕜 : Type*) [NontriviallyNormedField 𝕜] (x y : 𝕜) : ‖x * y‖ = ‖x‖ * ‖y‖ :=
  norm_mul x y

example (𝕜 : Type*) [NontriviallyNormedField 𝕜] : ∃ x : 𝕜, 1 < ‖x‖ :=
  NormedField.exists_one_lt_norm 𝕜
```

非平凡赋范域上的有限维向量空间，只要域本身完备，则向量空间也完备：

```lean
example (𝕜 : Type*) [NontriviallyNormedField 𝕜] (E : Type*) [NormedAddCommGroup E]
    [NormedSpace 𝕜 E] [CompleteSpace 𝕜] [FiniteDimensional 𝕜 E] : CompleteSpace E :=
  FiniteDimensional.complete 𝕜 E
```

end

## 连续线性映射

转向赋范空间范畴中的态射：**连续线性映射**（continuous linear map）。Mathlib 中赋范空间 `E`、`F` 之间 `𝕜`-线性连续映射的类型为 `E →L[𝕜] F`。它们是**捆绑映射**：结构体包含函数本身及线性与连续性质；Lean 会插入强制，使连续线性映射可当函数用。

```lean
section

variable {𝕜 : Type*} [NontriviallyNormedField 𝕜] {E : Type*} [NormedAddCommGroup E]
  [NormedSpace 𝕜 E] {F : Type*} [NormedAddCommGroup F] [NormedSpace 𝕜 F]

example : E →L[𝕜] E :=
  ContinuousLinearMap.id 𝕜 E

example (f : E →L[𝕜] F) : E → F :=
  f

example (f : E →L[𝕜] F) : Continuous f :=
  f.cont

example (f : E →L[𝕜] F) (x y : E) : f (x + y) = f x + f y :=
  f.map_add x y

example (f : E →L[𝕜] F) (a : 𝕜) (x : E) : f (a • x) = a • f x :=
  f.map_smul a x
```

连续线性映射有**算子范数**（operator norm），由下列性质刻画：

```lean
variable (f : E →L[𝕜] F)

example (x : E) : ‖f x‖ ≤ ‖f‖ * ‖x‖ :=
  f.le_opNorm x

example {M : ℝ} (hMp : 0 ≤ M) (hM : ∀ x, ‖f x‖ ≤ M * ‖x‖) : ‖f‖ ≤ M :=
  f.opNorm_le_bound hMp hM
```

end

还有捆绑的连续线性**同构**，类型为 `E ≃L[𝕜] F`。

**练习**（有挑战）：证明 **Banach–Steinhaus 定理**（一致有界原理）。从 Banach 空间到赋范空间的连续线性映射族若**点态有界**，则这些线性映射的范数**一致有界**。主要工具是 Baire 定理 `nonempty_interior_of_iUnion_of_closed`（[度量空间](../C11_Topology/MetricSpaces.md)中证明过其版本）。次要成分包括 `continuous_linear_map.opNorm_le_of_shell`、`interior_subset`、`interior_iInter_subset`、`isClosed_le`。

```lean
section

variable {𝕜 : Type*} [NontriviallyNormedField 𝕜] {E : Type*} [NormedAddCommGroup E]
  [NormedSpace 𝕜 E] {F : Type*} [NormedAddCommGroup F] [NormedSpace 𝕜 F]

open Metric

example {ι : Type*} [CompleteSpace E] {g : ι → E →L[𝕜] F} (h : ∀ x, ∃ C, ∀ i, ‖g i x‖ ≤ C) :
    ∃ C', ∀ i, ‖g i‖ ≤ C' := by
  -- 子集列：那些对所有 `i` 满足 `‖g i x‖ ≤ n` 的 `x : E`
  let e : ℕ → Set E := fun n ↦ ⋂ i : ι, { x : E | ‖g i x‖ ≤ n }
  -- 每个集合闭
  have hc : ∀ n : ℕ, IsClosed (e n) :=
    sorry
  -- 并集为全空间；此处用 `h`
  have hU : (⋃ n : ℕ, e n) = univ :=
    sorry
  -- 用 Baire 范畴定理：某 `m : ℕ` 的 `e m` 的内部含某 `x`
  obtain ⟨m, x, hx⟩ : ∃ m, ∃ x, x ∈ interior (e m) := sorry
  obtain ⟨ε, ε_pos, hε⟩ : ∃ ε > 0, ball x ε ⊆ interior (e m) := sorry
  obtain ⟨k, hk⟩ : ∃ k : 𝕜, 1 < ‖k‖ := sorry
  -- 球中每点经任意 `g i` 后范数 ≤ `m`
  have real_norm_le : ∀ z ∈ ball x ε, ∀ (i : ι), ‖g i z‖ ≤ m :=
    sorry
  have εk_pos : 0 < ε / ‖k‖ := sorry
  refine ⟨(m + m : ℕ) / (ε / ‖k‖), fun i ↦ ContinuousLinearMap.opNorm_le_of_shell ε_pos ?_ hk ?_⟩
  sorry
  sorry

end
```

## 渐近比较

定义可微性还需渐近比较。Mathlib 有完备的 big O 与 little o 关系库，定义如下。打开 `asymptotics` locale 可用对应记号。此处仅用 little o 定义可微性。

```lean
open Asymptotics

example {α : Type*} {E : Type*} [NormedGroup E] {F : Type*} [NormedGroup F] (c : ℝ)
    (l : Filter α) (f : α → E) (g : α → F) : IsBigOWith c l f g ↔ ∀ᶠ x in l, ‖f x‖ ≤ c * ‖g x‖ :=
  isBigOWith_iff

example {α : Type*} {E : Type*} [NormedGroup E] {F : Type*} [NormedGroup F]
    (l : Filter α) (f : α → E) (g : α → F) : f =O[l] g ↔ ∃ C, IsBigOWith C l f g :=
  isBigO_iff_isBigOWith

example {α : Type*} {E : Type*} [NormedGroup E] {F : Type*} [NormedGroup F]
    (l : Filter α) (f : α → E) (g : α → F) : f =o[l] g ↔ ∀ C > 0, IsBigOWith C l f g :=
  isLittleO_iff_forall_isBigOWith

example {α : Type*} {E : Type*} [NormedAddCommGroup E] (l : Filter α) (f g : α → E) :
    f ~[l] g ↔ (f - g) =o[l] g :=
  Iff.rfl
```

## 可微性

现在讨论赋范空间之间可微函数。与一维初等情形类比，Mathlib 定义谓词 `HasFDerivAt` 与函数 `fderiv`；字母 "f" 表示 **Fréchet**。

```lean
section

open Topology

variable {𝕜 : Type*} [NontriviallyNormedField 𝕜] {E : Type*} [NormedAddCommGroup E]
  [NormedSpace 𝕜 E] {F : Type*} [NormedAddCommGroup F] [NormedSpace 𝕜 F]

example (f : E → F) (f' : E →L[𝕜] F) (x₀ : E) :
    HasFDerivAt f f' x₀ ↔ (fun x ↦ f x - f x₀ - f' (x - x₀)) =o[𝓝 x₀] fun x ↦ x - x₀ :=
  hasFDerivAt_iff_isLittleO

example (f : E → F) (f' : E →L[𝕜] F) (x₀ : E) (hff' : HasFDerivAt f f' x₀) : fderiv 𝕜 f x₀ = f' :=
  hff'.fderiv
```

还有取值于多重线性映射类型 `E [×n]→L[𝕜] F` 的**迭代导数**，以及**连续可微**函数。类型 `ℕ∞` 是在每个自然数之上再加元素 `∞` 的 `ℕ`。故 $\mathcal{C}^\infty$ 函数是满足 `ContDiff 𝕜 ⊤ f` 的 `f`：

```lean
example (n : ℕ) (f : E → F) : E → E[×n]→L[𝕜] F :=
  iteratedFDeriv 𝕜 n f

example (n : ℕ∞) {f : E → F} :
    ContDiff 𝕜 n f ↔
      (∀ m : ℕ, (m : WithTop ℕ) ≤ n → Continuous fun x ↦ iteratedFDeriv 𝕜 m f x) ∧
        ∀ m : ℕ, (m : WithTop ℕ) < n → Differentiable 𝕜 fun x ↦ iteratedFDeriv 𝕜 m f x :=
  contDiff_iff_continuous_differentiable
```

`ContDiff` 中的可微性参数也可取 `ω : WithTop ℕ∞` 表示解析函数。

还有更严格的可微性概念 `HasStrictFDerivAt`，用于 Mathlib 中的反函数定理与隐函数定理。在 `ℝ` 或 `ℂ` 上，连续可微函数是严格可微的：

```lean
example {𝕂 : Type*} [RCLike 𝕂] {E : Type*} [NormedAddCommGroup E] [NormedSpace 𝕂 E] {F : Type*}
    [NormedAddCommGroup F] [NormedSpace 𝕂 F] {f : E → F} {x : E} {n : WithTop ℕ∞}
    (hf : ContDiffAt 𝕂 n f x) (hn : 1 ≤ n) : HasStrictFDerivAt f (fderiv 𝕂 f x) x :=
  hf.hasStrictFDerivAt (zero_lt_one.trans_le hn).ne'
```

**局部逆定理**用一运算表述：从函数及「函数在点 `a` 严格可微且导数为同构」的假设产生逆函数。第一例得到该局部逆；随后说明它确实是左、右局部逆，且严格可微：

```lean
section LocalInverse
variable [CompleteSpace E] {f : E → F} {f' : E ≃L[𝕜] F} {a : E}

example (hf : HasStrictFDerivAt f (f' : E →L[𝕜] F) a) : F → E :=
  HasStrictFDerivAt.localInverse f f' a hf

example (hf : HasStrictFDerivAt f (f' : E →L[𝕜] F) a) :
    ∀ᶠ x in 𝓝 a, hf.localInverse f f' a (f x) = x :=
  hf.eventually_left_inverse

example (hf : HasStrictFDerivAt f (f' : E →L[𝕜] F) a) :
    ∀ᶠ x in 𝓝 (f a), f (hf.localInverse f f' a x) = x :=
  hf.eventually_right_inverse

example (hf : HasStrictFDerivAt f (f' : E →L[𝕜] F) a) :
    HasStrictFDerivAt (HasStrictFDerivAt.localInverse f f' a hf) (f'.symm : F →L[𝕜] E) (f a) :=
  HasStrictFDerivAt.to_localInverse hf

end LocalInverse
```

以上只是 Mathlib 微分学的一次快速巡礼；库中还有许多未讨论的变体。例如一维情形可能想用单侧导数；手段在更一般语境中，见 `HasFDerivWithinAt` 或更一般的 `HasFDerivAtFilter`：

```lean
#check HasFDerivWithinAt

#check HasFDerivAtFilter
```