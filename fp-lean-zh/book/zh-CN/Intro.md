# 前言

Lean 是一个基于**依赖类型论**（dependent type theory）的交互式定理证明器。
它最初在 Microsoft Research 开发，现在由 [Lean FRO](https://lean-fro.org) 维护。
依赖类型论将**程序**与**证明**这两个世界统一起来，因此 Lean 也是一门编程语言。
Lean 认真对待这种双重身份，并被设计成一门通用的编程语言——Lean 甚至是用它自己实现的。
本书的主题就是如何在 Lean 中编写程序。

作为一门编程语言，Lean 是一门**严格的纯函数式语言**，并且具有**依赖类型**。
学习用 Lean 编程，很大程度上就是学习这些特性如何影响程序的书写方式，以及如何像函数式程序员一样思考。

- **严格性**（Strictness）意味着 Lean 中的函数调用与大多数语言类似：在进入函数体之前，参数会先被完全计算。
- **纯洁性**（Purity）意味着 Lean 程序不能有副作用，例如修改内存、发送邮件或删除文件——除非这些副作用在类型中被显式声明。
- **函数式**（Functional）意味着函数像其他值一样是一等公民，并且执行模型受到数学表达式求值的启发。
- **依赖类型**（Dependent types）是 Lean 最不寻常的特性，它使类型成为语言的一等组成部分，类型中可以包含程序，程序也可以计算类型。

本书面向想要学习 Lean 的程序员，不要求你之前使用过函数式编程语言。
熟悉 Haskell、OCaml 或 F# 并不是必需的。
但本书假设你具备大多数编程语言共有的概念，例如循环、函数和数据结构。
虽然本书希望成为学习函数式编程的优秀入门书，但它并不适合作为完全没有编程经验的读者的第一本书。

对于把 Lean 当作证明助手来使用的数学家来说，他们迟早需要编写自定义的证明自动化工具。
本书也适合他们。
随着这些工具变得越来越复杂，它们会越来越像函数式语言中的程序，但大多数在职数学家都接受过 Python 或 Mathematica 等语言的训练。
本书可以帮助弥合这一差距，让更多数学家能够编写可维护且易于理解的证明自动化工具。

本书建议从头到尾按顺序阅读。
概念是逐个引入的，后面的章节会默认你已经熟悉前面的内容。
有时，后面的章节会深入讨论前面只简要提及的主题。
书中某些节包含练习，值得动手完成，以巩固对本节内容的理解。
在阅读过程中，积极探索 Lean 也很有用——尝试用创造性的新方法运用所学知识。

## 获取 Lean

%%%
tag := "getting-lean"
%%%

在编写和运行 Lean 程序之前，你需要在自己的电脑上安装 Lean。Lean 的工具链包括：

- `{lit}elan`：管理 Lean 编译器工具链，类似于 `{lit}rustup` 或 `{lit}ghcup`。
- `{lit}lake`：构建 Lean 包及其依赖，类似于 `{lit}cargo`、 `{lit}make` 或 Gradle。
- `{lit}lean`：对单个 Lean 文件进行类型检查和编译，同时向程序员工具提供正在编辑的文件信息。通常 `{lit}lean` 由其他工具调用，而不是由用户直接使用。
- 编辑器插件，例如 Visual Studio Code 或 Emacs，它们与 `{lit}lean` 通信并方便地展示信息。

关于安装 Lean 的最新说明，请参阅 [Lean 手册](https://lean-lang.org/lean4/doc/quickstart.html)。

## 排版约定

%%%
tag := "typographical-conventions"
%%%

作为 Lean **输入**的代码示例会这样排版：

```anchor add1
def add1 (n : Nat) : Nat := n + 1
```

```anchorTerm add1_7
#eval add1 7
```

上面最后一行（以 `{kw}#eval` 开头）是一条命令，指示 Lean 计算答案。
Lean 的回答会这样排版：

```anchorInfo add1_7
8
```

Lean 返回的错误信息会这样排版：

```anchorError add1_string
Application type mismatch: The argument
  "seven"
has type
  String
but is expected to have type
  Nat
in the application
  add1 "seven"
```

警告信息会这样排版：

```anchorWarning add1_warn
declaration uses 'sorry'
```

## Unicode

%%%
tag := "unicode"
%%%

符合 Lean 习惯的代码会使用各种不属于 ASCII 的 Unicode 字符。
例如，希腊字母 `{lit}α` 和 `{lit}β`，以及箭头 `{lit}→`，都会在本书第一章中出现。
这让 Lean 代码看起来更像普通的数学符号。

在默认的 Lean 设置下，Visual Studio Code 和 Emacs 都允许用反斜杠（`{lit}\`）后跟一个名称来输入这些字符。
例如，要输入 `{lit}α`，可以输入 `{lit}\alpha`。
在 Visual Studio Code 中，将鼠标悬停在字符上即可查看如何输入。
在 Emacs 中，将光标放在该字符上，使用 `{lit}C-c C-k`。

## 发布历史

%%%
tag := "release-history"
number := false
htmlSplit := .never
%%%

### 2025 年 10 月

本书已更新到最新的稳定版 Lean（版本 4.23.0），并新增了函数式归纳与 `{tactic}grind` 策略的介绍。

### 2025 年 8 月

这是一个维护版本，解决了从书中复制粘贴代码时出现的问题。

### 2025 年 7 月

本书已针对 Lean 4.21 更新。

### 2025 年 6 月

本书已使用 Verso 重新排版。

### 2025 年 4 月

本书已进行大量更新，并介绍了 Lean 4.18。

### 2024 年 1 月

这是一个小的错误修复版本，修复了示例程序中的一个回归问题。

### 2023 年 10 月

这是首次维护版本，修复了一些小问题，并将内容更新到与最新版 Lean 保持一致。

### 2023 年 5 月

本书现已完成！与 4 月的预发布版本相比，许多细节得到了改进，小错误也得到了修正。

### 2023 年 4 月

此次发布增加了一篇关于使用策略编写证明的插叙，以及一个结合性能与成本模型、终止性证明和程序等价性证明的最后一章。
这是最终发布之前的最后一个版本。

### 2023 年 3 月

此次发布增加了一章关于依赖类型与索引族（indexed families）编程的内容。

### 2023 年 1 月

此次发布增加了一章关于单子变换器（monad transformers）的内容，其中包括对 `{kw}do` 记法中命令式特性的介绍。

### 2022 年 12 月

此次发布增加了一章关于应用函子（applicative functors）的内容，并更详细地介绍了结构与类型类。
同时对单子的描述进行了改进。
由于冬季假期，2022 年 12 月的版本推迟到 2023 年 1 月发布。

### 2022 年 11 月

此次发布增加了一章关于单子（monads）编程的内容。此外，强制类型转换（coercions）一节中使用 JSON 的示例已更新，包含完整代码。

### 2022 年 10 月

此次发布完成了类型类一章。此外，在类型类章节之前增加了一篇简短的插叙，介绍命题、证明和策略，因为对这些概念有一点了解有助于理解标准库中的某些类型类。

### 2022 年 9 月

此次发布增加了类型类章节的前半部分。类型类是 Lean 中重载运算符的机制，也是组织代码和构建库的重要手段。此外，第二章已根据 Lean 流 API 的变化进行了更新。

### 2022 年 8 月

第三个公开版本增加了第二章，介绍如何编译和运行程序，以及 Lean 对副作用的建模方式。

### 2022 年 7 月

第二个公开版本完成了第一章。

### 2022 年 6 月

这是第一个公开版本，包含前言和第一章的部分内容。

## 关于作者

%%%
tag := "about-the-author"
%%%

David Thrane Christiansen 使用函数式语言已有二十年，使用依赖类型已有十年。
他与 Daniel P. Friedman 合著了 [_The Little Typer_](https://thelittletyper.com/)，一本介绍依赖类型论核心思想的著作。
他拥有哥本哈根 IT 大学的博士学位，在读期间曾是 Idris 语言第一版的主要贡献者。
离开学术界后，他曾在俄勒冈州波特兰的 Galois 公司和哥本哈根的 Deon Digital 公司担任软件开发人员，并担任过 Haskell Foundation 的执行董事。
在撰写本书时，他就职于 [Lean Focused Research Organization](https://lean-fro.org)，全职从事 Lean 相关工作。

## 许可协议

%%%
tag := "license"
%%%

{creativeCommons}

本书原版由 David Thrane Christiansen 受 Microsoft Corporation 委托撰写，Microsoft 慷慨地以 Creative Commons Attribution 4.0 International License 发布。
当前版本由作者根据原版修改，以适应新版 Lean 的变化。
详细变更记录可参阅本书的[源代码仓库](https://github.com/leanprover/fp-lean/)。
