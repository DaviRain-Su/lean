# 第 2 章 程序与定理

> 已对照 Lean-zh PDF 与 `LoVe02_ProgramsAndTheorems_Demo.lean` 人工校对（原 PDF 1116–1713 行）。

我们继续学习 Lean 的基础知识，重点关注程序和定理，但暂不进行任何证明。具体来说，我们将回顾如何定义新的类型和函数，以及如何将其预期的性质表述为定理。

## 2.1 类型定义

Lean 归纳构造演算的一个显著特点是它内置了对归纳类型的支持。**归纳类型**（inductive type）是一种类型，其值是通过应用称为**构造子**（constructor）的特殊常量来构建的。归纳类型是在程序中表示非循环数据的一种简洁方式。你可能还知道一些其他的、大致相同的名称，包括**代数数据类型**（algebraic data type）、**归纳数据类型**（inductive data type）、**自由生成的数据类型**（freely generated data type）、**递归数据类型**（recursive data type），或简称为**数据类型**（data type）。

### 2.1.1 自然数的定义

归纳类型的「Hello, World!」示例是自然数类型 `Nat`（`ℕ`）。在 Lean 中，它可以定义如下：

```lean
inductive Nat : Type where
  | zero : Nat
  | succ : Nat → Nat
```

第一行向世界声明我们引入了一个名为 `Nat` 的新类型，用于表示自然数。第二行和第三行声明了两个新的构造子，`Nat.zero : Nat` 以及 `Nat.succ : Nat → Nat`，它们可用于构造类型为 `Nat` 的值。按照计算机科学和逻辑学中既定的惯例，计数从 0 开始。第二个构造子让这个归纳定义变得有趣——它需要一个类型为 `Nat` 的参数来产生一个类型为 `Nat` 的值。

以下这些项

```lean
Nat.zero
Nat.succ Nat.zero
Nat.succ (Nat.succ Nat.zero)
-- ...
```

表示类型为 `Nat` 的不同值——0、0 的后继数、0 的后继数的后继数，以此类推。这种记法被称为**一元记法**（unary notation），也叫**皮亚诺记法**（Peano notation），以逻辑学家朱塞佩·皮亚诺（Giuseppe Peano）的名字命名。若想了解在 Lean 中对皮亚诺数的另一种解释（还有一些令人惊叹的电子游戏画面），请参阅凯文·巴扎德（Kevin Buzzard）的文章 [《计算机能证明定理吗？》][buzzard-chalkdust]。

类型声明的通用格式为

```
inductive 类型名 (参数₁ : 类型₁) … (参数ₖ : 类型ₖ) : Type where
  | 构造子名称₁ : 构造子类型₁
  …
  | 构造子名称ₙ : 构造子类型ₙ
```

对于自然数，我们可以让 Lean 使用大家熟悉的名称 `0`、`1`、`2` 等等；实际上，预定义的 `ℕ` 类型就提供了这样的语法糖。不过，使用更详细的表示法能让我们更清楚地了解 Lean 的类型定义。

在本章配套的 Lean 文件中，`Nat` 的定义被放在一个命名空间内，通过 `namespace MyNat` 和 `end MyNat` 进行界定，以将其作用域限制在文件的某一部分。在 `end MyNat` 之后，出现的所有 `Nat`、`Nat.zero` 或 `Nat.succ` 都将指向 Lean 预定义的自然数类型。同样，整个文件被放在 `LoVe` 命名空间下，以避免与 Lean 现有库中的名称冲突。

我们可以在 Lean 的任何位置使用 `#print` 命令来查看之前的定义。例如，在 `MyNat` 命名空间内输入 `#print Nat`，会显示如下信息：

```
inductive LoVe.MyNat.Nat : Type
number of parameters: 0
constructors:
  LoVe.MyNat.Nat.zero : Nat
  LoVe.MyNat.Nat.succ : Nat → Nat
```

本书侧重于自然数，这也是本书许多内容偏向计算机科学的体现之一。对于数论学家来说，他们可能更关注整数 `ℤ` 和有理数 `ℚ`；分析学家则更希望处理实数 `ℝ` 和复数 `ℂ`。然而，自然数在计算机科学中无处不在，并且作为归纳类型有着非常简单的定义。正如我们将在[第 12 章](ch12_LogicalFoundations.md)中看到的，自然数还可以用来构建其他类型。

### 2.1.2 算术表达式的定义

下一个例子会用到整数。如果我们要实现一个计算器程序或一种编程语言，那么就需要定义一种类型，用来将算术表达式表示为抽象语法树。下面的例子展示了如何在 Lean 中实现这一点：

```lean
inductive AExp : Type where
  | num : ℤ → AExp
  | var : String → AExp
  | add : AExp → AExp → AExp
  | sub : AExp → AExp → AExp
  | mul : AExp → AExp → AExp
  | div : AExp → AExp → AExp
```

从数学上讲，该定义等价于用以下生成规则来归纳地定义类型 `AExp`：

1. 对于每个整数 `i`，项 `AExp.num i` 都是一个 `AExp` 值。（直观上，构造子 `AExp.num` 就是把一个整数「包装」为一个算术表达式。）
2. 对于每个字符串 `x`，项 `AExp.var x` 都是一个 `AExp` 值。
3. 若 `e₁` 和 `e₂` 都是 `AExp` 值，那么 `AExp.add e₁ e₂`、`AExp.sub e₁ e₂`、`AExp.mul e₁ e₂` 和 `AExp.div e₁ e₂` 也都是 `AExp` 值。

上述定义穷尽了所有情况。`AExp` 所有可能的取值都只能通过生成规则 1 到 3 构造得到。此外，使用不同生成规则构造出的 `AExp` 值彼此不同。这两条归纳类型的性质可以用 Joseph Goguen 提出的口号来概括：「**无杂质，无混淆**」（no junk, no confusion）。

将上面 Lean 中简洁的 `AExp` 定义与实现相同功能的 Java 程序作对比也许会很有启发意义。该 Java 程序包含一个接口和六个实现该接口的类，分别对应于 `AExp` 类型及其六个构造子：

```java
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
  public Add(AExp left, AExp right) {
    this.left = left; this.right = right;
  }
}

public class Sub implements AExp {
  public AExp left;
  public AExp right;
  public Sub(AExp left, AExp right) {
    this.left = left; this.right = right;
  }
}

public class Mul implements AExp {
  public AExp left;
  public AExp right;
  public Mul(AExp left, AExp right) {
    this.left = left; this.right = right;
  }
}

public class Div implements AExp {
  public AExp left;
  public AExp right;
  public Div(AExp left, AExp right) {
    this.left = left; this.right = right;
  }
}
```

在 Python 中，同样的类声明如下：

```python
class AExp:
    pass

class Num(AExp):
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
```

### 2.1.3 列表的定义

我们考虑的下一个类型是有限列表：

```lean
inductive List (α : Type) where
  | nil  : List α
  | cons : α → List α → List α
```

该类型是**多态的**（polymorphic）：它由一个类型参数 `α` 参数化，我们可以用具体类型对其进行实例化。例如，`List ℤ` 表示整数列表的类型，`List (List ℝ)` 表示实数列表的列表类型。类型构造子 `List` 以一个类型作为参数并返回一个类型。类似于 Java 的泛型和 C++ 的模板，多态性是一种提供参数化类型的机制。

以下命令显示了构造子的类型：

```lean
#check List.nil
#check List.cons
```

Lean 的内置列表提供了语法糖来编写列表：

| 写法 | 含义 |
|------|------|
| `[]` | `List.nil` |
| `x :: xs` | `List.cons x xs` |
| `[x₁, …, xₙ]` | `x₁ :: … :: xₙ :: []` |

和所有其他二元运算符一样，`::` 运算符的结合优先级低于函数应用。因此，`f x :: List.reverse ys` 会被解析为 `(f x) :: (List.reverse ys)`。避免不必要的括号是一种良好的编程习惯，因为括号会降低可读性。此外，在中缀运算符两侧加上空格，有助于表达正确的优先级。

函数式程序员通常会用 `xs`、`ys`、`zs` 这样的名字来表示列表，虽然在 Lean 中 `l` 也很常见。由于列表包含多个元素，使用复数形式是很自然的。例如，猫的列表可以命名为 `cats`，猫的列表的列表可以命名为 `catss`。当我们将一个非空列表表示为表头和表尾时，通常会写作 `x :: xs` 或 `cat :: cats`。

## 2.2 函数定义

如果我们只想声明一个函数，那么可以使用 `opaque` 命令（第 1.2 节）。但通常来说，我们想要定义函数的行为，那么可以使用 `def` 命令。由于 Lean 的根基是函数式编程，函数会定义为可求值的数学表达式，而非修改某些状态的指令式程序。与此相应，Lean 并不使用 `while` 或 `for` 来迭代，而是使用递归作为遍历数据的主要机制。

定义作用于归纳类型上的函数语法非常简洁：我们定义一个单一函数，并使用**模式匹配**（pattern matching）来提取构造子的参数。

### 2.2.1 在自然数上递归

我们来看一个简单的例子，看看递归是如何工作的。斐波那契数的 Lean 定义如下：

```lean
def fib : ℕ → ℕ
  | 0     => 0
  | 1     => 1
  | n + 2 => fib (n + 1) + fib n
```

左侧的模式对应于函数的参数。在这里，`fib` 的声明中只有一个类型为 `ℕ` 的参数，因此我们只需对一个自然数进行模式匹配。当输入具有给定的形式时，相应的模式匹配就会被触发。例如，如果输入是 `1`，那么模式 `1` 就会匹配它，并计算对应的右侧表达式。如果输入是 `5`，则会触发模式 `n + 2`，此时 `n := 3`。然后将 `n` 取值为 3 计算右侧表达式，得到 `fib 4 + fib 3`。

递归定义的一般形式为：

```
def 名称 (参数₁ : 类型₁) … (参数ₘ : 类型ₘ) : 类型
  | 模式₁ => 结果₁
  …
  | 模式ₙ => 结果ₙ
```

参数 `参数₁` 到 `参数ₘ` 不能用于模式匹配，只有在 `:` 之后声明的剩余参数才能进行模式匹配。如果一行中提供了多个模式，它们之间用逗号分隔。模式中可以包含变量，这些变量在对应的右侧表达式中是可见的，也可以包含构造子。

基本的自然数算术运算，如加法、乘法和幂运算，都可以通过递归来定义。当然，这些运算在 Lean 中已经预定义了（分别为 `+`、`*` 和 `^`），但自己实现一遍也是很有意义的练习。我们先从加法开始：

```lean
def add : ℕ → ℕ → ℕ
  | m, Nat.zero   => m
  | m, Nat.succ n => Nat.succ (add m n)
```

我们对两个参数同时进行模式匹配，区分第二个参数为零和非零的情况。每一次对 `add` 的递归调用，都会从第二个参数中剥离出一个 `Nat.succ` 构造子。Lean 允许我们用 `0` 和 `n + 1` 这样的语法糖来代替 `Nat.zero` 和 `Nat.succ n`。

我们可以使用 `#eval` 或 `#reduce` 来计算 `add` 应用于数字的结果：

```lean
#eval add 2 7
#reduce add 2 7
```

两个命令都会在 Visual Studio Code 中打印出 `9`。`#eval` 会使用一个经过优化的解释器，而 `#reduce` 则会使用 Lean 的推理内核，它的效率更低。

当定义一个函数时，最佳实践是每次提供一些测试来确保函数的行为符合预期。你甚至可以在 Lean 文件中保留 `#eval` 或 `#reduce` 作为文档。

乘法的定义与加法类似：

```lean
def mul : ℕ → ℕ → ℕ
  | _, Nat.zero   => Nat.zero
  | m, Nat.succ n => add m (mul m n)
```

下划线（`_`）表示未使用的变量。我们本可以使用一个名字（例如 `m`），但 `_` 能更好地记录我们的意图。

```lean
#eval mul 2 7  -- 14
```

指数（「m 的 n 次方」）有多种定义的方式。我们的第一个方案在结构上与乘法的定义完全相同：

```lean
def power : ℕ → ℕ → ℕ
  | _, Nat.zero   => 1
  | m, Nat.succ n => mul m (power m n)
```

我们可以将第一个参数 `m` 提取出来，并作为参数放在函数名旁边，位于引入函数类型的冒号之前（排除该参数 `m`）：

```lean
def powerParam (m : ℕ) : ℕ → ℕ
  | Nat.zero   => 1
  | Nat.succ n => mul m (powerParam m n)
```

从外部看，这两个定义没有区别。事实上，我们已经在 `List` 构造子的类型参数 `α` 中见过这种语法了（第 2.1 节）。

还有另一种定义方式，即先引入一个通用的迭代器，然后使用正确的参数来调用它：

```lean
def iter (α : Type) (z : α) (f : α → α) : ℕ → α
  | Nat.zero   => z
  | Nat.succ n => f (iter α z f n)

def powerIter (m n : ℕ) : ℕ :=
  iter ℕ 1 (mul m) n
```

`iter` 函数接收一个类型 `α`，一个「零」值 `z`，一个一元函数 `f`，以及一个自然数 `n`，并计算出

```
f (f (⋯ (f z) ⋯))   （共 n 次）
```

它是**高阶函数**的一个例子：一种将另一个函数（此处为 `f`）作为参数的函数。在函数式编程中，函数被视为与其他对象一样的普通对象，可以用作参数或函数的返回结果。在这里，我们使用 `iter` 来计算 `m` 的 `n` 次幂：

```
mul m (mul m (⋯ (mul m 1) ⋯))   （共 n 次）
```

最后，请注意 `powerIter` 的定义不是递归的。对于不使用模式匹配的非递归函数，其语法简单如下：

```
def name (参数₁ : 类型₁) … (参数ₘ : 类型ₘ) : 类型 := 结果
```

Lean 仅接受那些能够证明其终止性的函数定义。特别是，它接受**结构递归**（structurally recursive）函数，这些函数每次仅剥离一个构造子。

### 2.2.2 算术表达式上的递归

回到算术表达式类型，如果我们想在 Java 中实现一个 `eval` 函数，我们可能会将其作为 `AExp` 接口的一部分，并在每个子类中实现它。对于 `Add`、`Sub`、`Mul` 和 `Div`，我们会递归地在 `left` 和 `right` 对象上调用 `eval`。

在 Lean 中，其语法非常简洁。我们定义一个函数，并使用模式匹配来区分这六种情况：

```lean
def eval (env : String → ℤ) : AExp → ℤ
  | AExp.num i     => i
  | AExp.var x     => env x
  | AExp.add e₁ e₂ => eval env e₁ + eval env e₂
  | AExp.sub e₁ e₂ => eval env e₁ - eval env e₂
  | AExp.mul e₁ e₂ => eval env e₁ * eval env e₂
  | AExp.div e₁ e₂ => eval env e₁ / eval env e₂
```

请注意，此函数是高阶函数：它接收一个函数 `env`，该函数表示一个将值分配给变量的**环境**（environment）。在 `AExp.var` 情况下，环境用于求值变量，并在递归情况（`AExp.add`、`AExp.sub`、`AExp.mul` 和 `AExp.div`）中传递。

也许你会担心 `AExp.div` 情况下的除以零问题。让我们看看 `#eval` 对此有何评价，使用一个将 `7` 分配给所有变量的环境：

```lean
#eval eval (fun x ↦ 7) (AExp.div (AExp.var "y") (AExp.num 0))
```

输出结果是 `0`。在 Lean 中，除法被方便地定义为一个全函数，当分母为零时返回零。关于为什么这并不危险的清晰解释，请参阅 Buzzard 的[博客文章][buzzard-div-zero]。

### 2.2.3 列表上的递归

列表上的递归函数可以用类似的方式定义：

```lean
def append (α : Type) : List α → List α → List α
  | List.nil,       ys => ys
  | List.cons x xs, ys => List.cons x (append α xs ys)
```

`append` 函数接受三个参数：一个类型 `α` 和两个类型为 `List α` 的列表。

```lean
#eval append ℕ [3, 1] [4, 1, 5]
#eval append _ [3, 1] [4, 1, 5]
```

通过传入占位符 `_`，我们让 Lean 从其他两个参数的类型中推断出类型 `ℕ`。

由于 `append` 必须适用于任何类型的列表，因此其元素的类型是作为参数提供的。为了使类型参数 `α` 成为隐式参数，我们可以将其放在花括号 `{ }` 中：

```lean
def appendImplicit {α : Type} : List α → List α → List α
  | List.nil,       ys => ys
  | List.cons x xs, ys => List.cons x (appendImplicit xs ys)

#eval appendImplicit [3, 1] [4, 1, 5]
```

`@` 符号可用于使隐式参数显式化。有时这对于指导 Lean 的解析器是必要的。

```lean
#eval @appendImplicit ℕ [3, 1] [4, 1, 5]
#eval @appendImplicit _ [3, 1] [4, 1, 5]
```

我们可以在定义中使用语法糖，无论是在 `=>` 左侧的模式中，还是在右侧：

```lean
def appendPretty {α : Type} : List α → List α → List α
  | [],      ys => ys
  | x :: xs, ys => x :: appendPretty xs ys
```

在 Lean 的标准库中，追加函数是一个名为 `++` 的中缀运算符。我们可以用它来定义一个反转列表的函数：

```lean
def reverse {α : Type} : List α → List α
  | []      => []
  | x :: xs => reverse xs ++ [x]
```

## 2.3 定理陈述

Lean 既是证明助手又是编程语言的原因在于，我们可以对定义的类型和常量陈述定理，并证明它们成立。在交互式定理证明中，术语**定理**（theorem）、**引理**（lemma）、**推论**（corollary）、**事实**（fact）、**性质**（property）以及**真陈述**（true statement）的使用或多或少是可以互换的。类似地，**命题**（proposition）、**逻辑公式**（logical formula）和**陈述**（statement）的意思也都是一样的。

在 Lean 中，命题仅仅是 `Prop` 类型的项。这与一阶逻辑形成对比，在一阶逻辑中，传统上在语法中区分项和公式。可以证明的命题被称为定理（或引理、推论等）；否则，它就是一个非定理或假陈述。数学家有时将术语「命题」作为定理的同义词（例如，「命题 3.14」），但在形式逻辑中，命题也可以是假的。

请注意与 `def` 命令的相似性。`theorem` 类似于 `def`，不同之处在于其结果是一个命题，而不是数据或函数。

以下是关于第 2.2 节中定义的加法、乘法和列表反转操作的真陈述示例：

```lean
theorem add_comm (m n : ℕ) :
    add m n = add n m :=
  sorry

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
```

其一般形式为

```
theorem name (参数₁ : 类型₁) … (参数ₘ : 类型ₘ) :
    陈述 :=
  证明
```

`:=` 符号将定理的陈述与其证明隔开。`theorem` 的语法与没有模式匹配的 `def` 命令非常相似，用 `陈述` 代替类型，用 `证明` 代替结果。在上面的例子中，我们放置了标记 `sorry` 作为实际证明的占位符。这个标记字面上是向未来的读者和 Lean 表示道歉，因为缺乏证明。这也是值得担心的一个理由，直到我们设法消除它。在第 3 章和第 4 章中，我们将看到如何实现这一点。

带有 `sorry` 证明的 `theorem` 命令的直观语义是：「这个命题应该是可以证明的，但我还没有进行证明——抱歉。」有时，我们想表达一个相关的想法，即：「让我们假设这个命题成立。」Lean 为此提供了 `axiom` 命令，通常与 `opaque` 结合使用。例如：

```lean
opaque a : ℤ
opaque b : ℤ

axiom a_less_b :
    a < b
```

在 `opaque` 命令之后，除了它们的类型之外，我们没有关于 `a` 和 `b` 的任何信息。公理指定了它们应该具有的性质。该命令的通用格式为

```
axiom name (参数₁ : 类型₁) … (参数ₘ : 类型ₘ) :
    陈述
```

公理是危险的，因为它们可能导致逻辑不一致，从而使我们能够推导出 `False`。例如，如果我们添加第二个公理陈述 `a > b`，我们就可以很容易地推导出 `False`。交互式定理证明的历史充满了不一致的公理。这里有一个轶事：在 2020 年的「认证程序与证明」（Certified Programs and Proofs，CPP）会议上，一篇提交的论文因为一个有缺陷的公理而被拒绝，其中一位同行评审员从中推导出了 `False`。[^cpp2020] 因此，我们通常会避免使用公理。

从 Lean 的角度来看，带有 `sorry` 证明的定理实际上就是一个公理，可能会破坏逻辑的一致性。为了防止误解，最好只在开发证明时将 `sorry` 作为临时措施，而不是将其作为更明确且诚实的 `axiom` 的替代品。

[^cpp2020]: 该论文的一位作者报告说，该公理现在已经过修订并作为定理推导出来。整个形式化开发现在已不含公理。修订后的论文已在「计算机辅助验证 2020」（Computer Aided Verification 2020）会议上被接受 [7]。

## 2.4 新引入的 Lean 结构总结

| 分类 | 语法 | 含义 |
|------|------|------|
| 诊断命令 | `#eval` | 使用优化的解释器执行一个项 |
| 诊断命令 | `#print` | 打印一个常量的定义 |
| 诊断命令 | `#reduce` | 使用 Lean 的推断内核执行一个项 |
| 声明 | `axiom` | 陈述一个公理 |
| 声明 | `def` | 定义一个新的常量 |
| 声明 | `inductive` | 引入一个类型及其构造子 |
| 声明 | `namespace … end` | 在命名作用域内收集声明 |
| 声明 | `theorem` | 陈述一个定理及其证明 |
| 证明命令 | `sorry` | 代表缺失的证明或定义 |

[buzzard-chalkdust]: http://chalkdustmagazine.com/features/can-computers-prove-theorems/
[buzzard-div-zero]: https://xenaproject.wordpress.com/2020/07/05/division-by-zero-in-type-theory-a-faq/