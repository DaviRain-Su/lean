# Hole

> 对应英文：[Holes](https://lean-lang.org/doc/reference/latest/Terms/Holes/)，抓取日期：2026-06-16。

hole（placeholder term）表示「此处尚未给出完整项」。在 term 位置，若上下文能唯一确定类型正确的填法，hole 可由 **unification** 自动求解；否则报错。在 **pattern** 位置，hole 表示可匹配任意值的 universal pattern。

## `_`（普通 hole）

```lean
#check @id _ Nat.zero   -- _ 被推断为 Nat
#check the _ "Hello"     -- 等价于 the String "Hello"
```

机制：`_` 会创建 fresh **metavariable**，elaborator 在检查 definitional equality 时可为其赋值。这与自动隐式参数填充是同一套基础设施。

例外（不必解完所有 hole）：

- `match` 模式里的 `_` 是 catch-all；
- 部分 tactic（如 `refine'`、`apply`）里未解的 placeholder 会变成新 goal。

## Synthetic hole：`?x` / `?_`

```lean
example (n : Nat) : n + 0 = n := by
  refine ?_   -- 产生目标 ⊢ n + 0 = n，不会被子表达式 unification 悄悄填掉
```

| | `_` | `?_` / `?m` |
| --- | --- | --- |
| 求解方式 | unification 可自动填 | **opaque**，主要由 tactic 填 |
| 在 `refine` 中 | 不一定产生 goal | 产生新 goal |
| 同名多次出现 | 各自独立 metavariable | `?m` 可指同一 metavariable |

`?_` 创建自动命名的 synthetic hole；`?m` 引用已有或新建名为 `m` 的 metavariable。proof state 里的 goal 就是这类 synthetic opaque metavariable。

## `refine` 与 `apply`

```lean
example (a b : Nat) (h : a = b) : b = a := by
  refine h.symm   -- 若类型差一点，?_ 可显式留空让用户补
```

`apply` 会把未实例化的隐式参数变成子 goal；`refine` 用你写的模板（含 `?_`）更可控。

## binder 下的 delayed assignment（进阶）

`fun (x : α) => ?s` 这类 synthetic hole 在 binder 下会走 **delayed assignment**：为 `?s` 在外层创建 `?m : α → ...`，先 elaboration 成 `fun x => ?m x`，等 `?s` 证完再赋值。这是 `intro` 等 tactic 能正常工作的底层机制。写 macro / 自定义 tactic 时才需细究；日常证明知道 `?_` 在 `fun` 下会生成带假设的 goal 即可。

调试：`set_option pp.mvars.delayed true` 可打印 delayed metavariable。

## 使用建议

- 上下文唯一时，用 `_` 最省事；
- 交互式证明、分步构造项时用 `refine` + `?_`；
- 库代码最终应无 hole；过多 hole 会让错误信息变差。