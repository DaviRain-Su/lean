# 第 9 章：Lean 中的一阶逻辑

> 本译文对应原书 [First Order Logic in Lean](https://leanprover.github.io/logic_and_proof/first_order_logic_in_lean.html)；英文 Sphinx 源：`first_order_logic_in_lean.rst`。

## 9.1. 函数、谓词与关系

在上一章中，我们讨论了一阶逻辑的语言。在本书后续内容中我们将看到，Lean 的内置逻辑要丰富得多；但它**包含**一阶逻辑，也就是说，任何能够在一阶逻辑中表达（并证明）的东西，也都能在 Lean 中表达（并证明）。

Lean 基于一个称为**类型论**（type theory）的基础框架，其中每个变量都被假定取值于某个**类型**（type）。你可以把一个类型理解为一种“宇宙”或“论域”，即一阶逻辑意义上的 domain of discourse。

例如，假设我们想使用一种带有一个常量符号、一个一元函数符号、一个二元函数符号、一个一元关系符号和一个二元关系符号的一阶语言。我们可以声明一个新类型 `U`（表示“宇宙”）以及相应的符号：

```lean
axiom U : Type

axiom c : U
axiom f : U → U
axiom g : U → U → U
axiom P : U → Prop
axiom R : U → U → Prop
```

然后可以如下使用它们：

```lean
variable (x y : U)

#check c
#check f c
#check g x y
#check g x (f c)

#check P (g x (f c))
#check R x y
```

`#check` 命令告诉我们前四个表达式的类型是 `U`，后两个的类型是 `Prop`。粗略地说，这意味着前四个表达式对应于一阶逻辑中的项，后两个对应于公式。

注意以下几点：

- 一元函数表示为类型 `U → U` 的对象，二元函数表示为类型 `U → U → U` 的对象，这与命题之间蕴涵的记法相同。
- 例如，我们写 `f x` 表示把 `f` 应用于 `x` 的结果，写 `g x y` 表示把 `g` 应用于 `x` 和 `y` 的结果，正如我们在一阶逻辑中使用假言推理时所做的那样。在表达式 `g x (f c)` 中需要括号，以确保 `f c` 被解析为单个参数。
- 一元谓词表示为类型 `U → Prop` 的对象，二元谓词表示为类型 `U → U → Prop` 的对象。你可以把二元关系 `R` 看作一个接受宇宙中两个参数并返回命题的函数。
- 我们写 `P x` 表示断言 `P` 对 `x` 成立，写 `R x y` 表示断言 `R` 对 `x` 和 `y` 成立。

你可能会合理地问 Lean 中 `axiom` 和 `variable` 有什么区别。以下声明也同样有效：

```lean
variable (U : Type)

variable (c : U)
variable (f : U → U)
variable (g : U → U → U)
variable (P : U → Prop)
variable (R : U → U → Prop)

variable (x y : U)

#check c
#check f c
#check g x y
#check g x (f c)

#check P (g x (f c))
#check R x y
```

尽管这些例子在很大程度上以相同方式工作，但 `axiom` 和 `variable` 命令做的事情非常不同。`constant` 命令公理化地声明一个新对象，并将其加入 Lean 所知道的对象列表。相比之下，`variable` 命令在首次执行时并不创建任何东西。相反，它告诉 Lean：每当我们输入一个使用相应标识符的表达式时，它应该创建一个相应类型的临时变量。

Lean 的标准库中已经声明了许多类型。例如，有一个类型写作 `Nat`，表示自然数。我们可以引入记号 `ℕ` 来表示它。

```lean
#check Nat

notation:1 "ℕ" => Nat

#check ℕ
```

你可以用 `\nat` 或 `\N` 输入 Unicode `ℕ`。这两个表达式含义相同。

使用这个内置类型，我们可以像上一章描述的那样对算术语言建模：

```lean
namespace hidden
notation:1 "ℕ" => Nat

axiom mul : ℕ → ℕ → ℕ
axiom add : ℕ → ℕ → ℕ
axiom square : ℕ → ℕ
axiom even : ℕ → Prop
axiom odd : ℕ → Prop
axiom prime : ℕ → Prop
axiom divides : ℕ → ℕ → Prop
axiom lt : ℕ → ℕ → Prop
axiom zero : ℕ
axiom one : ℕ

end hidden
```

我们使用 `namespace` 命令来避免与 Lean 库中已经声明的标识符冲突。（在命名空间外，我们刚才声明的常量 `mul` 名为 `hidden.mul`。）我们可以再次使用 `#check` 命令来尝试它们：

```lean
namespace hidden

variable (w x y z : ℕ)

#check mul x y
#check add x y
#check square x
#check even x

end hidden
```

我们甚至可以为二元运算和关系声明中缀记号：

```lean
local infix:65   " + " => add
local infix:70   " * " => mul
local infix:50   " < " => lt
```

（为数字 `1`、`2`、`3`、…… 获得记号更麻烦一些。）有了这些设置，上面的例子可以渲染为：

```lean
#check even (x + y + z) ∧ prime ((x + one) * y * y)
#check ¬ (square (x + y * z) = w) ∨ x + y < z
#check x < y ∧ even x ∧ even y → x + one < y
```

事实上，除了 `square` 函数外，这里讨论的所有函数、谓词和关系都在 Lean 库中有定义。当我们在文件顶部导入模块 `import Mathlib.Data.Nat.Prime` 后，它们就可以使用了。

```lean
import Mathlib.Data.Nat.Prime

axiom square : ℕ → ℕ

variable (w x y z : ℕ)

#check Even (x + y + z) ∧ Prime ((x + 1) * y * y)
#check ¬ (square (x + y * z) = w) ∨ x + y < z
#check x < y ∧ Even x ∧ Even y → x + 1 < y
```

这里我们公理化地声明常量 `square`，但引用 Lean 库中的其他运算和谓词。在本书中，我们经常采用这种方式，并明确告诉你练习中应该使用库中的哪些事实。

再次注意以下语法要点：

- 与普通数学记法不同，在 Lean 中函数应用不带括号或逗号。例如，我们写 `square x` 和 `add x y`，而不是 $\mathit{square}(x)$ 和 $\mathit{add}(x, y)$。
- 谓词和关系也是如此：我们写 `even x` 和 `lt x y`，而不是 $\mathit{even}(x)$ 和 $\mathit{lt}(x, y)$，正如在符号逻辑中可能做的那样。
- 记号 `add : ℕ → ℕ → ℕ` 表明加法接受两个参数，都是自然数，并返回一个自然数。
- 类似地，记号 `divides : ℕ → ℕ → Prop` 表明 `divides` 是一个二元关系，接受两个自然数作为参数并形成一个命题。换言之，`divides x y` 表达断言 `x` 整除 `y`。

Lean 可以帮助我们区分项和公式。如果我们用 `#check` 检查表达式 `x + y + 1`，我们会被告知它的类型是 `ℕ`，也就是说，它表示一个自然数。如果我们用 `#check` 检查表达式 `even (x + y + 1)`，我们会被告知它的类型是 `Prop`，也就是说，它表达一个命题。

在[第 7 章](first_order_logic.md)中我们考虑了多类逻辑，其中可以有多个宇宙。例如，我们可能想为一阶逻辑用于几何，量词取值于点和线。在 Lean 中，我们可以通过为每个类引入一个新类型来建模：

```lean
variable (Point Line : Type)
variable (lies_on : Point → Line → Prop)
```

然后我们可以表达两个不同点确定一条线：

```lean
#check ∀ (p q : Point) (L M : Line),
        p ≠ q → lies_on p L → lies_on q L → lies_on p M →
          lies_on q M → L = M
```

注意我们遵循了在前件中使用迭代蕴涵而非合取的约定。事实上，Lean 足够聪明，能够根据 `p`、`q`、`L`、`M` 与关系 `lies_on` 一起使用的事实推断出它们是什么类型的对象，所以我们可以更简单地写成：

```lean
#check ∀ p q L M, p ≠ q → lies_on p L → lies_on q L →
  lies_on p M → lies_on q M → L = M
```

## 9.2. 使用全称量词

在 Lean 中，你可以通过输入 `\all` 来输入全称量词。[7.1 节](first_order_logic.md#71-函数谓词与关系)中的 motivation 例子渲染如下：

```lean
import Mathlib.Data.Nat.Prime

#check ∀ x, (Even x ∨ Odd x) ∧ ¬ (Even x ∧ Odd x)
#check ∀ x, Even x ↔ 2 ∣ x
#check ∀ x, Even x → Even (x^2)
#check ∀ x, Even x ↔ Odd (x + 1)
#check ∀ x, Prime x ∧ x > 2 → Odd x
#check ∀ x y z, x ∣ y → y ∣ z → x ∣ z
```

记住，Lean 期望全称量词后面有一个逗号，并且给它尽可能宽的作用域。例如，`∀ x, P ∨ Q` 被解释为 `∀ x, (P ∨ Q)`，要写 `(∀ x, P) ∨ Q` 才能限制作用域。如果你愿意，也可以用纯 ASCII 表达式 `forall` 代替 Unicode `∀`。

在 Lean 中，证明全称陈述的模式如下：

```lean
variable (U : Type)
variable (P : U → Prop)

example : ∀ x, P x :=
fun x ↦
show P x from sorry
```

把 `fun x` 读作“固定 `U` 的一个任意值 `x`”。由于我们可以随意重命名约束变量，下面两种写法等价：

```lean
variable (U : Type)
variable (P : U → Prop)

example : ∀ y, P y :=
fun x ↦
show P x from sorry

example : ∀ x, P x :=
fun y ↦
show P y from sorry
```

这构成了全称量词的引入规则。它与蕴涵的引入规则非常相似：我们不是用 `fun` 临时引入一个假设，而是用 `fun` 临时引入一个新对象 `y`。（事实上，两者都是 Lean 中单个内部构造的替代语法，也可以记作 `λ`。）

消去规则类似地实现如下：

```lean
variable (U : Type)
variable (P : U → Prop)
variable (h : ∀ x, P x)
variable (a : U)

example : P a :=
show P a from h a
```

注意这个记法：`P a` 是通过把假设 `h`“应用”到 `a` 得到的。再次注意它与蕴涵消去规则的相似性。

这里是一个使用例子：

```lean
variable (U : Type)
variable (A B : U → Prop)

example (h1 : ∀ x, A x → B x) (h2 : ∀ x, A x) : ∀ x, B x :=
fun y ↦
have h3 : A y := h2 y
have h4 : A y → B y := h1 y
show B y from h4 h3
```

这是同一个证明的更短版本，避免使用 `have`：

```lean
example (h1 : ∀ x, A x → B x) (h2 : ∀ x, A x) : ∀ x, B x :=
fun y ↦
show B y from h1 y (h2 y)
```

你应该逐步理解这些步骤。把 `h1` 应用到 `y` 得到 `A y → B y` 的证明，然后把它应用到 `h2 y`，即 `A y` 的证明。结果就是我们想要的 `B y` 的证明。

在上一章中，我们考虑了如下的自然演绎证明：

![推理规则 1](https://leanprover-community.github.io/logic_and_proof/_static/first_order_logic_in_lean.1.png)

下面是同一个证明在 Lean 中的呈现：

```lean
variable (U : Type)
variable (A B : U → Prop)

example : (∀ x, A x) → (∀ x, B x) → (∀ x, A x ∧ B x) :=
fun hA : ∀ x, A x ↦
  fun hB : ∀ x, B x ↦
    fun y ↦
      have Ay : A y := hA y
      have By : B y := hB y
      show A y ∧ B y from And.intro Ay By
```

这是另一个版本，使用 `have` 的“匿名”形式：

```lean
example : (∀ x, A x) → (∀ x, B x) → (∀ x, A x ∧ B x) :=
fun hA : ∀ x, A x ↦
  fun hB : ∀ x, B x ↦
    fun y ↦
      have : A y := hA y
      have : B y := hB y
      show A y ∧ B y from And.intro ‹A y› ‹B y›
```

下面的练习要求你证明理发师悖论，我们在上一章讨论过。你可以只用命题推理和我们刚刚讨论的全称量词规则来完成它。

## 9.3. 使用存在量词

在 Lean 中，你可以通过输入 `\ex` 来输入存在量词 `∃`。如果你愿意，也可以使用 ASCII 等价形式 `Exists`。引入规则是 `Exists.intro`，需要两个参数：一个项，以及证明该满足所需性质的证明。

```lean
variable (U : Type)
variable (P : U → Prop)

example (y : U) (h : P y) : ∃ x, P x :=
Exists.intro y h
```

存在量词的消去规则由 `Exists.elim` 给出。它遵循自然演绎规则的形式：如果我们知道 `∃ x, P x`，并且我们想证明 `Q`，那么引入一个新变量 `y` 并在假设 `P y` 成立的条件下证明 `Q` 就足够了。

```lean
variable (U : Type)
variable (P : U → Prop)
variable (Q : Prop)

example (h1 : ∃ x, P x) (h2 : ∀ x, P x → Q) : Q :=
Exists.elim h1
  (fun (y : U) (h : P y) ↦
  have h3 : P y → Q := h2 y
  show Q from h3 h)
```

像往常一样，我们可以省略 `fun` 后 `y` 和假设 `h` 的数据类型信息，因为 Lean 能从上下文中推断出来。去掉 `show` 并把 `h3` 替换为它的证明 `h2 y`，就得到了一个简短（但几乎不可读）的结论证明。

```lean
example (h1 : ∃ x, P x) (h2 : ∀ x, P x → Q) : Q :=
Exists.elim h1
  (fun y h ↦ h2 y h)
```

下面的例子同时使用了存在量词的引入和消去规则。

```lean
variable (U : Type)
variable (A B : U → Prop)

example : (∃ x, A x ∧ B x) → ∃ x, A x :=
fun h1 : ∃ x, A x ∧ B x ↦
Exists.elim h1
  (fun y (h2 : A y ∧ B y) ↦
  have h3 : A y := And.left h2
  show ∃ x, A x from Exists.intro y h3)
```

注意假设中的括号；如果我们省略它们，第一个 `∃ x` 之后的所有内容都会被包含在该量词的作用域内。从这个假设中，我们得到一个满足 `A y ∧ B y` 的 `y`，因此特别地有 `A y`。所以 `y` 足以见证结论。

有时把 `Exists.elim` 后面的证明用括号括起来（就像我们这里的 `fun ... show` 块）很烦人。为了避免这一点，我们可以使用编程世界的一点语法，用美元符号代替。在 Lean 中，表达式 `f $ t` 与 `f (t)` 含义相同，优点是我们不必记得关闭括号。利用这个小技巧，我们可以把上面的证明写成：

```lean
example : (∃ x, A x ∧ B x) → ∃ x, A x :=
fun h1 : ∃ x, A x ∧ B x ↦
Exists.elim h1 $
fun y (h2 : A y ∧ B y) ↦
have h3 : A y := And.left h2
show ∃ x, A x from ⟨y, h3⟩
```

与 `And.intro` 类似，我们可以用 `\<` 和 `\>` 作为 `Exists.intro` 的语法，我们在上面例子的最后一行使用了它。

下面的例子更复杂一些：

```lean
example : (∃ x, A x ∨ B x) → (∃ x, A x) ∨ (∃ x, B x) :=
fun h1 : ∃ x, A x ∨ B x ↦
Exists.elim h1 $
fun y (h2 : A y ∨ B y) ↦
Or.elim h2
  (fun h3 : A y ↦
    have h4 : ∃ x, A x := Exists.intro y h3
    show (∃ x, A x) ∨ (∃ x, B x) from Or.inl h4)
  (fun h3 : B y ↦
    have h4 : ∃ x, B x := Exists.intro y h3
    show (∃ x, A x) ∨ (∃ x, B x) from Or.inr h4)
```

再次注意陈述中括号的位置。

在上一章中，我们考虑了如下的自然演绎证明：

![推理规则 2](https://leanprover-community.github.io/logic_and_proof/_static/first_order_logic_in_lean.2.png)

下面是同一个蕴涵在 Lean 中的证明：

```lean
variable (U : Type)
variable (A B : U → Prop)

example : (∀ x, A x → ¬ B x) → ¬ ∃ x, A x ∧ B x :=
fun h1 : ∀ x, A x → ¬ B x ↦
fun h2 : ∃ x, A x ∧ B x ↦
Exists.elim h2 $
fun x (h3 : A x ∧ B x) ↦
have h4 : A x := And.left h3
have h5 : B x := And.right h3
have h6 : ¬ B x := h1 x h4
show False from h6 h5
```

这里我们使用 `Exists.elim` 引入一个满足 `A x ∧ B x` 的值 `x`。这个名字是任意的；我们完全可以使用 `z`：

```lean
example : (∀ x, A x → ¬ B x) → ¬ ∃ x, A x ∧ B x :=
fun h1 : ∀ x, A x → ¬ B x ↦
fun h2 : ∃ x, A x ∧ B x ↦
Exists.elim h2 $
fun z (h3 : A z ∧ B z) ↦
have h4 : A z := And.left h3
have h5 : B z := And.right h3
have h6 : ¬ B z := h1 z h4
show False from h6 h5
```

下面是存在消去规则的另一个例子：

```lean
variable (U : Type)
variable (u : U)
variable (P : Prop)

example : (∃x : U, P) ↔ P :=
Iff.intro
  (fun h1 : ∃x, P ↦
    Exists.elim h1 $
    fun x (h2 : P) ↦
    h2)
  (fun h1 : P ↦
    ⟨u, h1⟩)
```

这很微妙：如果我们不声明一个类型为 `U` 的变量 `u`，证明就无法通过，即使 `u` 没有出现在定理陈述中。这突出了一阶逻辑与 Lean 实现的逻辑之间的差异。在自然演绎中，我们可以证明 $\forall x P(x) \to \exists x P(x)$，这表明我们的证明系统隐含地假设宇宙至少有一个对象。相比之下，陈述 `(∀ x : U, P x) → ∃ x : U, P x` 在 Lean 中不可证。换言之，在 Lean 中，一个类型可能是空的，因此上面的证明需要一个 `U` 中存在元素 `u` 的显式假设。

## 9.4. 相等

在 Lean 中，自反性、对称性和传递性分别称为 `Eq.refl`、`Eq.symm` 和 `Eq.trans`，第二条替换规则称为 `Eq.subst`。它们的使用如下所示。

```lean
variable (A : Type)

variable (x y z : A)
variable (P : A → Prop)

example : x = x :=
show x = x from Eq.refl x

example : y = x :=
have h : x = y := sorry
show y = x from Eq.symm h

example : x = z :=
have h1 : x = y := sorry
have h2 : y = z := sorry
show x = z from Eq.trans h1 h2

example : P y :=
have h1 : x = y := sorry
have h2 : P x := sorry
show P y from Eq.subst h1 h2
```

上面的 `Eq.refl` 规则把 `x` 作为参数，因为没有前提可以推断它。所有其他规则都把它们的前提作为参数。这里是一个等式推理的例子：

```lean
variable (A : Type) (x y z : A)

example : y = x → y = z → x = z :=
fun h1 : y = x ↦
fun h2 : y = z ↦
have h3 : x = y := Eq.symm h1
show x = z from Eq.trans h3 h2
```

这个证明可以更简洁地写成：

```lean
example : y = x → y = z → x = z :=
fun h1 h2 ↦ Eq.trans (Eq.symm h1) h2
```

## 9.5. 策略模式

### 9.5.1. 全称量词

与条件句类似，在策略模式中我们也可以使用 `intro x` 来引入一个变量，或者说“固定一个任意值 `x : U`”。这会把目标从 `∀ x, A x` 变为 `A x`。反过来，当我们有一个全称量词的证明 `h : ∀ x, A x`，而目标是对某个 `a : U` 证明 `A a` 时，我们可以使用 `apply h` 来关闭目标。下面是前面例子在策略模式中的形式：

```lean
example (h1 : ∀ x, A x → B x) (h2 : ∀ x, A x) : ∀ x, B x := by
  intro y
  have h3 : A y → B y := by apply h1
  show B y
  apply h3
  show A y
  apply h2
```

`apply` 策略可以组合假设，只要求我们提供剩余的部分。例如，如果在证明 `B y` 时立即执行 `apply h1`，Lean 会认识到我们需要用 `y` 替换 `x`，然后要求我们证明 `A y`。

```lean
example (h1 : ∀ x, A x → B x) (h2 : ∀ x, A x) : ∀ x, B x := by
  intro y
  show B y
  apply h1
  show A y
  apply h2
```

### 9.5.2. 存在量词

回顾这个例子：

```lean
example : (∃ x, A x ∧ B x) → ∃ x, A x :=
fun h1 : ∃ x, A x ∧ B x ↦
Exists.elim h1 $
fun y (h2 : A y ∧ B y) ↦
have h3 : A y := And.left h2
show ∃ x, A x from Exists.intro y h3
```

在策略模式中，我们可以这样证明：

```lean
example : (∃ x, A x ∧ B x) → ∃ x, A x := by
  intro (h1 : ∃ x, A x ∧ B x)
  cases h1 with
  | intro y h2 =>
    show ∃ x, A x
    apply Exists.intro y
    show A x
    cases h2 with
    | intro h3 _ =>
      exact h3
```

通过执行 `cases h1`，我们得到证明 `h1 : ∃ x, A x ∧ B x` 的唯一可能构造方式——即通过 `Exists.intro y h2`，其中 `y : U` 且 `h2 : A y ∧ B y`（Lean 的语法省略了 `Exists.`）。给定一个 `y : U`，Lean 把 `Exists.intro y : A y → ∃ x, A x` 看作一个条件句。所以我们可以用 `apply Exists.intro y` 把目标从 `A x` 改为 `∃ x, A x`。

前面另一个例子的进一步展示：

```lean
-- term mode
example : (∃ x, A x ∨ B x) → (∃ x, A x) ∨ (∃ x, B x) :=
fun h1 : ∃ x, A x ∨ B x ↦
Exists.elim h1 $
fun y (h2 : A y ∨ B y) ↦
Or.elim h2
  (fun h3 : A y ↦
    have h4 : ∃ x, A x := Exists.intro y h3
    show (∃ x, A x) ∨ (∃ x, B x) from Or.inl h4)
  (fun h3 : B y ↦
    have h4 : ∃ x, B x := Exists.intro y h3
    show (∃ x, A x) ∨ (∃ x, B x) from Or.inr h4)

-- tactic mode
example : (∃ x, A x ∨ B x) → (∃ x, A x) ∨ (∃ x, B x) := by
  intro (h1 : ∃ x, A x ∨ B x)
  cases h1 with
  | intro y h2 =>
    cases h2 with
    | inl h3 =>
      show (∃ x, A x) ∨ (∃ x, B x)
      apply Or.inl
      show (∃ x, A x)
      apply Exists.intro y
      exact h3
    | inr h3 =>
      show (∃ x, A x) ∨ (∃ x, B x)
      apply Or.inr
      show (∃ x, B x)
      apply Exists.intro y
      exact h3

-- term-tactic mix
example : (∃ x, A x ∨ B x) → (∃ x, A x) ∨ (∃ x, B x) := by
  intro (h1 : ∃ x, A x ∨ B x)
  cases h1 with
  | intro y h2 =>
    cases h2 with
    | inl h3 => exact Or.inl (Exists.intro y h3)
    | inr h3 => exact Or.inr (Exists.intro y h3)
```

如果我们不想用 `apply` 反向呈现证明，我们可以选择上面最后一个例子的风格，在完全分解假设 `h1` 后回到项模式。

`obtain` 策略为我们提供了 `cases` 的替代方案来消去存在量词。同样，我们取一个存在量的证明 `h1 : ∃ y, P y`，把它拆成一对 `⟨x, (h2 : P x)⟩ := h1`。它还可以做嵌套消去，因此下面第二个证明只是第一个的简短版本：

```lean
variable (U : Type) (R : U → U → Prop)

example : (∃ x, ∃ y, R x y) → (∃ y, ∃ x, R x y) := by
intro (h1 : ∃ x, ∃ y, R x y)
obtain ⟨x, (h2 : ∃ y, R x y)⟩ := h1
obtain ⟨y, (h3 : R x y)⟩ := h2
apply Exists.intro y
apply Exists.intro x
exact h3

example : (∃ x, ∃ y, R x y) → (∃ y, ∃ x, R x y) := by
intro (h1 : ∃ x, ∃ y, R x y)
obtain ⟨x, ⟨y, (h3 : R x y)⟩⟩ := h1
exact ⟨y, ⟨x, h3⟩⟩
```

你也可以用 `obtain` 来提取“与”的各分量：

```lean
variable (A B : Prop)

example : A ∧ B → B ∧ A := by
intro (h1 : A ∧ B)
obtain ⟨(h2 : A), (h3 : B) ⟩ := h1
show B ∧ A
exact ⟨h3, h2⟩
```

### 9.5.3. 相等

由于计算在数学中非常重要，Lean 提供了更高效的方式进行计算。一种方法是使用 ``rewrite`` 策略，它沿着等式对目标的一部分进行替换。

回顾这个例子：

```lean
example : y = x → y = z → x = z :=
fun h1 h2 ↦ Eq.trans (Eq.symm h1) h2
```

用策略模式证明如下：

```lean
example : y = x → y = z → x = z := by
  intro (hyx : y = x) (hyz : y = z)
  rewrite [←hyx]
  exact hyz
```

如果你把光标放在 `rewrite` 之前，Lean 会告诉你此时的目标是证明 `x = z`。第一个命令把目标 `x = z` 改为 `y = z`；`hyx` 前面的左向箭头（你可以用 `\<-` 输入）告诉 Lean 反向使用这个等式。如果你把光标放在 `exact` 之前，Lean 会显示新目标 `y = z`。`apply` 命令使用 `hyz` 完成证明。

另一种方法是使用 `hyx` 和 `hyz` 重写目标，把目标化简为 `x = x`。当这种情况发生时，`rewrite` 会自动应用自反性。重写是 Lean 中非常常见的操作，我们可以用简写 `rw` 代替完整的 `rewrite`。

```lean
example : y = x → y = z → x = z := by
  intro (hyx : y = x) (hyz : y = z)
  rw [←hyx]
  rw [hyz]
```

事实上，一连串重写可以用方括号合并：

```lean
example : y = x → y = z → x = z := by
  intro (hyx : y = x) (hyz : y = z)
  rw [←hyx, hyz]

example : y = x → y = z → x = z :=
assume h1 : y = x,
assume h2 : y = z,
show x = z, by rw [←h1, h2]
```

如果你把光标放在 `←h1` 之后，Lean 会显示此时的目标。

`rewrite` 策略也可以用于沿着双条件进行替换。例如，如果我们的目标是 `A ∧ B`，但我们知道 `hAC : A ↔ C` 和 `C ∧ B`，那么我们可以用 `hAC` 把 `A` 重写为 `C`，把目标变为 `C ∧ B`。

```lean
example (hAC : A ↔ C) (hCB : C ∧ B) : A ∧ B := by
  rw [hAC]
  exact hCB
```

在下面的例子中，我们使用 Mathlib 中的一个 `Iff` 引理以及 `1` 是奇数的事实来证明 `1` 不是偶数。

```lean
import Mathlib.Data.Nat.Prime
open Nat

#check odd_iff_not_even
#check odd_one

example : ¬ Even 1 := by
  rw [← odd_iff_not_even]
  exact odd_one
```

## 9.6. 计算式证明

我们将在后续章节中看到，在普通数学证明中，人们通常以下面这种格式进行计算：

$$
t_1 = t_2 \\ \ldots = t_3 \\ \ldots = t_4 \\ \ldots = t_5 .
$$

Lean 有一种机制来建模这种计算式证明。每当需要一个等式的证明时，你可以使用标识符 `calc`，后跟一串等式和理由，形式如下：

```lean
calc
  e1 = e2 := justification 1
   _ = e3 := justification 2
   _ = e4 := justification 3
   _ = e5 := justification 4
```

这个链可以根据需要任意延长，在这个例子中结果是一个 `e1 = e5` 的证明。每个理由都是所用假设或定理的名字。例如，前面的证明可以写成：

```lean
example : y = x → y = z → x = z :=
fun h1 : y = x ↦
fun h2 : y = z ↦
calc
  x = y := Eq.symm h1
  _ = z := h2
```

像往常一样，语法很挑剔；注意 `calc` 表达式中没有逗号，`:=` 和下划线必须格式正确。它也对空白敏感。唯一变化的是表达式 `e1, e2, e3, ...` 和理由本身。

`calc` 环境与 `rewrite` 结合使用时最为强大，因为我们可以用库中的事实重写表达式。例如，Lean 的库中有一些关于整数的基本恒等式：

```lean
import Mathlib.Data.Int.Defs

variable (x y z : Int)

example : x + 0 = x :=
Int.add_zero x

example : 0 + x = x :=
Int.zero_add x

example : (x + y) + z = x + (y + z) :=
Int.add_assoc x y z

example : x + y = y + x :=
Int.add_comm x y

example : (x * y) * z = x * (y * z) :=
Int.mul_assoc x y z

example : x * y = y * x :=
Int.mul_comm x y

example : x * (y + z) = x * y + x * z :=
Int.mul_add x y z

example : (x + y) * z = x * z + y * z :=
Int.add_mul x y z
```

你也可以把整数类型写作 `ℤ`，用 `\Z` 或 `\int` 输入。我们导入了文件 `Mathlib.Data.Int.Defs`，以便让整数的基本性质对我们可用。（在后面的代码片段中，为了简洁，我们将在在线版和 PDF 版中省略这一行。）注意，例如 `Int.add_comm` 是定理 `∀ x y, x + y = y + x`。所以要把它实例化为 `s + t = t + s`，你写 `Int.add_comm s t`。利用这些公理，下面是上面计算在 Lean 中的呈现，作为关于整数的定理：

```lean
example (x y z : Int) : (x + y) + z = (x + z) + y :=
calc
      (x + y) + z
    = x + (y + z) := Int.add_assoc x y z
  _ = x + (z + y) := @Eq.subst _ (λ w ↦ x + (y + z) = x + w) _ _ (Int.add_comm y z) rfl
  _ = (x + z) + y := Eq.symm (Int.add_assoc x z y)
```

我们不得不在 `Eq.subst` 上使用 `@`，以填入一些隐式参数，因为提供的信息不足。使用 `rewrite` 可以简化工作，尽管有时我们必须提供信息来指定规则在哪里使用：

```lean
example (x y z : Int) : (x + y) + z = (x + z) + y :=
calc
  (x + y) + z = x + (y + z) := by rw [Int.add_assoc]
          _ = x + (z + y) := by rw [Int.add_comm y z]
          _ = (x + z) + y := by rw [Int.add_assoc]
```

在这个例子中，我们可以使用单次 `rewrite`：

```lean
example (x y z : Int) : (x + y) + z = (x + z) + y :=
by rw [Int.add_assoc, Int.add_comm y z, Int.add_assoc]
```

下面是另一个例子：

```lean
variable (a b d c : Int)

example : (a + b) * (c + d) = a * c + b * c + a * d + b * d :=
calc
  (a + b) * (c + d) = (a + b) * c + (a + b) * d := by rw [Int.mul_add]
    _ = (a * c + b * c) + (a + b) * d         := by rw [Int.add_mul]
    _ = (a * c + b * c) + (a * d + b * d)     := by rw [Int.add_mul]
    _ = a * c + b * c + a * d + b * d         := by rw [←Int.add_assoc]
```

同样，有更短的证明：

```lean
variable (a b d c : Int)

example : (a + b) * (c + d) = a * c + b * c + a * d + b * d :=
by rw [Int.mul_add, Int.add_mul, Int.add_mul, ←Int.add_assoc]
```

## 9.7. 练习

1. 在项模式中填上 `sorry`。

```lean
section
  variable (A : Type)
  variable (f : A → A)
  variable (P : A → Prop)
  variable (h : ∀ x, P x → P (f x))

  -- Show the following:
  example : ∀ y, P y → P (f (f y)) :=
  sorry
end
```

2. 在策略模式中填上 `sorry`。

```lean
section
  variable (U : Type)
  variable (A B : U → Prop)

  example : (∀ x, A x ∧ B x) → ∀ x, A x := by
  sorry
end
```

3. 填上 `sorry`（假设这意味着用你喜欢的风格，除非另有说明）。

```lean
section
  variable (U : Type)
  variable (A B C : U → Prop)

  variable (h1 : ∀ x, A x ∨ B x)
  variable (h2 : ∀ x, A x → C x)
  variable (h3 : ∀ x, B x → C x)

  example : ∀ x, C x :=
  sorry
end
```

4. 填上下面的 `sorry`，证明理发师悖论。

```lean
open Classical   -- not needed, but you can use it

-- This is an exercise from Chapter 4. Use it as an axiom here.
axiom not_iff_not_self (P : Prop) : ¬ (P ↔ ¬ P)

example (Q : Prop) : ¬ (Q ↔ ¬ Q) :=
not_iff_not_self Q

section
  variable (Person : Type)
  variable (shaves : Person → Person → Prop)
  variable (barber : Person)
  variable (h : ∀ x, shaves barber x ↔ ¬ shaves x x)

  -- Show the following:
  example : False :=
  sorry
end
```

5. 填上 `sorry`。

```lean
section
  variable (U : Type)
  variable (A B : U → Prop)

  example : (∃ x, A x) → ∃ x, A x ∨ B x :=
  sorry
end
```

6. 填上 `sorry`。

```lean
section
  variable (U : Type)
  variable (A B : U → Prop)

  variable (h1 : ∀ x, A x → B x)
  variable (h2 : ∃ x, A x)

  example : ∃ x, B x :=
  sorry
end
```

7. 填上 `sorry`。

```lean
variable (U : Type)
variable (A B C : U → Prop)

example (h1 : ∃ x, A x ∧ B x) (h2 : ∀ x, B x → C x) :
    ∃ x, A x ∧ C x :=
sorry
```

8. 完成这些证明。

```lean
variable (U : Type)
variable (A B C : U → Prop)

example : (¬ ∃ x, A x) → ∀ x, ¬ A x :=
sorry

example : (∀ x, ¬ A x) → ¬ ∃ x, A x :=
sorry
```

9. 填上 `sorry`。

```lean
variable (U : Type)
variable (R : U → U → Prop)

example : (∃ x, ∀ y, R x y) → ∀ y, ∃ x, R x y :=
sorry
```

10. 下面的练习表明，在存在自反性的前提下，对称性和传递性规则等价于一条单一规则。

```lean
theorem foo {A : Type} {a b c : A} : a = b → c = b → a = c :=
sorry

-- notice that you can now use foo as a rule. The curly braces mean that
-- you do not have to give A, a, b, or c

section
  variable (A : Type)
  variable (a b c : A)

  example (h1 : a = b) (h2 : c = b) : a = c :=
  foo h1 h2
end

section
  variable {A : Type}
  variable {a b c : A}

  -- replace the sorry with a proof, using foo and rfl, without using eq.symm.
  theorem my_symm (h : b = a) : a = b :=
  sorry

  -- now use foo and my_symm to prove transitivity
  theorem my_trans (h1 : a = b) (h2 : b = c) : a = c :=
  sorry
end
```

11. 把下面每个 `sorry` 替换成列表中正确的公理。

```lean
import Mathlib.Algebra.Ring.Int

-- these are the axioms for a commutative ring

#check @add_assoc
#check @add_comm
#check @add_zero
#check @zero_add
#check @mul_assoc
#check @mul_comm
#check @mul_one
#check @one_mul
#check @left_distrib
#check @right_distrib
#check @add_left_neg
#check @add_right_neg
#check @sub_eq_add_neg

variable (x y z : Int)

theorem t1 : x - x = 0 :=
calc
x - x = x + -x := by rw [sub_eq_add_neg]
    _ = 0      := by rw [add_right_neg]

theorem t2 (h : x + y = x + z) : y = z :=
calc
y     = 0 + y        := by rw [zero_add]
    _ = (-x + x) + y := by rw [add_left_neg]
    _ = -x + (x + y) := by rw [add_assoc]
    _ = -x + (x + z) := by rw [h]
    _ = (-x + x) + z := by rw [add_assoc]
    _ = 0 + z        := by rw [add_left_neg]
    _ = z            := by rw [zero_add]

theorem t3 (h : x + y = z + y) : x = z :=
calc
x     = x + 0        := by sorry
    _ = x + (y + -y) := by sorry
    _ = (x + y) + -y := by sorry
    _ = (z + y) + -y := by rw [h]
    _ = z + (y + -y) := by sorry
    _ = z + 0        := by sorry
    _ = z            := by sorry

theorem t4 (h : x + y = 0) : x = -y :=
calc
x     = x + 0        := by rw [add_zero]
    _ = x + (y + -y) := by rw [add_right_neg]
    _ = (x + y) + -y := by rw [add_assoc]
    _ = 0 + -y       := by rw [h]
    _ = -y           := by rw [zero_add]

theorem t5 : x * 0 = 0 :=
have h1 : x * 0 + x * 0 = x * 0 + 0 :=
  calc
    x * 0 + x * 0 = x * (0 + 0) := by sorry
                _ = x * 0       := by sorry
                _ = x * 0 + 0   := by sorry
show x * 0 = 0 from t2 _ _ _ h1

theorem t6 : x * (-y) = -(x * y) :=
have h1 : x * (-y) + x * y = 0 :=
  calc
    x * (-y) + x * y = x * (-y + y) := by sorry
                _ = x * 0        := by sorry
                _ = 0            := by rw [t5 x]
show x * (-y) = -(x * y) from t4 _ _ h1

theorem t7 : x + x = 2 * x :=
calc
x + x = 1 * x + 1 * x := by rw [one_mul]
    _ = (1 + 1) * x   := sorry
    _ = 2 * x         := rfl
```

12. 填上 `sorry`。记住你可以用 `rewrite` 沿着双条件进行替换。

```lean
import Mathlib.Data.Nat.Prime
open Nat

-- You can use the following facts.
#check odd_add
#check odd_mul
#check odd_iff_not_even
#check not_even_one

-- Show the following:
example : ∀ x y z : ℕ,
    Odd x → Odd y → Even z → Odd ((x * y) * (z + 1)) :=
sorry
```
