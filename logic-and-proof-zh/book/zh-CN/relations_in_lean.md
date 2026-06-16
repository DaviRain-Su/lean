# 第 14 章：Lean 中的关系

> 本译文对应原书 [Relations in Lean](https://leanprover.github.io/logic_and_proof/relations_in_lean.html)；英文 Sphinx 源：`relations_in_lean.rst`。

在上一章中，我们指出集合论者把集合 $A$ 上的二元关系 $R$ 看作有序对的集合，因此 $R(a, b)$ 实际上意味着 $(a, b) \in R$。另一种观点是把 $R$ 看作一个函数，当把它应用于 $a$ 和 $b$ 时，返回命题 "$R(a, b)$ 成立"。这是 Lean 采用的观点：类型 `A` 上的二元关系是一个函数 `A → A → Prop`。记住箭头是右结合的，因此 `A → A → Prop` 实际上是 `A → (A → Prop)`。所以，给定 `a : A`，`R a` 是一个谓词（与 `a` 相关的性质）；给定 `a b : A`，`R a b` 是一个命题。

## 14.1. 序关系

利用一阶逻辑，我们可以说一个关系是自反的、对称的、传递的、反对称的等：

```lean
namespace hidden

variable {A : Type}

def Reflexive (R : A → A → Prop) : Prop :=
∀ x, R x x

def Symmetric (R : A → A → Prop) : Prop :=
∀ x y, R x y → R y x

def Transitive (R : A → A → Prop) : Prop :=
∀ x y z, R x y → R y z → R x z

def AntiSymmetric (R : A → A → Prop) : Prop :=
∀ x y, R x y → R y x → x = y

def Irreflexive (R : A → A → Prop) : Prop :=
∀ x, ¬ R x x

def Total (R : A → A → Prop) : Prop :=
∀ x y, R x y ∨ R y x

end hidden
```

注意 Lean 会在必要时展开这些定义，例如把 `Reflexive R` 当作 `∀ x, R x x`。

```lean
variable (R : A → A → Prop)

example (h : Reflexive R) (x : A) : R x x := h x

example (h : Symmetric R) (x y : A) (h1 : R x y) : R y x :=
h x y h1

example (h : Transitive R) (x y z : A) (h1 : R x y) (h2 : R y z) :
  R x z :=
h x y z h1 h2

example (h : AntiSymmetric R) (x y : A) (h1 : R x y)
    (h2 : R y x) :
  x = y :=
h x y h1 h2
```

在命令 `variable {A : Type}` 中，我们用花括号把 `A` 包起来，表示它是一个**隐式**参数，也就是说，你不需要显式写出它；Lean 可以从参数 `R` 推断出来。这就是为什么我们可以写 `Reflexive R` 而不是 `Reflexive A R`：Lean 知道 `R` 是 `A` 上的二元关系，因此能推断出我们指的是 `A` 上二元关系的自反性。

给定 `h : Transitive R`、`h1 : R x y`、`h2 : R y z`，要证明 `R x z` 还得写 `h x y z h1 h2` 很烦人。毕竟，Lean 应该能从 `h1` 是 `R x y`、`h2` 是 `R y z` 这一事实推断出我们在说 `x`、`y`、`z` 处的传递性。确实，我们可以用下划线替换这些信息：

```lean
variable (R : A → A → Prop)

example (h : Transitive R) (x y z : A) (h1 : R x y)
    (h2 : R y z) :
  R x z :=
h _ _ _ h1 h2
```

但输入下划线也很烦。最好的解决方案是把传递性假设的参数 `x y z` 也声明为隐式。我们可以在定义中给这些变量加上花括号来做到这一点。

```lean
def Transitive' (R : A → A → Prop) : Prop :=
∀ {x} {y} {z}, R x y → R y z → R x z

def Transitive (R : A → A → Prop) : Prop :=
∀ {x y z}, R x y → R y z → R x z

variable (R : A → A → Prop)

example (h : Transitive R) (x y z : A) (h1 : R x y)
    (h2 : R y z) :
  R x z :=
h h1 h2
```

事实上，`Reflexive`、`Symmetric`、`Transitive` 等概念在 Mathlib 中正是以这种方式定义的，因此我们只需在文件顶部 `import Mathlib.Init.Logic` 就可以使用它们。

```lean
import Mathlib.Init.Logic

#check Reflexive
#check Symmetric
#check Transitive
#check AntiSymmetric
#check Irreflexive
```

我们把临时定义放在 `hidden` 命名空间中；这意味着我们版本的 `Reflexive` 全名是 `hidden.Reflexive`，即使我们导入该模块，也不会与库中定义的那个冲突。

在[13.1 节](relations.md#131-序关系)中我们证明了严格偏序——即传递且反自反的二元关系——也是反对称的。下面是该事实在 Lean 中的证明。

```lean
example (h1 : Irreflexive R) (h2 : Transitive R) :
    ∀ x y, R x y → ¬ R y x := by
  intro x y
  intro (h3 : R x y)
  intro (h4 : R y x)
  have h5 : R x x := h2 h3 h4
  have h6 : ¬ R x x := h1 x
  show False
  exact h6 h5

variable A : Type
variable R : A → A → Prop
```

在数学中，通常用中缀记法和像 `≼`（输入 `\preceq`）这样的符号表示偏序。Lean 支持这种做法：

```lean
section
variable (A : Type)
variable (R : A → A → Prop)

-- type \preceq for the symbol ≼
local infix:50 " ≼ " => R

example (h1 : Irreflexive R) (h2 : Transitive R) :
    ∀ x y, x ≼ y → ¬ y ≼ x := by
  intro x y
  intro (h3 : x ≼ y)
  intro (h4 : y ≼ x)
  have h5 : x ≼ x := h2 h3 h4
  have h6 : ¬ x ≼ x := h1 x
  show False
  exact h6 h5

end
```

偏序的结构由一个类型 `A`（传统上是一个集合 `A`）及其上的二元关系 `le : A → A → Prop`（“lesser or equal” 的缩写）组成，该关系自反、传递、反对称。我们可以在 Lean 中把这个结构打包成一个“类”。

```lean
class PartialOrder (A : Type u) where
  le : A → A → Prop
  refl : Reflexive le
  trans : Transitive le
  antisymm : ∀ {a b : A}, le a b → le b a → a = b

-- type \preceq for the symbol ≼
local infix:50 " ≼ " => PartialOrder.le
```

假设我们有一个类型 `A` 是偏序，我们可以定义对应的严格偏序 `lt : A → A → Prop`（“lesser than” 的缩写），并证明它确实是一个严格序。我们还为 `le` 引入记号 `≺`，可以用 `\prec` 输入。

```lean
namespace PartialOrder
variable {A : Type} [PartialOrder A]

def lt (a b : A) : Prop := a ≼ b ∧ a ≠ b

-- type \prec for the symbol ≺
local infix:50 " ≺ " => lt

theorem irrefl_lt (a : A) : ¬ (a ≺ a) := by
  intro (h : a ≺ a)
  have : a ≠ a := And.right h
  have : a = a := rfl
  contradiction

theorem trans_lt {a b c : A} (h₁ : a ≺ b) (h₂ : b ≺ c) : a ≺ c :=
  have : a ≼ b := And.left h₁
  have : a ≠ b := And.right h₁
  have : b ≼ c := And.left h₂
  have : b ≠ c := And.right h₂
  have : a ≼ c := trans ‹a ≼ b› ‹b ≼ c›
  have : a ≠ c :=
    fun hac : a = c ↦
    have : c ≼ b := by rw [← hac]; assumption
    have : b = c := antisymm ‹b ≼ c› ‹c ≼ b›
    show False from ‹b ≠ c› ‹b = c›
  show a ≺ c from And.intro ‹a ≼ c› ‹a ≠ c›

end PartialOrder
```

变量声明 `[PartialOrder A]` 可以读作“假设 `A` 是一个偏序”。然后 Lean 会使用这个 `PartialOrder` 类的“实例”来推断 `le` 和 `lt` 指什么。

证明中使用了匿名 `have`，并通过法文引号 ``\f<` 和 `\f>`` 或 `assumption`（在策略模式中）引用它们。传递性证明从项模式切换到策略模式，以使用 `rewrite` 把 `c` 替换为 `a` 在 `a ≤ b` 中。回想 `contradiction` 指示 Lean 在上下文中找出一个假设及其否定，从而完成证明。

我们甚至可以类似地定义类 `StrictPartialOrder`，然后用上面的定理证明任何（弱）`PartialOrder` 也是一个 `StrictPartialOrder`。

```lean
class StrictPartialOrder (A : Type u) where
  lt : A → A → Prop
  irrefl : Irreflexive lt
  trans : Transitive lt

-- type \prec for the symbol ≺
local infix:50 " ≺ " => StrictPartialOrder.lt

instance {A : Type} [PartialOrder A] : StrictPartialOrder A where
  lt          := PartialOrder.lt
  irrefl      := PartialOrder.irrefl_lt
  trans _ _ _ := PartialOrder.trans_lt

example (a : A) [PartialOrder A] : ¬ a ≺ a :=
StrictPartialOrder.irrefl a
```

一旦证明了这个实例，我们就能在任何偏序上使用继承来的 `≺`（不是我们在 `PartialOrder` 命名空间中定义的那个！）以及关于 `StrictPartialOrder` 的事实。

在[13.1 节](relations.md#131-序关系)中，我们还提到可以从严格偏序定义（弱）偏序。我们在下面的练习中要求你形式化地做到这一点。

Mathlib 大致以与我们相同的方式定义 `PartialOrder`，这就是为什么我们把我们的定义放在 `hidden` 命名空间中，使我们的定义在命名空间外被称为 `hidden.PartialOrder` 而不是直接叫 `PartialOrder`。Mathlib 中没有 `StrictPartialOrder` 定义，但给定偏序后我们可以引用严格偏序。Mathlib 使用的记号是更常见的 `≤`（输入 `\le`）和 `<`。

这里再举一个例子。假设 `R` 是类型 `A` 上的二元关系，我们定义 `S x y` 表示 `R x y` 和 `R y x` 都成立。下面我们证明所得关系是自反且对称的。

```lean
section
axiom A : Type
axiom R : A → A → Prop

variable (h1 : Transitive R)
variable (h2 : Reflexive R)

def S (x y : A) := R x y ∧ R y x

example : Reflexive S :=
fun x ↦
  have : R x x := h2 x
  show S x x from And.intro this this

example : Symmetric S :=
fun x y ↦
fun h : S x y ↦
have h1 : R x y := h.left
have h2 : R y x := h.right
show S y x from ⟨h2, h1⟩

end
```

在第一个例子中，我们使用匿名 `have`，然后用关键字 `this` 引用它。在第二个例子中，我们把 `And.left h` 和 `And.right h` 简写为 `h.left` 和 `h.right`。我们还用匿名构造子把 `And.intro h2 h1` 简写为 `⟨h2, h1⟩`。Lean 会推断出我们要证明一个合取，并推断出 `And.intro` 是相关的引入规则。你可以用 `\<` 和 `\>` 输入尖括号。

## 14.2. 数上的序

方便的是，Lean 已经在 Mathlib 中定义了自然数、整数等上的通常序。

```lean
import Mathlib.Data.Nat.Defs

open Nat
variable (n m : ℕ)

#check 0 ≤ n
#check n < n + 1

example : 0 ≤ n := Nat.zero_le n
example : n < n + 1 := lt_succ_self n

example (h : n + 1 ≤ m) : n < m + 1 :=
have h1 : n < n + 1 := lt_succ_self n
have h2 : n < m := lt_of_lt_of_le h1 h
have h3 : m < m + 1 := lt_succ_self m
show n < m + 1 from lt_trans h2 h3
```

Lean 中有许多用于证明不等关系事实的定理。这里列出一些常见的。

```lean
import Mathlib.Order.Basic

variable (A : Type) [PartialOrder A]
variable (a b c : A)

#check (le_trans : a ≤ b → b ≤ c → a ≤ c)
#check (lt_trans : a < b → b < c → a < c)
#check (lt_of_lt_of_le : a < b → b ≤ c → a < c)
#check (lt_of_le_of_lt : a ≤ b → b < c → a < c)
#check (le_of_lt : a < b → a ≤ b)
```

注意我们假设了 `A` 上有一个 `PartialOrder` 实例。还有一些特定于某些论域的性质，例如自然数：

```lean
import Mathlib.Data.Nat.Defs

variable (n : ℕ)

#check (Nat.zero_le : ∀ n : ℕ, 0 ≤ n)
#check (Nat.lt_succ_self : ∀ n : ℕ, n < n + 1)
#check (Nat.le_succ : ∀ n : ℕ, n ≤ n + 1)
```

## 14.3. 等价关系

在[13.3 节](relations.md#133-等价关系与相等)中我们看到，**等价关系**是某个论域 $A$ 上自反、对称且传递的二元关系。我们马上会在 Lean 中看到这种关系，但首先定义另一种称为**预序**（preorder）的关系，它是自反且传递的二元关系。同样，我们用一个 `class` 来捕获这些数据。

```lean
import Mathlib.Order.Basic

namespace hidden

variable {A : Type}

class Preorder (A : Type u) where
  le : A → A → Prop
  refl : Reflexive le
  trans : Transitive le

end hidden
```

Lean 的库提供了它自己的预序表述。为了使用相同的名字，我们必须把它放在 `hidden` 命名空间中。Lean 的库还定义了关系的其他性质，例如：

在预序定义的基础上，我们可以把偏序描述为反对称的预序，把等价关系描述为对称的预序。

```lean
import Mathlib.Order.Basic

namespace hidden

variable {A : Type}

class Preorder (A : Type u) where
  le : A → A → Prop
  refl : Reflexive le
  trans : Transitive le

class PartialOrder (A : Type u) extends Preorder A where
  antisymm : AntiSymmetric le

class Equivalence (A : Type u) extends Preorder A where
  symm : Symmetric le

end hidden
```

定义中的 `extends Preorder A` 使 `PartialOrder` 成为一个自动继承 `Preorder` 所有定义和定理的类。特别地，`le`、`refl`、`trans` 成为 `PartialOrder` 数据的一部分。以这种方式使用类，我们可以写出非常通用的证明（例如只关于预序的证明），并在更具体的上下文中应用它们（例如关于等价关系和偏序的证明）。

注意：我们可能**不想**以这种方式专门设计库。因为我们可能想用 `≤` 作为偏序的记号，但用 `~` 或 `≈` 作为等价关系的记号。事实上 Mathlib 并没有把 `Equivalence` 定义为 `PartialOrder` 的扩展。

在[13.3 节](relations.md#133-等价关系与相等)中我们声称，还有另一种方式定义等价关系，即一个满足以下两条性质的二元关系：

- $\forall a (a \equiv a)$
- $\forall a, b, c (a \equiv b \land c \equiv b \to a \equiv c)$

我们在下面互相推导这两种定义。

```lean
import Mathlib.Order.Basic

namespace hidden

class Equivalence (A : Type u) where
  R : A → A → Prop
  refl : Reflexive R
  symm : Symmetric R
  trans : Transitive R

local infix:50 " ~ " => Equivalence.R

class Equivalence' (A : Type u) where
  R : A → A → Prop
  refl : Reflexive R
  trans' : ∀ {a b c}, R a b → R c b → R a c

-- type ``≈`` as ``\~~``
local infix:50 " ≈ " => Equivalence'.R

section
variable {A : Type u}

theorem Equivalence.trans' [Equivalence A] {a b c : A} :
    a ~ b → c ~ b → a ~ c := by
  intro (hab : a ~ b)
  intro (hcb : c ~ b)
  apply trans hab
  show b ~ c
  exact symm hcb

example [Equivalence A] : Equivalence' A where
  R := Equivalence.R
  refl := Equivalence.refl
  trans':= Equivalence.trans'

theorem Equivalence'.symm [Equivalence' A] {a b : A} :
    a ≈ b → b ≈ a := by
  intro (hab : a ≈ b)
  have hbb : b ≈ b := Equivalence'.refl b
  show b ≈ a
  exact Equivalence'.trans' hbb hab

theorem Equivalence'.trans [Equivalence' A] {a b c : A} :
  a ≈ b → b ≈ c → a ≈ c := by
  intro (hab : a ≈ b) (hbc : b ≈ c)
  have hcb : c ≈ b := Equivalence'.symm hbc
  show a ≈ c
  exact Equivalence'.trans' hab hcb

example [Equivalence' A] : Equivalence A where
  R := Equivalence'.R
  refl := Equivalence'.refl
  symm _ _:= Equivalence'.symm
  trans _ _ _ := Equivalence'.trans

end
end hidden
```

对其中一个定义我们使用中缀记号 `~`，对另一个使用 `≈`。（你可以用 `\~~` 输入 `≈`。）我们用 `example` 而不是 `instance`，这样我们就不会真正实例化这些类。

## 14.4. 练习

1. 替换下面证明中的 `sorry`，证明我们可以从一个严格偏序 `R` 构造出一个偏序 `R'`。

```lean
import Mathlib.Order.Basic

class StrictPartialOrder (A : Type u) where
  lt : A → A → Prop
  irrefl : Irreflexive lt
  trans : Transitive lt

local infix:50 " ≺ " => StrictPartialOrder.lt

section
variable {A : Type u} [StrictPartialOrder A]

def R' (a b : A) : Prop :=
(a ≺ b) ∨ a = b

local infix:50 " ≼ " => R'

theorem reflR' (a : A) : a ≼ a := sorry

theorem transR' {a b c : A} (h1 : a ≼ b) (h2 : b ≼ c) :
  a ≼ c :=
sorry

theorem antisymmR' {a b : A} (h1 : a ≼ b) (h2 : b ≼ a) :
  a = b :=
sorry

end
```

2. 把 `sorry` 替换为证明。

```lean
import Mathlib.Order.Basic

namespace hidden
class Preorder (A : Type u) where
    le : A → A → Prop
    refl : Reflexive le
    trans : Transitive le

namespace Preorder
def S (a b : A) [Preorder A] : Prop := le a b ∧ le b a

example (A : Type u) [Preorder A] {x y z : A} :
  S x y → S y z → S x z :=
sorry

end Preorder
end hidden
```

3. 下面两个定理中只有一个可证。找出哪个是真的，并把 `sorry` 替换为完整证明。

```lean
import Mathlib.Order.Basic

axiom A : Type
axiom a : A
axiom b : A
axiom c : A
axiom R : A → A → Prop
axiom Rab : R a b
axiom Rbc : R b c
axiom nRac : ¬ R a c

-- Prove one of the following two theorems:

theorem R_is_strict_partial_order :
  Irreflexive R ∧ Transitive R :=
sorry

theorem R_is_not_strict_partial_order :
  ¬(Irreflexive R ∧ Transitive R) :=
sorry
```

4. 完成以下证明。你可以使用 Mathlib 中的结果。

```lean
import Mathlib.Data.Nat.Defs

section
open Nat
variable (n m : ℕ)

example : 1 ≤ 4 :=
sorry

end
```
