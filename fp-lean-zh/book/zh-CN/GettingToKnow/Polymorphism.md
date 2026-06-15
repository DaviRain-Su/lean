# 多态性

和大多数语言一样，Lean 中的类型也可以接受参数。
例如，类型 `{anchorTerm fragments}List Nat` 描述自然数列表，`{anchorTerm fragments}List String` 描述字符串列表，`{anchorTerm fragments}List (List Point)` 描述点列表的列表。
这和 C# 或 Java 中的 `{CSharp}List<Nat>`、`{CSharp}List<String>`、`{CSharp}List<List<Point>>` 非常相似。
正如 Lean 用空格把参数传给函数，它也用空格把参数传给类型。

在函数式编程中，术语**多态性**（polymorphism）通常指接受类型作为参数的数据类型和定义。
这与面向对象编程社区中的用法不同，在那里该术语通常指可以覆盖父类某些行为的子类。
在本书中，“多态性”总是指第一种含义。
这些类型参数可以在数据类型或定义中使用，因此用其他类型替换参数名后，同一个数据类型或定义可以用于任何结果类型。

`{anchorName Point}Point` 结构体要求 `{anchorName Point}x` 和 `{anchorName Point}y` 两个字段都是 `{anchorName Point}Float`。
然而，点本身并不强制要求坐标使用特定的表示方式。
`{anchorName Point}Point` 的多态版本称为 `{anchorName PPoint}PPoint`，它可以接受一个类型作为参数，并将该类型用于两个字段：

```anchor PPoint
structure PPoint (α : Type) where
  x : α
  y : α
```

就像函数定义的参数写在被定义名字之后一样，结构体的参数也写在结构体名字之后。
在 Lean 中，当没有更具体的名字时，习惯上用希腊字母来命名类型参数。
`{anchorTerm PPoint}Type` 是描述其他类型的类型，所以 `{anchorName Nat}Nat`、`{anchorTerm fragments}List String` 和 `{anchorTerm fragments}PPoint Int` 都具有类型 `{anchorTerm PPoint}Type`。

就像 `{anchorName fragments}List` 一样，`{anchorName PPoint}PPoint` 可以通过提供一个具体的类型作为参数来使用：

```anchor natPoint
def natOrigin : PPoint Nat :=
  { x := Nat.zero, y := Nat.zero }
```

在这个例子中，两个字段都应该是 `{anchorName natPoint}Nat`。
就像函数调用通过把参数变量替换为参数值来求值一样，给 `{anchorName PPoint}PPoint` 提供类型 `{anchorName fragments}Nat` 作为参数，会产生一个字段 `{anchorName PPoint}x` 和 `{anchorName PPoint}y` 类型都是 `{anchorName fragments}Nat` 的结构体，因为参数名 `{anchorName PPoint}α` 已被替换为参数类型 `{anchorName fragments}Nat`。
类型在 Lean 中是普通的表达式，所以给多态类型（如 `{anchorName PPoint}PPoint`）传递参数不需要任何特殊语法。

定义也可以接受类型作为参数，从而使它们成为多态的。
函数 `{anchorName replaceX}replaceX` 将 `{anchorName replaceX}PPoint` 的 `{anchorName replaceX}x` 字段替换为一个新值。
为了让 `{anchorName replaceX}replaceX` 能用于*任何*多态点，它本身也必须是多态的。
这通过让它的第一个参数成为点字段的类型，后面的参数再引用第一个参数的名字来实现：

```anchor replaceX
def replaceX (α : Type) (point : PPoint α) (newX : α) : PPoint α :=
  { point with x := newX }
```

换句话说，当参数 `{anchorName replaceX}point` 和 `{anchorName replaceX}newX` 的类型提到 `{anchorName replaceX}α` 时，它们指的是*作为第一个参数提供的那个类型*。
这类似于函数参数名在函数体中指代调用时提供的值。

这可以通过让 Lean 检查 `{anchorName replaceX}replaceX` 的类型，然后检查 `{anchorTerm replaceXNatOriginFiveT}replaceX Nat` 的类型来看出：

```anchorTerm replaceXT
#check (replaceX)
```

```anchorInfo replaceXT
replaceX : (α : Type) → PPoint α → α → PPoint α
```

这个函数类型包含第一个参数的*名字*，后面的参数类型会引用这个名字。
就像函数应用的值是通过在函数体中用提供的参数值替换参数名来求得的一样，函数应用的类型也是通过在返回类型中用提供的值替换参数名来求得的。
提供第一个参数 `{anchorName replaceXNatT}Nat`，会导致类型其余部分中 `{anchorName replaceX}α` 的所有出现都被替换为 `{anchorName replaceXNatT}Nat`：

```anchorTerm replaceXNatT
#check replaceX Nat
```

```anchorInfo replaceXNatT
replaceX Nat : PPoint Nat → Nat → PPoint Nat
```

因为剩余参数没有显式命名，所以继续提供更多参数时不会再发生替换：

```anchorTerm replaceXNatOriginT
#check replaceX Nat natOrigin
```

```anchorInfo replaceXNatOriginT
replaceX Nat natOrigin : Nat → PPoint Nat
```

```anchorTerm replaceXNatOriginFiveT
#check replaceX Nat natOrigin 5
```

```anchorInfo replaceXNatOriginFiveT
replaceX Nat natOrigin 5 : PPoint Nat
```

整个函数应用表达式的类型由传递类型参数决定，这一事实并不影响对它求值的能力。

```anchorTerm replaceXNatOriginFiveV
#eval replaceX Nat natOrigin 5
```

```anchorInfo replaceXNatOriginFiveV
{ x := 5, y := 0 }
```

多态函数通过接受一个命名的类型参数，并让后面的类型引用该参数名来工作。
然而，类型参数能够被命名并没有什么特殊之处。
给定一个表示正号或负号的数据类型：

```anchor Sign
inductive Sign where
  | pos
  | neg
```

可以编写一个参数为符号的函数。
如果参数为正，函数返回 `{anchorName posOrNegThree}Nat`；如果为负，返回 `{anchorName posOrNegThree}Int`：

```anchor posOrNegThree
def posOrNegThree (s : Sign) :
    match s with | Sign.pos => Nat | Sign.neg => Int :=
  match s with
  | Sign.pos => (3 : Nat)
  | Sign.neg => (-3 : Int)
```

因为类型是一等的，可以用 Lean 语言的普通规则来计算类型，所以它们可以通过对数据类型进行模式匹配来计算。
当 Lean 检查这个函数时，它利用函数体中的 `{kw}match` 表达式与类型中的 `{kw}match` 表达式相对应这一事实，使 `{anchorName posOrNegThree}Nat` 成为 `{anchorName Sign}pos` 分支的期望类型，使 `{anchorName posOrNegThree}Int` 成为 `{anchorName Sign}neg` 分支的期望类型。

将 `{anchorName posOrNegThree}posOrNegThree` 应用到 `{anchorName Sign}pos` 上，会导致函数体和其返回类型中的参数名 `{anchorName posOrNegThree}s` 都被替换为 `{anchorName Sign}pos`。
求值可以同时发生在表达式和它的类型中：

```anchorEvalSteps posOrNegThreePos
(posOrNegThree Sign.pos :
 match Sign.pos with | Sign.pos => Nat | Sign.neg => Int)
===>
((match Sign.pos with
  | Sign.pos => (3 : Nat)
  | Sign.neg => (-3 : Int)) :
 match Sign.pos with | Sign.pos => Nat | Sign.neg => Int)
===>
((3 : Nat) : Nat)
===>
3
```

## 链表

%%%
tag := "linked-lists"
%%%

Lean 的标准库包含一个典型的链表数据类型，称为 `{anchorName fragments}List`，并提供了特殊语法使其更方便使用。
列表用方括号书写。
例如，小于 10 的素数列表可以写成：

```anchor primesUnder10
def primesUnder10 : List Nat := [2, 3, 5, 7]
```

在幕后，`{anchorName List}List` 是一个归纳数据类型，定义如下：

```anchor List
inductive List (α : Type) where
  | nil : List α
  | cons : α → List α → List α
```

标准库中的实际定义略有不同，因为它使用了尚未介绍的一些特性，但本质上很相似。
这个定义说明 `{anchorName List}List` 接受一个类型作为参数，和 `{anchorName PPoint}PPoint` 一样。
这个类型是列表中存储条目的类型。
根据构造子，`{anchorTerm List}List α` 可以用 `{anchorName List}nil` 或 `{anchorName List}cons` 构造。
构造子 `{anchorName List}nil` 表示空列表，构造子 `{anchorName List}cons` 用于非空列表。
`{anchorName List}cons` 的第一个参数是列表的头部，第二个参数是它的尾部。
包含 $`n` 个条目的列表包含 $`n` 个 `{anchorName List}cons` 构造子，最后一个的尾部是 `{anchorName List}nil`。

`{anchorName primesUnder10}primesUnder10` 例子可以更明确地直接用 `{anchorName List}List` 的构造子写出：

```anchor explicitPrimesUnder10
def explicitPrimesUnder10 : List Nat :=
  List.cons 2 (List.cons 3 (List.cons 5 (List.cons 7 List.nil)))
```

这两个定义完全等价，但 `{anchorName primesUnder10}primesUnder10` 比 `{anchorName explicitPrimesUnder10}explicitPrimesUnder10` 易读得多。

消费 `{anchorName List}List` 的函数可以用与消费 `{anchorName Nat}Nat` 的函数大致相同的方式定义。
事实上，可以把链表看作一种 `{anchorName Nat}Nat`，它的每个 `{anchorName Nat}succ` 构造子上都挂着一个额外的数据字段。
从这个角度看，计算列表长度就是把每个 `{anchorName List}cons` 替换为一个 `{anchorName Nat}succ`，把最后的 `{anchorName List}nil` 替换为一个 `{anchorName Nat}zero`。

就像 `{anchorName replaceX}replaceX` 把点字段的类型作为参数一样，`{anchorName length1EvalSummary}length` 把列表条目的类型作为参数。
例如，如果列表包含字符串，那么第一个参数是 `{anchorName length1EvalSummary}String`：`{anchorEvalStep length1EvalSummary 0}length String ["Sourdough", "bread"]`。
它应该这样计算：

```anchorEvalSteps length1EvalSummary
length String ["Sourdough", "bread"]
===>
length String (List.cons "Sourdough" (List.cons "bread" List.nil))
===>
Nat.succ (length String (List.cons "bread" List.nil))
===>
Nat.succ (Nat.succ (length String List.nil))
===>
Nat.succ (Nat.succ Nat.zero)
===>
2
```

`{anchorName length1}length` 的定义既是多态的（因为它把列表条目类型作为参数），又是递归的（因为它引用自身）。
一般来说，函数遵循数据的形状：递归数据类型导致递归函数，多态数据类型导致多态函数。

```anchor length1
def length (α : Type) (xs : List α) : Nat :=
  match xs with
  | List.nil => Nat.zero
  | List.cons y ys => Nat.succ (length α ys)
```

像 `{lit}xs` 和 `{lit}ys` 这样的名字习惯上用来表示未知值的列表。
名字中的 `{lit}s` 表示它们是复数，所以读作 “exes” 和 “whys”，而不是 “x s” 和 “y s”。

为了让列表上的函数更易读，可以用方括号记法 `{anchorTerm length2}[]` 来匹配 `{anchorName List}nil`，并可用中缀运算符 `{anchorTerm length2}::` 代替 `{anchorName List}cons`：

```anchor length2
def length (α : Type) (xs : List α) : Nat :=
  match xs with
  | [] => 0
  | y :: ys => Nat.succ (length α ys)
```

## 隐式参数

%%%
tag := "implicit-parameters"
%%%

`{anchorName replaceX}replaceX` 和 `{anchorName length1}length` 都有些官僚化，因为类型参数通常可以由后面的值唯一确定。
确实，在大多数语言中，编译器完全有能力自己确定类型参数，只是偶尔需要用户帮助。
Lean 也是如此。
参数可以通过在定义时用花括号而不是圆括号包裹来声明为**隐式**的。
例如，带有隐式类型参数的 `{anchorName replaceXImp}replaceX` 版本如下：

```anchor replaceXImp
def replaceX {α : Type} (point : PPoint α) (newX : α) : PPoint α :=
  { point with x := newX }
```

它可以与 `{anchorName replaceXImpNat}natOrigin` 一起使用，而无需显式提供 `{anchorName NatDoubleFour}Nat`，因为 Lean 可以从后面的参数中*推断*出 `{anchorName replaceXImp}α` 的值：

```anchor replaceXImpNat
#eval replaceX natOrigin 5
```

```anchorInfo replaceXImpNat
{ x := 5, y := 0 }
```

类似地，`{anchorName lengthImp}length` 也可以重新定义，让条目类型隐式：

```anchor lengthImp
def length {α : Type} (xs : List α) : Nat :=
  match xs with
  | [] => 0
  | y :: ys => Nat.succ (length ys)
```

这个 `{anchorName lengthImp}length` 函数可以直接应用于 `{anchorName lengthImpPrimes}primesUnder10`：

```anchor lengthImpPrimes
#eval length primesUnder10
```

```anchorInfo lengthImpPrimes
4
```

在标准库中，Lean 把这个函数称为 `{anchorName lengthExpNat}List.length`，这意味着用于结构体字段访问的点语法也可以用来求列表长度：

```anchor lengthDotPrimes
#eval primesUnder10.length
```

```anchorInfo lengthDotPrimes
4
```

就像 C# 和 Java 有时需要显式提供类型参数一样，Lean 也并不总能找到隐式参数。
在这些情况下，可以用它们的名字来提供。
例如，通过把 `{anchorTerm lengthExpNat}α` 设置为 `{anchorName lengthExpNat}Int`，可以指定一个只适用于整数列表的 `{anchorName lengthExpNat}List.length` 版本：

```anchor lengthExpNat
#check List.length (α := Int)
```

```anchorInfo lengthExpNat
List.length : List Int → Nat
```

## 更多内建数据类型

%%%
tag := "more-built-in-types"
%%%

除了列表，Lean 的标准库还包含许多其他可以在各种场景中使用的结构体和归纳数据类型。

### `{lit}Option`

%%%
tag := "Option"
%%%

不是每个列表都有第一个条目——有些列表是空的。
许多对集合的操作可能找不到它们要找的东西。
例如，查找列表第一个条目的函数可能找不到任何这样的条目。
因此，它必须有一种方式来表示没有找到第一个条目。

许多语言有一个 `{CSharp}null` 值来表示值的缺失。
Lean 没有给现有类型配备特殊的 `{CSharp}null` 值，而是提供了一个名为 `{anchorName Option}Option` 的数据类型，它为某个其他类型添加了一个表示缺失值的标记。
例如，可为空的 `{anchorName fragments}Int` 用 `{anchorTerm nullOne}Option Int` 表示，可为空的字符串列表用类型 `{anchorTerm fragments}Option (List String)` 表示。
引入一个新类型来表示可空性，意味着类型系统可以确保对 `{CSharp}null` 的检查不会被遗忘，因为一个 `{anchorTerm nullOne}Option Int` 不能用在期望 `{anchorName nullOne}Int` 的上下文中。

`{anchorName Option}Option` 有两个构造子，称为 `{anchorName Option}some` 和 `{anchorName Option}none`，分别表示底层类型的非空版本和空版本。
非空构造子 `{anchorName Option}some` 包含底层值，而 `{anchorName Option}none` 不带参数：

```anchor Option
inductive Option (α : Type) : Type where
  | none : Option α
  | some (val : α) : Option α
```

`{anchorName Option}Option` 类型与 C# 和 Kotlin 中的可空类型非常相似，但并不完全相同。
在这些语言中，如果一个类型（比如 `{CSharp}Boolean`）总是指该类型的实际值（`{CSharp}true` 和 `{CSharp}false`），那么类型 `{CSharp}Boolean?` 或 `{CSharp}Nullable<Boolean>`  additionally 允许 `{CSharp}null` 值。
在类型系统中跟踪这一点非常有用：类型检查器和其他工具可以帮助程序员记住检查 `{CSharp}null`，并且通过类型签名显式描述可空性的 API 比不这样做的 API 更具信息量。
然而，这些可空类型与 Lean 的 `{anchorName Option}Option` 有一个非常重要的区别：它们不允许多层可选性。
`{anchorTerm nullThree}Option (Option Int)` 可以用 `{anchorTerm nullOne}none`、`{anchorTerm nullTwo}some none` 或 `{anchorTerm nullThree}some (some 360)` 构造。
而 Kotlin 把 `{Kotlin}T??` 视为与 `{Kotlin}T?` 等价。
这个细微差别在实践中很少相关，但偶尔会有影响。

要查找列表的第一个条目（如果存在），可以使用 `{anchorName headHuh}List.head?`。
问号是名字的一部分，与 C# 或 Kotlin 中用于表示可空类型的问号无关。
在 `{anchorName headHuh}List.head?` 的定义中，下划线用来表示列表的尾部。
在模式中，下划线可以匹配任何东西，但不引入变量来引用匹配到的数据。
使用下划线而不是名字，是一种向读者清楚传达输入的某部分被忽略的方式。

```anchor headHuh
def List.head? {α : Type} (xs : List α) : Option α :=
  match xs with
  | [] => none
  | y :: _ => some y
```

Lean 的命名约定是：把可能失败的操作按后缀分组定义，返回 `{anchorName Option}Option` 的版本用后缀 `{lit}?`，在提供无效输入时崩溃的版本用 `{lit}!`，在操作失败时返回默认值的版本用 `{lit}D`。
按照这个模式，`{anchorName fragments}List.head` 要求调用者提供列表非空的数学证据，`{anchorName fragments}List.head?` 返回一个 `{anchorName Option}Option`，`{anchorName fragments}List.head!` 在传入空列表时使程序崩溃，`{anchorName fragments}List.headD` 在列表为空时返回一个默认值。
问号和感叹号是名字的一部分，不是特殊语法，因为 Lean 的命名规则比许多语言更宽松。

因为 `{anchorName fragments}head?` 定义在 `{lit}List` 命名空间中，所以可以用访问器记法使用：

```anchor headSome
#eval primesUnder10.head?
```

```anchorInfo headSome
some 2
```

然而，在空列表上测试它会导致两个错误：

```anchor headNoneBad
#eval [].head?
```

```anchorError headNoneBad
don't know how to synthesize implicit argument `α`
  @List.nil ?m.3
context:
⊢ Type ?u.71462
```

```anchorError headNoneBad
don't know how to synthesize implicit argument `α`
  @_root_.List.head? ?m.3 []
context:
⊢ Type ?u.71462
```

这是因为 Lean 无法完全确定表达式的类型。
特别是，它既找不到 `{anchorName fragments}List.head?` 的隐式类型参数，也找不到 `{anchorName fragments}List.nil` 的隐式类型参数。
在 Lean 的输出中，`{lit}?m.XYZ` 表示程序中无法推断的部分。
这些未知部分称为**元变量**（metavariables），它们会出现在一些错误信息中。
为了求值一个表达式，Lean 需要能够找到它的类型，而空列表没有任何条目可以推断类型，因此类型不可用。
显式提供类型可以让 Lean 继续：

```anchor headNone
#eval [].head? (α := Int)
```

```anchorInfo headNone
none
```

类型也可以用类型标注提供：

```anchor headNoneTwo
#eval ([] : List Int).head?
```

```anchorInfo headNoneTwo
none
```

错误信息提供了一个有用的线索。
两条信息使用*同一个*元变量来描述缺失的隐式参数，这意味着 Lean 已经确定这两个缺失的部分会共享一个解，即使它无法确定该解的实际值。

### `{lit}Prod`

%%%
tag := "prod"
%%%

`{anchorName Prod}Prod` 结构体，是 “Product” 的缩写，是把两个值组合在一起的通用方式。
例如，`{anchorTerm fragments}Prod Nat String` 包含一个 `{anchorName fragments}Nat` 和一个 `{anchorName fragments}String`。
换句话说，`{anchorTerm natPoint}PPoint Nat` 可以被 `{anchorTerm fragments}Prod Nat Nat` 替代。
`{anchorName fragments}Prod` 非常像 C# 的元组、Kotlin 中的 `{Kotlin}Pair` 和 `{Kotlin}Triple` 类型，以及 C++ 中的 `{cpp}tuple`。
即使对于像 `{anchorName Point}Point` 这样简单的情况，许多应用最好也定义自己的结构体，因为使用领域术语可以让代码更易读。
此外，定义结构体类型有助于通过为不同领域概念分配不同类型来捕获更多错误，防止它们被混淆。

另一方面，有些情况下定义新类型并不值得。
此外，有些库足够通用，以至于没有比“对”更具体的概念。
最后，标准库包含各种方便的函数，使使用内建的对类型更容易。

`{anchorName Prod}Prod` 结构体用两个类型参数定义：

```anchor Prod
structure Prod (α : Type) (β : Type) : Type where
  fst : α
  snd : β
```

列表使用得非常频繁，所以有特殊语法使它们更易读。
出于同样的原因，积类型及其构造子都有特殊语法。
类型 `{anchorTerm ProdSugar}Prod α β` 通常写成 `{anchorTerm ProdSugar}α × β`，模仿集合笛卡尔积的通常记法。
类似地，`{anchorName ProdSugar}Prod` 也有常用的数学对记法。
换句话说，不必写：

```anchor fivesStruct
def fives : String × Int := { fst := "five", snd := 5 }
```

只需写：

```anchor fives
def fives : String × Int := ("five", 5)
```

两种记法都是右结合的。
这意味着以下定义等价：

```anchor sevens
def sevens : String × Int × Nat := ("VII", 7, 4 + 3)
```

```anchor sevensNested
def sevens : String × (Int × Nat) := ("VII", (7, 4 + 3))
```

换句话说，所有多于两个类型的积，以及它们对应的构造子，在幕后实际上是嵌套的积和嵌套的对。

### `{anchorName Sum}Sum`

%%%
tag := "Sum"
%%%

`{anchorName Sum}Sum` 数据类型是一种通用的方式，允许在两种不同类型之间做选择。
例如，`{anchorTerm fragments}Sum String Int` 要么是一个 `{anchorName fragments}String`，要么是一个 `{anchorName fragments}Int`。
和 `{anchorName Prod}Prod` 一样，`{anchorName Sum}Sum` 应该只在编写非常通用的代码、在非常小的代码段中没有合适的领域特定类型、或者标准库包含有用函数时使用。
在大多数情况下，使用自定义归纳类型更易读且更易维护。

类型 `{anchorTerm Sumαβ}Sum α β` 的值要么是构造子 `{anchorName Sum}inl` 应用于类型 `{anchorName Sum}α` 的值，要么是构造子 `{anchorName Sum}inr` 应用于类型 `{anchorName Sum}β` 的值：

```anchor Sum
inductive Sum (α : Type) (β : Type) : Type where
  | inl : α → Sum α β
  | inr : β → Sum α β
```

这些名字分别是 “left injection”（左注入）和 “right injection”（右注入）的缩写。
就像笛卡尔积记法用于 `{anchorName Prod}Prod` 一样，“圆加号”记法用于 `{anchorName SumSugar}Sum`，所以 `{anchorTerm SumSugar}α ⊕ β` 是 `{anchorTerm SumSugar}Sum α β` 的另一种写法。
`{anchorName FakeSum}Sum.inl` 和 `{anchorName FakeSum}Sum.inr` 没有特殊语法。

例如，如果宠物名字可以是狗名或猫名，那么可以用字符串的和来引入一个类型：

```anchor PetName
def PetName : Type := String ⊕ String
```

在真实程序中，通常会更好地定义一个自定义归纳数据类型，并使用信息更丰富的构造子名。
这里，`{anchorName animals}Sum.inl` 用于狗名，`{anchorName animals}Sum.inr` 用于猫名。
这些构造子可以用来写一个动物名字列表：

```anchor animals
def animals : List PetName :=
  [Sum.inl "Spot", Sum.inr "Tiger", Sum.inl "Fifi",
   Sum.inl "Rex", Sum.inr "Floof"]
```

模式匹配可以用来区分两个构造子。
例如，一个统计动物名字列表中狗的数量（即 `{anchorName howManyDogs}Sum.inl` 构造子的数量）的函数如下：

```anchor howManyDogs
def howManyDogs (pets : List PetName) : Nat :=
  match pets with
  | [] => 0
  | Sum.inl _ :: morePets => howManyDogs morePets + 1
  | Sum.inr _ :: morePets => howManyDogs morePets
```

函数调用先于中缀运算符求值，所以 `{anchorTerm howManyDogsAdd}howManyDogs morePets + 1` 等同于 `{anchorTerm howManyDogsAdd}(howManyDogs morePets) + 1`。
如预期，`{anchor dogCount}#eval howManyDogs animals` 得到 `{anchorInfo dogCount}3`。

### `{anchorName Unit}Unit`

%%%
tag := "Unit"
%%%

`{anchorName Unit}Unit` 是一个只有一个无参数构造子的类型，称为 `{anchorName Unit}unit`。
换句话说，它只描述一个值，这个值就是上述构造子不带任何参数应用的结果。
`{anchorName Unit}Unit` 定义如下：

```anchor Unit
inductive Unit : Type where
  | unit : Unit
```

就其本身而言，`{anchorName Unit}Unit` 并不是特别有用。
然而，在多态代码中，它可以用作缺失数据的占位符。
例如，以下归纳数据类型表示算术表达式：

```anchor ArithExpr
inductive ArithExpr (ann : Type) : Type where
  | int : ann → Int → ArithExpr ann
  | plus : ann → ArithExpr ann → ArithExpr ann → ArithExpr ann
  | minus : ann → ArithExpr ann → ArithExpr ann → ArithExpr ann
  | times : ann → ArithExpr ann → ArithExpr ann → ArithExpr ann
```

类型参数 `{anchorName ArithExpr}ann` 代表注解，每个构造子都被注解。
来自解析器的表达式可能用源位置注解，因此返回类型 `{anchorTerm ArithExprEx}ArithExpr SourcePos` 可以确保解析器在每个子表达式处都放置了一个 `{anchorName ArithExprEx}SourcePos`。
而非来自解析器的表达式没有源位置，因此它们的类型可以是 `{anchorTerm ArithExprEx}ArithExpr Unit`。

此外，因为所有 Lean 函数都有参数，其他语言中的零参数函数可以表示为接受一个 `{anchorName ArithExprEx}Unit` 参数的函数。
在返回位置，`{anchorName ArithExprEx}Unit` 类型类似于 C 系语言中的 `{CSharp}void`。
在 C 系语言中，返回 `{CSharp}void` 的函数会把控制权返回给调用者，但不返回任何有意义的值。
通过成为一个故意无趣的值，`{anchorName ArithExprEx}Unit` 使得这一点可以在类型系统中表达，而无需专门的 `{CSharp}void` 特性。
`Unit` 的构造子可以写成空括号：`{anchorTerm unitParens}() : Unit`。

### `{lit}Empty`

%%%
tag := "Empty"
%%%

`{anchorName fragments}Empty` 数据类型没有任何构造子。
因此，它表示不可达代码，因为没有任何调用序列可以最终终止于类型 `{anchorName fragments}Empty` 的值。

`{anchorName fragments}Empty` 不如 `{anchorName fragments}Unit` 常用。
然而，它在一些专门化的上下文中有用。
许多多态数据类型不会在所有构造子中使用所有类型参数。
例如，`{anchorName animals}Sum.inl` 和 `{anchorName animals}Sum.inr` 各自只使用了 `{anchorName fragments}Sum` 的一个类型参数。
在程序的某个特定点上，把 `{anchorName fragments}Empty` 作为 `{anchorName fragments}Sum` 的类型参数之一，可以排除掉其中一个构造子。
这可以让通用代码用于有额外限制的上下文。

### 命名：和、积与单位

%%%
tag := "sum-products-units"
%%%

一般来说，提供多个构造子的类型称为**和类型**（sum types），而单个构造子接受多个参数的类型称为**积类型**（product types）。
这些术语与普通算术中的和与积有关。
当相关类型包含有限个值时，这种关系最容易看出。
如果 `{anchorName SumProd}α` 和 `{anchorName SumProd}β` 是分别包含 $`n` 和 $`k` 个不同值的类型，那么 `{anchorTerm SumProd}α ⊕ β` 包含 $`n + k` 个不同值，`{anchorTerm SumProd}α × β` 包含 $`n \times k` 个不同值。
例如，`{anchorName fragments}Bool` 有两个值：`{anchorName BoolNames}true` 和 `{anchorName BoolNames}false`；`{anchorName Unit}Unit` 有一个值：`{anchorName BooloUnit}Unit.unit`。
积 `{anchorTerm fragments}Bool × Unit` 有两个值：`{anchorTerm BoolxUnit}(true, Unit.unit)` 和 `{anchorTerm BoolxUnit}(false, Unit.unit)`；和 `{anchorTerm fragments}Bool ⊕ Unit` 有三个值：`{anchorTerm BooloUnit}Sum.inl true`、`{anchorTerm BooloUnit}Sum.inl false` 和 `{anchorTerm BooloUnit}Sum.inr Unit.unit`。
类似地，$`2 \times 1 = 2`，$`2 + 1 = 3`。

## 你可能会遇到的信息

%%%
tag := "polymorphism-messages"
%%%

并非所有可定义的结构体或归纳类型都可以具有类型 `{anchorTerm Prod}Type`。
特别是，如果一个构造子接受任意类型作为参数，那么该归纳类型必须具有不同的类型。
这些错误通常会提到“宇宙层级”（universe levels）。
例如，对于以下归纳类型：

```anchor TypeInType
inductive MyType : Type where
  | ctor : (α : Type) → α → MyType
```

Lean 给出以下错误：

```anchorError TypeInType
Invalid universe level in constructor `MyType.ctor`: Parameter `α` has type
  Type
at universe level
  2
which is not less than or equal to the inductive type's resulting universe level
  1
```

后面的章节会解释为什么会这样，以及如何修改定义使其工作。
目前，可以尝试让类型成为整个归纳类型的参数，而不是构造子的参数。

类似地，如果构造子的参数是一个以正在定义的数据类型为参数的函数，该定义也会被拒绝。
例如：

```anchor Positivity
inductive MyType : Type where
  | ctor : (MyType → Int) → MyType
```

会产生如下信息：

```anchorError Positivity
(kernel) arg #1 of 'MyType.ctor' has a non positive occurrence of the datatypes being declared
```

由于技术原因，允许这些数据类型可能破坏 Lean 的内部逻辑，使其不适合作为定理证明器使用。

接受两个参数的递归函数不应该对配对进行匹配，而应该独立匹配每个参数。
否则，Lean 中检查递归调用是否作用于更小值的机制，就无法看到输入值与递归调用中参数之间的联系。
例如，下面这个判断两个列表长度是否相同的函数会被拒绝：

```anchor sameLengthPair
def sameLength (xs : List α) (ys : List β) : Bool :=
  match (xs, ys) with
  | ([], []) => true
  | (x :: xs', y :: ys') => sameLength xs' ys'
  | _ => false
```

错误信息是：

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
1) 1760:28-46  ?  ?
Please use `termination_by` to specify a decreasing measure.
```

可以通过嵌套模式匹配修复这个问题：

```anchor sameLengthOk1
def sameLength (xs : List α) (ys : List β) : Bool :=
  match xs with
  | [] =>
    match ys with
    | [] => true
    | _ => false
  | x :: xs' =>
    match ys with
    | y :: ys' => sameLength xs' ys'
    | _ => false
```

{ref "simultaneous-matching"}[同时匹配]（simultaneous matching）是另一种解决这个问题的方式，通常更优雅。

忘记给归纳类型传递参数也可能产生令人困惑的信息。
例如，当参数 `{anchorName MissingTypeArg}α` 在 `{anchorTerm MissingTypeArg}ctor` 的类型中没有传给 `{anchorName MissingTypeArg}MyType` 时：

```anchor MissingTypeArg
inductive MyType (α : Type) : Type where
  | ctor : α → MyType
```

Lean 回复如下错误：

```anchorError MissingTypeArg
type expected, got
  (MyType : Type → Type)
```

这条错误信息表示 `{anchorName MissingTypeArg}MyType` 的类型是 `{anchorTerm MissingTypeArgT}Type → Type`，而它本身并不描述类型。
`{anchorName MissingTypeArg}MyType` 需要一个参数才能成为一个真正的类型。

同样的信息也可能出现在其他省略类型参数的上下文中，比如定义的类型签名中：

```anchor MyTypeDef
inductive MyType (α : Type) : Type where
  | ctor : α → MyType α
```

```anchor MissingTypeArg2
def ofFive : MyType := ctor 5
```

```anchorError MissingTypeArg2
type expected, got
  (MyType : Type → Type)
```

对使用多态类型的表达式求值时，可能会触发 Lean 无法显示值的情况。
`{anchorTerm evalAxe}#eval` 命令对提供的表达式求值，并使用表达式的类型来决定如何显示结果。
对于某些类型，如函数，这个过程会失败，但 Lean 完全能够为大多数其他类型自动生成显示代码。
例如，不需要为 `{anchorName WoodSplittingTool}WoodSplittingTool` 提供任何特定的显示代码：

```anchor WoodSplittingTool
inductive WoodSplittingTool where
  | axe
  | maul
  | froe
```

```anchor evalAxe
#eval WoodSplittingTool.axe
```

```anchorInfo evalAxe
WoodSplittingTool.axe
```

然而，Lean 在这里使用的自动化是有限的。
`{anchorName allTools}allTools` 是这三个工具的所有列表：

```anchor allTools
def allTools : List WoodSplittingTool := [
  WoodSplittingTool.axe,
  WoodSplittingTool.maul,
  WoodSplittingTool.froe
]
```

求值它会出错：

```anchor evalAllTools
#eval allTools
```

```anchorError evalAllTools
could not synthesize a `ToExpr`, `Repr`, or `ToString` instance for type
  List WoodSplittingTool
```

这是因为 Lean 试图使用内建表中的代码来显示列表，但这些代码要求 `{anchorName WoodSplittingTool}WoodSplittingTool` 的显示代码已经存在。
这个错误可以通过在定义数据类型时指示 Lean 生成显示代码来解决，而不是等到 `{anchorTerm evalAllTools}#eval` 的最后时刻，方法是在定义中添加 `{anchorTerm Firewood}deriving Repr`：

```anchor Firewood
inductive Firewood where
  | birch
  | pine
  | beech
deriving Repr
```

求值 `{anchorName Firewood}Firewood` 的列表会成功：

```anchor allFirewood
def allFirewood : List Firewood := [
  Firewood.birch,
  Firewood.pine,
  Firewood.beech
]
```

```anchor evalAllFirewood
#eval allFirewood
```

```anchorInfo evalAllFirewood
[Firewood.birch, Firewood.pine, Firewood.beech]
```

## 练习

%%%
tag := "polymorphism-exercises"
%%%

 * 编写一个函数，查找列表的最后一个条目。它应该返回一个 `{anchorName fragments}Option`。
 * 编写一个函数，查找列表中第一个满足给定谓词的条目。从 `{anchorTerm List.findFirst?Ex}def List.findFirst? {α : Type} (xs : List α) (predicate : α → Bool) : Option α := …` 开始。
 * 编写函数 `{anchorName Prod.switchEx}Prod.switch`，交换一对中的两个字段。从 `{anchor Prod.switchEx}def Prod.switch {α β : Type} (pair : α × β) : β × α := …` 开始。
 * 把 `{anchorName PetName}PetName` 例子重写为使用自定义数据类型，并与使用 `{anchorName Sum}Sum` 的版本进行比较。
 * 编写函数 `{anchorName zipEx}zip`，将两个列表组合成一个对列表。结果列表的长度应等于较短输入列表的长度。从 `{anchor zipEx}def zip {α β : Type} (xs : List α) (ys : List β) : List (α × β) := …` 开始。
 * 编写多态函数 `{anchorName takeOne}take`，返回列表中的前 $`n` 个条目，其中 $`n` 是 `{anchorName fragments}Nat`。如果列表包含少于 $`n` 个条目，则结果列表应为整个输入列表。`{anchorTerm takeThree}#eval take 3 ["bolete", "oyster"]` 应得到 `{anchorInfo takeThree}["bolete", "oyster"]`，`{anchor takeOne}#eval take 1 ["bolete", "oyster"]` 应得到 `{anchorInfo takeOne}["bolete"]`。
 * 利用类型与算术之间的类比，编写一个将积分配到和上的函数。换句话说，它的类型应为 `{anchorTerm distr}α × (β ⊕ γ) → (α × β) ⊕ (α × γ)`。
 * 利用类型与算术之间的类比，编写一个将乘以二转化为和的函数。换句话说，它的类型应为 `{anchorTerm distr}Bool × α → α ⊕ α`。
