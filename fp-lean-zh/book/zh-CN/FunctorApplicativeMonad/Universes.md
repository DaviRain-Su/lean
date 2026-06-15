# 宇宙（Universes）

%%%
tag := "universe-levels"
%%%

为简单起见，本书到目前为止一直略过了 Lean 的一项重要特性：_宇宙_（universes）。
宇宙是一种对其他类型进行分类的类型。
其中两个我们很熟悉：{anchorTerm TypeType}`Type` 和 {anchorTerm PropType}`Prop`。
{anchorTerm SomeTypes}`Type` 对普通类型进行分类，例如 {anchorName SomeTypes}`Nat`、{anchorTerm SomeTypes}`String`、{anchorTerm SomeTypes}`Int → String × Char` 以及 {anchorTerm SomeTypes}`IO Unit`。
{anchorTerm PropType}`Prop` 对可能为真或为假的命题进行分类，例如 {anchorTerm SomeTypes}`"nisse" = "elf"` 或 {anchorTerm SomeTypes}`3 > 2`。
{anchorTerm PropType}`Prop` 的类型是 {anchorTerm SomeTypes}`Type`：

```anchor PropType
#check Prop
```

```anchorInfo PropType
Prop : Type
```

出于技术原因，除了这两个宇宙之外还需要更多宇宙。
特别是，{anchorTerm SomeTypes}`Type` 本身不能是一个 {anchorTerm SomeTypes}`Type`。
否则就可以构造出逻辑悖论，从而削弱 Lean 作为定理证明器的实用性。

这一结论的形式化论证称为 **Girard 悖论**（Girard's Paradox）。
它与一个更著名的悖论 **Russell 悖论**（Russell's Paradox）相关，后者曾用来表明早期版本的集合论是不一致的。
在这些集合论中，一个集合可以由一个性质来定义。
例如，可以有一个所有红色事物的集合、所有水果的集合、所有自然数的集合，甚至所有集合的集合。
给定一个集合，可以问某个给定元素是否包含在其中。
例如，一只蓝知更鸟不包含在所有红色事物的集合中，但所有红色事物的集合包含在所有集合的集合中。
事实上，所有集合的集合甚至包含它自身。

那么，所有不包含自身的集合的集合呢？
它包含所有红色事物的集合，因为所有红色事物的集合本身并不是红色的。
它不包含所有集合的集合，因为所有集合的集合包含它自身。
但它包含自身吗？
如果它包含自身，那么它就不能包含自身。
但如果它不包含自身，那么它又必须包含自身。

这是一个矛盾，说明最初的假设中有某些东西出了问题。
特别是，允许通过提供任意性质来构造集合，其能力过于强大。
后来版本的集合论限制了集合的形成方式，以消除这一悖论。

在把类型 {anchorTerm SomeTypes}`Type` 赋予 {anchorTerm SomeTypes}`Type` 的依赖类型论版本中，可以构造出一个相关的悖论。
为了确保 Lean 具有一致的逻辑基础，并能够用作数学工具，{anchorTerm SomeTypes}`Type` 需要具有某种其他类型。
这个类型称为 {anchorTerm SomeTypes}`Type 1`：

```anchor TypeType
#check Type
```

```anchorInfo TypeType
Type : Type 1
```

类似地，{anchorTerm Type1Type}`Type 1` 是一个 {anchorTerm Type1Type}`Type 2`，
{anchorTerm Type2Type}`Type 2` 是一个 {anchorTerm Type2Type}`Type 3`，
{anchorTerm Type3Type}`Type 3` 是一个 {anchorTerm Type3Type}`Type 4`，依此类推。

函数类型占据能够同时包含参数类型和返回类型的最小宇宙。
这意味着 {anchorTerm NatNatType}`Nat → Nat` 是一个 {anchorTerm NatNatType}`Type`，{anchorTerm Fun00Type}`Type → Type` 是一个 {anchorTerm Fun00Type}`Type 1`，而 {anchorTerm Fun12Type}`Type 3` 是一个 {anchorTerm Fun12Type}`Type 1 → Type 2`。

这条规则有一个例外。
如果一个函数的返回类型是 {anchorTerm PropType}`Prop`，那么整个函数类型都在 {anchorTerm PropType}`Prop` 中，即使参数位于更大的宇宙（例如 {anchorTerm SomeTypes}`Type`，甚至 {anchorTerm SomeTypes}`Type 1`）中也是如此。
特别是，这意味着关于具有普通类型的值的谓词位于 {anchorTerm PropType}`Prop` 中。
例如，类型 {anchorTerm FunPropType}`(n : Nat) → n = n + 0` 表示一个从 {anchorTerm SomeTypes}`Nat` 到“它等于自身加零”的证据的函数。
尽管 {anchorTerm SomeTypes}`Nat` 位于 {anchorTerm SomeTypes}`Type` 中，根据这条规则，这个函数类型仍位于 {anchorTerm FunPropType}`Prop` 中。
类似地，尽管 {anchorTerm SomeTypes}`Type` 位于 {anchorTerm SomeTypes}`Type 1` 中，函数类型 {anchorTerm FunTypePropType}`Type → 2 + 2 = 4` 仍位于 {anchorTerm FunTypePropType}`Prop` 中。

# 用户定义的类型

%%%
tag := "inductive-type-universes"
%%%

结构体和归纳数据类型可以声明为位于特定的宇宙中。
Lean 随后会检查每个数据类型是否通过位于足够大的宇宙中来避免悖论，从而防止它包含自身的类型。
例如，在下面的声明中，{anchorName MyList1}`MyList` 被声明为位于 {anchorTerm SomeTypes}`Type` 中，其类型参数 {anchorName MyList1}`α` 也是如此：

```anchor MyList1
inductive MyList (α : Type) : Type where
  | nil : MyList α
  | cons : α → MyList α → MyList α
```

{anchorTerm MyList1Type}`MyList` 本身是一个 {anchorTerm MyList1Type}`Type → Type`。
这意味着它不能用来包含实际的类型，因为那样它的参数就会是 {anchorTerm SomeTypes}`Type`，而 {anchorTerm SomeTypes}`Type` 是一个 {anchorTerm SomeTypes}`Type 1`：

```anchor myListNat1Err
def myListOfNat : MyList Type :=
  .cons Nat .nil
```

```anchorError myListNat1Err
Application type mismatch: The argument
  Type
has type
  Type 1
of sort `Type 2` but is expected to have type
  Type
of sort `Type 1` in the application
  MyList Type
```

把 {anchorName MyList2}`MyList` 更新为使其参数为 {anchorTerm MyList2}`Type 1`，会得到一个被 Lean 拒绝的定义：

```anchor MyList2
inductive MyList (α : Type 1) : Type where
  | nil : MyList α
  | cons : α → MyList α → MyList α
```

```anchorError MyList2
Invalid universe level in constructor `MyList.cons`: Parameter has type
  α
at universe level
  2
which is not less than or equal to the inductive type's resulting universe level
  1
```

出现这个错误，是因为类型为 {anchorName MyList2}`α` 的 {anchorTerm MyList2}`cons` 的参数来自比 {anchorName MyList2}`MyList` 更大的宇宙。
把 {anchorName MyList2}`MyList` 本身放在 {anchorTerm SomeTypes}`Type 1` 中可以解决这个问题，但代价是 {anchorName MyList2}`MyList` 现在在期望 {anchorTerm SomeTypes}`Type` 的上下文中使用起来会很不方便。

决定一个数据类型是否被允许的具体规则有些复杂。
一般而言，最好从与其参数中最大者相同的宇宙开始定义数据类型。
然后，如果 Lean 拒绝该定义，就将其层级提高一级，这通常就能通过。

# 宇宙多态性

%%%
tag := "universe-polymorphism"
%%%

在特定宇宙中定义数据类型可能导致代码重复。
把 {anchorName MyList1}`MyList` 放在 {anchorTerm MyList1Type}`Type → Type` 中意味着它不能用于实际的类型列表。
把它放在 {anchorTerm MyList15Type}`Type 1 → Type 1` 中意味着它不能用于类型列表的列表。
与其通过复制粘贴来创建位于 {anchorTerm SomeTypes}`Type`、{anchorTerm SomeTypes}`Type 1`、{anchorTerm Type2Type}`Type 2` 等宇宙中的版本，不如使用一种称为 **宇宙多态性**（universe polymorphism）的特性，编写一个可以在这些宇宙中任意实例化的单一定义。

普通多态类型在定义中使用变量来代表类型。
这使得 Lean 可以不同地填充这些变量，从而使这些定义能够与多种类型一起使用。
类似地，宇宙多态性允许在定义中使用变量来代表宇宙，使 Lean 可以不同地填充它们，从而与多种宇宙一起使用。
就像类型参数习惯上用希腊字母命名一样，宇宙参数习惯上命名为 {lit}`u`、{lit}`v` 和 {lit}`w`。

{anchorName MyList3}`MyList` 的这个定义没有指定特定的宇宙层级，而是使用变量 {anchorTerm MyList3}`u` 来代表任意层级。
如果所得数据类型与 {anchorTerm SomeTypes}`Type` 一起使用，那么 {anchorTerm MyList3}`u` 就是 {lit}`0`；如果与 {anchorTerm Fun12Type}`Type 3` 一起使用，那么 {anchorTerm MyList3}`u` 就是 {lit}`3`：

```anchor MyList3
inductive MyList (α : Type u) : Type u where
  | nil : MyList α
  | cons : α → MyList α → MyList α
```

有了这个定义，同一个 {anchorName MyList3}`MyList` 定义既可以用来包含实际的自然数，也可以用来包含自然数类型本身：

```anchor myListOfNat3
def myListOfNumbers : MyList Nat :=
  .cons 0 (.cons 1 .nil)

def myListOfNat : MyList Type :=
  .cons Nat .nil
```

它甚至可以包含它自身：

```anchor myListOfList3
def myListOfList : MyList (Type → Type) :=
  .cons MyList .nil
```

这似乎会让人能够写出逻辑悖论。
毕竟，宇宙系统的全部意义就在于排除自引用类型。
然而，在幕后，{anchorName MyList3}`MyList` 的每次出现都会附带一个宇宙层级参数。
本质上，{anchorName MyList3}`MyList` 的宇宙多态定义在每个层级上都创建了一份数据类型的_副本_，而层级参数选择要使用哪一份副本。
这些层级参数用点号和花括号书写，因此 {anchorTerm MyListDotZero}`MyList.{0} : Type → Type`，{anchorTerm MyListDotOne}`MyList.{1} : Type 1 → Type 1`，而 {anchorTerm MyListDotTwo}`MyList.{2} : Type 2 → Type 2`。

显式写出层级后，前面的例子变成：

```anchor myListOfList3Expl
def myListOfNumbers : MyList.{0} Nat :=
  .cons 0 (.cons 1 .nil)

def myListOfNat : MyList.{1} Type :=
  .cons Nat .nil

def myListOfList : MyList.{1} (Type → Type) :=
  .cons MyList.{0} .nil
```

当一个宇宙多态定义接受多个类型作为参数时，最好为每个参数提供各自的层级变量，以获得最大的灵活性。
例如，可以如下编写只有一个层级参数的 {anchorName SumNoMax}`Sum` 版本：

```anchor SumNoMax
inductive Sum (α : Type u) (β : Type u) : Type u where
  | inl : α → Sum α β
  | inr : β → Sum α β
```

这个定义可以在多个层级上使用：

```anchor SumPoly
def stringOrNat : Sum String Nat := .inl "hello"

def typeOrType : Sum Type Type := .inr Nat
```

然而，它要求两个参数位于同一宇宙中：

```anchor stringOrTypeLevels
def stringOrType : Sum String Type := .inr Nat
```

```anchorError stringOrTypeLevels
Application type mismatch: The argument
  Type
has type
  Type 1
of sort `Type 2` but is expected to have type
  Type
of sort `Type 1` in the application
  Sum String Type
```

通过为两个类型参数的宇宙层级使用不同的变量，并声明所得数据类型位于两者中的较大者，可以使这个数据类型更加灵活：

```anchor SumMax
inductive Sum (α : Type u) (β : Type v) : Type (max u v) where
  | inl : α → Sum α β
  | inr : β → Sum α β
```

这使得 {anchorName SumMax}`Sum` 可以与来自不同宇宙的参数一起使用：

```anchor stringOrTypeSum
def stringOrType : Sum String Type := .inr Nat
```

在 Lean 期望宇宙层级的位置，允许以下任何一种：

 * 具体层级，如 {lit}`0` 或 {lit}`1`
 * 代表层级的变量，例如 {anchorTerm SumMax}`u` 或 {anchorTerm SumMax}`v`
 * 两个层级的最大值，写作把层级应用于 {anchorTerm SumMax}`max`
 * 层级递增，用 {anchorTerm someTrueProps}`+ 1` 书写

## 编写宇宙多态定义

%%%
tag := none
%%%

到目前为止，本书中定义的每个数据类型都位于 {anchorTerm SomeTypes}`Type`，即最小的数据宇宙。
在介绍来自 Lean 标准库的多态数据类型（例如 {anchorName SomeTypes}`List` 和 {anchorName SumMax}`Sum`）时，本书创建了非宇宙多态的版本。
真正的版本使用宇宙多态性，以便在类型级程序和非类型级程序之间实现代码复用。

编写宇宙多态类型时，有几条一般性准则需要遵循。
首先，独立的类型参数应使用不同的宇宙变量，这使多态定义能够与更多种类的参数一起使用，从而增加代码复用的潜力。
其次，整个类型本身通常位于所有宇宙变量的最大值，或者比这个最大值大一级。
先尝试两者中较小的一个。
最后，最好把新类型放在尽可能小的宇宙中，这样它就能在其他上下文中更灵活地使用。
非多态类型（例如 {anchorTerm SomeTypes}`Nat` 和 {anchorName SomeTypes}`String`）可以直接放在 {anchorTerm Type0Type}`Type 0` 中。

## {anchorTerm PropType}`Prop` 与多态性

%%%
tag := none
%%%

正如 {anchorTerm SomeTypes}`Type`、{anchorTerm SomeTypes}`Type 1` 等描述对程序和数据进行分类的类型一样，{anchorTerm PropType}`Prop` 对逻辑命题进行分类。
位于 {anchorTerm PropType}`Prop` 中的类型描述什么算作某条陈述为真的令人信服的证据。
命题在许多方面与普通类型相似：它们可以归纳地声明，可以有构造子，函数也可以接受命题作为参数。
然而，与数据类型不同，通常并不关心为陈述的真实性提供了_哪一份_证据，只关心_是否_提供了证据。
另一方面，一个程序不仅应返回一个 {anchorTerm SomeTypes}`Nat`，而且应返回_正确的_那个 {anchorTerm SomeTypes}`Nat`，这一点非常重要。

{anchorTerm PropType}`Prop` 位于宇宙层级的最底层，而 {anchorTerm PropType}`Prop` 的类型是 {anchorTerm SomeTypes}`Type`。
这意味着 {anchorTerm PropType}`Prop` 适合作为参数提供给 {anchorName SomeTypes}`List`，原因与 {anchorTerm SomeTypes}`Nat` 相同。
命题列表的类型是 {anchorTerm SomeTypes}`List Prop`：

```anchor someTrueProps
def someTruePropositions : List Prop := [
  1 + 1 = 2,
  "Hello, " ++ "world!" = "Hello, world!"
]
```

显式填出宇宙参数可以说明 {anchorTerm PropType}`Prop` 是一个 {anchorTerm SomeTypes}`Type`：

```anchor someTruePropsExp
def someTruePropositions : List.{0} Prop := [
  1 + 1 = 2,
  "Hello, " ++ "world!" = "Hello, world!"
]
```

在幕后，{anchorTerm PropType}`Prop` 和 {anchorTerm SomeTypes}`Type` 被统一到一个称为 {anchorTerm SomeTypes}`Sort` 的单一层级中。
{anchorTerm PropType}`Prop` 与 {anchorTerm sorts}`Sort 0` 相同，{anchorTerm Type0Type}`Type 0` 是 {anchorTerm sorts}`Sort 1`，{anchorTerm SomeTypes}`Type 1` 是 {anchorTerm sorts}`Sort 2`，依此类推。
事实上，{anchorTerm sorts}`Type u` 与 {anchorTerm sorts}`Sort (u+1)` 相同。
用 Lean 编写程序时，这通常并不相关，但它有时会出现在错误信息中，并且解释了 {anchorName sorts}`CoeSort` 类的名称。
此外，把 {anchorTerm PropType}`Prop` 作为 {anchorTerm sorts}`Sort 0` 使得还有一个宇宙运算符变得有用。
宇宙层级 {lit}`imax u v` 在 {anchorTerm sorts}`v` 为 {lit}`0` 时是 {lit}`0`，否则是 {anchorTerm sorts}`u` 与 {anchorTerm sorts}`v` 中的较大者。
与 {anchorTerm sorts}`Sort` 一起，这使得在编写应尽可能在 {anchorTerm PropType}`Prop` 和 {anchorTerm SomeTypes}`Type` 宇宙之间可移植的代码时，可以使用返回 {anchorTerm PropType}`Prop` 的函数的特殊规则。

# 多态性的实践

%%%
tag := none
%%%

在本书的其余部分中，多态数据类型、结构体和类的定义将使用宇宙多态性，以与 Lean 标准库保持一致。
这将使 {moduleName}`Functor`、{anchorName next}`Applicative` 和 {anchorName next}`Monad` 类的完整表述与它们的实际定义完全一致。