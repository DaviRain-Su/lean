# 第 8 章 元编程

> 由 Lean-zh PDF 自动提取（7165–8040 行），代码块与公式尚需人工校对。

元编程
和大多数证明助手一样，Lean 可以通过自定义策略和其他功能进行扩展。对
Metaprogramming

Lean 自身进行编程，而不仅仅是使用它，被称为元编程。Lean 的元编程框架大多使
用与 Lean 输入语言相同的概念和语法，因此我们不需要学习不同的语言来对 Lean
进行编程。单子被用来访问 Lean 的状态。
Abstract Syntax Tree

以归纳类型呈现的抽象语法树反映了内部数据结构。证明助手的内部结构通过
Lean 函数公开，我们可以使用这些函数来访问当前目标、统一项、查询和修改全局
语境，以及设置属性（例如 @[simp]）。
下面是元编程的一些示例应用：
Negation Normal Form

目标转换（例如：应用安全的引入规则，将目标置于否定范式）；
Backtracking

启发式证明搜索（例如：结合回溯应用非安全的引入规则）；
Decision Procedure

判定过程（例如：针对线性算术、命题逻辑）；

定义生成器（例如：归纳类型的 Haskell 风格的 deriving）；
建议工具（例如：定理查找器、反例生成器）；
导出器（例如：文档生成器）；
ad-hoc

Boilerplate

特设证明自动化（为了避免样板代码或重复）。

正如数学家及 Lean 用户 Kevin Buzzard 所写的：1
Grinding

如果你发现自己正在「刷怪」（借用电脑游戏的用语），一遍又一遍地做
着同样的事情，因为你需要这样做才能取得进展，那么你可以试着说服
一位计算机科学家为你编写一个策略（或者如果你足够勇敢，可以编写

meta

元 Lean 代码，甚至可以自己编写策略）。

https://xenaproject.wordpress.com/2020/02/09/lean-is-better-forproper-maths-than-all-the-other-theorem-provers/

策略组合子

8.1

Fail

首先，有一些术语：如果应用一个策略产生了错误，则该策略失败；否则，它

Succeed

成功。策略成功的一种方式是完全证明目标。另一种方式是产生替换当前目标的新
子目标。有些策略通过什么都不做来取得成功。
在编写我们自己的策略时，我们经常需要在多个目标上重复某些操作，或者在
Tactic Combinator

策略失败时进行恢复。在这种情况下，策略组合子会很有帮助。
最实用的策略组合子之一是 repeat' tactic。它在所有目标上重复调用 tactic，
然后在产生的子目标上调用，再在产生的子子目标上调用，依此类推，直到 tactic
在所有可用目标上都失败为止。下面是一个涉及第 6 章中介绍的 Even 谓词的 repeat'
示例：
theorem repeat'_example :
Even 4 ∧ Even 7 ∧ Even 3 ∧ Even 0 :=
by
repeat' apply And.intro
repeat' apply Even.add_two
在第一个 repeat' 行之后，证明状态包含四个目标：

⊢ Even 4

⊢ Even 7

⊢ Even 3

⊢ Even 0

请注意，所有的合取项都消失了。第二个 repeat' 重复应用定理 Even.add_two
: ∀k, Even k → Even (k + 2)，留下了这些目标：

⊢ Even 0

⊢ Even 1

⊢ Even 1

⊢ Even 0

第一个和最后一个目标很烦人，因为它们对应于定理 Even.zero。我们可以在
应用 Even.add_two 失败时尝试应用 Even.zero 来证明它们。这可以通过以下方
式实现：
theorem repeat'_first_example :
Even 4 ∧ Even 7 ∧ Even 3 ∧ Even 0 :=
by
repeat' apply And.intro
repeat'
first
| apply Even.add_two
| apply Even.zero

8.1. 策略组合子

策略组合子 first | tactic1 | ⋯ | tacticn 首先尝试执行其第一个参数
tactic1 。如果失败，则尝试 tactic2 ，依此类推。如果所有指定的策略都失败，则
整个组合子也会失败。在上面的示例中，我们还剩两个无法证明的目标：

⊢ Even 1

⊢ Even 1

下一个组合子 all_goals tactic 在每个目标上恰好调用一次策略。该组合
子仅在 tactic 在「所有」目标上都成功时才成功。在下面的示例中它会失败，因
为 Even.add_two 无法应用于目标 ⊢ Even 0：
theorem all_goals_example :
Even 4 ∧ Even 7 ∧ Even 3 ∧ Even 0 :=
by
repeat' apply And.intro
all_goals apply Even.add_two

-- fails

为了忽略 tactic 的失败，我们可以将其包装在 try 组合子中：
theorem all_goals_try_example :
Even 4 ∧ Even 7 ∧ Even 3 ∧ Even 0 :=
by
repeat' apply And.intro
all_goals try apply Even.add_two
结果状态为

⊢ Even 2

⊢ Even 5

⊢ Even 1

⊢ Even 0

结构 try tactic 等价于 first | tactic | skip，其中 skip 是一个不做
任何事情就成功的策略。因此 try tactic 总是成功。一个相关的策略是 done：如
果没有剩余目标则成功，否则失败。
另一个变体是 any_goals tactic 组合子。它尝试在每个目标上调用一次 tactic，
但与 all_goals 不同，只要 tactic 在任何目标上成功，它就会成功。示例
theorem any_goals_example :
Even 4 ∧ Even 7 ∧ Even 3 ∧ Even 0 :=
by
repeat' apply And.intro
any_goals apply Even.add_two
结果状态为

⊢ Even 2

⊢ Even 5

⊢ Even 1

⊢ Even 0

这与前一个示例中的状态相同。通常，区别在于 any_goals tactic 可能会失
败，而 all_goals try tactic 总是成功。
有时我们希望除非能完全证明一个目标，否则不去管它。组合子solve | tactic1
| ⋯ | tacticn 首先尝试执行其第一个参数 tactic1 。如果这未能证明目标，则尝
试 tactic2 ，依此类推。如果所有指定的策略都未能证明目标，则整个组合子失败。
（将此行为与 first | tactic1 | ⋯ | tacticn 的行为进行比较，后者只要求指定
的策略之一成功，而不要求证明目标。）考虑这个示例：
theorem any_goals_solve_repeat_first_example :
Even 4 ∧ Even 7 ∧ Even 3 ∧ Even 0 :=
by
repeat' apply And.intro
any_goals
solve
| repeat'
first
| apply Even.add_two
| apply Even.zero
第一个和第四个目标已被证明，剩下的两个无法证明的目标与定理陈述中的完
全一致：

⊢ Even 7

⊢ Even 3

请注意，repeat' 组合子可能会导致无限循环。考虑这个示例：
theorem repeat'_Not_example :
¬ Even 1 :=
by repeat' apply Not.intro
Not.intro 规则是 (?a → False) → ¬ ?a，因此它应用一次将目标转换为 ⊢
Even 1 → False。由于 ¬ ?a 被定义为 ?a → False，该规则再次应用，再次产生
相同的目标。该策略会发生死循环。
And Then

最后，
「继而」运算符 <;> 可用于连接两个策略。左侧在第一个目标上执行。右
侧在产生的每个子目标上执行（但不在原始的第二个、第三个等目标上执行）。因此，
我们可以这样写

8.2. 宏

by
induction n <;>
aesop

而非更冗长的版本
by
induction n with
| zero

=> aesop

| succ n' ih => aesop

8.2 宏
Macro

让我们通过将自定义策略编码为宏，来进行一些实际的元编程。该策略体现了
我们在上面的 solve 示例中硬编码的行为：
macro "intro_and_even" : tactic =>
'(tactic|
(repeat' apply And.intro
any_goals
solve
| repeat'
first
| apply Even.add_two
| apply Even.zero))
Syntactic Category

第一行将 intro_and_even 声明为属于 tactic 语法范畴的宏。在其余行中，
'(tactic| tactic) 结构将指定的策略 tactic 嵌入到宏中。策略本身是使用标
准语法指定的。
一旦我们定义了自定义策略，就可以在证明中调用它：
theorem intro_and_even_example :
Even 4 ∧ Even 7 ∧ Even 3 ∧ Even 0 :=
by
intro_and_even
这会产生子目标

⊢ Even 7

⊢ Even 3

8.3

元编程单子
宏是一种可用于编写简单证明自动化的机制。然而，对于大多数元编程任务，我

们需要使用元编程单子：MetaM 和 TacticM。
MetaM 结合了几种单子的属性：
Context

它是一个状态单子，提供对全局语境
（包括所有定义和归纳类型）、记法和属性
（例如 @[simp] 定理列表）等的访问。
它的行为类似于选项单子。元程序 failure 表示策略已失败。
tracing

它支持追踪，因此我们可以使用程序 logInfo 来显示消息。
它支持指令式结构，例如 for–in 循环、continue 语句和return 语句。
TacticM 通过目标管理扩展了 MetaM：它提供对目标列表的访问。它还允许我
们运行 Lean 来填充表达式中的隐式 { } 和类型类 [ ] 参数、展开宏等等。
Metavariable

在 Lean 内部，每个目标都表示为一个元变量 ?m，代表一个缺失的项（通常是
一个证明项）。每个元变量都有一个类型（通常是一个命题）和一个局部语境，指定
了可以用来证明与该元变量相关联的目标的变量和假设。
让我们通过定义一个利用 TacticM 追踪功能的策略，来实际使用一下 TacticM。
Main Goal

该策略将显示 Lean 版本号、目标列表以及第一个目标的目的（Lean 称之为主目标）：
def traceGoals : TacticM Unit :=
do
logInfo m!"Lean version {Lean.versionString}"
logInfo "All goals:"
let goals ← getUnsolvedGoals
logInfo m!"{goals}"
match goals with
| []

=> return

| _ :: _ =>
logInfo "First goal's target:"
let target ← getMainTarget
logInfo m!"{target}"
elab "trace_goals" : tactic =>
traceGoals
这段代码有许多有趣的特性：
第一行声明了一个类型为 TacticM Unit 的函数 traceGoals ⸺ 这是返回
Unit（一个基数为 1 的平凡类型）的策略类型。注意，元编程函数的定义使用
了与任何 Lean 函数相同的语法。

8.3. 元编程单子

第二行进入了单子。其余行是访问 Lean 内部结构的带作用的操作。
m!"…" 语法指定了一个字符串，其中每个出现的 {term}（其中 term 是一个
Lean 项）都会被求值并序列化为字符串。例如，如果 Lean.versionString
是「v4.24.0」，那么 m!"Lean version {Lean.versionString}" 会求值
为字符串「Lean version v4.24.0」。
最后两行使用 elab 命令，告诉 Lean 的解析器将字符串「trace_goals」识别
为一个策略。当 Lean 遇到这个策略时，它会运行 elab 命令主体中的元程
序 ⸺ 在这里是 traceGoals。（当我们之前使用更高层级的 macro 命令时，
elab 是在底层被调用的。）
下面是一个展示如何使用新策略的示例：
theorem Even_18_and_Even_20 (α : Type) (a : α) :
Even 18 ∧ Even 20 :=
by
apply And.intro
trace_goals
intro_and_even
将鼠标悬停在 trace_goals 上，可见输出如下：
Lean version v4.24.0
All goals:
[case left
α : Type
a:α
⊢ Even 18
,
case right
α : Type
a:α
⊢ Even 20]
First goal's target:
Even 18
虽然 Lean 使用熟悉的 C ⊢ P 语法显示目标，但它们实际上是元变量。
上述程序中使用的常量具有以下类型：
logInfo : MessageData → TacticM Unit
getUnsolvedGoals : TacticM (List MVarId)
getMainTarget : TacticM Expr

其中 MessageData 代表消息，MVarId 代表元变量标识符，而 Expr 代表项。

8.4 第一个示例：一个 Assumption 策略
我们的第一个较大的示例实现了一个 hypothesis 策略，它像预定义的 assumption
策略一样，寻找正确类型（即正确的命题）的假设，并应用它来证明目标：
def hypothesis : TacticM Unit :=
withMainContext
(do
let target ← getMainTarget
let lctx ← getLCtx
for ldecl in lctx do
if ! LocalDecl.isImplementationDetail ldecl
then
let eq ← isDefEq (LocalDecl.type ldecl)
target
if eq then
let goal ← getMainGoal
MVarId.assign goal (LocalDecl.toExpr ldecl)
return
failure)
elab "hypothesis" : tactic =>
hypothesis
在 hypothesis 函数中，我们首先提取第一个目标的目的和局部语境。为了确
保 getLCtx 给出的是当前第一个目标的局部语境，我们将整个 do 块传递给 withMainContext
函数。通常，任何 TacticM 计算都是在环境局部语境中执行的，该语境为表达式
中出现的自由变量赋予了意义。withMainContext 函数将此局部语境设置为当前
第一个目标的局部语境。
在 do 块内部，我们使用方便的单子结构 for–in 遍历局部语境中的所有声明。
对于每个不是所谓「实现细节」（即 Lean 插入的对用户不可见的假设）的局部变量
或假设 h，我们检查其类型（通常是其命题）在计算和元变量实例化后是否等于目
标。如果是，我们获取与第一个目标关联的元变量，并将 h 分配给它，从而证明该
目标。最后，我们 return。
由于目标由元变量表示，将一个项分配给元变量 ?m 是 Lean 证明目标的底层方
式。该项中出现的新元变量对应于必须证明的新子目标。
下面是 hypothesis 的一个简单调用：

8.5. 表达式

theorem hypothesis_example {α : Type} {p : α → Prop} {a
: α}
(hpa : p a) :
p a :=
by hypothesis
如果我们添加追踪，那么可以看到在找到匹配的假设 hpa 并成功应用之前，会
依次尝试 α、p 和 a。
该示例使用了以下新常量：

getLCtx : TacticM LocalContext
LocalDecl.isImplementationDetail : LocalDecl → Bool
isDefEq : Expr → Expr → TacticM Bool
LocalDecl.type : LocalDecl → Expr
getMainGoal : TacticM MVarId
MVarId.assign : MVarId → Expr → TacticM Unit
LocalDecl.toExpr : LocalDecl → Expr
failure {α : Type} : TacticM α

8.5 表达式
Expression

Term

元编程框架围绕着表达式（或项）的类型 Expr 展开。表达式的一个重要组成部
Name

分是类型为 Name 的名称。我们从它们开始。
名称可以使用单反引号指定。例如，'x 代表名称 x，它可以赋予变量或常量。
在引用常量时，我们必须指定包括命名空间在内的完整名称；因此，要引用第 6 章
中的 Even 谓词，我们必须编写'LoVe.Even 而非 'Even。
如果我们想引用一个现有的常量，Lean 提供了双反引号语法，它使用 Lean 通常
Elaboration

的名称阐释规则查找名称，并将其扩展为完整名称。因此，''Even 和 ''LoVe.Even
都指向名称 LoVe.Even，而如果我们编写一些未声明的名称（如 ''EvenIf），Lean
会报错。
类型 Expr 的定义如下：
inductive Expr : Type where
| const

: Name → List Level → Expr

| sort

: Level → Expr

| fvar

: FVarId → Expr

| mvar

: MVarId → Expr

| app

: Expr → Expr → Expr

| lam

: Name → Expr → Expr → BinderInfo → Expr

| bvar

: Nat → Expr

| forallE : Name → Expr → Expr → BinderInfo → Expr
| letE

: Name → Expr → Expr → Expr → Bool →

Expr
| lit

: Literal → Expr

| mdata

: MData → Expr → Expr

| proj

: Name → Nat → Expr → Expr

让我们来看看主要的构造子：
Expr.const name levels 代表名为 name 的常量，例如
Universe Levels

Nat.add 或

ℕ。levels 参数代表宇宙层级，这一概念将在第 ?? 章中进行解释。例如，
Expr.const ''Nat.add [] 代表 Nat.add，而 Expr.const ''Nat [] 代
表 Nat（即 ℕ）。
Expr.sort level 用于表示类型的类型。例如，Expr.sort Level.zero
代表 Prop，而Expr.sort (Level.succ Level.zero) 代表 Type。
Expr.fvar id 代表局部语境中的自由变量（例如 a、h）。id 参数是该变量
的唯一标识符。
Expr.mvar id 代表元变量，即带问号的变量 ?m。id 参数是该元变量的唯一
标识符。
Expr.app t u 代表函数 t 应用于参数 u。例如，
Expr.app (Expr.const ''Nat.succ [] (Expr.const ''Nat.zero
[]) 代表 Nat.succ Nat.zero。
Expr.lam name σ t bi 代表匿名函数（或 λ-表达式）。name 参数是绑定变量
的名称，σ 参数是绑定变量的类型，t 参数是函数体，而 bi 参数存储该变量
是显式 ( )、隐式 { } 还是类型类 [ ] 参数。
De Bruijn Index

Expr.bvar i 代表绑定变量，使用的是一种被称为 De Bruijn 索引的记法。
Binder

Expr.var 0 指代由最近的绑定子绑定的变量，Expr.var 1 指代由第二近的
绑定子绑定的变量，依此类推。
因此，
Expr.lam 'x (Expr.const ''Nat []) (Expr.bvar 0)
BinderInfo.default
代表 fun x : ℕ ↦ x，而
Expr.lam 'x (Expr.const ''Nat [])
(Expr.lam 'y (Expr.const ''Nat []) (Expr.bvar 1)
BinderInfo.default)
BinderInfo.default

8.6. 第二个示例：一个合取式分解策略

代表 fun x y : ℕ ↦ x。
Dependent

Expr.forallE name σ τ bi 代表可能依值的函数类型。name 参数是绑定变
量的名称，σ 参数是定义域类型，τ 参数是结果类型，而 bi 与上述 Expr.lam
相同。例如，
Expr.forallE 'n (Expr.const ''Nat [])
(Expr.app (Expr.const ''Even []) (Expr.bvar 0))
BinderInfo.default
代表 (n : ℕ) → Even n（也写成 ∀n : ℕ, Even n），而
Expr.forallE 'dummy (Expr.const 'Nat [])
(Expr.const 'Bool []) BinderInfo.default
代表 ℕ → Bool。

8.6

第二个示例：一个合取式分解策略
在本节和下一节中，我们定义了另外两个完成明确任务的策略。这两个策略中

的第一个被称为 destruct_and，它自动消除前提中的合取式。我们的目标是使如
下证明自动化：
theorem abc_a (a b c : Prop) (h : a ∧ b ∧ c) :
a :=
And.left h
theorem abc_b (a b c : Prop) (h : a ∧ b ∧ c) :
b :=
And.left (And.right h)
theorem abc_bc (a b c : Prop) (h : a ∧ b ∧ c) :
b ∧ c :=
And.right h
theorem abc_c (a b c : Prop) (h : a ∧ b ∧ c) :
c :=
And.right (And.right h)
在每种情况下，我们都希望只需编写 by destruct_and h 作为证明。
我们的策略依赖于一个辅助函数，该函数以证明项 hP（最初是假设 h）作为参
Conjunct

数，我们从中提取合取项：

partial def destructAndExpr (hP : Expr) : TacticM Bool
:=
withMainContext
(do
let target ← getMainTarget
let P ← inferType hP
let eq ← isDefEq P target
if eq then
let goal ← getMainGoal
MVarId.assign goal hP
return true
else
match Expr.and? P with
| Option.none

=> return false

| Option.some (Q, R) =>
let hQ ← mkAppM ''And.left #[hP]
let success ← destructAndExpr hQ
if success then
return true
else
let hR ← mkAppM ''And.right #[hP]
destructAndExpr hR)
与 hypothesis 一样，我们将整个 do 块传递给 withMainContext 函数。这
确保了 inferType 和 isDefEq 在正确的局部语境中运行。
在 do 块内部，我们首先提取第一个目标的目的和 hP 的类型（通常是其命题）
P。如果它们在计算和元变量实例化后相等，我们就通过分配其元变量来关闭目标，
就像我们在 hypothesis 示例中所做的那样，并返回 true 表示成功。否则，我们
检查 hP 的命题是否具有 Q ∧ R 的形式。如果是，我们使用证明项 hQ := And.left
hP（它是 Q 的证明）递归调用辅助函数。如果成功，则完成；否则，我们尝试证明
项 hR := And.right hP（它是 R 的证明）。
注意函数定义开始处的关键字 partial。这里需要它是因为 Lean 无法证明该
函数总是终止。由于该函数仅用作元程序，而不是在命题内部，因此终止是可选的，
我们可以通过指定 partial 来禁用终止检查。
Curried

同样值得注意的是 mkAppM 函数，它用于构造常量对参数数组的柯里化应用。
数组类似于列表，但书写时带有前缀符号 #（例如 #[1, 2, 3]）。使用 mkAppM 比
多次应用 Expr.app 构造子更方便。此外，mkAppM 允许我们省略隐式参数（例如
命题 Q 和 R），否则我们必须将它们作为参数提供给 And.left 和 And.right。

8.6. 第二个示例：一个合取式分解策略

主函数剩下的工作很少了：
def destructAnd (name : Name) : TacticM Unit :=
withMainContext
(do
let h ← getFVarFromUserName name
let success ← destructAndExpr h
if ! success then
failure)
elab "destruct_and" h:ident : tactic =>
destructAnd (getId h)
该函数使用 getFVarFromUserName 获取假设 h，并调用辅助函数。如果辅助
函数返回 false，则策略失败。
我们现在可以在这些动机性示例中使用我们的新工具了：
theorem abc_a_again (a b c : Prop) (h : a ∧ b ∧ c) :
a :=
by destruct_and h
theorem abc_b_again (a b c : Prop) (h : a ∧ b ∧ c) :
b :=
by destruct_and h
theorem abc_bc_again (a b c : Prop) (h : a ∧ b ∧ c) :
b ∧ c :=
by destruct_and h
theorem abc_c_again (a b c : Prop) (h : a ∧ b ∧ c) :
c :=
by destruct_and h
上述元程序中使用了以下新常量：

inferType : Expr → TacticM Expr
Expr.and? : Expr → Option (Expr × Expr)
mkAppM : Name → Array Expr → TacticM Expr
getFVarFromUserName : Name → TacticM Expr

8.7

第三个示例：一个直接证明查找器
有时我们陈述了一个定理，证明了它，后来才意识到该定理已经存在。这可以

通过使用 prove_direct 来防止，该策略会遍历所有可用的定理，并检查其中是否
有一个可以证明当前目标。我们将分步审阅其代码。
第一步是一个函数 isTheorem，如果声明是公理或定理，它返回 true，否则
返回 false：
def isTheorem : ConstantInfo → Bool
| ConstantInfo.axiomInfo _ => true
| ConstantInfo.thmInfo _

=> true

| _

=> false

我们将使用此函数来过滤掉我们不感兴趣的声明。
下一个函数将名为 name 的定理应用于当前目标：
def applyConstant (name : Name) : TacticM Unit :=
do
let cst ← mkConstWithFreshMVarLevels name
liftMetaTactic (fun goal ↦ MVarId.apply goal cst)
给定一个名称，mkConstWithFreshMVarLevels 函数创建一个代表该常量
的表达式 cst。函数名称中提到的「全新元变量层级」将在第 ?? 章中变得更加清
晰。MVarId.apply（不要与 MVarId.assign 混淆）然后将该常量应用于当前目
标，设置 ?m := cst ?m1 … ?mn ，并返回代表 cst 前提的全新元变量 ?mj 。
liftMetaTactic 函数检索第一个目标的标识符，在底层 MetaM 单子中对该
目标运行给定的函数，并将该目标替换为函数返回的子目标。
下一个函数实现了一个其行为类似于 <;> 但可以从元程序中使用的组合子：
def andThenOnSubgoals (tac₁ tac₂ : TacticM Unit) :
TacticM Unit :=
do
let origGoals ← getGoals
let mainGoal ← getMainGoal
setGoals [mainGoal]
tac₁
let subgoals₁ ← getUnsolvedGoals
let mut newGoals := []
for subgoal in subgoals₁ do
let assigned ← MVarId.isAssigned subgoal
if ! assigned then

8.7. 第三个示例：一个直接证明查找器

setGoals [subgoal]
tac₂
let subgoals₂ ← getUnsolvedGoals
newGoals := newGoals ++ subgoals₂
setGoals (newGoals ++ List.tail origGoals)
TacticM 单子跟踪当前要证明的目标。我们可以使用 getGoals 获取列表，并
使用 setGoals 设置列表。如果我们希望策略暂时专注于特定的子目标，设置子目
标列表是非常有用的。
在这里，我们首先专注于第一个目标（setGoals [mainGoal]）并调用第一个
策略。对于产生的每个子目标，我们专注于它（setGoals [subgoal]）并调用第二
subsubgoals

个策略。从第二个策略产生的所有未解决的子子目标都收集在可变变量 newGoals
中。由于证明一个目标有时会实例化另一个元变量，我们在每次迭代中检查当前子
目标的元变量是否已被分配，如果是，则跳过该子目标。最后，我们更新目标以包
含所有待处理的目标：newGoals 中的目标，以及 origGoals 中除第一个目标外
所有我们尚未考虑的目标。
通常，在策略结束时，我们应该确保目标列表由所有待证明的目标组成。否则，
我们可能会遇到一些令人费解的错误，例如：
declaration has metavariables
我们还需要一个策略，它尝试使用由其名称指定的定理来证明目标，并调用
hypothesis 来证明任何产生的子目标：
def proveUsingTheorem (name : Name) : TacticM Unit :=
andThenOnSubgoals (applyConstant name) hypothesis
这在程序上等同于证明 apply name <;> hypothesis。
最后，我们准备好审阅主函数了：
def proveDirect : TacticM Unit :=
do
let origGoals ← getUnsolvedGoals
let goal ← getMainGoal
setGoals [goal]
let env ← getEnv
for (name, info)
in SMap.toList (Environment.constants env) do
if isTheorem info && ! ConstantInfo.isUnsafe info
then
try

proveUsingTheorem name

logInfo m!"Proved directly by {name}"
setGoals (List.tail origGoals)
return
catch _ =>
continue
failure
elab "prove_direct" : tactic =>
proveDirect
我们专注于第一个目标，然后遍历环境中声明的所有常量。如果该常量是一个
定理，并且不是「unsafe」
（一个与我们的不安全规则和策略概念无关的 Lean 概念），
我们尝试使用我们的辅助函数 proveUsingTheorem 来应用它。如果成功，就打印
「Proved directly by name」，其中 name 是该定理的名称，然后返回。如果失败，就
继续遍历。如果整个遍历都结束了，就报告失败。
下面是该策略的实际应用：
theorem Nat.symm (x y : ℕ) (h : x = y) :
y = x :=
by prove_direct
这将打印「Proved directly by symm」。
该消息很有帮助，因为我们可以直接应用指定的定理，而无需依赖相对较慢的
prove_direct 策略。具体来说，我们可以结合hypothesis 来应用定理 symm，
如下所示：
theorem Nat.symm_manual (x y : ℕ) (h : x = y) :
y = x :=
by
apply symm
hypothesis
以下是本示例中出现的新常量列表：

8.8. 杂项策略

mkConstWithFreshMVarLevels : Name → TacticM Expr
liftMetaTactic : (MVarId → MetaM (List MVarId)) →
TacticM Unit
MVarId.apply : MVarId → Expr → MetaM (List MVarId)
getGoals : TacticM (List MVarId)
setGoals : List MVarId → TacticM Unit
MVarId.isAssigned : MVarId → TacticM Bool
getEnv : TacticM Environment
SMap.toList : ConstMap → List (Name × ConstantInfo)
Environment.constants : Environment → ConstMap
ConstantInfo.isUnsafe : ConstantInfo → Bool
至此，我们对 prove_direct 的审阅就结束了。在 mathlib 中也有一个类似
的策略，名为 apply?。

杂项策略

8.8

虽然本章的重点是开发新策略，但我们也遇到了三个预定义的策略。

skip
skip 策略在不执行任何操作的情况下成功。在我们开发自定义策略时，它有时
可用作构建基块。

done
如果还有一些剩余目标，done 策略会产生失败；否则，它在不执行任何操作的
情况下成功。与 skip 一样，它可以用作构建基块。

apply?
apply? 策略在加载的库中搜索能够精确证明目标的定理。成功时，它会建议
Formalization

一种形式为 exact … 的策略调用，该调用可以插入到形式化中。

8.9

新引入的 Lean 结构总结

声明
partial

作为可能不终止的元程序声明的前缀

引号
'n

引用一个字面名称

''n

引用一个经过阐释和检查的字面名称

策略
apply?

搜索能够证明当前目标的定理

done

如果还有目标剩余，则失败

skip

不执行任何操作

策略组合子
<;>

在第一策略产生的所有子目标上调用第二策略

all_goals

在每个目标上调用一次策略，并期望全部成功

any_goals

在每个目标上调用一次策略，并期望至少一个成功

first | ⋯ | ⋯

依次尝试这些策略，直到其中一个成功为止

repeat'

在所有目标和子目标上重复调用策略，直到失败为止

solve | ⋯ | ⋯

尝试通过依次尝试这些策略来完全证明当前目标

try

尝试调用一个策略；如果失败，则不执行任何操作
