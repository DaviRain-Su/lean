# 插入排序

虽然插入排序并非具有最优最坏情况时间复杂度的排序算法，但它仍有许多有用性质：
 * 实现简单、直观，易于理解
 * 是原地（in-place）算法，运行时不需额外空间
 * 是稳定排序
 * 当输入已近乎有序时速度很快

原地算法在 Lean 中尤其有用，这与其内存管理方式有关。
在某些情况下，通常会复制数组的操作可以优化为原地修改。
其中包括在数组中交换元素。

大多数采用自动内存管理的语言与运行时系统——包括 JavaScript、JVM 和 .NET——都使用**追踪式垃圾回收**（tracing garbage collection）。
当需要回收内存时，系统从若干**根**（roots）（例如调用栈和全局值）出发，通过递归追踪指针来确定哪些值仍可到达。
凡无法到达的值都会被释放，从而腾出内存。

**引用计数**（reference counting）是追踪式垃圾回收的替代方案，Python、Swift 和 Lean 等语言都采用它。
在引用计数系统中，内存中的每个对象都有一个字段，记录指向它的引用数量。
建立新引用时，计数器递增。
引用消失时，计数器递减。
计数器归零时，对象立即被释放。

与追踪式垃圾回收器相比，引用计数有一个主要缺点：循环引用可能导致内存泄漏。
若对象 $`A`$ 引用对象 $`B`$，而对象 $`B`$ 又引用对象 $`A`$，则即使程序中再无其他部分引用 $`A`$ 或 $`B`$，它们也永远不会被释放。
循环引用要么来自不受控的递归，要么来自可变引用。
由于 Lean 两者都不支持，因此不可能构造出循环引用。

引用计数意味着 Lean 运行时系统在分配和释放数据结构的原语中，可以检查引用计数是否即将降为零，并复用已有对象，而不是分配新对象。
在处理大型数组时，这一点尤为重要。


Lean 数组的插入排序实现应满足以下标准：
 1. Lean 应能在没有 {kw}`partial` 标注的情况下接受该函数
 2. 若传入的数组没有其他引用指向它，则应原地修改该数组，而不是分配新数组

第一条标准很容易检查：若 Lean 接受该定义，即已满足。
第二条标准则需要某种测试手段。
Lean 提供了一个名为 {anchorName dbgTraceIfSharedSig}`dbgTraceIfShared` 的内置函数，其签名为：
```anchor dbgTraceIfSharedSig
#check dbgTraceIfShared
```
```anchorInfo dbgTraceIfSharedSig
dbgTraceIfShared.{u} {α : Type u} (s : String) (a : α) : α
```
它接受一个字符串和一个值作为参数；若该值的引用数大于一，则使用给定字符串向标准错误输出打印一条消息，并返回该值。
严格说来，这不是纯函数。
但它仅用于开发阶段，以检查函数是否确实能复用内存，而不是分配并复制。

学习使用 {anchorName dbgTraceIfSharedSig}`dbgTraceIfShared` 时，重要的是要知道：在 {kw}`#eval` 中会比在编译后的代码里报告多得多的值被共享。
这可能令人困惑。
应使用 {lit}`lake` 构建可执行文件，而不是在编辑器中试验。

插入排序由两个循环组成。
外层循环将指针从左向右移过待排序数组。
每次迭代后，指针左侧的数组区域已排序，而右侧区域可能尚未排序。
内层循环取出指针所指的元素，将其向左移动，直到找到合适位置并恢复循环不变式。
换言之，每次迭代都把数组的下一个元素插入已排序区域的适当位置。

# 内层循环
%%%
tag := "inner-insertion-sort-loop"
%%%

插入排序的内层循环可实现为尾递归函数，接受数组和正在插入元素的索引作为参数。
正在插入的元素会反复与左侧元素交换，直到左侧元素更小，或到达数组开头。
内层循环在用于索引数组的 {anchorName insertSorted}`Fin` 内部的 {anchorName insertionSortLoop}`Nat` 上做结构递归：

```anchor insertSorted
def insertSorted [Ord α] (arr : Array α) (i : Fin arr.size) : Array α :=
  match i with
  | ⟨0, _⟩ => arr
  | ⟨i' + 1, _⟩ =>
    have : i' < arr.size := by
      grind
    match Ord.compare arr[i'] arr[i] with
    | .lt | .eq => arr
    | .gt =>
      insertSorted (arr.swap i' i) ⟨i', by simp [*]⟩
```
若索引 {anchorName insertSorted}`i` 为 {anchorTerm insertSorted}`0`，则正在插入已排序区域的元素已到达该区域开头，且为最小元素。
若索引为 {anchorTerm insertSorted}`i' + 1`，则应将 {anchorName insertSorted}`i'` 处的元素与 {anchorName insertSorted}`i` 处的元素比较。
注意，虽然 {anchorName insertSorted}`i` 是 {anchorTerm insertSorted}`Fin arr.size`，{anchorName insertSorted}`i'` 却只是 {anchorName insertionSortLoop}`Nat`，因为它来自 {anchorName insertSorted}`i` 的 {anchorName names}`val` 字段。
尽管如此，用于检查数组索引记法的证明自动化包含线性整数算术求解器，因此 {anchorName insertSorted}`i'` 可自动用作索引。

查找两个元素并比较。
若左侧元素小于或等于正在插入的元素，则循环结束，不变式已恢复。
若左侧元素大于正在插入的元素，则交换两元素，内层循环再次开始。
{anchorName names}`Array.swap` 的两个索引都取 {anchorName names}`Nat`，并在幕后使用与数组索引相同的策略，以确保它们在边界内。

尽管如此，递归调用所用的 {anchorName names}`Fin` 需要证明：对于交换两个元素后的结果，{anchorName insertSorted}`i'` 仍在边界内。
{anchorTerm insertSorted}`simp` 策略的数据库包含“交换数组中两个元素不改变其大小”这一事实，而 {anchorTerm insertSorted}`[*]` 参数指示它额外使用由 {kw}`have` 引入的假设。
若省略带有 {anchorTerm insertSorted}`i' < arr.size` 证明的 {kw}`have` 表达式，会暴露出以下目标：
```anchorError insertSortedNoProof
unsolved goals
α : Type ?u.7
inst✝ : Ord α
arr : Array α
i : Fin arr.size
i' : Nat
isLt✝ : i' + 1 < arr.size
⊢ i' < arr.size
```



# 外层循环
%%%
tag := "outer-insertion-sort-loop"
%%%

插入排序的外层循环将指针从左向右移动，在每次迭代中调用 {anchorName insertionSortLoop}`insertSorted`，把指针处的元素插入数组中的正确位置。
循环的基本形式类似于 {anchorTerm etc}`Array.map` 的实现：
```anchor insertionSortLoopTermination
def insertionSortLoop [Ord α] (arr : Array α) (i : Nat) : Array α :=
  if h : i < arr.size then
    insertionSortLoop (insertSorted arr ⟨i, h⟩) (i + 1)
  else
    arr
```
会出现错误，因为没有在每次递归调用时递减的参数：
```anchorError insertionSortLoopTermination
fail to show termination for
  insertionSortLoop
with errors
failed to infer structural recursion:
Not considering parameter α of insertionSortLoop:
  it is unchanged in the recursive calls
Not considering parameter #2 of insertionSortLoop:
  it is unchanged in the recursive calls
Cannot use parameter arr:
  the type Array α does not have a `.brecOn` recursor
Cannot use parameter i:
  failed to eliminate recursive application
    insertionSortLoop (insertSorted arr ⟨i, h⟩) (i + 1)


Could not find a decreasing measure.
The basic measures relate at each recursive call as follows:
(<, ≤, =: relation proved, ? all proofs failed, _: no proof attempted)
            arr i #1
1) 569:4-55   ? ?  ?

#1: arr.size - i

Please use `termination_by` to specify a decreasing measure.
```
虽然 Lean 能证明在每次迭代中向常数边界递增的 {anchorName insertionSortLoop}`Nat` 会导出终止函数，但本函数没有常数边界，因为在每次迭代中数组都会被调用 {anchorName insertionSortLoop}`insertSorted` 的结果替换。

在构造终止性证明之前，用 {kw}`partial` 修饰符测试定义是否返回预期结果会很方便：

```anchor partialInsertionSortLoop
partial def insertionSortLoop [Ord α] (arr : Array α) (i : Nat) : Array α :=
  if h : i < arr.size then
    insertionSortLoop (insertSorted arr ⟨i, h⟩) (i + 1)
  else
    arr
```
```anchor insertionSortPartialOne
#eval insertionSortLoop #[5, 17, 3, 8] 0
```
```anchorInfo insertionSortPartialOne
#[3, 5, 8, 17]
```
```anchor insertionSortPartialTwo
#eval insertionSortLoop #["metamorphic", "igneous", "sedimentary"] 0
```
```anchorInfo insertionSortPartialTwo
#["igneous", "metamorphic", "sedimentary"]
```

## 终止性
%%%
tag := "insertionSortLoop-termination"
%%%

同样，函数会终止，是因为正在处理的数组的索引与其大小之差在每次递归调用时都会减小。
不过这一次，Lean 不接受 {kw}`termination_by`：
```anchor insertionSortLoopProof1
def insertionSortLoop [Ord α] (arr : Array α) (i : Nat) : Array α :=
  if h : i < arr.size then
    insertionSortLoop (insertSorted arr ⟨i, h⟩) (i + 1)
  else
    arr
termination_by arr.size - i
```
```anchorError insertionSortLoopProof1
failed to prove termination, possible solutions:
  - Use `have`-expressions to prove the remaining goals
  - Use `termination_by` to specify a different well-founded relation
  - Use `decreasing_by` to specify your own tactic for discharging this kind of goal
α : Type u_1
inst✝ : Ord α
arr : Array α
i : Nat
h : i < arr.size
⊢ (insertSorted arr ⟨i, h⟩).size - (i + 1) < arr.size - i
```
问题在于 Lean 无法知道 {anchorName insertionSortLoop}`insertSorted` 返回的数组与传入的数组大小相同。
要证明 {anchorName insertionSortLoop}`insertionSortLoop` 终止，必须先证明 {anchorName insertionSortLoop}`insertSorted` 不改变数组大小。
将错误信息中未证明的终止条件复制到函数中，并用 {anchorTerm insertionSortLoopSorry}`sorry` “证明”它，可暂时让函数被接受：
```anchor insertionSortLoopSorry
def insertionSortLoop [Ord α] (arr : Array α) (i : Nat) : Array α :=
  if h : i < arr.size then
    have : (insertSorted arr ⟨i, h⟩).size - (i + 1) < arr.size - i := by
      sorry
    insertionSortLoop (insertSorted arr ⟨i, h⟩) (i + 1)
  else
    arr
termination_by arr.size - i
```
```anchorWarning insertionSortLoopSorry
declaration uses 'sorry'
```

由于 {anchorName insertionSortLoop}`insertSorted` 在正在插入元素的索引上做结构递归，证明应对该索引做归纳。
在基础情形中，数组原样返回，因此其长度当然不变。
在归纳步骤中，归纳假设是：对下一个更小索引的递归调用不会改变数组长度。
有两种情形要考虑：要么元素已完全插入已排序区域，数组原样返回，此时长度也不变；要么在递归调用前元素与下一个元素交换。
然而，交换数组中两个元素不会改变其大小，而归纳假设表明对下一个索引的递归调用返回的数组与其参数大小相同。
因此大小保持不变。

将这一英文定理陈述翻译成 Lean，并沿用本章的技巧，就足以证明基础情形，并在归纳步骤中取得进展：
```anchor insert_sorted_size_eq_0
theorem insert_sorted_size_eq [Ord α] (arr : Array α) (i : Fin arr.size) :
    (insertSorted arr i).size = arr.size := by
  match i with
  | ⟨j, isLt⟩ =>
    induction j with
    | zero => simp [insertSorted]
    | succ j' ih =>
      simp [insertSorted]
```
在归纳步骤中用 {anchorName insert_sorted_size_eq_0}`insertSorted` 化简后，暴露出 {anchorName insert_sorted_size_eq_0}`insertSorted` 中的模式匹配：
```anchorError insert_sorted_size_eq_0
unsolved goals
case succ
α : Type u_1
inst✝ : Ord α
arr : Array α
i : Fin arr.size
j' : Nat
ih : ∀ (isLt : j' < arr.size), (insertSorted arr ⟨j', isLt⟩).size = arr.size
isLt : j' + 1 < arr.size
⊢ (match compare arr[j'] arr[j' + 1] with
    | Ordering.lt => arr
    | Ordering.eq => arr
    | Ordering.gt => insertSorted (arr.swap j' (j' + 1) ⋯ ⋯) ⟨j', ⋯⟩).size =
  arr.size
```
面对包含 {kw}`if` 或 {kw}`match` 的目标时，{anchorTerm insert_sorted_size_eq_1}`split` 策略（不要与归并排序定义中使用的 {anchorName splitList (module := Examples.ProgramsProofs.Inequalities)}`splitList` 函数混淆）会为每条控制流路径生成一个新目标：
```anchor insert_sorted_size_eq_1
theorem insert_sorted_size_eq [Ord α] (arr : Array α) (i : Fin arr.size) :
    (insertSorted arr i).size = arr.size := by
  match i with
  | ⟨j, isLt⟩ =>
    induction j with
    | zero => simp [insertSorted]
    | succ j' ih =>
      simp [insertSorted]
      split
```
由于通常关心的不是陈述**如何**被证明，而是它**是否**被证明，Lean 输出中的证明通常会被替换为 {lit}`⋯`。
此外，每个新目标都有一个假设，表明是哪条分支导致了该目标，本例中命名为 {lit}`heq✝`：
```anchorError insert_sorted_size_eq_1
unsolved goals
case h_1
α : Type u_1
inst✝ : Ord α
arr : Array α
i : Fin arr.size
j' : Nat
ih : ∀ (isLt : j' < arr.size), (insertSorted arr ⟨j', isLt⟩).size = arr.size
isLt : j' + 1 < arr.size
x✝ : Ordering
heq✝ : compare arr[j'] arr[j' + 1] = Ordering.lt
⊢ arr.size = arr.size

case h_2
α : Type u_1
inst✝ : Ord α
arr : Array α
i : Fin arr.size
j' : Nat
ih : ∀ (isLt : j' < arr.size), (insertSorted arr ⟨j', isLt⟩).size = arr.size
isLt : j' + 1 < arr.size
x✝ : Ordering
heq✝ : compare arr[j'] arr[j' + 1] = Ordering.eq
⊢ arr.size = arr.size

case h_3
α : Type u_1
inst✝ : Ord α
arr : Array α
i : Fin arr.size
j' : Nat
ih : ∀ (isLt : j' < arr.size), (insertSorted arr ⟨j', isLt⟩).size = arr.size
isLt : j' + 1 < arr.size
x✝ : Ordering
heq✝ : compare arr[j'] arr[j' + 1] = Ordering.gt
⊢ (insertSorted (arr.swap j' (j' + 1) ⋯ ⋯) ⟨j', ⋯⟩).size = arr.size
```
与其为两个简单情形分别写证明，在 {anchorTerm insert_sorted_size_eq_2}`split` 之后加上 {anchorTerm insert_sorted_size_eq_2}`<;> try rfl`，可让两个直接的情形立即消失，只留下一个目标：
```anchor insert_sorted_size_eq_2
theorem insert_sorted_size_eq [Ord α] (arr : Array α) (i : Fin arr.size) :
    (insertSorted arr i).size = arr.size := by
  match i with
  | ⟨j, isLt⟩ =>
    induction j with
    | zero => simp [insertSorted]
    | succ j' ih =>
      simp [insertSorted]
      split <;> try rfl
```
```anchorError insert_sorted_size_eq_2
unsolved goals
case h_3
α : Type u_1
inst✝ : Ord α
arr : Array α
i : Fin arr.size
j' : Nat
ih : ∀ (isLt : j' < arr.size), (insertSorted arr ⟨j', isLt⟩).size = arr.size
isLt : j' + 1 < arr.size
x✝ : Ordering
heq✝ : compare arr[j'] arr[j' + 1] = Ordering.gt
⊢ (insertSorted (arr.swap j' (j' + 1) ⋯ ⋯) ⟨j', ⋯⟩).size = arr.size
```

遗憾的是，归纳假设不足以证明该目标。
归纳假设说的是：对 {anchorName insert_sorted_size_eq_3}`arr` 调用 {anchorName insert_sorted_size_eq_3}`insertSorted` 不会改变大小，但证明目标却是：对交换结果做递归调用后大小不变。
要完成证明，需要更强的归纳假设：对**任意**传入 {anchorName insert_sorted_size_eq_3}`insertSorted` 的数组，连同更小的索引作为参数，大小都不变。

可以通过对 {anchorTerm insert_sorted_size_eq_3}`induction` 策略使用 {anchorTerm insert_sorted_size_eq_3}`generalizing` 选项来获得更强的归纳假设。
该选项会把上下文中的额外假设带入用于生成基础情形、归纳假设和归纳步骤中要证明的目标的陈述中。
对 {anchorName insert_sorted_size_eq_3}`arr` 做泛化会得到更强的假设：
```anchor insert_sorted_size_eq_3
theorem insert_sorted_size_eq [Ord α] (arr : Array α) (i : Fin arr.size) :
    (insertSorted arr i).size = arr.size := by
  match i with
  | ⟨j, isLt⟩ =>
    induction j generalizing arr with
    | zero => simp [insertSorted]
    | succ j' ih =>
      simp [insertSorted]
      split <;> try rfl
```
在所得目标中，{anchorName insert_sorted_size_eq_3}`arr` 现在是归纳假设中“对所有”陈述的一部分：
```anchorError insert_sorted_size_eq_3
unsolved goals
case h_3
α : Type u_1
inst✝ : Ord α
j' : Nat
ih : ∀ (arr : Array α) (i : Fin arr.size) (isLt : j' < arr.size), (insertSorted arr ⟨j', isLt⟩).size = arr.size
arr : Array α
i : Fin arr.size
isLt : j' + 1 < arr.size
x✝ : Ordering
heq✝ : compare arr[j'] arr[j' + 1] = Ordering.gt
⊢ (insertSorted (arr.swap j' (j' + 1) ⋯ ⋯) ⟨j', ⋯⟩).size = arr.size
```

:::paragraph
然而，整个证明开始变得难以驾驭。
下一步需要引入一个变量表示交换结果的长度，证明它等于 {anchorTerm insert_sorted_size_eq_3}`arr.size`，再证明该变量也等于递归调用所得数组的长度。
然后可以把这些等式链起来证明目标。
不过，使用函数归纳会简单得多：
```anchor insert_sorted_size_eq_funInd1
theorem insert_sorted_size_eq [Ord α]
    (arr : Array α) (i : Fin arr.size) :
    (insertSorted arr i).size = arr.size := by
  fun_induction insertSorted with
  | case1 arr isLt => skip
  | case2 arr i isLt this isLt => skip
  | case3 arr i isLt this isEq => skip
  | case4 arr i isLt this isGt ih => skip
```
第一个目标是索引为 {anchorTerm insertSorted}`0` 的情形。
此时数组未被修改，因此证明其大小不变不需要复杂步骤：
```anchorError insert_sorted_size_eq_funInd1
unsolved goals
case case1
α : Type u_1
inst✝ : Ord α
arr✝ arr : Array α
isLt : 0 < arr.size
⊢ arr.size = arr.size
```
接下来两个目标相同，对应元素比较的 {anchorName insertSorted}`.lt` 和 {anchorName insertSorted}`.eq` 情形。
局部假设 {anchorName insert_sorted_size_eq_funInd1}`isLt` 和 {anchorName insert_sorted_size_eq_funInd1}`isEq` 将允许选择 {anchorTerm insertSorted}`match` 的正确分支：
```anchorError insert_sorted_size_eq_funInd1
unsolved goals
case case2
α : Type u_1
inst✝ : Ord α
arr✝ arr : Array α
i : Nat
isLt✝ : i + 1 < arr.size
this : i < arr.size
isLt : compare arr[i] arr[⟨i.succ, isLt✝⟩] = Ordering.lt
⊢ (match compare arr[i] arr[⟨i.succ, isLt✝⟩] with
    | Ordering.lt => arr
    | Ordering.eq => arr
    | Ordering.gt => insertSorted (arr.swap i (↑⟨i.succ, isLt✝⟩) this ⋯) ⟨i, ⋯⟩).size =
  arr.size
```
```anchorError insert_sorted_size_eq_funInd1
unsolved goals
case case3
α : Type u_1
inst✝ : Ord α
arr✝ arr : Array α
i : Nat
isLt : i + 1 < arr.size
this : i < arr.size
isEq : compare arr[i] arr[⟨i.succ, isLt⟩] = Ordering.eq
⊢ (match compare arr[i] arr[⟨i.succ, isLt⟩] with
    | Ordering.lt => arr
    | Ordering.eq => arr
    | Ordering.gt => insertSorted (arr.swap i (↑⟨i.succ, isLt⟩) this ⋯) ⟨i, ⋯⟩).size =
  arr.size
```
在最后一个情形中，一旦 {anchorTerm insertSorted}`match` 被化简，仍需一些工作来证明插入的下一步保持数组大小。
特别地，归纳假设说的是下一步的大小等于交换结果的大小，而期望结论是它等于原始数组的大小：
```anchorError insert_sorted_size_eq_funInd1
unsolved goals
case case4
α : Type u_1
inst✝ : Ord α
arr✝ arr : Array α
i : Nat
isLt : i + 1 < arr.size
this : i < arr.size
isGt : compare arr[i] arr[⟨i.succ, isLt⟩] = Ordering.gt
ih : (insertSorted (arr.swap i (↑⟨i.succ, isLt⟩) this ⋯) ⟨i, ⋯⟩).size = (arr.swap i (↑⟨i.succ, isLt⟩) this ⋯).size
⊢ (match compare arr[i] arr[⟨i.succ, isLt⟩] with
    | Ordering.lt => arr
    | Ordering.eq => arr
    | Ordering.gt => insertSorted (arr.swap i (↑⟨i.succ, isLt⟩) this ⋯) ⟨i, ⋯⟩).size =
  arr.size
```
:::

:::paragraph
Lean 库包含定理 {anchorName insert_sorted_size_eq_funInd}`Array.size_swap`，它表明交换数组中两个元素不会改变其大小。
默认情况下，{tactic}`grind` 不会使用该事实，但一旦指示它这样做，就能处理全部四种情形：
```anchor insert_sorted_size_eq_funInd
theorem insert_sorted_size_eq [Ord α]
    (arr : Array α) (i : Fin arr.size) :
    (insertSorted arr i).size = arr.size := by
  fun_induction insertSorted <;> grind [Array.size_swap]
```
:::

:::paragraph
现在可以用该证明替换 {anchorName insertionSortLoopSorry}`insertionSortLoop` 中的 {anchorTerm insertionSortLoopSorry}`sorry`。
特别地，该定理允许 {anchorTerm insertionSortLoop}`grind` 成功：
```anchor insertionSortLoop
def insertionSortLoop [Ord α] (arr : Array α) (i : Nat) : Array α :=
  if h : i < arr.size then
    have : (insertSorted arr ⟨i, h⟩).size - (i + 1) < arr.size - i := by
      grind [insert_sorted_size_eq]
    insertionSortLoop (insertSorted arr ⟨i, h⟩) (i + 1)
  else
    arr
termination_by arr.size - i
```
:::


# 驱动函数
%%%
tag := "insertion-sort-driver-function"
%%%

插入排序本身调用 {anchorName insertionSort}`insertionSortLoop`，将划分已排序区域与未排序区域的索引初始化为 {anchorTerm insertionSort}`0`：

```anchor insertionSort
def insertionSort [Ord α] (arr : Array α) : Array α :=
   insertionSortLoop arr 0
```

几个快速测试表明，该函数至少没有明显错误：
```anchor insertionSortNums
#eval insertionSort #[3, 1, 7, 4]
```
```anchorInfo insertionSortNums
#[1, 3, 4, 7]
```
```anchor insertionSortStrings
#eval insertionSort #[ "quartz", "marble", "granite", "hematite"]
```
```anchorInfo insertionSortStrings
#["granite", "hematite", "marble", "quartz"]
```

# 这真的是插入排序吗？
%%%
tag := "insertion-sort-in-place"
%%%


插入排序**定义上**就是原地排序算法。
尽管其最坏情况运行时间为平方级，它仍然有用，因为它是稳定排序、不分配额外空间，且能高效处理近乎有序的数据。
若内层循环的每次迭代都分配新数组，该算法就**算不上**真正的插入排序。

Lean 的数组操作（如 {anchorName names}`Array.set` 和 {anchorName names}`Array.swap`）会检查相关数组的引用计数是否大于一。
若是，则该数组在代码的多个部分可见，意味着必须复制它。
否则 Lean 就不再是纯函数式语言。
然而，当引用计数恰好为一时，没有其他潜在的观察者。
此时数组原语会原地修改数组。
程序其他部分不知道的事，不会伤害它们。

Lean 的证明逻辑工作在纯函数式程序层面，而非底层实现。
因此，发现程序是否不必要地复制数据的最佳方式是测试它。
在希望原地修改的每个位置添加对 {anchorName dbgTraceIfSharedSig}`dbgTraceIfShared` 的调用，当相关值的引用数大于一时，所提供的消息会打印到 {lit}`stderr`。

插入排序恰好有一个可能复制而非原地修改的位置：对 {anchorName names}`Array.swap` 的调用。
将 {anchorTerm insertSorted}`arr.swap i' i` 替换为 {anchorTerm InstrumentedInsertionSort (module := Examples.ProgramsProofs.InstrumentedInsertionSort)}`(dbgTraceIfShared "array to swap" arr).swap i' i`，会在无法原地修改数组时让程序输出 {lit}`shared RC array to swap`。
不过，这一改动也会改变证明，因为现在多了一次函数调用。
添加局部假设：{anchorName dbgTraceIfSharedSig}`dbgTraceIfShared` 保持其参数的长度不变，并在部分对 {anchorTerm InstrumentedInsertionSort (module:=Examples.ProgramsProofs.InstrumentedInsertionSort)}`simp` 的调用中加入该假设，就足以修复程序与证明。

插入排序的完整插桩代码为：
```anchor InstrumentedInsertionSort (module := Examples.ProgramsProofs.InstrumentedInsertionSort)
def insertSorted [Ord α] (arr : Array α) (i : Fin arr.size) : Array α :=
  match i with
  | ⟨0, _⟩ => arr
  | ⟨i' + 1, _⟩ =>
    have : i' < arr.size := by
      omega
    match Ord.compare arr[i'] arr[i] with
    | .lt | .eq => arr
    | .gt =>
      have : (dbgTraceIfShared "array to swap" arr).size = arr.size := by
        simp [dbgTraceIfShared]
      insertSorted
        ((dbgTraceIfShared "array to swap" arr).swap i' i)
        ⟨i', by simp [*]⟩

theorem insert_sorted_size_eq [Ord α] (len : Nat) (i : Nat) :
    (arr : Array α) → (isLt : i < arr.size) → (arr.size = len) →
    (insertSorted arr ⟨i, isLt⟩).size = len := by
  induction i with
  | zero =>
    intro arr isLt hLen
    simp [insertSorted, *]
  | succ i' ih =>
    intro arr isLt hLen
    simp [insertSorted, dbgTraceIfShared]
    split <;> simp [*]

def insertionSortLoop [Ord α] (arr : Array α) (i : Nat) : Array α :=
  if h : i < arr.size then
    have : (insertSorted arr ⟨i, h⟩).size - (i + 1) < arr.size - i := by
      rw [insert_sorted_size_eq arr.size i arr h rfl]
      omega
    insertionSortLoop (insertSorted arr ⟨i, h⟩) (i + 1)
  else
    arr
termination_by arr.size - i

def insertionSort [Ord α] (arr : Array α) : Array α :=
  insertionSortLoop arr 0
```

要检查插桩是否真正有效，需要一点技巧。
首先，当所有参数在编译时已知时，Lean 编译器会积极优化掉函数调用。
仅编写一个对大数组应用 {anchorName InstrumentedInsertionSort (module:=Examples.ProgramsProofs.InstrumentedInsertionSort)}`insertionSort` 的程序是不够的，因为生成的编译代码可能只包含作为常量的已排序数组。
确保编译器不会优化掉排序例程的最简单方法，是从 {anchorName getLines (module:=Examples.ProgramsProofs.InstrumentedInsertionSort)}`stdin` 读取数组。
其次，编译器会做死代码消除。
向程序添加额外的 {kw}`let` 不一定会在运行代码中产生更多引用，若 {kw}`let` 绑定的变量从未被使用。
要确保额外引用不会被完全消除，必须保证该额外引用以某种方式被使用。

测试插桩的第一步是编写 {anchorName getLines (module := Examples.ProgramsProofs.InstrumentedInsertionSort)}`getLines`，从标准输入读取行数组：
```anchor getLines (module := Examples.ProgramsProofs.InstrumentedInsertionSort)
def getLines : IO (Array String) := do
  let stdin ← IO.getStdin
  let mut lines : Array String := #[]
  let mut currLine ← stdin.getLine
  while !currLine.isEmpty do
     -- Drop trailing newline:
    lines := lines.push (currLine.dropRight 1)
    currLine ← stdin.getLine
  pure lines
```
{anchorName various (module:=Examples.ProgramsProofs.InstrumentedInsertionSort)}`IO.FS.Stream.getLine` 返回完整的一行文本，包括末尾换行符。
到达文件结束标记时，它返回 {anchorTerm mains (module:=Examples.ProgramsProofs.InstrumentedInsertionSort)}`""`。

接下来需要两个独立的 {anchorName main (module:=Examples.ProgramsProofs.InstrumentedInsertionSort)}`main` 例程。
两者都从标准输入读取待排序数组，确保对 {anchorName mains (module:=Examples.ProgramsProofs.InstrumentedInsertionSort)}`insertionSort` 的调用不会在编译时被替换为返回值。
两者都向控制台打印，确保对 {anchorName insertionSort}`insertionSort` 的调用不会被完全优化掉。
其中一个只打印已排序数组，另一个同时打印已排序数组和原始数组。
第二个函数应触发 {anchorName names}`Array.swap` 不得不分配新数组的警告：
```anchor mains (module := Examples.ProgramsProofs.InstrumentedInsertionSort)
def mainUnique : IO Unit := do
  let lines ← getLines
  for line in insertionSort lines do
    IO.println line

def mainShared : IO Unit := do
  let lines ← getLines
  IO.println "--- Sorted lines: ---"
  for line in insertionSort lines do
    IO.println line

  IO.println ""
  IO.println "--- Original data: ---"
  for line in lines do
    IO.println line
```

实际的 {anchorName main (module:=Examples.ProgramsProofs.InstrumentedInsertionSort)}`main` 根据提供的命令行参数选择两个主操作之一：
```anchor main (module := Examples.ProgramsProofs.InstrumentedInsertionSort)
def main (args : List String) : IO UInt32 := do
  match args with
  | ["--shared"] => mainShared; pure 0
  | ["--unique"] => mainUnique; pure 0
  | _ =>
    IO.println "Expected single argument, either \"--shared\" or \"--unique\""
    pure 1
```

不带参数运行会产生预期的用法信息：
```commands «sort-sharing» "sort-demo"
$ expect -f ./run-usage # sort
Expected single argument, either "--shared" or "--unique"
```

文件 {lit}`test-data` 包含以下岩石：
```file «sort-sharing» "sort-demo/test-data"
schist
feldspar
diorite
pumice
obsidian
shale
gneiss
marble
flint
```

对这些岩石使用插桩版插入排序，会按字母顺序打印它们：
```commands «sort-sharing» "sort-demo"
$ sort --unique < test-data
diorite
feldspar
flint
gneiss
marble
obsidian
pumice
schist
shale
```

然而，保留对原始数组引用的版本会在 {lit}`stderr` 上产生通知（即 {lit}`shared RC array to swap`），来自第一次调用 {anchorName names}`Array.swap`：
```commands «sort-sharing» "sort-demo"
$ sort --shared < test-data
--- Sorted lines: ---
diorite
feldspar
flint
gneiss
marble
obsidian
pumice
schist
shale

--- Original data: ---
schist
feldspar
diorite
pumice
obsidian
shale
gneiss
marble
flint
shared RC array to swap
```
只出现一条 {lit}`shared RC` 通知，意味着数组只被复制一次。
这是因为 {anchorName names}`Array.swap` 调用导致的副本本身引用唯一，因此无需进一步复制。
在命令式语言中，忘记在按引用传递数组前显式复制，可能导致微妙的 bug。
运行 {lit}`sort --shared` 时，数组会按需复制以保留 Lean 程序的纯函数式语义，但不会多复制。


# 其他原地修改的机会
%%%
tag := none
%%%

当引用唯一时用修改代替复制，并不仅限于数组更新运算符。
Lean 还会尝试“回收”引用计数即将降为零的构造子，复用它们而不是分配新数据。
这意味着，例如，{anchorName names}`List.map` 会原地修改链表——至少在没人可能察觉的情况下如此。
优化 Lean 代码中热点循环最重要的步骤之一，是确保被修改的数据没有从多个位置被引用。

# 练习
%%%
tag := "insertion-sort-exercises"
%%%


 * 编写一个反转数组的函数。测试：若输入数组的引用计数为一，则你的函数不会分配新数组。

 * 为数组实现归并排序或快速排序。证明你的实现会终止，并测试它不会分配比预期更多的数组。这是一道有挑战性的练习！