# 数组与终止性

%%%
tag := "array-termination"
%%%

要编写高效代码，选择合适的数据结构很重要。
链表有其用武之地：在某些应用中，能够共享列表尾部非常重要。
然而，对于可变长顺序数据集合的大多数用例，数组是更好的选择——它们既有更少的内存开销，也有更好的局部性。

不过，数组相对于链表有两个缺点：
 1. 数组通过索引访问，而非模式匹配，这带来了 {ref "props-proofs-indexing"}[证明义务]，以维持安全性。
 2. 从左到右处理整个数组的循环是尾递归函数，但它没有在每个调用上递减的参数。

有效使用数组需要知道如何向 Lean 证明数组索引在边界内，以及如何证明趋近数组长度的数组索引也能使程序终止。
这两者都用不等式命题表达，而非命题相等性。

# 不等式
%%%
tag := "inequality"
%%%

因为不同类型有不同的排序概念，不等式由两个类型类 {anchorName ordSugarClasses (module := Examples.Classes)}`LE` 和 {anchorName ordSugarClasses (module := Examples.Classes)}`LT` 管理。
{ref "equality-and-ordering"}[标准类型类] 一节中的表格描述了这些类与语法的关系：

:::table +header
*
  * 表达式
  * 脱糖形式
  * 类型类名称

*
  * {anchorTerm ltDesugar (module := Examples.Classes)}`x < y`
  * {anchorTerm ltDesugar (module := Examples.Classes)}`LT.lt x y`
  * {anchorName ordSugarClasses (module := Examples.Classes)}`LT`

*
  * {anchorTerm leDesugar (module := Examples.Classes)}`x ≤ y`
  * {anchorTerm leDesugar (module := Examples.Classes)}`LE.le x y`
  * {anchorName ordSugarClasses (module := Examples.Classes)}`LE`

*
  * {anchorTerm gtDesugar (module := Examples.Classes)}`x > y`
  * {anchorTerm gtDesugar (module := Examples.Classes)}`LT.lt y x`
  * {anchorName ordSugarClasses (module := Examples.Classes)}`LT`

*
  * {anchorTerm geDesugar (module := Examples.Classes)}`x ≥ y`
  * {anchorTerm geDesugar (module := Examples.Classes)}`LE.le y x`
  * {anchorName ordSugarClasses (module := Examples.Classes)}`LE`

:::

换言之，类型可以自定义 {anchorTerm ltDesugar (module:=Examples.Classes)}`<` 和 {anchorTerm leDesugar (module:=Examples.Classes)}`≤` 运算符的含义，而 {anchorTerm gtDesugar (module:=Examples.Classes)}`>` 和 {anchorTerm geDesugar (module:=Examples.Classes)}`≥` 的含义由 {anchorTerm ltDesugar (module:=Examples.Classes)}`<` 和 {anchorTerm leDesugar (module:=Examples.Classes)}`≤` 导出。
类型类 {anchorName ordSugarClasses (module := Examples.Classes)}`LT` 和 {anchorName ordSugarClasses (module := Examples.Classes)}`LE` 的方法返回命题，而非 {anchorName CoeBoolProp (module:=Examples.Classes)}`Bool`：

```anchor less
class LE (α : Type u) where
  le : α → α → Prop

class LT (α : Type u) where
  lt : α → α → Prop
```

{anchorName LENat}`Nat` 的 {anchorName LENat}`LE` 实例委托给 {anchorName LENat}`Nat.le`：

```anchor LENat
instance : LE Nat where
  le := Nat.le
```
定义 {anchorName LENat}`Nat.le` 需要 Lean 中尚未介绍的一个特性：它是归纳定义的关系。

## 归纳定义的命题、谓词与关系
%%%
tag := "inductive-props"
%%%

{anchorName LENat}`Nat.le` 是一种_归纳定义的关系_。
正如 {kw}`inductive` 可用于创建新数据类型，它也可用于创建新命题。
当命题接受参数时，它称为_谓词_，可能对某些潜在参数为真，但并非对所有参数都为真。
接受多个参数的命题称为_关系_。

归纳定义命题的每个构造子都是一种证明它的方式。
换言之，命题的声明描述了它为真的不同形式的证据。
没有参数且只有一个构造子的命题可以相当容易地证明：

```anchor EasyToProve
inductive EasyToProve : Prop where
  | heresTheProof : EasyToProve
```
证明就是使用其构造子：

```anchor fairlyEasy
theorem fairlyEasy : EasyToProve := by
  constructor
```
事实上，应始终容易证明的命题 {anchorName True}`True`，其定义方式与 {anchorName EasyToProve}`EasyToProve` 相同：

```anchor True
inductive True : Prop where
  | intro : True
```

不接受参数的归纳定义命题，远不如归纳定义数据类型有趣。
这是因为数据本身就有趣——自然数 {anchorTerm IsThree}`3` 与数 {lit}`35` 不同，订了 3 个披萨的人会因 35 个在 30 分钟后送到而恼火。
命题的构造子描述了命题可以为真的方式，但一旦命题被证明，就无需知道使用了_哪些_底层构造子。
这就是为什么 {anchorTerm IsThree}`Prop` 宇宙中大多数有趣的归纳定义类型都接受参数。

:::paragraph
归纳定义的谓词 {anchorName IsThree}`IsThree` 表明其参数是三：

```anchor IsThree
inductive IsThree : Nat → Prop where
  | isThree : IsThree 3
```
此处使用的机制与 {ref "column-pointers"}[索引族（例如 {moduleName (module := Examples.DependentTypes.DB)}`HasCol`）] 相同，只是得到的类型是可以证明的命题，而非可以使用的数据。
:::

使用该谓词，可以证明三确实是三：

```anchor threeIsThree
theorem three_is_three : IsThree 3 := by
  constructor
```
类似地，{anchorName IsFive}`IsFive` 是表明其参数为 {anchorTerm IsFive}`5` 的谓词：

```anchor IsFive
inductive IsFive : Nat → Prop where
  | isFive : IsFive 5
```

若一个数是 3，则给它加 2 的结果应为 5。
这可表述为定理陈述：
```anchor threePlusTwoFive0
theorem three_plus_two_five : IsThree n → IsFive (n + 2) := by
  skip
```
得到的目标具有函数类型：
```anchorError threePlusTwoFive0
unsolved goals
n : Nat
⊢ IsThree n → IsFive (n + 2)
```
因此，可用 {anchorTerm threePlusTwoFive1}`intro` 策略将参数转换为假设：
```anchor threePlusTwoFive1
theorem three_plus_two_five : IsThree n → IsFive (n + 2) := by
  intro three
```
```anchorError threePlusTwoFive1
unsolved goals
n : Nat
three : IsThree n
⊢ IsFive (n + 2)
```
给定 {anchorName threePlusTwoFive1a}`n` 为 3 的假设，应可使用 {anchorName threePlusTwoFive1a}`IsFive` 的构造子完成证明：
```anchor threePlusTwoFive1a
theorem three_plus_two_five : IsThree n → IsFive (n + 2) := by
  intro three
  constructor
```
然而，这会产生错误：
```anchorError threePlusTwoFive1a
Tactic `constructor` failed: no applicable constructor found

n : Nat
three : IsThree n
⊢ IsFive (n + 2)
```
该错误发生是因为 {anchorTerm threePlusTwoFive2}`n + 2` 与 {anchorTerm IsFive}`5` 并非定义相等。
在普通函数定义中，可对假设 {anchorName threePlusTwoFive2}`three` 进行依赖模式匹配，将 {anchorName threePlusTwoFive2}`n` 细化为 {anchorTerm threeIsThree}`3`。
依赖模式匹配的策略等价物是 {anchorTerm threePlusTwoFive2}`cases`，其语法与 {kw}`induction` 类似：
```anchor threePlusTwoFive2
theorem three_plus_two_five : IsThree n → IsFive (n + 2) := by
  intro three
  cases three with
  | isThree => skip
```
在剩余情形中，{anchorName threePlusTwoFive2}`n` 已被细化为 {anchorTerm IsThree}`3`：
```anchorError threePlusTwoFive2
unsolved goals
case isThree
⊢ IsFive (3 + 2)
```
因为 {anchorTerm various}`3 + 2` 定义相等于 {anchorTerm IsFive}`5`，构造子现在可以应用：

```anchor threePlusTwoFive3
theorem three_plus_two_five : IsThree n → IsFive (n + 2) := by
  intro three
  cases three with
  | isThree => constructor
```

标准假命题 {anchorName various}`False` 没有构造子，因此无法提供直接证据。
为 {anchorName various}`False` 提供证据的唯一方式是某个假设本身不可能，类似于类型系统能看出不可达代码时可以使用 {kw}`nomatch`。
如 {ref "connectives"}[关于证明的初始插章] 所述，否定 {anchorTerm various}`Not A` 是 {anchorTerm various}`A → False` 的缩写。
{anchorTerm various}`Not A` 也可写作 {anchorTerm various}`¬A`。

四不是三：
```anchor fourNotThree0
theorem four_is_not_three : ¬ IsThree 4 := by
  skip
```
初始证明目标包含 {anchorName fourNotThree1}`Not`：
```anchorError fourNotThree0
unsolved goals
⊢ ¬IsThree 4
```
可用 {anchorTerm fourNotThree1}`unfold` 暴露它实际上是函数类型：
```anchor fourNotThree1
theorem four_is_not_three : ¬ IsThree 4 := by
  unfold Not
```
```anchorError fourNotThree1
unsolved goals
⊢ IsThree 4 → False
```
因为目标是函数类型，可用 {anchorTerm fourNotThree2}`intro` 将参数转换为假设。
无需保留 {anchorTerm fourNotThree1}`unfold`，因为 {anchorTerm fourNotThree2}`intro` 本身可以展开 {anchorName fourNotThree1}`Not` 的定义：
```anchor fourNotThree2
theorem four_is_not_three : ¬ IsThree 4 := by
  intro h
```
```anchorError fourNotThree2
unsolved goals
h : IsThree 4
⊢ False
```
在此证明中，{anchorTerm fourNotThreeDone}`cases` 策略立即解决目标：

```anchor fourNotThreeDone
theorem four_is_not_three : ¬ IsThree 4 := by
  intro h
  cases h
```
正如对 {anchorTerm otherEx (module:=Examples.DependentTypes)}`Vect String 2` 的模式匹配无需包含 {anchorName otherEx (module:=Examples.DependentTypes)}`Vect.nil` 的情形一样，对 {anchorTerm fourNotThreeDone}`IsThree 4` 的情形分析也无需包含 {anchorName IsThree}`isThree` 的情形。

## 自然数的不等式
%%%
tag := "inequality-of-natural-numbers"
%%%

{anchorName NatLe}`Nat.le` 的定义有一个参数和一个索引：

```anchor NatLe
inductive Nat.le (n : Nat) : Nat → Prop
  | refl : Nat.le n n
  | step : Nat.le n m → Nat.le n (m + 1)
```
参数 {anchorName NatLe}`n` 是应较小的数，索引是应大于或等于 {anchorName NatLe}`n` 的数。
当两数相等时使用 {anchorName NatLe}`refl` 构造子，当索引大于 {anchorName NatLe}`n` 时使用 {anchorName NatLe}`step` 构造子。

从证据的角度看，$`n \leq k` 的证明在于找到某个数 $`d`，使得 $`n + d = m`。
在 Lean 中，证明则由 {anchorName leNames}`Nat.le.refl` 构造子外包 $`d` 个 {anchorName leNames}`Nat.le.step` 实例构成。
每个 {anchorName NatLe}`step` 构造子将其索引参数加 1，因此 $`d` 个 {anchorName NatLe}`step` 构造子将较大数加 $`d`。
例如，四小于等于七的证据由三个 {anchorName NatLe}`step` 包裹一个 {anchorName NatLe}`refl` 构成：

```anchor four_le_seven
theorem four_le_seven : 4 ≤ 7 :=
  open Nat.le in
  step (step (step refl))
```

严格小于关系通过在左边加 1 来定义：

```anchor NatLt
def Nat.lt (n m : Nat) : Prop :=
  Nat.le (n + 1) m

instance : LT Nat where
  lt := Nat.lt
```
四严格小于七的证据由两个 {anchorName four_lt_seven}`step` 包裹一个 {anchorName four_lt_seven}`refl` 构成：

```anchor four_lt_seven
theorem four_lt_seven : 4 < 7 :=
  open Nat.le in
  step (step refl)
```
这是因为 {anchorTerm four_lt_seven}`4 < 7` 等价于 {anchorTerm four_lt_seven_alt}`5 ≤ 7`。

# 证明终止性
%%%
tag := "proving-termination"
%%%

函数 {anchorName ArrayMap}`Array.map` 用函数变换数组，返回包含将函数应用于输入数组每个元素结果的新数组。
将其写为尾递归函数遵循通常模式：委托给一个在累加器中传递输出数组的函数。
累加器初始化为空数组。
传递累加器的辅助函数还接受一个跟踪当前数组索引的参数，该索引从 {anchorTerm ArrayMap}`0` 开始：

```anchor ArrayMap
def Array.map (f : α → β) (arr : Array α) : Array β :=
  arrayMapHelper f arr Array.empty 0
```

辅助函数在每次迭代时应检查索引是否仍在边界内。
若是，应以变换后的元素添加到累加器末尾、索引加 {anchorTerm mapHelperIndexIssue}`1` 的方式再次循环。
否则应终止并返回累加器。
该代码的初始实现会失败，因为 Lean 无法证明数组索引有效：
```anchor mapHelperIndexIssue
def arrayMapHelper (f : α → β) (arr : Array α)
    (soFar : Array β) (i : Nat) : Array β :=
  if i < arr.size then
    arrayMapHelper f arr (soFar.push (f arr[i])) (i + 1)
  else soFar
```
```anchorError mapHelperIndexIssue
failed to prove index is valid, possible solutions:
  - Use `have`-expressions to prove the index is valid
  - Use `a[i]!` notation instead, runtime check is performed, and 'Panic' error message is produced if index is not valid
  - Use `a[i]?` notation instead, result is an `Option` type
  - Use `a[i]'h` notation instead, where `h` is a proof that index is valid
α : Type ?u.1811
β : Type ?u.1814
f : α → β
arr : Array α
soFar : Array β
i : Nat
⊢ i < arr.size
```
然而，条件表达式已经检查了数组索引有效性所要求的精确条件（即 {anchorTerm arrayMapHelperTermIssue}`i < arr.size`）。
为 {kw}`if` 添加名称可解决该问题，因为它添加了数组索引策略可以使用的假设：

```anchor arrayMapHelperTermIssue
def arrayMapHelper (f : α → β) (arr : Array α)
    (soFar : Array β) (i : Nat) : Array β :=
  if inBounds : i < arr.size then
    arrayMapHelper f arr (soFar.push (f arr[i])) (i + 1)
  else soFar
```
Lean 接受修改后的程序，尽管递归调用并非作用于输入构造子之一的参数。
事实上，累加器和索引都在增长，而非递减。

在幕后，Lean 的证明自动化构造了终止性证明。
重构该证明有助于理解 Lean 无法自动识别的情形。

为什么 {anchorName arrayMapHelperTermIssue}`arrayMapHelper` 会终止？
每次迭代检查索引 {anchorName arrayMapHelperTermIssue}`i` 对数组 {anchorName arrayMapHelperTermIssue}`arr` 是否仍在边界内。
若是，{anchorName arrayMapHelperTermIssue}`i` 递增并重复循环。
否则程序终止。
因为 {anchorTerm arrayMapHelperTermIssue}`arr.size` 是有限数，{anchorName arrayMapHelperTermIssue}`i` 只能递增有限次。
尽管函数的参数在每次调用时都不递减，{anchorTerm ArrayMapHelperOk}`arr.size - i` 会递减趋向零。

每次递归调用递减的值称为_{deftech}度量（measure）_。
可通过在定义末尾提供 {kw}`termination_by` 子句，指示 Lean 使用特定表达式作为终止性度量。
对 {anchorName ArrayMapHelperOk}`arrayMapHelper`，显式度量如下：

```anchor ArrayMapHelperOk
def arrayMapHelper (f : α → β) (arr : Array α)
    (soFar : Array β) (i : Nat) : Array β :=
  if inBounds : i < arr.size then
    arrayMapHelper f arr (soFar.push (f arr[i])) (i + 1)
  else soFar
termination_by arr.size - i
```

类似的终止性证明可用于编写 {anchorName ArrayFind}`Array.find`——该函数在数组中查找第一个满足布尔函数的元素，并返回该元素及其索引：

```anchor ArrayFind
def Array.find (arr : Array α) (p : α → Bool) :
    Option (Nat × α) :=
  findHelper arr p 0
```
辅助函数再次因为 {lit}`arr.size - i` 随 {lit}`i` 递增而递减而终止：

```anchor ArrayFindHelper
def findHelper (arr : Array α) (p : α → Bool)
    (i : Nat) : Option (Nat × α) :=
  if h : i < arr.size then
    let x := arr[i]
    if p x then
      some (i, x)
    else findHelper arr p (i + 1)
  else none
```

在 {kw}`termination_by` 后添加问号（即使用 {kw}`termination_by?`）会使 Lean 显式建议它选择的度量。
点击 {lit}`[apply]` 会将 {kw}`termination_by?` 替换为建议的度量：
```anchor ArrayFindHelperSugg
def findHelper (arr : Array α) (p : α → Bool)
    (i : Nat) : Option (Nat × α) :=
  if h : i < arr.size then
    let x := arr[i]
    if p x then
      some (i, x)
    else findHelper arr p (i + 1)
  else none
termination_by?
```
```anchorInfo ArrayFindHelperSugg
Try this:
  [apply] termination_by arr.size - i
```

并非所有终止性论证都像这个一样简单。
不过，识别基于函数参数、在每次调用中递减的某个表达式，这一基本结构出现在所有终止性证明中。
有时需要创造性才能弄清函数为何终止，有时 Lean 需要额外证明才能接受度量确实在递减。



# 练习
%%%
tag := "array-termination-exercises"
%%%

 * 使用尾递归的传递累加器函数和 {kw}`termination_by` 子句，为数组实现 {anchorTerm ForMArr}`ForM m (Array α)` 实例。
 * 在恒等单子中使用 {kw}`for`{lit}` ... `{kw}`in`{lit}` ...` 循环重新实现 {anchorName ArrayMap}`Array.map`、{anchorName ArrayFind}`Array.find` 和 {anchorName ForMArr}`ForM` 实例，并比较得到的代码。
 * 在恒等单子中使用 {kw}`for`{lit}` ... `{kw}`in`{lit}` ...` 循环重新实现数组反转。将其与尾递归函数进行比较。