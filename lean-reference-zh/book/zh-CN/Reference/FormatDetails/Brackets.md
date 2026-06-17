# 括号与方括号

> 对应英文：[Brackets and Parentheses](https://lean-lang.org/doc/reference/latest/Interacting-with-Lean/#The-Lean-Language-Reference--Interacting-with-Lean--Formatted-Output--Format--Brackets-and-Parentheses)，抓取日期：2026-06-16。

很多结构化输出都需要“外围符号 + 内部内容”的组合。`Format` 对这种模式提供了一组专门工具，而不只是让用户手写字符串拼接。

## 常见工具

英文页列出：

- `bracket`
- `sbracket`
- `paren`
- `bracketFill`

## 它们的用途

- `paren`：用圆括号包裹内容；
- `sbracket`：用方括号包裹内容；
- `bracket`：更一般的“用一对符号包裹”；
- `bracketFill`：在有多个子项时，配合填充/折行策略一起打印括号结构。

## 为什么它们重要

括号并不只是字面字符，还隐含：

- 若内容一行放得下，是否压成一行；
- 若需要换行，内部内容如何缩进；
- 结束括号是否独占一行还是跟随最后一项。

这些正是 `Format` 专门建模的布局信息。

## 使用建议

- 打印列表、参数组、tuple、结构化表达式时，优先用这些工具；
- 若你已经在手工管理括号和换行，往往说明应回退到更高层的 `Format` API。