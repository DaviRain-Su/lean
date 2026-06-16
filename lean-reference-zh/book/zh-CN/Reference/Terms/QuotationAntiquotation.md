# quotation 与 antiquotation

> 对应英文：[Quotation and Antiquotation](https://lean-lang.org/doc/reference/latest/Terms/Quotation-and-Antiquotation/)，抓取日期：2026-06-16。

这一页本身很短，它主要起导航作用：quotation term 的详细说明放在专门的 quotation 章节，而不在这里重复展开。

## 它在 term 体系中的位置

quotation / antiquotation 之所以仍归到 `Terms` 下面，是因为：

- 用户可以直接把它们写成 term；
- 它们是元编程中构造和拼接语法对象的核心工具；
- 它们与 macro、custom elaborator、syntax extension 紧密相连。

## 该去哪里看细节

若你关心：

- 如何把 Lean 语法当作数据值构造；
- 如何在模板中插入已有 syntax；
- quotation 如何与 hygiene、macro expansion 交互；

就应去 quotation 的专门章节和 `Notations and Macros` 的相关小节继续看。

## 使用建议

- 普通证明和程序开发中，这一页更多是“知道它存在”；
- 真正写 macro、syntax extension、metaprogram 时，再深入 quotation / antiquotation 的细节。