# 环

类型 `R` 上的环结构为 `Ring R`；乘法假设交换时为 `CommRing R`。`ring` 策略可证交换环公理推出的等式：

```lean
example {R : Type*} [CommRing R] (x y : R) : (x + y) ^ 2 = x ^ 2 + y ^ 2 + 2 * x * y := by ring
```

更弱的变体不要求加法成群，仅加法幺半群，对应 `Semiring R` 与 `CommSemiring R`。自然数是 `CommSemiring` 的重要实例，取值于自然数的函数亦然；环的理想（下文）也是。`ring` 策略名易误导：它假设交换性，但对半环也适用，即对任意 `CommSemiring`：

```lean
example (x y : ℕ) : (x + y) ^ 2 = x ^ 2 + y ^ 2 + 2 * x * y := by ring
```

亦有不要求乘法单位或结合性的环/半环类；本节不讨论。

有些传统环论概念实际关于底层乘法幺半群。**单位**（units）：每个（乘法）幺半群 `M` 有谓词 `IsUnit : M → Prop`、单位类型 `Units M`（记号 `Mˣ`）及到 `M` 的强制。`Units M` 捆绑可逆元与其逆及互逆性质；主要影响可计算函数。多数情况可用 `IsUnit.unit` 构造单位。交换情形还有 `Units.mkOfMulEqOne`：

```lean
example (x : ℤˣ) : x = 1 ∨ x = -1 := Int.units_eq_one_or x

example {M : Type*} [Monoid M] (x : Mˣ) : (x : M) * x⁻¹ = 1 := Units.mul_inv x

example {M : Type*} [Monoid M] : Group Mˣ := inferInstance
```

两（半）环 `R`、`S` 间环态射为 `RingHom R S`，记号 `R →+* S`：

```lean
example {R S : Type*} [Ring R] [Ring S] (f : R →+* S) (x y : R) :
    f (x + y) = f x + f y := f.map_add x y

example {R S : Type*} [Ring R] [Ring S] (f : R →+* S) : Rˣ →* Sˣ :=
  Units.map f
```

同构变体为 `RingEquiv`，记号 `≃+*`。

与子幺半群、子群类似，有 `Subring R`；但不如子群有用，因不能对子环作商：

```lean
example {R : Type*} [Ring R] (S : Subring R) : Ring S := inferInstance
```

`RingHom.range` 产生子环。

## 理想与商

历史原因，Mathlib 理想理论仅针对交换环（库原为快速推进现代代数几何基础而发展）。本节在交换（半）环上工作。理想 `I : Ideal R` 定义为 `R` 作为 `R`-模的子模；模在后续线代章详述，此实现细节大多可忽略，相关引理多在理想语境重述。匿名投影记号有时不按预期工作：不能将 `Ideal.Quotient.mk I` 写成 `I.Quotient.mk`，因会解析为 `(Ideal.Quotient I).mk`，而 `Ideal.Quotient` 单独不存在：

```lean
example {R : Type*} [CommRing R] (I : Ideal R) : R →+* R ⧸ I :=
  Ideal.Quotient.mk I

example {R : Type*} [CommRing R] {a : R} {I : Ideal R} :
    Ideal.Quotient.mk I a = 0 ↔ a ∈ I :=
  Ideal.Quotient.eq_zero_iff_mem
```

商环泛性质为 `Ideal.Quotient.lift`：

```lean
example {R S : Type*} [CommRing R] [CommRing S] (I : Ideal R) (f : R →+* S)
    (H : I ≤ RingHom.ker f) : R ⧸ I →+* S :=
  Ideal.Quotient.lift I f H
```

特别地有环的 **第一同构定理**：

```lean
example {R S : Type*} [CommRing R] [CommRing S](f : R →+* S) :
    R ⧸ RingHom.ker f ≃+* f.range :=
  RingHom.quotientKerEquivRange f
```

理想对包含构成完备格，亦有半环结构，二者配合良好：

```lean
variable {R : Type*} [CommRing R] {I J : Ideal R}

example : I + J = I ⊔ J := rfl

example {x : R} : x ∈ I + J ↔ ∃ a ∈ I, ∃ b ∈ J, a + b = x := by
  simp [Submodule.mem_sup]

example : I * J ≤ J := Ideal.mul_le_left
example : I * J ≤ I := Ideal.mul_le_right
example : I * J ≤ I ⊓ J := Ideal.mul_le_inf
```

用 `Ideal.map` 前推、`Ideal.comap` 拉回理想；后者无存在量词，更便于陈述商环间态射条件：

```lean
example {R S : Type*} [CommRing R] [CommRing S] (I : Ideal R) (J : Ideal S) (f : R →+* S)
    (H : I ≤ Ideal.comap f J) : R ⧸ I →+* S ⧸ J :=
  Ideal.quotientMap J f H
```

`R ⧸ I` 真依赖 `I`；`I = J` 不足以使商类型定义相等，泛性质给出同构：

```lean
example {R : Type*} [CommRing R] {I J : Ideal R} (h : I = J) : R ⧸ I ≃+* R ⧸ J :=
  Ideal.quotEquivOfEq h
```

**中国剩余定理**（Chinese remainder theorem）示例。注意指标下确界 `⨅` 与类型大积 `Π` 在字体上易混淆：

```lean
example {R : Type*} [CommRing R] {ι : Type*} [Fintype ι] (f : ι → Ideal R)
    (hf : ∀ i j, i ≠ j → IsCoprime (f i) (f j)) : (R ⧸ ⨅ i, f i) ≃+* Π i, R ⧸ f i :=
  Ideal.quotientInfRingEquivPiQuotient f hf
```

关于 `ZMod` 的初等版本易由此推出：

```lean
open BigOperators PiNotation

example {ι : Type*} [Fintype ι] (a : ι → ℕ) (coprime : ∀ i j, i ≠ j → (a i).Coprime (a j)) :
    ZMod (∏ i, a i) ≃+* Π i, ZMod (a i) :=
  ZMod.prodEquivPi a coprime
```

练习：在一般情形重证中国剩余定理。先用商环泛性质定义定理中的映射：

```lean
section
variable {ι R : Type*} [CommRing R]
open Ideal Quotient Function

def chineseMap (I : ι → Ideal R) : (R ⧸ ⨅ i, I i) →+* Π i, R ⧸ I i :=
  sorry

lemma chineseMap_mk (I : ι → Ideal R) (x : R) :
    chineseMap I (Quotient.mk _ x) = fun i : ι ↦ Ideal.Quotient.mk (I i) x :=
  sorry

lemma chineseMap_mk' (I : ι → Ideal R) (x : R) (i : ι) :
    chineseMap I (mk _ x) i = mk (I i) x :=
  sorry

lemma chineseMap_inj (I : ι → Ideal R) : Injective (chineseMap I) := by sorry
```

**互素**（coprime，亦称 co-maximal）的多种刻画：

```lean
#check IsCoprime
#check isCoprime_iff_add
#check isCoprime_iff_exists
#check isCoprime_iff_sup_eq
#check isCoprime_iff_codisjoint
```

用 `Finset` 归纳证明：

```lean
theorem isCoprime_Inf {I : Ideal R} {J : ι → Ideal R} {s : Finset ι}
    (hf : ∀ j ∈ s, IsCoprime I (J j)) : IsCoprime I (⨅ j ∈ s, J j) := by
  sorry
```

证 `chineseMap` 的满射性即定理核心（练习，解答较长）：

```lean
lemma chineseMap_surj [Fintype ι] {I : ι → Ideal R}
    (hI : ∀ i j, i ≠ j → IsCoprime (I i) (I j)) : Surjective (chineseMap I) := by
  sorry

noncomputable def chineseIso [Fintype ι] (f : ι → Ideal R)
    (hf : ∀ i j, i ≠ j → IsCoprime (f i) (f j)) : (R ⧸ ⨅ i, f i) ≃+* Π i, R ⧸ f i :=
  { Equiv.ofBijective _ ⟨chineseMap_inj f, chineseMap_surj hf⟩,
    chineseMap f with }

end
```

## 代数与多项式

交换（半）环 `R` 上的 **代数**（algebra over `R`）是配备从 `R` 到 `A` 的环态射的半环 `A`，其像在 `A` 中与每个元素交换。编码为类型类 `Algebra R A`；结构映射记 `algebraMap R A : R →+* A`。`r • a` 表示用 `algebraMap R A r` 标量乘 `a`（有时称 **结合幺半群代数**）。

`algebraMap` 为环态射，打包标量乘法的许多性质：

```lean
example {R A : Type*} [CommRing R] [Ring A] [Algebra R A] (r r' : R) (a : A) :
    (r + r') • a = r • a + r' • a :=
  add_smul r r' a

example {R A : Type*} [CommRing R] [Ring A] [Algebra R A] (r r' : R) (a : A) :
    (r * r') • a = r • r' • a :=
  mul_smul r r' a
```

两 `R`-代数 `A`、`B` 之间的态射为与 `R` 标量乘交换的环态射，类型 `AlgHom R A B`，记号 `A →ₐ[R] B`。

重要非交换代数例子（线代章讨论）包括自同态代数与矩阵代数。本节讨论重要交换代数例子：**多项式代数**。

系数在 `R` 的一元多项式代数为 `Polynomial R`，`open Polynomial` 后可写 `R[X]`。结构映射记 `C`（常数），不定元记 `X`：

```lean
open Polynomial

example {R : Type*} [CommRing R] : R[X] := X

example {R : Type*} [CommRing R] (r : R) := X - C r
```

第一例须给出期望类型；第二例中 `C r` 使目标代数可推断。`C` 为环态射，可用 `map_zero`、`map_one`、`map_mul`、`map_pow` 等：

```lean
example {R : Type*} [CommRing R] (r : R) : (X + C r) * (X - C r) = X ^ 2 - C (r ^ 2) := by
  rw [C.map_pow]
  ring
```

系数用 `Polynomial.coeff`：

```lean
example {R : Type*} [CommRing R] (r:R) : (C r).coeff 0 = r := by simp

example {R : Type*} [CommRing R] : (X ^ 2 + 2 * X + C 3 : R[X]).coeff 1 = 2 := by simp
```

**次数**（degree）因零多项式而棘手。`Polynomial.natDegree` 将零多项式次数定为 0；`Polynomial.degree` 取值于 `WithBot ℕ`（可视作 ℕ ∪ {⊥}，⊥ 表示 −∞），为零多项式次数，对加法近乎吸收。道德上 `degree` 更正确，例如乘积次数公式（基环无零因子时）：

```lean
example {R : Type*} [Semiring R] [NoZeroDivisors R] {p q : R[X]} :
    degree (p * q) = degree p + degree q :=
  Polynomial.degree_mul
```

`natDegree` 版需假设非零多项式：

```lean
example {R : Type*} [Semiring R] [NoZeroDivisors R] {p q : R[X]} (hp : p ≠ 0) (hq : q ≠ 0) :
    natDegree (p * q) = natDegree p + natDegree q :=
  Polynomial.natDegree_mul hp hq
```

Mathlib 提供两者及转换引理；计算复合次数时 `natDegree` 更方便。复合为 `Polynomial.comp`：

```lean
example {R : Type*} [Semiring R] [NoZeroDivisors R] {p q : R[X]} :
    natDegree (comp p q) = natDegree p * natDegree q :=
  Polynomial.natDegree_comp
```

`Polynomial.eval` 在 `R` 上求值：

```lean
example {R : Type*} [CommRing R] (P: R[X]) (x : R) := P.eval x

example {R : Type*} [CommRing R] (r : R) : (X - C r).eval r = 0 := by simp
```

`IsRoot` 谓词表示多项式在 `r` 处为零：

```lean
example {R : Type*} [CommRing R] (P : R[X]) (r : R) : IsRoot P r ↔ P.eval r = 0 := Iff.rfl
```

在基环无零因子时，根数（计重数）不超过次数；零多项式仍麻烦。`Polynomial.roots` 将多项式映到 **多重集**（multiset）：零多项式为空集，否则为带重数的根集；仅当基环为 **整域**（domain）时定义，否则性质不佳：

```lean
example {R : Type*} [CommRing R] [IsDomain R] (r : R) : (X - C r).roots = {r} :=
  roots_X_sub_C r

example {R : Type*} [CommRing R] [IsDomain R] (r : R) (n : ℕ):
    ((X - C r) ^ n).roots = n • {r} :=
  by simp
```

`eval` 与 `roots` 仅考虑系数环，不能说 `X^2 - 2 : ℚ[X]` 在 `ℝ` 有根或 `X^2 + 1 : ℝ[X]` 在 `ℂ` 有根。对此用 `Polynomial.aeval`：给定半环 `A` 与 `Algebra R A`，`aeval` 将 `a : A` 映为将 `X` 在 `a` 处求值的 `R[X] → A` 代数态射。`aeval` 不以多项式为参数，不能用 `P.eval` 那样的点记号：

```lean
example : aeval Complex.I (X ^ 2 + 1 : ℝ[X]) = 0 := by simp
```

对应 `roots` 的函数为 `aroots`：

```lean
open Complex Polynomial

example : aroots (X ^ 2 + 1 : ℝ[X]) ℂ = {Complex.I, -I} := by
  suffices roots (X ^ 2 + 1 : ℂ[X]) = {I, -I} by simpa [aroots_def]
  have factored : (X ^ 2 + 1 : ℂ[X]) = (X - C I) * (X - C (-I)) := by
    have key : (C I * C I : ℂ[X]) = -1 := by simp [← C_mul]
    rw [C_neg]
    linear_combination key
  have p_ne_zero : (X - C I) * (X - C (-I)) ≠ 0 := by
    intro H
    apply_fun eval 0 at H
    simp [eval] at H
  simp only [factored, roots_mul p_ne_zero, roots_X_sub_C]
  rfl

example : IsAlgClosed ℂ := inferInstance
```

环态射 `f : R →+* S` 可用 `Polynomial.eval₂` 在 `S` 中一点求值 `P : R[X]`，得到 `R[X] → S` 的函数，可用点记号：

```lean
#check (Complex.ofRealHom : ℝ →+* ℂ)

example : (X ^ 2 + 1 : ℝ[X]).eval₂ Complex.ofRealHom Complex.I = 0 := by simp
```

多元多项式简述：交换半环 `R` 上、指标类型 `σ` 的多项式代数为 `MVPolynomial σ R`；`MvPolynomial.X i`（`open MvPolynomial` 后可写 `X i`）。两变元可用 `Fin 2`，单位圆方程：

```lean
open MvPolynomial

def circleEquation : MvPolynomial (Fin 2) ℝ := X 0 ^ 2 + X 1 ^ 2 - 1
```

函数应用优先级很高，上式读作 `(X 0)^2 + (X 1)^2 - 1`。验证点 (1, 0) 在圆上；`![...]` 表示 `Fin n → X`：

```lean
example : MvPolynomial.eval ![1, 0] circleEquation = 0 := by simp [circleEquation]
```