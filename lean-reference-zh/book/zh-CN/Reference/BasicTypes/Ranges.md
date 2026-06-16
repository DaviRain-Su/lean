# Range

> 对应英文：[Ranges](https://lean-lang.org/doc/reference/latest/Basic-Types/Ranges/)，抓取日期：2026-06-16。

range 表示某种类型上一段连续区间。它由下界和上界描述；边界既可以是开区间，也可以是闭区间；任一方向都可以是无穷延伸。

## 语法

Lean 为 range 提供专门语法，核心是 `...`。典型写法包括：

- `a...b`：左闭右开，对应 `Std.Rco`
- `a...<b`：左闭右开，和上式等价
- `a...=b`：左闭右闭，对应 `Std.Rcc`
- `a...*`：左闭右无界，对应 `Std.Rci`
- `a<...b`：左开右开，对应 `Std.Roo`
- `a<...=b`：左开右闭，对应 `Std.Roc`
- `*...b` / `*...<b` / `*...=b`：左无界
- `*...*`：双向无界

默认规则：

- 左边默认闭；
- 右边默认开。

## Range 类型

标准库为不同边界组合提供不同类型，例如：

- `Std.Rco`
- `Std.Rcc`
- `Std.Rci`
- `Std.Roo`
- `Std.Roc`
- `Std.Roi`
- `Std.Rio`
- `Std.Ric`
- `Std.Rii`

每种类型通常都提供：

- `iter`
- `toArray`
- `toList`
- `size`
- `isEmpty`

## 相关 type class

range 依赖若干 supporting class 来描述“如何沿某个类型向上枚举”以及“如何判断某类 range 是否总是有限”。英文页特别列出：

- `UpwardEnumerable`
- `LawfulUpwardEnumerable`
- `Least?`
- `InfinitelyUpwardEnumerable`
- `LinearlyUpwardEnumerable`
- `HasSize`
- `IsAlwaysFinite`

这些类让 range 不只适用于自然数，也能适用于其他具备有序枚举结构的类型。

## Ranges 与切片

ranges 还可用于 slice 相关场景。某些类型实现 `Sliceable` 后，range 就能作为它们的切片描述方式。

## 使用建议

- 表达“从某点到某点的一段连续区间”时，range 比手写 `(lower, upper, flags)` 更清晰；
- 若只是在 `Nat` 上简单循环，也可直接用更具体的 collection/iterator API；
- 若读者不熟悉某个边界组合，适当加注释说明“左闭右开”等语义。
