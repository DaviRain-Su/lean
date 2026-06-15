# 强制转换

%%%
tag := "coercions"
%%%

在数学中，常见做法是在不同上下文中用同一符号表示某个对象的不同方面。
例如，当在期望集合的上下文中提到一个环时，人们理解所指是该环的底层集合。
在编程语言中，也常见有规则自动把一种类型的值翻译成另一种类型的值。
Java 允许将 {java}`byte` 自动提升为 {java}`int`，Kotlin 则允许在期望可空类型版本的上下文中使用非空类型。

在 Lean 中，这两种目的都由一种称为 {deftech}_强制转换（coercion）_ 的机制来服务。
当 Lean 在某个期望不同类型表达式的上下文中遇到某类型的表达式时，它会在报告类型错误之前尝试对该表达式进行强制转换。
与 Java、C 和 Kotlin 不同，强制转换可以通过定义类型类的实例来扩展。

# 字符串与路径

%%%
tag := "string-path-coercion"
%%%

在 {ref "handling-input"}[{lit}`feline` 源代码中处理输入的部分]，{moduleName}`String` 使用匿名构造子语法转换为 {moduleName}`FilePath`。
事实上，这并非必要：Lean 定义了从 {moduleName}`String` 到 {moduleName}`FilePath` 的强制转换，因此字符串可以用在期望路径的位置上。
尽管函数 {anchorTerm readFile}`IO.FS.readFile` 的类型是 {anchorTerm readFile}`System.FilePath → IO String`，以下代码仍被 Lean 接受：

```anchor fileDumper
def fileDumper : IO Unit := do
  let stdin ← IO.getStdin
  let stdout ← IO.getStdout
  stdout.putStr "Which file? "
  stdout.flush
  let f := (← stdin.getLine).trim
  stdout.putStrLn s!"'The file {f}' contains:"
  stdout.putStrLn (← IO.FS.readFile f)
```
{moduleName}`String.trim` 会去掉字符串首尾的空白字符。
在 {anchorName fileDumper}`fileDumper` 的最后一行，从 {moduleName}`String` 到 {moduleName}`FilePath` 的强制转换会自动转换 {anchorName fileDumper}`f`，因此不必写成 {lit}`IO.FS.readFile ⟨f⟩`。

# 正数

%%%
tag := "positive-number-coercion"
%%%

每个正数都对应一个自然数。
前面定义的函数 {anchorName posToNat}`Pos.toNat` 将 {moduleName}`Pos` 转换为对应的 {moduleName}`Nat`：

```anchor posToNat
def Pos.toNat : Pos → Nat
  | Pos.one => 1
  | Pos.succ n => n.toNat + 1
```
函数 {anchorName drop}`List.drop` 的类型为 {anchorTerm drop}`{α : Type} → Nat → List α → List α`，用于去掉列表的前缀。
然而，将 {anchorName drop}`List.drop` 应用于 {moduleName}`Pos` 会导致类型错误：
```anchorTerm dropPos
[1, 2, 3, 4].drop (2 : Pos)
```
```anchorError dropPos
Application type mismatch: The argument
  2
has type
  Pos
but is expected to have type
  Nat
in the application
  List.drop 2
```
由于 {anchorName drop}`List.drop` 的作者没有把它做成类型类的方法，因此无法通过定义新实例来覆盖它。

:::paragraph
类型类 {moduleName}`Coe` 描述了从一种类型强制转换到另一种类型的重载方式：

```anchor Coe
class Coe (α : Type) (β : Type) where
  coe : α → β
```
{anchorTerm CoePosNat}`Coe Pos Nat` 的一个实例就足以让前面的代码正常工作：

```anchor CoePosNat
instance : Coe Pos Nat where
  coe x := x.toNat
```
```anchor dropPosCoe
#eval [1, 2, 3, 4].drop (2 : Pos)
```
```anchorInfo dropPosCoe
[3, 4]
```
使用 {kw}`#check` 可以显示幕后使用的实例搜索结果：
```anchor checkDropPosCoe
#check [1, 2, 3, 4].drop (2 : Pos)
```
```anchorInfo checkDropPosCoe
List.drop (Pos.toNat 2) [1, 2, 3, 4] : List Nat
```
:::

# 链式强制转换

%%%
tag := "chaining-coercions"
%%%

在搜索强制转换时，Lean 会尝试由一系列较小的强制转换拼出一条强制转换链。
例如，已经存在从 {anchorName chapterIntro}`Nat` 到 {anchorName chapterIntro}`Int` 的强制转换。
由于该实例与 {anchorTerm CoePosNat}`Coe Pos Nat` 实例相结合，以下代码会被接受：

```anchor posInt
def oneInt : Int := Pos.one
```
这个定义使用了两次强制转换：从 {anchorTerm CoePosNat}`Pos` 到 {anchorTerm CoePosNat}`Nat`，再从 {anchorTerm CoePosNat}`Nat` 到 {anchorTerm chapterIntro}`Int`。

Lean 编译器在存在循环强制转换时不会陷入死循环。
例如，即使两种类型 {anchorName CoercionCycle}`A` 和 {anchorName CoercionCycle}`B` 可以相互强制转换，它们的相互强制转换仍可用于找到一条路径：

```anchor CoercionCycle
inductive A where
  | a

inductive B where
  | b

instance : Coe A B where
  coe _ := B.b

instance : Coe B A where
  coe _ := A.a

instance : Coe Unit A where
  coe _ := A.a

def coercedToB : B := ()
```
请记住：双括号 {anchorTerm CoercionCycle}`()` 是构造子 {anchorName chapterIntro}`Unit.unit` 的简写。
在用 {anchorTerm ReprB}`deriving instance Repr for B` 推导出 {anchorTerm ReprBTm}`Repr B` 实例之后，
```anchor coercedToBEval
#eval coercedToB
```
的结果是：
```anchorInfo coercedToBEval
B.b
```

:::paragraph
{anchorName CoeOption}`Option` 类型可以类似 C# 和 Kotlin 中的可空类型来使用：{anchorName NEListGetHuh}`none` 构造子表示值的缺失。
Lean 标准库定义了从任意类型 {anchorName CoeOption}`α` 到 {anchorTerm CoeOption}`Option α` 的强制转换，该转换把值包装在 {anchorName CoeOption}`some` 中。
这使得可选类型的用法更接近可空类型，因为可以省略 {anchorName CoeOption}`some`。
例如，查找列表最后一项的函数 {anchorName lastHuh}`List.last?` 可以在返回值 {anchorName lastHuh}`x` 周围不写 {anchorName CoeOption}`some`：

```anchor lastHuh
def List.last? : List α → Option α
  | [] => none
  | [x] => x
  | _ :: x :: xs => last? (x :: xs)
```
实例搜索会找到强制转换，并插入对 {anchorName Coe}`coe` 的调用，该调用把参数包装在 {anchorName CoeOption}`some` 中。
这些强制转换可以链式组合，因此嵌套使用 {anchorName CoeOption}`Option` 时不需要嵌套的 {anchorName CoeOption}`some` 构造子：

```anchor perhapsPerhapsPerhaps
def perhapsPerhapsPerhaps : Option (Option (Option String)) :=
  "Please don't tell me"
```
:::

:::paragraph
强制转换只会在 Lean 遇到推断类型与程序其余部分所施加类型不匹配时自动激活。
在其他错误的情况下，强制转换不会被激活。
例如，如果错误是缺少实例，则不会使用强制转换：
```anchor ofNatBeforeCoe
def perhapsPerhapsPerhapsNat : Option (Option (Option Nat)) :=
  392
```
```anchorError ofNatBeforeCoe
failed to synthesize
  OfNat (Option (Option (Option Nat))) 392
numerals are polymorphic in Lean, but the numeral `392` cannot be used in a context where the expected type is
  Option (Option (Option Nat))
due to the absence of the instance above

Hint: Additional diagnostic information may be available using the `set_option diagnostics true` command.
```
:::

:::paragraph
可以通过手动指明 {moduleName}`OfNat` 应使用的期望类型来解决这一问题：

```anchor perhapsPerhapsPerhapsNat
def perhapsPerhapsPerhapsNat : Option (Option (Option Nat)) :=
  (392 : Nat)
```
此外，可以使用上箭头手动插入强制转换：

```anchor perhapsPerhapsPerhapsNatUp
def perhapsPerhapsPerhapsNat : Option (Option (Option Nat)) :=
  ↑(392 : Nat)
```
在某些情况下，这可以确保 Lean 找到正确的实例。
它也能让程序员的意图更加清晰。
:::

# 非空列表与依赖强制转换

%%%
tag := "CoeDep"
%%%

{anchorTerm chapterIntro}`Coe α β` 的实例在类型 {anchorName chapterIntro}`β` 对每个来自类型 {anchorName chapterIntro}`α` 的值都有可表示的值时才有意义。
从 {moduleName}`Nat` 到 {moduleName}`Int` 的强制转换是合理的，因为 {moduleName}`Int` 包含所有自然数，但从 {moduleName}`Int` 到 {moduleName}`Nat` 的强制转换则不太合适，因为 {moduleName}`Nat` 不包含负数。
类似地，从非空列表到普通列表的强制转换是合理的，因为 {moduleName}`List` 类型可以表示每个非空列表：

```anchor CoeNEList
instance : Coe (NonEmptyList α) (List α) where
  coe
    | { head := x, tail := xs } => x :: xs
```
这使得非空列表可以与整个 {moduleName}`List` API 一起使用。

另一方面，无法写出 {anchorTerm coeNope}`Coe (List α) (NonEmptyList α)` 的实例，因为没有非空列表可以表示空列表。
这一限制可以通过使用另一种版本的强制转换来解决，称为 _依赖强制转换（dependent coercions）_。
当能否从一种类型强制转换到另一种类型取决于被强制转换的具体值时，可以使用依赖强制转换。
正如 {anchorName OfNat}`OfNat` 类型类把被重载的特定 {moduleName}`Nat` 作为参数，依赖强制转换也把被强制转换的值作为参数：

```anchor CoeDep
class CoeDep (α : Type) (x : α) (β : Type) where
  coe : β
```
这提供了只选择某些值的机会，可以通过对该值施加进一步的类型类约束，或直接写出某些构造子来实现。
例如，任何实际上非空的 {moduleName}`List` 都可以被强制转换为 {moduleName}`NonEmptyList`：

```anchor CoeDepListNEList
instance : CoeDep (List α) (x :: xs) (NonEmptyList α) where
  coe := { head := x, tail := xs }
```

# 强制转换为类型

%%%
tag := "CoeSort"
%%%

在数学中，常见做法是有一个由集合配备额外结构构成的概念。
例如，幺半群（monoid）是某个集合 $`S`、$`S` 中的元素 $`s`，以及 $`S` 上的结合二元运算符，使得 $`s` 在该运算符的左右两侧都是中性元。
$`S` 被称为该幺半群的“承载集（carrier set）”。
带有零和加法的自然数构成一个幺半群，因为加法满足结合律，且任何数加零都是恒等运算。
类似地，带有幺元和乘法的自然数也构成一个幺半群。
幺半群在函数式编程中也广泛使用：列表、空列表和拼接运算符构成一个幺半群，字符串、空字符串和字符串拼接也是如此：

```anchor Monoid
structure Monoid where
  Carrier : Type
  neutral : Carrier
  op : Carrier → Carrier → Carrier

def natMulMonoid : Monoid :=
  { Carrier := Nat, neutral := 1, op := (· * ·) }

def natAddMonoid : Monoid :=
  { Carrier := Nat, neutral := 0, op := (· + ·) }

def stringMonoid : Monoid :=
  { Carrier := String, neutral := "", op := String.append }

def listMonoid (α : Type) : Monoid :=
  { Carrier := List α, neutral := [], op := List.append }
```
给定一个幺半群，可以编写 {anchorName firstFoldMap}`foldMap` 函数，在一次遍历中把列表中的条目变换到该幺半群的承载集中，然后用幺半群的运算符把它们组合起来。
由于幺半群有中性元，当列表为空时有一个自然的返回值；由于运算符满足结合律，该函数的客户端不必关心递归函数是从左到右还是从右到左组合元素。

```anchor firstFoldMap
def foldMap (M : Monoid) (f : α → M.Carrier) (xs : List α) : M.Carrier :=
  let rec go (soFar : M.Carrier) : List α → M.Carrier
    | [] => soFar
    | y :: ys => go (M.op soFar (f y)) ys
  go M.neutral xs
```

尽管幺半群由三个独立的信息组成，但常见做法是用幺半群的名字来指代其集合。
人们不会说“设 A 为幺半群，设 _x_ 和 _y_ 为其承载集的元素”，而会说“设 _A_ 为幺半群，设 _x_ 和 _y_ 为 _A_ 的元素”。
这一做法可以在 Lean 中通过定义一种新的强制转换来编码，即从幺半群到其承载集的强制转换。

{anchorName CoeMonoid}`CoeSort` 类与 {anchorName CoePosNat}`Coe` 类非常相似，不同之处在于强制转换的目标必须是 _类（sort）_，即 {anchorTerm chapterIntro}`Type` 或 {anchorTerm chapterIntro}`Prop`。
Lean 中的术语 _类（sort）_ 指这些对其他类型进行分类的类型——{anchorTerm Coe}`Type` 对本身分类数据的类型进行分类，{anchorTerm chapterIntro}`Prop` 对本身分类其真值证据的命题进行分类。
与发生类型不匹配时检查 {anchorName CoePosNat}`Coe` 一样，当在非类的上下文中提供了某物而期望的是类时，会使用 {anchorName CoeMonoid}`CoeSort`。

从幺半群到其承载集的强制转换会提取承载集：

```anchor CoeMonoid
instance : CoeSort Monoid Type where
  coe m := m.Carrier
```
有了这个强制转换，类型签名就不那么繁琐了：

```anchor foldMap
def foldMap (M : Monoid) (f : α → M) (xs : List α) : M :=
  let rec go (soFar : M) : List α → M
    | [] => soFar
    | y :: ys => go (M.op soFar (f y)) ys
  go M.neutral xs
```

{anchorName CoeMonoid}`CoeSort` 的另一个有用例子用于弥合 {anchorName types}`Bool` 与 {anchorTerm chapterIntro}`Prop` 之间的差距。
如 {ref "equality-and-ordering"}[关于排序与相等性的一节] 所讨论的，Lean 的 {kw}`if` 表达式期望条件是**可判定命题（decidable proposition）**，而不是 {anchorName types}`Bool`。
然而，程序通常需要能够根据布尔值进行分支。
Lean 标准库没有提供两种 {kw}`if` 表达式，而是定义了从 {anchorName types}`Bool` 到“所讨论的 {anchorName types}`Bool` 等于 {anchorName types}`true`”这一命题的强制转换：

```anchor CoeBoolProp
instance : CoeSort Bool Prop where
  coe b := b = true
```
在这种情况下，所涉及的类是 {anchorTerm chapterIntro}`Prop` 而非 {anchorTerm chapterIntro}`Type`。

# 强制转换为函数

%%%
tag := "CoeFun"
%%%

编程中经常出现的许多数据类型都由一个函数以及关于该函数的一些额外信息组成。
例如，一个函数可能附带一个用于在日志中显示的名称，或一些配置数据。
此外，把类型放在结构体的字段中——类似于 {anchorName Monoid}`Monoid` 的例子——在存在多种实现某种运算的方式、且需要比类型类所能提供的更多手动控制时，也可能有意义。
例如，JSON 序列化器发出的值的具体细节可能很重要，因为另一个应用期望特定的格式。
有时，函数本身可能仅由配置数据推导出来。

称为 {anchorName CoeFun}`CoeFun` 的类型类可以把非函数类型的值变换为函数类型。
{anchorName CoeFun}`CoeFun` 有两个参数：第一个是应该被变换为函数的类型的值，第二个是输出参数，用于确定目标的具体函数类型。

```anchor CoeFun
class CoeFun (α : Type) (makeFunctionType : outParam (α → Type)) where
  coe : (x : α) → makeFunctionType x
```
第二个参数本身是一个计算类型的函数。
在 Lean 中，类型是一等公民，可以像其他任何东西一样传给函数或从函数返回。

例如，一个给参数加上常量的函数可以表示为围绕待加量的包装，而不是定义一个实际的函数：

```anchor Adder
structure Adder where
  howMuch : Nat
```
给参数加五的函数在 {anchorName Adder}`howMuch` 字段中有一个 {anchorTerm add5}`5`：

```anchor add5
def add5 : Adder := ⟨5⟩
```
这个 {anchorName Adder}`Adder` 类型不是函数，把它应用于参数会导致错误：
```anchor add5notfun
#eval add5 3
```
```anchorError add5notfun
Function expected at
  add5
but this term has type
  Adder

Note: Expected a function because this term is being applied to the argument
  3
```
定义 {anchorName CoeFunAdder}`CoeFun` 实例会使 Lean 把加法器变换为类型为 {anchorTerm CoeFunAdder}`Nat → Nat` 的函数：

```anchor CoeFunAdder
instance : CoeFun Adder (fun _ => Nat → Nat) where
  coe a := (· + a.howMuch)
```
```anchor add53
#eval add5 3
```
```anchorInfo add53
8
```
由于所有 {anchorName CoeFunAdder}`Adder` 都应被变换为 {anchorTerm CoeFunAdder}`Nat → Nat` 函数，{anchorName CoeFunAdder}`CoeFun` 第二个参数中的实参被忽略了。

:::paragraph
当需要值本身来确定正确的函数类型时，{anchorName CoeFunAdder}`CoeFun` 的第二个参数就不再被忽略。
例如，给定以下 JSON 值的表示：

```anchor JSON
inductive JSON where
  | true : JSON
  | false : JSON
  | null : JSON
  | string : String → JSON
  | number : Float → JSON
  | object : List (String × JSON) → JSON
  | array : List JSON → JSON
```
JSON 序列化器是一个结构体，它记录所知道如何序列化的类型以及序列化代码本身：

```anchor Serializer
structure Serializer where
  Contents : Type
  serialize : Contents → JSON
```
字符串的序列化器只需把提供的字符串包装在 {anchorName StrSer}`JSON.string` 构造子中：

```anchor StrSer
def Str : Serializer :=
  { Contents := String,
    serialize := JSON.string
  }
```
:::

:::paragraph
把 JSON 序列化器视为序列化其参数的函数，需要提取可序列化数据的内部类型：

```anchor CoeFunSer
instance : CoeFun Serializer (fun s => s.Contents → JSON) where
  coe s := s.serialize
```
有了这个实例，序列化器可以直接应用于参数：

```anchor buildResponse
def buildResponse (title : String) (R : Serializer)
    (record : R.Contents) : JSON :=
  JSON.object [
    ("title", JSON.string title),
    ("status", JSON.number 200),
    ("record", R record)
  ]
```
序列化器可以直接传给 {anchorName buildResponseOut}`buildResponse`：
```anchor buildResponseOut
#eval buildResponse "Functional Programming in Lean" Str "Programming is fun!"
```
```anchorInfo buildResponseOut
JSON.object
  [("title", JSON.string "Functional Programming in Lean"),
   ("status", JSON.number 200.000000),
   ("record", JSON.string "Programming is fun!")]
```
:::

## 旁白：将 JSON 表示为字符串

%%%
tag := "json-string"
%%%

当 JSON 被编码为 Lean 对象时，可能较难理解。
为了帮助确认序列化后的响应是否符合预期，编写一个简单的从 {anchorName JSON}`JSON` 到 {anchorName dropDecimals}`String` 的转换器会很方便。
第一步是简化数字的显示。
{anchorName JSON}`JSON` 不区分整数和浮点数，类型 {anchorName JSON}`Float` 用于表示两者。
在 Lean 中，{anchorName chapterIntro}`Float.toString` 会包含若干尾随零：
```anchor fiveZeros
#eval (5 : Float).toString
```
```anchorInfo fiveZeros
"5.000000"
```
解决办法是写一个小函数，通过去掉所有尾随零以及尾随小数点来清理显示：

```anchor dropDecimals
def dropDecimals (numString : String) : String :=
  if numString.contains '.' then
    let noTrailingZeros := numString.dropRightWhile (· == '0')
    noTrailingZeros.dropRightWhile (· == '.')
  else numString
```
有了这个定义，{anchorTerm dropDecimalExample}`dropDecimals (5 : Float).toString` 得到 {anchorTerm dropDecimalExample}`5`，而 {anchorTerm dropDecimalExample2}`dropDecimals (5.2 : Float).toString` 得到 {anchorTerm dropDecimalExample2}`5.2`。

下一步是定义一个辅助函数，用分隔符连接字符串列表：

```anchor Stringseparate
def String.separate (sep : String) (strings : List String) : String :=
  match strings with
  | [] => ""
  | x :: xs => String.join (x :: xs.map (sep ++ ·))
```
这个函数有助于处理 JSON 数组和对象中以逗号分隔的元素。
{anchorTerm sep2ex}`", ".separate ["1", "2"]` 得到 {anchorInfo sep2ex}`"1, 2"`，{anchorTerm sep1ex}`", ".separate ["1"]` 得到 {anchorInfo sep1ex}`"1"`，{anchorTerm sep0ex}`", ".separate []` 得到 {anchorInfo sep0ex}`""`。
在 Lean 标准库中，这个函数称为 {anchorName chapterIntro}`String.intercalate`。

最后，JSON 字符串需要一个字符串转义过程，这样包含 {anchorTerm chapterIntro}`"Hello!"` 的 Lean 字符串可以输出为 {anchorTerm escapeQuotes}`"\"Hello!\""`。
幸运的是，Lean 编译器已经包含一个用于转义 JSON 字符串的内部函数，名为 {anchorName escapeQuotes}`Lean.Json.escape`。
要使用这个函数，在文件开头添加 {lit}`import Lean`。

从 {anchorName JSONasString}`JSON` 值生成字符串的函数被声明为 {kw}`partial`，因为 Lean 无法看出它会终止。
这是因为对 {anchorName JSONasString}`asString` 的递归调用出现在被 {anchorName chapterIntro}`List.map` 应用的函数中，这种递归模式足够复杂，Lean 无法看出递归调用实际上是在更小的值上进行的。
在只需要生成 JSON 字符串、而不需要对这一过程进行数学推理的应用中，让该函数为 {kw}`partial` 不太可能造成问题。

```anchor JSONasString
partial def JSON.asString (val : JSON) : String :=
  match val with
  | true => "true"
  | false => "false"
  | null => "null"
  | string s => "\"" ++ Lean.Json.escape s ++ "\""
  | number n => dropDecimals n.toString
  | object members =>
    let memberToString mem :=
      "\"" ++ Lean.Json.escape mem.fst ++ "\": " ++ asString mem.snd
    "{" ++ ", ".separate (members.map memberToString) ++ "}"
  | array elements =>
    "[" ++ ", ".separate (elements.map asString) ++ "]"
```
有了这个定义，序列化的输出就更容易阅读了：
```anchor buildResponseStr
#eval (buildResponse "Functional Programming in Lean" Str "Programming is fun!").asString
```
```anchorInfo buildResponseStr
"{\"title\": \"Functional Programming in Lean\", \"status\": 200, \"record\": \"Programming is fun!\"}"
```


# 你可能遇到的提示信息

%%%
tag := "coercion-messages"
%%%

自然数字面量通过 {anchorName OfNat}`OfNat` 类型类重载。
由于强制转换在类型不匹配时触发，而不是在缺少实例时触发，因此某类型缺少 {anchorName OfNat}`OfNat` 实例并不会导致应用从 {moduleName}`Nat` 的强制转换：
```anchor ofNatBeforeCoe
def perhapsPerhapsPerhapsNat : Option (Option (Option Nat)) :=
  392
```
```anchorError ofNatBeforeCoe
failed to synthesize
  OfNat (Option (Option (Option Nat))) 392
numerals are polymorphic in Lean, but the numeral `392` cannot be used in a context where the expected type is
  Option (Option (Option Nat))
due to the absence of the instance above

Hint: Additional diagnostic information may be available using the `set_option diagnostics true` command.
```

# 设计考量

%%%
tag := "coercion-design-considerations"
%%%

强制转换是一种强大的工具，应当审慎使用。
一方面，它们可以让 API 自然地遵循所建模领域的日常规则。
这可以区分繁琐的手动转换函数堆砌与清晰的程序。
正如 Abelson 和 Sussman 在 _Structure and Interpretation of Computer Programs_（MIT Press，1996）序言中所写：

> Programs must be written for people to read, and only incidentally for machines to execute.

明智地使用强制转换，是实现可读代码、并以此作为与领域专家沟通基础的有价值手段。
然而，严重依赖强制转换的 API 有一些重要的局限性。
在自己的库中使用强制转换之前，请仔细考虑这些局限性。

首先，强制转换只在有足够类型信息、使 Lean 知道所有涉及类型的上下文中才会被应用，因为强制转换类型类没有输出参数。这意味着函数上的返回类型标注，可能决定是出现类型错误还是成功应用强制转换。
例如，从非空列表到列表的强制转换使以下程序可以工作：

```anchor lastSpiderA
def lastSpider : Option String :=
  List.getLast? idahoSpiders
```
另一方面，如果省略类型标注，则结果类型未知，Lean 无法找到强制转换：
```anchor lastSpiderB
def lastSpider :=
  List.getLast? idahoSpiders
```
```anchorError lastSpiderB
Application type mismatch: The argument
  idahoSpiders
has type
  NonEmptyList String
but is expected to have type
  List ?m.3
in the application
  List.getLast? idahoSpiders
```
更一般地说，当强制转换因某种原因未被应用时，用户会收到原始的类型错误，这可能使调试强制转换链变得困难。

最后，强制转换不会在字段访问记法的上下文中被应用。
这意味着需要强制转换的表达式与不需要强制转换的表达式之间仍然存在重要区别，而 API 的用户可以看到这一区别。