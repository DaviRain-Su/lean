# 第 16 章：Lean 中的函数

> 本译文对应原书 [Functions in Lean](https://leanprover.github.io/logic_and_proof/functions_in_lean.html)；英文 Sphinx 源：`functions_in_lean.rst`。

## 16.1. 函数与符号逻辑

现在让我们用形式化术语考虑函数。尽管我们在上一章的定义中避免使用量词和逻辑符号，但现在你应该能看到它们潜藏在表面之下。两个函数 $f, g : X \to Y$ 相等当且仅当它们在每个输入上取相同值，这一事实可以表达为：

$$
\forall x \in X \, (f(x) = g(x)) \leftrightarrow f = g.
$$

这一原则称为**函数外延性**（function extensionality），类似于[12.1 节](sets_in_lean.md#121-基础)中讨论的集合外延性。回想一下，记号 $\forall x \in X \, P(x)$ 是 $\forall x (x \in X \to P(x))$ 的简写，$\exists x \in X \, P(x)$ 是 $\exists x (x \in X \land P(x))$ 的简写，从而把量词相对化到 $X$。

如果我们假设自己在一种具有 $X$ 和 $Y$ 基本类型的逻辑形式主义中工作，就可以指明 $x$ 取值于 $X$，从而避免集合论记号。在这种情况下，我们会写成

$$
\forall x : X \, (f(x) = g(x) \leftrightarrow f = g)
$$

来表示量词覆盖 $X$。今后，我们将假设所有变量都取值于某个类型，尽管当类型能从上下文中推断时，我们有时会省略量词中的类型。

函数 $f$ 是单射，如果它满足

$$
\forall x_1, x_2 : X \, (f(x_1) = f(x_2) \to x_1 = x_2),
$$

而 $f$ 是满射，如果

$$
\forall y : Y \, \exists x : X \, f(x) = y.
$$

如果 $f : X \to Y$，$g : Y \to X$，那么 $g$ 是 $f$ 的左逆，如果

$$
\forall x : X \, g(f(x)) = x.
$$

注意这是一个全称陈述，并且它等价于“$f$ 是 $g$ 的右逆”这一陈述。

记住，在逻辑中常用 lambda 记号定义函数。我们可以用 $\lambda x \, x$ 表示恒等函数，或者用 $\lambda x : X \, x$ 强调函数的定义域是 $X$。如果 $f : X \to Y$，$g : Y \to Z$，我们可以通过 $g \circ f = \lambda x : X \, g(f(x))$ 定义复合。

还要记住，如果 $P(x)$ 是任意谓词，那么在一阶逻辑中我们可以断言存在唯一满足 $P(x)$ 的 $x$，写作 $\exists ! x \, P(x)$，它是以下两个陈述的合取：

- $\exists x \, P(x)$
- $\forall x_1, x_2 \, (P(x_1) \land P(x_2) \to x_1 = x_2)$

等价地，我们可以写成

$$
\exists x \, (P(x) \land \forall x' \, (P(x') \to x' = x)).
$$

假设 $\exists ! x \, P(x)$，以下两个陈述等价：

- $\exists x \, (P(x) \land Q(x))$
- $\forall x \, (P(x) \to Q(x))$

两者都可以理解为“满足 $P$ 的 $x$ 也满足 $Q$”。

$X$ 和 $Y$ 上的二元关系 $R$ 是函数式的，如果它满足

$$
\forall x \, \exists ! y \, R(x, y).
$$

在这种情况下，逻辑学家可能使用 **iota 记号**，

$$
f(x) = \iota y \, R(x, y)
$$

来定义 $f(x)$ 等于满足 $R(x, y)$ 的唯一 $y$。如果 $R$ 满足更弱的性质

$$
\forall x \, \exists y \, R(x, y),
$$

逻辑学家可能使用 **Hilbert epsilon** 来定义一个函数

$$
f(x) = \varepsilon y \, R(x, y)
$$

以“选择”一个满足 $R(x, y)$ 的 $y$。正如我们上面所指出的，这是选择公理的隐含使用。

## 16.2. 二阶与高阶逻辑

与一阶逻辑（我们从固定的函数符号和关系符号库开始）相比，最近几章讨论的主题鼓励我们考虑一种更具表达力的语言，其中变量也取值于函数和关系。例如，说函数 $f : X \to Y$ 有左逆就隐含涉及对函数的量词：

$$
\exists g \, \forall x \, g(f(x)) = x.
$$

断言如果任何函数 $f$ 从 $X$ 到 $Y$ 是单射，那么它就有左逆，可以表达为：

$$
\forall x_1, x_2 \, (f(x_1) = f(x_2) \to x_1 = x_2) \to \exists g \, \forall x \, g(f(x)) = x.
$$

类似地，说两个集合 $X$ 和 $Y$ 之间存在一一对应，断言存在函数 $f : X \to Y$ 及其逆。再举一个例子，在[15.4 节](functions.md#154-函数与关系)中我们断言每个函数式关系都产生一个对应的函数，反之亦然。

这些陈述的有趣之处在于它们涉及对函数和关系的存在与全称量词。这把我们带出了一阶逻辑的范围。一种选择是在一阶逻辑语言中发展一种理论，其中宇宙包含作为对象的函数和关系；我们稍后将会看到，这正是公理化集合论所做的。另一种选择是扩展一阶逻辑，引入新的量词和变量种类来覆盖函数和关系。这就是**高阶逻辑**所做的。

有多种方式可以做到这一点。鉴于前面描述的函数与关系之间的关系，可以把关系作为基本的，并在此基础上定义函数，或者反过来。以下高阶逻辑表述归功于逻辑学家 Alonzo Church，采用后一种方法。它有时称为**简单类型论**。

从一些基本类型 $X, Y, Z, \ldots$ 和一个特殊类型 $\mathit{Prop}$（命题类型）开始。添加以下两条规则来构造新类型：

- 如果 $U$ 和 $V$ 是类型，那么 $U \times V$ 也是类型。
- 如果 $U$ 和 $V$ 是类型，那么 $U \to V$ 也是类型。

第一条旨在表示有序对 $(u, v)$ 的类型，其中 $u \in U$，$v \in V$。第二条旨在表示从 $U$ 到 $V$ 的函数类型。简单类型论现在添加以下形成表达式的方式：

- 如果 $u$ 是类型 $U$，$v$ 是类型 $V$，那么 $(u, v)$ 是类型 $U \times V$。
- 如果 $p$ 是类型 $U \times V$，那么 $(p)_1$ 是类型 $U$，$(p)_2$ 是类型 $V$。（它们旨在表示对 $p$ 的第一和第二分量。）
- 如果 $x$ 是类型 $U$ 的变量，$v$ 是类型 $V$ 的任意表达式，那么 $\lambda x \, v$ 是类型 $U \to V$。
- 如果 $f$ 是类型 $U \to V$，$u$ 是类型 $U$，那么 $f(u)$ 是类型 $V$。

此外，简单类型论还提供一阶逻辑中所有的命题构造方式——布尔联结词、量词和相等。

一个接受 $X$ 和 $Y$ 中元素并返回类型 $Z$ 的函数 $f(x, y)$ 被看作类型 $X \times Y \to Z$ 的对象。类似地，$X$ 和 $Y$ 上的二元关系 $R(x, y)$ 被看作类型 $X \times Y \to \mathit{Prop}$ 的对象。高阶逻辑之所以“高阶”，在于我们可以无限次迭代函数类型构造。例如，如果 $\mathbb{N}$ 是自然数类型，$\mathbb{N} \to \mathbb{N}$ 表示从自然数到自然数的函数类型，而 $(\mathbb{N} \to \mathbb{N}) \to \mathbb{N}$ 表示以函数为参数并返回自然数的函数 $F(f)$ 的类型。

我们没有非常仔细地指定高阶逻辑的语法和规则。这在许多更高级的逻辑教科书中都有介绍。只允许基本类型上的函数和关系（不迭代这些构造）的高阶逻辑片段称为**二阶逻辑**。

这些概念应该看起来很熟悉；我们在 Lean 中一直在使用类似的构造和记号。事实上，Lean 的逻辑是一个更精细、更具表达力的逻辑系统，完全包含了我们在这里讨论的所有高阶逻辑概念。

## 16.3. Lean 中的函数

我们讨论的概念具有如此直接的逻辑形式，这意味着在 Lean 中定义它们很容易。Lean 中的形式表示与上面的非正式表示之间的主要区别在于，在 Lean 中，我们区分类型 `X` 和该类型的子集 `A : Set X`。

在 Lean 库中，复合和恒等定义如下：

```lean
variable {X Y Z : Type}

def comp (f : Y → Z) (g : X → Y) : X → Z :=
fun x ↦ f (g x)

infixr:50 " ∘ " => comp

def id (x : X) : X :=
x
```

通常，我们使用 `funext`（“function extensionality” 的缩写）来证明两个函数相等。

```lean
example (f g : X → Y) (h : ∀ x, f x = g x) : f = g :=
funext h
```

但 Lean 可以通过简单地展开定义和化简表达式，使用自反性来证明一些基本恒等式。

```lean
lemma left_id (f : X → Y) : id ∘ f = f := rfl

lemma right_id (f : X → Y) : f ∘ id = f := rfl

theorem comp.assoc (f : Z → W) (g : Y → Z) (h : X → Y) :
  (f ∘ g) ∘ h = f ∘ (g ∘ h) := rfl

theorem comp.left_id (f : X → Y) : id ∘ f = f := rfl

theorem comp.right_id (f : X → Y) : f ∘ id = f := rfl
```

我们可以定义 $f$ 为单射、满射或双射的含义：

```lean
def Injective (f : X → Y) : Prop :=
∀ ⦃x₁ x₂⦄, f x₁ = f x₂ → x₁ = x₂

def Surjective (f : X → Y) : Prop :=
∀ y, ∃ x, f x = y

def Bijective (f : X → Y) := Injective f ∧ Surjective f
```

在 `Injective` 的定义中把变量 `x₁` 和 `x₂` 标记为隐式，意味着我们不必经常写出它们。具体地，给定 `h : Injective f` 和 `h₁ : f x₁ = f x₂`，我们写 `h h₁` 而不是 `h x₁ x₂ h₁` 来证明 `x₁ = x₂`。

然后我们可以证明恒等函数是双射的：

更有趣的是，我们可以证明单射函数的复合是单射，等等。

```lean
theorem Injective.comp {g : Y → Z} {f : X → Y}
    (Hg : Injective g) (Hf : Injective f) :
  Injective (g ∘ f) := by
  intro x₁ x₂ (h : (g ∘ f) x₁ = (g ∘ f) x₂)
  have : f x₁ = f x₂ := Hg h
  show x₁ = x₂
  exact Hf this

theorem Surjective.comp {g : Y → Z} {f : X → Y}
    (hg : Surjective g) (hf : Surjective f) :
  Surjective (g ∘ f) := by
  intro z
  cases hg z with
  | intro y hy =>
    cases hf y with
    | intro x hx =>
      show ∃ a, (g ∘ f) a = z
      rw [← hy, ← hx]
      show ∃ a, (g ∘ f) a = g (f x)
      exact ⟨x, rfl⟩

theorem Bijective.comp {g : Y → Z} {f : X → Y}
    (hg : Bijective g) (hf : Bijective f) :
  Bijective (g ∘ f) :=
have gInj : Injective g := hg.left
have gSurj : Surjective g := hg.right
have fInj : Injective f := hf.left
have fSurj : Surjective f := hf.right
And.intro (Injective.comp gInj fInj)
  (Surjective.comp gSurj fSurj)
```

左逆和右逆的概念以预期方式定义。

```lean
-- g 是 f 的左逆
def LeftInverse (g : Y → X) (f : X → Y) : Prop :=
∀ x, g (f x) = x

-- g 是 f 的右逆
def RightInverse (g : Y → X) (f : X → Y) : Prop :=
LeftInverse f g
```

特别地，与左逆或右逆复合得到恒等函数。

```lean
def LeftInverse.comp_eq_id {g : Y → X} {f : X → Y} :
  LeftInverse g f → g ∘ f = id :=
fun H ↦ funext H

def RightInverse.comp_eq_id {g : Y → X} {f : X → Y} :
  RightInverse g f → f ∘ g = id :=
fun H ↦ funext H
```

注意我们需要用 `funext` 来证明函数的相等。

下面表明，如果函数有左逆，则它是单射；如果有右逆，则它是满射。

```lean
theorem LeftInverse.injective {g : Y → X} {f : X → Y} :
  LeftInverse g f → Injective f := by
  intro h x₁ x₂ feq
  calc x₁ = g (f x₁) := by rw [h]
        _ = g (f x₂) := by rw [feq]
        _ = x₂       := by rw [h]

theorem RightInverse.surjective {g : Y  → X} {f : X → Y} :
  RightInverse g f → Surjective f :=
  fun h y ↦
  let x : X := g y
  have : f x = y :=
    calc
      f x  = (f (g y)) := by rfl
         _ = y         := by rw [h y]
  show ∃ x, f x = y from Exists.intro x this
```

注意，与 `have` 类似，我们使用命令 `let` 定义一个中间项。区别在于 `have` 仅用于证明项（类型为 `Prop`），而 `let` 可以用于任何项。

## 16.4. 经典地定义逆

上一节列出的所有定理都在 Lean 库中，当你 `import Mathlib` 并用 `open Function` 打开函数命名空间时就可以使用：

```lean
import Mathlib
open Function

#check comp
#check LeftInverse
#check HasRightInverse
```

然而，定义逆函数需要经典推理，这通过打开经典命名空间获得：

```lean
import Mathlib
open Classical

section
  variable (A B : Type)
  variable (P : A → Prop)
  variable (R : A → B → Prop)

  example : (∀ x, ∃ y, R x y) → ∃ f : A → B, ∀ x, R x (f x) :=
  axiomOfChoice

  example (h : ∃ x, P x) : P (choose h) :=
  choose_spec h
end
```

选择公理告诉我们，如果对每个 `x : X` 都存在满足 `R x y` 的 `y : Y`，那么就存在函数 `f : X → Y`，对每个 `x` 选择这样的 `y`。在 Lean 中，这个“公理”是用经典构造来证明的，即 `choose` 函数（有时称为“不定描述算子”），给定存在某个满足 `P x` 的选择 `x`，它就返回这样的 `x`。利用这些构造，逆函数定义如下：

```lean
import Mathlib
open Classical Function

variable {X Y : Type}

noncomputable def inverse (f : X → Y) (default : X) : Y → X :=
fun y ↦ if h : ∃ x, f x = y then choose h else default
```

Lean 要求我们承认这个定义不是可计算的，因为首先，可能无法算法地判定条件 `h` 是否成立；即使可以，也可能无法算法地找到合适的 `x$ 值。

下面，命题 `inverse_of_exists` 断言 `inverse` 满足其规范，随后的定理表明如果 `f` 是单射，那么 `inverse` 函数确实是左逆。

```lean
theorem inverse_of_exists (f : X → Y) (default : X) (y : Y)
    (h : ∃ x, f x = y) :
  f (inverse f default y) = y := by
  have h1 : inverse f default y = choose h := dif_pos h
  have h2 : f (choose h) = y := choose_spec h
  rw [h1, h2]

theorem is_left_inverse_of_injective (f : X → Y) (default : X)
  (injf : Injective f) :
LeftInverse (inverse f default) f :=
  let finv := (inverse f default)
  fun x ↦
  have h1 : ∃ x', f x' = f x := Exists.intro x rfl
  have h2 : f (finv (f x)) = f x := inverse_of_exists f default (f x) h1
  show finv (f x) = x from injf h2
```

## 16.5. Lean 中的函数与集合

在[7.4 节](first_order_logic.md#74-相对化与类)中，我们看到如何在形式化“每个大于 2 的素数都是奇数”“某个素数是偶数”这类短语时表示相对化的全称和存在量词。类似地，我们可以把陈述相对化到集合。在符号逻辑中，$\exists x \in A \, P(x)$ 简写为 $\exists x (x \in A \land P(x))$，$\forall x \in A \, P(x)$ 简写为 $\forall x (x \in A \to P(x))$。

Lean 也为相对化量词定义了记号：

```lean
variable (X : Type) (A : Set X) (P : X → Prop)

#check ∀ x ∈ A, P x
#check ∃ x ∈ A, P x
```

这里是如何使用有界全称量词的例子：

```lean
example (h : ∀ x ∈ A, P x) (x : X) (h1 : x ∈ A) : P x := h x h1
```

利用有界量词，我们可以讨论函数在特定集合上的行为：

```lean
import Mathlib.Data.Set.Basic
open Set Function

variable {X Y : Type}
variable (A  : Set X) (B : Set Y)

def MapsTo (f : X → Y) (A : Set X) (B : Set Y) :=
  ∀ ⦃x⦄, x ∈ A → f x ∈ B

def InjOn (f : X → Y) (A : Set X) :=
  ∀ ⦃x₁ x₂⦄, x₁ ∈ A → x₂ ∈ A → f x₁ = f x₂ → x₁ = x₂

def SurjOn (f : X → Y) (A : Set X) (B : Set Y) := B ⊆ f '' A
```

表达式 `MapsTo f A B` 断言 `f` 把集合 `A` 中的元素映射到集合 `B`；表达式 `InjOn f A` 断言 `f` 在 `A` 上是单射。表达式 `SurjOn f A B` 断言，把 `f` 看作定义在 `A` 中元素上的函数，它是到集合 `B$ 的满射。下面是使用它们的例子：

```lean
variable (f : X → Y) (A : Set X) (B : Set Y)

example (h : MapsTo f A B) (x : X) (h1 : x ∈ A) : f x ∈ B := h h1

example (h : InjOn f A) (x₁ x₂ : X) (h1 : x₁ ∈ A) (h2 : x₂ ∈ A)
    (h3 : f x₁ = f x₂) : x₁ = x₂ :=
h h1 h2 h3
```

在下面的例子中，我们将使用带隐式参数的版 本。表达式 `SurjOn f A B` 断言，把 `f` 看作定义在 `A$ 中元素上的函数，它是到集合 `B` 的满射。

有了这些概念，我们可以证明单射函数的复合是单射。证明与上面的类似，但现在必须更小心地把断言相对化到 `A` 和 `B`：

```lean
theorem InjOn.comp (fAB : MapsTo f A B) (hg : InjOn g B) (hf: InjOn f A) :
  InjOn (g ∘ f) A := by
  intro (x1 : X)
  intro (x1A : x1 ∈ A)
  intro (x2 : X)
  intro (x2A : x2 ∈ A)
  have fx1B : f x1 ∈ B := fAB x1A
  have fx2B : f x2 ∈ B := fAB x2A
  intro (h1 : g (f x1) = g (f x2))
  have h2 : f x1 = f x2 := hg fx1B fx2B h1
  show x1 = x2
  exact hf x1A x2A h2
```

类似地，我们可以证明满射函数的复合是满射：

```lean
theorem SurjOn.comp (hg : SurjOn g B C) (hf: SurjOn f A B) :
  SurjOn (g ∘ f) A C := by
intro z
intro (zc : z ∈ C)
cases hg zc with
| intro y h1 => cases hf (h1.left) with
  | intro x h2 =>
    show ∃x, x ∈ A ∧ g (f x) = z
    apply Exists.intro x
    apply And.intro h2.left
    show g (f x) = z
    rw [h2.right]
    show g y = z
    exact h1.right
```

下面表明并集的像等于像的并集：

```lean
import Mathlib.Data.Set.Function
open Set Function

variable {X Y : Type}
variable (A₁ A₂ : Set X)
variable (f : X → Y)

-- BEGIN
theorem image_union : f '' (A₁ ∪ A₂) = f '' A₁ ∪ f '' A₂ := by
  ext y
  constructor
  . intro (h : y ∈ image f (A₁ ∪ A₂))
    cases h with
    | intro x hx =>
      have xA₁A₂ : x ∈ A₁ ∪ A₂ := hx.left
      have fxy : f x = y := hx.right
      cases xA₁A₂ with
      | inl xA₁ => exact Or.inl ⟨x, xA₁, fxy⟩
      | inr xA₂ => exact Or.inr ⟨x, xA₂, fxy⟩
  . intro (h : y ∈ image f A₁ ∪ image f A₂)
    cases h with
    | inl yifA₁ =>
      cases yifA₁ with
      | intro x hx =>
        have xA₁ : x ∈ A₁ := hx.left
        have fxy : f x = y := hx.right
        exact ⟨x, Or.inl xA₁, fxy⟩
    | inr yifA₂ => cases yifA₂ with
      | intro x hx =>
        have xA₂ : x ∈ A₂ := hx.left
        have fxy : f x = y := hx.right
        exact ⟨x, Or.inr xA₂, fxy⟩
```

注意表达式 `y ∈ image f A₁` 展开为 `∃ x, x ∈ A₁ ∧ f x = y`。因此我们需要提供三样信息：一个 `x` 值、一个 `x ∈ A₁` 的证明、以及一个 `f x = y` 的证明。还要注意 `f '' A` 是 `image f A` 的记号。

## 16.6. 练习

1. 填上下 面最后三个证明中的 `sorry`。

```lean
import Mathlib.Tactic.Basic
import Mathlib.Algebra.Ring.Divisibility.Lemmas
open Function Int

def f (x : ℤ) : ℤ := x + 3
def g (x : ℤ) : ℤ := -x
def h (x : ℤ) : ℤ := 2 * x + 3

example : Injective f :=
fun x1 x2 ↦
fun h1 : x1 + 3 = x2 + 3 ↦   -- Lean knows this is the same as f x1 = f x2
show x1 = x2 from add_right_cancel h1

example : Surjective f :=
  fun y ↦
  have h1 : f (y - 3) = y :=
    calc
      f (y - 3) = (y - 3) + 3 := by rfl
              _ = y           := by rw [sub_add_cancel]
show ∃ x, f x = y from Exists.intro (y - 3) h1

example (x y : ℤ) (h : 2 * x = 2 * y) : x = y :=
have h1 : 2 ≠ (0 : ℤ) := by decide  -- this tells Lean to figure it out itself
show x = y from mul_left_cancel₀ h1 h

example (x : ℤ) : -(-x) = x := neg_neg x

example (A B : Type) (u : A → B) (v : B → A) (h : LeftInverse u v) :
  ∀ x, u (v x) = x :=
h

example (A B : Type) (u : A → B) (v : B → A) (h : LeftInverse u v) :
  RightInverse v u :=
h

-- fill in the sorry's in the following proofs

example : Injective h :=
sorry

example : Surjective g :=
sorry

example (A B : Type) (u : A → B) (v1 : B → A) (v2 : B → A)
  (h1 : LeftInverse v1 u) (h2 : RightInverse v2 u) : v1 = v2 :=
funext
  (fun x ↦
    calc
      v1 x = v1 (u (v2 x)) := by sorry
         _ = v2 x          := by sorry)
```

2. 填上下 面证明中的 `sorry`。

```lean
import Mathlib.Data.Set.Function
open Set Function

variable {X Y : Type}
variable (A₁ A₂ : Set X)
variable (f : X → Y)

theorem image_union : f '' (A₁ ∪ A₂) = f '' A₁ ∪ f '' A₂ := by
  ext y
  constructor
  . intro (h : y ∈ image f (A₁ ∪ A₂))
    cases h with
    | intro x hx =>
      have xA₁A₂ : x ∈ A₁ ∪ A₂ := hx.left
      have fxy : f x = y := hx.right
      cases xA₁A₂ with
      | inl xA₁ => exact Or.inl ⟨x, xA₁, fxy⟩
      | inr xA₂ => exact Or.inr ⟨x, xA₂, fxy⟩
  . intro (h : y ∈ image f A₁ ∪ image f A₂)
    cases h with
    | inl yifA₁ =>
      cases yifA₁ with
      | intro x hx =>
        have xA₁ : x ∈ A₁ := hx.left
        have fxy : f x = y := hx.right
        exact ⟨x, Or.inl xA₁, fxy⟩
    | inr yifA₂ => cases yifA₂ with
      | intro x hx =>
        have xA₂ : x ∈ A₂ := hx.left
        have fxy : f x = y := hx.right
        exact ⟨x, Or.inr xA₂, fxy⟩

-- remember, x ∈ A ∩ B is the same as x ∈ A ∧ x ∈ B
example (x : X) (h1 : x ∈ A₁) (h2 : x ∈ A₂) : x ∈ A₁ ∩ A₂ :=
And.intro h1 h2

example (x : X) (h1 : x ∈ A₁ ∩ A₂) : x ∈ A₁ :=
And.left h1

-- Fill in the proof below.

example : f '' (A₁ ∩ A₂) ⊆ f '' A₁ ∩ f '' A₂ := by
intro y
intro (h1 : y ∈ f '' (A₁ ∩ A₂))
show y ∈ f '' A₁ ∩ f '' A₂
sorry
```
