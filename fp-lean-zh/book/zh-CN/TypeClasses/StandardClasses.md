# 标准类型类

%%%
tag := "standard-classes"
%%%

本节介绍一系列可在 Lean 中通过类型类重载的运算符和函数。
每个运算符或函数都对应某个类型类的一个方法。
与 C++ 不同，Lean 中的中缀运算符被定义为具名函数的缩写；这意味着为新型重载运算符时，不是直接使用运算符本身，而是使用其底层名称（例如 {moduleName}`HAdd.hAdd`）。

# 算术

%%%
tag := "arithmetic-classes"
%%%

大多数算术运算符都有异构形式，其中参数可以具有不同类型，并由输出参数决定结果表达式的类型。
对于每个异构运算符，都有对应的同构版本，只需去掉字母 {lit}`h` 即可找到，例如 {moduleName}`HAdd.hAdd` 变为 {moduleName}`Add.add`。
以下算术运算符可被重载：

:::table +header

*
 -  表达式
 -  脱糖形式
 -  类型类名称
*
 -  {anchorTerm plusDesugar}`x + y`
 -  {anchorTerm plusDesugar}`HAdd.hAdd x y`
 -  {moduleName}`HAdd`
*
 -  {anchorTerm minusDesugar}`x - y`
 -  {anchorTerm minusDesugar}`HSub.hSub x y`
 -  {moduleName}`HSub`
*
 -  {anchorTerm timesDesugar}`x * y`
 -  {anchorTerm timesDesugar}`HMul.hMul x y`
 -  {moduleName}`HMul`
*
 -  {anchorTerm divDesugar}`x / y`
 -  {anchorTerm divDesugar}`HDiv.hDiv x y`
 -  {moduleName}`HDiv`
*
 -  {anchorTerm modDesugar}`x % y`
 -  {anchorTerm modDesugar}`HMod.hMod x y`
 -  {moduleName}`HMod`
*
 -  {anchorTerm powDesugar}`x ^ y`
 -  {anchorTerm powDesugar}`HPow.hPow x y`
 -  {moduleName}`HPow`
*
 -  {anchorTerm negDesugar}`- x`
 -  {anchorTerm negDesugar}`Neg.neg x`
 -  {moduleName}`Neg`


:::

# 按位运算符

%%%
tag := "bitwise-classes"
%%%

Lean 包含若干可通过类型类重载的标准按位运算符。
对于 {anchorTerm UInt8}`UInt8`、{anchorTerm UInt16}`UInt16`、{anchorTerm UInt32}`UInt32`、{anchorTerm UInt64}`UInt64` 和 {anchorTerm USize}`USize` 等定宽类型，已有相应实例。
其中 {anchorTerm USize}`USize` 表示当前平台上字的大小，通常为 32 位或 64 位。
以下按位运算符可被重载：

:::table +header
*
 -  表达式
 -  脱糖形式
 -  类型类名称

*
 -  {anchorTerm bAndDesugar}`x &&& y`
 -  {anchorTerm bAndDesugar}`HAnd.hAnd x y`
 -  {moduleName}`HAnd`
*
 -  {anchorTerm bOrDesugar}`x ||| y`
 -  {anchorTerm bOrDesugar}`HOr.hOr x y`
 -  {moduleName}`HOr`
*
 -  {anchorTerm bXorDesugar}`x ^^^ y`
 -  {anchorTerm bXorDesugar}`HXor.hXor x y`
 -  {moduleName}`HXor`
*
 -  {anchorTerm complementDesugar}`~~~x`
 -  {anchorTerm complementDesugar}`Complement.complement x`
 -  {moduleName}`Complement`
*
 -  {anchorTerm shrDesugar}`x >>> y`
 -  {anchorTerm shrDesugar}`HShiftRight.hShiftRight x y`
 -  {moduleName}`HShiftRight`
*
 -  {anchorTerm shlDesugar}`x <<< y`
 -  {anchorTerm shlDesugar}`HShiftLeft.hShiftLeft x y`
 -  {moduleName}`HShiftLeft`

:::

由于名称 {anchorName chapterIntro}`And` 和 {anchorName chapterIntro}`Or` 已被用作逻辑联结词的名称，{anchorName chapterIntro}`HAnd` 和 {anchorName chapterIntro}`HOr` 的同构版本分别称为 {anchorName moreOps}`AndOp` 和 {anchorName moreOps}`OrOp`，而不是 {anchorName chapterIntro}`And` 和 {anchorName chapterIntro}`Or`。

# 相等性与排序

%%%
tag := "equality-and-ordering"
%%%

测试两个值是否相等通常使用 {moduleName}`BEq` 类型类，它是“布尔相等性（Boolean equality）”的缩写。
由于 Lean 也用作定理证明器，Lean 中实际上有两种相等性运算符：
 * {deftech}_布尔相等性（Boolean equality）_ 与其他编程语言中的相等性相同。它是一个接受两个值并返回 {anchorName CoeBoolProp}`Bool` 的函数。布尔相等性用两个等号书写，与 Python 和 C# 一样。由于 Lean 是纯函数式语言，没有引用相等性与值相等性的区分——指针无法被直接观察。
 * {deftech}_命题相等性（propositional equality）_ 是表示两个事物相等的数学陈述。命题相等性不是函数；而是一种允许证明的数学陈述。它用单个等号书写。命题相等性的陈述就像一种分类该相等性证据的类型。

这两种相等性概念都很重要，用途各不相同。
布尔相等性在程序中很有用，当需要判断两个值是否相等以做出决策时。
例如，{anchorTerm boolEqTrue}`"Octopus" ==  "Cuttlefish"` 求值为 {anchorTerm boolEqTrue}`false`，而 {anchorTerm boolEqFalse}`"Octopodes" ==  "Octo".append "podes"` 求值为 {anchorTerm boolEqFalse}`true`。
某些值（例如函数）无法检查相等性。
例如，{anchorTerm functionEq}`(fun (x : Nat) => 1 + x) == (Nat.succ ·)` 会产生以下错误：
```anchorError functionEq
failed to synthesize
  BEq (Nat → Nat)

Hint: Additional diagnostic information may be available using the `set_option diagnostics true` command.
```
正如这条信息所示，{lit}`==` 通过类型类重载。
表达式 {anchorTerm beqDesugar}`x == y` 实际上是 {anchorTerm beqDesugar}`BEq.beq x y` 的简写。

命题相等性是数学陈述，而不是程序的调用。
由于命题就像描述某陈述证据的类型，命题相等性与 {anchorName readFile}`String` 和 {anchorTerm moreOps}`Nat → List Int` 等类型有更多共同之处，而与布尔相等性则不同。
这意味着它无法被自动检查。
然而，只要两个表达式具有相同类型，就可以在 Lean 中陈述任意两个表达式的相等性。
陈述 {anchorTerm functionEqProp}`(fun (x : Nat) => 1 + x) = (Nat.succ ·)` 是完全合理的。
从数学角度看，两个函数相等当且仅当它们将相等的输入映射到相等的输出，因此这个陈述甚至为真，尽管需要一行证明才能让 Lean 信服这一事实。

一般而言，将 Lean 用作编程语言时，坚持使用布尔函数而非命题最为简便。
然而，正如 {moduleName}`Bool` 的构造子 {moduleName}`true` 和 {moduleName}`false` 的名称所暗示的那样，这种区别有时会变得模糊。
某些命题是 _可判定（decidable）_ 的，这意味着它们可以像布尔函数一样被检查。
检查命题为真或为假的函数称为 _判定过程（decision procedure）_，它返回命题为真或为假的 _证据（evidence）_。
一些可判定命题的例子包括自然数的相等性与不等性、字符串的相等性，以及本身可判定的命题的“与”和“或”。

:::paragraph
在 Lean 中，{kw}`if` 可与可判定命题一起使用。
例如，{anchorTerm twoLessFour}`2 < 4` 是一个命题：
```anchor twoLessFour
#check 2 < 4
```
```anchorInfo twoLessFour
2 < 4 : Prop
```
尽管如此，将它作为 {kw}`if` 的条件完全是可以接受的。
例如，{anchorTerm ifProp}`if 2 < 4 then 1 else 2` 的类型为 {moduleName}`Nat`，求值为 {anchorTerm ifProp}`1`。
:::

并非所有命题都可判定。
如果它们都可判定，那么计算机只需运行判定过程就能证明任何真命题，数学家也就失业了。
更具体地说，可判定命题具有 {anchorName DecLTLEPos}`Decidable` 类型类的实例，其中包含判定过程。
试图将不可判定的命题当作 {anchorName CoeBoolProp}`Bool` 使用，会导致找不到 {anchorName DecLTLEPos}`Decidable` 实例。
例如，{anchorTerm funEqDec}`if (fun (x : Nat) => 1 + x) = (Nat.succ ·) then "yes" else "no"` 会产生：
```anchorError funEqDec
failed to synthesize
  Decidable ((fun x => 1 + x) = fun x => x.succ)

Hint: Additional diagnostic information may be available using the `set_option diagnostics true` command.
```

以下通常可判定的命题通过类型类重载：

:::table +header
*
 -  表达式
 -  脱糖形式
 -  类型类名称
*
 -  {anchorTerm ltDesugar}`x < y`
 -  {anchorTerm ltDesugar}`LT.lt x y`
 -  {moduleName}`LT`
*
 -  {anchorTerm leDesugar}`x ≤ y`
 -  {anchorTerm leDesugar}`LE.le x y`
 -  {moduleName}`LE`
*
 -  {anchorTerm gtDesugar}`x > y`
 -  {anchorTerm gtDesugar}`LT.lt y x`
 -  {moduleName}`LT`
*
 -  {anchorTerm geDesugar}`x ≥ y`
 -  {anchorTerm geDesugar}`LE.le y x`
 -  {moduleName}`LE`
:::

由于尚未演示如何定义新命题，为 {moduleName}`LT` 和 {moduleName}`LE` 定义全新的实例可能比较困难。
不过，它们可以根据已有实例来定义。
{anchorName LTPos}`Pos` 的 {moduleName}`LT` 和 {moduleName}`LE` 实例可以利用 {moduleName}`Nat` 的已有实例：

```anchor LTPos
instance : LT Pos where
  lt x y := LT.lt x.toNat y.toNat
```

```anchor LEPos
instance : LE Pos where
  le x y := LE.le x.toNat y.toNat
```
这些命题默认不可判定，因为 Lean 在合成实例时不会展开命题的定义。
可以使用 {anchorName DecLTLEPos}`inferInstanceAs` 运算符来弥补这一点，如果给定类型类存在实例，它会找到该实例：

```anchor DecLTLEPos
instance {x : Pos} {y : Pos} : Decidable (x < y) :=
  inferInstanceAs (Decidable (x.toNat < y.toNat))

instance {x : Pos} {y : Pos} : Decidable (x ≤ y) :=
  inferInstanceAs (Decidable (x.toNat ≤ y.toNat))
```
类型检查器会确认命题的定义是否匹配。
混淆它们会产生错误：
```anchor LTLEMismatch
instance {x : Pos} {y : Pos} : Decidable (x ≤ y) :=
  inferInstanceAs (Decidable (x.toNat < y.toNat))
```
```anchorError LTLEMismatch
Type mismatch
  inferInstanceAs (Decidable (x.toNat < y.toNat))
has type
  Decidable (x.toNat < y.toNat)
but is expected to have type
  Decidable (x ≤ y)
```

:::paragraph
使用 {lit}`<`、{lit}`==` 和 {lit}`>` 比较值可能效率不高。
先检查一个值是否小于另一个值，再检查它们是否相等，可能需要对大型数据结构遍历两次。
为解决这一问题，Java 和 C# 分别有标准的 {java}`compareTo` 和 {CSharp}`CompareTo` 方法，类可以重写这些方法以同时实现全部三种运算。
这些方法在接收者小于参数时返回负整数，相等时返回零，大于参数时返回正整数。
Lean 没有重载整数的含义，而是有一个描述这三种可能性的内建归纳类型：
```anchor Ordering
inductive Ordering where
  | lt
  | eq
  | gt
```
{anchorName OrdPos}`Ord` 类型类可以重载以产生这些比较结果。
对于 {anchorName OrdPos}`Pos`，一种实现可以是：
```anchor OrdPos
def Pos.comp : Pos → Pos → Ordering
  | Pos.one, Pos.one => Ordering.eq
  | Pos.one, Pos.succ _ => Ordering.lt
  | Pos.succ _, Pos.one => Ordering.gt
  | Pos.succ n, Pos.succ k => comp n k

instance : Ord Pos where
  compare := Pos.comp
```
在 Java 中 {java}`compareTo` 是合适做法的情形，在 Lean 中应使用 {moduleName}`Ord.compare`。
:::

# 哈希

%%%
tag := "hashing"
%%%

Java 和 C# 分别有 {java}`hashCode` 和 {CSharp}`GetHashCode` 方法，用于计算值的哈希以供哈希表等数据结构使用。
Lean 中的等价物是名为 {anchorName Hashable}`Hashable` 的类型类：

```anchor Hashable
class Hashable (α : Type) where
  hash : α → UInt64
```
如果根据某类型的 {moduleName}`BEq` 实例，两个值被视为相等，那么它们应具有相同的哈希值。
换句话说，如果 {anchorTerm HashableSpec}`x == y`，则 {anchorTerm HashableSpec}`hash x == hash y`。
如果 {anchorTerm HashableSpec}`x ≠ y`，则 {anchorTerm HashableSpec}`hash x` 不一定与 {anchorTerm HashableSpec}`hash y` 不同（毕竟 {moduleName}`Nat` 值有无穷多个，而 {moduleName}`UInt64` 值只有有限个），但基于哈希构建的数据结构在不等值很可能具有不等哈希时性能更好。
这与 Java 和 C# 中的期望相同。

标准库包含函数 {anchorTerm mixHash}`mixHash`，其类型为 {anchorTerm mixHash}`UInt64 → UInt64 → UInt64`，可用于合并某个构造子不同字段的哈希值。
为归纳数据类型编写合理的哈希函数，可以为每个构造子分配唯一编号，再将该编号与各字段的哈希值混合。
例如，可以为 {anchorName HashablePos}`Pos` 编写 {anchorName HashablePos}`Hashable` 实例：

```anchor HashablePos
def hashPos : Pos → UInt64
  | Pos.one => 0
  | Pos.succ n => mixHash 1 (hashPos n)

instance : Hashable Pos where
  hash := hashPos
```

:::paragraph
多态类型的 {anchorTerm HashableNonEmptyList}`Hashable` 实例可以使用递归实例搜索。
只有当 {anchorName HashableNonEmptyList}`α` 可以被哈希时，才能对 {anchorTerm HashableNonEmptyList}`NonEmptyList α` 进行哈希：
```anchor HashableNonEmptyList
instance [Hashable α] : Hashable (NonEmptyList α) where
  hash xs := mixHash (hash xs.head) (hash xs.tail)
```
:::
:::paragraph
二叉树在 {anchorName TreeHash}`BEq` 和 {anchorName TreeHash}`Hashable` 的实现中同时使用递归和递归实例搜索：

```anchor TreeHash
inductive BinTree (α : Type) where
  | leaf : BinTree α
  | branch : BinTree α → α → BinTree α → BinTree α

def eqBinTree [BEq α] : BinTree α → BinTree α → Bool
  | BinTree.leaf, BinTree.leaf =>
    true
  | BinTree.branch l x r, BinTree.branch l2 x2 r2 =>
    x == x2 && eqBinTree l l2 && eqBinTree r r2
  | _, _ =>
    false

instance [BEq α] : BEq (BinTree α) where
  beq := eqBinTree

def hashBinTree [Hashable α] : BinTree α → UInt64
  | BinTree.leaf =>
    0
  | BinTree.branch left x right =>
    mixHash 1
      (mixHash (hashBinTree left)
        (mixHash (hash x)
          (hashBinTree right)))

instance [Hashable α] : Hashable (BinTree α) where
  hash := hashBinTree
```
:::

# 派生标准类型类

%%%
tag := "deriving-standard-classes"
%%%

像 {moduleName}`BEq` 和 {moduleName}`Hashable` 这样的类型类实例，手工实现往往相当繁琐。
Lean 包含称为 _实例派生（instance deriving）_ 的特性，允许编译器自动构造许多类型类的良好实例。
事实上，在 {ref "polymorphism"}[关于多态性的第一节] 中定义 {anchorName Firewood (module:=Examples.Intro)}`Firewood` 时使用的 {anchorTerm Firewood (module := Examples.Intro)}`deriving Repr` 短语就是实例派生的一个例子。

实例可以通过两种方式派生。
第一种方式在定义结构体或归纳类型时使用。
此时，在类型声明末尾添加 {kw}`deriving`，后跟应派生实例的类型类名称。
对于已经定义的类型，可以使用独立的 {kw}`deriving` 命令。
事后写入 {kw}`deriving instance`{lit}` C1, C2, ... `{kw}`for`{lit}` T`，即可为类型 {lit}`T` 派生 {lit}`C1, C2, ...` 的实例。

可以用很少的代码为 {anchorName BEqHashableDerive}`Pos` 和 {anchorName BEqHashableDerive}`NonEmptyList` 派生 {moduleName}`BEq` 和 {moduleName}`Hashable` 实例：

```anchor BEqHashableDerive
deriving instance BEq, Hashable for Pos
deriving instance BEq, Hashable for NonEmptyList
```

至少可以为以下类型类派生实例：

 * {moduleName}`Inhabited`
 * {moduleName}`BEq`
 * {moduleName}`Repr`
 * {moduleName}`Hashable`
 * {moduleName}`Ord`

不过，在某些情况下，派生的 {moduleName}`Ord` 实例可能无法产生应用程序所期望的精确排序。
遇到这种情况时，手工编写 {moduleName}`Ord` 实例完全可以。
Lean 的高级用户可以扩展可派生实例的类型类集合。

除了提高程序员生产力和代码可读性的明显优势外，派生实例还使代码更易于维护，因为随着类型定义的演变，实例也会相应更新。
在审查代码变更时，涉及数据类型更新的修改会更容易阅读，而不必面对一行接一行的公式化相等性测试和哈希计算修改。

# 拼接

%%%
tag := "append-class"
%%%

许多数据类型都有某种拼接运算符。
在 Lean 中，拼接两个值通过类型类 {anchorName HAppend}`HAppend` 重载，这是一种与算术运算类似的异构运算：

```anchor HAppend
class HAppend (α : Type) (β : Type) (γ : outParam Type) where
  hAppend : α → β → γ
```
语法 {anchorTerm desugarHAppend}`xs ++ ys` 脱糖为 {anchorTerm desugarHAppend}`HAppend.hAppend xs ys`。
对于同构情形，实现 {moduleName}`Append` 的实例就足够了，它遵循通常的模式：

```anchor AppendNEList
instance : Append (NonEmptyList α) where
  append xs ys :=
    { head := xs.head, tail := xs.tail ++ ys.head :: ys.tail }
```

定义上述实例后，
```anchor appendSpiders
#eval idahoSpiders ++ idahoSpiders
```
有以下输出：
```anchorInfo appendSpiders
{ head := "Banded Garden Spider",
  tail := ["Long-legged Sac Spider",
           "Wolf Spider",
           "Hobo Spider",
           "Cat-faced Spider",
           "Banded Garden Spider",
           "Long-legged Sac Spider",
           "Wolf Spider",
           "Hobo Spider",
           "Cat-faced Spider"] }
```

类似地，{moduleName}`HAppend` 的定义允许将非空列表拼接到普通列表上：

```anchor AppendNEListList
instance : HAppend (NonEmptyList α) (List α) (NonEmptyList α) where
  hAppend xs ys :=
    { head := xs.head, tail := xs.tail ++ ys }
```
有了这个实例后，
```anchor appendSpidersList
#eval idahoSpiders ++ ["Trapdoor Spider"]
```
结果为
```anchorInfo appendSpidersList
{ head := "Banded Garden Spider",
  tail := ["Long-legged Sac Spider", "Wolf Spider", "Hobo Spider", "Cat-faced Spider", "Trapdoor Spider"] }
```

# 函子

%%%
tag := "Functor"
%%%

如果多态类型重载了名为 {anchorName FunctorDef}`map` 的函数，该函数用某个函数变换其中包含的每个元素，那么这个多态类型就是一个 {deftech}_函子（functor）_。
虽然大多数语言都使用这一术语，但 C# 中与 {anchorName FunctorDef}`map` 等价的运算称为 {CSharp}`System.Linq.Enumerable.Select`。
例如，对列表映射一个函数会构造一个新列表，其中起始列表的每个条目都被该函数在该条目上的结果替换。
对 {anchorName optionFMeta}`Option` 映射函数 {anchorName optionFMeta}`f` 时，{anchorName optionFMeta}`none` 保持不变，而将 {anchorTerm optionFMeta}`some x` 替换为 {anchorTerm optionFMeta}`some (f x)`。

以下是一些函子示例，以及它们的 {anchorName FunctorDef}`Functor` 实例如何重载 {anchorName FunctorDef}`map`：
 * {anchorTerm mapList}`Functor.map (· + 5) [1, 2, 3]` 求值为 {anchorTerm mapList}`[6, 7, 8]`
 * {anchorTerm mapOption}`Functor.map toString (some (List.cons 5 List.nil))` 求值为 {anchorTerm mapOption}`some "[5]"`
 * {anchorTerm mapListList}`Functor.map List.reverse [[1, 2, 3], [4, 5, 6]]` 求值为 {anchorTerm mapListList}`[[3, 2, 1], [6, 5, 4]]`

由于 {anchorName mapList}`Functor.map` 对于这个常见运算来说名字略长，Lean 还提供了用于映射函数的中缀运算符，即 {lit}`<$>`。
前面的示例可以改写如下：
 * {anchorTerm mapInfixList}`(· + 5) <$> [1, 2, 3]` 求值为 {anchorTerm mapInfixList}`[6, 7, 8]`
 * {anchorTerm mapInfixOption}`toString <$> (some (List.cons 5 List.nil))` 求值为 {anchorTerm mapInfixOption}`some "[5]"`
 * {anchorTerm mapInfixListList}`List.reverse <$> [[1, 2, 3], [4, 5, 6]]` 求值为 {anchorTerm mapInfixListList}`[[3, 2, 1], [6, 5, 4]]`

{anchorTerm FunctorNonEmptyList}`NonEmptyList` 的 {anchorTerm FunctorNonEmptyList}`Functor` 实例需要指定 {anchorName FunctorNonEmptyList}`map` 函数。

```anchor FunctorNonEmptyList
instance : Functor NonEmptyList where
  map f xs := { head := f xs.head, tail := f <$> xs.tail }
```
这里，{anchorTerm FunctorNonEmptyList}`map` 使用 {moduleName}`List` 的 {anchorTerm FunctorNonEmptyList}`Functor` 实例将函数映射到尾部上。
该实例为 {anchorTerm FunctorNonEmptyList}`NonEmptyList` 定义，而不是为 {anchorTerm FunctorNonEmptyListA}`NonEmptyList α` 定义，因为参数类型 {anchorTerm FunctorNonEmptyListA}`α` 在解析类型类时不起作用。
无论条目的类型是什么，都可以对 {anchorTerm FunctorNonEmptyList}`NonEmptyList` 映射函数。
如果 {anchorTerm FunctorNonEmptyListA}`α` 是类型类的参数，那么就可以构造只对 {anchorTerm FunctorNonEmptyListA}`NonEmptyList Nat` 有效的 {anchorTerm FunctorNonEmptyList}`Functor` 版本，但作为函子的一部分，{anchorName FunctorNonEmptyList}`map` 应对任意条目类型都有效。

:::paragraph
以下是 {anchorTerm FunctorPPoint}`PPoint` 的 {anchorTerm FunctorPPoint}`Functor` 实例：

```anchor FunctorPPoint
instance : Functor PPoint where
  map f p := { x := f p.x, y := f p.y }
```
在这种情况下，{anchorName FunctorPPoint}`f` 已同时应用于 {anchorName FunctorPPoint}`x` 和 {anchorName FunctorPPoint}`y`。
:::

即使函子中包含的类型本身也是函子，映射函数也只会深入一层。
也就是说，对 {anchorTerm NEPP}`NonEmptyList (PPoint Nat)` 使用 {anchorName FunctorPPoint}`map` 时，被映射的函数应以 {anchorTerm NEPP}`PPoint Nat` 为参数，而不是 {moduleName}`Nat`。

{anchorName FunctorLaws}`Functor` 类型类的定义使用了尚未讨论过的另一个语言特性：默认方法定义。
通常，类型类会指定一组有意义的最小可重载运算集合，然后使用带实例隐式参数的多态函数，在可重载运算之上构建更大的特性库。
例如，函数 {anchorName concat}`concat` 可以拼接任意条目可拼接的非空列表：

```anchor concat
def concat [Append α] (xs : NonEmptyList α) : α :=
  let rec catList (start : α) : List α → α
    | [] => start
    | (z :: zs) => catList (start ++ z) zs
  catList xs.head xs.tail
```
不过，对于某些类型类，如果了解数据类型的内部结构，有些运算可以更高效地实现。

在这些情况下，可以提供默认方法定义。
默认方法定义根据其他方法提供某个方法的默认实现。
不过，实例实现者可以选择用更高效的方式覆盖该默认值。
默认方法定义在 {kw}`class` 定义中包含 {lit}`:=`。

对于 {anchorName FunctorDef}`Functor`，某些类型在映射的函数忽略其参数时有更高效的 {anchorName FunctorDef}`map` 实现方式。
忽略参数的函数称为 _常量函数（constant function）_，因为它们总是返回相同的值。
以下是 {anchorName FunctorDef}`Functor` 的定义，其中 {anchorName FunctorDef}`mapConst` 具有默认实现：

```anchor FunctorDef
class Functor (f : Type → Type) where
  map : {α β : Type} → (α → β) → f α → f β

  mapConst {α β : Type} (x : α) (coll : f β) : f α :=
    map (fun _ => x) coll
```

正如不尊重 {moduleName}`BEq` 的 {anchorName HashableSpec}`Hashable` 实例是有缺陷的一样，在映射函数时移动数据的 {moduleName}`Functor` 实例也是有缺陷的。
例如，{moduleName}`List` 的有缺陷 {moduleName}`Functor` 实例可能丢弃其参数并总是返回空列表，或者可能反转列表。
{moduleName}`PPoint` 的不良 {moduleName}`Functor` 实例可能将 {anchorTerm FunctorPPointBad}`f x` 同时放入 {anchorName FunctorPPointBad}`x` 和 {anchorName FunctorPPointBad}`y` 字段，或者交换它们。
具体而言，{anchorName FunctorDef}`Functor` 实例应遵循两条规则：
 1. 映射恒等函数应得到原始参数。
 2. 映射两个复合函数的效果应与复合它们的映射相同。

更形式地说，第一条规则说 {anchorTerm FunctorLaws}`id <$> x` 等于 {anchorTerm FunctorLaws}`x`。
第二条规则说 {anchorTerm FunctorLaws}`map (fun y => f (g y)) x` 等于 {anchorTerm FunctorLaws}`map f (map g x)`。
复合 {anchorTerm compDef}`f ∘ g` 也可以写作 {anchorTerm compDef}`fun y => f (g y)`。
这些规则防止 {anchorName FunctorDef}`map` 的实现移动或删除数据。

# 你可能会遇到的信息

%%%
tag := "standard-classes-messages"
%%%

Lean 无法为所有类型类派生实例。
例如，以下代码
```anchor derivingNotFound
deriving instance ToString for NonEmptyList
```
会产生以下错误：
```anchorError derivingNotFound
No deriving handlers have been implemented for class `ToString`
```
调用 {anchorTerm derivingNotFound}`deriving instance` 会使 Lean 查阅类型类实例的内部代码生成器表。
如果找到代码生成器，就会对提供的类型调用它以创建实例。
不过，这条信息意味着没有找到 {anchorName derivingNotFound}`ToString` 的代码生成器。

# 练习

%%%
tag := "standard-classes-exercises"
%%%

 * 编写 {anchorTerm moreOps}`HAppend (List α) (NonEmptyList α) (NonEmptyList α)` 的实例并测试它。
 * 为二叉树数据类型实现 {anchorTerm FunctorLaws}`Functor` 实例。