# 第 7 章 带作用的编程

> 已对照 Lean-zh PDF 与 `LoVe07_EffectfulProgramming_Demo.lean` 人工校对（原 PDF 6295–7164 行）。

**带作用的编程**（effectful programming）是函数式编程中的一种重要抽象。**单子**（monad）推广了带副作用、异常、非确定性和其他**作用**（effect）的计算，使我们能够在纯函数式语言中编写指令式风格的程序。Haskell 已证明单子非常适合编写指令式程序；对我们而言，单子本身很有趣，还因为以下两点：

* 它们提供了**公理化推理**（axiomatic reasoning）的绝佳示例；
* 它们对 Lean 自身的编程也必不可少（**元编程**，见[第 8 章](ch08_Metaprogramming.md)）。

纯函数式编程有时会让人感到过于受限。带作用的函数式编程提供了一些**习语**（idiom）来缓解这些限制。本笔记受到了 [Programming in Lean][2] 第 7 章的启发，也参考了 [Real World Haskell][22] 第 14 章，以获得关于带作用的函数式编程的一般性介绍。

## 7.1 引入示例

考虑以下编程任务：

> 实现函数 `sum257 ns`，对自然数列表 `ns` 的第二个、第五个和第七个元素求和。结果使用 `Option ℕ`，以便在列表元素不足时返回 `Option.none`。

一个直白的解决方案如下：

```lean
def nth {α : Type} : List α → Nat → Option α
  | [],      _     => Option.none
  | x :: _,  0     => Option.some x
  | _ :: xs, n + 1 => nth xs n

def sum257 (ns : List ℕ) : Option ℕ :=
  match nth ns 1 with
  | Option.none    => Option.none
  | Option.some n₂ =>
    match nth ns 4 with
    | Option.none    => Option.none
    | Option.some n₅ =>
      match nth ns 6 with
      | Option.none    => Option.none
      | Option.some n₇ => Option.some (n₂ + n₅ + n₇)
```

（令人困惑的是，`nth` 从 0 开始计数元素。）这段代码一点也不优雅，因为它充斥着对 `Option` 的**模式匹配**（pattern matching）。虽然这个编程任务是人为构造的，但我们都能回想起写代码时遇上层层嵌套的错误处理和不断增加的缩进层级的经历。

我们可以做得更好，方法是将这些丑陋之处集中在一个函数中：

```lean
def connect {α : Type} {β : Type} :
    Option α → (α → Option β) → Option β
  | Option.none,   _ => Option.none
  | Option.some a, f => f a
```

`connect` 函数作用于 `Option`。如果其值为 `Option.none`，我们保持原样。这对应一种错误情况，而错误是带有「粘性」的——译注：一旦程序进入错误状态，该错误就会像胶水一样「粘」在处理流中并一直传递下去，后续的正常操作都会被自动跳过。否则，其值的形式为 `Option.some a`，我们对 `a` 应用操作 `f`——或者说将 `f` 的参数**绑定**（bind）到 `a`。

现在我们可以使用 `connect` 来编写求和函数：

```lean
def sum257Connect (ns : List ℕ) : Option ℕ :=
  connect (nth ns 1)
    (fun n₂ ↦ connect (nth ns 4)
       (fun n₅ ↦ connect (nth ns 6)
          (fun n₇ ↦ Option.some (n₂ + n₅ + n₇))))
```

直观上，该程序执行以下步骤：

1. 使用 `nth` 从列表中提取第二个元素。如果没有该元素，`nth` 返回 `Option.none`；直接返回此值即可。否则，将 `n₂` 绑定到该元素，并继续下一步。
2. 对第五个和第七个元素执行相同的操作。
3. 返回 `n₂`、`n₅` 和 `n₇` 的和，并包装在 `Option.some` 中。

在数学上，我们的新函数 `sum257Connect` 等于原来的函数 `sum257`。

我们不必自己定义 `connect`，而是使用 Lean 预定义的通用**绑定**操作 `bind`。它接受相同的参数和顺序。以下是新版代码：

```lean
def sum257Bind (ns : List ℕ) : Option ℕ :=
  bind (nth ns 1)
    (fun n₂ ↦ bind (nth ns 4)
       (fun n₅ ↦ bind (nth ns 6)
          (fun n₇ ↦ pure (n₂ + n₅ + n₇))))
```

我们也使用了预定义的**纯**操作 `pure`，而非使用 `Option.some` 来将一个纯 `α` 值转换为 `Option α`。借助 `bind` 和 `pure`，`sum257Bind` 不再直接引用构造子 `Option.none` 和 `Option.some`。

使用预定义的 `bind` 的优点之一是它提供了**语法糖**（syntactic sugar），即 `>>=` 运算符：

```lean
def sum257Op (ns : List ℕ) : Option ℕ :=
  nth ns 1 >>=
    fun n₂ ↦ nth ns 4 >>=
      fun n₅ ↦ nth ns 6 >>=
        fun n₇ ↦ pure (n₂ + n₅ + n₇)
```

语法 `oa >>= f` 展开为 `bind oa f`，其中 `oa` 的类型为 `Option α`。

求和程序的倒数第二个版本使用了更重的语法糖：

```lean
def sum257Dos (ns : List ℕ) : Option ℕ :=
  do
    let n₂ ← nth ns 1
    do
      let n₅ ← nth ns 4
      do
        let n₇ ← nth ns 6
        pure (n₂ + n₅ + n₇)
```

**do-记法**（do notation）为带作用的程序提供了一种方便的语法。程序 `do let a ← oa …` 等价于 `oa >>= (fun a ↦ …)`。如果我们对 `oa` 的计算结果不感兴趣，可以省略 `let a ←` 绑定并写作 `do oa …`，它会展开为 `oa >>= (fun _ ↦ …)`。

do-记法可以方便地在单个块中允许多次 `let` 绑定。这引出了程序的最终版本：

```lean
def sum257Do (ns : List ℕ) : Option ℕ :=
  do
    let n₂ ← nth ns 1
    let n₅ ← nth ns 4
    let n₇ ← nth ns 6
    pure (n₂ + n₅ + n₇)
```

带有箭头 `←` 的每一行都尝试读取一个值。在失败的情况下，整个程序求值为 `Option.none`。上述函数可以被读作一个指令式程序，其中每个 `nth` 调用都可以抛出一个异常。但是，即使这种表示法具有指令式风格，该函数仍然是一个纯函数式程序。

## 7.2 两个操作与三个定律

`Option` 类型构造子是单子的一个例子，被称为**选项单子**（option monad）。通常，**单子**是一个一元类型构造子 `m : Type → Type`，并配有两个特殊的操作：

```lean
pure {α : Type} : α → m α
bind {α β : Type} : m α → (α → m β) → m β
```

通常，大括号表示隐式参数。对于 `Option` 而言，`pure` 操作就是单纯的 `Option.some`，而 `bind` 则等同于我们的 `connect`。

类型 `m α` 的值是一个带作用的程序。`pure` 操作将类型为 `α` 的纯的、无作用的程序嵌入到 `m α` 中。`bind` 操作组合了两个带作用的程序，其类型分别为 `m α` 和 `α → m β`。第一个程序的输出（类型为 `α`）被传递给第二个程序；第二个程序的输出也就是二者组合的程序的输出。

我们可以将单子想象成一个包含某些数据的盒子。这个盒子捕捉了一些特殊的作用（例如异常、可变状态）。`pure` 操作将数据放入盒子中，而 `bind` 允许我们访问盒子中的数据并修改它——甚至可以改变它的类型，因为结果类型是 `m β`，而不是 `m α`。然而，没有通用的方法可以从盒子中提取数据——即从 `m α` 中获得一个 `α`。盒子里可能没有任何 `α` 值，也可能有多个。

总而言之，`pure a` 是一个包含值 `a`、没有作用的盒子，而 `bind ma f`（也可以写作 `ma >>= f` 或 `do a ← ma; f a`）执行 `ma`，然后使用 `ma` 的拆箱结果 `a` 来执行 `f`。

将类型为 `m α` 或 `m β` 的「**装箱值**」（boxed value）命名为 `ma` 或 `mb`，并将类型为 `α` 或 `β` 的数据命名为 `a` 或 `b`，是很方便的约定。

单子是一个具有许多应用场景的抽象概念。选项类型只是众多实例中的一个。下表概述了一些单子实例及其作用：

| 类型 | 作用 |
|------|------|
| `id` | 无作用 |
| `Option` | 简单异常 |
| `fun α ↦ σ → α × σ` | 传递类型为 `σ` 的状态 |
| `Set` | 返回 `α` 值的非确定性计算 |
| `fun α ↦ t → α` | 读取类型为 `t` 的元素（例如配置） |
| `fun α ↦ ℕ × α` | 附加运行时间（例如建模时间复杂度） |
| `fun α ↦ String × α` | 附加文本输出（例如用于日志记录） |
| `IO` | 与操作系统的交互 |
| `TacticM` | 与证明助手的交互 |

以上这些都是一元类型构造子 `m : Type → Type`。一些作用可以组合（例如 `Option (t → α)`）。有些作用是不可执行的（例如 `Set`）；尽管如此，它们对于抽象地建模程序非常有用。特定的类型构造子 `m` 可能会提供 `pure` 和 `bind` 之外的更多运算符，例如提取装箱值的方法。

单子有几个好处。它们提供了高度可读的 do-记法。它们支持通用操作，例如 `List.mmap {α β : Type} : (α → m β) → List α → m (List β)`，这些操作对所有单子 `m` 都是统一的。引用 [Programming in Lean][2] 中的话：

> 这种抽象的力量不仅在于它为所有这些不同的实例提供了通用的函数和记法，还在于它提供了一种思考它们共同点的有用的方式。

单子除了是一个有用的计算机科学概念外，还提供了一个公理化推理的好例子。通常 `bind` 和 `pure` 操作需要遵守三条定律。`bind` 操作用于组合两个程序。如果其中任何一个程序是纯程序，我们可以将其内联并消除 `bind`。这引出了前两条定律：

```text
do
  let a' ← pure a
  f a'
=
f a
```

以及

```text
do
  let a ← ma
  pure a
=
ma
```

第三条定律是 `bind` 的**结合律**（associativity）。它允许我们展平一个嵌套计算：

```text
do
  let b ←
    do
      let a ← ma
      f a
  g b
=
do
  let a ← ma
  let b ← f a
  g b
```

之前我们将单子比作一个盒子。更具体地说，将盒子想象成一个瑞士银行账户可能会有所帮助，其中 `α` 是钱。第一条定律意味着如果你把一些钱存入账户，你就可以把它取出来。第二条定律意味着如果你取走一些钱然后又把它放回去，没有人会注意到。第三条定律意味着将两项银行操作结合在一起然后再进行第三项操作，与先单独执行第一项操作然后再执行另外两项操作是一样的。鉴于瑞士银行在保密方面的声誉，这三条定律似乎都是合理的。

## 7.3 一种类型类

单子是一种数学结构，因此我们在 Lean 中使用**类型类**（type class）来指定它们。回想一下（[第 5.6 节](ch05_FunctionalProgramming.md#56-类型类)），类型类是一个参数化的结构体类型，通常以类型作为参数，但在这里是以类型构造子 `m : Type → Type` 作为参数。每当我们对具体的 `m` 使用类型类中的字段时，**类型类推导**机制就会检索相关的结构体值——即类型类的**实例**（instance）。

下面是一个可能的单子 Lean 定义，连同三条定律：

```lean
class LawfulMonad (m : Type → Type)
  extends Pure m, Bind m where
  pure_bind {α β : Type} (a : α) (f : α → m β) :
    (pure a >>= f) = f a
  bind_pure {α : Type} (ma : m α) :
    (ma >>= pure) = ma
  bind_assoc {α β γ : Type} (f : α → m β) (g : β → m γ)
      (ma : m α) :
    ((ma >>= f) >>= g) = (ma >>= (fun a ↦ f a >>= g))
```

让我们逐步研究这个定义：

* 我们正在创建一个由一元类型构造子 `m` 参数化的结构体——即一个类型为 `Type → Type` 的值。
* 该结构体从名为 `Pure` 和 `Bind` 的结构体中继承了字段和所有语法糖。这提供了 `m` 上的 `pure` 和 `bind` 操作，以及期望的类型和语法糖。
* 最后，在 `Pure` 和 `Bind` 已经提供的字段基础上，增加了三个字段（`pure_bind`、`bind_pure` 和 `bind_assoc`）。每个字段都是三条定律之一的证明。

我们将我们的类型类称为 `LawfulMonad`，因为要求这三条定律成立。要实例化此定义，我们必须提供类型构造子 `m`、合适的 `bind` 和 `pure` 运算符，以及定律的证明。

Lean 包含了它自己的单子概念，也称为 `LawfulMonad`。它与我们的定义大致等价，但分布在多个类型类中。

## 7.4 无作用

在本节以及第 7.5 节到第 7.7 节中，我们将回顾由特定单子提供的各种作用。我们从**恒等单子**（identity monad）开始，它根本不提供任何特殊作用。

Lean 的常量 `id {α : Type} : α → α` 被定义为恒等函数 `fun x ↦ x`。作为单子，我们取一元类型构造子 `id`（即 `fun α ↦ α`）。我们可以将其注册为单子：

```lean
def id.pure {α : Type} : α → id α
  | a => a

def id.bind {α β : Type} : id α → (α → id β) → id β
  | a, f => f a

instance id.LawfulMonad : LawfulMonad id :=
  { pure       := id.pure
    bind       := id.bind
    pure_bind  :=
      by
        intro α β a f
        rfl
    bind_pure  :=
      by
        intro α ma
        rfl
    bind_assoc :=
      by
        intro α β γ f g ma
        rfl }
```

注册过程要求我们提供五个组件：`pure` 和 `bind` 操作以及三条定律的证明。

恒等单子是可能的最简单的单子。它提供了一个简单的盒子，其中只有一个值，没有任何作用。它在加法算术中扮演着与 `0` 类似的角色。我们可以将其他单子看作是它的变体；例如，选项单子就是增加了代表错误状态的特殊 `Option.none` 值的恒等单子。

## 7.5 基本异常

正如我们在上面看到的，`Option` 类型提供了一个基本的异常机制。下面的代码展示了如何将 `Option : Type → Type` 注册为一个合法单子：

```lean
def Option.pure {α : Type} : α → Option α :=
  Option.some

def Option.bind {α β : Type} :
    Option α → (α → Option β) → Option β
  | Option.none,   _ => Option.none
  | Option.some a, f => f a

instance Option.LawfulMonad : LawfulMonad Option :=
  { pure       := Option.pure
    bind       := Option.bind
    pure_bind  :=
      by
        intro α β a f
        rfl
    bind_pure  :=
      by
        intro α ma
        cases ma with
        | none   => rfl
        | some _ => rfl
    bind_assoc :=
      by
        intro α β γ f g ma
        cases ma with
        | none   => rfl
        | some _ => rfl }
```

这三个证明都很简单直接。

除了标准操作之外，抛出和捕获异常也很有用。这可以实现如下：

```lean
def Option.throw {α : Type} : Option α :=
  Option.none

def Option.catch {α : Type} : Option α → Option α → Option α
  | Option.none,   ma' => ma'
  | Option.some a, _   => Option.some a
```

`Option.throw` 操作会抛出一个异常，使程序处于错误状态（`Option.none`）。`Option.catch` 操作可用于从之前的异常中恢复。如果程序当前处于错误状态，`Option.catch` 会调用一些异常处理代码（其第二个参数）。这段代码可能会依次抛出一个新的异常。如果 `Option.catch` 应用于正常状态（形式为 `Option.some a`），则什么也不会发生。

作为 `Option.catch ma ma'` 的一种便捷替代方案，Lean 支持语法 `ma.catch ma'`。这里有一个示意性例子，演示了使用此语法进行抛出和捕获：

```lean
do
  …
  if … then
    Option.throw
  else
    …
  .catch do
    …
```

相应的 Java 代码如下所示：

```java
try {
  …
  if (…) {
    throw new UnknownException();
  } else {
    …
  }
} catch (UnknownException e) {
  …
}
```

`Option` 只应对一种错误状态。一种更通用的抽象被称为**错误单子**（error monad），它支持不同的错误，就像 Java 和其他编程语言中的异常一样。

## 7.6 可变状态

**状态单子**（state monad）提供了一种对应于可变状态的抽象。对于某些编程语言，编译器可以检测到状态单子的使用，并将使用它们的程序翻译成更高效的指令式程序。

如果你有一些函数式编程的经验，那么你可能写过将全局状态或**语境**（context）在函数调用之间传递的代码：每个函数接受一个语境值，返回一些数据和新的语境。语境实际上是在程序中「穿针引线」（threaded through）。这使我们能够在没有副作用的编程语言中拥有可变状态。上述方法容易出错——很容易忘记一个撇号（`'`）并将错误的语境传递给函数——代码也被所有的语境变量弄得杂乱无章。状态单子正是为了让我们能够像写指令式程序那样写代码，同时保持纯函数式语义。

状态单子建立在二元类型构造子 `Action` 之上，它捕捉了在类型为 `σ` 的状态上进行计算或操作的概念，其返回值类型为 `α`。在 Lean 中，`Action σ α` 被定义为等同于 `σ → α × σ`：

```lean
def Action (σ α : Type) : Type :=
  σ → α × σ
```

译注：这个类型构造子在传统上被称为 `State`，但这个名称非常容易引起混淆。

（由于类型也是项，我们也可以使用 `def` 来定义类型缩写。）对于给定的类型 `σ`，我们有 `Action σ : Type → Type` 是一个单子。类型 `σ` 对确切的内存布局进行了抽象。例如，我们可以使用序对或列表来表示内存，并相应地实例化抽象的状态 `σ`。

一个**带状态的操作**（stateful action）是一个函数，它接收某个状态并返回一个值和一些新的状态。`Action` 的定义中的 `σ →` 部分给出了旧状态；笛卡尔积的左分量 `α` 给出了计算的结果；而积的右分量 `σ` 给出了新的状态。因此，状态被隐式地贯穿于程序之中。与其他带作用的程序一样，do-记法只暴露数据——类型为 `α` 的值——并隐藏了作用——旧的和新的 `σ` 状态。

当 `σ := Unit` 时，这是一个**基数为一**（cardinality one）的类型（类似于 C 或 Java 中的 `void`），其唯一的值写作 `()`，这对应于恒等单子：类型 `Unit → α × Unit` 与 `α` 是**同构**（isomorphic）的。这种直觉可以指导我们定义 `pure` 和 `bind`。

我们首先定义基本操作：两个操作 `read` 和 `write` 用于访问内存，以及标准操作 `bind` 和 `pure`：

```lean
def Action.read {σ : Type} : Action σ σ
  | s => (s, s)

def Action.write {σ : Type} (s : σ) : Action σ Unit
  | _ => ((), s)

def Action.pure {σ α : Type} (a : α) : Action σ α
  | s => (a, s)

def Action.bind {σ : Type} {α β : Type} (ma : Action σ α)
      (f : α → Action σ β) :
    Action σ β
  | s =>
    match ma s with
    | (a, s') => f a s'
```

`read` 操作简单地返回当前状态 `s`（在第一个序对分量中），并保持状态不变（在第二个序对分量中）。`write` 操作将当前状态替换为 `s` 并返回 `()`。`pure` 操作返回未改变的当前状态 `s`，并与给定的值 `a` 组成**元组**（tuple）。`bind` 操作将初始状态传递给 `ma` 参数，产生一个结果 `a` 和一个新的状态 `s'`。这些被传递给 `f`，它返回一个新的结果和新的状态。

`Action.pure` 类似于 `return` 语句；它不改变状态。`Action.bind` 类似于关于某个状态的两次语句的顺序组合。

为了将 `Action` 类型构造子注册为一个合法单子，我们需要像以前一样证明这三条定律：

```lean
instance Action.LawfulMonad {σ : Type} :
  LawfulMonad (Action σ) :=
  { pure       := Action.pure
    bind       := Action.bind
    pure_bind  :=
      by
        intro α β a f
        rfl
    bind_pure  :=
      by
        intro α ma
        rfl
    bind_assoc :=
      by
        intro α β γ f g ma
        rfl }
```

作为一个具体的例子，下面的程序会删除列表中所有小于前一个元素的元素，留下一个递增的元素列表。最大元素存储为状态 `σ`。请注意状态是如何通过 `read` 和 `write` 访问的。

```lean
def increasingly : List ℕ → Action ℕ (List ℕ)
  | []        => pure []
  | (n :: ns) =>
    do
      let prev ← Action.read
      if n < prev then
        increasingly ns
      else
        do
          Action.write n
          let ns' ← increasingly ns
          pure (n :: ns')
```

要执行该程序，我们必须提供一个初始状态。最后一个状态连同结果列表一起返回。它对应于列表中遇到的最大元素或起始状态。因此，命令

```lean
#eval increasingly [1, 2, 3, 2] 0
#eval increasingly [1, 2, 3, 2, 4, 5, 2] 0
```

产生如下输出：

```text
([1, 2, 3], 3)
([1, 2, 3, 4, 5], 5)
```

## 7.7 非确定性

**集合单子**（set monad）存储可能无限数量的 `α` 值。选项单子存储零个或一个 `α` 值，恒等单子和状态单子存储恰好一个值，而集合单子则对**非确定性**（nondeterminism）建模很有用，即作为一组可能的行为。

Lean 的类型 `Set α` 定义为 `α → Prop`。换句话说，集合是通过其**特征谓词**（characteristic predicate）来标识的。它支持我们熟悉的运算符，例如空集（`∅`）、全集（`Set.univ`）、并集（`∪`）、交集（`∩`）和属于（`∈`），以及传统的花括号表示法，例如 `{a}`、`{a, b}` 和 `{x | P x}`。许多集合构造可以通过 `simp` 来简化。

`Set` 类型构造子可以按如下方式注册为合法单子：

```lean
def Set.pure {α : Type} : α → Set α
  | a => {a}

def Set.bind {α β : Type} : Set α → (α → Set β) → Set β
  | A, f => {b | ∃a, a ∈ A ∧ b ∈ f a}

instance Set.LawfulMonad : LawfulMonad Set :=
  { pure       := Set.pure
    bind       := Set.bind
    pure_bind  :=
      by
        intro α β a f
        simp [Set.pure, Set.bind]
    bind_pure  :=
      by
        intro α ma
        simp [Set.pure, Set.bind]
    bind_assoc :=
      by
        intro α β γ f g ma
        simp [Set.bind]
        aesop }
```

`pure` 操作简单地将给定的值 `a` 放入单元素集合 `{a}` 中。`bind` 操作对集合 `A` 中的所有值调用 `f`，并返回所有结果的并集。例如，如果 `A := {3, 8}` 且 `f := (fun a ↦ {a + 1, a + 2})`，那么 `Set.bind A f` 等于 `{4, 5, 9, 10}`。

请注意，在这三个证明中，我们都展开了通用 `pure` 和 `bind` 常量的定义，随后是 `Set.pure` 和 `Set.bind` 的定义。最后一个证明依赖于 `aesop` 策略。目标的目的是：

```text
∀x, {b | ∃a, (∃a_1 ∈ ma, a ∈ f a_1) ∧ b ∈ g a}
  = {b | ∃a ∈ ma, ∃a_1 ∈ f a, b ∈ g a_1}
```

等式的两侧除了存在量词的位置——以及令人困惑的绑定变量名称之外——都是相同的。这个命题可以通过繁琐的引入和消去序列来证明，但我们想要更多的自动化。上述 `aesop` 的一个替代方案是调用 `grind`，这是一个灵感来自所谓的**可满足性模理论**（satisfiability modulo theories，SMT）求解器的策略。

## 7.8 通用证明策略

**aesop** 策略 [17]，其名称代表「用于明显证明的自动化可扩展搜索」（Automated Extensible Search for Obvious Proofs），是一个通用的证明搜索策略。此外，它还可以对假设中的逻辑符号 `∧`、`∨`、`↔` 和 `∃` 进行消去，并在目标中引入 `∧`、`↔` 和 `∃`，并且它还会定期调用 `simp`。它可以成功证明目标、失败或部分成功，从而给用户留下一些未完成的子目标。

**grind** 策略的灵感来自现代 SMT 求解器。它结合了多种推理引擎共同协作，以解决涉及等值推理、分类讨论和线性算术等目标。与 `simp` 不同，`grind` 以无向（即非从左到右）的方式对等式进行推理。它系统地从目标中存在的等式中推导出新的等式。例如，如果目标包含 `b = a` 和 `f b ≠ f a` 作为假设，`grind` 将从 `b = a` 推导出 `f b = f a`，并发现与 `f b ≠ f a` 的矛盾。

有些目标可以用 `grind` 解决而不能用 `aesop` 解决，反之亦然。很难预测哪种策略对给定的目标会取得成功。

## 7.9 一个通用算法：在列表上迭代

假设我们使用 `List.map` 在列表的所有元素上应用一个带作用的函数 `f`。然后我们得到一个普通的带作用值的列表。例如：

```lean
def nthsFine {α : Type} (xss : List (List α)) (n : ℕ) :
    List (Option α) :=
  List.map (fun xs ↦ nth xs n) xss
```

函数 `nthsFine xss n` 试图提取 `xss` 中每个列表的第 `n + 1` 个元素。运行

```lean
#eval nthsFine [[11, 12, 13, 14], [21, 22, 23]] 2
#eval nthsFine [[11, 12, 13, 14], [21, 22, 23]] 3
```

分别返回 `[some 13, some 23]` 和 `[some 14, none]`。

这些 `Option.some` 构造子可能会很不方便。通常，我们只关心是否出现了错误。这引出了我们的最后一个例子：一个通用的带作用程序 `mmap`，它在列表上迭代，并将带作用的函数 `f` 应用于每个元素。该定义是递归的：

```lean
def mmap {m : Type → Type} [LawfulMonad m] {α β : Type}
      (f : α → m β) :
    List α → m (List β)
  | []      => pure []
  | a :: as =>
    do
      let b ← f a
      let bs ← mmap f as
      pure (b :: bs)
```

请注意，该函数返回一个包含列表的单个 `m` 值，而不是一个 `m` 值的列表。试着弄清楚为什么它是良类型的，并且具有预期的行为。

我们现在可以尝试使用 `mmap` 而不是 `List.map`：

```lean
def nthsCoarse {α : Type} (xss : List (List α)) (n : ℕ) :
    Option (List α) :=
  mmap (fun xs ↦ nth xs n) xss
```

运行

```lean
#eval nthsCoarse [[11, 12, 13, 14], [21, 22, 23]] 2
#eval nthsCoarse [[11, 12, 13, 14], [21, 22, 23]] 3
```

分别返回 `some [13, 23]` 和 `none`——在纯列表周围只有一个 `Option.some`，而一旦任一列表缺少第 `n + 1` 个元素，整个结果即为 `none`。

`mmap` 函数在追加运算符 `++` 上具有分配性。do-记法不仅对定义函数有用，而且对陈述它们的性质也很有用：

```lean
theorem mmap_append {m : Type → Type} [LawfulMonad m]
      {α β : Type} (f : α → m β) :
    ∀as as' : List α, mmap f (as ++ as') =
      do
        let bs ← mmap f as
        let bs' ← mmap f as'
        pure (bs ++ bs')
  | [],      _   =>
    by simp [mmap, LawfulMonad.bind_pure, LawfulMonad.pure_bind]
  | a :: as, as' =>
    by simp [mmap, mmap_append _ as as', LawfulMonad.pure_bind,
      LawfulMonad.bind_assoc]
```

## 7.10 新引入的 Lean 结构总结

**记法**

| 记法 | 含义 |
|------|------|
| `do` | 表示一个带作用程序的开始 |
| `let … ← …` | 在带作用程序中分配变量 |
| `>>=` | 组合带作用的计算 |

**类型类**

| 名称 | 含义 |
|------|------|
| `LawfulMonad` | 合法单子（满足三条单子定律） |

**策略**

| 策略 | 含义 |
|------|------|
| `aesop` | 使用通用搜索过程证明命题 |
| `grind` | 使用 SMT 风格的推理证明命题 |