# 第 12 章：公理与计算

> 本译文对应原书 [Axioms and Computation](https://lean-lang.org/theorem_proving_in_lean4/Axioms-and-Computation/)；英文 Verso 源：`book/TPiL/AxiomsComputation.lean`。

我们已经看到，Lean 所实现的构造演算（Calculus of Constructions）版本包含依赖函数类型、归纳类型，以及以底部**非直谓的**（impredicative）、**证明无关的**（proof-irrelevant）`Prop` 为起点的宇宙层次。本章考虑用额外公理与规则扩展 CIC 的方式。以这种方式扩展基础系统往往很方便；它可以使更多定理可证，也使本来就能证明的定理更容易证明。但添加额外公理可能有负面后果，这些后果可能超出对其正确性的担忧。特别地，公理的使用会影响定义与定理的**计算内容**，下文将探讨这一点。

Lean 的设计目标是同时支持计算推理与经典推理。愿意的用户可以坚持「计算纯」片段，保证系统中的闭表达式求值为规范正规形。特别地，任何类型为 `Nat` 的闭的、计算纯表达式都会化简为数字字面量。

Lean 标准库定义了额外公理——命题外延性（propositional extensionality），以及商（quotient）构造，后者又蕴含函数外延性原理。这些扩展用于例如集合与有限集合理论的发展。下文将看到，使用这些定理会阻塞 Lean 内核中的求值，使类型为 `Nat` 的闭项不再化简为数字字面量。但 Lean 在把定义编译为可执行代码时会擦除类型与命题信息，而这些公理只添加新命题，因此与这种计算解释相容。即使倾向计算的用户也可能希望用经典排中律来推理计算；这也会阻塞内核求值，但与编译代码相容。

标准库还定义了与计算解释完全相悖的选择原理（choice principle），因为它能从断言其存在的命题中「神奇地」产生「数据」。它对某些经典构造必不可少，用户可在需要时导入。但用该构造产生数据的表达式没有计算内容，在 Lean 中我们必须把这种定义标为 `noncomputable` 以标明这一事实。

利用巧妙技巧（即 Diaconescu 定理），可以用命题外延性、函数外延性与选择推导出排中律。但如上所述，排中律的使用仍与编译相容，其他经典原理亦然，只要它们不用于制造数据。

概括而言，在宇宙、依赖函数类型与归纳类型这一底层框架之上，标准库添加三个额外组件：

- 命题外延性公理
- 商构造，它蕴含函数外延性
- 选择原理，它从存在命题产生数据

前两者阻塞 Lean 内的正规化，但与代码生成相容；第三个则不适于计算解释。下文将更精确地说明细节。

## 12.1 历史与哲学背景

（环境中有 `variable (x : α) (y : β)`。）

历史上大部分时期，数学本质上是计算性的：几何处理几何对象的构造，代数关注方程组的算法解，分析提供计算系统随时间演化未来行为的方法。从「对每个 `x`，存在 `y` 使得……」这类定理的证明，通常不难提取出给定 `x` 后计算这样的 `y` 的算法。

然而在十九世纪，数学论证复杂性的增加推动数学家发展新的推理风格，压制算法信息，并援引抽象掉对象如何表示之细节的数学对象描述。目标是获得强大的「概念性」理解而不陷入计算细节，但这却使一些在直接计算阅读下干脆为假的数学定理得以成立。

今天仍相当一致地认为计算对数学很重要。但对如何最好地处理计算关切存在不同观点。从**构造**观点看，把数学与其计算根源分离是错误；每个有意义的数学定理都应有直接的计算解释。从**经典**观点看，保持关切分离更有成效：我们可以用一种语言与方法体系写计算机程序，同时保持用非构造理论与方法推理它们的自由。Lean 的设计支持这两种途径。库的核心部分构造性地发展，但系统也提供进行经典数学推理的支持。

（环境中有 `open Nat`、`notation "… " e "…" => e`。）

从计算角度看，依赖类型论最纯的部分完全避免使用 `Prop`。归纳类型与依赖函数类型可视为数据类型，这些类型的项可通过应用归约规则直到无法再应用为止来「求值」。原则上，任何类型为 `Nat` 的闭项（即无自由变量的项）都应求值为数字字面量 `succ (… (succ zero)…)`。

（环境中有 `variable (p : Prop) (s t : α) (prf : p)`、`notation x " = " y " : " α => @Eq α x y`。）

引入证明无关的 `Prop` 并把定理标为不可约，是迈向关切分离的第一步。意图是：`p : Prop` 类型的元素在计算中不应起作用，因此项 `prf : p` 的具体构造在那种意义上是「无关的」。仍可定义包含 `Prop` 类型元素的计算对象；要点是这些元素可帮助我们推理计算的效果，但在从项中提取「代码」时可以忽略。然而 `Prop` 类型的元素并非完全无害。它们包含对任意类型 `α` 的等式 `s = t : α`，而这类等式可用作强制转换（cast）来类型检查项。下文将看到这类强制转换如何阻塞系统中的计算。不过，在擦除命题内容、忽略中间类型约束并把项归约到正规形的求值方案下，计算仍可能。这正是 Lean 虚拟机所做的。

采用证明无关的 `Prop` 后，人们可能认为合法地使用例如排中律 `p ∨ ¬p`（其中 `p` 为任意命题）。当然，按 CIC 规则这也会阻塞计算，但如上文所述，它并不阻止生成可执行代码。只有第 12.5 节讨论的选择原理才完全抹平理论中证明无关部分与数据相关部分之间的区分。

## 12.2 命题外延性

命题外延性是下列公理：

```lean
namespace Hidden
------
axiom propext {a b : Prop} : (a ↔ b) → a = b
------
end Hidden
```

（环境中有 `variable (a : Prop)`。）

它断言：当两个命题彼此蕴含时，它们实际上相等。这与集合论解释一致：其中任意 `a : Prop` 的元素要么为空集，要么为单点集 $\{\ast\}$（对某个特殊元素 $\ast$）。该公理的效果是：等价命题可在任意上下文中相互替换：

```lean
variable (a b c d e : Prop)

theorem thm₁ (h : a ↔ b) : (c ∧ a ∧ d → e) ↔ (c ∧ b ∧ d → e) :=
  propext h ▸ Iff.refl _

theorem thm₂ (p : Prop → Prop) (h : a ↔ b) (h₁ : p a) : p b :=
  propext h ▸ h₁
```

## 12.3 函数外延性

与命题外延性类似，函数外延性断言：类型为 `(x : α) → β x` 的任意两个函数，若在所有输入上一致，则相等：

```signature
funext.{u, v}
  {α : Sort u} {β : α → Sort v}
  {f g : (x : α) → β x}
  (h : ∀ (x : α), f x = g x) :
  f = g
```

从经典集合论视角看，这正是两个函数相等的含义。这称为函数的「**外延**」（extensional）观点。但从构造视角看，有时更自然地把函数视为以某种显式方式呈现的算法或计算机程序。两个计算机程序当然可以对每个输入计算相同答案，尽管语法上差异很大。同样，你可能希望保持一种函数观点，不强迫你把输入/输出行为相同但呈现不同的两个函数等同。这称为「**内涵**」（intensional）观点。

事实上，函数外延性从商的存在推出，下一节将描述商。因此在 Lean 标准库中，`funext` 因而[从商构造证明](https://github.com/leanprover/lean4/blob/master/src/Init/Core.lean)。

假设对 `α : Type u` 我们定义 `Set α := α → Prop` 表示 `α` 的子集类型，实质上把子集与谓词等同。结合 `funext` 与 `propext`，我们得到这类集合的外延理论：

```lean
def Set (α : Type u) := α → Prop

namespace Set

def mem (x : α) (a : Set α) := a x

infix:50 (priority := high) "∈" => mem

theorem setext {a b : Set α} (h : ∀ x, x ∈ a ↔ x ∈ b) : a = b :=
  funext (fun x => propext (h x))

end Set
```

然后可以定义空集、集合交等，并证明集合恒等式：

```lean
def Set (α : Type u) := α → Prop
namespace Set
def mem (x : α) (a : Set α) := a x
infix:50 (priority := high) "∈" => mem
theorem setext {a b : Set α} (h : ∀ x, x ∈ a ↔ x ∈ b) : a = b :=
  funext (fun x => propext (h x))
------
def empty : Set α := fun _ => False

notation (priority := high) "∅" => empty

def inter (a b : Set α) : Set α :=
  fun x => x ∈ a ∧ x ∈ b

infix:70 " ∩ " => inter

theorem inter_self (a : Set α) : a ∩ a = a :=
  setext fun x => Iff.intro
    (fun ⟨h, _⟩ => h)
    (fun h => ⟨h, h⟩)

theorem inter_empty (a : Set α) : a ∩ ∅ = ∅ :=
  setext fun _ => Iff.intro
    (fun ⟨_, h⟩ => h)
    (fun h => False.elim h)

theorem empty_inter (a : Set α) : ∅ ∩ a = ∅ :=
  setext fun _ => Iff.intro
    (fun ⟨h, _⟩ => h)
    (fun h => False.elim h)

theorem inter.comm (a b : Set α) : a ∩ b = b ∩ a :=
  setext fun _ => Iff.intro
    (fun ⟨h₁, h₂⟩ => ⟨h₂, h₁⟩)
    (fun ⟨h₁, h₂⟩ => ⟨h₂, h₁⟩)
-----
end Set
```

下列例子说明函数外延性如何在 Lean 内核内阻塞计算：

```lean
def f (x : Nat) := x
def g (x : Nat) := 0 + x

theorem f_eq_g : f = g :=
  funext fun x => (Nat.zero_add x).symm

def val : Nat :=
  Eq.recOn (motive := fun _ _ => Nat) f_eq_g 0

-- does not reduce to 0
#reduce val

-- evaluates to 0
#eval val
```

首先，我们用函数外延性证明两个函数 `f` 和 `g` 相等，然后在类型中把 `f` 替换为 `g` 来对类型为 `Nat` 的 `0` 做强制转换。当然，该强制转换是空的，因为 `Nat` 不依赖 `f`。但这足以造成损害：按系统的计算规则，我们现在有了一个不化简为数字字面量的 `Nat` 闭项。此例中我们或许想把表达式化简为 `0`。但在非平凡例子中，消除强制转换会改变项的类型，可能使周围表达式类型不正确。然而虚拟机毫无困难地把表达式求值为 `0`。下面是一个类似的人为例子，说明 `propext` 如何造成阻碍：

```lean
theorem tteq : (True ∧ True) = True :=
  propext (Iff.intro (fun ⟨h, _⟩ => h) (fun h => ⟨h, h⟩))

def val : Nat :=
  Eq.recOn (motive := fun _ _ => Nat) tteq 0

-- does not reduce to 0
#reduce val

-- evaluates to 0
#eval val
```

当前研究计划，包括**观察类型论**（observational type theory）与**立方类型论**（cubical type theory）的工作，旨在以允许涉及函数外延性、商等的强制转换归约的方式扩展类型论。但解决方案并不那么干脆，Lean 底层演算的规则也不认可这类归约。

从某种意义上说，强制转换并不改变表达式的含义，而是推理表达式类型的机制。给定合适的语义，在保持含义、忽略使归约类型正确的中间簿记的方式下归约项是有意义的。那种情况下，在 `Prop` 中添加新公理无关紧要；由**证明无关性**，`Prop` 中的表达式不携带信息，可被归约过程安全忽略。

## 12.4 商

（环境中有 `variable (α : Sort u) (r : α → α → Prop) (f : α → β) (x y : α) (f' : Quot r → β)`、`notation α " / " r:max => Quot (α := α) r`、`notation "⟦" x "⟧" => Quot.mk _ x`。）

设 `α` 为任意类型，`r` 为 `α` 上的等价关系。数学上常见做法是形成「商」`α / r`，即 `α` 的元素在模 `r` 意义下的类型。从集合论视角，可以把 `α / r` 看作 `α` 模 `r` 的等价类集合。若 `f : α → β` 是尊重等价关系的任意函数，即对每个 `x y : α`，`r x y` 蕴含 `f x = f y`，则 `f`「提升」为函数 `f' : α / r → β`，在每个等价类 `⟦x⟧` 上由 `f' ⟦x⟧ = f x` 定义。Lean 标准库用执行恰好这些构造的额外常量扩展构造演算，并把最后一个等式安装为定义归约规则。

在最基本形式下，商构造甚至不要求 `r` 是等价关系。下列常量是 Lean 内建的：

```lean
namespace Hidden
------
universe u v

axiom Quot : {α : Sort u} → (α → α → Prop) → Sort u

axiom Quot.mk : {α : Sort u} → (r : α → α → Prop) → α → Quot r

axiom Quot.ind :
    ∀ {α : Sort u} {r : α → α → Prop} {β : Quot r → Prop},
      (∀ a, β (Quot.mk r a)) → (q : Quot r) → β q

axiom Quot.lift :
    {α : Sort u} → {r : α → α → Prop} → {β : Sort u} → (f : α → β)
    → (∀ a b, r a b → f a = f b) → Quot r → β
------
end Hidden
```

（环境中有 `variable (α : Type u) (r : α → α → Prop) (a : α) (f : α → β) (h : ∀ a b, r a b → f a = f b)`。）

第一个在类型 `α` 与 `α` 上任意二元关系 `r` 给定后形成类型 `Quot r`。第二个把 `α` 映射到 `Quot α`，因此若 `r : α → α → Prop` 且 `a : α`，则 `Quot.mk r a` 是 `Quot r` 的元素。第三个原理 `Quot.ind` 说 `Quot r` 的每个元素都是这种形式。至于 `Quot.lift`，给定函数 `f : α → β`，若 `h` 证明 `f` 尊重关系 `r`，则 `Quot.lift f h` 是 `Quot r` 上的对应函数。思想是：对 `α` 中每个元素 `a`，函数 `Quot.lift f h` 把 `Quot.mk r a`（包含 `a` 的 `r`-类）映射到 `f a`，其中 `h` 表明该函数是良定义的。事实上，计算原理被声明为归约规则，如下证明所示。

```lean
def mod7Rel (x y : Nat) : Prop :=
  x % 7 = y % 7

-- the quotient type
#check (Quot mod7Rel : Type)

-- the class of numbers equivalent to 4
#check (Quot.mk mod7Rel 4 : Quot mod7Rel)

def f (x : Nat) : Bool :=
  x % 7 = 0

theorem f_respects (a b : Nat) (h : mod7Rel a b) : f a = f b := by
  simp [mod7Rel, f] at *
  rw [h]

#check (Quot.lift f f_respects : Quot mod7Rel → Bool)

-- the computation principle
example (a : Nat) : Quot.lift f f_respects (Quot.mk mod7Rel a) = f a :=
  rfl
```

四个常量 `Quot`、`Quot.mk`、`Quot.ind` 和 `Quot.lift` 本身并不很强。可以验证：若取 `Quot r` 为简单的 `α`，并取 `Quot.lift` 为恒等函数（忽略 `h`），则 `Quot.ind` 仍满足。因此这四个常量不被视为额外公理。

它们与归纳定义类型及其构造子与 recursor 一样，被视为逻辑框架的一部分。

使 `Quot` 构造成为真正的商的是下列额外公理：

```lean
namespace Hidden
universe u v
------
axiom Quot.sound :
      ∀ {α : Type u} {r : α → α → Prop} {a b : α},
        r a b → Quot.mk r a = Quot.mk r b
```

这是断言：`α` 中由 `r` 相关的任意两个元素在商中等同。若定理或定义使用了 `Quot.sound`，它会在 `#print axioms` 命令中显示。

（环境中有 `variable (α : Type u) (r : α → α → Prop) (r' r'' : α → α → Prop) (a b : α)`。）

当然，商构造最常用于 `r` 是等价关系的情形。给定如上 `r`，若按规则 `r' a b` 当且仅当 `Quot.mk r a = Quot.mk r b` 定义 `r'`，则显然 `r'` 是等价关系。事实上 `r'` 是函数 `fun a => Quot.mk r a` 的**核**。公理 `Quot.sound` 说 `r a b` 蕴含 `r' a b`。用 `Quot.lift` 与 `Quot.ind`，可以证明 `r'` 是包含 `r` 的最小等价关系，即若 `r''` 是包含 `r` 的任意等价关系，则 `r' a b` 蕴含 `r'' a b`。特别地，若 `r` 一开始就是等价关系，则对所有 `a` 和 `b` 有 `r a b` 当且仅当 `r' a b`。

为支持这一常见用例，标准库定义了**等价类**（setoid）概念，即带有相关等价关系的类型：

```lean
namespace Hidden
------
class Setoid (α : Sort u) where
  r : α → α → Prop
  iseqv : Equivalence r

instance {α : Sort u} [Setoid α] : HasEquiv α :=
  ⟨Setoid.r⟩

namespace Setoid

variable {α : Sort u} [Setoid α]

theorem refl (a : α) : a ≈ a :=
  iseqv.refl a

theorem symm {a b : α} (hab : a ≈ b) : b ≈ a :=
  iseqv.symm hab

theorem trans {a b c : α} (hab : a ≈ b) (hbc : b ≈ c) : a ≈ c :=
  iseqv.trans hab hbc

end Setoid
------
end Hidden
```

给定类型 `α`、其上的关系 `r` 以及 `r` 是等价关系的证明 `iseqv`，可以定义 `Setoid` 类的实例。

```lean
namespace Hidden
------
def Quotient {α : Sort u} (s : Setoid α) :=
  @Quot α Setoid.r
------
end Hidden
```

（环境中有 `variable (α : Type u) [Setoid α] (a b : α)`。）

常量 `Quotient.mk`、`Quotient.ind`、`Quotient.lift` 和 `Quotient.sound` 无非是对 `Quot` 对应元素的特化。类型类推断能为类型 `α` 找到相关 setoid 这一事实带来诸多好处。首先，可以用记法 `a ≈ b`（用 `\approx` 输入）表示 `Setoid.r a b`，其中 `Setoid` 实例在记法中隐式。可以用通用定理 `Setoid.refl`、`Setoid.symm`、`Setoid.trans` 推理该关系。具体在商上可以使用定理 `Quotient.exact`：

```signature
Quotient.exact {α : Sort u} {s : Setoid α} {a b : α} :
  Quotient.mk s a = Quotient.mk s b →
  a ≈ b
```

与 `Quotient.sound` 一起，这蕴含商的元素恰好对应 `α` 中元素的等价类。

（环境中有 `variable (α : Type u) (β : Type v)`。）

回忆标准库中 `α × β` 表示类型 `α` 与 `β` 的笛卡尔积。为说明商的用法，我们把类型 `α` 的**无序**元素对定义为类型 `α × α` 的商。首先定义相关等价关系：

```lean
private def eqv (p₁ p₂ : α × α) : Prop :=
  (p₁.1 = p₂.1 ∧ p₁.2 = p₂.2) ∨ (p₁.1 = p₂.2 ∧ p₁.2 = p₂.1)

infix:50 " ~ " => eqv
```

下一步是证明 `eqv` 确实是等价关系，即自反、对称且传递。可以用依赖模式匹配做情形分析，把假设拆成片段再重组得出结论，以方便可读的方式证明这三个性质。

```lean
private def eqv (p₁ p₂ : α × α) : Prop :=
  (p₁.1 = p₂.1 ∧ p₁.2 = p₂.2) ∨ (p₁.1 = p₂.2 ∧ p₁.2 = p₂.1)
infix:50 " ~ " => eqv
------
private theorem eqv.refl (p : α × α) : p ~ p :=
  Or.inl ⟨rfl, rfl⟩

private theorem eqv.symm : ∀ {p₁ p₂ : α × α}, p₁ ~ p₂ → p₂ ~ p₁
  | (a₁, a₂), (b₁, b₂), (Or.inl ⟨a₁b₁, a₂b₂⟩) =>
    Or.inl (by simp_all)
  | (a₁, a₂), (b₁, b₂), (Or.inr ⟨a₁b₂, a₂b₁⟩) =>
    Or.inr (by simp_all)

private theorem eqv.trans : ∀ {p₁ p₂ p₃ : α × α}, p₁ ~ p₂ → p₂ ~ p₃ → p₁ ~ p₃
  | (a₁, a₂), (b₁, b₂), (c₁, c₂), Or.inl ⟨a₁b₁, a₂b₂⟩, Or.inl ⟨b₁c₁, b₂c₂⟩ =>
    Or.inl (by simp_all)
  | (a₁, a₂), (b₁, b₂), (c₁, c₂), Or.inl ⟨a₁b₁, a₂b₂⟩, Or.inr ⟨b₁c₂, b₂c₁⟩ =>
    Or.inr (by simp_all)
  | (a₁, a₂), (b₁, b₂), (c₁, c₂), Or.inr ⟨a₁b₂, a₂b₁⟩, Or.inl ⟨b₁c₁, b₂c₂⟩ =>
    Or.inr (by simp_all)
  | (a₁, a₂), (b₁, b₂), (c₁, c₂), Or.inr ⟨a₁b₂, a₂b₁⟩, Or.inr ⟨b₁c₂, b₂c₁⟩ =>
    Or.inl (by simp_all)

private theorem is_equivalence : Equivalence (@eqv α) :=
  { refl := eqv.refl, symm := eqv.symm, trans := eqv.trans }
```

既然已证明 `eqv` 是等价关系，可以构造 `Setoid (α × α)`，并用它定义无序对的类型 `UProd α`。

```lean
private def eqv (p₁ p₂ : α × α) : Prop :=
  (p₁.1 = p₂.1 ∧ p₁.2 = p₂.2) ∨ (p₁.1 = p₂.2 ∧ p₁.2 = p₂.1)
infix:50 " ~ " => eqv
private theorem eqv.refl (p : α × α) : p ~ p :=
  Or.inl ⟨rfl, rfl⟩
private theorem eqv.symm : ∀ {p₁ p₂ : α × α}, p₁ ~ p₂ → p₂ ~ p₁
  | (a₁, a₂), (b₁, b₂), (Or.inl ⟨a₁b₁, a₂b₂⟩) =>
    Or.inl (by simp_all)
  | (a₁, a₂), (b₁, b₂), (Or.inr ⟨a₁b₂, a₂b₁⟩) =>
    Or.inr (by simp_all)
private theorem eqv.trans : ∀ {p₁ p₂ p₃ : α × α}, p₁ ~ p₂ → p₂ ~ p₃ → p₁ ~ p₃
  | (a₁, a₂), (b₁, b₂), (c₁, c₂), Or.inl ⟨a₁b₁, a₂b₂⟩, Or.inl ⟨b₁c₁, b₂c₂⟩ =>
    Or.inl (by simp_all)
  | (a₁, a₂), (b₁, b₂), (c₁, c₂), Or.inl ⟨a₁b₁, a₂b₂⟩, Or.inr ⟨b₁c₂, b₂c₁⟩ =>
    Or.inr (by simp_all)
  | (a₁, a₂), (b₁, b₂), (c₁, c₂), Or.inr ⟨a₁b₂, a₂b₁⟩, Or.inl ⟨b₁c₁, b₂c₂⟩ =>
    Or.inr (by simp_all)
  | (a₁, a₂), (b₁, b₂), (c₁, c₂), Or.inr ⟨a₁b₂, a₂b₁⟩, Or.inr ⟨b₁c₂, b₂c₁⟩ =>
    Or.inl (by simp_all)
private theorem is_equivalence : Equivalence (@eqv α) :=
  { refl := eqv.refl, symm := eqv.symm, trans := eqv.trans }
------
instance uprodSetoid (α : Type u) : Setoid (α × α) where
  r     := eqv
  iseqv := is_equivalence

def UProd (α : Type u) : Type u :=
  Quotient (uprodSetoid α)

namespace UProd

def mk {α : Type} (a₁ a₂ : α) : UProd α :=
  Quotient.mk' (a₁, a₂)

notation "{ " a₁ ", " a₂ " }" => mk a₁ a₂

end UProd
```

（环境中有完整的 `eqv`、`UProd` 定义及 `variable (a₁ a₂ : α)`。）

注意我们局部定义记法 `{a₁, a₂}` 表示无序对 `Quotient.mk' (a₁, a₂)`。这对说明有用，但一般不宜这样做，因为该记法会遮蔽花括号的其他用途，例如记录与集合。

我们可以用 `Quot.sound` 轻易证明 `{a₁, a₂} = {a₂, a₁}`，因为有 `(a₁, a₂) ~ (a₂, a₁)`。

```lean
private def eqv (p₁ p₂ : α × α) : Prop :=
  (p₁.1 = p₂.1 ∧ p₁.2 = p₂.2) ∨ (p₁.1 = p₂.2 ∧ p₁.2 = p₂.1)
infix:50 " ~ " => eqv
private theorem eqv.refl (p : α × α) : p ~ p :=
  Or.inl ⟨rfl, rfl⟩
private theorem eqv.symm : ∀ {p₁ p₂ : α × α}, p₁ ~ p₂ → p₂ ~ p₁
  | (a₁, a₂), (b₁, b₂), (Or.inl ⟨a₁b₁, a₂b₂⟩) =>
    Or.inl (by simp_all)
  | (a₁, a₂), (b₁, b₂), (Or.inr ⟨a₁b₂, a₂b₁⟩) =>
    Or.inr (by simp_all)
private theorem eqv.trans : ∀ {p₁ p₂ p₃ : α × α}, p₁ ~ p₂ → p₂ ~ p₃ → p₁ ~ p₃
  | (a₁, a₂), (b₁, b₂), (c₁, c₂), Or.inl ⟨a₁b₁, a₂b₂⟩, Or.inl ⟨b₁c₁, b₂c₂⟩ =>
    Or.inl (by simp_all)
  | (a₁, a₂), (b₁, b₂), (c₁, c₂), Or.inl ⟨a₁b₁, a₂b₂⟩, Or.inr ⟨b₁c₂, b₂c₁⟩ =>
    Or.inr (by simp_all)
  | (a₁, a₂), (b₁, b₂), (c₁, c₂), Or.inr ⟨a₁b₂, a₂b₁⟩, Or.inl ⟨b₁c₁, b₂c₂⟩ =>
    Or.inr (by simp_all)
  | (a₁, a₂), (b₁, b₂), (c₁, c₂), Or.inr ⟨a₁b₂, a₂b₁⟩, Or.inr ⟨b₁c₂, b₂c₁⟩ =>
    Or.inl (by simp_all)
private theorem is_equivalence : Equivalence (@eqv α) :=
  { refl := eqv.refl, symm := eqv.symm, trans := eqv.trans }
instance uprodSetoid (α : Type u) : Setoid (α × α) where
  r     := eqv
  iseqv := is_equivalence
def UProd (α : Type u) : Type u :=
  Quotient (uprodSetoid α)
namespace UProd
def mk {α : Type} (a₁ a₂ : α) : UProd α :=
  Quotient.mk' (a₁, a₂)
notation "{ " a₁ ", " a₂ " }" => mk a₁ a₂
------
theorem mk_eq_mk (a₁ a₂ : α) : {a₁, a₂} = {a₂, a₁} :=
  Quot.sound (Or.inr ⟨rfl, rfl⟩)
------
end UProd
```

为完成例子，给定 `a : α` 与 `u : UProd α`，我们定义命题 `a ∈ u`，当 `a` 是无序对 `u` 的元素之一时应成立。首先在（有序）对上定义类似命题 `mem_fn a u`；然后用引理 `mem_respects` 证明 `mem_fn` 尊重等价关系 `eqv`。这是 Lean 标准库中广泛使用的惯用法。

```lean
set_option linter.unusedVariables false
private def eqv (p₁ p₂ : α × α) : Prop :=
  (p₁.1 = p₂.1 ∧ p₁.2 = p₂.2) ∨ (p₁.1 = p₂.2 ∧ p₁.2 = p₂.1)
infix:50 " ~ " => eqv
private theorem eqv.refl (p : α × α) : p ~ p :=
  Or.inl ⟨rfl, rfl⟩
private theorem eqv.symm : ∀ {p₁ p₂ : α × α}, p₁ ~ p₂ → p₂ ~ p₁
  | (a₁, a₂), (b₁, b₂), (Or.inl ⟨a₁b₁, a₂b₂⟩) =>
    Or.inl (by simp_all)
  | (a₁, a₂), (b₁, b₂), (Or.inr ⟨a₁b₂, a₂b₁⟩) =>
    Or.inr (by simp_all)
private theorem eqv.trans : ∀ {p₁ p₂ p₃ : α × α}, p₁ ~ p₂ → p₂ ~ p₃ → p₁ ~ p₃
  | (a₁, a₂), (b₁, b₂), (c₁, c₂), Or.inl ⟨a₁b₁, a₂b₂⟩, Or.inl ⟨b₁c₁, b₂c₂⟩ =>
    Or.inl (by simp_all)
  | (a₁, a₂), (b₁, b₂), (c₁, c₂), Or.inl ⟨a₁b₁, a₂b₂⟩, Or.inr ⟨b₁c₂, b₂c₁⟩ =>
    Or.inr (by simp_all)
  | (a₁, a₂), (b₁, b₂), (c₁, c₂), Or.inr ⟨a₁b₂, a₂b₁⟩, Or.inl ⟨b₁c₁, b₂c₂⟩ =>
    Or.inr (by simp_all)
  | (a₁, a₂), (b₁, b₂), (c₁, c₂), Or.inr ⟨a₁b₂, a₂b₁⟩, Or.inr ⟨b₁c₂, b₂c₁⟩ =>
    Or.inl (by simp_all)
private theorem is_equivalence : Equivalence (@eqv α) :=
  { refl := eqv.refl, symm := eqv.symm, trans := eqv.trans }
instance uprodSetoid (α : Type u) : Setoid (α × α) where
  r     := eqv
  iseqv := is_equivalence
def UProd (α : Type u) : Type u :=
  Quotient (uprodSetoid α)
namespace UProd
def mk {α : Type} (a₁ a₂ : α) : UProd α :=
  Quotient.mk' (a₁, a₂)
notation "{ " a₁ ", " a₂ " }" => mk a₁ a₂
theorem mk_eq_mk (a₁ a₂ : α) : {a₁, a₂} = {a₂, a₁} :=
  Quot.sound (Or.inr ⟨rfl, rfl⟩)
------
private def mem_fn (a : α) : α × α → Prop
  | (a₁, a₂) => a = a₁ ∨ a = a₂

-- auxiliary lemma for proving mem_respects
private theorem mem_swap {a : α} :
      ∀ {p : α × α}, mem_fn a p = mem_fn a (⟨p.2, p.1⟩)
  | (a₁, a₂) => by
    apply propext
    apply Iff.intro
    . intro
      | Or.inl h => exact Or.inr h
      | Or.inr h => exact Or.inl h
    . intro
      | Or.inl h => exact Or.inr h
      | Or.inr h => exact Or.inl h

private theorem mem_respects : {p₁ p₂ : α × α} → (a : α) → p₁ ~ p₂ → mem_fn a p₁ = mem_fn a p₂
  | (a₁, a₂), (b₁, b₂), a, Or.inl ⟨a₁b₁, a₂b₂⟩ => by
    simp_all
  | (a₁, a₂), (b₁, b₂), a, Or.inr ⟨a₁b₂, a₂b₁⟩ => by
    simp_all only
    apply mem_swap

def mem (a : α) (u : UProd α) : Prop :=
  Quot.liftOn u (fun p => mem_fn a p) (fun p₁ p₂ e => mem_respects a e)

infix:50 (priority := high) " ∈ " => mem

theorem mem_mk_left (a b : α) : a ∈ {a, b} :=
  Or.inl rfl

theorem mem_mk_right (a b : α) : b ∈ {a, b} :=
  Or.inr rfl

theorem mem_or_mem_of_mem_mk {a b c : α} : c ∈ {a, b} → c = a ∨ c = b :=
  fun h => h
---------
end UProd
```

为方便起见，标准库还定义了 `Quotient.lift₂` 用于提升二元函数，以及 `Quotient.ind₂` 用于对两个变量归纳。

（环境中有 `variable (α : Sort u) (β : α → Sort v) (f₁ f₂ f : (x : α) → β x) (a : α)`、`def extfun (α : Sort u) (β : α → Sort v) := Quot (fun (f g : (x : α) → β x) => ∀ x, f x = g x)`、`def extfun_app {α β} : extfun α β → (x : α) → β x := fun f x => Quot.lift (· x) (by intros; simp [*]) f`。）

我们以若干提示结束本节，说明商构造为何蕴含函数外延性。不难证明 `(x : α) → β x` 上的外延相等是等价关系，因此可以考虑函数「模等价」的类型 `extfun α β`。当然，应用尊重该等价：若 `f₁` 等价于 `f₂`，则 `f₁ a` 等于 `f₂ a`。因此应用给出函数 `extfun_app : extfun α β → (x : α) → β x`。但对每个 `f`，`extfun_app (.mk _ f)` 在定义上等于 `fun x => f x`，进而定义上等于 `f`。因此当 `f₁` 与 `f₂` 外延相等时，我们有下列等式链：

```lean
variable {α : Sort u} {β : α → Sort v}

def extfun (α : Sort u) (β : α → Sort v) := Quot (fun (f g : (x : α) → β x) => ∀ x, f x = g x)

def extfun_app {α β} (f : extfun α β) (x : α) : β x :=
  Quot.lift (· x) (by intros; simp [*]) f
----------
example (f₁ f₂ : (x : α) → β x) (h : ∀ x, f₁ x = f₂ x) :=
  calc f₁
    _ = extfun_app (.mk _ f₁) := rfl
    _ = extfun_app (.mk _ f₂) := by rw [Quot.sound]; trivial
    _ = f₂ := rfl

```

于是 `f₁` 等于 `f₂`。

## 12.5 选择

要陈述标准库中定义的最后一个公理，需要 `Nonempty` 类型，定义如下：

```lean
namespace Hidden
------
class inductive Nonempty (α : Sort u) : Prop where
  | intro (val : α) : Nonempty α
------
end Hidden
```

（环境中有 `variable {α : Sort u}`。）

因为 `Nonempty α` 的类型为 `Prop` 且其构造子包含数据，它只能消去到 `Prop`。事实上 `Nonempty α` 等价于 `∃ x : α, True`：

```lean
example (α : Type u) : Nonempty α ↔ ∃ x : α, True :=
  Iff.intro (fun ⟨a⟩ => ⟨a, trivial⟩) (fun ⟨a, h⟩ => ⟨a⟩)
```

我们的选择公理现在简单表述为：

```lean
namespace Hidden
universe u
------
axiom choice {α : Sort u} : Nonempty α → α
------
end Hidden
```

（环境中有 `variable {α : Sort u} {h : Nonempty α}`、`open Classical`。）

仅给定断言 `α` 非空的 `h`，`choice h` 就神奇地产生 `α` 的元素。当然，这会阻塞任何有意义的计算：按 `Prop` 的解释，`h` 完全不包含如何找到这样一个元素的信息。

它在 `Classical` 命名空间中，因此定理的全名是 `Classical.choice`。选择原理等价于**不定描述**（indefinite description）原理，可用子类型表述如下：

```lean
namespace Hidden
universe u
axiom choice {α : Sort u} : Nonempty α → α
------
noncomputable def indefiniteDescription {α : Sort u}
    (p : α → Prop) (h : ∃ x, p x) : {x // p x} :=
  choice <| let ⟨x, px⟩ := h; ⟨⟨x, px⟩⟩
------
end Hidden
```

（环境中有 `variable {α : Sort u} {h : Nonempty α}`、`open Classical`。）

因为它依赖 `choice`，Lean 无法为 `indefiniteDescription` 生成可执行代码，因此要求我们把这个定义标为 `noncomputable`。同样在 `Classical` 命名空间中，函数 `choose` 与性质 `choose_spec` 分解 `indefiniteDescription` 输出的两部分：

```lean
open Classical
namespace Hidden
------
variable {α : Sort u} {p : α → Prop}

noncomputable def choose (h : ∃ x, p x) : α :=
  (indefiniteDescription p h).val

theorem choose_spec (h : ∃ x, p x) : p (choose h) :=
  (indefiniteDescription p h).property
------
end Hidden
```

选择原理还抹平了 `Nonempty` 与更构造性的 `Inhabited` 性质之间的区分：

```lean
open Classical
------
noncomputable def inhabited_of_nonempty (h : Nonempty α) : Inhabited α :=
  choice (let ⟨a⟩ := h; ⟨⟨a⟩⟩)
```

下一节将看到，`propext`、`funext` 与 `choice` 合在一起蕴含排中律以及所有命题的可判定性。借助它们，可以如下加强不定描述原理：

（环境中有 `open Classical`。）

```signature
strongIndefiniteDescription {α : Sort u} (p : α → Prop)
  (h : Nonempty α) :
  {x // (∃ (y : α), p y) → p x}
```

假设环境类型 `α` 非空，`strongIndefiniteDescription p` 产生满足 `p` 的 `α` 的元素（若存在这样的元素）。该定义的数据部分通常称为 **Hilbert 的 ε 函数**（Hilbert's epsilon function）：

```signature
epsilon {α : Sort u} [h : Nonempty α] (p : α → Prop) : α
```

```signature
epsilon_spec {α : Sort u} {p : α → Prop}
  (hex : ∃ (y : α), p y) :
  p (@epsilon _ (nonempty_of_exists hex) p)
```

## 12.6 排中律

排中律如下：

```signature
Classical.em : ∀ (p : Prop), p ∨ ¬p
```

[Diaconescu 定理](https://en.wikipedia.org/wiki/Diaconescu%27s_theorem)表明选择公理足以推导排中律。更精确地说，它表明排中律从 `Classical.choice`、`propext` 与 `funext` 推出。下面概述标准库中的证明。

```lean
-- ANCHOR: emSetup
open Classical
theorem em (p : Prop) : p ∨ ¬p := by
  let U (x : Prop) : Prop := x = True ∨ p
  let V (x : Prop) : Prop := x = False ∨ p
  have exU : ∃ x, U x := ⟨True, Or.inl rfl⟩
  have exV : ∃ x, V x := ⟨False, Or.inl rfl⟩
  -- ^ PROOF_STATE: em1
-- ANCHOR_END: emSetup
-- ANCHOR: emChoose
  let u : Prop := choose exU
  let v : Prop := choose exV
  have u_def : U u := choose_spec exU
  have v_def : V v := choose_spec exV
  -- ^ PROOF_STATE: em2
-- ANCHOR_END: emChoose
-- ANCHOR: emCases
  have not_uv_or_p : u ≠ v ∨ p := by
    match u_def, v_def with
    | Or.inr h, _ => exact Or.inr h
    | _, Or.inr h => exact Or.inr h
    | Or.inl hut, Or.inl hvf =>
      apply Or.inl
      simp [hvf, hut, true_ne_false]
-- ANCHOR_END: emCases
-- ANCHOR: emNext
  have p_implies_uv : p → u = v :=
    fun hp =>
    have hpred : U = V :=
      funext fun x =>
        have hl : (x = True ∨ p) → (x = False ∨ p) :=
          fun _ => Or.inr hp
        have hr : (x = False ∨ p) → (x = True ∨ p) :=
          fun _ => Or.inr hp
        show (x = True ∨ p) = (x = False ∨ p) from
          propext (Iff.intro hl hr)
    have h₀ : ∀ exU exV, @choose _ U exU = @choose _ V exV := by
      rw [hpred]; intros; rfl
    show u = v from h₀ _ _
-- ANCHOR_END: emNext
-- ANCHOR: emDone
  match not_uv_or_p with
  | Or.inl hne =>
    exact Or.inr (mt p_implies_uv hne)
  | Or.inr h   =>
    exact Or.inl h
-- ANCHOR_END: emDone
```

首先，我们导入必要公理，并定义两个谓词 `U` 和 `V`：

```lean
open Classical
theorem em (p : Prop) : p ∨ ¬p := by
  let U (x : Prop) : Prop := x = True ∨ p
  let V (x : Prop) : Prop := x = False ∨ p
  have exU : ∃ x, U x := ⟨True, Or.inl rfl⟩
  have exV : ∃ x, V x := ⟨False, Or.inl rfl⟩
```

若 `p` 为真，则 `Prop` 的每个元素都在 `U` 和 `V` 中。若 `p` 为假，则 `U` 是单点 `{True}`，`V` 是单点 `{False}`。

接下来，我们用 `choose` 从 `U` 和 `V` 各选一个元素：

```lean
  let u : Prop := choose exU
  let v : Prop := choose exV
  have u_def : U u := choose_spec exU
  have v_def : V v := choose_spec exV
```

`U` 和 `V` 各自是析取，因此 `u_def` 和 `v_def` 代表四种情形。其中一种情形是 `u = True` 且 `v = False`，其余情形中 `p` 为真。于是我们有：

```lean
  have not_uv_or_p : u ≠ v ∨ p := by
    match u_def, v_def with
    | Or.inr h, _ => exact Or.inr h
    | _, Or.inr h => exact Or.inr h
    | Or.inl hut, Or.inl hvf =>
      apply Or.inl
      simp [hvf, hut, true_ne_false]
```

另一方面，若 `p` 为真，则由函数外延性与命题外延性，`U` 与 `V` 相等。由 `u` 与 `v` 的定义，这蕴含它们也相等。

```lean
  have p_implies_uv : p → u = v :=
    fun hp =>
    have hpred : U = V :=
      funext fun x =>
        have hl : (x = True ∨ p) → (x = False ∨ p) :=
          fun _ => Or.inr hp
        have hr : (x = False ∨ p) → (x = True ∨ p) :=
          fun _ => Or.inr hp
        show (x = True ∨ p) = (x = False ∨ p) from
          propext (Iff.intro hl hr)
    have h₀ : ∀ exU exV, @choose _ U exU = @choose _ V exV := by
      rw [hpred]; intros; rfl
    show u = v from h₀ _ _
```

把最后两个事实合在一起即得所需结论：

```lean
  match not_uv_or_p with
  | Or.inl hne =>
    exact Or.inr (mt p_implies_uv hne)
  | Or.inr h   =>
    exact Or.inl h
```

排中律的后果包括双重否定消去、分情形证明与反证法，均在第 3 章「经典逻辑」一节描述。排中律与命题外延性蕴含命题完备性：

```lean
open Classical
theorem propComplete (a : Prop) : a = True ∨ a = False :=
  match em a with
  | Or.inl ha =>
    Or.inl (propext (Iff.intro (fun _ => True.intro) (fun _ => ha)))
  | Or.inr hn =>
    Or.inr (propext (Iff.intro (fun h => hn h) (fun h => False.elim h)))
```

与选择一起，我们还得到更强的原理：每个命题都可判定。回忆 `Decidable` 命题类定义如下：

```lean
namespace Hidden
------
class inductive Decidable (p : Prop) where
  | isFalse (h : ¬p) : Decidable p
  | isTrue  (h : p)  : Decidable p
------
end Hidden
```

（环境中有 `variable {p : Prop} {f : α → β} {c : Prop} [Decidable c] {t e : α}`、`open Classical (choose propDecidable)`。）

与只能消去到 `Prop` 的 `p ∨ ¬ p` 不同，类型 `Decidable p` 等价于和类型 `Sum p (¬ p)`，它可以消去到任意类型。写出 if-then-else 表达式需要这种数据。

作为经典推理的例子，我们用 `choose` 证明：若 `f : α → β` 单射且 `α` 有元素，则 `f` 有左逆。为定义左逆 `linv`，我们使用依赖 if-then-else 表达式。回忆 `if h : c then t else e` 是 `dite c (fun h : c => t) (fun h : ¬ c => e)` 的记法。在 `linv` 的定义中，选择被用了两次：首先表明 `(∃ a : α, f a = b)` 是「可判定的」，然后选出满足 `f a = b` 的 `a`。注意 `propDecidable` 是作用域实例，由 `open Classical` 激活。我们用该实例来论证 `if`-`then`-`else` 表达式。（另见第 10 章「可判定命题」的讨论。）

```lean
open Classical

noncomputable def linv [Inhabited α] (f : α → β) : β → α :=
  fun b : β => if ex : (∃ a : α, f a = b) then choose ex else default

theorem linv_comp_self {f : α → β} [Inhabited α]
                       (inj : ∀ {a b}, f a = f b → a = b)
                       : linv f ∘ f = id :=
  funext fun a =>
    have ex  : ∃ a₁ : α, f a₁ = f a := ⟨a, rfl⟩
    have feq : f (choose ex) = f a  := choose_spec ex
    calc linv f (f a)
      _ = choose ex := rfl
      _ = a         := inj feq
```

从经典观点看，`linv` 是一个函数。从构造观点看，它不可接受；因为一般无法这样实现函数，该构造没有信息性。