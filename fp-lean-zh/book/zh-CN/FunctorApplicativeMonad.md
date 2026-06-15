# 函子、应用函子与单子

{anchorTerm FunctorPair}`Functor` 和 {moduleName}`Monad` 都描述了仍在等待类型参数的类型上的运算。
理解它们的一种方式，是把 {anchorTerm FunctorPair}`Functor` 看作描述其中所含数据可以被变换的容器，把 {moduleName}`Monad` 看作对带副作用程序的编码。
然而，这种理解并不完整。
毕竟，{moduleName}`Option` 同时拥有 {moduleName}`Functor` 和 {moduleName}`Monad` 的实例，它同时表示一个可选值_以及_一个可能无法返回值的计算。

从数据结构的角度看，{anchorName AlternativeOption}`Option` 有点像可空类型，或像最多只能包含一个条目的列表。
从控制结构的角度看，{anchorName AlternativeOption}`Option` 表示一个可能提前终止且没有结果的计算。
通常，使用 {anchorName FunctorValidate}`Functor` 实例的程序最容易理解为把 {anchorName AlternativeOption}`Option` 当作数据结构，而使用 {anchorName MonadExtends}`Monad` 实例的程序最容易理解为用 {anchorName AlternativeOption}`Option` 允许提前失败——但熟练运用这两种视角，是成为函数式编程高手的重要部分。

函子与单子之间存在更深的关系。
事实证明，_每个单子都是函子_。
换句话说，单子抽象比函子抽象更强大，因为并非每个函子都是单子。
此外，还有一个额外的中间抽象，称为**应用函子（applicative functor）**，它拥有足够的表达能力来编写许多有趣的程序，同时仍允许无法使用 {anchorName MonadExtends}`Monad` 接口的库。
类型类 {anchorName ApplicativeValidate}`Applicative` 提供应用函子的可重载运算。
每个单子都是应用函子，每个应用函子都是函子，但逆命题不成立。

## 本章目录

- [结构体与继承](FunctorApplicativeMonad/Inheritance.md)（Structures and Inheritance）
- [应用函子](FunctorApplicativeMonad/Applicative.md)（Applicative Functors）
- [应用函子约定](FunctorApplicativeMonad/ApplicativeContract.md)（The Applicative Contract）
- [Alternative](FunctorApplicativeMonad/Alternative.md)（Alternatives）
- [宇宙（Universes）](FunctorApplicativeMonad/Universes.md)（Universes）
- [完整定义](FunctorApplicativeMonad/Complete.md)（The Complete Definitions）
- [小结](FunctorApplicativeMonad/Summary.md)（Summary）