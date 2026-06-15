# 小结

%%%
tag := "structure-applicative-monad-summary"
%%%

# 类型类与结构体

%%%
tag := none
%%%

在幕后，类型类由结构体表示。
定义一个类型类会定义一个结构体，并额外创建一个空的实例表。
定义一个实例会创建一个类型为该结构体的值，或者是一个能返回该结构体的函数，并额外向表中添加一条记录。
实例搜索包括查阅实例表来构造实例。
结构体和类型类都可以为字段（即方法的默认实现）提供默认值。

# 结构体与继承

%%%
tag := none
%%%

结构体可以继承自其他结构体。
在幕后，继承自另一个结构体的结构体会把原始结构体的一个实例作为字段包含在内。
换句话说，继承是通过组合实现的。
当使用多重继承时，只使用额外父结构体的独有字段以避免菱形问题，而通常会提取父结构体值的函数则被组织为构造一个父结构体值。
记录点号记法会考虑结构体继承。

因为类型类只是附加了一些自动化的结构体，所有这些特性在类型类中都可用。
结合默认方法，这可以用来创建细粒度的接口层次，同时又不会给客户代码带来很大负担，因为从大型类型类继承而来的小型类型类可以被自动实现。

# 应用函子

%%%
tag := none
%%%

**应用函子**（applicative functor）是具有两个额外运算的函子：
 * {anchorName Applicative}`pure`，与 {anchorName Monad}`Monad` 的同名运算符相同
 * {anchorName Seq}`seq`，允许在函子的上下文中应用函数。

虽然单子可以表示带有控制流的任意程序，应用函子只能从左到右运行函数参数。
因为它们能力较弱，它们给针对该接口编写的程序提供的控制较少，而方法的实现者则拥有更大的自由度。
某些有用的类型可以实现 {anchorName Applicative}`Applicative`，但不能实现 {anchorName Monad}`Monad`。

事实上，类型类 {anchorName HonestFunctor}`Functor`、{anchorName Applicative}`Applicative` 和 {anchorName Monad}`Monad` 形成了一个能力层次。
沿层次向上移动，从 {anchorName HonestFunctor}`Functor` 朝向 {anchorName Monad}`Monad`，可以编写更强大的程序，但实现更强大类型类的类型更少。
多态程序应尽可能使用较弱的抽象来编写，而数据类型应尽可能获得较强大的实例。
这能最大化代码复用。
更强大的类型类继承自较弱的类型类，这意味着 {anchorName Monad}`Monad` 的实现会免费提供 {anchorName HonestFunctor}`Functor` 和 {anchorName Applicative}`Applicative` 的实现。

每个类型类都有一组需要实现的方法，以及一份规定方法额外规则的相应约定。
针对这些接口编写的程序期望这些额外规则被遵守，否则可能出现缺陷。
{anchorName HonestFunctor}`Functor` 的方法相对于 {anchorName Applicative}`Applicative` 的默认实现，以及 {anchorName Applicative}`Applicative` 相对于 {anchorName Monad}`Monad` 的默认实现，都会遵守这些规则。

# 宇宙

%%%
tag := none
%%%

为了让 Lean 既能用作编程语言又能用作定理证明器，有必要对语言施加一些限制。
这包括对递归函数的限制，确保它们要么都终止，要么被标记为 {kw}`partial` 并编写为返回非空类型。
此外，还必须不可能将某些逻辑悖论表示为类型。

排除某些悖论的限制之一，是每个类型都被分配到一个**宇宙**（universe）。
宇宙是诸如 {anchorTerm extras}`Prop`、{anchorTerm extras}`Type`、{anchorTerm extras}`Type 1`、{anchorTerm extras}`Type 2` 等类型。
这些类型描述其他类型——正如 {anchorTerm extras}`0` 和 {anchorTerm extras}`17` 由 {anchorName extras}`Nat` 描述，{anchorName extras}`Nat` 本身由 {anchorTerm extras}`Type` 描述，而 {anchorTerm extras}`Type` 由 {anchorTerm extras}`Type 1` 描述。
接受类型作为参数的函数的类型，其宇宙必须大于参数类型的宇宙。

因为每个声明的数据类型都有一个宇宙，编写像使用数据那样使用类型的代码会很快变得烦人，需要把每个多态类型复制粘贴一遍以接受来自 {anchorTerm extras}`Type 1` 的参数。
称为**宇宙多态性**（universe polymorphism）的特性允许 Lean 程序和数据类型像普通多态性允许程序接受类型作为参数一样，接受宇宙层级作为参数。
一般而言，Lean 库在实现多态运算的库时应使用宇宙多态性。