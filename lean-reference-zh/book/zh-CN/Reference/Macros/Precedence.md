# Precedence

> 对应英文：[Precedence](https://lean-lang.org/doc/reference/latest/Notations-and-Macros/Precedence/)，抓取日期：2026-06-16。

Lean 的 infix operator、notation 和其他 syntax extension 都使用显式 precedence annotation。技术上，Lean precedence 可以是任意自然数；按惯例，它们通常位于 10 到 1024 之间，最低和最高分别记为 `min` 与 `max`。函数应用具有最高优先级。

## 显式数字

多数 operator precedence 直接写为数字：

```lean
infixl:65 " +++ " => appendLike
```

数字越大，绑定越紧。

## 相对 precedence

precedence 也可以用和差表示，通常用于相对于具名 precedence 指定层级：

```lean
max - 1
arg + 1
(min + 10)
```

这对复杂 syntax extension 很有用，因为它可以表达“和函数参数一样紧”“略低于最高优先级”等关系。

## `max`

`max` 是最高 precedence，用于解析函数位置中的 term。普通 operator 通常不应使用这一层级，因为用户通常期望函数应用比任何 operator 都绑定更紧；但在复杂 syntax extension 中，`max` 可用于描述与函数应用的交互。

## `arg`

`arg` 比 `max` 小 1。它适合定义应当被当作函数参数的 syntax，例如 `fun` 或 `do`。

## `lead`

`lead` 小于 `arg`，适合不应作为函数参数出现的自定义 syntax，例如 `let` 风格结构。

## `min`

`min` 是最低 precedence，可用于确保某个 operator 比所有其他 operator 绑定更松。

## 经验规则

- 普通 arithmetic-like operator 使用中间范围数字。
- binder、`do`、`fun` 类语法通常接近 `arg` 或 `lead`。
- 希望 expression 尽可能向外扩展时用较低 precedence。
- 不确定时，明确要求用户加括号比定义一个过于“聪明”的 precedence 更安全。
