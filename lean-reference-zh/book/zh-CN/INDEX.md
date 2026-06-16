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
- [与 Lean 交互](Reference/InteractingWithLean.md) — `#eval`、`#reduce`、`#check`、`#synth`、`#guard_msgs` 与格式化输出

### 与 Lean 交互详解

- [#eval](Reference/Interacting/Eval.md) — 编译执行 term、`#eval!` 与显示选项
- [#reduce](Reference/Interacting/Reduce.md) — definitional reduction、normal form 与 `#eval` 区别
- [#check](Reference/Interacting/Check.md) — 查看 term 的 type 与 `#check_failure`
- [#synth](Reference/Interacting/Synth.md) — type class instance synthesis 与调试
- [#guard_msgs](Reference/Interacting/GuardMsgs.md) — 测试错误、警告和信息输出
- [类型系统](Reference/TypeSystem.md) — term、definitional equality、reduction、conversion 与基础 type
- [源文件与模块](Reference/SourceFilesModules.md) — 文件名、导入名、UTF-8、注释、标识符和模块结构
- [命名空间与 section](Reference/NamespacesSections.md) — namespace、`open`、`export`、section scope 与 `variable`
- [定义](Reference/Definitions.md) — `def`、`abbrev`、`example`、`theorem`、`opaque` 与递归定义入口
- [公理](Reference/Axioms.md) — axiom 风险、标准公理、`sorryAx`、compiler trust 与 `#print axioms`
- [Attribute](Reference/Attributes.md) — declaration annotation、`attribute` command、`local` 与 `scoped`
- [Type class](Reference/TypeClasses.md) — ad-hoc polymorphism、instance synthesis 与常见用例
- [Coercion](Reference/Coercions.md) — 自动 coercion、`Coe`、`OfNat` 限制与自定义 coercion
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
- [策略证明](Reference/TacticProofs.md) — tactic language、proof state、goal 与 kernel 检查

### Tactic 详解

- [运行 tactic](Reference/Tactics/RunningTactics.md) — `by`、缩进式 tactic block 与显式花括号
- [阅读 proof state](Reference/Tactics/ReadingProofStates.md) — main goal、假设、不可访问名字、metavariable 与 pretty-printer 选项
- [Tactic 语言](Reference/Tactics/TacticLanguage.md) — 控制结构、goal 管理、hygiene、假设管理与局部定义
- [用 `conv` 做定点重写](Reference/Tactics/Conv.md) — 子项导航、定点重写、binder 下改写与 conversion goal
- [Simplifier](Reference/Simplifier.md) — `simp`、rewrite rule、simp set、normal form 与配置
- [`grind` tactic](Reference/Grind.md) — congruence closure、constraint propagation、E-matching 与 theory solver
- [`mvcgen` tactic](Reference/Mvcgen.md) — monadic verification condition generation 与 proof mode
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
- [使用 Elan 管理工具链](Reference/Elan.md) — toolchain 选择、`lean-toolchain`、override 与常用命令
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