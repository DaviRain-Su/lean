# 下一步（Next Steps）

本书介绍了 Lean 函数式编程的最基础内容，包括少量交互式定理证明。
使用像 Lean 这样的依赖类型函数式语言是一个深奥的主题，可以说的内容很多。
根据你的兴趣，以下资源可能对学习 Lean 4 有帮助。

# 学习 Lean

Lean 4 本身在以下资源中有介绍：

 * [Theorem Proving in Lean 4](https://lean-lang.org/theorem_proving_in_lean4/) 是使用 Lean 编写证明的教程。
 * [The Lean 4 Manual](https://lean-lang.org/doc/reference/latest/) 对语言及其特性有详细描述。
 * [How To Prove It With Lean](https://djvelleman.github.io/HTPIwL/) 是广受好评的教材 [_How To Prove It_](https://www.cambridge.org/highereducation/books/how-to-prove-it/6D2965D625C6836CD4A785A2C843B3DA) 的 Lean 配套读物，介绍如何编写纸笔数学证明。
 * [Metaprogramming in Lean 4](https://github.com/arthurpaulino/lean4-metaprogramming-book) 概述 Lean 的扩展机制，从中缀运算符和记法到宏、自定义策略以及完整的自定义嵌入语言。
 * [Functional Programming in Lean](https://lean-lang.org/functional_programming_in_lean/) 可能对喜欢递归笑话的读者有趣。

不过，继续学习 Lean 的最佳方式是开始阅读和编写代码，遇到问题时查阅文档。
此外，[Lean Zulip](https://leanprover.zulipchat.com/) 是结识其他 Lean 用户、寻求帮助和帮助他人的绝佳场所。

# Lean 中的数学

数学家可用的广泛学习资源见[社区网站](https://leanprover-community.github.io/learn.html)。

# 在计算机科学中使用依赖类型

Rocq 是一门与 Lean 有很多共同点的语言。
对计算机科学家而言，[Software Foundations](https://softwarefoundations.cis.upenn.edu/) 系列交互式教材出色地介绍了 Rocq 在计算机科学中的应用。
Lean 与 Rocq 的基本思想非常相似，技能可以在两个系统之间轻松迁移。

# 用依赖类型编程

对有兴趣学习使用索引族和依赖类型来组织程序的程序员，Edwin Brady 的 [_Type Driven Development with Idris_](https://www.manning.com/books/type-driven-development-with-idris) 提供了出色的入门。
与 Rocq 一样，Idris 是 Lean 的近亲，尽管它没有策略（tactics）。

# 理解依赖类型

[_The Little Typer_](https://thelittletyper.com/) 面向没有正式学习过逻辑或编程语言理论、但希望建立依赖类型论核心概念的程序员。
虽然上述所有资源都力求尽可能实用，_The Little Typer_ 呈现的是一种依赖类型论方法，从最基础开始构建，只使用来自编程的概念。
免责声明：_Functional Programming in Lean_ 的作者也是 _The Little Typer_ 的作者之一。