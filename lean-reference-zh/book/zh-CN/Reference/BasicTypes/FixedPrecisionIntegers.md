# 定长整数

> 对应英文：[Fixed-Precision Integers](https://lean-lang.org/doc/reference/latest/Basic-Types/Fixed-Precision-Integers/)，抓取日期：2026-06-16。

Lean 标准库提供常见的定长整数类型。对证明而言，它们本质上是相应位宽 bitvector 的包装；对编译器而言，它们有专门支持，因此运行时表示很高效。

## 两大类

### 无符号

- `USize`
- `UInt8`
- `UInt16`
- `UInt32`
- `UInt64`

### 有符号

- `ISize`
- `Int8`
- `Int16`
- `Int32`
- `Int64`

有符号版本通过对应无符号版本的 two's complement 表示来建模。

## 逻辑模型

从逻辑角度看：

- 无符号整数基本是相应宽度 `BitVec` 的结构包装；
- 有符号整数包装对应无符号整数，并按二补码解释。

这使它们适合低层程序、位运算与机器整数相关证明。

## 运行时表示

编译器对这些类型有专门支持：

- 小位宽整数在许多上下文中可直接无装箱表示；
- 在多态容器里则可能需要 boxing；
- 单态代码路径通常能获得高效原生表示。

## 语法

它们都有 `OfNat` instance，因此可直接写数值字面量；有符号类型还有 `Neg` instance，可直接写负数。

若字面量溢出位宽，则按模该位宽解释；有符号类型再按二补码解释。

## API 概览

英文页把 API 分为：

- sizes
- ranges
- conversions
- comparisons
- arithmetic
- bitwise operations

### sizes / ranges

常见有：

- `UInt8.size`、`Int32.size`
- `Int8.minValue`、`Int8.maxValue`
- `ISize.minValue`、`ISize.maxValue`

### conversions

涵盖：

- 到/从 `Int`
- 到/从 `Nat`
- 各固定宽度整数互转
- 到 floating-point
- 到/从 bitvector
- 到/从 `Fin`
- 到字符

### arithmetic / bitwise

常见包括：

- `add`、`sub`、`mul`、`div`、`mod`
- `neg`、`abs`
- `shiftLeft`、`shiftRight`
- `land`、`lor`、`xor`
- `complement`

## 使用建议

- 与底层数据格式、协议、位运算或机器表示交互时，优先用这些定长整数。
- 若需要无界精度数学整数，仍应使用 `Int` 或 `Nat`。
- 证明时要记住：这些类型带有固定位宽与溢出语义，不等同于无界整数。