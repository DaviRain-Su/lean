# 整数

> 对应英文：[Integers](https://lean-lang.org/doc/reference/latest/Basic-Types/Integers/)，抓取日期：2026-06-16。

`Int` 表示整数，包含正数、负数和零。和 `Nat` 一样，`Int` 既有逻辑模型，也有经运行时优化的表示。

## 逻辑模型

从逻辑角度看，整数类型提供了普通整数运算所需的结构和 API。英文页把它分成：

- logical model
- run-time representation
- syntax
- API reference

API 进一步分为：

- properties
- conversion
- arithmetic
- division
- bitwise operator
- comparison

## 运行时表示

Lean 对整数提供高效运行时支持，而不要求用户手动以“符号 + 自然数”或 quotient 形式编码整数。与 `Nat` 类似，常用 arithmetic 和 comparison 都在运行时有优化实现。

## 语法

整数通常以字面量形式书写，负数可直接写 `-3`。这类写法在高层语法中自然出现，但 elaboration 和 runtime 会把它们映射到底层 `Int` 表示与运算。

## API 特点

整数 API 与自然数 API 相似，但更贴近通常代数意义：

- 可表示负数；
- division / remainder 语义需注意负数参与时的约定；
- bitwise operation 也可用于整数；
- comparison 与 conversion 支持在 `Int`、`Nat`、fixed-width integer、`Float` 等之间切换。

## 使用建议

- 如果问题逻辑要求“不会小于零”，优先使用 `Nat` 或 `Fin`；
- 如果必须表达负数、差值或双向偏移，使用 `Int` 更自然；
- 证明中要小心 `Nat` 与 `Int` coercion，尤其在 arithmetic simplification、comparison 和 field notation 中。
