# 第 8 章：归纳与递归

> 本译文对应原书 [Induction and Recursion](https://lean-lang.org/theorem_proving_in_lean4/Induction-and-Recursion/)；英文 Verso 源：`book/TPiL/InductionAndRecursion.lean`。

上一章我们看到，归纳定义是在 Lean 中引入新类型的有力手段。此外，构造子与 recursor 是在这些类型上定义函数的唯一直接手段。按**命题即类型**对应，这意味着归纳是证明的基本方法。

Lean 提供自然的方式定义递归函数、进行模式匹配、书写归纳证明。你可以通过指定函数应满足的方程来定义函数，也可以通过说明如何处理各种可能出现的情形来证明定理。在幕后，这些描述被「编译」为原始 recursor，所用过程我们称为「**方程编译器**」（equation compiler）。方程编译器不属于可信代码库；其输出由内核独立检查。

## 8.1 模式匹配

示意性模式的解释是编译过程的第一步。我们已看到 `casesOn` recursor 可按归纳定义类型涉及的构造子，对函数定义与定理证明进行分情形论证。但复杂定义可能包含多层嵌套的 `casesOn` 应用，难以阅读和理解。模式匹配提供更方便、且函数式编程语言用户熟悉的方法。

考虑归纳定义的自然数类型。每个自然数要么是 `zero`，要么是 `succ x`，因此你可以为这两种情形分别指定值，从而定义从自然数到任意类型的函数：

```lean
set_option linter.unusedVariables false
--------
open Nat

def sub1 : Nat → Nat
  | zero   => zero
  | succ x => x

def isZero : Nat → Bool
  | zero   => true
  | succ x => false
```

用于定义这些函数的方程在定义上成立：

```lean
open Nat
def sub1 : Nat → Nat
  | zero   => zero
  | succ x => x
def isZero : Nat → Bool
  | zero   => true
  | succ x => false
------
example : sub1 0 = 0 := rfl
example (x : Nat) : sub1 (succ x) = x := rfl

example : isZero 0 = true := rfl
example (x : Nat) : isZero (succ x) = false := rfl

example : sub1 7 = 6 := rfl
example (x : Nat) : isZero (x + 3) = false := rfl
```

除了 `zero` 和 `succ`，我们还可以使用更熟悉的记法：

```lean
set_option linter.unusedVariables false
--------
def sub1 : Nat → Nat
  | 0     => 0
  | x + 1 => x

def isZero : Nat → Bool
  | 0     => true
  | x + 1 => false
```

由于加法和零记号被赋予了 `[match_pattern]` 属性，它们可用于模式匹配。Lean 只需将这些表达式归一化，直到暴露出构造子 `zero` 和 `succ`。

模式匹配适用于任何归纳类型，例如积类型与 `Option` 类型：

```lean
def swap : α × β → β × α
  | (a, b) => (b, a)

def foo : Nat × Nat → Nat
  | (m, n) => m + n

def bar : Option Nat → Nat
  | some n => n + 1
  | none   => 0
```

这里我们不仅用它定义函数，还用它进行分情形证明：

```lean
namespace Hidden
------
def not : Bool → Bool
  | true  => false
  | false => true

theorem not_not : ∀ (b : Bool), not (not b) = b
  | true  => show not (not true) = true from rfl
  | false => show not (not false) = false from rfl
------
end Hidden
```

模式匹配也可用于解构归纳定义的命题：

```lean
example (p q : Prop) : p ∧ q → q ∧ p
  | And.intro h₁ h₂ => And.intro h₂ h₁

example (p q : Prop) : p ∨ q → q ∨ p
  | Or.inl hp => Or.inr hp
  | Or.inr hq => Or.inl hq
```

这为展开使用逻辑联结词的假设提供了紧凑方式。

以上例子中，模式匹配只进行了一次情形区分。更有趣的是，模式可涉及嵌套构造子，如下例。

```lean
def sub2 : Nat → Nat
  | 0     => 0
  | 1     => 0
  | x + 2 => x
```

方程编译器首先按输入是 `zero` 还是 `succ x` 的形式分情形。然后对 `x` 是 `zero` 还是 `succ x` 的形式再分情形。它根据给出的模式确定必要的分情形，若模式未能穷尽所有情形则报错。我们仍可使用算术记法，如下版本。无论哪种写法，定义方程都在定义上成立。

```lean
def sub2 : Nat → Nat
  | 0   => 0
  | 1   => 0
  | x+2 => x
------
example : sub2 0 = 0 := rfl
example : sub2 1 = 0 := rfl
example : sub2 (x+2) = x := rfl

example : sub2 5 = 3 := rfl
```

可写 `#print sub2` 查看函数如何被编译为 recursor。（Lean 会告诉你 `sub2` 是用内部辅助函数 `sub2.match_1` 定义的，你也可以打印它。）Lean 用这些辅助函数编译 `match` 表达式。实际上，上面的定义会展开为：

```lean
def sub2 : Nat → Nat :=
  fun x =>
    match x with
    | 0     => 0
    | 1     => 0
    | x + 2 => x
```

下面是更多嵌套模式匹配的例子：

```lean
set_option linter.unusedVariables false
--------
example (p q : α → Prop) :
        (∃ x, p x ∨ q x) →
        (∃ x, p x) ∨ (∃ x, q x)
  | Exists.intro x (Or.inl px) => Or.inl (Exists.intro x px)
  | Exists.intro x (Or.inr qx) => Or.inr (Exists.intro x qx)

def foo : Nat × Nat → Nat
  | (0, n)     => 0
  | (m+1, 0)   => 1
  | (m+1, n+1) => 2
```

方程编译器可顺序处理多个参数。例如，将上例定义为二元函数更自然：

```lean
set_option linter.unusedVariables false
--------
def foo : Nat → Nat → Nat
  | 0,     n     => 0
  | m + 1, 0     => 1
  | m + 1, n + 1 => 2
```

再举一例：

```lean
set_option linter.unusedVariables false
--------
def bar : List Nat → List Nat → Nat
  | [],      []      => 0
  | a :: as, []      => a
  | [],      b :: bs => b
  | a :: as, b :: bs => a + b
```

注意模式之间用逗号分隔。

下列例子中，分情形只发生在第一个参数上，尽管其他参数也出现在模式列表中。

```lean
set_option linter.unusedVariables false
namespace Hidden
------
def and : Bool → Bool → Bool
  | true,  a => a
  | false, _ => false

def or : Bool → Bool → Bool
  | true,  _ => true
  | false, a => a

def cond : Bool → α → α → α
  | true,  x, y => x
  | false, x, y => y
------
end Hidden
```

还要注意，当定义中不需要某参数的值时，可用下划线代替。该下划线称为**通配符模式**（wildcard pattern）或**匿名变量**（anonymous variable）。与方程编译器外的用法不同，这里的下划线**不**表示隐式参数。用下划线作通配符在函数式编程语言中很常见，Lean 采用这一记法。8.2 节「通配符与重叠模式」进一步说明通配符；8.9 节「不可访问模式」说明如何在模式中使用隐式参数。

如第 7 章「归纳类型」所述，归纳数据类型可依赖参数。下例用模式匹配定义 `tail` 函数。参数 `α : Type u` 出现在冒号之前，表示它不参与模式匹配。Lean 也允许参数出现在冒号之后，但对它们做模式匹配需要显式 `match`。

```lean
set_option linter.unusedVariables false
--------
def tail1 {α : Type u} : List α → List α
  | []      => []
  | a :: as => as

def tail2 : {α : Type u} → List α → List α
  | α, []      => []
  | α, a :: as => as
```

尽管两例中参数 `α` 的位置不同，处理方式相同：它都不参与分情形。

Lean 还能处理更复杂的模式匹配，其中依赖类型的参数对各情形施加额外约束。这类**依赖模式匹配**（dependent pattern matching）的例子见 8.8 节。

## 8.2 通配符与重叠模式

考虑上一节的一个例子：

```lean
set_option linter.unusedVariables false
--------
def foo : Nat → Nat → Nat
  | 0,     n     => 0
  | m + 1, 0     => 1
  | m + 1, n + 1 => 2
```

另一种写法是：

```lean
set_option linter.unusedVariables false
--------
def foo : Nat → Nat → Nat
  | 0, n => 0
  | m, 0 => 1
  | m, n => 2
```

第二种写法中模式重叠；例如参数对 `0, 0` 匹配所有三种情形。但 Lean 通过使用第一条适用的方程处理歧义，因此本例最终结果相同。特别地，下列方程在定义上成立：

```lean
def foo : Nat → Nat → Nat
  | 0, n => 0
  | m, 0 => 1
  | m, n => 2
------
example : foo 0       0       = 0 := rfl
example : foo 0       (n + 1) = 0 := rfl
example : foo (m + 1) 0       = 1 := rfl
example : foo (m + 1) (n + 1) = 2 := rfl
```

由于不需要 `m` 和 `n` 的值，我们完全可以改用通配符模式。

```lean
def foo : Nat → Nat → Nat
  | 0, _ => 0
  | _, 0 => 1
  | _, _ => 2
```

你可以验证 `foo` 的这一定义满足与之前相同的定义恒等式。

某些函数式编程语言支持**不完整模式**（incomplete patterns）。在这些语言中，解释器对不完整情形抛出异常或返回任意值。我们可用 `Inhabited` 类型类模拟「任意值」做法。粗略地说，`Inhabited α` 的元素见证类型 `α` 有元素；第 10 章「类型类」将看到，Lean 可被指示合适的基础类型是 inhabited 的，并能自动推断其他构造类型是 inhabited 的。在此基础上，标准库为任何 inhabited 类型提供默认元素 `default`。

我们也可用类型 `Option α` 模拟不完整模式：对已给出的模式返回 `some a`，对不完整情形使用 `none`。下例演示两种做法。

```lean
def f1 : Nat → Nat → Nat
  | 0, _  => 1
  | _, 0  => 2
  | _, _  => default  -- the "incomplete" case

example : f1 0     0     = 1       := rfl
example : f1 0     (a+1) = 1       := rfl
example : f1 (a+1) 0     = 2       := rfl
example : f1 (a+1) (b+1) = default := rfl

def f2 : Nat → Nat → Option Nat
  | 0, _  => some 1
  | _, 0  => some 2
  | _, _  => none     -- the "incomplete" case

example : f2 0     0     = some 1 := rfl
example : f2 0     (a+1) = some 1 := rfl
example : f2 (a+1) 0     = some 2 := rfl
example : f2 (a+1) (b+1) = none   := rfl
```

方程编译器很聪明。若你在下列定义中遗漏任何情形，错误信息会告诉你哪些情形未被覆盖。

```lean
def bar : Nat → List Nat → Bool → Nat
  | 0,   _,      false => 0
  | 0,   b :: _, _     => b
  | 0,   [],     true  => 7
  | a+1, [],     false => a
  | a+1, [],     true  => a + 1
  | a+1, b :: _, _     => a + b
```

在合适情形下，它也会用 `if ... then ... else` 代替 `casesOn`。

```lean
set_option pp.proofs true
-------
def foo : Char → Nat
  | 'A' => 1
  | 'B' => 2
  | _   => 3

#print foo.match_1
```

## 8.3 结构递归与归纳

方程编译器之所以强大，还在于它支持递归定义。接下来三节将分别介绍：

- 结构递归定义
- 良基递归定义
- 互递归定义

一般而言，方程编译器处理如下形式的输入：

```
def foo (a : α) : (b : β) → γ
  | [patterns₁] => t₁
  ...
  | [patternsₙ] => tₙ
```

这里 `(a : α)` 是参数序列，`(b : β)` 是进行模式匹配的参数序列，`γ` 是任意类型，可依赖 `a` 和 `b`。每行应包含相同数量的模式，对应 `β` 的每个元素。如前所述，模式要么是变量，要么是应用于其他模式的构造子，要么是归一化为该形式的表达式（非构造子须标有 `[match_pattern]` 属性）。构造子的出现触发分情形，构造子参数由给定变量表示。8.8 节「依赖模式匹配」将看到，模式中某些显式项为使表达式类型检查通过而被强制为特定形式，尽管它们不参与模式匹配。这些称为「**不可访问模式**」（inaccessible patterns）。但在讲依赖模式匹配之前，我们尚不需要使用不可访问模式。

如上一节所见，项 `t₁, ..., tₙ` 可使用任何参数 `a`，以及对应模式中引入的任何变量。使递归与归纳成为可能的是，它们还可涉及对 `foo` 的递归调用。本节处理**结构递归**（structural recursion）：`=>` 右侧出现的 `foo` 的参数是左侧模式中项的子项。想法是它们在结构上更小，因而在归纳类型中处于更早阶段。下面是上一章结构递归例子的方程编译器写法：

```lean
open Nat
def add : Nat → Nat → Nat
  | m, zero   => m
  | m, succ n => succ (add m n)

theorem add_zero (m : Nat)   : add m zero = m := rfl
theorem add_succ (m n : Nat) : add m (succ n) = succ (add m n) := rfl

theorem zero_add : ∀ n, add zero n = n
  | zero   => rfl
  | succ n => congrArg succ (zero_add n)

def mul : Nat → Nat → Nat
  | n, zero   => zero
  | n, succ m => add (mul n m) n
```

`zero_add` 的证明清楚表明，在 Lean 中归纳证明实为递归的一种形式。

上例表明 `add` 的定义方程在定义上成立，`mul` 亦然。方程编译器尽可能保证这一点，直接的结构归纳即属此类。但在其他情形下，归约仅**命题上**成立，即须显式应用的等式定理。方程编译器在内部生成这些定理，不供用户直接使用；`simp` 策略会在需要时配置使用它们。下面 `zero_add` 的证明即如此工作：

```lean
open Nat
def add : Nat → Nat → Nat
  | m, zero   => m
  | m, succ n => succ (add m n)
-----
theorem zero_add : ∀ n, add zero n = n
  | zero   => by simp [add]
  | succ n => by simp [add, zero_add]
```

与模式匹配定义一样，结构递归或归纳的参数可出现在冒号之前。这类参数在定义处理前被加入局部上下文。例如，加法也可写成：

```lean
open Nat
def add (m : Nat) : Nat → Nat
  | zero   => m
  | succ n => succ (add m n)
```

你也可用 `match` 写上述例子：

```lean
open Nat
def add (m n : Nat) : Nat :=
  match n with
  | zero   => m
  | succ n => succ (add m n)
```

Fibonacci 函数 `fib` 是更有趣的结构递归例子。

```lean
def fib : Nat → Nat
  | 0   => 1
  | 1   => 1
  | n+2 => fib (n+1) + fib n

example : fib 0 = 1 := rfl

example : fib 1 = 1 := rfl

example : fib (n + 2) = fib (n + 1) + fib n := rfl

example : fib 7 = 21 := rfl
```

这里 `fib` 在 `n + 2`（定义上等于 `succ (succ n)`）处的值由 `n + 1`（定义上等价于 `succ n`）和 `n` 处的值定义。然而这是众所周知的低效 Fibonacci 计算方式，执行时间关于 `n` 呈指数增长。更好的写法如下：

```lean
def fibFast (n : Nat) : Nat :=
  (loop n).2
where
  loop : Nat → Nat × Nat
    | 0   => (0, 1)
    | n+1 => let p := loop n; (p.2, p.1 + p.2)

#eval fibFast 100 -- 573147844013817084101
```

下面用 `let rec` 代替 `where` 的同一定义：

```lean
def fibFast (n : Nat) : Nat :=
  let rec loop : Nat → Nat × Nat
    | 0   => (0, 1)
    | n+1 => let p := loop n; (p.2, p.1 + p.2)
  (loop n).2
```

两种情形下，Lean 都会生成辅助函数 `fibFast.loop`。

为处理结构递归，方程编译器使用**值域递归**（course-of-values recursion），利用每个归纳定义类型自动生成的常量 `below` 和 `brecOn`。查看 `Nat.below` 和 `Nat.brecOn` 的类型可了解其工作原理：

```lean
variable (C : Nat → Type u)

#check (@Nat.below C : Nat → Type u)

#reduce @Nat.below C (3 : Nat)

#check (@Nat.brecOn C : (n : Nat) → ((n : Nat) → @Nat.below C n → C n) → C n)
```

类型 `@Nat.below C (3 : Nat)` 是存储 `C 0`、`C 1`、`C 2` 元素的数据结构。值域递归由 `Nat.brecOn` 实现。它使我们能在特定输入 `n` 处，根据函数的所有先前值（以 `@Nat.below C n` 的元素形式给出）定义依赖函数 `(n : Nat) → C n` 的值。

值域递归是方程编译器向 Lean 内核证明函数终止的技术之一。它不影响代码生成器——后者像其他函数式语言编译器一样编译递归函数。回想 `#eval fib <n>` 关于 `<n>` 是指数的；而 `#reduce fib <n>` 高效，因为它使用基于 `brecOn` 构造、发送给内核的定义。

```lean
def fib : Nat → Nat
  | 0   => 1
  | 1   => 1
  | n+2 => fib (n+1) + fib n

-- Slow:
-- #eval fib 50
-- Fast:
#reduce fib 50

#print fib
```

列表 `append` 函数是递归定义的另一个好例子。

```lean
def append : List α → List α → List α
  | [],    bs => bs
  | a::as, bs => a :: append as bs

example : append [1, 2, 3] [4, 5] = [1, 2, 3, 4, 5] := rfl
```

再举一例：将第一个列表的元素与第二个列表对应元素相加，直到某一列表耗尽。

```lean
def listAdd [Add α] : List α → List α → List α
  | [],      _       => []
  | _,       []      => []
  | a :: as, b :: bs => (a + b) :: listAdd as bs

#eval listAdd [1, 2, 3] [4, 5, 6, 6, 9, 10] -- [5, 7, 9]
```

鼓励你在下面练习中尝试类似例子。

## 8.4 局部递归声明

可用 `let rec` 关键字定义局部递归声明。

```lean
def replicate (n : Nat) (a : α) : List α :=
  let rec loop : Nat → List α → List α
    | 0,   as => as
    | n+1, as => loop n (a::as)
  loop n []

#check @replicate.loop -- @replicate.loop : {α : Type u_1} → α → Nat → List α → List α
```

Lean 为每个 `let rec` 创建辅助声明。上例中，它为 `replicate` 中出现的 `let rec loop` 创建了声明 `replicate.loop`。注意 Lean 通过将 `let rec` 声明中出现的任何局部变量作为额外参数来「闭合」该声明。例如局部变量 `a` 出现在 `let rec loop` 中。

你也可在策略模式中使用 `let rec`，并用于构造归纳证明。

```lean
def replicate (n : Nat) (a : α) : List α :=
 let rec loop : Nat → List α → List α
   | 0,   as => as
   | n+1, as => loop n (a::as)
 loop n []
------
theorem length_replicate (n : Nat) (a : α) :
    (replicate n a).length = n := by
  let rec aux (n : Nat) (as : List α) :
      (replicate.loop a n as).length = n + as.length := by
    match n with
    | 0   => simp [replicate.loop]
    | n+1 => simp +arith [replicate.loop, aux n]
  exact aux n []
```

还可在定义后用 `where` 子句引入辅助递归声明。Lean 将其转换为 `let rec`。

```lean
def replicate (n : Nat) (a : α) : List α :=
  loop n []
where
  loop : Nat → List α → List α
    | 0,   as => as
    | n+1, as => loop n (a::as)

theorem length_replicate (n : Nat) (a : α) :
    (replicate n a).length = n := by
  exact aux n []
where
  aux (n : Nat) (as : List α) :
      (replicate.loop a n as).length = n + as.length := by
    match n with
    | 0   => simp [replicate.loop]
    | n+1 => simp +arith [replicate.loop, aux n]
```

## 8.5 良基递归与归纳

当无法使用结构递归时，可用良基递归证明终止。我们需要良基关系，以及证明每次递归应用相对于该关系是递减的。依赖类型论足够强大，能够编码并论证良基递归。先从理解其工作原理所需的逻辑背景开始。

Lean 标准库定义两个谓词 `Acc r a` 和 `WellFounded r`，其中 `r` 是类型 `α` 上的二元关系，`a` 是类型 `α` 的元素。

```lean
variable (α : Sort u)
variable (r : α → α → Prop)

#check (Acc r : α → Prop)
#check (WellFounded r : Prop)
```

```lean (show := false)
variable {α : Sort u} (x y : α)
variable {r : α → α → Prop}

example : Acc r x = ∀ y, r y x → Acc r y := by
  simp only [eq_iff_iff]
  constructor
  . intro ⟨_, hAcc⟩
    assumption
  . intro h
    constructor
    assumption

def r' : α → α → Prop := fun x y => True
infix:50 " ≺ " => r'
example : y ≺ x := True.intro
example := WellFounded r
```

第一个 `Acc` 是归纳定义的谓词。按定义，`Acc r x` 等价于 `∀ y, r y x → Acc r y`。若将 `r y x` 视为某种序关系 `y ≺ x`，则 `Acc r x` 表示 `x` 从下方可达，即其所有前驱都可达。特别地，若 `x` 无前驱，则它可达。对任意类型 `α`，我们应能递归地为每个可达元素赋值——先为其所有前驱赋值。

谓词 `r` 是良基的，记作 `WellFounded r`，恰是说类型的每个元素都可达。由上述考虑，若 `r` 是类型 `α` 上的良基关系，我们应有关于关系 `r` 的良基递归原理。确实如此：标准库定义 `WellFounded.fix`，正为此服务。

```lean
noncomputable
def f {α : Sort u}
    (r : α → α → Prop)
    (h : WellFounded r)
    (C : α → Sort v)
    (F : (x : α) → ((y : α) → r y x → C y) → C x) :
    (x : α) → C x :=
WellFounded.fix h F
```

这里角色众多，但第一块我们已见过：类型 `α`、关系 `r`、以及 `r` 良基的假设 `h`。变量 `C` 表示递归定义的 motive：对每个 `x : α`，我们想构造 `C x` 的元素。函数 `F` 提供归纳配方：给定 `x` 的每个前驱 `y` 的 `C y` 元素，它告诉我们如何构造 `C x` 的元素。

注意 `WellFounded.fix` 同样可作为归纳原理。它说：若 `≺` 良基且要证 `∀ x, C x`，只需证明对任意 `x`，若已有 `∀ y, r y x → C y`，则有 `C x`。

上例中我们使用修饰符 `noncomputable`，因为代码生成器目前不支持 `WellFounded.fix`。`WellFounded.fix` 是 Lean 用来证明函数终止的另一工具。

Lean 知道自然数上通常的序 `<` 是良基的。它还知道从其他良基序构造新良基序的多种方式，例如字典序。

下面是标准库中自然数除法定义的大致形式。

```lean
------
open Nat

theorem div_lemma {x y : Nat} : 0 < y ∧ y ≤ x → x - y < x :=
  fun h => sub_lt (Nat.lt_of_lt_of_le h.left h.right) h.left

def div.F (x : Nat) (f : (x₁ : Nat) → x₁ < x → Nat → Nat) (y : Nat) : Nat :=
  if h : 0 < y ∧ y ≤ x then
    f (x - y) (div_lemma h) y + 1
  else
    zero

noncomputable def div := WellFounded.fix (measure id).wf div.F

#reduce div 8 2 -- 4
```

该定义颇为晦涩难懂。这里递归在 `x` 上，`div.F x f : Nat → Nat` 对固定的 `x` 返回「除以 `y`」的函数。须记住 `div.F` 的第二个参数——递归配方——应是函数，对所有小于 `x` 的 `x₁` 返回除以 `y` 的函数。

elaborator 旨在使此类定义更方便。它接受下列写法：

```lean
def div (x y : Nat) : Nat :=
  if h : 0 < y ∧ y ≤ x then
    have : x - y < x := Nat.sub_lt (Nat.lt_of_lt_of_le h.1 h.2) h.1
    div (x - y) y + 1
  else
    0
```

Lean 遇到递归定义时，先尝试结构递归；仅当失败时才回退到良基递归。Lean 用 `decreasing_tactic` 策略证明递归应用更小。上例中辅助命题 `x - y < x` 应视为给该策略的提示。

`div` 的定义方程**不**在定义上成立，但可用 `unfold` 策略展开 `div`。我们用 `conv`（见第 11 章「转换策略模式」）选择要展开的 `div` 应用。

```lean
def div (x y : Nat) : Nat :=
 if h : 0 < y ∧ y ≤ x then
   have : x - y < x := Nat.sub_lt (Nat.lt_of_lt_of_le h.1 h.2) h.1
   div (x - y) y + 1
 else
   0
------
example (x y : Nat) :
    div x y =
    if 0 < y ∧ y ≤ x then
      div (x - y) y + 1
    else 0 := by
   -- unfold occurrence in the left-hand-side of the equation:
  conv => lhs; unfold div
  rfl

example (x y : Nat) (h : 0 < y ∧ y ≤ x) :
    div x y = div (x - y) y + 1 := by
  conv => lhs; unfold div
  simp [h]
```

下面例子类似：将任意自然数转换为二进制表示（0 和 1 的列表）。须提供递归调用递减的证据，这里用 `sorry`。`sorry` 不妨碍解释器成功求值函数，但项含 `sorry` 时须用 `#eval!` 代替 `#eval`。

```lean
def natToBin : Nat → List Nat
  | 0     => [0]
  | 1     => [1]
  | n + 2 =>
    have : (n + 2) / 2 < n + 2 := sorry
    natToBin ((n + 2) / 2) ++ [n % 2]

#eval! natToBin 1234567
```

最后一个例子：Ackermann 函数可直接定义，因为它由自然数上字典序的良基性保证。`termination_by` 子句指示 Lean 使用字典序。该子句实际上将函数参数映射到类型 `Nat × Nat` 的元素。然后 Lean 用类型类合成得到 `WellFoundedRelation (Nat × Nat)` 的元素。

```lean
def ack : Nat → Nat → Nat
  | 0,   y   => y+1
  | x+1, 0   => ack x 1
  | x+1, y+1 => ack x (ack (x+1) y)
termination_by x y => (x, y)
```

许多情形下，Lean 能自动确定合适的字典序。Ackermann 函数即属此类，故 `termination_by` 子句可选：

```lean
def ack : Nat → Nat → Nat
  | 0,   y   => y+1
  | x+1, 0   => ack x 1
  | x+1, y+1 => ack x (ack (x+1) y)
```

注意上例使用字典序，因为实例 `WellFoundedRelation (α × β)` 使用字典序。Lean 还定义实例：

```lean
instance (priority := low) [SizeOf α] : WellFoundedRelation α :=
  sizeOfWFRel
```

下面例子中，我们通过证明 `as.size - i` 在递归应用中递减来证明终止。

```lean
def takeWhile (p : α → Bool) (as : Array α) : Array α :=
  go 0 #[]
where
  go (i : Nat) (r : Array α) : Array α :=
    if h : i < as.size then
      let a := as[i]
      if p a then
        go (i+1) (r.push a)
      else
        r
    else
      r
  termination_by as.size - i
```

注意本例中辅助函数 `go` 是递归的，但 `takeWhile` 不是。Lean 能自动识别这一模式，故 `termination_by` 子句不必要：

```lean
def takeWhile (p : α → Bool) (as : Array α) : Array α :=
  go 0 #[]
where
  go (i : Nat) (r : Array α) : Array α :=
    if h : i < as.size then
      let a := as[i]
      if p a then
        go (i+1) (r.push a)
      else
        r
    else
      r
```

默认情况下，Lean 用 `decreasing_tactic` 策略证明递归应用递减。修饰符 `decreasing_by` 允许我们提供自己的策略。示例如下。

```lean
theorem div_lemma {x y : Nat} : 0 < y ∧ y ≤ x → x - y < x :=
  fun ⟨ypos, ylex⟩ => Nat.sub_lt (Nat.lt_of_lt_of_le ypos ylex) ypos

def div (x y : Nat) : Nat :=
  if h : 0 < y ∧ y ≤ x then
    div (x - y) y + 1
  else
    0
decreasing_by apply div_lemma; assumption
```

注意 `decreasing_by` 不能替代 `termination_by`，二者互补。`termination_by` 用于指定良基关系，`decreasing_by` 用于提供证明递归应用递减的自定义策略。下例同时使用二者。

```lean
def ack : Nat → Nat → Nat
  | 0,   y   => y+1
  | x+1, 0   => ack x 1
  | x+1, y+1 => ack x (ack (x+1) y)
termination_by x y => (x, y)
decreasing_by
   -- unfolds well-founded recursion auxiliary definitions:
  all_goals simp_wf
  · apply Prod.Lex.left; simp +arith
  · apply Prod.Lex.right; simp +arith
  · apply Prod.Lex.left; simp +arith
```

可用 `decreasing_by sorry` 指示 Lean「信任」我们函数会终止。

```lean
def natToBin : Nat → List Nat
  | 0     => [0]
  | 1     => [1]
  | n + 2 => natToBin ((n + 2) / 2) ++ [n % 2]
decreasing_by sorry

#eval! natToBin 1234567
```

回想使用 `sorry` 等价于使用新公理，应避免。下例我们用 `sorry` 证明 `False`。命令 `#print axioms unsound` 显示 `unsound` 依赖实现 `sorry` 的非健全公理 `sorryAx`。

```lean
def unsound (x : Nat) : False :=
  unsound (x + 1)
decreasing_by sorry

#check unsound 0
-- `unsound 0` is a proof of `False`

#print axioms unsound -- 'unsound' depends on axioms: [sorryAx]
```

小结：

- 若无 `termination_by`，（若可能）通过选取一个参数，再用类型类合成为该参数类型合成良基关系，从而导出良基关系。

- 若指定 `termination_by`，它将函数参数映射到类型 `α`，再次使用类型类合成。回想 `β × γ` 的默认实例是基于 `β` 和 `γ` 的良基关系的字典序。

- `Nat` 的默认良基关系实例是 `(· < ·)`。

- 默认用 `decreasing_tactic` 策略证明递归应用相对于所选良基关系更小。若 `decreasing_tactic` 失败，错误信息包含剩余目标 `... |- G`。注意 `decreasing_tactic` 使用 `assumption`。因此可用 `have` 表达式证明目标 `G`。也可用 `decreasing_by` 提供自己的策略。

## 8.6 函数归纳

Lean 为递归函数生成定制的归纳原理。这些归纳原理遵循函数定义的递归结构，而非数据类型的结构。关于函数的证明通常遵循函数自身的递归结构，因此这些归纳原理使关于函数的陈述能更方便地证明。

例如，用 `ack` 的函数归纳原理证明结果恒大于 `0`，需要对 `ack` 中模式匹配的每个分支各写一个情形：

```lean
def ack : Nat → Nat → Nat
  | 0,   y   => y+1
  | x+1, 0   => ack x 1
  | x+1, y+1 => ack x (ack (x+1) y)

theorem ack_gt_zero : ack n m > 0 := by
  fun_induction ack with
  | case1 y =>
--          ^ PROOF_STATE: case1
    simp
  | case2 x ih =>
--             ^ PROOF_STATE: case2
    exact ih
  | case3 x y ih1 ih2 =>
--                    ^ PROOF_STATE: case3
    simp [ack, *]
```

在 `case1` 中，目标为：

```
case case1
y : Nat
⊢ y + 1 > 0
```

目标中的 `y + 1` 对应 `ack` 第一种情形返回的值。

在 `case2` 中，目标为：

```
case case2
x : Nat
ih : ack x 1 > 0
⊢ ack x 1 > 0
```

目标中的 `ack x 1` 对应 `ack` 应用于模式变量 `x + 1` 和 `0` 时在第二种情形返回的值。该项自动化简为右端。归纳假设 `ih : ack x 1 > 0` 对应递归调用，恰是本情形返回的答案。

在 `case3` 中，目标为：

```
case case3
x : Nat
y : Nat
ih1 : ack (x + 1) y > 0
ih2 : ack x (ack (x + 1) y) > 0
⊢ ack x (ack (x + 1) y) > 0
```

目标中的 `ack x (ack (x + 1) y)` 对应 `ack` 应用于 `x + 1` 和 `y + 1` 化简后第三种情形返回的值。归纳假设 `ih1 : ack (x + 1) y > 0` 和 `ih2 : ack x (ack (x + 1) y) > 0` 对应递归调用，`ih1` 匹配嵌套递归调用。归纳假设再次适用。

使用 `fun_induction ack` 产生的目标与归纳假设匹配 `ack` 的递归结构。因此证明可一行完成：

```lean
def ack : Nat → Nat → Nat
  | 0,   y   => y+1
  | x+1, 0   => ack x 1
  | x+1, y+1 => ack x (ack (x+1) y)
-------------
theorem ack_gt_zero : ack n m > 0 := by
  fun_induction ack <;> simp [*, ack]
```

还有与 `cases` 策略类似的 `fun_cases` 策略。它为函数控制流的每个分支生成一个情形。`fun_cases` 与 `fun_induction` 还会额外提供排除未走路径的假设。

函数 `f` 表示五路布尔析取：

```lean
def f : Bool → Bool → Bool → Bool → Bool → Bool
  | true, _, _, _ , _ => true
  | _, true, _, _ , _ => true
  | _, _, true, _ , _ => true
  | _, _, _, true, _  => true
  | _, _, _, _, x  => x

```

要证明它是析取，最后一种情形需要知道没有参数为 `true`。该知识由策略提供：

```lean
def f : Bool → Bool → Bool → Bool → Bool → Bool
  | true, _, _, _ , _ => true
  | _, true, _, _ , _ => true
  | _, _, true, _ , _ => true
  | _, _, _, true, _  => true
  | _, _, _, _, x  => x
------
theorem f_or : f b1 b2 b3 b4 b5 = (b1 || b2 || b3 || b4 || b5) := by
  fun_cases f
-- ^ PROOF_STATE: fOrAll
  all_goals sorry
```

每种情形包含排除先前情形的假设：

```
case case1
b2 : Bool
b3 : Bool
b4 : Bool
b5 : Bool
⊢ true = (true || b2 || b3 || b4 || b5)

case case2
b1 : Bool
b3 : Bool
b4 : Bool
b5 : Bool
x✝ : b1 = true → False
⊢ true = (b1 || true || b3 || b4 || b5)

case case3
b1 : Bool
b2 : Bool
b4 : Bool
b5 : Bool
x✝¹ : b1 = true → False
x✝ : b2 = true → False
⊢ true = (b1 || b2 || true || b4 || b5)

case case4
b1 : Bool
b2 : Bool
b3 : Bool
b5 : Bool
x✝² : b1 = true → False
x✝¹ : b2 = true → False
x✝ : b3 = true → False
⊢ true = (b1 || b2 || b3 || true || b5)

case case5
b1 : Bool
b2 : Bool
b3 : Bool
b4 : Bool
b5 : Bool
x✝³ : b1 = true → False
x✝² : b2 = true → False
x✝¹ : b3 = true → False
x✝ : b4 = true → False
⊢ b5 = (b1 || b2 || b3 || b4 || b5)
```

`simp_all` 策略同时化简所有假设与目标，可处理所有情形：

```lean
def f : Bool → Bool → Bool → Bool → Bool → Bool
  | true, _, _, _ , _ => true
  | _, true, _, _ , _ => true
  | _, _, true, _ , _ => true
  | _, _, _, true, _  => true
  | _, _, _, _, x  => x
------
theorem f_or : f b1 b2 b3 b4 b5 = (b1 || b2 || b3 || b4 || b5) := by
  fun_cases f <;> simp_all
```

## 8.7 互递归

Lean 还支持互递归定义。语法与互归纳类型类似。示例如下：

```lean
mutual
  def even : Nat → Bool
    | 0   => true
    | n+1 => odd n

  def odd : Nat → Bool
    | 0   => false
    | n+1 => even n
end

example : even (a + 1) = odd a := by
  simp [even]

example : odd (a + 1) = even a := by
  simp [odd]

theorem even_eq_not_odd : ∀ a, even a = not (odd a) := by
  intro a; induction a
  . simp [even, odd]
  . simp [even, odd, *]
```

这成为互定义，是因为 `even` 递归地依赖 `odd` 定义，而 `odd` 递归地依赖 `even` 定义。在底层，它被编译为单一递归定义。内部定义的函数以和类型的元素为参数——要么是 `even` 的输入，要么是 `odd` 的输入——然后返回与输入相应的输出。为定义该函数，Lean 使用合适的良基度量。内部实现意在向用户隐藏；使用这类定义的标准方式是用 `simp`（或 `unfold`），如上所示。

互递归定义也为处理互归纳与嵌套归纳类型提供自然方式。回想先前给出的互归纳谓词 `Even` 和 `Odd` 的定义。

```lean
mutual
  inductive Even : Nat → Prop where
    | even_zero : Even 0
    | even_succ : ∀ n, Odd n → Even (n + 1)

  inductive Odd : Nat → Prop where
    | odd_succ : ∀ n, Even n → Odd (n + 1)
end
```

构造子 `even_zero`、`even_succ` 和 `odd_succ` 提供了证明某数为偶或奇的正向手段。我们须用归纳类型由这些构造子生成这一事实，才能知道零不是奇数，以及后两个蕴含可以反向。照例，构造子保存在以所定义类型命名的命名空间中，`open Even Odd` 使我们更方便地访问它们。

```lean
mutual
 inductive Even : Nat → Prop where
   | even_zero : Even 0
   | even_succ : ∀ n, Odd n → Even (n + 1)
 inductive Odd : Nat → Prop where
   | odd_succ : ∀ n, Even n → Odd (n + 1)
end
------
open Even Odd

theorem not_odd_zero : ¬ Odd 0 :=
  fun h => nomatch h

theorem even_of_odd_succ : ∀ n, Odd (n + 1) → Even n
  | _, odd_succ n h => h

theorem odd_of_even_succ : ∀ n, Even (n + 1) → Odd n
  | _, even_succ n h => h
```

再举一例：用嵌套归纳类型归纳定义项的集合，使项要么是常量（名称由字符串给出），要么是将常量应用于常量列表的结果。

```lean
inductive Term where
  | const : String → Term
  | app   : String → List Term → Term
```

然后可用互递归定义统计项中出现的常量数，以及常量列表中出现的常量数。

```lean
inductive Term where
 | const : String → Term
 | app   : String → List Term → Term
------
namespace Term

mutual
  def numConsts : Term → Nat
    | const _ => 1
    | app _ cs => numConstsLst cs

  def numConstsLst : List Term → Nat
    | [] => 0
    | c :: cs => numConsts c + numConstsLst cs
end

def sample := app "f" [app "g" [const "x"], const "y"]

#eval numConsts sample

end Term
```

最后一个例子：定义函数 `replaceConst a b e`，在项 `e` 中将常量 `a` 替换为 `b`，然后证明常量数不变。注意我们的证明使用互递归（即互归纳）。

```lean
inductive Term where
 | const : String → Term
 | app   : String → List Term → Term
namespace Term
mutual
 def numConsts : Term → Nat
   | const _ => 1
   | app _ cs => numConstsLst cs
  def numConstsLst : List Term → Nat
   | [] => 0
   | c :: cs => numConsts c + numConstsLst cs
end
------
mutual
  def replaceConst (a b : String) : Term → Term
    | const c => if a == c then const b else const c
    | app f cs => app f (replaceConstLst a b cs)

  def replaceConstLst (a b : String) : List Term → List Term
    | [] => []
    | c :: cs => replaceConst a b c :: replaceConstLst a b cs
end

mutual
  theorem numConsts_replaceConst (a b : String) (e : Term) :
      numConsts (replaceConst a b e) = numConsts e := by
    match e with
    | const c =>
      simp [replaceConst]; split <;> simp [numConsts]
    | app f cs =>
      simp [replaceConst, numConsts, numConsts_replaceConstLst a b cs]

  theorem numConsts_replaceConstLst (a b : String) (es : List Term) :
      numConstsLst (replaceConstLst a b es) = numConstsLst es := by
    match es with
    | [] => simp [replaceConstLst, numConstsLst]
    | c :: cs =>
      simp [replaceConstLst, numConstsLst, numConsts_replaceConst a b c,
            numConsts_replaceConstLst a b cs]
end
```

## 8.8 依赖模式匹配

8.1 节「模式匹配」中的所有例子都可用 `casesOn` 和 `recOn` 轻松写出。但对带索引的归纳族（如 `Vect α n`）往往不然，因为分情形对索引值施加约束。没有方程编译器，用 recursor 定义 `map`、`zip`、`unzip` 等简单函数需要大量样板代码。为理解困难，考虑定义函数 `tail`：它接受向量 `v : Vect α (n + 1)` 并删除第一个元素。

```lean
inductive Vect (α : Type u) : Nat → Type u
  | nil  : Vect α 0
  | cons : α → {n : Nat} → Vect α n → Vect α (n + 1)
```

首先可能想到使用 `Vect.casesOn` 函数：

```
Vect.casesOn.{u, v}
  {α : Type v} {motive : (a : Nat) → Vect α a → Sort u}
  {a : Nat}
  (t : Vect α a)
  (nil : motive 0 nil)
  (cons : (a : α) → {n : Nat} → (a_1 : Vect α n) →
    motive (n + 1) (cons a a_1)) :
  motive a t
```

但在 `nil` 情形应返回什么值？有点蹊跷：若 `v` 的类型是 `Vect α (n + 1)`，它**不能**是 `nil`，但不清楚如何让 `Vect.casesOn` 知道这一点。

一种解法是定义辅助函数：

```lean
set_option linter.unusedVariables false
inductive Vect (α : Type u) : Nat → Type u
  | nil  : Vect α 0
  | cons : α → {n : Nat} → Vect α n → Vect α (n+1)
namespace Vect
------
def tailAux (v : Vect α m) : m = n + 1 → Vect α n :=
  Vect.casesOn (motive := fun x _ => x = n + 1 → Vect α n) v
    (fun h : 0 = n + 1 => Nat.noConfusion h)
    (fun (a : α) (m : Nat) (as : Vect α m) =>
     fun (h : m + 1 = n + 1) =>
       Nat.noConfusion h (fun h1 : m = n => h1 ▸ as))

def tail (v : Vect α (n+1)) : Vect α n :=
  tailAux v rfl
-----
end Vect
```

在 `nil` 情形，`m` 被实例化为 `0`，`Nat.noConfusion` 利用 `0 = n + 1` 不可能成立。否则 `v` 形如 `cons a as`，我们只需返回 `as`，在将其从长度为 `m` 的向量转换为长度为 `n` 的向量之后。

定义 `tail` 的困难在于保持索引之间的关系。`tailAux` 中的假设 `m = n + 1` 用于沟通 `n` 与次要前提关联的索引之间的关系。此外，`0 = n + 1` 情形不可达，丢弃此类情形的标准方式是使用 `Nat.noConfusion`。

然而用递归方程定义 `tail` 函数很容易，方程编译器会自动为我们生成所有样板代码。下面是若干类似例子：

```lean
set_option linter.unusedVariables false
inductive Vect (α : Type u) : Nat → Type u
  | nil  : Vect α 0
  | cons : α → {n : Nat} → Vect α n → Vect α (n+1)
namespace Vect
------
def head : {n : Nat} → Vect α (n+1) → α
  | n, cons a as => a

def tail : {n : Nat} → Vect α (n+1) → Vect α n
  | n, cons a as => as

theorem eta : ∀ {n : Nat} (v : Vect α (n+1)), cons (head v) (tail v) = v
  | n, cons a as => rfl

def map (f : α → β → γ) : {n : Nat} → Vect α n → Vect β n → Vect γ n
  | 0,   nil,       nil       => nil
  | n+1, cons a as, cons b bs => cons (f a b) (map f as bs)

def zip : {n : Nat} → Vect α n → Vect β n → Vect (α × β) n
  | 0,   nil,       nil       => nil
  | n+1, cons a as, cons b bs => cons (a, b) (zip as bs)
------
end Vect
```

注意我们可以省略「不可达」情形的递归方程，例如 `head nil`。对带索引族的自动生成定义远非直截了当。例如：

```lean
set_option linter.unusedVariables false
inductive Vect (α : Type u) : Nat → Type u
  | nil  : Vect α 0
  | cons : α → {n : Nat} → Vect α n → Vect α (n+1)
namespace Vect
-------
def zipWith (f : α → β → γ) : {n : Nat} → Vect α n → Vect β n → Vect γ n
  | 0,   nil,       nil       => nil
  | n+1, cons a as, cons b bs => cons (f a b) (zipWith f as bs)

#print zipWith
#print zipWith.match_1
------
end Vect
```

`zipWith` 函数手工定义比 `tail` 更繁琐。我们鼓励你尝试，使用 `Vect.recOn`、`Vect.casesOn` 和 `Vect.noConfusion`。

## 8.9 不可访问模式

有时依赖匹配模式中的参数对定义并非本质，但仍须包含以适当特化表达式的类型。Lean 允许用户将此类子项标记为模式匹配的**不可访问**（inaccessible）。例如，当左边出现的项既不是变量也不是构造子应用时，这些注解必不可少，因为它们不适合作为模式匹配目标。可将不可访问模式视为模式中的「不关心」成分。可将子项声明为不可访问，写法为 `.(t)`。若可推断不可访问模式，也可写 `_`。

下例声明归纳类型，定义「在 `f` 的像中」这一性质。可将类型 `ImageOf f b` 的元素视为 `b` 在 `f` 的像中的证据，构造子 `imf` 用于构造此类证据。然后可定义任意带「逆」的函数 `f`，将 `f` 的像中任何元素映到被它映射到的元素。类型规则迫使我们为第一个参数写 `f a`，但该项既不是变量也不是构造子应用，在模式匹配定义中不起作用。要定义下面的 `inverse` 函数，我们**必须**将 `f a` 标记为不可访问。

```lean
inductive ImageOf {α β : Type u} (f : α → β) : β → Type u where
  | imf : (a : α) → ImageOf f (f a)

open ImageOf

def inverse {f : α → β} : (b : β) → ImageOf f b → α
  | .(f a), imf a => a

def inverse' {f : α → β} : (b : β) → ImageOf f b → α
  | _, imf a => a
```

上例中，不可访问注解清楚表明 `f` **不是**模式匹配变量。

不可访问模式可用于澄清和控制使用依赖模式匹配的定义。考虑函数 `Vect.add` 的下列定义，它在假设类型有关联加法函数的前提下，将两个同长度向量相加：

```lean
inductive Vect (α : Type u) : Nat → Type u
  | nil  : Vect α 0
  | cons : α → {n : Nat} → Vect α n → Vect α (n+1)

def Vect.add [Add α] : {n : Nat} → Vect α n → Vect α n → Vect α n
  | 0,   nil,       nil       => nil
  | n+1, cons a as, cons b bs => cons (a + b) (add as bs)
```

参数 `{n : Nat}` 出现在冒号之后，因为它不能在整个定义中保持固定。实现该定义时，方程编译器首先对第一个参数是 `0` 还是 `n+1` 的形式分情形。然后对后两个参数嵌套分情形，并在每种情形下排除与第一个模式不兼容的情形。

但事实上，第一个参数不需要分情形；`Vect` 的 `casesOn` 消去子会自动抽象该参数，在对第二个参数分情形时用 `0` 和 `n + 1` 替换它。使用不可访问模式，我们可以提示方程编译器避免对 `n` 分情形。

```lean
inductive Vect (α : Type u) : Nat → Type u
  | nil  : Vect α 0
  | cons : α → {n : Nat} → Vect α n → Vect α (n+1)
namespace Vect
------
def add [Add α] : {n : Nat} → Vect α n → Vect α n → Vect α n
  | .(_), nil,       nil       => nil
  | .(_), cons a as, cons b bs => cons (a + b) (add as bs)
-------
end Vect
```

将位置标记为不可访问模式告诉方程编译器：第一，该参数的形式应从其他参数施加的约束推断；第二，第一个参数**不应**参与模式匹配。

不可访问模式 `.(_)` 为方便可写成 `_`。

```lean
inductive Vect (α : Type u) : Nat → Type u
  | nil  : Vect α 0
  | cons : α → {n : Nat} → Vect α n → Vect α (n+1)
namespace Vect
------
def add [Add α] : {n : Nat} → Vect α n → Vect α n → Vect α n
  | _, nil,       nil       => nil
  | _, cons a as, cons b bs => cons (a + b) (add as bs)
-------
end Vect
```

如前所述，参数 `{n : Nat}` 参与模式匹配，因为它不能在整个定义中保持固定。Lean 自动为我们隐式包含这些额外判别式，而不必显式提供。

```lean
inductive Vect (α : Type u) : Nat → Type u
  | nil  : Vect α 0
  | cons : α → {n : Nat} → Vect α n → Vect α (n+1)
namespace Vect
------
def add [Add α] {n : Nat} : Vect α n → Vect α n → Vect α n
  | nil,       nil       => nil
  | cons a as, cons b bs => cons (a + b) (add as bs)
-------
end Vect
```

结合**自动绑定隐式**（auto bound implicits）特性，可进一步简化声明：

```lean
inductive Vect (α : Type u) : Nat → Type u
  | nil  : Vect α 0
  | cons : α → {n : Nat} → Vect α n → Vect α (n+1)
namespace Vect
------
def add [Add α] : Vect α n → Vect α n → Vect α n
  | nil,       nil       => nil
  | cons a as, cons b bs => cons (a + b) (add as bs)
-------
end Vect
```

利用这些新特性，可将前面各节定义的向量函数写得更紧凑：

```lean
set_option linter.unusedVariables false
inductive Vect (α : Type u) : Nat → Type u
  | nil  : Vect α 0
  | cons : α → {n : Nat} → Vect α n → Vect α (n+1)
namespace Vect
------
def head : Vect α (n+1) → α
  | cons a as => a

def tail : Vect α (n+1) → Vect α n
  | cons a as => as

theorem eta : (v : Vect α (n+1)) → cons (head v) (tail v) = v
  | cons a as => rfl

def map (f : α → β → γ) : Vect α n → Vect β n → Vect γ n
  | nil,       nil       => nil
  | cons a as, cons b bs => cons (f a b) (map f as bs)

def zip : Vect α n → Vect β n → Vect (α × β) n
  | nil,       nil       => nil
  | cons a as, cons b bs => cons (a, b) (zip as bs)
-------
end Vect
```

## 8.10 match 表达式

Lean 还为许多函数式语言中的 `match`-`with` 表达式提供编译器：

```lean
set_option linter.unusedVariables false
------
def isNotZero (m : Nat) : Bool :=
  match m with
  | 0     => false
  | n + 1 => true
```

这与普通模式匹配定义看起来差别不大，但要点是 `match` 可用于表达式中任意位置，且可有任意参数。

```lean
set_option linter.unusedVariables false
-------
def isNotZero (m : Nat) : Bool :=
  match m with
  | 0     => false
  | n + 1 => true

def filter (p : α → Bool) : List α → List α
  | []      => []
  | a :: as =>
    match p a with
    | true => a :: filter p as
    | false => filter p as

example : filter isNotZero [1, 0, 0, 3, 0] = [1, 3] := rfl
```

再举一例：

```lean
def foo (n : Nat) (b c : Bool) :=
  5 + match n - 5, b && c with
      | 0,     true  => 0
      | m + 1, true  => m + 7
      | 0,     false => 5
      | m + 1, false => m + 3

#eval foo 7 true false

example : foo 7 true false = 9 := rfl
```

Lean 在系统各部分内部用 `match` 构造实现模式匹配。因此下列四种定义效果相同：

```lean
def bar₁ : Nat × Nat → Nat
  | (m, n) => m + n

def bar₂ (p : Nat × Nat) : Nat :=
  match p with
  | (m, n) => m + n

def bar₃ : Nat × Nat → Nat :=
  fun (m, n) => m + n

def bar₄ (p : Nat × Nat) : Nat :=
  let (m, n) := p; m + n
```

这些变体对解构命题同样有用：

```lean
variable (p q : Nat → Prop)

example : (∃ x, p x) → (∃ y, q y) → ∃ x y, p x ∧ q y
  | ⟨x, px⟩, ⟨y, qy⟩ => ⟨x, y, px, qy⟩

example (h₀ : ∃ x, p x) (h₁ : ∃ y, q y)
        : ∃ x y, p x ∧ q y :=
  match h₀, h₁ with
  | ⟨x, px⟩, ⟨y, qy⟩ => ⟨x, y, px, qy⟩

example : (∃ x, p x) → (∃ y, q y) → ∃ x y, p x ∧ q y :=
  fun ⟨x, px⟩ ⟨y, qy⟩ => ⟨x, y, px, qy⟩

example (h₀ : ∃ x, p x) (h₁ : ∃ y, q y)
        : ∃ x y, p x ∧ q y :=
  let ⟨x, px⟩ := h₀
  let ⟨y, qy⟩ := h₁
  ⟨x, y, px, qy⟩
```

## 8.11 练习

1. 打开命名空间 `Hidden` 以避免命名冲突，用方程编译器在自然数上定义加法、乘法和幂。然后用方程编译器推导它们的一些基本性质。

2. 类似地，用方程编译器定义列表的一些基本操作（如 `reverse` 函数），并通过归纳证明关于列表的定理（例如对任何列表 `xs` 有 `reverse (reverse xs) = xs`）。

3. 定义你自己的函数，在自然数上实现值域递归。类似地，尝试自己定义 `WellFounded.fix`。

4. 仿照 8.8 节「依赖模式匹配」中的例子，定义连接两个向量的函数。这有点棘手；你需要定义辅助函数。

5. 考虑下列算术表达式类型。想法是 `var n` 是变量 `vₙ`，`const n` 是值为 `n` 的常量。

    ```lean
    inductive Expr where
      | const : Nat → Expr
      | var : Nat → Expr
      | plus : Expr → Expr → Expr
      | times : Expr → Expr → Expr
    deriving Repr

    open Expr

    def sampleExpr : Expr :=
      plus (times (var 0) (const 7)) (times (const 2) (var 1))
    ```

    这里 `sampleExpr` 表示 `(v₀ * 7) + (2 * v₁)`。

    编写求值此类表达式的函数，将每个 `var n` 求值为 `v n`。

    ```lean
    inductive Expr where
      | const : Nat → Expr
      | var : Nat → Expr
      | plus : Expr → Expr → Expr
      | times : Expr → Expr → Expr
      deriving Repr
    open Expr
    def sampleExpr : Expr :=
      plus (times (var 0) (const 7)) (times (const 2) (var 1))
    ------
    def eval (v : Nat → Nat) : Expr → Nat
      | const n     => sorry
      | var n       => v n
      | plus e₁ e₂  => sorry
      | times e₁ e₂ => sorry

    def sampleVal : Nat → Nat
      | 0 => 5
      | 1 => 6
      | _ => 0

    -- Try it out. You should get 47 here.
    -- #eval eval sampleVal sampleExpr
    ```

    实现「常量融合」（constant fusion）：将 `5 + 7` 等子项化简为 `12` 的过程。借助辅助函数 `simpConst`，定义函数 `fuse`：化简 plus 或 times 时，先递归化简参数，再应用 `simpConst` 尝试化简结果。

    ```lean
    inductive Expr where
      | const : Nat → Expr
      | var : Nat → Expr
      | plus : Expr → Expr → Expr
      | times : Expr → Expr → Expr
      deriving Repr
    open Expr
    def eval (v : Nat → Nat) : Expr → Nat
      | const n     => sorry
      | var n       => v n
      | plus e₁ e₂  => sorry
      | times e₁ e₂ => sorry
    ------
    def simpConst : Expr → Expr
      | plus (const n₁) (const n₂)  => const (n₁ + n₂)
      | times (const n₁) (const n₂) => const (n₁ * n₂)
      | e                           => e

    def fuse : Expr → Expr := sorry

    theorem simpConst_eq (v : Nat → Nat)
            : ∀ e : Expr, eval v (simpConst e) = eval v e :=
      sorry

    theorem fuse_eq (v : Nat → Nat)
            : ∀ e : Expr, eval v (fuse e) = eval v e :=
      sorry
    ```

    最后两个定理表明这些定义保持求值结果不变。