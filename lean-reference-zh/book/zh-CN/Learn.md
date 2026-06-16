# Learn Lean

> 对应英文：[Learn — Lean Lang](https://lean-lang.org/learn/)，抓取日期：2026-06-16。

Lean 是一门函数式编程语言，也是一套定理证明器。它面向数学形式化与形式化验证，但也足够灵活，可以用于一般编程。如果你是初学者，官网推荐先玩 Natural Number Game；如果你准备深入学习，可以从本页列出的教材、教程和交互式游戏继续。

## 核心文档

### Functional Programming in Lean（FPIL）

FPIL 是面向程序员学习 Lean 的主要资料。它假定读者有编程背景，但不要求已经了解函数式编程。

- 英文原版：<https://lean-lang.org/functional_programming_in_lean/>
- 本站中文：`books/reader.html?book=fp-lean`

### Theorem Proving in Lean（TPIL）

TPIL 讲解如何在 Lean 中开发并验证证明，内容包括依赖类型论、自动证明方法，以及 Lean 中用于交互式定理证明的专门功能。

- 英文原版：<https://lean-lang.org/theorem_proving_in_lean4/>
- 本站中文：`books/reader.html?book=tpil`

### Mathematics in Lean（MIL）

MIL 面向数学读者，介绍如何通过 Lean 的 Mathlib 库进行交互式、基于 tactic 的数学形式化。

- 英文原版：<https://leanprover-community.github.io/mathematics_in_lean/>
- 本站中文：`books/reader.html?book=mil`

### The Lean Language Reference

Lean 语言参考手册是全面、精确的 Lean 描述文档。它是用于查阅细节的参考资料，覆盖 Lean 的各个方面，并配有简短示例。

- 英文原版：<https://lean-lang.org/doc/reference/latest/>
- 本站中文：`books/reader.html?book=lean-reference`

### Lean FAQ

Lean FAQ 回答关于 Lean 的常见问题。

- 英文原版：<https://lean-lang.org/faq>
- 本站中文：`books/reader.html?book=faq`

## 延伸阅读

- **Mathlib API Reference**：Lean core、Lean 标准库、Mathlib 及其他关键包的 API 参考。<https://leanprover-community.github.io/mathlib4_docs/>
- **The Hitchhiker's Guide to Logical Verification**：阿姆斯特丹自由大学交互式定理证明研究生课程的配套教材。本站已有中文 LoVe 目录。
- **Logic and Proof**：用 Lean 讲授经典逻辑基础，包括命题逻辑、一阶逻辑、自然演绎和公理化推理。<https://leanprover.github.io/logic_and_proof/>
- **The Mechanics of Proof**：Fordham University Math2001 课程配套教材，用 Lean 教数学推理基础。本站已有 `math2001-zh/` 骨架，正文待译。
- **Founder's Blog**：Lean 首席架构师 Leonardo de Moura 关于 Lean 开发、证明助手和 AI 的文章。

## 交互式游戏与教程

- **The Natural Number Game**：游戏化数学证明入门，通过专门设计的 Lean 4 方言介绍 Lean 4 概念。英文原版：<https://adam.math.hhu.de/#/g/leanprover-community/NNG4>；中文站：<https://nng4.leanprover.cn>
- **The Lean Game Server**：类似 Natural Number Game 的 Lean 游戏集合。<https://adam.math.hhu.de/>

## Lean 工具

- **Lean 4 VS Code Extension Manual**：说明如何通过 VS Code 扩展与 Lean 4 交互。本站已有中文 VS Code 手册。
- **Semantic Highlighting**：配置 Lean 语义高亮。<https://lean-lang.org/documentation/semantic-tokens/>
- **LaTeX**：在 LaTeX 文档中高亮 Lean 代码的实践建议。<https://lean-lang.org/documentation/latex-syntax-highlighting/>

## 资源

- **Loogle!**：Lean 与 Mathlib 搜索工具，可在网页、CLI 或 IDE 扩展中查找定义和引理。
- **Verso**：用 Lean 编写文档、书籍、课程材料和网站的平台。
- **LeanExplore**：Lean 声明的自然语言搜索引擎，索引常用 Lean 库。
- **LeanSearch**：通过自然语言查询 tactic 与定理的 Mathlib 搜索引擎。
- **LeanDojo**：用于数据提取和程序化交互 Lean 的工具。
- **REPL**：面向机器到机器交互和 AI 应用的 Lean Read-Eval-Print Loop。
- **Pantograph**：用于执行证明、构造表达式并检查 Lean 项目符号列表的机器交互系统。
- **Lean4Web**：可在浏览器中直接运行 Lean 代码的网页版本。

## 如何引用 Lean

引用 Lean 4 时，官网建议引用论文 *The Lean 4 Theorem Prover and Programming Language*，发表于 CADE-28。

引用 Lean 3 时，官网建议引用论文 *The Lean Theorem Prover (System Description)*。BibTeX 条目请以英文官网为准。