# 完整定义

%%%
tag := "complete-definitions"
%%%

既然所有相关的语言特性都已介绍完毕，本节将描述 {anchorName HonestFunctor}`Functor`、{anchorName Applicative}`Applicative` 和 {anchorName Monad}`Monad` 在 Lean 标准库中的完整、真实定义。
为了便于理解，不会省略任何细节。

# Functor

%%%
tag := "complete-functor-definition"
%%%

{anchorName Applicative}`Functor` 类的完整定义使用了宇宙多态性和默认方法实现：

```anchor HonestFunctor
class Functor (f : Type u → Type v) : Type (max (u+1) v) where
  map : {α β : Type u} → (α → β) → f α → f β
  mapConst : {α β : Type u} → α → f β → f α :=
    Function.comp map (Function.const _)
```

在这个定义中，{anchorName HonestFunctor}`Function.comp` 是函数复合，通常用 {lit}`∘` 运算符书写。
{anchorName HonestFunctor}`Function.const` 是 **常值函数**（constant function），它是一个忽略第二个参数的二元函数。
把这个函数只应用到一个参数上，会产生一个总是返回相同值的函数；当 API 要求一个函数，而程序又不需要为不同参数计算不同结果时，这很有用。
可以如下编写 {anchorName HonestFunctor}`Function.const` 的一个简单版本：

```anchor simpleConst
def simpleConst  (x : α) (_ : β) : α := x
```

把它以单参数形式用作 {anchorTerm extras}`List.map` 的函数参数，可以说明它的用途：

```anchor mapConst
#eval [1, 2, 3].map (simpleConst "same")
```

```anchorInfo mapConst
["same", "same", "same"]
```

实际的函数具有以下签名：

```anchorInfo FunctionConstType
Function.const.{u, v} {α : Sort u} (β : Sort v) (a : α) : β → α
```

这里，类型参数 {anchorName HonestFunctor}`β` 是一个显式参数，因此 {anchorName HonestFunctor}`mapConst` 的默认定义为 {anchorName HonestFunctor}`Function.const` 提供了一个 {anchorTerm HonestFunctor}`_` 参数，指示 Lean 找到一个唯一的类型传入，以使程序能够通过类型检查。
{anchorTerm unfoldCompConst}`Function.comp map (Function.const _)` 等价于 {anchorTerm unfoldCompConst}`fun (x : α) (y : f β) => map (fun _ => x) y`。

{anchorName HonestFunctor}`Functor` 类型类位于一个宇宙，该宇宙是 {anchorTerm HonestFunctor}`u+1` 与 {anchorTerm HonestFunctor}`v` 中的较大者。
这里，{anchorTerm HonestFunctor}`u` 是 {anchorName HonestFunctor}`f` 所接受参数的宇宙的层级，而 {anchorTerm HonestFunctor}`v` 是 {anchorName HonestFunctor}`f` 所返回的宇宙。
要理解为什么实现 {anchorName HonestFunctor}`Functor` 类型类的结构体必须位于比 {anchorTerm HonestFunctor}`u` 更大的宇宙中，可以从该类型类的一个简化定义开始：

```anchor FunctorSimplified
class Functor (f : Type u → Type v) : Type (max (u+1) v) where
  map : {α β : Type u} → (α → β) → f α → f β
```

这个类型类的结构体类型等价于以下归纳类型：

```anchor FunctorDatatype
inductive Functor (f : Type u → Type v) : Type (max (u+1) v) where
  | mk : ({α β : Type u} → (α → β) → f α → f β) → Functor f
```

作为参数传给 {anchorName FunctorDatatype}`mk` 的 {lit}`map` 方法实现包含一个函数，该函数接受两个位于 {anchorTerm FunctorDatatype}`Type u` 中的类型作为参数。
这意味着函数本身的类型位于 {lit}`Type (u+1)` 中，因此 {anchorName FunctorDatatype}`Functor` 也必须位于至少为 {anchorTerm FunctorDatatype}`u+1` 的层级。
类似地，函数的其他参数具有通过应用 {anchorName FunctorDatatype}`f` 构造的类型，因此它也必须位于至少为 {anchorTerm FunctorDatatype}`v` 的层级。
本节中的所有类型类都具有这一性质。

# Applicative

%%%
tag := "complete-applicative-definition"
%%%

{anchorName Applicative}`Applicative` 类型类实际上由多个较小的类构成，每个类都包含一些相关方法。
首先是 {anchorName Applicative}`Pure` 和 {anchorName Applicative}`Seq`，它们分别包含 {anchorName Applicative}`pure` 和 {anchorName Seq}`seq`：

```anchor Pure
class Pure (f : Type u → Type v) : Type (max (u+1) v) where
  pure {α : Type u} : α → f α
```

```anchor Seq
class Seq (f : Type u → Type v) : Type (max (u+1) v) where
  seq : {α β : Type u} → f (α → β) → (Unit → f α) → f β
```

除此之外，{anchorName Applicative}`Applicative` 还依赖于 {anchorName SeqRight}`SeqRight` 以及一个类似的 {anchorName SeqLeft}`SeqLeft` 类：

```anchor SeqRight
class SeqRight (f : Type u → Type v) : Type (max (u+1) v) where
  seqRight : {α β : Type u} → f α → (Unit → f β) → f β
```

```anchor SeqLeft
class SeqLeft (f : Type u → Type v) : Type (max (u+1) v) where
  seqLeft : {α β : Type u} → f α → (Unit → f β) → f α
```

{anchorName SeqRight}`seqRight` 函数在 {ref "alternative"}[关于 Alternative 与验证的一节] 中介绍过，从 **效应**（effects）的角度最容易理解。
{anchorTerm seqRightSugar (module := Examples.FunctorApplicativeMonad)}`E1 *> E2` 脱糖为 {anchorTerm seqRightSugar (module := Examples.FunctorApplicativeMonad)}`SeqRight.seqRight E1 (fun () => E2)`，可以理解为先执行 {anchorName seqRightSugar (module:=Examples.FunctorApplicativeMonad)}`E1`，再执行 {anchorName seqRightSugar (module:=Examples.FunctorApplicativeMonad)}`E2`，最终只保留 {anchorName seqRightSugar (module:=Examples.FunctorApplicativeMonad)}`E2` 的结果。
{anchorName seqRightSugar (module:=Examples.FunctorApplicativeMonad)}`E1` 的效应可能导致 {anchorName seqRightSugar (module:=Examples.FunctorApplicativeMonad)}`E2` 不运行，或运行多次。
事实上，如果 {anchorName SeqRight}`f` 具有 {anchorName Monad}`Monad` 实例，那么 {anchorTerm seqRightSugar (module:=Examples.FunctorApplicativeMonad)}`E1 *> E2` 等价于 {lit}`do let _ ← E1; E2`，但 {anchorName SeqRight}`seqRight` 可以与像 {anchorName Validate (module:=Examples.FunctorApplicativeMonad)}`Validate` 这样不是单子的类型一起使用。

它的“表亲” {anchorName SeqLeft}`seqLeft` 非常相似，只是返回最左边表达式的值。
{anchorTerm seqLeftSugar}`E1 <* E2` 脱糖为 {anchorTerm seqLeftSugar}`SeqLeft.seqLeft E1 (fun () => E2)`。
{anchorTerm seqLeftType}`SeqLeft.seqLeft` 的类型是 {anchorTerm seqLeftType}`f α → (Unit → f β) → f α`，与 {anchorName SeqRight}`seqRight` 的类型相同，只是它返回 {anchorTerm SeqLeft}`f α`。
{anchorTerm seqLeftSugar}`E1 <* E2` 可以理解为先执行 {anchorName seqLeftSugar}`E1`，再执行 {anchorName seqLeftSugar}`E2`，并返回 {anchorName seqLeftSugar}`E1` 的原始结果。
如果 {anchorName SeqLeft}`f` 具有 {anchorName Monad}`Monad` 实例，那么 {anchorTerm seqLeftSugar}`E1 <* E2` 等价于 {lit}`do let x ← E1; _ ← E2; pure x`。
一般而言，{anchorName SeqLeft}`seqLeft` 在验证或解析类工作流中很有用，可以在不改变值本身的情况下为值指定额外条件。

{anchorName Applicative}`Applicative` 的定义扩展了所有这些类，以及 {anchorName Applicative}`Functor`：

```anchor Applicative
class Applicative (f : Type u → Type v)
    extends Functor f, Pure f, Seq f, SeqLeft f, SeqRight f where
  map      := fun x y => Seq.seq (pure x) fun _ => y
  seqLeft  := fun a b => Seq.seq (Functor.map (Function.const _) a) b
  seqRight := fun a b => Seq.seq (Functor.map (Function.const _ id) a) b
```

{anchorName Applicative}`Applicative` 的完整定义只需要 {anchorName Applicative}`pure` 和 {anchorName Seq}`seq` 的定义。
这是因为来自 {anchorName Applicative}`Functor`、{anchorName SeqLeft}`SeqLeft` 和 {anchorName SeqRight}`SeqRight` 的所有方法都有默认定义。
{anchorName HonestFunctor}`Functor` 的 {anchorName HonestFunctor}`mapConst` 方法在 {anchorName Applicative}`Functor.map` 方面有自己的默认实现。
这些默认实现只应被行为等价但更高效的新函数覆盖。
默认实现应被视为正确性的规范，同时也是自动生成的代码。

{anchorName SeqLeft}`seqLeft` 的默认实现非常紧凑。
把某些名称替换为它们的语法糖或定义，可以提供另一种视角，因此：

```anchorTerm unfoldMapConstSeqLeft
Seq.seq (Functor.map (Function.const _) a) b
```

变成

```anchorTerm unfoldMapConstSeqLeft
fun a b => Seq.seq ((fun x _ => x) <$> a) b
```

应如何理解 {anchorTerm unfoldMapConstSeqLeft}`(fun x _ => x) <$> a`？
这里，{anchorName unfoldMapConstSeqLeft}`a` 的类型是 {anchorTerm unfoldMapConstSeqLeft}`f α`，而 {anchorName unfoldMapConstSeqLeft}`f` 是一个函子。
如果 {anchorName unfoldMapConstSeqLeft}`f` 是 {anchorName extras}`List`，那么 {anchorTerm mapConstList}`(fun x _ => x) <$> [1, 2, 3]` 求值为 {anchorTerm mapConstList}`[fun _ => 1, fun _ => 2, fun _ => 3]`。
如果 {anchorName unfoldMapConstSeqLeft}`f` 是 {anchorName mapConstOption}`Option`，那么 {anchorTerm mapConstOption}`(fun x _ => x) <$> some "hello"` 求值为 {anchorTerm mapConstOption}`some (fun _ => "hello")`。
在每种情况下，函子中的值都被替换为忽略其参数并返回原始值的函数。
与 {anchorName Seq}`seq` 结合使用时，这个函数会丢弃 {anchorName Seq}`seq` 第二个参数中的值。

{anchorName SeqRight}`seqRight` 的默认实现非常相似，只是 {anchorName FunctionConstType}`Function.const` 多了一个 {anchorName Applicative}`id` 参数。
可以通过先引入一些标准语法糖，再把某些名称替换为它们的定义来类似地理解这个定义：

```anchorEvalSteps unfoldMapConstSeqRight
fun a b => Seq.seq (Functor.map (Function.const _ id) a) b
===>
fun a b => Seq.seq ((fun _ => id) <$> a) b
===>
fun a b => Seq.seq ((fun _ => fun x => x) <$> a) b
===>
fun a b => Seq.seq ((fun _ x => x) <$> a) b
```

应如何理解 {anchorTerm unfoldMapConstSeqRight}`(fun _ x => x) <$> a`？
同样，例子很有帮助。
{anchorTerm mapConstIdList}`fun _ x => x) <$> [1, 2, 3]` 等价于 {anchorTerm mapConstIdList}`[fun x => x, fun x => x, fun x => x]`，而 {anchorTerm mapConstIdOption}`(fun _ x => x) <$> some "hello"` 等价于 {anchorTerm mapConstIdOption}`some (fun x => x)`。
换句话说，{anchorTerm unfoldMapConstSeqRight}`(fun _ x => x) <$> a` 保留 {anchorName unfoldMapConstSeqRight}`a` 的整体形状，但每个值都被替换为恒等函数。
从效应的角度看，{anchorName unfoldMapConstSeqRight}`a` 的副作用会发生，但当它与 {anchorName Seq}`seq` 一起使用时，这些值会被丢弃。

# Monad

%%%
tag := "complete-monad-definition"
%%%

正如 {anchorName Applicative}`Applicative` 的组成运算被拆分到各自的类型类中一样，{anchorName Bind}`Bind` 也有自己的类：

```anchor Bind
class Bind (m : Type u → Type v) where
  bind : {α β : Type u} → m α → (α → m β) → m β
```

{anchorName Monad}`Monad` 用 {anchorName Bind}`Bind` 扩展 {anchorName Applicative}`Applicative`：

```anchor Monad
class Monad (m : Type u → Type v) : Type (max (u+1) v)
    extends Applicative m, Bind m where
  map      f x := bind x (Function.comp pure f)
  seq      f x := bind f fun y => Functor.map y (x ())
  seqLeft  x y := bind x fun a => bind (y ()) (fun _ => pure a)
  seqRight x y := bind x fun _ => y ()
```

追踪整个层次结构中继承的方法和默认方法可以看出，{anchorName Monad}`Monad` 实例只需要 {anchorName Bind}`bind` 和 {anchorName Pure}`pure` 的实现。
换句话说，{anchorName Monad}`Monad` 实例会自动产生 {anchorName Seq}`seq`、{anchorName SeqLeft}`seqLeft`、{anchorName SeqRight}`seqRight`、{anchorName HonestFunctor}`map` 和 {anchorName HonestFunctor}`mapConst` 的实现。
从 API 边界的角度看，任何具有 {anchorName Monad}`Monad` 实例的类型都会自动获得 {anchorName Bind}`Bind`、{anchorName Pure}`Pure`、{anchorName Seq}`Seq`、{anchorName Applicative}`Functor`、{anchorName SeqLeft}`SeqLeft` 和 {anchorName SeqRight}`SeqRight` 的实例。

# 练习

%%%
tag := "complete-functor-applicative-monad-exercises"
%%%

 1. 通过处理 {anchorName mapConstOption}`Option` 和 {anchorName ApplicativeExcept (module:=Examples.FunctorApplicativeMonad)}`Except` 等例子，理解 {anchorName Monad}`Monad` 中 {anchorName HonestFunctor}`map`、{anchorName Seq}`seq`、{anchorName SeqLeft}`seqLeft` 和 {anchorName SeqRight}`seqRight` 的默认实现。换句话说，把它们的定义替换为 {anchorName Bind}`bind` 和 {anchorName Pure}`pure` 的定义，并化简以恢复手工编写的 {anchorName HonestFunctor}`map`、{anchorName Seq}`seq`、{anchorName SeqLeft}`seqLeft` 和 {anchorName SeqRight}`seqRight` 版本。
 2. 在纸上或文本文件中向自己证明，{anchorName HonestFunctor}`map` 和 {anchorName Seq}`seq` 的默认实现满足 {anchorName Applicative}`Functor` 和 {anchorName Applicative}`Applicative` 的约定。在这个论证中，你可以使用 {anchorName Monad}`Monad` 约定中的规则以及普通的表达式求值。