# 尾递归

%%%
tag := "tail-recursion"
%%%

虽然 Lean 的 {kw}`do` 记法使得可以使用传统的循环语法，例如 {kw}`for` 和 {kw}`while`，但这些构造在幕后会被翻译成对递归函数的调用。
在大多数编程语言中，递归函数相对于循环有一个关键劣势：循环不消耗栈空间，而递归函数消耗的栈空间与递归调用的次数成正比。
栈空间通常是有限的，因此往往有必要把自然表达为递归函数的算法改写成循环，并搭配一个显式的、可变、堆分配的栈。

在函数式编程中，情况通常恰恰相反。
自然表达为可变循环的程序可能会消耗栈空间，而把它们改写成递归函数却可能使程序运行得很快。
这是由于函数式编程语言的一个关键特性：_尾调用消除_（tail-call elimination）。
尾调用是指从一个函数到另一个函数的调用，它可以被编译成普通的跳转，用新的栈帧替换当前栈帧，而不是压入新的栈帧；尾调用消除就是实现这一变换的过程。

尾调用消除不仅仅是一种可选的优化。
它的存在是编写高效函数式代码的基本组成部分。
要让它有用，它必须是可靠的。
程序员必须能够可靠地识别尾调用，并且必须能够信任编译器会消除它们。

函数 {anchorName NonTailSum}`NonTail.sum` 把一个 {anchorName NonTailSum}`Nat` 列表中的元素相加：

```anchor NonTailSum
def NonTail.sum : List Nat → Nat
  | [] => 0
  | x :: xs => x + sum xs
```
把这个函数应用于列表 {anchorTerm NonTailSumOneTwoThree}`[1, 2, 3]` 会产生以下求值步骤序列：
```anchorEvalSteps NonTailSumOneTwoThree
NonTail.sum [1, 2, 3]
===>
1 + (NonTail.sum [2, 3])
===>
1 + (2 + (NonTail.sum [3]))
===>
1 + (2 + (3 + (NonTail.sum [])))
===>
1 + (2 + (3 + 0))
===>
1 + (2 + 3)
===>
1 + 5
===>
6
```
在求值步骤中，括号表示对 {anchorName NonTailSumOneTwoThree}`NonTail.sum` 的递归调用。
换句话说，要把这三个数相加，程序必须先检查列表非空。
要把列表的头部（{anchorTerm NonTailSumOneTwoThree}`1`）加到列表尾部的和上，首先必须计算列表尾部的和：
```anchorEvalStep NonTailSumOneTwoThree 1
1 + (NonTail.sum [2, 3])
```
但要计算列表尾部的和，程序必须检查它是否为空。
它并不为空——尾部本身是一个列表，其头部为 {anchorTerm NonTailSumOneTwoThree}`2`。
由此产生的步骤在等待 {anchorTerm NonTailSumOneTwoThree}`NonTail.sum [3]` 的返回：
```anchorEvalStep NonTailSumOneTwoThree 2
1 + (2 + (NonTail.sum [3]))
```
运行时调用栈的全部意义就在于跟踪值 {anchorTerm NonTailSumOneTwoThree}`1`、{anchorTerm NonTailSumOneTwoThree}`2` 和 {anchorTerm NonTailSumOneTwoThree}`3`，以及把它们的和加到递归调用结果上的指令。
随着递归调用完成，控制权返回到发起调用的栈帧，于是每一步加法都会被执行。
保存列表的头部以及相加的指令并非没有代价；它需要的空间与列表长度成正比。

函数 {anchorName TailSum}`Tail.sum` 同样把一个 {anchorName TailSum}`Nat` 列表中的元素相加：

```anchor TailSum
def Tail.sumHelper (soFar : Nat) : List Nat → Nat
  | [] => soFar
  | x :: xs => sumHelper (x + soFar) xs

def Tail.sum (xs : List Nat) : Nat :=
  Tail.sumHelper 0 xs
```
把它应用于列表 {anchorTerm TailSumOneTwoThree}`[1, 2, 3]` 会产生以下求值步骤序列：
```anchorEvalSteps TailSumOneTwoThree
Tail.sum [1, 2, 3]
===>
Tail.sumHelper 0 [1, 2, 3]
===>
Tail.sumHelper (0 + 1) [2, 3]
===>
Tail.sumHelper 1 [2, 3]
===>
Tail.sumHelper (1 + 2) [3]
===>
Tail.sumHelper 3 [3]
===>
Tail.sumHelper (3 + 3) []
===>
Tail.sumHelper 6 []
===>
6
```
内部辅助函数递归地调用自身，但调用方式使得计算最终结果时无需记住任何东西。
当 {anchorName TailSum}`Tail.sumHelper` 到达基本情况时，控制权可以直接返回到 {anchorName TailSum}`Tail.sum`，因为 {anchorName TailSum}`Tail.sumHelper` 的中间调用只是原封不动地返回其递归调用的结果。
换句话说，单个栈帧可以在 {anchorName TailSum}`Tail.sumHelper` 的每次递归调用中被重复使用。
尾调用消除正是这种栈帧的重复使用，而 {anchorName TailSum}`Tail.sumHelper` 被称为_尾递归函数_（tail-recursive function）。

{anchorName TailSum}`Tail.sumHelper` 的第一个参数包含了原本需要在调用栈中跟踪的全部信息——即到目前为止遇到的数字之和。
在每次递归调用中，这个参数会用新信息更新，而不是向调用栈添加新信息。
像 {anchorName TailSum}`soFar` 这样取代调用栈信息的参数称为_累加器_（accumulators）。

在撰写本书时，在作者的计算机上，{anchorName NonTailSum}`NonTail.sum` 在传入包含 216,856 个或更多条目的列表时会因栈溢出而崩溃。
另一方面，{anchorName TailSum}`Tail.sum` 可以对包含 100,000,000 个元素的列表求和而不会栈溢出。
由于在运行 {anchorName TailSum}`Tail.sum` 时无需压入新的栈帧，它完全等价于一个带有保存当前列表的可变变量的 {kw}`while` 循环。
在每次递归调用时，栈上的函数参数只是被替换为列表的下一个节点。


# 尾位置与非尾位置
%%%
tag := "tail-positions"
%%%

{anchorName TailSum}`Tail.sumHelper` 是尾递归的原因，在于递归调用处于_尾位置_（tail position）。
非正式地说，当调用者不需要以任何方式修改返回值，而是直接返回它时，函数调用就处于尾位置。
更形式地说，尾位置可以为表达式显式定义。

如果 {kw}`match` 表达式处于尾位置，那么它的每个分支也处于尾位置。
一旦 {kw}`match` 选定了分支，控制权会立即进入该分支。
类似地，如果 {kw}`if` 表达式本身处于尾位置，那么它的两个分支也处于尾位置。
最后，如果 {kw}`let` 表达式处于尾位置，那么它的函数体也处于尾位置。

所有其他位置都不在尾位置。
函数或构造子的参数不在尾位置，因为求值必须跟踪将要应用于参数值的函数或构造子。
内部函数的函数体不在尾位置，因为控制权甚至可能不会进入它：函数体在函数被调用之前不会被求值。
类似地，函数类型的函数体不在尾位置。
要在 {lit}`(x : α) → E` 中对 {lit}`E` 求值，必须跟踪结果的类型外面要包上 {lit}`(x : α) → ...`。

在 {anchorName NonTailSum}`NonTail.sum` 中，递归调用不在尾位置，因为它是 {anchorTerm NonTailSum}`+` 的参数。
在 {anchorName TailSum}`Tail.sumHelper` 中，递归调用处于尾位置，因为它紧挨在模式匹配之下，而模式匹配本身又是函数的函数体。

在撰写本书时，Lean 只消除递归函数中的直接尾调用。
这意味着 {lit}`f` 的定义中对 {lit}`f` 的尾调用会被消除，但对某个其他函数 {lit}`g` 的尾调用则不会。
虽然消除对其他函数的尾调用、从而节省一个栈帧当然是可能的，但 Lean 尚未实现这一点。

# 反转列表
%%%
tag := "reversing-lists-tail-recursively"
%%%

函数 {anchorName NonTailReverse}`NonTail.reverse` 通过把每个子列表的头部追加到结果的末尾来反转列表：

```anchor NonTailReverse
def NonTail.reverse : List α → List α
  | [] => []
  | x :: xs => reverse xs ++ [x]
```
用它反转 {anchorTerm NonTailReverseSteps}`[1, 2, 3]` 会产生以下步骤序列：
```anchorEvalSteps NonTailReverseSteps
NonTail.reverse [1, 2, 3]
===>
(NonTail.reverse [2, 3]) ++ [1]
===>
((NonTail.reverse [3]) ++ [2]) ++ [1]
===>
(((NonTail.reverse []) ++ [3]) ++ [2]) ++ [1]
===>
(([] ++ [3]) ++ [2]) ++ [1]
===>
([3] ++ [2]) ++ [1]
===>
[3, 2] ++ [1]
===>
[3, 2, 1]
```

尾递归版本在每一步对累加器使用 {lit}`x :: ·`，而不是 {lit}`· ++ [x]`：

```anchor TailReverse
def Tail.reverseHelper (soFar : List α) : List α → List α
  | [] => soFar
  | x :: xs => reverseHelper (x :: soFar) xs

def Tail.reverse (xs : List α) : List α :=
  Tail.reverseHelper [] xs
```
这是因为用 {anchorName NonTailReverse}`NonTail.reverse` 计算时，保存在每个栈帧中的上下文从基本情况开始被应用。
每个“记住的”上下文片段按后进先出的顺序执行。
另一方面，累加器传递版本从列表的第一个条目开始修改累加器，而不是从原始基本情况开始，这一点可以从归约步骤序列中看出：
```anchorEvalSteps TailReverseSteps
Tail.reverse [1, 2, 3]
===>
Tail.reverseHelper [] [1, 2, 3]
===>
Tail.reverseHelper [1] [2, 3]
===>
Tail.reverseHelper [2, 1] [3]
===>
Tail.reverseHelper [3, 2, 1] []
===>
[3, 2, 1]
```
换句话说，非尾递归版本从基本情况开始，从右到左穿过列表修改递归的结果。
列表中的条目以先进先出的顺序影响累加器。
带累加器的尾递归版本从列表头部开始，从左到右穿过列表修改初始累加器值。

由于加法满足交换律，在 {anchorName TailSum}`Tail.sum` 中无需为此做任何调整。
列表追加不满足交换律，因此必须谨慎地找到一种在相反方向上运行时具有相同效果的操作。
在 {anchorName NonTailReverse}`NonTail.reverse` 中，把 {anchorTerm NonTailReverse}`[x]` 追加到递归结果之后，类似于在按相反顺序构建结果时把 {anchorName NonTailReverse}`x` 加到列表开头。

# 多个递归调用
%%%
tag := "multiple-call-tail-recursion"
%%%

在 {anchorName mirrorNew (module := Examples.Monads.Conveniences)}`BinTree.mirror` 的定义中，有两个递归调用：

```anchor mirrorNew (module := Examples.Monads.Conveniences)
def BinTree.mirror : BinTree α → BinTree α
  | .leaf => .leaf
  | .branch l x r => .branch (mirror r) x (mirror l)
```
正如命令式语言通常会对 {anchorName NonTailReverse}`reverse` 和 {anchorName NonTailSum}`sum` 这类函数使用 {kw}`while` 循环一样，它们通常会对这种遍历使用递归函数。
这个函数不能简单地用累加器传递风格改写成尾递归，至少不能使用本书介绍的技术。

通常，如果每一步递归需要多于一个递归调用，那么使用累加器传递风格就会很困难。
这种困难类似于把递归函数改写成使用循环和显式数据结构的困难，还额外增加了说服 Lean 该函数会终止的复杂性。
然而，正如 {anchorName mirrorNew (module:=Examples.Monads.Conveniences)}`BinTree.mirror` 那样，多个递归调用往往表明数据结构有一个构造子，其中包含该类型的多个递归出现。
在这些情况下，结构的深度通常相对于其整体大小是对数级的，这使得栈与堆之间的权衡不那么尖锐。
有系统性的技术可以使这些函数变成尾递归，例如使用_续延传递风格_（continuation-passing style）和_去函数化_（defunctionalization），但它们超出了本书的范围。

# 练习
%%%
tag := "tail-recursion-exercises"
%%%

把以下每个非尾递归函数翻译成使用累加器传递的尾递归函数：


```anchor NonTailLength
def NonTail.length : List α → Nat
  | [] => 0
  | _ :: xs => NonTail.length xs + 1
```


```anchor NonTailFact
def NonTail.factorial : Nat → Nat
  | 0 => 1
  | n + 1 => factorial n * (n + 1)
```

{anchorName NonTailFilter}`NonTail.filter` 的翻译应得到一个通过尾递归占用常量栈空间的程序，且运行时间与输入列表长度成线性关系。
相对于原始版本，可接受常数因子的开销：

```anchor NonTailFilter
def NonTail.filter (p : α → Bool) : List α → List α
  | [] => []
  | x :: xs =>
    if p x then
      x :: filter p xs
    else
      filter p xs
```