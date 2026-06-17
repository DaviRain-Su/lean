# 函数抽象

> 对应英文：[Function Abstractions](https://lean-lang.org/doc/reference/latest/The-Type-System/Functions/#The-Lean-Language-Reference--The-Type-System--Functions--Function-Abstractions)，抓取日期：2026-06-16。

在 Lean 的类型论中，函数通过 **function abstraction** 构造，也就是我们熟悉的 lambda / 匿名函数。它绑定一个变量，并把该变量用于函数体中。

## 基本形式

```lean
fun x => body
```

逻辑上，这会产生一个函数：给它一个参数，就把该参数代入 `body` 中。

## β-reduction

函数应用后的结果通过 β-reduction 获得，也就是“把实参替换到绑定变量位置”。

- 在编译后的代码里，这种替换只会在参数已经是值时发生；
- 在 type checking 的 definitional equality 中，没有这种限制，任意 term 都可参与 β-reduction。

## 高层语法与核心语言

Lean 的 term 语言允许：

- 多参数函数抽象
- pattern matching 风格的函数定义

但这些都只是高层语法。elaboration 之后，Lean 核心语言里的每个函数抽象都只绑定**一个**参数。

## 不只是 abstraction 才有函数类型

虽然很多函数来自 `fun`，但并不是所有函数值都必须通过 function abstraction 定义。例如：

- type constructor
- constructor
- recursor

也都可能具有函数类型。

## 使用建议

- 读证明或程序时，把 `fun` 看成“构造函数值”的最基本机制；
- 调试 definitional equality 时，要记住 β-reduction 是核心步骤；
- 高层多参数函数最终都会变成单参数 abstraction 的嵌套。