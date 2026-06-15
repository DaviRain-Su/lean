# 额外的便利特性

Lean 提供了许多便利特性，可以让程序更加简洁。

# 自动隐式参数

在 Lean 中编写多态函数时，通常不必列出所有隐式参数，只要直接提及它们即可。如果 Lean 能够确定其类型，它们就会被自动插入为隐式参数。换言之，先前 {anchorName lengthImp}`length` 的定义：

```anchor lengthImp
def length {α : Type} (xs : List α) : Nat :=
  match xs with
  | [] => 0
  | y :: ys => Nat.succ (length ys)
```

可以不写 {anchorTerm lengthImp}`{α : Type}`：

```anchor lengthImpAuto
def length (xs : List α) : Nat :=
  match xs with
  | [] => 0
  | y :: ys => Nat.succ (length ys)
```

这能极大简化带有大量隐式参数的高度多态定义。

# 模式匹配定义

使用 {kw}`def` 定义函数时，很常见的情形是先给参数命名，然后立刻用 {kw}`match` 对其进行模式匹配。例如，在 {anchorName lengthImpAuto}`length` 中，参数 {anchorName lengthImpAuto}`xs` 只在 {kw}`match` 中使用。在这种情况下，可以直接写出 {kw}`match` 表达式的各个分支，而根本不需要命名参数。

第一步是将参数类型移到冒号右侧，这样返回类型本身就是一个函数类型。例如，{anchorName lengthMatchDef}`length` 的类型是 {anchorTerm lengthMatchDef}`List α → Nat`。然后，用各个模式匹配分支替换 {lit}`:=`：

```anchor lengthMatchDef
def length : List α → Nat
  | [] => 0
  | y :: ys => Nat.succ (length ys)
```

这种语法也可用于定义接受多个参数的函数。此时，各模式之间用逗号分隔。例如，{anchorName drop}`drop` 接受一个数 $`n` 和一个列表，并返回去掉前 $`n` 个元素后的列表。

```anchor drop
def drop : Nat → List α → List α
  | Nat.zero, xs => xs
  | _, [] => []
  | Nat.succ n, x :: xs => drop n xs
```

命名参数和模式也可以在同一个定义中混用。例如，一个接受默认值和可选值的函数，当可选值为 {anchorName fromOption}`none` 时返回默认值，可以写成：

```anchor fromOption
def fromOption (default : α) : Option α → α
  | none => default
  | some x => x
```

这个函数在标准库中叫做 {anchorTerm fragments}`Option.getD`，并且可以用点号记法调用：

```anchor getD
#eval (some "salmonberry").getD ""
```

```anchorInfo getD
"salmonberry"
```

```anchor getDNone
#eval none.getD ""
```

```anchorInfo getDNone
""
```

# 局部定义

在计算中为中间步骤命名通常很有用。很多时候，中间值本身就代表一个有用的概念，显式命名它们能让程序更易读。还有些情况下，某个中间值会被使用多次。与大多数语言一样，在 Lean 中把同一段代码写两遍会导致它被计算两次，而将结果保存在变量中则会让计算结果得以保存并复用。

例如，{anchorName unzipBad}`unzip` 是一个将二元组列表转换为两个列表之配对的函数。当二元组列表为空时，{anchorName unzipBad}`unzip` 的结果是一对空列表；当列表头部有一个二元组时，就把该二元组的两个字段分别加到剩余列表解压结果中。下面这个 {anchorName unzipBad}`unzip` 的定义完全符合上述描述：

```anchor unzipBad
def unzip : List (α × β) → List α × List β
  | [] => ([], [])
  | (x, y) :: xys =>
    (x :: (unzip xys).fst, y :: (unzip xys).snd)
```

不幸的是，这里有个问题：这段代码比实际需要的更慢。列表中的每个元素都会导致两次递归调用，使得该函数呈指数时间复杂度。然而，两次递归调用的结果完全相同，所以根本没有必要调用两次。

在 Lean 中，可以使用 {kw}`let` 为递归调用的结果命名并保存下来。使用 {kw}`let` 的局部定义与使用 {kw}`def` 的顶层定义类似：它有一个待局部定义的名称，可以有参数、类型签名，以及跟在 {lit}`:=` 后面的主体。局部定义之后，可以使用该局部定义的表达式（称为 {kw}`let` 表达式的 _主体_）必须另起一行，且起始列要小于或等于 {kw}`let` 关键字的起始列。在 {anchorName unzip}`unzip` 中使用 {kw}`let` 的局部定义看起来像这样：

```anchor unzip
def unzip : List (α × β) → List α × List β
  | [] => ([], [])
  | (x, y) :: xys =>
    let unzipped : List α × List β := unzip xys
    (x :: unzipped.fst, y :: unzipped.snd)
```

若想在单行内使用 {kw}`let`，可以用分号把局部定义和主体分开。

当某个单一模式足以匹配一个数据类型的所有情况时，使用 {kw}`let` 的局部定义也可以使用模式匹配。就 {anchorName unzip}`unzip` 而言，递归调用的结果是一个配对。由于配对只有一个构造子，因此可以把名称 {anchorName unzip}`unzipped` 替换为配对模式：

```anchor unzipPat
def unzip : List (α × β) → List α × List β
  | [] => ([], [])
  | (x, y) :: xys =>
    let (xs, ys) : List α × List β := unzip xys
    (x :: xs, y :: ys)
```

与手动编写访问器调用相比，恰当地在 {kw}`let` 中使用模式可以让代码更易读。

{kw}`let` 和 {kw}`def` 最大的区别在于，递归的 {kw}`let` 定义必须通过 {kw}`let rec` 显式标明。例如，反转列表的一种方法是使用递归的辅助函数，如下定义所示：

```anchor reverse
def reverse (xs : List α) : List α :=
  let rec helper : List α → List α → List α
    | [], soFar => soFar
    | y :: ys, soFar => helper ys (y :: soFar)
  helper xs []
```

这个辅助函数沿着输入列表向下遍历，每次把一个元素移到 {anchorName reverse}`soFar` 中。当到达输入列表末尾时，{anchorName reverse}`soFar` 中就包含了输入列表的反转结果。

# 类型推断

在许多情况下，Lean 可以自动确定表达式的类型。此时，无论是顶层定义（使用 {kw}`def`）还是局部定义（使用 {kw}`let`），都可以省略显式类型。例如，对 {anchorName unzipNT}`unzip` 的递归调用就不需要类型标注：

```anchor unzipNT
def unzip : List (α × β) → List α × List β
  | [] => ([], [])
  | (x, y) :: xys =>
    let unzipped := unzip xys
    (x :: unzipped.fst, y :: unzipped.snd)
```

作为经验法则，省略字面量（如字符串和数字）的类型通常没有问题，不过 Lean 为数字字面量选择的类型可能比预期更具体。对于函数应用，Lean 通常能够确定类型，因为它已经知道参数类型和返回类型。在函数定义中省略返回类型通常可行，但函数参数通常需要类型标注。不是函数的定义，例如示例中的 {anchorName unzipNT}`unzipped`，如果其主体不需要类型标注，那么它本身也不需要；而这个定义的主体正是一个函数应用。

当使用显式 {kw}`match` 表达式时，也可以省略 {anchorName unzipNRT}`unzip` 的返回类型：

```anchor unzipNRT
def unzip (pairs : List (α × β)) :=
  match pairs with
  | [] => ([], [])
  | (x, y) :: xys =>
    let unzipped := unzip xys
    (x :: unzipped.fst, y :: unzipped.snd)
```

一般而言，类型标注宁可多写也不要少写。首先，显式类型向读者传达了代码的假设。即使 Lean 能自己推断出类型，不必反复查询类型信息也让代码更易读。其次，显式类型有助于定位错误。程序对类型越明确，错误信息就越有参考价值。这对于像 Lean 这样类型系统非常表达力强的语言尤为重要。第三，显式类型能让编写程序本身更容易。类型就是一种规约，而编译器的反馈有助于写出满足规约的程序。最后，Lean 的类型推断是一个尽力而为的系统。由于 Lean 的类型系统过于表达力强，对于所有表达式而言并不存在“最佳”或最一般的类型。这意味着，即便你得到了一个类型，也不能保证它就是对某个具体应用的 _正确_ 类型。例如，{anchorTerm fourteenNat}`14` 既可以是 {anchorName length1}`Nat`，也可以是 {anchorName fourteenInt}`Int`：

```anchor fourteenNat
#check 14
```

```anchorInfo fourteenNat
14 : Nat
```

```anchor fourteenInt
#check (14 : Int)
```

```anchorInfo fourteenInt
14 : Int
```

缺少类型标注可能导致令人困惑的错误信息。如果把 {anchorName unzipNoTypesAtAll}`unzip` 定义中的所有类型都省略：

```anchor unzipNoTypesAtAll
def unzip pairs :=
  match pairs with
  | [] => ([], [])
  | (x, y) :: xys =>
    let unzipped := unzip xys
    (x :: unzipped.fst, y :: unzipped.snd)
```

就会收到关于 {kw}`match` 表达式的报错：

```anchorError unzipNoTypesAtAll
Invalid match expression: This pattern contains metavariables:
  []
```

这是因为 {kw}`match` 需要知道被检查值的类型，但该类型并不可用。“metavariable”（元变量）是程序中未知的部分，在错误信息中写作 {lit}`?m.XYZ`——它们在 {ref "polymorphism"}[section on Polymorphism] 中介绍。在这个程序中，参数上的类型标注是必需的。

即使是非常简单的程序有时也需要类型标注。例如，恒等函数只是原样返回传入的参数。带上参数类型和返回类型标注时，它看起来像这样：

```anchor idA
def id (x : α) : α := x
```

Lean 可以自己推断出返回类型：

```anchor idB
def id (x : α) := x
```

然而，省略参数类型会导致错误：

```anchor identNoTypes
def id x := x
```

```anchorError identNoTypes
Failed to infer type of binder `x`
```

一般来说，出现“failed to infer”或提到 metavariable 的信息，通常意味着需要更多的类型标注。尤其是在初学 Lean 时，显式给出大多数类型是很有帮助的。

# 同时匹配

模式匹配表达式和模式匹配定义一样，可以同时匹配多个值。待检查的表达式以及与之匹配的模式之间都用逗号分隔，类似于定义中的语法。下面是使用同时匹配的 {anchorName dropMatch}`drop` 版本：

```anchor dropMatch
def drop (n : Nat) (xs : List α) : List α :=
  match n, xs with
  | Nat.zero, ys => ys
  | _, [] => []
  | Nat.succ n , y :: ys => drop n ys
```

同时匹配看起来像是匹配一个配对，但二者有重要区别。Lean 会跟踪被匹配表达式与模式之间的联系，这些信息被用于检查终止性、传播静态类型信息等目的。因此，对配对进行匹配的 {anchorName sameLengthPair}`sameLength` 版本会被终止性检查器拒绝，因为 {anchorName sameLengthPair}`xs` 与 {anchorTerm sameLengthPair}`x :: xs'` 之间的联系被中间的配对掩盖了：

```anchor sameLengthPair
def sameLength (xs : List α) (ys : List β) : Bool :=
  match (xs, ys) with
  | ([], []) => true
  | (x :: xs', y :: ys') => sameLength xs' ys'
  | _ => false
```

```anchorError sameLengthPair
fail to show termination for
  sameLength
with errors
failed to infer structural recursion:
Not considering parameter α of sameLength:
  it is unchanged in the recursive calls
Not considering parameter β of sameLength:
  it is unchanged in the recursive calls
Cannot use parameter xs:
  failed to eliminate recursive application
    sameLength xs' ys'
Cannot use parameter ys:
  failed to eliminate recursive application
    sameLength xs' ys'


Could not find a decreasing measure.
The basic measures relate at each recursive call as follows:
(<, ≤, =: relation proved, ? all proofs failed, _: no proof attempted)
              xs ys
1) 1748:28-46  ?  ?
Please use `termination_by` to specify a decreasing measure.
```

同时对两个列表进行匹配则可以被接受：

```anchor sameLengthOk2
def sameLength (xs : List α) (ys : List β) : Bool :=
  match xs, ys with
  | [], [] => true
  | x :: xs', y :: ys' => sameLength xs' ys'
  | _, _ => false
```

# 自然数模式

在 {ref "datatypes-and-patterns"}[datatypes and patterns] 一节中，{anchorName even}`even` 是这样定义的：

```anchor even
def even (n : Nat) : Bool :=
  match n with
  | Nat.zero => true
  | Nat.succ k => not (even k)
```

正如列表模式有专门的语法，使其比直接使用 {anchorName length1}`List.cons` 和 {anchorName length1}`List.nil` 更易读一样，自然数也可以用字面量数字和 {anchorTerm evenFancy}`+` 进行匹配。例如，{anchorName evenFancy}`even` 也可以这样定义：

```anchor evenFancy
def even : Nat → Bool
  | 0 => true
  | n + 1 => not (even n)
```

在这种记法中，{anchorTerm evenFancy}`+` 模式两侧的参数扮演不同的角色。在背后，左侧参数（如上例中的 {anchorName evenFancy}`n`）会变成若干 {anchorName even}`Nat.succ` 模式的参数，而右侧参数（如上例中的 {anchorTerm evenFancy}`1`）决定围绕该模式包裹多少个 {anchorName even}`Nat.succ`。在 {anchorName explicitHalve}`halve` 中，显式模式将一个 {anchorName explicitHalve}`Nat` 除以二并丢弃余数：

```anchor explicitHalve
def halve : Nat → Nat
  | Nat.zero => 0
  | Nat.succ Nat.zero => 0
  | Nat.succ (Nat.succ n) => halve n + 1
```

可以用数字字面量和 {anchorTerm halve}`+` 替换：

```anchor halve
def halve : Nat → Nat
  | 0 => 0
  | 1 => 0
  | n + 2 => halve n + 1
```

在幕后，这两个定义完全等价。注意：{anchorTerm halve}`halve n + 1` 等价于 {anchorTerm halveParens}`(halve n) + 1`，而不是 {anchorTerm halveParens}`halve (n + 1)`。

使用这种语法时，{anchorTerm halveFlippedPat}`+` 的第二个参数应始终是一个字面量 {anchorName halveFlippedPat}`Nat`。尽管加法满足交换律，但在模式中颠倒参数顺序可能导致如下错误：

```anchor halveFlippedPat
def halve : Nat → Nat
  | 0 => 0
  | 1 => 0
  | 2 + n => halve n + 1
```

```anchorError halveFlippedPat
Invalid pattern(s): `n` is an explicit pattern variable, but it only occurs in positions that are inaccessible to pattern matching:
  .(Nat.add 2 n)
```

这一限制使 Lean 能够将模式中所有使用 {anchorTerm halveFlippedPat}`+` 记法的地方都转换成底层 {anchorName even}`Nat.succ` 的使用，从而在幕后保持语言更简单。

# 匿名函数

在 Lean 中，函数不必定义在顶层。作为表达式，函数使用 {kw}`fun` 语法生成。函数表达式以关键字 {kw}`fun` 开头，后跟一个或多个参数，参数与返回表达式之间用 {lit}`=>` 分隔。例如，一个将数加一的函数可以写成：

```anchor incr
#check fun x => x + 1
```

```anchorInfo incr
fun x => x + 1 : Nat → Nat
```

类型标注的写法与 {kw}`def` 相同，使用圆括号和冒号：

```anchor incrInt
#check fun (x : Int) => x + 1
```

```anchorInfo incrInt
fun x => x + 1 : Int → Int
```

类似地，隐式参数可以用花括号书写：

```anchor identLambda
#check fun {α : Type} (x : α) => x
```

```anchorInfo identLambda
fun {α} x => x : {α : Type} → α → α
```

这种匿名函数表达式通常被称为 _lambda 表达式_，因为在描述编程语言的数学记号中，通常使用希腊字母 λ（lambda），而 Lean 中对应的关键字是 {kw}`fun`。尽管 Lean 允许用 {kw}`λ` 代替 {kw}`fun`，但最常见的是写 {kw}`fun`。

匿名函数也支持 {kw}`def` 中使用的多模式风格。例如，一个在有前驱时返回自然数前驱的函数可以写成：

```anchor predHuh
#check fun
  | 0 => none
  | n + 1 => some n
```

```anchorInfo predHuh
fun x =>
  match x with
  | 0 => none
  | n.succ => some n : Nat → Option Nat
```

注意，Lean 自己对这段函数的描述使用了一个命名参数和一个 {kw}`match` 表达式。Lean 的许多便捷语法糖都会在幕后展开为更简单的语法，因此这种抽象有时会泄漏。

使用 {kw}`def` 并带有参数的定义可以改写为函数表达式。例如，一个将参数翻倍的函数可以写成：

```anchor doubleLambda
def double : Nat → Nat := fun
  | 0 => 0
  | k + 1 => double k + 2
```

当匿名函数非常简单时，例如 {anchorEvalStep incrSteps 0}`fun x => x + 1`，创建函数的语法可能显得相当冗长。在这个具体例子中，引入函数用了六个非空白字符，而函数体只有三个非空白字符。对于这些简单情况，Lean 提供了一种简写。在被圆括号包围的表达式中，居中的点字符 {anchorTerm incrSteps}`·` 可以代表一个参数，括号内的表达式就成为函数体。这个函数也可以写成 {anchorEvalStep incrSteps 1}`(· + 1)`。

居中点总是基于 _最近_ 的一层圆括号生成函数。例如，{anchorEvalStep funPair 0}`(· + 5, 3)` 是一个返回数字配对的函数，而 {anchorEvalStep pairFun 0}`((· + 5), 3)` 则是一个函数与数字组成的配对。如果使用多个点，它们会按从左到右的顺序成为参数：

```anchorEvalSteps twoDots
(· , ·) 1 2
===>
(1, ·) 2
===>
(1, 2)
```

匿名函数可以像使用 {kw}`def` 或 {kw}`let` 定义的函数一样被应用。命令 {anchor applyLambda}`#eval (fun x => x + x) 5` 的结果是：

```anchorInfo applyLambda
10
```

而 {anchor applyCdot}`#eval (· * 2) 5` 的结果是：

```anchorInfo applyCdot
10
```

# 命名空间

Lean 中的每个名字都位于一个 _命名空间_ 中，命名空间就是名字的集合。名字通过 {lit}`.` 放入命名空间，因此 {anchorName fragments}`List.map` 就是 {lit}`List` 命名空间中的名字 {anchorName fragments}`map`。不同命名空间中的名字互不冲突，即使它们在其它方面完全相同。这意味着 {anchorName fragments}`List.map` 和 {anchorName fragments}`Array.map` 是不同的名字。命名空间可以嵌套，因此 {lit}`Project.Frontend.User.loginTime` 就是嵌套命名空间 {lit}`Project.Frontend.User` 中的名字 {lit}`loginTime`。

名字可以直接在某个命名空间内定义。例如，名字 {anchorName fragments}`double` 可以在 {anchorName even}`Nat` 命名空间中定义：

```anchor NatDouble
def Nat.double (x : Nat) : Nat := x + x
```

由于 {anchorName even}`Nat` 同时也是一个类型名，因此可以用点号记法在类型为 {anchorName even}`Nat` 的表达式上调用 {anchorName fragments}`Nat.double`：

```anchor NatDoubleFour
#eval (4 : Nat).double
```

```anchorInfo NatDoubleFour
8
```

除了直接在命名空间中定义名字外，还可以使用 {kw}`namespace` 和 {kw}`end` 命令将一系列声明放入某个命名空间。例如，下面在 {lit}`NewNamespace` 命名空间中定义了 {anchorName NewNamespace}`triple` 和 {anchorName NewNamespace}`quadruple`：

```anchor NewNamespace
namespace NewNamespace
def triple (x : Nat) : Nat := 3 * x
def quadruple (x : Nat) : Nat := 2 * x + 2 * x
end NewNamespace
```

要引用它们，需要在名字前加上前缀 {lit}`NewNamespace.`：

```anchor tripleNamespace
#check NewNamespace.triple
```

```anchorInfo tripleNamespace
NewNamespace.triple (x : Nat) : Nat
```

```anchor quadrupleNamespace
#check NewNamespace.quadruple
```

```anchorInfo quadrupleNamespace
NewNamespace.quadruple (x : Nat) : Nat
```

命名空间可以被 _打开_，从而允许使用其中的名字而无需显式限定。在一个表达式前写上 {kw}`open` {lit}`MyNamespace `{kw}`in`，会使 {lit}`MyNamespace` 中的内容在该表达式中可用。例如，{anchorName quadrupleOpenDef}`timesTwelve` 在打开 {anchorTerm NewNamespace}`NewNamespace` 后使用了 {anchorName quadrupleOpenDef}`quadruple` 和 {anchorName quadrupleOpenDef}`triple`：

```anchor quadrupleOpenDef
def timesTwelve (x : Nat) :=
  open NewNamespace in
  quadruple (triple x)
```

命名空间也可以在某个命令之前打开。这样，命令的所有部分都可以引用该命名空间中的内容，而不仅仅是单个表达式。要做到这一点，把 {kw}`open`{lit}` ... `{kw}`in` 放在命令之前。

```anchor quadrupleNamespaceOpen
open NewNamespace in
#check quadruple
```

```anchorInfo quadrupleNamespaceOpen
NewNamespace.quadruple (x : Nat) : Nat
```

函数签名会显示名字的完整命名空间。此外，命名空间也可以为文件后续 _所有_ 命令打开。要做到这一点，只需在顶层使用 {kw}`open` 时省略 {kw}`in`。

# {lit}`if let` 表达式

当消费具有和类型的值时，通常只关心其中一个构造子。例如，给定下面这个表示 Markdown 行内元素子集的类型：

```anchor Inline
inductive Inline : Type where
  | lineBreak
  | string : String → Inline
  | emph : Inline → Inline
  | strong : Inline → Inline
```

可以编写一个识别字符串元素并提取其内容的函数：

```anchor inlineStringHuhMatch
def Inline.string? (inline : Inline) : Option String :=
  match inline with
  | Inline.string s => some s
  | _ => none
```

编写这个函数体的另一种方式是结合使用 {kw}`if` 和 {kw}`let`：

```anchor inlineStringHuh
def Inline.string? (inline : Inline) : Option String :=
  if let Inline.string s := inline then
    some s
  else none
```

这非常类似于带有模式匹配的 {kw}`let` 语法。区别在于它可以用于和类型，因为 {kw}`else` 分支提供了回退。在某些情境下，使用 {kw}`if let` 而非 {kw}`match` 能让代码更易读。

# 位置结构参数

{ref "structures"}[section on structures] 介绍了两种构造结构体的方式：1. 直接调用构造子，如 {anchorTerm pointCtor}`Point.mk 1 2`；2. 使用花括号记法，如 {anchorTerm pointBraces}`{ x := 1, y := 2 }`。

在某些情境下，按位置而非按名称传递参数会很方便，但又不想直接写出构造子名称。例如，定义多种相似的结构体类型有助于区分领域概念，但阅读代码时自然会把它们都视为元组。在这些情境下，参数可以用尖括号 {lit}`⟨` 和 {lit}`⟩` 括起来。一个 {anchorName pointBraces}`Point` 可以写成 {anchorTerm pointPos}`⟨1, 2⟩`。注意！尽管它们看起来像小于号 {lit}`<` 和大于号 {lit}`>`，但这两个括号是不同的。它们可以分别用 {lit}`\<` 和 {lit}`\>` 输入。

与按名称构造结构体的花括号记法一样，这种位置语法也只能在 Lean 能够确定结构体类型的上下文中使用，无论是通过类型标注还是程序中的其它类型信息。例如，{anchorTerm pointPosEvalNoType}`#eval ⟨1, 2⟩` 会产生如下错误：

```anchorError pointPosEvalNoType
Invalid `⟨...⟩` notation: The expected type of this term could not be determined
```

这个错误出现的原因是没有可用的类型信息。添加类型标注，如 {anchorTerm pointPosWithType}`#eval (⟨1, 2⟩ : Point)`，即可解决问题：

```anchorInfo pointPosWithType
{ x := 1.000000, y := 2.000000 }
```

# 字符串插值

在 Lean 中，在字符串前加上 {kw}`s!` 会触发 _插值_：字符串内部花括号中的表达式会被替换为它们的值。这与 Python 中的 {python}`f`-字符串以及 C# 中以 {CSharp}`$` 为前缀的字符串类似。例如，

```anchor interpolation
#eval s!"three fives is {NewNamespace.triple 5}"
```

产生如下输出

```anchorInfo interpolation
"three fives is 15"
```

并非所有表达式都可以被插值到字符串中。例如，尝试插值一个函数会导致错误。

```anchor interpolationOops
#check s!"three fives is {NewNamespace.triple}"
```

产生的错误是

```anchorError interpolationOops
failed to synthesize
  ToString (Nat → Nat)

Hint: Additional diagnostic information may be available using the `set_option diagnostics true` command.
```

这是因为没有将函数转换为字符串的标准方法。正如编译器维护着一张描述如何显示各种类型表达式求值结果的表，它也维护着一张描述如何将各种类型的值转换为字符串的表。信息 {lit}`failed to synthesize instance` 表示 Lean 编译器在这张表中没有找到给定类型对应的条目。{ref "type-classes"}[type classes] 一章会更详细地介绍这一机制，包括如何向表中添加新条目。
