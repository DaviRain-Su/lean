# 认识 Lean

按照传统，介绍一门编程语言时通常会先编译并运行一个在控制台显示 `"Hello, world!"` 的程序。这个简单程序可以确认语言工具链安装正确，并且程序员能够成功运行编译后的代码。

然而，自 20 世纪 70 年代以来，编程的方式已经发生了很大变化。如今，编译器通常集成在文本编辑器中，编程环境会在程序员编写代码时实时提供反馈。Lean 也不例外：它实现了扩展版的 Language Server Protocol（语言服务器协议），能够与文本编辑器通信，在用户输入时提供反馈。

Python、Haskell 和 JavaScript 等各种语言都提供了 read-eval-print-loop（REPL，读-求值-打印循环），也称为交互式顶层环境或浏览器控制台。用户可以在其中输入表达式或语句，语言随后计算并显示输入的结果。而 Lean 则将这些特性融入了与编辑器的交互中，提供一些命令让文本编辑器把反馈直接显示在程序文本里。本章简要介绍如何在编辑器中与 Lean 交互；下一章“Hello, World!”则介绍如何以传统方式从命令行批量使用 Lean。

阅读本书时，最好同时在你的编辑器中打开 Lean，跟随书中的例子并亲手输入每一个示例。请多动手尝试这些例子，看看会发生什么！

## 本章目录

- 求值表达式（Evaluating Expressions）
- 类型（Types）
- 函数与定义（Functions and Definitions）
- 结构体（Structures）
- 数据类型与模式匹配（Datatypes and Patterns）
- 多态性（Polymorphism）
- 便捷写法（Conveniences）
- 本章小结（Summary）
