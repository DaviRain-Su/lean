# 宇宙模式

%%%
tag := "universe-pattern"
%%%

在 Lean 中，像 {anchorTerm sundries}`Type`、{anchorTerm sundries}`Type 3` 和 {anchorTerm sundries}`Prop` 这样对其他类型进行分类的类型称为宇宙（universes）。
然而，**宇宙**（universe）一词也指一种设计模式：用一种数据类型来表示 Lean 类型的一个子集，再用一个函数把该数据类型的构造子解释成真正的类型。
这种数据类型的值称为相应类型的**代码**（codes）。

就像 Lean 的内建宇宙一样，用这种模式实现的宇宙也是描述某一组可用类型的类型，尽管实现机制不同。
在 Lean 中，有像 {anchorTerm sundries}`Type`、{anchorTerm sundries}`Type 3` 和 {anchorTerm sundries}`Prop` 这样直接描述其他类型的类型。
这种安排称为 {deftech}**Russell 式宇宙**（universes à la Russell）。
本节描述的用户定义宇宙则把所有类型都表示为**数据**，并包含一个显式函数，把这些代码解释成真正的类型。
这种安排称为 {deftech}**Tarski 式宇宙**（universes à la Tarski）。
像 Lean 这样基于依赖类型论的语言几乎总是使用 Russell 式宇宙，但 Tarski 式宇宙是在这些语言中定义 API 时很有用的模式。

定义自定义宇宙，可以把 API 限定在一组封闭的类型集合中使用。
由于类型集合是封闭的，对代码做递归就能让程序适用于宇宙中的**任意**类型。
自定义宇宙的一个例子包含代码 {anchorName NatOrBool}`nat`，表示 {anchorName NatOrBool}`Nat`，以及 {anchorName NatOrBool}`bool`，表示 {anchorName NatOrBool}`Bool`：

```anchor NatOrBool
inductive NatOrBool where
  | nat | bool

abbrev NatOrBool.asType (code : NatOrBool) : Type :=
  match code with
  | .nat => Nat
  | .bool => Bool
```
对代码做模式匹配允许细化类型，就像对 {moduleName (module := Examples.DependentTypes)}`Vect` 的构造子做模式匹配允许细化期望长度一样。
例如，可以如下编写一个从这个宇宙中的类型反序列化字符串的程序：

```anchor decode
def decode (t : NatOrBool) (input : String) : Option t.asType :=
  match t with
  | .nat => input.toNat?
  | .bool =>
    match input with
    | "true" => some true
    | "false" => some false
    | _ => none
```
对 {anchorName decode}`t` 做依赖模式匹配，允许把期望结果类型 {anchorTerm decode}`t.asType` 分别细化为 {anchorTerm natOrBoolExamples}`NatOrBool.nat.asType` 和 {anchorTerm natOrBoolExamples}`NatOrBool.bool.asType`，而它们会分别求值为真正的类型 {anchorName NatOrBool}`Nat` 和 {anchorName NatOrBool}`Bool`。

与其他数据一样，代码也可以是递归的。
类型 {anchorName NestedPairs}`NestedPairs` 为二元组与自然数类型的任意可能嵌套提供代码：

```anchor NestedPairs
inductive NestedPairs where
  | nat : NestedPairs
  | pair : NestedPairs → NestedPairs → NestedPairs

abbrev NestedPairs.asType : NestedPairs → Type
  | .nat => Nat
  | .pair t1 t2 => asType t1 × asType t2
```
在这种情况下，解释函数 {anchorName NestedPairs}`NestedPairs.asType` 是递归的。
这意味着要实现该宇宙的 {anchorName NestedPairsbeq}`BEq`，就需要对代码做递归：

```anchor NestedPairsbeq
def NestedPairs.beq (t : NestedPairs) (x y : t.asType) : Bool :=
  match t with
  | .nat => x == y
  | .pair t1 t2 => beq t1 x.fst y.fst && beq t2 x.snd y.snd

instance {t : NestedPairs} : BEq t.asType where
  beq x y := t.beq x y
```

尽管 {anchorName beqNoCases}`NestedPairs` 宇宙中的每个类型都已经有 {anchorName beqNoCases}`BEq` 实例，类型类搜索并不会在实例声明中自动检查数据类型的每一种可能情形，因为这样的情形可能有无穷多个，就像 {anchorName beqNoCases}`NestedPairs` 那样。
如果试图直接依赖 {anchorName beqNoCases}`BEq` 实例，而不是向 Lean 说明如何通过代码上的递归来找到它们，就会得到错误：
```anchor beqNoCases
instance {t : NestedPairs} : BEq t.asType where
  beq x y := x == y
```
```anchorError beqNoCases
failed to synthesize
  BEq t.asType

Hint: Additional diagnostic information may be available using the `set_option diagnostics true` command.
```
错误信息中的 {anchorName beqNoCases}`t` 代表一个类型为 {anchorName beqNoCases}`NestedPairs` 的未知值。

# 类型类与宇宙
%%%
tag := "type-classes-vs-universe-pattern"
%%%

类型类允许 API 与一组开放扩展的类型集合一起使用，只要这些类型实现了必要的接口。
在大多数情况下，这更可取。
很难事先预测 API 的所有用例，而类型类是一种便捷方式，使库代码能用于比原作者预期更多的类型。

另一方面，Tarski 式宇宙把 API 限制为只能与预先确定的一组类型一起使用。
这在少数情况下很有用：
 * 当函数应根据传入的类型表现得很不同时——无法对类型本身做模式匹配，但可以对类型的代码做模式匹配
 * 当外部系统本质上限制了可提供的数据类型，而并不希望额外灵活性时
 * 当除了某些运算的实现之外，还需要类型的额外性质时

类型类在许多与 Java 或 C# 中接口相同的场景下都很有用，而 Tarski 式宇宙在可能使用密封类、但普通归纳数据类型又不可用的情形下会很有用。

# 有限类型宇宙
%%%
tag := "finite-type-universe"
%%%

把 API 可用的类型限制在预先确定的一组类型中，可以启用对开放 API 来说不可能实现的操作。
例如，函数通常无法比较相等性。
函数应在把相同输入映射到相同输出时被视为相等。
检查这一点可能花费无穷时间，因为比较两个类型为 {anchorTerm sundries}`Nat → Bool` 的函数，需要检查这两个函数对**每一个** {anchorName sundries}`Nat` 都返回相同的 {anchorName sundries}`Bool`。

换句话说，从无限类型出发的函数本身也是无限的。
函数可以看作表格，而参数类型为无限的函数需要无穷多行来表示每一种情形。
但从有限类型出发的函数，其表格只需要有限行，因此它们本身是有限的。
两个参数类型为有限的函数，可以通过枚举所有可能参数、对每个参数调用这两个函数，再比较结果来检查相等性。
检查高阶函数的相等性，需要生成给定类型的所有可能函数，这还要求返回类型也是有限的，这样才能把参数类型的每个元素映射到返回类型的每个元素。
这不是一种**快速**方法，但它确实能在有限时间内完成。

表示有限类型的一种方式是使用宇宙：

```anchor Finite
inductive Finite where
  | unit : Finite
  | bool : Finite
  | pair : Finite → Finite → Finite
  | arr : Finite → Finite → Finite

abbrev Finite.asType : Finite → Type
  | .unit => Unit
  | .bool => Bool
  | .pair t1 t2 => asType t1 × asType t2
  | .arr dom cod => asType dom → asType cod
```
在这个宇宙中，构造子 {anchorName Finite}`arr` 表示函数类型，而函数类型在写法上使用箭头（{anchorName Finite}`arr`ow）。

:::paragraph
比较这个宇宙中两个值的相等性，与 {anchorName NestedPairs}`NestedPairs` 宇宙中的做法几乎相同。
唯一重要的区别是增加了 {anchorName Finite}`arr` 的情形，它使用名为 {anchorName FiniteAll}`Finite.enumerate` 的辅助函数来生成由 {anchorName FiniteBeq}`dom` 编码的类型中的每个值，并检查两个函数对所有可能输入都返回相等结果：

```anchor FiniteBeq
def Finite.beq (t : Finite) (x y : t.asType) : Bool :=
  match t with
  | .unit => true
  | .bool => x == y
  | .pair t1 t2 => beq t1 x.fst y.fst && beq t2 x.snd y.snd
  | .arr dom cod =>
    dom.enumerate.all fun arg => beq cod (x arg) (y arg)
```
标准库函数 {anchorName sundries}`List.all` 检查所提供的函数在列表的每个条目上都返回 {anchorName sundries}`true`。
这个函数可用于比较定义在布尔值上的函数是否相等：
```anchor arrBoolBoolEq
#eval Finite.beq (.arr .bool .bool) (fun _ => true) (fun b => b == b)
```
```anchorInfo arrBoolBoolEq
true
```
它也可用于比较标准库中的函数：
```anchor arrBoolBoolEq2
#eval Finite.beq (.arr .bool .bool) (fun _ => true) not
```
```anchorInfo arrBoolBoolEq2
false
```
它甚至能比较用函数组合等工具构造的函数：
```anchor arrBoolBoolEq3
#eval Finite.beq (.arr .bool .bool) id (not ∘ not)
```
```anchorInfo arrBoolBoolEq3
true
```
这是因为 {anchorName Finite}`Finite` 宇宙编码的是 Lean **真正**的函数类型，而不是库创建的某种特殊类比物。
:::

{anchorName FiniteAll}`enumerate` 的实现同样通过对来自 {anchorName FiniteAll}`Finite` 的代码做递归来完成。
```anchor FiniteAll
  def Finite.enumerate (t : Finite) : List t.asType :=
    match t with
    | .unit => [()]
    | .bool => [true, false]
    | .pair t1 t2 => t1.enumerate.product t2.enumerate
    | .arr dom cod => dom.functions cod.enumerate
```
对于 {anchorName Finite}`Unit` 的情形，只有一个值。
对于 {anchorName Finite}`Bool` 的情形，有两个要返回的值（{anchorName sundries}`true` 和 {anchorName sundries}`false`）。
对于二元组的情形，结果应是由 {anchorName FiniteAll}`t1` 编码的类型中的值与 {anchorName FiniteAll}`t2` 编码的类型中的值做笛卡尔积。
换句话说，应把 {anchorName FiniteAll}`dom` 中的每个值与 {anchorName FiniteAll}`cod` 中的每个值配对。
辅助函数 {anchorName ListProduct}`List.product` 当然可以用普通递归函数来写，但这里用恒等单子中的 {kw}`for` 来定义：

```anchor ListProduct
def List.product (xs : List α) (ys : List β) : List (α × β) := Id.run do
  let mut out : List (α × β) := []
  for x in xs do
    for y in ys do
      out := (x, y) :: out
  pure out.reverse
```
最后，{anchorName FiniteAll}`Finite.enumerate` 的函数情形委托给一个名为 {anchorName FiniteFunctionSigStart}`Finite.functions` 的辅助函数，该函数接受所有可能返回值组成的列表作为参数。

一般而言，生成从某个有限类型到一组结果值的所有函数，可以看作生成这些函数的表格。
每个函数为每个输入分配一个输出，这意味着当存在 $`k` 个可能参数时，给定函数的表格有 $`k` 行。
由于表格的每一行都可以从 $`n` 个可能输出中任选其一，因此共有 $`n ^ k` 个潜在函数要生成。

再一次，生成从有限类型到某个值列表的函数，需要对描述该有限类型的代码做递归：
```anchor FiniteFunctionSigStart
def Finite.functions
    (t : Finite)
    (results : List α) : List (t.asType → α) :=
  match t with
```

从 {anchorName Finite}`Unit` 出发的函数的表格只有一行，因为函数无法根据所给输入选择不同结果。
这意味着为每个潜在输入生成一个函数。
```anchor FiniteFunctionUnit
| .unit =>
  results.map fun r =>
    fun () => r
```
当存在 $`n` 个结果值时，从 {anchorName sundries}`Bool` 出发有 $`n^2` 个函数，因为每个类型为 {anchorTerm sundries}`Bool → α` 的函数都使用 {anchorName sundries}`Bool` 在两个特定的 {anchorName sundries}`α` 之间做选择：
```anchor FiniteFunctionBool
| .bool =>
  (results.product results).map fun (r1, r2) =>
    fun
      | true => r1
      | false => r2
```
生成从二元组出发的函数，可以利用柯里化。
从二元组出发的函数可以变换成一个先接受二元组第一个元素、再返回一个等待第二个元素的函数的函数。
这样做允许在这一情形中递归使用 {anchorName FiniteFunctionSigStart}`Finite.functions`：
```anchor FiniteFunctionPair
| .pair t1 t2 =>
  let f1s := t1.functions <| t2.functions results
  f1s.map fun f =>
    fun (x, y) =>
      f x y
```

生成高阶函数有点烧脑。
每个高阶函数都接受一个函数作为参数。
这个参数函数可以根据其输入/输出行为与其他函数区分开来。
一般而言，高阶函数可以把参数函数应用到每个可能参数上，然后可以根据应用参数函数所得结果采取任何可能行为。
这提示了一种构造高阶函数的方法：
 * 从作为参数的那个函数的所有可能参数列表开始。
 * 对于每个可能参数，构造应用参数函数到该可能参数后所能产生的所有可能行为。这可以通过 {anchorName FiniteFunctionSigStart}`Finite.functions` 以及对剩余可能参数的递归来完成，因为递归结果表示基于对其余可能参数的观察所得到的函数。{anchorName FiniteFunctionSigStart}`Finite.functions` 则构造基于当前参数观察来实现这些行为的所有方式。
 * 对于响应这些观察的每种潜在行为，构造一个把参数函数应用到当前可能参数的高阶函数，然后把结果传给观察行为。
 * 递归的基础情形是一个对每个结果值都不做任何观察的高阶函数——它忽略参数函数，只返回结果值。

直接定义这个递归函数会导致 Lean 无法证明整个函数会终止。
然而，可以使用一种更简单的递归形式，称为**右折叠**（right fold），向终止检查器表明该函数会终止。
右折叠接受三个参数：一个把列表头部与对尾部的递归结果组合的步进函数、列表为空时返回的默认值，以及正在处理的列表。
然后它分析列表，本质上把列表中的每个 {lit}`::` 替换成对步进函数的调用，并把 {lit}`[]` 替换成默认值：

```anchor foldr
def List.foldr (f : α → β → β) (default : β) : List α → β
  | []     => default
  | a :: l => f a (foldr f default l)
```
可以用 {anchorName foldrSum}`foldr` 求列表中 {anchorName sundries}`Nat` 的和：
```anchorEvalSteps foldrSum
[1, 2, 3, 4, 5].foldr (· + ·) 0
===>
(1 :: 2 :: 3 :: 4 :: 5 :: []).foldr (· + ·) 0
===>
(1 + 2 + 3 + 4 + 5 + 0)
===>
15
```

借助 {anchorName foldrSum}`foldr`，可以如下创建高阶函数：
```anchor FiniteFunctionArr
    | .arr t1 t2 =>
      let args := t1.enumerate
      let base :=
        results.map fun r =>
          fun _ => r
      args.foldr
        (fun arg rest =>
          (t2.functions rest).map fun more =>
            fun f => more (f arg) f)
        base
```
{anchorName FiniteFunctions}`Finite.functions` 的完整定义是：
```anchor FiniteFunctions
def Finite.functions
    (t : Finite)
    (results : List α) : List (t.asType → α) :=
  match t with
| .unit =>
  results.map fun r =>
    fun () => r
| .bool =>
  (results.product results).map fun (r1, r2) =>
    fun
      | true => r1
      | false => r2
| .pair t1 t2 =>
  let f1s := t1.functions <| t2.functions results
  f1s.map fun f =>
    fun (x, y) =>
      f x y
    | .arr t1 t2 =>
      let args := t1.enumerate
      let base :=
        results.map fun r =>
          fun _ => r
      args.foldr
        (fun arg rest =>
          (t2.functions rest).map fun more =>
            fun f => more (f arg) f)
        base
```



由于 {anchorName MutualStart}`Finite.enumerate` 和 {anchorName FiniteFunctions}`Finite.functions` 互相调用，它们必须在 {kw}`mutual` 块中定义。
换句话说，在 {anchorName MutualStart}`Finite.enumerate` 的定义之前紧挨着是 {kw}`mutual` 关键字：
```anchor MutualStart
mutual
  def Finite.enumerate (t : Finite) : List t.asType :=
    match t with
```
而在 {anchorName FiniteFunctions}`Finite.functions` 的定义之后紧挨着是 {kw}`end` 关键字：
```anchor MutualEnd
    | .arr t1 t2 =>
      let args := t1.enumerate
      let base :=
        results.map fun r =>
          fun _ => r
      args.foldr
        (fun arg rest =>
          (t2.functions rest).map fun more =>
            fun f => more (f arg) f)
        base
end
```

这种比较函数的算法并不特别实用。
需要检查的情形数量呈指数增长；即使是像 {anchorTerm lots}`((Bool × Bool) → Bool) → Bool` 这样简单的类型，也描述了 {anchorInfoText nestedFunLength}`65536` 个不同的函数。
为什么这么多？
根据上面的推理，并用 $`\left| T \right|` 表示类型 $`T` 所描述的值的数量，我们应预期
$$`\left| \left( \left( \mathtt{Bool} \times \mathtt{Bool} \right) \rightarrow \mathtt{Bool} \right) \rightarrow \mathtt{Bool} \right|`
是
$$`\left|\mathrm{Bool}\right|^{\left| \left( \mathtt{Bool} \times \mathtt{Bool} \right) \rightarrow \mathtt{Bool} \right| },`
也就是
$$`2^{2^{\left| \mathtt{Bool} \times \mathtt{Bool} \right| }},`
再也就是
$$`2^{2^4}`
或 65536。
嵌套指数增长很快，高阶函数的数量也很多。


# 练习
%%%
tag := "universe-exercises"
%%%

 * 编写一个函数，把由 {anchorName Finite}`Finite` 编码的任意类型中的值转换为字符串。函数应表示成它们的表格。
 * 把空类型 {anchorName sundries}`Empty` 添加到 {anchorName Finite}`Finite` 和 {anchorName FiniteBeq}`Finite.beq` 中。
 * 把 {anchorName sundries}`Option` 添加到 {anchorName Finite}`Finite` 和 {anchorName FiniteBeq}`Finite.beq` 中。