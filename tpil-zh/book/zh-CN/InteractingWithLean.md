# 第 6 章：与 Lean 交互

> 本译文对应原书 [Interacting with Lean](https://lean-lang.org/theorem_proving_in_lean4/Interacting-with-Lean/)；英文 Verso 源：`book/TPiL/InteractingWithLean.lean`。

至此你已熟悉依赖类型论的基础：既可用来定义数学对象，也可用来构造证明。尚缺的是定义新数据类型的机制——下一章将引入**归纳数据类型**（inductive data type）来填补这一空缺。本章则暂离类型论的机制，转而探讨与 Lean 交互的一些实用方面。

此处并非所有信息都会立刻用到。建议先略读一遍以了解 Lean 的功能，需要时再回来查阅。

## 6.1 消息

Lean 产生三类消息：

**错误（Errors）**

当代码中的不一致导致无法处理时，会产生错误。例如语法错误（如缺少 `)`）或类型错误（如试图把自然数与函数相加）。

**警告（Warnings）**

警告描述代码中潜在的问题，例如使用了 `sorry`。与错误不同，代码并非毫无意义；但警告仍须仔细对待。

**信息（Information）**

信息并不表示代码有问题，包括 `#check`、`#eval` 等命令的输出。

Lean 可以检查某条命令是否产生预期消息。若消息匹配，则任何错误都会被忽略；这可用来确保「该出现的错误」确实出现。若不匹配，则 Lean 报错。可用 **`#guard_msgs`** 命令指明预期消息。

示例：

```lean
/--
error: Type mismatch
  "Not a number"
has type
  String
but is expected to have type
  Nat
-/
#guard_msgs in
def x : Nat := "Not a number"
```

在 `#guard_msgs` 后加括号注明消息类别，则只检查该类别，其余照常显示。下例中 `#eval` 因 `sorry` 产生错误，但 `sorry` 惯常触发的警告仍会照常显示：

```lean
/--
error: aborting evaluation since the expression depends on the
'sorry' axiom, which can lead to runtime instability and crashes.

To attempt to evaluate anyway despite the risks, use the '#eval!'
command.
-/
#guard_msgs(error) in
#eval (sorry : Nat)
```

若不加以配置，两类消息都会被捕获：

```lean
/--
error: aborting evaluation since the expression depends on the
'sorry' axiom, which can lead to runtime instability and crashes.

To attempt to evaluate anyway despite the risks, use the '#eval!'
command.
---
warning: declaration uses 'sorry'
-/
#guard_msgs in
#eval (sorry : Nat)
```

本书部分例子用 `#guard_msgs` 标明预期错误。

## 6.2 导入文件

Lean 前端的目标是解释用户输入、构造形式表达式，并检查其良构与类型正确。Lean 也支持多种编辑器，提供持续检查与反馈。更多信息见 Lean [文档页面](https://lean-lang.org/documentation/)。

Lean 标准库中的定义与定理分布在多个文件中。用户也可能希望使用额外库，或在多个文件中开发自己的项目。Lean 启动时会自动导入库文件夹 `Init` 的内容，其中包含许多基本定义与构造。因此，本书此处多数例子可以「开箱即用」。

若要用额外文件，则须在文件开头用 **`import`** 语句手动导入。命令

> `import Bar.Baz.Blah`

会导入文件 `Bar/Baz/Blah.olean`，路径相对于 Lean 的**搜索路径**（search path）解释。搜索路径如何确定见[文档页面](https://lean-lang.org/documentation/)。默认包含标准库目录，并在某些上下文中包含用户本地项目的根目录。

导入是**传递的**（transitive）：若你 `import Foo`，而 `Foo` 又 `import Bar`，则你也能访问 `Bar` 的内容，无需再显式 `import Bar`。

## 6.3 更多关于 section

Lean 提供多种分段机制以组织理论。第 2 章「变量与 section」已看到：**`section`** 命令不仅能将理论中相关元素分组，还能声明变量，并在需要时把它们插入定理与定义的参数中。记住 **`variable`** 的用途是为定理声明变量，例如：

```lean
section
variable (x y : Nat)

def double := x + x

#check double y

#check double (2 * x)

attribute [local simp] Nat.add_assoc Nat.add_comm Nat.add_left_comm

theorem t1 : double (x + y) = double x + double y := by
  simp [double]

#check t1 y

#check t1 (2 * x)

theorem t2 : double (x * y) = double x * y := by
  simp [double, Nat.add_mul]

end
```

`double` 的定义不必把 `x` 声明为参数；Lean 会检测依赖并自动插入。同理，Lean 在 `t1`、`t2` 中检测到 `x` 的出现并自动插入。注意 `double` **并不**把 `y` 作为参数——变量只出现在实际用到它们的声明中。

## 6.4 更多关于命名空间

在 Lean 中，标识符由层次化**名称**（name）给出，如 `Foo.Bar.baz`。第 2 章「命名空间」已介绍 Lean 处理层次名称的机制。命令 `namespace Foo` 会使 `Foo` 被加到每个定义与定理的名字前，直到遇到 `end Foo`。命令 `open Foo` 则为以前缀 `Foo` 开头的定义与定理创建临时**别名**（alias）。

```lean
namespace Foo
def bar : Nat := 1
end Foo

open Foo

#check bar

#check Foo.bar
```

下列定义

```lean
def Foo.bar : Nat := 1
```

被当作宏处理，展开为

```lean
namespace Foo
def bar : Nat := 1
end Foo
```

定理与定义的名称必须唯一，但标识它们的别名不必唯一。打开命名空间后，标识符可能**歧义**。Lean 会尽量用类型信息在上下文中消歧，但你也可始终给出全名。为此，字符串 `_root_` 表示空前缀的显式描述。

```lean
def String.add (a b : String) : String :=
  a ++ b

def Bool.add (a b : Bool) : Bool :=
  a != b

def add (α β : Type) : Type := Sum α β

open Bool
open String

-- This reference is ambiguous:
-- #check add

#check String.add           -- String.add (a b : String) : String

#check Bool.add             -- Bool.add (a b : Bool) : Bool

#check _root_.add           -- _root_.add (α β : Type) : Type

#check add "hello" "world"  -- "hello".add "world" : String

#check add true false       -- true.add false : Bool

#check add Nat Nat          -- _root_.add Nat Nat : Type
```

可用 **`protected`** 关键字阻止创建较短别名：

```lean
protected def Foo.bar : Nat := 1

open Foo

/-- error: Unknown identifier `bar` -/
#guard_msgs in
#check bar -- error

#check Foo.bar
```

这常用于 `Nat.rec`、`Nat.recOn` 等名称，以免常见名字被重载。

**`open`** 命令还有多种变体。命令

```lean
open Nat (succ zero gcd)

#check zero     -- Nat.zero : Nat

#eval gcd 15 6  -- 3
```

只为所列标识符创建别名。命令

```lean
open Nat hiding succ gcd

#check zero     -- Nat.zero : Nat

/-- error: Unknown identifier `gcd` -/
#guard_msgs in
#eval gcd 15 6  -- error

#eval Nat.gcd 15 6  -- 3
```

为 `Nat` 命名空间中**除**所列标识符外的所有内容创建别名。

```lean
open Nat renaming mul → times, add → plus

#eval plus (times 2 2) 3  -- 7
```

创建别名时将 `Nat.mul` 重命名为 `times`，`Nat.add` 重命名为 `plus`。

有时需要把别名从一个命名空间 **`export`** 到另一个，或导出到顶层。命令

```lean
export Nat (succ add sub)
```

在当前命名空间为 `succ`、`add`、`sub` 创建别名，从而在该命名空间被 `open` 时这些别名可用。若在命名空间外使用，则别名导出到顶层。

## 6.5 属性

Lean 的主要功能是把用户输入翻译成形式表达式，由内核检查正确性并存入环境供后续使用。但有些命令对环境有其他影响：为对象分配属性、定义记号，或声明类型类实例等，见「类型类」一章。多数此类命令具有**全局**效果，即不仅在当前文件生效，在导入该文件的任何文件中亦生效。不过它们常支持 **`local`** 修饰符，表示效果仅持续到当前 **`section`** 或 **`namespace`** 结束，或当前文件末尾。

第 5 章「使用化简器」已看到：定理可标注 **`[simp]`** 属性，供化简器使用。下例在列表上定义前缀关系，证明该关系自反，并为该定理赋予 `[simp]` 属性。

```lean
def isPrefix (l₁ : List α) (l₂ : List α) : Prop :=
  ∃ t, l₁ ++ t = l₂

@[simp] theorem List.isPrefix_self (as : List α) : isPrefix as as :=
  ⟨[], by simp⟩

example : isPrefix [1, 2, 3] [1, 2, 3] := by
  simp
```

化简器随后通过把 `isPrefix [1, 2, 3] [1, 2, 3]` 重写为 `True` 来完成证明。

也可在定义之后任意时刻分配属性：

```lean
def isPrefix (l₁ : List α) (l₂ : List α) : Prop :=
 ∃ t, l₁ ++ t = l₂
------
theorem List.isPrefix_self (as : List α) : isPrefix as as :=
  ⟨[], by simp⟩

attribute [simp] List.isPrefix_self
```

这些情况下，属性在导入该声明所在文件的任何文件中都有效。加上 **`local`** 则限制作用域：

```lean
def isPrefix (l₁ : List α) (l₂ : List α) : Prop :=
 ∃ t, l₁ ++ t = l₂
------
section

theorem List.isPrefix_self (as : List α) : isPrefix as as :=
  ⟨[], by simp⟩

attribute [local simp] List.isPrefix_self

example : isPrefix [1, 2, 3] [1, 2, 3] := by
  simp

end

/-- error: `simp` made no progress -/
#guard_msgs in
example : isPrefix [1, 2, 3] [1, 2, 3] := by
  simp
```

另一例：可用 **`instance`** 命令把记号 `≤` 赋给 `isPrefix` 关系。该命令在「类型类」一章解释，通过对关联定义赋予 **`[instance]`** 属性工作。

```lean
def isPrefix (l₁ : List α) (l₂ : List α) : Prop :=
  ∃ t, l₁ ++ t = l₂

instance : LE (List α) where
  le := isPrefix

theorem List.isPrefix_self (as : List α) : as ≤ as :=
  ⟨[], by simp⟩
```

该赋值也可设为局部：

```lean
def isPrefix (l₁ : List α) (l₂ : List α) : Prop :=
  ∃ t, l₁ ++ t = l₂
------
def instLe : LE (List α) :=
  { le := isPrefix }

section
attribute [local instance] instLe

example (as : List α) : as ≤ as :=
  ⟨[], by simp⟩

end

/--
error: failed to synthesize
  LE (List α)

Hint: Additional diagnostic information may be available using the
`set_option diagnostics true` command.
-/
#guard_msgs in
example (as : List α) : as ≤ as :=
  ⟨[], by simp⟩
```

下文「记号」一节将讨论 Lean 定义记号的机制，它们也支持 **`local`** 修饰符。而「设置选项」一节讨论的选项机制**不**遵循此模式：选项**只能**局部设置，即作用域始终限于当前 section 或当前文件。

## 6.6 更多关于隐式参数

（环境中有 `variable (α : Type u) (β : α → Type v) (t : {x : α} → β x)`。）

第 2 章「隐式参数」已看到：若 Lean 把项 `t` 的类型显示为 `{x : α} → β x`，则花括号表示 `x` 被标为 `t` 的**隐式参数**（implicit argument）。于是每写 `t`，就会插入占位符「洞」，即 `t` 被替换为 `@t _`。若不想如此，须写 `@t`。

（环境中有 `def f (x : Nat) {y : Nat} (z : Nat) : Nat := x + y + z`，且 `example := f 7` 与 `example := @f 7 _` 等价。）

注意隐式参数会被**急切**插入。设函数 `f : (x : Nat) → {y : Nat} → (z : Nat) → Nat`，则写 `f 7` 而不给更多参数时，会解析为 `@f 7 _`。

（环境中有 `def f (x : Nat) {{y : Nat}} (z : Nat) : Nat := x + y + z`，`example := f 7` 仅写 `f 7`；`example := @f 7 _ 3` 与 `example := f 7 3` 等价；另有 `def f' (x : Nat) ⦃y : Nat⦄ (z : Nat) : Nat := x + y + z`。）

Lean 还提供一种较弱的标注：仅在后继显式参数**之前**插入占位符。可用双花括号书写，故 `f` 的类型为 `f : (x : Nat) → {{y : Nat}} → (z : Nat) → Nat`。在此标注下，`f 7` 会按原样解析，而 `f 7 3` 会解析为 `@f 7 _ 3`，与强隐式标注相同。也可写作 `⦃y : Nat⦄`，Unicode 括号分别用 `\{{` 与 `\}}` 输入。

为说明差异，考虑下列例子：证明自反的欧几里得关系既对称又传递。

```lean
def reflexive {α : Type u} (r : α → α → Prop) : Prop :=
  ∀ (a : α), r a a

def symmetric {α : Type u} (r : α → α → Prop) : Prop :=
  ∀ {a b : α}, r a b → r b a

def transitive {α : Type u} (r : α → α → Prop) : Prop :=
  ∀ {a b c : α}, r a b → r b c → r a c

def Euclidean {α : Type u} (r : α → α → Prop) : Prop :=
  ∀ {a b c : α}, r a b → r a c → r b c

theorem th1 {α : Type u} {r : α → α → Prop}
            (reflr : reflexive r) (euclr : Euclidean r)
            : symmetric r :=
  fun {a b : α} =>
  fun (h : r a b) =>
  show r b a from euclr h (reflr _)

theorem th2 {α : Type u} {r : α → α → Prop}
            (symmr : symmetric r) (euclr : Euclidean r)
            : transitive r :=
  fun {a b c : α} =>
  fun (rab : r a b) (rbc : r b c) =>
  euclr (symmr rab) rbc

theorem th3 {α : Type u} {r : α → α → Prop}
            (reflr : reflexive r) (euclr : Euclidean r)
            : transitive r :=
 th2 (th1 reflr @euclr) @euclr

variable (r : α → α → Prop)
variable (euclr : Euclidean r)

#check euclr
```

结果拆成小步：`th1` 表明自反且欧几里得的关系是对称的，`th2` 表明对称且欧几里得的关系是传递的，`th3` 合并二者。注意须在 `euclr` 上手动关闭隐式参数，否则插入的隐式参数过多。改用弱隐式参数后问题消失：

```lean
def reflexive {α : Type u} (r : α → α → Prop) : Prop :=
  ∀ (a : α), r a a

def symmetric {α : Type u} (r : α → α → Prop) : Prop :=
  ∀ {{a b : α}}, r a b → r b a

def transitive {α : Type u} (r : α → α → Prop) : Prop :=
  ∀ {{a b c : α}}, r a b → r b c → r a c

def Euclidean {α : Type u} (r : α → α → Prop) : Prop :=
  ∀ {{a b c : α}}, r a b → r a c → r b c

theorem th1 {α : Type u} {r : α → α → Prop}
            (reflr : reflexive r) (euclr : Euclidean r)
            : symmetric r :=
  fun {a b : α} =>
  fun (h : r a b) =>
  show r b a from euclr h (reflr _)

theorem th2 {α : Type u} {r : α → α → Prop}
            (symmr : symmetric r) (euclr : Euclidean r)
            : transitive r :=
  fun {a b c : α} =>
  fun (rab : r a b) (rbc : r b c) =>
  euclr (symmr rab) rbc

theorem th3 {α : Type u} {r : α → α → Prop}
            (reflr : reflexive r) (euclr : Euclidean r)
            : transitive r :=
  th2 (th1 reflr euclr) euclr

variable (r : α → α → Prop)
variable (euclr : Euclidean r)

#check euclr  -- euclr : Euclidean r
```

还有第三类隐式参数，用方括号 `[` 与 `]` 表示，用于类型类，见「类型类」一章。

## 6.7 记号

Lean 的标识符可含任意字母数字字符，包括希腊字母（∀、Σ、λ 除外，它们在依赖类型论中有特殊含义）。也可含下标，输入方式为 `_` 后接所需下标字符。

Lean 的解析器可扩展，即可定义新记号。

Lean 的语法可在各层由用户扩展与定制，从基本的 **mixfix**（混合格式）记号到自定义 elaborator。事实上，所有内置语法都用向用户开放的同一套机制与 API 解析处理。本节将描述并解释各扩展点。

在编程语言中引入新记号相对少见，有时甚至因可能使代码晦涩而受诟病；但在形式化工作中，它是表达各领域既定约定与记号的宝贵工具。超越基本记号，Lean 还能把常见样板代码提炼为（行为良好的）**宏**（macro），并嵌入整套自定义领域特定语言（DSL），从而高效、可读地编码子问题，对程序员与证明工程师都大有裨益。

### 6.7.1 记号与优先级

最基本的语法扩展命令允许引入新的（或重载已有的）前缀、中缀、后缀运算符。

```lean
infixl:65   " + " => HAdd.hAdd  -- left-associative
infix:50    " = " => Eq         -- non-associative
infixr:80   " ^ " => HPow.hPow  -- right-associative
prefix:100  "-"   => Neg.neg
postfix:max "⁻¹"  => Inv.inv
```

在描述运算符种类（其**结合性**（fixity））的初始命令名之后，须给出运算符的**解析优先级**（parsing precedence），前加冒号 `:`，然后是双引号包围的新或已有记号（空白用于漂亮打印），再经箭头 `=>` 给出该运算符应翻译到的函数。

优先级是自然数，描述运算符与参数结合的「紧密」程度，编码运算顺序。更精确地说，可看上述命令展开为：

```lean
notation:65 lhs:65 " + " rhs:66 => HAdd.hAdd lhs rhs
notation:50 lhs:51 " = " rhs:51 => Eq lhs rhs
notation:80 lhs:81 " ^ " rhs:80 => HPow.hPow lhs rhs
notation:100 "-" arg:100 => Neg.neg arg
 -- `max` is a shorthand for precedence 1024:
notation:1024 arg:1024 "⁻¹" => Inv.inv arg
```

（环境中有 `variable {p : Nat} {a b c : α} [Add α] [Pow α α]`。）

第一代码块中的命令事实上都是翻译成更一般的 **`notation`** 命令的**命令宏**。下文将学习如何写此类宏。`notation` 接受记号与带优先级的命名项占位符的混合序列，可在 `=>` 右侧引用，并由在该位置解析的相应项替换。优先级为 `p` 的占位符只接受优先级至少为 `p` 的记号。因此字符串 `a + b + c` 不能解析为 `a + (b + c)` 的等价形式，因为 `infixl` 记号的右操作数优先级比记号本身大 1。相反，`infixr` 对右操作数复用记号自身的优先级，故 `a ^ b ^ c` **可以**解析为 `a ^ (b ^ c)`。注意若直接用 `notation` 引入中缀记号，且

```lean
def wobble : α → β → γ := sorry
------
notation:65 lhs:65 " ~ " rhs:65 => wobble lhs rhs
```

（环境中有 `variable (a : α) (b : β) (c : γ)`、`def wobble : α → β → γ := sorry` 及上述 `notation` 声明。）

优先级不足以确定结合性时，Lean 解析器默认**右结合**。更精确地说，在歧义文法下 Lean 遵循局部**最长解析**（longest parse）规则：解析 `a ~ b ~ c` 中 `a ~` 的右操作数时，只要当前优先级允许就继续解析，不会在 `b` 处停下，而会继续把 `~ c` 一并解析。故该项等价于 `a ~ (b ~ c)`。

如上所述，**`notation`** 命令可定义任意 **mixfix** 语法，自由混合记号与占位符。

```lean
set_option quotPrecheck false
------
notation:max "(" e ")" => e
notation:10 Γ " ⊢ " e " : " τ => Typing Γ e τ
```

无优先级的占位符默认为 `0`，即该位置接受任意优先级的记号。若两记号重叠，再次应用最长解析规则：

```lean
notation:65 a " + " b:66 " + " c:66 => a + b - c
#eval 1 + 2 + 3  -- 0
```

新记号优先于二元记号，因为后者在链式解析前会在 `1 + 2` 后停止。若多个记号接受同一最长解析，选择会推迟到 **elaboration**（类型 elaboration），除非恰好有一个重载类型正确，否则会失败。

## 6.8 强制转换

在 Lean 中，自然数类型 `Nat` 与整数类型 `Int` 不同。但有函数 `Int.ofNat` 把自然数嵌入整数，即在需要时可将任意自然数视为整数。Lean 有机制检测并插入此类**强制转换**（coercion）。也可用重载运算符 `↑` 显式请求强制转换。

```lean
variable (m n : Nat)
variable (i j : Int)

#check i + m      -- i + ↑m : Int

#check i + m + j  -- i + ↑m + j : Int

#check i + m + n  -- i + ↑m + ↑n : Int
```

## 6.9 显示信息

有多种方式向 Lean 查询当前状态及当前上下文中可用对象与定理的信息。你已见过两种最常用的：**`#check`** 与 **`#eval`**。记住 **`#check`** 常与 `@` 运算符联用，后者使定理或定义的所有参数显式。此外，可用 **`#print`** 命令获取任意标识符的信息。若标识符表示定义或定理，Lean 打印其类型与定义体；若是常量或公理，Lean 会标明并显示类型。

```lean
-- examples with equality
#check Eq

#check @Eq

#check Eq.symm

#check @Eq.symm

#print Eq.symm

-- examples with And
#check And

#check And.intro

#check @And.intro

-- a user-defined function
def foo {α : Type u} (x : α) : α := x

#check foo

#check @foo

#print foo
```

## 6.10 设置选项

Lean 维护若干可由用户设置的内部变量以控制行为。语法如下：

`set_option <name> <value>`

有一族非常有用的选项控制 Lean **漂亮打印器**（pretty printer）显示项的方式。下列选项取 `true` 或 `false`：

```
pp.explicit  : display implicit arguments
pp.universes : display hidden universe parameters
pp.notation  : display output using defined notations
```

例如下列设置会产生长得多的输出：

```lean
set_option pp.explicit true
set_option pp.universes true
set_option pp.notation false

#check 2 + 2 = 4

#reduce (fun x => x + 2) = (fun x => x + 3)

#check (fun x => x + 1) 1
```

命令 `set_option pp.all true` 一次性启用上述设置，`set_option pp.all false` 则恢复先前值。调试证明或理解晦涩错误信息时，漂亮打印额外信息往往很有用；但信息过多也会令人不知所措，Lean 的默认值对日常交互通常足够。

## 6.11 使用库

要有效使用 Lean，终究需要用到库中的定义与定理。回忆文件开头的 **`import`** 命令会导入其他文件中已编译的结果，且导入是传递的：若 `import Foo` 而 `Foo` 又 `import Bar`，则 `Bar` 的定义与定理对你也可用。但 `open` 命名空间（提供较短名字）不会传递——每个文件须自行 `open` 要用的命名空间。

一般而言，熟悉库及其内容很重要，这样你才知道有哪些定理、定义、记号与资源可用。下文将看到 Lean 的编辑器模式也能帮你查找所需，但直接研读库内容往往不可避免。Lean 标准库可在线于 GitHub 查看：

- [https://github.com/leanprover/lean4/tree/master/src/Init](https://github.com/leanprover/lean4/tree/master/src/Init)

- [https://github.com/leanprover/lean4/tree/master/src/Std](https://github.com/leanprover/lean4/tree/master/src/Std)

可用 GitHub 浏览器界面浏览这些目录与文件。若在本机安装了 Lean，可在 `lean` 文件夹中找到库，用文件管理器探索。每个文件顶部的注释头提供额外信息。

Lean 库开发者遵循一般命名指南，便于猜测所需定理名，或在支持此功能的 Lean 模式编辑器中用 Tab 补全查找——下一节将讨论。标识符一般为 `camelCase`，类型为 `CamelCase`。定理名常用描述性名称，各成分以 `_` 分隔。定理名往往只描述结论：

```lean
#check Nat.succ_ne_zero

#check Nat.zero_add

#check Nat.mul_one

#check Nat.le_of_succ_le_succ
```

（环境中已 `open Nat`。）

记住 Lean 的标识符可组织成层次命名空间。例如命名空间 `Nat` 中的定理 `le_of_succ_le_succ` 全名为 `Nat.le_of_succ_le_succ`，但 `open Nat`（对未标 `protected` 的名字）会使较短名可用。「归纳类型」与「结构体与记录」章节将看到：在 Lean 中定义结构体与归纳数据类型会生成相关操作，并存于与所定义类型同名的命名空间。例如积类型附带下列操作：

```lean
#check @Prod.mk

#check @Prod.fst

#check @Prod.snd

#check @Prod.rec
```

第一个用于构造对，后两个 `Prod.fst`、`Prod.snd` 投影两个分量。最后一个 `Prod.rec` 提供另一种根据两分量上的函数定义积上函数的方式。像 `Prod.rec` 这样的名字是 **protected** 的，即使 `open Prod` 也须用全名。

在命题即类型对应下，逻辑联结词也是归纳类型的实例，故我们也倾向于对它们使用点记号：

```lean
#check @And.intro

#check @And.casesOn

#check @And.left

#check @And.right

#check @Or.inl

#check @Or.inr

#check @Or.elim

#check @Exists.intro

#check @Exists.elim

#check @Eq.refl

#check @Eq.subst
```

## 6.12 自动绑定隐式参数

上一节展示了隐式参数如何使函数更易使用。然而像 `compose` 这样的函数定义仍相当冗长。注意带宇宙多态的 `compose` 比先前定义的版本更啰嗦。

```lean
universe u v w

def compose {α : Type u} {β : Type v} {γ : Type w}
    (g : β → γ) (f : α → β) (x : α) : γ :=
  g (f x)
```

可通过在定义 `compose` 时提供宇宙参数，避免 **`universe`** 命令：

```lean
def compose.{u, v, w}
    {α : Type u} {β : Type v} {γ : Type w}
    (g : β → γ) (f : α → β) (x : α) : γ :=
  g (f x)
```

Lean 4 支持称为**自动绑定隐式参数**（auto bound implicit arguments）的新特性，使像 `compose` 这样的函数写起来方便得多。Lean 处理声明头部时，任何未绑定的标识符会自动加为隐式参数。借助此特性可这样写 `compose`：

```lean
def compose (g : β → γ) (f : α → β) (x : α) : γ :=
  g (f x)

#check @compose -- @compose : {β : Sort u_1} → {γ : Sort u_2} → {α : Sort u_3} → (β → γ) → (α → β) → α → γ
```

注意 Lean 用 `Sort` 而非 `Type` 推断了更一般的类型。

我们很喜欢这一特性并在实现 Lean 时大量使用，但也意识到部分用户可能不安。可用命令 `set_option autoImplicit false` 关闭它：

```lean
set_option autoImplicit false

/--
error: Unknown identifier `β`
---
error: Unknown identifier `γ`
---
error: Unknown identifier `α`
---
error: Unknown identifier `β`
---
error: Unknown identifier `α`
---
error: Unknown identifier `γ`
-/
#guard_msgs in
def compose (g : β → γ) (f : α → β) (x : α) : γ :=
  g (f x)
```

## 6.13 隐式 lambda

当表达式的预期类型是等待隐式参数的函数时，**elaborator** 会自动引入相应的 lambda。例如 `pure` 的类型表明第一个参数是隐式类型 `α`，但 `ReaderT.pure` 的第一个参数是 reader monad 的上下文类型 `ρ`。表达式体会被自动包在 `fun {α} => ...` 中，使 elaborator 能正确填充体内的隐式参数。

```lean
variable (ρ : Type) (m : Type → Type) [Monad m]
------
instance : Monad (ReaderT ρ m) where
  pure := ReaderT.pure
  bind := ReaderT.bind
```

用户可用 `@` 或带 `{}`、`[]` 绑定子标注的 lambda 表达式关闭隐式 lambda 特性。示例如下：

```lean
set_option linter.unusedVariables false
namespace Ex2
------
def id1 : {α : Type} → α → α :=
  fun x => x

def listId : List ({α : Type} → α → α) :=
  (fun x => x) :: []

-- In this example, implicit lambda introduction has been disabled because
-- we use `@` before `fun`
def id2 : {α : Type} → α → α :=
  @fun α (x : α) => id1 x

def id3 : {α : Type} → α → α :=
  @fun α x => id1 x

def id4 : {α : Type} → α → α :=
  fun x => id1 x

-- In this example, implicit lambda introduction has been disabled
-- because we used the binder annotation `{...}`
def id5 : {α : Type} → α → α :=
  fun {α} x => id1 x
------
end Ex2
```

## 6.14 简单函数的语法糖

Lean 包含一种用匿名占位符而非 **`fun`** 描述简单函数的记号。当 `·` 作为项的一部分出现时，最近的包围括号变成以 `·` 为参数的函数。若括号内含多个占位符且中间无其他括号，则从左到右依次成为参数。示例如下：

```lean
namespace Ex3
------
#check (· + 1) -- fun x => x + 1 : Nat → Nat

#check (2 - ·) -- fun x => 2 - x : Nat → Nat

#eval [1, 2, 3, 4, 5].foldl (· * ·) 1 -- 120

def f (x y z : Nat) :=
  x + y + z

#check (f · 1 ·) -- fun x1 x2 => f x1 1 x2 : Nat → Nat → Nat

#eval [(1, 2), (3, 4), (5, 6)].map (·.1) -- [1, 3, 5]
------
end Ex3
```

嵌套括号会引入新函数。下例创建了两个不同的 lambda 表达式：

```lean
#check (Prod.mk · (· + 1)) -- fun x => (x, fun x => x + 1) : ?m.2 → ?m.2 × (Nat → Nat)
```

## 6.15 命名参数

**命名参数**（named arguments）允许按参数名而非在参数列表中的位置指定实参。若记不清参数顺序但知道名字，可按任意顺序传参。Lean 未能推断隐式参数时，也可为隐式参数提供值。命名参数还能通过标明每个实参含义提高可读性。

```lean
def sum (xs : List Nat) :=
  xs.foldl (init := 0) (·+·)

#eval sum [1, 2, 3, 4]
-- 10

example {a b : Nat} {p : Nat → Nat → Nat → Prop}
    (h₁ : p a b b) (h₂ : b = a) :
    p a a b :=
  Eq.subst (motive := fun x => p a x b) h₂ h₁
```

下列例子说明命名参数与默认参数的交互。

```lean
def f (x : Nat) (y : Nat := 1) (w : Nat := 2) (z : Nat) :=
  x + y + w - z

example (x z : Nat) : f (z := z) x = x + 1 + 2 - z := rfl

example (x z : Nat) : f x (z := z) = x + 1 + 2 - z := rfl

example (x y : Nat) : f x y = fun z => x + y + 2 - z := rfl

example : f = (fun x z => x + 1 + 2 - z) := rfl

example (x : Nat) : f x = fun z => x + 1 + 2 - z := rfl

example (y : Nat) : f (y := 5) = fun x z => x + 5 + 2 - z := rfl

def g {α} [Add α] (a : α) (b? : Option α := none) (c : α) : α :=
  match b? with
  | none   => a + c
  | some b => a + b + c

variable {α} [Add α]

example : g = fun (a c : α) => a + c := rfl

example (x : α) : g (c := x) = fun (a : α) => a + x := rfl

example (x : α) : g (b? := some x) = fun (a c : α) => a + x + c := rfl

example (x : α) : g x = fun (c : α) => x + c := rfl

example (x y : α) : g x y = fun (c : α) => x + y + c := rfl
```

可用 `..` 把缺失的显式参数填为 `_`。此特性与命名参数结合，便于写模式。示例：

```lean
inductive Term where
  | var    (name : String)
  | num    (val : Nat)
  | app    (fn : Term) (arg : Term)
  | lambda (name : String) (type : Term) (body : Term)

def getBinderName : Term → Option String
  | Term.lambda (name := n) .. => some n
  | _ => none

def getBinderType : Term → Option Term
  | Term.lambda (type := t) .. => some t
  | _ => none
```

当显式参数可由 Lean 自动推断、又想避免一连串 `_` 时，省略号也很有用。

```lean
example (f : Nat → Nat) (a b c : Nat) : f (a + b + c) = f (a + (b + c)) :=
  congrArg f (Nat.add_assoc ..)
```