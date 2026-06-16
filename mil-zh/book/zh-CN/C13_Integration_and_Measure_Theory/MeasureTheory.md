# 测度论

Mathlib 中积分的一般框架是测度论（measure theory）。甚至上一节的初等积分实际上也是 Bochner 积分。Bochner 积分是 Lebesgue 积分的推广：目标空间可以是任意 Banach 空间，不必有限维。

测度论发展的第一个组成部分是集合的 $\sigma$-代数概念，其中的集合称为**可测集**（measurable set）。类型类 `MeasurableSpace` 为类型配备这样的结构。`empty` 与 `univ` 可测；可测集的补集可测；可测集的可数并或可数交仍可测。注意这些公理有冗余；若执行 `#print MeasurableSpace`，可看到 Mathlib 实际使用的版本。如下例所示，可数性假设可用 `Encodable` 类型类表达。

```lean
variable {α : Type*} [MeasurableSpace α]

example : MeasurableSet (∅ : Set α) :=
  MeasurableSet.empty

example : MeasurableSet (univ : Set α) :=
  MeasurableSet.univ

example {s : Set α} (hs : MeasurableSet s) : MeasurableSet (sᶜ) :=
  hs.compl

example : Encodable ℕ := by infer_instance

example (n : ℕ) : Encodable (Fin n) := by infer_instance

variable {ι : Type*} [Encodable ι]

example {f : ι → Set α} (h : ∀ b, MeasurableSet (f b)) : MeasurableSet (⋃ b, f b) :=
  MeasurableSet.iUnion h

example {f : ι → Set α} (h : ∀ b, MeasurableSet (f b)) : MeasurableSet (⋂ b, f b) :=
  MeasurableSet.iInter h
```

类型可测之后，就可以对它**测度**。纸上，配备 $\sigma$-代数的集合（或类型）上的测度，是从可测集到扩展非负实数的函数，在可数不交并上可加。Mathlib 中不希望每次把测度作用于集合时都携带可测性假设，因此把测度扩展到任意集合 `s`：取包含 `s` 的可测集测度的下确界。当然许多引理仍需要可测性，但并非全部。

```lean
open MeasureTheory Function
variable {μ : Measure α}

example (s : Set α) : μ s = ⨅ (t : Set α) (_ : s ⊆ t) (_ : MeasurableSet t), μ t :=
  measure_eq_iInf s

example (s : ι → Set α) : μ (⋃ i, s i) ≤ ∑' i, μ (s i) :=
  measure_iUnion_le s

example {f : ℕ → Set α} (hmeas : ∀ i, MeasurableSet (f i)) (hdis : Pairwise (Disjoint on f)) :
    μ (⋃ i, f i) = ∑' i, μ (f i) :=
  μ.m_iUnion hmeas hdis
```

类型配有测度后，可说性质 `P` **几乎处处**（almost everywhere）成立，若性质不成立的元素组成的集合测度为 0。几乎处处成立的性质族构成滤子，但 Mathlib 为表达「几乎处处」引入专门记号（与[滤子](../C11_Topology/Filters.md)一节中的 `μ.ae` 呼应）：

```lean
example {P : α → Prop} : (∀ᵐ x ∂μ, P x) ↔ ∀ᶠ x in ae μ, P x :=
  Iff.rfl
```