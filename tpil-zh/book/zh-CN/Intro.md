# 第 1 章：引言

> 本译文对应原书 [Introduction](https://lean-lang.org/theorem_proving_in_lean4/Introduction/)；英文 Verso 源：`book/TPiL/Intro.lean`。

## 1.1 计算机与定理证明

**形式化验证**（formal verification）用逻辑与计算方法，确立以精确数学术语表述的论断。这些论断可以是普通数学定理，也可以是硬件或软件、网络协议、机械与混合系统满足其规约的断言。实践中，验证一段数学与验证系统正确性并无截然分界：形式化验证要求用数学语言描述硬件与软件系统，此时确立其正确性论断即成为一种定理证明。反过来，证明某数学定理可能需要冗长计算，此时验证定理为真即需验证该计算按预期进行。

支持数学论断的金标准是给出证明；二十世纪的逻辑发展表明，绝大多数常规证明方法都可归约到若干基础系统中少量公理与规则。在此归约之下，计算机帮助确立论断有两种方式：协助**找到**证明，以及协助**验证**所声称的证明是否正确。

**自动定理证明**（automated theorem proving）侧重「寻找」：归结定理证明器、表方法证明器、快速可满足性求解器等，可在命题逻辑与一阶逻辑中确立公式有效性；其他系统为特定语言与领域提供搜索与判定过程，例如整数或实数上的线性/非线性表达式。SMT（"satisfiability modulo theories"，可满足性模理论）等架构将领域通用搜索与领域专用过程结合。计算机代数系统与专用数学软件包可执行数学计算、确立数学界或寻找数学对象；计算也可视为一种证明，这些系统同样帮助确立数学论断。

自动推理系统追求能力与效率，常以牺牲可保证的可靠性为代价；这类系统可能有 bug，难以确保输出正确。相比之下，**交互式定理证明**（interactive theorem proving）侧重定理证明的「验证」：要求每个论断在合适的公理化基础上都有证明支撑。标准极高：每条推理规则与计算步骤都须诉诸先前的定义与定理，一直追溯到基本公理与规则。事实上多数此类系统提供完全展开的「证明对象」（proof object），可传递给其他系统独立检查。构造这类证明通常需要用户更多输入与交互，但能获得更深、更复杂的证明。

**Lean 定理证明器**（Lean Theorem Prover）旨在弥合交互式与自动定理证明之间的差距：在支持用户交互与构造完全指定的公理化证明的框架中安置自动工具与方法，目标是在数学推理与复杂系统推理两方面支持并验证论断。

Lean 的底层逻辑有计算解释，Lean 同样可视为编程语言。更准确地说，它是为具有精确语义的程序书写、并对程序所计算函数进行推理的系统。Lean 还可作为自身的**元编程语言**（metaprogramming language），即用 Lean 实现自动化并扩展 Lean 功能。这些方面在免费在线书 [Functional Programming in Lean](https://lean-lang.org/functional_programming_in_lean/) 中描述；本书也会出现系统的计算侧面。

## 1.2 关于 Lean

**Lean** 项目由 Leonardo de Moura 于 2013 年在 Microsoft Research Redmond 启动，是长期持续的努力，自动化的许多潜力将随时间逐步实现。Lean 以 [Apache 2.0 许可证](https://github.com/leanprover/lean4/blob/master/LICENSE)发布，允许自由使用与扩展代码与数学库。

在计算机上安装 Lean 可参考 [Quickstart](https://lean-lang.org/install/)。Lean 源码及构建说明见 [https://github.com/leanprover/lean4/](https://github.com/leanprover/lean4/)。

本教程描述 Lean 的当前版本，即 **Lean 4**。

## 1.3 关于本书

本书旨在教你如何在 Lean 中开发并验证证明。为此所需的大量背景并非 Lean 独有。首先你将学习 Lean 所基于的逻辑系统——一种**依赖类型论**（dependent type theory）版本，强大到足以证明几乎任何常规数学定理，又足够自然。更具体地，Lean 基于带归纳类型的构造演算（Calculus of Constructions）的变体。Lean 不仅能在依赖类型论中定义数学对象、表述数学断言，还可作为书写证明的语言。

完全展开的公理化证明极其繁琐，定理证明的挑战在于让计算机尽可能填补细节。你将在[依赖类型论](https://lean-lang.org/theorem_proving_in_lean4/Dependent-Type-Theory/)一章学习多种支持方法，例如项重写（term rewriting）与 Lean 自动简化项与表达式的机制；还有**类型 elaboration**（elaboration）与**类型推断**（type inference），用于支持灵活的代数推理。

最后你将学习 Lean 特有功能，包括与系统交互的语言，以及 Lean 管理复杂理论与数据的机制。

全书会出现如下形式的 Lean 代码示例：

```lean
theorem and_commutative (p q : Prop) : p ∧ q → q ∧ p :=
  fun hpq : p ∧ q =>
  have hp : p := And.left hpq
  have hq : q := And.right hpq
  show q ∧ p from And.intro hq hp
```

原书每个代码示例旁有「Copy to clipboard」按钮，复制时会带上足够上下文使代码可编译。可将示例粘贴到 [VS Code](https://code.visualstudio.com/) 中修改；Lean 会在你输入时持续检查并反馈。建议在学习后续章节时自行运行示例并实验代码。也可在 VS Code 中用命令「Lean 4: Docs: Show Documentation Resources」，在打开的标签页中选择「Theorem Proving in Lean 4」阅读原书。

## 1.4 致谢

本教程是在 Github 上维护的开放获取项目。许多人贡献了修正、建议、示例与文字。感谢 Ulrik Buchholz、Kevin Buzzard、Mario Carneiro、Nathan Carter、Eduardo Cavazos、Amine Chaieb、Joe Corneli、William DeMeo、Marcus Klaas de Vries、Ben Dyer、Gabriel Ebner、Anthony Hart、Simon Hudon、Sean Leather、Assia Mahboubi、Gihan Marasingha、Patrick Massot、Christopher John Mazey、Sebastian Ullrich、Floris van Doorn、Daniel Velleman、Théo Zimmerman、Paul Chisholm、Chris Lovett、Siddhartha Gadgil 等人的贡献。最新贡献者列表见 [lean prover](https://github.com/leanprover/) 与 [lean community](https://github.com/leanprover-community/)。