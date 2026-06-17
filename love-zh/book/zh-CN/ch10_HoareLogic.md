# 第 10 章 Hoare 逻辑

> 已对照英文 PDF（7482–8099 行）与 `LoVe10_HoareLogic_Demo.lean`。中文 PDF 待发布。

若操作语义对应于理想化的解释器，则 Hoare 逻辑对应于理想化的验证器。Hoare 逻辑可用于指定编程语言的语义，但它特别适合对具体程序进行推理并证明其正确性。它以发明者 Charles Antony Richard（Tony）Hoare 的名字命名。Hoare 逻辑也称为**公理化语义**（axiomatic semantics）。

本章大量借鉴了 *Concrete Semantics: With Isabelle/HOL* 第 12 章的内容。

## 10.1 Hoare 三元组

Hoare 逻辑是一个框架，用于以机械方式推导有效的正确性公式，其依据是一组推导规则。它允许我们直接对程序的语法进行推理，而无需关心其操作语义。

所谓「机械」，是指推导规则的适用性很容易检查。

我们首先抽象地介绍 Hoare 逻辑，暂不涉及 Lean。第二步，我们将看到如何在 Lean 中嵌入 Hoare 逻辑的判断。

Hoare 逻辑的基本判断称为 **Hoare 三元组**（Hoare triple）。它们的形式为 `{P} S {Q}`，其中 `S` 是一条 WHILE 语句，`P` 和 `Q` 是程序变量上的逻辑公式。目前，我们将这些公式想象为由熟悉的连接词和量词构造的语法对象。Hoare 三元组的含义如下：

> 若在执行 `S` 之前**前置条件**（precondition）`P` 为真，且执行正常终止，则终止时**后置条件**（postcondition）`Q` 为真。

这是一种**部分正确性**（partial correctness）陈述：若程序正常终止，则程序是正确的；否则，程序可能任意行为。对于 WHILE 程序，不正常终止的唯一方式是进入无限循环。对于其他编程语言，无限递归以及除以零等运行时错误也可能导致发散或异常终止。

直观上，下面所有 Hoare 三元组都应是有效的：

```
{True} b := 4 {b = 4}
{a = 2} b := 2 * a {a = 2 ∧ b = 4}
{b ≥ 5} b := b + 1 {b ≥ 6}
{False} skip {b = 10}
{True} while i ≠ 10 do i := i + 1 {i = 10}
```

前三个 Hoare 三元组相当自然。第四个三元组是**空真**（vacuously true）的，因为前置条件 `False` 永远不可能满足。Hoare 三元组定义中「若前置条件 `P` 为真」这一部分恒为假；因此该三元组为真。该三元组等价于命题 `False → b = 10`，它对 `b` 的任何取值都成立。至于第五个三元组，并不能保证控制流会逃出循环，但若确实逃出，则循环条件在退出时必为假，因此我们有后置条件 `i = 10`。

下面几个三元组颇为怪异，但很有趣：

```
{False} S {True}
{False} S {False}
{True} S {True}
{True} S {False}
```

前两个三元组对任何语句 `S` 都为真（因此毫无意义）：前置条件永远不满足，故任何后置条件都空真成立。第三个三元组也总是为真，与 `S` 无关。第四个三元组在 `S` 永不终止时（例如 `S := while True do skip`）为真；否则为假。

## 10.2 Hoare 规则

下面我们给出推理 WHILE 程序的完整推导规则集：

```
  ———————————— Skip
  {P} skip {P}

  ——————————————————— Assign
  {Q[a/x]} x := a {Q}

  {P} S {R}   {R} T {Q}
  —————————————————————— Seq
  {P} S; T {Q}

  {P ∧ B} S {Q}   {P ∧ ¬B} T {Q}
  ——————————————————————————————— If
  {P} if B then S else T {Q}

  {P ∧ B} S {P}
  ————————————————————————— While
  {P} while B do S {P ∧ ¬B}

  P′ → P   {P} S {Q}   Q → Q′
  ——————————————————————————— Conseq
  {P′} S {Q′}
```

在 **Assign** 规则中，表达式 `Q[a/x]` 表示将 `Q` 中所有 `x` 的出现替换为 `a` 后得到的条件。该规则有时也写成

```
  ——————————————————— Assign
  {Q[a]} x := a {Q[x]}
```

其中 `[x]` 将 `Q` 中 `x` 的出现提取出来。

Assign 规则可能显得违反直觉，因为它是**反向**工作的：从后置条件出发，计算出前置条件。尽管如此，它正确地刻画了赋值语句的语义，如下所示：

```
{0 = 0} x := 0 {x = 0}
{0 = 0 ∧ y = 5} x := 0 {x = 0 ∧ y = 5}
{x + 1 ≥ 5} x := x + 1 {x ≥ 5}
```

利用初等算术，我们可以简化计算出的前置条件；例如，`0 = 0` 等价于 `True`，`x + 1 ≥ 5` 等价于 `x ≥ 4`。

**Seq** 规则要求我们给出一个中间条件 `R`，它在执行 `S` 之后、执行 `T` 之前成立。下面是 Seq 规则的一个应用示例：

```
  —————————————————————— Assign   —————————————————————— Assign
  {a = 2} b := a {b = 2}          {b = 2} c := b {c = 2}
  —————————————————————————————————————————————————————— Seq
  {a = 2} b := a; c := b {c = 2}
```

**While** 规则最为复杂。条件 `P` 称为**不变式**（invariant）。它既是循环本身的前置条件和后置条件，也是循环体的前置条件和后置条件。循环体前置条件在原有知识基础上加强了「执行循环体之前 `B` 必为真」这一条件。类似地，循环的后置条件在原有知识基础上加强了「退出循环时 `B` 必为假」这一条件。

考虑一个有 `n` 次迭代的循环执行。设初始状态为 `s₀`，循环第 `i` 次迭代后的状态为 `sᵢ`。则以下条件成立：

```
P s₀
P s₁ ∧ B s₁
⋯
P sₙ₋₁ ∧ B sₙ₋₁
P sₙ ∧ ¬B sₙ
```

若 `n = 0`，我们立即得到 `P s₀ ∧ ¬B s₀`，且从未进入循环。

**Conseq** 是唯一在其前提中出现逻辑公式（而非 Hoare 三元组）的规则。这些条件必须被证明，无论是用笔和纸还是用证明助手。Conseq 可用于加强前置条件（即使其更严格）、削弱后置条件（即使其更宽松），或两者兼施。下面是一个推导示例：

```
  x > 8 → x > 4   —————————————————————— Assign   y > 4 → y > 0
                  {x > 4} y := x {y > 4}
  ——————————————————————————————————————————————————————— Conseq
  {x > 8} y := x {y > 0}
```

自上而下阅读这棵树，我们将三元组的前置条件从 `x > 4` 加强为 `x > 8`，并将后置条件从 `y > 4` 削弱为 `y > 0`。我们也可以自下而上阅读这棵树：要证明三元组 `{x > 8} y := x {y > 0}`，只需证明 `{x > 4} y := x {y > 4}`，其中前置条件被削弱、后置条件被加强。

除 Conseq 外，其余规则都是**语法驱动**（syntax-driven）的：我们只需检查手头的语句，就知道该应用哪条规则。对于赋值，应用 Assign；对于 while 循环，应用 While；依此类推。

规则 Seq、If 和 Conseq 是**双向**（bidirectional）的：它们的结论具有 `{P} … {Q}` 的形式，其中 `P`、`Q` 是不同的数学变量。这使它们便于应用。通过将其他规则与 Conseq 结合，我们可以推导出双向变体：

```
  P → Q
  ———————————— Skip′
  {P} skip {Q}

  P → Q[a/x]
  —————————————— Assign′
  {P} x := a {Q}

  {P ∧ B} S {P}   P ∧ ¬B → Q
  —————————————————————————— While′
  {P} while B do S {Q}
```

作为练习，你可以尝试从 Skip、Assign 或 While 与 Conseq 推导出上述每条规则。

## 10.3 Hoare 逻辑的语义化方法

在 Lean 中编码 Hoare 逻辑的一种自然做法是，像对大步和小步语义那样进行：定义 Hoare 三元组的语法概念和一个归纳谓词，为每条核心 Hoare 规则配备一条引入规则；用状态上的谓词（`State → Prop`）表示前置条件和后置条件。然后我们可以证明相对于大步语义的**可靠性**（soundness），即：

> 每当 `{P} S {Q}` 可推导，若 `P s` 且 `(S, s) ⟹ t`，则 `Q t`。

这不过是 Hoare 三元组直观含义的逻辑表述：

> 若在执行 `S` 之前前置条件 `P` 为真（即 `P s`），且执行正常终止（即 `(S, s) ⟹ t`），则终止时后置条件 `Q` 为真（即 `Q t`）。

我们不走这条路，而是提议在 Lean 中**语义化地**定义 Hoare 三元组——依据大步语义来定义，从而使其按定义就是正确的。然后我们将 Hoare 规则推导为定理，而不是把它们陈述为引入规则。再结合用谓词表示公式，这一方法坚决地采取语义路线。

（部分正确性的）Hoare 三元组定义如下：

```lean
def PartialHoare (P : State → Prop) (S : Stmt)
    (Q : State → Prop) : Prop :=
  ∀s t, P s → (S, s) ⟹ t → Q t
```

我们不写 `PartialHoare P S Q`，而是引入一些语法糖，允许写成 `{* P *} (S) {* Q *}`，这更接近非正式语法 `{P} S {Q}`。

核心 Hoare 规则陈述如下：

```lean
theorem skip_intro {P} :
    {* P *} (Stmt.skip) {* P *}

theorem assign_intro (P) {x a} :
    {* fun s ↦ P (s[x ↦ a s]) *} (Stmt.assign x a) {* P *}

theorem seq_intro {P Q R S T} (hS : {* P *} (S) {* Q *})
      (hT : {* Q *} (T) {* R *}) :
    {* P *} (S; T) {* R *}

theorem if_intro {B P Q S T}
      (hS : {* fun s ↦ P s ∧ B s *} (S) {* Q *})
      (hT : {* fun s ↦ P s ∧ ¬ B s *} (T) {* Q *}) :
    {* P *} (Stmt.ifThenElse B S T) {* Q *}

theorem while_intro (P) {B S}
      (h : {* fun s ↦ P s ∧ B s *} (S) {* P *}) :
    {* P *} (Stmt.whileDo B S) {* fun s ↦ P s ∧ ¬ B s *}

theorem consequence {P P' Q Q' S}
      (h : {* P *} (S) {* Q *}) (hp : ∀s, P' s → P s)
      (hq : ∀s, Q s → Q' s) :
    {* P' *} (S) {* Q' *}
```

上述所有定理的证明都基于大步语义。有些三元组——例如 `assign_intro` 中的前置条件——需要引用状态。此时我们使用匿名函数来访问它。回想一下，`P` 与 `fun s ↦ P s` 相等（由 η-转换）。此外，非正式地写成 `P → Q` 的前提，在 Lean 中必须写成 `∀s, P s → Q s`。与[第 9 章](ch09_OperationalSemantics.md)一样，赋值规则中的语法 `s[x ↦ n]` 表示与 `s` 相同、但将 `x` 映射为 `n` 的状态。

以下便利规则可从核心规则推导出来：

```lean
theorem consequence_left (P') {P Q S}
      (h : {* P *} (S) {* Q *}) (hp : ∀s, P' s → P s) :
    {* P' *} (S) {* Q *}

theorem consequence_right (Q) {Q' P S}
      (h : {* P *} (S) {* Q *}) (hq : ∀s, Q s → Q' s) :
    {* P *} (S) {* Q' *}

theorem skip_intro' {P Q} (h : ∀s, P s → Q s) :
    {* P *} (Stmt.skip) {* Q *}

theorem assign_intro' {P Q x a}
      (h : ∀s, P s → Q (s[x ↦ a s])):
    {* P *} (Stmt.assign x a) {* Q *}

theorem seq_intro' {P Q R S T} (hT : {* Q *} (T) {* R *})
      (hS : {* P *} (S) {* Q *}) :
    {* P *} (S; T) {* R *}

theorem while_intro' {B P Q S} (I)
      (hS : {* fun s ↦ I s ∧ B s *} (S) {* I *})
      (hP : ∀s, P s → I s)
      (hQ : ∀s, ¬ B s → I s → Q s) :
    {* P *} (Stmt.whileDo B S) {* Q *}
```

利用双向的 `assign_intro'`，我们可以推导出赋值规则的一个**正向**版本：

```lean
theorem assign_intro_forward (P) {x a} :
    {* P *}
    (Stmt.assign x a)
    {* fun s ↦ ∃n₀, P (s[x ↦ n₀]) ∧ s x = a (s[x ↦ n₀]) *} :=
  by
    apply assign_intro'
    intro s hP
    apply Exists.intro (s x)
    simp [*]
```

变量 `n₀` 表示赋值前 `x` 的值。因此，在后置条件中，`s[x ↦ n₀]` 表示赋值前的状态。由于 `P` 是前置条件，我们有 `P (s[x ↦ n₀])`。此外，`x` 的新值（由 `s x` 给出）必须等于表达式 `a` 在旧状态 `s[x ↦ n₀]` 中求值的结果。

正向规则不如反向规则方便，因为后置条件含有存在量词。也可以以类似风格陈述一条反向规则，从而揭示一种隐藏的对称性：

```lean
theorem assign_intro_backward (Q) {x a} :
    {* fun s ↦ ∃n', Q (s[x ↦ n']) ∧ n' = a s *}
    (Stmt.assign x a)
    {* Q *}
```

注意，这个存在量词可以用**单点规则**（one-point rule）（[第 4.3 节](ch04_ForwardProofs.md)）消去。于是我们得到熟悉的反向规则 `assign_intro`，其前置条件为 `fun s ↦ P (s[x ↦ a s])`。

## 10.4 第一个程序：交换两个变量

让我们用 Hoare 逻辑来验证第一个程序：一个三行程序，使用 `t` 作为临时存储来交换变量 `a` 和 `b` 的值。程序定义如下：

```lean
def SWAP : Stmt :=
  Stmt.assign "t" (fun s ↦ s "a");
  Stmt.assign "a" (fun s ↦ s "b");
  Stmt.assign "b" (fun s ↦ s "t")
```

正确性陈述如下：

```lean
theorem SWAP_correct (a₀ b₀ : ℕ) :
    {* fun s ↦ s "a" = a₀ ∧ s "b" = b₀ *}
    (SWAP)
    {* fun s ↦ s "a" = b₀ ∧ s "b" = a₀ *}
```

逻辑变量 `a₀` 和 `b₀`「冻结」程序变量 `a` 和 `b` 的初始值，以便我们在后置条件中引用它们。毕竟，将 `fun s ↦ s "a" = s "b" ∧ s "b" = s "a"` 作为后置条件是没有意义的。

正确性证明如下：

```lean
by
  apply PartialHoare.seq_intro'
  apply PartialHoare.seq_intro'
  apply PartialHoare.assign_intro
  apply PartialHoare.assign_intro
  apply PartialHoare.assign_intro'
  aesop
```

顺序组合规则和赋值规则的应用由程序的语法引导。程序中有两个顺序组合和三个赋值，因此相应地调用对应规则的次数也相同。我们最终得到一个颇为「审美挑战」的子目标：

```
⊢ ∀s : State,
  s "a" = a₀ ∧ s "b" = b₀ →
  s["t" ↦ s "a"]["a" ↦ s["t" ↦ s "a"] "b"]
   ["b" ↦ s["t" ↦ s "a"]["a" ↦ s["t" ↦ s "a"] "b"] "t"] "a" = b₀ ∧
  s["t" ↦ s "a"]["a" ↦ s["t" ↦ s "a"] "b"]
   ["b" ↦ s["t" ↦ s "a"]["a" ↦ s["t" ↦ s "a"] "b"] "t"] "b" = a₀
```

幸运的是，`simp [*] at *` 可以大幅简化该子目标，`aesop` 甚至可以全自动证明它。

## 10.5 第二个程序：两数相加

第二个例子计算 `m + n`，将结果留在 `m` 中，仅使用这些原始运算：对任意 `k` 有 `k + 1`、`k - 1` 和 `k ≠ 0`：

```lean
def ADD : Stmt :=
  Stmt.whileDo (fun s ↦ s "n" ≠ 0)
    (Stmt.assign "n" (fun s ↦ s "n" - 1);
     Stmt.assign "m" (fun s ↦ s "m" + 1))
```

由于存在 while 循环，证明更为复杂：

```lean
theorem ADD_correct (n₀ m₀ : ℕ) :
    {* fun s ↦ s "n" = n₀ ∧ s "m" = m₀ *}
    (ADD)
    {* fun s ↦ s "n" = 0 ∧ s "m" = n₀ + m₀ *} :=
  PartialHoare.while_intro' (fun s ↦ s "n" + s "m" = n₀ + m₀)
    (by
       apply PartialHoare.seq_intro'
       · apply PartialHoare.assign_intro
       · apply PartialHoare.assign_intro'
         aesop)
    (by aesop)
    (by aesop)
```

第一步是应用带循环不变式的推导 while 规则。我们的不变式是：程序变量 `n` 与 `m` 之和必须等于所期望的数学结果 `n₀ + m₀`，其中 `n₀` 和 `m₀` 对应 `n` 和 `m` 的初始值，正如前置条件所要求的那样。

我们是如何想出这个不变式的？即使对于简单循环，找到合适的不变式也可能很有挑战性。困难在于不变式必须：

1. 进入循环时为真；
2. 若在某次迭代前为真，则在该次迭代后仍为真；
3. 足够强，能推出所期望的循环后置条件。

像 `True` 这样的不变式满足要求 1 和 2，但通常不满足 3。类似地，`False` 满足要求 2 和 3，但不满足 1。实践中，不变式往往形如

> **已完成的工作** + **剩余的工作** = **期望的结果**

其中 `+` 表示某个合适的运算符（不一定是加法）。进入循环时，**已完成的工作** 通常为 `0`（或其他合适的「零」值），不变式变为

> **剩余的工作** = **期望的结果**

这一等式必须在循环开始时可证——要么来自前一条语句的后置条件，要么（若没有前一条语句）来自整个程序所期望的前置条件。退出循环时，**剩余的工作** 应为 `0`（或某种变体），不变式变为

> **已完成的工作** = **期望的结果**

通常，**已完成的工作** 体现为在其中累积结果的变量，而 **剩余的工作** 类似于 **期望的结果**，但依赖于在循环内值会变化的程序变量，并计入已完成的工作。

对于 `ADD` 程序的循环，**已完成的工作** 是 `m`，**剩余的工作** 是 `n`，**期望的结果** 是 `n₀ + m₀`。进入循环时，不变式 `m + n = n₀ + m₀` 成立，因为此时 `m = m₀` 且 `n = n₀`。（不寻常的是，本例中 **已完成的工作** 并非 `0`，因为我们为了优化而将输入 `m` 复用为累加器。）退出循环时，我们有 `n = 0`，因此不变式变为 `m = n₀ + m₀`。我们可以从 `m` 中取出结果。

`while_intro'` 定理被直接用作证明项。它产生三个子目标。不变式由所期望的前置条件蕴含、以及不变式蕴含所期望的后置条件，这两个证明都是平凡的：它们只需调用 `aesop`。唯一非平凡的子目标是：执行循环体能保持不变式。

对本例而言，Hoare 逻辑确实很有帮助。直接对操作语义推理会很不方便，因为我们需要归纳来推理 while 循环。借助 Hoare 逻辑，这种归纳在 `while_intro` 规则的证明中一次性完成。

## 10.6 验证条件生成器

**验证条件生成器**（verification condition generator，VCG）是应用 Hoare 逻辑规则、产生须手动证明的**验证条件**（verification condition）的程序。我们可以把它们想象成处理 Hoare 逻辑官僚事务的机械公务员。作为用户，我们必须在程序中以注解形式提供足够强的循环不变式。数以百计的程序验证工具都基于这些原则。

VCG 通常从后置条件出发反向工作，使用**反向规则**——即以后置条件为任意 `Q` 来陈述的规则。这很有效，因为 Hoare 逻辑的核心规则——赋值规则——是反向的。

我们可以用 Lean 的元编程框架定义一个简单的 VCG。首先，引入一个名为 `Stmt.invWhileDo` 的常量，它在循环条件 `B` 和循环体 `S` 之外，还携带用户提供的**不变式** `I`：

```lean
def Stmt.invWhileDo (I B : State → Prop) (S : Stmt) : Stmt :=
  Stmt.whileDo B S
```

我们为该构造提供两条 Hoare 规则：一条反向规则和一条双向规则。两者都依据双向的 `while_intro'` 规则得以证明：

```lean
theorem invWhile_intro {B I Q S}
      (hS : {* fun s ↦ I s ∧ B s *} (S) {* I *})
      (hQ : ∀s, ¬ B s → I s → Q s) :
    {* I *} (Stmt.invWhileDo I B S) {* Q *} :=
  while_intro' I hS (by aesop) hQ

theorem invWhile_intro' {B I P Q S}
      (hS : {* fun s ↦ I s ∧ B s *} (S) {* I *})
      (hP : ∀s, P s → I s) (hQ : ∀s, ¬ B s → I s → Q s) :
    {* P *} (Stmt.invWhileDo I B S) {* Q *} :=
  while_intro' I hS hP hQ
```

上述规则直接使用注解中的不变式作为其不变式。使用该框架时，我们必须小心地为所有 while 循环标注合适的不变式。若指定了错误的不变式，我们将面对无法证明的子目标，这表明必须修正不变式。

VCG 的代码相当简洁：

```lean
def matchPartialHoare : Expr → Option (Expr × Expr × Expr)
  | (Expr.app (Expr.app (Expr.app
       (Expr.const ``PartialHoare _) P) S) Q) =>
    Option.some (P, S, Q)
  | _ =>
    Option.none

partial def vcg : TacticM Unit :=
  do
    let goals ← getUnsolvedGoals
    if goals.length != 0 then
      let target ← getMainTarget
      match matchPartialHoare target with
      | Option.none           => return
      | Option.some (P, S, Q) =>
        if Expr.isAppOfArity S ``Stmt.skip 0 then
          if Expr.isMVar P then
            applyConstant ``PartialHoare.skip_intro
          else
            applyConstant ``PartialHoare.skip_intro'
        else if Expr.isAppOfArity S ``Stmt.assign 2 then
          if Expr.isMVar P then
            applyConstant ``PartialHoare.assign_intro
          else
            applyConstant ``PartialHoare.assign_intro'
        else if Expr.isAppOfArity S ``Stmt.seq 2 then
          andThenOnSubgoals
            (applyConstant ``PartialHoare.seq_intro') vcg
        else if Expr.isAppOfArity S ``Stmt.ifThenElse 3 then
          andThenOnSubgoals
            (applyConstant ``PartialHoare.if_intro) vcg
        else if Expr.isAppOfArity S ``Stmt.invWhileDo 3 then
          if Expr.isMVar P then
            andThenOnSubgoals
              (applyConstant ``PartialHoare.invWhile_intro) vcg
          else
            andThenOnSubgoals
              (applyConstant ``PartialHoare.invWhile_intro')
              vcg
        else
          failure

elab "vcg" : tactic =>
  vcg
```

VCG 提取第一个目标的目标并检查它。若它是一个 Hoare 三元组，VCG 会检查其前置条件 `P` 和语句 `S`。若前置条件是元变量（例如 `?P`），VCG 会应用反向规则（通过我们在[第 8.7 节](ch08_Metaprogramming.md)定义的 `applyConstant` 函数），因为这会实例化该元变量。否则，使用双向规则，其前置条件为任意变量，可与目标的前置条件匹配。对于 while 循环，我们只考虑使用 `Stmt.invWhileDo` 的程序，因为一般而言我们无法以编程方式猜出不变式。

VCG 通过我们在[第 8.7 节](ch08_Metaprogramming.md)定义的 `andThenOnSubgoals` 函数，在所有新产生的子目标上递归调用自身。

## 10.7 第二个程序再访：两数相加

利用验证条件生成器，我们可以重新审视上面给出的 `ADD` 程序正确性证明：

```lean
theorem ADD_correct_vcg (n₀ m₀ : ℕ) :
    {* fun s ↦ s "n" = n₀ ∧ s "m" = m₀ *}
    (ADD)
    {* fun s ↦ s "n" = 0 ∧ s "m" = n₀ + m₀ *} :=
  show {* fun s ↦ s "n" = n₀ ∧ s "m" = m₀ *}
     (Stmt.invWhileDo (fun s ↦ s "n" + s "m" = n₀ + m₀)
        (fun s ↦ s "n" ≠ 0)
        (Stmt.assign "n" (fun s ↦ s "n" - 1);
         Stmt.assign "m" (fun s ↦ s "m" + 1)))
     {* fun s ↦ s "n" = 0 ∧ s "m" = n₀ + m₀ *} from
  by
    vcg <;>
      aesop
```

首先，我们用 `show` 为 while 循环标注不变式。回想一下，`show` 命令以计算等价的方式重述目标。此处，我们利用这一功能将 `Stmt.whileDo` 替换为 `Stmt.invWhileDo`，后者按定义等于 `Stmt.whileDo`。程序及其前置条件和后置条件与定理陈述中的完全相同。

我们将 `vcg` 作为第一个证明步骤调用。这将应用所有必要的 Hoare 规则，并留下一些子目标，它们对 `aesop` 来说不在话下。

## 10.8 完全正确性的 Hoare 三元组

到目前为止，本章的重点是部分正确性。当我们陈述 Hoare 三元组 `{P} S {Q}` 时，我们断言：若程序 `S` 终止，则最终状态满足 `Q`，但当 `S` 不终止时我们什么也不说。特别地，我们可以为发散程序 `while True do skip` 证明任何后置条件。诚然，这过于宽松：若考试要求你编写排序算法，你当然不应提交 `while True do skip` 这样的程序。

**完全正确性**（total correctness）是更强的概念，它在部分正确性之外还断言程序正常终止。我们首先关注部分正确性，因为它更简单，而且无论如何都是完全正确性的必要组成部分。

完全正确性的 Hoare 三元组形式为 `[P] S [Q]`，其含义如下：

> 若在执行 `S` 之前前置条件 `P` 成立，则执行正常终止，且最终状态中后置条件 `Q` 成立。

对于确定性程序，这可以等价地表述为：

> 若在执行 `S` 之前前置条件 `P` 成立，则存在某个状态，使得执行在该状态中正常终止，且后置条件 `Q` 在该状态中成立。

下面是一个有效的 Hoare 三元组示例：

```
[i ≤ 10] while i < 10 do i := i + 1 [i = 10]
```

对于 WHILE 语言，部分正确性与完全正确性的区别仅涉及 while 循环（以及包含它们的程序）。while 的 Hoare 规则现在必须用**变体**（variant）`v` 来标注——一个自然数，在每次迭代中减少一或更多：

```
  [P ∧ B ∧ v = v₀] S [P ∧ v < v₀]
  ——————————————————————————————— While-Var
  [P] while B do S [P ∧ ¬B]
```

此处，`v₀` 是冻结 `v` 初始值的逻辑变量，其作用域是整个前提；而 `v` 是数学变量（与 `P`、`B`、`S` 一样）。对于上面的示例，我们可以取 `10 - i` 作为变体（或 `50 - i`，或 `1024 - i * i`）。

考虑与[第 10.2 节](#102-hoare-规则)中对应的 `n` 次循环迭代执行 `s₀, s₁, …, sₙ₋₁, sₙ`。以下条件成立：

```
P s₀
P s₁ ∧ B s₁
⋯
P sₙ₋₁ ∧ B sₙ₋₁
v s₀ > v s₁ > ⋯ > v sₙ₋₁
P sₙ ∧ ¬B sₙ > v sₙ
```

完全正确性 Hoare 三元组的理论在本章练习单中展开。