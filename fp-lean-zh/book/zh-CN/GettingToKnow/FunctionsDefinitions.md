# 函数与定义

在 Lean 中，定义通过 {kw}`def` 关键字引入。例如，要将名称 {anchorTerm helloNameVal}`hello` 定义为指向字符串 {anchorTerm helloNameVal}`"Hello"`，可以写作：

```anchor hello
def hello := "Hello"
```

在 Lean 中，新名称使用冒号等号运算符 {anchorTerm hello}`:=` 来定义，而不是 {anchorTerm helloNameVal}`=`。这是因为 {anchorTerm helloNameVal}`=` 用于描述已有表达式之间的相等性，使用两种不同的运算符有助于避免混淆。

在 {anchorTerm helloNameVal}`hello` 的定义中，表达式 {anchorTerm helloNameVal}`"Hello"` 足够简单，Lean 能够自动推断出该定义的类型。然而，大多数定义并没有这么简单，因此通常需要为其添加类型。这可以通过在被定义的名称后面加上冒号来实现：

```anchor lean
def lean : String := "Lean"
```

现在名称已经定义好了，就可以使用它们，因此

```anchor helloLean
#eval String.append hello (String.append " " lean)
```

会输出

```anchorInfo helloLean
"Hello Lean"
```

在 Lean 中，已定义的名称只能在其定义之后使用。

在许多语言中，函数定义与其他值的定义使用不同的语法。例如，Python 的函数定义以 {kw}`def` 关键字开头，而其他定义则使用等号。在 Lean 中，函数与其他值使用相同的 {kw}`def` 关键字来定义。尽管如此，像 {anchorTerm helloNameVal}`hello` 这样的定义引入的名称是 _直接_ 指向其值，而不是指向每次调用都返回等价结果的无参函数。

# 定义函数

在 Lean 中有多种定义函数的方式。最简单的一种是把函数的参数放在定义的类型之前，参数之间用空格分隔。例如，一个将其参数加一的函数可以写作：

```anchor add1
def add1 (n : Nat) : Nat := n + 1
```

用 {kw}`#eval` 测试这个函数会得到 {anchorInfo add1_7}`8`，符合预期：

```anchor add1_7
#eval add1 7
```

就像函数通过在每个参数之间写空格来应用于多个参数一样，接受多个参数的函数也通过在其参数名和类型之间用空格分隔来定义。函数 {anchorName maximum}`maximum` 的结果等于其两个参数中的较大者，它接受两个 {anchorName maximum}`Nat` 类型的参数 {anchorName Nat}`n` 和 {anchorName maximum}`k`，并返回一个 {anchorName maximum}`Nat`。

```anchor maximum
def maximum (n : Nat) (k : Nat) : Nat :=
  if n < k then
    k
  else n
```

同样，函数 {anchorName spaceBetween}`spaceBetween` 会在两个字符串之间加入一个空格来连接它们。

```anchor spaceBetween
def spaceBetween (before : String) (after : String) : String :=
  String.append before (String.append " " after)
```

当一个像 {anchorName maximum_eval}`maximum` 这样已定义的函数被提供了参数后，其结果是通过首先将函数体中的参数名替换为给定的值，然后对替换后的函数体求值来确定的。例如：

```anchorEvalSteps maximum_eval
maximum (5 + 8) (2 * 7)
===>
maximum 13 14
===>
if 13 < 14 then 14 else 13
===>
14
```

求值结果为自然数、整数和字符串的表达式都有相应的类型（分别为 {anchorName Nat}`Nat`、{anchorName Positivity}`Int` 和 {anchorName Book}`String`）。函数也是如此。接受一个 {anchorName Nat}`Nat` 并返回一个 {anchorName Bool}`Bool` 的函数类型是 {anchorTerm evenFancy}`Nat → Bool`，接受两个 {anchorName Nat}`Nat` 并返回一个 {anchorName Nat}`Nat` 的函数类型是 {anchorTerm currying}`Nat → Nat → Nat`。

作为一种特殊情况，当直接使用函数名并配合 {kw}`#check` 时，Lean 会返回该函数的签名。输入 {anchorTerm add1sig}`#check add1` 会得到 {anchorInfo add1sig}`add1 (n : Nat) : Nat`。不过，可以通过把函数名写在括号里来“欺骗”Lean，使其显示函数的类型，因为括号会让函数被当作普通表达式处理，因此 {anchorTerm add1type}`#check (add1)` 会得到 {anchorInfo add1type}`add1 : Nat → Nat`，而 {anchorTerm maximumType}`#check (maximum)` 会得到 {anchorInfo maximumType}`maximum : Nat → Nat → Nat`。这个箭头也可以用 ASCII 形式的箭头 {anchorTerm add1typeASCII}`->` 书写，因此上述函数类型可以分别写作 {anchorTerm add1typeASCII}`example : Nat -> Nat := add1` 和 {anchorTerm maximumTypeASCII}`example : Nat -> Nat -> Nat := maximum`。

在底层，所有函数实际上都恰好只期望一个参数。像 {anchorName maximum3Type}`maximum` 这样看似接受多个参数的函数，实际上都是接受一个参数后返回一个新函数的函数。这个新函数再接受下一个参数，如此继续，直到不再有参数需要接受。通过向一个多参数函数只提供一个参数可以看出这一点：{anchorTerm maximum3Type}`#check maximum 3` 得到 {anchorInfo maximum3Type}`maximum 3 : Nat → Nat`，而 {anchorTerm stringAppendHelloType}`#check spaceBetween "Hello "` 得到 {anchorInfo stringAppendHelloType}`spaceBetween "Hello " : String → String`。使用返回函数的函数来实现多参数函数的做法称为 _currying_（柯里化），以数学家 Haskell Curry 的名字命名。函数箭头是右结合的，这意味着 {anchorTerm currying}`Nat → Nat → Nat` 应该被括号为 {anchorTerm currying}`Nat → (Nat → Nat)`。

## 练习

 * 定义函数 {anchorName joinStringsWithEx}`joinStringsWith`，其类型为 {anchorTerm joinStringsWith}`String → String → String → String`，该函数通过把第一个参数放在第二和第三个参数之间来创建一个新字符串。{anchorEvalStep joinStringsWithEx 0}`joinStringsWith ", " "one" "and another"` 应该求值为 {anchorEvalStep joinStringsWithEx 1}`"one, and another"`。
 * {anchorTerm joinStringsWith}`joinStringsWith ": "` 的类型是什么？用 Lean 验证你的答案。
 * 定义函数 {anchorName volume}`volume`，其类型为 {anchorTerm volume}`Nat → Nat → Nat → Nat`，用于计算给定高度、宽度和深度的长方体的体积。

# 定义类型

大多数带类型的编程语言都有某种为类型定义别名的机制，例如 C 的 {c}`typedef`。然而，在 Lean 中，类型是语言的一等公民——它们和其他表达式一样。这意味着定义可以引用类型，就像引用其他值一样。

例如，如果觉得 {anchorName StringTypeDef}`String` 太长，可以定义一个更短的缩写 {anchorName StringTypeDef}`Str`：

```anchor StringTypeDef
def Str : Type := String
```

然后就可以用 {anchorName aStr}`Str` 作为定义的类型，而不是 {anchorName StringTypeDef}`String`：

```anchor aStr
def aStr : Str := "This is a string."
```

之所以能这样做，是因为类型遵循 Lean 中其他部分相同的规则。类型就是表达式，而在表达式中，已定义的名称可以被替换为其定义。因为 {anchorName aStr}`Str` 被定义为表示 {anchorName Book}`String`，所以 {anchorName aStr}`aStr` 的定义是合理的。

## 你可能会遇到的消息

用定义来创建类型的实验会因为 Lean 支持整数字面量重载而变得更加复杂。如果觉得 {anchorName NaturalNumberTypeDef}`Nat` 太短，可以定义一个更长的名称 {anchorName NaturalNumberTypeDef}`NaturalNumber`：

```anchor NaturalNumberTypeDef
def NaturalNumber : Type := Nat
```

然而，用 {anchorName NaturalNumberTypeDef}`NaturalNumber` 作为定义的类型来代替 {anchorName NaturalNumberTypeDef}`Nat` 并不会产生预期的效果。特别是，如下定义：

```anchor thirtyEight
def thirtyEight : NaturalNumber := 38
```

会导致如下错误：

```anchorError thirtyEight
failed to synthesize
  OfNat NaturalNumber 38
numerals are polymorphic in Lean, but the numeral `38` cannot be used in a context where the expected type is
  NaturalNumber
due to the absence of the instance above

Hint: Additional diagnostic information may be available using the `set_option diagnostics true` command.
```

这个错误的发生是因为 Lean 允许数字字面量被 _重载_。在合理的情况下，自然数字面量可以用于新类型，就好像这些类型内建于系统中一样。这是 Lean 使命的一部分：让数学表示更加方便，而数学的不同分支对数字符号有着非常不同的用途。实现这种重载的具体机制在查找重载之前不会把所有已定义名称替换为它们的定义，这就导致了上面的错误信息。

解决这一限制的一种办法是在定义的右侧显式给出类型 {anchorName thirtyEightFixed}`Nat`，从而让 {anchorName thirtyEightFixed}`Nat` 的重载规则被用于 {anchorTerm thirtyEightFixed}`38`：

```anchor thirtyEightFixed
def thirtyEight : NaturalNumber := (38 : Nat)
```

这个定义仍然是类型正确的，因为 {anchorEvalStep NaturalNumberDef 0}`NaturalNumber` 和 {anchorEvalStep NaturalNumberDef 1}`Nat` 是同一个类型——根据定义！

另一种解决方案是为 {anchorName NaturalNumberDef}`NaturalNumber` 定义一个与 {anchorName NaturalNumberDef}`Nat` 等价的重载。不过，这需要用到 Lean 更高级的特性。

最后，使用 {kw}`abbrev` 而不是 {kw}`def` 来为 {anchorName NaturalNumberDef}`Nat` 定义新名称，可以让重载解析把已定义名称替换为其定义。用 {kw}`abbrev` 写出的定义总是会被展开。例如，

```anchor NTypeDef
abbrev N : Type := Nat
```

和

```anchor thirtyNine
def thirtyNine : N := 39
```

都可以被无错误地接受。

在幕后，有些定义在内部被标记为在重载解析期间可展开，而另一些则不是。会被展开的定义称为 _可约的_（reducible）。对可约性的控制对 Lean 的扩展性至关重要：完全展开所有定义可能会产生非常大的类型，既让机器处理变慢，也让用户难以理解。用 {kw}`abbrev` 生成的定义会被标记为可约。
