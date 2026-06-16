# 积分

有了可测空间与测度，就可以考虑积分。如上所述，Mathlib 使用非常一般的积分概念，目标可以是任意 Banach 空间。照例，我们不希望记号携带假设，因此这样定义积分：若函数不可积，则积分等于零。大多数与积分有关的引理都有可积性假设。

```lean
section
variable {E : Type*} [NormedAddCommGroup E] [NormedSpace ℝ E] [CompleteSpace E] {f : α → E}

example {f g : α → E} (hf : Integrable f μ) (hg : Integrable g μ) :
    ∫ a, f a + g a ∂μ = ∫ a, f a ∂μ + ∫ a, g a ∂μ :=
  integral_add hf hg
```

作为各种约定相互作用的例子，看如何积分常值函数。回忆测度 `μ` 取值于 `ℝ≥0∞`（扩展非负实数类型）。有函数 `ENNReal.toReal : ℝ≥0∞ → ℝ`，把无穷点 `⊤` 映到零。对任意 `s : Set α`，若 `μ s = ⊤`，则 `s` 上非零常值函数不可积；此时按定义其积分为零，`(μ s).toReal` 也为零。故在所有情形下都有下列引理：

```lean
example {s : Set α} (c : E) : ∫ _ in s, c ∂μ = (μ s).toReal • c :=
  setIntegral_const c
```

下面快速说明如何访问积分理论中最重要的定理，从**控制收敛定理**（dominated convergence theorem）开始。Mathlib 中有多个版本，此处只展示最基本的一个：

```lean
open Filter

example {F : ℕ → α → E} {f : α → E} (bound : α → ℝ) (hmeas : ∀ n, AEStronglyMeasurable (F n) μ)
    (hint : Integrable bound μ) (hbound : ∀ n, ∀ᵐ a ∂μ, ‖F n a‖ ≤ bound a)
    (hlim : ∀ᵐ a ∂μ, Tendsto (fun n : ℕ ↦ F n a) atTop (𝓝 (f a))) :
    Tendsto (fun n ↦ ∫ a, F n a ∂μ) atTop (𝓝 (∫ a, f a ∂μ)) :=
  tendsto_integral_of_dominated_convergence bound hmeas hint hbound hlim
```

然后是乘积类型上积分的 **Fubini 定理**：

```lean
example {α : Type*} [MeasurableSpace α] {μ : Measure α} [SigmaFinite μ] {β : Type*}
    [MeasurableSpace β] {ν : Measure β} [SigmaFinite ν] (f : α × β → E)
    (hf : Integrable f (μ.prod ν)) : ∫ z, f z ∂ μ.prod ν = ∫ x, ∫ y, f (x, y) ∂ν ∂μ :=
  integral_prod f hf
```

end

还有适用于任意连续双线性形式的非常一般的卷积版本：

```lean
section

open Convolution

variable {𝕜 : Type*} {G : Type*} {E : Type*} {E' : Type*} {F : Type*} [NormedAddCommGroup E]
  [NormedAddCommGroup E'] [NormedAddCommGroup F] [NontriviallyNormedField 𝕜] [NormedSpace 𝕜 E]
  [NormedSpace 𝕜 E'] [NormedSpace 𝕜 F] [MeasurableSpace G] [NormedSpace ℝ F] [CompleteSpace F]
  [Sub G]

example (f : G → E) (g : G → E') (L : E →L[𝕜] E' →L[𝕜] F) (μ : Measure G) :
    f ⋆[L, μ] g = fun x ↦ ∫ t, L (f t) (g (x - t)) ∂μ :=
  rfl

end
```

最后，Mathlib 有非常一般的**换元公式**（change-of-variables）。下述陈述中，`BorelSpace E` 表示 `E` 上的 $\sigma$-代数由 `E` 的开集生成；`IsAddHaarMeasure μ` 表示测度 `μ` 左不变、给紧集有限质量、给开集正质量。

```lean
example {E : Type*} [NormedAddCommGroup E] [NormedSpace ℝ E] [FiniteDimensional ℝ E]
    [MeasurableSpace E] [BorelSpace E] (μ : Measure E) [μ.IsAddHaarMeasure] {F : Type*}
    [NormedAddCommGroup F] [NormedSpace ℝ F] [CompleteSpace F] {s : Set E} {f : E → E}
    {f' : E → E →L[ℝ] E} (hs : MeasurableSet s)
    (hf : ∀ x : E, x ∈ s → HasFDerivWithinAt f (f' x) s x) (h_inj : InjOn f s) (g : E → F) :
    ∫ x in f '' s, g x ∂μ = ∫ x in s, |(f' x).det| • g (f x) ∂μ :=
  integral_image_eq_integral_abs_det_fderiv_smul μ hs hf h_inj g
```