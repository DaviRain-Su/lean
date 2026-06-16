# 如何写 `Repr` instance

> 对应英文：[How To Write a Repr Instance](https://lean-lang.org/doc/reference/latest/Interacting-with-Lean/#repr-instance-howto)，抓取日期：2026-06-16。

编写 `Repr` instance 时，核心难点不是“能不能输出字符串”，而是“在嵌套表达式里如何保持括号与优先级正确”。

## 两个常用工具

英文页特别强调：

- `addAppParen`
- `reprArg`

### `addAppParen`

当某个子表达式出现在应用位置时，如果它自身优先级较低，往往需要自动加括号。`addAppParen` 就是帮助处理这类情况的。

### `reprArg`

用于表示参数位置中的值，让其在应用上下文里具有合适的格式和括号策略。

## 实践原则

- 若输出看起来像构造器或函数应用，就必须认真处理优先级；
- 不要假定“嵌套一层也能直接读懂”，复杂值里括号通常不可省略；
- 若某类型本质是树形表达式，优先让每一层都显式决定如何打印子项。

## 经验建议

- 简单枚举类型可直接输出构造器名；
- 带参数的构造器要按“头 + 参数”形式打印；
- 若打印结果希望尽量接近 Lean 代码，就更要谨慎使用括号与参数打印 helper。