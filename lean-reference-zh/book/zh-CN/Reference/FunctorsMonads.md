# Functor、Monad 与 `do` 记法

> 对应英文：[Functors, Monads and do-Notation](https://lean-lang.org/doc/reference/latest/Functors___-Monads-and--do--Notation/)，抓取日期：2026-06-16。

`Functor`、`Applicative` 和 `Monad` type class 为函数式编程提供基础工具。若需要这些抽象的编程入门，请参考 *Functional Programming in Lean*。虽然这些概念受到范畴论中 functor 和 monad 的启发，但编程中使用的版本更受限制。Lean 标准库中的 type class 表示的是编程中的概念，而不是一般数学定义。

`Functor` instance 允许把某个操作一致地应用到一个 polymorphic context 内。例如，对 list 的每个元素应用函数；或者创建新的 `IO` action，使纯函数应用到已有 `IO` action 的结果上。

`Monad` instance 允许编码带数据依赖的副作用。例如，用 tuple 模拟 mutable state，用 sum type 模拟 exception，用 `IO` 表示真实副作用。

`Applicative` functor 处在二者之间：像 monad 一样，它允许把带 effect 计算得到的函数应用到带 effect 计算得到的参数；但它不允许顺序数据依赖，也就是不允许某个 effect 的输出成为另一个 effectful operation 的输入。

`Pure`、`Bind`、`SeqLeft`、`SeqRight` 和 `Seq` 这些额外 type class 捕获了 `Applicative` 和 `Monad` 中的单个操作，使它们可以被单独重载，也可用于不一定是 applicative functor 或 monad 的 type。`Alternative` type class 描述的是额外具有某种 failure 和 recovery 概念的 applicative functor。

## `Functor`

`Functor` 表示函数式编程意义上的 functor：一个函数 `f : Type u → Type v`，它提供一种把函数映射到其内容上的方式。这个 map operator 写作 `<$>`，通过 `Functor` instance 重载。

核心 method 是：

```lean
map : {α β : Type u} → (α → β) → f α → f β
```

它在 functor 内部应用函数，用来重载 `<$>` operator。

`map` 应该尊重 identity 和 function composition。也就是说，对所有 `v : f α`，应有：

```lean
id <$> v = v
```

对所有 `h : β → γ` 和 `g : α → β`，应有：

```lean
(h ∘ g) <$> v = h <$> g <$> v
```

`Functor` instance 应满足这些要求，但 instance 本身不要求证明。证明可通过 `LawfulFunctor` class 提供或要求。

当映射常量函数时，应使用 `Functor.mapConst`，因为某些 functor 可以更高效地实现它。

## `Pure`

`Pure` 重载 `pure` 函数。通常通过 `Monad` 或 `Applicative` instance 访问它。

```lean
pure : {α : Type u} → α → f α
```

给定 `a : α`，`pure a : f α` 表示一个不做任何 effect、只返回 `a` 的 action。例如：

```lean
(pure "hello" : Option String) = some "hello"
(pure "hello" : Except (Array String) String) = Except.ok "hello"
(pure "hello" : StateM Nat String).run 105 = ("hello", 105)
```

## `Seq` 与 `<*>`

`Seq` 通过 `Seq.seq` 重载 `<*>` operator。`Functor` 中的 `<$>` 允许把普通函数映射到 functor 内容上，而 `<*>` 允许应用 functor “内部”的函数。

如果把 `f` 理解为潜在副作用，`seq` 捕获 evaluation order：先执行产生函数的 effect，再执行产生参数值的 effect。

核心 method 是：

```lean
seq : {α β : Type u} → f (α → β) → (Unit → f α) → f β
```

在 monad 中，`mf <*> mx` 等价于：

```lean
do
  let f ← mf
  let x ← mx
  pure (f x)
```

也就是先求函数，再求参数，然后应用。为避免令人意外的求值语义，第二个参数 `mx` 以 `Unit → f α` 的函数形式延迟传入。

## `SeqLeft` 与 `SeqRight`

`SeqLeft` 重载 `<*`。当把 `f` 理解为潜在副作用时，`x <* y` 会先运行左侧，再运行右侧；它丢弃右侧值，返回左侧结果。

```lean
seqLeft : {α β : Type u} → f α → (Unit → f β) → f α
```

`SeqRight` 重载 `*>`。`x *> y` 会先运行左侧，再运行右侧；它丢弃左侧值，返回右侧结果。

```lean
seqRight : {α β : Type u} → f α → (Unit → f β) → f β
```

第二个参数同样被延迟包装，以支持 `f` 的 short-circuiting 行为。

## `Applicative`

`Applicative` functor 比 `Functor` 强，但比 `Monad` 弱。它通过 `<*>`（重载为 `seq`）捕获 effect 的顺序组合，但不捕获数据依赖的 effect。前面计算的结果不能用于控制后续 effect。

`Applicative` 扩展：

- `Functor f`
- `Pure f`
- `Seq f`
- `SeqLeft f`
- `SeqRight f`

`Applicative` 应满足四条 law；instance 本身不要求证明这些 law，证明由 `LawfulApplicative` class 表达。

## `Alternative`

`Alternative` 是可以“失败”或“为空”的 `Applicative` functor，并提供 binary operation `<|>`，用于“收集值”或寻找“最左成功”。

重要 instance 包括：

- `Option`：failure 是 `none`，`<|>` 返回最左侧的 `some`；
- parser combinator：通常提供 `Applicative` instance 来支持 error handling 和 backtracking。

error recovery 与 state 的交互可能很微妙。例如，`OptionT (StateT σ Id)` 的 `Alternative` 实现在失败恢复时会保留对 state 的修改，而 `StateT σ (OptionT Id)` 会丢弃这些修改。

核心 method：

```lean
failure : {α : Type u} → f α
orElse : {α : Type u} → f α → (Unit → f α) → f α
```

`failure` 产生空 collection 或 recoverable failure。`orElse` 根据 instance 语义收集值或从失败恢复，可用 `<|>` operator 表示。

## `Bind` 与 `Monad`

`Bind` 通过 instance 重载 `>>=` operator。通常通过扩展它的 `Monad` 使用。

```lean
bind : {α β : Type u} → m α → (α → m β) → m β
```

它顺序组合两个 computation，并允许第二个 computation 依赖第一个 computation 得到的值。若 `x : m α` 且 `f : α → m β`，那么 `x >>= f : m β` 表示执行 `x` 得到 `α` 类型值，再把该值传给 `f`。

`Monad` 是函数式编程中顺序控制流和副作用的抽象。monad 允许 effect 顺序化，也允许数据依赖的 effect：早期步骤产生的值可以影响后续步骤执行哪些 effect。

`Monad` API 可以直接使用，但最常通过 `do` notation 访问。多数 `Monad` instance 实现 `pure` 和 `bind`，并对从 `Applicative` 继承的其他 method 使用默认实现。monad 应满足若干 law，但 instance 不要求证明。`LawfulMonad` 表示某个 monad 的操作满足这些 law。

## 后续小节

英文参考手册随后把本章展开为：

- 18.1 Laws
- 18.2 Lifting Monads
- 18.3 Syntax
- 18.4 API Reference
- 18.5 Varieties of Monads