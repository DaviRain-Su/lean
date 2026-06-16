# 第 2 章：依赖类型论

> 本译文对应原书 [Dependent Type Theory](https://lean-lang.org/theorem_proving_in_lean4/Dependent-Type-Theory/)；英文 Verso 源：`book/TPiL/DependentTypeTheory.lean`。

依赖类型论（dependent type theory）是一种强大而富表达力的语言，可表述复杂数学断言、书写复杂硬件与软件规约，并以自然统一的方式对二者推理。Lean 基于称为**构造演算**（Calculus of Constructions）的依赖类型论版本，带有可数的非累积宇宙层次与归纳类型。读完本章，你会理解其中大部分含义。

## 2.1 简单类型论

「类型论」得名于每个表达式都有关联的**类型**（type）。例如在给定上下文中，`x + 0` 可表示自然数，`f` 可表示自然数上的函数。若喜欢精确定义：Lean 的自然数是任意精度无符号整数。

下面是在 Lean 中声明对象并检查类型的示例：

```lean
/- Define some constants. -/

def m : Nat := 1       -- m is a natural number
def n : Nat := 0
def b1 : Bool := true  -- b1 is a Boolean
def b2 : Bool := false

/- Check their types. -/

#check m            -- m : Nat
#check n
#check n + 0        -- n + 0 : Nat
#check m * (n + 0)  -- m * (n + 0) : Nat
#check b1           -- b1 : Bool
-- "&&" is the Boolean and
#check b1 && b2     -- b1 && b2 : Bool
-- Boolean or
#check b1 || b2     -- b1 || b2 : Bool
-- Boolean "true"
#check true         -- Bool.true : Bool

/- Evaluate -/

#eval 5 * 4         -- 20
#eval m + 2         -- 3
#eval b1 && b2      -- false
```

`/-` 与 `-/` 之间的文本是注释块，Lean 忽略。类似地，`--` 表示行尾注释。注释块可嵌套，可像许多语言一样「注释掉」代码块。

**`def`** 关键字向工作环境声明新常量符号。上例中 `def m : Nat := 1` 定义类型为 `Nat`、值为 `1` 的常量 `m`。**`#check`** 让 Lean 报告类型；查询类辅助命令通常以 `#` 开头。**`#eval`** 让 Lean 求值给定表达式。应自行尝试声明常量与类型检查——这是实验系统的好办法。

简单类型论的强大之处在于可由其他类型构造新类型。下面示例前须有 `variable (a b : Type)`：若 `a`、`b` 为类型，则 `a -> b` 表示从 `a` 到 `b` 的函数类型，`a × b` 表示由 `a` 中元与 `b` 中元配成的对，即**笛卡尔积**（Cartesian product）。`×` 为 Unicode 符号；合理使用 Unicode 可提高可读性，现代编辑器支持良好。Lean 标准库常用希腊字母表示类型，用 `→` 作为 `->` 的紧凑写法。

```lean
#check Nat → Nat      -- type the arrow as “\to” or "\r"
#check Nat -> Nat     -- alternative ASCII notation

#check Nat × Nat      -- type the product as "\times"
#check Prod Nat Nat   -- alternative notation

#check Nat → Nat → Nat
#check Nat → (Nat → Nat)  --  same type as above

#check Nat × Nat → Nat
#check (Nat → Nat) → Nat -- a "functional"
```

```lean
#check Nat.succ     -- Nat.succ (n : Nat) : Nat
#check (0, 1)       -- (0, 1) : Nat × Nat
#check Nat.add      -- Nat.add : Nat → Nat → Nat

#check Nat.succ 2   -- Nat.succ 2 : Nat
#check Nat.add 3    -- Nat.add 3 : Nat → Nat
#check Nat.add 5 2  -- Nat.add 5 2 : Nat
#check (5, 9).1     -- (5, 9).fst : Nat
#check (5, 9).2     -- (5, 9).snd : Nat

#eval Nat.succ 2   -- 3
#eval Nat.add 5 2  -- 7
#eval (5, 9).1     -- 5
#eval (5, 9).2     -- 9
```

请再自行尝试一些例子。

基本语法：Unicode 箭头 `→` 可用 `\to`、`\r` 或 `\->` 输入；也可用 ASCII 的 `->`，故 `Nat -> Nat` 与 `Nat → Nat` 相同，均表示输入自然数、输出自然数的函数类型。笛卡尔积 `×` 用 `\times` 输入。常用小写希腊字母 `α`、`β`、`γ` 遍历类型，分别用 `\a`、`\b`、`\g` 输入。

下面示例前须有 `variable (α β : Type) (f : α → β) (x : α) (m n : Nat) (p : Nat × Nat)`。注意：函数 `f` 作用于值 `x` 记作 `f x`（如 `Nat.succ 2`）。写类型表达式时箭头**右结合**；`Nat.add` 的类型 `Nat → Nat → Nat` 等价于 `Nat → (Nat → Nat)`。故可把 `Nat.add` 看作：输入一个自然数，返回「再输入一个自然数并返回自然数」的函数。类型论中这通常比把 `Nat.add` 写成「输入一对自然数、输出一个自然数」更方便——例如可对 `Nat.add` **部分应用**：`Nat.add 3` 的类型为 `Nat → Nat`，等待第二个参数 `n`，等价于 `Nat.add 3 n`。

若 `m : Nat` 且 `n : Nat`，则 `(m, n)` 为有序对，类型 `Nat × Nat`。若 `p : Nat × Nat`，可写 `p.1 : Nat` 与 `p.2 : Nat` 提取两个分量。

## 2.2 类型作为对象

Lean 的依赖类型论相对简单类型论的一大扩展是：**类型本身**（如 `Nat`、`Bool`）是一等公民（first-class citizen），即类型也是对象；因此每个类型也须有自己的类型。

```lean
#check Nat
#check Bool
#check Nat → Bool
#check Nat × Bool
#check Nat → Nat
#check Nat × Nat → Nat
#check Nat → Nat → Nat
#check Nat → (Nat → Nat)
#check Nat → Nat → Bool
#check (Nat → Nat) → Nat
```

可见上述每个表达式的类型都是 `Type`。也可为类型声明新常量：

```lean
def α : Type := Nat
def β : Type := Bool
def F : Type → Type := List
def G : Type → Type → Type := Prod

#check α        -- α : Type
#check F α      -- F α : Type
#check F Nat    -- F Nat : Type
#check G α      -- G α : Type → Type
#check G α β    -- G α β : Type
#check G α Nat  -- G α Nat : Type
```

你已见过 `Type → Type → Type` 的函数——笛卡尔积 `Prod`：

```lean
def α : Type := Nat
def β : Type := Bool

#check Prod α β       -- α × β : Type
#check α × β          -- α × β : Type

#check Prod Nat Nat   -- Nat × Nat : Type
#check Nat × Nat      -- Nat × Nat : Type
```

另一例：对任意类型 `α`，`List α` 表示 `α` 中元素的列表类型：

```lean
def α : Type := Nat

#check List α    -- List α : Type
#check List Nat  -- List Nat : Type
```

Lean 中每个表达式都有类型，自然要问：`Type` 本身有什么类型？

```lean
#check Type      -- Type : Type 1
```

这触及 Lean 类型系统最微妙之处：底层基础有**无穷宇宙层次**：

```lean
#check Type     -- Type : Type 1
#check Type 1   -- Type 1 : Type 2
#check Type 2   -- Type 2 : Type 3
#check Type 3   -- Type 3 : Type 4
#check Type 4   -- Type 4 : Type 5
```

可把 `Type 0` 想成「小」或「普通」类型的宇宙；`Type 1` 是更大的类型宇宙，以 `Type 0` 为元素；`Type 2` 更大，包含 `Type 1`……对每个自然数 `n` 都有 `Type n`。`Type` 是 `Type 0` 的缩写：

```lean
#check Type
#check Type 0
```

下表有助于具体化这些关系：沿横轴是在宇宙间移动，沿纵轴是有时称为「度」（degree）的变化。

| sort | `Prop`（`Sort 0`） | `Type`（`Sort 1`） | `Type 1`（`Sort 2`） | `Type 2`（`Sort 3`） | … |
|------|-------------------|-------------------|---------------------|---------------------|---|
| type | `True` | `Bool` | `Nat → Type` | `Type → Type 1` | … |
| term | `True.intro` | `true` | `fun n => Fin n` | `fun (_ : Type) => Type` | … |

有些运算须对类型宇宙**多态**（polymorphic）。例如 `List α` 应对任意宇宙中的 `α` 都有意义，这解释 `List` 的类型签名：

```lean
#check List    -- List.{u} (α : Type u) : Type u
```

此处 `u` 是遍历类型层次的变量。`#check` 输出表示：每当 `α` 有类型 `Type u`，`List α` 也有类型 `Type u`。`Prod` 类似：

```lean
#check Prod    -- Prod.{u, v} (α : Type u) (β : Type v) : Type (max u v)
```

定义多态常量时，可用 **`universe`** 命令显式声明宇宙变量：

```lean
universe u

def F (α : Type u) : Type u := Prod α α

#check F    -- F.{u} (α : Type u) : Type u
```

也可在定义 `F` 时直接给出宇宙参数，省去 `universe` 命令：

```lean
def F.{u} (α : Type u) : Type u := Prod α α

#check F    -- F.{u} (α : Type u) : Type u
```

## 2.3 函数抽象与求值

Lean 用 **`fun`**（或 **`λ`**）从表达式创建函数：

```lean
#check fun (x : Nat) => x + 5   -- fun x => x + 5 : Nat → Nat
-- λ and fun mean the same thing
#check λ (x : Nat) => x + 5     -- fun x => x + 5 : Nat → Nat
```

此例中 `Nat` 可推断：

```lean
#check fun x => x + 5   -- fun x => x + 5 : Nat → Nat
#check λ x => x + 5     -- fun x => x + 5 : Nat → Nat
```

传入所需参数即可对 lambda 求值：

```lean
#eval (λ x : Nat => x + 5) 10    -- 15
```

从另一表达式创建函数称为 **lambda 抽象**（lambda abstraction）。设 `x : α` 且能构造 `t : β`，则 `fun (x : α) => t`（或 `λ (x : α) => t`）是类型 `α → β` 的对象——把 `α` 中任意值 `x` 映到 `t` 的函数。

更多例子：

```lean
#check fun x : Nat => fun y : Bool => if not y then x + 1 else x + 2
#check fun (x : Nat) (y : Bool) => if not y then x + 1 else x + 2
#check fun x y => if not y then x + 1 else x + 2   -- fun x y => if (!y) = true then x + 1 else x + 2 : Nat → Bool → Nat
```

Lean 将最后三个视为同一表达式；最后一式中 Lean 从 `if not y then x + 1 else x + 2` 推断 `x`、`y` 的类型。

一些常见函数运算可用 lambda 抽象描述：

```lean
def f (n : Nat) : String := toString n
def g (s : String) : Bool := s.length > 0

#check fun x : Nat => x        -- fun x => x : Nat → Nat
#check fun x : Nat => true     -- fun x => true : Nat → Bool
#check fun x : Nat => g (f x)  -- fun x => g (f x) : Nat → Bool
#check fun x => g (f x)        -- fun x => g (f x) : Nat → Bool
```

`fun x : Nat => x` 是 `Nat` 上的恒等函数；`fun x : Nat => true` 是恒为 `true` 的常值函数；`fun x : Nat => g (f x)` 是 `f` 与 `g` 的复合。一般可省略类型标注，让 Lean 推断，例如写 `fun x => g (f x)` 而非 `fun x : Nat => g (f x)`。

函数可作参数；命名 `f`、`g` 后可在实现中使用：

```lean
#check fun (g : String → Bool) (f : Nat → String) (x : Nat) => g (f x)
```

也可把类型作为参数：

```lean
#check fun (α β γ : Type) (g : β → γ) (f : α → β) (x : α) => g (f x)
```

最后一式表示：取三个类型 `α`、`β`、`γ` 与两个函数 `g : β → γ`、`f : α → β`，返回 `g` 与 `f` 的复合。（理解其类型需**依赖积**，见下文。）

lambda 的一般形式为 `fun (x : α) => t`，其中 `x` 是**绑定变量**（bound variable）：只是占位符，作用域不超出 `t`。例如 `fun (b : β) (x : α) => b` 中的 `b` 与先前声明的常量 `b` 无关；该式与 `fun (u : β) (z : α) => u` 表示同一函数。形式地，仅绑定变量重命名而相同的表达式称为 **alpha 等价**（alpha equivalent），Lean 视为「相同」。

若 `t : α → β` 且 `s : α`，则 `t s : β`。例如：

```lean
#check (fun x : Nat => x) 1     -- (fun x => x) 1 : Nat
#check (fun x : Nat => true) 1  -- (fun x => true) 1 : Bool

def f (n : Nat) : String := toString n
def g (s : String) : Bool := s.length > 0

#check
  (fun (α β γ : Type) (u : β → γ) (v : α → β) (x : α) => u (v x)) Nat String Bool g f 0
```

`(fun x : Nat => x) 1` 的类型为 `Nat`；更重要的是，把 `(fun x : Nat => x)` 作用于 `1` 应「返回」`1`：

```lean
#eval (fun x : Nat => x) 1     -- 1
#eval (fun x : Nat => true) 1  -- true
```

依赖类型论的重要特征：每个项有计算行为，支持**归约**（normalization）。原则上，归约到同一值的两项称为**定义相等**（definitionally equal）；Lean 类型检查器视其为「相同」，并尽力识别与支持这些等同。

Lean 是完整编程语言，有生成可执行文件的编译器与交互式解释器；**`#eval`** 用于执行表达式，是测试函数的首选方式。

## 2.4 定义

**`def`** 是声明新命名对象的重要方式之一：

```lean
def double (x : Nat) : Nat :=
  x + x
```

若熟悉其他语言，这像常见函数定义：`double` 接受 `Nat` 参数 `x`，返回 `x + x`，即 `Nat`。调用方式：

```lean
def double (x : Nat) : Nat :=
 x + x
-----
#eval double 3    -- 6
```

可把 `def` 看作一种带名的 `fun`：

```lean
def double : Nat → Nat :=
  fun x => x + x

#eval double 3    -- 6
```

Lean 有足够信息时可省略类型声明——**类型推断**（type inference）是 Lean 的重要部分：

```lean
def double :=
  fun (x : Nat) => x + x
```

定义的一般形式为 `def foo : α := bar`，`α` 是 `bar` 的返回类型。Lean 通常能推断 `α`，但显式写出常是好习惯：意图更清晰，且若右边类型不匹配 Lean 会报错。

右边 `bar` 可以是任意表达式，不限于 lambda。故 `def` 也可仅命名一个值：

```lean
def pi := 3.141592654
```

`def` 可有多个输入参数：

```lean
def add (x y : Nat) :=
  x + y

#eval add 3 2               -- 5
```

参数列表也可分开写：

```lean
def double (x : Nat) : Nat :=
  x + x
-----
def add (x : Nat) (y : Nat) :=
  x + y

#eval add (double 3) (7 + 9)  -- 22
```

`def` 体内可用更复杂的表达式：

```lean
def greater (x y : Nat) :=
  if x > y then x
  else y
```

也可定义接受函数作为输入的函数——下面把给定函数调用两次，第一次的输出作为第二次的输入：

```lean
def double (x : Nat) : Nat :=
 x + x
-----
def doTwice (f : Nat → Nat) (x : Nat) : Nat :=
  f (f x)

#eval doTwice double 2   -- 8
```

更抽象地，可有类似类型参数的参数：

```lean
def compose (α β γ : Type) (g : β → γ) (f : α → β) (x : α) : γ :=
  g (f x)
```

`compose` 接受任意两个各只接受一个输入的函数；`β → γ` 与 `α → β` 要求第二个函数的输出类型与第一个函数的输入类型匹配——否则无法复合。第三个参数 `x : α` 用于调用 `f`，再把结果（类型 `β`）传给 `g`，返回类型 `γ`。它对任意 `α β γ` 都成立：

```lean
def compose (α β γ : Type) (g : β → γ) (f : α → β) (x : α) : γ :=
  g (f x)
def double (x : Nat) : Nat :=
  x + x
-----
def square (x : Nat) : Nat :=
  x * x

#eval compose Nat Nat Nat double square 3  -- 18
```

## 2.5 局部定义

Lean 还可用 **`let`** 引入**局部定义**（local definition）。表达式 `let a := t1; t2` 在定义上等价于把 `t2` 中 `a` 的每次出现替换为 `t1` 的结果。

```lean
#check let y := 2 + 2; y * y   -- let y := 2 + 2; y * y : Nat
#eval  let y := 2 + 2; y * y   -- 16

def twice_double (x : Nat) : Nat :=
  let y := x + x; y * y

#eval twice_double 2   -- 16
```

`twice_double x` 定义上等价于 `(x + x) * (x + x)`。

可链式写多个 `let`：

```lean
#check let y := 2 + 2; let z := y + y; z * z
#eval  let y := 2 + 2; let z := y + y; z * z   -- 64
```

换行时 `;` 可省略：

```lean
def t (x : Nat) : Nat :=
  let y := x + x
  y * y
```

`let a := t1; t2` 与 `(fun a => t2) t1` 含义很相似但不相同：在 `let` 中，应把 `t2` 里每个 `a` 看作 `t1` 的语法缩写；在 `fun a => t2` 中 `a` 是变量，`fun a => t2` 须独立于 `a` 的值而有意义。`let` 是更强的缩写手段；有些 `let a := t1; t2` 无法写成 `(fun a => t2) t1`。下面 `foo` 能通过类型检查，而 `bar`（注释掉）不能：

```lean
def foo := let a := Nat; fun x : a => x + 2
/-
  def bar := (fun a => fun x : a => x + 2) Nat
-/
```

## 2.6 变量与节

考虑三个函数定义：

```lean
def compose (α β γ : Type) (g : β → γ) (f : α → β) (x : α) : γ :=
  g (f x)

def doTwice (α : Type) (h : α → α) (x : α) : α :=
  h (h x)

def doThrice (α : Type) (h : α → α) (x : α) : α :=
  h (h (h x))
```

Lean 提供 **`variable`** 使命名更紧凑：

```lean
variable (α β γ : Type)

def compose (g : β → γ) (f : α → β) (x : α) : γ :=
  g (f x)

def doTwice (h : α → α) (x : α) : α :=
  h (h x)

def doThrice (h : α → α) (x : α) : α :=
  h (h (h x))
```

可声明任意类型的变量，不限于 `Type`：

```lean
variable (α β γ : Type)
variable (g : β → γ) (f : α → β) (h : α → α)
variable (x : α)

def compose := g (f x)
def doTwice := h (h x)
def doThrice := h (h (h x))

#print compose
#print doTwice
#print doThrice
```

打印结果显示三组定义效果完全相同。

`variable` 指示 Lean 在按名引用这些变量的定义中，把它们插入为绑定变量。Lean 能判断变量在定义中是显式还是隐式使用；写定义时可当作 `α`、`β`、`γ`、`g`、`f`、`h`、`x` 已固定，由 Lean 自动抽象。

这样声明的变量作用域持续到当前文件末尾。有时需限制作用域，Lean 提供 **`section`**：

```lean
section useful
  variable (α β γ : Type)
  variable (g : β → γ) (f : α → β) (h : α → α)
  variable (x : α)

  def compose := g (f x)
  def doTwice := h (h x)
  def doThrice := h (h (h x))
end useful
```

节结束后变量超出作用域，无法再引用。节内行不必缩进；节可匿名（`section` / `end`），也可命名——命名则须用同名 `end` 关闭。节可嵌套，便于逐步声明新变量。

## 2.7 命名空间

Lean 可把定义组织成嵌套分层的**命名空间**（namespace）：

```lean
namespace Foo
  def a : Nat := 5
  def f (x : Nat) : Nat := x + 7

  def fa : Nat := f a
  def ffa : Nat := f (f a)

  #check a
  #check f
  #check fa
  #check ffa
  #check Foo.fa
end Foo

-- #check a  -- error
-- #check f  -- error
#check Foo.a
#check Foo.f
#check Foo.fa
#check Foo.ffa

open Foo

#check a
#check f
#check fa
#check Foo.fa
```

在命名空间 `Foo` 中工作时，每个标识符的全名带前缀 `Foo.`；命名空间内可用短名，结束后须用长名。与 `section` 不同，命名空间必须有名字；根层只有一个匿名命名空间。

**`open`** 把短名带入当前上下文。导入模块时常 `open` 其中命名空间以使用短标识符；若与另一命名空间冲突，可保留全限定名。命名空间便于管理工作环境中的名字。

Lean 把列表相关定义与定理放在 `List` 命名空间：

```lean
#check List.nil
#check List.cons
#check List.map
```

`open List` 后可用短名：

```lean
open List

#check nil
#check cons
#check map
```

命名空间可嵌套：

```lean
namespace Foo
  def a : Nat := 5
  def f (x : Nat) : Nat := x + 7

  def fa : Nat := f a

  namespace Bar
    def ffa : Nat := f (f a)

    #check fa
    #check ffa
  end Bar

  #check fa
  #check Bar.ffa
end Foo

#check Foo.fa
#check Foo.Bar.ffa

open Foo

#check fa
#check Bar.ffa
```

已关闭的命名空间之后可重新打开，甚至在另一文件中：

```lean
namespace Foo
  def a : Nat := 5
  def f (x : Nat) : Nat := x + 7

  def fa : Nat := f a
end Foo

#check Foo.a
#check Foo.f

namespace Foo
  def ffa : Nat := f (f a)
end Foo
```

嵌套命名空间须按打开顺序关闭。命名空间与节用途不同：命名空间组织数据，节为定义声明待插入的变量。节也用于限定 `set_option`、`open` 等命令的作用域。在许多方面，`namespace ... end` 与 `section ... end` 行为相似：在命名空间内用 `variable`，其作用域限于该命名空间；在命名空间内 `open`，关闭后效果消失。

## 2.8 何谓「依赖」？

简言之：类型可依赖参数。你已见过好例子：`List α` 依赖参数 `α`，由此区分 `List Nat` 与 `List Bool`。另一例：`Vector α n`，表示长度为 `n`、元素类型为 `α` 的向量类型，依赖两个参数：`α : Type` 与 `n : Nat`。

要在列表头部插入新元素，函数 `cons` 应有什么类型？它是**多态**的：对 `Nat`、`Bool` 或任意 `α` 的 `cons` 行为应一致。故把类型作为 `cons` 的第一个参数合理：对任意 `α`，`cons α` 是向 `List α` 插入元素的函数——`cons α` 接受 `a : α` 与 `as : List α`，返回新列表，`cons α a as : List α`。

显然 `cons α` 应有类型 `α → List α → List α`。那 `cons` 本身呢？初猜 `Type → α → List α → List α` 不合理：其中的 `α` 无所指，而应指类型参数。在假定 `α : Type` 为第一个参数时，后两个参数的类型是 `α` 与 `List α`——它们随第一个参数 `α` 变化。

```lean
def cons (α : Type) (a : α) (as : List α) : List α :=
  List.cons a as

#check cons Nat        -- cons Nat : Nat → List Nat → List Nat
#check cons Bool       -- cons Bool : Bool → List Bool → List Bool
#check cons            -- cons (α : Type) (a : α) (as : List α) : List α
```

这是**依赖函数类型**（dependent function type）或**依赖箭头类型**的实例。给定 `α : Type` 与 `β : α → Type`，把 `β` 看作 `α` 上的类型族，即对每个 `a : α` 有类型 `β a`。则 `(a : α) → β a` 表示这样的函数 `f`：对每个 `a : α`，`f a` 是 `β a` 的元素——`f` 的返回值类型依赖其输入。

注意 `(a : α) → β` 对任意 `β : Type` 都有意义。当 `β` 的值依赖 `a`（如 `β a`）时，`(a : α) → β` 表示依赖函数类型。当 `β` 不依赖 `a` 时，`(a : α) → β` 与 `α → β` 无别；在依赖类型论（及 Lean）中，`α → β` 只是 `β` 不依赖 `a` 时 `(a : α) → β` 的记号。

用 `#check` 查看 `List` 相关函数类型；`@` 与圆括号、花括号的区别见下节。

```lean
#check @List.cons    -- @List.cons : {α : Type u_1} → α → List α → List α
#check @List.nil     -- @List.nil : {α : Type u_1} → List α
#check @List.length  -- @List.length : {α : Type u_1} → List α → Nat
#check @List.append  -- @List.append : {α : Type u_1} → List α → List α → List α
```

正如 `(a : α) → β a` 在允许 `β` 依赖 `a` 时推广 `α → β`，依赖笛卡尔积类型 `(a : α) × β a` 以同样方式推广 `α × β`。依赖积也称 **sigma 类型**，可写作 `Σ a : α, β a`。用 `⟨a, b⟩` 或 `Sigma.mk a b` 构造依赖对；`⟨`、`⟩` 可用 `\langle`、`\rangle` 或 `\<`、`\>` 输入。

```lean
universe u v

def f (α : Type u) (β : α → Type v) (a : α) (b : β a) : (a : α) × β a :=
  ⟨a, b⟩

def g (α : Type u) (β : α → Type v) (a : α) (b : β a) : Σ a : α, β a :=
  Sigma.mk a b

def h1 (x : Nat) : Nat :=
  (f Type (fun α => α) Nat x).2

#eval h1 5 -- 5

def h2 (x : Nat) : Nat :=
  (g Type (fun α => α) Nat x).2

#eval h2 5 -- 5
```

`f` 与 `g` 表示同一函数。

## 2.9 隐式参数

设列表实现为：

```lean
universe u
def Lst (α : Type u) : Type u := List α
def Lst.cons (α : Type u) (a : α) (as : Lst α) : Lst α := List.cons a as
def Lst.nil (α : Type u) : Lst α := List.nil
def Lst.append (α : Type u) (as bs : Lst α) : Lst α := List.append as bs
-----
#check Lst          -- Lst.{u} (α : Type u) : Type u
#check Lst.cons     -- Lst.cons.{u} (α : Type u) (a : α) (as : Lst α) : Lst α
#check Lst.nil      -- Lst.nil.{u} (α : Type u) : Lst α
#check Lst.append   -- Lst.append.{u} (α : Type u) (as bs : Lst α) : Lst α
```

构造 `Nat` 列表：

```lean
universe u
def Lst (α : Type u) : Type u := List α
def Lst.cons (α : Type u) (a : α) (as : Lst α) : Lst α := List.cons a as
def Lst.nil (α : Type u) : Lst α := List.nil
def Lst.append (α : Type u) (as bs : Lst α) : Lst α := List.append as bs
-----
#check Lst.cons Nat 0 (Lst.nil Nat)

def as : Lst Nat := Lst.nil Nat
def bs : Lst Nat := Lst.cons Nat 5 (Lst.nil Nat)

#check Lst.append Nat as bs
```

构造子对类型多态，须反复写入 `Nat`。但这冗余：从第二个参数 `5` 的类型 `Nat` 可推断 `Lst.cons Nat 5 (Lst.nil Nat)` 中的 `α`；`Lst.nil Nat` 中的 `α` 虽不能从该式本身推断，但可作为 `Lst.cons` 的第三个参数推断——`Lst.cons` 在该位置期望 `Lst α` 的元素。

这是依赖类型论的核心特征：项携带大量信息，其中不少可从上下文推断。Lean 用下划线 **`_`** 表示由系统自动填入，称为**隐式参数**（implicit argument）。

```lean
universe u
def Lst (α : Type u) : Type u := List α
def Lst.cons (α : Type u) (a : α) (as : Lst α) : Lst α := List.cons a as
def Lst.nil (α : Type u) : Lst α := List.nil
def Lst.append (α : Type u) (as bs : Lst α) : Lst α := List.append as bs
#check Lst
#check Lst.cons
#check Lst.nil
#check Lst.append
-----
#check Lst.cons _ 0 (Lst.nil _)

def as : Lst Nat := Lst.nil _
def bs : Lst Nat := Lst.cons _ 5 (Lst.nil _)

#check Lst.append _ as bs -- Lst.append Nat as bs : Lst Nat
```

反复写 `_` 仍繁琐。若某参数通常可从上下文推断，Lean 允许默认将其**隐式化**——用花括号声明：

```lean
universe u
def Lst (α : Type u) : Type u := List α

def Lst.cons {α : Type u} (a : α) (as : Lst α) : Lst α := List.cons a as
def Lst.nil {α : Type u} : Lst α := List.nil
def Lst.append {α : Type u} (as bs : Lst α) : Lst α := List.append as bs

#check Lst.cons 0 Lst.nil

def as : Lst Nat := Lst.nil
def bs : Lst Nat := Lst.cons 5 Lst.nil

#check Lst.append as bs
```

变化仅在于把 `α : Type u` 放进花括号。函数定义中也可如此：

```lean
universe u
def ident {α : Type u} (x : α) := x
```

查看 `ident` 的类型时须加括号，以免显示其签名：

```lean
universe u
def ident {α : Type u} (x : α) := x
---------
#check (ident)       -- ident : ?m.22 → ?m.22
#check ident 1       -- ident 1 : Nat
#check ident "hello" -- ident "hello" : String
#check @ident        -- @ident : {α : Type u_1} → α → α
```

这使 `ident` 的第一个参数隐式，表面上像对任意类型取一个参数。标准库中的 `id` 正是这样定义的；此处用非常规名仅为避免重名。

用 **`variable`** 声明时也可指定隐式：

```lean
universe u

section
  variable {α : Type u}
  variable (x : α)
  def ident := x
end

#check ident
#check ident 4
#check ident "hello"
```

此 `ident` 与上面效果相同。

Lean 有复杂的隐式参数实例化机制，可推断函数类型、谓词甚至证明。填充项中「洞」的过程常称为 **elaboration**（类型 elaboration）。隐式参数使有时信息不足以精确定义表达式含义；像 `id` 或 `List.nil` 这样的表达式称为**多态**（polymorphic），在不同上下文可有不同含义。

总可用 `(e : T)` 为表达式 `e` 指定类型 `T`，指示 elaborator 在解析隐式参数时用 `T` 作为 `e` 的类型：

```lean
#check (List.nil)             -- [] : List ?m.2
#check (id)                   -- id : ?m.1 → ?m.1

#check (List.nil : List Nat)  -- [] : List Nat
#check (id : Nat → Nat)       -- id : Nat → Nat
```

Lean 中数字字面量重载；无法推断类型时默认视为自然数。故前两个 `#check` 的 elaboration 相同；第三个把 `2` 解释为整数：

```lean
#check 2            -- 2 : Nat
#check (2 : Nat)    -- 2 : Nat
#check (2 : Int)    -- 2 : Int
```

有时参数已声明为隐式，却想显式提供。若 `foo` 是这样声明的函数，记号 **`@foo`** 表示同一函数但所有参数都显式：

```lean
#check @id        -- @id : {α : Sort u_1} → α → α
#check @id Nat    -- id : Nat → Nat
#check @id Bool   -- id : Bool → Bool

#check @id Nat 1     -- id 1 : Nat
#check @id Bool true -- id true : Bool
```

第一个 `#check` 给出标识符 `id` 的类型而不插入占位符，且表明第一个参数是隐式的。