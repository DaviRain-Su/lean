# 条件表达式

> 对应英文：[Conditionals](https://lean-lang.org/doc/reference/latest/Terms/Conditionals/)，抓取日期：2026-06-16。

Lean 的条件表达式用来根据某个 proposition 或布尔条件做分支。虽然它和 tactic 语言里的 `if`、以及 `do` notation 里的某些语法看起来相似，但它们并不是同一套语法实体。

## `if ... then ... else ...`

最基本的条件表达式是：

```lean
if c then t else e
```

这里 `c` 通常是 proposition。由于 Lean 不能对任意 proposition 直接“运行时求值”，所以它要求该 proposition 有 `Decidable` instance。

此外，Lean 有从 `Bool` 到 `Prop` 的 coercion，把一个 `Bool` 看成“它等于 `true`”这一命题，因此布尔条件也能自然接入。

## 带命名假设的条件

Lean 还支持：

```lean
if h : p then t else e
```

这不仅做分支，还会在两个分支中加入关于 `p` 为真/假的局部证据：

- then 分支里可用 `h : p`
- else 分支里可用“`p` 不成立”的对应信息

这类写法很适合：

- 运行时检查产生静态证明信息
- 下标安全、边界检查、分支后消除不可能情况

## `if let`

Lean 还支持 pattern-matching 条件：

```lean
if let pat := val then t else e
```

若 `val` 匹配 `pat`，则进入 then 分支，并绑定 pattern 里的变量；否则进入 else 分支。

它可视为更轻量的“单次匹配 + 两分支”写法。

## `bif`

如果你只想要**纯布尔条件**，可用：

```lean
bif b then t else e
```

它避免 proposition / decidability 相关层，明确表达“这里就是一个 `Bool`”。

## 使用建议

- 条件本质上是 proposition 时，用 `if`。
- 希望在分支中获得静态证据时，用 `if h : p then ... else ...`。
- 只想对布尔值分支时，用 `bif`。
- 单次模式匹配场景里，`if let` 往往比完整 `match` 更紧凑。