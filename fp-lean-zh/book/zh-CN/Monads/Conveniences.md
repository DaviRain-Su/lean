# 更多便利特性

# 共享参数类型

在定义接受多个同类型参数的函数时，可以把这些参数都写在同一个冒号之前。例如，

```anchor equalHuhOld
def equal? [BEq α] (x : α) (y : α) : Option α :=
  if x == y then
    some x
  else
    none
```
可以写成

```anchor equalHuhNew
def equal? [BEq α] (x y : α) : Option α :=
  if x == y then
    some x
  else
    none
```
当类型签名很长时，这一点尤其有用。

# 前导点记法

归纳类型的构造子位于某个命名空间中。这使多个相关的归纳类型可以使用相同的构造子名称，但也可能导致程序变得冗长。在已知相关归纳类型的上下文中，可以在构造子名称前加一个点来省略命名空间，Lean 会利用期望类型来解析构造子名称。例如，镜像二叉树的函数可以写成：

```anchor mirrorOld
def BinTree.mirror : BinTree α → BinTree α
  | BinTree.leaf => BinTree.leaf
  | BinTree.branch l x r => BinTree.branch (mirror r) x (mirror l)
```
省略命名空间会使代码显著更短，但代价是在不包含 Lean 编译器的代码审查工具等上下文中，程序会更难阅读：

```anchor mirrorNew
def BinTree.mirror : BinTree α → BinTree α
  | .leaf => .leaf
  | .branch l x r => .branch (mirror r) x (mirror l)
```

利用表达式的期望类型来消除命名空间歧义，也适用于构造子以外的名字。如果 {anchorName BinTreeEmpty}`BinTree.empty` 被定义为创建 {anchorName BinTreeEmpty}`BinTree` 的另一种方式，那么它也可以使用点号记法：

```anchor BinTreeEmpty
def BinTree.empty : BinTree α := .leaf
```
```anchor emptyDot
#check (.empty : BinTree Nat)
```
```anchorInfo emptyDot
BinTree.empty : BinTree Nat
```

# 或模式

在允许多个模式的上下文中，例如 {kw}`match` 表达式，多个模式可以共享同一个结果表达式。表示一周中各天的数据类型 {anchorName Weekday}`Weekday`：

```anchor Weekday
inductive Weekday where
  | monday
  | tuesday
  | wednesday
  | thursday
  | friday
  | saturday
  | sunday
deriving Repr
```

可以使用模式匹配来检查某一天是否为周末：

```anchor isWeekendA
def Weekday.isWeekend (day : Weekday) : Bool :=
  match day with
  | Weekday.saturday => true
  | Weekday.sunday => true
  | _ => false
```
这已经可以通过构造子点号记法进一步简化：

```anchor isWeekendB
def Weekday.isWeekend (day : Weekday) : Bool :=
  match day with
  | .saturday => true
  | .sunday => true
  | _ => false
```
由于两个周末模式具有相同的结果表达式（{anchorName isWeekendC}`true`），它们可以合并为一个：

```anchor isWeekendC
def Weekday.isWeekend (day : Weekday) : Bool :=
  match day with
  | .saturday | .sunday => true
  | _ => false
```
还可以进一步简化为不显式命名参数的版本：

```anchor isWeekendD
def Weekday.isWeekend : Weekday → Bool
  | .saturday | .sunday => true
  | _ => false
```

在幕后，结果表达式会被简单地复制到每个模式中。这意味着模式可以绑定变量，如下例所示，它从一个和类型中去掉 {anchorName SumNames}`inl` 和 {anchorName SumNames}`inr` 构造子，而两侧包含的值类型相同：

```anchor condense
def condense : α ⊕ α → α
  | .inl x | .inr x => x
```
由于结果表达式会被复制，模式所绑定的变量不必具有相同的类型。可以使用对多种类型都适用的重载函数，为绑定不同类型变量的模式编写一个统一的结果表达式：

```anchor stringy
def stringy : Nat ⊕ Weekday → String
  | .inl x | .inr x => s!"It is {repr x}"
```
在实践中，结果表达式中只能引用所有模式共有的变量，因为该结果必须对每个模式都有意义。在 {anchorName getTheNat}`getTheNat` 中，只能访问 {anchorName getTheNat}`n`，而尝试使用 {anchorName getTheNat}`x` 或 {anchorName getTheNat}`y` 都会导致错误。

```anchor getTheNat
def getTheNat : (Nat × α) ⊕ (Nat × β) → Nat
  | .inl (n, x) | .inr (n, y) => n
```
在类似的定义中尝试访问 {anchorName getTheAlpha}`x` 会导致错误，因为在第二个模式中并不存在 {anchorName getTheAlpha}`x`：
```anchor getTheAlpha
def getTheAlpha : (Nat × α) ⊕ (Nat × α) → α
  | .inl (n, x) | .inr (n, y) => x
```
```anchorError getTheAlpha
Unknown identifier `x`
```

结果表达式本质上会被复制粘贴到模式匹配的每个分支中，这有时会导致一些令人意外的行为。例如，下面的定义是可以接受的，因为 {anchorName SumNames}`inr` 分支中的结果表达式引用的是 {anchorName getTheString}`str` 的全局定义：

```anchor getTheString
def str := "Some string"

def getTheString : (Nat × String) ⊕ (Nat × β) → String
  | .inl (n, str) | .inr (n, y) => str
```
对两个构造子分别调用这个函数，就会暴露出这种令人困惑的行为。在第一种情况下，需要类型标注来告诉 Lean {anchorName getTheString}`β` 应该是什么类型：
```anchor getOne
#eval getTheString (.inl (20, "twenty") : (Nat × String) ⊕ (Nat × String))
```
```anchorInfo getOne
"twenty"
```
在第二种情况下，使用的是全局定义：
```anchor getTwo
#eval getTheString (.inr (20, "twenty"))
```
```anchorInfo getTwo
"Some string"
```

或模式可以极大地简化某些定义并提高其清晰度，正如 {anchorName isWeekendD}`Weekday.isWeekend` 所示。但由于存在令人困惑的行为的可能，使用时应保持谨慎，尤其是在涉及多种类型的变量或互不重叠的变量集合时。