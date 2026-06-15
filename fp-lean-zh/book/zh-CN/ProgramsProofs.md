# 编程、证明与性能（Programming, Proving, and Performance）

本章关于编程。
程序需要计算出正确结果，同时也需要高效地做到这点。
要编写高效的函数式程序，重要的是既要知道如何恰当使用数据结构，也要知道如何思考运行程序所需的时间和空间。

本章也关于证明。
Lean 中高效编程最重要的数据结构之一是数组，但安全使用数组需要证明数组索引在边界内。
此外，数组上大多数有趣的算法并不遵循结构递归的模式——相反，它们对数组进行迭代。
虽然这些算法会终止，Lean 不一定能自动检查这一点。
证明可以用来论证程序为何终止。

为提速而改写程序，往往得到更难理解的代码。
证明还可以表明两个程序总是计算出相同的答案，即使它们使用不同的算法或实现技术。
这样，慢而直观的程序可以作为快而复杂版本的规约。

将证明与编程结合，可以让程序既安全又高效。
证明允许省略运行时边界检查，使许多测试变得不必要，并在不引入任何运行时性能开销的情况下，为程序提供极高程度的信心。
然而，为程序证明定理可能耗时且代价高昂，因此其他工具往往更经济。

交互式定理证明是一个深奥的主题。
本章只提供一点入门，面向在 Lean 中编程时实践中会遇到的证明。
大多数有趣的定理与编程并不密切相关。
请参阅 {ref "next-steps"}[下一步] 中的资源列表以深入学习。
不过，与学习编程一样，学习写证明也没有动手实践的替代品——是时候开始了！

## 本章目录

- [尾递归](ProgramsProofs/TailRecursion.md)（Tail Recursion）
- [尾递归证明](ProgramsProofs/TailRecursionProofs.md)（Tail Recursion Proofs）
- [数组与终止性](ProgramsProofs/ArraysTermination.md)（Arrays and Termination）
- [不等式](ProgramsProofs/Inequalities.md)（Inequalities）
- [Fin](ProgramsProofs/Fin.md)（Fin）
- [插入排序](ProgramsProofs/InsertionSort.md)（Insertion Sort）
- [特殊类型](ProgramsProofs/SpecialTypes.md)（Special Types）
- [小结](ProgramsProofs/Summary.md)（Summary）