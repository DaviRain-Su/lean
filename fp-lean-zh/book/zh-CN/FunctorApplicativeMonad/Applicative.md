# 应用函子

_应用函子（applicative functor）_ 是一种函子，它额外提供两个运算：{anchorName ApplicativeOption}`pure` 和 {anchorName ApplicativeOption}`seq`。
{anchorName ApplicativeOption}`pure` 与 {anchorName ApplicativeLaws}`Monad` 中使用的运算符相同，因为 {anchorName ApplicativeLaws}`Monad` 实际上继承自 {anchorName ApplicativeOption}`Applicative`。
{anchorName ApplicativeOption}`seq` 很像 {anchorName FunctorNames}`map`：它允许使用函数来变换数据类型中的内容。
不过，在 {anchorName ApplicativeOption}`seq` 中，函数本身也包含在数据类型中：{anchorTerm seqType}`f (α → β) → (Unit → f α) → f β`。
让函数处于类型 {anchorName seqType}`f` 之下，使得 {anchorName ApplicativeOption}`Applicative` 实例可以控制函数如何被应用，而 {anchorName FunctorNames}`Functor.map` 则会无条件地应用函数。
第二个参数的类型以 {anchorTerm seqType}`Unit →` 开头，这样 {anchorName ApplicativeOption}`seq` 的定义就可以在函数永远不会被应用的情况下短路求值。

这种短路行为的价值，可以从 {anchorTerm ApplicativeOption}`Applicative Option` 的实例中看出：

```anchor ApplicativeOption
instance : Applicative Option where
  pure x := .some x
  seq f x :=
    match f with
    | none => none
    | some g => g <$> x ()
```
在这种情况下，如果没有可供 {anchorName ApplicativeOption}`seq` 应用的函数，就没有必要计算其参数，因此 {anchorName ApplicativeOption}`x` 永远不会被调用。
同样的考虑也体现在 {anchorName ApplicativeExcept}`Except` 的 {anchorName ApplicativeExcept}`Applicative` 实例中：

```anchor ApplicativeExcept
instance : Applicative (Except ε) where
  pure x := .ok x
  seq f x :=
    match f with
    | .error e => .error e
    | .ok g => g <$> x ()
```
这种短路行为只取决于_包裹_函数的那些 {anchorName AlternativeOption}`Option` 或 {anchorName ApplicativeExcept}`Except` 结构，而不取决于函数本身。

单子可以看作是把顺序执行语句这一概念引入纯函数式语言的一种方式。
一条语句的结果可以影响后续哪些语句会运行。
这一点体现在 {anchorName bindType}`bind` 的类型上：{anchorTerm bindType}`m α → (α → m β) → m β`。
第一条语句的结果值会作为输入，传给一个计算下一条要执行语句的函数。
连续使用 {anchorName bindType}`bind`，就像命令式编程语言中的一串语句；{anchorName bindType}`bind` 也足够强大，可以实现条件分支和循环等控制结构。

顺着这个类比，{anchorName ApplicativeId}`Applicative` 刻画的是带副作用语言中的函数应用。
在 Kotlin 或 C# 这类语言中，函数的参数从左到右求值。
较早参数产生的副作用，会发生在较晚参数产生的副作用之前。
不过，函数本身并不足以实现依赖某个参数具体_值_的自定义短路运算符。

通常，{anchorName ApplicativeExtendsFunctorOne}`seq` 不会直接调用。
取而代之的是使用运算符 {lit}`<*>`。
该运算符会把第二个参数包装成 {lit}`fun () => ...`，从而简化调用点。
换句话说，{anchorTerm seqSugar}`E1 <*> E2` 是 {anchorTerm seqSugar}`Seq.seq E1 (fun () => E2)` 的语法糖。


使 {anchorName ApplicativeExtendsFunctorOne}`seq` 能够用于多个参数的关键特性在于：Lean 中的多参数函数，实际上是一个单参数函数，它返回另一个仍在等待其余参数的函数。
换句话说，如果 {anchorName ApplicativeExtendsFunctorOne}`seq` 的第一个参数正在等待多个参数，那么 {anchorName ApplicativeExtendsFunctorOne}`seq` 的结果也会继续等待其余参数。
例如，{anchorTerm somePlus}`some Plus.plus` 可以具有类型 {anchorTerm somePlus}`Option (Nat → Nat → Nat)`。
提供一个参数后，{anchorTerm somePlusFour}`some Plus.plus <*> some 4` 会得到类型 {anchorTerm somePlusFour}`Option (Nat → Nat)`。
这本身又可以与 {anchorName ApplicativeExtendsFunctorOne}`seq` 一起使用，因此 {anchorTerm somePlusFourSeven}`some Plus.plus <*> some 4 <*> some 7` 的类型是 {anchorTerm somePlusFourSeven}`Option Nat`。

并非每个函子都是应用函子。
{anchorName Pair}`Pair` 类似于内置的积类型 {anchorName names}`Prod`：

```anchor Pair
structure Pair (α β : Type) : Type where
  first : α
  second : β
```
与 {anchorName ApplicativeExcept}`Except` 一样，{anchorTerm PairType}`Pair` 的类型是 {anchorTerm PairType}`Type → Type → Type`。
这意味着 {anchorTerm FunctorPair}`Pair α` 的类型是 {anchorTerm PairType}`Type → Type`，因此可以给出 {anchorName FunctorPair}`Functor` 实例：

```anchor FunctorPair
instance : Functor (Pair α) where
  map f x := ⟨x.first, f x.second⟩
```
该实例遵守 {anchorName FunctorPair}`Functor` 约定。

需要检查的两个性质是：{anchorEvalStep checkPairMapId 0}`id <$> Pair.mk x y`{lit}` = `{anchorEvalStep checkPairMapId 2}`Pair.mk x y`，以及 {anchorEvalStep checkPairMapComp1 0}`f <$> g <$> Pair.mk x y`{lit}` = `{anchorEvalStep checkPairMapComp2 0}`(f ∘ g) <$> Pair.mk x y`。
第一个性质可以通过逐步求值左侧来验证，并注意到它求值得到右侧：
```anchorEvalSteps checkPairMapId
id <$> Pair.mk x y
===>
Pair.mk x (id y)
===>
Pair.mk x y
```
第二个性质可以通过逐步求值两侧来验证，并注意到它们得到相同结果：
```anchorEvalSteps checkPairMapComp1
f <$> g <$> Pair.mk x y
===>
f <$> Pair.mk x (g y)
===>
Pair.mk x (f (g y))
```
```anchorEvalSteps checkPairMapComp2
(f ∘ g) <$> Pair.mk x y
===>
Pair.mk x ((f ∘ g) y)
===>
Pair.mk x (f (g y))
```

然而，尝试定义 {anchorName ApplicativeExcept}`Applicative` 实例时，情况就不那么顺利了。
这需要先定义 {anchorName Pairpure (show := pure)}`Pair.pure`：
```anchor Pairpure
def Pair.pure (x : β) : Pair α β := _
```
```anchorError Pairpure
don't know how to synthesize placeholder
context:
β α : Type
x : β
⊢ Pair α β
```
作用域中有一个类型为 {anchorName Pairpure2}`β` 的值（即 {anchorName Pairpure2}`x`），而下划线产生的错误信息表明，下一步应使用构造子 {anchorName Pairpure2}`Pair.mk`：
```anchor Pairpure2
def Pair.pure (x : β) : Pair α β := Pair.mk _ x
```
```anchorError Pairpure2
don't know how to synthesize placeholder for argument `first`
context:
β α : Type
x : β
⊢ α
```
不幸的是，没有可用的 {anchorName Pairpure2}`α`。
由于要为_所有可能的类型_ {anchorName Pairpure2}`α` 定义 {anchorTerm ApplicativePair}`Applicative (Pair α)` 的实例，{anchorName Pairpure2 (show := pure)}`Pair.pure` 必须对所有 {anchorName Pairpure2}`α` 都成立，而这不可能做到。
毕竟，调用者可以把 {anchorName Pairpure2}`α` 选成 {anchorName ApplicativePair}`Empty`，而 {anchorName ApplicativePair}`Empty` 根本没有任何值。

# 非单子的应用函子

在验证表单用户输入时，通常认为最好一次性提供多个错误，而不是一次只提供一个。
这样用户就能概览需要满足计算机的哪些要求，而不必在逐个字段修正错误时感到被不断催促。

理想情况下，执行验证的函数类型中应能看出用户输入验证这件事。
例如，检查文本框是否包含数字的验证，应返回真正的数值类型。
验证例程可以在输入未通过验证时抛出异常。
然而，异常有一个主要缺点：它们在第一个错误处就终止程序，因而无法累积错误列表。

另一方面，先累积错误列表、再在列表非空时失败这种常见设计模式也有问题。
用一长串嵌套的 {kw}`if` 语句来验证输入数据的各个子部分，难以维护，而且很容易漏掉一两个错误消息。
理想情况下，验证应使用这样一种 API：既能返回新值，又能自动跟踪并累积错误消息。

名为 {anchorName Validate}`Validate` 的应用函子，提供了一种实现这种 API 风格的方式。
与 {anchorName ApplicativeExcept}`Except` 单子一样，{anchorName Validate}`Validate` 允许构造一个能准确刻画已验证数据的新值。
但与 {anchorName ApplicativeExcept}`Except` 不同，它允许累积多个错误，而不必担心忘记检查列表是否为空。

## 用户输入

作为用户输入的例子，考虑下面的结构体：

```anchor RawInput
structure RawInput where
  name : String
  birthYear : String
```
需要实现的业务逻辑如下：
 1. 姓名不能为空
 2. 出生年份必须是数字，且非负
 3. 出生年份必须大于 1900，且小于或等于表单被验证时的年份

把这些规则表示成数据类型，需要一种称为_子类型（subtypes）_的新特性。
掌握这一工具之后，就可以编写一个使用应用函子来跟踪错误的验证框架，并在这个框架中实现这些规则。

## 子类型

表示这些条件时，借助 Lean 中一种额外的类型 {anchorName Subtype}`Subtype` 会最方便：

```anchor Subtype
structure Subtype {α : Type} (p : α → Prop) where
  val : α
  property : p val
```
这个结构体有两个类型参数：一个是隐式参数，表示数据类型 {anchorName Subtype}`α`；另一个是显式参数 {anchorName Subtype}`p`，它是定义在 {anchorName Subtype}`α` 上的一个谓词。
_谓词_ 是带有变量的逻辑命题；把变量替换成具体值后，就得到一个真正的命题，就像 {ref "overloading-indexing"}[{moduleName}`GetElem` 的索引参数] 描述索引在边界内对查找意味着什么那样。
在 {anchorName Subtype}`Subtype` 的情形中，谓词会从 {anchorName Subtype}`α` 的值中切出一部分，使谓词对这些值成立。
结构体的两个字段分别是：一个来自 {anchorName Subtype}`α` 的值，以及该值满足谓词 {anchorName Subtype}`p` 的证据。
Lean 为 {anchorName Subtype}`Subtype` 提供了特殊语法。
如果 {anchorName Subtype}`p` 的类型是 {anchorTerm Subtype}`α → Prop`，那么类型 {anchorTerm subtypeSugarIn}`Subtype p` 也可以写成 {anchorTerm subtypeSugar}`{x : α // p x}`，甚至在可以自动推断类型 {anchorName Subtype}`α` 时，还可以写成 {anchorTerm subtypeSugar2}`{x // p x}`。

{ref "positive-numbers"}[用归纳类型表示正数] 清晰且易于编程。
不过，它有一个关键缺点。
虽然从 Lean 程序的角度看，{anchorName names}`Nat` 和 {anchorName names}`Int` 具有普通归纳类型的结构，但编译器会特殊处理它们，并使用快速任意精度数库来实现。
用户定义的额外类型则不是这样。
不过，把 {anchorName names}`Nat` 限制为非零数的子类型，可以让新类型使用高效表示，同时在编译期排除零：

```anchor FastPos
def FastPos : Type := {x : Nat // x > 0}
```

最小的快速正数仍然是一。
现在，它不再是一个归纳类型的构造子，而是一个用尖括号构造的结构体实例。
第一个参数是底层的 {anchorName FastPos}`Nat`，第二个参数则是该 {anchorName FastPos}`Nat` 大于零的证据：

```anchor one
def one : FastPos := ⟨1, by decide⟩
```
命题 {anchorTerm onep}`1 > 0` 是可判定的，因此 {tactic}`decide` 策略可以生成所需的证据。
{anchorName OfNatFastPos}`OfNat` 实例与 {anchorName Pos (module:=Examples.Classes)}`Pos` 的非常相似，只是它用一个简短的策略证明来提供 {lit}`n + 1 > 0` 的证据：

```anchor OfNatFastPos
instance : OfNat FastPos (n + 1) where
  ofNat := ⟨n + 1, by simp⟩
```
这里需要 {tactic}`simp`，因为 {tactic}`decide` 要求具体值，而这里的命题是 {anchorTerm OfNatFastPosp}`n + 1 > 0`。

子类型是一把双刃剑。
它们允许高效地表示验证规则，但也会把这些规则的维护负担转移给库的使用者——使用者必须_证明_自己没有违反重要不变量。
通常，在库内部使用子类型是较好的做法，同时向用户提供一个 API，自动保证所有不变量都得到满足，任何必要的证明都留在库内部。

要检查类型为 {anchorName NatFastPosRemarks}`α` 的值是否属于子类型 {anchorTerm NatFastPosRemarks}`{x : α // p x}`，通常要求命题 {anchorTerm NatFastPosRemarks}`p x` 是可判定的。
{ref "equality-and-ordering"}[关于相等性与排序类型类的章节] 描述了如何把可判定命题与 {kw}`if` 一起使用。
当 {kw}`if` 与可判定命题一起使用时，可以提供一个名称。
在 {kw}`then` 分支中，该名称会绑定到命题为真的证据；在 {kw}`else` 分支中，则绑定到命题为假的证据。
这在检查某个给定的 {anchorName NatFastPos}`Nat` 是否为正数时很有用：

```anchor NatFastPos
def Nat.asFastPos? (n : Nat) : Option FastPos :=
  if h : n > 0 then
    some ⟨n, h⟩
  else none
```
在 {kw}`then` 分支中，{anchorName NatFastPos}`h` 会绑定到 {anchorTerm NatFastPos}`n > 0` 的证据，而这份证据可以作为 {anchorName Subtype}`Subtype` 构造子的第二个参数。


## 已验证的输入

已验证的用户输入是一个结构体，它用多种技术来表达业务逻辑：
 * 结构体类型本身编码了它被检查有效性的年份，因此 {anchorTerm CheckedInputEx}`CheckedInput 2019` 与 {anchorTerm CheckedInputEx}`CheckedInput 2020` 不是同一类型
 * 出生年份表示为 {anchorName CheckedInput}`Nat`，而不是 {anchorName CheckedInput}`String`
 * 子类型用于约束姓名和出生年份字段的允许值

```anchor CheckedInput
structure CheckedInput (thisYear : Nat) : Type where
  name : {n : String // n ≠ ""}
  birthYear : {y : Nat // y > 1900 ∧ y ≤ thisYear}
```

:::paragraph
输入验证器应以当前年份和一个 {anchorName RawInput}`RawInput` 为参数，返回已检查的输入，或至少一个验证失败。
这由 {anchorName Validate}`Validate` 类型表示：
```anchor Validate
inductive Validate (ε α : Type) : Type where
  | ok : α → Validate ε α
  | errors : NonEmptyList ε → Validate ε α
```
它看起来很像 {anchorName ApplicativeExcept}`Except`。
唯一的区别是，{anchorName Validate}`errors` 构造子可以包含多个失败。
:::

{anchorName Validate}`Validate` 是一个函子。
对它做映射，会变换其中可能存在的成功值，就像 {anchorName ApplicativeExcept}`Except` 的 {anchorName FunctorValidate}`Functor` 实例那样：

```anchor FunctorValidate
instance : Functor (Validate ε) where
  map f
   | .ok x => .ok (f x)
   | .errors errs => .errors errs
```

{anchorName ApplicativeValidate}`Validate` 的 {anchorName ApplicativeValidate}`Applicative` 实例，与 {anchorName ApplicativeExcept}`Except` 的实例有一个重要区别：{anchorName ApplicativeExcept}`Except` 的实例会在遇到第一个错误时终止，而 {anchorName ApplicativeValidate}`Validate` 的实例会小心地累积函数分支和参数分支中的_全部_错误：

```anchor ApplicativeValidate
instance : Applicative (Validate ε) where
  pure := .ok
  seq f x :=
    match f with
    | .ok g => g <$> (x ())
    | .errors errs =>
      match x () with
      | .ok _ => .errors errs
      | .errors errs' => .errors (errs ++ errs')
```

:::paragraph
把 {anchorName ApplicativeValidate}`.errors` 与 {anchorName Validate}`NonEmptyList` 的构造子一起使用，写法有些冗长。
像 {anchorName reportError}`reportError` 这样的辅助函数能让代码更易读。
在这个应用中，错误报告由字段名和消息配对组成：

```anchor Field
def Field := String
```

```anchor reportError
def reportError (f : Field) (msg : String) : Validate (Field × String) α :=
  .errors { head := (f, msg), tail := [] }
```
:::

{anchorName ApplicativeValidate}`Validate` 的 {anchorName ApplicativeValidate}`Applicative` 实例，允许为每个字段独立编写检查过程，然后再组合起来。
检查姓名时，要确保字符串非空，然后以 {anchorName Subtype}`Subtype` 的形式返回这一事实的证据。
这里使用的是会绑定证据的 {kw}`if` 版本：

```anchor checkName
def checkName (name : String) :
    Validate (Field × String) {n : String // n ≠ ""} :=
  if h : name = "" then
    reportError "name" "Required"
  else pure ⟨name, h⟩
```
在 {kw}`then` 分支中，{anchorName checkName}`h` 会绑定到 {anchorTerm checkName}`name = ""` 的证据；在 {kw}`else` 分支中，则绑定到 {lit}`¬name = ""` 的证据。

确实，有些验证错误会使其他检查无法进行。
例如，如果困惑的用户在数字字段里写了 {anchorTerm checkDavidSyzygy}`"syzygy"` 这个词，而不是数字，那么再去检查出生年份是否大于 1900 就没有意义。
只有在确认该字段确实包含数字之后，检查数字的允许范围才有意义。
这可以用函数 {anchorName ValidateAndThen (show := andThen)}`Validate.andThen` 来表达：

```anchor ValidateAndThen
def Validate.andThen (val : Validate ε α)
    (next : α → Validate ε β) : Validate ε β :=
  match val with
  | .errors errs => .errors errs
  | .ok x => next x
```
虽然这个函数的类型签名适合在 {anchorTerm bindType}`Monad` 实例中用作 {anchorName bindType}`bind`，但没有这样做的充分理由。
这些理由在 {ref "additional-stipulations"}[描述 {anchorName ApplicativeExcept}`Applicative` 约定的章节] 中说明。

要检查出生年份是否为数字，内置函数 {anchorTerm CheckedInputEx}`String.toNat? : String → Option Nat` 很有用。
为了对用户更友好，最好先使用 {anchorName CheckedInputEx}`String.trim` 去掉首尾空白：

```anchor checkYearIsNat
def checkYearIsNat (year : String) : Validate (Field × String) Nat :=
  match year.trim.toNat? with
  | none => reportError "birth year" "Must be digits"
  | some n => pure n
```

:::paragraph
要检查提供的年份是否落在预期范围内，需要嵌套使用会提供证据的 {kw}`if` 形式：

```anchor checkBirthYear
def checkBirthYear (thisYear year : Nat) :
    Validate (Field × String) {y : Nat // y > 1900 ∧ y ≤ thisYear} :=
  if h : year > 1900 then
    if h' : year ≤ thisYear then
      pure ⟨year, by simp [*]⟩
    else reportError "birth year" s!"Must be no later than {thisYear}"
  else reportError "birth year" "Must be after 1900"
```
:::

:::paragraph
最后，这三个组件可以用 {anchorTerm checkInput}`<*>` 组合起来：

```anchor checkInput
def checkInput (year : Nat) (input : RawInput) :
    Validate (Field × String) (CheckedInput year) :=
  pure CheckedInput.mk <*>
    checkName input.name <*>
    (checkYearIsNat input.birthYear).andThen fun birthYearAsNat =>
      checkBirthYear year birthYearAsNat
```
:::

:::paragraph
测试 {anchorName checkDavid1984}`checkInput` 表明，它确实可以返回多条反馈：
```anchor checkDavid1984
#eval checkInput 2023 {name := "David", birthYear := "1984"}
```
```anchorInfo checkDavid1984
Validate.ok { name := "David", birthYear := 1984 }
```
```anchor checkBlank2045
#eval checkInput 2023 {name := "", birthYear := "2045"}
```
```anchorInfo checkBlank2045
Validate.errors { head := ("name", "Required"), tail := [("birth year", "Must be no later than 2023")] }
```
```anchor checkDavidSyzygy
#eval checkInput 2023 {name := "David", birthYear := "syzygy"}
```
```anchorInfo checkDavidSyzygy
Validate.errors { head := ("birth year", "Must be digits"), tail := [] }
```
:::

用 {anchorName checkInput}`checkInput` 做表单验证，说明了 {anchorName ApplicativeNames}`Applicative` 相对 {anchorName MonadExtends}`Monad` 的一个关键优势。
因为 {lit}`>>=` 提供了足够的能力，可以根据第一步的值修改程序其余部分的执行，它_必须_从第一步接收一个值并继续传递。
如果没有收到值（例如因为发生了错误），{lit}`>>=` 就无法执行程序的其余部分。
{anchorName Validate}`Validate` 说明了为什么仍然运行程序的其余部分会很有用：在较早的数据并不需要的情况下，继续运行程序的其余部分仍能得到有用信息（在这里就是更多验证错误）。
{anchorName ApplicativeNames}`Applicative` 的 {lit}`<*>` 可以在重新组合结果之前先运行它的两个参数。
类似地，{lit}`>>=` 会强制顺序执行。
每一步都必须完成后，下一步才能运行。
这通常很有用，但它使不同线程的并行执行变得不可能——而并行执行本可以从程序的实际数据依赖中自然涌现。
像 {anchorName MonadExtends}`Monad` 这样更强大的抽象，会增加 API 使用者可用的灵活性，但会减少 API 实现者可用的灵活性。