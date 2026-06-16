# 引言

> 对应英文：[Introduction](https://lean-lang.org/doc/reference/latest/Introduction/)，抓取日期：2026-06-16。英文原页还包含第三方开源许可证全文；本译文省略许可证长文，请以原页为准。

Lean 语言参考手册旨在成为对 Lean 的全面、精确描述。它是一份参考资料，供 Lean 用户查找细节信息，而不是面向新用户的教程。当前该参考手册仍是 public preview。若需要教程和学习材料，请访问 Lean 文档页面。

本文档描述 Lean `4.31.0-rc2`。

## 历史

Leonardo de Moura 于 2013 年在 Microsoft Research 工作时启动了 Lean 项目；Lean 0.1 于 2014 年 6 月 16 日正式发布。Lean 项目的目标是结合两类优势：一方面，用一个很小、可独立实现的逻辑 kernel 提供高信任度；另一方面，提供类似 SMT solver 的便利性和自动化能力，并能扩展到大型问题。这个愿景仍然指导 Lean 的发展：Lean 持续改进自动化、性能和易用性，同时受信任的核心证明检查器依旧保持最小化，并且存在独立实现。

Lean 的早期版本主要配置为 C++ 库，客户端代码可以在其中执行可信证明，并让这些证明可独立检查。在这些早期年份，Lean 的设计迅速向传统交互式证明器演进：先是用 Lua 编写 tactic，随后有了专门的前端语法。2017 年 1 月 20 日，Lean 3.0 系列首次发布。Lean 3 被数学家广泛采用，并开创了 self-extensibility：tactic、notation 和顶层 command 都可以用 Lean 自身定义。数学社区构建了 Mathlib；到 Lean 3 末期，它已有超过一百万行形式化数学，所有证明都经过机械检查。不过系统本身仍由 C++ 实现，这限制了 Lean 的灵活性，也因为所需技能多样而增加了开发难度。

Lean 4 的开发始于 2018 年，并在 2023 年 9 月 8 日发布 4.0。Lean 4 是一个重要里程碑：从第 4 版起，Lean 已经 self-hosted，约 90% 的 Lean 实现代码本身由 Lean 编写。Lean 4 丰富的 extension API 让用户可以按自己的需求适配 Lean，而不必等待核心开发者加入所需功能。此外，self-hosting 让开发流程更快，因此功能和性能改进能更快交付；Lean 4 比 Lean 3 更快，也能扩展到更大问题。Mathlib 在 Lean 开发者支持下，由社区在 2023 年成功移植到 Lean 4，并已增长到超过 150 万行。尽管 Mathlib 增长了 50%，Lean 4 检查它的速度仍快于 Lean 3 检查较小库时的速度。Lean 4 的开发周期大约和所有此前版本加起来一样长；现在设计已经稳定，没有计划再进行重写。

Leonardo de Moura 和共同创始人 Sebastian Ullrich 于 2023 年 7 月在 Convergent Research 内成立了非营利组织 Lean Focused Research Organization（FRO），并获得 Simons Foundation International、Alfred P. Sloan Foundation 和 Richard Merkin 的慈善支持。FRO 当前有十多名员工，致力于支持 Lean 及更广泛 Lean 社区的增长和可扩展性。

## 排版约定

本文档使用若干排版和布局约定，表示所呈现信息的不同方面。

### Lean 代码

本文档包含许多 Lean 代码示例。它们通常以代码块显示，例如：

```lean
def hello : IO Unit := IO.println "Hello, world!"
```

编译器输出可能是错误、警告或普通信息。文档会在代码旁和单独输出区域中展示这些信息。

普通信息输出，例如 `#eval` 的结果，会以信息消息形式显示：

```lean
#eval s!"The answer is {2 + 2}"
```

输出：

```text
"The answer is 4"
```

警告会单独显示，例如：

```text
declaration uses `sorry`
```

错误消息也会单独显示，例如类型不匹配错误：

```text
Application type mismatch: The argument
  "two"
has type
  String
but is expected to have type
  Nat
in the application
  Nat.succ "two"
```

tactic proof state 的存在由小菱形提示。点击后可以查看证明状态。例如：

```lean
example : 2 + 2 = 4 := by
  rfl
```

初始 proof state 是：

```text
⊢ 2 + 2 = 4
```

使用 `rfl` 后状态为：

```text
All goals completed! 🐙
```

代码示例中的 identifier 会链接到对应文档。

带语法错误的代码示例会标出 parser error 的位置，并附上错误消息。

### 示例

说明性示例会出现在 callout box 中。例如，可以用归纳谓词定义偶数：

```lean
inductive Even : Nat → Prop where
  | zero : Even 0
  | plusTwo : Even n → Even (n + 2)
```

### 技术术语

technical terminology 指在技术材料中以特定含义使用的术语，例如本参考手册中的术语。技术术语通常会链接到其定义位置。

### 常量、语法和 tactic 参考

definition、inductive type、syntax former 和 tactic 都有专门描述。描述通常包括声明本身、文档注释、constructor 或 method 列表，以及必要的说明。

例如：

```lean
/--
Evenness: a number is even if it can be evenly divided by two.
-/
inductive Even : Nat → Prop where
  | /-- 0 is considered even here -/
    zero : Even 0
  | /-- If `n` is even, then so is `n + 2`. -/
    plusTwo : Even n → Even (n + 2)
```

参考手册会把这类声明渲染为 structured reference，包含归纳谓词名称、类型、constructor 以及对应说明。

## 如何引用本文档

在正式引用中，请把本文档引用为 *The Lean Language Reference*，作者为 *The Lean Developers*。此外，请包含对应的 Lean 版本；本页对应版本为 `4.31.0-rc2`。

## 开源许可证

英文原页包含本手册网站所用第三方组件的许可证信息，包括搜索框、`elasticlunr.js`、`fuzzysort`、KaTeX、Popper.js 和 Tippy.js 等。本中文译文不复制许可证全文；再分发或核对法律文本时，请查阅英文原页。