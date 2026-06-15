# 单子（Monads）

在 C# 和 Kotlin 中，{CSharp}`?.` 运算符用于在可能为 null 的值上查找属性或调用方法。
如果接收者为 {CSharp}`null`，整个表达式的结果就是 null。
否则，底层的非 {CSharp}`null` 值会接收这次调用。
{CSharp}`?.` 可以链式使用，此时第一个产生 {Kotlin}`null` 的结果会终止后续的查找链。
像这样链式进行 null 检查，比编写和维护深度嵌套的 {kw}`if` 方便得多。

类似地，异常比手动检查并传播错误码要方便得多。
与此同时，日志记录最容易通过专用的日志框架来完成，而不是让每个函数同时返回日志结果和返回值。
链式 null 检查和异常通常需要语言设计者在语言层面预先考虑这种用法，而日志框架通常利用副作用将记录日志的代码与日志的累积解耦。

## 本章目录

- [一个 API，多种应用](#一个-api多种应用)（本章正文）
- [单子类型类](Monads/Class.md)（The Monad Type Class）
- [示例：单子中的算术](Monads/Arithmetic.md)（Example: Arithmetic in Monads）
- [单子的 {kw}`do` 记法](Monads/Do.md)（{kw}`do`-Notation for Monads）
- [{moduleName}`IO` 单子](Monads/IO.md)（The IO Monad）
- [更多便利特性](Monads/Conveniences.md)（Additional Conveniences）
- [小结](Monads/Summary.md)（Summary）

# 一个 API，多种应用

所有这些特性以及更多，都可以在库代码中作为名为 {moduleName}`Monad` 的通用 API 的实例来实现。
Lean 提供了专用语法，使这个 API 使用起来很方便，但也可能妨碍理解幕后实际发生的事情。
本章从手动嵌套 null 检查的细枝末节讲起，逐步构建到便捷、通用的 API。
在此之前，请暂时放下怀疑。

## 检查 {lit}`none`：不要重复自己

:::paragraph
在 Lean 中，可以用模式匹配来链式检查 null。
获取列表的第一个元素可以直接使用可选索引记法：

```anchor first
def first (xs : List α) : Option α :=
  xs[0]?
```
:::

:::paragraph
结果必须是 {anchorName first}`Option`，因为空列表没有第一个元素。
提取第一个和第三个元素需要检查每一个都不是 {moduleName}`none`：

```anchor firstThird
def firstThird (xs : List α) : Option (α × α) :=
  match xs[0]? with
  | none => none
  | some first =>
    match xs[2]? with
    | none => none
    | some third =>
      some (first, third)
```
类似地，提取第一、第三和第五个元素需要更多检查，确保值不是 {moduleName}`none`：

```anchor firstThirdFifth
def firstThirdFifth (xs : List α) : Option (α × α × α) :=
  match xs[0]? with
  | none => none
  | some first =>
    match xs[2]? with
    | none => none
    | some third =>
      match xs[4]? with
      | none => none
      | some fifth =>
        some (first, third, fifth)
```
再往序列中加入第七个元素就开始变得难以管理了：

```anchor firstThirdFifthSeventh
def firstThirdFifthSeventh (xs : List α) : Option (α × α × α × α) :=
  match xs[0]? with
  | none => none
  | some first =>
    match xs[2]? with
    | none => none
    | some third =>
      match xs[4]? with
      | none => none
      | some fifth =>
        match xs[6]? with
        | none => none
        | some seventh =>
          some (first, third, fifth, seventh)
```
:::

:::paragraph
这段代码的根本问题在于它同时处理两件事：提取数字，以及检查它们是否都存在。
第二个问题通过复制粘贴处理 {moduleName}`none` 情况的代码来解决。
通常，将重复片段提取为辅助函数是良好的风格：

```anchor andThenOption
def andThen (opt : Option α) (next : α → Option β) : Option β :=
  match opt with
  | none => none
  | some x => next x
```
这个辅助函数的使用方式类似于 C# 和 Kotlin 中的 {CSharp}`?.`，负责传播 {moduleName}`none` 值。
它接受两个参数：一个可选值，以及一个当值不是 {moduleName}`none` 时要应用的函数。
如果第一个参数是 {moduleName}`none`，辅助函数就返回 {moduleName}`none`。
如果第一个参数不是 {moduleName}`none`，则函数会应用于 {moduleName}`some` 构造子中的内容。
:::

:::paragraph
现在，{anchorName firstThirdandThen}`firstThird` 可以改写为使用 {anchorName firstThirdandThen}`andThen`，而不是模式匹配：

```anchor firstThirdandThen
def firstThird (xs : List α) : Option (α × α) :=
  andThen xs[0]? fun first =>
  andThen xs[2]? fun third =>
  some (first, third)
```
在 Lean 中，函数作为参数传递时不需要用括号括起来。
以下等价定义使用了更多括号，并对函数体进行了缩进：

```anchor firstThirdandThenExpl
def firstThird (xs : List α) : Option (α × α) :=
  andThen xs[0]? (fun first =>
    andThen xs[2]? (fun third =>
      some (first, third)))
```
{anchorName firstThirdandThenExpl}`andThen` 辅助函数提供了一种值在其中流动的"管道"，而使用有些不寻常缩进的版本更能体现这一点。
改进用于书写 {anchorName firstThirdandThenExpl}`andThen` 的语法，可以使这些计算更容易理解。
:::

### 中缀运算符

在 Lean 中，可以使用 {kw}`infix`、{kw}`infixl` 和 {kw}`infixr` 命令声明中缀运算符，分别创建非结合、左结合和右结合运算符。
当连续多次使用时，**左结合（left associative）**运算符会在表达式的左侧堆叠开括号。
加法运算符 {lit}`+` 是左结合的，所以 {anchorTerm plusFixity}`w + x + y + z` 等价于 {anchorTerm plusFixity}`(((w + x) + y) + z)`。
幂运算符 {lit}`^` 是右结合的，所以 {anchorTerm powFixity}`w ^ x ^ y ^ z` 等价于 {anchorTerm powFixity}`w ^ (x ^ (y ^ z))`。
像 {lit}`<` 这样的比较运算符是非结合的，所以 {lit}`x < y < z` 是语法错误，需要手动加括号。

:::paragraph
以下声明将 {anchorName andThenOptArr}`andThen` 变成中缀运算符：

```anchor andThenOptArr
infixl:55 " ~~> " => andThen
```
冒号后面的数字声明新中缀运算符的**优先级（precedence）**。
在普通数学记法中，{anchorTerm plusTimesPrec}`x + y * z` 等价于 {anchorTerm plusTimesPrec}`x + (y * z)`，尽管 {lit}`+` 和 {lit}`*` 都是左结合的。
在 Lean 中，{lit}`+` 的优先级是 65，{lit}`*` 的优先级是 70。
优先级更高的运算符先于优先级更低的运算符应用。
根据 {lit}`~~>` 的声明，{lit}`+` 和 {lit}`*` 都有更高的优先级，因此会先应用。
通常，为一组运算符找出最方便的优先级需要一些实验和大量示例。
:::

新中缀运算符后面是双箭头 {lit}`=>`，它指定用于该中缀运算符的命名函数。
Lean 标准库利用这一特性将 {lit}`+` 和 {lit}`*` 定义为分别指向 {moduleName}`HAdd.hAdd` 和 {moduleName}`HMul.hMul` 的中缀运算符，从而允许使用类型类重载中缀运算符。
但在这里，{anchorName firstThirdandThen}`andThen` 只是一个普通函数。

:::paragraph
为 {anchorName andThenOptArr}`andThen` 定义了中缀运算符之后，{anchorName firstThirdInfix (show := firstThird)}`firstThirdInfix` 可以改写成一种将 {moduleName}`none` 检查的"管道"感置于中心的形式：

```anchor firstThirdInfix
def firstThirdInfix (xs : List α) : Option (α × α) :=
  xs[0]? ~~> fun first =>
  xs[2]? ~~> fun third =>
  some (first, third)
```
在编写更大的函数时，这种风格要简洁得多：
```anchor firstThirdFifthSeventInfix
def firstThirdFifthSeventh (xs : List α) : Option (α × α × α × α) :=
  xs[0]? ~~> fun first =>
  xs[2]? ~~> fun third =>
  xs[4]? ~~> fun fifth =>
  xs[6]? ~~> fun seventh =>
  some (first, third, fifth, seventh)
```
:::

## 传播错误消息

像 Lean 这样的纯函数式语言没有内置的异常机制来处理错误，因为抛出或捕获异常超出了表达式逐步求值的模型。
然而，函数式程序当然需要处理错误。
对于 {anchorName firstThirdFifthSeventInfix}`firstThirdFifthSeventh`，用户很可能需要知道列表有多长，以及查找在哪里失败。

:::paragraph
这通常通过定义一个可以是错误或结果的数据类型来实现，并将带异常的函数转换为返回该数据类型的函数：

```anchor Except
inductive Except (ε : Type) (α : Type) where
  | error : ε → Except ε α
  | ok : α → Except ε α
deriving BEq, Hashable, Repr
```
类型变量 {anchorName Except}`ε` 表示函数可能产生的错误类型。
调用者需要同时处理错误和成功，这使得类型变量 {anchorName Except}`ε` 扮演的角色有点像 Java 中受检异常列表。
:::

:::paragraph
与 {anchorName first}`Option` 类似，{anchorName Except}`Except` 可以用来表示在列表中查找条目失败。
在这种情况下，错误类型是 {moduleName}`String`：

```anchor getExcept
def get (xs : List α) (i : Nat) : Except String α :=
  match xs[i]? with
  | none => Except.error s!"Index {i} not found (maximum is {xs.length - 1})"
  | some x => Except.ok x
```
查找在边界内的值会产生 {anchorName ExceptExtra}`Except.ok`：
```anchor ediblePlants
def ediblePlants : List String :=
  ["ramsons", "sea plantain", "sea buckthorn", "garden nasturtium"]
```
```anchor success
#eval get ediblePlants 2
```
```anchorInfo success
Except.ok "sea buckthorn"
```
查找越界的值会产生 {anchorName ExceptExtra}`Except.error`：
```anchor failure
#eval get ediblePlants 4
```
```anchorInfo failure
Except.error "Index 4 not found (maximum is 3)"
```
:::

:::paragraph
单次列表查找可以方便地返回值或错误：
```anchor firstExcept
def first (xs : List α) : Except String α :=
  get xs 0
```
然而，执行两次列表查找需要处理可能的失败：
```anchor firstThirdExcept
def firstThird (xs : List α) : Except String (α × α) :=
  match get xs 0 with
  | Except.error msg => Except.error msg
  | Except.ok first =>
    match get xs 2 with
    | Except.error msg => Except.error msg
    | Except.ok third =>
      Except.ok (first, third)
```
再往函数中加入一次列表查找就需要更多的错误处理：
```anchor firstThirdFifthExcept
def firstThirdFifth (xs : List α) : Except String (α × α × α) :=
  match get xs 0 with
  | Except.error msg => Except.error msg
  | Except.ok first =>
    match get xs 2 with
    | Except.error msg => Except.error msg
    | Except.ok third =>
      match get xs 4 with
      | Except.error msg => Except.error msg
      | Except.ok fifth =>
        Except.ok (first, third, fifth)
```
再加一次列表查找就开始变得难以管理了：
```anchor firstThirdFifthSeventhExcept
def firstThirdFifthSeventh (xs : List α) : Except String (α × α × α × α) :=
  match get xs 0 with
  | Except.error msg => Except.error msg
  | Except.ok first =>
    match get xs 2 with
    | Except.error msg => Except.error msg
    | Except.ok third =>
      match get xs 4 with
      | Except.error msg => Except.error msg
      | Except.ok fifth =>
        match get xs 6 with
        | Except.error msg => Except.error msg
        | Except.ok seventh =>
          Except.ok (first, third, fifth, seventh)
```
:::

:::paragraph
再一次，一个通用模式可以被提取为辅助函数。
函数中的每一步都检查是否有错误，只有在结果是成功时才继续其余的计算。
可以为 {anchorName andThenExcept}`Except` 定义一个新版本的 {anchorName andThenExcept}`andThen`：

```anchor andThenExcept
def andThen (attempt : Except e α) (next : α → Except e β) : Except e β :=
  match attempt with
  | Except.error msg => Except.error msg
  | Except.ok x => next x
```
与 {anchorName first}`Option` 一样，这个版本的 {anchorName andThenExcept}`andThen` 允许更简洁地定义 {anchorName firstThirdAndThenExcept}`firstThird'`：

```anchor firstThirdAndThenExcept
def firstThird' (xs : List α) : Except String (α × α) :=
  andThen (get xs 0) fun first  =>
  andThen (get xs 2) fun third =>
  Except.ok (first, third)
```
:::

:::paragraph
在 {anchorName first}`Option` 和 {anchorName andThenExcept}`Except` 两种情况下，都有两个重复的模式：每一步检查中间结果，这已被提取到 {anchorName andThenExcept}`andThen` 中；以及最终的成功结果，分别是 {moduleName}`some` 或 {anchorName andThenExcept}`Except.ok`。
为方便起见，成功可以被提取到名为 {anchorName okExcept}`ok` 的辅助函数中：

```anchor okExcept
def ok (x : α) : Except ε α := Except.ok x
```
类似地，失败可以被提取到名为 {anchorName failExcept}`fail` 的辅助函数中：

```anchor failExcept
def fail (err : ε) : Except ε α := Except.error err
```
使用 {anchorName okExcept}`ok` 和 {anchorName failExcept}`fail` 使 {anchorName getExceptEffects}`get` 更易读一些：

```anchor getExceptEffects
def get (xs : List α) (i : Nat) : Except String α :=
  match xs[i]? with
  | none => fail s!"Index {i} not found (maximum is {xs.length - 1})"
  | some x => ok x
```
:::

:::paragraph
为 {anchorName andThenExceptInfix}`andThen` 添加中缀声明之后，{anchorName firstThirdInfixExcept}`firstThird` 可以像返回 {anchorName first}`Option` 的版本一样简洁：

```anchor andThenExceptInfix
infixl:55 " ~~> " => andThen
```

```anchor firstThirdInfixExcept
def firstThird (xs : List α) : Except String (α × α) :=
  get xs 0 ~~> fun first =>
  get xs 2 ~~> fun third =>
  ok (first, third)
```
这种技术同样可以扩展到更大的函数：

```anchor firstThirdFifthSeventInfixExcept
def firstThirdFifthSeventh (xs : List α) : Except String (α × α × α × α) :=
  get xs 0 ~~> fun first =>
  get xs 2 ~~> fun third =>
  get xs 4 ~~> fun fifth =>
  get xs 6 ~~> fun seventh =>
  ok (first, third, fifth, seventh)
```

:::

## 日志记录

:::paragraph
如果一个数除以 2 没有余数，则它是偶数：
```anchor isEven
def isEven (i : Int) : Bool :=
  i % 2 == 0
```
函数 {anchorName sumAndFindEvensDirect}`sumAndFindEvens` 在计算列表之和的同时，记住沿途遇到的偶数：
```anchor sumAndFindEvensDirect
def sumAndFindEvens : List Int → List Int × Int
  | [] => ([], 0)
  | i :: is =>
    let (moreEven, sum) := sumAndFindEvens is
    (if isEven i then i :: moreEven else moreEven, sum + i)
```
:::

:::paragraph
这个函数是一个常见模式的简化示例。
许多程序需要遍历一次数据结构，同时计算主要结果并累积某种第三方的额外结果。
日志记录就是这样一个例子：作为 {moduleName}`IO` 动作的程序总是可以记录到磁盘文件，但因为磁盘在 Lean 函数的数学世界之外，基于 {moduleName}`IO` 来证明关于日志的性质就困难得多。
另一个例子是：用中序遍历计算树中所有节点之和，同时记录访问过的每个节点：

```anchor inorderSum
def inorderSum : BinTree Int → List Int × Int
  | BinTree.leaf => ([], 0)
  | BinTree.branch l x r =>
    let (leftVisited, leftSum) := inorderSum l
    let (hereVisited, hereSum) := ([x], x)
    let (rightVisited, rightSum) := inorderSum r
    (leftVisited ++ hereVisited ++ rightVisited,
     leftSum + hereSum + rightSum)
```
:::

{anchorName sumAndFindEvensDirect}`sumAndFindEvens` 和 {anchorName inorderSum}`inorderSum` 都有共同的重复结构。
计算的每一步都返回一个对，其中包含已保存的数据列表和主要结果。
然后列表被拼接，主要结果被计算出来并与拼接后的列表配对。
通过对 {anchorName sumAndFindEvensDirectish}`sumAndFindEvens` 做小幅改写，更清晰地分离保存偶数和计算求和这两个关注点，共同结构变得更加明显：

```anchor sumAndFindEvensDirectish
def sumAndFindEvens : List Int → List Int × Int
  | [] => ([], 0)
  | i :: is =>
    let (moreEven, sum) := sumAndFindEvens is
    let (evenHere, ()) := (if isEven i then [i] else [], ())
    (evenHere ++ moreEven, sum + i)
```

为清晰起见，由累积结果和值组成的对可以有自己的名字：

```anchor WithLog
structure WithLog (logged : Type) (α : Type) where
  log : List logged
  val : α
```
类似地，在保存累积结果列表的同时将值传递给计算下一步的过程，可以再次提取到名为 {anchorName andThenWithLog}`andThen` 的辅助函数中：

```anchor andThenWithLog
def andThen (result : WithLog α β) (next : β → WithLog α γ) : WithLog α γ :=
  let {log := thisOut, val := thisRes} := result
  let {log := nextOut, val := nextRes} := next thisRes
  {log := thisOut ++ nextOut, val := nextRes}
```
在错误的情况下，{anchorName okWithLog}`ok` 表示一个总是成功的操作。
但在这里，它是一个简单地返回值而不记录任何内容的操作：

```anchor okWithLog
def ok (x : β) : WithLog α β := {log := [], val := x}
```
正如 {anchorName Except}`Except` 提供 {anchorName failExcept}`fail` 一样，{anchorName WithLog}`WithLog` 应该允许向日志添加条目。
这没有有趣的返回值，因此它返回 {anchorName save}`Unit`：

```anchor save
def save (data : α) : WithLog α Unit :=
  {log := [data], val := ()}
```

{anchorName WithLog}`WithLog`、{anchorName andThenWithLog}`andThen`、{anchorName okWithLog}`ok` 和 {anchorName save}`save` 可以用来将日志记录的关切与求和的关切分离开来，适用于两个程序：

```anchor sumAndFindEvensAndThen
def sumAndFindEvens : List Int → WithLog Int Int
  | [] => ok 0
  | i :: is =>
    andThen (if isEven i then save i else ok ()) fun () =>
    andThen (sumAndFindEvens is) fun sum =>
    ok (i + sum)
```

```anchor inorderSumAndThen
def inorderSum : BinTree Int → WithLog Int Int
  | BinTree.leaf => ok 0
  | BinTree.branch l x r =>
    andThen (inorderSum l) fun leftSum =>
    andThen (save x) fun () =>
    andThen (inorderSum r) fun rightSum =>
    ok (leftSum + x + rightSum)
```
再一次，中缀运算符有助于将注意力集中在正确的步骤上：

```anchor infixAndThenLog
infixl:55 " ~~> " => andThen
```

```anchor withInfixLogging
def sumAndFindEvens : List Int → WithLog Int Int
  | [] => ok 0
  | i :: is =>
    (if isEven i then save i else ok ()) ~~> fun () =>
    sumAndFindEvens is ~~> fun sum =>
    ok (i + sum)

def inorderSum : BinTree Int → WithLog Int Int
  | BinTree.leaf => ok 0
  | BinTree.branch l x r =>
    inorderSum l ~~> fun leftSum =>
    save x ~~> fun () =>
    inorderSum r ~~> fun rightSum =>
    ok (leftSum + x + rightSum)
```

## 为树节点编号

树的**中序编号（inorder numbering）**将树中的每个数据点与在中序遍历中访问它的步骤关联起来。
例如，考虑 {anchorName aTree}`aTree`：

```anchor aTree
open BinTree in
def aTree :=
  branch
    (branch
       (branch leaf "a" (branch leaf "b" leaf))
       "c"
       leaf)
    "d"
    (branch leaf "e" leaf)
```
它的中序编号是：
```anchorInfo numberATree
BinTree.branch
  (BinTree.branch
    (BinTree.branch (BinTree.leaf) (0, "a") (BinTree.branch (BinTree.leaf) (1, "b") (BinTree.leaf)))
    (2, "c")
    (BinTree.leaf))
  (3, "d")
  (BinTree.branch (BinTree.leaf) (4, "e") (BinTree.leaf))
```

:::paragraph
树最适合用递归函数处理，但树递归的通常模式使得计算中序编号变得困难。
这是因为左子树中分配的最高编号用于确定节点数据值的编号，然后又用于确定右子树编号的起点。
在命令式语言中，可以通过使用可变变量来解决这个问题。
以下 Python 程序使用可变变量计算中序编号：
```includePython "../examples/inorder_python/inordernumbering.py" (anchor := code)
class Branch:
    def __init__(self, value, left=None, right=None):
        self.left = left
        self.value = value
        self.right = right
    def __repr__(self):
        return f'Branch({self.value!r}, left={self.left!r}, right={self.right!r})'

def number(tree):
    num = 0
    def helper(t):
        nonlocal num
        if t is None:
            return None
        else:
            new_left = helper(t.left)
            new_value = (num, t.value)
            num += 1
            new_right = helper(t.right)
            return Branch(left=new_left, value=new_value, right=new_right)

    return helper(tree)
```
{anchorName aTree}`aTree` 的 Python 等价物的编号是：
```includePython "../examples/inorder_python/inordernumbering.py" (anchor := a_tree)
a_tree = Branch("d",
                left=Branch("c",
                            left=Branch("a", left=None, right=Branch("b")),
                            right=None),
                right=Branch("e"))
```
其编号结果为：
```command inorderpy "inorder_python" (prompt := ">>> ") (show := "number(a_tree)")
python3 inordernumbering.py
```
```commandOut inorderpy "python3 inordernumbering.py"
Branch((3, 'd'), left=Branch((2, 'c'), left=Branch((0, 'a'), left=None, right=Branch((1, 'b'), left=None, right=None)), right=None), right=Branch((4, 'e'), left=None, right=None))
```
:::


尽管 Lean 没有可变变量，但存在变通方法。
从外部世界的角度看，可变变量可以被视为有两个相关方面：函数被调用时的值，以及函数返回时的值。
换句话说，使用可变变量的函数可以看作是一个接受可变变量起始值作为参数的函数，返回该变量的最终值与函数结果的配对。
这个最终值可以作为参数传递给下一步。

:::paragraph
正如 Python 示例使用外层函数建立可变变量、内层辅助函数修改变量一样，Lean 版本的函数使用外层函数提供变量的起始值，并显式返回函数结果，内层辅助函数则在计算编号树的过程中传递变量的值：

```anchor numberDirect
def number (t : BinTree α) : BinTree (Nat × α) :=
  let rec helper (n : Nat) : BinTree α → (Nat × BinTree (Nat × α))
    | BinTree.leaf => (n, BinTree.leaf)
    | BinTree.branch left x right =>
      let (k, numberedLeft) := helper n left
      let (i, numberedRight) := helper (k + 1) right
      (i, BinTree.branch numberedLeft (k, x) numberedRight)
  (helper 0 t).snd
```
这段代码，与传播 {moduleName}`none` 的 {anchorName first}`Option` 代码、传播 {anchorName exceptNames (show := error)}`Except.error` 的 {anchorName exceptNames}`Except` 代码以及累积日志的 {moduleName}`WithLog` 代码一样，混合了两个关切：传播计数器的值，以及实际遍历树以找到结果。
与那些情况一样，可以定义 {anchorName andThenState}`andThen` 辅助函数，将状态从计算的一步传播到下一步。
第一步是为"接受输入状态作为参数并返回输出状态与值的配对"这一模式命名：

```anchor State
def State (σ : Type) (α : Type) : Type :=
  σ → (σ × α)
```
:::

:::paragraph
对于 {anchorName State}`State`，{anchorName okState}`ok` 是一个返回输入状态不变、同时返回所提供值的函数：
```anchor okState
def ok (x : α) : State σ α :=
  fun s => (s, x)
```
:::

:::paragraph
使用可变变量时，有两个基本操作：读取值和替换为新值。
读取当前值通过一个函数完成，该函数将输入状态原封不动地放入输出状态，同时也将其放入值字段：
```anchor get
def get : State σ σ :=
  fun s => (s, s)
```
写入新值包括忽略输入状态，并将提供的新值放入输出状态：
```anchor set
def set (s : σ) : State σ Unit :=
  fun _ => (s, ())
```
:::

:::paragraph
最后，两个使用状态的计算可以通过找到第一个函数的输出状态和返回值，然后将它们都传递给下一个函数来串联：

```anchor andThenState
def andThen (first : State σ α) (next : α → State σ β) : State σ β :=
  fun s =>
    let (s', x) := first s
    next x s'

infixl:55 " ~~> " => andThen
```
:::

:::paragraph
使用 {anchorName State}`State` 及其辅助函数，可以模拟局部可变状态：

```anchor numberMonadicish
def number (t : BinTree α) : BinTree (Nat × α) :=
  let rec helper : BinTree α → State Nat (BinTree (Nat × α))
    | BinTree.leaf => ok BinTree.leaf
    | BinTree.branch left x right =>
      helper left ~~> fun numberedLeft =>
      get ~~> fun n =>
      set (n + 1) ~~> fun () =>
      helper right ~~> fun numberedRight =>
      ok (BinTree.branch numberedLeft (n, x) numberedRight)
  (helper t 0).snd
```
因为 {anchorName State}`State` 只模拟单个局部变量，{anchorName get}`get` 和 {anchorName set}`set` 不需要引用任何特定的变量名。
:::

## 单子：一种函数式设计模式

这些例子中的每一个都包含：
 * 一个多态类型，如 {anchorName first}`Option`、{anchorTerm okExcept}`Except ε`、{anchorTerm save}`WithLog α` 或 {anchorTerm andThenState}`State σ`
 * 一个 {lit}`andThen` 运算符，负责处理串联具有该类型的程序时某些重复性的方面
 * 一个 {lit}`ok` 运算符，它是（在某种意义上）使用该类型最无聊的方式
 * 一组其他操作，如 {moduleName}`none`、{anchorName failExcept}`fail`、{anchorName save}`save` 和 {anchorName get}`get`，它们命名了使用该类型的各种方式

这种 API 风格称为**单子（monad）**。
虽然单子的思想源自数学的一个分支——范畴论（category theory），但使用它们进行编程并不需要理解范畴论。
单子的关键思想是：每个单子使用纯函数式语言 Lean 提供的工具，将某种特定的副作用编码进去。
例如，{anchorName first}`Option` 表示可能通过返回 {moduleName}`none` 而失败的程序，{moduleName}`Except` 表示可能抛出异常的程序，{moduleName}`WithLog` 表示在运行过程中累积日志的程序，{anchorName State}`State` 表示具有单个可变变量的程序。