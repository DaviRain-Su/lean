# 在类型之间 coercion

> 对应英文：[Coercing Between Types](https://lean-lang.org/doc/reference/latest/Coercions/Coercing-Between-Types/)，抓取日期：2026-06-16。

当 elaborator 已成功构造一个 term，却发现其推断类型和当前上下文期望类型不同，就会尝试“在类型之间”的 coercion。

## 两种成功路径

### 1. 非依赖 coercion 链

Lean 可以通过若干中间类型把“推断类型”连到“期望类型”。这类链式 coercion 只依赖两端的类型，不依赖具体被 coercion 的值。

### 2. 单个依赖 coercion

Lean 也可以使用一个 **dependent coercion**。这类 coercion 不只看源类型和目标类型，还会把“当前被 coercion 的 term 值”也纳入考虑。因此它更适合“只有某些值能被 coercion”的场景，例如把**可判定命题** coercion 成 `Bool`。

dependent coercion 不能链式组合；它必须精确匹配当前类型错误。

## 最常用的 class：`Coe`

最简单的非依赖 coercion 实现方式，是定义一个 `Coe` 实例。大多数普通 coercion 都应该写成 `Coe`。

但 Lean 还有一些更细的 class，用于控制链中位置：

- `CoeHead`
- `CoeOut`
- `Coe`
- `CoeTail`
- `CoeT`
- `CoeDep`

## 链的结构

普通 coercion 链符合：

- 可选一个 `CoeHead`
- 零个或多个 `CoeOut`
- 零个或多个 `Coe`
- 可选一个 `CoeTail`

如果走 dependent coercion，则改用单个 `CoeDep`，不再链式拼接。

## `CoeOut` 与 `Coe`

二者的关键区别在于：

- `CoeOut` 更适合“输出类型中的变量来自输入类型”这类方向；
- `Coe` 更适合“输入类型中的变量可由输出类型提供信息”这类方向。

它们都依赖 semi-output parameter 的匹配行为；也正因为如此，只有理解 instance synthesis 参数流向时，才需要细分使用它们。大多数用户场景里，普通 `Coe` 就够了。

## 显式语法：`↑x`

```lean
↑x
```

可显式请求“在类型之间”的 coercion。相比双重 type ascription，它不需要手写两端类型；但若要非常精确地约束 coercion 路径，双重 ascription 仍更强。

## `NatCast` / `IntCast`

从 `Nat` 或 `Int` 到其他类型的“规范性嵌入”通常不走普通任意 coercion 链，而更适合：

- `NatCast`
- `IntCast`

它们的设计目标，是让数学库中“把自然数/整数看作别的结构里的元素”时能保持稳定、统一的 simp normal form，避免不同 coercion 链破坏重写和 simplification 体验。

## 使用建议

- 普通“所有值都可转换”的场景，优先 `Coe`。
- 只有某些值可转换、或目标类型取决于值本身时，再考虑 `CoeDep`。
- 数学上从 `Nat` / `Int` 进入更大结构时，优先规范的 `NatCast` / `IntCast` 风格，而不是随意链式 coercion。