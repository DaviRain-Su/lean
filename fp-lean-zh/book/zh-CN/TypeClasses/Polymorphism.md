# 类型类中的多态性

编写适用于给定函数*任意*重载版本的函数可能很有用。
例如，{anchorTerm printlnType}`IO.println` 适用于任何具有 {anchorTerm printlnType}`ToString` 实例的类型。
这通过在所需实例周围使用方括号来表示：{anchorTerm printlnType}`IO.println` 的类型是 {anchorTerm printlnType}`{α : Type} → [ToString α] → α → IO Unit`。
该类型表明 {anchorTerm printlnType}`IO.println` 接受一个类型为 {anchorTerm printlnType}`α` 的参数（Lean 应自动确定该类型），并且必须为 {anchorTerm printlnType}`α` 提供一个 {anchorTerm printlnType}`ToString` 实例。
它返回一个 {anchorTerm printlnType}`IO` 动作。

# 检查多态函数的类型
%%%
tag := "checking-polymorphic-types"
%%%

检查接受隐式参数或使用类型类的函数的类型，需要使用一些额外的语法。
仅写
```anchor printlnMetas
#check (IO.println)
```
会得到一个带有元变量的类型：
```anchorInfo printlnMetas
IO.println : ?m.2620 → IO Unit
```
这是因为 Lean 会尽力发现隐式参数，而元变量的存在表明它尚未发现足够的类型信息来完成这一工作。
要理解函数的签名，可以在函数名前面加上 at 符号（{anchorTerm printlnNoMetas}`@`）来抑制这一特性：
```anchor printlnNoMetas
#check @IO.println
```
```anchorInfo printlnNoMetas
@IO.println : {α : Type u_1} → [ToString α] → α → IO Unit
```
{lit}`Type` 后面有一个 {lit}`u_1`，它使用了 Lean 中尚未介绍的一个特性。
目前，请忽略这些 {lit}`Type` 的参数。

# 用实例隐式定义多态函数
%%%
tag := "defining-polymorphic-functions-with-instance-implicits"
%%%

:::paragraph
对列表中所有条目求和的函数需要两个实例：{moduleName}`Add` 允许对条目相加，而 {anchorTerm ListSum}`0` 的 {moduleName}`OfNat` 实例为返回空列表提供了一个合理的值：

```anchor ListSum
def List.sumOfContents [Add α] [OfNat α 0] : List α → α
  | [] => 0
  | x :: xs => x + xs.sumOfContents
```
这个函数也可以用 {anchorTerm ListSumZ}`Zero α` 要求来定义，而不是 {anchorTerm ListSum}`OfNat α 0`。
两者是等价的，但 {anchorTerm ListSumZ}`Zero α` 可能更易读：

```anchor ListSumZ
def List.sumOfContents [Add α] [Zero α] : List α → α
  | [] => 0
  | x :: xs => x + xs.sumOfContents
```
:::

:::paragraph

这个函数可以用于 {anchorTerm fourNats}`Nat` 列表：

```anchor fourNats
def fourNats : List Nat := [1, 2, 3, 4]
```
```anchor fourNatsSum
#eval fourNats.sumOfContents
```
```anchorInfo fourNatsSum
10
```
但不能用于 {anchorTerm fourPos}`Pos` 数字列表：

```anchor fourPos
def fourPos : List Pos := [1, 2, 3, 4]
```
```anchor fourPosSum
#eval fourPos.sumOfContents
```
```anchorError fourPosSum
failed to synthesize
  Zero Pos

Hint: Additional diagnostic information may be available using the `set_option diagnostics true` command.
```
Lean 标准库包含这个函数，它被称为 {moduleName}`List.sum`。

:::

方括号中指定所需实例的写法称为**实例隐式**（instance implicits）。
在幕后，每个类型类都定义一个结构体，其中每个重载运算对应一个字段。
实例是该结构体类型的值，每个字段包含一个实现。
在调用点，Lean 负责为每个实例隐式参数找到一个实例值。
普通隐式参数与实例隐式之间最重要的区别在于 Lean 查找参数值所采用的策略。
对于普通隐式参数，Lean 使用称为**合一**（unification）的技术来查找一个唯一的参数值，使程序能够通过类型检查。
这一过程仅依赖于函数定义和调用点所涉及的具体类型。
对于实例隐式，Lean 则查阅一个内建的实例值表。

正如 {anchorTerm OfNatPos}`Pos` 的 {anchorName OfNatPos}`OfNat` 实例将自然数 {anchorName OfNatPos}`n` 作为自动隐式参数一样，实例本身也可以接受实例隐式参数。
{ref "polymorphism"}[多态性一节] 介绍了一个多态点类型：

```anchor PPoint
structure PPoint (α : Type) where
  x : α
  y : α
```
点的加法应当把底层的 {anchorName PPoint}`x` 和 {anchorName PPoint}`y` 字段相加。
因此，{anchorName AddPPoint}`PPoint` 的 {anchorName AddPPoint}`Add` 实例要求这些字段所具有的类型上存在一个 {anchorName AddPPoint}`Add` 实例。
换句话说，{anchorName AddPPoint}`PPoint` 的 {anchorName AddPPoint}`Add` 实例还需要为 {anchorName AddPPoint}`α` 提供一个进一步的 {anchorName AddPPoint}`Add` 实例：

```anchor AddPPoint
instance [Add α] : Add (PPoint α) where
  add p1 p2 := { x := p1.x + p2.x, y := p1.y + p2.y }
```
当 Lean 遇到两个点的加法时，它会搜索并找到这个实例。
然后它会进一步搜索 {anchorTerm AddPPoint}`Add α` 实例。

以这种方式构造的实例值是类型类结构体类型的值。
一次成功的递归实例搜索会产生一个结构体值，其中包含对另一个结构体值的引用。
{anchorTerm AddPPointNat}`Add (PPoint Nat)` 的实例包含对找到的 {anchorTerm AddPPointNat}`Add Nat` 实例的引用。

这种递归搜索过程意味着，类型类比普通的重载函数提供了显著更强的能力。
一个多态实例库是一组代码构建块，编译器仅凭所需的类型就能自行组装它们。
接受实例参数的多态函数是对类型类机制发出的潜在请求，要求它在幕后组装辅助函数。
API 的使用者无需亲手拼接所有必要部件的负担。

# 方法与隐式参数
%%%
tag := "method-implicit-params"
%%%

{anchorTerm ofNatType}`OfNat.ofNat` 的类型可能令人惊讶。
它是 {anchorTerm ofNatType}`: {α : Type} → (n : Nat) → [OfNat α n] → α`，其中 {anchorTerm ofNatType}`Nat` 参数 {anchorTerm ofNatType}`n` 作为显式函数参数出现。
然而，在方法的声明中，{anchorName OfNat}`ofNat` 的类型仅仅是 {anchorName ofNatType}`α`。
这种看似矛盾的现象是因为声明类型类实际上会产生以下内容：

 * 一个结构体类型，用于容纳每个重载运算的实现
 * 一个与类同名的命名空间
 * 对于每个方法，类命名空间中有一个函数，从实例中检索其实现

这类似于声明新结构体也会声明访问器函数的方式。
主要区别在于，结构体的访问器将结构体值作为显式参数，而类型类方法将实例值作为实例隐式参数，由 Lean 自动查找。

为了让 Lean 找到实例，其参数必须可用。
这意味着类型类的每个参数都必须是方法中出现在实例之前的参数。
当这些参数是隐式的时候最方便，因为 Lean 会负责发现它们的值。
例如，{anchorTerm addType}`Add.add` 的类型是 {anchorTerm addType}`{α : Type} → [Add α] → α → α → α`。
在这种情况下，类型参数 {anchorTerm addType}`α` 可以是隐式的，因为 {anchorTerm addType}`Add.add` 的参数提供了用户意图使用哪种类型的信息。
然后可以用该类型来搜索 {anchorTerm addType}`Add` 实例。

然而，对于 {anchorName ofNatType}`OfNat.ofNat`，要解码的特定 {moduleName}`Nat` 字面量并不出现在任何其他参数的类型中。
这意味着 Lean 在尝试确定隐式参数 {anchorName ofNatType}`n` 时没有任何信息可用。
结果将是一个非常不便的 API。
因此，在这些情况下，Lean 对类的方法使用显式参数。

# 练习
%%%
tag := "type-class-polymorphism-exercises"
%%%

## 偶数数字字面量
%%%
tag := none
%%%

为 {ref "even-numbers-ex"}[上一节练习] 中的偶数数据类型编写一个 {anchorName ofNatType}`OfNat` 实例，该实例使用递归实例搜索。

## 递归实例搜索深度
%%%
tag := none
%%%

Lean 编译器尝试递归实例搜索的次数是有限制的。
这限制了上一练习中定义的偶数数字字面量的大小。
通过实验确定这个限制是多少。