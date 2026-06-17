# 第 14 章 有理数与实数

> 已对照英文原版 PDF 与 `LoVe14_RationalAndRealNumbers_Demo.lean` 人工翻译校对（Lean-zh 中文版 PDF 尚未发布，发布后可用 `node scripts/extract-from-pdf.mjs` 重新对齐）。

在前面的章节中，我们已经看到自然数 `ℕ` 可以定义为归纳类型，以及整数 `ℤ` 可以定义为 `ℕ × ℕ` 上的商。在本章中，我们回顾有理数 `ℚ` 与实数 `ℝ` 的构造。这些构造所用的工具包括归纳类型、子类型与商。

下列步骤可用于构造具有特定性质的类型：

1. 创建一个新的类型，足够大以表示所有元素，但不一定以唯一的方式表示。
2. 对这个表示取商，按需等同那些应当相等的元素。
3. 通过在基类型上的函数**提升**（lift）来定义商类型上的运算符，并证明它们与商关系相容。

我们在[第 12.5.1 节](ch12_LogicalFoundations.md)中用这一方法构造了类型 `ℤ`。同样的方法也可用于 `ℚ` 和 `ℝ`。

## 14.1 有理数

有理数是可以表示为整数 `n` 和 `d`（其中 `d ≠ 0`）之比 `n/d` 的数：

```lean
structure Fraction where
  num            : ℤ
  denom          : ℤ
  denom_Neq_zero : denom ≠ 0
```

数 `n` 称为**分子**（numerator），数 `d` 称为**分母**（denominator）。将有理数表示为分数的方式并不唯一。例如，有理数 `1/2`、`2/4` 和 `-1/-2` 都相等。这种分数表示将作为我们取商的**基类型**（base type）。

两个分数 `n₁/d₁` 和 `n₂/d₂` 表示同一个有理数，当且仅当分子与分母之间的比例相同：`n₁ * d₂ = n₂ * d₁`。要在类型 `Fraction` 上按这一关系构造商，我们需要证明该关系是等价关系。这可以通过将 `Fraction` 声明为 `Setoid` 类型类的实例来实现：

```lean
namespace Fraction

instance Setoid : Setoid Fraction :=
  { r :=
      fun a b : Fraction ↦ num a * denom b = num b * denom a
    iseqv :=
      { refl  := by aesop
        symm  := by aesop
        trans :=
          by
            intro a b c heq_ab heq_bc
            apply Int.eq_of_mul_eq_mul_right (denom_Neq_zero b)
            calc
              num a * denom c * denom b
              = num a * denom b * denom c :=
                by ac_rfl
              _ = num b * denom a * denom c :=
                by rw [heq_ab]
              _ = num b * denom c * denom a :=
                by ac_rfl
              _ = num c * denom b * denom a :=
                by rw [heq_bc]
              _ = num c * denom a * denom b :=
                by ac_rfl } }

theorem Setoid_Iff (a b : Fraction) :
    a ≈ b ↔ num a * denom b = num b * denom a :=
  by rfl

end Fraction
```

于是我们可以将有理数类型定义为该**等价关系**上的商：

```lean
def Rat : Type :=
  Quotient Fraction.Setoid
```

要定义零、一、加法、乘法及其他运算，我们首先在 `Fraction` 类型上定义它们。要对两个分数相加，先将它们化为同分母，再相加分子。最简便的同分母就是两个分母的乘积：

```lean
namespace Fraction

instance Add : Add Fraction :=
  { add := fun a b : Fraction ↦
      { num            := num a * denom b + num b * denom a
        denom          := denom a * denom b
        denom_Neq_zero := by simp [denom_Neq_zero] } }
```

我们将这些运算注册为 `Add` 等**句法类型类**（syntactic type class）的实例，以便能在 `Fraction` 上使用 `+` 等便捷记号。类似地，我们将零定义为 `0 := 0/1`，一定义为 `1 := 1/1`，乘法定义为分子与分母的逐对相乘。

要将这些运算**提升**到有理数类型 `Rat`，我们必须证明它们与 `≈` 相容：

```lean
@[simp] theorem add_num (a b : Fraction) :
    num (a + b) = num a * denom b + num b * denom a :=
  by rfl

@[simp] theorem add_denom (a b : Fraction) :
    denom (a + b) = denom a * denom b :=
  by rfl

theorem Setoid_add {a a' b b' : Fraction} (ha : a ≈ a')
      (hb : b ≈ b') :
    a + b ≈ a' + b' :=
  by
    simp [Setoid_Iff, add_denom, add_num] at *
    calc
      (num a * denom b + num b * denom a)
          * (denom a' * denom b')
      = num a * denom a' * denom b * denom b'
        + num b * denom b' * denom a * denom a' :=
        by grind
      _ = num a' * denom a * denom b * denom b'
            + num b' * denom b * denom a * denom a' :=
        by simp [*]
      _ = (num a' * denom b' + num b' * denom a')
            * (denom a * denom b) :=
        by grind

end Fraction
```

然后我们可以用 `Quotient.lift₂` 定义 `Rat` 上的运算，并实例化相关的句法类型类，例如：

```lean
namespace Rat

instance Add : Add Rat :=
  { add := Quotient.lift₂ (fun a b : Fraction ↦ mk (a + b))
      (by
         intro a b a' b' ha hb
         apply Quotient.sound
         exact Fraction.Setoid_add ha hb) }

end Rat
```

由此可以继续证明使 `Rat` 成为 `Field` 实例所需的全部性质。

### 有理数的其他定义方式

在 mathlib 中，有理数采用了另一种定义方式。类型 `Rat` 被定义为 `Fraction` 的子类型，要求分母为正，且分子与分母**互素**（coprime）——即除 `1` 和 `-1` 外没有公因子：

```lean
def Rat.IsCanonical (a : Fraction) : Prop :=
  Fraction.denom a > 0
  ∧ Nat.Coprime (Int.natAbs (Fraction.num a))
      (Int.natAbs (Fraction.denom a))

def Rat : Type :=
  {a : Fraction // Rat.IsCanonical a}
```

这是[第 12.5.3 节](ch12_LogicalFoundations.md)所述一般策略的一个实例。采用这种方法时，不需要商；计算更高效；更多性质在计算意义下成为句法相等式。缺点是，由于需要规范化分数，函数定义会变得更复杂。

## 14.2 实数

有些有理数序列看起来在收敛——序列中的数彼此越来越接近——却并未收敛到某个有理数。例如序列

```
a₀ = 1
a₁ = 1.4
a₂ = 1.41
a₃ = 1.414
a₄ = 1.4142
   ⋮
```

其中 `aₙ` 是满足 `aₙ² < 2` 的、小数点后恰好有 `n` 位数字的最大数。该序列似乎收敛，因为每个 `aₙ` 与序列中**其后各项**的距离至多为 `10⁻ⁿ`，但其极限是 `√2 ∉ ℚ`。从这个意义上说，有理数是不**完备**的，而实数正是它们的**完备化**（completion）。要构造实数，我们需要填补这些「看似收敛却不收敛」的序列所揭示的缺口。

**柯西序列**（Cauchy sequence）刻画了「看似收敛」的序列这一概念。序列 `a₀, a₁, …` 是柯西的，若对任意 `ε > 0`，存在 `N ∈ ℕ`，使得对所有 `m ≥ N`，有 `|a_N - a_m| < ε`。换言之，无论 `ε` 取得多小，我们总能在序列中找到一点，使得此后所有项与该点的偏差都小于 `ε`。

我们将有理数序列形式化为函数 `f : ℕ → ℚ`，并用 `abs` 表示绝对值 `|·|`。这就得到柯西序列的如下 Lean 定义：

```lean
def IsCauchySeq (f : ℕ → ℚ) : Prop :=
  ∀ε > 0, ∃N, ∀m ≥ N, abs (f N - f m) < ε
```

并非每个序列都是柯西序列：

```lean
theorem id_Not_CauchySeq :
    ¬ IsCauchySeq (fun n : ℕ ↦ (n : ℚ)) :=
  by
    rw [IsCauchySeq]
    intro h
    cases h 1 zero_lt_one with
    | intro i hi =>
      have hi_succi :=
        hi (i + 1) (by simp)
      simp at hi_succi
```

我们将柯西序列类型定义为子类型：

```lean
def CauchySeq : Type :=
  {f : ℕ → ℚ // IsCauchySeq f}
```

为方便起见，我们引入一个辅助函数，从 `CauchySeq` 中提取实际的序列：

```lean
def seqOf (f : CauchySeq) : ℕ → ℚ :=
  Subtype.val f
```

构造的基本思想是用柯西序列表示实数。每个柯西序列表示其极限所对应的实数；例如，序列 `aₙ = 1/n` 表示实数 `0`，而序列 `1, 1.4, 1.41, …` 表示实数 `√2`。

两个不同的柯西序列可以表示同一个实数；例如，序列 `aₙ = 1/n` 与常数序列 `bₙ = 0` 都表示 `0`。因此，我们需要对表示同一实数的序列取商。两个序列表示同一实数，当且仅当它们的差收敛到零：

```lean
namespace CauchySeq

instance Setoid : Setoid CauchySeq :=
{ r :=
    fun f g : CauchySeq ↦
      ∀ε > 0, ∃N, ∀m ≥ N, abs (seqOf f m - seqOf g m) < ε
  iseqv :=
    { refl :=
        by
          intro f ε hε
          apply Exists.intro 0
          aesop
      symm :=
        by
          intro f g hfg ε hε
          cases hfg ε hε with
          | intro N hN =>
            apply Exists.intro N
            intro m hm
            rw [abs_sub_comm]
            apply hN m hm
      trans :=
        by
          intro f g h hfg hgh ε hε
          cases hfg (ε / 2) (by linarith) with
          | intro N₁ hN₁ =>
            cases hgh (ε / 2) (by linarith) with
            | intro N₂ hN₂ =>
              apply Exists.intro (max N₁ N₂)
              intro m hm
              calc
                abs (seqOf f m - seqOf h m)
                ≤ abs (seqOf f m - seqOf g m)
                  + abs (seqOf g m - seqOf h m) :=
                  by apply abs_sub_le
              _ < ε / 2 + ε / 2 :=
                add_lt_add (hN₁ m (le_of_max_le_left hm))
                  (hN₂ m (le_of_max_le_right hm))
              _ = ε :=
                by simp } }

theorem Setoid_iff (f g : CauchySeq) :
    f ≈ g ↔
    ∀ε > 0, ∃N, ∀m ≥ N, abs (seqOf f m - seqOf g m) < ε :=
  by rfl

end CauchySeq
```

借助这一 `Setoid` 实例，我们现在可以定义实数：

```lean
def Real : Type :=
  Quotient CauchySeq.Setoid
```

与有理数一样，我们需要定义零、一、加法、乘法及其他运算符。我们先在 `CauchySeq` 上定义它们，再提升到 `Real`。对于常数 `0` 和 `1`，可以简单地定义为常数序列。任意常数序列都是柯西序列：

```lean
namespace CauchySeq

def const (q : ℚ) : CauchySeq :=
  Subtype.mk (fun _ : ℕ ↦ q)
    (by
       rw [IsCauchySeq]
       intro ε hε
       aesop)

end CauchySeq
```

我们可以为 `Real` 声明 `Zero` 和 `One` 句法类型类的实例：

```lean
namespace Real

instance Zero : Zero Real :=
  { zero := ⟦CauchySeq.const 0⟧ }

instance One : One Real :=
  { one := ⟦CauchySeq.const 1⟧ }

end Real
```

定义实数的加法需要多花些功夫。我们在柯西序列上通过逐项相加来定义加法：

```lean
namespace CauchySeq

instance Add : Add CauchySeq :=
  { add := fun f g : CauchySeq ↦
      Subtype.mk (fun n : ℕ ↦ seqOf f n + seqOf g n)
        (by
           intro ε hε
           obtain ⟨N1, hN1⟩ :=
             Subtype.property f (ε / 4) (by linarith)
           obtain ⟨N2, hN2⟩ :=
             Subtype.property g (ε / 4) (by linarith)
           let N := N1 + N2
           use N
           intro m m_geq_N
           have m_geq_N1 : m ≥ N1 :=
             by simp[N] at m_geq_N; linarith
           have m_geq_N2 : m ≥ N2 :=
             by simp[N] at m_geq_N; linarith

           have h_fN_fm : |seqOf f N - seqOf f m| < ε / 2 :=
             by
               have : |seqOf f N1 - seqOf f N| < ε / 4 :=
                 hN1 N (by aesop)
               have : |seqOf f N1 - seqOf f m| < ε / 4 :=
                 hN1 m m_geq_N1
               calc
                 |seqOf f N - seqOf f m|
                 = |(seqOf f N - seqOf f N1) + (seqOf f N1 - seqOf f m)| :=
                   by aesop
               _ ≤ |seqOf f N - seqOf f N1| + |seqOf f N1 - seqOf f m| :=
                   by apply abs_add_le
               _ = |seqOf f N1 - seqOf f N| + |seqOf f N1 - seqOf f m| :=
                   by simp[abs_sub_comm]
               _ < ε / 4  + ε / 4 :=
                   by linarith
               _ = ε / 2 :=
                   by linarith

           have h_gN_gm: |seqOf g N - seqOf g m| < ε / 2 :=
             by
               have : |seqOf g N2 - seqOf g N| < ε / 4 :=
                 hN2 N (by aesop)
               have : |seqOf g N2 - seqOf g m| < ε / 4 :=
                 hN2 m m_geq_N2
               calc
                 |seqOf g N - seqOf g m|
                 = |(seqOf g N - seqOf g N2) + (seqOf g N2 - seqOf g m)| :=
                   by aesop
               _ ≤ |seqOf g N - seqOf g N2| + |seqOf g N2 - seqOf g m| :=
                   by apply abs_add_le
               _ = |seqOf g N2 - seqOf g N| + |seqOf g N2 - seqOf g m| :=
                   by simp [abs_sub_comm]
               _ < ε / 4  + ε / 4 :=
                   by linarith
               _ = ε / 2 :=
                   by linarith

           calc
             |seqOf f N + seqOf g N - (seqOf f m + seqOf g m)|
             = |(seqOf f N - seqOf f m) + (seqOf g N - seqOf g m)| :=
               by rw [add_sub_add_comm]
           _ ≤ |(seqOf f N - seqOf f m)| + |(seqOf g N - seqOf g m)| :=
               by apply abs_add_le
           _ < ε / 2 + ε / 2 :=
               by linarith
           _ = ε :=
               by linarith) }
```

该定义需要证明：在 `f` 和 `g` 为柯西序列的前提下，逐项相加的结果仍是柯西序列。

接下来，我们需要证明这一加法与 `≈` 相容：

```lean
theorem Setoid_add {f f' g g' : CauchySeq} (hf : f ≈ f')
      (hg : g ≈ g') :
    f + g ≈ f' + g' :=
  by
    intro ε₀ hε₀
    simp
    cases hf (ε₀ / 2) (by linarith) with
    | intro Nf hNf =>
      cases hg (ε₀ / 2) (by linarith) with
      | intro Ng hNg =>
        apply Exists.intro (max Nf Ng)
        intro m hm
        calc
          abs (seqOf (f + g) m - seqOf (f' + g') m)
          = abs ((seqOf f m + seqOf g m)
            - (seqOf f' m + seqOf g' m)) :=
            by rfl
          _ = abs ((seqOf f m - seqOf f' m)
              + (seqOf g m - seqOf g' m)) :=
            by
              have arg_eq :
                seqOf f m + seqOf g m
                  - (seqOf f' m + seqOf g' m) =
                seqOf f m - seqOf f' m
                  + (seqOf g m - seqOf g' m) :=
                by linarith
              rw [arg_eq]
          _ ≤ abs (seqOf f m - seqOf f' m)
              + abs (seqOf g m - seqOf g' m) :=
            by apply abs_add_le
          _ < ε₀ / 2 + ε₀ / 2 :=
            add_lt_add (hNf m (le_of_max_le_left hm))
              (hNg m (le_of_max_le_right hm))
          _ = ε₀ :=
            by simp

end CauchySeq
```

要证明 `f + g ≈ f' + g'`，给定 `ε₀ > 0`，我们必须证明存在数 `N`，使得

```
∀m, m ≥ N → abs (seqOf (f + g) m - seqOf (f' + g') m) < ε₀
```

为得到 `N`，我们利用 `f ≈ f'` 和 `g ≈ g'`。等价关系 `f ≈ f'` 告诉我们：对任意 `ε > 0`，存在 `Nf`，使得对所有 `m ≥ Nf`，有 `abs (seqOf f m - seqOf f' m) < ε`。`g ≈ g'` 给出具有类似性质的 `Ng`。为使最终计算成立，我们取 `ε := ε₀ / 2` 时的 `Nf` 和 `Ng`，然后令 `N` 为 `Nf` 与 `Ng` 的最大值，从而对任意 `m ≥ N` 得到所需不等式。证明末尾的 `calc` 块确立了：对所有 `m ≥ N`，

```
abs (seqOf (f + g) m - seqOf (f' + g') m) < ε₀
```

在证明了柯西序列上的加法与 `≈` 相容之后，我们可以在 `Real` 上定义加法：

```lean
namespace Real

instance Add : Add Real :=
{ add := Quotient.lift₂ (fun a b : CauchySeq ↦ ⟦a + b⟧)
    (by
       intro a b a' b' ha hb
       apply Quotient.sound
       exact CauchySeq.Setoid_add ha hb) }

end Real
```

我们可以继续对乘法及其他运算符做类似处理。总之，实数被定义为柯西序列上的商，而柯西序列又定义为 `ℕ → ℚ` 的子类型。

### 实数的其他定义方式

在 mathlib 中，实数的构造本质上如上所述。某些定义以更一般的形式陈述，以便构造其他代数结构，例如 *p* 进数 [18]。

另一种方法是使用**戴德金分割**（Dedekind cuts）。此时，数 `r : ℝ` 由集合 `{x : ℚ | x < r}` 表示。还有一种不依赖 `ℚ` 的替代方案：用二进制序列 `ℕ → Bool` 定义 `ℝ`，序列元素表示该数的各位数字。若我们只需要实数区间 `[0, 1]`，这种方法尤其合适。

## 14.3 结语

我们已经走到了本指南的终点。你现在掌握了交互式定理证明中的基本理论与技巧，以及一些应用领域。尽管我们使用的是 Lean，你所学的内容应当也能迁移到其他系统，尤其是那些基于简单或依赖类型理论的系统。你也应当能够阅读该领域的大多数科学论文。

即使你并不打算以定理证明为职业，作者仍希望你把证明助手带在身边，在合适的时候使用它们——要么因为它们极高的可信度，要么因为它们在跟踪复杂证明目标时的便利。

如果你继续使用 Lean，自然的下一步是熟悉 mathlib 及其文档。若在课堂之外使用 Lean，你常常会查找定义与定理。`#find` 命令一定会很有用。[^1] 大多数 Lean 用户还会使用 Lean Zulip 聊天室。[^2]

## 14.4 新引入的 Lean 结构总结

| 类别 | 名称 | 说明 |
| --- | --- | --- |
| 诊断命令 | `#find` | 通过模式匹配查找定义或定理 |

[^1]: https://leanprover-community.github.io/mathlib4_docs/Mathlib/Tactic/Find.html
[^2]: https://leanprover.zulipchat.com/