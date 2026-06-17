# 第 8 章 元编程

> 已对照 Lean-zh PDF 与 `LoVe08_Metaprogramming_Demo.lean` 人工校对（原 PDF 7165–8040 行）。

和大多数证明助手一样，Lean 可以通过自定义策略和其他工具进行扩展。对 Lean 自身进行编程，而不仅仅是使用它，被称为**元编程**（metaprogramming）。Lean 的元编程框架大多使用与 Lean 输入语言相同的概念和语法，因此我们不需要学习另一门语言来对 Lean 进行编程。[第 7 章](ch07_EffectfulProgramming.md)介绍的**单子**（monad）被用来访问 Lean 的状态。

以归纳类型呈现的**抽象语法树**（abstract syntax tree，AST）反映了内部数据结构。证明助手的内部结构通过 Lean 函数公开，我们可以使用这些函数来

- 访问当前语境与目标；
- 统一项；
- 查询和修改**环境**（environment）；
- 设置属性（例如 `@[simp]`）。

Lean 自身的大部分都是用 Lean 实现的。

下面是元编程的一些示例应用：

- **目标转换**（例如：应用安全的引入规则，将目标置于否定范式）；
- **启发式证明搜索**（例如：结合回溯应用非安全的引入规则）；
- **判定过程**（decision procedure）（例如：针对线性算术、命题逻辑）；
- **定义生成器**（例如：归纳类型的 Haskell 风格的 `deriving`）；
- **建议工具**（例如：定理查找器、反例生成器）；
- **导出器**（例如：文档生成器）；
- **特设证明自动化**（ad-hoc proof automation）（为了避免样板代码或重复）。

Lean 元编程框架的优势在于：

- 用户无需学习另一门编程语言即可编写元程序；他们可以使用与在证明助手库中定义普通对象相同的构造和记法。
- 该库中的一切都可用于元编程。
- 元程序可以在同一个交互式环境中编写和调试，从而鼓励一种形式化库与支持自动化同步开发的风格。

正如数学家及 Lean 用户凯文·巴扎德（Kevin Buzzard）所写的：[^buzzard-grinding]

> 如果你发现自己正在「刷怪」（*grinding*，借用电脑游戏的用语），一遍又一遍地做着同样的事情，因为你需要这样做才能取得进展，那么你可以试着说服一位计算机科学家为你编写一个策略（或者——如果你足够勇敢——可以编写元 Lean 代码，甚至可以自己编写策略）。

[^buzzard-grinding]: https://xenaproject.wordpress.com/2020/02/09/lean-is-better-for-proper-maths-than-all-the-other-theorem-provers/

## 8.1 策略组合子

首先，有一些术语：如果应用一个策略产生了错误，则该策略**失败**（fail）；否则，它**成功**（succeed）。策略成功的一种方式是完全证明目标。另一种方式是产生替换当前目标的新子目标。有些策略通过什么都不做来取得成功。

在编写我们自己的策略时，我们经常需要在多个目标上重复某些操作，或者在策略失败时进行恢复。在这种情况下，**策略组合子**（tactic combinator）会很有帮助。

最实用的策略组合子之一是 `repeat'`。它在所有目标上重复调用策略，然后在产生的子目标上调用，再在产生的子子目标上调用，依此类推，直到策略在所有可用目标上都失败为止。下面是一个涉及[第 6 章](ch06_InductivePredicates.md#611-偶数)中介绍的 `Even` 谓词的 `repeat'` 示例：

```lean
theorem repeat'_example :
    Even 4 ∧ Even 7 ∧ Even 3 ∧ Even 0 :=
  by
    repeat' apply And.intro
    repeat' apply Even.add_two
    repeat' sorry
```

在第一个 `repeat'` 行之后，证明状态包含四个目标：

```
⊢ Even 4
⊢ Even 7
⊢ Even 3
⊢ Even 0
```

请注意，所有的合取项都消失了。第二个 `repeat'` 重复应用定理 `Even.add_two : ∀k, Even k → Even (k + 2)`，留下了这些目标：

```
⊢ Even 0
⊢ Even 1
⊢ Even 1
⊢ Even 0
```

第一个和最后一个目标很烦人，因为它们对应于定理 `Even.zero`。我们可以在应用 `Even.add_two` 失败时尝试应用 `Even.zero` 来证明它们。这可以通过以下方式实现：

```lean
theorem repeat'_first_example :
    Even 4 ∧ Even 7 ∧ Even 3 ∧ Even 0 :=
  by
    repeat' apply And.intro
    repeat'
      first
      | apply Even.add_two
      | apply Even.zero
    repeat' sorry
```

策略组合子 `first | tactic₁ | ⋯ | tacticₙ` 首先尝试执行其第一个参数 `tactic₁`。如果失败，则尝试 `tactic₂`，依此类推。如果所有指定的策略都失败，则整个组合子也会失败。在上面的示例中，我们还剩两个无法证明的目标：

```
⊢ Even 1
⊢ Even 1
```

下一个组合子 `all_goals tactic` 在每个目标上恰好调用一次策略。该组合子仅在 `tactic` 在**所有**目标上都成功时才成功。在下面的示例中它会失败，因为 `Even.add_two` 无法应用于目标 `⊢ Even 0`：

```lean
/-
theorem all_goals_example :
    Even 4 ∧ Even 7 ∧ Even 3 ∧ Even 0 :=
  by
    repeat' apply And.intro
    all_goals apply Even.add_two   -- fails
    repeat' sorry
-/
```

为了忽略 `tactic` 的失败，我们可以将其包装在 `try` 组合子中：

```lean
theorem all_goals_try_example :
    Even 4 ∧ Even 7 ∧ Even 3 ∧ Even 0 :=
  by
    repeat' apply And.intro
    all_goals try apply Even.add_two
    repeat sorry
```

结果状态为

```
⊢ Even 2
⊢ Even 5
⊢ Even 1
⊢ Even 0
```

结构 `try tactic` 等价于 `first | tactic | skip`，其中 `skip` 是一个不做任何事情就成功的策略。因此 `try tactic` 总是成功。一个相关的策略是 `done`：如果没有剩余目标则成功，否则失败。

另一个变体是 `any_goals tactic` 组合子。它尝试在每个目标上调用一次 `tactic`，但与 `all_goals` 不同，只要 `tactic` 在**任何**目标上成功，它就会成功：

```lean
theorem any_goals_example :
    Even 4 ∧ Even 7 ∧ Even 3 ∧ Even 0 :=
  by
    repeat' apply And.intro
    any_goals apply Even.add_two
    repeat' sorry
```

结果状态为

```
⊢ Even 2
⊢ Even 5
⊢ Even 1
⊢ Even 0
```

这与前一个示例中的状态相同。通常，区别在于 `any_goals tactic` 可能会失败，而 `all_goals try tactic` 总是成功。

有时我们希望除非能完全证明一个目标，否则不去管它。组合子 `solve | tactic₁ | ⋯ | tacticₙ` 首先尝试执行其第一个参数 `tactic₁`。如果这未能证明目标，则尝试 `tactic₂`，依此类推。如果所有指定的策略都未能证明目标，则整个组合子失败。（将此行为与 `first | tactic₁ | ⋯ | tacticₙ` 的行为进行比较，后者只要求指定的策略之一成功，而不要求证明目标。）考虑这个示例：

```lean
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
    repeat' sorry
```

第一个和第四个目标已被证明，剩下的两个无法证明的目标与定理陈述中的完全一致：

```
⊢ Even 7
⊢ Even 3
```

请注意，`repeat'` 组合子可能会导致无限循环。考虑这个示例：

```lean
/-
-- loops
theorem repeat'_Not_example :
    ¬ Even 1 :=
  by repeat' apply Not.intro
-/
```

`Not.intro` 规则是 `(?a → False) → ¬ ?a`，因此它应用一次将目标转换为 `⊢ Even 1 → False`。由于 `¬ ?a` 被定义为 `?a → False`，该规则再次应用，再次产生相同的目标。该策略会发生死循环。

最后，「**继而**」（and then）运算符 `<;>` 可用于连接两个策略。左侧在第一个目标上执行。右侧在产生的每个子目标上执行（但不在原始的第二个、第三个等目标上执行）。因此，我们可以这样写

```lean
by
  induction n <;>
  aesop
```

而非更冗长的版本

```lean
by
  induction n with
  | zero     => aesop
  | succ n' ih => aesop
```

## 8.2 宏

让我们通过将自定义策略编码为**宏**（macro），来进行一些实际的元编程。该策略体现了我们在上面的 `solve` 示例中硬编码的行为：

```lean
macro "intro_and_even" : tactic =>
  `(tactic|
      (repeat' apply And.intro
       any_goals
         solve
         | repeat'
             first
             | apply Even.add_two
             | apply Even.zero))
```

第一行将 `intro_and_even` 声明为属于 `tactic` **语法范畴**（syntactic category）的宏。在其余行中，`'(tactic| tactic)` 结构将指定的策略 `tactic` 嵌入到宏中。策略本身是使用标准语法指定的。

一旦我们定义了自定义策略，就可以在证明中调用它：

```lean
theorem intro_and_even_example :
    Even 4 ∧ Even 7 ∧ Even 3 ∧ Even 0 :=
  by
    intro_and_even
    repeat' sorry
```

这会产生子目标

```
⊢ Even 7
⊢ Even 3
```

## 8.3 元编程单子

宏是一种可用于编写简单证明自动化的机制。然而，对于大多数元编程任务，我们需要使用元编程单子：`MetaM` 和 `TacticM`。

`MetaM` 是底层的元编程单子。`TacticM` 在 `MetaM` 的基础上扩展了目标管理。`MetaM` 结合了几种单子的属性：

- 它是一个**状态单子**（state monad），提供对全局语境（包括所有定义和归纳类型）、记法和属性（例如 `@[simp]` 定理列表）等的访问。`TacticM` 额外提供对目标列表的访问。
- 它的行为类似于**选项单子**（option monad）。元程序 `failure` 表示策略已失败。
- 它支持**追踪**（tracing），因此我们可以使用 `logInfo` 来显示消息。
- 它支持指令式结构，例如 `for`–`in` 循环、`continue` 语句和 `return` 语句。

`TacticM` 还允许我们运行 Lean 来填充表达式中的隐式 `{ }` 和类型类 `[ ]` 参数、展开宏等等。

在 Lean 内部，每个目标都表示为一个**元变量**（metavariable）`?m`，代表一个缺失的项（通常是一个证明项）。每个元变量都有一个类型（通常是一个命题）和一个局部语境，指定了可以用来证明与该元变量相关联的目标的变量和假设。

让我们通过定义一个利用 `TacticM` 追踪功能的策略，来实际使用一下 `TacticM`。该策略将显示 Lean 版本号、目标列表以及第一个目标的目的（Lean 称之为**主目标**（main goal））：

```lean
def traceGoals : TacticM Unit :=
  do
    logInfo m!"Lean version {Lean.versionString}"
    logInfo "All goals:"
    let goals ← getUnsolvedGoals
    logInfo m!"{goals}"
    match goals with
    | []     => return
    | _ :: _ =>
      logInfo "First goal's target:"
      let target ← getMainTarget
      logInfo m!"{target}"

elab "trace_goals" : tactic =>
  traceGoals
```

这段代码有许多有趣的特性：

- 第一行声明了一个类型为 `TacticM Unit` 的函数 `traceGoals`——这是返回 `Unit`（一个基数为 1 的平凡类型）的策略类型。注意，元编程函数的定义使用了与任何 Lean 函数相同的语法。
- 第二行进入了单子。其余行是访问 Lean 内部结构的带作用的操作。
- `m!"…"` 语法指定了一个字符串，其中每个出现的 `{term}`（其中 `term` 是一个 Lean 项）都会被求值并序列化为字符串。例如，如果 `Lean.versionString` 是 `"v4.24.0"`，那么 `m!"Lean version {Lean.versionString}"` 会求值为字符串 `"Lean version v4.24.0"`。
- 最后两行使用 `elab` 命令，告诉 Lean 的解析器将字符串 `"trace_goals"` 识别为一个策略。当 Lean 遇到这个策略时，它会运行 `elab` 命令主体中的元程序——在这里是 `traceGoals`。（当我们之前使用更高层级的 `macro` 命令时，`elab` 是在底层被调用的。）

下面是一个展示如何使用新策略的示例：

```lean
theorem Even_18_and_Even_20 (α : Type) (a : α) :
    Even 18 ∧ Even 20 :=
  by
    apply And.intro
    trace_goals
    intro_and_even
```

将鼠标悬停在 `trace_goals` 上，可见输出如下：

```
Lean version v4.24.0
All goals:
[case left
 α : Type
 a : α
 ⊢ Even 18
 ,
 case right
 α : Type
 a : α
 ⊢ Even 20]
First goal's target:
Even 18
```

虽然 Lean 使用熟悉的 `Γ ⊢ P` 语法显示目标，但它们实际上是元变量。上述程序中使用的常量具有以下类型：

```
logInfo : MessageData → TacticM Unit
getUnsolvedGoals : TacticM (List MVarId)
getMainTarget : TacticM Expr
```

其中 `MessageData` 代表消息，`MVarId` 代表元变量标识符，而 `Expr` 代表项。

## 8.4 第一个示例：一个 Assumption 策略

我们的第一个较大的示例实现了一个 `hypothesis` 策略，它像预定义的 `assumption` 策略一样，寻找正确类型（即正确的命题）的假设，并应用它来证明目标：

```lean
def hypothesis : TacticM Unit :=
  withMainContext
    (do
       let target ← getMainTarget
       let lctx ← getLCtx
       for ldecl in lctx do
         if ! LocalDecl.isImplementationDetail ldecl then
           let eq ← isDefEq (LocalDecl.type ldecl) target
           if eq then
             let goal ← getMainGoal
             MVarId.assign goal (LocalDecl.toExpr ldecl)
             return
       failure)

elab "hypothesis" : tactic =>
  hypothesis
```

在 `hypothesis` 函数中，我们首先提取第一个目标的目的和局部语境。为了确保 `getLCtx` 给出的是当前第一个目标的局部语境，我们将整个 `do` 块传递给 `withMainContext` 函数。通常，任何 `TacticM` 计算都是在环境局部语境中执行的，该语境为表达式中出现的自由变量赋予了意义。`withMainContext` 函数将此局部语境设置为当前第一个目标的局部语境。

在 `do` 块内部，我们使用方便的单子结构 `for`–`in` 遍历局部语境中的所有声明。对于每个不是所谓「实现细节」（即 Lean 插入的对用户不可见的假设）的局部变量或假设 `h`，我们检查其类型（通常是其命题）在计算和元变量实例化后是否等于目标。如果是，我们获取与第一个目标关联的元变量，并将 `h` 分配给它，从而证明该目标。最后，我们 `return`。

由于目标由元变量表示，将一个项分配给元变量 `?m` 是 Lean 证明目标的底层方式。该项中出现的新元变量对应于必须证明的新子目标。

下面是 `hypothesis` 的一个简单调用：

```lean
theorem hypothesis_example {α : Type} {p : α → Prop} {a : α}
      (hpa : p a) :
    p a :=
  by hypothesis
```

如果我们添加追踪，那么可以看到在找到匹配的假设 `hpa` 并成功应用之前，会依次尝试 `α`、`p` 和 `a`。

该示例使用了以下新常量：

```
getLCtx : TacticM LocalContext
LocalDecl.isImplementationDetail : LocalDecl → Bool
isDefEq : Expr → Expr → TacticM Bool
LocalDecl.type : LocalDecl → Expr
getMainGoal : TacticM MVarId
MVarId.assign : MVarId → Expr → TacticM Unit
LocalDecl.toExpr : LocalDecl → Expr
failure {α : Type} : TacticM α
```

## 8.5 表达式

元编程框架围绕着**表达式**（expression）或**项**（term）的类型 `Expr` 展开。表达式的一个重要组成部分是类型为 `Name` 的**名称**（name）。我们从它们开始。

### 8.5.1 名称

名称可以使用单反引号指定。例如 `` `x `` 代表名称 `x`，它可以赋予变量或常量。在引用常量时，我们必须指定包括命名空间在内的完整名称；因此，要引用[第 6 章](ch06_InductivePredicates.md#611-偶数)中的 `Even` 谓词，我们必须编写 `` `LoVe.Even ``，而非 `` `Even ``。

如果我们想引用一个现有的常量，Lean 提供了双反引号语法，它使用 Lean 通常的**名称阐释**（elaboration）规则查找名称，并将其扩展为完整名称。因此 `` ``Even `` 和 `` ``LoVe.Even `` 都指向名称 `LoVe.Even`；若编写未声明的名称（如 `` ``EvenIf ``），Lean 会报错。

```lean
#check `x
#eval `x
#eval `Even          -- wrong
#eval `LoVe.Even     -- suboptimal
#eval ``Even
-- #eval ``EvenThough   -- fails
```

### 8.5.2 `Expr` 的定义

类型 `Expr` 的定义如下：

```lean
inductive Expr : Type where
  | const   : Name → List Level → Expr
  | sort    : Level → Expr
  | fvar    : FVarId → Expr
  | mvar    : MVarId → Expr
  | app     : Expr → Expr → Expr
  | lam     : Name → Expr → Expr → BinderInfo → Expr
  | bvar    : Nat → Expr
  | forallE : Name → Expr → Expr → BinderInfo → Expr
  | letE    : Name → Expr → Expr → Expr → Bool → Expr
  | lit     : Literal → Expr
  | mdata   : MData → Expr → Expr
  | proj    : Name → Nat → Expr → Expr
```

### 8.5.3 常量

`Expr.const name levels` 代表名为 `name` 的常量，例如 `Nat.add` 或 `ℕ`。`levels` 参数代表**宇宙层级**（universe levels），这一概念将在[第 12 章](ch12_LogicalFoundations.md)中进行解释。例如，`Expr.const ``Nat.add []` 代表 `Nat.add`，而 `Expr.const ``Nat []` 代表 `Nat`（即 `ℕ`）。

```lean
#check Expr.const
#eval ppExpr (Expr.const ``Nat.add [])
#eval ppExpr (Expr.const ``Nat [])
```

### 8.5.4 类型（Sorts）

`Expr.sort level` 用于表示类型的类型。例如，`Expr.sort Level.zero` 代表 `Prop`，而 `Expr.sort (Level.succ Level.zero)` 代表 `Type`。

```lean
#check Expr.sort
#eval ppExpr (Expr.sort Level.zero)
#eval ppExpr (Expr.sort (Level.succ Level.zero))
```

### 8.5.5 自由变量

`Expr.fvar id` 代表局部语境中的自由变量（例如 `a`、`h`）。`id` 参数是该变量的唯一标识符。

```lean
#check Expr.fvar
#check FVarId.mk `n
#eval ppExpr (Expr.fvar (FVarId.mk `n))
```

### 8.5.6 元变量

`Expr.mvar id` 代表元变量，即带问号的变量 `?m`。`id` 参数是该元变量的唯一标识符。

```lean
#check Expr.mvar
```

### 8.5.7 应用

`Expr.app t u` 代表函数 `t` 应用于参数 `u`。例如，`Expr.app (Expr.const ``Nat.succ []) (Expr.const ``Nat.zero [])` 代表 `Nat.succ Nat.zero`。

```lean
#check Expr.app
#eval ppExpr (Expr.app (Expr.const ``Nat.succ [])
  (Expr.const ``Nat.zero []))
```

### 8.5.8 匿名函数与绑定变量

`Expr.lam name σ t bi` 代表匿名函数（或 λ-表达式）。`name` 参数是绑定变量的名称，`σ` 参数是绑定变量的类型，`t` 参数是函数体，而 `bi` 参数存储该变量是显式 `( )`、隐式 `{ }` 还是类型类 `[ ]` 参数。

`Expr.bvar i` 代表绑定变量，使用的是一种被称为 **De Bruijn 索引**（De Bruijn index）的记法。`Expr.bvar 0` 指代由最近的**绑定子**（binder）绑定的变量，`Expr.bvar 1` 指代由第二近的绑定子绑定的变量，依此类推。

因此，`Expr.lam `x (Expr.const ``Nat []) (Expr.bvar 0) BinderInfo.default` 代表 `fun x : ℕ ↦ x`，而

```lean
Expr.lam `x (Expr.const ``Nat [])
  (Expr.lam `y (Expr.const ``Nat []) (Expr.bvar 1)
     BinderInfo.default)
  BinderInfo.default
```

代表 `fun x y : ℕ ↦ x`。

```lean
#check Expr.bvar
#check Expr.lam
#eval ppExpr (Expr.bvar 0)
#eval ppExpr (Expr.lam `x (Expr.const ``Nat []) (Expr.bvar 0)
  BinderInfo.default)
#eval ppExpr (Expr.lam `x (Expr.const ``Nat [])
  (Expr.lam `y (Expr.const ``Nat []) (Expr.bvar 1)
     BinderInfo.default)
  BinderInfo.default)
```

### 8.5.9 依值函数类型

`Expr.forallE name σ τ bi` 代表可能**依值**（dependent）的函数类型。`name` 参数是绑定变量的名称，`σ` 参数是定义域类型，`τ` 参数是结果类型，而 `bi` 与上述 `Expr.lam` 相同。例如，`Expr.forallE `n (Expr.const ``Nat []) (Expr.app (Expr.const ``Even []) (Expr.bvar 0)) BinderInfo.default` 代表 `(n : ℕ) → Even n`（也写成 `∀n : ℕ, Even n`），而 `Expr.forallE `dummy (Expr.const `Nat []) (Expr.const `Bool []) BinderInfo.default` 代表 `ℕ → Bool`。

```lean
#check Expr.forallE
#eval ppExpr (Expr.forallE `n (Expr.const ``Nat [])
  (Expr.app (Expr.const ``Even []) (Expr.bvar 0))
  BinderInfo.default)
#eval ppExpr (Expr.forallE `dummy (Expr.const `Nat [])
  (Expr.const `Bool []) BinderInfo.default)
```

### 8.5.10 其他构造子

其余构造子包括 `Expr.letE`（`let` 绑定）、`Expr.lit`（字面量）、`Expr.mdata`（元数据）和 `Expr.proj`（投影）。

```lean
#check Expr.letE
#check Expr.lit
#check Expr.mdata
#check Expr.proj
```

## 8.6 第二个示例：一个合取式分解策略

在本节中，我们定义另一个完成明确任务的策略。该策略被称为 `destruct_and`，它自动消除前提中的合取式。我们的目标是使如下证明自动化：

```lean
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
```

在每种情况下，我们都希望只需编写 `by destruct_and h` 作为证明。

我们的策略依赖于一个辅助函数，该函数以证明项 `hP`（最初是假设 `h`）作为参数，我们从中提取**合取项**（conjunct）：

```lean
partial def destructAndExpr (hP : Expr) : TacticM Bool :=
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
         | Option.none        => return false
         | Option.some (Q, R) =>
           let hQ ← mkAppM ``And.left #[hP]
           let success ← destructAndExpr hQ
           if success then
             return true
           else
             let hR ← mkAppM ``And.right #[hP]
             destructAndExpr hR)
```

与 `hypothesis` 一样，我们将整个 `do` 块传递给 `withMainContext` 函数。这确保了 `inferType` 和 `isDefEq` 在正确的局部语境中运行。

在 `do` 块内部，我们首先提取第一个目标的目的和 `hP` 的类型（通常是其命题）`P`。如果它们在计算和元变量实例化后相等，我们就通过分配其元变量来关闭目标，就像我们在 `hypothesis` 示例中所做的那样，并返回 `true` 表示成功。否则，我们检查 `hP` 的命题是否具有 `Q ∧ R` 的形式。如果是，我们使用证明项 `hQ := And.left hP`（它是 `Q` 的证明）递归调用辅助函数。如果成功，则完成；否则，我们尝试证明项 `hR := And.right hP`（它是 `R` 的证明）。

注意函数定义开始处的关键字 `partial`。这里需要它是因为 Lean 无法证明该函数总是终止。由于该函数仅用作元程序，而不是在命题内部，因此终止是可选的，我们可以通过指定 `partial` 来禁用终止检查。

同样值得注意的是 `mkAppM` 函数，它用于构造常量对参数数组的**柯里化**（curried）应用。数组类似于列表，但书写时带有前缀符号 `#`（例如 `#[1, 2, 3]`）。使用 `mkAppM` 比多次应用 `Expr.app` 构造子更方便。此外，`mkAppM` 允许我们省略隐式参数（例如命题 `Q` 和 `R`），否则我们必须将它们作为参数提供给 `And.left` 和 `And.right`。

主函数剩下的工作很少了：

```lean
def destructAnd (name : Name) : TacticM Unit :=
  withMainContext
    (do
       let h ← getFVarFromUserName name
       let success ← destructAndExpr h
       if ! success then
         failure)

elab "destruct_and" h:ident : tactic =>
  destructAnd (getId h)
```

该函数使用 `getFVarFromUserName` 获取假设 `h`，并调用辅助函数。如果辅助函数返回 `false`，则策略失败。

我们现在可以在这些动机性示例中使用我们的新工具了：

```lean
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
```

`destruct_and` 并非万能。例如，以下证明会失败：

```lean
/-
theorem abc_ac (a b c : Prop) (h : a ∧ b ∧ c) :
    a ∧ c :=
  by destruct_and h   -- fails
-/
```

上述元程序中使用了以下新常量：

```
inferType : Expr → TacticM Expr
Expr.and? : Expr → Option (Expr × Expr)
mkAppM : Name → Array Expr → TacticM Expr
getFVarFromUserName : Name → TacticM Expr
```

## 8.7 第三个示例：一个直接证明查找器

有时我们陈述了一个定理，证明了它，后来才意识到该定理已经存在。这可以通过使用 `prove_direct` 来防止，该策略会遍历所有可用的定理，并检查其中是否有一个可以证明当前目标。我们将分步审阅其代码。

第一步是一个函数 `isTheorem`，如果声明是公理或定理，它返回 `true`，否则返回 `false`：

```lean
def isTheorem : ConstantInfo → Bool
  | ConstantInfo.axiomInfo _ => true
  | ConstantInfo.thmInfo _   => true
  | _                        => false
```

我们将使用此函数来过滤掉我们不感兴趣的声明。

下一个函数将名为 `name` 的定理应用于当前目标：

```lean
def applyConstant (name : Name) : TacticM Unit :=
  do
    let cst ← mkConstWithFreshMVarLevels name
    liftMetaTactic (fun goal ↦ MVarId.apply goal cst)
```

给定一个名称，`mkConstWithFreshMVarLevels` 函数创建一个代表该常量的表达式 `cst`。函数名称中提到的「全新元变量层级」将在[第 12 章](ch12_LogicalFoundations.md)中变得更加清晰。`MVarId.apply`（不要与 `MVarId.assign` 混淆）然后将该常量应用于当前目标，设置 `?m := cst ?m₁ … ?mₙ`，并返回代表 `cst` 前提的全新元变量 `?mⱼ`。

`liftMetaTactic` 函数检索第一个目标的标识符，在底层 `MetaM` 单子中对该目标运行给定的函数，并将该目标替换为函数返回的子目标。

下一个函数实现了一个其行为类似于 `<;>` 但可以从元程序中使用的组合子：

```lean
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
        setGoals [subgoal]
        tac₂
        let subgoals₂ ← getUnsolvedGoals
        newGoals := newGoals ++ subgoals₂
    setGoals (newGoals ++ List.tail origGoals)
```

`TacticM` 单子跟踪当前要证明的目标。我们可以使用 `getGoals` 获取列表，并使用 `setGoals` 设置列表。如果我们希望策略暂时专注于特定的子目标，设置子目标列表是非常有用的。

在这里，我们首先专注于第一个目标（`setGoals [mainGoal]`）并调用第一个策略。对于产生的每个子目标，我们专注于它（`setGoals [subgoal]`）并调用第二个策略。从第二个策略产生的所有未解决的**子子目标**（subsubgoal）都收集在可变变量 `newGoals` 中。由于证明一个目标有时会实例化另一个元变量，我们在每次迭代中检查当前子目标的元变量是否已被分配，如果是，则跳过该子目标。最后，我们更新目标以包含所有待处理的目标：`newGoals` 中的目标，以及 `origGoals` 中除第一个目标外所有我们尚未考虑的目标。

通常，在策略结束时，我们应该确保目标列表由所有待证明的目标组成。否则，我们可能会遇到一些令人费解的错误，例如 `declaration has metavariables`。

我们还需要一个策略，它尝试使用由其名称指定的定理来证明目标，并调用 `hypothesis` 来证明任何产生的子目标：

```lean
def proveUsingTheorem (name : Name) : TacticM Unit :=
  andThenOnSubgoals (applyConstant name) hypothesis
```

这在程序上等同于 `apply name <;> hypothesis`。

最后，我们准备好审阅主函数了：

```lean
def proveDirect : TacticM Unit :=
  do
    let origGoals ← getUnsolvedGoals
    let goal ← getMainGoal
    setGoals [goal]
    let env ← getEnv
    for (name, info)
        in SMap.toList (Environment.constants env) do
      if isTheorem info && ! ConstantInfo.isUnsafe info then
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
```

我们专注于第一个目标，然后遍历环境中声明的所有常量。如果该常量是一个定理，并且不是「unsafe」（一个与我们的不安全规则和策略概念无关的 Lean 概念），我们尝试使用我们的辅助函数 `proveUsingTheorem` 来应用它。如果成功，就打印 `Proved directly by name`，其中 `name` 是该定理的名称，然后返回。如果失败，就继续遍历。如果整个遍历都结束了，就报告失败。

下面是该策略的实际应用：

```lean
theorem Nat.symm (x y : ℕ) (h : x = y) :
    y = x :=
  by prove_direct

theorem Nat.symm_manual (x y : ℕ) (h : x = y) :
    y = x :=
  by
    apply symm
    hypothesis

theorem Nat.trans (x y z : ℕ) (hxy : x = y) (hyz : y = z) :
    x = z :=
  by prove_direct

theorem List.reverse_twice (xs : List ℕ) :
    List.reverse (List.reverse xs) = xs :=
  by prove_direct
```

`prove_direct` 在 `Nat.symm` 上会打印 `Proved directly by symm`。该消息很有帮助，因为我们可以直接应用指定的定理，而无需依赖相对较慢的 `prove_direct` 策略。具体来说，我们可以结合 `hypothesis` 来应用定理 `symm`，如上方的 `Nat.symm_manual` 所示。

在 mathlib 中也有一个类似的策略，名为 `apply?`。例如：

```lean
theorem List.reverse_twice_apply? (xs : List ℕ) :
    List.reverse (List.reverse xs) = xs :=
  by apply?
```

成功时，`apply?` 会建议一种形式为 `exact …` 的策略调用，该调用可以插入到形式化中。

以下是本示例中出现的新常量列表：

```
mkConstWithFreshMVarLevels : Name → TacticM Expr
liftMetaTactic : (MVarId → MetaM (List MVarId)) → TacticM Unit
MVarId.apply : MVarId → Expr → MetaM (List MVarId)
getGoals : TacticM (List MVarId)
setGoals : List MVarId → TacticM Unit
MVarId.isAssigned : MVarId → Bool
getEnv : TacticM Environment
SMap.toList : ConstMap → List (Name × ConstantInfo)
Environment.constants : Environment → ConstMap
ConstantInfo.isUnsafe : ConstantInfo → Bool
```

## 8.8 杂项策略

虽然本章的重点是开发新策略，但我们也遇到了三个预定义的策略。

**`skip`**：`skip` 策略在不执行任何操作的情况下成功。在我们开发自定义策略时，它有时可用作构建基块。

**`done`**：如果还有一些剩余目标，`done` 策略会产生失败；否则，它在不执行任何操作的情况下成功。与 `skip` 一样，它可以用作构建基块。

**`apply?`**：`apply?` 策略在加载的库中搜索能够精确证明目标的定理。成功时，它会建议一种形式为 `exact …` 的策略调用，该调用可以插入到形式化中。

## 8.9 新引入的 Lean 结构总结

**声明**

| 名称 | 含义 |
|------|------|
| `partial` | 作为可能不终止的元程序声明的前缀 |

**引号**

| 记法 | 含义 |
|------|------|
| `` `n `` | 引用一个字面名称 |
| `` ``n `` | 引用一个经过阐释和检查的字面名称 |

**策略**

| 策略 | 含义 |
|------|------|
| `apply?` | 搜索能够证明当前目标的定理 |
| `done` | 如果还有目标剩余，则失败 |
| `skip` | 不执行任何操作 |

**策略组合子**

| 组合子 | 含义 |
|--------|------|
| `<;>` | 在第一策略产生的所有子目标上调用第二策略 |
| `all_goals` | 在每个目标上调用一次策略，并期望全部成功 |
| `any_goals` | 在每个目标上调用一次策略，并期望至少一个成功 |
| `first \| ⋯ \| ⋯` | 依次尝试这些策略，直到其中一个成功为止 |
| `repeat'` | 在所有目标和子目标上重复调用策略，直到失败为止 |
| `solve \| ⋯ \| ⋯` | 尝试通过依次尝试这些策略来完全证明当前目标 |
| `try` | 尝试调用一个策略；如果失败，则不执行任何操作 |