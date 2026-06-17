# 前言

> 已对照 Lean-zh PDF 人工校对（原 PDF 340–703 行）。

形式证明助手（proof assistant）是一些旨在帮助用户进行计算机验证证明的软件。我们通常称之为**证明助手**或**交互式定理证明器**（interactive theorem prover），但一位沮丧的学生创造了「阻止证明的野兽」（proof-preventing beasts）一词来形容它，而语音识别软件则偶尔会将「定理证明器」误识别为「恐惧改进器」（fear improver），敬请留意。

## 严格证明与形式证明

交互式定理证明有其自己的术语，始于「证明」的概念。**形式证明**（formal proof）是用逻辑形式主义表达的逻辑论证。在本文中，「形式」表示「逻辑的」或「基于逻辑的」。逻辑学家在计算机出现之前的几十年里就在纸上进行形式证明，但如今形式证明几乎总是使用证明助手来完成。

相比之下，**非形式证明**（informal proof）就是数学家通常所说的证明。这类证明通常用 LaTeX 或黑板完成，也被称为「纸笔证明」。其详细程度可能差异很大，诸如「显然」「清楚地」和「不失一般性」之类的短语将部分证明负担转移给了读者。**严格证明**（rigorous proof）则是一种非常详细的非形式证明。

证明助手的主要优势在于，它们能够运用精确的逻辑，帮助学生构建高度可靠、无歧义的数学陈述证明。它们可以用来证明任意高级的结果，远远超越了玩具示例和逻辑谜题。形式证明还能帮助学生理解有效定义或有效证明的构成。引用 Scott Aaronson 的话：[^aaronson]

> 我还记得自己曾经批改过数百份试卷，学生们一开始只是假设需要证明的内容，或者一页一页地写满胡言乱语，希望在一片混乱中，他们可能偶然说出一些正确的话。

[^aaronson]: https://www.scottaaronson.com/teaching.pdf

当我们发展一个新理论时，形式证明可以帮助我们探索它。当我们推广、重构或以其他方式修改现有证明时，形式证明非常有用，就像编译器帮助我们开发正确的程序一样。形式证明提供了高度的可信度，使其他人更容易对其进行审查。此外，形式证明可以构成经过验证的计算工具（例如经过验证的计算机代数系统）的基础。

## 成功案例

在数学和计算机科学领域，辅助证明已取得诸多成功。数学形式化领域的一些里程碑式成果包括：Gonthier 等人证明四色定理 [5]，Gonthier 等人证明奇数阶定理 [6]，Hales 等人证明开普勒猜想 [9]，以及 Buzzard 等人定义完美拟态空间 [4]。该领域最早的研究始于 20 世纪 60 年代，由 Nicolaas de Bruijn 及其同事在名为 AUTOMATH 的系统中开展。[^automath]

包括 AMD [24] 和英特尔 [10] 在内的一些公司一直在使用证明助手来验证其设计。在学术界，一些里程碑式的成果包括操作系统内核 seL4 [13] 和 CertiKOS [8] 的验证，以及经过验证的编译器 CompCert [16]、JinjaThreads [18] 和 CakeML [15] 的开发。

[^automath]: https://www.win.tue.nl/automath/

## 证明助手

全球范围内有许多正在开发或使用的证明助手。以下列出一些主要助手，按其逻辑基础分类：

- **集合论**：Isabelle/ZF、Metamath、Mizar
- **简单类型论**：HOL4、HOL Light、Isabelle/HOL、PVS
- **依值类型论**：Agda、Lean、Matita、Rocq（以前叫做 Coq）
- **类 Lisp 的一阶逻辑**：ACL2

有关证明助手和交互式定理证明的历史，我们参考 Harrison、Urban 和 Wiedijk 撰写的资料丰富的章节 [11]。

## Lean

Lean 是一个证明助手，主要由 Leonardo de Moura（亚马逊网络服务 AWS）自 2012 年以来开发。其数学库 mathlib 最初由 Jeremy Avigad（卡内基梅隆大学 CMU）领导开发，现由 Lean 用户社区维护并进一步扩展 [19]。[^mathlib]

本指南使用 Lean 版本 v4.24.0，mathlib 修订版 `f897ebcf72cd16f8`，以及一些扩展，收集在名为 LoVelib 的小型库中。[^lovelib] 虽然这只是一个研究项目，还存在一些不完善的地方，但 Lean 非常适合用于交互式定理证明教学，原因如下：

- 它具有表达能力很强且非常有趣的逻辑，基于**归纳构造演算**（calculus of inductive constructions，一种**依值类型论** dependent type theory）
- 它扩展了经典公理和**商类型**（quotient type），使其可用于验证数学
- 它包含便捷的元编程框架，可用于编写自定义证明自动化程序
- 它通过 Visual Studio Code 插件提供现代化的用户界面
- 它具有非常易读且完备的文档
- 它是开源的

[^mathlib]: https://github.com/leanprover-community/mathlib4
[^lovelib]: https://github.com/lean-forward/logical_verification_2026/raw/main/lean/LoVe/LoVelib.lean

Lean 的核心库仅包含基本定义和工具。mathlib 则提供了更多功能。尽管名为 mathlib，但它不仅仅是一个数学库，还在 Lean 核心库之上提供了大量自动化功能，满足人们对现代证明助手的需要。

## 关于本指南

本指南最初是作为阿姆斯特丹自由大学理学硕士课程《逻辑验证》（LoVe）的配套教材而设计的。其主要目的是教授交互式定理证明。Lean 是手段，而非目的本身。因此，本指南并非旨在成为全面的 Lean 教程——为此我们推荐 [《Lean 4 定理证明》][12]。本指南也不能替代练习和作业。定理证明不是用来看的，它只能通过实践来学习。

具体来说，你的目标是：

- 学习交互式定理证明的基本理论和技术
- 学习如何使用逻辑作为一种精确的语言来建模系统并描述它们的性质
- 熟悉一些证明助手可以成功应用的领域，例如函数式编程、命令式编程语言的语义以及数学
- 培养可应用于大型项目的实践技能（无论是个人项目、硕士、博士项目还是工业界）
- 能够转换到其他证明助手并应用所学的知识
- 对该领域有充分了解，可以开始阅读在 CPP、ITP 等会议或 JAR 等期刊上发表的相关科学论文

具备良好的 Lean 知识后，应该可以轻松迁移到其他基于依值类型论的证明助手（例如 Agda 或 Rocq），或者基于简单类型论的系统（例如 HOL4 或 Isabelle/HOL）。

本指南的一个重要特点是，它与 Knuth 的 *TEXbook* [14] 一样，并非总是说实话。为了简化阐述，本书提出了一些关于 Lean 的基本但错误的论断。大多数这些论断都会在后续章节中得到纠正。与 Knuth 一样，我们认为「这种故意撒谎的技巧实际上会让你更容易学习这些理念。一旦你理解了一个简单但错误的规则，用它的例外来补充它就不难了。」

本指南附带的 Lean 文件可在公共源码库中找到。[^repo] 文件命名方案遵循本指南的章节名：例如 `LoVe07_EffectfulProgramming_Demo.lean` 是与第 7 章「带作用的编程」对应的主文件，`LoVe07_EffectfulProgramming_ExerciseSheet.lean` 是习题表，`LoVe07_EffectfulProgramming_HomeworkSheet.lean` 是家庭作业表。

[^repo]: https://github.com/Lean-zh/LoVe2026-zh/

我们非常感谢 [《Lean 4 定理证明》][12] 和 [《具体语义：Isabelle/HOL 描述》][21] 的作者，他们教会了我们 Lean 和编程语言语义学。他们的许多想法都体现在了本指南中。

我们感谢 Robert Lewis 和 Assia Mahboubi 对本指南的组织和重点提出的宝贵意见。我们感谢 Kiran Gopinathan 和 Ilya Sergey 分享了第 2 章脚注 3 中提到的轶事，并允许我们进一步分享。我们感谢 Daniel Fabian 设计了本指南的第一个平板电脑优化版本。我们感谢 Paul Chisholm 撰写了相关 Lean 文件中的一些评论。我们感谢 Pietro Monticone 随着 Lean 和 mathlib 的发展而帮助更新 Lean 文件。我们感谢 Moritz Roos 完成了关于实数的证明，该证明现在包含在第 14 章对应的主 Lean 文件中。我们感谢 Henrik Böving 对与本指南相关的 Lean 文件提出的意见。我们感谢 Mark Summerfield 提出的许多文本建议。最后，我们感谢 Fabian Axer Avila、Chris Bailey、Kevin Buzzard、Paul Chisholm、Dominique Danco、Raufs Dunamalijevs、Wan Fokkink、Lina Gerlach、Alexandra Graß、Robert Lewis、Alexandre Rademaker、Antonius Danny Reyes、Robert Schütz、Kristina Sojakova、Patrick Thomas、Balazs Toth、Huub Vromen、Floris Westerman、Wijnand van Woerkom 和 Yiming Xu 报告了他们在本指南早期版本中发现的错别字和一些更严重的错误。如果您发现本文中存在任何错误，请告知对应的作者。

## 特殊符号

在本指南中，我们假设你使用 Visual Studio Code 及其「lean4」扩展来编辑 `.lean` 文件。Visual Studio Code 允许你通过输入反斜杠 `\` 后跟 ASCII 标识符来输入 Unicode 符号。例如，`→`、`∀` 或 `∈` 可以通过输入 `\->`、`\fo` 或 `\in` 并按下 Tab 键或空格键来输入。我们将自由使用这些符号。作为参考，下面列出本指南中使用的主要非 ASCII 符号及其 ASCII 表示。在 VS Code 中，按住 Control 或 Command 键同时将鼠标悬停在某个符号上，即可看到不同的输入方式。

| 符号 | 输入 |
|------|------|
| ¬ | `\not` |
| ∧ | `\and` |
| ∨ | `\or` |
| → | `\->` |
| ↔ | `\<-` |
| ∀ | `\fo` |
| ∃ | `\ex` |
| ≤ | `\<=` |
| ≥ | `\>=` |
| ≠ | `\neq` |
| ≈ | `\~~` |
| × | `\x` |
| ∘ | `\circ` |
| ∅ | `\empty` |
| ∪ | `\union` |
| ∩ | `\intersect` |
| ∈ | `\in` |
| ⇃ | `\downleftharpoon` |
| ◯ | `\bigcirc` |
| ← | `\<-` |
| ↦ | `\mapsto` |
| ⇒ | `\=>` |
| ⟹ | `\==>` |
| ⟦ ⟧ | `\[[` `\]]` |
| · | `\.` |
| α β γ ε σ | `\a` `\b` `\g` `\e` `\s` |
| ₀–₉ | `\0` … `\9` |

---

**第一部分 · 基础**