# 类型化查询

在构建需要模仿其他语言的 API 时，索引族非常有用。
它们可用于编写不允许生成无效 HTML 的 HTML 构造器库，用于编码某种配置文件格式的具体规则，或用于建模复杂的业务约束。
本节描述如何在 Lean 中使用索引族对关系代数的一个子集进行编码，作为演示可用于构建更强大数据库查询语言的技术的较简单示例。

这个子集利用类型系统来强制执行诸如字段名互不相交等要求，并利用类型级计算将模式反映到查询返回值的类型中。
然而，它并不是一个现实的系统——数据库被表示为链表的链表，类型系统比 SQL 的简单得多，关系代数的运算符也与 SQL 的并不真正匹配。
不过，它足够大，可以演示有用的原则和技术。

# 数据的宇宙

在这套关系代数中，列中可以存放的基础数据可以有类型 {anchorName DBType}`Int`、{anchorName DBType}`String` 和 {anchorName DBType}`Bool`，并由宇宙 {anchorName DBType}`DBType` 描述：

```anchor DBType
inductive DBType where
  | int | string | bool

abbrev DBType.asType : DBType → Type
  | .int => Int
  | .string => String
  | .bool => Bool
```

使用 {anchorName DBType}`DBType.asType` 可以让这些代码用于类型。
例如：
```anchor mountHoodEval
#eval ("Mount Hood" : DBType.string.asType)
```
```anchorInfo mountHoodEval
"Mount Hood"
```

可以比较由这三种数据库类型中任意一种所描述的值是否相等。
然而，要让 Lean 理解这一点，需要做一些工作。
直接使用 {anchorName BEqDBType}`BEq` 会失败：
```anchor dbEqNoSplit
def DBType.beq (t : DBType) (x y : t.asType) : Bool :=
  x == y
```
```anchorError dbEqNoSplit
failed to synthesize
  BEq t.asType

Hint: Additional diagnostic information may be available using the `set_option diagnostics true` command.
```
就像在嵌套对的宇宙中一样，类型类搜索不会自动检查 {anchorName dbEqNoSplit}`t` 的每个可能取值。
解决办法是使用模式匹配来细化 {anchorTerm dbEq}`x` 和 {anchorName dbEq}`y` 的类型：

```anchor dbEq
def DBType.beq (t : DBType) (x y : t.asType) : Bool :=
  match t with
  | .int => x == y
  | .string => x == y
  | .bool => x == y
```
在这个版本的函数中，{anchorName dbEq}`x` 和 {anchorName dbEq}`y` 在三个相应分支中分别具有类型 {anchorName DBType}`Int`、{anchorName DBType}`String` 和 {anchorName DBType}`Bool`，而这些类型都有 {anchorName BEqDBType}`BEq` 实例。
{anchorName dbEq}`DBType.beq` 的定义可用于为 {anchorName DBType}`DBType` 所编码的类型定义 {anchorName BEqDBType}`BEq` 实例：

```anchor BEqDBType
instance {t : DBType} : BEq t.asType where
  beq := t.beq
```
这与针对代码本身的实例不同：

```anchor BEqDBTypeCodes
instance : BEq DBType where
  beq
    | .int, .int => true
    | .string, .string => true
    | .bool, .bool => true
    | _, _ => false
```
前者实例允许比较由代码所描述的类型中的值，而后者允许比较代码本身。

可以用同样的技巧编写 {anchorName ReprAsType}`Repr` 实例。
{anchorName ReprAsType}`Repr` 类的方法称为 {anchorName ReprAsType}`reprPrec`，因为它在显示值时会考虑运算符优先级等因素。
通过依赖模式匹配来细化类型，就可以使用 {anchorName DBType}`Int`、{anchorName DBType}`String` 和 {anchorName DBType}`Bool` 的 {anchorName ReprAsType}`Repr` 实例中的 {anchorName ReprAsType}`reprPrec` 方法：

```anchor ReprAsType
instance {t : DBType} : Repr t.asType where
  reprPrec :=
    match t with
    | .int => reprPrec
    | .string => reprPrec
    | .bool => reprPrec
```

# 模式与表

模式描述数据库中每一列的名称和类型：

```anchor Schema
structure Column where
  name : String
  contains : DBType

abbrev Schema := List Column
```
事实上，模式可以看作描述表中行的宇宙。
空模式描述单位类型，只有一个列的模式描述该值本身，而至少有两个列的模式则用元组表示：

```anchor Row
abbrev Row : Schema → Type
  | [] => Unit
  | [col] => col.contains.asType
  | col1 :: col2 :: cols => col1.contains.asType × Row (col2::cols)
```

如 {ref "prod"}[关于积类型的最初一节] 中所述，Lean 的积类型和元组是右结合的。
这意味着嵌套的对等价于普通的扁平元组。

表是共享同一模式的行的列表：

```anchor Table
abbrev Table (s : Schema) := List (Row s)
```
例如，可以用模式 {anchorName peak}`peak` 表示登山峰顶的日记：

```anchor peak
abbrev peak : Schema := [
  ⟨"name", .string⟩,
  ⟨"location", .string⟩,
  ⟨"elevation", .int⟩,
  ⟨"lastVisited", .int⟩
]
```
本书作者攀登过的一些山峰，以普通元组列表的形式出现：

```anchor mountainDiary
def mountainDiary : Table peak := [
  ("Mount Nebo",       "USA",     3637, 2013),
  ("Moscow Mountain",  "USA",     1519, 2015),
  ("Himmelbjerget",    "Denmark",  147, 2004),
  ("Mount St. Helens", "USA",     2549, 2010)
]
```
另一个例子是瀑布以及访问它们的日记：

```anchor waterfall
abbrev waterfall : Schema := [
  ⟨"name", .string⟩,
  ⟨"location", .string⟩,
  ⟨"lastVisited", .int⟩
]
```

```anchor waterfallDiary
def waterfallDiary : Table waterfall := [
  ("Multnomah Falls", "USA", 2018),
  ("Shoshone Falls",  "USA", 2014)
]
```

## 递归与宇宙，再探

将行方便地结构化为元组是有代价的：{anchorName Row}`Row` 将两个基本情况分开处理，这意味着在类型中使用 {anchorName Row}`Row` 并对代码（即模式）递归定义的函数，也需要做出同样的区分。
一个相关的例子是：通过对模式递归来定义检查行是否相等的相等性检查。
下面的例子无法通过 Lean 的类型检查器：
```anchor RowBEqRecursion
def Row.bEq (r1 r2 : Row s) : Bool :=
  match s with
  | [] => true
  | col::cols =>
    match r1, r2 with
    | (v1, r1'), (v2, r2') =>
      v1 == v2 && bEq r1' r2'
```
```anchorError RowBEqRecursion
Type mismatch
  (v1, r1')
has type
  ?m.10 × ?m.11
but is expected to have type
  Row (col :: cols)
```
问题在于模式 {anchorTerm RowBEqRecursion}`col :: cols` 不足以细化行的类型。
这是因为 Lean 尚无法判断匹配的是 {anchorName Row}`Row` 定义中的单例模式 {anchorTerm Row}`[col]` 还是 {anchorTerm Row}`col1 :: col2 :: cols` 模式，因此对 {anchorName Row}`Row` 的调用无法计算为对类型。
解决办法是在 {anchorName RowBEq}`Row.bEq` 的定义中镜像 {anchorName Row}`Row` 的结构：

```anchor RowBEq
def Row.bEq (r1 r2 : Row s) : Bool :=
  match s with
  | [] => true
  | [_] => r1 == r2
  | _::_::_ =>
    match r1, r2 with
    | (v1, r1'), (v2, r2') =>
      v1 == v2 && bEq r1' r2'

instance : BEq (Row s) where
  beq := Row.bEq
```

与其他上下文不同，出现在类型中的函数不能仅从输入/输出行为来考虑。
使用这些类型的程序将被迫镜像类型级函数所用的算法，使其结构与类型中的模式匹配和递归行为相匹配。
用依赖类型编程的一项重要技能，就是选择合适的、具有正确计算行为的类型级函数。

## 列指针

某些查询只有在模式包含特定列时才有意义。
例如，返回海拔高于 1000 米的山峰的查询，只有在包含整数型 {anchorTerm peak}`"elevation"` 列的模式上下文中才有意义。
表明某列包含在模式中的一种方式，是直接提供指向它的指针；将指针定义为索引族，就可以排除无效指针。

列出现在模式中有两种方式：要么在模式开头，要么在模式后面的某处。
最终，如果列在模式后面，那么它将成为模式某个尾部的开头。

索引族 {anchorName HasCol}`HasCol` 是将这一规约翻译成 Lean 代码：

```anchor HasCol
inductive HasCol : Schema → String → DBType → Type where
  | here : HasCol (⟨name, t⟩ :: _) name t
  | there : HasCol s name t → HasCol (_ :: s) name t
```
该族的三个参数是模式、列名及其类型。
三者都是索引，但如果重新排列参数，将模式放在列名和类型之后，就可以让列名和类型成为参数。
当模式以列 {anchorTerm HasCol}`⟨name, t⟩` 开头时，可以使用构造子 {anchorName HasCol}`here`；因此它是指向模式中第一列的指针，仅当第一列具有所需名称和类型时才能使用。
构造子 {anchorName HasCol}`there` 将指向较小模式的指针转换为指向多了一列的模式中的指针。

由于 {anchorTerm peak}`"elevation"` 是 {anchorName peak}`peak` 的第三列，可以通过用 {anchorName HasCol}`there` 跳过前两列来找到它，之后它就是第一列。
换句话说，要满足类型 {anchorTerm peakElevationInt}`HasCol peak "elevation" .int`，使用表达式 {anchorTerm peakElevationInt}`.there (.there .here)`。
可以将 {anchorName HasCol}`HasCol` 看作一种带注解的 {anchorName Naturals}`Nat`——{anchorName Naturals}`zero` 对应 {anchorName HasCol}`here`，{anchorName Naturals}`succ` 对应 {anchorName HasCol}`there`。
额外的类型信息使得不可能出现差一错误。

指向模式中某一列的指针可用于从行中提取该列的值：

```anchor Rowget
def Row.get (row : Row s) (col : HasCol s n t) : t.asType :=
  match s, col, row with
  | [_], .here, v => v
  | _::_::_, .here, (v, _) => v
  | _::_::_, .there next, (_, r) => get r next
```
第一步是对模式进行模式匹配，因为这决定了行是元组还是单个值。
不需要空模式的情况，因为存在 {anchorName HasCol}`HasCol`，而 {anchorName HasCol}`HasCol` 的两个构造子都指定了非空模式。
如果模式只有一列，那么指针必须指向它，因此只需匹配 {anchorName HasCol}`HasCol` 的 {anchorName HasCol}`here` 构造子。
如果模式有两列或更多列，则必须有 {anchorName HasCol}`here` 的情况，此时值是行中的第一个值，以及 {anchorName HasCol}`there` 的情况，此时使用递归调用。
由于 {anchorName HasCol}`HasCol` 类型保证列存在于行中，{anchorName Rowget}`Row.get` 不需要返回 {anchorName nullable}`Option`。

{anchorName HasCol}`HasCol` 扮演两个角色：
 1. 它作为_证据_，表明模式中存在具有特定名称和类型的列。

 2. 它作为_数据_，可用于在行中找到与该列关联的值。

第一个角色——证据——类似于命题的用法。
索引族 {anchorName HasCol}`HasCol` 的定义可以读作对什么算作给定列存在之证据的规约。
然而与命题不同，使用 {anchorName HasCol}`HasCol` 的哪个构造子是有区别的。
在第二个角色中，构造子像 {anchorName Naturals}`Nat` 一样用于在集合中查找数据。
用索引族编程通常需要能够在两种视角之间自如切换。

## 子模式

关系代数中的一项重要运算是将表或行_投影_到较小的模式。
较小模式中不存在的每一列都会被遗忘。
为了使投影有意义，较小模式必须是较大模式的子模式，这意味着较小模式中的每一列都必须出现在较大模式中。
正如 {anchorName HasCol}`HasCol` 使得编写不会失败的单行查找成为可能，将子模式关系表示为索引族，就可以编写不会失败的投影函数。

一种模式可以是另一种模式的子模式的方式，可以定义为索引族。
基本思想是：如果较小模式中的每一列都出现在较大模式中，那么较小模式就是较大模式的子模式。
如果较小模式为空，那么它当然是较大模式的子模式，由构造子 {anchorName Subschema}`nil` 表示。
如果较小模式有一列，那么该列必须在较大模式中，且子模式中其余所有列也必须是较大模式的子模式。
这由构造子 {anchorName Subschema}`cons` 表示。

```anchor Subschema
inductive Subschema : Schema → Schema → Type where
  | nil : Subschema [] bigger
  | cons :
      HasCol bigger n t →
      Subschema smaller bigger →
      Subschema (⟨n, t⟩ :: smaller) bigger
```
换句话说，{anchorName Subschema}`Subschema` 为较小模式的每一列分配一个 {anchorName HasCol}`HasCol`，指向它在较大模式中的位置。

模式 {anchorName travelDiary}`travelDiary` 表示 {anchorName peak}`peak` 和 {anchorName waterfall}`waterfall` 共有的字段：

```anchor travelDiary
abbrev travelDiary : Schema :=
  [⟨"name", .string⟩, ⟨"location", .string⟩, ⟨"lastVisited", .int⟩]
```
它当然是 {anchorName peak}`peak` 的子模式，如下例所示：

```anchor peakDiarySub
example : Subschema travelDiary peak :=
  .cons .here
    (.cons (.there .here)
      (.cons (.there (.there (.there .here))) .nil))
```
然而，这样的代码难以阅读且难以维护。
改进的一种方式是指示 Lean 自动写出 {anchorName Subschema}`Subschema` 和 {anchorName HasCol}`HasCol` 构造子。
这可以使用 {ref "props-proofs-indexing"}[关于命题与证明的插章] 中介绍的策略特性来完成。
该插章使用 {kw}`by decide` 和 {kw}`by simp` 为各种命题提供证据。

在这个上下文中，两个策略很有用：
 * {kw}`constructor` 策略指示 Lean 使用数据类型的构造子来解决问题。
 * {kw}`repeat` 策略指示 Lean 反复执行某个策略，直到失败或证明完成为止。

在下一个例子中，{kw}`by constructor` 的效果与只写 {anchorName peakDiarySub}`.nil` 相同：

```anchor emptySub
example : Subschema [] peak := by constructor
```
然而，对稍复杂一点的类型尝试同样的策略会失败：
```anchor notDone
example : Subschema [⟨"location", .string⟩] peak := by constructor
```
```anchorError notDone
unsolved goals
case a
⊢ HasCol peak "location" DBType.string

case a
⊢ Subschema [] peak
```
以 {lit}`unsolved goals` 开头的错误描述的是未能完全构建其应构建的表达式的策略。
在 Lean 的策略语言中，_目标_是策略要通过在幕后构造适当表达式来满足的类型。
在这种情况下，{kw}`constructor` 导致应用了 {anchorName SubschemaNames}`Subschema.cons`，两个目标代表 {anchorName Subschema}`cons` 期望的两个参数。
再添加一个 {kw}`constructor` 会用 {anchorName SubschemaNames}`HasCol.there` 处理第一个目标（{anchorTerm SubschemaNames}`HasCol peak "location" DBType.string`），因为 {anchorName peak}`peak` 的第一列不是 {anchorTerm SubschemaNames}`"location"`：
```anchor notDone2
example : Subschema [⟨"location", .string⟩] peak := by
  constructor
  constructor
```
```anchorError notDone2
unsolved goals
case a.a
⊢ HasCol
  [{ name := "location", contains := DBType.string }, { name := "elevation", contains := DBType.int },
    { name := "lastVisited", contains := DBType.int }]
  "location" DBType.string

case a
⊢ Subschema [] peak
```
然而，再添加第三个 {kw}`constructor` 会使第一个目标被解决，因为 {anchorName SubschemaNames}`HasCol.here` 适用：
```anchor notDone3
example : Subschema [⟨"location", .string⟩] peak := by
  constructor
  constructor
  constructor
```
```anchorError notDone3
unsolved goals
case a
⊢ Subschema [] peak
```
第四个 {kw}`constructor` 解决了 {anchorTerm SubschemaNames}`Subschema peak []` 目标：

```anchor notDone4
example : Subschema [⟨"location", .string⟩] peak := by
  constructor
  constructor
  constructor
  constructor
```
确实，不使用策略书写的版本有四个构造子：

```anchor notDone5
example : Subschema [⟨"location", .string⟩] peak :=
  .cons (.there .here) .nil
```

与其反复试验该写多少次 {kw}`constructor`，不如使用 {kw}`repeat` 策略，让 Lean 只要还能取得进展就继续尝试 {kw}`constructor`：

```anchor notDone6
example : Subschema [⟨"location", .string⟩] peak := by repeat constructor
```
这个更灵活的版本也适用于更有趣的 {anchorName Subschema}`Subschema` 问题：

```anchor subschemata
example : Subschema travelDiary peak := by repeat constructor

example : Subschema travelDiary waterfall := by repeat constructor
```

对 {anchorName Naturals}`Nat` 或 {anchorTerm misc}`List Bool` 这类类型，盲目尝试构造子直到成功的方法并不十分有用。
毕竟，一个表达式具有类型 {anchorName Naturals}`Nat` 并不意味着它是_正确的_ {anchorName Naturals}`Nat`。
但像 {anchorName HasCol}`HasCol` 和 {anchorName Subschema}`Subschema` 这样的类型被其索引充分约束，永远只有一个构造子适用，这意味着程序本身的内容不那么重要，计算机可以选出正确的那一个。

如果一种模式是另一种模式的子模式，那么它也是用额外一列扩展后的较大模式的子模式。
这一事实可以捕获为函数定义。
{anchorName SubschemaAdd}`Subschema.addColumn` 接受 {anchorName SubschemaAdd}`smaller` 是 {anchorName SubschemaAdd}`bigger` 之子模式的证据，然后返回 {anchorName SubschemaAdd}`smaller` 是 {anchorTerm SubschemaAdd}`c :: bigger`（即带有一列额外列的 {anchorName SubschemaAdd}`bigger`）之子模式的证据：

```anchor SubschemaAdd
def Subschema.addColumn :
    Subschema smaller bigger →
    Subschema smaller (c :: bigger)
  | .nil  => .nil
  | .cons col sub' => .cons (.there col) sub'.addColumn
```
子模式描述在较大模式中何处找到较小模式的每一列。
{anchorName SubschemaAdd}`Subschema.addColumn` 必须将这些描述从原始较大模式翻译到扩展后的较大模式。
在 {anchorName Subschema}`nil` 情况下，较小模式是 {lit}`[]`，而 {anchorName Subschema}`nil` 也是 {lit}`[]` 是 {anchorTerm SubschemaAdd}`c :: bigger` 之子模式的证据。
在 {anchorName Subschema}`cons` 情况下，它描述如何将 {anchorName SubschemaAdd}`smaller` 的一列放入 {anchorName SubschemaAdd}`bigger`，需要用 {anchorName HasCol}`there` 调整列的位置以计入新列 {anchorName SubschemaAdd}`c`，递归调用则调整其余列。

理解 {anchorName Subschema}`Subschema` 的另一种方式是：它定义了两种模式之间的_关系_——存在类型为 {anchorTerm misc}`Subschema smaller bigger` 的表达式，意味着 {anchorTerm misc}`(smaller, bigger)` 在该关系中。
这一关系是自反的，即每个模式都是它自身的子模式：

```anchor SubschemaSame
def Subschema.reflexive : (s : Schema) → Subschema s s
  | [] => .nil
  | _ :: cs => .cons .here (reflexive cs).addColumn
```


## 投影行

给定 {anchorName RowProj}`s'` 是 {anchorName RowProj}`s` 之子模式的证据，可以将 {anchorName RowProj}`s` 中的行投影为 {anchorName RowProj}`s'` 中的行。
这是通过 {anchorName RowProj}`s'` 是 {anchorName RowProj}`s` 之子模式的证据完成的，该证据说明 {anchorName RowProj}`s'` 的每一列在 {anchorName RowProj}`s` 中的何处找到。
{anchorName RowProj}`s'` 中的新行逐列构建，从旧行的适当位置检索值。

执行这一投影的函数 {anchorName RowProj}`Row.project` 有三个情况，对应 {anchorName RowProj}`Row` 本身的三种情况。
它将 {anchorName Rowget}`Row.get` 与 {anchorName RowProj}`Subschema` 参数中的每个 {anchorName HasCol}`HasCol` 一起使用，以构造投影后的行：

```anchor RowProj
def Row.project (row : Row s) : (s' : Schema) → Subschema s' s → Row s'
  | [], .nil => ()
  | [_], .cons c .nil => row.get c
  | _::_::_, .cons c cs => (row.get c, row.project _ cs)
```


# 条件与选择

投影会从表中移除不需要的列，但查询还必须能够移除不需要的行。
这一运算称为_选择_。
选择依赖于表达所需行的方式。

示例查询语言包含表达式，类似于 SQL 中 {lit}`WHERE` 子句中可以写的内容。
表达式由索引族 {anchorName DBExpr}`DBExpr` 表示。
由于表达式可以引用数据库中的列，但不同子表达式共享同一模式，{anchorName DBExpr}`DBExpr` 将数据库模式作为参数。
此外，每个表达式都有一个类型，这些类型各不相同，因此类型是一个索引：

```anchor DBExpr
inductive DBExpr (s : Schema) : DBType → Type where
  | col (n : String) (loc : HasCol s n t) : DBExpr s t
  | eq (e1 e2 : DBExpr s t) : DBExpr s .bool
  | lt (e1 e2 : DBExpr s .int) : DBExpr s .bool
  | and (e1 e2 : DBExpr s .bool) : DBExpr s .bool
  | const : t.asType → DBExpr s t
```
{anchorName DBExpr}`col` 构造子表示对数据库列的引用。
{anchorName DBExpr}`eq` 构造子比较两个表达式是否相等，{anchorName DBExpr}`lt` 检查一个是否小于另一个，{anchorName DBExpr}`and` 是布尔合取，{anchorName DBExpr}`const` 是某类型的常量值。

例如，在 {anchorName peak}`peak` 中可以写一个表达式，检查 {lit}`elevation` 列是否大于 1000 且位置是 {anchorTerm mountainDiary}`"Denmark"`：

```anchor tallDk
def tallInDenmark : DBExpr peak .bool :=
  .and (.lt (.const 1000) (.col "elevation" (by repeat constructor)))
       (.eq (.col "location" (by repeat constructor)) (.const "Denmark"))
```
这有些冗长。
特别是，对列的引用包含对 {anchorTerm tallDk}`by repeat constructor` 的样板调用。
Lean 的一项称为_宏_的特性，可以通过消除这些样板使表达式更易读：

```anchor cBang
macro "c!" n:term : term => `(DBExpr.col $n (by repeat constructor))
```
该声明将 {kw}`c!` 关键字添加到 Lean，并指示 Lean 将任何 {kw}`c!` 后跟表达式的实例替换为相应的 {anchorTerm cBang}`DBExpr.col` 构造。
这里，{anchorName cBang}`term` 表示 Lean 表达式，而不是命令、策略或语言的其他部分。
Lean 宏有点像 C 预处理器宏，只是它们更好地集成到语言中，并自动避免 CPP 的一些陷阱。
事实上，它们与 Scheme 和 Racket 中的宏密切相关。

有了这个宏，表达式就易读得多：

```anchor tallDkBetter
def tallInDenmark : DBExpr peak .bool :=
  .and (.lt (.const 1000) (c! "elevation"))
       (.eq (c! "location") (.const "Denmark"))
```

相对于给定行求表达式的值，使用 {anchorName Rowget}`Row.get` 提取列引用，对其余每个表达式则委托给 Lean 对值的操作：

```anchor DBExprEval
def DBExpr.evaluate (row : Row s) : DBExpr s t → t.asType
  | .col _ loc => row.get loc
  | .eq e1 e2  => evaluate row e1 == evaluate row e2
  | .lt e1 e2  => evaluate row e1 < evaluate row e2
  | .and e1 e2 => evaluate row e1 && evaluate row e2
  | .const v => v
```

对哥本哈根地区最高的山 Valby Bakke 求值该表达式，得到 {anchorName misc}`false`，因为 Valby Bakke 远低于海拔 1 公里：
```anchor valbybakke
#eval tallInDenmark.evaluate ("Valby Bakke", "Denmark", 31, 2023)
```
```anchorInfo valbybakke
false
```
对一座海拔 1230 米的虚构山峰求值，得到 {anchorName misc}`true`：
```anchor fakeDkBjerg
#eval tallInDenmark.evaluate ("Fictional mountain", "Denmark", 1230, 2023)
```
```anchorInfo fakeDkBjerg
true
```
对美国爱达荷州最高峰求值，得到 {anchorName misc}`false`，因为爱达荷州不属于丹麦：
```anchor borah
#eval tallInDenmark.evaluate ("Mount Borah", "USA", 3859, 1996)
```
```anchorInfo borah
false
```

# 查询

查询语言基于关系代数。
除表之外，它还包括以下运算符：
 1. 具有相同模式的两个表达式的并集，合并两个查询产生的行
 2. 具有相同模式的两个表达式的差集，从第一个结果的行中移除在第二个结果中找到的行
 3. 按某个条件选择，根据表达式过滤查询结果
 4. 投影到子模式，从查询结果中移除列
 5. 笛卡尔积，将一次查询的每一行与另一次查询的每一行组合
 6. 重命名查询结果中的列，修改其模式
 7. 为查询中的所有列名添加前缀

最后一个运算符并非严格必要，但它使语言更方便使用。

查询再次由索引族表示：

```anchor Query
inductive Query : Schema → Type where
  | table : Table s → Query s
  | union : Query s → Query s → Query s
  | diff : Query s → Query s → Query s
  | select : Query s → DBExpr s .bool → Query s
  | project :
    Query s → (s' : Schema) →
    Subschema s' s →
    Query s'
  | product :
    Query s1 → Query s2 →
    disjoint (s1.map Column.name) (s2.map Column.name) →
    Query (s1 ++ s2)
  | renameColumn :
    Query s → (c : HasCol s n t) → (n' : String) →
    !((s.map Column.name).contains n') →
    Query (s.renameColumn c n')
  | prefixWith :
    (n : String) → Query s →
    Query (s.map fun c => {c with name := n ++ "." ++ c.name})
```
{anchorName Query}`select` 构造子要求用于选择的表达式返回布尔值。
{anchorName Query}`product` 构造子的类型包含对 {anchorName Query}`disjoint` 的调用，确保两个模式不共享任何名称：

```anchor disjoint
def disjoint [BEq α] (xs ys : List α) : Bool :=
  not (xs.any ys.contains || ys.any xs.contains)
```
在期望类型的地方使用类型为 {anchorName misc}`Bool` 的表达式，会触发从 {anchorName misc}`Bool` 到 {anchorTerm misc}`Prop` 的强制转换。
正如可判定命题可以视为布尔值——命题的证据被强制转换为 {anchorName misc}`true`，对命题的否定被强制转换为 {anchorName misc}`false`——布尔值被强制转换为陈述该表达式等于 {anchorName misc}`true` 的命题。
由于预期库的所有使用都发生在模式事先已知的上下文中，该命题可以用 {kw}`by simp` 证明。
类似地，{anchorName renameColumn}`renameColumn` 构造子检查新名称在模式中尚不存在。
它使用辅助函数 {anchorName renameColumn}`Schema.renameColumn` 来更改由 {anchorName HasCol}`HasCol` 指向的列的名称：

```anchor renameColumn
def Schema.renameColumn : (s : Schema) → HasCol s n t → String → Schema
  | c :: cs, .here, n' => {c with name := n'} :: cs
  | c :: cs, .there next, n' => c :: renameColumn cs next n'
```

# 执行查询

执行查询需要若干辅助函数。
查询的结果是一张表；这意味着查询语言中的每个运算都需要一个相应的、对表起作用的实现。

## 笛卡尔积

两个表的笛卡尔积，是将第一个表的每一行追加到第二个表的每一行。
首先，由于 {anchorName Row}`Row` 的结构，向行添加一列需要对其模式进行模式匹配，以确定结果是裸值还是元组。
因为这是常见运算，将模式匹配提取到辅助函数中很方便：

```anchor addVal
def addVal (v : c.contains.asType) (row : Row s) : Row (c :: s) :=
  match s, row with
  | [], () => v
  | c' :: cs, v' => (v, v')
```
追加两行时，对第一个模式的结构和第一行的结构递归，因为行的结构与模式的结构同步推进。
当第一行为空时，追加返回第二行。
当第一行是单例时，将该值添加到第二行。
当第一行包含多列时，将第一列的值添加到对行其余部分递归的结果中。

```anchor RowAppend
def Row.append (r1 : Row s1) (r2 : Row s2) : Row (s1 ++ s2) :=
  match s1, r1 with
  | [], () => r2
  | [_], v => addVal v r2
  | _::_::_, (v, r') => (v, r'.append r2)
```

标准库中的 {anchorName ListFlatMap}`List.flatMap` 将本身返回列表的函数应用于输入列表的每个条目，按顺序返回拼接所得列表的结果：

```anchor ListFlatMap
def List.flatMap (f : α → List β) : (xs : List α) → List β
  | [] => []
  | x :: xs => f x ++ xs.flatMap f
```
类型签名表明 {anchorName ListFlatMap}`List.flatMap` 可用于实现 {anchorTerm ListMonad}`Monad List` 实例。
确实，与 {anchorTerm ListMonad}`pure x := [x]` 一起，{anchorName ListFlatMap}`List.flatMap` 确实实现了单子。
然而，它并不是很有用的 {anchorName ListMonad}`Monad` 实例。
{anchorName ListMonad}`List` 单子基本上是 {anchorName Many (module:=Examples.Monads.Many)}`Many` 的一个版本，在用户有机会请求若干值之前，就预先探索搜索空间中的_每一条_路径。
由于这一性能陷阱，通常为 {anchorName ListMonad}`List` 定义 {anchorName ListMonad}`Monad` 实例并不是好主意。
不过在这里，查询语言没有限制返回结果数量的运算符，因此组合所有可能性正是所期望的：

```anchor TableCartProd
def Table.cartesianProduct (table1 : Table s1) (table2 : Table s2) :
    Table (s1 ++ s2) :=
  table1.flatMap fun r1 => table2.map r1.append
```

与 {anchorName ListProduct (module:=Examples.DependentTypes.Finite)}`List.product` 一样，在恒等单子中使用带变异的循环，可以作为另一种实现技术：

```anchor TableCartProdOther
def Table.cartesianProduct (table1 : Table s1) (table2 : Table s2) :
    Table (s1 ++ s2) := Id.run do
  let mut out : Table (s1 ++ s2) := []
  for r1 in table1 do
    for r2 in table2 do
      out := (r1.append r2) :: out
  pure out.reverse
```


## 差集

可以使用 {anchorName misc}`List.filter` 从表中移除不需要的行，它接受一个列表和一个返回 {anchorName misc}`Bool` 的函数。
返回一个新列表，只包含函数返回 {anchorName misc}`true` 的条目。
例如，
```anchorTerm filterA
["Willamette", "Columbia", "Sandy", "Deschutes"].filter (·.length > 8)
```
求值为
```anchorTerm filterA
["Willamette", "Deschutes"]
```
因为 {anchorTerm filterA}`"Columbia"` 和 {anchorTerm filterA}`"Sandy"` 的长度小于或等于 {anchorTerm filterA}`8`。
可以使用辅助函数 {anchorName ListWithout}`List.without` 移除表中的条目：

```anchor ListWithout
def List.without [BEq α] (source banned : List α) : List α :=
  source.filter fun r => !(banned.contains r)
```
在解释查询时，这将与 {anchorName Row}`Row` 的 {anchorName BEqDBType}`BEq` 实例一起使用。

## 重命名列

用递归函数重命名行中的列，遍历行直到找到目标列，此时具有新名称的列获得与旧列相同的值：

```anchor renameRow
def Row.rename (c : HasCol s n t) (row : Row s) :
    Row (s.renameColumn c n') :=
  match s, row, c with
  | [_], v, .here => v
  | _::_::_, (v, r), .here => (v, r)
  | _::_::_, (v, r), .there next => addVal v (r.rename next)
```
虽然该函数改变了其参数的_类型_，实际返回值与原始参数包含的数据完全相同。
从运行时角度看，{anchorName renameRow}`Row.rename` 不过是一个缓慢的恒等函数。
用索引族编程的一个难点是，当性能重要时，这类运算会成为障碍。
要消除这类“重新索引”函数，需要非常仔细、往往脆弱的设计。

## 为列名添加前缀

为列名添加前缀与重命名列非常相似。
{anchorName prefixRow}`prefixRow` 不是前进到目标列后返回，而是必须处理所有列：

```anchor prefixRow
def prefixRow (row : Row s) :
    Row (s.map fun c => {c with name := n ++ "." ++ c.name}) :=
  match s, row with
  | [], _ => ()
  | [_], v => v
  | _::_::_, (v, r) => (v, prefixRow r)
```
这可以与 {anchorName misc}`List.map` 一起使用，为表中的所有行添加前缀。
同样，该函数的存在只是为了改变值的类型。

## 汇总

定义了所有这些辅助函数之后，执行查询只需要一个简短的递归函数：

```anchor QueryExec
def Query.exec : Query s → Table s
  | .table t => t
  | .union q1 q2 => exec q1 ++ exec q2
  | .diff q1 q2 => exec q1 |>.without (exec q2)
  | .select q e => exec q |>.filter e.evaluate
  | .project q _ sub => exec q |>.map (·.project _ sub)
  | .product q1 q2 _ => exec q1 |>.cartesianProduct (exec q2)
  | .renameColumn q c _ _ => exec q |>.map (·.rename c)
  | .prefixWith _ q => exec q |>.map prefixRow
```
构造子的一些参数在执行期间未使用。
特别是，构造子 {anchorName Query}`project` 和函数 {anchorName RowProj}`Row.project` 都将较小模式作为显式参数，但_证据_的类型——表明该模式是较大模式的子模式——包含足够的信息，让 Lean 自动填充该参数。
类似地，{anchorName Query}`product` 构造子所要求的两表列名互不相交的事实，{anchorName TableCartProd}`Table.cartesianProduct` 并不需要。
一般而言，依赖类型为让 Lean 代程序员填充参数提供了许多机会。

对查询结果使用点记号调用 {lit}`Table` 和 {lit}`List` 命名空间中定义的函数，例如 {anchorName misc}`List.map`、{anchorName misc}`List.filter` 和 {anchorName TableCartProd}`Table.cartesianProduct`。
这是因为 {anchorName Table}`Table` 是用 {kw}`abbrev` 定义的。
就像类型类搜索一样，点记号可以穿透用 {kw}`abbrev` 创建的定义。

{anchorName Query}`select` 的实现也相当简洁。
执行查询 {anchorName selectCase}`q` 之后，使用 {anchorName misc}`List.filter` 移除不满足表达式的行。
{anchorName misc}`List.filter` 期望从 {anchorTerm Table}`Row s` 到 {anchorName misc}`Bool` 的函数，但 {anchorName DBExprEval}`DBExpr.evaluate` 的类型是 {anchorTerm DBExprEvalType}`Row s → DBExpr s t → t.asType`。
由于 {anchorName Query}`select` 构造子的类型要求表达式具有类型 {anchorTerm Query}`DBExpr s .bool`，在此上下文中 {anchorTerm DBExprEvalType}`t.asType` 实际上是 {anchorName misc}`Bool`。

可以写一个查询，找出海拔高于 500 米的所有山峰的高度：

```anchor Query1
open Query in
def example1 :=
  table mountainDiary |>.select
  (.lt (.const 500) (c! "elevation")) |>.project
  [⟨"elevation", .int⟩] (by repeat constructor)
```

执行它返回预期的整数列表：
```anchor Query1Exec
#eval example1.exec
```
```anchorInfo Query1Exec
[3637, 1519, 2549]
```

要规划观光路线，可能需要匹配同一地点的所有山峰与瀑布对。
这可以通过对两表取笛卡尔积、只选择它们位置相等的行，然后投影出名称来实现：

```anchor Query2
open Query in
def example2 :=
  let mountain := table mountainDiary |>.prefixWith "mountain"
  let waterfall := table waterfallDiary |>.prefixWith "waterfall"
  mountain.product waterfall (by decide)
    |>.select (.eq (c! "mountain.location") (c! "waterfall.location"))
    |>.project [⟨"mountain.name", .string⟩, ⟨"waterfall.name", .string⟩]
      (by repeat constructor)
```
由于示例数据只包含美国的瀑布，执行该查询返回美国境内的山峰与瀑布配对：
```anchor Query2Exec
#eval example2.exec
```
```anchorInfo Query2Exec
[("Mount Nebo", "Multnomah Falls"), ("Mount Nebo", "Shoshone Falls"), ("Moscow Mountain", "Multnomah Falls"),
  ("Moscow Mountain", "Shoshone Falls"), ("Mount St. Helens", "Multnomah Falls"),
  ("Mount St. Helens", "Shoshone Falls")]
```

## 可能遇到的错误

{anchorName Query}`Query` 的定义排除了许多潜在错误。
例如，在 {anchorTerm Query2}`"mountain.location"` 中忘记添加限定词，会对列引用 {anchorTerm QueryOops1}`c! "location"` 产生编译时错误并高亮显示：
```anchor QueryOops1
open Query in
def example2 :=
  let mountains := table mountainDiary |>.prefixWith "mountain"
  let waterfalls := table waterfallDiary |>.prefixWith "waterfall"
  mountains.product waterfalls (by simp)
    |>.select (.eq (c! "location") (c! "waterfall.location"))
    |>.project [⟨"mountain.name", .string⟩, ⟨"waterfall.name", .string⟩]
      (by repeat constructor)
```
这是极好的反馈！
另一方面，错误信息的文字相当难以据此采取行动：
```anchorError QueryOops1
unsolved goals
case a.a.a.a.a.a.a
mountains : Query (List.map (fun c => { name := "mountain" ++ "." ++ c.name, contains := c.contains }) peak) := ⋯
waterfalls : Query (List.map (fun c => { name := "waterfall" ++ "." ++ c.name, contains := c.contains }) waterfall) := ⋯
⊢ HasCol (List.map (fun c => { name := "waterfall" ++ "." ++ c.name, contains := c.contains }) []) "location" ?m.62066
```

类似地，忘记为两表名称添加前缀，会在 {kw}`by decide` 上产生错误，该处应提供模式确实互不相交的证据：
```anchor QueryOops2
open Query in
def example2 :=
  let mountains := table mountainDiary
  let waterfalls := table waterfallDiary
  mountains.product waterfalls (by decide)
    |>.select (.eq (c! "mountain.location") (c! "waterfall.location"))
    |>.project [⟨"mountain.name", .string⟩, ⟨"waterfall.name", .string⟩]
      (by repeat constructor)
```
这条错误信息更有帮助：
```anchorError QueryOops2
Tactic `decide` proved that the proposition
  disjoint (List.map Column.name peak) (List.map Column.name waterfall) = true
is false
```

Lean 的宏系统包含实现查询便捷语法以及安排有用错误信息所需的一切。
遗憾的是，在本书范围内无法描述如何用 Lean 宏实现语言。
像 {anchorName Query}`Query` 这样的索引族，可能最适合作为类型化数据库交互库的核心，而不是其用户界面。

# 练习

## 日期

定义一个表示日期的结构体。将它添加到 {anchorName DBExpr}`DBType` 宇宙中，并相应更新其余代码。提供似乎必要的额外 {anchorName DBExpr}`DBExpr` 构造子。

## 可空类型

通过用以下结构体表示数据库类型，为查询语言添加对可空列的支持：
```anchor nullable
structure NDBType where
  underlying : DBType
  nullable : Bool

abbrev NDBType.asType (t : NDBType) : Type :=
  if t.nullable then
    Option t.underlying.asType
  else
    t.underlying.asType
```

在 {anchorName Schema}`Column` 和 {anchorName DBExpr}`DBExpr` 中用该类型替代 {anchorName DBExpr}`DBType`，并查阅 SQL 关于 {lit}`NULL` 和比较运算符的规则，以确定 {anchorName DBExpr}`DBExpr` 构造子的类型。

## 试探策略

使用 {kw}`by repeat constructor` 让 Lean 查找以下类型的值，结果分别是什么？解释为什么各自得到该结果。
 * {anchorName Naturals}`Nat`
 * {anchorTerm misc}`List Nat`
 * {anchorTerm misc}`Vect Nat 4`

 * {anchorTerm misc}`Row []`
 * {anchorTerm misc}`Row [⟨"price", .int⟩]`
 * {anchorTerm misc}`Row peak`
 * {anchorTerm misc}`HasCol [⟨"price", .int⟩, ⟨"price", .int⟩] "price" .int`