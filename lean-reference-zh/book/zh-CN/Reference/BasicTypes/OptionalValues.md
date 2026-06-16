# 可选值

> 对应英文：[Optional Values](https://lean-lang.org/doc/reference/latest/Basic-Types/Optional-Values/)，抓取日期：2026-06-16。

`Option α` 表示“要么有一个 `α` 值，要么没有值”。它有两个构造子：

- `none`
- `some val`

在函数式编程中，它类似 nullable type：`none` 表示值缺失。部分函数 `α → β` 也可以写成 `α → Option β`；当输入超出定义域时返回 `none`。

从计算角度看，`Option` 可以表示“可能失败，但不携带错误信息”的计算；它也可以看作“最多含一个元素的容器”。标准库 API 经常利用这种容器视角。

## Coercion

Lean 提供从 `α` 到 `Option α` 的 coercion，会自动把值包成 `some`。因此在很多场景里，`Option` 可像“可空值”一样使用：存在时直接写值，不存在时写 `none`。

## 提取值

常用提取方式包括：

- `get`：需要证明当前确实是 `some`；
- `get!`：`none` 时 panic；
- `getD`：给默认值；
- `getDM`：monadic 默认值；
- `getM`：把 `Option` 提升到任意 `Alternative`。

`elim` / `elimM` 提供 `Option` 的 case analysis。

## 性质与比较

常见查询包括：

- `isNone`
- `isSome`
- `isEqSome`
- `min` / `max`
- `lt`

标准约定里，`none` 往往作为“最小元素”。

## 容器与控制流视角

从容器角度看，`Option` 像长度至多为 1 的 collection，因此有：

- `toArray`
- `toList`
- `map`
- `filter`
- `all`
- `any`
- `forM`

从“可能失败的计算”视角看，`Option` 也是一个 monad / alternative：

- `bind`
- `join`
- `sequence`
- `guard`
- `orElse`
- `tryCatch`

这使它非常适合表示“查找不到就失败”“验证条件不满足就中止”等控制流。

## 使用建议

- 缺失值用 `Option`，而不是用某个特殊 sentinel。
- 如果需要错误信息，改用 `Except ε α`。
- 若只想要默认值，优先用 `getD`；需要 effectful 默认值时用 `getDM`。
