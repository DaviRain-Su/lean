# 初等积分

我们先关注 `ℝ` 上有限区间上的函数积分，可对初等函数积分。

```lean
open MeasureTheory intervalIntegral

open Interval
-- 引入记号 `[[a, b]]`，表示从 `min a b` 到 `max a b` 的线段

example (a b : ℝ) : (∫ x in a..b, x) = (b ^ 2 - a ^ 2) / 2 :=
  integral_id

example {a b : ℝ} (h : (0 : ℝ) ∉ [[a, b]]) : (∫ x in a..b, 1 / x) = Real.log (b / a) :=
  integral_one_div h
```

微积分基本定理联系积分与微分。下面给出该定理两部分的简化表述：第一部分说积分提供微分的逆；第二部分说明如何计算导数的积分。（两部分关系密切，但此处未展示的最优版本彼此不等价。）

```lean
example (f : ℝ → ℝ) (hf : Continuous f) (a b : ℝ) : deriv (fun u ↦ ∫ x in a..u, f x) b = f b :=
  (integral_hasStrictDerivAt_right (hf.intervalIntegrable _ _) (hf.stronglyMeasurableAtFilter _ _)
        hf.continuousAt).hasDerivAt.deriv

example {f : ℝ → ℝ} {a b : ℝ} {f' : ℝ → ℝ} (h : ∀ x ∈ [[a, b]], HasDerivAt f (f' x) x)
    (h' : IntervalIntegrable f' volume a b) : (∫ y in a..b, f' y) = f b - f a :=
  integral_eq_sub_of_hasDerivAt h h'
```

卷积（convolution）也在 Mathlib 中定义，并证明了基本性质：

```lean
open Convolution

example (f : ℝ → ℝ) (g : ℝ → ℝ) : f ⋆ g = fun x ↦ ∫ t, f t * g (x - t) :=
  rfl
```