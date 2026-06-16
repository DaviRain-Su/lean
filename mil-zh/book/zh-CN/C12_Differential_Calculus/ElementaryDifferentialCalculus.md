# 初等微分学

设 `f` 为从实数到实数的函数。在一点处讨论 `f` 的导数，与讨论导函数，是两件不同的事。Mathlib 中第一种情形表示如下：

```lean
open Real

/-- 正弦函数在 0 处的导数为 1。 -/
example : HasDerivAt sin 1 0 := by simpa using hasDerivAt_sin 0
```

也可在不指定导数值的情况下说 `f` 在某点可微，写作 `DifferentiableAt ℝ`。显式写 `ℝ` 是因为在稍更一般的语境（如从 `ℂ` 到 `ℂ` 的函数）中，需要区分实意义可微与复导数意义可微。

```lean
example (x : ℝ) : DifferentiableAt ℝ sin x :=
  (hasDerivAt_sin x).differentiableAt
```

每次引用导数都提供可微性证明会很麻烦。因此 Mathlib 提供函数 `deriv f : ℝ → ℝ`：对任意 `f : ℝ → ℝ` 都有定义，但在 `f` 不可微的点取值 `0`。

```lean
example {f : ℝ → ℝ} {x a : ℝ} (h : HasDerivAt f a x) : deriv f x = a :=
  h.deriv

example {f : ℝ → ℝ} {x : ℝ} (h : ¬DifferentiableAt ℝ f x) : deriv f x = 0 :=
  deriv_zero_of_not_differentiableAt h
```

当然许多关于 `deriv` 的引理需要可微性假设。例如应想想没有可微性假设时下面引理的反例：

```lean
example {f g : ℝ → ℝ} {x : ℝ} (hf : DifferentiableAt ℝ f x) (hg : DifferentiableAt ℝ g x) :
    deriv (f + g) x = deriv f x + deriv g x :=
  deriv_add hf hg
```

有趣的是，有些陈述可利用 `deriv` 在不可微点默认为 `0` 而**避免**可微性假设。理解下面陈述须弄清 `deriv` 的精确定义：

```lean
example {f : ℝ → ℝ} {a : ℝ} (h : IsLocalMin f a) : deriv f a = 0 := by
  exact?
  --h.deriv_eq_zero
```

甚至可以陈述无需任何可微性假设的 Rolle 定理，这更显奇怪：

```lean
open Set

example {f : ℝ → ℝ} {a b : ℝ} (hab : a < b) (hfc : ContinuousOn f (Icc a b)) (hfI : f a = f b) :
    ∃ c ∈ Ioo a b, deriv f c = 0 :=
  exists_deriv_eq_zero hab hfc hfI
```

此技巧对一般中值定理不适用：

```lean
example (f : ℝ → ℝ) {a b : ℝ} (hab : a < b) (hf : ContinuousOn f (Icc a b))
    (hf' : DifferentiableOn ℝ f (Ioo a b)) : ∃ c ∈ Ioo a b, deriv f c = (f b - f a) / (b - a) :=
  exists_deriv_eq_slope f hab hf hf'
```

Lean 可用 **`simp`** 策略自动计算一些简单导数：

```lean
example : deriv (fun x : ℝ ↦ x ^ 5) 6 = 5 * 6 ^ 4 := by simp

example : deriv sin π = -1 := by simp
```