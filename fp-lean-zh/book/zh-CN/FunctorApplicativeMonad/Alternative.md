# Alternative

%%%
tag := "alternative"
%%%


## 从失败中恢复
%%%
tag := "alternative-recovery"
%%%

{anchorName Validate}`Validate` 也可用于输入有多种可接受方式的情形。
对于输入表单 {anchorName RawInput}`RawInput`，一套实现遗留系统惯例的替代业务规则可能是：

 1. 所有人类用户必须提供四位数的出生年份。
 2. 1970 年之前出生的用户不必提供姓名，因为较早的记录不完整。
 3. 1970 年之后出生的用户必须提供姓名。
 4. 公司应把 {anchorTerm checkCompany}`"FIRM"` 作为出生年份输入，并提供公司名称。

对 1970 年出生的用户没有特别规定。
预计他们会放弃、谎报出生年份，或者打电话。
公司认为这是可接受的业务成本。

以下归纳类型捕获了这些规则所能产生的值：

```anchor LegacyCheckedInput
abbrev NonEmptyString := {s : String // s ≠ ""}

inductive LegacyCheckedInput where
  | humanBefore1970 :
    (birthYear : {y : Nat // y > 999 ∧ y < 1970}) →
    String →
    LegacyCheckedInput
  | humanAfter1970 :
    (birthYear : {y : Nat // y > 1970}) →
    NonEmptyString →
    LegacyCheckedInput
  | company :
    NonEmptyString →
    LegacyCheckedInput
deriving Repr
```

不过，针对这些规则的验证器更复杂，因为它必须处理所有三种情况。
虽然可以写成一系列嵌套的 {kw}`if` 表达式，但分别设计三种情况再组合起来更容易。
这需要在保留错误信息的同时，有一种从失败中恢复的手段：

```anchor ValidateorElse
def Validate.orElse
    (a : Validate ε α)
    (b : Unit → Validate ε α) :
    Validate ε α :=
  match a with
  | .ok x => .ok x
  | .errors errs1 =>
    match b () with
    | .ok x => .ok x
    | .errors errs2 => .errors (errs1 ++ errs2)
```

这种从失败中恢复的模式足够常见，Lean 为它提供了内置语法，附着在一个名为 {anchorName OrElse}`OrElse` 的类型类上：

```anchor OrElse
class OrElse (α : Type) where
  orElse : α → (Unit → α) → α
```
表达式 {anchorTerm OrElseSugar}`E1 <|> E2` 是 {anchorTerm OrElseSugar}`OrElse.orElse E1 (fun () => E2)` 的简写。
{anchorName Validate}`Validate` 的 {anchorName OrElse}`OrElse` 实例允许用这种语法进行错误恢复：

```anchor OrElseValidate
instance : OrElse (Validate ε α) where
  orElse := Validate.orElse
```

{anchorName LegacyCheckedInput}`LegacyCheckedInput` 的验证器可以由每个构造子的验证器构建。
公司的规则规定出生年份应为字符串 {anchorTerm checkCompany}`"FIRM"`，且名称非空。
然而，构造子 {anchorName names1}`LegacyCheckedInput.company` 根本没有出生年份的表示，因此没有简单的方法用 {anchorTerm checkCompanyProv}`<*>` 携带它。
关键在于使用一个与 {anchorTerm checkCompanyProv}`<*>` 配合的函数，忽略其参数。

在不把这一事实的任何证据记录到类型中的情况下检查布尔条件是否成立，可以用 {anchorName checkThat}`checkThat` 完成：

```anchor checkThat
def checkThat (condition : Bool)
    (field : Field) (msg : String) :
    Validate (Field × String) Unit :=
  if condition then pure () else reportError field msg
```
{anchorName checkCompanyProv}`checkCompany` 的这个定义使用了 {anchorName checkCompanyProv}`checkThat`，然后丢弃得到的 {anchorName checkThat}`Unit` 值：

```anchor checkCompanyProv
def checkCompany (input : RawInput) :
    Validate (Field × String) LegacyCheckedInput :=
  pure (fun () name => .company name) <*>
    checkThat (input.birthYear == "FIRM")
      "birth year" "FIRM if a company" <*>
    checkName input.name
```

不过，这个定义相当冗长。
可以用两种方式简化。
第一种是把第一次使用的 {anchorTerm checkCompanyProv}`<*>` 替换为专门版本，自动忽略第一个参数返回的值，称为 {anchorTerm checkCompany}`*>`。
该运算符也由一个类型类控制，名为 {anchorName ClassSeqRight}`SeqRight`，{anchorTerm seqRightSugar}`E1 *> E2` 是 {anchorTerm seqRightSugar}`SeqRight.seqRight E1 (fun () => E2)` 的语法糖：

```anchor ClassSeqRight
class SeqRight (f : Type → Type) where
  seqRight : f α → (Unit → f β) → f β
```
{anchorName ClassSeqRight}`seqRight` 有一个用 {anchorName fakeSeq}`seq` 表达的默认实现：{lit}`seqRight (a : f α) (b : Unit → f β) : f β := pure (fun _ x => x) <*> a <*> b ()`。

使用 {anchorName ClassSeqRight}`seqRight`，{anchorName checkCompanyProv2}`checkCompany` 变得更简单：

```anchor checkCompanyProv2
def checkCompany (input : RawInput) :
    Validate (Field × String) LegacyCheckedInput :=
  checkThat (input.birthYear == "FIRM")
    "birth year" "FIRM if a company" *>
  pure .company <*> checkName input.name
```
还可以再简化一步。
对每个 {anchorName ApplicativeExcept}`Applicative`，{anchorTerm ApplicativeLaws}`pure f <*> E` 等价于 {anchorTerm ApplicativeLaws}`f <$> E`。
换言之，用 {anchorName fakeSeq}`seq` 去应用一个已用 {anchorName ApplicativeExtendsFunctorOne}`pure` 放入 {anchorName ApplicativeExtendsFunctorOne}`Applicative` 类型的函数，是大材小用，该函数本可以直接用 {anchorName ApplicativeLaws}`Functor.map` 应用。
这一简化得到：

```anchor checkCompany
def checkCompany (input : RawInput) :
    Validate (Field × String) LegacyCheckedInput :=
  checkThat (input.birthYear == "FIRM")
    "birth year" "FIRM if a company" *>
  .company <$> checkName input.name
```

{anchorName LegacyCheckedInput}`LegacyCheckedInput` 的其余两个构造子对其字段使用子类型。
一个通用的子类型检查工具会使它们更易读：

```anchor checkSubtype
def checkSubtype {α : Type} (v : α) (p : α → Prop) [Decidable (p v)]
    (err : ε) : Validate ε {x : α // p x} :=
  if h : p v then
    pure ⟨v, h⟩
  else
    .errors { head := err, tail := [] }
```
在函数的参数列表中，类型类 {anchorTerm checkSubtype}`[Decidable (p v)]` 必须出现在参数 {anchorName checkSubtype}`v` 和 {anchorName checkSubtype}`p` 的说明之后。
否则，它会引用另一组自动隐式参数，而不是手动提供的值。
{anchorName checkSubtype}`Decidable` 实例使得可以用 {kw}`if` 检查命题 {anchorTerm checkSubtype}`p v`。

两个人类情况不需要任何额外工具：

```anchor checkHumanBefore1970
def checkHumanBefore1970 (input : RawInput) :
    Validate (Field × String) LegacyCheckedInput :=
  (checkYearIsNat input.birthYear).andThen fun y =>
    .humanBefore1970 <$>
      checkSubtype y (fun x => x > 999 ∧ x < 1970)
        ("birth year", "less than 1970") <*>
      pure input.name
```

```anchor checkHumanAfter1970
def checkHumanAfter1970 (input : RawInput) :
    Validate (Field × String) LegacyCheckedInput :=
  (checkYearIsNat input.birthYear).andThen fun y =>
    .humanAfter1970 <$>
      checkSubtype y (· > 1970)
        ("birth year", "greater than 1970") <*>
      checkName input.name
```

三种情况的验证器可以用 {anchorTerm OrElseSugar}`<|>` 组合：

```anchor checkLegacyInput
def checkLegacyInput (input : RawInput) :
    Validate (Field × String) LegacyCheckedInput :=
  checkCompany input <|>
  checkHumanBefore1970 input <|>
  checkHumanAfter1970 input
```

成功的情况按预期返回 {anchorName LegacyCheckedInput}`LegacyCheckedInput` 的构造子：
```anchor trollGroomers
#eval checkLegacyInput ⟨"Johnny's Troll Groomers", "FIRM"⟩
```
```anchorInfo trollGroomers
Validate.ok (LegacyCheckedInput.company "Johnny's Troll Groomers")
```
```anchor johnny
#eval checkLegacyInput ⟨"Johnny", "1963"⟩
```
```anchorInfo johnny
Validate.ok (LegacyCheckedInput.humanBefore1970 1963 "Johnny")
```
```anchor johnnyAnon
#eval checkLegacyInput ⟨"", "1963"⟩
```
```anchorInfo johnnyAnon
Validate.ok (LegacyCheckedInput.humanBefore1970 1963 "")
```

最糟糕的输入会返回所有可能的失败：
```anchor allFailures
#eval checkLegacyInput ⟨"", "1970"⟩
```
```anchorInfo allFailures
Validate.errors
  { head := ("birth year", "FIRM if a company"),
    tail := [("name", "Required"),
             ("birth year", "less than 1970"),
             ("birth year", "greater than 1970"),
             ("name", "Required")] }
```


## {lit}`Alternative` 类型类
%%%
tag := "Alternative"
%%%

许多类型都支持失败与恢复的概念。
{ref "nondeterministic-search"}[在多种单子中求值算术表达式] 一节中的 {anchorName AlternativeMany}`Many` 单子就是这样一种类型，{anchorName AlternativeOption}`Option` 也是。
两者都支持失败而不提供原因（不像，比如说，{anchorName ApplicativeExcept}`Except` 和 {anchorName Validate}`Validate`，它们需要某种关于出错内容的指示）。

{anchorName FakeAlternative}`Alternative` 类型类描述具有额外失败与恢复运算符的应用函子：

```anchor FakeAlternative
class Alternative (f : Type → Type) extends Applicative f where
  failure : f α
  orElse : f α → (Unit → f α) → f α
```
正如 {anchorTerm misc}`Add α` 的实现者可以免费获得 {anchorTerm misc}`HAdd α α α` 实例一样，{anchorName FakeAlternative}`Alternative` 的实现者可以免费获得 {anchorName OrElse}`OrElse` 实例：

```anchor AltOrElse
instance [Alternative f] : OrElse (f α) where
  orElse := Alternative.orElse
```

{anchorName ApplicativeOption}`Option` 的 {anchorName FakeAlternative}`Alternative` 实现保留第一个非 {anchorName ApplicativeOption}`none` 的参数：

```anchor AlternativeOption
instance : Alternative Option where
  failure := none
  orElse
    | some x, _ => some x
    | none, y => y ()
```
类似地，{anchorName AlternativeMany}`Many` 的实现遵循 {moduleName (module := Examples.Monads.Many)}`Many.union` 的一般结构，由于引入惰性的 {anchorName guard}`Unit` 参数位置不同，有细微差别：

```anchor AlternativeMany
def Many.orElse : Many α → (Unit → Many α) → Many α
  | .none, ys => ys ()
  | .more x xs, ys => .more x (fun () => orElse (xs ()) ys)

instance : Alternative Many where
  failure := .none
  orElse := Many.orElse
```

与其他类型类一样，{anchorName FakeAlternative}`Alternative` 使得可以定义适用于_任何_实现了 {anchorName FakeAlternative}`Alternative` 的应用函子的多种运算。
其中最重要的是 {anchorName guard}`guard`，当可判定命题为假时导致 {anchorName guard}`failure`：

```anchor guard
def guard [Alternative f] (p : Prop) [Decidable p] : f Unit :=
  if p then
    pure ()
  else failure
```
它在单子程序中提前终止执行非常有用。
在 {anchorName evenDivisors}`Many` 中，它可以用来过滤掉搜索的整个分支，如下面的程序计算自然数的所有偶因子：

```anchor evenDivisors
def Many.countdown : Nat → Many Nat
  | 0 => .none
  | n + 1 => .more n (fun () => countdown n)

def evenDivisors (n : Nat) : Many Nat := do
  let k ← Many.countdown (n + 1)
  guard (k % 2 = 0)
  guard (n % k = 0)
  pure k
```
在 {anchorTerm evenDivisors20}`20` 上运行得到预期结果：
```anchor evenDivisors20
#eval (evenDivisors 20).takeAll
```
```anchorInfo evenDivisors20
[20, 10, 4, 2]
```


## 练习
%%%
tag := "Alternative-exercises"
%%%

### 改善验证的友好性
%%%
tag := none
%%%

使用 {anchorTerm OrElseSugar}`<|>` 的 {anchorName Validate}`Validate` 程序返回的错误可能难以阅读，因为出现在错误列表中仅仅意味着该错误可以通过_某条_代码路径到达。
更结构化的错误报告可以更准确地引导用户完成流程：

 * 把 {anchorName Validate}`NonEmptyList` 在 {anchorName misc}`Validate.errors` 中替换为裸类型变量，然后更新 {anchorTerm ApplicativeValidate}`Applicative (Validate ε)` 和 {anchorTerm OrElseValidate}`OrElse (Validate ε α)` 实例的定义，只要求存在 {anchorTerm misc}`Append ε` 实例。
 * 定义函数 {anchorTerm misc}`Validate.mapErrors : Validate ε α → (ε → ε') → Validate ε' α`，转换验证运行中的所有错误。
 * 使用数据类型 {anchorName TreeError}`TreeError` 表示错误，重写遗留验证系统以跟踪它在三种备选路径中的行进。
 * 编写函数 {anchorTerm misc}`report : TreeError → String`，输出 {anchorName TreeError}`TreeError` 累积的警告和错误的用户友好视图。

```anchor TreeError
inductive TreeError where
  | field : Field → String → TreeError
  | path : String → TreeError → TreeError
  | both : TreeError → TreeError → TreeError

instance : Append TreeError where
  append := .both
```