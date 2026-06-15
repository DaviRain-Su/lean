# 插章：策略、归纳与证明

# 关于证明与用户界面的一点说明

本书将写证明的过程呈现为：一次性写好证明提交给 Lean，Lean 再回复错误信息，说明还有什么待完成。
与 Lean 实际交互的过程要愉快得多。
Lean 会在光标移动时提供证明相关信息，还有许多交互特性让证明更容易。
请参阅你所用 Lean 开发环境的文档以了解更多。

本书采用逐步构建证明并展示由此产生的信息的方式，是为了演示写证明时 Lean 提供的交互式反馈类型——尽管这比专家实际使用的流程慢得多。
同时，看到不完整的证明逐步走向完整，对理解证明也很有帮助。
随着写证明技能的提高，Lean 的反馈会越来越不像错误，而更像对你自己思维过程的支持。
学习这种交互式方法非常重要。

# 递归与归纳

前一章中的函数 {anchorName plusR_succ_left (module := Examples.DependentTypes.Pitfalls)}`plusR_succ_left` 和 {anchorName plusR_zero_left_thm (module:=Examples.DependentTypes.Pitfalls)}`plusR_zero_left` 可以从两个角度理解。
一方面，它们是递归函数，为命题构建证据，就像其他递归函数可能构造列表、字符串或任何其他数据结构一样。
另一方面，它们也对应于**数学归纳（mathematical induction）**证明。

数学归纳是一种证明技术：通过两个步骤证明陈述对_所有_自然数成立：
 1. 证明陈述对 $`0` 成立。这称为**基础情况（base case）**。
 2. 在假设陈述对某个任意选取的数 $`n` 成立的前提下，证明它对 $`n + 1` 成立。这称为**归纳步骤（induction step）**。假设陈述对 $`n` 成立称为**归纳假设（induction hypothesis）**。

因为不可能对_每一个_自然数都进行检查，归纳提供了一种写证明的方式，原则上可以展开为针对任意具体自然数的证明。
例如，若想要针对数字 3 的具体证明，可以先使用基础情况，再使用归纳步骤三次，从而证明陈述对 0、1、2，最终 3 成立。
因此，它证明陈述对所有自然数成立。

# 归纳策略

将归纳证明写成使用 {anchorName plusR_zero_left_done (module:=Examples.DependentTypes.Pitfalls)}`congrArg` 等辅助函数的递归函数，并不总能很好地表达证明背后的意图。
虽然递归函数确实具有归纳的结构，但它们或许更应被视为证明的一种**编码**。
此外，Lean 的策略系统提供了许多在显式写递归函数时无法利用的自动化证明构造机会。
Lean 提供归纳**策略（tactic）**，可以在单个策略块中完成整个归纳证明。
在幕后，Lean 构造与使用归纳相对应的递归函数。

要用 {kw}`induction` 策略证明 {anchorName plusR_zero_left_done (module:=Examples.DependentTypes.Pitfalls)}`plusR_zero_left`，先写出其签名（使用 {kw}`theorem`，因为这确实是证明）。
然后，用 {anchorTerm plusR_ind_zero_left_1}`by induction k` 作为定义体：
```anchor plusR_ind_zero_left_1
theorem plusR_zero_left (k : Nat) : k = Nat.plusR 0 k := by
  induction k
```
由此产生的消息表明有两个目标：
```anchorError plusR_ind_zero_left_1
unsolved goals
case zero
⊢ 0 = Nat.plusR 0 0

case succ
n✝ : Nat
a✝ : n✝ = Nat.plusR 0 n✝
⊢ n✝ + 1 = Nat.plusR 0 (n✝ + 1)
```
策略块是在 Lean 类型检查器处理文件时运行的程序，有点像功能强大得多的 C 预处理器宏。
策略生成实际的程序。

在策略语言中，可以存在多个目标。
每个目标由类型和一些假设组成。
这类似于用下划线作占位符——目标中的类型代表要证明的内容，假设代表在作用域内可用的内容。
对于目标 {lit}`case zero`，没有假设，类型是 {anchorTerm others}`Nat.zero = Nat.plusR 0 Nat.zero`——这是将 {anchorTerm others}`0` 代入 {anchorName plusR_ind_zero_left_1}`k` 后的定理陈述。
在目标 {lit}`case succ` 中，有两个名为 {lit}`n✝` 和 {lit}`n_ih✝` 的假设。
在幕后，{anchorTerm plusR_ind_zero_left_1}`induction` 策略创建依赖模式匹配以细化整体类型，{lit}`n✝` 表示模式中 {anchorName others}`Nat.succ` 的参数。
假设 {lit}`n_ih✝` 表示对 {lit}`n✝` 递归调用所生成函数的结果。
其类型是定理的整体类型，只是用 {lit}`n✝` 代替了 {anchorName plusR_ind_zero_left_1}`k`。
作为目标 {lit}`case succ` 一部分需要满足的类型，是整体定理陈述，用 {lit}`Nat.succ n✝` 代替了 {anchorName plusR_ind_zero_left_1}`k`。

使用 {anchorTerm plusR_ind_zero_left_1}`induction` 策略产生的两个目标，对应于数学归纳描述中的基础情况和归纳步骤。
基础情况是 {lit}`case zero`。
在 {lit}`case succ` 中，{lit}`n_ih✝` 对应归纳假设，而整个 {lit}`case succ` 是归纳步骤。

写证明的下一步是依次关注这两个目标。
正如在 {kw}`do` 块中可以用 {anchorTerm others}`pure ()` 表示"什么都不做"，策略语言有语句 {kw}`skip`，同样什么都不做。
当 Lean 语法要求必须有策略，但还不清楚该用哪一个时，可以使用它。
在 {kw}`induction` 语句末尾加上 {kw}`with`，提供类似模式匹配的语法：
```anchor plusR_ind_zero_left_2a
theorem plusR_zero_left (k : Nat) : k = Nat.plusR 0 k := by
  induction k with
  | zero => skip
  | succ n ih => skip
```
两个 {kw}`skip` 语句各有一条关联消息。
第一个显示基础情况：
```anchorError plusR_ind_zero_left_2a
unsolved goals
case zero
⊢ 0 = Nat.plusR 0 0
```
第二个显示归纳步骤：
```anchorError plusR_ind_zero_left_2b
unsolved goals
case succ
n : Nat
ih : n = Nat.plusR 0 n
⊢ n + 1 = Nat.plusR 0 (n + 1)
```
在归纳步骤中，带剑号（†）的不可访问名称已被 {lit}`succ` 后提供的名称取代，即 {anchorName plusR_ind_zero_left_2a}`n` 和 {anchorName plusR_ind_zero_left_2a}`ih`。

{kw}`induction`{lit}` ...`{kw}`with` 之后的分支不是模式：它们由目标名称后跟零个或多个名称组成。
这些名称用于目标引入的假设；提供的名称多于目标引入的数量会报错：
```anchor plusR_ind_zero_left_3
theorem plusR_zero_left (k : Nat) : k = Nat.plusR 0 k := by
  induction k with
  | zero => skip
  | succ n ih lots of names => skip
```
```anchorError plusR_ind_zero_left_3
Too many variable names provided at alternative `succ`: 5 provided, but 2 expected
```

关注基础情况时，{kw}`rfl` 策略在 {kw}`induction` 策略内部与在递归函数中一样好用：
```anchor plusR_ind_zero_left_4
theorem plusR_zero_left (k : Nat) : k = Nat.plusR 0 k := by
  induction k with
  | zero => rfl
  | succ n ih => skip
```
在递归函数版本的证明中，类型注解使期望类型更容易理解。
在策略语言中，有多种特定方式可以变换目标，使其更容易求解。
{kw}`unfold` 策略用定义替换已定义的名称：
```anchor plusR_ind_zero_left_5
theorem plusR_zero_left (k : Nat) : k = Nat.plusR 0 k := by
  induction k with
  | zero => rfl
  | succ n ih =>
    unfold Nat.plusR
```
现在，目标等式右侧变成了 {anchorTerm others}`Nat.plusR 0 n + 1`，而不是 {anchorTerm others}`Nat.plusR 0 (Nat.succ n)`：
```anchorError plusR_ind_zero_left_5
unsolved goals
case succ
n : Nat
ih : n = Nat.plusR 0 n
⊢ n + 1 = Nat.plusR 0 n + 1
```

不必诉诸 {anchorName plusR_succ_left (module:=Examples.DependentTypes.Pitfalls)}`congrArg` 等函数和 {anchorTerm appendR (module:=Examples.DependentTypes.Pitfalls)}`▸` 等运算符，也有策略允许用相等性证明来变换证明目标。
其中最重要的是 {kw}`rw`，它接受相等性证明列表，并在目标中用右侧替换左侧。
这在 {anchorName plusR_ind_zero_left_6}`plusR_zero_left` 中几乎就能奏效：
```anchor plusR_ind_zero_left_6
theorem plusR_zero_left (k : Nat) : k = Nat.plusR 0 k := by
  induction k with
  | zero => rfl
  | succ n ih =>
    unfold Nat.plusR
    rw [ih]
```
然而，重写的方向不正确。
用 {anchorTerm others}`Nat.plusR 0 n` 替换 {anchorName others}`n` 使目标更复杂，而不是更简单：
```anchorError plusR_ind_zero_left_6
unsolved goals
case succ
n : Nat
ih : n = Nat.plusR 0 n
⊢ Nat.plusR 0 n + 1 = Nat.plusR 0 (Nat.plusR 0 n) + 1
```
可以在调用 {kw}`rw` 时在 {anchorName plusR_zero_left_done}`ih` 前加左箭头，指示用等式左侧替换右侧：

```anchor plusR_zero_left_done
theorem plusR_zero_left (k : Nat) : k = Nat.plusR 0 k := by
  induction k with
  | zero => rfl
  | succ n ih =>
    unfold Nat.plusR
    rw [←ih]
```
这次重写使等式两边相同，Lean 会自动处理 {kw}`rfl`。
证明完成。

# 策略高尔夫

到目前为止，策略语言尚未展现其真正价值。
上述证明并不比递归函数更短；只是用领域特定语言而非完整 Lean 语言书写。
但用策略写的证明可以更短、更容易、更易维护。
就像高尔夫游戏中分数越低越好，策略高尔夫游戏中证明越短越好。

{anchorName plusR_zero_left_golf_1}`plusR_zero_left` 的归纳步骤可以用简化策略 {tactic}`simp` 证明。
单独使用 {tactic}`simp` 没有帮助：
```anchor plusR_zero_left_golf_1
theorem plusR_zero_left (k : Nat) : k = Nat.plusR 0 k := by
  induction k with
  | zero => rfl
  | succ n ih =>
    simp
```
```anchorError plusR_zero_left_golf_1
`simp` made no progress
```
然而，{tactic}`simp` 可以配置为使用一组定义。
与 {kw}`rw` 一样，这些参数以列表形式提供。
让 {tactic}`simp` 考虑 {anchorName plusR_zero_left_golf_1}`Nat.plusR` 的定义，会得到更简单的目标：
```anchor plusR_zero_left_golf_2
theorem plusR_zero_left (k : Nat) : k = Nat.plusR 0 k := by
  induction k with
  | zero => rfl
  | succ n ih =>
    simp [Nat.plusR]
```
```anchorError plusR_zero_left_golf_2
unsolved goals
case succ
n : Nat
ih : n = Nat.plusR 0 n
⊢ n = Nat.plusR 0 n
```
特别地，目标现在与归纳假设相同。
除了自动证明简单相等性陈述外，简化器还会自动将像 {anchorTerm others}`Nat.succ A = Nat.succ B` 这样的目标替换为 {anchorTerm others}`A = B`。
因为归纳假设 {anchorName plusR_zero_left_golf_3}`ih` 的类型恰好正确，{kw}`exact` 策略可以指明应使用它：

```anchor plusR_zero_left_golf_3
theorem plusR_zero_left (k : Nat) : k = Nat.plusR 0 k := by
  induction k with
  | zero => rfl
  | succ n ih =>
    simp [Nat.plusR]
    exact ih
```

然而，使用 {kw}`exact` 有些脆弱。
重命名归纳假设（在"打高尔夫"缩短证明时可能发生）会使此证明失效。
{kw}`assumption` 策略在当前目标与_任意_假设匹配时求解：

```anchor plusR_zero_left_golf_4
theorem plusR_zero_left (k : Nat) : k = Nat.plusR 0 k := by
  induction k with
  | zero => rfl
  | succ n ih =>
    simp [Nat.plusR]
    assumption
```

这个证明不比先前使用展开和显式重写的版本更短。
然而，一系列变换可以使其更短，利用 {tactic}`simp` 能求解多种目标的事实。
第一步是去掉 {kw}`induction` 末尾的 {kw}`with`。
对于结构清晰、易读的证明，{kw}`with` 语法很方便。
若有分支缺失会报错，并清晰展示归纳结构。
但缩短证明往往需要更宽松的做法。

不使用 {kw}`with` 的 {kw}`induction` 只会产生有两个目标的证明状态。
{kw}`case` 策略可以选择其中一个，就像在 {kw}`induction`{lit}` ...`{kw}`with` 的分支中一样。
换句话说，以下证明与先前证明等价：

```anchor plusR_zero_left_golf_5
theorem plusR_zero_left (k : Nat) : k = Nat.plusR 0 k := by
  induction k
  case zero => rfl
  case succ n ih =>
    simp [Nat.plusR]
    assumption
```

在单一目标（即 {anchorTerm plusR_zero_left_golf_6a}`k = Nat.plusR 0 k`）的上下文中，{anchorTerm plusR_zero_left_golf_5}`induction k` 策略产生两个目标。
一般而言，策略要么失败并报错，要么接受一个目标并将其变换为零个或多个新目标。
每个新目标代表尚待证明的内容。
若结果是零个目标，则策略成功，该部分证明完成。

{kw}`<;>` 运算符接受两个策略作为参数，产生新策略。
{lit}`T1 `{kw}`<;>`{lit}` T2` 将 {lit}`T1` 应用于当前目标，然后将 {lit}`T2` 应用于 {lit}`T1` 创建的_所有_目标。
换句话说，{kw}`<;>` 使通用策略能一次性用于多个新目标。
{tactic}`simp` 就是这样一种通用策略。

因为 {tactic}`simp` 既能完成基础情况的证明，又能在归纳步骤上取得进展，将它与 {kw}`induction` 和 {kw}`<;>` 结合可以缩短证明：
```anchor plusR_zero_left_golf_6a
theorem plusR_zero_left (k : Nat) : k = Nat.plusR 0 k := by
  induction k <;> simp [Nat.plusR]
```
这只剩一个目标，即变换后的归纳步骤：
```anchorError plusR_zero_left_golf_6a
unsolved goals
case succ
n✝ : Nat
a✝ : n✝ = Nat.plusR 0 n✝
⊢ n✝ = Nat.plusR 0 n✝
```
在此目标上运行 {kw}`assumption` 完成证明：

```anchor plusR_zero_left_golf_6
theorem plusR_zero_left (k : Nat) : k = Nat.plusR 0 k := by
  induction k <;> simp [Nat.plusR] <;> assumption
```
这里不能使用 {kw}`exact`，因为 {lit}`ih` 从未被显式命名。

对初学者来说，这个证明并不更易读。
然而，专家用户的常见模式是用 {tactic}`simp` 等强大策略处理大量简单情况，从而将证明文字集中在有趣的情形上。
此外，这些证明在面对所涉函数和数据类型的小幅变动时往往更稳健。
策略高尔夫是培养写证明的良好品味和风格的有用部分。

# 对其他数据类型的归纳

数学归纳通过对 {anchorName others}`Nat.zero` 提供基础情况、对 {anchorName others}`Nat.succ` 提供归纳步骤，证明自然数上的陈述。
归纳原理对其他数据类型同样有效。
没有递归参数的构造子是基础情况，有递归参数的构造子是归纳步骤。
能够进行归纳证明，正是它们被称为**归纳（inductive）**数据类型的原因。

二元树上的归纳就是一个例子。
对二元树的归纳是一种证明技术：通过两个步骤证明陈述对_所有_二元树成立：
 1. 证明陈述对 {anchorName TreeCtors}`BinTree.leaf` 成立。这是基础情况。
 2. 在假设陈述对某个任意选取的树 {anchorName TreeCtors}`l` 和 {anchorName TreeCtors}`r` 成立的前提下，证明它对 {anchorTerm TreeCtors}`BinTree.branch l x r` 成立，其中 {anchorName TreeCtors}`x` 是任意选取的新数据点。这是**归纳步骤**。假设陈述对 {anchorName TreeCtors}`l` 和 {anchorName TreeCtors}`r` 成立称为**归纳假设**。

{anchorName BinTree_count}`BinTree.count` 计算树中分支的数量：

```anchor BinTree_count
def BinTree.count : BinTree α → Nat
  | .leaf => 0
  | .branch l _ r =>
    1 + l.count + r.count
```
{ref "leading-dot-notation"}[镜像一棵树]不会改变其中的分支数。
这可以用对树的归纳来证明。
第一步是陈述定理并调用 {kw}`induction`：
```anchor mirror_count_0a
theorem BinTree.mirror_count (t : BinTree α) :
    t.mirror.count = t.count := by
  induction t with
  | leaf => skip
  | branch l x r ihl ihr => skip
```
基础情况说明：对叶子镜像后计数，与直接对叶子计数相同：
```anchorError mirror_count_0a
unsolved goals
case leaf
α : Type
⊢ leaf.mirror.count = leaf.count
```
归纳步骤允许假设：镜像左右子树不会影响它们的分支计数，并要求证明：用这些子树构成分支后镜像，也保持整体分支计数不变：
```anchorError mirror_count_0b
unsolved goals
case branch
α : Type
l : BinTree α
x : α
r : BinTree α
ihl : l.mirror.count = l.count
ihr : r.mirror.count = r.count
⊢ (l.branch x r).mirror.count = (l.branch x r).count
```


基础情况成立，因为对 {anchorName mirror_count_1}`leaf` 镜像得到 {anchorName mirror_count_1}`leaf`，所以左右两边按定义相等。
可以用 {tactic}`simp` 并指示展开 {anchorName mirror_count_1}`BinTree.mirror` 来表达：
```anchor mirror_count_1
theorem BinTree.mirror_count (t : BinTree α) :
    t.mirror.count = t.count := by
  induction t with
  | leaf => simp [BinTree.mirror]
  | branch l x r ihl ihr => skip
```
在归纳步骤中，目标中没有内容与归纳假设直接匹配。
使用 {anchorName mirror_count_2}`BinTree.count` 和 {anchorName mirror_count_2}`BinTree.mirror` 的定义简化后，关系显现出来：
```anchor mirror_count_2
theorem BinTree.mirror_count (t : BinTree α) :
    t.mirror.count = t.count := by
  induction t with
  | leaf => simp [BinTree.mirror]
  | branch l x r ihl ihr =>
    simp [BinTree.mirror, BinTree.count]
```
```anchorError mirror_count_2
unsolved goals
case branch
α : Type
l : BinTree α
x : α
r : BinTree α
ihl : l.mirror.count = l.count
ihr : r.mirror.count = r.count
⊢ 1 + r.mirror.count + l.mirror.count = 1 + l.count + r.count
```
两个归纳假设都可用来将目标左侧重写为几乎与右侧相同的形式：
```anchor mirror_count_3
theorem BinTree.mirror_count (t : BinTree α) :
    t.mirror.count = t.count := by
  induction t with
  | leaf => simp [BinTree.mirror]
  | branch l x r ihl ihr =>
    simp [BinTree.mirror, BinTree.count]
    rw [ihl, ihr]
```
```anchorError mirror_count_3
unsolved goals
case branch
α : Type
l : BinTree α
x : α
r : BinTree α
ihl : l.mirror.count = l.count
ihr : r.mirror.count = r.count
⊢ 1 + r.count + l.count = 1 + l.count + r.count
```

传入 {anchorTerm mirror_count_4}`+arith` 选项时，{tactic}`simp` 策略可以使用额外的算术恒等式。
这足以证明该目标，得到：

```anchor mirror_count_4
theorem BinTree.mirror_count (t : BinTree α) :
    t.mirror.count = t.count := by
  induction t with
  | leaf => simp [BinTree.mirror]
  | branch l x r ihl ihr =>
    simp [BinTree.mirror, BinTree.count]
    rw [ihl, ihr]
    simp +arith
```

除了要展开的定义，简化器还可以接受相等性证明的名称，在简化证明目标时用作重写。
{anchorName mirror_count_5}`BinTree.mirror_count` 也可以写成：

```anchor mirror_count_5
theorem BinTree.mirror_count (t : BinTree α) :
    t.mirror.count = t.count := by
  induction t with
  | leaf => simp [BinTree.mirror]
  | branch l x r ihl ihr =>
    simp +arith [BinTree.mirror, BinTree.count, ihl, ihr]
```
随着证明变得更复杂，手动列出假设会变得繁琐。
手动写假设名称也使在多个子目标间复用证明步骤更困难。
传给 {tactic}`simp` 或 {kw}`simp +arith` 的参数 {lit}`*` 指示它们在简化或求解目标时使用_所有_假设。
换句话说，证明也可以写成：

```anchor mirror_count_6
theorem BinTree.mirror_count (t : BinTree α) :
    t.mirror.count = t.count := by
  induction t with
  | leaf => simp [BinTree.mirror]
  | branch l x r ihl ihr =>
    simp +arith [BinTree.mirror, BinTree.count, *]
```
因为两个分支都使用简化器，证明可以缩减为：

```anchor mirror_count_7
theorem BinTree.mirror_count (t : BinTree α) :
    t.mirror.count = t.count := by
  induction t <;> simp +arith [BinTree.mirror, BinTree.count, *]
```

# {lit}`grind` 策略

{tactic}`grind` 策略可以自动证明许多定理。
与 {tactic}`simp` 类似，它接受要考虑的额外事实或要展开的函数的可选列表；与 {tactic}`simp` 不同，它自动考虑局部假设。
此外，{tactic}`grind` 对特定数学领域的推理支持远强于 {tactic}`simp` 的算术支持。
{anchorName mirror_count_8}`BinTree.mirror_count` 的证明可以改写为使用 {tactic}`grind`：
```anchor mirror_count_8
theorem BinTree.mirror_count (t : BinTree α) :
    t.mirror.count = t.count := by
  induction t <;> grind [BinTree.mirror, BinTree.count]
```

因为本书中的证明相当简单，大多数没有给 {tactic}`grind` 展现全部威力的机会。
然而，在本书后面的一些证明中它非常方便。

# 练习

 * 使用 {kw}`induction`{lit}` ...`{kw}`with` 策略证明 {anchorName plusR_succ_left (module:=Examples.DependentTypes.Pitfalls)}`plusR_succ_left`。
 * 将 {anchorName plusR_succ_left (module:=Examples.DependentTypes.Pitfalls)}`plusR_succ_left` 的证明改写为在单行中使用 {kw}`<;>`。
 * 使用对列表的归纳证明列表拼接满足结合律：
   ```anchorTerm ex
   theorem List.append_assoc (xs ys zs : List α) :
       xs ++ (ys ++ zs) = (xs ++ ys) ++ zs
   ```