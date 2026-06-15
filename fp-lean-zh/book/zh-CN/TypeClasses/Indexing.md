# 索引

{ref "props-proofs-indexing"}[插章] 描述了如何使用索引记号按位置查找列表中的条目。
这种语法也由一个类型类管辖，它可以用于多种不同的类型。

# 数组
%%%
tag := "array-indexing"
%%%

例如，Lean 数组在大多数用途上比链表高效得多。
在 Lean 中，类型 {anchorTerm arrVsList}`Array α` 是一个动态大小的数组，存放类型为 {anchorName arrVsList}`α` 的值，很像 Java 的 {java}`ArrayList`、C++ 的 {cpp}`std::vector` 或 Rust 的 {rust}`Vec`。
与 {anchorTerm arrVsList}`List` 不同——后者在每次使用 {anchorName arrVsList}`cons` 构造子时都有指针间接引用——数组占据一块连续的内存区域，这对处理器缓存要友好得多。
此外，在数组中查找一个值需要常数时间，而在链表中查找则需要与所访问索引成正比的时间。

在像 Lean 这样的纯函数式语言中，不可能就地修改数据结构中的某个位置。
相反，会制作一个具有所需修改的副本。
然而，复制并不总是必要的：Lean 编译器和运行时包含一种优化，当数组只有一个唯一引用时，可以在幕后将修改实现为突变。

数组的书写方式与列表类似，但前面有一个 {lit}`#`：

```anchor northernTrees
def northernTrees : Array String :=
  #["sloe", "birch", "elm", "oak"]
```
数组中的值的数量可以使用 {anchorName arrVsList}`Array.size` 来查找。
例如，{anchorTerm northernTreesSize}`northernTrees.size` 求值为 {anchorTerm northernTreesSize}`4`。
对于小于数组大小的索引，可以使用索引记号来查找相应的值，就像列表一样。
也就是说，{anchorTerm northernTreesTwo}`northernTrees[2]` 求值为 {anchorTerm northernTreesTwo}`"elm"`。
类似地，编译器要求证明索引在边界内，尝试查找数组边界之外的值会导致编译时错误，就像列表一样。
例如，{anchorTerm northernTreesEight}`northernTrees[8]` 会产生：
```anchorError northernTreesEight
failed to prove index is valid, possible solutions:
  - Use `have`-expressions to prove the index is valid
  - Use `a[i]!` notation instead, runtime check is performed, and 'Panic' error message is produced if index is not valid
  - Use `a[i]?` notation instead, result is an `Option` type
  - Use `a[i]'h` notation instead, where `h` is a proof that index is valid
⊢ 8 < northernTrees.size
```

# 非空列表
%%%
tag := "non-empty-list-indexing"
%%%

可以定义一个表示非空列表的数据类型，作为一个结构体，其中有一个字段表示列表的头部，另一个字段表示尾部（一个普通的、可能为空的列表）：

```anchor NonEmptyList
structure NonEmptyList (α : Type) : Type where
  head : α
  tail : List α
```
例如，非空列表 {moduleName}`idahoSpiders`（包含美国爱达荷州的一些本地蜘蛛物种）由 {anchorTerm firstSpider}`"Banded Garden Spider"` 开头，后面跟着另外四种蜘蛛，总共五种蜘蛛：

```anchor idahoSpiders
def idahoSpiders : NonEmptyList String := {
  head := "Banded Garden Spider",
  tail := [
    "Long-legged Sac Spider",
    "Wolf Spider",
    "Hobo Spider",
    "Cat-faced Spider"
  ]
}
```

用递归函数查找该列表中特定索引处的值，应考虑三种可能：
 1. 索引是 {anchorTerm NEListGetHuh}`0`，此时应返回列表的头部。
 2. 索引是 {anchorTerm NEListGetHuh}`n + 1` 且尾部为空，此时索引越界。
 3. 索引是 {anchorTerm NEListGetHuh}`n + 1` 且尾部非空，此时可以在尾部上递归调用该函数，并传入 {anchorTerm NEListGetHuh}`n`。

例如，可以如下编写一个返回 {moduleName}`Option` 的查找函数：

```anchor NEListGetHuh
def NonEmptyList.get? : NonEmptyList α → Nat → Option α
  | xs, 0 => some xs.head
  | {head := _, tail := []}, _ + 1 => none
  | {head := _, tail := h :: t}, n + 1 => get? {head := h, tail := t} n
```
模式匹配中的每个分支对应上述可能性之一。
对 {anchorName NEListGetHuh}`get?` 的递归调用不需要 {moduleName}`NonEmptyList` 命名空间限定符，因为定义体隐式地处于该定义的命名空间中。
另一种写法是，当索引大于零时使用列表查找 {anchorTerm NEListGetHuhList}`xs.tail[n]?`：

```anchor NEListGetHuhList
def NonEmptyList.get? : NonEmptyList α → Nat → Option α
  | xs, 0 => some xs.head
  | xs, n + 1 => xs.tail[n]?
```

如果列表包含一个条目，那么只有 {anchorTerm nats}`0` 是有效索引。
如果它包含两个条目，那么 {anchorTerm nats}`0` 和 {anchorTerm nats}`1` 都是有效索引。
如果它包含三个条目，那么 {anchorTerm nats}`0`、{anchorTerm nats}`1` 和 {anchorTerm nats}`2` 都是有效索引。
换句话说，非空列表的有效索引是严格小于列表长度的自然数，这些数小于或等于尾部的长度。

索引在边界内的定义应写为 {kw}`abbrev`，因为用于查找索引可接受证据的策略能够求解数字不等式，但它们对名称 {moduleName}`NonEmptyList.inBounds` 一无所知：

```anchor inBoundsNEList
abbrev NonEmptyList.inBounds (xs : NonEmptyList α) (i : Nat) : Prop :=
  i ≤ xs.tail.length
```
该函数返回一个可能为真也可能为假的命题。
例如，{anchorTerm spiderBoundsChecks}`2` 对 {moduleName}`idahoSpiders` 在边界内，而 {anchorTerm spiderBoundsChecks}`5` 不在：

```anchor spiderBoundsChecks
theorem atLeastThreeSpiders : idahoSpiders.inBounds 2 := by decide

theorem notSixSpiders : ¬idahoSpiders.inBounds 5 := by decide
```
逻辑否定运算符的优先级非常低，这意味着 {anchorTerm spiderBoundsChecks}`¬idahoSpiders.inBounds 5` 等价于 {anchorTerm spiderBoundsChecks'}`¬(idahoSpiders.inBounds 5)`。

这一事实可用于编写一个要求索引有效证据的查找函数，因此不必返回 {moduleName}`Option`，方法是委托给列表版本，该版本在编译时检查证据：

```anchor NEListGet
def NonEmptyList.get (xs : NonEmptyList α)
    (i : Nat) (ok : xs.inBounds i) : α :=
  match i with
  | 0 => xs.head
  | n + 1 => xs.tail[n]
```
当然，也可以编写这个函数来直接使用证据，而不是委托给一个恰好能够使用相同证据的标准库函数。
这需要使用本书后面描述的、用于处理证明和命题的技术。

# 重载索引
%%%
tag := "overloading-indexing"
%%%

可以通过定义 {anchorName GetElem}`GetElem` 类型类的实例来重载集合类型的索引记号。
为了灵活性，{anchorName GetElem}`GetElem` 有四个参数：
 * 集合的类型
 * 索引的类型
 * 从集合中提取的元素的类型
 * 一个函数，用于确定什么算作索引在边界内的证据

元素类型和证据函数都是输出参数。
{anchorName GetElem}`GetElem` 有一个方法 {anchorName GetElem}`getElem`，它接受一个集合值、一个索引值，以及索引在边界内的证据作为参数，并返回一个元素：

```anchor GetElem
class GetElem
    (coll : Type)
    (idx : Type)
    (item : outParam Type)
    (inBounds : outParam (coll → idx → Prop)) where
  getElem : (c : coll) → (i : idx) → inBounds c i → item
```

对于 {anchorTerm GetElemNEList}`NonEmptyList α`，这些参数是：
 * 集合是 {anchorTerm GetElemNEList}`NonEmptyList α`
 * 索引的类型是 {anchorName GetElemNEList}`Nat`
 * 元素的类型是 {anchorName GetElemNEList}`α`
 * 索引在边界内，当且仅当它小于或等于尾部的长度

事实上，{anchorTerm GetElemNEList}`GetElem` 实例可以直接委托给 {anchorTerm GetElemNEList}`NonEmptyList.get`：

```anchor GetElemNEList
instance : GetElem (NonEmptyList α) Nat α NonEmptyList.inBounds where
  getElem := NonEmptyList.get
```
有了这个实例，{anchorTerm GetElemNEList}`NonEmptyList` 变得与 {moduleName}`List` 一样方便使用。
求值 {anchorTerm firstSpider}`idahoSpiders.head` 得到 {anchorTerm firstSpider}`"Banded Garden Spider"`，而 {anchorTerm tenthSpider}`idahoSpiders[9]` 会导致编译时错误：
```anchorError tenthSpider
failed to prove index is valid, possible solutions:
  - Use `have`-expressions to prove the index is valid
  - Use `a[i]!` notation instead, runtime check is performed, and 'Panic' error message is produced if index is not valid
  - Use `a[i]?` notation instead, result is an `Option` type
  - Use `a[i]'h` notation instead, where `h` is a proof that index is valid
⊢ idahoSpiders.inBounds 9
```

因为集合类型和索引类型都是 {anchorTerm ListPosElem}`GetElem` 类型类的输入参数，新的类型可以用来索引现有的集合。
正数类型 {anchorTerm ListPosElem}`Pos` 是索引 {anchorTerm ListPosElem}`List` 的完全合理的索引，但有一个限制：它不能指向第一个条目。
以下 {anchorTerm ListPosElem}`GetElem` 实例允许 {anchorTerm ListPosElem}`Pos` 像 {moduleName}`Nat` 一样方便地查找列表条目：

```anchor ListPosElem
instance : GetElem (List α) Pos α
    (fun list n => list.length > n.toNat) where
  getElem (xs : List α) (i : Pos) ok := xs[i.toNat]
```

索引对于非数字索引也可能有意义。
例如，{moduleName}`Bool` 可用于在点中的字段之间进行选择，{moduleName}`false` 对应 {anchorTerm PPointBoolGetElem}`x`，{moduleName}`true` 对应 {anchorTerm PPointBoolGetElem}`y`：

```anchor PPointBoolGetElem
instance : GetElem (PPoint α) Bool α (fun _ _ => True) where
  getElem (p : PPoint α) (i : Bool) _ :=
    if not i then p.x else p.y
```
在这种情况下，两个布尔值都是有效索引。
因为每个可能的 {moduleName}`Bool` 都在边界内，证据就是真命题 {moduleName}`True`。