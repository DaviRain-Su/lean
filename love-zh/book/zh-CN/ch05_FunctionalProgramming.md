# 第 5 章 函数式编程

> 由 Lean-zh PDF 自动提取（3838–5056 行），代码块与公式尚需人工校对。

函数式编程
Typed Functional Programming

Inductive Type Proofs by Induction Recursive Function

我们将深入探讨带类型函数式编程的本质：
归纳类型、 归纳证明、 递归函数、

Pattern Matching

Structure

Record

Type Class

模式匹配、 结构体（记录）以及类型类。这里涵盖的概念在《Lean 4 定理证明》[12]
的第 7 到 10 章中有更详细的描述。

5.1 归纳类型
归纳类型模仿了带类型函数式编程语言（如 Haskell、ML、OCaml）中的数据类
Sealed Class

型。它们也让人联想到 Scala 中的密封类。在第 2 章中，我们看到了一些基本的归纳
类型：自然数、算术表达式类型以及有限列表。在本章中，我们将重新审视列表并
Vector

研究二叉树。我们还将简要了解长度为 n 的向量，这是一种依值类型。
回想一下作为归纳类型的自然数定义：
inductive Nat : Type where
| zero : Nat
| succ : Nat → Nat
这定义了类型 Nat 以及两个常量 Nat.zero 和 Nat.succ，它们被称为构造子。该
定义还断言了构造子的一些性质。此外，它还引入了额外的常量，用于在内部支持
归纳和递归。
正如我们在第 2.1 节中看到的，归纳类型是一种其成员全部由（且仅由）有限次
应用其构造子所构建的值组成的类型。格言：
No junk

无杂质：类型中不包含除使用构造子可表达的值之外的任何值。
No confusion

无混淆：使用不同构造子组合构建的值是不同的。

对于自然数，「无杂质」意味着不存在无法使用 Nat.zero 和 Nat.succ 的有
限组合来表达的特殊值（如 −1、ε、∞ 或 NaN）；「无混淆」则确保了对于所有 n，
Injective

Nat.zero ≠ Nat.succ n，且 Nat.succ 是单射的。
此外，归纳类型的值总是有限的。无限项
Nat.succ (Nat.succ (Nat.succ (Nat.succ …)))
并不是一个值。同样地，也不存在一个值 n 使得 Nat.succ n = n，这一点我们将在
下文中证明。
归纳类型使用起来非常方便，因为它们支持归纳和递归，且它们的构造子表现
良好；但并非所有类型都能定义为归纳类型。特别地，诸如 ℚ（有理数）和 ℝ（实
Quotienting

Subtyping

数）等数学类型需要更复杂的构造，这些构造基于商构造和子类型化。这将在第 ?? 和
第 ?? 章中详细说明。

5.2

结构归纳
Structural Induction

结构归纳是数学归纳法向任意归纳类型的推广。为了通过对 n 的结构归纳来
Base Case

Induction Step

证明目标 n : ℕ ⊢ P[n]，只需证明两个子目标，传统上称为基本情况和归纳步骤：
⊢ P[0]
k : ℕ,ih : P[k] ⊢ P[k + 1]
当然，我们也可以写 Nat.zero 和 Nat.succ k 来代替 0 和 k + 1。
通常情况下，情况会更复杂。目标可能包含一些不依赖于 n 的额外假设（例如
Q），以及一些依赖于 n 的假设（例如 R[n]）。假如我们每种假设各有一个，这就给
出了初始目标：
hQ : Q, n : ℕ, hR : R[n] ⊢ S[n]
对 n 进行结构归纳会产生两个子目标：
hQ : Q, hR : R[0] ⊢ S[0]
hQ : Q, k : ℕ, ih : R[k] → S[k], hR : R[k + 1] ⊢ S[k + 1]
假设 Q 只是简单地从初始目标原封不动地继承下来，而 R[n] ⊢ S[n] 处理起来几
乎就像目标的目的变成了 R[n] → S[n]。在上面的第一个例子中，令 P[n] := R[
n] → S[n] 即可轻松验证这一点。由于这种通用格式非常冗长且几乎不包含额外信
息（既然我们已经理解了其工作原理），从现在起，我们将以尽可能简单的形式呈现
目标，不带额外假设。
对于列表，给定目标 xs : list α ⊢ P[xs]，对 xs 进行结构归纳得到：
⊢ P[[]]
y : α, ys : list α, ih : P[ys] ⊢ P[y :: ys]

5.2. 结构归纳

当然，我们也可以写 List.nil 和 List.cons y ys。这里没有与 y 关联的归纳假
设，因为 y 不是列表类型的。
对于算术表达式，基本情况是：
i : ℤ ⊢ P[AExp.num i]

x : String ⊢ P[AExp.var x]

归纳步骤是：
e1 e2 : AExp, ih1 : P[e1 ], ih2 : P[e2 ] ⊢ P[AExp.add e₁ e₂]
e1 e2 : AExp, ih1 : P[e1 ], ih2 : P[e2 ] ⊢ P[AExp.sub e₁ e₂]
e1 e2 : AExp, ih1 : P[e1 ], ih2 : P[e2 ] ⊢ P[AExp.mul e₁ e₂]
e1 e2 : AExp, ih1 : P[e1 ], ih2 : P[e2 ] ⊢ P[AExp.div e₁ e₂]
注意关于 e₁ 和 e₂ 的两个归纳假设。
通常情况下，结构归纳会为每个构造子产生一个子目标。在每个子目标中，对
于我们正在进行归纳的类型的所有构造子参数，归纳假设都是可用的。
给定一个归纳类型 τ，计算子目标的步骤总是相同的：
1. 将 P[ ] 中的空缺替换为应用于新变量（例如 y :: ys）的每个可能的构造子，
产生与构造子数量相同的子目标。
2. 将这些新变量（例如 y、ys）添加到局部语境中。
3. 为所有类型为 τ 的新变量添加归纳假设。
例如，我们将证明对于所有 n : ℕ，Nat.succ n ≠ n。我们从一个非形式证明
开始：
证明采用对 n 的结构归纳。
情况 0：我们必须证明 Nat.succ 0 ≠ 0。这遵循归纳类型构造子的「无
混淆」性质。
情 况 Nat.succ k：归 纳 假 设 是 Nat.succ k ≠ k。我 们 必 须 证 明
Nat.succ (Nat.succ k) ≠ Nat.succ k。通过 Nat.succ 的单射性，
我们得到 Nat.succ (Nat.succ k) = Nat.succ k 等价于 Nat.succ
k = k。因此，只需证明 Nat.succ k ≠ k，这恰好对应于归纳假设。 u
t
请注意此非形式证明的主要特征，你应该在自己的非形式论证中努力复现这些
特征：
证明以明确声明我们正在进行的证明类型开始（例如，哪种归纳以及对哪个变
量进行归纳）。
各个情况都被清晰地识别出来，并且对于每个情况，都陈述了目标的目的和
假设。

明确调用了证明所依赖的关键定理（例如，Nat.succ 的单射性）。
现在让我们在 Lean 中完成这个证明：
theorem Nat.succ_neq_self (n : ℕ) :
Nat.succ n ≠ n :=
by
induction n with
| zero

=> simp

| succ n' ih =>
intro hsucc
apply ih
apply Nat.succ.inj hsucc
这个证明有些刻意，因为它可以用单个 simp 调用所取代，但它仍然拥有启发意义。

5.3 结构化递归
Structural Recursion

结构化递归是一种递归形式，它允许我们从进行递归的值中剥离出一个构造

子。下面的阶乘函数就是结构化递归的：
def fact : ℕ → ℕ
| 0

=> 0

| n + 1 => (n + 1) * fact n
我们在这里剥离的构造子是 Nat.succ（写作 + 1），这样的函数保证在递归停
止前只调用自身有限次。例如，fact 12345 将调用自身 12345 次。该函数被称为是

Terminate

终止的，这一性质有助于确保逻辑一致性。
在结构化递归中，等式的数量与构造子的数量相同。初学者往往倾向于提供额
外的冗余情况，如下例所示：
def factThreeCases : ℕ → ℕ
| 0

=> 0

| 1

=> 1

| n + 1 => (n + 1) * factThreeCases n
抵制这种诱惑对你最有好处。定义中的情况越多，对其进行推理的工作量就越
大。请记住那句格言：「一个好的定义抵得上三个定理」。
对于结构化递归函数，Lean 可以自动证明其终止性。对于更通用的递归模式，
终止性检查可能会失败。有时失败是有充分理由的，如下例所示：
-- fails
def illegal : ℕ → ℕ

5.4. 模式匹配表达式

| n => illegal n + 1
如果 Lean 接受这个定义，我们就可以利用它来证明 0 = 1，只需从等式 illegal
n = illegal n + 1 的两边减去 illegal n。从 0 = 1，我们可以推导出 False，
再从 False，我们可以推导出任何结论。显然，我们不想要这样的结果。
如果我们使用 opaque 和 axiom，那就没有任何办法了：
opaque immoral : ℕ → ℕ
axiom immoral_eq (n : ℕ) :
immoral n = immoral n + 1
theorem proof_of_False :
False :=
have hi : immoral 0 = immoral 0 + 1 :=
immoral_eq 0
have him :
immoral 0 - immoral 0 = immoral 0 + 1 - immoral 0 :=
by rw [←hi]
have h0eq1 : 0 = 1 :=
by simp at him
show False from
by simp at h0eq1
我们更倾向于使用 def 而非 opaque 和 axiom 的另一个原因是，定义的等式
可以用于计算。像 rfl 这样在计算意义下进行统一的策略，在我们每次引入一个定
义时都会变得更强大；而诊断命令 #eval 和 #reduce 也可以用于已定义的常量。
细心的读者会注意到，上面关于阶乘的定义在数学上是错误的：无论参数是什
么，fact 和 factThreeCases 竟然都返回 0。我们确实搞砸了。这些令人尴尬的
错误提醒我们要「测试」我们的定义，并「证明」它们的一些性质。虽然有缺陷的公
理偶尔会出现，但更常见的是定义未能捕获预想的概念。仅仅因为一个函数被命名
为 fact，并不意味着它实际上就在计算阶乘。

5.4

模式匹配表达式
模式匹配不仅可以在 def 命令的顶层进行，还可以通过 match 表达式深入到

项的内部。该构造拥有以下通用语法：

match 项 1 , . . ., 项 m with
| 模式 11 , . . ., 模式 1m => 结果 1
.
| 模式 n1 , . . ., 模式 nm => 结果 n

该构造让人联想到一些现代编程语言中的 match。上述 match 表达式的含义
如下：
考虑项 项 1 , . . ., 项 m 。
如果它们的形式分别为模式 11 , . . ., 模式 1m ，
则得到 结果 1 。
.
如果它们的形式分别为模式 n1 , . . ., 模式 nm ，
则得到 结果 n 。
模式可以包含变量、构造子和匿名占位符（_）。表达式 结果 i 可以引用相应模
式中引入的变量。
下面的函数定义演示了表达式内部模式匹配的语法：

Codomain

bcount 函数计算列表中满足给定谓词 p 的元素数量。该谓词的陪域是 Bool。
Boolean

作为一般规则，我们将在程序中使用布尔值类型 Bool，而在陈述程序性质时使用

Proposition

命题类型 Prop。Bool 类型的两个值被称为 false 和 true（以小写字母形式）。
Connective

逻辑联结词被称为 or（中缀：||）、and（中缀：&&）以及 not（前缀：!）。
下图展示了 Bool 和 Prop 的解释：

Bool:

··

Prop:

·
··

···
···

Universe

点代表元素，圆圈代表类型，矩形代表类型的类型，即宇宙。我们可以看到，
Bool 被解释为拥有两个值的集合，而 Prop 由无限多个命题（即类型）组成，每个
命题都有零个或多个证明（即元素）。我们将在第 6 章中完善这张图。
我们不能对命题（类型为 Prop）进行模式匹配，但我们可以使用 if–then
–else 来代替。例如，自然数上的 min 运算符可以定义如下：
Lean 也允许我们使用 True 和 False，但它们会被隐式地从 Prop 转换为 Bool。我们通常建议
避免这种隐式强制转换。遗憾的是，目前没有办法禁用它们。

5.5. 结构体

def min (a b : ℕ) : ℕ :=
if a ≤ b then a else b
Decidable

这需要一个可判定
（即可执行）的命题。对于 ≤ 来说确实如此：给定具体的参数
Type Class

（如 35 和 49），Lean 可以将 35 ≤ 49 约化为 True。Lean 使用一种称为类型类的机
制来跟踪可判定性，下文将对此进行解释。

5.5

结构体
Structure

Record

Lean 提供了定义结构体（也称为记录）的便捷语法。它们本质上是拥有一些语
法糖的非递归、单构造子的归纳类型。
下面的定义引入了一个名为 RGB 的结构体，它有三个类型为 ℕ 的字段，分别名
为 red、green 和 blue：
structure RGB where
red

: ℕ

green : ℕ
blue

: ℕ

此定义的效果大致相当于以下命令：
inductive RGB : Type where
| mk : ℕ → ℕ → ℕ → RGB
def RGB.red : RGB → ℕ
| RGB.mk r _ _ => r
def RGB.green : RGB → ℕ
| RGB.mk _ g _ => g
def RGB.blue : RGB → ℕ
| RGB.mk _ _ b => b
我们可以将一个新结构体定义为现有结构体的扩展。下面的定义用第四个字段
alpha 扩展了 RGB：
structure RGBA extends RGB where
alpha : ℕ
定义结构体的通用语法为：
structure 结构体名 (参数 1 : 类型 1 ) . . . (参数 k : 类型 k )


extends 结构体 1 , . . ., 结构体 m where

字段名 1 : 字段类型 1
.
字段名 n : 字段类型 n
参数 参数 1 、. . .、参数 k 实际上也是额外的字段，但与 字段名 1 、. . .、字段名 n
不同，它们存储在类型中，作为类型构造子 (结构体名) 的参数。
可以使用多种语法来指定值：
def pureRed : RGB :=
RGB.mk 0xff 0x00 0x00
def pureGreen : RGB :=
{ red

:= 0x00

green := 0xff
blue

:= 0x00 }

def semitransparentGreen : RGBA :=
{ pureGreen with
alpha := 0x7f }
semitransparentGreen 的定义从 pureGreen 中复制了所有值，但显式设
置了 alpha 字段。
接下来，我们定义一个名为 shuffle 的操作：
def shuffle (c : RGB) : RGB :=
{ red

:= RGB.green c

green := RGB.blue c
blue

:= RGB.red c }

该定义依赖于生成的选择器 RGB.red、
RGB.green 和 RGB.blue。除了 RGB.red c，
我们也可以写成 c.red，其他字段同理。有时我们会在 Lean 的输出中看到这种记
法，尽管我们自己不使用它。
连续三次应用 shuffle 就相当于完全没有应用它：
theorem shuffle_shuffle_shuffle (c : RGB) :
shuffle (shuffle (shuffle c)) = c :=
by rfl

5.6

类型类
Type Class

类型类是由 Haskell 推广的一种机制，目前存在于多个证明助手中。在 Lean 中，

5.6. 类型类

类型类是一种结合了抽象常量及其性质的结构体类型。2
通过为常量提供具体定义并证明其性质成立，可以将一个类型声明为类型类的

Instance

。根据类型，Lean 会检索相关的实例。
一个简单的例子是 Inhabited 类型类，它只需要一个常量 Inhabited.default
，而不需要任何性质：
class Inhabited (α : Type) : Type where
default : α
类的定义语法与结构体相同，只是使用关键字 class 代替了 structure。参
数 α 代表可以作为该类成员的任意类型。这个特定的类型类拥有单个参数和单个字
段，但通常情况下，一个类型类可以拥有多个参数和多个字段。
任何拥有至少一个元素的类型都可以被注册为 Inhabited 类型类的实例。例
如，我们可以通过选择一个任意数字作为默认值来注册 ℕ：
instance Nat.Inhabited : Inhabited ℕ :=
{ default := 0 }
这指定了一个名字为 Nat.Inhabited、类型为 Inhabited ℕ 的值。因为我们
Canonical Instance

使用的是关键字 instance 而非 def，因此该结构体值被注册为「典范实例」，以便
在需要类型为 Inhabited ℕ 的结构体时使用。在存储类型类实例的全局表中，现
在有一个条目：
Inhabited ℕ ↦ Nat.Inhabited
对于列表，即使 α 不包含任何居留元，空列表也是一个显而易见的默认值：
instance List.Inhabited {α : Type} : Inhabited (List α)
:=
{ default := [] }
这在全局表中添加了以下条目：
Inhabited (List ?α) ↦ List.Inhabited
作为一个例子，观察到类型为 α → β 的有限函数可以用它们的函数表来表示，
函数表的类型为 β × ⋯ × β（包含 |α| 个 β 的副本）。因此，|α → β| = |β||α| 。要
使结果为 0，必须满足 |β| = 0 且 |α| ≠ 0。换句话说，如果 (1) β 有居留元或 (2) α
「没有」居留元，则类型 α → β 有居留元。我们关注情况 (1)：
instance Fun.Inhabited {α β : Type} [Inhabited β] :
Inhabited (α → β) :=
{ default := fun a : α ↦ Inhabited.default }
implicit argument

尽管名称如此，但相比 Haskell 的类型类而言，Lean 的类型类机制与 Scala 的隐式参数的关系的
关系更密切。

该实例本身依赖于类型类相同但类型不同的实例, 这种情况经常发生。
Pair

Product Type

序对的类型 α × β，也称为积类型，包含形式为 (a, b) 的值，其中 a : α 且 b :
β。给定一个序对 ab : α × β，可以通过编写 Prod.fst ab 和 Prod.snd ab 来提
取其第一和第二分量。要提供 α × β 的居留元，我们需要 α 的居留元和 β 的居留元：
instance Prod.Inhabited {α β : Type}
[Inhabited α] [Inhabited β] :
Inhabited (α × β) :=
{ default := (Inhabited.default, Inhabited.default) }
使用 Inhabited 类型类，我们可以定义列表上的「head」操作：即返回列表
第一个元素的函数。由于空列表不包含任何元素，因此在这种情况下没有可以返回
的有意义的值。给定一个属于 Inhabited 类型类的类型，我们可以简单地返回其
默认值：
def head {α : Type} [Inhabited α] : List α → α
| []

=> Inhabited.default

| x :: _ => x
通过编写 [Inhabited α]，我们要求 α 属于 Inhabited。这允许我们在定义
中访问 Inhabited.default。
语法 [Inhabited α] 为 head 常量添加了一个隐式参数。但与其他隐式参数
不同，Lean 会通过所有已声明的实例进行「类型类搜索」，以确定该参数的值。因
此，在运行命令
#eval head ([] : List ℕ)
时，Lean 会寻找 Inhabited ℕ 的实例并找到我们上面声明的实例 Nat.Inhabited
。在那次声明中，我们将 default 设置为 0，因此这就是 #eval 打印出的内容。如
果有多个实例适用且 Lean 选择了错误的一个，我们可以使用 @ 语法将类型类参数
转换为显式参数，并提供所需的类型类实例。
让我们仔细看看 Inhabited.default：
Inhabited.default {α : Type} [Inhabited α] : α
注意方括号 [ ] 的使用。当我们使用 Inhabited.default α 来定义 head 时，
Lean 会在注册实例的全局表和局部语境中寻找 Inhabited α 的实例。全局表包含
Inhabited ℕ 的条目，但没有匹配 Inhabited α 的条目。另一方面，局部语境中
包含一个类型为 Inhabited α 的匿名参数，它会被使用。
Lean 的核心库对 List.head 的定义与我们完全相同。在实践中，几乎所有的
类型都是非空的（明显的例外是 False），所以 Inhabited 限制几乎不是问题。
我们可以证明关于 Inhabited 类型类的抽象定理，例如：

5.6. 类型类

theorem head_head {α : Type} [Inhabited α] (xs : List α)
:
head [head xs] = head xs
为了在类型为 List α 的列表上使用运算符 head，需要假设 [Inhabited α]。
如果我们省略这个假设，Lean 会抛出一个错误，告诉我们「类型类合成失败」。
还有更多只有常量但没有性质的类型类，包括：
class Zero (α : Type)

class One (α : Type)

where

where

zero : α

one : α

class Neg (α : Type)

class Inv (α : Type)

where

where

neg : α → α

inv : α → α

class Add (α : Type)

class Mul (α : Type)

where

where

add : α → α → α

mul : α → α → α

Syntactic Type Class

这些语法类型类引入了在不同语境下拥有不同语义的常量。例如，one 可以代
表自然数 1、整数 1、实数 1、单位矩阵以及许多其他「一」的概念。这些类型类的主
Monoid

要目的是为丰富的代数类型类层次结构（群、幺半群、环、域等）奠定基础，并允许

Overloading

重载常见的数学符号，如 +、*、0、1 和 ⁻¹。

Semantic Type Classe

语法类型类不会对可以声明为实例的类型强加严格的限制。相比之下，语义类型类包
含的性质则用于约束给定常量的行为。
在第 3.6 节中，我们遇到了以下语义类型类：
class Std.Commutative (α : Type) (f : α → α → α) where
comm : ∀a b, f a b = f b a
class Std.Associative (α : Type) (f : α → α → α) where
assoc : ∀a b c, f (f a b) c = f a (f b c)
这一次，关联不再是从类型到常量，而是从类型「以及一个函数」到性质。Lean
并不介意这种称谓上的偏差：尽管它们被称为类型类，但 Lean 的类型类非常灵活，
可以用来表示各种约束。
从概念上讲，Std.Commutative 是一个三元组 (α, f, comm) 的依值类型，
Std.Associative 也是如此。f 的类型取决于 α，而 comm 的类型取决于 α 和 f。
尽管它们是参数，但 α 和 f 也与 comm 一起存储。

在第 3.6 节中，我们将 ℕ 上的 add 函数注册为一个可交换且可结合的操作：
instance Associative_add : Std.Associative add :=
{ assoc := add_assoc }
instance Commutative_add : Std.Commutative add :=
{ comm := add_comm }
每当我们尝试访问 @Std.Commutative.comm ℕ add 时，都会得到 add_comm，
对于 @Std.Associative.assoc ℕ add 也是如此。策略 ac_rfl 会尝试查找问
题中所有二元运算符的 comm 和 assoc 性质，并在性质存在时利用它们。
定义类型类的通用语法如下：
class 类名 (参数 1 : 类型 1 ) . . . (参数 k : 类型 k )


extends 结构体 1 , . . ., 结构体 m where

常量名 1 : 常量类型 1
.
常量名 n : 常量类型 n
性质名 1 : 命题 1
.
性质名 p : 命题 p
实例化类型类的通用语法如下：
instance 实例名 : 类型类 参数 :=
{ 常量 1 := 定义 1 ,
.

常量 n := 定义 n ,
性质 1 := 证明 1 ,
.
性质 p := 证明 p }

5.7

列表
Lean 提供了丰富的有限列表函数库。在本节中，我们将回顾其中的一些，并定

义一些我们自己的函数；这些练习有助于我们熟悉 Lean 中的函数式编程。
在第一个例子中，我们对一个列表进行分情况讨论：
theorem head_head_cases {α : Type} [Inhabited α]
(xs : List α) :
head [head xs] = head xs :=

5.7. 列表

by
cases xs with
| nil

=> rfl

| cons x xs' => rfl
该证明依赖于 cases，它是 induction 的近亲。它对其参数进行分情况讨论，
但不生成归纳假设。调用 cases xs 将目标 ⊢ P[xs] 转换为两个子目标：⊢ P[[]]
和 ⊢ P[x :: xs']。我们其实也可以使用 induction xs。如果你在 induction
和 cases 之间犹豫不决，那么总是可以选择 induction，然后看看你是否需要归
纳假设 ⸺ 如果你不需要它，那么将 induction 替换为 cases 来明确表示不需要
是一种良好的风格。
在结构化证明中，我们可以使用 match 表达式来执行分情况讨论：
theorem head_head_match {α : Type} [Inhabited α]
(xs : List α) :
head [head xs] = head xs :=
match xs with
| List.nil

=> by rfl

| List.cons x xs' => by rfl
Injectivity

在下一个例子中，我们展示了如何利用构造子的单射性。当等式两边都应用了
相同的构造子时，cases 策略会利用单射性来化简等式。在下面的证明中，化简前
的等式是 x :: xs = y :: ys：
theorem injection_example {α : Type} (x y : α) (xs ys :
List α)
(h : x :: xs = y :: ys) :
x = y ∧ xs = ys :=
by
cases h
simp
cases 策略在整个目标中将 y 替换为 x，将 ys 替换为 xs，产生子目标
⊢ x = x ∧ xs = xs
这可以由 simp 轻松证明。
当构造子不同时，cases 策略也可用于识别不可能的情况：
theorem distinctness_example {α : Type} (y : α) (ys :
List α)
(h : [] = y :: ys) :

False :=
by cases h
Map Function

接下来，我们定义列表上的映射函数：这种函数将其参数 f（其本身也是一个函
数）应用到集合中存储的所有元素上。
def map {α β : Type} (f : α → β) : List α → List β
| []

=> []

| x :: xs => f x :: map f xs
请注意，由于 f 在递归调用中不会改变，因此我们将其作为一个整体定义的参
数。另一种选择（也是在递归调用中会改变的参数的唯一选择）如下：
def mapArgs {α β : Type} : (α → β) → List α → List β
| _, []

=> []

| f, x :: xs => f x :: mapArgs f xs
映射函数的一个基本性质是，如果其参数是恒等函数（fun x ↦ x），则它们没
有效果：
theorem map_ident {α : Type} (xs : List α) :
map (fun x ↦ x) xs = xs :=
by
induction xs with
| nil

=> rfl

| cons x xs' ih => simp [map, ih]
另一个基本性质是，连续的映射可以压缩为单个映射，其参数是所涉及函数的
复合：
theorem map_comp {α β γ : Type} (f : α → β) (g : β → γ)
(xs : List α) :
map g (map f xs) = map (fun x ↦ g (f x)) xs :=
by
induction xs with
| nil

=> rfl

| cons x xs' ih => simp [map, ih]
在引入新操作时，将这些操作与其他操作组合使用时的行为展示出来是非常有
用的。示例如下：
theorem map_append {α β : Type} (f : α → β)
(xs ys : List α) :

5.7. 列表

map f (xs ++ ys) = map f xs ++ map f ys :=

by
induction xs with
| nil

=> rfl

| cons x xs' ih => simp [map, ih]
值得注意的是，最后三个证明在文本上是完全相同的。这些是典型的 induction
–rfl–simp 证明。
下一个列表操作删除列表的第一个元素，返回其尾部：
def tail {α : Type} : List α → List α
| []

=> []

| _ :: xs => xs
对于 []，我们简单地返回 [] 作为其自身的尾部。
与 tail 对应的是提取列表第一个元素的函数。我们已经在第 5.6 节中回顾了
一种使用 Inhabited 类型类的方案。另一种可行的定义是使用 Option 包装：
def headOpt {α : Type} : List α → Option α
| []

=> Option.none

| x :: _ => Option.some x
类型 Option α 有两个构造子：Option.none 和 Option.some a，其中 a : α。
当没有有意义的值可以返回时，我们使用 Option.none，否则使用 Option.some。
我们可以将 Option.none 视为函数式编程中的空指针，但与空指针（和空引用）不
同，类型系统会防止不安全的解引用。要检索存储在 Option 中的值，我们必须进
行模式匹配。示意图如下：
match headOpt xs with
| Option.none

=> handleTheError

| Option.some x => doSomethingWithValue x
我们不能简单地写 doSomethingWithValue (headOpt xs)，因为这会产生
类型错误。类型系统强迫我们考虑错误处理。
利用依值类型的力量，我们有另一种实现偏函数的方法 ⸺ 即，我们可以指定
一个前置条件。调用者必须随后传递一个前置条件得到满足的证明作为参数：
def headPre {α : Type} : (xs : List α) → xs ≠ [] → α
| [],

hxs => by simp at *

| x :: _, hxs => x
headPre 函数接受两个显式参数。第一个参数 xs 是一个列表。第二个参数 hxs
是 xs ≠ [] 的证明。由于第二个参数的类型 xs ≠ [] 取决于第一个参数，我们必须

使用依值类型语法 (xs : List α) → 而不是 List α →，以便我们可以命名第一个
参数。函数的结果是类型为 α 的值；由于有了前置条件，不需要 Option 包装。
第二个参数用于排除 xs 为 [] 的情况。在这种情况下，该参数（称为 hxs）是
Contradiction

[] ≠ [] 的证明，而这是不可能的。证明由此导出一个矛盾，并利用它导出一个任意
的 α。从矛盾中，我们可以导出任何东西，甚至是 α 的一个居留元。
然后我们可以如下调用该函数：
#eval headPre [3, 1, 4] (by simp)
这会打印出 3。第二个参数 by simp 是 [3, 1, 4] 不为 [] 的证明。
现在，给定两个长度相同的列表 [x1 , . . ., xn ] 和 [y1 , . . ., yn ]，
「zip」操作构
造一个由序对组成的列表 [(x1 , y1 ), . . ., (xn , yn )]：
def zip {α β : Type} : List α → List β → List (α × β)
| x :: xs, y :: ys => (x, y) :: zip xs ys
| [],

_

=> []

| _ :: _,

[]

=> []

如果一个列表比另一个短，该函数也是有定义的。例如，zip [a, b, c] [x, y
] = [(a, x), (b, y)]。请注意，这种拥有三个情况的递归偏离了结构化递归架构。
列表的长度是通过递归定义的：
def length {α : Type} : List α → ℕ
| []

=> 0

| x :: xs => length xs + 1
我们可以关于 zip 结果的长度说一些有趣的事情 ⸺ 即，它是两个输入列表长
度中的较小值：
theorem length_zip {α β : Type} (xs : List α) (ys : List
β) :
length (zip xs ys) = min (length xs) (length ys) :=
by
induction xs generalizing ys with
| nil

=> simp [zip, min, length]

| cons x xs' ih =>
cases ys with
| nil

=> rfl

| cons y ys' => simp [zip, length, ih ys',
min_add_add]
上面的证明教会了我们又一个技巧。归纳假设是
ih : ∀ys : list β, length (zip xs ys) = min (length xs) (length ys)

5.7. 列表

Generalized

为什么这里有一个 ∀ 量词？induction xs generalizing ys 策略泛化了定理陈
述，使得归纳假设不再局限于证明目标中的某个固定 ys，而是可以用于 ys 的任意
值。这里需要这种灵活性，因为我们想用 ys 的尾部（称为 ys'）而不是 ys 本身来
实例化该量词。
证明依赖于一个关于 min 函数的定理，我们需要自己证明它：
theorem min_add_add (l m n : ℕ) :
min (m + l) (n + l) = min m n + l :=
by
cases Classical.em (m ≤ n) with
| inl h => simp [min, h]
| inr h => simp [min, h]
回想定义 min a b = (if a ≤ b then a else b)。要对 min 进行推理，我们经常
需要对条件 a ≤ b 进行分情况讨论。这可以通过使用 cases Classical.em (a ≤ b)
来实现。这会创建两个子目标：一个以 a ≤ b 为假设，另一个以 ¬ a ≤ b 为假设。假
设在每种情况下都可以作为 h 使用。
在结构化证明中，有两种方法可以对命题进行分情况讨论：
theorem min_add_add_match (l m n : ℕ) :
min (m + l) (n + l) = min m n + l :=
match Classical.em (m ≤ n) with
| Or.inl h => by simp [min, h]
| Or.inr h => by simp [min, h]
theorem min_add_add_if (l m n : ℕ) :
min (m + l) (n + l) = min m n + l :=
if h : m ≤ n then
by simp [min, h]
else
by simp [min, h]
我们再次看到，用于编写函数式程序的机制（如 match 和 if–then–else）也
可用于编写结构化证明（毕竟证明也是项）。我们现在可以为第 4.7 节末尾呈现的表
格添加几行：
策略式证明

结构化证明

原始证明项

cases t

match t with

match t with

cases Classical.em Q

if Q then … else

if Q then … else

我们以一个关于 map 和 zip 的分配律结束：

theorem map_zip {α α' β β' : Type} (f : α → α') (g : β
→ β') :
∀xs ys, map (fun (a, b) ↦ (f a, g b)) (zip xs ys) =
zip (map f xs) (map g ys)
| x :: xs, y :: ys => by simp [zip, map, map_zip f g
xs ys]
| [],

_

=> by rfl

| _ :: _,

[]

=> by rfl

左侧的模式与 zip 定义中使用的模式完全对应。这比分别对 xs 进行归纳和对
ys 进行分情况讨论要简单得多，就像我们在证明 length_zip 时所做的那样。好
的证明通常遵循它们所基于的定义的结构。
在 zip 的定义和 map_zip 的证明中，我们小心地指定了三个不重叠的模式。也
可以编写拥有重叠模式的等式，例如：
def f {α : Type} : List α → ⋯
| [] => …
| xs => … xs …
由于模式是按顺序应用的，上述命令定义的函数与以下函数相同：
def f {α : Type} : List α → ⋯
| []

=> …

| x :: xs => … (x :: xs) …
我们通常建议使用后者，即更显式的风格，因为这样产生的意外更少。

5.8 二叉树
Binary Tree

树状对象通过带构造子的归纳类型来定义，其构造子接受多个递归参数。二叉树的
节点最多有两个子节点。Lean 对二叉树的定义如下：
inductive Tree (α : Type) : Type
| nil

: Tree α

| node : α → Tree α → Tree α → Tree α
对于二叉树，结构归纳会产生两个归纳假设，内部节点的每个子树各一个。为了
通过对 t 进行结构归纳来证明目标 t : Tree α ⊢ P[t]，我们需要展示以下子目标：
⊢ P[Tree.nil]
a : α, l r : Tree α, ih_l : P[l], ih_r : P[r] ⊢ P[Tree.node a l r]
Mirror Operation

对树而言，对应列表翻转操作的是镜像操作：

5.8. 二叉树

def mirror {α : Type} : Tree α → Tree α
| Tree.nil

=> Tree.nil

| Tree.node a l r => Tree.node a (mirror r) (mirror l)
append

镜像可以直接定义，无需借助于某些追加操作。因此，关于 mirror 的推理比
关于 reverse 的推理更简单，如下所示：
theorem mirror_mirror {α : Type} (t : Tree α) :
mirror (mirror t) = t :=
by
induction t with
| nil

=> rfl

| node a l r ih_l ih_r => simp [mirror, ih_l, ih_r]
Informal

更详细的非形式证明如下：
证明采用对 t 的结构归纳法。
情况 Tree.nil：我们必须证明 mirror (mirror Tree.nil) = Tree.nil。
这直接遵循 mirror 的定义。
情况 Tree.node a l r：归纳假设为
(ih_l) mirror (mirror l) = l (ih_r) mirror (mirror r) = r
我们必须证明 mirror (mirror (Tree.node a l r)) = Tree.node
a l r。我们有
mirror (mirror (Tree.node a l r))
= mirror (Tree.node a (mirror r) (mirror l)) （通过 mirror
的定义）
= Tree.node a (mirror (mirror l)) (mirror (mirror r))（同
上）
= Tree.node a l (mirror (mirror r))

（通过 ih_l）

= Tree.node a l r

（通过 ih_r）

u
t

为了在 Lean 证明中达到同样的详细程度，我们可以使用计算块（第 4.4 节）而非
simp：
theorem mirror_mirror_calc {α : Type} :
∀t : Tree α, mirror (mirror t) = t
| Tree.nil

=> by rfl

| Tree.node a l r =>

calc
mirror (mirror (Tree.node a l r))

= mirror (Tree.node a (mirror r) (mirror l)) :=
by rfl
_ = Tree.node a (mirror (mirror l))
(mirror (mirror r)) :=
by rfl
_ = Tree.node a l (mirror (mirror r)) :=
by rw [mirror_mirror_calc l]
_ = Tree.node a l r :=
by rw [mirror_mirror_calc r]
我们以以下定理结束本节，该定理在第 6 章中会很有用：
theorem mirror_Eq_nil_Iff {α : Type} :
∀t : Tree α, mirror t = Tree.nil ↔ t = Tree.nil
| Tree.nil

=> by simp [mirror]

| Tree.node _ _ _ => by simp [mirror]

Cases 策略

5.9
cases


cases 项 with
| 构造子 1 名称列表 1 => 策略 1
.
| 构造子 n 名称列表 n => 策略 n



cases 策略对指定的项进行分情况讨论。这会产生与该项类型定义中的构造子
数量相同的子目标。该策略与 induction 类似，不同之处在于它不产生归纳假设，
并且会自动排除不可能的情况。可选名称 名称列表 1 , …, 名称列表 n 用于任何出现的
变量或假设。
cases 形如-l-等于-r-的假设
cases 策略也可以用于形如 l = r 的假设 h。它将 r 与 l 进行匹配，并在目标的
各处将所有出现的 r 中的变量替换为 l 中相应的项。如果需要，可以使用 clear h
删除剩余的假设 l = l。
cases Classical.em ( 命题 ) with
| inl 为真时的名称

=> 为真时的策略

| inr 为假时的名称

=> 为假时的策略

5.10. 依值归纳类型

cases 策略还可以用于对命题进行分情况讨论。会出现两种情况：一种是命题
为真，另一种是命题为假。可选名称 为真时的名称和 为假时的名称 分别用于真和假
情况下的假设。

5.10 依值归纳类型
归纳类型 List α 和 Tree α 属于 Lean 的简单类型部分。归纳类型也可以依赖
Vector

于（非类型的）项。一个典型的例子是长度为 n 的列表，或者称为向量：
inductive Vec (α : Type) : ℕ → Type where
| nil

: Vec α 0

| cons (a : α) {n : ℕ} (v : Vec α n) : Vec α (n + 1)
因此，项 Vec.cons 3 (Vec.cons 1 Vec.nil) 的类型为 Vec ℕ 2。通过在类
型中编码向量长度，我们可以提供有关函数结果的更精确信息。例如 Vec.reverse
函数反转向量，它会将值 Vec α n 映射到拥有相同 n 的相同类型的另一个值。而
Vec.zip 可以要求其两个参数拥有相同的长度。固定长度的向量和矩阵在计算机科
学和数学中都很有用。
不幸的是，这种更精确的信息是有代价的。当依值归纳类型所依赖的项是可证
明相等但不是在计算上语法相等（例如 m + n 与 n + m）时，它们会引起困难。在本
指南中，我们通常会避免使用依值归纳类型。本节简要介绍它们是为了完整性。明
确地说：这不属于考试内容。
下面的定义引入了列表和向量之间的转换：
def listOfVec {α : Type} : ∀{n : ℕ}, Vec α n → List α
| _, Vec.nil

=> []

| _, Vec.cons a v => a :: listOfVec v
def vecOfList {α : Type} :
∀xs : List α, Vec α (List.length xs)
| []

=> Vec.nil

| x :: xs => Vec.cons x (vecOfList xs)
listOfVec 转换接受类型 α、长度 n 以及 α 上长度为 n 的向量作为参数，并
返回 α 上的列表。虽然我们不关心长度 n，但它仍然需要作为一个参数，因为它出
现在第三个参数的类型中。我们将前两个参数 α 和 n 设置为隐式的，因为它们可以
从第三个参数的类型中推断出来。
vecOfList 转换接受类型 α 和 α 上的列表作为参数，并返回与列表长度相等
的向量。Lean 的类型检查器足够强大，可以确定两个右侧拥有所需的类型。
根据 PAT 原理，证明类似于函数定义。让我们验证将向量转换为列表是否保持
其长度：

theorem length_listOfVec {α : Type} :

∀(n : ℕ) (v : Vec α n), List.length (listOfVec v) =
n
| _, Vec.nil

=> by rfl

| _, Vec.cons a v =>
by simp [listOfVec, length_listOfVec _ v]
为了通过对 v 进行结构归纳来证明目标 v : Vec α n ⊢ P[v]，我们可能会天真
地认为展示以下两个子目标就足够了：
⊢ P[Vec.nil]
m : ℕ, a : α, u : Vec α m, ih : P[u] ⊢ P[Vec.cons a u]
这是天真的，因为子目标甚至不是类型正确的：P[ ] 中的洞拥有类型 Vec α n
Inhabitant

（其原始居留元 v 的类型），所以我们不能简单地将类型为 Vec α 0、Vec α m 和 Vec
α (m + 1) 的 Vec.nil、u 或 Vec.cons a u 填入那个洞中。我们必须每次都调整
P，将 n 替换为 0、m 或 m + 1。使用符号 Pt [ ] 表示 P[ ] 的变体，其中所有出现的
n 都被项 t 替换，我们得到：
⊢ P0 [Vec.nil]
m : ℕ, a : α, u : Vec α m, ih : Pm [u] ⊢ Pm+1 [Vec.cons a u]
使用 cases 策略的分情况讨论证明与之类似，但不含归纳假设。通常，长度 n
不会是一个变量，而是一个复杂的项。那么将 P[ ] 中的 n 替换可能并不拥有直观意
义。使用 cases，相应的子目标会被默默地消除。因此，对类型为 Vec α 0 的值进
行分情况讨论将只产生一个子目标，形式为 ⊢ P[Vec.nil]，因为 0 永远不可能等
于形式为 m + 1 的项。
依值类型的模式匹配是微妙的，因为我们要匹配的值的类型可能会根据构造子
的不同而改变。给定 v : Vec α n，我们可能会尝试编写：
match v with
| Vec.nil

=> …

| Vec.cons a u => …
但这与我们上面第一次尝试归纳证明时一样天真。由于类型 Vec α n 中的项 n
可能会根据构造子的不同而改变，我们必须对 n 也进行模式匹配：
match n, v with
| 0,

Vec.nil

=> …

| m + 1, Vec.cons a u => …
从本质上讲，这等同于

5.11. 新引入的 Lean 结构总结

match n, v with
| 0,

@Vec.nil α

=> …

| m + 1, @Vec.cons α a m u => …
通常，在第一列放置占位符就足够了：
match n, v with
| _, Vec.nil

=> …

| _, Vec.cons a u => …
对 n 进行模式匹配却忽略其结果可能看起来有些自相矛盾，但如果没有它，Lean
就无法推断 Vec.cons 的第二个隐式参数。在这方面，cases 比 match 更用户友好。

5.11 新引入的 Lean 结构总结
声明
class

将结构体类型声明为类型类

instance

将结构体值声明为类型类的实例

structure

引入结构体类型及其选择器

表达式
Decidable

if . . . then . . . else 对可判定命题进行分情况讨论
match . . . with

进行模式匹配

策略
cases

执行分情况讨论
