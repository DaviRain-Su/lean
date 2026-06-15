# 蕴含与全称量词

考虑 `#check` 之后的陈述：

```lean
#check ∀ x : ℝ, 0 ≤ x → |x| = x
```

用文字说，即「对每个实数 `x`，若 `0 ≤ x`，则 `|x| = x`」。更复杂的例子：

```lean
#check ∀ x y ε : ℝ, 0 < ε → ε ≤ 1 → |x| < ε → |y| < ε → |x * y| < ε
```

即「对每个 `x`、`y`、`ε`，若 `0 < ε ≤ 1`，且 `|x| < ε`、`|y| < ε`，则 `|x * y| < ε`」。在 Lean 中，蕴含链的隐式括号右结合，故上式表示「若 `0 < ε`，则若 `ε ≤ 1`，则若 `|x| < ε` …」，即所有假设共同推出结论。

你已看到：尽管全称量词作用于对象、蕴含箭头引入假设，Lean 对两者的处理非常相似。若已证明该形式的定理，可用同样方式将其应用于对象与假设。以下述定理为例（稍后协助你证明）：

```lean
theorem my_lemma : ∀ x y ε : ℝ, 0 < ε → ε ≤ 1 → |x| < ε → |y| < ε → |x * y| < ε :=
  sorry

section
variable (a b δ : ℝ)
variable (h₀ : 0 < δ) (h₁ : δ ≤ 1)
variable (ha : |a| < δ) (hb : |b| < δ)

#check my_lemma a b δ
#check my_lemma a b δ h₀ h₁
#check my_lemma a b δ h₀ h₁ ha hb

end
```

Lean 中常见用花括号将可自后续假设推断的全称变量标为隐式；此时只需把引理应用于假设，不必提及对象：

```lean
theorem my_lemma2 : ∀ {x y ε : ℝ}, 0 < ε → ε ≤ 1 → |x| < ε → |y| < ε → |x * y| < ε :=
  sorry

section
variable (a b δ : ℝ)
variable (h₀ : 0 < δ) (h₁ : δ ≤ 1)
variable (ha : |a| < δ) (hb : |b| < δ)

#check my_lemma2 h₀ h₁ ha hb

end
```

此时若用 `apply my_lemma` 证明 `|a * b| < δ` 形式的目标，会留下需证明各假设的新目标。

要证明这类陈述，使用 `intro` 策略。看它在本例中的作用：

```lean
theorem my_lemma3 :
    ∀ {x y ε : ℝ}, 0 < ε → ε ≤ 1 → |x| < ε → |y| < ε → |x * y| < ε := by
  intro x y ε epos ele1 xlt ylt
  sorry
```

全称变量可用任意名字，不必是 `x`、`y`、`ε`。注意即使标为隐式，证明时仍须 `intro` 这些变量：隐式只影响**使用**定理时是否写出它们，它们仍是所证陈述的组成部分。`intro` 之后，目标相当于在冒号前列出所有变量与假设时的状态。稍后你会看到为何有时必须在证明开始后才引入变量与假设。

为助你完成引理，先开个头：

```lean
theorem my_lemma4 :
    ∀ {x y ε : ℝ}, 0 < ε → ε ≤ 1 → |x| < ε → |y| < ε → |x * y| < ε := by
  intro x y ε epos ele1 xlt ylt
  calc
    |x * y| = |x| * |y| := by apply abs_mul
    _ ≤ |x| * ε := by apply mul_le_mul; linarith; linarith; apply abs_nonneg; apply abs_nonneg;
    _ < 1 * ε := by apply mul_lt_mul_of_pos_right _ epos; linarith
    _ = ε := by apply one_mul
```

用 `abs_mul`、`mul_le_mul`、`abs_nonneg`、`mul_lt_mul_of_pos_right`、`one_mul` 完成证明。可用 Ctrl-space（Mac 为 Cmd-space）补全查找定理；对双向蕴含可用 `.mp`、`.mpr` 或 `.1`、`.2`。

全称量词常隐藏在定义中，必要时 Lean 会展开定义暴露它们。定义两个谓词 `FnUb f a`、`FnLb f a`：`f` 为 `ℝ → ℝ`，`a` 为实数；前者表示 `a` 是 `f` 的上界，后者表示 `a` 是下界：

```lean
def FnUb (f : ℝ → ℝ) (a : ℝ) : Prop :=
  ∀ x, f x ≤ a

def FnLb (f : ℝ → ℝ) (a : ℝ) : Prop :=
  ∀ x, a ≤ f x
```

`fun x ↦ f x + g x` 是将 `x` 映到 `f x + g x` 的函数；从表达式 `f x + g x` 到该函数称为类型论中的 **λ 抽象**（lambda abstraction）。

```lean
section
variable (f g : ℝ → ℝ) (a b : ℝ)

example (hfa : FnUb f a) (hgb : FnUb g b) : FnUb (fun x ↦ f x + g x) (a + b) := by
  intro x
  dsimp
  apply add_le_add
  apply hfa
  apply hgb
```

对目标 `FnUb (fun x ↦ f x + g x) (a + b)` 使用 `intro`，迫使 Lean 展开 `FnUb` 并为全称量词引入 `x`；目标变为 `(fun (x : ℝ) ↦ f x + g x) x ≤ a + b`。`dsimp`（"d" 表示 definitional）将 `(fun x ↦ f x + g x) x` 化简为 `f x + g x`；删去该命令证明仍成立，但 `dsimp` 使目标更可读。也可用 `change f x + g x ≤ a + b`。最后两个 `apply` 迫使 Lean 展开假设中的 `FnUb`。试完成类似证明：

```lean
example (hfa : FnLb f a) (hgb : FnLb g b) : FnLb (fun x ↦ f x + g x) (a + b) :=
  sorry

example (nnf : FnLb f 0) (nng : FnLb g 0) : FnLb (fun x ↦ f x * g x) 0 :=
  sorry

example (hfa : FnUb f a) (hgb : FnUb g b) (nng : FnLb g 0) (nna : 0 ≤ a) :
    FnUb (fun x ↦ f x * g x) (a * b) :=
  sorry
```

`FnUb`、`FnLb` 虽为实函数定义，但定义与证明其实更一般：对任何值域上有序关系的两个类型之间的函数都适用。`add_le_add` 的类型表明它对尊重相应序的幺半群结构成立；自然数、整数、有理数、实数都是实例。在足够一般的层次证明 `fnUb_add`，即可用于所有这些实例：

```lean
section
variable {α : Type*} {R : Type*} [AddCommMonoid R] [PartialOrder R] [IsOrderedCancelAddMonoid R]

#check add_le_add

def FnUb' (f : α → R) (a : R) : Prop :=
  ∀ x, f x ≤ a

theorem fnUb_add {f g : α → R} {a b : R} (hfa : FnUb' f a) (hgb : FnUb' g b) :
    FnUb' (fun x ↦ f x + g x) (a + b) := fun x ↦ add_le_add (hfa x) (hgb x)

end
```

方括号在[证明代数结构中的恒等式](../C02_Basics/ProvingIdentitiesInAlgebraicStructures.md)中已见过；为具体起见，多数例子仍用实数，但 Mathlib 在很高抽象层次上有定义与定理。

另一隐含量词例子：Mathlib 定义谓词 `Monotone`，表示函数在其参数上非递减：

```lean
example (f : ℝ → ℝ) (h : Monotone f) : ∀ {a b}, a ≤ b → f a ≤ f b :=
  @h
```

`Monotone f` 的定义正是冒号后的表达式。须在 `h` 前加 `@`，否则 Lean 会展开隐式参数并插入占位符。

证明单调性事实涉及 `intro` 引入 `a`、`b` 及假设 `a ≤ b`；使用单调性假设时，可将其应用于合适参数与假设，再应用于目标；或直接应用于目标，让 Lean 反向显示剩余假设为新子目标。

```lean
section
variable (f g : ℝ → ℝ)

example (mf : Monotone f) (mg : Monotone g) : Monotone fun x ↦ f x + g x := by
  intro a b aleb
  apply add_le_add
  apply mf aleb
  apply mg aleb
```

证明很短时，常直接给证明项。临时引入 `a`、`b` 和假设 `aleb` 时，Lean 用 `fun a b aleb ↦ ...`；`fun x ↦ x^2` 类比。上一证明的 `intro` 对应下一证明项中的 λ 抽象，`apply` 对应将定理应用于参数。

```lean
example (mf : Monotone f) (mg : Monotone g) : Monotone fun x ↦ f x + g x :=
  fun _a _b aleb ↦ add_le_add (mf aleb) (mg aleb)
```

有用技巧：写 `fun a b aleb ↦ _` 时，Lean 会报错提示无法猜测该表达式；查看 InfoView 或悬停错误，可见剩余表达式须解决的目标。

Lean 会警告 `a`、`b` 在函数体中未使用；可写 `set_option linter.unusedVariables false` 禁用，或在名前加下划线，或用 `_` 代替名字（Lean 会生成 `x✝` 等不可访问名）。

试用策略或证明项完成：

```lean
example {c : ℝ} (mf : Monotone f) (nnc : 0 ≤ c) : Monotone fun x ↦ c * f x :=
  sorry

example (mf : Monotone f) (mg : Monotone g) : Monotone fun x ↦ f (g x) :=
  sorry
```

函数 \(f : \mathbb{R} \to \mathbb{R}\) 若对每个 \(x\) 有 \(f(-x) = f(x)\) 称为**偶函数**（even），若 \(f(-x) = -f(x)\) 称为**奇函数**（odd）：

```lean
def FnEven (f : ℝ → ℝ) : Prop :=
  ∀ x, f x = f (-x)

def FnOdd (f : ℝ → ℝ) : Prop :=
  ∀ x, f x = -f (-x)

example (ef : FnEven f) (eg : FnEven g) : FnEven fun x ↦ f x + g x := by
  intro x
  calc
    (fun x ↦ f x + g x) x = f x + g x := rfl
    _ = f (-x) + g (-x) := by rw [ef, eg]

example (of : FnOdd f) (og : FnOdd g) : FnEven fun x ↦ f x * g x := by
  sorry

example (ef : FnEven f) (og : FnOdd g) : FnOdd fun x ↦ f x * g x := by
  sorry

example (ef : FnEven f) (og : FnOdd g) : FnEven fun x ↦ f (g x) := by
  sorry
```

第一个证明可用 `dsimp` 或 `change` 去掉 λ 抽象；否则后续 `rw` 在语法层面找不到 `f x`、`g x` 模式——`rw` 在语法层面操作，不会自动展开定义（变体 `erw` 会稍努力，但有限）。

知道如何识别后，隐式全称量词随处可见。

Mathlib 有完善的集合操作库。Lean 不基于集合论基础，此处的「集合」指给定类型 `α` 上数学对象的集合。`x : α`、`s : Set α` 时，`x ∈ s` 断言 `x` 属于 `s`；若 `y : β` 类型不同，则 `y ∈ s` **无类型**，Lean 不接受——这与 ZF 中 `a ∈ b` 对任意对象都有意义不同（如 `sin ∈ cos` 在 ZF 中合法，在 Lean 中 `sin`、`cos` 均为 `ℝ → ℝ`，不等于 `Set (ℝ → ℝ)`，故无意义）。证明助手借此检测无意义表达式。Lean 也可形式化集合论本身（如连续统假设的独立性），但超出本书范围。

`s, t : Set α` 时，子集关系 `s ⊆ t` 定义为 `∀ {x : α}, x ∈ s → x ∈ t`。量词变量标为隐式，故给定 `h : s ⊆ t` 与 `h' : x ∈ s`，可写 `h h'` 作为 `x ∈ t` 的理由。下列给出自反性的策略证明与证明项，请完成传递性：

```lean
section
variable {α : Type*} (r s t : Set α)

example : s ⊆ s := by
  intro x xs
  exact xs

theorem Subset.refl : s ⊆ s := fun _x xs ↦ xs

theorem Subset.trans : r ⊆ s → s ⊆ t → r ⊆ t := by
  sorry

end
```

类似 `FnUb`，可定义 `SetUb s a` 表示 `a` 是集合 `s` 的上界（假设 `s` 的元素类型带有序）：

```lean
section
variable {α : Type*} [PartialOrder α]
variable (s : Set α) (a b : α)

def SetUb (s : Set α) (a : α) :=
  ∀ x, x ∈ s → x ≤ a

example (h : SetUb s a) (h' : a ≤ b) : SetUb s b :=
  sorry

end
```

本节最后一例：**单射**（injective）函数满足：若 \(f(x_1) = f(x_2)\) 则 \(x_1 = x_2\)。Mathlib 用 `Function.Injective f`，`x₁`、`x₂` 为隐式。下例表明实数上加常数的函数单射；请证明乘非零常数也单射：

```lean
section
open Function

example (c : ℝ) : Injective fun x ↦ x + c := by
  intro x₁ x₂ h'
  exact (add_left_inj c).mp h'

example {c : ℝ} (h : c ≠ 0) : Injective fun x ↦ c * x := by
  sorry

variable {α : Type*} {β : Type*} {γ : Type*}
variable {g : β → γ} {f : α → β}

example (injg : Injective g) (injf : Injective f) : Injective fun x ↦ g (f x) := by
  sorry

end
```