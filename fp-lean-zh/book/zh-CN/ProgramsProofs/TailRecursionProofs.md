# 尾递归证明

%%%
tag := "proving-tail-rec-equiv"
%%%

改写为使用尾递归和累加器的程序，在外观上可能与原始程序大不相同。
原始递归函数通常更容易理解，但运行时存在耗尽栈的风险。
在示例上对两个版本的程序进行测试以排除简单 bug 之后，可以用证明一劳永逸地表明两个程序是等价的。

# 证明 {lit}`sum` 相等
%%%
tag := "proving-sum-equal"
%%%

要证明两个版本的 {lit}`sum` 相等，先写下带占位证明的定理陈述：
```anchor sumEq0
theorem non_tail_sum_eq_tail_sum : NonTail.sum = Tail.sum := by
  skip
```
如预期，Lean 报告一个未解决的目标：
```anchorError sumEq0
unsolved goals
⊢ NonTail.sum = Tail.sum
```

此处无法应用 {kw}`rfl` 策略，因为 {anchorName sumEq0}`NonTail.sum` 与 {anchorName sumEq0}`Tail.sum` 并非定义相等。
不过，函数相等的含义不止于定义相等。
也可以通过对同一输入产生相等输出来证明两个函数相等。
换言之，可以通过证明对所有可能的输入 $`x` 都有 $`f(x) = g(x)` 来证明 $`f = g`。
这一原理称为_函数外延性_。
函数外延性正是 {anchorName sumEq0}`NonTail.sum` 等于 {anchorName sumEq0}`Tail.sum` 的原因：它们都对数字列表求和。

在 Lean 的策略语言中，函数外延性通过 {anchorTerm sumEq1}`funext` 调用，其后跟一个用作任意参数的名称。
该任意参数会作为假设加入上下文，目标则变为要求证明将函数应用于该参数后的结果相等：
```anchor sumEq1
theorem non_tail_sum_eq_tail_sum : NonTail.sum = Tail.sum := by
  funext xs
```
```anchorError sumEq1
unsolved goals
case h
xs : List Nat
⊢ NonTail.sum xs = Tail.sum xs
```

该目标可通过对参数 {anchorName sumEq1}`xs` 进行归纳来证明。
两个 {lit}`sum` 函数应用于空列表时都返回 {anchorTerm TailSum}`0`，这构成基础情形。
在输入列表开头添加一个数会使两个函数都将该数加到结果上，这构成归纳步骤。
调用 {anchorTerm sumEq2a}`induction` 策略会产生两个目标：
```anchor sumEq2a
theorem non_tail_sum_eq_tail_sum : NonTail.sum = Tail.sum := by
  funext xs
  induction xs with
  | nil => skip
  | cons y ys ih => skip
```
```anchorError sumEq2a
unsolved goals
case h.nil
⊢ NonTail.sum [] = Tail.sum []
```
```anchorError sumEq2b
unsolved goals
case h.cons
y : Nat
ys : List Nat
ih : NonTail.sum ys = Tail.sum ys
⊢ NonTail.sum (y :: ys) = Tail.sum (y :: ys)
```

{anchorName sumEq3}`nil` 的基础情形可用 {anchorTerm sumEq3}`rfl` 解决，因为两个函数在传入空列表时都返回 {anchorTerm TailSum}`0`：
```anchor sumEq3
theorem non_tail_sum_eq_tail_sum : NonTail.sum = Tail.sum := by
  funext xs
  induction xs with
  | nil => rfl
  | cons y ys ih => skip
```

解决归纳步骤的第一步是简化目标，让 {anchorTerm sumEq4}`simp` 展开 {anchorName sumEq4}`NonTail.sum` 和 {anchorName sumEq4}`Tail.sum`：
```anchor sumEq4
theorem non_tail_sum_eq_tail_sum : NonTail.sum = Tail.sum := by
  funext xs
  induction xs with
  | nil => rfl
  | cons y ys ih =>
    simp [NonTail.sum, Tail.sum]
```
```anchorError sumEq4
unsolved goals
case h.cons
y : Nat
ys : List Nat
ih : NonTail.sum ys = Tail.sum ys
⊢ y + NonTail.sum ys = Tail.sumHelper 0 (y :: ys)
```
展开 {anchorName sumEq5}`Tail.sum` 表明它立即委托给 {anchorName sumEq5}`Tail.sumHelper`，后者也应被简化：
```anchor sumEq5
theorem non_tail_sum_eq_tail_sum : NonTail.sum = Tail.sum := by
  funext xs
  induction xs with
  | nil => rfl
  | cons y ys ih =>
    simp [NonTail.sum, Tail.sum, Tail.sumHelper]
```
在得到的目标中，{anchorName TailSum}`sumHelper` 已执行一步计算，并将 {anchorName sumEq5}`y` 加到累加器上：
```anchorError sumEq5
unsolved goals
case h.cons
y : Nat
ys : List Nat
ih : NonTail.sum ys = Tail.sum ys
⊢ y + NonTail.sum ys = Tail.sumHelper y ys
```
用归纳假设重写可从目标中移除所有对 {anchorName sumEq6}`NonTail.sum` 的提及：
```anchor sumEq6
theorem non_tail_sum_eq_tail_sum : NonTail.sum = Tail.sum := by
  funext xs
  induction xs with
  | nil => rfl
  | cons y ys ih =>
    simp [NonTail.sum, Tail.sum, Tail.sumHelper]
    rw [ih]
```
```anchorError sumEq6
unsolved goals
case h.cons
y : Nat
ys : List Nat
ih : NonTail.sum ys = Tail.sum ys
⊢ y + Tail.sum ys = Tail.sumHelper y ys
```
这个新目标表明，将某个数加到列表之和上，等同于在 {anchorName TailSum}`sumHelper` 中以该数作为初始累加器。
为清晰起见，可将该新目标作为单独定理来证明：
```anchor sumEqHelperBad0
theorem helper_add_sum_accum (xs : List Nat) (n : Nat) :
    n + Tail.sum xs = Tail.sumHelper n xs := by
  skip
```
```anchorError sumEqHelperBad0
unsolved goals
xs : List Nat
n : Nat
⊢ n + Tail.sum xs = Tail.sumHelper n xs
```
这再次是一个归纳证明，其中基础情形使用 {anchorTerm sumEqHelperBad1}`rfl`：
```anchor sumEqHelperBad1
theorem helper_add_sum_accum (xs : List Nat) (n : Nat) :
    n + Tail.sum xs = Tail.sumHelper n xs := by
  induction xs with
  | nil => rfl
  | cons y ys ih => skip
```
```anchorError sumEqHelperBad1
unsolved goals
case cons
n y : Nat
ys : List Nat
ih : n + Tail.sum ys = Tail.sumHelper n ys
⊢ n + Tail.sum (y :: ys) = Tail.sumHelper n (y :: ys)
```
因为这是归纳步骤，应简化目标直至与归纳假设 {anchorName sumEqHelperBad2}`ih` 匹配。
使用 {anchorName sumEqHelperBad2}`Tail.sum` 和 {anchorName sumEqHelperBad2}`Tail.sumHelper` 的定义进行简化，得到：
```anchor sumEqHelperBad2
theorem helper_add_sum_accum (xs : List Nat) (n : Nat) :
    n + Tail.sum xs = Tail.sumHelper n xs := by
  induction xs with
  | nil => rfl
  | cons y ys ih =>
    simp [Tail.sum, Tail.sumHelper]
```
```anchorError sumEqHelperBad2
unsolved goals
case cons
n y : Nat
ys : List Nat
ih : n + Tail.sum ys = Tail.sumHelper n ys
⊢ n + Tail.sumHelper y ys = Tail.sumHelper (y + n) ys
```
理想情况下，归纳假设可用于替换 {lit}`Tail.sumHelper (y + n) ys`，但它们并不匹配。
归纳假设可用于 {lit}`Tail.sumHelper n ys`，而不能用于 {lit}`Tail.sumHelper (y + n) ys`。
换言之，这个证明卡住了。

# 第二次尝试
%%%
tag := "proving-sum-equal-again"
%%%

与其硬着头皮继续证明，不如退一步思考。
为什么尾递归版本的函数与非尾递归版本相等？
从根本上说，在列表的每个条目处，累加器增长的数量与递归结果上本应增加的数量相同。
这一洞见可用于写出优雅的证明。
关键在于，归纳证明的设置方式必须使归纳假设能应用于_任意_累加器值。

放弃先前的尝试，可将这一洞见编码为如下陈述：
```anchor nonTailEqHelper0
theorem non_tail_sum_eq_helper_accum (xs : List Nat) :
    (n : Nat) → n + NonTail.sum xs = Tail.sumHelper n xs := by
  skip
```
在此陈述中，{anchorName nonTailEqHelper0}`n` 位于冒号之后的类型中，这一点非常重要。
得到的目标以 {lit}`∀ (n : Nat)` 开头，它是“对所有 {lit}`n`”的缩写：
```anchorError nonTailEqHelper0
unsolved goals
xs : List Nat
⊢ ∀ (n : Nat), n + NonTail.sum xs = Tail.sumHelper n xs
```
使用归纳策略得到的目标包含这一“对所有”陈述：
```anchor nonTailEqHelper1a
theorem non_tail_sum_eq_helper_accum (xs : List Nat) :
    (n : Nat) → n + NonTail.sum xs = Tail.sumHelper n xs := by
  induction xs with
  | nil => skip
  | cons y ys ih => skip
```
在 {anchorName nonTailEqHelper1a}`nil` 情形中，目标是：
```anchorError nonTailEqHelper1a
unsolved goals
case nil
⊢ ∀ (n : Nat), n + NonTail.sum [] = Tail.sumHelper n []
```
对于 {anchorName nonTailEqHelper1a}`cons` 的归纳步骤，归纳假设与具体目标都包含“对所有 {lit}`n`”：
```anchorError nonTailEqHelper1b
unsolved goals
case cons
y : Nat
ys : List Nat
ih : ∀ (n : Nat), n + NonTail.sum ys = Tail.sumHelper n ys
⊢ ∀ (n : Nat), n + NonTail.sum (y :: ys) = Tail.sumHelper n (y :: ys)
```
换言之，目标变得更难证明，但归纳假设也相应更有用。

对以“对所有 $`x`”开头的数学陈述，应假设某个任意的 $`x`，然后证明该陈述。
“任意”意味着不假设 $`x` 的额外性质，因此得到的陈述对_任意_ $`x` 都成立。
在 Lean 中，“对所有”陈述是一种依赖函数：无论应用于哪个具体值，它都会返回该命题的证据。
类似地，选取任意 $`x` 的过程与使用 {lit}`fun x => ...` 相同。
在策略语言中，选取任意 $`x` 的过程通过 {kw}`intro` 策略完成；策略脚本结束时，它在幕后生成相应的函数。
{kw}`intro` 策略应提供用于该任意值的名称。

在 {anchorName nonTailEqHelper2}`nil` 情形中使用 {kw}`intro` 策略会从目标中移除 {lit}`∀ (n : Nat),`，并添加假设 {lit}`n : Nat`：
```anchor nonTailEqHelper2
theorem non_tail_sum_eq_helper_accum (xs : List Nat) :
    (n : Nat) → n + NonTail.sum xs = Tail.sumHelper n xs := by
  induction xs with
  | nil => intro n
  | cons y ys ih => skip
```
```anchorError nonTailEqHelper2
unsolved goals
case nil
n : Nat
⊢ n + NonTail.sum [] = Tail.sumHelper n []
```
该命题等式两边都定义相等于 {anchorName nonTailEqHelper3}`n`，因此 {anchorTerm nonTailEqHelper3}`rfl` 即可：
```anchor nonTailEqHelper3
theorem non_tail_sum_eq_helper_accum (xs : List Nat) :
    (n : Nat) → n + NonTail.sum xs = Tail.sumHelper n xs := by
  induction xs with
  | nil =>
    intro n
    rfl
  | cons y ys ih => skip
```
{anchorName nonTailEqHelper3}`cons` 目标也包含“对所有”：
```anchorError nonTailEqHelper3
unsolved goals
case cons
y : Nat
ys : List Nat
ih : ∀ (n : Nat), n + NonTail.sum ys = Tail.sumHelper n ys
⊢ ∀ (n : Nat), n + NonTail.sum (y :: ys) = Tail.sumHelper n (y :: ys)
```
这提示应使用 {kw}`intro`。
```anchor nonTailEqHelper4
theorem non_tail_sum_eq_helper_accum (xs : List Nat) :
    (n : Nat) → n + NonTail.sum xs = Tail.sumHelper n xs := by
  induction xs with
  | nil =>
    intro n
    rfl
  | cons y ys ih =>
    intro n
```
```anchorError nonTailEqHelper4
unsolved goals
case cons
y : Nat
ys : List Nat
ih : ∀ (n : Nat), n + NonTail.sum ys = Tail.sumHelper n ys
n : Nat
⊢ n + NonTail.sum (y :: ys) = Tail.sumHelper n (y :: ys)
```
证明目标现在同时包含将 {lit}`y :: ys` 应用于 {anchorName nonTailEqHelper5}`NonTail.sum` 和 {anchorName nonTailEqHelper5}`Tail.sumHelper`。
简化器可以使下一步更清晰：
```anchor nonTailEqHelper5
theorem non_tail_sum_eq_helper_accum (xs : List Nat) :
    (n : Nat) → n + NonTail.sum xs = Tail.sumHelper n xs := by
  induction xs with
  | nil =>
    intro n
    rfl
  | cons y ys ih =>
    intro n
    simp [NonTail.sum, Tail.sumHelper]
```
```anchorError nonTailEqHelper5
unsolved goals
case cons
y : Nat
ys : List Nat
ih : ∀ (n : Nat), n + NonTail.sum ys = Tail.sumHelper n ys
n : Nat
⊢ n + (y + NonTail.sum ys) = Tail.sumHelper (y + n) ys
```
该目标已非常接近归纳假设。
有两处不匹配：
 * 等式左边是 {lit}`n + (y + NonTail.sum ys)`，但归纳假设要求左边是某个数加到 {lit}`NonTail.sum ys` 上。
   换言之，应将该目标重写为 {lit}`(n + y) + NonTail.sum ys`，这成立是因为自然数加法满足结合律。
 * 当左边被重写为 {lit}`(y + n) + NonTail.sum ys` 时，右边的累加器参数应为 {lit}`n + y` 而非 {lit}`y + n` 才能匹配。
   该重写成立是因为加法也满足交换律。

加法的结合律与交换律已在 Lean 标准库中证明。
结合律的证明名为 {anchorTerm NatAddAssoc}`Nat.add_assoc`，其类型为 {anchorTerm NatAddAssoc}`(n m k : Nat) → (n + m) + k = n + (m + k)`；交换律的证明名为 {anchorTerm NatAddComm}`Nat.add_comm`，类型为 {anchorTerm NatAddComm}`(n m : Nat) → n + m = m + n`。
通常，{kw}`rw` 策略的参数是类型为等式的表达式。
不过，若参数是返回类型为等式的依赖函数，它会尝试为函数寻找参数，使该等式能匹配目标中的某处。
此处只有一次应用结合律的机会，但重写方向必须反转，因为 {anchorTerm NatAddAssoc}`(n + m) + k = n + (m + k)` 中等式的右边与证明目标匹配：
```anchor nonTailEqHelper6
theorem non_tail_sum_eq_helper_accum (xs : List Nat) :
    (n : Nat) → n + NonTail.sum xs = Tail.sumHelper n xs := by
  induction xs with
  | nil =>
    intro n
    rfl
  | cons y ys ih =>
    intro n
    simp [NonTail.sum, Tail.sumHelper]
    rw [←Nat.add_assoc]
```
```anchorError nonTailEqHelper6
unsolved goals
case cons
y : Nat
ys : List Nat
ih : ∀ (n : Nat), n + NonTail.sum ys = Tail.sumHelper n ys
n : Nat
⊢ n + y + NonTail.sum ys = Tail.sumHelper (y + n) ys
```
然而，直接用 {anchorTerm nonTailEqHelper7}`rw [Nat.add_comm]` 重写会得到错误结果。
{kw}`rw` 策略猜错了重写位置，导致出现非预期目标：
```anchor nonTailEqHelper7
theorem non_tail_sum_eq_helper_accum (xs : List Nat) :
    (n : Nat) → n + NonTail.sum xs = Tail.sumHelper n xs := by
  induction xs with
  | nil =>
    intro n
    rfl
  | cons y ys ih =>
    intro n
    simp [NonTail.sum, Tail.sumHelper]
    rw [←Nat.add_assoc]
    rw [Nat.add_comm]
```
```anchorError nonTailEqHelper7
unsolved goals
case cons
y : Nat
ys : List Nat
ih : ∀ (n : Nat), n + NonTail.sum ys = Tail.sumHelper n ys
n : Nat
⊢ NonTail.sum ys + (n + y) = Tail.sumHelper (y + n) ys
```
可通过显式将 {anchorName nonTailEqHelper8}`y` 和 {anchorName nonTailEqHelper8}`n` 作为参数传给 {anchorName nonTailEqHelper8}`Nat.add_comm` 来修复：
```anchor nonTailEqHelper8
theorem non_tail_sum_eq_helper_accum (xs : List Nat) :
    (n : Nat) → n + NonTail.sum xs = Tail.sumHelper n xs := by
  induction xs with
  | nil =>
    intro n
    rfl
  | cons y ys ih =>
    intro n
    simp [NonTail.sum, Tail.sumHelper]
    rw [←Nat.add_assoc]
    rw [Nat.add_comm y n]
```
```anchorError nonTailEqHelper8
unsolved goals
case cons
y : Nat
ys : List Nat
ih : ∀ (n : Nat), n + NonTail.sum ys = Tail.sumHelper n ys
n : Nat
⊢ n + y + NonTail.sum ys = Tail.sumHelper (n + y) ys
```
目标现在与归纳假设匹配。
特别地，归纳假设的类型是依赖函数类型。
将 {anchorName nonTailEqHelperDone}`ih` 应用于 {anchorTerm nonTailEqHelperDone}`n + y` 会得到恰好所需的类型。
若参数的类型的确与目标完全一致，{kw}`exact` 策略即可完成证明目标：

```anchor nonTailEqHelperDone
theorem non_tail_sum_eq_helper_accum (xs : List Nat) :
    (n : Nat) → n + NonTail.sum xs = Tail.sumHelper n xs := by
  induction xs with
  | nil => intro n; rfl
  | cons y ys ih =>
    intro n
    simp [NonTail.sum, Tail.sumHelper]
    rw [←Nat.add_assoc]
    rw [Nat.add_comm y n]
    exact ih (n + y)
```

实际证明只需少量额外工作，使目标与辅助定理的类型匹配。
第一步仍是调用函数外延性：
```anchor nonTailEqReal0
theorem non_tail_sum_eq_tail_sum : NonTail.sum = Tail.sum := by
  funext xs
```
```anchorError nonTailEqReal0
unsolved goals
case h
xs : List Nat
⊢ NonTail.sum xs = Tail.sum xs
```
下一步是展开 {anchorName nonTailEqReal1}`Tail.sum`，暴露 {anchorName TailSum}`Tail.sumHelper`：
```anchor nonTailEqReal1
theorem non_tail_sum_eq_tail_sum : NonTail.sum = Tail.sum := by
  funext xs
  simp [Tail.sum]
```
```anchorError nonTailEqReal1
unsolved goals
case h
xs : List Nat
⊢ NonTail.sum xs = Tail.sumHelper 0 xs
```
至此，类型几乎匹配。
不过，辅助定理在左边多出一个加数。
换言之，证明目标是 {lit}`NonTail.sum xs = Tail.sumHelper 0 xs`，而将 {anchorName nonTailEqHelper0}`non_tail_sum_eq_helper_accum` 应用于 {anchorName nonTailEqReal2}`xs` 和 {anchorTerm NatZeroAdd}`0` 得到的类型是 {lit}`0 + NonTail.sum xs = Tail.sumHelper 0 xs`。
标准库中的另一个证明 {anchorTerm NatZeroAdd}`Nat.zero_add` 的类型为 {anchorTerm NatZeroAdd}`(n : Nat) → 0 + n = n`。
将该函数应用于 {anchorTerm nonTailEqReal2}`NonTail.sum xs` 会得到类型为 {anchorTerm NatZeroAddApplied}`0 + NonTail.sum xs = NonTail.sum xs` 的表达式，因此从右向左重写可得到所需目标：
```anchor nonTailEqReal2
theorem non_tail_sum_eq_tail_sum : NonTail.sum = Tail.sum := by
  funext xs
  simp [Tail.sum]
  rw [←Nat.zero_add (NonTail.sum xs)]
```
```anchorError nonTailEqReal2
unsolved goals
case h
xs : List Nat
⊢ 0 + NonTail.sum xs = Tail.sumHelper 0 xs
```
最后，可用辅助定理完成证明：

```anchor nonTailEqRealDone
theorem non_tail_sum_eq_tail_sum : NonTail.sum = Tail.sum := by
  funext xs
  simp [Tail.sum]
  rw [←Nat.zero_add (NonTail.sum xs)]
  exact non_tail_sum_eq_helper_accum xs 0
```

该证明展示了一种通用模式，可用于证明带累加器的尾递归函数与非尾递归版本相等。
第一步是发现起始累加器参数与最终结果之间的关系。
例如，以累加器 {anchorName accum_stmt}`n` 开始 {anchorName TailSum}`Tail.sumHelper`，最终和会加上 {anchorName accum_stmt}`n`；以累加器 {anchorName accum_stmt}`ys` 开始 {anchorName accum_stmt}`Tail.reverseHelper`，最终反转的列表会前置到 {anchorName accum_stmt}`ys`。
第二步是将这一关系写成定理陈述，并通过归纳证明它。
实践中累加器总是用某个中性值初始化，例如 {anchorTerm TailSum}`0` 或 {anchorTerm accum_stmt}`[]`，但允许起始累加器为任意值的更一般陈述，才是获得足够强归纳假设所需要的。
最后，用该辅助定理配合实际的初始累加器值，即可得到所需证明。
例如，在 {anchorName nonTailEqRealDone}`non_tail_sum_eq_tail_sum` 中，累加器被指定为 {anchorTerm TailSum}`0`。
这可能需要重写目标，使中性的初始累加器值出现在正确位置。

# 函数归纳
%%%
tag := "fun-induction"
%%%

{anchorName nonTailEqRealDone}`non_tail_sum_eq_helper_accum` 的证明与 {anchorName TailSum}`Tail.sumHelper` 的实现紧密对应。
然而，实现与数学归纳所期望的结构并不完全吻合，因此必须仔细管理假设 {anchorName nonTailEqHelperDone}`n`。
对 {anchorName nonTailEqHelperDone}`non_tail_sum_eq_helper_accum` 而言这只是少量工作，但对于定义与 {tactic}`induction` 所期望结构相差更远的函数，证明需要更多簿记。

除了在参数之一上进行归纳来证明关于递归函数的定理之外，Lean 还支持对函数的递归调用结构进行归纳证明。
这种 {deftech}_函数归纳（functional induction）_ 为函数控制流中每个不包含递归调用的分支产生基础情形，为每个包含递归调用的分支产生归纳步骤。
函数归纳证明应表明定理在非递归分支上成立，并且若定理对每个递归调用的结果成立，则对递归分支的结果也成立。

:::paragraph
使用函数归纳可简化 {anchorName nonTailEqHelperFunInd1}`non_tail_sum_eq_helper_accum`：
```anchor nonTailEqHelperFunInd1
theorem non_tail_sum_eq_helper_accum (xs : List Nat) (n : Nat) :
    n + NonTail.sum xs = Tail.sumHelper n xs := by
  fun_induction Tail.sumHelper with
  | case1 n => skip
  | case2 n y ys ih => skip
```
证明的每个分支都与 {anchorName TailSum}`Tail.sumHelper` 的对应分支匹配：
```anchorTerm TailSum
def Tail.sumHelper (soFar : Nat) : List Nat → Nat
  | [] => soFar
  | x :: xs => sumHelper (x + soFar) xs
```
在第一个分支 {anchorTerm nonTailEqHelperFunInd1}`case1` 中，等式右边是累加器值，在证明中称为 {anchorName nonTailEqHelperFunInd1}`n`：
```anchorError nonTailEqHelperFunInd1
unsolved goals
case case1
n : Nat
⊢ n + NonTail.sum [] = n
```
在第二个分支 {anchorTerm nonTailEqHelperFunInd1}`case2` 中，等式右边是尾递归循环的下一步：
```anchorError nonTailEqHelperFunInd1
unsolved goals
case case2
n y : Nat
ys : List Nat
ih : y + n + NonTail.sum ys = Tail.sumHelper (y + n) ys
⊢ n + NonTail.sum (y :: ys) = Tail.sumHelper (y + n) ys
```
:::

:::paragraph
得到的证明可以更简单。
论证的基本原理，包括所使用的加法性质，是相同的；不过，簿记工作被移除了。
不再需要手动摆弄累加器值，归纳假设可以直接使用，而不必实例化：
```anchor nonTailEqHelperFunInd2
theorem non_tail_sum_eq_helper_accum (xs : List Nat) (n : Nat) :
    n + NonTail.sum xs = Tail.sumHelper n xs := by
  fun_induction Tail.sumHelper with
  | case1 n => simp [NonTail.sum]
  | case2 n y ys ih =>
    simp [NonTail.sum]
    rw [←Nat.add_assoc]
    rw [Nat.add_comm n y]
    assumption
```
:::

:::paragraph
{tactic}`grind` 策略非常适合这类目标。
与 {tactic}`simp` 和 {tactic}`rw` 不同，它不是有方向的；在内部，它会积累事实集合，直到完全证明目标或无法继续为止。
它预配置为使用关于算术的基本事实，例如加法的结合律与交换律，并自动使用局部假设（例如归纳假设）。
使用 {tactic}`grind`，该证明变得简短而切中要害：
```anchor nonTailEqHelperFunInd3
theorem non_tail_sum_eq_helper_accum (xs : List Nat) (n : Nat) :
    n + NonTail.sum xs = Tail.sumHelper n xs := by
  fun_induction Tail.sumHelper <;> grind [NonTail.sum]
```
该证明也与向熟练程序员解释证明的方式一致：“只需检查 {anchorName nonTailEqHelperFunInd3}`Tail.sumHelper` 的两个分支！”
:::

# 练习
%%%
tag := "tail-recursion-proof-exercises"
%%%

## 热身
%%%
tag := none
%%%

使用 {kw}`induction` 策略，为 {anchorName NatZeroAdd}`Nat.zero_add`、{anchorName NatAddAssoc}`Nat.add_assoc` 和 {anchorName NatAddComm}`Nat.add_comm` 编写你自己的证明。

## 更多累加器证明
%%%
tag := none
%%%

### 反转列表
%%%
tag := none
%%%

将 {anchorName NonTailSum}`sum` 的证明改编为 {anchorName NonTailReverse}`NonTail.reverse` 与 {anchorName TailReverse}`Tail.reverse` 的证明。
第一步是思考传给 {anchorName TailReverse}`Tail.reverseHelper` 的累加器值与非尾递归反转之间的关系。
就像在 {anchorName TailSum}`Tail.sumHelper` 中向累加器加数等同于向整体和加数一样，在 {anchorName TailReverse}`Tail.reverseHelper` 中用 {anchorName names}`List.cons` 向累加器添加新条目，也等价于对整体结果的某种改变。
用铅笔和纸尝试三四个不同的累加器值，直到关系变得清晰。
利用这一关系证明合适的辅助定理。
尝试分别用列表归纳和函数归纳来证明该辅助定理。
然后写下整体定理。
因为 {anchorName reverseEqStart}`NonTail.reverse` 与 {anchorName TailReverse}`Tail.reverse` 是多态的，陈述它们的相等性需要使用 {lit}`@` 来阻止 Lean 试图推断 {anchorName reverseEqStart}`α` 的类型。
将 {anchorName reverseEqStart}`α` 视为普通参数后，应对 {anchorName reverseEqStart}`α` 和 {anchorName reverseEqStart}`xs` 都调用 {kw}`funext`：
```anchor reverseEqStart
theorem non_tail_reverse_eq_tail_reverse :
    @NonTail.reverse = @Tail.reverse := by
  funext α xs
```
这会产生合适的目标：
```anchorError reverseEqStart
unsolved goals
case h.h
α : Type u_1
xs : List α
⊢ NonTail.reverse xs = Tail.reverse xs
```


### 阶乘
%%%
tag := none
%%%


通过找出累加器与结果之间的关系，并证明合适的辅助定理，证明上一节练习中的 {anchorName NonTailFact}`NonTail.factorial` 与你的尾递归解法相等。