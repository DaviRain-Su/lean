# 第 3 章 逆向证明

> 由 Lean-zh PDF 自动提取（1714–2650 行），代码块与公式尚需人工校对。

逆向证明
Tactic

Goal

Proposition

策略是在目标
（即要证明的命题）上操作的过程，要么完全证明它，要么产生
新的子目标，或者失败。当我们陈述一个定理时，定理的陈述就是初始目标。一旦
使用合适的策略消除了所有（子）目标，证明就完成了。此处介绍的大多数策略在
Theorem Proving in Lean 4

《Lean 4 定理证明》第 5 章中有更详细的说明 [12]。
Tactic

Backward

Goal

策略是一种逆向证明机制。它们从目标出发，向前推进到已证明的定理。考虑
定理 a、a → b、b → c 以及目标 ⊢ c。与类型判断类似，目标用符号 ⊢ 标识。一个
非形式的逆向证明如下：
为了证明 c，由 b → c 可知，只需证明 b 即可。
为了证明 b，由 a → b 可知，只需证明 a 即可。
为了证明 a，我们直接使用 a。
Backward Proof

u
t
it suffices to

逆向证明的显著特征是使用了「只需证明」这一短语。请注意我们是如何从一

Goal

个目标变换到另一个目标（⊢ c、⊢ b、⊢ a），直到没有目标需要证明为止的。相比之
Forward Proof

下，正向证明会从定理 a 开始，每次处理一个定理，最终推导出所需的定理 c：
由 a 与 a → b 可得 b。
由 b 与 b → c 可得 c，正如预期。
Forward Proof

Theorem

u
t

Goal

正向证明只操作定理，不操作目标。我们将在第 4 章深入学习正向证明。

非形式化的证明有时会混合使用这两种风格。只要能通过「为了证明……，只
Backward

需证明……」之类的措辞清晰地识别出逆向步骤，这种混合就是可行的。在目标前
面加上 ⊢ 符号有助于提醒这些断言尚未被证明。

Natural Deduction

你可能熟悉的另一种表达证明的格式是自然演绎。下面给出了对应于上述证明
的自然演绎推导：

⊢a→b
⊢b→c

⊢a
→E

⊢b
→E

⊢c
Forward Proof

Backward Proof

从上往下读时，该推导对应于正向证明；从下往上读时，它对应于逆向证明。

策略模式

3.1

在第 2 章中，每当需要证明时，我们只是简单地使用了 sorry 占位符。对于

Tactical Proof

Tactic Mode

策略证明，我们现在将写下 by 来进入策略模式。在此模式下，我们可以调用一系列
Tactic

策略。

Local Context

策略在目标上操作，目标由我们想要证明的命题 Q 和局部语境C 组成。局部语
Hypothesis

境由形如 x : σ 的变量声明和形如 h : P 的假设组成。我们用 C ⊢ Q 表示一个目标，
Goal

Target

其中 C 是变量和假设的列表，而 Q 是目标的目的。
为了让事情更具体，请考虑以下 Lean 示例：
theorem fst_of_two_props :
∀a b : Prop, a → b → a :=
by
intro a b
intro ha hb
apply ha
请注意，蕴含箭头 → 是右结合的；这意味着 a → b → a 与 a → (b → a) 相
同。直观地说，该陈述的意思是「a 蕴含了 b 蕴含 a」，或者等价地，「a 和 b 蕴含
a」。
我们将逐行审阅这个证明。
by
Keyword

Tactic Mode

Tactic

关键字 by 表示我们进入了策略模式，在该模式下我们可以通过策略来指定证
明。随后是策略，每行一个，并且所有策略的缩进相同。
如果我们将光标置于 by 关键字上，Visual Studio Code 会报告当前的目标仅仅
是原始定理的陈述：
⊢ ∀a b : Prop, a → b → a
接下来的策略
intro a b

3.1. 策略模式

Free Variable

Bound Variable

告诉 Lean 固定两个自由变量 a 和 b，它们对应于同名的两个绑定变量。该策略
模仿了数学家在纸上的工作方式：为了证明一个 ∀ 量化的命题，只需证明该命题对
于绑定变量的某些任意但固定的值成立即可。目标变为：
a b : Prop ⊢ a → b → a
Local Context

其中命题 a 和 b 在目标的局部语境（即 ⊢ 符号左侧）中声明。我们通常为自由变量
使用与绑定变量相同的名称，正如这里所做的，但这并不是强制性的。通常，使用
唯一的名称并避免遮蔽现有变量是良好的做法。
除了使用两个变量名调用一次 intro 之外，我们也可以调用两次 intro，即
intro a 后面跟着 intro b。通常，每个带有 n 个参数的 intro 调用都会提取接
下来的 n 个量化的变量。
intro 策略不仅限于量化变量。在我们的证明脚本中，
intro ha hb
告诉 Lean 将（来自 a → b → 的）前提 a 和 b 移至局部语境，并称这些假设为 ha
和 hb。
事实上，为了证明一个蕴含式，只需将其左侧作为假设，并证明其右侧即可。于
是目标变为：
a b : Prop, ha : a, hb : b ⊢ a
习惯上会在假设名称前加前缀 h。
最后，策略
apply ha
告诉 Lean 将名为 ha 的假设 a 与目标 ⊢ a 进行匹配。由于 a 在语法上等价于
a，匹配成功。这就完成了证明。
非形式化地，我们可以用类似纸笔数学的风格，将证明写成如下形式：
令 a 和 b 为命题。
假设 (ha) a 和 (hb) b 为真。
为了证明 a，我们需要使用假设 ha.

u
t

（数学家可能会使用数字标签，如 (1) 和 (2)，而非具有描述性的假设名称。）
回到 Lean 证明，我们可以通过将变量和假设声明为定理的参数，来避免调用
intro，如下所示：
theorem fst_of_two_props_params (a b : Prop) (ha : a) (
hb : b) :
a :=
by apply ha

目标是：
a b : Prop, ha : a, hb : b ⊢ a

定理的所有参数在语境中立即生效。就像前面的例子一样，该目标通过 apply ha
即可证明。
下面是一个连续使用多个 apply 的例子：
theorem prop_comp (a b c : Prop) (hab : a → b) (hbc : b
→ c) :
a → c :=
by
intro ha
apply hbc
apply hab
apply ha
站在数学家的角度，我们可以将最后的证明表述如下：
假设 (ha) a 为真。
为了证明 c，根据假设 hbc，只需证明 b 即可。
为了证明 b，根据假设 hab，只需证明 a 即可。
为了证明 a，我们使用假设 ha。

u
t

3.2 基本策略
intro 和 apply 策略是策略证明的基础。其他基本策略包括 exact、
assumption、
rfl 和 ac_rfl。如果我们有足够的耐心使用这些策略进行推理，而不依赖更强大
Proof Automation

的证明自动化，它们可以发挥很大作用。它们也可以用来解决各种逻辑谜题。

下面，大而细的方括号
表示可选的语法。

intro
intro



名字 1 . . . 名字 n


Assumption

Target

intro 策略将最前面的 ∀ 量化变量或最前面的前提 a → 从目标的目的移动到
局部语境中。该策略接受一个可选参数，用于指定语境中变量或前提的名称，从而
覆盖默认名称。如果提供了多个名称（即 n > 1），则会移动多个变量或前提。
给定一个可证明的目标，intro 总是会产生一个可证明的目标。因此，它被称
Safe

为是安全的。

3.2. 基本策略

apply
apply 定理或假设
Target

apply 策略将目标的目的与指定定理或假设的结论进行匹配，并将该定理或假
Up to Computation

设的前提作为新的目标加入。匹配是在计算等价的意义下进行的。
我们必须谨慎调用 apply，因为它可能将一个可证明的目标转换为不可证明的
子目标。例如，如果目标是 ⊢ True，而我们 apply 了定理 False → True，则结
论 True 会与目标的目的 True 匹配，最后我们得到了不可证明的子目标 ⊢ False。
Unsafe

我们称 apply 是不安全的。

exact
exact 定理或假设
exact 策略将目标的目的与指定的定理或假设进行匹配，从而证明该目标。在
这种情况下，我们通常也可以使用 apply，但 exact 能更好地传达我们的意图。

assumption
assumption 策略从局部语境中寻找一个与目标的目的匹配的假设，并将其应
用以证明目标。

rfl
Up to Computation

rfl 策略证明形如 ⊢ l = r 的目标，其中左右两边 l 和 r 在计算等价的意义下
Expansion

在语法上是相等的。计算首先是指定义的展开，但也包括将匿名函数应用于参数的

Reduction

Conversion

归约等等。这些转换有传统的名称。下面列出了主要转换及其示例，其中全局语境
包含 def double (n : ℕ) : ℕ := n + n：
α-转换

(fun x ↦ f x) = (fun y ↦ f y)

β-转换

(fun x ↦ f x) a = f a

δ-转换

double 5 = 5 + 5

ζ-转换

(let n : ℕ := 2; n + n) = 4

η-转换

(fun x ↦ f x) = f

ι-转换

Prod.fst (a, b) = a
Reduction

将这些转换作为从左向右的重写规则来重复应用的过程称为归约；将转换反向
Expansion

应用一次称为展开。

简而言之，为了证明 ⊢ l = r，rfl 策略会展开 l 和 r 中的定义，并执行 β-归
约及其他归约。如果在归约过程中，l 和 r 在某一点变得语法上完全相同，则证明
成功。通常，rfl 在数学家会说「根据定义」的地方起作用。

ac_rfl
Associativity

ac_rfl 与 rfl 类似，但它可以用于在结合律
（例如 (a + b) + c = a + (b + c)）

Commutativity

和交换律（例如 a + b = b + a）的意义下进行推理。这适用于已注册为具有结合律和
交换律的二元运算，例如算术类型上的 + 和 *，以及集合上的 ∪ 和 ∩。我们将在第 3.6
节中看到一个例子。

sorry
我们在第 2 章中遇到的 sorry 证明命令可以作为策略在策略证明中的任何位
置使用。它「证明」了当前目标，但实际上并未进行证明。请谨慎使用。

3.3

关于连结词和量词的推理
在学习对自然数、列表或其他数据类型进行推理之前，我们必须首先学习如何
Conjunction

对 Lean 的逻辑连结词和量词进行推理。让我们从一个简单的例子开始：合取（∧）的

Commutativity

交换律。
theorem And_swap (a b : Prop) :
a ∧ b → b ∧ a :=
by
intro hab
apply And.intro
apply And.right
exact hab
apply And.left
exact hab
此时，我们建议您将光标置于 Visual Studio Code 中的示例之上，以查看证明
状态的序列。通过将光标放在每个命令之上或紧随其后，您可以查看该行命令的效
果。对于最后一行，Lean 只会报告「No goals」。
该证明是典型的 intro–apply–exact 组合。它使用了以下定理：
And.intro : ?a → ?b → ?a ∧ ?b
And.left : ?a ∧ ?b → ?a
And.right : ?a ∧ ?b → ?b

3.3. 关于连结词和量词的推理

Instantiate

Target

其中问号（?）表示可以被实例化的变量 ⸺ 例如，通过将目标的目的与定理的

Conclusion

Metavariable

结论进行匹配。这些变量被称为元变量。
Conjunction

Introduction Rule

Elimination Rule

上述三个定理是与合取相关的引入规则和两个消去规则。逻辑符号（例如 ∧）的
引入规则是结论以该符号作为最外层符号的定理。对偶地，消去规则在其前提中包
How to Prove

含该符号。对于每个逻辑符号，引入规则告诉我们如何证明一个以该符号为最外层
How we must have proved

位置的命题。相比之下，消去规则告诉我们该命题必然是如何被证明的。
在上述证明中，我们应用 ∧ 的引入规则来证明目标 ⊢ b ∧ a，并应用两个消去规
则从假设 a ∧ b 中提取 b 和 a。我们在 ⊢ b ∧ a 中通过使用所谓的引入规则来「消去」
Backward

∧，这听起来可能很奇怪。该术语之所以是「逆向」的，是因为我们的证明是逆向的。
Instantiate

问号也可能出现在目标中。它们表示可以任意实例化的变量。在上面的证明过
程中，在 apply And.right 策略之后，我们得到了目标：
a b : Prop, hab : a ∧ b ⊢ ?left.a ∧ b
Metavariable

其中 ?left.a 是一个元变量。策略 exact hab 将（目的中的）?left.a 与（hab

Unification

中的）a 进行匹配。这种通过实例化变量使两个项在语法上等价的过程称为合一。

Matching

匹配是合一的一种特殊情况，即其中一个项不包含变量，如本例所示。
顺便提一下，每当元变量出现在目标中时，还会出现额外的子目标，每个元变
量的类型也会作为一个子目标（例如 ⊢ Prop）。这些令人困惑的子目标仅仅是一个
提醒，说明我们需要用正确类型的项来实例化这些元变量。我们通常可以忽略这些
子目标。一旦元变量被实例化（通常是在我们解决另一个子目标时），其相关的子目
标也会随之消失。

Unification

Up to Computation

在 Lean 中，合一是在计算等价的意义下进行的。例如，项 (fun x ↦ ?m) a 和
b 可以通过取?m := b 来合一，因为 (fun x ↦ b) a 和 b 在 β-转换的意义下是语法
相等的。
下面是定理 And_swap 的另一种证明：
theorem And_swap_braces :
∀a b : Prop, a ∧ b → b ∧ a :=
by
intro a b hab
apply And.intro
· exact And.right hab
· exact And.left hab
该定理的陈述方式有所不同，将 a 和 b 作为 ∀ 量化变量，而不是定理的参数。
Intro

从逻辑上讲，这是等价的，但在证明中我们必须在 hab 之外额外引入 a 和 b。
另一个区别是在子证明前面使用了项目符号（·）。当我们面临两个或多个目
Tactic Combinator

标需要证明时，通常良好的风格是在每个子证明前面加上一个点。策略组合子·

专注于第一个子目标；其后的策略必须证明该子目标。在我们的例子中，apply
And.intro 策略创建了两个子目标：⊢ b 和 ⊢ a。
Juxtaposition

第三个区别是，我们现在通过并置，直接将 And.right 和 And.left 应用于

Hypothesis

假设a ∧ b，分别获得 b 和 a，而不是等待定理的前作为新的子目标出现。这是在

Backward Proof

Forward

Discharge

逆向证明中迈出的微小正向步骤。同样的语法既可以用于解除（即证明）一个假设，
Instantiate

也可以用于实例化一个 ∀ 量词。这种方法的一个好处是，我们避免了可能令人困惑
的 ?left.a 元变量。
在下一个例子中，我们使用并置来实例化 ∀ 量词：
theorem f5_if (h : ∀n : ℕ, f n = n) :
f 5 = 5 :=
by exact h 5
如果 h 是定理 ∀n, f n = n，那么 h 5 就是定理 f 5 = 5。
Disjunction

析取
（∨）的引入规则和消去规则如下：
Or.inl : ∀b : Prop, ?a → ?a ∨ b
Or.inr : ∀b : Prop, ?a → b ∨ ?a
Or.elim : ?a ∨ ?b → (?a → ?c) → (?b → ?c) → ?c

Or.inl（「左侧引入」）和 Or.inr（「右侧引入」）中的 ∀ 量词可以通过简单的

Juxtaposition

并置，将定理名称应用于我们要实例化的值来直接实例化。因此，Or.inl False 对
Forward

应于定理 ?a → ?a ∨ False。这就是正向风格。
或者，我们可以在形如 … ⊢ c ∨ d 的目标上调用 apply Or.inl。这会将定理
Backward

中的 ?a 设为 c，?b 设为 d。新的子目标是 … ⊢ c。这就是逆向风格。
Unsafe

Or.inl 和 Or.inr 都是不安全的：如果您应用了两者中错误的一个，或者在
证明中过早地应用了其中任何一个，您可能会得到一个不可证明的子目标。如果您
考虑可证明的目标 ⊢ True ∨ False，就可以很容易地看到这一点：apply Or.inr
会产生不可证明的子目标 ⊢ False。
Or.elim 规则乍一看可能违反直觉。本质上，它指出如果我们有 a ∨ b，那么
为了证明任意的 c，只需证明在 a 成立时 c 成立，以及在 b 成立时 c 成立即可。您
可以将(?a → ?c) → (?b → ?c) → ?c 看作是一个巧妙的技巧，仅使用蕴含来表
达析取的含义。
Equivalence

等价
（↔）的引入规则和消去规则如下：
Iff.intro : (?a → ?b) → (?b → ?a) → (?a ↔ ?b)
Iff.mp : (?a ↔ ?b) → ?a → ?b
Iff.mpr : (?a ↔ ?b) → ?b → ?a

Existential Quantification

存在量化（∃）的引入规则和消去规则如下：

3.3. 关于连结词和量词的推理

Exists.intro : ∀w, (?P w → (∃x, ?P x))
Exists.elim : (∃x, ?P x) → (∀a, ?P a → ?c) → ?c
Witness

Instantiate

∃ 的引入规则可以用于为一个存在量词提供一个证据进行实例化 ⸺ 证据是使
量词的主体为真的值。例如：
theorem Exists_double_iden :
∃n : ℕ, double n = n :=
by
apply Exists.intro 0
rfl
Forward

同样地，我们以正向方式实例化一个 ∀ 量词：Exists.intro 0 是定理 ?P 0
Unsafe

→ (∃x, ?P x)。该规则是不安全的：为 x 选择错误的证体会导致不可证明的目标。
例如，如果目标是 ⊢ ∃n, n > 5，而我们选择 3 作为证体，最后会得到不可证明的子
目标 ⊢ 3 > 5。
∃ 的消去规则让人联想到 ∨ 的消去规则。事实上，一种富有成效的思考量化
Infinitary

∃n, ?P n 的方式是，将其看作是一个可能无穷的析取 ?P 0 ∨ ?P 1 ∨ ⋯。类似地，
∀n, ?P n 可以被看作是 ?P 0 ∧ ?P 1 ∧ ⋯。
对于真（True），只有一个引入规则：
True.intro : True
Hypothesis

「真」不包含任何信息。如果它作为假设出现，它是完全没用的，并且没有消去
规则可以从中提取任何信息。下面第 3.8 节中描述的 clear 策略可以用来移除此类
无用的假设。
对偶地，对于假（False），只有一个消去规则：
False.elim : False → ?a
无法证明「假」，但如果我们以某种方式从某处（例如从假设中）得到了它，那
么我们可以推导出任何东西（?a）。
Negation

事实上，否定（Not）是根据蕴含和「假」来定义的：¬ a 是 a → False 的缩写。
直观上，它们的含义相同。我们可以把「非 a」看作是说「a 会导致荒谬的事情（因
此非 a）」。

Classical

Lean 的逻辑是经典的，支持

Law of Excluded Middle

排中律

和

Proof by Contradiction

反证法：

Classical.em : ∀a : Prop, a ∨ ¬ a
Classical.byContradiction : (¬ ?a → False) → ?a

Universal Quantification

dogs that did not bark

蕴含（→）和全称量化（∀）就像是谚语中那种「不叫的狗」。它们没有引入规则
Application

或消去规则。相反，对于这两者，intro 策略就是引入原理，而应用
（如 λ-演算中那
样）就是消去原理。例如，给定定理 hab : a → b 和 ha : a，应用 hab ha 就是一
个陈述 b 的定理。
为了证明涉及连结词和量词的逻辑谜题，我们提倡一种「盲目」的、
「电子游戏」
式的推理风格，它主要依赖于intro 和 apply 等基本策略。以下是一些通常奏效的
策略：
如果目标的目的是一个蕴含式 P → Q，调用 intro hP 将 P 移动到你的假
设中：…, hP : P ⊢ Q。
如果目标的目的是一个全称量化 ∀x : σ, Q，调用 intro x 将 x 移动到局部
语境中：…, x : σ ⊢ Q。
寻找一个结论与目标的目的形状相同（可能包含可以匹配的变量）的定理或假
设，并对其调用 apply。例如，如果目标的目的是 Q，而你有一个形如 hPQ :
P → Q 的定理或假设，请尝试 apply hPQ。
一个被否定的目标 ⊢ ¬ P 在计算上等价于 ⊢ P → False，因此你可以调用 intro
hP 来产生子目标 hP : P ⊢ False。通过调用 rw [Not]（在第 3.5 节中描述）
来展开否定的定义通常是一个好策略。
有时你可以通过输入 apply False.elim 将目标替换为 False 来取得进展。
作为下一步，你通常会 apply 一个形如 P → False 或 ¬ P 的定理或假设。
当你面临多个选择时（例如在 Or.inl 和 Or.inr 之间选择），请记住你所做
Dead End

Backtrack

的选择，并在遇到死胡同或感觉没有进展时进行回溯。
如果你怀疑自己可能遇到了死胡同，请检查在给定的前提下目标是否确实是可
证明的。即使你最初陈述的是一个可证明的定理，当前的目标也可能是不可证
明的（例如，如果你应用了不安全的规则）。

3.4 关于相等的推理
Equality

相等
（=）也是一个基本的逻辑常量。它的特征由以下引入规则和消去规则给出：
Eq.refl : ∀a, a = a
Eq.symm : ?a = ?b → ?b = ?a
Eq.trans : ?a = ?b → ?b = ?c → ?a = ?c
Eq.subst : ?a = ?b → ?P ?a → ?P ?b
Equivalence Relation

前三个定理是指定 = 为等价关系的引入规则。第四个定理是一个消去规则，它
允许我们在任意语境（由元变量 ?P 表示）中进行等量替换。

3.5. 重写策略

下面的例子展示了其中一些规则的应用。我们应用 Eq.trans 和 Eq.symm，利
用等式 a = b 和 c = b 来证明 a = c：
theorem Eq_trans_symm {α : Type} (a b c : α)
(hab : a = b) (hcb : c = b) :
a = c :=
by
apply Eq.trans
· exact hab
· apply Eq.symm
exact hcb
由于这种重写操作非常常见，Lean 提供了一个 rw 策略来实现相同的结果。如
果适用，该策略还会自动应用 rfl：
theorem Eq_trans_symm_rw {α : Type} (a b c : α)
(hab : a = b) (hcb : c = b) :
a = c :=
by
rw [hab]
rw [hcb]
关于解析的说明：相等的结合优先级高于逻辑连结词。因此，a = b ∧ c = d 被
解读为 (a = b) ∧ (c = d)。

3.5 重写策略
重写策略 rw 及其相关的 simp 进行等量替换。它们将等式作为自左向右的重写
规则，将出现的左侧项替换为右侧项。
默认情况下，它们在目标的目的上操作，但也可以通过 at 关键字来重写指定的
假设：
at h1 . . . hn

重写指定的假设

at *

重写所有假设和目标

rw


rw [定理或常量 1 , . . . , 定理或常量 n ] at 位置
rw 策略使用一个或多个等式作为自左向右的重写规则来重写目标。它会搜索与
第一个等式左侧匹配的第一个子项；一旦找到，该子项的所有出现都会被替换为右
侧项。如果等式包含变量，则会根据需要进行实例化。要反向使用定理（即作为自右

向左的重写规则），请在定理名称前加上一个短左箭头（←）。如果指定了多个等式，
它们将依次被应用。
因此，给定定理 hg : ∀x, g x = f x 和目标 ⊢ h (f a) (g b) (g c)，策略 rw [
hg] 会产生子目标 ⊢ h (f a) (f b) (g c)，而 rw [←hg] 则产生子目标 ⊢ h (g a) (g b) (g c)。
除了定理之外，我们还可以指定一个常数的名称。这将尝试使用该常数的定义
等式之一作为重写规则。

simp


simp at 位置
Simp Set

simp 策略穷尽地使用一组标准的重写规则（称为 simp 集合）来重写目标。simp
集合中的每个等式都用作自左向右的重写规则。simp 集合包含关于预定义符号（例
如算术和列表运算符）的各种规则，并且可以通过在适当的定理上添加 @[simp] 属
性来扩展。



simp [定理或常量 1 , . . . , 定理或常量 n ] at 位置

对于上述 simp 变体，指定的定理会被临时添加到 simp 集合中。在定理列表
中，星号（*) 可以用来代表所有假设。定理名称前的减号（-）会临时将该定理从
simp 集合中移除。一个既能简化假设又能利用结果简化目标的目的的强大命令是
simp [*] at *。
给定定理 hg : ∀x, g x = f x 和目标 ⊢ h (f a) (g b) (g c)，策略 simp [hg]
产生子目标 ⊢ h (f a) (f b) (f c)，其中 g b 和 g c 都已被重写。除了定理之外，
我们还可以指定常数的名称。这会临时将常数的定义等式添加到 simp 集合中。
说到这里，你可能会想，
「那么 simp 到底做了什么呢？」当然，你可以去研究源
代码或查阅科学文献。但这可能不是对你时间最有效的利用。事实上，即使是证明
助手的专家用户也并不完全理解他们每天使用的策略的行为。最成功的用户会采取
一种轻松、随性的态度，依次尝试各种策略，并研究出现的子目标（如果有的话），
看看自己是否走在正确的道路上。
随着你不断地使用 simp 和其他策略，你会对它们擅长处理什么样的目标产生
一些直觉。这是交互式定理证明只能通过实践来学习的众多原因之一。通常，你不
会确切地理解 Lean 做了什么 ⸺ 为什么一个策略成功了，或者失败了。定理证明有
The Hitchhiker’s Guide to the Galaxy

时会非常令人沮丧。
《银河系漫游指南》封面上的那些醒目而友好的大字所给出的建
Don’t Panic

议在这里同样适用：不要恐慌。

3.6. 数学归纳法证明

3.6 数学归纳法证明
Structural induction

induction 归纳策略对一个归纳类型的值执行结构归纳。结构归纳意味着归纳
遵循归纳类型的结构。对于由 Nat.zero 和 Nat.succ 构造的自然数，结构归纳对
应于标准的数学归纳法：要证明 p n，只需证明 p 0 和 ∀k, p k → p (k + 1)。借助
induction，我们可以推理 2.2 一节中通过递归定义的加法和乘法运算。
加法是通过对其第二个参数进行递归定义的。我们将证明两个定理，add_zero
和 add_succ，它们为我们提供了在第一个参数上递归的替代等式。我们从 add_zero
开始：
theorem add_zero (n : ℕ) :
add 0 n = n :=
by
induction n with
| zero

=> rfl

| succ n' ih => simp [add, ih]
Induction

归纳策略后面跟着两个由它们对应的构造子标识的子证明。此外，任何特定于

子证明的变量或假设都可以明确地在构造子名称之后命名。
第一个情况，标记为 zero，对应于基本情况 ⊢ add 0 0 = 0。第二个情况，标
记为 succ，对应于归纳步骤

n' : ℕ, ih : add 0 n' = n' ⊢ add 0 (Nat.succ n') = Nat.succ n'
succ 后面指定的名称 n' 和 ih 分别是我们给 Nat.succ 的参数和归纳假设
所起的名称。用其他名称也可以，但通常将归纳假设称为 ih。
我们可以继续通过结构归纳证明定理：
theorem add_succ (m n : ℕ) :
add (Nat.succ m) n = Nat.succ (add m n) :=
by
induction n with
| zero

=> rfl

| succ n' ih => simp [add, ih]
theorem add_comm (m n : ℕ) :
add m n = add n m :=
by
induction n with
| zero

=> simp [add, add_zero]

| succ n' ih => simp [add, add_succ, ih]
theorem add_assoc (l m n : ℕ) :
add (add l m) n = add l (add m n) :=
by
induction n with
| zero

=> rfl

| succ n' ih => simp [add, ih]
一旦我们证明了一个二元运算满足交换律和结合律，就应该让 Lean 的自动化机
制，尤其是 ac_rfl 知道这一点。下面的命令即为 add 实现了这一点：
instance Associative_add : Std.Associative add :=
{ assoc := add_assoc }
instance Commutative_add : Std.Commutative add :=
{ comm := add_comm }
（instance 机制将在第 5 章讲解。）下面的例子使用 ac_rfl 策略，在 add 的
结合律与交换律意义下进行推理：
theorem mul_add (l m n : ℕ) :
mul l (add m n) = add (mul l m) (mul l n) :=
by
induction n with
| zero

=> rfl

| succ n' ih =>
simp [add, mul, ih]
ac_rfl
下面给出一些关于如何使用数学归纳法进行证明的提示：
按照目标中出现的某个函数的定义结构，来进行归纳证明，通常是有益的。特
别地，如果一个函数是通过对其第 n 个参数进行递归来定义的，那么对该参数
进行归纳通常是合理的。
如果归纳的基本情况难以证明，这通常表明选错了变量，或者需要先证明一些
辅助引理。

3.7

归纳策略
我们已经在上面看到了 induction 策略的实际用法。为方便查阅，下面给出

它的完整语法。一般而言，本指南正文中介绍的每一种策略，都会在名为「X 策略」
的小节中附带此类语法描述。

3.8. 清理策略

induction

induction 项 with
| 构造子 1 名字 1 => 策略 1
.
| 构造子 n 名字 n => 策略 n



induction 策略对指定项执行结构归纳。这会生成与该项类型定义中构造子数
量相同的子目标。在对应递归构造子（如 Nat.succ 或 List.cons）的子目标中，
归纳假设将作为可用假设出现。可选的名字 名字 1 、…和 名字 n 用于命名生成的变
量或假设。

清理策略

3.8

下面这些策略有助于简化证明目标。目前我们尚未用到它们，但在探索证明思
路的过程中，它们会很有帮助。

clear
clear 变量或假设 1 . . . 变量或假设 n
只要指定的变量和假设没有在目标的其他任何地方使用，clear 就会移除它们。

rename
rename 变量的类型或假设的命题 => 新名字
rename 策略会修改变量或假设的名字。

3.9 新引入的 Lean 结构总结
属性
@[simp]

将定理添加到 simp 集

证明命令
by

开始一个策略式的证明

策略
ac_rfl

证明 l = r 满足交换律和结合律

apply

将目标的目的与定理的结论进行匹配

assumption

使用假设证明目标

clear

从目标中移除变量或假设

exact

使用指定的定理证明目标

induction

对归纳类型的变量进行结构归纳

intro

将 ∀-量化的变量移入到目标的假设中

rename

重命名变量或假设

rfl

证明 l = r 计算等价

rw

使用给定的定理作为重写规则重写一次

simp

使用一组预先注册的重写规则穷举重写

sorry

表示缺少证明

策略组合子
·

专注于第一个子目标；需要证明该子目标。
