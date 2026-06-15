# 示例：单子中的算术

单子（monad）是一种将带有副作用（side effects）的程序编码到本身不具备副作用的语言中的方式。
这很容易让人读成一种承认：纯函数式程序缺少某些重要东西，程序员不得不绕圈子才能写出普通程序。
然而，虽然使用 {moduleName}`Monad` API 确实会给程序带来语法上的代价，但它带来两个重要好处：
 1. 程序必须在类型中如实说明自己使用了哪些效应。看一眼类型签名就能描述程序能做的_一切_，而不仅仅是它接受什么、返回什么。
 2. 并非每种语言都提供相同的效应。例如，只有部分语言有异常。其他语言有独特、奇特的效应，比如 [Icon 对多个值的搜索](https://www2.cs.arizona.edu/icon/)，以及 Scheme 或 Ruby 的延续（continuations）。由于单子可以编码_任意_效应，程序员可以为给定应用选择最合适的效应，而不必受限于语言开发者提供的东西。

在多种单子中都有意义的一类程序示例，是算术表达式的求值器。

# 算术表达式

:::paragraph
算术表达式要么是字面整数，要么是作用于两个表达式的原始二元运算符。运算符包括加法、减法、乘法和除法：

```anchor ExprArith
inductive Expr (op : Type) where
  | const : Int → Expr op
  | prim : op → Expr op → Expr op → Expr op


inductive Arith where
  | plus
  | minus
  | times
  | div
```
:::

:::paragraph
表达式 {lit}`2 + 3` 表示为：

```anchor twoPlusThree
open Expr in
open Arith in
def twoPlusThree : Expr Arith :=
  prim plus (const 2) (const 3)
```
而 {lit}`14 / (45 - 5 * 9)` 表示为：
```anchor exampleArithExpr
open Expr in
open Arith in
def fourteenDivided : Expr Arith :=
  prim div (const 14)
    (prim minus (const 45)
      (prim times (const 5)
        (const 9)))
```
:::

# 求值表达式

:::paragraph
由于表达式包含除法，而除以零是未定义的，求值可能失败。
表示失败的一种方式是用 {anchorName evaluateOptionCommingled}`Option`：

```anchor evaluateOptionCommingled
def evaluateOption : Expr Arith → Option Int
  | Expr.const i => pure i
  | Expr.prim p e1 e2 =>
    evaluateOption e1 >>= fun v1 =>
    evaluateOption e2 >>= fun v2 =>
    match p with
    | Arith.plus => pure (v1 + v2)
    | Arith.minus => pure (v1 - v2)
    | Arith.times => pure (v1 * v2)
    | Arith.div => if v2 == 0 then none else pure (v1 / v2)
```
:::

:::paragraph
这个定义使用 {anchorTerm MonadOptionExcept}`Monad Option` 实例，将求值二元运算符两个分支时产生的失败传播出去。
然而，该函数混合了两个关注点：求值子表达式，以及将二元运算符应用于结果。
可以通过拆成两个函数来改进：

```anchor evaluateOptionSplit
def applyPrim : Arith → Int → Int → Option Int
  | Arith.plus, x, y => pure (x + y)
  | Arith.minus, x, y => pure (x - y)
  | Arith.times, x, y => pure (x * y)
  | Arith.div, x, y => if y == 0 then none else pure (x / y)

def evaluateOption : Expr Arith → Option Int
  | Expr.const i => pure i
  | Expr.prim p e1 e2 =>
    evaluateOption e1 >>= fun v1 =>
    evaluateOption e2 >>= fun v2 =>
    applyPrim p v1 v2
```
:::

:::paragraph
运行 {anchorTerm fourteenDivOption}`#eval evaluateOption fourteenDivided` 得到 {anchorInfo fourteenDivOption}`none`，符合预期，但这不是很有用的错误信息。
由于代码是用 {lit}`>>=` 写的，而不是显式处理 {anchorName MonadOptionExcept}`none` 构造子，只需稍作修改就能在失败时提供错误信息：

```anchor evaluateExcept
def applyPrim : Arith → Int → Int → Except String Int
  | Arith.plus, x, y => pure (x + y)
  | Arith.minus, x, y => pure (x - y)
  | Arith.times, x, y => pure (x * y)
  | Arith.div, x, y =>
    if y == 0 then
      Except.error s!"Tried to divide {x} by zero"
    else pure (x / y)

def evaluateExcept : Expr Arith → Except String Int
  | Expr.const i => pure i
  | Expr.prim p e1 e2 =>
    evaluateExcept e1 >>= fun v1 =>
    evaluateExcept e2 >>= fun v2 =>
    applyPrim p v1 v2
```
唯一的区别是类型签名写的是 {anchorTerm evaluateExcept}`Except String` 而不是 {anchorName Names}`Option`，失败分支用的是 {anchorName evaluateExcept}`Except.error` 而不是 {anchorName evaluateM}`none`。
通过让求值器在其单子上多态，并把 {anchorName evaluateM}`applyPrim` 作为参数传入，单个求值器就能同时支持两种错误报告方式：

```anchor evaluateM
def applyPrimOption : Arith → Int → Int → Option Int
  | Arith.plus, x, y => pure (x + y)
  | Arith.minus, x, y => pure (x - y)
  | Arith.times, x, y => pure (x * y)
  | Arith.div, x, y =>
    if y == 0 then
      none
    else pure (x / y)

def applyPrimExcept : Arith → Int → Int → Except String Int
  | Arith.plus, x, y => pure (x + y)
  | Arith.minus, x, y => pure (x - y)
  | Arith.times, x, y => pure (x * y)
  | Arith.div, x, y =>
    if y == 0 then
      Except.error s!"Tried to divide {x} by zero"
    else pure (x / y)

def evaluateM [Monad m]
    (applyPrim : Arith → Int → Int → m Int) :
    Expr Arith → m Int
  | Expr.const i => pure i
  | Expr.prim p e1 e2 =>
    evaluateM applyPrim e1 >>= fun v1 =>
    evaluateM applyPrim e2 >>= fun v2 =>
    applyPrim p v1 v2
```
:::

与 {anchorName evaluateMOption}`applyPrimOption` 一起使用时，效果与第一个求值器相同：
```anchor evaluateMOption
#eval evaluateM applyPrimOption fourteenDivided
```
```anchorInfo evaluateMOption
none
```
类似地，与 {anchorName evaluateMExcept}`applyPrimExcept` 一起使用时，效果与带错误信息的版本相同：
```anchor evaluateMExcept
#eval evaluateM applyPrimExcept fourteenDivided
```
```anchorInfo evaluateMExcept
Except.error "Tried to divide 14 by zero"
```

:::paragraph
代码仍可改进。
函数 {anchorName evaluateMOption}`applyPrimOption` 和 {anchorName evaluateMExcept}`applyPrimExcept` 仅在除法的处理上不同，可以把这一点再提取为求值器的另一个参数：

```anchor evaluateMRefactored
def applyDivOption (x : Int) (y : Int) : Option Int :=
    if y == 0 then
      none
    else pure (x / y)

def applyDivExcept (x : Int) (y : Int) : Except String Int :=
    if y == 0 then
      Except.error s!"Tried to divide {x} by zero"
    else pure (x / y)

def applyPrim [Monad m]
    (applyDiv : Int → Int → m Int) :
    Arith → Int → Int → m Int
  | Arith.plus, x, y => pure (x + y)
  | Arith.minus, x, y => pure (x - y)
  | Arith.times, x, y => pure (x * y)
  | Arith.div, x, y => applyDiv x y

def evaluateM [Monad m]
    (applyDiv : Int → Int → m Int) :
    Expr Arith → m Int
  | Expr.const i => pure i
  | Expr.prim p e1 e2 =>
    evaluateM applyDiv e1 >>= fun v1 =>
    evaluateM applyDiv e2 >>= fun v2 =>
    applyPrim applyDiv p v1 v2
```

在这段重构后的代码中，两条代码路径仅在失败处理上不同，这一点已经表现得非常清楚。
:::

# 更多效应

失败和异常并不是与求值器打交道时唯一有趣的效应类型。
除法的唯一副作用是失败，但向表达式加入其他原始运算符后，就可以表达其他效应。

第一步是进一步重构，把除法从原始运算符的数据类型中抽出来：

```anchor PrimCanFail
inductive Prim (special : Type) where
  | plus
  | minus
  | times
  | other : special → Prim special

inductive CanFail where
  | div
```
名称 {anchorName PrimCanFail}`CanFail` 暗示除法引入的效应是可能的失败。

第二步是扩大 {anchorName evaluateMMorePoly}`evaluateM` 的除法处理参数的作用域，使其能处理任意特殊运算符：

```anchor evaluateMMorePoly
def divOption : CanFail → Int → Int → Option Int
  | CanFail.div, x, y => if y == 0 then none else pure (x / y)

def divExcept : CanFail → Int → Int → Except String Int
  | CanFail.div, x, y =>
    if y == 0 then
      Except.error s!"Tried to divide {x} by zero"
    else pure (x / y)

def applyPrim [Monad m]
    (applySpecial : special → Int → Int → m Int) :
    Prim special → Int → Int → m Int
  | Prim.plus, x, y => pure (x + y)
  | Prim.minus, x, y => pure (x - y)
  | Prim.times, x, y => pure (x * y)
  | Prim.other op, x, y => applySpecial op x y

def evaluateM [Monad m]
    (applySpecial : special → Int → Int → m Int) :
    Expr (Prim special) → m Int
  | Expr.const i => pure i
  | Expr.prim p e1 e2 =>
    evaluateM applySpecial e1 >>= fun v1 =>
    evaluateM applySpecial e2 >>= fun v2 =>
    applyPrim applySpecial p v1 v2
```

## 无效应

类型 {anchorName applyEmpty}`Empty` 没有构造子，因此没有值，就像 Scala 或 Kotlin 中的 {Kotlin}`Nothing` 类型。
在 Scala 和 Kotlin 中，{Kotlin}`Nothing` 可以表示永不返回结果的计算，例如使程序崩溃的函数、抛出异常的函数，或总是陷入无限循环的函数。
类型为 {Kotlin}`Nothing` 的函数或方法参数表示死代码，因为永远不会有合适的实参值。
Lean 不支持无限循环和异常，但 {anchorName applyEmpty}`Empty` 仍可作为向类型系统表明某个函数不可能被调用的信号。
当 {anchorName nomatch}`E` 是类型没有构造子的表达式时，使用语法 {anchorTerm nomatch}`nomatch E` 向 Lean 表明当前表达式不必返回结果，因为它本就不可能已被调用。

把 {anchorName applyEmpty}`Empty` 用作 {anchorName PrimCanFail}`Prim` 的参数，表示除了 {anchorName evaluateMMorePoly}`Prim.plus`、{anchorName evaluateMMorePoly}`Prim.minus` 和 {anchorName evaluateMMorePoly}`Prim.times` 之外没有额外情况，因为不可能构造出类型为 {anchorName nomatch}`Empty` 的值放进 {anchorName evaluateMMorePoly}`Prim.other` 构造子。
由于类型为 {anchorName nomatch}`Empty` 的运算符作用于两个整数的函数永远不可能被调用，它不必返回结果。
因此，它可以用在_任意_单子中：

```anchor applyEmpty
def applyEmpty [Monad m] (op : Empty) (_ : Int) (_ : Int) : m Int :=
  nomatch op
```
它可以与 {anchorName evalId}`Id`（恒等单子）一起使用，来求值完全没有效应的表达式：
```anchor evalId
open Expr Prim in
#eval evaluateM (m := Id) applyEmpty (prim plus (const 5) (const (-14)))
```
```anchorInfo evalId
-9
```

## 非确定性搜索

遇到除以零时，除了简单失败，回溯并尝试不同输入也是合理的。
在合适的单子下，同一个 {anchorName evalId}`evaluateM` 可以对一组不产生失败的答案进行非确定性搜索。
除了除法之外，还需要某种指定结果选择的方式。
一种做法是在表达式语言中加入函数 {lit}`choose`，指示求值器在搜索非失败结果时从两个参数中任选其一。

求值器的结果现在是一个值的多重集（multiset），而不是单个值。
求值为多重集的规则如下：
 * 常量 $`n` 求值为单元素集 $`\{n\}`。
 * 除法以外的算术运算符对运算符结果的笛卡尔积中的每一对调用，因此 $`X + Y` 求值为 $`\{ x + y \mid x ∈ X, y ∈ Y \}`。
 * 除法 $`X / Y` 求值为 $`\{ x / y \mid x ∈ X, y ∈ Y, y ≠ 0\}`。换言之，$`Y` 中所有 $`0` 值都被丢弃。
 * 选择 $`\mathrm{choose}(x, y)` 求值为 $`\{ x, y \}`。

例如，$`1 + \mathrm{choose}(2, 5)` 求值为 $`\{ 3, 6 \}`，$`1 + 2 / 0` 求值为 $`\{\}`，$`90 / (\mathrm{choose}(-5, 5) + 5)` 求值为 $`\{ 9 \}`。
使用多重集而不是真正的集合可以简化代码，因为不必检查元素是否唯一。

:::paragraph
表示这种非确定性效应的单子，必须能表示没有答案的情况，以及至少有一个答案并附带其余答案的情况：

```anchor Many (module := Examples.Monads.Many)
inductive Many (α : Type) where
  | none : Many α
  | more : α → (Unit → Many α) → Many α
```
这个数据类型看起来很像 {anchorName fromList (module:=Examples.Monads.Many)}`List`。
区别在于，{anchorName etc}`List.cons` 存储的是列表的剩余部分，而 {anchorName Many (module:=Examples.Monads.Many)}`more` 存储的是按需计算剩余值的函数。
这意味着 {anchorName Many (module:=Examples.Monads.Many)}`Many` 的消费者可以在找到一定数量的结果后停止搜索。
:::

:::paragraph
单个结果由返回不再有进一步结果的 {anchorName Many (module:=Examples.Monads.Many)}`more` 构造子表示：

```anchor one (module := Examples.Monads.Many)
def Many.one (x : α) : Many α := Many.more x (fun () => Many.none)
```
:::

:::paragraph
两个结果多重集的并集可以这样计算：先检查第一个多重集是否为空。
若为空，则并集就是第二个多重集。
若不为空，则并集由第一个多重集的首元素，以及第一个多重集剩余部分与第二个多重集的并集组成：

```anchor union (module := Examples.Monads.Many)
def Many.union : Many α → Many α → Many α
  | Many.none, ys => ys
  | Many.more x xs, ys => Many.more x (fun () => union (xs ()) ys)
```
:::

:::paragraph
从值列表启动搜索过程往往很方便。
{anchorName fromList (module:=Examples.Monads.Many)}`Many.fromList` 将列表转换为结果多重集：

```anchor fromList (module := Examples.Monads.Many)
def Many.fromList : List α → Many α
  | [] => Many.none
  | x :: xs => Many.more x (fun () => fromList xs)
```

类似地，一旦指定了搜索，提取一定数量或全部值也会很方便：

```anchor take (module := Examples.Monads.Many)
def Many.take : Nat → Many α → List α
  | 0, _ => []
  | _ + 1, Many.none => []
  | n + 1, Many.more x xs => x :: (xs ()).take n

def Many.takeAll : Many α → List α
  | Many.none => []
  | Many.more x xs => x :: (xs ()).takeAll
```
:::

{anchorTerm MonadMany (module:=Examples.Monads.Many)}`Monad Many` 实例需要 {anchorName MonadContract}`bind` 运算符。
在非确定性搜索中，两个操作的顺序组合包括：取第一步的所有可能结果，对每一个运行程序的剩余部分，再取结果的并集。
换言之，若第一步返回三个可能答案，第二步需要对这三个都尝试。
由于第二步对每个输入可以返回任意数量的答案，取它们的并集就表示整个搜索空间。

```anchor bind (module := Examples.Monads.Many)
def Many.bind : Many α → (α → Many β) → Many β
  | Many.none, _ =>
    Many.none
  | Many.more x xs, f =>
    (f x).union (bind (xs ()) f)
```

{anchorName MonadMany (module:=Examples.Monads.Many)}`Many.one` 和 {anchorName MonadMany (module:=Examples.Monads.Many)}`Many.bind` 满足单子契约。
要验证 {anchorTerm bindLeft (module:=Examples.Monads.Many)}`Many.bind (Many.one v) f` 与 {anchorTerm bindLeft (module:=Examples.Monads.Many)}`f v` 相同，先把表达式尽可能求值：
```anchorEvalSteps bindLeft (module := Examples.Monads.Many)
Many.bind (Many.one v) f
===>
Many.bind (Many.more v (fun () => Many.none)) f
===>
(f v).union (Many.bind Many.none f)
===>
(f v).union Many.none
```
空多重集是 {anchorName union (module:=Examples.Monads.Many)}`union` 的右单位元，因此答案等价于 {anchorTerm bindLeft (module:=Examples.Monads.Many)}`f v`。
要验证 {anchorTerm bindOne (module:=Examples.Monads.Many)}`Many.bind v Many.one` 与 {anchorName bindOne (module:=Examples.Monads.Many)}`v` 相同，注意 {anchorName bindOne (module:=Examples.Monads.Many)}`Many.bind` 取对 {anchorName bindOne (module:=Examples.Monads.Many)}`v` 的每个元素应用 {anchorName one (module:=Examples.Monads.Many)}`Many.one` 后的并集。
换言之，若 {anchorName bindOne (module:=Examples.Monads.Many)}`v` 形如 {anchorTerm vSet (module:=Examples.Monads.Many)}`{v₁, v₂, v₃, …, vₙ}`，则 {anchorTerm bindOne (module:=Examples.Monads.Many)}`Many.bind v Many.one` 是 {anchorTerm vSets (module:=Examples.Monads.Many)}`{v₁} ∪ {v₂} ∪ {v₃} ∪ … ∪ {vₙ}`，也就是 {anchorTerm vSet (module:=Examples.Monads.Many)}`{v₁, v₂, v₃, …, vₙ}`。

最后，要验证 {anchorName bind (module:=Examples.Monads.Many)}`Many.bind` 满足结合律，需检查 {anchorTerm bindBindLeft (module:=Examples.Monads.Many)}`Many.bind (Many.bind v f) g` 与 {anchorTerm bindBindRight (module:=Examples.Monads.Many)}`Many.bind v (fun x => Many.bind (f x) g)` 相同。
若 {anchorName bindBindRight (module:=Examples.Monads.Many)}`v` 形如 {anchorTerm vSet (module:=Examples.Monads.Many)}`{v₁, v₂, v₃, …, vₙ}`，则：
```anchorEvalSteps bindUnion (module := Examples.Monads.Many)
Many.bind v f
===>
f v₁ ∪ f v₂ ∪ f v₃ ∪ … ∪ f vₙ
```
因此
```anchorEvalSteps bindBindLeft (module := Examples.Monads.Many)
Many.bind (Many.bind v f) g
===>
Many.bind (f v₁) g ∪
Many.bind (f v₂) g ∪
Many.bind (f v₃) g ∪
… ∪
Many.bind (f vₙ) g
```
类似地，
```anchorEvalSteps bindBindRight (module := Examples.Monads.Many)
Many.bind v (fun x => Many.bind (f x) g)
===>
(fun x => Many.bind (f x) g) v₁ ∪
(fun x => Many.bind (f x) g) v₂ ∪
(fun x => Many.bind (f x) g) v₃ ∪
… ∪
(fun x => Many.bind (f x) g) vₙ
===>
Many.bind (f v₁) g ∪
Many.bind (f v₂) g ∪
Many.bind (f v₃) g ∪
… ∪
Many.bind (f vₙ) g
```
因此两边相等，{anchorName bindAssoc (module:=Examples.Monads.Many)}`Many.bind` 满足结合律。

得到的单子实例如下：

```anchor MonadMany (module := Examples.Monads.Many)
instance : Monad Many where
  pure := Many.one
  bind := Many.bind
```
用这个单子进行搜索的一个例子，是找出列表中所有相加为 15 的数字组合：

```anchor addsTo (module := Examples.Monads.Many)
def addsTo (goal : Nat) : List Nat → Many (List Nat)
  | [] =>
    if goal == 0 then
      pure []
    else
      Many.none
  | x :: xs =>
    if x > goal then
      addsTo goal xs
    else
      (addsTo goal xs).union
        (addsTo (goal - x) xs >>= fun answer =>
         pure (x :: answer))
```
搜索过程对列表递归。
当目标是 {anchorTerm addsTo (module:=Examples.Monads.Many)}`0` 时，空列表表示搜索成功；否则失败。
当列表非空时，有两种可能：要么列表头大于目标，因而不能参与任何成功搜索；要么不大于，因而可以参与。
若列表头_不是_候选，则继续在尾部搜索。
若列表头是候选，则有两种可能，用 {anchorName union (module:=Examples.Monads.Many)}`Many.union` 合并：要么找到的解包含该头，要么不包含。
不包含该头的解通过对尾部递归调用得到；包含该头的解则先从目标中减去该头，再把该头附加到递归调用得到的解上。

辅助函数 {anchorName printList (module:=Examples.Monads.Many)}`printList` 确保每个结果显示在一行：

```anchor printList (module := Examples.Monads.Many)
def printList [ToString α] : List α → IO Unit
  | [] => pure ()
  | x :: xs => do
    IO.println x
    printList xs
```
```anchor addsToFifteen (module := Examples.Monads.Many)
#eval printList (addsTo 15 [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).takeAll
```
```anchorInfo addsToFifteen (module := Examples.Monads.Many)
[7, 8]
[6, 9]
[5, 10]
[4, 5, 6]
[3, 5, 7]
[3, 4, 8]
[2, 6, 7]
[2, 5, 8]
[2, 4, 9]
[2, 3, 10]
[2, 3, 4, 6]
[1, 6, 8]
[1, 5, 9]
[1, 4, 10]
[1, 3, 5, 6]
[1, 3, 4, 7]
[1, 2, 5, 7]
[1, 2, 4, 8]
[1, 2, 3, 9]
[1, 2, 3, 4, 5]
```

:::paragraph
回到产生多重集结果的算术求值器，{anchorName NeedsSearch}`choose` 运算符可用于非确定性地选择一个值，除以零会使先前的选择无效。

```anchor NeedsSearch
inductive NeedsSearch
  | div
  | choose

def applySearch : NeedsSearch → Int → Int → Many Int
  | NeedsSearch.choose, x, y =>
    Many.fromList [x, y]
  | NeedsSearch.div, x, y =>
    if y == 0 then
      Many.none
    else Many.one (x / y)
```
:::

:::paragraph
使用这些运算符，可以对前面的例子求值：

```anchor opening
open Expr Prim NeedsSearch
```
```anchor searchA
#eval
  (evaluateM applySearch
    (prim plus (const 1)
      (prim (other choose) (const 2)
        (const 5)))).takeAll
```
```anchorInfo searchA
[3, 6]
```
```anchor searchB
#eval
  (evaluateM applySearch
    (prim plus (const 1)
      (prim (other div) (const 2)
        (const 0)))).takeAll
```
```anchorInfo searchB
[]
```
```anchor searchC
#eval
  (evaluateM applySearch
    (prim (other div) (const 90)
      (prim plus (prim (other choose) (const (-5)) (const 5))
        (const 5)))).takeAll
```
```anchorInfo searchC
[9]
```
:::

## 自定义环境

可以通过允许用字符串作为运算符，并提供从字符串到实现函数的映射，使求值器可由用户扩展。
例如，用户可以用取余运算符，或用返回两个参数中较大者的运算符来扩展求值器。
从函数名到函数实现的映射称为**环境（environment）**。

环境需要在每次递归调用中传入。
起初，似乎 {anchorName evaluateM}`evaluateM` 需要多一个参数来保存环境，并且该参数应传给每次递归调用。
然而，像这样传递参数是另一种形式的单子，因此合适的 {anchorName evaluateM}`Monad` 实例可以让求值器原样使用。

把函数当作单子使用通常称为**读者单子（reader monad）**。
在读者单子中求值表达式时，使用以下规则：
 * 常量 $`n` 求值为常值函数 $`λ e . n`，
 * 算术运算符求值为传递其参数的函数，因此 $`f + g` 求值为 $`λ e . f(e) + g(e)`，以及
 * 自定义运算符求值为将自定义运算符应用于参数的结果，因此 $`f \ \mathrm{OP}\ g` 求值为
   $$`
     λ e .
     \begin{cases}
     h(f(e), g(e)) & \mathrm{if}\ e\ \mathrm{contains}\ (\mathrm{OP}, h) \\
     0 & \mathrm{otherwise}
     \end{cases}
   `
   其中 $`0` 在应用未知运算符时作为后备值。

:::paragraph
要在 Lean 中定义读者单子，第一步是定义 {anchorName Reader}`Reader` 类型，以及让用户获取环境的效应：

```anchor Reader
def Reader (ρ : Type) (α : Type) : Type := ρ → α

def read : Reader ρ ρ := fun env => env
```
按惯例，希腊字母 {anchorName Reader}`ρ`（读作 “rho”）用于表示环境。
:::

:::paragraph
算术表达式中的常量求值为常值函数，这一事实表明 {anchorName Reader}`Reader` 的合适 {anchorName IdMonad}`pure` 定义是常值函数：

```anchor ReaderPure
def Reader.pure (x : α) : Reader ρ α := fun _ => x
```
:::


另一方面，{anchorName MonadContract}`bind` 稍微棘手一些。
它的类型是 {anchorTerm readerBindType}`Reader ρ α → (α → Reader ρ β) → Reader ρ β`。
展开 {anchorName Reader}`Reader` 的定义后，类型变为 {anchorTerm readerBindTypeEval}`(ρ → α) → (α → ρ → β) → (ρ → β)`，这样更容易理解。
它应把接受环境的函数作为第一个参数，第二个参数则把接受环境的函数的结果变换成另一个接受环境的函数。
组合的结果是它本身也是一个函数，等待环境传入。

可以交互式地使用 Lean 来获得编写该函数的帮助。
第一步是写下参数和返回类型，尽量写得明确以获得更多帮助，函数体用下划线占位：
```anchor readerbind0
def Reader.bind {ρ : Type} {α : Type} {β : Type}
  (result : ρ → α) (next : α → ρ → β) : ρ → β :=
  _
```
Lean 会给出一条消息，说明当前作用域中有哪些变量，以及结果应有的类型。
符号 {lit}`⊢` 称为 {deftech}_闸机（turnstile）_，因其形似地铁入口闸机，用于分隔局部变量与期望类型；在此消息中期望类型是 {anchorTerm readerbind0}`ρ → β`：
```anchorError readerbind0
don't know how to synthesize placeholder
context:
ρ α β : Type
result : ρ → α
next : α → ρ → β
⊢ ρ → β
```

由于返回类型是函数，好的第一步是在下划线外包一层 {kw}`fun`：
```anchor readerbind1
def Reader.bind {ρ : Type} {α : Type} {β : Type}
  (result : ρ → α) (next : α → ρ → β) : ρ → β :=
  fun env => _
```
得到的消息现在把函数参数显示为局部变量：
```anchorError readerbind1
don't know how to synthesize placeholder
context:
ρ α β : Type
result : ρ → α
next : α → ρ → β
env : ρ
⊢ β
```

上下文中唯一能产生 {anchorName readerbind2a}`β` 的是 {anchorName readerbind2a}`next`，而它需要两个参数才能做到。
每个参数本身也可以是一个下划线：
```anchor readerbind2a
def Reader.bind {ρ : Type} {α : Type} {β : Type}
  (result : ρ → α) (next : α → ρ → β) : ρ → β :=
  fun env => next _ _
```
两个下划线分别对应以下消息：
```anchorError readerbind2a
don't know how to synthesize placeholder
context:
ρ α β : Type
result : ρ → α
next : α → ρ → β
env : ρ
⊢ α
```
```anchorError readerbind2b
don't know how to synthesize placeholder
context:
ρ α β : Type
result : ρ → α
next : α → ρ → β
env : ρ
⊢ ρ
```

:::paragraph
处理第一个下划线时，上下文中唯一能产生 {anchorName readerbind3}`α` 的是 {anchorName readerbind3}`result`：
```anchor readerbind3
def Reader.bind {ρ : Type} {α : Type} {β : Type}
  (result : ρ → α) (next : α → ρ → β) : ρ → β :=
  fun env => next (result _) _
```
现在两个下划线有相同的错误消息：
```anchorError readerbind3
don't know how to synthesize placeholder
context:
ρ α β : Type
result : ρ → α
next : α → ρ → β
env : ρ
⊢ ρ
```
:::

:::paragraph
幸运的是，两个下划线都可以替换为 {anchorName readerbind4}`env`，得到：

```anchor readerbind4
def Reader.bind {ρ : Type} {α : Type} {β : Type}
  (result : ρ → α) (next : α → ρ → β) : ρ → β :=
  fun env => next (result env) env
```
:::

最终版本可以通过撤销对 {anchorName Readerbind}`Reader` 的展开并清理显式细节得到：

```anchor Readerbind
def Reader.bind
    (result : Reader ρ α)
    (next : α → Reader ρ β) : Reader ρ β :=
  fun env => next (result env) env
```

并不总能仅靠“跟着类型走”就写出正确的函数，而且这样做也有不理解最终程序的风险。
不过，理解已经写出的程序，有时也比理解尚未写出的程序更容易；填写下划线的过程也能带来洞见。
在本例中，{anchorName Readerbind}`Reader.bind` 的工作方式与 {anchorName IdMonad}`Id` 的 {anchorName IdMonad}`bind` 类似，只是多接受一个参数并向下传给其参数，这种直觉有助于理解它的工作原理。

{anchorName ReaderPure}`Reader.pure`（生成常值函数）和 {anchorName Readerbind}`Reader.bind` 满足单子契约。
要验证 {anchorTerm ReaderMonad1}`Reader.bind (Reader.pure v) f` 与 {anchorTerm ReaderMonad1}`f v` 相同，只需替换定义直到最后一步：
```anchorEvalSteps ReaderMonad1
Reader.bind (Reader.pure v) f
===>
fun env => f ((Reader.pure v) env) env
===>
fun env => f ((fun _ => v) env) env
===>
fun env => f v env
===>
f v
```
对任意函数 {anchorName eta}`f`，{anchorTerm eta}`fun x => f x` 与 {anchorName eta}`f` 相同，因此契约的第一部分成立。
要验证 {anchorTerm ReaderMonad2}`Reader.bind r Reader.pure` 与 {anchorName ReaderMonad2}`r` 相同，类似技巧即可：
```anchorEvalSteps ReaderMonad2
Reader.bind r Reader.pure
===>
fun env => Reader.pure (r env) env
===>
fun env => (fun _ => (r env)) env
===>
fun env => r env
```
因为读者动作 {anchorName ReaderMonad2}`r` 本身就是函数，这与 {anchorName ReaderMonad2}`r` 相同。
要验证结合律，可以对 {anchorEvalStep ReaderMonad3a 0}`Reader.bind (Reader.bind r f) g` 和 {anchorEvalStep ReaderMonad3b 0}`Reader.bind r (fun x => Reader.bind (f x) g)` 做同样的事：
```anchorEvalSteps ReaderMonad3a
Reader.bind (Reader.bind r f) g
===>
fun env => g ((Reader.bind r f) env) env
===>
fun env => g ((fun env' => f (r env') env') env) env
===>
fun env => g (f (r env) env) env
```

{anchorEvalStep ReaderMonad3b 0}`Reader.bind r (fun x => Reader.bind (f x) g)` 化简为同一表达式：
```anchorEvalSteps ReaderMonad3b
Reader.bind r (fun x => Reader.bind (f x) g)
===>
Reader.bind r (fun x => fun env => g (f x env) env)
===>
fun env => (fun x => fun env' => g (f x env') env') (r env) env
===>
fun env => (fun env' => g (f (r env) env') env') env
===>
fun env => g (f (r env) env) env
```

因此，{anchorTerm MonadReaderInst}`Monad (Reader ρ)` 实例是合理的：

```anchor MonadReaderInst
instance : Monad (Reader ρ) where
  pure x := fun _ => x
  bind x f := fun env => f (x env) env
```

传给表达式求值器的自定义环境可以表示为键值对列表：

```anchor Env
abbrev Env : Type := List (String × (Int → Int → Int))
```
例如，{anchorName exampleEnv}`exampleEnv` 包含最大值和取模函数：

```anchor exampleEnv
def exampleEnv : Env := [("max", max), ("mod", (· % ·))]
```

Lean 已有函数 {anchorName etc}`List.lookup`，可在键值对列表中查找与键关联的值，因此 {anchorName applyPrimReader}`applyPrimReader` 只需检查自定义函数是否出现在环境中。若函数未知则返回 {anchorTerm applyPrimReader}`0`：

```anchor applyPrimReader
def applyPrimReader (op : String) (x : Int) (y : Int) : Reader Env Int :=
  read >>= fun env =>
  match env.lookup op with
  | none => pure 0
  | some f => pure (f x y)
```

将 {anchorName readerEval}`evaluateM` 与 {anchorName readerEval}`applyPrimReader` 和表达式一起使用时，会得到一个期望环境的函数。
幸运的是，{anchorName readerEval}`exampleEnv` 可用：
```anchor readerEval
open Expr Prim in
#eval
  evaluateM applyPrimReader
    (prim (other "max") (prim plus (const 5) (const 4))
      (prim times (const 3)
        (const 2)))
    exampleEnv
```
```anchorInfo readerEval
9
```

与 {anchorName Many (module:=Examples.Monads.Many)}`Many` 一样，{anchorName Reader}`Reader` 也是一种在大多数语言中难以编码的效应，但类型类和单子使它与其他效应一样方便。
Common Lisp、Clojure 和 Emacs Lisp 中的动态变量或特殊变量可以像 {anchorName Reader}`Reader` 那样使用。
类似地，Scheme 和 Racket 的 parameter 对象是一种与 {anchorName Reader}`Reader` 完全对应的效应。
Kotlin 的 context 对象惯用法可以解决类似问题，但它们本质上是自动传递函数参数的手段，因此这种惯用法更像读者单子的编码方式，而不是语言内置的效应。

## 练习

### 验证契约

验证 {anchorTerm StateMonad}`State σ` 和 {anchorTerm MonadOptionExcept}`Except ε` 的单子契约。


### 带失败的读者

改造读者单子示例，使其在自定义运算符未定义时也能表示失败，而不仅仅返回零。
换言之，给定以下定义：

```anchor ReaderFail
def ReaderOption (ρ : Type) (α : Type) : Type := ρ → Option α

def ReaderExcept (ε : Type) (ρ : Type) (α : Type) : Type := ρ → Except ε α
```
完成以下任务：
 1. 编写合适的 {lit}`pure` 和 {lit}`bind` 函数
 2. 验证这些函数满足 {anchorName evaluateM}`Monad` 契约
 3. 为 {anchorName ReaderFail}`ReaderOption` 和 {anchorName ReaderFail}`ReaderExcept` 编写 {anchorName evaluateM}`Monad` 实例
 4. 定义合适的 {anchorName evaluateM}`applyPrim` 运算符，并在一些示例表达式上用 {anchorName evaluateM}`evaluateM` 测试它们

### 带追踪的求值器

{anchorName MonadWriter}`WithLog` 类型可与求值器一起使用，为某些运算添加可选的追踪。
特别地，类型 {anchorName ToTrace}`ToTrace` 可作为追踪给定运算符的信号：

```anchor ToTrace
inductive ToTrace (α : Type) : Type where
  | trace : α → ToTrace α
```
对于带追踪的求值器，表达式的类型应为 {anchorTerm ToTraceExpr}`Expr (Prim (ToTrace (Prim Empty)))`。
这表示表达式中的运算符由加法、减法和乘法组成，并各自带有可追踪版本。最内层参数是 {anchorName ToTraceExpr}`Empty`，表示 {anchorName ToTrace}`trace` 内部没有进一步的特殊运算符，只有三个基本运算符。

完成以下任务：
 1. 实现 {anchorTerm MonadWriter}`Monad (WithLog logged)` 实例
 2. 编写 {anchorName applyTracedType}`applyTraced` 函数，将带追踪的运算符应用于其参数，并记录运算符和参数，类型为 {anchorTerm applyTracedType}`ToTrace (Prim Empty) → Int → Int → WithLog (Prim Empty × Int × Int) Int`

若练习完成正确，则
```anchor evalTraced
open Expr Prim ToTrace in
#eval
  evaluateM applyTraced
    (prim (other (trace times))
      (prim (other (trace plus)) (const 1)
        (const 2))
      (prim (other (trace minus)) (const 3)
        (const 4)))
```
应得到
```anchorInfo evalTraced
{ log := [(Prim.plus, 1, 2), (Prim.minus, 3, 4), (Prim.times, 3, -1)], val := -3 }
```

 提示：类型为 {anchorTerm ToTraceExpr}`Prim Empty` 的值会出现在结果日志中。为了在 {kw}`#eval` 的结果中显示它们，需要以下实例：

```anchor ReprInstances
deriving instance Repr for WithLog
deriving instance Repr for Empty
deriving instance Repr for Prim
```