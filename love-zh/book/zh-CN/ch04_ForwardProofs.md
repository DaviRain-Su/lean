# 第 4 章 正向证明

> 由 Lean-zh PDF 自动提取（2651–3837 行），代码块与公式尚需人工校对。

正向证明
策略证明是逆向进行的。它们从目标开始，将其归约到已有的定理和假设。通
常，以正向方式进行证明也是合理的：从已有的定理和假设出发，逐步向我们的目
标推进。

Structured Proofs

结构化证明就是一种支持这种推理方式的风格。策略证明往往易于编写但难于

阅读。大多数用户会结合这两种风格，根据具体情况使用最合适的一种。结构化证
明较高的可读性使其深受某些用户的喜爱。
Proof Terms

结构化证明是撒在 Lean 证明项之上的一层语法糖。它们使用 assume、have、
let 和 show 等关键字来构建，模仿了纸笔形式的证明。所有 Lean 的证明，无论
是策略证明还是结构化证明，在系统内部都会被归约成证明项。在第 3 章中，我们
已经看到了一些示例：给定假设 ha : a 和 hab : a → b，项 hab ha 即是命题 b 的
证明项，因此我们可以写成 hab ha : b。定理和假设的名称（例如 ha 和 hab）也
是证明项。沿着这一思路继续，给定 hbc : b → c，我们可以为命题 c 构造证明项
hbc (hab ha)。我们可以将 hab 视为一个函数，它能将 a 的证明转换为b 的证明，
对于 hbc 也同理。

Tactic Mode

结构化证明是 Lean 中的默认方式。它们可以在策略模式之外使用。要进入策略
模式，我们必须使用 by 命令。

Theorem Proving in Lean 4

此处涵盖的概念在 Lean 4 定理证明[12] 的第 2 至 4 章中有更详细的描述。Nederpelt 和 Geuvers 的教科书 [20] 是另一个有用的参考资料。

4.1

结构化证明
作为第一个例子，考虑以下结构化证明：
theorem fst_of_two_props :
∀a b : Prop, a → b → a :=

fix a b : Prop
assume ha : a
assume hb : b
show a from
ha
Quantifier

Implication

每个由 ∀ 量词绑定的变量以及蕴涵的每个假设，都在证明中通过使用 fix 和 assume
命令显式地引入。可以同时引入多个变量。我们经常会省略变量的类型，特别是当
Proposition

它们可以从名称中猜出时；然而，我们总是会写出完整的命题，并且每行放置一个，
Structured Style

以提高可读性 ⸺ 毕竟，这是结构化风格的主要潜在优势之一。结尾处的 show …
from 命令为了可读性重复了要证明的命题，并在关键字 from 之后给出证明。此时
Goal

的目标是 a b : Prop, ha : a, hb : b ⊢ a。
非正式地，我们可以将证明写为如下形式：
固定一些命题 a 和 b。
假设 (ha) a 且 (hb) b 为真。
我们必须证明 a。这根据 ha 平凡地得出。

u
t

Arbitrary but Fixed

一些作者会在「命题」之前插入诸如「任意但固定」之类的限定词，或者他们会
写「令 a 和 b 是某些命题」。所有这些变体都是等价的。此外，我们也可以用「QED」
来代替「u
t」以结束证明。

Hypothesis

上述 Lean 证明是非典型的，因为目标的目的出现在假设之中。通常，我们必须
执行一些中间推理步骤，其形式基本上是「由某某得到某某」。在 Lean 中，每个中
间步骤都采用 have 命令的形式，如下例所示：
theorem prop_comp (a b c : Prop) (hab : a → b) (hbc : b
→ c) :
a → c :=
assume ha : a
have hb : b :=
hab ha
have hc : c :=
hbc hb
show c from
hc
非正式地：
假设 (ha) a 为真。

4.1. 结构化证明

由 ha 和 hab，我们得到 (hb) b。
由 hb 和 hbc，我们得到 (hc) c。
我们必须证明 c。这根据 hc 平凡地得出。

u
t

Forward Proof

注意这是一个正向证明：它从假设 a 开始，逐个定理地向目标定理 c 推进。

Modus Ponens

肯定前件（「从 a 和 a → b 推导出 b」）通过简单的并置来表达（例如 hab ha）。
一般而言，fix–assume–show 骨架重复了定理的陈述。我们经常会根据目标
中的绑定变量来命名固定变量，正如我们在这里所做的那样，但这并不是强制性的。
Shadowing

此外，避免遮蔽已有变量是一个良好的实践。在最后一个 fix 或 assume 与 show
之间，我们可以根据需要的论证详细程度，放入任意数量的 have 命令。细节可以
增加可读性，但提供过多细节可能会令读者难以忍受。
have 命令的语法与 theorem 相似，但它出现在结构化证明之中。我们也可以
将 have 视为一个定义。在 have hb : b := hab ha 中，右侧的 hab ha 是 b 的证
明项，而左侧的 hb 被定义为该证明项的同义词。从此以后，hb 和 hab ha 即可互
换使用。由于 hb 和 hc 只被使用了一次，且它们的证明非常简短，专家们往往倾向
Inline

于将它们内联，把 hc 替换为 hbc hb，然后把 hb 替换为 hab ha，从而得到：
theorem prop_comp_inline (a b c : Prop) (hab : a → b)
(hbc : b → c) :
a → c :=
assume ha : a
show c from
hbc (hab ha)
一个典型的结构化证明具有如下的 fix–assume–have–show 格式：
theorem hr :
∀(c₁ : σ₁) … (cₗ : σₗ), P₁ → ⋯ → Pₘ → R :=
fix (c₁ : σ₁) … (cₗ : σₗ)
assume h₁ : P₁
⋮
assume hₘ : Pₘ
have k₁ : Q₁ := …
⋮
have kₙ : Qₙ := …
show R from …

4.2 结构化构造
上一节介绍了用于编写结构化证明的主要命令：fix、assume、have 和 show。
现在我们更系统地回顾结构化证明的各组成部分。

定理或假设
除了 sorry 之外，最简单的结构化证明是定理或假设的名称。如果我们有：
theorem two_add_two_Eq_four :
2 + 2 = 4 :=
by …
那么在此之后，定理名称 two_add_two_Eq_four 即可被用作 2 + 2 = 4 的证
明。例如：
theorem this_time_with_feeling :
2 + 2 = 4 :=
two_add_two_Eq_four
Instantiate

Discharge

我们可以将参数传递给定理，以实例化 ∀ 量词并解除假设。假设定理 add_comm
Instance

(m n : ℕ) : add m n = add n m 可用，并且我们想要证明它的实例 add 0 n = add
n 0。这可以通过使用定理名称和两个参数来巧妙地完成：
theorem add_comm_zero_left (n : ℕ) :
add 0 n = add n 0 :=
add_comm 0 n
这等价于策略证明 by exact add_comm 0 n，但更为简洁。exact 策略可以被
看作是 by 的逆操作。为何要进入策略模式又立刻离开它呢？
与 exact 和 apply 一样，定理或假设的陈述会在计算等价的意义下与当前目
标进行匹配。这提供了一些灵活性。

fix
fix names : type
Local Context

fix 命令将由 ∀ 绑定的量化变量从目标的目的移动到局部语境。它是 intro 策
略的结构化版本。
请注意，Lean 中用于固定变量的标准策略是 fun。我们倾向于使用由 LoVelib
提供的 fix，作为一个更具可读性的替代方案。我们将把 fun 保留用于指定匿名
函数。

4.2. 结构化构造

assume
assume name : proposition
assume 命令将最前面的假设从目标的目的移动到局部语境中。它可以被看作
是 intro 策略的结构化版本。
请注意，Lean 中用于陈述假设的标准策略是 fun。我们倾向于使用由 LoVelib
提供的 assume，作为一个更具可读性的替代方案。我们将把 fun 保留用于指定匿
名函数。

have
have 名称 : 命题 :=

证明
have 命令允许我们陈述并证明一个中间定理，该定理可以引用之前由 fix、
Tactical

assume 和 have 引入的名称。证明过程可以是策略式的，也可以是结构化的。通
常，我们倾向于使用结构化证明来勾勒主要论证过程，而在证明子目标或无关紧要
的中间步骤时则求助于策略式证明。
当我们将参数传递给定理名称时，会出现另一种混合情况。例如，给定 hab :
a → b 和 ha : a，策略 exact hab ha 将证明目标 ⊢ b。在这里，hab ha 是一个嵌
套在策略内部的证明项。

let


let 名称 : 类型 := 项
Local Definition

let 命令引入一个新的局部定义。它可以用于为证明后续部分多次出现的复杂
Computable Data

对象命名。它与 have 类似，但它是为可计算数据而不是证明设计的。展开或引入一
ζ-conversion

个 let 对应于 ζ-变换（第 3.2 节）。


构造「let 名称 : 类型 := 项」之后必须跟随换行符或分号（;）。

show
show 命题 from

证明
show 命令允许我们重复要证明的目标，这可以起到文档的作用。它还允许我们
在计算等价的意义下改写目标。如果我们不想重复目标且不需要改写它，可以直接
写 证明，而不必使用「show 命题 from 证明」的语法。证明可以是策略式的，也可
以是结构化的。

4.3

关于联结词和量词的正向推理
Logical Connectives Quantifier

以正向方式对逻辑联结词和量词进行推理，使用的是与策略模式（第 3.3 节）相

Introduction and Elimination Rules

Conjunction

同的引入和消去规则。通过几个例子可以初步体会其风格。让我们从合取开始：
theorem And_swap (a b : Prop) :
a ∧ b → b ∧ a :=
assume hab : a ∧ b
have ha : a :=
And.left hab
have hb : b :=
And.right hab
show b ∧ a from
And.intro hb ha
即便是不了解 And.left 等含义的读者，也能理解我们是从 a ∧ b 中提取出 a
和 b，然后将它们重新组合为 b ∧ a。数学家们理解这一证明可能比理解其对应的策
略证明要容易得多：
theorem And_swap_tactical (a b : Prop) :
a ∧ b → b ∧ a :=
by
intro hab
apply And.intro
apply And.right
exact hab
apply And.left
exact hab
一般来说，逆向证明更容易「不假思索地」推导出来，而且证明助手提供的大多
数自动化功能也是逆向工作的。这很有道理：假设你是在调查谋杀案的马普尔小姐
或赫尔克里·波洛。逆向调查会从犯罪现场开始，尝试提取线索，将少数嫌疑人与
犯罪联系起来。相比之下，正向调查可能会从询问多达 80 亿人开始，以确定他们是
否有不在场证明。哪种方法更有可能成功？
One-Point Rules

接下来的例子涉及到单点规则。在绑定变量实际上只能取一个值时，这些定理可
以用来消去量词。例如，命题 ∀n, n = 666 → beast ≥ n 可以简化为 beast ≥ 666。
下面的定理证明了这种简化的合理性：
theorem Forall.one_point {α : Type} (t : α) (P : α →
Prop) :
(∀x, x = t → P x) ↔ P t :=

4.3. 关于联结词和量词的正向推理

Iff.intro
(assume hall : ∀x, x = t → P x
show P t from
by
apply hall t
rfl)
(assume hp : P t
fix x : α
assume heq : x = t
show P x from
by
rw [heq]
exact hp)
证明过程看起来可能有些令人生畏，但其实并不难。关键在于一步步来。起初，
Equivalence

我们观察到目标是一个等价式，于是我们写下：
Iff.intro (_) (_)
其中 Iff.intro 是 ↔ 的引入规则（第 3.3 节）。
Placeholders

两个占位符对于使证明格式良好非常重要。我们使用圆括号是因为我们强烈怀
疑子证明是非平凡的。由于证明基本上就是项，也就是程序，我们在第 1.4 节给出的
建议在此同样适用，只需作相应调整（mutatis mutandis）：
关键在于，proof 应始终保持语法正确。我们在 Visual Studio Code 中唯
一应该看到的红色下划线应该出现在占位符下方。一般来说，开发 proof
的一个好的原则是，从可以编译的 proof 开始，进行尽可能小的更改，以
获得新的可以编译的 proof，并重复此过程，直到 proof 完成。
Subgoal

将鼠标悬停在第一个占位符上，会显示对应的子目标。我们可以看到 Lean 期望
Skeleton

得到 ⊢ (∀x, x = t → P x) → P t 的证明，于是我们提供了一个合适的骨架。蕴涵
的结构化证明由 assume 后跟 show 组成：
Iff.intro
(assume hall : ∀x, x = t → P x
show P t from
_)
(_)
剩余的每一个占位符都可以用结构化证明或策略证明来替代。为了消除第一个
Instance

占位符，我们进入策略模式，并将假设 ∀x, x = t → P x 的实例t = t → P t 应用于
Proof Obligation

目标 ⊢ P t。这留下了证明义务 t = t，我们可以使用 rfl 策略来完成它：

Iff.intro
(assume hall : ∀x, x = t → P x
show P t from
by
apply hall t
rfl))
(_)

第二个占位符代表 ⊢ P t → ∀x, x = t → P x。为了消除它，我们根据第一个蕴
涵的假设编写 assume，为 ∀ 编写 fix，为第二个蕴涵的假设编写 assume，并为结
论编写 show：
(assume hp : P t
fix x : α
assume heq : x = t
show P x from
_)
show 的证明是策略式的：我们将 ⊢ P x 中的 x 重写为 t，得到 ⊢ P t，这与假
设 hp 相符：
(assume hp : P t
fix x : α
assume heq : x = t
show P x from
by
rw [heq]
exact hp)
让我们检查一下单点规则在我们的引导示例上是否真的有效：
theorem beast_666 (beast : ℕ) :
(∀n, n = 666 → beast ≥ n) ↔ beast ≥ 666 :=
Forall.one_point _ _
它确实有效。除了 Forall.one_point _ _，我们也可以写成 Forall.one_point
666 (fun m ↦ beast ≥ m)。
最后，∃ 的单点规则演示了如何在结构化证明中使用 ∃ 的引入和消去规则：
theorem Exists.one_point {α : Type} (t : α) (P : α →
Prop) :
(∃x : α, x = t ∧ P x) ↔ P t :=
Iff.intro

4.3. 关于联结词和量词的正向推理

(assume hex : ∃x, x = t ∧ P x
show P t from
Exists.elim hex
(fix x : α
assume hand : x = t ∧ P x
have hxt : x = t :=
And.left hand
have hpx : P x :=
And.right hand
show P t from
by
rw [←hxt]
exact hpx))
(assume hp : P t
show ∃x : α, x = t ∧ P x from
Exists.intro t
(have tt : t = t :=
by rfl
show t = t ∧ P t from
And.intro tt hp))
虽然证明看起来可能有些复杂，但它的开发过程基本上是不假思索的，使用了
与 ∀ 单点规则证明相同的步骤。
首先，我们使用 ↔ 的引入规则：
Iff.intro (_) (_)
对于第一个占位符，我们需要在假设 ∃x : α, x = t ∧ P x 下提供 P t 的证明。
因此，我们将证明骨架展开为：
Iff.intro
(assume hex : ∃x : α, x = t ∧ P x
show P t from
_)
(_)
Witness

此时，我们想要从假设 hex 中提取 x 的见证。为了达到这个目的，我们使用 ∃
的消去规则：
Iff.intro
(assume hex : ∃x : α, x = t ∧ P x

show P t from
Exists.elim hex (_))
(_)

第一个占位符需要子目标 ⊢ ∀x, x = t ∧ P x → P t 的证明。我们先把它勾勒
出来：
Iff.intro
(assume hex : ∃x : α, x = t ∧ P x
show P t from
Exists.elim hex
(fix x : α
assume hand : x = t ∧ P x
show P t from
_))
(_)
请注意子证明是如何镜像子目标的：fix 对应 ∀，assume 对应 → 的假设，而
show 对应 → 的结论。现在我们可以访问见证 x 及其特征属性 x = t ∧ P x。
接下来，我们使用 have 命令和 ∧ 的消去规则（And.left 和And.right）提
Conjuncts

取 x = t ∧ P x 的两个合取项：
Iff.intro
(assume hex : ∃x : α, x = t ∧ P x
show P t from
Exists.elim hex
(fix x : α
assume hand : x = t ∧ P x
have hxt : x = t :=
And.left hand
have hpx : P x :=
And.right hand
show P t from
_))
(_)
现在我们可以尝试证明 P t。我们将 t 重写为 x，并应用假设 P x：
Iff.intro
(assume hex : ∃x : α, x = t ∧ P x
show P t from
Exists.elim hex

4.3. 关于联结词和量词的正向推理

(fix x : α
assume hand : x = t ∧ P x
have hxt : x = t :=
And.left hand
have hpx : P x :=
And.right hand
show P t from
by
rw [←hxt]
exact hpx))
(_)
对于剩余的占位符，我们首先根据子目标 ⊢ P t → ∃x : α, x = t ∧ P x 提供一
个证明骨架：
(assume hp : P t
show ∃x : α, x = t ∧ P x from
_)
然后我们使用 ∃ 的引入规则提供见证 t：
(assume hp : P t
show ∃x : α, x = t ∧ P x from
Exists.intro t (_))
接下来是更多的样板代码：
(assume hp : P t
show ∃x : α, x = t ∧ P x from
Exists.intro t
(show t = t ∧ P t from
_))
Reflexivity

最后的合取项 t = t ∧ P t 很容易证明：其左侧通过自反性得出，而右侧仅仅是
假设 hp。最后，我们得到：
(assume hp : P t
show ∃x : α, x = t ∧ P x from
Exists.intro t
(have tt : t = t :=
by rfl
show t = t ∧ P t from
And.intro tt hp))

Inhabitant

为了开发上述结构化证明，我们使用了与展示类型的居留元（第 1.4 节）时大致
相同的步骤，将函数箭头理解为蕴涵。这两个步骤之间的相似性并非巧合，正如我
们将在第 4.7 节中看到的那样。

4.4 计算式证明
Transitive Chain

在非正式数学中，我们经常将证明表示为等式、不等式或等价式的传递链（例
Calculational Proofs

如 a = b = c、a ≥ b ≥ c 或 a ↔ b ↔ c）。在 Lean 中，此类计算式证明由 calc 命
令提供支持，该命令提供了一种轻量级语法，并负责为等式及算术比较运算符等

Preregistered Relations Transitivity Theorems

预注册关系应用传递性定理。
其通用语法如下：
calc

项 0 运算符 1 项 1 :=
证明 1
_ 运算符 2 项 2 :=

证明 2
.
_ 运算符 n 项 n :=

证明 n
下划线（_）是语法的一部分。每个 证明 i 证明了陈述 项 i-1 运算符 i 项 i 。
Compatible

运算符 i 不必完全相同，但它们必须彼此兼容。例如，=、< 和 ≤ 是兼容的，而 > 和
< 则不兼容。
下面是一个简单的例子：
theorem two_mul_example (m n : ℕ) :
2 * m + n = m + n + m :=
calc
2 * m + n = m + m + n :=
by rw [Nat.two_mul]
_ = m + n + m :=
by ac_rfl
数学家们（假设他们愿意为这样一个平凡的结论提供证明）可能会将上述证明
大致写成如下形式：
2 * m + n = (m + m) + n
= m+n+m

（因为 2 * m = m + m）
Associativity Commutativity

（通过 + 的结合律和交换律）
u
t

4.5. 使用策略进行正向推理

在 Lean 证明中，下划线代表项 (m + m) + n，如果我们不使用 calc 来编写证
明，我们就不得不重复写出该项：
theorem two_mul_example_have (m n : ℕ) :
2 * m + n = m + n + m :=
have hmul : 2 * m + n = m + m + n :=
by rw [Nat.two_mul]
have hcomm : m + m + n = m + n + m :=
by ac_rfl
show _ from
Eq.trans hmul hcomm
请注意，使用 have 还需要我们显式地调用 Eq.trans，并为这两个中间步骤
命名。

4.5 使用策略进行正向推理
Tactic Mode

许多用户更喜欢策略模式而非结构化证明。但即使在策略模式下，以正向方式
进行推理、混合正向和逆向推理步骤也是非常有用的。结构化证明命令 have、let
和 calc 也可以作为策略使用，这使得上述操作成为可能。
下面的例子在一个我们已经见过好几次的定理上演示了 have 和 let 策略：
theorem prop_comp_tactical (a b c : Prop) (hab : a → b)
(hbc : b → c) :
a → c :=
by
intro ha
have hb : b :=
hab ha
let c' := c
have hc : c' :=
hbc hb
exact hc

have
have 名称 : 命题 :=

证明
have 策略允许我们在策略模式下陈述并证明一个中间定理。之后，该定理在

Goal State

目标状态中可用作一个假设。

let


let 名称 : 类型 := 项
let 策略允许我们在策略模式下引入一个局部定义。之后，所定义的符号及其
定义在目标状态中可用。

calc
calc

项 0 运算符 1 项 1 :=
证明 1
_ 运算符 2 项 2 :=

证明 2
.
_ 运算符 n 项 n :=

证明 n
calc 策略允许我们在策略模式下进入计算式证明（第 4.4 节）。该策略与同名
的结构化证明命令具有相同的语法。我们可以将作为策略的 calc … 看作是作为上
述结构化证明命令的 apply (exact calc …) 的别名。

4.6

依值类型
Dependent Type

依值类型 是

Dependent Type Theory

依值类型论这一系列逻辑系统的定义性特征。虽然你可能不熟

悉这个术语，但你很可能以某种形式熟悉这个概念。
Natural Number

考虑一个函数 pick，它接受一个自然数n（即来自 ℕ = {0, 1, 2, …} 的一个
值），并返回一个介于 0 和 n 之间的自然数。直观上，pick n 的类型应该是{0,
1, …, n}（即由所有满足 i ≤ n 的自然数组成的类型）。在 Lean 中，这个类型写
为 {i : ℕ // i ≤ n}。这就是 pick n 的类型。具有数学背景的读者可能会倾向于将
pick 看作一个由 ℕ

Index

Indexed Family of Terms

索引 的

索引项族：

(pick n : {i : ℕ // i ≤ n})n:ℕ
其中每个项的类型都依赖于索引 ⸺ 例如，pick 5 : {i : ℕ // i ≤ 5}。但是 pick
本身的类型是什么呢？我们希望表达 pick 是一个函数，它接受一个参数 n : ℕ，并
返回一个类型为 {i : ℕ // i ≤ n} 的值。为了体现这一点，我们可以写作：
pick : (n : ℕ) → {i : ℕ // i ≤ n}
这是一个依值类型：结果的类型依赖于参数 n 的值。（变量名 n 本身是无关紧要的；
我们也可以写成 m 或 x。）

4.6. 依值类型

除非另有说明，否则「依值类型」指的是依赖于一个（非类型）项的类型，如上
所示，其中 n : ℕ 是项，而 {i : ℕ // i ≤ n} 是依赖于它的类型。但是：
η-expanded

类型也可以依赖于另一个类型 ⸺ 例如，类型构造子 List，其 η-展开的变体
Domain and Codomain

Polymorphic Type

fun α : Type ↦ List α，或者具有相同定义域和陪域的函数的多态类型 fun
α : Type ↦ α → α。
Polymorphic Identity Function

项可以依赖于类型 ⸺ 例如，多态恒等函数fun α : Type ↦ fun x : α ↦ x。
当然，项也可以依赖于项 ⸺ 例如，fun n : ℕ ↦ n + 2。
综上所述，fun x ↦ t 共有四种情况：
函数体 (t)

参数 (x)

描述

项

依赖于

项

简单类型 λ-表达式

类型

依赖于

项

项
类型

依赖于
依赖于

Simply Typed λ-expression

狭义的依值类型

类型

Polymorphic Term

类型

Polymorphic Type Constructor

多态项

多态类型构造子

λ-cube

Axes

最后三行对应于 Henk Barendregt 的 λ-立方的三条轴。1
Generalized

第 1.3 节中介绍的 App 和 Fun 规则必须经过泛化，才能适用于依值类型：

C ⊢ t : (x : σ) → τ[x]

C⊢u:σ

C ⊢ t u : τ[u]

App0

C, x : σ ⊢ t : τ[x]
C ⊢ (fun x : σ ↦ t) : (x : σ) → τ[x]

Fun0

记号 τ[x] 代表一个可能包含 x 的类型，而 τ[u] 代表将其中所有出现的 x 替
换为 u 后得到的相同类型。
当 x 不出现在 τ[x] 中时，就出现了简单类型的情况。此时，我们可以简单地
将 (x : σ) → 写为 σ →。我们所熟悉的记号 σ → τ 等价于(_ : σ) → τ。很容易验
证，当 x 不出现在 τ[x] 中时，App0 和 Fun0 与 App 和 Fun 是重合的。
下面的例子演示了 App0 ：
⊢ pick : (n : ℕ) → {i : ℕ // i ≤ n}
⊢ pick 5 : {i : ℕ // i ≤ 5}

https://en.wikipedia.org/wiki/Lambda_cube

⊢5:ℕ

App0

下一个例子演示了 Fun0 :
α: Type, x : α ⊢ x : α
α: Type ⊢ (fun x : α ↦ x) : α → α

Fun or Fun0

⊢ (fun α : Type ↦ fun x : α ↦ x) : (α : Type) → α → α

Fun0

这一图景并不完整，因为我们只检查了项 ⸺ 即冒号（:）左侧的实体 ⸺ 是否
类型正确。冒号右侧的实体 ⸺ 即类型 ⸺ 也应该使用相同的类型系统进行检查。
例如，Nat.succ 的类型是 ℕ → ℕ，其类型是 Type。类型的类型（例如 Type 和
Universe

Prop）被称为宇宙。我们将在第 ?? 章中更深入地研究它们。
Universal Quantification

Dependent Type

值得注意的是，全称量化仅仅是依值类型的一个别名：∀x : σ, τ 是 (x : σ) →
τ 的缩写。这一点在下文中会变得更加清晰。

PAT 原理

4.7

Implication

你可能已经注意到，同样的符号 → 既用于蕴含
（例如 False → True），也作为
Type Constructor

Context

函数的类型构造子（例如 ℤ → ℕ）。如果没有语境，我们无法分辨 a → b 是指一个定
义域为 a 且陪域为 b 的函数类型，还是命题「a 蕴含 b」。
事实证明，这两个概念不仅在形式上「看起来」相同，它们「确实」是同一个东
PAT Principle

西。这被称为 PAT 原理，其中 PAT 是一个双重助记词：
Propositions as Types

PAT = 命题即类型

Proofs as Terms

PAT = 证明即项

此外，由于类型也是项，这也意味着命题也是项。然而，PAT 并不是一个四重助
Proofs as Types

记词（ PAT = , 证明即类型 ）。另请注意，并非所有类型都是命题，也并非所有项都
是证明。
通过使用项和类型来表示证明和命题，依值类型论实现了概念上的极大精简。
问题
「H 是 P 的证明吗？」
变得等同于
「项 H 的类型是 P 吗？」
因此，在 Lean 内部，并没有专门的证明检查器，只有类型检查器。证明由类型检查
器进行检查。
让我们逐一回顾这些主要实体。我们使用数学变量 σ 和 τ 表示类型；使用 P 和
Q 表示命题；使用 t、u 和 x 表示项；使用 h、G 和 H 表示证明。
从「命题即类型」开始，对于类型，我们有：

4.7. PAT 原理

σ → τ 是从 σ 到 τ 的函数类型。
(x : σ) → τ[x] 是从 x : σ 到 τ[x] 的依值函数类型。
相比之下，对于命题，我们有：
P → Q 可以读作「P 蕴含 Q」，或读作将 P 的证明映射到 Q 的证明的函数类型。
∀x : σ, Q[x] 可以读作「对于所有的 x，Q[x]」，或读作类型为 (x : σ) →
Q[x] 的函数类型，它将类型为 σ 的值 x 映射到 Q[x] 的证明。
继续看「证明即项」，对于项，我们有：
常量是一个项。
变量是一个项。
t u 是函数 t 对参数 u 的应用。
fun x ↦ t[x] 是一个将 x 映射到 t[x] 的函数。
相比之下，对于证明（即证明项），我们有：
定理或假设的名称是一个证明。
Instantiate

H t 是一个证明，它通过项 t 对证明 H 陈述中的首个 ∀ 量词进行实例化。
Discharge

H G 是一个证明，它通过证明 G 解除了 H 陈述中的首个前提。这种操作被称为

Modus Ponens

肯定前件。
fun h : P ↦ H[h] 是 P → Q 的一个证明，前提是对于所有 h : P，H[h] 都
是 Q 的证明。
fun x : σ ↦ H[x] 是 ∀x : σ, Q[x] 的一个证明，前提是对于所有 x : σ，H
[x] 都是 Q[x] 的证明。

最后两种情况由 Fun0 规则支持。与原始证明项不同，在结构化证明中，我们会
使用 assume 或 fix 来代替 fun，且为了可读性，我们通常还想使用 show 重复一
遍结论，如下所示：
theorem case_4 :
P → Q :=

theorem case_5 :
∀x : σ, Q[x] :=

assume h : P

fix x : σ

show Q from

show Q[x] from

H[h]

H[x]

依值类型论的术语可能会让人感到相当困惑，因为某些词具有狭义和广义之分。
下面的图表展示了重要词汇的各种含义：

项（Term）

类型（Type）

z }| {
2+2

:

z}|{
ℕ

True.intro :
|
{z
}

True
| {z }

证明（Proof）

: Type :

···

: Prop :

···

命题（Proposition）
宇宙（Universes）
类型（Types）

项（Terms）

Term

Typing Judgment

从广义上讲，任何表达式都是一个项，任何可能出现在类型判断（:）右侧的表达
Type

式都是一个类型，而任何出现在类型判断右侧，且其左侧为一个类型的表达式，都
Universe

是一个宇宙。这与将 t : u 读作「t 的类型为 u」以及宇宙是类型的类型这一概念是
一致的。
根据 PAT 原理，一些 Lean 命令虽然有两个名称，但本质上是相同的。fix 和
assume 就是这种情况；事实上，它们都是 LoVelib 中 fun 的别名。
还有一些成对出现的命令，其行为略有不同，例如 def/theorem 和 let/have
。根本区别在于：当我们定义某个函数或数据时，我们不仅关心其类型，还关心其
函数体 ⸺ 也就是行为。另一方面，一旦我们证明了一个定理，证明本身就变得
Irrelevant

Proof Irrelevance

无关紧要了。唯一重要的是存在一个证明。我们将在第 ?? 章回到证明无关性这一
话题。
Raw Proof Terms

下表总结了策略证明、结构化证明和原始证明项之间的区别：
策略证明

结构化证明

原始证明项

intro x

fix x : τ

fun x ↦

intro h

assume h : P

fun h ↦

have k := H

have k := H

(fun k ↦ …) H

let x := t

let x := t

(fun x ↦ …) t

exact (H : P)

show P from H

H:P

calc

calc

calc

注意，后跟 u 的 let x := t 本质上是编写 (fun x ↦ u) t 的一种方式，只不

Reduction

过 β-归约被禁用了。

4.8. 通过模式匹配与递归进行归纳

4.8

通过模式匹配与递归进行归纳
在第 3.6 节中，我们回顾了使用 induction 策略来进行归纳证明的方法。另
PAT Principle

一种更灵活的风格依赖于模式匹配和 PAT 原理。
Reverse

回想一下在第 2.2.3 节末尾给出的列表反转的定义：
def reverse {α : Type} : List α → List α
| []

=> []

| x :: xs => reverse xs ++ [x]
事实上，reverse 在 Lean 的标准库中以 List.reverse 的形式存在，其定义
更高效，但对于推理来说不那么方便。一个值得证明的有用性质是 reverse 是它
自身的逆：对于所有列表 xs，均有 reverse (reverse xs) = xs。然而，如果我
Induction Step

们尝试通过归纳法证明它，很快就会遇到障碍。其归纳步骤为：
: ∀xs, reverse (reverse xs) = xs ⊢ reverse (reverse xs ++ [x]) = x ::
xs ih
请注意，在这个双重 reverse 的「夹层」中出现了令人不悦的 ++ [x] 。我们
需要一种方法将外层的 reverse「分配」到 ++ 上，以获得一个能与归纳假设左侧
匹配的项。诀窍是证明并使用以下定理：
theorem reverse_append {α : Type} :
∀xs ys : List α,
reverse (xs ++ ys) = reverse ys ++ reverse xs
| [],

ys => by simp [reverse]

| x :: xs, ys => by simp [reverse, reverse_append xs]
该定理的证明与其说是证明，倒不如说更像是一个递归函数的定义。左侧的模
Constructor

式 [] 和 x :: xs 对应于 ∀ 量化变量 xs 的两个构造子。在每个 => 符号的右侧是对
应情况的证明。我们可以进行模式匹配的变量是那些出现在 ∀ 量词中的变量，按出
现顺序排列（此处为 xs 和 ys）。在归纳步的证明内部，归纳假设使用的名称与我们
正在证明的定理名称相同（reverse_append）。
我们显式地将 xs 作为参数传递给归纳假设。这限制了该假设，使其仅适用于
xs 而不适用于其他列表。特别是，这确保了定理不会应用于 x :: xs，否则会导
致循环证明：
「为了证明 reverse_append (x :: xs)，请使用 reverse_append
(x :: xs)」。Lean 的终止性检查器会发现该证明是非良基的并报错，但我们希望避
免这种情况。此外，显式参数 xs 也可以作为文档，实际上是在说：「我们需要的该
定理的唯一递归实例是在 xs 上的实例」。
Tactical Proof

作为参考，策略式证明如下：
theorem reverse_append_tactical {α : Type} (xs ys : List
α) :

reverse (xs ++ ys) = reverse ys ++ reverse xs :=
by
induction xs with
| nil

=> simp [reverse]

| cons x xs' ih => simp [reverse, ih]
如果我们用 [y] 代替 ys，该定理同样是可证明且有用的。但尽可能一般地陈述
定理是一个好习惯，这会使库更具可重用性。此外，在归纳证明中，为了获得足够
强的归纳假设，这通常是必需的。一般而言，寻找合适的归纳方式和定理需要思考
和创造力。
Lean 支持对多个变量同时进行模式匹配（例如上面的 xs 和 ys）。此时模式之
间用逗号分隔。其一般格式为：
theorem name ( 参数 1 : 类型 1 ) . . . ( 参数 m : 类型 m ) :

语句
| 模式 1 => 证明 1
.
| 模式 n => 证明 n
注意它与 def 的语法（第 2.2 节）有很强的相似性。事实上，这两个命令几乎完
Opaque

Transparent

全相同，但 theorem 认为定义的项或证明是不透明的，而 def 则保持其透明。由
于一旦定理被证明，实际的证明就不再重要了（第 ?? 章），因此稍后无需对其进行
展开。let 和 have 之间也存在类似的区别。

Proof Term

根据 PAT 原理，通过模式匹配和递归进行的归纳证明等同于一个递归证明项。当
我们调用归纳假设时，实际上只是在递归地调用一个递归函数。这解释了为什么归纳
假设与我们证明的定理同名。Lean 的终止性检查器被用来建立归纳证明的良基性。
有了 reverse_append 定理，我们可以回到最初的目标：
通过模式匹配和递归进行归纳在 Lean 用户中很受欢迎。它的主要优点是语法方
Well-founded Induction

Structural Induction

便，且支持良基归纳，这比 induction 策略（第 3.7 节）提供的结构归纳更强大。
然而，在本指南中，我们不需要良基归纳的全部威力。此外，出于微妙的逻辑原因，
Inductive Predicates

通过模式匹配和递归进行的归纳不适用于归纳谓词，这也是第 6 章的主题。基于这
些原因，我们通常更喜欢使用 induction 策略。

4.9

新引入的 Lean 结构总结

证明命令
assume

声明假设

calc

通过传递性组合证明

4.9. 新引入的 Lean 结构总结
fix

固定变量

have

声明中间定理

let

引入局部定义

show

声明目标

策略
calc

通过传递性组合证明

have

声明中间定理

let

引入局部定义

第二部分

函数式与逻辑编程
