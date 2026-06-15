# 输出参数

{moduleName}`Add` 类的一个实例足以让两个类型为 {moduleName}`Pos` 的表达式方便地相加，产生另一个 {moduleName}`Pos`。
然而，在许多情况下，更灵活地允许*异构*运算符重载会很有用，即参数可以具有不同的类型。
例如，将 {moduleName}`Nat` 加到 {moduleName}`Pos` 上，或将 {moduleName}`Pos` 加到 {moduleName}`Nat` 上，总会产生一个 {moduleName}`Pos`：

```anchor addNatPos
def addNatPos : Nat → Pos → Pos
  | 0, p => p
  | n + 1, p => Pos.succ (addNatPos n p)

def addPosNat : Pos → Nat → Pos
  | p, 0 => p
  | p, n + 1 => Pos.succ (addPosNat p n)
```
这些函数允许将自然数加到正数上，但它们不能与 {moduleName}`Add` 类型类一起使用，因为 {moduleName}`Add` 期望 {moduleName}`add` 的两个参数具有相同的类型。

# 异构重载
%%%
tag := "heterogeneous-operators"
%%%

正如 {ref "overloaded-addition"}[重载加法] 一节所述，Lean 提供了一个名为 {anchorName chapterIntro}`HAdd` 的类型类，用于异构地重载加法。
{anchorName chapterIntro}`HAdd` 类接受三个类型参数：两个参数类型和返回类型。
{anchorTerm haddInsts}`HAdd Nat Pos Pos` 和 {anchorTerm haddInsts}`HAdd Pos Nat Pos` 的实例允许使用普通的加法记号来混合这些类型：

```anchor haddInsts
instance : HAdd Nat Pos Pos where
  hAdd := addNatPos

instance : HAdd Pos Nat Pos where
  hAdd := addPosNat
```
给定上述两个实例，以下示例可以工作：
```anchor posNatEx
#eval (3 : Pos) + (5 : Nat)
```
```anchorInfo posNatEx
8
```
```anchor natPosEx
#eval (3 : Nat) + (5 : Pos)
```
```anchorInfo natPosEx
8
```

:::paragraph
{anchorName chapterIntro}`HAdd` 类型类的定义与以下 {moduleName}`HPlus` 的定义及其对应实例非常相似：

```anchor HPlus
class HPlus (α : Type) (β : Type) (γ : Type) where
  hPlus : α → β → γ
```

```anchor HPlusInstances
instance : HPlus Nat Pos Pos where
  hPlus := addNatPos

instance : HPlus Pos Nat Pos where
  hPlus := addPosNat
```
然而，{moduleName}`HPlus` 的实例比 {anchorName chapterIntro}`HAdd` 的实例用处小得多。
当尝试将这些实例与 {kw}`#eval` 一起使用时，会出现错误：
```anchor hPlusOops
#eval toString (HPlus.hPlus (3 : Pos) (5 : Nat))
```
```anchorError hPlusOops
typeclass instance problem is stuck
  HPlus Pos Nat ?m.6

Note: Lean will not try to resolve this typeclass instance problem because the third type argument to `HPlus` is a metavariable. This argument must be fully determined before Lean will try to resolve the typeclass.

Hint: Adding type annotations and supplying implicit arguments to functions can give Lean more information for typeclass resolution. For example, if you have a variable `x` that you intend to be a `Nat`, but Lean reports it as having an unresolved type like `?m`, replacing `x` with `(x : Nat)` can get typeclass resolution un-stuck.
```
该消息表明，这是因为类型中存在元变量，而 Lean 无法求解它。
:::

正如 {ref "polymorphism"}[多态性的初始描述] 中所讨论的，元变量表示程序中无法推断的未知部分。
当按照 {kw}`#eval` 书写表达式时，Lean 会尝试自动确定其类型。
在这种情况下，它无法做到。
因为 {anchorName HPlusInstances}`HPlus` 的第三个类型参数未知，Lean 无法执行类型类实例搜索，而实例搜索是 Lean 确定表达式类型的唯一方式。
也就是说，{anchorTerm HPlusInstances}`HPlus Pos Nat Pos` 实例只有在表达式应具有类型 {moduleName}`Pos` 时才能适用，但程序中除了实例本身之外，没有任何东西表明它应该具有这个类型。

解决这个问题的一种方法是，通过为整个表达式添加类型标注来确保所有三个类型都可用：
```anchor hPlusLotsaTypes
#eval (HPlus.hPlus (3 : Pos) (5 : Nat) : Pos)
```
```anchorInfo hPlusLotsaTypes
8
```
然而，这个解决方案对正数库的用户来说并不十分方便。

# 输出参数
%%%
tag := "output-parameters"
%%%

这个问题也可以通过将 {anchorName HPlus}`γ` 声明为**输出参数**（output parameter）来解决。
大多数类型类参数是搜索算法的输入：它们用于选择实例。
例如，在 {moduleName}`OfNat` 实例中，类型和自然数都用于选择自然数字面量的特定解释。
然而，在某些情况下，即使某些类型参数尚不清楚，启动搜索过程也会很方便，并利用搜索中发现的实例来确定元变量的值。
启动实例搜索不需要的那些参数是过程的输出，这通过 {moduleName}`outParam` 修饰符来声明：

```anchor HPlusOut
class HPlus (α : Type) (β : Type) (γ : outParam Type) where
  hPlus : α → β → γ
```

有了这个输出参数，类型类实例搜索能够在事先不知道 {anchorName HPlusOut}`γ` 的情况下选择实例。
例如：
```anchor hPlusWorks
#eval HPlus.hPlus (3 : Pos) (5 : Nat)
```
```anchorInfo hPlusWorks
8
```

将输出参数视为定义一种函数可能会有所帮助。
任何具有一个或多个输出参数的类型类的给定实例，都为 Lean 提供了根据输入确定输出的指令。
搜索实例的过程（可能递归地）最终比单纯的运算符重载更强大。
输出参数可以确定程序中的其他类型，而实例搜索可以将一组底层实例组装成具有该类型的程序。

# 默认实例
%%%
tag := "default-instances"
%%%

决定一个参数是输入还是输出，控制着 Lean 在何种情况下会启动类型类搜索。
特别是，在所有输入都已知之前，类型类搜索不会发生。
然而，在某些情况下，仅有输出参数还不够，即使某些输入未知时也应进行实例搜索。
这有点像 Python 或 Kotlin 中可选函数参数的默认值，只不过这里选择的是默认*类型*。

**默认实例**（default instances）是即使并非所有输入都已知，也可用于实例搜索的实例。
当可以使用这些实例之一时，它就会被使用。
这可以使程序成功通过类型检查，而不是因未知类型和元变量相关的错误而失败。
另一方面，默认实例可能使实例选择变得不那么可预测。
特别是，如果选择了不期望的默认实例，那么表达式可能具有与预期不同的类型，这可能导致程序其他部分出现令人困惑的类型错误。
请谨慎选择使用默认实例的位置！

默认实例可能有用的一处例子是，可以从 {moduleName}`Add` 实例推导出 {anchorName HPlusOut}`HPlus` 实例。
换句话说，普通加法是异构加法的一个特例，其中所有三个类型恰好相同。
这可以用以下实例来实现：

```anchor notDefaultAdd
instance [Add α] : HPlus α α α where
  hPlus := Add.add
```
有了这个实例，{anchorName notDefaultAdd}`hPlus` 可以用于任何可相加的类型，比如 {moduleName}`Nat`：
```anchor hPlusNatNat
#eval HPlus.hPlus (3 : Nat) (5 : Nat)
```
```anchorInfo hPlusNatNat
8
```

然而，这个实例只会在两个参数的类型都已知的情况下被使用。
例如，
```anchor plusFiveThree
#check HPlus.hPlus (5 : Nat) (3 : Nat)
```
产生类型
```anchorInfo plusFiveThree
HPlus.hPlus 5 3 : Nat
```
符合预期，但
```anchor plusFiveMeta
#check HPlus.hPlus (5 : Nat)
```
产生一个包含两个元变量的类型，一个对应剩余参数，一个对应返回类型：
```anchorInfo plusFiveMeta
HPlus.hPlus 5 : ?m.15752 → ?m.15754
```

在绝大多数情况下，当有人为加法提供一个参数时，另一个参数将具有相同的类型。
要将这个实例变成默认实例，请应用 {anchorTerm defaultAdd}`default_instance` 属性：

```anchor defaultAdd
@[default_instance]
instance [Add α] : HPlus α α α where
  hPlus := Add.add
```
有了这个默认实例，该示例具有更有用的类型：
```anchor plusFive
#check HPlus.hPlus (5 : Nat)
```
产生
```anchorInfo plusFive
HPlus.hPlus 5 : Nat → Nat
```

每个同时存在可重载的异构版本和同构版本的运算符，都遵循一种模式：通过默认实例，在期望异构版本的上下文中可以使用同构版本。
中缀运算符被替换为对异构版本的调用，并在可能时选择同构默认实例。

类似地，仅写 {anchorTerm fiveType}`5` 会得到 {anchorTerm fiveType}`Nat`，而不是一个带有元变量、等待更多信息以选择 {moduleName}`OfNat` 实例的类型。
这是因为 {moduleName}`Nat` 的 {moduleName}`OfNat` 实例是一个默认实例。

默认实例也可以分配**优先级**（priorities），这会影响在多种实例都可能适用时选择哪一个。
有关默认实例优先级的更多信息，请参阅 Lean 手册。

# 练习
%%%
tag := "out-params-exercises"
%%%

定义一个 {anchorTerm MulPPoint}`HMul (PPoint α) α (PPoint α)` 实例，将两个投影都乘以标量。
它应对任何存在 {anchorTerm MulPPoint}`Mul α` 实例的类型 {anchorName MulPPoint}`α` 都有效。
例如，
```anchor HMulPPoint
#eval {x := 2.5, y := 3.7 : PPoint Float} * 2.0
```
应产生
```anchorInfo HMulPPoint
{ x := 5.000000, y := 7.400000 }
```