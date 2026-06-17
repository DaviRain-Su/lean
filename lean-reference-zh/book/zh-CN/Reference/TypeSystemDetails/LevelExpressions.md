# universe level 表达式

> 对应英文：[Level Expressions](https://lean-lang.org/doc/reference/latest/The-Type-System/Universes/#level-expressions)，抓取日期：2026-06-16。

universe 参数并不只是“某个抽象整数变量”。Lean 允许把 universe level 组合成表达式，用来精确描述类型应落在哪一层。

## 常见形式

英文页列出的典型 level expression 包括：

- `u`
- `u + 1`
- `max u v`
- `imax u v`

## `u + 1`

最常见用途是表达“某个类型的类型”在更高一层。例如：

- 若 `α : Sort u`
- 那么“以 `α` 为成员的某种普通数据结构”通常会落在不低于 `Sort u` 的层
- 而“`α` 这个类型本身”的类型则要落在 `Sort (u + 1)`

## `max`

`max u v` 表示“至少和 `u`、`v` 一样大”的最小 universe。它常出现在：

- product / sum / structure 把两个不同层级类型打包在一起时；
- 函数类型需要同时容纳参数和结果 universe 时。

## `imax`

`imax` 是专门服务 `Prop` impredicativity 规则的组合器。直觉上，它在处理“如果结果在 `Prop` 中，则整体也可落在 `Prop`”这类情况时，比普通 `max` 更精细。

## 为什么要显式关心它们

- 调试 universe mismatch 时，错误信息经常直接显示这些表达式；
- 写 universe-polymorphic 库时，你需要知道“这个类型为什么在 `max u v`，而不是在 `u`”；
- 读 Lean 自动生成的 recursor、结构体类型和高阶抽象时，经常会看到它们。

## 使用建议

- 普通应用层代码里通常不用手写复杂 level expression；
- 一旦开始写 universe-polymorphic 抽象，就应把 `u + 1`、`max`、`imax` 看成基础工具，而不是异常符号。