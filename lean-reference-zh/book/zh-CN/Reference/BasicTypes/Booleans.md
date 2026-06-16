# 布尔值

> 对应英文：[Booleans](https://lean-lang.org/doc/reference/latest/Basic-Types/Booleans/)，抓取日期：2026-06-16。

`Bool` 只有两个值：`true` 和 `false`。从逻辑角度看，它和 “只有真与假两种情况” 很接近；但在 Lean 中，`Bool` 与 `Prop` 仍然刻意区分：

- `Bool` 适合程序运行时分支；
- `Prop` 适合数学命题与证明。

proof 在编译后会被擦除，而 `Bool` 会在运行时代码中保留，因此它是真正的计算型真假值。

## 构造子

`Bool` 的两个构造子是：

- `Bool.true`
- `Bool.false`

它们从 `Bool` namespace 导出，因此平时直接写 `true` 和 `false`。

## 运行时表示

由于 `Bool` 是枚举式归纳类型，编译后只需一个字节即可表示。

## `Bool` 与 `Prop`

两者都表达“真/假”，但用途不同：

- `Bool` 用于程序；
- `Prop` 用于证明。

Lean 提供从 `Bool` 到 `Prop` 的 coercion：布尔值 `b` 在需要命题的位置会被解释为 `b = true`。反过来，并不是所有 proposition 都能直接在程序中做运行时判断；只有 **decidable proposition** 才能通过 `Decidable.decide` 转成 `Bool`。

因此：

- `if b then ... else ...` 里的 `b` 常是 `Bool`；
- 若条件是 proposition，Lean 会先依赖 `Decidable` instance 做判定。

## 语法

布尔逻辑常用语法包括：

- `x && y`
- `x || y`
- `x ^^ y`
- `!x`

它们分别对应：

- `Bool.and`
- `Bool.or`
- `Bool.xor`
- `Bool.not`

## API 概览

### 逻辑运算

- `cond`
- `dcond`
- `not`
- `and`
- `or`
- `xor`

其中 `and`、`or` 和 `cond` 都是 short-circuiting 的；Lean 用 `@[macro_inline]` 确保运行时只求值真正需要的分支。

### 比较

- `decEq`

### 转换

`Bool` 可转换到：

- `Nat`
- `Int`
- 各类 fixed-width integer
- `USize` / `ISize`

这些转换都遵循相同约定：`true ↦ 1`，`false ↦ 0`。

## 使用建议

- 运行时代码中的真假控制优先用 `Bool`；
- 证明里若要表达逻辑命题，优先用 `Prop`；
- 需要从 proposition 驱动程序分支时，先确认其 `Decidable` instance。
