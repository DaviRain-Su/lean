# 基础类型

> 对应英文：[Basic Types](https://lean-lang.org/doc/reference/latest/Basic-Types/)，抓取日期：2026-06-16。

Lean 包含若干内建 type，它们受到 compiler 的专门支持。其中一些 type（例如 `Nat`）还在 kernel 中有特殊支持。另一些 type 本身未必有直接 compiler support，但出于性能原因，它们以重要方式依赖 type 的内部表示。

这些基础 type 同时服务于证明和编程：它们既是数学对象，也是可编译程序中的数据结构。理解它们的逻辑模型、运行时表示和相关 type class instance，有助于写出既可证明又可执行的 Lean 代码。

## 数值类型

英文参考手册首先介绍数值相关 type：

- `Nat`：自然数。它在 kernel 中有特殊地位，也有高效运行时表示。
- `Int`：整数。
- `Fin n`：小于 `n` 的有限自然数，常用于带边界的索引。
- 固定位宽整数：适合与底层机器整数和外部接口交互。
- bitvector：用于位级推理、硬件/低层程序建模和 `bv_decide` 相关自动化。
- floating-point number：用于浮点计算。

## 文本与字符

Lean 提供：

- `Char`：Unicode scalar value；
- `String`：字符串。

这些类型在运行时有专门表示，并配有常用操作和 notation。

## 基础数据结构

常见基础数据结构包括：

- `Unit`：只有一个值的类型；
- `Empty`：没有值的类型；
- `Bool`：布尔值；
- `Option α`：可选值；
- tuple / product type；
- sum type；
- linked list；
- array；
- byte array；
- range；
- map 和 set。

其中一些是归纳类型，一些有特殊运行时表示，一些来自标准库抽象。

## Subtype 与 lazy computation

`Subtype` 把一个值和关于该值满足某个 predicate 的 proof 组合在一起。它常用于表达带 refinement 的数据，例如小于某上界的值、满足不变量的数据结构元素等。

lazy computation 用于延迟计算，避免在值真正需要之前执行某些工作。结合 reference counting 和 compiler 优化，它可以用于控制程序性能和 evaluation order。

## 后续小节

英文参考手册随后把本章展开为：

- 20.1 Natural Numbers
- 20.2 Integers
- 20.3 Finite Natural Numbers
- 20.4 Fixed-Precision Integers
- 20.5 Bitvectors
- 20.6 Floating-Point Numbers
- 20.7 Characters
- 20.8 Strings
- 20.9 The Unit Type
- 20.10 The Empty Type
- 20.11 Booleans
- 20.12 Optional Values
- 20.13 Tuples
- 20.14 Sum Types
- 20.15 Linked Lists
- 20.16 Arrays
- 20.17 Byte Arrays
- 20.18 Ranges
- 20.19 Maps and Sets
- 20.20 Subtypes
- 20.21 Lazy Computations