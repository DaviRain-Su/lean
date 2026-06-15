# 插章：命题、证明与索引

与许多语言一样，Lean 使用方括号对数组和列表进行索引。
例如，如果 {moduleTerm}`woodlandCritters` 定义如下：

```anchor woodlandCritters
def woodlandCritters : List String :=
  ["hedgehog", "deer", "snail"]
```

那么可以提取各个元素：

```anchor animals
def hedgehog := woodlandCritters[0]
def deer := woodlandCritters[1]
def snail := woodlandCritters[2]
```

然而，尝试提取第四个元素会产生编译时错误，而不是运行时错误：

```anchor outOfBounds
def oops := woodlandCritters[3]
```

```anchorError outOfBounds
failed to prove index is valid, possible solutions:
  - Use `have`-expressions to prove the index is valid
  - Use `a[i]!` notation instead, runtime check is performed, and 'Panic' error message is produced if index is not valid
  - Use `a[i]?` notation instead, result is an `Option` type
  - Use `a[i]'h` notation instead, where `h` is a proof that index is valid
⊢ 3 < woodlandCritters.length
```

这条错误信息表明，Lean 试图自动从数学上证明 {moduleTerm}`3 < woodlandCritters.length`（即 {moduleTerm}`3 < List.length woodlandCritters`），从而说明这次查找是安全的，但未能做到。
越界错误是一类常见的 bug，Lean 利用其作为编程语言和定理证明器的双重特性，尽可能排除这类错误。

要理解这是如何工作的，需要掌握三个关键概念：命题（proposition）、证明（proof）和策略（tactic）。

# 命题与证明

**命题（proposition）**是可以为真或为假的陈述。
以下英文句子都是命题：

 * $`1 + 1 = 2`
 * 加法满足交换律。
 * 存在无穷多个素数。
 * $`1 + 1 = 15`
 * 巴黎是法国的首都。
 * 布宜诺斯艾利斯是韩国的首都。
 * 所有鸟类都会飞。

另一方面，无意义的陈述不是命题。
尽管语法正确，以下句子都不是命题：

 * 1 + green = ice cream
 * 所有首都城市都是素数。
 * 至少有一个 gorg 是 fleep。

命题分为两类：纯粹数学的命题，仅依赖我们对概念的定义；以及关于世界事实的命题。
像 Lean 这样的定理证明器关注前者，对企鹅的飞行能力或城市的法律地位无话可说。

**证明（proof）**是令人信服地论证某个命题为真的过程。
对于数学命题，这些论证利用所涉及概念的定义以及逻辑推理的规则。
大多数证明是写给人类阅读的，省略了许多繁琐的细节。
像 Lean 这样的计算机辅助定理证明器，旨在让数学家编写证明时省略许多细节，由软件负责补全缺失的显式步骤。
这些步骤可以被机械地检查，从而降低疏漏或错误的可能性。

在 Lean 中，程序的类型描述了与之交互的方式。
例如，类型为 {moduleTerm}`Nat → List String` 的程序是一个接受 {moduleTerm}`Nat` 参数并产生字符串列表的函数。
换句话说，每种类型都规定了什么算作具有该类型的程序。

在 Lean 中，命题实际上就是类型。
它们规定了什么算作该陈述为真的证据。
命题通过提供这种证据来证明，Lean 会检查该证据。
另一方面，如果命题为假，则不可能构造出这种证据。

例如，命题 $`1 + 1 = 2` 可以直接在 Lean 中书写。
该命题的证据是构造子 {moduleTerm}`rfl`，它是 _reflexivity_（自反性）的缩写。
在数学中，若每个元素都与自身相关，则称一个关系是自反的；这是拥有合理的相等性概念的基本要求。
因为 {moduleTerm}`1 + 1` 会计算为 {moduleTerm}`2`，它们实际上是同一个东西：

```anchor onePlusOneIsTwo
def onePlusOneIsTwo : 1 + 1 = 2 := rfl
```

另一方面，{moduleTerm}`rfl` 无法证明假命题 $`1 + 1 = 15`：

```anchor onePlusOneIsFifteen
def onePlusOneIsFifteen : 1 + 1 = 15 := rfl
```

```anchorError onePlusOneIsFifteen
Type mismatch
  rfl
has type
  ?m.16 = ?m.16
but is expected to have type
  1 + 1 = 15
```

这条错误信息表明，{moduleTerm}`rfl` 可以在等式两边已经是同一个数时证明两个表达式相等。
因为 {moduleTerm}`1 + 1` 直接求值为 {moduleTerm}`2`，它们被视为相同，因此 {moduleTerm}`onePlusOneIsTwo` 可以被接受。
正如 {moduleTerm}`Type` 描述 {moduleTerm}`Nat`、{moduleTerm}`String` 和 {moduleTerm}`List (Nat × String × (Int → Float))` 等表示数据结构和函数的类型一样，{moduleTerm}`Prop` 描述命题。

当一个命题被证明后，它被称为**定理（theorem）**。
在 Lean 中，惯例是使用 {kw}`theorem` 关键字而非 {kw}`def` 来声明定理。
这有助于读者区分哪些声明意在作为数学证明，哪些是定义。
一般而言，对于证明，重要的是有证据表明命题为真，但具体提供了哪份证据并不特别重要。
而对于定义，具体选择了哪个值则非常重要——毕竟，一个总是返回 {anchorTerm SomeNats}`0` 的加法定义显然是错误的。
由于证明的细节对后续证明并不重要，使用 {kw}`theorem` 关键字可以让 Lean 编译器实现更高程度的并行化。

前面的例子可以改写如下：

```anchor onePlusOneIsTwoProp
def OnePlusOneIsTwo : Prop := 1 + 1 = 2

theorem onePlusOneIsTwo : OnePlusOneIsTwo := rfl
```


# 策略

证明通常使用**策略（tactic）**来书写，而不是直接提供证据。
策略是构造命题证据的小型程序。
这些程序在**证明状态（proof state）**中运行，该状态跟踪待证明的陈述（称为**目标（goal）**）以及可用于证明它的假设。
对目标运行一个策略会产生包含新目标的新证明状态。
当所有目标都被证明后，证明即告完成。

要用策略编写证明，在定义开头写上 {kw}`by`。
写 {kw}`by` 会将 Lean 切换到策略模式，直到下一个缩进块结束。
在策略模式下，Lean 会持续反馈当前的证明状态。
用策略书写的 {anchorTerm onePlusOneIsTwoTactics}`onePlusOneIsTwo` 仍然相当简短：

```anchor onePlusOneIsTwoTactics
theorem onePlusOneIsTwo : 1 + 1 = 2 := by
  decide
```

{tactic}`decide` 策略调用**判定过程（decision procedure）**，这是一种可以检查陈述是否为真或假的程序，并在两种情况下都返回合适的证明。
它主要用于处理像 {anchorTerm SomeNats}`1` 和 {anchorTerm SomeNats}`2` 这样的具体值。
本书中另外两个重要的策略是 {tactic}`simp`（"simplify" 的缩写）和 {tactic}`grind`，后者可以自动证明许多定理。

策略之所以有用，有以下几个原因：
 1. 许多证明若写到最细微的细节会非常复杂和繁琐，而策略可以自动化这些无趣的部分。
 2. 用策略书写的证明更容易长期维护，因为灵活的自动化可以弥补定义上的小幅变动。
 3. 由于单个策略可以证明许多不同的定理，Lean 可以在幕后使用策略，让用户免于手写证明。例如，数组查找需要证明索引在边界内，而策略通常可以构造该证明，无需用户操心。

在幕后，索引记法使用策略来证明用户的查找操作是安全的。
该策略会考虑许多关于算术的事实，将它们与任何局部已知的事实结合起来，尝试证明索引在边界内。

{tactic}`simp` 策略是 Lean 证明中的主力。
它将目标重写为尽可能简单的形式。
在许多情况下，这种重写会将陈述简化到可以自动证明的程度。
在幕后会构造详细的形式化证明，但使用 {tactic}`simp` 可以隐藏这种复杂性。

与 {tactic}`decide` 类似，{tactic}`grind` 策略用于完成证明。
它使用来自 SMT 求解器的一系列技术，可以证明各种各样的定理。
与 {tactic}`simp` 不同，{tactic}`grind` 若不能完整完成证明，就无法朝证明方向取得任何进展；它要么完全成功，要么失败。
{tactic}`grind` 策略非常强大、可定制且可扩展；正因其强大和灵活，当它未能证明定理时，其输出包含大量信息，可以帮助有经验的 Lean 用户诊断失败原因。
这对初学者来说可能令人不知所措，因此本章只使用 {tactic}`decide` 和 {tactic}`simp`。

# 联结词

逻辑的基本构建块，如"与"、"或"、"真"、"假"和"非"，称为**逻辑联结词（logical connective）**。
每个联结词定义了什么算作其成立的证据。
例如，要证明陈述"_A_ 且 _B_"，必须同时证明 _A_ 和 _B_。
这意味着"_A_ 且 _B_"的证据是一个包含 _A_ 的证据和 _B_ 的证据的对。
类似地，"_A_ 或 _B_"的证据由 _A_ 的证据或 _B_ 的证据组成。

特别地，这些联结词中的大多数像数据类型一样定义，它们拥有构造子。
如果 {anchorTerm AndProp}`A` 和 {anchorTerm AndProp}`B` 是命题，那么"{anchorTerm AndProp}`A` 且 {anchorTerm AndProp}`B`"（写作 {anchorTerm AndProp}`A ∧ B`）就是一个命题。
{anchorTerm AndProp}`A ∧ B` 的证据由构造子 {anchorTerm AndIntro}`And.intro` 组成，其类型为 {anchorTerm AndIntro}`A → B → A ∧ B`。
将 {anchorTerm AndIntro}`A` 和 {anchorTerm AndIntro}`B` 替换为具体命题，可以用 {anchorTerm AndIntroEx}`And.intro rfl rfl` 证明 {anchorTerm AndIntroEx}`1 + 1 = 2 ∧ "Str".append "ing" = "String"`。
当然，{tactic}`decide` 也足够强大，可以找到这个证明：

```anchor AndIntroExTac
theorem addAndAppend : 1 + 1 = 2 ∧ "Str".append "ing" = "String" := by
  decide
```


类似地，"{anchorTerm OrProp}`A` 或 {anchorTerm OrProp}`B`"（写作 {anchorTerm OrProp}`A ∨ B`）有两个构造子，因为证明"{anchorTerm OrProp}`A` 或 {anchorTerm OrProp}`B`"只需要两个底层命题之一为真。
有两个构造子：{anchorTerm OrIntro1}`Or.inl`，类型为 {anchorTerm OrIntro1}`A → A ∨ B`；以及 {anchorTerm OrIntro2}`Or.inr`，类型为 {anchorTerm OrIntro2}`B → A ∨ B`。

蕴含（如果 {anchorTerm impliesDef}`A` 则 {anchorTerm impliesDef}`B`）使用函数来表示。
特别地，一个将 {anchorTerm impliesDef}`A` 的证据转化为 {anchorTerm impliesDef}`B` 的证据的函数，本身就是 {anchorTerm impliesDef}`A` 蕴含 {anchorTerm impliesDef}`B` 的证据。
这与蕴含的通常描述不同——在通常描述中，{anchorTerm impliesDef}`A → B` 是 {anchorTerm impliesDef}`¬A ∨ B` 的简写——但两种表述是等价的。

因为"与"的证据是一个构造子，它可以用于模式匹配。
例如，证明 {anchorTerm andImpliesOr}`A` 且 {anchorTerm andImpliesOr}`B` 蕴含 {anchorTerm andImpliesOr}`A` 或 {anchorTerm andImpliesOr}`B` 的函数，会从 {anchorTerm andImpliesOr}`A` 且 {anchorTerm andImpliesOr}`B` 的证据中取出 {anchorTerm andImpliesOr}`A`（或 {anchorTerm andImpliesOr}`B`）的证据，然后用该证据产生 {anchorTerm andImpliesOr}`A` 或 {anchorTerm andImpliesOr}`B` 的证据：

```anchor andImpliesOr
theorem andImpliesOr : A ∧ B → A ∨ B :=
  fun andEvidence =>
    match andEvidence with
    | And.intro a b => Or.inl a
```


:::table +header
*
  - 联结词
  - Lean 语法
  - 证据
*
 -  真（True）
 -  {anchorName connectiveTable}`True`
 -  {anchorTerm connectiveTable}`True.intro : True`

*
 -  假（False）
 -  {anchorName connectiveTable}`False`
 -  无证据

*
 -  {anchorName connectiveTable}`A` 且 {anchorName connectiveTable}`B`
 -  {anchorTerm connectiveTable}`A ∧ B`
 -  {anchorTerm connectiveTable}`And.intro : A → B → A ∧ B`

*
 -  {anchorName connectiveTable}`A` 或 {anchorName connectiveTable}`B`
 -  {anchorTerm connectiveTable}`A ∨ B`
 -  {anchorTerm connectiveTable}`Or.inl : A → A ∨ B` 或 {anchorTerm connectiveTable}`Or.inr : B → A ∨ B`

*
 -  {anchorName connectiveTable}`A` 蕴含 {anchorName connectiveTable}`B`
 -  {anchorTerm connectiveTable}`A → B`
 -  一个将 {anchorName connectiveTable}`A` 的证据转化为 {anchorName connectiveTable}`B` 的证据的函数

*
 -  非 {anchorName connectiveTable}`A`
 -  {anchorTerm connectiveTable}`¬A`
 -  一个会将 {anchorName connectiveTable}`A` 的证据转化为 {anchorName connectiveTable}`False` 的证据的函数


:::

{tactic}`decide` 策略可以证明使用这些联结词的定理。
例如：

```anchor connectivesD
theorem onePlusOneOrLessThan : 1 + 1 = 2 ∨ 3 < 5 := by decide
theorem notTwoEqualFive : ¬(1 + 1 = 5) := by decide
theorem trueIsTrue : True := by decide
theorem trueOrFalse : True ∨ False := by decide
theorem falseImpliesTrue : False → True := by decide
```


# 证据作为参数

在某些情况下，安全地索引列表要求列表具有某个最小长度，但列表本身是一个变量而非具体值。
要使这次查找安全，必须有某些证据表明列表足够长。
使索引安全的最简单方法之一，是让执行数据结构中查找的函数将所需的安全性证据作为参数接受。
例如，一个返回列表中第三个条目的函数通常并不安全，因为列表可能包含零个、一个或两个条目：

```anchor thirdErr
def third (xs : List α) : α := xs[2]
```

```anchorError thirdErr
failed to prove index is valid, possible solutions:
  - Use `have`-expressions to prove the index is valid
  - Use `a[i]!` notation instead, runtime check is performed, and 'Panic' error message is produced if index is not valid
  - Use `a[i]?` notation instead, result is an `Option` type
  - Use `a[i]'h` notation instead, where `h` is a proof that index is valid
α : Type ?u.5379
xs : List α
⊢ 2 < xs.length
```

然而，通过添加一个由证明索引操作安全的证据组成的参数，可以将证明列表至少有三个条目的义务施加给调用者：

```anchor third
def third (xs : List α) (ok : xs.length > 2) : α := xs[2]
```

在这个例子中，{anchorTerm third}`xs.length > 2` 不是一个检查 {anchorTerm third}`xs` _是否_有超过 2 个条目的程序。
它是一个可能为真或为假的命题，参数 {anchorTerm third}`ok` 必须是它为真的证据。

当函数在一个具体列表上调用时，其长度是已知的。
在这些情况下，{anchorTerm thirdCritters}`by decide` 可以自动构造证据：

```anchor thirdCritters
#eval third woodlandCritters (by decide)
```

```anchorInfo thirdCritters
"snail"
```


# 无需证据的索引

在无法实际证明索引操作在边界内的情况下，还有其他替代方案。
添加问号会得到一个 {anchorName thirdOption}`Option`，如果索引在边界内，结果为 {anchorName OptionNames}`some`；否则为 {anchorName OptionNames}`none`。
例如：


```anchor thirdOption
def thirdOption (xs : List α) : Option α := xs[2]?
```

```anchor thirdOptionCritters
#eval thirdOption woodlandCritters
```

```anchorInfo thirdOptionCritters
some "snail"
```

```anchor thirdOptionTwo
#eval thirdOption ["only", "two"]
```

```anchorInfo thirdOptionTwo
none
```

:::paragraph
还有一个版本会在索引越界时使程序崩溃，而不是返回 {moduleTerm}`Option`：

```anchor crittersBang
#eval woodlandCritters[1]!
```

```anchorInfo crittersBang
"deer"
```
:::


# 你可能遇到的提示信息

除了证明一个陈述为真之外，{anchorTerm thirdRabbitErr}`decide` 策略还可以证明它为假。
当被要求证明一个单元素列表有超过两个元素时，它会返回一条错误，表明该陈述确实为假：

```anchor thirdRabbitErr
#eval third ["rabbit"] (by decide)
```


```anchorError thirdRabbitErr
Tactic `decide` proved that the proposition
  ["rabbit"].length > 2
is false
```


{tactic}`simp` 和 {tactic}`decide` 策略不会自动展开用 {kw}`def` 定义的定义。
尝试用 {anchorTerm onePlusOneIsStillTwo}`simp` 证明 {anchorTerm onePlusOneIsStillTwo}`OnePlusOneIsTwo` 会失败：

```anchor onePlusOneIsStillTwo
theorem onePlusOneIsStillTwo : OnePlusOneIsTwo := by simp
```

错误信息只是说它无能为力，因为如果不展开 {anchorTerm onePlusOneIsStillTwo}`OnePlusOneIsTwo`，就无法取得任何进展：

```anchorError onePlusOneIsStillTwo
`simp` made no progress
```

使用 {anchorTerm onePlusOneIsStillTwo2}`decide` 也会失败：

```anchor onePlusOneIsStillTwo2
theorem onePlusOneIsStillTwo : OnePlusOneIsTwo := by decide
```

这也是因为它不会展开 {anchorName onePlusOneIsStillTwo2}`OnePlusOneIsTwo`：

```anchorError onePlusOneIsStillTwo2
failed to synthesize
  Decidable OnePlusOneIsTwo

Hint: Additional diagnostic information may be available using the `set_option diagnostics true` command.
```

用 {ref "abbrev-vs-def"}[{kw}`abbrev` 定义 {anchorName onePlusOneIsStillTwo}`OnePlusOneIsTwo`] 可以解决这个问题，因为它将该定义标记为可展开。

除了 Lean 无法找到编译时证据表明索引操作安全时出现的错误之外，使用不安全索引的多态函数还可能产生以下提示：

```anchor unsafeThird
def unsafeThird (xs : List α) : α := xs[2]!
```


```anchorError unsafeThird
failed to synthesize
  Inhabited α

Hint: Additional diagnostic information may be available using the `set_option diagnostics true` command.
```

这是由于一项技术限制，目的是让 Lean 既能作为证明定理的逻辑，又能作为编程语言使用。
特别地，只有类型中至少包含一个值的程序才允许崩溃。
这是因为 Lean 中的命题是一种对真之证据进行分类的类型。
假命题没有这种证据。
如果具有空类型的程序可以崩溃，那么该崩溃程序就可以被用作假命题的一种虚假证据。

在内部，Lean 维护着一张已知至少有一个值的类型的表。
这条错误是说某个任意类型 {anchorTerm unsafeThird}`α` 不一定在这张表中。
下一章将介绍如何向这张表添加条目，以及如何成功编写像 {anchorTerm unsafeThird}`unsafeThird` 这样的函数。

在列表和用于查找的方括号之间添加空格会导致另一条提示：

```anchor extraSpace
#eval woodlandCritters [1]
```


```anchorError extraSpace
Function expected at
  woodlandCritters
but this term has type
  List String

Note: Expected a function because this term is being applied to the argument
  [1]
```

添加空格会使 Lean 将该表达式视为函数应用，而将索引视为包含单个数字的列表。
这条错误信息源于 Lean 试图将 {anchorTerm woodlandCritters}`woodlandCritters` 当作函数处理。

## 练习

* 使用 {anchorTerm exercises}`rfl` 证明以下定理：{anchorTerm exercises}`2 + 3 = 5`、{anchorTerm exercises}`15 - 8 = 7`、{anchorTerm exercises}`"Hello, ".append "world" = "Hello, world"`。如果用 {anchorTerm exercises}`rfl` 证明 {anchorTerm exercises}`5 < 18` 会发生什么？为什么？
* 使用 {anchorTerm exercises}`by decide` 证明以下定理：{anchorTerm exercises}`2 + 3 = 5`、{anchorTerm exercises}`15 - 8 = 7`、{anchorTerm exercises}`"Hello, ".append "world" = "Hello, world"`、{anchorTerm exercises}`5 < 18`。
* 编写一个查找列表中第五个条目的函数。将证明这次查找安全的证据作为参数传递给该函数。