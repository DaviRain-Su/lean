# 第 2 章 程序与定理

> 由 Lean-zh PDF 自动提取（1116–1713 行），代码块与公式尚需人工校对。

程序与定理
我们继续学习 Leam 的基础知识，重点关注程序和定理，但暂不进行任何证明。
具体来说，我们将回顾如何定义新的类型和函数，以及如何将其预期的性质表述为
定理。

2.1

类型定义
Inductive Type

Lean 归纳构造演算的一个显著特点是它内置了对归纳类型的支持。归纳类型是
Constructor

一种类型，其值是通过应用称为构造子的特殊常量来构建的。归纳类型是在程序中
表示非循环数据的一种简洁方式。你可能还知道一些其他的、大致相同的名称，包
Algebraic Data Type

Inductive Data Type

Freely Generated Data Type

Recursive Data Type

Data Type

括代数数据类型、归纳数据类型、自由生成的数据类型、递归数据类型和数据类型。

2.1.1

自然数的定义
归纳类型的「Hello, World!」示例是自然数类型 Nat（ℕ）。在 Lean 中，它可以

定义如下：
inductive Nat : Type where
| zero : Nat
| succ : Nat → Nat
第一行向世界声明我们引入了一个名为 Nat 的新类型，用于表示自然数。第二
行和第三行声明了两个新的构造子，Nat.zero : Nat 以及 Nat.succ : Nat →
Nat，它们可用于构造类型为 Nat 的值。按照计算机科学和逻辑学中既定的惯例，计
数从 0 开始。第二个构造子让这个归纳定义变得有趣 ⸺ 它需要一个类型为 Nat 的
参数来产生一个类型为 Nat 的值。以下这些项
Nat.zero

Nat.succ Nat.zero
Nat.succ (Nat.succ Nat.zero)
.

表示类型为 Nat 的不同值 ⸺ 0、0 的后继数、0 的后继数的后继数，以此类
Unary

Peano

Giuseppe Peano

推。这种记法被称为一进制记法，也叫皮亚诺记法，以逻辑学家朱塞佩·皮亚诺的名
字命名。若想了解在 Lean 中对皮亚诺数的另一种解释（还有一些令人惊叹的电子游
戏画面），请参阅凯文·巴扎德（Kevin Buzzard）的文章《计算机能证明定理吗？》。1
类型声明的通用格式为
inductive 类型名 (参数 1 : 类型 1 ) . . . (参数 k : 类型 k ) : Type
where
| 构造子名称 1 : 构造子类型 1
.
| 构造子名称 n : 构造子类型 n
对于自然数，我们可以让 Lean 使用大家熟悉的名称 0、1、2 等等，实际上，预
定义的 ℕ 类型就提供了这样的语法糖。不过，使用更详细的表示法能让我们更清楚
地了解 Lean 的类型定义。
在本章配套的 Lean 文件中，Nat 的定义被放在一个命名空间内，通过 namespace
MyNat 和 end MyNat 进行界定，以将其作用域限制在文件的某一部分。在 end
MyNat 之后，出现的所有 Nat、Nat.zero 或 Nat.succ 都将指向 Lean 预定义的
自然数类型。同样，整个文件被放在 LoVe 命名空间下，以避免与 Lean 现有库中的
名称冲突。
我们可以在 Lean 的任何位置使用 #print 命令来查看之前的定义。例如，在
MyNat 命名空间内输入 #print Nat，会显示如下信息：
inductive LoVe.MyNat.Nat : Type
number of parameters: 0
constructors:
LoVe.MyNat.Nat.zero : Nat
LoVe.MyNat.Nat.succ : Nat → Nat
本书侧重于自然数，这也是本书许多内容偏向计算机科学的体现之一。对于数
论学家来说，他们可能更关注整数 ℤ 和有理数 ℚ；分析学家则更希望处理实数 ℝ 和
复数 ℂ。然而，自然数在计算机科学中无处不在，并且作为归纳类型有着非常简单的
定义。正如我们将在第 ??章中看到的，自然数还可以用来构建其他类型。

http://chalkdustmagazine.com/features/can-computers-prove-theorems/

2.1. 类型定义

算数表达式的定义

2.1.2

下一个例子会用到整数。如果我们要实现一个计算器程序或一种编程语言，那
么就需要定义一种类型，用来将算术表达式表示为抽象语法树。下面的例子展示了
如何在 Lean 中实现这一点：
inductive AExp : Type where
| num : ℤ → AExp
| var : String → AExp
| add : AExp → AExp → AExp
| sub : AExp → AExp → AExp
| mul : AExp → AExp → AExp
| div : AExp → AExp → AExp
从数学上讲，该定义等价于用以下生成规则来归纳地定义类型 AExp：
1. 对于每个整数 i，项 AExp.num i 都是一个 AExp 值。
（直观上，构造子 AExp.num
就是把一个整数「包装」为一个算术表达式。）
2. 对于每个字符串 x，项 AExp.var x 都是一个 AExp 值。
3. 若 e₁ 和 e₂ 都是 AExp 值，那么AExp.add e₁ e₂、AExp.sub e₁ e₂、AExp.mul
e₁ e₂ 和AExp.div e₁ e₂ 也都是 AExp 值。
上述定义穷尽了所有情况。AExp 所有可能的取值都只能通过生成规则 1 到 3 构造得
到。此外，使用不同生成规则构造出的 AExp 值彼此不同。这两条归纳类型的性质
可以用 Joseph Goguen 提出的口号来概括：「无垃圾，无混淆」。
将上面 Lean 中简洁的 AExp 定义与实现相同功能的 Java 程序作对比也许会很
有启发意义。该 Java 程序包含一个接口和六个实现该接口的类，分别对应于 AExp
类型及其六个构造子：
public interface AExp { }
public class Num implements AExp {
public int num;
public Num(int num) { this.num = num; }
}
public class Var implements AExp {
public String var;
public Var(String var) { this.var = var; }
}

public class Add implements AExp {
public AExp left;
public AExp right;
public Add(AExp left, AExp right)
{ this.left = left; this.right = right; }
}
public class Sub implements AExp {
public AExp left;
public AExp right;
public Sub(AExp left, AExp right)
{ this.left = left; this.right = right; }
}
public class Mul implements AExp {
public AExp left;
public AExp right;
public Mul(AExp left, AExp right)
{ this.left = left; this.right = right; }
}
public class Div implements AExp {
public AExp left;
public AExp right;
public Div(AExp left, AExp right)
{ this.left = left; this.right = right; }
}
在 Python 中，同样的类声明如下：
class AExp:
pass
class Num(AExp):

2.1. 类型定义

def __init__(self, num):
self.num = num
class Var(AExp):
def __init__(self, var):
self.var = var
class Add(AExp):
def __init__(self, left, right):
self.left = left
self.right = right
class Sub(AExp):
def __init__(self, left, right):
self.left = left
self.right = right
class Mul(AExp):
def __init__(self, left, right):
self.left = left
self.right = right
class Div(AExp):
def __init__(self, left, right):
self.left = left
self.right = right

2.1.3

列表的定义

我们考虑的下一个类型是有限列表：
inductive List (α : Type) where
| nil

: List α

| cons : α → List α → List α
Polymorphism

该类型是多态的：它由一个类型参数 α 参数化，我们可以用具体类型对其进行
实例化。例如，List ℤ 表示整数列表的类型，List (List ℝ) 表示实数列表的列
表类型。类型构造子 List 以一个类型作为参数并返回一个类型。类似于 Java 的泛
型和 C++ 的模板，多态性是一种提供参数化类型的机制。

以下命令显示了构造子的类型：
#check List.nil
#check List.cons
Lean 的内置列表提供了语法糖来编写列表：
[]
x :: xs

表示 List.nil
表示 List.cons x xs

[x₁, …, xn ] 表示 x₁ :: … :: x n :: []
和所有其他二元运算符一样，:: 运算符的结合优先级低于函数应用。因此，f x
:: List.reverse ys 会被解析为 (f x) :: (List.reverse ys)。避免不必要
的括号是一种良好的编程习惯，因为括号会降低可读性。此外，在中缀运算符两侧
加上空格，有助于表达正确的优先级。
函数式程序员通常会用 xs、ys、zs 这样的名字来表示列表，虽然在 Lean 中 l
也很常见。由于列表包含多个元素，使用复数形式是很自然的。例如，猫的列表可
以命名为 cats，猫的列表的列表可以命名为 catss。当我们将一个非空列表表示
为表头和表尾时，通常会写作 x :: xs 或 cat :: cats。

2.2 函数定义
如果我们只想声明一个函数，那么可以使用 opaque 命令（章节 1.2）。但通常
来说，我们想要定义函数的行为，那么可以使用 def 命令。由于 Lean 的根基是函数
式变成，函数会定义为可求值的数学表达式，而非修改某些状态的指令时程序。与
此相应，Lean 并不使用 while 或 for 来迭代，而是使用递归作为遍历数据的主要
机制。

在自然数上递归

2.2.1

我们来看一个简单的例子，看看递归是如何工作的。斐波那契数的 Lean 定义
如下：
def fib : ℕ → ℕ
| 0

=> 0

| 1

=> 1

| n + 2 => fib (n + 1) + fib n
左侧的模式对应于函数的参数。在这里，fib 的声明中只有一个类型为 ℕ 的参数，
Pattern-Match

因此我们只需对一个自然数进行模式匹配。当输入具有给定的形式时，相应的模式
匹配就会被触发。例如，如果输入是 1，那么模式 1 就会匹配它，并计算对应的右

2.2. 函数定义

侧表达式。如果输入是 5，则会触发模式 n + 2，此时 n := 3。然后将 n 取值为 3 计
算右侧表达式，得到 fib 4 + fib 3。
递归定义的一般形式为：
def 名称 (参数 1 : 类型 1 ) . . . (参数 m : 类型 m ) : 类型
| 模式 1 => 结果 1
.
……..
| 模式 n => 结果 n
参数 参数 1 到 参数 m 不能用于模式匹配，只有在 类型 中声明的剩余参数才能进行
模式匹配。如果一行中提供了多个模式，它们之间用逗号分隔。模式中可以包含变
量，这些变量在对应的右侧表达式中是可见的，也可以包含构造子。
基本的自然数算术运算，如加法、乘法和幂运算，都可以通过递归来定义。当
然，这些运算在 Lean 中已经预定义了（分别为 +、* 和 ^），但自己实现一遍也是很
有意义的练习。我们先从加法开始：
def add : ℕ → ℕ → ℕ
| m, Nat.zero

=> m

| m, Nat.succ n => Nat.succ (add m n)
我们对两个参数同时进行模式匹配，区分第二个参数为零和非零的情况。每一次对
add 的递归调用，都会从第二个参数中剥离出一个 Nat.succ 构造子。Lean 允许我
们用 0 和 n + 1 这样的语法糖来代替 Nat.zero 和 Nat.succ n。
我们可以使用 #eval 或 #reduce 来计算 add 应用于数字的结果：
#eval add 2 7
#reduce add 2 7
两个命令都会在 Visual Studio Code 中打印出 9。#eval 会使用一个经过优化
的解释器，而 #reduce 则会使用 Lean 的推理内核，它的效率更低。
当定一个函数时，最佳实践是每次提供一些测试来确保函数的行为符合预期。你
甚至可以在 Lean 文件中保留 #eval 或 #reduce 作为文档。
乘法的定义与加法类似：
def mul : ℕ → ℕ → ℕ
| _, Nat.zero

=> Nat.zero

| m, Nat.succ n => add m (mul m n)
下划线（_）表示未使用的变量。我们本可以使用一个名字（例如 m），但 _ 能
更好地记录我们的意图。
下面的 #eval 命令会打印 14，符合预期：
#eval mul 2 7

指数（「m 的 n 次方」）有多种定义的方式。我们的第一个方案在结构上与乘法
的定义完全相同：
def power : ℕ → ℕ → ℕ
| _, Nat.zero

=> 1

| m, Nat.succ n => mul m (power m n)
我们可以将第一个参数 m 提取出来，并作为 参数 放在函数名旁边，位于引入函
数类型的冒号之前（排除该参数 m）：
def powerParam (m : ℕ) : ℕ → ℕ
| Nat.zero

=> 1

| Nat.succ n => mul m (powerParam m n)
从外部看，这两个定义没有区别。事实上，我们已经在 List 构造子的类型参
数 α 中见过这种语法了（第 2.1 节）。
还有另一种定义方式，即先引入一个通用的迭代器，然后使用正确的参数来调
用它：
def iter (α : Type) (z : α) (f : α → α) : ℕ → α
| Nat.zero

=> z

| Nat.succ n => f (iter α z f n)
def powerIter (m n : ℕ) : ℕ :=
iter ℕ 1 (mul m) n
iter 函数接收一个类型 α，一个「零」值 z，一个一元函数 f，以及一个自然数 n，
并计算出
f (f (⋯ (f z) ⋯))
|
{z
}
n次

它是高阶函数的一个例子：一种将另一个函数（此处为 f）作为参数的函数。在
函数式编程中，函数被视为与其他对象一样的普通对象，可以用作参数或函数的返
回结果。在这里，我们使用 iter 来计算 m 的 n 次幂：
mul m (mul m (⋯ (mul m 1) ⋯))
|
{z
}
n次

最后，请注意 powerIter 的定义不是递归的。对于不使用模式匹配的非递归
函数，其语法简单如下：
def name (参数 1 : 类型 1 ) . . . (参数 m : 类型 m ) : 类型 :=

结果

2.2. 函数定义

2.2.2 算术表达式上的递归
回到算术表达式类型，如果我们想在 Java 中实现一个 eval 函数，我们可能会
将其作为 AExp 接口的一部分，并在每个子类中实现它。对于 Add、Sub、Mul 和
Div，我们会递归地在 left 和 right 对象上调用 eval。
在 Lean 中，其语法非常简洁。我们定义一个函数，并使用模式匹配来区分这六
种情况：
def eval (env : String → ℤ) : AExp → ℤ
| AExp.num i

=> i

| AExp.var x

=> env x

| AExp.add e₁ e₂ => eval env e₁ + eval env e₂
| AExp.sub e₁ e₂ => eval env e₁ - eval env e₂
| AExp.mul e₁ e₂ => eval env e₁ * eval env e₂
| AExp.div e₁ e₂ => eval env e₁ / eval env e₂
请注意，此函数是高阶函数：它接收一个函数 env，该函数表示一个将值分配给
Environment

变量的「环境」。在 AExp.var 情况下，环境用于求值变量，并在递归情况（AExp.add
、AExp.sub、AExp.mul 和 AExp.div）中传递。
也许你会担心 AExp.div 情况下的除以零问题。让我们看看 #eval 对此有何
评价，使用一个将 7 分配给所有变量的环境：
#eval eval (fun x ↦ 7) (AExp.div (AExp.var "y") (
AExp.num 0))
输出结果是 0。在 Lean 中，除法被方便地定义为一个全函数，当分母为零时返
回零。关于为什么这并不危险的清晰解释，请参阅 Buzzard 的博客。2

2.2.3

列表上的递归

列表上的递归函数可以用类似的方式定义：
def append (α : Type) : List α → List α → List α
| List.nil,

ys => ys

| List.cons x xs, ys => List.cons x (append α xs ys)
append 函数接受三个参数：一个类型 α 和两个类型为 List α 的列表。
#eval append ℕ [3, 1] [4, 1, 5]
#eval append _ [3, 1] [4, 1, 5]
通过传入占位符 _，我们让 Lean 从其他两个参数的类型中推断出类型 ℕ。
为了使类型参数 α 成为隐式参数，我们可以将其放在花括号 { } 中：
https://xenaproject.wordpress.com/2020/07/05/division-by-zero-in-typetheory-a-faq/

def appendImplicit {α : Type} : List α → List α → List
α
| List.nil,

ys => ys

| List.cons x xs, ys => List.cons x (appendImplicit xs
ys)
#eval appendImplicit [3, 1] [4, 1, 5]
@ 符号可用于使隐式参数显式化。有时这对于指导 Lean 的解析器是必要的。
#eval @appendImplicit ℕ [3, 1] [4, 1, 5]
#eval @appendImplicit _ [3, 1] [4, 1, 5]
我们可以在定义中使用语法糖，无论是在 => 左侧的模式中，还是在右侧：
def appendPretty {α : Type} : List α → List α → List α
| [],

ys => ys

| x :: xs, ys => x :: appendPretty xs ys
在 Lean 的标准库中，追加函数是一个名为 ++ 的中缀运算符。我们可以用它来
定义一个反转列表的函数：
def reverse {α : Type} : List α → List α
| []

=> []

| x :: xs => reverse xs ++ [x]

定理陈述

2.3

Lean 既是证明助手又是编程语言的原因在于，我们可以对定义的类型和常量
Theorem

Lemma Corollary

Fact

陈述定理，并证明它们成立。在交互式定理证明中，术语定理、引理、推论、事实、

Property

True Statement

PropositionLogical Formula Statement

性质以及真陈述的使用或多或少是可以互换的。类似地，命题、逻辑公式和陈述的意
思也都是一样的。
在 Lean 中，命题仅仅是 Prop 类型的项。这与一阶逻辑形成对比，在一阶逻辑
中，传统上在语法中区分项和公式。可以证明的命题被称为定理（或引理、推论等）；
否则，它就是一个非定理或假陈述。数学家有时将术语「命题」作为定理的同义词

（例如，「命题 3.14」），但在形式逻辑中，命题也可以是假的。
以下是关于第 2.2 节中定义的加法、乘法和列表反转操作的真陈述示例：
theorem add_comm (m n : ℕ) :
add m n = add n m :=
sorry

2.3. 定理陈述

theorem add_assoc (l m n : ℕ) :
add (add l m) n = add l (add m n) :=
sorry
theorem mul_comm (m n : ℕ) :
mul m n = mul n m :=
sorry
theorem mul_assoc (l m n : ℕ) :
mul (mul l m) n = mul l (mul m n) :=
sorry
theorem mul_add (l m n : ℕ) :
mul l (add m n) = add (mul l m) (mul l n) :=
sorry
theorem reverse_reverse {α : Type} (xs : List α) :
reverse (reverse xs) = xs :=
sorry
其一般形式为
theorem name (参数 1 : 类型 1 ) . . . (参数 m : 类型 m ) :

陈述 :=
证明
:= 符号将定理的陈述与其证明隔开。theorem 的语法与没有模式匹配的 def
命令非常相似，用 statement 代替 type，用 proof 代替 result。在上面的例
子中，我们放置了标记 sorry 作为实际证明的占位符。这个标记字面上是向未来的
读者和 Lean 表示道歉，因为缺乏证明。这也是值得 担心的一个理由，直到我们设
法消除它。在第 3 章和第 4 章中，我们将看到如何实现这一点。
带有 sorry 证明的 theorem 命令的直观语义是：「这个命题应该是可以证明
的，但我还没有进行证明 ⸺ 抱歉。」有时，我们想表达一个相关的想法，即：
「让我
们假设这个命题成立。」Lean 为此提供了 axiom 命令，通常与 opaque 结合使用。
例如：
opaque a : ℤ
opaque b : ℤ
axiom a_less_b :
a < b

在 opaque 命令之后，除了它们的类型之外，我们没有关于 a 和 b 的任何信息。
公理指定了它们应该具有的性质。该命令的通用格式为：
axiom name (参数 1 : 类型 1 ) . . . (参数 m : 类型 m ) :

陈述
公理是危险的，因为它们可能导致逻辑不一致，从而使我们能够推导出 False。
例如，如果我们添加第二个公理陈述 a > b，我们就可以很容易地推导出 False。交

Certified Programs and Proofs

互式定理证明的历史充满了不一致的公理。这里有一个轶事：在 2020 年的「认证程序与证明」
会议上，一篇提交的论文因为一个有缺陷的公理而被拒绝，其中一位同行评审员从
中推导出了 False。3 因此，我们通常会避免使用公理。
从 Lean 的角度来看，带有 sorry 证明的定理实际上就是一个公理，可能会破
坏逻辑的一致性。为了防止误解，最好只在开发证明时将 sorry 作为临时措施，而
不是将其作为更明确且诚实的 axiom 的替代品。

新引入的 Lean 结构总结

2.4

诊断命令
#eval

使用优化的解释器执行一个项

#print

打印一个常量的定义

#reduce

使用 Lean 的推断内核执行一个项

Inference Kernel

声明
axiom

陈述一个公理

def

定义一个新的常量

inductive

引入一个类型及其构造子

namespace … end

在命名作用域内收集声明

theorem

陈述一个定理及其证明

Named Scope

证明命令
sorry

代表缺失的证明或定义

该论文的一位作者报告说，该公理现在已经过修订并作为定理推导出来。整个形式化开发现在已
Computer Aided Verification 2020

不含公理。修订后的论文已在「计算机辅助验证 2020」会议上被接受 [7]。
