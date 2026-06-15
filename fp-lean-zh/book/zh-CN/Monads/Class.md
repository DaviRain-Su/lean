# 单子类型类

:::paragraph
不必为每一种单子类型分别导入像 {lit}`ok` 或 {lit}`andThen` 这样的运算符，Lean 标准库提供了一个**类型类（type class）**，使这些运算符可以被重载，从而对_任意_单子都能使用相同的运算符。
单子有两个运算，分别对应 {lit}`ok` 和 {lit}`andThen`：

```anchor FakeMonad
class Monad (m : Type → Type) where
  pure : α → m α
  bind : m α → (α → m β) → m β
```
这个定义略有简化。
Lean 库中的实际定义要复杂一些，稍后会介绍。
:::

:::paragraph
{anchorName MonadOptionExcept}`Option` 和 {anchorTerm MonadOptionExcept}`Except ε` 的 {anchorName MonadOptionExcept}`Monad` 实例，可以通过改写它们各自的 {lit}`andThen` 运算来构造：

```anchor MonadOptionExcept
instance : Monad Option where
  pure x := some x
  bind opt next :=
    match opt with
    | none => none
    | some x => next x

instance : Monad (Except ε) where
  pure x := Except.ok x
  bind attempt next :=
    match attempt with
    | Except.error e => Except.error e
    | Except.ok x => next x
```
:::

:::paragraph
举例来说，{lit}`firstThirdFifthSeventh` 曾为返回类型 {anchorTerm Names}`Option α` 和 {anchorTerm Names}`Except String α` 分别定义过。
现在，它可以为_任意_单子**多态（polymorphic）**地定义。
不过，它需要一个查找函数作为参数，因为不同的单子可能以不同的方式表示查找失败。
{anchorName FakeMonad}`bind` 的中缀版本是 {lit}`>>=`，其作用与示例中的 {lit}`~~>` 相同。

```anchor firstThirdFifthSeventhMonad
def firstThirdFifthSeventh [Monad m] (lookup : List α → Nat → m α)
    (xs : List α) : m (α × α × α × α) :=
  lookup xs 0 >>= fun first =>
  lookup xs 2 >>= fun third =>
  lookup xs 4 >>= fun fifth =>
  lookup xs 6 >>= fun seventh =>
  pure (first, third, fifth, seventh)
```
:::

:::paragraph
给定慢速哺乳动物和快速鸟类的示例列表，{anchorName firstThirdFifthSeventhMonad}`firstThirdFifthSeventh` 的这一实现可以与 {moduleName}`Option` 一起使用：

```anchor animals
def slowMammals : List String :=
  ["Three-toed sloth", "Slow loris"]

def fastBirds : List String := [
  "Peregrine falcon",
  "Saker falcon",
  "Golden eagle",
  "Gray-headed albatross",
  "Spur-winged goose",
  "Swift",
  "Anna's hummingbird"
]
```
```anchor noneSlow
#eval firstThirdFifthSeventh (fun xs i => xs[i]?) slowMammals
```
```anchorInfo noneSlow
none
```
```anchor someFast
#eval firstThirdFifthSeventh (fun xs i => xs[i]?) fastBirds
```
```anchorInfo someFast
some ("Peregrine falcon", "Golden eagle", "Spur-winged goose", "Anna's hummingbird")
```
:::

:::paragraph
将 {anchorName getOrExcept}`Except` 的查找函数 {lit}`get` 重命名为更具体的名称之后，{anchorName firstThirdFifthSeventhMonad}`firstThirdFifthSeventh` 的同一实现也可以与 {anchorName getOrExcept}`Except` 一起使用：

```anchor getOrExcept
def getOrExcept (xs : List α) (i : Nat) : Except String α :=
  match xs[i]? with
  | none =>
    Except.error s!"Index {i} not found (maximum is {xs.length - 1})"
  | some x =>
    Except.ok x
```
```anchor errorSlow
#eval firstThirdFifthSeventh getOrExcept slowMammals
```
```anchorInfo errorSlow
Except.error "Index 2 not found (maximum is 1)"
```
```anchor okFast
#eval firstThirdFifthSeventh getOrExcept fastBirds
```
```anchorInfo okFast
Except.ok ("Peregrine falcon", "Golden eagle", "Spur-winged goose", "Anna's hummingbird")
```
{anchorName firstThirdFifthSeventhMonad}`m` 必须具有 {anchorName firstThirdFifthSeventhMonad}`Monad` 实例，这意味着 {lit}`>>=` 和 {anchorName firstThirdFifthSeventhMonad}`pure` 运算可用。
:::

# 通用单子运算

:::paragraph
由于许多不同的类型都是单子，对_任意_单子多态的函数非常强大。
例如，函数 {anchorName mapM}`mapM` 是 {anchorName Names (show:=map)}`Functor.map` 的一个版本，它使用 {anchorName mapM}`Monad` 来串联并组合对函数应用的结果：

```anchor mapM
def mapM [Monad m] (f : α → m β) : List α → m (List β)
  | [] => pure []
  | x :: xs =>
    f x >>= fun hd =>
    mapM f xs >>= fun tl =>
    pure (hd :: tl)
```
函数参数 {anchorName mapM}`f` 的返回类型决定了将使用哪个 {anchorName mapM}`Monad` 实例。
换句话说，{anchorName mapM}`mapM` 可用于产生日志的函数、可能失败的函数，或使用可变状态的函数。
由于 {anchorName mapM}`f` 的类型决定了可用的效应，API 设计者可以对其进行严格控制。
:::

:::paragraph
如 {ref "numbering-tree-nodes"}[本章引言] 所述，{anchorTerm StateEx}`State σ α` 表示使用类型为 {anchorName StateEx}`σ` 的可变变量并返回类型为 {anchorName StateEx}`α` 的值的程序。
这些程序实际上是从起始状态到一对值与最终状态的函数。
{anchorName StateMonad}`Monad` 类型类要求其参数接受单个类型参数——也就是说，它应该是 {anchorTerm StateEx}`Type → Type`。
这意味着 {anchorName StateMonad}`State` 的实例应提及状态类型 {anchorName StateMonad}`σ`，而该类型成为实例的一个参数：

```anchor StateMonad
instance : Monad (State σ) where
  pure x := fun s => (s, x)
  bind first next :=
    fun s =>
      let (s', x) := first s
      next x s'
```
这意味着在使用 {anchorName StateMonad}`bind` 串联的 {anchorName StateEx}`get` 和 {anchorName StateEx}`set` 调用之间，状态类型不能改变，这对于有状态计算来说是一条合理的规则。
运算符 {anchorName increment}`increment` 将保存的状态增加给定数量，并返回旧值：

```anchor increment
def increment (howMuch : Int) : State Int Int :=
  get >>= fun i =>
  set (i + howMuch) >>= fun () =>
  pure i
```
:::

:::paragraph
将 {anchorName mapMincrementOut}`mapM` 与 {anchorName mapMincrementOut}`increment` 一起使用，会得到一个计算列表元素之和的程序。
更具体地说，可变变量保存的是目前的累加和，而结果列表保存的是运行中的累加和。
换句话说，{anchorTerm mapMincrement}`mapM increment` 的类型是 {anchorTerm mapMincrement}`List Int → State Int (List Int)`，展开 {anchorName StateMonad}`State` 的定义可得 {anchorTerm mapMincrement2}`List Int → Int → (Int × List Int)`。
它接受一个初始累加和作为参数，该参数应为 {anchorTerm mapMincrementOut}`0`：
```anchor mapMincrementOut
#eval mapM increment [1, 2, 3, 4, 5] 0
```
```anchorInfo mapMincrementOut
(15, [0, 1, 3, 6, 10])
```
:::

:::paragraph
{ref "logging"}[日志记录效应]可以用 {anchorName MonadWriter}`WithLog` 来表示。
与 {anchorName StateEx}`State` 一样，它的 {anchorName MonadWriter}`Monad` 实例对所记录数据的类型是多态的：

```anchor MonadWriter
instance : Monad (WithLog logged) where
  pure x := {log := [], val := x}
  bind result next :=
    let {log := thisOut, val := thisRes} := result
    let {log := nextOut, val := nextRes} := next thisRes
    {log := thisOut ++ nextOut, val := nextRes}
```
:::

:::paragraph
{anchorName saveIfEven}`saveIfEven` 是一个记录偶数但原样返回其参数的函数：

```anchor saveIfEven
def saveIfEven (i : Int) : WithLog Int Int :=
  (if isEven i then
    save i
   else pure ()) >>= fun () =>
  pure i
```
将此函数与 {anchorName mapMsaveIfEven}`mapM` 一起使用，会得到包含偶数的日志，以及与输入列表配对的未改变列表：
```anchor mapMsaveIfEven
#eval mapM saveIfEven [1, 2, 3, 4, 5]
```
```anchorInfo mapMsaveIfEven
{ log := [2, 4], val := [1, 2, 3, 4, 5] }
```
:::

# 恒等单子

单子将带有失败、异常或日志等效应的程序编码为数据和函数的显式表示。
然而，有时 API 会为了灵活性而使用单子编写，但 API 的客户端可能并不需要任何编码的效应。
{deftech}_恒等单子（identity monad）_ 是一种没有效应的单子。
它允许将纯代码用于单子 API：

```anchor IdMonad
def Id (t : Type) : Type := t

instance : Monad Id where
  pure x := x
  bind x f := f x
```
{anchorName IdMonad}`pure` 的类型应为 {anchorTerm IdMore}`α → Id α`，但 {anchorTerm IdMore}`Id α` 会归约为 {anchorTerm IdMore}`α`。
类似地，{anchorName IdMonad}`bind` 的类型应为 {anchorTerm IdMore}`α → (α → Id β) → Id β`。
由于这归约为 {anchorTerm IdMore}`α → (α → β) → β`，可以将第二个参数应用于第一个参数来得到结果。

:::paragraph
对于恒等单子，{anchorName mapMId}`mapM` 等价于 {anchorName Names (show:=map)}`Functor.map`。
不过，要以这种方式调用它，Lean 需要一个提示，表明预期的单子是 {anchorName mapMId}`Id`：
```anchor mapMId
def numbers := mapM (m := Id) (do return · + 1) [1, 2, 3, 4, 5]
```
在类型没有提供关于应使用哪个单子的具体提示的上下文中使用 {anchorName mapMIdId}`mapM`，会产生一条 "instance problem is stuck" 消息：
```anchor mapMIdId
def numbers := mapM (do return · + 1) [1, 2, 3, 4, 5]
```
```anchorError mapMIdId
typeclass instance problem is stuck
  Pure ?m.6

Note: Lean will not try to resolve this typeclass instance problem because the type argument to `Pure` is a metavariable. This argument must be fully determined before Lean will try to resolve the typeclass.

Hint: Adding type annotations and supplying implicit arguments to functions can give Lean more information for typeclass resolution. For example, if you have a variable `x` that you intend to be a `Nat`, but Lean reports it as having an unresolved type like `?m`, replacing `x` with `(x : Nat)` can get typeclass resolution un-stuck.
```
:::

# 单子约定

正如 {anchorName MonadContract}`BEq` 和 {anchorName MonadContract}`Hashable` 的每一对实例都应确保任意两个相等的值具有相同的哈希值一样，每个 {anchorName MonadContract}`Monad` 实例也应遵守一份约定。
首先，{anchorName MonadContract}`pure` 应是 {anchorName MonadContract}`bind` 的**左单位元（left identity）**。
也就是说，{anchorTerm MonadContract}`bind (pure v) f` 应与 {anchorTerm MonadContract}`f v` 相同。
其次，{anchorName MonadContract}`pure` 应是 {anchorName MonadContract}`bind` 的**右单位元（right identity）**，因此 {anchorTerm MonadContract}`bind v pure` 应与 {anchorName MonadContract2}`v` 相同。
最后，{anchorName MonadContract}`bind` 应满足**结合律（associative）**，因此 {anchorTerm MonadContract}`bind (bind v f) g` 应与 {anchorTerm MonadContract}`bind v (fun x => bind (f x) g)` 相同。

这份约定更一般地规定了带效应程序应有的性质。
由于 {anchorName MonadContract}`pure` 没有效应，用 {anchorName MonadContract}`bind` 串联其效应不应改变结果。
{anchorName MonadContract}`bind` 的结合律本质上说明，串联本身的簿记工作并不重要，只要事情发生的顺序得以保持即可。

# 练习

## 在树上映射

:::paragraph
定义函数 {anchorName ex1}`BinTree.mapM`。
类比列表的 {anchorName mapM}`mapM`，该函数应以**前序遍历（preorder traversal）**的方式将单子函数应用于树中的每个数据项。
类型签名应为：
```anchorTerm ex1
def BinTree.mapM [Monad m] (f : α → m β) : BinTree α → m (BinTree β)
```
:::

## Option 单子约定

:::paragraph
首先，写出一个有说服力的论证，说明 {anchorName badOptionMonad}`Option` 的 {anchorName badOptionMonad}`Monad` 实例满足单子约定。
然后，考虑以下实例：
```anchor badOptionMonad
instance : Monad Option where
  pure x := some x
  bind opt next := none
```
两个方法都具有正确的类型。
为什么这个实例违反了单子约定？
:::