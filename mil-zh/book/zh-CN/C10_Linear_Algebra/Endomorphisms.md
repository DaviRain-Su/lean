# 自同态

线性映射的重要特例是**自同态**（endomorphism）：从向量空间到自身的线性映射。它们构成 `K`-代数，故可在其上求值系数在 `K` 中的多项式，并可讨论特征值（eigenvalue）与特征向量（eigenvector）。

Mathlib 用缩写 `Module.End K V := V →ₗ[K] V`，大量使用时常方便（尤其打开 `Module` 命名空间后）。

```lean
variable {K : Type*} [Field K] {V : Type*} [AddCommGroup V] [Module K V]

variable {W : Type*} [AddCommGroup W] [Module K W]


open Polynomial Module LinearMap End

example (φ ψ : End K V) : φ * ψ = φ ∘ₗ ψ :=
  End.mul_eq_comp φ ψ -- `rfl` 也行

-- 在 `φ` 上求值多项式 `P`
example (P : K[X]) (φ : End K V) : V →ₗ[K] V :=
  aeval φ P

-- 在 `φ` 上求值 `X` 得到 `φ`
example (φ : End K V) : aeval φ (X : K[X]) = φ :=
  aeval_X φ
```

**练习**：关于自同态、子空间与多项式的练习——证明**（二元）核引理**（kernels lemma）：对任意自同态 $\varphi$ 与任意两个互素多项式 $P$、$Q$，有 $\ker P(\varphi) \oplus \ker Q(\varphi) = \ker\big(PQ(\varphi)\big)$。

注意 `IsCoprime x y` 定义为 `∃ a b, a * x + b * y = 1`。

```lean
#check Submodule.eq_bot_iff
#check Submodule.mem_inf
#check LinearMap.mem_ker

example (P Q : K[X]) (h : IsCoprime P Q) (φ : End K V) : ker (aeval φ P) ⊓ ker (aeval φ Q) = ⊥ := by
  sorry

#check Submodule.add_mem_sup
#check map_mul
#check End.mul_apply
#check LinearMap.ker_le_ker_comp

example (P Q : K[X]) (h : IsCoprime P Q) (φ : End K V) :
    ker (aeval φ P) ⊔ ker (aeval φ Q) = ker (aeval φ (P*Q)) := by
  sorry
```

## 特征空间与特征值

转向特征空间与特征值。自同态 $\varphi$ 与标量 $a$ 的**特征空间**（eigenspace）是 $\varphi - a\mathrm{Id}$ 的核。特征空间对所有 `a` 都有定义，但只有非零时才有意思。**特征向量**按定义是特征空间的非零元；对应谓词为 `End.HasEigenvector`。

```lean
example (φ : End K V) (a : K) : φ.eigenspace a = LinearMap.ker (φ - a • 1) :=
  End.eigenspace_def
```

还有谓词 `End.HasEigenvalue` 及对应子类型 `End.Eigenvalues`。

```lean
example (φ : End K V) (a : K) : φ.HasEigenvalue a ↔ φ.eigenspace a ≠ ⊥ :=
  Iff.rfl

example (φ : End K V) (a : K) : φ.HasEigenvalue a ↔ ∃ v, φ.HasEigenvector a v  :=
  ⟨End.HasEigenvalue.exists_hasEigenvector, fun ⟨_, hv⟩ ↦ φ.hasEigenvalue_of_hasEigenvector hv⟩

example (φ : End K V) : φ.Eigenvalues = {a // φ.HasEigenvalue a} :=
  rfl

-- 特征值是极小多项式的根
example (φ : End K V) (a : K) : φ.HasEigenvalue a → (minpoly K φ).IsRoot a :=
  φ.isRoot_of_hasEigenvalue

-- 有限维时逆命题也成立（维数见下一节）
example [FiniteDimensional K V] (φ : End K V) (a : K) :
    φ.HasEigenvalue a ↔ (minpoly K φ).IsRoot a :=
  φ.hasEigenvalue_iff_isRoot

-- Cayley–Hamilton 定理
example [FiniteDimensional K V] (φ : End K V) : aeval φ φ.charpoly = 0 :=
  φ.aeval_self_charpoly
```