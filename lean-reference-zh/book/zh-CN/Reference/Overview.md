# Lean 语言参考手册总览

> 对应英文：[The Lean Language Reference](https://lean-lang.org/doc/reference/latest/)，抓取日期：2026-06-16。英文页面覆盖 Lean `4.31.0-rc2`。

这是 Lean 语言参考手册。它旨在成为一份全面、精确的 Lean 描述：Lean 用户可以在其中查找细节信息。它不是给新用户的教程。若需要其他文档，请参考 Lean 官网的文档总览与学习资源页。

Lean 是基于依赖类型论的交互式定理证明器，设计目标包括前沿数学和软件验证。Lean 的核心类型论足够有表达力，可以刻画非常复杂的数学对象；同时它又足够简单，可以由独立实现进行检查，从而降低影响可靠性的 bug 风险。

核心类型论由一个很小的 kernel 实现。kernel 除了检查证明项之外不做其他事情。这个核心理论和 kernel 由强大的自动化支持；这些自动化通过表达力丰富的 tactic language 实现。每个 tactic 都会生成核心类型论中的项，再由 kernel 检查。因此 tactic 中的 bug 不会威胁 Lean 整体的可靠性。和 Lean 的许多其他部分一样，tactic language 可由用户扩展，从而适应具体形式化项目的需求。tactic 本身用 Lean 编写，定义后即可立即使用，不需要重新构建证明器或加载外部模块。

Lean 也是一门纯函数式编程语言，具备基于引用计数的运行时系统，可以高效处理紧凑数组结构、多线程和 monadic IO。作为一门编程语言，Lean 的大部分实现也由 Lean 自身完成，包括 language server、build tool、elaborator 和 tactic system。本参考手册本身由 Verso 编写；Verso 是用 Lean 实现的文档写作工具。

即使主要目标是写证明，熟悉 Lean 的编程功能也很有价值，因为新的 tactic 和证明自动化都由 Lean 程序实现。因此，本参考手册不把证明和编程人为隔开，而是把二者放在一起描述，使它们可以互相说明。

## 英文目录

1. Introduction
2. Elaboration and Compilation
3. Interacting with Lean
4. The Type System
5. Source Files and Modules
6. Namespaces and Sections
7. Definitions
8. Axioms
9. Attributes
10. Type Classes
11. Coercions
12. Run-Time Code
13. Terms
14. Tactic Proofs
15. The Simplifier
16. The `grind` tactic
17. The `mvcgen` tactic
18. Functors, Monads and `do`-Notation
19. Basic Propositions
20. Basic Types
21. IO
22. Iterators
23. Notations and Macros
24. Build Tools and Distribution
25. Validating a Lean Proof
26. Error Explanations
27. Release Notes
28. Supported Platforms
29. Index