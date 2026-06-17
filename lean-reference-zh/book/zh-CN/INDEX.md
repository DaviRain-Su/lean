# Lean 语言参考手册（中文版）

> 英文原版：[The Lean Language Reference](https://lean-lang.org/doc/reference/latest/) · 官网：[lean-lang.org](https://lean-lang.org/)

## 说明

本目录先翻译最常用、最适合接入学习工作台的官网入口与参考手册章节。官方参考手册是查阅型文档，不是入门教程；首次学习建议先读本站的 FAQ、VS Code 手册、TPIL、FP in Lean 或 Mathematics in Lean。

### 官网入口

- [安装 Lean](Install.md) — VS Code 扩展安装流程、手动安装提示与项目入口
- [手动安装 Lean](InstallManual.md) — 命令行安装依赖、工具链、VS Code、项目与 Mathlib 更新提示
- [学习资源](Learn.md) — 官方 Learn 页核心资源、工具与引用信息
- [语义高亮](SemanticHighlighting.md) — VS Code semantic token 设置与颜色定制
- [在 LaTeX 中高亮 Lean 代码](LatexSyntaxHighlighting.md) — `listings` 与 `minted` 配置

### 语言参考手册

- [参考手册总览](Reference/Overview.md) — 参考手册定位、Lean 的证明与编程双重角色
- [引言](Reference/Introduction.md) — Lean 历史、排版约定、示例和引用方式
- [Elaboration 与编译](Reference/ElaborationCompilation.md) — parsing、macro expansion、elaboration、kernel、`.olean` 与初始化

### Elaboration 详解

- [Parsing](Reference/Elaboration/Parsing.md) — recursive-descent、Pratt parsing、歧义处理与 `SourceInfo`
- [Macro expansion 与 elaboration](Reference/Elaboration/MacroAndElaboration.md) — command/term elaboration、macro 展开与 info trees
- [Kernel](Reference/Elaboration/Kernel.md) — 受信任核心、类型论特性与独立实现
- [elaboration 结果](Reference/Elaboration/ElaborationResults.md) — pre-definition、递归消去、equational lemma、`.olean` / `.ilean`
- [初始化](Reference/Elaboration/Initialization.md) — `initialize`、`builtin_initialize` 与 environment extension
- [与 Lean 交互](Reference/InteractingWithLean.md) — `#eval`、`#reduce`、`#check`、`#synth`、`#guard_msgs` 与格式化输出

### 与 Lean 交互详解

- [#eval](Reference/Interacting/Eval.md) — 编译执行 term、`#eval!` 与显示选项
- [#reduce](Reference/Interacting/Reduce.md) — definitional reduction、normal form 与 `#eval` 区别
- [#check](Reference/Interacting/Check.md) — 查看 term 的 type 与 `#check_failure`
- [#synth](Reference/Interacting/Synth.md) — type class instance synthesis 与调试
- [#guard_msgs](Reference/Interacting/GuardMsgs.md) — 测试错误、警告和信息输出
- [查询上下文](Reference/Interacting/QueryingContext.md) — `#print`、`#print axioms`、`#print equations`、`#where`、`#version`
- [Format](Reference/Interacting/Format.md) — 文档结构、序列、缩进、括号与渲染
- [`ToFormat` 类](Reference/Interacting/ToFormat.md) — 结构化输出接口与消息展示
- [`Repr`](Reference/Interacting/Repr.md) — `#eval` 输出、值表示与 `ToString`/`Format` 的区别
- [如何写 `Repr` instance](Reference/Interacting/ReprInstance.md) — `addAppParen`、`reprArg` 与括号策略
- [`Repr` 的原子类型](Reference/Interacting/ReprAtomic.md) — `ReprAtom` 与原子项显示约定
- [类型系统](Reference/TypeSystem.md) — term、definitional equality、reduction、conversion 与基础 type

### 类型系统详解

- [函数抽象](Reference/TypeSystemDetails/FunctionAbstractions.md) — lambda、β-reduction 与高层语法到核心 abstraction 的映射
- [Currying](Reference/TypeSystemDetails/Currying.md) — 多参数函数的单参数嵌套编码
- [函数外延性](Reference/TypeSystemDetails/FunctionExtensionality.md) — intensional equality、η-equivalence、`funext`
- [totality 与终止](Reference/TypeSystemDetails/TotalityTermination.md) — total function、`partial`、`unsafe` 与 panic 边界
- [Predicativity](Reference/TypeSystemDetails/Predicativity.md) —  predicative universe、impredicative `Prop`、strictly positive 约束
- [Universe Polymorphism](Reference/TypeSystemDetails/UniversePolymorphism.md) — level variables、`u+1`、level constraints、自动推断
- [函数（类型系统层）](Reference/TypeSystemDetails/Functions.md) — 依赖函数、currying、β/η、外延性与 totality
- [命题（类型系统层）](Reference/TypeSystemDetails/Propositions.md) — `Prop`、proof irrelevance、run-time irrelevance、`propext`
- [universe](Reference/TypeSystemDetails/Universes.md) — `Prop`、`Type u`、predicativity、polymorphism、`PLift` / `ULift`
- [归纳类型](Reference/TypeSystemDetails/InductiveTypes.md) — constructor、recursor、参数与索引、良构性与运行时表示
- [quotient](Reference/TypeSystemDetails/Quotients.md) — `Setoid`、`Quotient.mk`、`lift`、`sound` 与抽象屏障
- [源文件与模块](Reference/SourceFilesModules.md) — 文件名、导入名、UTF-8、注释、标识符和模块结构

### 源文件与模块详解

- [编码与表示](Reference/Source/EncodingRepresentation.md) — UTF-8、行尾规范化与文件编码约定
- [具体语法](Reference/Source/ConcreteSyntax.md) — 可扩展 concrete syntax 与核心语法关系
- [空白符](Reference/Source/Whitespace.md) — 合法空白、换行与 tab 限制
- [注释](Reference/Source/Comments.md) — 行注释、块注释、嵌套注释与文档注释
- [关键字与标识符](Reference/Source/KeywordsIdentifiers.md) — identifier component、Unicode、书名号引用与层级名
- [模块头](Reference/Source/Headers.md) — `module`、`prelude`、`import` 与 import 名到文件的映射
- [顶层命令](Reference/Source/Commands.md) — command 作为顶层动作及其可扩展性

### 模块系统详解

- [module 与可见性](Reference/Source/ModulesVisibility.md) — public/private scope、`meta import`、`all` 与兼容选项
- [Meta phase](Reference/Source/MetaPhase.md) — 编译期工具、元编程依赖与相位边界
- [elaborated module](Reference/Source/ElaboratedModules.md) — `.olean`、`.ilean` 与可导入产物
- [模块系统错误与模式](Reference/Source/ModuleErrorsPatterns.md) — import、根目录、可见性与缓存排查思路
- [迁移旧文件的配方](Reference/Source/PortingRecipe.md) — 旧项目迁移到新 module 语义的顺序与策略
- [package、library 与 target](Reference/Source/PackagesLibrariesTargets.md) — 文件、模块、library、package 与 target 关系
- [命名空间与 section](Reference/NamespacesSections.md) — namespace、`open`、`export`、section scope 与 `variable`

### namespace 与 section 详解

- [namespace](Reference/NamespaceDetails/Namespaces.md) — 层级名称、root namespace、module 正交性与 current namespace
- [`open` 声明](Reference/NamespaceDetails/OpenDeclarations.md) — 打开整个 namespace、`hiding`、`renaming`、restricted opening、`open scoped`
- [导出名称](Reference/NamespaceDetails/ExportingNames.md) — `export`、透明别名与 root namespace 导出
- [section scope](Reference/NamespaceDetails/SectionScopes.md) — current namespace、opened namespace、option 与 section variable
- [控制 section scope](Reference/NamespaceDetails/ControllingSectionScopes.md) — `section`、`namespace`、`end`、`in` 与 header modifier
- [section variable](Reference/NamespaceDetails/SectionVariables.md) — `variable`、自动参数传播、`include` / `omit`
- [定义](Reference/Definitions.md) — `def`、`abbrev`、`example`、`theorem`、`opaque` 与递归定义入口

### 定义详解

- [声明修饰符](Reference/DefinitionsDetails/Modifiers.md) — 文档注释、attribute、可见性、`noncomputable`、`unsafe`、`partial`
- [头部与签名](Reference/DefinitionsDetails/HeadersSignatures.md) — 声明名、参数形式、bracketed binder 与 automatic implicit parameter
- [`def` / `abbrev` / `opaque`](Reference/DefinitionsDetails/Definitions.md) — semireducible、reducible、opaque 与模式匹配定义
- [`theorem`](Reference/DefinitionsDetails/Theorems.md) — proposition 结果、先 elaboration header、默认 irreducible
- [`example` 声明](Reference/DefinitionsDetails/ExampleDeclarations.md) — 匿名声明、增量测试与文档示例
- [递归定义总览](Reference/DefinitionsDetails/RecursiveDefinitions.md) — 结构递归、良基递归、partial、unsafe 与 reducibility
- [公理](Reference/Axioms.md) — axiom 风险、标准公理、`sorryAx`、compiler trust 与 `#print axioms`

### 公理详解

- [axiom 声明](Reference/AxiomDetails/AxiomDeclarations.md) — 后设常量、可用 modifier 与逻辑定位
- [一致性](Reference/AxiomDetails/Consistency.md) — axiom 风险、可信边界与一致性责任
- [axiom 与 reduction](Reference/AxiomDetails/Reduction.md) — stuck reduction、编译限制与 `noncomputable`
- [Lean 标准公理](Reference/AxiomDetails/StandardAxioms.md) — `Classical.choice`、`propext`、`Quot.sound`、`sorryAx`
- [显示公理依赖](Reference/AxiomDetails/PrintingDependencies.md) — `#print axioms`、传递依赖与 proof 审计
- [Attribute](Reference/Attributes.md) — declaration annotation、`attribute` command、`local` 与 `scoped`

### Attribute 详解

- [把 attribute 用作声明修饰符](Reference/AttributeDetails/AsModifiers.md) — 在声明头中直接附加 attribute
- [`attribute` 命令](Reference/AttributeDetails/AttributeCommand.md) — 修改现有声明 attribute 与擦除 attribute
- [scoped attribute](Reference/AttributeDetails/ScopedAttributes.md) — 全局、`local`、`scoped` 三种作用域
- [Type class](Reference/TypeClasses.md) — ad-hoc polymorphism、instance synthesis 与常见用例

### Type class 详解

- [class 声明](Reference/TypeClasses/ClassDeclarations.md) — class vs structure、继承、method 与 class inductive
- [instance 声明](Reference/TypeClasses/InstanceDeclarations.md) — where 风格、递归实例、优先级、`default_instance`
- [instance synthesis](Reference/TypeClasses/InstanceSynthesis.md) — `inferInstance`、`inferInstanceAs`、输出参数与默认实例
- [deriving instance](Reference/TypeClasses/DerivingInstances.md) — deriving 子句、独立 deriving 命令与 deriving handler
- [基础 class 总览](Reference/TypeClasses/BasicClasses.md) — `BEq`、`Ord`、`Decidable`、`Inhabited`、算术与索引 class
- [Coercion](Reference/Coercions.md) — 自动 coercion、`Coe`、`OfNat` 限制与自定义 coercion

### Coercion 详解

- [coercion 插入](Reference/CoercionDetails/Insertion.md) — 自动插入场景、显式请求与双重 type ascription
- [在类型之间 coercion](Reference/CoercionDetails/BetweenTypes.md) — `Coe`、`CoeDep`、链式 coercion 与 `NatCast` / `IntCast`
- [coercion 到 sort](Reference/CoercionDetails/ToSorts.md) — `CoeSort`、`↥` 与 type/proposition 位置
- [coercion 到函数类型](Reference/CoercionDetails/ToFunctions.md) — `CoeFun`、`⇑` 与“对象可调用”语义
- [coercion 的实现细节](Reference/CoercionDetails/ImplementationDetails.md) — unfolding、chaining 与 `CoeTC` / `CoeHTCT`
- [运行时代码](Reference/RunTimeCode.md) — runtime、内存管理、reference counting、task 与 primitive operator
- [Term](Reference/Terms.md) — identifier、函数、应用、literal、pattern matching、hole 与 `do` notation

### Term 详解

- [Identifier](Reference/Terms/Identifiers.md) — name resolution、开放命名空间、前导点号与 expected type
- [函数类型](Reference/Terms/FunctionTypes.md) — 显式/隐式/实例/严格隐式/可选/自动参数
- [函数](Reference/Terms/Functions.md) — `fun` abstraction、curried function 与不同 binder
- [函数应用](Reference/Terms/FunctionApplication.md) — named argument、`optParam`、`autoParam`、field notation 与 pipeline
- [模式匹配](Reference/Terms/PatternMatching.md) — pattern、motive、generalization、`match_pattern` 与 `nomatch`
- [Hole](Reference/Terms/Holes.md) — `_`、`?x`、`?_` 与 unification
- [证明](Reference/Terms/Proofs.md) — proof 作为 term，以及 `by` 与 tactic proof 的关系
- [数值字面量](Reference/Terms/NumericLiterals.md) — `OfNat`、`OfScientific`、进制字面量与列表/数组字面量
- [结构体与构造子](Reference/Terms/StructuresConstructors.md) — 匿名构造子与 structure instance 语法的导航说明
- [条件表达式](Reference/Terms/Conditionals.md) — `if`、`if h : p`、`if let` 与 `bif`
- [类型标注](Reference/Terms/TypeAscription.md) — `(e : α)`、`show α from ...` 与 coercion 控制
- [quotation 与 antiquotation](Reference/Terms/QuotationAntiquotation.md) — quotation 的导航说明与元编程定位
- [`do` 记法](Reference/Terms/DoNotation.md) — 作为 term 语法的 `do` 与 monad 章节衔接
- [策略证明](Reference/TacticProofs.md) — tactic language、proof state、goal 与 kernel 检查

### Tactic 详解

- [运行 tactic](Reference/Tactics/RunningTactics.md) — `by`、缩进式 tactic block 与显式花括号
- [阅读 proof state](Reference/Tactics/ReadingProofStates.md) — main goal、假设、不可访问名字、metavariable 与 pretty-printer 选项
- [Tactic 语言](Reference/Tactics/TacticLanguage.md) — 控制结构、goal 管理、hygiene、假设管理与局部定义
- [用 `conv` 做定点重写](Reference/Tactics/Conv.md) — 子项导航、定点重写、binder 下改写与 conversion goal
- [Simplifier](Reference/Simplifier.md) — `simp`、rewrite rule、simp set、normal form 与配置
- [`grind` tactic](Reference/Grind.md) — congruence closure、constraint propagation、E-matching 与 theory solver
- [`mvcgen` tactic](Reference/Mvcgen.md) — monadic verification condition generation 与 proof mode

### Simplifier 详解

- [调用 simplifier](Reference/Simplifier/Invoking.md) — tactic 名称系统、参数语法、规则列表与位置说明
- [simplifier 的重写规则](Reference/Simplifier/RewriteRules.md) — definition unfolding、equational lemma、simproc 与内建 reduction
- [simp set](Reference/Simplifier/SimpSets.md) — 默认 simp set、自定义 simp set 与 `[simp]` attribute
- [simp normal form](Reference/Simplifier/SimpNormalForms.md) — 规范形式、右侧 normal form 与库接口设计
- [配置 simplification](Reference/Simplifier/ConfiguringSimplification.md) — `Simp.Config`、关键选项与 trace
- [simplification 与 rewriting](Reference/Simplifier/SimpVsRw.md) — `simp` 和 `rw` 的目标、策略与适用场景

### `grind` 详解

- [`grind`：congruence closure](Reference/Grind/CongruenceClosure.md) — 等价类、constructor 冲突与和 `simp` 的区别
- [`grind`：constraint propagation](Reference/Grind/ConstraintPropagation.md) — true/false bucket、向上/向下传播与布尔后果
- [`grind`：E-matching](Reference/Grind/EMatching.md) — pattern、multi-pattern、`grind_pattern` 与实例化
- [`grind`：线性整数算术](Reference/Grind/LinearIntegerArithmetic.md) — LIA 约束、`ToInt` 扩展与非线性限制
- [为 `grind` 标注库](Reference/Grind/AnnotatingLibraries.md) — `@[grind]`、`grind_pattern`、前向/后向推理

### `mvcgen` 详解

- [`mvcgen` 概览](Reference/Mvcgen/Overview.md) — weakest precondition 工作流、Hoare triple 与 invariant
- [predicate transformer](Reference/Mvcgen/PredicateTransformers.md) — `SPred`、`Assertion`、`WP`、`PostCond`
- [verification condition](Reference/Mvcgen/VerificationConditions.md) — VC 生成流程、`@[spec]` lemma 与 invariant 子目标
- [为 monad 启用 `mvcgen`](Reference/Mvcgen/EnablingForMonads.md) — `WP` / `WPMonad` / adequacy lemma / spec lemma
- [`mvcgen` proof mode](Reference/Mvcgen/ProofMode.md) — `⊢ₛ` 目标、stateful context 与专用 tactic
- [Functor、Monad 与 `do` 记法](Reference/FunctorsMonads.md) — `Functor`、`Applicative`、`Monad`、`Alternative` 与 sequencing
- [基础命题](Reference/BasicPropositions.md) — `Prop` 中的逻辑 connective、quantifier 与 propositional equality
- [基础类型](Reference/BasicTypes.md) — 数值、文本、collection、subtype 与 lazy computation

### 基础类型详解

- [自然数](Reference/BasicTypes/NaturalNumbers.md) — 逻辑模型、Peano 公理、运行时表示与核心 arithmetic API
- [整数](Reference/BasicTypes/Integers.md) — `Int` 的逻辑模型、运行时支持与整数 arithmetic
- [字符串](Reference/BasicTypes/Strings.md) — UTF-8、`String.Pos`、插值字符串、raw string 与字符串 API
- [数组](Reference/BasicTypes/Arrays.md) — 动态数组、线性使用、字面量、subarray 与高性能更新
- [可选值](Reference/BasicTypes/OptionalValues.md) — `Option`、coercion、提取值、容器视角与控制流
- [子类型](Reference/BasicTypes/Subtypes.md) — `{ x // p x }`、proof carrying value、coercion 与 extensionality
- [布尔值](Reference/BasicTypes/Booleans.md) — `Bool`、运行时表示、`Prop` 区别、布尔运算与转换
- [链表](Reference/BasicTypes/LinkedLists.md) — `List` 的构造子、语法、性能特征与常见操作
- [Range](Reference/BasicTypes/Ranges.md) — 开闭区间、无界范围、range 类型与 slices
- [映射与集合](Reference/BasicTypes/MapsAndSets.md) — `HashMap`、`TreeMap`、`HashSet`、extensional 与 dependent 设计
- [有限自然数](Reference/BasicTypes/FiniteNaturalNumbers.md) — `Fin n`、索引类型、模运算、转换与归纳
- [定长整数](Reference/BasicTypes/FixedPrecisionIntegers.md) — `UInt*` / `Int*` / `USize` / `ISize` 的位宽与运算
- [浮点数](Reference/BasicTypes/FloatingPointNumbers.md) — `Float` 的语法、比较、算术、对数与三角函数
- [字符](Reference/BasicTypes/Characters.md) — `Char`、Unicode scalar value、字符类别与编码大小
- [字节数组](Reference/BasicTypes/ByteArrays.md) — packed byte buffer、UTF-8 解码、切片与 iterator
- [Unit 类型](Reference/BasicTypes/UnitType.md) — `Unit`、`PUnit`、唯一值与 monad 返回语义
- [位向量](Reference/BasicTypes/Bitvectors.md) — 固定宽度位序列、`BitVec`、位运算与 `bv_decide`
- [Empty 类型](Reference/BasicTypes/EmptyType.md) — 不可能值、`Empty` / `PEmpty` 与 `elim`
- [Tuple](Reference/BasicTypes/Tuples.md) — `Prod`、`Sigma`、有序对与依赖对
- [Sum 类型](Reference/BasicTypes/SumTypes.md) — `Sum`、`PSum`、`⊕`、析取式数据与分支结果
- [惰性计算](Reference/BasicTypes/LazyComputations.md) — `Thunk`、缓存求值、coercion 与 lazy evaluation
- [IO](Reference/IO.md) — 纯函数式语义下的副作用、`IO α`、文件、进程与 task

### IO 详解

- [控制台输出](Reference/IO/ConsoleOutput.md) — `print`、`println`、`eprint`、`eprintln` 与标准输入输出
- [可变引用](Reference/IO/MutableReferences.md) — `IO.Ref`、`ST.Ref`、`runST`、原子修改与低层锁
- [文件、文件句柄与流](Reference/IO/FilesStreams.md) — `IO.FS.Handle`、`IO.FS.Stream`、路径与文件系统 API
- [环境变量](Reference/IO/EnvironmentVariables.md) — 进程环境读取、可选配置与缺失处理
- [任务与线程](Reference/IO/TasksThreads.md) — `Task`、并发、并行与共享状态边界
- [Iterator](Reference/Iterators.md) — producer、consumer、combinator 与延迟遍历
- [Notation 与 Macro](Reference/NotationsMacros.md) — parser extension、macro、elaborator、notation 与低层语法扩展
- [构建工具与分发](Reference/BuildTools.md) — toolchain、`lean`、`lake`、`elan`、`leanchecker`
- [Lake 概念与工作区](Reference/Lake.md) — package、workspace、manifest、target、artifact 与 build

### Lake 详解

- [Lake 工作区布局](Reference/Lake/WorkspaceLayout.md) — `lean-toolchain`、`lakefile`、manifest、`.lake` 与构建目录
- [Lake package override](Reference/Lake/PackageOverrides.md) — 本地覆盖依赖、联调与可复现性风险
- [Lake 构建](Reference/Lake/Builds.md) — 配置、依赖图、trace、缓存与增量构建
- [Lake facet](Reference/Lake/Facets.md) — target 的不同产物视角与自定义 facet
- [Lake script](Reference/Lake/Scripts.md) — `lake script` 工作流与脚本型任务
- [Lake 命令行接口](Reference/Lake/Cli.md) — `lake new`、`build`、`test`、`lint`、`update`、`cache`
- [Lake TOML 配置格式](Reference/Lake/ConfigToml.md) — `[[require]]`、`[[lean_lib]]`、`[[lean_exe]]` 与配置字段

### Lake 测试、发布与缓存

- [Lake 测试与 lint driver](Reference/Lake/TestLintDrivers.md) — test driver、lint driver、builtin linter 与 `check-test` / `check-lint`
- [Lake GitHub Release 构建](Reference/Lake/GithubReleaseBuilds.md) — 预构建产物下载、上传与发布工作流
- [Lake artifact cache](Reference/Lake/ArtifactCaches.md) — 远程 cache、mappings、配置与 `lake cache` 生态

### Lake CLI 详解

- [`lake new` / `lake init`](Reference/Lake/Cli/New.md) — 创建新 workspace、初始化现有目录与项目骨架
- [`lake build`](Reference/Lake/Cli/Build.md) — 增量构建、重配置、缓存与相关构建命令
- [`lake test`](Reference/Lake/Cli/Test.md) — test driver、参数传递、library/executable/script 测试
- [`lake lint`](Reference/Lake/Cli/Lint.md) — lint driver、builtin linter 与 `check-lint`
- [`lake update`](Reference/Lake/Cli/Update.md) — 依赖同步、manifest 更新与可复现性
- [`lake cache`](Reference/Lake/Cli/Cache.md) — get/put/add/clean/services 与远程 artifact cache
- [使用 Elan 管理工具链](Reference/Elan.md) — toolchain 选择、`lean-toolchain`、override 与常用命令

### Elan 详解

- [选择 toolchain](Reference/Elan/SelectingToolchains.md) — proxy、`+版本` 覆盖与项目级版本切换
- [toolchain identifier](Reference/Elan/ToolchainIdentifiers.md) — `stable`、`beta`、`nightly`、固定版本、origin 与本地 toolchain
- [当前 toolchain 的判定](Reference/Elan/CurrentToolchain.md) — `lean-toolchain`、override、父目录查找与优先级
- [toolchain 存放位置](Reference/Elan/ToolchainLocations.md) — `~/.elan`、`ELAN_HOME` 与目录约定
- [Elan 命令行接口](Reference/Elan/Commands.md) — `elan show`、`default`、`toolchain`、`override`、`run`、`which`
- [验证 Lean 证明](Reference/ValidatingProof.md) — 蓝色双对勾、`#print axioms`、`lean4checker`、`comparator` 与 `Lean.trustCompiler`
- [错误解释](Reference/ErrorExplanations.md) — Lean 具名错误索引、摘要、版本与排查方向
- [发布说明](Reference/ReleaseNotes.md) — release notes 用途、版本索引与升级阅读建议
- [支持平台](Reference/SupportedPlatforms.md) — Tier 1 / Tier 2 平台和使用建议

### Notation 与 Macro 详解

- [自定义运算符](Reference/Macros/CustomOperators.md) — infix/prefix/postfix operator、precedence、associativity 与 expansion
- [Precedence](Reference/Macros/Precedence.md) — `min`、`max`、`arg`、`lead` 和相对优先级
- [Notation](Reference/Macros/Notations.md) — mixfix notation、notation item、scope、precedence 与 unexpander
- [定义新语法](Reference/Macros/DefiningNewSyntax.md) — `Syntax` tree、syntax kind、typed syntax、syntax category 与 parser rule
- [Macro](Reference/Macros/Macros.md) — macro expansion、hygiene、`MacroM`、quotation 和 macro 定义方式
- [Elaborator](Reference/Macros/Elaborators.md) — command/term/tactic elaborator、`elab_rules` 和 attribute 注册
- [扩展 `do` 记法](Reference/Macros/DoNotation.md) — do-element、continuation、mutable variable 和 effect lifting
- [扩展 Lean 的输出](Reference/Macros/Output.md) — unexpander、delaborator、`app_unexpander`、`delab` 与 `app_delab`

### 错误解释详解

- [ctorResultingTypeMismatch](Reference/Errors/CtorResultingTypeMismatch.md) — constructor 结果类型不是正在声明的归纳类型
- [dependsOnNoncomputable](Reference/Errors/DependsOnNoncomputable.md) — declaration 依赖 noncomputable 定义但未标记
- [inductionWithNoAlts](Reference/Errors/InductionWithNoAlts.md) — induction 的 `with` 子句使用了错误形态
- [inductiveParamMismatch](Reference/Errors/InductiveParamMismatch.md) — 归纳类型参数在 constructor 中不一致
- [inductiveParamMissing](Reference/Errors/InductiveParamMissing.md) — constructor 中出现归纳类型时缺少参数
- [inferBinderTypeFailed](Reference/Errors/InferBinderTypeFailed.md) — binder 类型无法推断
- [inferDefTypeFailed](Reference/Errors/InferDefTypeFailed.md) — definition 类型无法推断
- [invalidDottedIdent](Reference/Errors/InvalidDottedIdent.md) — dotted identifier notation 缺少可推断 expected type
- [invalidField](Reference/Errors/InvalidField.md) — generalized field notation 无法解析
- [projNonPropFromProp](Reference/Errors/ProjNonPropFromProp.md) — 试图从证明中投影非命题数据
- [propRecLargeElim](Reference/Errors/PropRecLargeElim.md) — 试图从 `Prop` 消去到普通数据
- [redundantMatchAlt](Reference/Errors/RedundantMatchAlt.md) — match 分支永远不会到达
- [synthInstanceFailed](Reference/Errors/SynthInstanceFailed.md) — type class instance synthesis 失败
- [unknownIdentifier](Reference/Errors/UnknownIdentifier.md) — identifier 无法解析为变量或常量

## 待细翻

- 各章深层小节和具体 API reference 条目仍可按使用频率继续细翻。