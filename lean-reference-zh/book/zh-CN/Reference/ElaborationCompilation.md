# Elaboration 与编译

> 对应英文：[Elaboration and Compilation](https://lean-lang.org/doc/reference/latest/Elaboration-and-Compilation/)，抓取日期：2026-06-16。

粗略地说，Lean 处理源文件可以分为以下阶段。

## Parsing

parser 把字符序列转换成类型为 `Syntax` 的语法树。Lean 的 parser 是可扩展的，因此 `Syntax` 类型非常通用。

## Macro expansion

macro 是把语法糖替换为更基础语法的转换。macro expansion 的输入和输出类型都是 `Syntax`。

## Elaboration

elaboration 是把 Lean 面向用户的语法转换为核心类型论的过程。核心理论要简单得多，因此受信任的 kernel 可以非常小。elaboration 还会产生元数据，例如 proof state 或表达式类型；这些信息用于 Lean 的交互式功能，并存入旁表中。

## Kernel checking

Lean 的受信任 kernel 会检查 elaborator 的输出，确保它遵守类型论规则。

## Compilation

compiler 把 elaborated Lean code 转换成可运行的 executable。

## Lean pipeline 的实际顺序

现实中，上述阶段并不是严格一次性顺序执行。Lean 会解析一个 command（顶层声明），elaborate 它，并执行必要的 kernel check。macro expansion 是 elaboration 的一部分：在翻译某段语法之前，elaborator 会先展开最外层存在的 macro。更深层语法中仍可能保留 macro syntax；当 elaborator 递归到那些层时，它们才会展开。

Lean 有多种 elaboration。command elaboration 实现每个顶层 command 的效果，例如声明 inductive type、保存 definition、求值 expression。term elaboration 负责构造许多 command 中出现的 term，例如签名中的 type、definition 右侧，或待求值的 expression。tactic execution 是 term elaboration 的一种专门形式。

当一个 command 被 elaborated，Lean 的状态会发生变化。新的 definition 或 type 可能被保存以供后续使用；syntax 可能被扩展；无需显式限定即可引用的名称集合也可能改变。下一个 command 会在这个更新后的状态中解析和 elaboration，并继续更新后续 command 的状态。

## 2.1 Parsing

Lean 的 parser 是 recursive-descent parser，并使用基于 Pratt parsing 的动态表来处理 operator precedence 和 associativity。当 grammar 无歧义时，parser 不需要 backtracking；若 grammar 有歧义，则使用类似 Packrat parsing 的 memoization table，避免指数级膨胀。

parser 高度可扩展：用户可以在任意 command 中定义新语法，而这些语法会从下一个 command 开始可用。当前 section scope 中打开的 namespace 也会影响使用哪些 parsing rule，因为 parser extension 可以设置为只在某个 namespace 打开时生效。

遇到歧义时，Lean 选择最长匹配的 parse。如果没有唯一最长匹配，则把多个匹配 parse 都保存在 syntax tree 的 choice node 中，稍后由 elaborator 解决。parser 失败时会返回 `Syntax.missing` 节点，以便进行错误恢复。

parser 成功时，会保存足够信息以重构原始源文件。解析失败时，文件中无法解析区域的信息可能会缺失。`SourceInfo` record 记录某段语法的来源信息，包括源位置和周围空白。根据 `SourceInfo` 字段，`Syntax` 与源文件之间可能有三种关系：

- `SourceInfo.original`：该 syntax value 由 parser 直接产生。
- `SourceInfo.synthetic`：该 syntax value 由程序生成，例如由 macro expander 生成。synthetic syntax 仍可标记为 canonical；此时 Lean UI 会把它当作用户写下的语法。synthetic syntax 标注了原文件位置，但不包含前导或尾随空白。
- `SourceInfo.none`：与文件没有关系。

parser 维护一张 token table，跟踪当前语言中的 reserved word。定义新语法或打开 namespace 可能使原本合法的 identifier 变成 keyword。

Lean grammar 中每个 production 都有名字，称为它的 kind。这些 syntax kind 很重要，因为 elaborator 会用它们作为 key，到表中查找该语法的解释方式。

## 2.2 Macro expansion 与 elaboration

解析 command 后，下一步是 elaborate 它。elaboration 的准确含义取决于被 elaborated 的对象：elaborating a command 会改变 Lean 状态；elaborating a term 会得到 Lean 核心类型论中的 term。command 和 term 的 elaboration 都可能递归，因为 command combinator（例如 `in`）会包含 command，term 也可能包含其他 term。

command elaboration 和 term elaboration 的能力不同。command elaboration 可以对 environment 产生副作用，并能在 `IO` 中运行任意计算。Lean environment 包含从名称到 definition 的常规映射，以及 environment extension 中定义的附加数据；environment extension 用来跟踪 Lean 代码的大多数其他信息，例如 `simp` lemma、自定义 pretty printer，以及 compiler 的 intermediate representation 等内部信息。

command elaboration 还维护 message log，其中包含信息、警告和错误；维护 info trees，把元数据与原始语法关联起来，用于显示 proof state、identifier completion、文档提示等交互功能；维护调试 trace、打开的 section scope，以及与 macro expansion 相关的内部状态。term elaboration 可以修改除打开 scope 之外的所有这些字段。此外，它还能使用把 Lean 简洁友好语法转换为完全显式核心语言 term 所需的机制，包括 unification、type class instance synthesis 和 type checking。

term 和 command elaboration 的第一步都是 macro expansion。Lean 有一张表，把 syntax kind 映射到 macro implementation。macro implementation 是 monadic function，会把 macro syntax 转换成新 syntax。term、command、tactic 以及 Lean 中其他可由 macro 扩展的部分，都把 macro 保存在同一类表中并在同一类 monad 中执行。如果 macro 返回的 syntax 仍是 macro，则继续展开；这个过程持续到得到非 macro kind 的 syntax，或达到最大迭代次数并报错。

典型 macro 只处理语法的外层，把部分 subterm 留下。因此，即使顶层 macro expansion 完成，较深层 syntax 中仍可能有 macro invocation。定义新 macro 的细节在 Notations and Macros 章节中说明。

macro expansion 后，term 和 command elaborator 会查询表，把 syntax kind 映射到 elaboration procedure。term elaborator 接收 syntax 和可选 expected type，返回核心语言 expression；command elaborator 接收 syntax，不返回值，但会在全局 command state 上产生 monadic side effects。虽然二者都可访问 `IO`，但实际执行副作用并不常见；例外包括与外部工具或 solver 交互。

## 2.2.1 Info trees

交互使用 Lean 代码时，需要的信息远多于把代码作为依赖导入时所需的信息。例如，Lean 交互环境可以显示选中 expression 的 type、逐步查看证明中间状态、查看文档、并高亮绑定变量的所有出现。这些交互所需信息会在 elaboration 期间存入称为 info trees 的旁表。

info trees 把元数据关联到用户原始语法。它们的树结构与 syntax tree 接近，但某个 syntax node 可能对应多个 info tree node，分别记录其不同方面。元数据包括 elaborator 在 Lean 核心语言中的输出、某个位置的 proof state、交互式 identifier completion 的建议等。元数据也可任意扩展；`Info.ofCustomInfo` 接受 `Dynamic` 类型，可用于自定义 code action 或其他 UI extension。

## 2.3 Kernel

Lean 受信任的 kernel 是一个小而健壮的核心类型论 type checker。它不包含语法层面的 termination checker，也不执行 unification；termination 通过把所有 recursive function elaborate 成 primitive recursor 的使用来保证，unification 则预期已由 elaborator 完成。在 command 或 term elaborator 把新的 inductive type 或 definition 加入 environment 之前，它们必须先由 kernel 检查，以防 elaboration 中潜在 bug。

Lean kernel 用 C++ 编写。Rust 中有独立实现 `nanoda_lib`，Lean 中也有 `lean4lean`。Lean 项目希望拥有尽可能多的实现，以便相互交叉检查。

kernel 实现的语言是 Calculus of Constructions 的一个版本，是具有以下特性的依赖类型论：

- 完整依赖类型；
- 可 mutual inductive、也可在其他 inductive type 下嵌套递归的 inductively-defined type；
- impredicative、definitionally proof-irrelevant、extensional 的 propositions universe；
- predicative、非累积的数据 universe 层级；
- 带 definitional computation rule 的 quotient type；
- propositional function extensionality；
- function 和 product 的 definitional η-equality；
- universe-polymorphic definition；
- consistency：不存在无公理的 closed term，其 type 为 `False`。

这个理论足够表达前沿研究数学，同时足够简单，适合小而高效的实现。显式 proof term 让独立 proof checker 的实现成为可能，从而增加信心。

Lean 类型论没有 subject reduction；definitional equality 不一定是 transitive；也可以构造让 type checker 不终止的例子。这些元理论性质在实践中不会造成问题：transitivity 失败极其罕见；据已知，non-termination 只在专门构造代码触发时出现。最重要的是，逻辑 soundness 不受影响。实践中，表面上的 non-termination 与足够慢的程序难以区分，而现实中观察到的原因通常是后者。这些元理论性质来自 Lean 同时具有 impredicativity、可计算 quotient type、definitional proof irrelevance 和 propositional extensionality；这些特性对普通数学实践和自动化都非常有价值。

## 2.4 Elaboration results

Lean 核心类型论不包含 pattern matching 或 recursive definition。它提供的是低层 recursor，可用于实现 case distinction 和 primitive recursion。因此，elaborator 必须把使用 pattern matching 和 recursion 的 definition 翻译成使用 recursor 的 definition。这种翻译同时也是该函数对所有可能参数终止的证明，因为所有能翻译为 recursor 的函数都会终止。

到 recursor 的翻译分两阶段。term elaboration 期间，pattern matching 会被替换为辅助匹配函数（auxiliary matching function，也称 matcher function），这些函数实现代码中出现的具体 case distinction。辅助函数本身由 recursor 定义，但不使用 recursor 实际实现递归行为。term elaborator 返回的是核心语言 term：其中 pattern matching 已被替换成特殊函数调用，但仍可能包含当前定义函数的递归出现。这种已经 elaborated 为核心语言、但仍包含 recursion 的 definition 称为 pre-definition。

随后 pre-definition 同时送给 compiler 和 kernel。compiler 接收保留 recursion 的 pre-definition；送给 kernel 的版本则会经历第二次转换，把显式 recursion 替换为 recursor、well-founded recursion 或 partial fixpoint recursion。

这种拆分有三个原因：

- compiler 可以编译 `partial` function，而 kernel 在推理时把它视为 opaque constant；
- compiler 也可以编译完全绕过 kernel 的 `unsafe` function；
- 翻译为 recursor 不一定保持程序员预期的成本模型，特别是 laziness 与 strictness；而编译代码必须有可预测性能。

compiler 会在 environment extension 中保存 intermediate representation。

对于直接的 structurally recursive function，翻译会使用对应 type 的 recursor。这类函数在 kernel 中运行通常较高效，定义方程 definitionally 成立，也容易理解。若函数使用 type recursor 无法表达的递归模式，则会翻译为 well-founded recursion 或 partial fixpoint。Lean 可以自动推导许多 termination proof，但有些需要手动证明。well-founded recursion 更灵活，但由于需要携带度量下降的证明，所得函数在 kernel 中执行通常更慢，定义方程也可能只 propositionally 成立。

为了给 structural recursion 和 well-founded recursion 定义的函数提供统一接口，并检查自身正确性，elaborator 会证明 equational lemmas，把函数与原始定义联系起来。在函数 namespace 中，`eq_unfold` 把函数直接关联到定义，`eq_def` 把函数关联到实例化隐式参数后的定义，`eq_N` 系列 lemma 则把 pattern matching 的每个 case 关联到相应右侧，并包含足够假设说明更早分支未被选中。

module elaboration 完成并经 kernel 检查每次对 environment 的添加后，module 对全局 environment 的改变（包括 extension）会被序列化到 `.olean` 文件。`.olean` 文件中，Lean term 和 value 的表示与内存中一样，因此可以直接 memory-map。所有让 Lean 向 environment 添加内容的代码路径都会先让新 type 或 definition 经过 kernel 检查。不过 Lean 是非常开放、灵活的系统；为了防范糟糕元程序绕过正常路径加入未经检查的值，可以用独立工具 `lean4checker` 验证整个 `.olean` 文件中的 environment 满足 kernel。

除了 `.olean` 文件，elaborator 还会产生 `.ilean` 文件。它是 language server 使用的索引，包含无需完整加载 module 就能交互使用该 module 所需的信息，例如 definition 的源码位置。`.ilean` 文件内容是实现细节，可能在任意版本中变化。

最后，compiler 会把函数的 intermediate representation 转换为 C 代码。每个 Lean module 会产生一个 C 文件；这些 C 文件再由随 Lean 分发的 C compiler 编译为 native code。若构建配置中设置了 `precompileModules`，这些 native code 可以由 Lean 动态加载并调用；否则使用 interpreter。对多数工作负载，编译开销大于避免 interpreter 节省的时间；但预编译 tactic、语言扩展或其他 Lean extension 时，某些工作负载可能明显加速。

## 2.5 Initialization

启动前，elaborator 必须正确初始化。Lean 自身包含初始化代码，用于正确构造 compiler 的初始状态；这些代码在加载任何 module 之前、调用 elaborator 之前运行。此外，每个依赖也可能贡献初始化代码，例如设置 environment extension。

内部上，每个 environment extension 都会被分配一个数组中的唯一索引，而数组大小等于注册的 environment extension 数量。因此，为了正确分配 environment，必须先知道 extension 数量。

Lean 运行自身 builtin initializer 后，会解析 module header，并把依赖的 `.olean` 文件加载到内存中。随后构造一个 pre-environment，包含依赖 environment 的并集。接着，解释器执行依赖指定的所有初始化代码。此时 environment extension 数量已知，pre-environment 可以重新分配为带有正确大小 extension array 的 environment structure。

### `initialize`

`initialize` block 会向 module 的 initializer 添加代码。`initialize` block 的内容会被当作 `IO` monad 中的 `do` block 内容处理。

有时初始化只需要通过副作用扩展内部数据结构，此时内容应具有 type `IO Unit`。初始化也可用于构造包含内部状态引用的值，例如由 environment extension 支撑的 attribute；这种形式下，初始化应在 `IO` monad 中返回指定 type。

### `builtin_initialize`

Lean 内部也定义必须在初始化期间运行的代码。由于 Lean 是 bootstrapping compiler，Lean 自身实现中的 initializer 需要特殊处理，并且必须在导入或加载任何 module 前运行。这些 initializer 使用 `builtin_initialize` 指定。该命令不应在 compiler 实现之外使用。