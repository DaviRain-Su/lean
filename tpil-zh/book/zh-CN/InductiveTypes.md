# 第 7 章：归纳类型

> 本译文对应原书 [Inductive Types](https://lean-lang.org/theorem_proving_in_lean4/Inductive-Types/)；英文 Verso 源：`book/TPiL/InductiveTypes.lean`。

（环境中有 `variable {α : Sort u} {β : Sort v}`。）

我们已看到 Lean 的形式基础包含基本类型 `Prop`、`Type 0`、`Type 1`、`Type 2`、…，并允许构造依赖函数类型 `(x : α) → β`。在示例中，我们还使用了 `Bool`、`Nat`、`Int` 等额外类型，以及 `List`、积类型 `×` 等类型构造子。事实上，在 Lean 库中，除宇宙与依赖箭头之外，每个具体类型、每个类型构造子都是称为**归纳类型**（inductive types）的通用类型构造族之实例。值得注意的是，仅凭类型宇宙、依赖箭头类型与归纳类型，就能构筑可观的数学大厦；其余皆由此导出。

直观上，归纳类型由指定的构造子列表「搭建」而成。在 Lean 中，指定此类类型的语法如下：

```lean
variable {α β ω : Type}

inductive Foo where
  | constructor₁ : α → Foo
  | constructor₂ : β → Foo
  | constructorₙ : ω → Foo
```

```lean
inductive Foo where
  | constructor₁ : ... → Foo
  | constructor₂ : ... → Foo
  ...
  | constructorₙ : ... → Foo
```

直观上，每个构造子指定一种构造 `Foo` 新对象的方式，可能依赖先前已构造的值。类型 `Foo` 仅由以这种方式构造的对象组成。

下文将看到，构造子的参数可包含类型为 `Foo` 的对象，但须满足某种「**正性**」（positivity）约束，以保证 `Foo` 的元素自下而上地构造。粗略地说，每个 `...` 可以是任意由 `Foo` 与先前已定义类型构造的箭头类型；若其中出现 `Foo`，则仅可作为依赖箭头类型的「目标」类型。

下面将给出若干归纳类型示例，并考虑对上述方案的轻微推广：互递归定义的归纳类型，以及所谓**归纳族**（inductive families）。

与逻辑联结词一样，每个归纳类型都配有**引入规则**（introduction rules）——说明如何构造该类型的元素——以及**消除规则**（elimination rules）——说明如何在其他构造中「使用」该类型的元素。与逻辑联结词的类比并不意外；如下所见，它们也是归纳类型构造的实例。你已见过归纳类型的引入规则：就是类型定义中指定的那些构造子。消除规则提供对该类型的**递归**（recursion）原则，其特例包含**归纳**（induction）原则。

下一章将介绍 Lean 的函数定义包，它提供更便捷的方式在归纳类型上定义函数并做归纳证明。但归纳类型概念极为根本，我们觉得从底层、动手理解入手很重要。我们将从归纳类型的基本示例开始，逐步过渡到更复杂的情形。

## 7.1 枚举类型

最简单的归纳类型是元素为有限枚举列表的类型。

```lean
inductive Weekday where
  | sunday : Weekday
  | monday : Weekday
  | tuesday : Weekday
  | wednesday : Weekday
  | thursday : Weekday
  | friday : Weekday
  | saturday : Weekday
```

`inductive` 命令创建新类型 `Weekday`。构造子均位于 `Weekday` 命名空间。

```lean
inductive Weekday where
 | sunday : Weekday
 | monday : Weekday
 | tuesday : Weekday
 | wednesday : Weekday
 | thursday : Weekday
 | friday : Weekday
 | saturday : Weekday
------
#check Weekday.sunday

#check Weekday.monday

open Weekday

#check sunday

#check monday
```

声明 `Weekday` 归纳类型时，可省略 `: Weekday`。

```lean
inductive Weekday where
  | sunday
  | monday
  | tuesday
  | wednesday
  | thursday
  | friday
  | saturday
```

（环境中有 `inductive Weekday where | sunday | monday | tuesday | wednesday | thursday | friday | saturday`。）

可将 `sunday`、`monday`、…、`saturday` 视为 `Weekday` 的互异元素，无其他区分性质。消除原则 `Weekday.rec` 与类型 `Weekday` 及其构造子一同定义。它也称为**递归子**（recursor），正是它使该类型成为「归纳」的：允许通过对每个构造子赋值来定义 `Weekday` 上的函数。直观上，归纳类型由构造子穷尽生成，除它们构造的元素外别无他物。

```signature
Weekday.rec.{u} {motive : Weekday → Sort u}
  (sunday : motive Weekday.sunday)
  (monday : motive Weekday.monday)
  (tuesday : motive Weekday.tuesday)
  (wednesday : motive Weekday.wednesday)
  (thursday : motive Weekday.thursday)
  (friday : motive Weekday.friday)
  (saturday : motive Weekday.saturday)
  (t : Weekday) :
  motive t
```

下面用 `match` 表达式定义从 `Weekday` 到自然数的函数：

```lean
inductive Weekday where
 | sunday : Weekday
 | monday : Weekday
 | tuesday : Weekday
 | wednesday : Weekday
 | thursday : Weekday
 | friday : Weekday
 | saturday : Weekday
------
open Weekday

def numberOfDay (d : Weekday) : Nat :=
  match d with
  | sunday    => 1
  | monday    => 2
  | tuesday   => 3
  | wednesday => 4
  | thursday  => 5
  | friday    => 6
  | saturday  => 7

#eval numberOfDay Weekday.sunday  -- 1

#eval numberOfDay Weekday.monday  -- 2

#eval numberOfDay Weekday.tuesday -- 3
```

在 Lean 的逻辑中，`match` 表达式由声明归纳类型时生成的递归子 `Weekday.rec` 编译而成，从而保证所得项在类型论中良定。对编译后的代码，`match` 则与其他函数式语言一样编译。

```lean
inductive Weekday where
 | sunday : Weekday
 | monday : Weekday
 | tuesday : Weekday
 | wednesday : Weekday
 | thursday : Weekday
 | friday : Weekday
 | saturday : Weekday
------
open Weekday

def numberOfDay (d : Weekday) : Nat :=
  match d with
  | sunday    => 1
  | monday    => 2
  | tuesday   => 3
  | wednesday => 4
  | thursday  => 5
  | friday    => 6
  | saturday  => 7

set_option pp.all true
#print numberOfDay

#print numberOfDay.match_1

#print Weekday.casesOn

#check @Weekday.rec
```

声明归纳数据类型时，可使用 `deriving Repr` 指示 Lean 生成将 `Weekday` 对象转为文本的函数。`#eval` 用该函数显示 `Weekday` 对象。若无 `Repr`，`#eval` 会尝试现场推导一个。

```lean
inductive Weekday where
  | sunday
  | monday
  | tuesday
  | wednesday
  | thursday
  | friday
  | saturday
deriving Repr

open Weekday

#eval tuesday   -- Weekday.tuesday
```

将与某结构相关的定义与定理归入同名命名空间往往很有用。例如可将 `numberOfDay` 放入 `Weekday` 命名空间；打开命名空间后即可使用较短名称。

可定义从 `Weekday` 到 `Weekday` 的函数：

```lean
inductive Weekday where
 | sunday : Weekday
 | monday : Weekday
 | tuesday : Weekday
 | wednesday : Weekday
 | thursday : Weekday
 | friday : Weekday
 | saturday : Weekday
 deriving Repr
------
namespace Weekday
def next (d : Weekday) : Weekday :=
  match d with
  | sunday    => monday
  | monday    => tuesday
  | tuesday   => wednesday
  | wednesday => thursday
  | thursday  => friday
  | friday    => saturday
  | saturday  => sunday

def previous (d : Weekday) : Weekday :=
  match d with
  | sunday    => saturday
  | monday    => sunday
  | tuesday   => monday
  | wednesday => tuesday
  | thursday  => wednesday
  | friday    => thursday
  | saturday  => friday

#eval next (next tuesday)      -- Weekday.thursday

#eval next (previous tuesday)  -- Weekday.tuesday

example : next (previous tuesday) = tuesday :=
  rfl

end Weekday
```

如何证明对任意 `Weekday` 值 `d` 有 `next (previous d) = d`？可用 `match` 对每个构造子分别给出证明：

```lean
inductive Weekday where
 | sunday : Weekday
 | monday : Weekday
 | tuesday : Weekday
 | wednesday : Weekday
 | thursday : Weekday
 | friday : Weekday
 | saturday : Weekday
 deriving Repr
namespace Weekday
def next (d : Weekday) : Weekday :=
 match d with
 | sunday    => monday
 | monday    => tuesday
 | tuesday   => wednesday
 | wednesday => thursday
 | thursday  => friday
 | friday    => saturday
 | saturday  => sunday
def previous (d : Weekday) : Weekday :=
 match d with
 | sunday    => saturday
 | monday    => sunday
 | tuesday   => monday
 | wednesday => tuesday
 | thursday  => wednesday
 | friday    => thursday
 | saturday  => friday
------
theorem next_previous (d : Weekday) : next (previous d) = d :=
  match d with
  | sunday    => rfl
  | monday    => rfl
  | tuesday   => rfl
  | wednesday => rfl
  | thursday  => rfl
  | friday    => rfl
  | saturday  => rfl
```

用策略证明可更简洁：

```lean
inductive Weekday where
 | sunday : Weekday
 | monday : Weekday
 | tuesday : Weekday
 | wednesday : Weekday
 | thursday : Weekday
 | friday : Weekday
 | saturday : Weekday
 deriving Repr
namespace Weekday
def next (d : Weekday) : Weekday :=
 match d with
 | sunday    => monday
 | monday    => tuesday
 | tuesday   => wednesday
 | wednesday => thursday
 | thursday  => friday
 | friday    => saturday
 | saturday  => sunday
def previous (d : Weekday) : Weekday :=
 match d with
 | sunday    => saturday
 | monday    => sunday
 | tuesday   => monday
 | wednesday => tuesday
 | thursday  => wednesday
 | friday    => thursday
 | saturday  => friday
------
theorem next_previous (d : Weekday) : next (previous d) = d := by
  cases d <;> rfl
```

下文 [7.6 节](#76-归纳类型的策略) 将介绍专用于归纳类型的更多策略。

注意，在**命题即类型**（propositions-as-types）对应下，我们既可用 `match` 定义函数，也可用它证明定理。换言之，按命题即类型对应，分情形证明是一种分情形定义，只是「被定义」的是证明而非数据。

Lean 库中的 `Bool` 类型是枚举类型之实例。

```lean
namespace Hidden
------
inductive Bool where
  | false : Bool
  | true  : Bool
------
end Hidden
```

（为运行这些示例，我们将它们放在 `Hidden` 命名空间，以免 `Bool` 与标准库中的 `Bool` 冲突。这有必要，因为这些类型属于系统启动时自动导入的 Lean「预置」部分。）

作为练习，应思考这些类型的引入与消除规则分别做什么。进一步练习：在 `Bool` 上定义布尔运算 `and`、`or`、`not`，并验证常见恒等式。注意可用 `match` 定义 `and` 这类二元运算：

```lean
namespace Hidden
------
def and (a b : Bool) : Bool :=
  match a with
  | true  => b
  | false => false
-------
end Hidden
```

类似地，多数恒等式可通过引入合适的 `match`，再用 `rfl` 证明。

## 7.2 带参数的构造子

（环境中有 `variable (α : Type u) (β : Type v) (a : α) (b : β)`。）

枚举类型是归纳类型很特殊的情形：构造子完全不取参数。一般地，「构造」可依赖数据，这些数据体现在被构造的参数中。考虑库中积类型与和类型的定义：

```lean
namespace Hidden
------
inductive Prod (α : Type u) (β : Type v)
  | mk : α → β → Prod α β

inductive Sum (α : Type u) (β : Type v) where
  | inl : α → Sum α β
  | inr : β → Sum α β
-------
end Hidden
```

理解这些示例在做什么。积类型有一个构造子 `Prod.mk`，取两个参数。要在 `Prod α β` 上定义函数，可假设输入形如 `Prod.mk a b`，并须用 `a` 与 `b` 指定输出。由此可定义 `Prod` 的两个投影。回忆标准库用 `α × β` 表示 `Prod α β`，用 `(a, b)` 表示 `Prod.mk a b`。

```lean
namespace Hidden
inductive Prod (α : Type u) (β : Type v)
  | mk : α → β → Prod α β
------
def fst {α : Type u} {β : Type v} (p : Prod α β) : α :=
  match p with
  | Prod.mk a b => a

def snd {α : Type u} {β : Type v} (p : Prod α β) : β :=
  match p with
  | Prod.mk a b => b
--------
end Hidden
```

函数 `fst` 取一对 `p`。`match` 将 `p` 解释为一对 `Prod.mk a b`。回忆 [第 2 章](DependentTypeTheory.md)「依赖类型论」：为使定义尽可能一般，我们允许类型 `α`、`β` 属于任意宇宙。

（环境中有 `universe u_2 u_3 u_1` 与 `variable (b : Bool) {α : Type u} {t1 t2 : α}`。）

另一例用递归子 `Prod.casesOn` 而非 `match`：

```lean
def prod_example (p : Bool × Nat) : Nat :=
  Prod.casesOn (motive := fun _ => Nat) p
    (fun b n => cond b (2 * n) (2 * n + 1))

#eval prod_example (true, 3)

#eval prod_example (false, 3)
```

参数 `motive` 用于指定要构造的对象的类型；它是函数，因为可能依赖该对。`cond` 是布尔条件：`cond b t1 t2` 在 `b` 为真时返回 `t1`，否则返回 `t2`。函数 `prod_example` 取由布尔值 `b` 与数 `n` 组成的对，按 `b` 为真或假返回 `2 * n` 或 `2 * n + 1`。

（环境中有 `open Sum` 与 `variable {α : Type u} {β : Type v} (a : α) (b : β)`。）

相比之下，和类型有**两个**构造子 `inl` 与 `inr`（「左插入」「右插入」），各取**一个**（显式）参数。要在 `Sum α β` 上定义函数，须处理两种情形：输入形如 `inl a` 时，须用 `a` 指定输出；输入形如 `inr b` 时，须用 `b` 指定输出。

```lean
def sum_example (s : Sum Nat Nat) : Nat :=
  Sum.casesOn (motive := fun _ => Nat) s
    (fun n => 2 * n)
    (fun n => 2 * n + 1)

#eval sum_example (Sum.inl 3)

#eval sum_example (Sum.inr 3)
```

（环境中有 `open Sum` 与 `variable (n : Nat)`。）

此例与上一例类似，但 `sum_example` 的输入隐式地或为 `inl n` 或为 `inr n`：前者返回 `2 * n`，后者返回 `2 * n + 1`。

（环境中有 `variable {α β : Type} {a : α} {b : β}` 与 `open Sum`。）

注意积类型依赖参数 `α β : Type`，它们既是构造子的参数，也出现在 `Prod` 中。Lean 会检测这些参数能否从构造子后续参数或返回类型推断，并在可推断时把它们变为隐式。

在 [7.4 节](#74-定义自然数) 将看到归纳类型的构造子从该归纳类型自身取参时会发生什么。本节示例的特点是：每个构造子仅依赖先前已指定的类型。

注意，有多个构造子的类型是**析取**的：`Sum α β` 的元素或为 `inl a` 的形式，或为 `inl b` 的形式。有多个参数的构造子引入**合取**信息：从 `Prod.mk a b` 可分别取出 `a` 与 `b`。任意归纳类型可同时具备这两种特征：可有任意多个构造子，每个构造子可取任意多个参数。

与函数定义一样，Lean 的归纳定义语法允许在冒号前为构造子写命名参数：

```lean
namespace Hidden
------
inductive Prod (α : Type u) (β : Type v) where
  | mk (fst : α) (snd : β) : Prod α β

inductive Sum (α : Type u) (β : Type v) where
  | inl (a : α) : Sum α β
  | inr (b : β) : Sum α β
-------
end Hidden
```

这些定义的结果与本节较早给出的定义本质上相同。

像 `Prod` 这样仅有一个构造子的类型是纯合取的：构造子只是把参数列表打包成单一数据，本质上是元组，后续参数的类型可依赖首个参数的类型。也可把此类类型视为「记录」或「结构体」。在 Lean 中，关键字 `structure` 可同时定义此类归纳类型及其投影。

```lean
namespace Hidden
------
structure Prod (α : Type u) (β : Type v) where
  mk ::
  fst : α
  snd : β
-------
end Hidden
```

此例同时引入归纳类型 `Prod`、其构造子 `mk`、通常的 eliminator（`rec` 与 `recOn`），以及上文定义的投影 `fst`、`snd`。

若不命名构造子，Lean 默认使用 `mk`。例如下列定义用 RGB 三元组存储颜色：

```lean
structure Color where
  red : Nat
  green : Nat
  blue : Nat
deriving Repr

def yellow := Color.mk 255 255 0

#eval Color.red yellow
```

`yellow` 的定义用所示三个值形成记录；投影 `Color.red` 返回红色分量。

`structure` 命令对定义代数结构尤其有用；Lean 提供大量基础设施以支持对它们的操作。例如半群的定义：

```lean
structure Semigroup where
  carrier : Type u
  mul : carrier → carrier → carrier
  mul_assoc : ∀ a b c, mul (mul a b) c = mul a (mul b c)
```

更多示例见 [第 9 章](StructuresAndRecords.md)「结构体与记录」。

我们已讨论依赖积类型 `Sigma`：

```lean
namespace Hidden
------
inductive Sigma {α : Type u} (β : α → Type v) where
  | mk : (a : α) → β a → Sigma β
-------
end Hidden
```

库中另两个归纳类型示例如下：

```lean
namespace Hidden
------
inductive Option (α : Type u) where
  | none : Option α
  | some : α → Option α

inductive Inhabited (α : Type u) where
  | mk : α → Inhabited α
-------
end Hidden
```

（环境中有 `variable {α : Type u} {β : Type v} {γ : Type u'} (b : β) (f : α → Option β) (a : α)`。）

在依赖类型论语义中，没有内建的偏函数概念。函数类型 `α → β` 或依赖函数类型 `(a : α) → β` 的每个元素都假定在每个输入上都有值。`Option` 类型提供表示偏函数的方式：`Option β` 的元素或为 `none`，或为 `some b`（其中 `b : β`）。因而可把 `α → Option β` 的元素 `f` 视为从 `α` 到 `β` 的偏函数：对每个 `a : α`，`f a` 或返回 `none`（表示 `f a`「未定义」），或返回 `some b`。

`Inhabited α` 的元素只是「`α` 有元素」这一事实的见证。稍后我们将看到 `Inhabited` 是 Lean 中**类型类**（type class）的实例：可指示合适的基础类型是 inhabited 的，并在此基础上自动推断其他构造类型亦然。

作为练习，建议为从 `α` 到 `β`、从 `β` 到 `γ` 的偏函数发展复合概念，并证明其符合预期。还建议证明 `Bool` 与 `Nat` 是 inhabited 的，两个 inhabited 类型的积是 inhabited 的，以及到 inhabited 类型的函数类型是 inhabited 的。

## 7.3 归纳定义的命题

归纳定义的类型可生活在任意类型宇宙中，包括最底层的 `Prop`。事实上，逻辑联结词正是这样定义的。

```lean
namespace Hidden
------
inductive False : Prop

inductive True : Prop where
  | intro : True

inductive And (a b : Prop) : Prop where
  | intro : a → b → And a b

inductive Or (a b : Prop) : Prop where
  | inl : a → Or a b
  | inr : b → Or a b
-------
end Hidden
```

（环境中有 `variable (p : Prop) (hp : p) (α : Type u) (β : Type v)`。）

应思考这些定义如何产生你已见过的引入与消除规则。有规则约束归纳类型的 eliminator 能消除**到**何种类型，即何种类型可作为递归子的目标。粗略地说，在 `Prop` 中的归纳类型之特点是：只能消除到其他 `Prop` 中的类型。这与若 `p : Prop`，则 `hp : p` 不携带数据的理解一致。不过有一小例外，下文 [7.7 节](#77-归纳族) 将讨论。

连存在量词也是归纳定义的：

```lean
namespace Hidden
------
inductive Exists {α : Sort u} (p : α → Prop) : Prop where
  | intro (w : α) (h : p w) : Exists p
-------
end Hidden
```

记住记号 `∃ x : α, p` 是 `Exists (fun x : α => p)` 的语法糖。

`False`、`True`、`And`、`Or` 的定义分别与 `Empty`、`Unit`、`Prod`、`Sum` 的定义完全类似。区别在于前者给出 `Prop` 的元素，后者给出某个 `u` 的 `Type u` 的元素。类似地，`∃ x : α, p` 是 `Σ x : α, β` 的 `Prop` 值变体。

（环境中有 `variable (α : Type u) (β : Type v) (p : Prop)`。）

此处宜再提一种归纳类型，记为 `{x : α // p}`，它是 `∃ x : α, p` 与 `Σ x : α, β` 之间的某种混合。

```lean
namespace Hidden
------
inductive Subtype {α : Type u} (p : α → Prop) where
  | mk : (x : α) → p x → Subtype p
-------
end Hidden
```

（环境中有 `variable {α : Type u} {p : α → Prop}`。）

事实上，在 Lean 中 `Subtype` 用 `structure` 命令定义：

```lean
namespace Hidden
------
structure Subtype {α : Sort u} (p : α → Prop) where
  val : α
  property : p val
-------
end Hidden
```

记号 `{x : α // p x}` 是 `Subtype (fun x : α => p x)` 的语法糖。它仿照集合论中的子集记号：`{x : α // p x}` 表示 `α` 中具有性质 `p` 的元素之集合。

## 7.4 定义自然数

迄今所见归纳定义类型是「扁平」的：构造子包装数据并插入类型，对应递归子解包数据并作用于其上。当构造子作用于正被定义的类型本身的元素时，情形有趣得多。典型例子是自然数类型 `Nat`：

```lean
namespace Hidden
------
inductive Nat where
  | zero : Nat
  | succ : Nat → Nat
-------
end Hidden
```

（环境中有 `open Nat` 与 `variable {motive : Nat → Sort u} {f : (n : Nat) → motive n} {n : Nat}`。）

有两个构造子。我们从 `zero : Nat` 开始；它不取参数，故一开始就有。相比之下，构造子 `succ` 只能作用于先前已构造的 `Nat`。把它用于 `zero` 得 `succ zero : Nat`；再用一次得 `succ (succ zero) : Nat`，依此类推。直观上，`Nat` 是具备这些构造子的「最小」类型，意即它由 `zero` 出发反复应用 `succ` 穷尽（且自由）生成。

与以前一样，`Nat` 的递归子用于定义从 `Nat` 到任意域的依赖函数 `f`，即某个 `motive : Nat → Sort u` 的 `(n : Nat) → motive n` 的元素 `f`。它须处理两种情形：输入为 `zero`，或输入形如 `succ n`（`n : Nat`）。第一种情形像以前一样，只须指定具有合适类型的目标值。第二种情形中，递归子可假定 `f` 在 `n` 处的值已算出；因而递归子的下一参数用 `n` 与 `f n` 指定 `f (succ n)` 的值。若查看递归子的类型，可得：

```signature
Nat.rec.{u} :
  {motive : Nat → Sort u} →
  (zero : motive Nat.zero) →
  (succ : (n : Nat) → motive n → motive (Nat.succ n)) →
  (t : Nat) → motive t
```

隐式参数 `motive` 是被定义函数的陪域（codomain）。类型论中常说 `motive` 是消除/递归的**动机**（motive），因为它描述我们要构造的对象种类。接下来两个参数指定如何计算零情形与后继情形，如上所述。它们也称为**次要前提**（minor premises）。最后 `t : Nat` 是函数的输入，也称为**主要前提**（major premise）。

`Nat.recOn` 与 `Nat.rec` 类似，但主要前提出现在次要前提之前。

```signature
Nat.recOn.{u} :
  {motive : Nat → Sort u} →
  (t : Nat) →
  (zero : motive Nat.zero) →
  (succ : ((n : Nat) → motive n → motive (Nat.succ n))) →
  motive t
```

（环境中有 `def add (m n : Nat) : Nat := match n with | Nat.zero => m | Nat.succ n => Nat.succ (add m n)` 与 `variable {n m : Nat}`、`open Nat`。）

例如考虑自然数上的加法函数 `add m n`。固定 `m`，可在 `n` 上递归定义加法：基例设 `add m zero` 为 `m`；在后继步，假定 `add m n` 已确定，定义 `add m (succ n)` 为 `succ (add m n)`。

```lean
namespace Hidden
------
inductive Nat where
  | zero : Nat
  | succ : Nat → Nat
deriving Repr

def add (m n : Nat) : Nat :=
  match n with
  | Nat.zero   => m
  | Nat.succ n => Nat.succ (add m n)

open Nat

#eval add (succ (succ zero)) (succ zero)
-------
end Hidden
```

将此类定义放入命名空间 `Nat` 很有用。我们可在该命名空间中继续定义熟悉记号。加法的两条定义等式现在按定义成立：

```lean
namespace Hidden
inductive Nat where
 | zero : Nat
 | succ : Nat → Nat
deriving Repr
------
namespace Nat

def add (m n : Nat) : Nat :=
  match n with
  | Nat.zero   => m
  | Nat.succ n => Nat.succ (add m n)

instance : Add Nat where
  add := add

theorem add_zero (m : Nat) : m + zero = m := rfl
theorem add_succ (m n : Nat) : m + succ n = succ (m + n) := rfl

end Nat
-------
end Hidden
```

我们将在 [第 10 章](TypeClasses.md)「类型类」说明 `instance` 命令如何工作。以下示例使用 Lean 版本的自然数。

（环境中有 `variable {n : Nat} {motive : Nat → Sort u} {ih : motive n}`。）

然而证明像 `0 + n = n` 这样的事实需要归纳证明。如上所述，归纳原则只是递归原则的特例，当陪域 `motive n` 是 `Prop` 的元素时即是。它表示熟悉的归纳证明模式：要证 `∀ n, motive n`，先证 `motive 0`，再对任意 `n` 假设 `ih : motive n` 并证 `motive (n + 1)`。

```lean
namespace Hidden
------
open Nat

theorem zero_add (n : Nat) : 0 + n = n :=
  Nat.recOn (motive := fun x => 0 + x = x)
   n
   (show 0 + 0 = 0 from rfl)
   (fun (n : Nat) (ih : 0 + n = n) =>
    show 0 + (n + 1) = n + 1 from
    calc 0 + (n + 1)
      _ = (0 + n) + 1 := rfl
      _ = n + 1       := by rw [ih])
-------
end Hidden
```

注意，在证明上下文中使用 `Nat.recOn` 时，它实质上是伪装成归纳原则。`rw` 与 `simp` 策略在此类证明中往往很有效。本例中二者都可把证明化简为：

```lean
namespace Hidden
------
open Nat

theorem zero_add (n : Nat) : 0 + n = n :=
  Nat.recOn (motive := fun x => 0 + x = x) n
    rfl
    (fun n ih => by simp [ih])
-------
end Hidden
```

（环境中有 `variable (m n k : Nat)`。）

另一例：证明加法的结合律 `∀ m n k, m + n + k = m + (n + k)`。（按我们的定义，`+` 左结合，故 `m + n + k` 实为 `(m + n) + k`。）最难的是决定对哪个变量做归纳。因加法在第二个参数上递归定义，`k` 是好猜测；一旦选定，证明几乎自行写出：）

```lean
namespace Hidden
------
open Nat
theorem add_assoc (m n k : Nat) : m + n + k = m + (n + k) :=
  Nat.recOn (motive := fun k => m + n + k = m + (n + k)) k
    (show m + n + 0 = m + (n + 0) from rfl)
    (fun k (ih : m + n + k = m + (n + k)) =>
      show m + n + (k + 1) = m + (n + (k + 1)) from
      calc m + n + (k + 1)
        _ = (m + n + k) + 1   := rfl
        _ = (m + (n + k)) + 1 := by rw [ih]
        _ = m + ((n + k) + 1) := rfl
        _ = m + (n + (k + 1)) := rfl)
-------
end Hidden
```

再次可将证明化简为：

```lean
open Nat
theorem add_assoc (m n k : Nat) : m + n + k = m + (n + k) :=
  Nat.recOn (motive := fun k => m + n + k = m + (n + k)) k
    rfl
    (fun k ih => by simp [add_succ (m + n) k, ih]; rfl)
```

设我们尝试证明加法交换律。对第二个参数做归纳，可这样开始：

```lean
open Nat
theorem add_comm (m n : Nat) : m + n = n + m :=
  Nat.recOn (motive := fun x => m + x = x + m) n
   (show m + 0 = 0 + m by rw [Nat.zero_add, Nat.add_zero])
   (fun (n : Nat) (ih : m + n = n + m) =>
    show m + succ n = succ n + m from
    calc m + succ n
      _ = succ (m + n) := rfl
      _ = succ (n + m) := by rw [ih]
      _ = succ n + m   := sorry)
```

此时可见需要另一支撑事实：`succ (n + m) = succ n + m`。可在 `m` 上归纳证明：

```lean
open Nat

theorem succ_add (n m : Nat) : succ n + m = succ (n + m) :=
  Nat.recOn (motive := fun x => succ n + x = succ (n + x)) m
    (show succ n + 0 = succ (n + 0) from rfl)
    (fun (m : Nat) (ih : succ n + m = succ (n + m)) =>
     show succ n + succ m = succ (n + succ m) from
     calc succ n + succ m
       _ = succ (succ n + m)   := rfl
       _ = succ (succ (n + m)) := by rw [ih]
       _ = succ (n + succ m)   := rfl)
```

然后在上一证明中用 `succ_add` 替换 `sorry`。再次可压缩证明：

```lean
namespace Hidden
inductive Nat where
 | zero : Nat
 | succ : Nat → Nat
deriving Repr

def add (m n : Nat) : Nat :=
  match n with
  | Nat.zero   => m
  | Nat.succ n => Nat.succ (add m n)

instance : Add Nat where
  add := add

namespace Nat
theorem add_zero (m : Nat) : m + zero = m := rfl

theorem add_succ (m n : Nat) : m + succ n = succ (m + n) := rfl

theorem zero_add (n : Nat) : zero + n = n :=
  Nat.recOn (motive := fun x => zero + x = x) n
    rfl
    (fun n ih => by simpa [add_zero, add_succ])

end Nat
------
open Nat
theorem succ_add (n m : Nat) : succ n + m = succ (n + m) :=
  Nat.recOn (motive := fun x => succ n + x = succ (n + x)) m
    rfl
    (fun m ih => by simpa [add_succ (succ n)])

theorem add_comm (m n : Nat) : m + n = n + m :=
  Nat.recOn (motive := fun x => m + x = x + m) n
    (by simp [add_zero, zero_add])
    (fun m ih => by simp_all [succ_add, add_succ])
-------
end Hidden
```

## 7.5 其他递归数据类型

再考虑若干归纳定义类型的例子。对任意类型 `α`，元素为 `α` 的列表之类型 `List α` 在库中定义如下：

```lean
namespace Hidden
------
inductive List (α : Type u) where
  | nil  : List α
  | cons (h : α) (t : List α) : List α

namespace List

def append (as bs : List α) : List α :=
  match as with
  | nil       => bs
  | cons a as => cons a (append as bs)

theorem nil_append (as : List α) : append nil as = as :=
  rfl

theorem cons_append (a : α) (as bs : List α) :
    append (cons a as) bs = cons a (append as bs) :=
  rfl

end List
-------
end Hidden
```

`α` 的列表或为空头表 `nil`，或为元素 `h : α` 后接列表 `t : List α`。第一个元素 `h` 常称列表的「头」（head），其余 `t` 称「尾」（tail）。

作为练习，证明下列结论：

```lean
namespace Hidden
inductive List (α : Type u) where
| nil  : List α
| cons : α → List α → List α
namespace List
def append (as bs : List α) : List α :=
 match as with
 | nil       => bs
 | cons a as => cons a (append as bs)
theorem nil_append (as : List α) : append nil as = as :=
 rfl
theorem cons_append (a : α) (as bs : List α)
                    : append (cons a as) bs = cons a (append as bs) :=
 rfl
------
theorem append_nil (as : List α) :
    append as nil = as :=
  sorry

theorem append_assoc (as bs cs : List α) :
    append (append as bs) cs = append as (append bs cs) :=
  sorry
-------
end List
end Hidden
```

（环境中有 `universe u`、`def length : {α : Type u} → List α → Nat := List.length`、`def append : {α : Type u} → List α → List α → List α := List.append` 与 `variable (as bs : List α)`。）

还可尝试定义返回列表长度的函数 `length : {α : Type u} → List α → Nat`，并证明其符合预期（例如 `length (append as bs) = length as + length bs`）。

另一例：可定义二叉树类型：

```lean
inductive BinaryTree where
  | leaf : BinaryTree
  | node : BinaryTree → BinaryTree → BinaryTree
```

事实上，甚至可定义可数分支树类型：

```lean
inductive CBTree where
  | leaf : CBTree
  | sup : (Nat → CBTree) → CBTree

namespace CBTree

def succ (t : CBTree) : CBTree :=
  sup (fun _ => t)

def toCBTree : Nat → CBTree
  | 0 => leaf
  | n+1 => succ (toCBTree n)

def omega : CBTree :=
  sup toCBTree

end CBTree
```

## 7.6 归纳类型的策略

鉴于归纳类型在 Lean 中的根本重要性，有一系列专为其设计的策略并不意外。此处介绍其中一些。

（环境中有 `variable {x : InductiveType}`。）

`cases` 策略作用于归纳定义类型的元素，名副其实：按各可能构造子分解该元素。最基本形式下，它作用于局部上下文中的元素 `x`，将目标化归为 `x` 被各构造替换后的情形。

```lean
example (p : Nat → Prop)
    (hz : p 0) (hs : ∀ n, p (Nat.succ n)) :
    ∀ n, p n := by
  intro n
  cases n
  . exact hz
--^ PROOF_STATE: A
  . apply hs
--^ PROOF_STATE: B
```

第一分支的证明状态为：

```proofState A
case zero
p : Nat → Prop
hz : p 0
hs : ∀ (n : Nat), p n.succ
⊢ p 0
```

第二分支为：

```proofState B
case succ
p : Nat → Prop
hz : p 0
hs : ∀ (n : Nat), p n.succ
n✝ : Nat
⊢ p (n✝ + 1)
```

`cases` 还有一些额外功能。其一，可用 `with` 子句为各分支选择名称。下例中为 `succ` 的参数选名 `m`，故第二分支涉及 `succ m`。更重要的是，`cases` 会检测局部上下文中依赖目标变量的项：先 revert 这些项，再分裂，再重新引入。下例注意假设 `h : n ≠ 0` 在第一分支变为 `h : 0 ≠ 0`，在第二分支变为 `h : m + 1 ≠ 0`。

```lean (showProofStates := "C D")
open Nat

example (n : Nat) (h : n ≠ 0) : succ (pred n) = n := by
  cases n with
  | zero =>
  --     ^ PROOF_STATE: C
    apply absurd rfl h
  | succ m =>
  --       ^ PROOF_STATE: D
    rfl
```

注意 `cases` 既可产生数据，也可证明命题。

```lean
def f (n : Nat) : Nat := by
  cases n; exact 3; exact 7

example : f 0 = 3 := rfl
example : f 5 = 7 := rfl
```

再次地，`cases` 会 revert、分裂，再重新引入上下文中的依赖。

```lean
def Tuple (α : Type) (n : Nat) :=
  { as : List α // as.length = n }

def f {n : Nat} (t : Tuple α n) : Nat := by
  cases n; exact 3; exact 7

def myTuple : Tuple Nat 3 :=
  ⟨[0, 1, 2], rfl⟩

example : f myTuple = 7 :=
  rfl
```

下面是带多个参数、多个构造子的例子。

```lean
inductive Foo where
  | bar1 : Nat → Nat → Foo
  | bar2 : Nat → Nat → Nat → Foo

def silly (x : Foo) : Nat := by
  cases x with
  | bar1 a b => exact b
  | bar2 c d e => exact e
```

各构造子的分支不必按声明顺序求解。

```lean
inductive Foo where
  | bar1 : Nat → Nat → Foo
  | bar2 : Nat → Nat → Nat → Foo
------
def silly (x : Foo) : Nat := by
  cases x with
  | bar2 c d e => exact e
  | bar1 a b => exact b
```

`with` 语法便于写结构化证明。Lean 还提供互补的 `case` 策略，可聚焦目标并指定变量名。

```lean
inductive Foo where
  | bar1 : Nat → Nat → Foo
  | bar2 : Nat → Nat → Nat → Foo
------
def silly (x : Foo) : Nat := by
  cases x
  case bar1 a b => exact b
  case bar2 c d e => exact e
```

`case` 策略较聪明：会把构造子匹配到合适的目标。例如可按相反顺序填上述目标：

```lean
inductive Foo where
  | bar1 : Nat → Nat → Foo
  | bar2 : Nat → Nat → Nat → Foo
------
def silly (x : Foo) : Nat := by
  cases x
  case bar2 c d e => exact e
  case bar1 a b => exact b
```

也可对任意表达式使用 `cases`。若该表达式出现在目标中，`cases` 会对该表达式泛化，引入所得全称量化变量，再对该变量分情形。

```lean
open Nat

example (p : Nat → Prop) (hz : p 0) (hs : ∀ n, p (succ n)) (m k : Nat)
        : p (m + 3 * k) := by
  cases m + 3 * k
  exact hz   -- goal is p 0
  apply hs   -- goal is a : Nat ⊢ p (succ a)
```

可理解为「按 `m + 3 * k` 是零还是某数的后继分情形」。结果在功能上等价于：

```lean (showProofStates := "Z S")
open Nat

example (p : Nat → Prop) (hz : p 0) (hs : ∀ n, p (succ n)) (m k : Nat)
        : p (m + 3 * k) := by
  generalize m + 3 * k = n
  cases n
  -- ^ PROOF_STATE: Z
  exact hz
  -- ^ PROOF_STATE: S
  apply hs
```

注意表达式 `m + 3 * k` 被 `generalize` 擦除；重要的是它是否为 `0` 或 `n✝ + 1` 的形式。此形式的 `cases` **不会** revert 在等式中也出现该表达式的假设（本例为 `m + 3 * k`）。若某假设中出现此类项且也要对其泛化，须显式 `revert`。

若分情形的表达式不出现在目标中，`cases` 会用 `have` 把该表达式的类型放入上下文。例如：

```lean
example (p : Prop) (m n : Nat)
        (h₁ : m < n → p) (h₂ : m ≥ n → p) : p := by
  cases Nat.lt_or_ge m n
  case inl hlt => exact h₁ hlt
  --           ^ PROOF_STATE: one
  case inr hge => exact h₂ hge
  --           ^ PROOF_STATE: two
```

定理 `Nat.lt_or_ge m n` 断言 `m < n ∨ m ≥ n`，自然可把上述证明视为按这两种情形分裂。第一分支有假设 `hlt : m < n`，第二分支有 `hge : m ≥ n`。上述证明在功能上等价于：

```lean
example (p : Prop) (m n : Nat)
        (h₁ : m < n → p) (h₂ : m ≥ n → p) : p := by
  have h : m < n ∨ m ≥ n := Nat.lt_or_ge m n
  cases h
  case inl hlt => exact h₁ hlt
  case inr hge => exact h₂ hge
```

前两行之后，上下文中有假设 `h : m < n ∨ m ≥ n`，只需对其 `cases`。

另一例：用自然数上的可判定相等性，按 `m = n` 与 `m ≠ n` 分裂。

```lean
#check Nat.sub_self

example (m n : Nat) : m - n = 0 ∨ m ≠ n := by
  cases Decidable.em (m = n) with
  | inl heq => rw [heq]; apply Or.inl; exact Nat.sub_self n
  | inr hne => apply Or.inr; exact hne
```

记住，若 `open Classical`，可对任意命题使用排中律。但借助类型类推断（见 [第 10 章](TypeClasses.md)「类型类」），Lean 可找到相关判定过程，因而可在可计算函数中使用这种分情形。

正如 `cases` 可做分情形证明，`induction` 策略可做归纳证明。语法与 `cases` 类似，但参数只能是局部上下文中的项。例如：

```lean
namespace Hidden
------
theorem zero_add (n : Nat) : 0 + n = n := by
  induction n with
  | zero => rfl
  | succ n ih => rw [Nat.add_succ, ih]
-------
end Hidden
```

与 `cases` 一样，可用 `case` 替代 `with`：

```lean
namespace Hidden
------
theorem zero_add (n : Nat) : 0 + n = n := by
  induction n
  case zero => rfl
  case succ n ih => rw [Nat.add_succ, ih]
-------
end Hidden
```

更多示例如下：

```lean
namespace Hidden
inductive Nat where
  | zero
  | succ : Nat → Nat

def Nat.toNat : Nat → _root_.Nat
  | .zero => .zero
  | .succ n => .succ n.toNat

def Nat.ofNat : _root_.Nat → Nat
  | .zero => .zero
  | .succ n => .succ (.ofNat n)

def add (m n : Nat) : Nat :=
  match n with
  | Nat.zero   => m
  | Nat.succ n => Nat.succ (add m n)

instance : Add Nat where
  add := add

instance : OfNat Nat n where
  ofNat := .ofNat n

@[simp]
theorem zero_zero : (.zero : Nat) = 0 := rfl
theorem add_zero (n : Nat) : n + 0 = n := rfl
theorem add_succ (n k : Nat) : n + k.succ = (n + k).succ := rfl
------
open Nat

theorem zero_add (n : Nat) : 0 + n = n := by
  induction n <;> simp [*, add_zero, add_succ]

theorem succ_add (m n : Nat) : succ m + n = succ (m + n) := by
  induction n <;> simp [*, add_zero, add_succ]

theorem add_comm (m n : Nat) : m + n = n + m := by
  induction n <;> simp [*, add_zero, add_succ, succ_add, zero_add]

theorem add_assoc (m n k : Nat) : m + n + k = m + (n + k) := by
  induction k <;> simp [*, add_zero, add_succ]
-------
end Hidden
```

`induction` 策略还支持具有多个目标（即多个主要前提）的用户自定义归纳原则。下例使用 `Nat.mod.inductionOn`，其签名为：

```signature
Nat.mod.inductionOn
  {motive : Nat → Nat → Sort u}
  (x y  : Nat)
  (ind  : ∀ x y, 0 < y ∧ y ≤ x → motive (x - y) y → motive x y)
  (base : ∀ x y, ¬(0 < y ∧ y ≤ x) → motive x y) :
  motive x y
```

```lean
example (x : Nat) {y : Nat} (h : y > 0) : x % y < y := by
  induction x, y using Nat.mod.inductionOn with
  | ind x y h₁ ih =>
    rw [Nat.mod_eq_sub_mod h₁.2]
    exact ih h
  | base x y h₁ =>
    have : ¬ 0 < y ∨ ¬ y ≤ x := Iff.mp (Decidable.not_and_iff_or_not ..) h₁
    match this with
    | Or.inl h₁ => exact absurd h h₁
    | Or.inr h₁ =>
      have hgt : y > x := Nat.gt_of_not_le h₁
      rw [← Nat.mod_eq_of_lt hgt] at hgt
      assumption
```

在策略中也可使用 `match` 记号：

```lean
example : p ∨ q → q ∨ p := by
  intro h
  match h with
  | Or.inl _  => apply Or.inr; assumption
  | Or.inr h2 => apply Or.inl; exact h2
```

为方便起见，模式匹配已集成进 `intro`、`funext` 等策略：

```lean
example : s ∧ q ∧ r → p ∧ r → q ∧ p := by
  intro ⟨_, ⟨hq, _⟩⟩ ⟨hp, _⟩
  exact ⟨hq, hp⟩

example :
    (fun (x : Nat × Nat) (y : Nat × Nat) => x.1 + y.2)
    =
    (fun (x : Nat × Nat) (z : Nat × Nat) => z.2 + x.1) := by
  funext (a, b) (c, d)
  show a + d = d + a
  rw [Nat.add_comm]
```

本节最后介绍便于处理归纳类型的策略：`injection`。按设计，归纳类型的元素是自由生成的，即构造子是单射的且值域不交。`injection` 策略正是利用这一事实：

```lean
open Nat

example (m n k : Nat) (h : succ (succ m) = succ (succ n))
        : n + k = m + k := by
  injection h with h'
  injection h' with h''
  rw [h'']
```

第一次调用把 `h' : m.succ = n.succ` 加入上下文，第二次加入 `h'' : m = n`。

`injection` 还会检测不同构造子被设为相等时产生的矛盾，并用其闭合目标。

```lean
open Nat

example (m n : Nat) (h : succ m = 0) : n = n + 7 := by
  injection h

example (m n : Nat) (h : succ m = 0) : n = n + 7 := by
  contradiction

example (h : 7 = 4) : False := by
  contradiction
```

如第二例所示，`contradiction` 策略也会检测此类矛盾。

## 7.7 归纳族

我们几乎说完了 Lean 接受的归纳定义之全貌。迄今你已看到 Lean 允许引入具有任意多个递归构造子的归纳类型。事实上，单次归纳定义可引入索引**族**（family）的归纳类型，方式如下。

**归纳族**是由如下同时归纳定义的索引类型族：

```
inductive foo : ... → Sort u where
  | constructor₁ : ... → foo ...
  | constructor₂ : ... → foo ...
  ...
  | constructorₙ : ... → foo ...
```

（环境中有 `universe u`。）

与普通归纳定义（构造 `Sort u` 的元素）不同，更一般的版本构造函数 `... → Sort u`，其中 `...` 表示参数类型序列，亦称**索引**（indices）。每个构造子则构造该族某成员的元素。一例是 `Vect α n` 的定义——长度为 `n`、元素为 `α` 的向量类型：

```lean
inductive Vect (α : Type u) : Nat → Type u where
  | nil  : Vect α 0
  | cons : α → {n : Nat} → Vect α n → Vect α (n + 1)
```

注意 `cons` 构造子取 `Vect α n` 的元素并返回 `Vect α (n + 1)` 的元素，从而用族的一个成员构造另一个成员的元素。

更奇特的例子是 Lean 中等式类型的定义：

```lean
namespace Hidden
------
inductive Eq {α : Sort u} (a : α) : α → Prop where
  | refl : Eq a a
-------
end Hidden
```

（环境中有 `variable (α : Sort u) (a : α) (x : α)`。）

对每个固定的 `α : Sort u` 与 `a : α`，此定义构造由 `x : α` 索引的类型族 `Eq a x`。然而只有一个构造子 `refl`，它是 `Eq a a` 的元素。直观上，构造 `Eq a x` 的证明的唯一方式是使用自反性，即当 `x` 为 `a` 时。注意 `Eq a a` 是族 `Eq a x` 中唯一有元素的类型。Lean 生成的消除原则如下：

```lean
set_option pp.proofs true
--------
universe u v

#check (@Eq.rec : {α : Sort u} → {a : α} →
                  {motive : (x : α) → a = x → Sort v} →
                  motive a rfl →
                  {b : α} → (h : a = b) → motive b h)
```

值得注意的是，相等性的所有基本公理都可从构造子 `refl` 与 eliminator `Eq.rec` 推出。不过相等性的定义并不典型；见 [7.8 节](#78-公理化细节) 的讨论。

递归子 `Eq.rec` 也用于定义替换：

```lean
namespace Hidden
------
theorem subst {α : Type u} {a b : α} {p : α → Prop}
    (h₁ : Eq a b) (h₂ : p a) : p b :=
  Eq.rec (motive := fun x _ => p x) h₂ h₁
-------
end Hidden
```

也可用 `match` 定义 `subst`：

```lean
namespace Hidden
------
theorem subst {α : Type u} {a b : α} {p : α → Prop}
    (h₁ : Eq a b) (h₂ : p a) : p b :=
  match h₁ with
  | rfl => h₂
-------
end Hidden
```

事实上，Lean 用基于生成辅助项（如 `Eq.casesOn`、`Eq.ndrec`）的定义来编译 `match` 表达式，而这些辅助项本身用 `Eq.rec` 定义。

```lean
namespace Hidden
------
theorem subst {α : Type u} {a b : α} {p : α → Prop}
    (h₁ : a = b) (h₂ : p a) : p b :=
  match h₁ with
  | rfl => h₂

set_option pp.all true
#print subst

#print subst.match_1_1

#print Eq.casesOn

#print Eq.ndrec
-------
end Hidden
```

对 `h₁ : a = b` 使用递归子或 `match` 时，可假定 `a` 与 `b` 相同，此时 `p b` 与 `p a` 相同。

不难证明 `Eq` 是对称且传递的。下例证明 `symm`，`trans` 与 `congr`（同余，congruence）留作练习：

```lean
namespace Hidden
------
variable {α β : Type u} {a b c : α}

theorem symm (h : Eq a b) : Eq b a :=
  match h with
  | rfl => rfl

theorem trans (h₁ : Eq a b) (h₂ : Eq b c) : Eq a c :=
  sorry

theorem congr (f : α → β) (h : Eq a b) : Eq (f a) (f b) :=
  sorry
-------
end Hidden
```

类型论文献中还有归纳定义的进一步推广，例如**归纳-递归**（induction-recursion）与**归纳-归纳**（induction-induction）原则。Lean 不支持这些。

## 7.8 公理化细节

我们通过示例描述了归纳类型及其语法。本节为关心公理基础的读者提供补充信息。

归纳类型的构造子取**参数**——直观上，在整个归纳构造中保持固定的参数——以及**索引**，即同时正在构造的类型族之参数化参数。每个构造子应有类型，其中参数类型由先前定义的类型、参数与索引类型，以及当前正在定义的归纳族构造而成。要求是：若后者出现，则仅**严格正**（strictly positive）地出现。简单说，构造子中出现它的任何参数必须是依赖箭头类型，且正在定义的归纳类型仅作为结果类型出现，索引用常量与先前参数给出。

因归纳类型生活在某个 `u` 的 `Sort u` 中，自然要问 `u` 可实例化为哪些宇宙层次。族 `C` 的归纳类型定义中每个构造子 `c` 形如

```
  c : (a : α) → (b : β[a]) → C a p[a,b]
```

其中 `a` 是数据类型参数序列，`b` 是构造子参数序列，`p[a, b]` 是索引，决定该构造属于归纳族的哪个成员。（注意此描述略有误导：只要依赖有意义，构造子参数可任意顺序出现。）对 `C` 的宇宙层次 `u` 的约束分两种情形，取决于归纳类型是否指定落在 `Prop`（即 `Sort 0`）中。

先考虑归纳类型**未**指定落在 `Prop` 的情形。则宇宙层次 `u` 须满足：

> 对每个如上构造子 `c`，以及序列 `β[a]` 中每个 `βk[a]`：若 `βk[a] : Sort v`，则 `u ≥ v`。

换言之，`u` 须至少与表示构造子参数的每个类型的宇宙层次一样大。

当归纳类型指定落在 `Prop` 时，对构造子参数的宇宙层次无约束。但这些层次影响消除规则。一般地，对 `Prop` 中的归纳类型，消除规则的动机须落在 `Prop` 中。

此最后规则有一例外：当只有一个构造子且每个构造子参数或在 `Prop` 中或是索引时，允许从归纳定义的 `Prop` 消除到任意 `Sort`。直观上，此情形下消除不利用「类型参数有元素」这一事实之外的任何信息。此特殊情形称为**单例消除**（singleton elimination）。

我们已在应用归纳定义相等类型的 eliminator `Eq.rec` 时见到单例消除。可用元素 `h : Eq a b` 把元素 `h₂ : p a` 转换为 `p b`，即使 `p a` 与 `p b` 是任意类型，因为该转换不产生新数据，只重新解释已有数据。单例消除也用于异质相等与良基递归，将在 [第 8 章](https://lean-lang.org/theorem_proving_in_lean4/Induction-and-Recursion/)「归纳与递归」讨论。

## 7.9 互递归与嵌套归纳类型

现在考虑两种常有用的归纳类型推广，Lean 通过把它们「编译」为上述更原始的归纳类型来支持。换言之，Lean 解析更一般的定义，据此定义辅助归纳类型，再用辅助类型定义我们真正想要的类型。下一章介绍的 Lean 方程编译器（equation compiler）才能有效使用这些类型。尽管如此，在此描述这些声明是合理的，因为它们只是普通归纳定义的直截了当变体。

首先，Lean 支持**互递归定义**（mutually defined）的归纳类型：可同时定义两个（或更多）归纳类型，彼此相互引用。

```lean
mutual
  inductive Even : Nat → Prop where
    | even_zero : Even 0
    | even_succ : (n : Nat) → Odd n → Even (n + 1)

  inductive Odd : Nat → Prop where
    | odd_succ : (n : Nat) → Even n → Odd (n + 1)
end
```

此例同时定义两种类型：自然数 `n` 为 `Even` 当且仅当它为 `0` 或比某个 `Odd` 数大 1；`Odd` 当且仅当它比某个 `Even` 数大 1。下面练习中要求你写出细节。

互递归定义也可用于定义节点标号为 `α` 元素之有限树的记号：

```lean
mutual
    inductive Tree (α : Type u) where
      | node : α → TreeList α → Tree α

    inductive TreeList (α : Type u) where
      | nil  : TreeList α
      | cons : Tree α → TreeList α → TreeList α
end
```

按此定义，可通过给出 `α` 的元素连同子树列表（可能为空）来构造 `Tree α` 的元素。子树列表由类型 `TreeList α` 表示，它或为空头表 `nil`，或为树与 `TreeList α` 元素的 `cons`。

然而此定义不便使用。若子树列表由类型 `List (Tree α)` 给出会好得多，尤其 Lean 库含大量处理列表的函数与定理。可证明 `TreeList α` 与 `List (Tree α)` **同构**（isomorphic），但沿此同构来回翻译结果很繁琐。

事实上，Lean 允许定义我们真正想要的归纳类型：

```lean
inductive Tree (α : Type u) where
  | mk : α → List (Tree α) → Tree α
```

这称为**嵌套归纳类型**（nested inductive type）。它超出上一节给出的归纳类型严格规格，因为 `Tree` 并非严格正地出现在 `mk` 的参数中，而是嵌套在 `List` 类型构造子内部。Lean 随后在核中自动建立 `TreeList α` 与 `List (Tree α)` 之间的同构，并据同构定义 `Tree` 的构造子。

## 7.10 练习

（环境中有 `open Nat`、`variable {n m : Nat}`、`def length : List α → Nat`（`| [] => 0 | _ :: xs => length xs + 1`）、`def reverse : List α → List α := go []`（其中 `go` 如上）、`variable {xs ys : List α}`，以及 `inductive Term where | const (n : Nat) | var (n : Nat) | plus (s t : Term) | times (s t : Term)`、`open Term`、`variable {s t : Term}`。）

1. 尝试定义自然数上的其他运算，如乘法、前驱函数（`pred 0 = 0`）、截断减法（当 `m ≥ n` 时 `n - m = 0`）、幂运算。再尝试证明它们的一些基本性质，在已证定理基础上进行。

   因其中许多已在 Lean 核心库中定义，应在名为 `Hidden` 或类似名称的命名空间内工作，以避免名称冲突。

2. 定义列表上的若干运算，如 `length` 或 `reverse` 函数。证明一些性质，例如：

   a. `length (xs ++ ys) = length xs + length ys`

   b. `length (reverse xs) = length xs`

   c. `reverse (reverse xs) = xs`

3. 定义由下列构造子搭建项的归纳数据类型：

   - `const n`，表示自然数 `n` 的常量
   - `var n`，编号为 `n` 的变量
   - `plus s t`，表示 `s` 与 `t` 的和
   - `times s t`，表示 `s` 与 `t` 的积

   递归定义函数：在给变量赋值下求值任意此类项。

4. 类似地，定义命题公式类型，以及该类型上的函数：求值函数、度量公式复杂度的函数、用另一公式替换给定变量的函数。