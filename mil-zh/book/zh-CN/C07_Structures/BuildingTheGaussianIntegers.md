# 构造高斯整数

本节用 Lean 的代数层次说明如何构造重要数学对象——**高斯整数**（Gaussian integers），并证明其为 **欧几里得整环**（Euclidean domain）。按前文术语：定义高斯整数，并证明其为欧几里得整环结构的一个实例。

通常数学中，高斯整数集 ℤ[i] 为复数 {a + bi | a, b ∈ ℤ}。此处不将其定义为复数子集，而作为独立数据类型：用整数对表示，分别视为 **实部** 与 **虚部**：

```lean
@[ext]
structure GaussInt where
  re : ℤ
  im : ℤ
```

先证高斯整数构成环：`0` 为 `⟨0, 0⟩`，`1` 为 `⟨1, 0⟩`，加法逐分量定义。乘法须使元素 i（`⟨0, 1⟩`）为 −1 的平方根，故

(a + bi)(c + di) = ac + bci + adi + bd i² = (ac − bd) + (bc + ad)i。

这解释了下文 `Mul` 的定义：

```lean
namespace GaussInt

instance : Zero GaussInt :=
  ⟨⟨0, 0⟩⟩

instance : One GaussInt :=
  ⟨⟨1, 0⟩⟩

instance : Add GaussInt :=
  ⟨fun x y ↦ ⟨x.re + y.re, x.im + y.im⟩⟩

instance : Neg GaussInt :=
  ⟨fun x ↦ ⟨-x.re, -x.im⟩⟩

instance : Mul GaussInt :=
  ⟨fun x y ↦ ⟨x.re * y.re - x.im * y.im, x.re * y.im + x.im * y.re⟩⟩
```

如[定义结构体](Structures.md)所述，宜将与数据类型相关的定义放在同名命名空间。此处直接定义 `0`、`1`、`+`、`-`、`*` 的解释，而非命名 `GaussInt.zero` 等再赋记号；显式名称常便于 `simp` 与 `rw`：

```lean
theorem zero_def : (0 : GaussInt) = ⟨0, 0⟩ :=
  rfl

theorem one_def : (1 : GaussInt) = ⟨1, 0⟩ :=
  rfl

theorem add_def (x y : GaussInt) : x + y = ⟨x.re + y.re, x.im + y.im⟩ :=
  rfl

theorem neg_def (x : GaussInt) : -x = ⟨-x.re, -x.im⟩ :=
  rfl

theorem mul_def (x y : GaussInt) :
    x * y = ⟨x.re * y.re - x.im * y.im, x.re * y.im + x.im * y.re⟩ :=
  rfl
```

为实部、虚部计算规则命名并交给化简器：

```lean
@[simp]
theorem zero_re : (0 : GaussInt).re = 0 :=
  rfl

@[simp]
theorem zero_im : (0 : GaussInt).im = 0 :=
  rfl

@[simp]
theorem one_re : (1 : GaussInt).re = 1 :=
  rfl

@[simp]
theorem one_im : (1 : GaussInt).im = 0 :=
  rfl

@[simp]
theorem add_re (x y : GaussInt) : (x + y).re = x.re + y.re :=
  rfl

@[simp]
theorem add_im (x y : GaussInt) : (x + y).im = x.im + y.im :=
  rfl

@[simp]
theorem neg_re (x : GaussInt) : (-x).re = -x.re :=
  rfl

@[simp]
theorem neg_im (x : GaussInt) : (-x).im = -x.im :=
  rfl

@[simp]
theorem mul_re (x y : GaussInt) : (x * y).re = x.re * y.re - x.im * y.im :=
  rfl

@[simp]
theorem mul_im (x y : GaussInt) : (x * y).im = x.re * y.im + x.im * y.re :=
  rfl
```

令人惊讶的是，证高斯整数为 **交换环**（commutative ring）实例相当容易：每个具体高斯整数是 `GaussInt` 结构实例，类型 `GaussInt` 连同运算则是 `CommRing` 实例；`CommRing` 又扩展记号结构 `Zero`、`One`、`Add`、`Neg`、`Mul`。

在 VS Code 中写 `instance : CommRing GaussInt := _` 并让 Lean 填充骨架会看到大量条目；跳转定义可见许多字段有 Lean 自动填充的默认定义。本质字段如下。`nsmul` 与 `zsmul` 暂可忽略，下一章解释。各恒等式通过展开定义、`ext` 化为实虚部、`simp`，必要时在整数上做环计算：

```lean
instance instCommRing : CommRing GaussInt where
  zero := 0
  one := 1
  add := (· + ·)
  neg x := -x
  mul := (· * ·)
  nsmul := nsmulRec
  zsmul := zsmulRec
  add_assoc := by
    intros
    ext <;> simp <;> ring
  zero_add := by
    intro
    ext <;> simp
  add_zero := by
    intro
    ext <;> simp
  neg_add_cancel := by
    intro
    ext <;> simp
  add_comm := by
    intros
    ext <;> simp <;> ring
  mul_assoc := by
    intros
    ext <;> simp <;> ring
  one_mul := by
    intro
    ext <;> simp
  mul_one := by
    intro
    ext <;> simp
  left_distrib := by
    intros
    ext <;> simp <;> ring
  right_distrib := by
    intros
    ext <;> simp <;> ring
  mul_comm := by
    intros
    ext <;> simp <;> ring
  zero_mul := by
    intros
    ext <;> simp
  mul_zero := by
    intros
    ext <;> simp
```

Lean 库将 **非平凡**（nontrivial）类型定义为至少有两个不同元素的类型；在环语境下等价于 0 ≠ 1。若干常见定理依赖此事实，现建立之：

```lean
instance : Nontrivial GaussInt := by
  use 0, 1
  rw [Ne, GaussInt.ext_iff]
  simp
```

## 欧几里得整环

现证高斯整数有重要附加性质。**欧几里得整环** 是配备 **范数**（norm）函数 N : R → ℕ 的环 R，满足：

- 对每个 a 与 b ≠ 0，存在 q、r 使 a = bq + r，且 r = 0 或 N(r) < N(b)。
- 对每个 a 与 b ≠ 0，N(a) ≤ N(ab)。

整数环 ℤ 以 N(a) = |a| 为典范例：q 为 a 除以 b 的整数商，r 为余数。Lean 中 a、b 为整数时，`a / b` 为整数除法，`a % b` 为余数，满足：

```lean
example (a b : ℤ) : a = b * (a / b) + a % b :=
  Eq.symm (Int.mul_ediv_add_emod a b)

example (a b : ℤ) : b ≠ 0 → 0 ≤ a % b :=
  Int.emod_nonneg a

example (a b : ℤ) : b ≠ 0 → a % b < |b| :=
  Int.emod_lt_abs a
```

环中 a 为 **单位**（unit）若 a 整除 1。非零 a **不可约**（irreducible）若不能写成 a = bc 且 b、c 均非单位。在整数中每个不可约元为 **素元**（prime）：a 整除 bc 则整除 b 或 c；其他环可失败。在 ℤ[√−5] 中有 6 = 2·3 = (1+√−5)(1−√−5)，2、3、1+√−5、1−√−5 均不可约但非素，故无唯一分解。

每个欧几里得整环是 **唯一分解整环**（unique factorization domain），故不可约即素。欧几里得公理保证非零元可写成不可约元有限积，可用欧几里得算法求两非零元 a、b 的 **最大公因子**（greatest common divisor），从而分解在乘以单位意义下唯一。

现证高斯整数为欧几里得整环，范数 N(a + bi) = (a + bi)(a − bi) = a² + b²。a − bi 称为 a + bi 的 **共轭**（conjugate）。不难验证对复数 x、y 有 N(xy) = N(x)N(y)。

要证此范数使高斯整数为欧几里得域，只需第一性质较难。欲写 a + bi = (c + di)q + r，将 a + bi、c + di 视为复数做除法

(a + bi)/(c + di) = ((a + bi)(c − di))/((c + di)(c − di)) = (ac + bd)/(c² + d²) + (bc − ad)/(c² + d²) i。

实虚部可能非整数，可四舍五入到最近整数 u、v，将右边写为 (u + vi) + (u′ + v′i)，其中 |u′| ≤ 1/2、|v′| ≤ 1/2，故 N(u′ + v′i) ≤ 1/2。两边乘 c + di 得 a + bi = (c + di)(u + vi) + (c + di)(u′ + v′i)。令 q = u + vi、r = (c + di)(u′ + v′i)，则 N(r) = N(c + di)N(u′ + v′i) < N(c + di)。

该论证将高斯整数视为复数子集；形式化可嵌入复数、嵌入整数等（Mathlib 在 [GaussianInt.lean](https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/NumberTheory/Zsqrtd/GaussianInt.lean) 中作为 **二次整数** 环的特例构造）。

此处改用停留在整数内的论证，说明形式化时常面临的选择：论证需库中尚无的概念与工具时，可形式化所需内容，或改写论证以利用已有内容。前者在可复用时通常值得投资；务实而言有时更初等的证明更高效。

整数通常的商余定理：对每个 a 与非零 b，存在 q、r 使 a = bq + r 且 0 ≤ r < |b|。下面用变体：存在 q′、r′ 使 a = bq′ + r′ 且 |r′| ≤ |b|/2。若第一式中 r ≤ |b|/2 可取 q′ = q、r′ = r，否则（b 为正时）取 q′ = q + 1、r′ = r − b。感谢 Heather Macbeth 建议下列更优雅做法，避免分情形定义：在除法前将 a 加上 b/2，再从余数中减去 b/2：

```lean
namespace Int

def div' (a b : ℤ) :=
  (a + b / 2) / b

def mod' (a b : ℤ) :=
  (a + b / 2) % b - b / 2

theorem div'_add_mod' (a b : ℤ) : b * div' a b + mod' a b = a := by
  rw [div', mod']
  linarith [Int.mul_ediv_add_emod (a + b / 2) b]

theorem abs_mod'_le (a b : ℤ) (h : 0 < b) : |mod' a b| ≤ b / 2 := by
  rw [mod', abs_le]
  constructor
  · linarith [Int.emod_nonneg (a + b / 2) h.ne']
  have := Int.emod_lt_of_pos (a + b / 2) h
  have := Int.mul_ediv_add_emod b 2
  have := Int.emod_lt_of_pos b zero_lt_two
  linarith

theorem mod'_eq (a b : ℤ) : mod' a b = a - b * div' a b := by linarith [div'_add_mod' a b]

end Int
```

练习：在任意 **有序环**（ordered ring）中证 x² + y² = 0 当且仅当 x = y = 0：

```lean
theorem sq_add_sq_eq_zero {α : Type*} [Ring α] [LinearOrder α] [IsStrictOrderedRing α]
    (x y : α) : x ^ 2 + y ^ 2 = 0 ↔ x = 0 ∧ y = 0 := by
  sorry
```

其余定义与定理放在 `GaussInt` 命名空间。先定义 `norm` 并建立其性质：

```lean
def norm (x : GaussInt) :=
  x.re ^ 2 + x.im ^ 2

@[simp]
theorem norm_nonneg (x : GaussInt) : 0 ≤ norm x := by
  sorry

theorem norm_eq_zero (x : GaussInt) : norm x = 0 ↔ x = 0 := by
  sorry

theorem norm_pos (x : GaussInt) : 0 < norm x ↔ x ≠ 0 := by
  sorry

theorem norm_mul (x y : GaussInt) : norm (x * y) = norm x * norm y := by
  sorry
```

定义共轭：

```lean
def conj (x : GaussInt) : GaussInt :=
  ⟨x.re, -x.im⟩

@[simp]
theorem conj_re (x : GaussInt) : (conj x).re = x.re :=
  rfl

@[simp]
theorem conj_im (x : GaussInt) : (conj x).im = -x.im :=
  rfl

theorem norm_conj (x : GaussInt) : norm (conj x) = norm x := by simp [norm]
```

定义高斯整数除法 `x / y`，将复商四舍五入到最近高斯整数，用定制的 `Int.div'`。若 x 为 a + bi、y 为 c + di，则 `x / y` 的实虚部为下列式子的最近整数：

(ac + bd)/(c² + d²) 与 (bc − ad)/(c² + d²)。

分子为 (a + bi)(c − di) 的实虚部，分母均为 c + di 的范数：

```lean
instance : Div GaussInt :=
  ⟨fun x y ↦ ⟨Int.div' (x * conj y).re (norm y), Int.div' (x * conj y).im (norm y)⟩⟩
```

定义 `x % y` 为余数 `x - (x / y) * y`，在 `div_def`、`mod_def` 中记录定义以便 `simp`/`rw`：

```lean
instance : Mod GaussInt :=
  ⟨fun x y ↦ x - y * (x / y)⟩

theorem div_def (x y : GaussInt) :
    x / y = ⟨Int.div' (x * conj y).re (norm y), Int.div' (x * conj y).im (norm y)⟩ :=
  rfl

theorem mod_def (x y : GaussInt) : x % y = x - y * (x / y) :=
  rfl
```

于是对每个 x、y 有 x = y * (x / y) + x % y；只需在 y ≠ 0 时证 `norm (x % y) < norm y`。

`x / y` 的实虚部为 `div' (x * conj y).re (norm y)` 与 `div' (x * conj y).im (norm y)`。计算得

(x % y) * conj y = (x - x / y * y) * conj y = x * conj y - x / y * (y * conj y)

右边实虚部恰为 `mod' (x * conj y).re (norm y)` 与 `mod' (x * conj y).im (norm y)`；由 `div'`、`mod'` 性质，它们 ≤ norm y / 2，故 norm((x % y) * conj y) ≤ (norm y / 2)² + (norm y / 2)² ≤ (norm y / 2) * norm y。另一方面 norm((x % y) * conj y) = norm(x % y) * norm(conj y) = norm(x % y) * norm y。两边除以 norm y 得 norm(x % y) ≤ norm y / 2 < norm y。

下一证明实现该计算；鼓励单步执行并寻找更简洁论证：

```lean
theorem norm_mod_lt (x : GaussInt) {y : GaussInt} (hy : y ≠ 0) :
    (x % y).norm < y.norm := by
  have norm_y_pos : 0 < norm y := by rwa [norm_pos]
  have H1 : x % y * conj y = ⟨Int.mod' (x * conj y).re (norm y), Int.mod' (x * conj y).im (norm y)⟩
  · ext <;> simp [Int.mod'_eq, mod_def, div_def, norm] <;> ring
  have H2 : norm (x % y) * norm y ≤ norm y / 2 * norm y
  · calc
      norm (x % y) * norm y = norm (x % y * conj y) := by simp only [norm_mul, norm_conj]
      _ = |Int.mod' (x.re * y.re + x.im * y.im) (norm y)| ^ 2
          + |Int.mod' (-(x.re * y.im) + x.im * y.re) (norm y)| ^ 2 := by simp [H1, norm, sq_abs]
      _ ≤ (y.norm / 2) ^ 2 + (y.norm / 2) ^ 2 := by gcongr <;> apply Int.abs_mod'_le _ _ norm_y_pos
      _ = norm y / 2 * (norm y / 2 * 2) := by ring
      _ ≤ norm y / 2 * norm y := by gcongr; apply Int.ediv_mul_le; norm_num
  calc norm (x % y) ≤ norm y / 2 := le_of_mul_le_mul_right H2 norm_y_pos
    _ < norm y := by
        apply Int.ediv_lt_of_lt_mul
        · norm_num
        · linarith
```

范数将高斯整数映到非负整数。欧几里得域需要映到自然数的函数，故将 `norm` 与 `Int.natAbs`（整数映到自然数）复合。下一引理：范数映到自然数再映回整数不变；第二引理重述范数递减：

```lean
theorem coe_natAbs_norm (x : GaussInt) : (x.norm.natAbs : ℤ) = x.norm :=
  Int.natAbs_of_nonneg (norm_nonneg _)

theorem natAbs_norm_mod_lt (x y : GaussInt) (hy : y ≠ 0) :
    (x % y).norm.natAbs < y.norm.natAbs := by
  apply Int.ofNat_lt.1
  simp only [Int.natCast_natAbs, abs_of_nonneg, norm_nonneg]
  exact norm_mod_lt x hy
```

还需欧几里得域范数的第二关键性质：

```lean
theorem not_norm_mul_left_lt_norm (x : GaussInt) {y : GaussInt} (hy : y ≠ 0) :
    ¬(norm (x * y)).natAbs < (norm x).natAbs := by
  apply not_lt_of_ge
  rw [norm_mul, Int.natAbs_mul]
  apply le_mul_of_one_le_right (Nat.zero_le _)
  apply Int.ofNat_le.1
  rw [coe_natAbs_norm]
  exact Int.add_one_le_of_lt ((norm_pos _).mpr hy)
```

现可综合证明高斯整数为欧几里得整环实例，使用已定义的商与余数。Mathlib 的欧几里得整环定义比上文更一般：允许关于任意 **良基**（well-founded）测度证余数递减；自然数范数比较是其一例，所需性质即 `natAbs_norm_mod_lt` 与 `not_norm_mul_left_lt_norm`：

```lean
instance : EuclideanDomain GaussInt :=
  { GaussInt.instCommRing with
    quotient := (· / ·)
    remainder := (· % ·)
    quotient_mul_add_remainder_eq :=
      fun x y ↦ by rw [mod_def, add_comm] ; ring
    quotient_zero := fun x ↦ by
      simp [div_def, norm, Int.div']
      rfl
    r := (measure (Int.natAbs ∘ norm)).1
    r_wellFounded := (measure (Int.natAbs ∘ norm)).2
    remainder_lt := natAbs_norm_mod_lt
    mul_left_not_lt := not_norm_mul_left_lt_norm }
```

直接收益：在高斯整数中 **素** 与 **不可约** 概念一致：

```lean
example (x : GaussInt) : Irreducible x ↔ Prime x :=
  irreducible_iff_prime
```