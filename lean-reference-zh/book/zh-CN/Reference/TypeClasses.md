# Type class

> 对应英文：[Type Classes](https://lean-lang.org/doc/reference/latest/Type-Classes/)，抓取日期：2026-06-16。

如果一个操作可以用于多个 type，那么它就是 polymorphic。在 Lean 中，polymorphism 有三种形式：

- **universe polymorphism**：definition 中的 sort 可以用多种方式实例化；
- **带 type 参数的函数**：函数把 type 作为（可能 implicit 的）参数，使同一段代码可用于任意 type；
- **ad-hoc polymorphism**：由 type class 实现，被重载的操作可对不同 type 使用不同实现。

因为 Lean 不允许对 type 本身做 case analysis，普通 polymorphic function 实现的操作必须对任意 type 参数都保持一致。例如，`List.map` 不会因为输入 list 包含 `String` 或 `Nat` 而突然以不同方式计算。

ad-hoc polymorphic operation 适用于没有“统一”实现的操作。典型例子是重载算术 operator，使其可以用于 `Nat`、`Int`、`Float` 以及其他具有合理加法概念的 type。ad-hoc polymorphism 也可以涉及多个 type；例如在 collection 中按 index 查找值，会涉及 collection type、index type，以及取出的 member element type。

type class 描述一组 overloaded operation（称为 method）以及它们涉及的 type。

## 灵活性

type class 非常灵活。overloading 可以涉及多个 type；例如对数据结构索引的操作，可以针对特定数据结构、索引类型、元素类型，甚至断言 key 存在于结构中的 predicate 进行重载。

由于 Lean 类型系统表达力很强，overloaded operation 不只限于 type。type class 可以由普通 value、type family，甚至 predicate 或 proposition 参数化。这些可能性在实践中都会用到。

### 自然数 literal

`OfNat` type class 用于解释 natural number literal。instance 不仅可以依赖被实例化的 type，也可以依赖数字 literal 本身。

### 计算效果

`Monad` 等 type class 的参数是从一个 type 到另一个 type 的函数，用于为带副作用的程序提供专门语法。被重载操作所属的“type”实际上是 type-level function，例如 `Option`、`IO` 或 `Except`。

### Predicate 与 proposition

`Decidable` type class 让 Lean 自动寻找某个 proposition 的 decision procedure。`if` expression 以此为基础，因此可以对任意 decidable proposition 分支。

## Instance implicit parameter

普通 polymorphic definition 只期望用任意参数实例化。由 type class 重载的 operator 则期望用 instance 实例化；这些 instance 为特定参数集合定义重载操作。

instance-implicit parameter 用方括号标记：

```lean
[f : Foo α]
```

在调用点，Lean 会从可用候选中 synthesize 一个合适 instance；如果找不到，则报错。由于 instance 自身也可以带 instance parameter，搜索过程可以递归，最后得到一个复合 instance value，把来自多个 instance 的代码组合起来。因此，type class instance synthesis 也是一种按 type 引导构造程序的机制。

## 常见用途

### 重载 operator

type class 可以表示 overloaded operator，例如可用于多种 number type 的 arithmetic，或可用于多种数据结构的 membership predicate。对某个 type，operator 通常有一个 canonical choice；例如 `Nat` 上没有合理的替代加法定义。不过这不是本质要求，库也可以在需要时提供替代 instance。

### 代数结构

type class 可以表示 algebraic structure，同时提供结构本身和该结构所需的 axiom。例如，表示 Abelian group 的 type class 可以包含 binary operator、unary inverse operator、identity element，以及证明：binary operator 结合且交换，identity 确实是单位元，inverse operator 在 operator 两侧都产生 identity element。

在这类场景中，结构未必有 canonical choice。一个库可以用多种方式实例化同一组 axiom；例如整数上有两个同样 canonical 的 monoid structure。

### 类型之间的关系

type class 可以表示两个 type 之间的关系，使它们能以某种库定义的新方式一起使用。`Coe` class 表示从一个 type 到另一个 type 的自动插入 coercion；`MonadLift` 表示在期望另一种 effect 的上下文中运行某种 effect operation 的方式。

### 类型驱动代码生成

type class 也可以表示一个 type-driven code generation 框架。polymorphic type 的 instance 各自贡献最终程序的一部分。

`Repr` class 定义某个 type 的 canonical pretty printer；polymorphic type 最终会得到 polymorphic `Repr` instance。当对一个已知 concrete type 的 expression 调用 pretty printing，例如 `List (Nat × (String ⊕ Int))`，所得 pretty printer 会由 `List`、`Prod`、`Nat`、`Sum`、`String` 和 `Int` 的 `Repr` instance 组装而成。

## 后续小节

英文参考手册随后把本章展开为：

- 10.1 Class Declarations
- 10.2 Instance Declarations
- 10.3 Instance Synthesis
- 10.4 Deriving Instances
- 10.5 Basic Classes