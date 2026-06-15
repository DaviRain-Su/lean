# 正数

在某些应用中，只有正数才有意义。
例如，编译器和解释器通常使用从 1 开始计数的行号和列号来表示源码位置，而表示非空列表的数据类型永远不会报告长度为 0。
与其依赖自然数并在代码中到处断言数字不为零，不如设计一种只表示正数的数据类型，这样往往更有用。

表示正数的一种方式与 {anchorTerm chapterIntro}`Nat` 非常相似，只是以 {anchorTerm Pos}`one` 作为基础情形，而不是 {anchorTerm Nat.zero}`zero`：

```anchor Pos
inductive Pos : Type where
  | one : Pos
  | succ : Pos → Pos
```
这种数据类型恰好表示预期的值集合，但使用起来并不方便。
例如，数值字面量会被拒绝：
```anchor sevenOops
def seven : Pos := 7
```
```anchorError sevenOops
failed to synthesize
  OfNat Pos 7
numerals are polymorphic in Lean, but the numeral `7` cannot be used in a context where the expected type is
  Pos
due to the absence of the instance above

Hint: Additional diagnostic information may be available using the `set_option diagnostics true` command.
```
相反，必须直接使用构造子：
```anchor seven
def seven : Pos :=
  Pos.succ (Pos.succ (Pos.succ (Pos.succ (Pos.succ (Pos.succ Pos.one)))))
```

同样，加法和乘法也不好用：
```anchor fourteenOops
def fourteen : Pos := seven + seven
```
```anchorError fourteenOops
failed to synthesize
  HAdd Pos Pos ?m.3

Hint: Additional diagnostic information may be available using the `set_option diagnostics true` command.
```
```anchor fortyNineOops
def fortyNine : Pos := seven * seven
```
```anchorError fortyNineOops
failed to synthesize
  HMul Pos Pos ?m.3

Hint: Additional diagnostic information may be available using the `set_option diagnostics true` command.
```

这些错误消息都以 {lit}`failed to synthesize` 开头。
这表明错误是由于某个尚未实现的重载运算引起的，并说明了必须实现的类型类。

# 类型类与实例

类型类由名称、若干参数以及一组 {deftech}_方法（methods）_ 组成。
参数描述要为哪些类型定义可重载运算，方法则是可重载运算的名称和类型签名。
这里再次出现了与面向对象语言的术语冲突。
在面向对象编程中，方法本质上是与内存中某个特定对象关联的函数，可以特殊地访问该对象的私有状态。
对象通过其方法与之交互。
而在 Lean 中，"方法"指的是被声明为可重载的运算，与对象、值或私有字段没有特殊关联。

重载加法的一种方式，是定义名为 {anchorName Plus}`Plus` 的类型类，其中加法方法名为 {anchorName Plus}`plus`。
一旦为 {anchorTerm chapterIntro}`Nat` 定义了 {anchorTerm Plus}`Plus` 的实例，就可以用 {anchorName plusNatFiveThree}`Plus.plus` 将两个 {anchorTerm chapterIntro}`Nat` 相加：
```anchor plusNatFiveThree
#eval Plus.plus 5 3
```
```anchorInfo plusNatFiveThree
8
```
定义更多实例后，{anchorName plusNatFiveThree}`Plus.plus` 就可以接受更多类型的参数。

在下面的类型类声明中，{anchorName Plus}`Plus` 是类名，{anchorTerm Plus}`α : Type` 是唯一的参数，{anchorTerm Plus}`plus : α → α → α` 是唯一的方法：

```anchor Plus
class Plus (α : Type) where
  plus : α → α → α
```
该声明表明，存在一个名为 {anchorName Plus}`Plus` 的类型类，它针对类型 {anchorName Plus}`α` 重载运算。
具体而言，有一个名为 {anchorName Plus}`plus` 的重载运算，它接受两个 {anchorName Plus}`α` 并返回一个 {anchorName Plus}`α`。

类型类是一等公民，就像类型是一等公民一样。
具体而言，类型类是另一种类型的类型。
{anchorTerm PlusType}`Plus` 的类型是 {anchorTerm PlusType}`Type → Type`，因为它接受一个类型参数（{anchorName Plus}`α`），并产生一个新类型，该类型描述如何为 {anchorName Plus}`α` 重载 {anchorName Plus}`Plus` 的运算。


要为特定类型重载 {anchorName PlusNat}`plus`，需要编写一个实例：

```anchor PlusNat
instance : Plus Nat where
  plus := Nat.add
```
{anchorTerm PlusNat}`instance` 后面的冒号表明 {anchorTerm PlusNat}`Plus Nat` 确实是一个类型。
类 {anchorName Plus}`Plus` 的每个方法都应当用 {anchorTerm PlusNat}`:=` 赋值。
在本例中，只有一个方法：{anchorName PlusNat}`plus`。

默认情况下，类型类方法定义在与类型类同名的命名空间中。
{anchorTerm openPlus}`open` 该命名空间会很方便，这样用户就不必先输入类名。
{kw}`open` 命令中的括号表示只让命名空间中的指定名称变得可访问：

```anchor openPlus
open Plus (plus)
```
```anchor plusNatFiveThreeAgain
#eval plus 5 3
```
```anchorInfo plusNatFiveThreeAgain
8
```

为 {anchorName PlusPos}`Pos` 定义加法函数以及 {anchorTerm PlusPos}`Plus Pos` 的实例后，{anchorName PlusPos}`plus` 就可以用于对 {anchorName PlusPos}`Pos` 和 {anchorTerm chapterIntro}`Nat` 值求和：

```anchor PlusPos
def Pos.plus : Pos → Pos → Pos
  | Pos.one, k => Pos.succ k
  | Pos.succ n, k => Pos.succ (n.plus k)

instance : Plus Pos where
  plus := Pos.plus

def fourteen : Pos := plus seven seven
```

由于尚未定义 {anchorTerm PlusFloat}`Plus Float` 的实例，用 {anchorName plusFloatFail}`plus` 对两个浮点数求和会失败，并出现熟悉的消息：
```anchor plusFloatFail
#eval plus 5.2 917.25861
```
```anchorError plusFloatFail
failed to synthesize
  Plus Float

Hint: Additional diagnostic information may be available using the `set_option diagnostics true` command.
```
这些错误意味着 Lean 无法为给定的类型类找到实例。

# 重载加法

Lean 的内置加法运算符是名为 {anchorName chapterIntro}`HAdd` 的类型类的语法糖，它灵活地允许加法参数具有不同类型。
{anchorName chapterIntro}`HAdd` 是 _异构加法（heterogeneous addition）_ 的缩写。
例如，可以编写 {anchorName chapterIntro}`HAdd` 实例，使得 {anchorName chapterIntro}`Nat` 可以与 {anchorName fiveZeros}`Float` 相加，得到新的 {anchorName fiveZeros}`Float`。
当程序员写 {anchorTerm plusDesugar}`x + y` 时，它被解释为 {anchorTerm plusDesugar}`HAdd.hAdd x y`。

虽然要完全理解 {anchorName chapterIntro}`HAdd` 的通用性，需要依赖本章 {ref "out-params"}[另一节] 中讨论的特性，但还有一个更简单的类型类 {anchorName AddPos}`Add`，它不允许参数类型混用。
Lean 库的配置方式是：当两个参数类型相同时，在搜索 {anchorName chapterIntro}`HAdd` 实例时会找到 {anchorName AddPos}`Add` 的实例。

定义 {anchorTerm AddPos}`Add Pos` 的实例后，{anchorTerm AddPos}`Pos` 值就可以使用普通的加法语法：

```anchor AddPos
instance : Add Pos where
  add := Pos.plus
```
```anchor betterFourteen
def fourteen : Pos := seven + seven
```

# 转换为字符串

另一个有用的内置类是 {anchorName UglyToStringPos}`ToString`。
{anchorName UglyToStringPos}`ToString` 的实例为给定类型的值提供一种标准的字符串转换方式。
例如，当某个值出现在插值字符串中时，会使用 {anchorName UglyToStringPos}`ToString` 实例；它也决定了在 {ref "running-a-program"}[{anchorName readFile}`IO` 说明开头] 使用的 {anchorName printlnType}`IO.println` 函数将如何显示一个值。

例如，将 {anchorName Pos}`Pos` 转换为 {anchorName readFile}`String` 的一种方式，是揭示其内部结构。
函数 {anchorName posToStringStructure}`posToString` 接受一个 {anchorName posToStringStructure}`Bool`，用于决定是否为 {anchorName posToStringStructure}`Pos.succ` 的用法加括号；在函数的初始调用中应为 {anchorName CoeBoolProp}`true`，在所有递归调用中应为 {anchorName posToStringStructure}`false`。

```anchor posToStringStructure
def posToString (atTop : Bool) (p : Pos) : String :=
  let paren s := if atTop then s else "(" ++ s ++ ")"
  match p with
  | Pos.one => "Pos.one"
  | Pos.succ n => paren s!"Pos.succ {posToString false n}"
```
用这个函数定义 {anchorName UglyToStringPos}`ToString` 实例：

```anchor UglyToStringPos
instance : ToString Pos where
  toString := posToString true
```
会得到信息丰富但令人难以承受的输出：
```anchor sevenLong
#eval s!"There are {seven}"
```
```anchorInfo sevenLong
"There are Pos.succ (Pos.succ (Pos.succ (Pos.succ (Pos.succ (Pos.succ Pos.one)))))"
```

另一方面，每个正数都有对应的 {anchorTerm chapterIntro}`Nat`。
先将其转换为 {anchorTerm chapterIntro}`Nat`，再使用 {anchorTerm chapterIntro}`ToString Nat` 实例（即 {anchorTerm chapterIntro}`Nat` 上 {anchorName UglyToStringPos}`ToString` 的重载），是快速生成更短输出的一种方法：

```anchor posToNat
def Pos.toNat : Pos → Nat
  | Pos.one => 1
  | Pos.succ n => n.toNat + 1
```
```anchor PosToStringNat
instance : ToString Pos where
  toString x := toString (x.toNat)
```
```anchor sevenShort
#eval s!"There are {seven}"
```
```anchorInfo sevenShort
"There are 7"
```
当定义了多个实例时，最近定义的实例优先。
此外，如果某个类型有 {anchorName UglyToStringPos}`ToString` 实例，就可以用它显示 {kw}`#eval` 的结果，因此 {anchorTerm sevenEvalStr}`#eval seven` 会输出 {anchorInfo sevenEvalStr}`7`。

# 重载乘法

对于乘法，有一个名为 {anchorName MulPPoint}`HMul` 的类型类，它像 {anchorName chapterIntro}`HAdd` 一样允许混合参数类型。
正如 {anchorTerm plusDesugar}`x + y` 被解释为 {anchorTerm plusDesugar}[`HAdd.hAdd x y`]，{anchorTerm timesDesugar}`x * y` 被解释为 {anchorTerm timesDesugar}`HMul.hMul x y`。
对于两个参数类型相同的常见情形，{anchorName PosMul}`Mul` 实例就足够了。

{anchorTerm PosMul}`Mul` 的实例使得 {anchorName PosMul}`Pos` 可以使用普通的乘法语法：

```anchor PosMul
def Pos.mul : Pos → Pos → Pos
  | Pos.one, k => k
  | Pos.succ n, k => n.mul k + k

instance : Mul Pos where
  mul := Pos.mul
```
有了这个实例，乘法会按预期工作：
```anchor muls
#eval [seven * Pos.one,
       seven * seven,
       Pos.succ Pos.one * seven]
```
```anchorInfo muls
[7, 49, 14]
```

# 字面量数字

为表示正数而写出一长串构造子相当不便。
解决该问题的一种办法，是提供一个将 {anchorTerm chapterIntro}`Nat` 转换为 {anchorName Pos}`Pos` 的函数。
然而，这种方法有缺点。
首先，由于 {anchorName PosMul}`Pos` 无法表示 {anchorTerm nats}`0`，所得函数要么会把 {anchorTerm chapterIntro}`Nat` 转换为更大的数，要么返回 {anchorTerm PosStuff}`Option Pos`。
对用户来说，这两种情况都不方便。
其次，需要显式调用该函数，会使使用正数的程序比使用 {anchorTerm chapterIntro}`Nat` 的程序难写得多。
在精确类型与便利 API 之间做出取舍，意味着精确类型会变得不那么有用。

有三个类型类用于重载数值字面量：{anchorName Zero}`Zero`、{anchorName One}`One` 和 {anchorName OfNat}`OfNat`。
由于许多类型的值自然用 {anchorTerm nats}`0` 书写，{anchorName Zero}`Zero` 类允许覆盖这些特定值。
它定义如下：

```anchor Zero
class Zero (α : Type) where
  zero : α
```
由于 {anchorTerm nats}`0` 不是正数，因此不应存在 {anchorTerm PosStuff}`Zero Pos` 的实例。

类似地，许多类型的值自然用 {anchorTerm nats}`1` 书写。
{anchorName One}`One` 类允许覆盖这些值：
```anchor One
class One (α : Type) where
  one : α
```
{anchorTerm OnePos}`One Pos` 的实例完全合理：
```anchor OnePos
instance : One Pos where
  one := Pos.one
```
有了这个实例，{anchorTerm onePos}`1` 就可以用于 {anchorTerm OnePos}`Pos.one`：
```anchor onePos
#eval (1 : Pos)
```
```anchorInfo onePos
1
```

在 Lean 中，自然数字面量通过名为 {anchorName OfNat}`OfNat` 的类型类来解释：

```anchor OfNat
class OfNat (α : Type) (_ : Nat) where
  ofNat : α
```
该类型类接受两个参数：{anchorTerm OfNat}`α` 是要重载自然数的类型，未命名的 {anchorTerm chapterIntro}`Nat` 参数则是程序中遇到的实际字面量数字。
方法 {anchorName OfNat}`ofNat` 随后被用作该数字字面量的值。
由于类中包含 {anchorTerm chapterIntro}`Nat` 参数，因此可以只为那些数字有意义的值定义实例。

{anchorTerm OfNat}`OfNat` 表明，类型类的参数不必是类型。
由于 Lean 中的类型是语言的一等参与者，可以作为参数传给函数，并可用 {kw}`def` 和 {kw}`abbrev` 定义，因此不存在阻碍非类型参数出现在不那么灵活的语言无法允许的位置上的障碍。
这种灵活性使得重载运算既可以针对特定值提供，也可以针对特定类型提供。
此外，它还使 Lean 标准库能够安排：只要有 {anchorTerm ListSum}`OfNat α 0` 实例，就有 {anchorTerm ListSumZ}`Zero α` 实例，反之亦然。
类似地，{anchorTerm OneExamples}`One α` 的实例意味着 {anchorTerm OneExamples}`OfNat α 1` 的实例，而 {anchorTerm OneExamples}`OfNat α 1` 的实例也意味着 {anchorTerm OneExamples}`One α` 的实例。

可以如下定义一个表示小于 4 的自然数的和类型：

```anchor LT4
inductive LT4 where
  | zero
  | one
  | two
  | three
```
虽然为该类型允许_任意_字面量数字没有意义，但小于 4 的数字显然有意义：

```anchor LT4ofNat
instance : OfNat LT4 0 where
  ofNat := LT4.zero

instance : OfNat LT4 1 where
  ofNat := LT4.one

instance : OfNat LT4 2 where
  ofNat := LT4.two

instance : OfNat LT4 3 where
  ofNat := LT4.three
```
有了这些实例，下面的示例可以工作：
```anchor LT4three
#eval (3 : LT4)
```
```anchorInfo LT4three
LT4.three
```
```anchor LT4zero
#eval (0 : LT4)
```
```anchorInfo LT4zero
LT4.zero
```
另一方面，越界的字面量仍然不被允许：
```anchor LT4four
#eval (4 : LT4)
```
```anchorError LT4four
failed to synthesize
  OfNat LT4 4
numerals are polymorphic in Lean, but the numeral `4` cannot be used in a context where the expected type is
  LT4
due to the absence of the instance above

Hint: Additional diagnostic information may be available using the `set_option diagnostics true` command.
```

对于 {anchorName PosMul}`Pos`，{anchorTerm OfNat}`OfNat` 实例应当对除 {anchorName PosStuff}`Nat.zero` 之外的_任意_ {anchorTerm chapterIntro}`Nat` 都有效。
换一种说法，对于所有自然数 {anchorTerm posrec}`n`，该实例都应当对 {anchorTerm posrec}`n + 1` 有效。
正如 {anchorTerm posrec}`α` 这样的名字会自动成为 Lean 自行填充的函数的隐式参数一样，实例也可以接受自动隐式参数。
在这个实例中，参数 {anchorTerm OfNatPos}`n` 代表任意 {anchorTerm chapterIntro}`Nat`，而该实例针对比它大 1 的 {anchorTerm chapterIntro}`Nat` 定义：

```anchor OfNatPos
instance : OfNat Pos (n + 1) where
  ofNat :=
    let rec natPlusOne : Nat → Pos
      | 0 => Pos.one
      | k + 1 => Pos.succ (natPlusOne k)
    natPlusOne n
```
由于 {anchorTerm OfNatPos}`n` 代表比用户所写数字小 1 的 {anchorTerm chapterIntro}`Nat`，辅助函数 {anchorName OfNatPos}`natPlusOne` 返回的 {anchorName OfNatPos}`Pos` 比其参数大 1。
这使得自然数字面量可以用于正数，但不能用于零：

```anchor eight
def eight : Pos := 8
```
```anchor zeroBad
def zero : Pos := 0
```
```anchorError zeroBad
failed to synthesize
  OfNat Pos 0
numerals are polymorphic in Lean, but the numeral `0` cannot be used in a context where the expected type is
  Pos
due to the absence of the instance above

Hint: Additional diagnostic information may be available using the `set_option diagnostics true` command.
```

# 练习

## 另一种表示

表示正数的另一种方式，是将其表示为某个 {anchorTerm chapterIntro}`Nat` 的后继。
将 {anchorName PosStuff}`Pos` 的定义替换为一个结构体，其构造子名为 {anchorName AltPos}`succ`，并包含一个 {anchorTerm chapterIntro}`Nat`：

```anchor AltPos
structure Pos where
  succ ::
  pred : Nat
```
定义 {moduleName}`Add`、{moduleName}`Mul`、{anchorName UglyToStringPos}`ToString` 和 {moduleName}`OfNat` 的实例，使这个版本的 {anchorName AltPos}`Pos` 可以方便地使用。

## 偶数

定义一种只表示偶数的数据类型。定义 {moduleName}`Add`、{moduleName}`Mul` 和 {anchorName UglyToStringPos}`ToString` 的实例，使其可以方便地使用。
{moduleName}`OfNat` 需要下一节 {ref "tc-polymorphism"}[类型类中的多态性] 中介绍的一个特性。

## HTTP 请求

HTTP 请求以 HTTP 方法的标识开头，例如 {lit}`GET` 或 {lit}`POST`，同时还包含 URI 和 HTTP 版本。
定义一个归纳类型来表示 HTTP 方法的一个有趣子集，并定义一个表示 HTTP 响应的结构体。
响应应当有 {anchorName UglyToStringPos}`ToString` 实例，以便调试。
使用类型类将不同的 {moduleName}`IO` 动作与每种 HTTP 方法关联起来，并编写一个作为 {moduleName}`IO` 动作的测试框架，调用每种方法并打印结果。