# 繁饰

繁饰器（Elaborator）是负责将面向用户的 `Syntax` 转换为编译器可以处理的内容的组件。大多数情况下，这意味着将 `Syntax` 转换为 `Expr`，但也有其他用例，例如 `#check` 或 `#eval`。因此，繁饰器是一大块代码，代码位于[这里](https://github.com/leanprover/lean4/blob/master/src/Lean/Elab)。

## 繁饰命令

命令（Command）是最高层级的 `Syntax`，一个 Lean 文件由一系列命令组成。最常用的命令是声明，例如：
- `def`
- `inductive`
- `structure`

但也有其他命令，最著名的是 `#check`、`#eval` 等。所有命令都属于 `command` 语法类别，因此要声明自定义命令，必须在该类别中注册其语法。

### 为命令赋予意义

下一步是为语法赋予语义。对于命令，这是通过注册一个所谓的命令繁饰器完成的。

命令繁饰器的类型是 `CommandElab`，或者说 `Syntax → CommandElabM Unit`。它们的作用是获取表示用户想要调用的命令的 `Syntax`，并在 `CommandElabM` 单子上产生某种副作用，毕竟返回值始终是 `Unit`。`CommandElabM` 单子有四种主要的副作用：
1. 通过 `Monad` 扩展 `MonadLog` 和 `AddMessageContext` 向用户记录消息，例如 `#check`。这是通过 `Lean.Elab.Log` 中的函数完成的，其中最著名的是：`logInfo`、`logWarning` 和 `logError`。
2. 通过 `Monad` 扩展 `MonadEnv` 与 `Environment` 交互。这里存储了编译器的所有相关信息，所有已知的声明、它们的类型、文档字符串、值等。当前环境可以通过 `getEnv` 获取，并在修改后通过 `setEnv` 设置。请注意，像 `addDecl` 这样的 `setEnv` 包装器通常是向 `Environment` 添加信息的正确方式。
3. 执行 `IO`，`CommandElabM` 能够运行任何 `IO` 操作。例如，从文件中读取内容并根据其内容执行声明。
4. 抛出错误，因为它可以运行任何类型的 `IO`，所以它自然可以通过 `throwError` 抛出错误。

此外，`CommandElabM` 还支持其他一系列 `Monad` 扩展：
- `MonadRef` 和 `MonadQuotation` 用于像宏中的 `Syntax` 引用
- `MonadOptions` 用于与选项框架交互
- `MonadTrace` 用于调试跟踪信息
- TODO：还有一些其他的扩展，虽然不确定它们是否相关，可以参见 `Lean.Elab.Command` 中的实例。

### 命令繁饰

现在我们已经了解了命令繁饰器的类型，接下来简要看看繁饰过程是如何实际工作的：
1. 检查是否有任何宏可以应用于当前的 `Syntax`。如果有适用的宏，并且没有抛出错误，那么生成的 `Syntax` 将再次作为命令递归繁饰。
2. 如果没有可用的宏，我们将使用 `command_elab` 属性，搜索为我们正在繁饰的 `Syntax` 的 `SyntaxKind` 注册的所有 `CommandElab`。
3. 然后依次尝试所有这些 `CommandElab`，直到其中一个没有抛出 `unsupportedSyntaxException`，Lean 用这种方式表示繁饰器对这个特定的 `Syntax` 结构「负有责任」。请注意，它仍然可以抛出常规错误，以向用户表明某些地方出了问题。如果没有找到负责的繁饰器，那么命令繁饰将以 `unexpected syntax` 错误消息终止。

如你所见，这个过程背后的总体思路与普通宏扩展非常相似。

### 创建我们自己的命令

现在我们已经知道什么是 `CommandElab` 以及它们的使用方式，我们可以开始编写自己的命令了。正如我们上面所学的，步骤如下：
1. 声明语法
2. 声明繁饰器
3. 通过 `command_elab` 属性要求繁饰器负责该语法。

例子：

```lean
import Lean
```

```lean
open Lean Elab Command Term Meta
```

```lean
syntax (name := mycommand1) "#mycommand1" : command -- 声明语法
```

```lean
@[command_elab mycommand1]
```

```lean
def mycommand1Impl : CommandElab := fun stx => do -- 声明并注册繁饰器
```

```lean
logInfo "Hello World"
```

```lean
#mycommand1 -- Hello World
```

```lean
/-!
你可能认为这有点模板化，Lean 的开发者们也这么认为，所以他们为此添加了一个宏！
-/
```

```lean
elab "#mycommand2" : command =>
```

```lean
logInfo "Hello World"
```

```lean
#mycommand2 -- Hello World
```

```lean
/-!
注意，由于命令繁饰支持为相同语法注册多个繁饰器，我们实际上可以在需要时重载语法。
-/
```

```lean
@[command_elab mycommand1]
```

```lean
def myNewImpl : CommandElab := fun stx => do
```

```lean
logInfo "new!"
```

```lean
#mycommand1 -- new!
```

```lean
/-!
此外，也可以仅重载部分语法，在我们希望默认处理器处理的情况下抛出 `unsupportedSyntaxException`，或者让 `elab` 命令处理它。
-/
```

```lean
/-
在以下示例中，我们并没有扩展原始的 `#check` 语法，而是为这个特定的语法结构添加了一个新的 `SyntaxKind`。不过，从用户的角度来看，效果基本相同。
-/
```

```lean
elab "#check" "mycheck" : command => do
```

```lean
logInfo "Got ya!"
```

```lean
/-
这实际上是扩展了原始的 `#check`
-/
```

```lean
@[command_elab Lean.Parser.Command.check] def mySpecialCheck : CommandElab := fun stx => do
```

```lean
if let some str := stx[1].isStrLit? then
```

```lean
logInfo s!"Specially elaborated string literal!: {str} : String"
```

```lean
else
```

```lean
throwUnsupportedSyntax
```

```lean
#check mycheck -- Got ya!
```

```lean
#check "Hello" -- Specially elaborated string literal!: Hello : String
```

```lean
#check Nat.add -- Nat.add : Nat → Nat → Nat
```

```lean
/-!
### 项目示例

作为本节的最终迷你项目，让我们构建一个实用的命令繁饰器。它将接受一个命令，并使用与 `elabCommand`（命令繁饰的入口点）相同的机制，告诉我们哪些宏或繁饰器与我们给出的命令相关。

不过，我们不会费力去真正重新实现 `elabCommand`。
-/
```

```lean
elab "#findCElab " c:command : command => do
```

```lean
let macroRes ← liftMacroM <| expandMacroImpl? (←getEnv) c
```

```lean
match macroRes with
```

```lean
| some (name, _) => logInfo s!"下一步是一个宏: {name.toString}"
```

```lean
| none =>
```

```lean
let kind := c.raw.getKind
```

```lean
let elabs := commandElabAttribute.getEntries (←getEnv) kind
```

```lean
match elabs with
```

```lean
| [] => logInfo s!"没有繁饰器可以处理你的语法"
```

```lean
| _ => logInfo s!"你的语法也许可以被以下繁饰器处理: {elabs.map (fun el => el.declName.toString)}"
```

```lean
#findCElab def lala := 12 -- 你的语法也许可以被以下繁饰器处理:  [Lean.Elab.Command.elabDeclaration]
```

```lean
#findCElab abbrev lolo := 12 -- 你的语法也许可以被以下繁饰器处理:  [Lean.Elab.Command.elabDeclaration]
```

```lean
#findCElab #check foo -- 甚至你自己的语法！: 你的语法也许可以被以下繁饰器处理:  [mySpecialCheck, Lean.Elab.Command.elabCheck]
```

```lean
#findCElab open Hi -- 你的语法也许可以被以下繁饰器处理:  [Lean.Elab.Command.elabOpen]
```

```lean
#findCElab namespace Foo -- 你的语法也许可以被以下繁饰器处理:  [Lean.Elab.Command.elabNamespace]
```

```lean
#findCElab #findCElab open Bar -- 甚至它自己！: 你的语法也许可以被以下繁饰器处理:  [«_aux_lean_elaboration___elabRules_command#findCElab__1»]
```

```lean
/-!
TODO：也许我们还应该添加一个小型项目来演示非 `#` 风格的命令，即声明类命令，尽管目前没有想到什么。
TODO：定义一个 `conjecture` 声明，类似于 `lemma/theorem`，不同之处在于它会自动补充 `sorry`。该 `sorry` 可以是一个自定义的，以反映 `conjecture` 可能被期望为真。
-/
```

```lean
/-!
## 项繁饰

一个项（term）是一个表示某种 `Expr` 的 `Syntax` 对象。项繁饰器是处理我们编写的大部分代码的核心。尤其是，它们负责繁饰定义的值、类型（因为这些也只是 `Expr`）等。

所有的项都属于 `term` 语法类别（我们在宏章节中已经看到它的作用）。因此，要声明自定义的项，它们的语法需要在该类别中注册。

### 为项赋予意义

与命令繁饰一样，下一步是为语法赋予语义。对于项，这是通过注册一个所谓的项繁饰器完成的。

项繁饰器的类型是 `TermElab`，或者说 `Syntax → Option Expr → TermElabM Expr`：
- 与命令繁饰一样，`Syntax` 是用户用于创建此项的内容
- `Option Expr` 是该项的预期类型，由于这一点不总是已知，所以它只是一个 `Option` 参数
- 不同于命令繁饰，项繁饰不仅仅是因为其副作用而执行——`TermElabM Expr` 的返回值确实包含感兴趣的内容，即表示 `Syntax` 对象的 `Expr`。

`TermElabM` 在各个方面基本上都是 `CommandElabM` 的升级版：它支持我们之前提到的所有功能，再加上两项新功能。第一项非常简单：除了运行 `IO` 代码之外，它还可以运行 `MetaM` 代码，因此可以很好地构建 `Expr`。第二项功能非常专门，适用于项繁饰循环。

### 项繁饰

项繁饰的基本思想与命令繁饰相同：展开宏并递归调用，或者运行通过 `term_elab` 属性为 `Syntax` 注册的项繁饰器（它们可能会进一步运行项繁饰），直到我们完成。不过，项繁饰器在执行过程中可以执行一项特殊的操作。

项繁饰器可能会抛出 `Except.postpone`，表示它需要更多信息才能继续工作。为了表示这些缺失的信息，Lean 使用了所谓的合成元变量。正如你之前知道的，元变量是 `Expr` 中等待填补的空洞。合成元变量有所不同，它们具有特殊的方法来解决它们，这些方法注册在 `SyntheticMVarKind` 中。目前有四种：
- `typeClass`，元变量应通过类型类推导解决
- `coe`，元变量应通过类型转换（类型类的特殊情况）解决
- `tactic`，元变量是一个策略项，应该通过运行策略解决
- `postponed`，这些是在 `Except.postpone` 时创建的

一旦创建了这样的合成元变量，下一个更高层级的项繁饰器将继续执行。在某些时刻，延迟的元变量的执行将由项繁饰器恢复，希望它现在能够完成其执行。我们可以通过以下示例来观察它的运行：
-/
```

```lean
#check set_option trace.Elab.postpone true in List.foldr .add 0 [1,2,3] -- [Elab.postpone] .add : ?m.5695 → ?m.5696 → ?m.5696
```

```lean
/-!
这里发生的事情是，函数应用的繁饰器从 `List.foldr` 开始展开。`List.foldr` 是一个通用函数，因此它为隐式类型参数创建了元变量。然后，它尝试繁饰第一个参数 `.add`。

如果你不清楚 `.name` 的工作原理，基本想法是，Lean 通常可以推断出函数的输出类型（在这种情况下为 `Nat`，即 `Nat.add`）。在这种情况下，`.name` 特性会在 `Nat` 命名空间中查找一个名为 `name` 的函数。这在你希望使用某个类型的构造函数而不引用或打开其命名空间时特别有用，也可以像上面那样使用。

回到我们的例子，虽然此时 Lean 已经知道 `.add` 需要的类型是：`?m1 → ?m2 → ?m2`（其中 `?x` 表示元变量），但 `.add` 的繁饰器需要知道 `?m2` 的实际值，因此项繁饰器推迟执行（通过内部创建一个合成元变量代替 `.add`），然后其他两个参数的繁饰结果表明 `?m2` 必须是 `Nat`。一旦 `.add` 的繁饰器继续执行，它就可以利用这些信息完成繁饰。

我们也可以轻松引发无法正常工作的情况。例如：
-/
```

```lean
#check_failure set_option trace.Elab.postpone true in List.foldr .add
```

```lean
-- [Elab.postpone] .add : ?m.5808 → ?m.5809 → ?m.5809
```

```lean
-- 无效的点号标识符表示法，预期类型不符合形式 (... → C ...) 其中 C 是一个常量 ?m.5808 → ?m.5809 → ?m.5809
```

```lean
/-!
在这种情况下，`.add` 首先推迟了执行，随后再次被调用，但没有足够的信息完成繁饰，因此失败了。

### 创建我们自己的项繁饰器

添加新的项繁饰器的工作方式与添加新的命令繁饰器基本相同，因此我们只会简要地看一下：
-/
```

```lean
syntax (name := myterm1) "myterm_1" : term
```

```lean
def mytermValues := [1, 2]
```

```lean
@[term_elab myterm1]
```

```lean
def myTerm1Impl : TermElab := fun stx type? => do
```

```lean
mkAppM ``List.get! #[.const ``mytermValues [], mkNatLit 0] -- `MetaM` code
```

```lean
#eval myterm_1 -- 1
```

```lean
-- 用 `elab` 亦可
```

```lean
elab "myterm_2" : term => do
```

```lean
mkAppM ``List.get! #[.const ``mytermValues [], mkNatLit 1] -- `MetaM` code
```

```lean
#eval myterm_2 -- 2
```

```lean
/-!
### 项目示例

作为本章的最终小型项目，我们将重现 Lean 中最常用的语法糖之一，即 `⟨a, b, c⟩` 表示法，用作单构造器类型的简写：
-/
```

```lean
-- 使用稍微不同的表示法，以避免歧义
```

```lean
syntax (name := myanon) "⟨⟨" term,* "⟩⟩" : term
```

```lean
def getCtors (typ : Name) : MetaM (List Name) := do
```

```lean
let env ← getEnv
```

```lean
match env.find? typ with
```

```lean
| some (ConstantInfo.inductInfo val) =>
```

```lean
pure val.ctors
```

```lean
| _ => pure []
```

```lean
@[term_elab myanon]
```

```lean
def myanonImpl : TermElab := fun stx typ? => do
```

```lean
-- 如果类型未知或是元变量，尝试推迟执行。
```

```lean
-- 元变量被诸如函数繁饰器等用来填充隐式参数的值，
```

```lean
-- 当它们尚未获得足够的信息来确定这些值时。
```

```lean
-- 项繁饰器只能推迟执行一次，以避免陷入无限循环。
```

```lean
-- 因此，我们只尝试推迟执行，否则可能会导致错误。
```

```lean
tryPostponeIfNoneOrMVar typ?
```

```lean
-- 如果推迟后还没有找到类型，则报错
```

```lean
let some typ := typ? | throwError "expected type must be known"
```

```lean
if typ.isMVar then
```

```lean
throwError "expected type must be known"
```

```lean
let Expr.const base .. := typ.getAppFn | throwError s!"type is not of the expected form: {typ}"
```

```lean
let [ctor] ← getCtors base | throwError "type doesn't have exactly one constructor"
```

```lean
let args := TSyntaxArray.mk stx[1].getSepArgs
```

```lean
let stx ← `($(mkIdent ctor) $args*) -- syntax quotations
```

```lean
elabTerm stx typ -- call term elaboration recursively
```

```lean
#check (⟨⟨1, sorry⟩⟩ : Fin 12) -- { val := 1, isLt := (_ : 1 < 12) } : Fin 12
```

```lean
#check_failure ⟨⟨1, sorry⟩⟩ -- expected type must be known
```

```lean
#check_failure (⟨⟨0⟩⟩ : Nat) -- type doesn't have exactly one constructor
```

```lean
#check_failure (⟨⟨⟩⟩ : Nat → Nat) -- type is not of the expected form: Nat -> Nat
```

```lean
/-!
最后， 我们可以通过使用 `elab` 语法的额外语法糖来缩短推迟操作：
As a final note, we can shorten the postponing act by using an additional
syntax sugar of the `elab` syntax instead:
-/
```

```lean
-- 这个 `t` 语法将有效地执行 `myanonImpl` 的前两行
```

```lean
elab "⟨⟨" args:term,* "⟩⟩" : term <= t => do
```

```lean
sorry
```

```lean
/-!
## 练习

1. 考虑以下代码。使用 `elab` 重写 `syntax` + `@[term_elab hi]... : TermElab` 组合。

    ```lean
    syntax (name := hi) term " ♥ " " ♥ "? " ♥ "? : term

    @[term_elab hi]
    def heartElab : TermElab := fun stx tp =>
      match stx with
        | `($l:term ♥) => do
          let nExpr ← elabTermEnsuringType l (mkConst `Nat)
          return Expr.app (Expr.app (Expr.const `Nat.add []) nExpr) (mkNatLit 1)
        | `($l:term ♥♥) => do
          let nExpr ← elabTermEnsuringType l (mkConst `Nat)
          return Expr.app (Expr.app (Expr.const `Nat.add []) nExpr) (mkNatLit 2)
        | `($l:term ♥♥♥) => do
          let nExpr ← elabTermEnsuringType l (mkConst `Nat)
          return Expr.app (Expr.app (Expr.const `Nat.add []) nExpr) (mkNatLit 3)
        | _ =>
          throwUnsupportedSyntax
    ```

2. 以下是从真实的 mathlib 命令 `alias` 中提取的语法。

    ```
    syntax (name := our_alias) (docComment)? "our_alias " ident " ← " ident* : command
    ```

    我们希望 `alias hi ← hello yes` 输出 `←` 之后的标识符，也就是 "hello" 和 "yes"。

    请添加以下语义：

    **a)** 使用 `syntax` + `@[command_elab alias] def elabOurAlias : CommandElab`。
    **b)** 使用 `syntax` + `elab_rules`。
    **c)** 使用 `elab`。

3. 以下是从真实的 mathlib 策略 `nth_rewrite` 中提取的语法。

    ```lean
    open Parser.Tactic
    syntax (name := nthRewriteSeq) "nth_rewrite " (config)? num rwRuleSeq (ppSpace location)? : tactic
    ```

    我们希望 `nth_rewrite 5 [←add_zero a] at h` 在用户提供位置时输出 `"rewrite location!"`，如果用户没有提供位置，则输出 `"rewrite target!"`。

    请添加以下语义：

    **a)** 使用 `syntax` + `@[tactic nthRewrite] def elabNthRewrite : Lean.Elab.Tactic.Tactic`。
    **b)** 使用 `syntax` + `elab_rules`。
    **c)** 使用 `elab`。

-/
```
