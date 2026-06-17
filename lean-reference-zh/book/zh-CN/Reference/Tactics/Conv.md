# 用 `conv` 做定点重写

> 对应英文：[Targeted Rewriting with conv](https://lean-lang.org/doc/reference/latest/Tactic-Proofs/Targeted-Rewriting-with--conv/)，抓取日期：2026-06-16。

`conv`（conversion tactic）允许在 goal 或 hypothesis 的**指定子表达式**上做重写。它适合两类场景：

- 重写只应发生在 goal 的某一部分，而不是全局 `rw`；
- 需要在 binder 下方改写，而普通 `rw` 不容易到达该位置。

`conv` 使用一门与主 tactic 语言互操作的专用小语言：既能导航到某个子项，也能在那里执行 rewrite、simp、reduction 等操作。

## 基本形式

```lean
conv => cs
conv at h => cs
conv in pat => cs
```

- `conv => cs`：在当前 goal 上改写；
- `conv at h => cs`：改写假设 `h`；
- `conv in pat => cs`：改写第一个匹配 `pat` 的子表达式。

## 与普通 tactic 的关系

`conv` proof state 与普通 tactic proof state 很像：

- 有 main goal；
- tactic 可能成功或失败；
- 也支持组合子和 macro expansion。

区别在于，`conv` 的目标不是直接证明当前 goal，而是把目标改造成更适合后续普通 tactic 处理的形式。`conv` goal 在显示时通常用竖线而不是 turnstile 表示。

## 控制结构

`conv` 也支持类似主 tactic 语言的控制结构：

- `first`
- `try`
- `<;>`
- `repeat`
- `skip`
- `{ ... }`
- `( ... )`
- `done`
- `all_goals`
- `any_goals`
- `case` / `case'`
- `next`
- `focus`
- `·`
- `fail_if_success`

这意味着可以写出复杂的 conversion script，而不只是单步 rewrite。

## 导航

`conv` 的精髓在于导航。常见命令：

- `lhs` / `rhs`：进入等式左右侧；
- `fun`：进入函数位置；
- `congr` / `args`：按参数拆分；
- `arg i` / `arg @i`：进入第 `i` 个参数；
- `enter [...]`：用紧凑路径语法描述深入子项的路线；
- `pattern pat`：定位匹配某个模式的子项；
- `ext` / `intro`：进入 binder；
- `left` / `right`：`lhs` / `rhs` 的同义词。

其中 `pattern` 特别有用：它可以只重写第一个匹配项，或指定 occurrence 集合，从而精准控制 rewrite 发生的位置。

## 改变目标

在定位到子项后，常见操作分三类。

### Reduction

- `cbv`
- `whnf`
- `reduce`
- `zeta`
- `delta`
- `unfold`

### Simplification

- `simp`
- `dsimp`
- `simp_match`

### Rewriting

- `change`
- `rewrite`
- `rw`
- `erw`
- `apply`

因此，`conv` 不是一个单一 tactic，而更像“在子表达式上运行小型 tactic 环境”。

## 嵌套 tactic

`conv` 与普通 tactic 可以嵌套：

- `conv'`
- `tactic`
- `tactic'`

这让你能在 conversion 过程中临时切回普通 tactic，或在普通 goal 中嵌入 conversion block。

## 调试

- `trace_state`：打印当前 `conv` goal 状态。

## 何时优先用 `conv`

- 要只重写等式一侧；
- 要在 lambda / forall / match 等 binder 下改写；
- 要避免 `rw` 把多个相同模式一起改掉；
- 要配合 `simp`、`unfold`、`change` 精确整理某个深层子项。

若只是简单全局 rewrite，普通 `rw` / `simp` 往往更直接。

## 示例 1：只改括号里的 `y + z`

目标里有多处 `+`，`rw` 默认改最左最外层。用 `conv` 先导航到内层：

```lean
example (x y z : Nat) : x + (y + z) = x + z + y := by
  conv =>
    lhs
    arg 2
    rw [Nat.add_comm]
  rw [Nat.add_assoc]
```

步骤解读：

1. `lhs` — 进入等式左边 `x + (y + z)`；
2. `arg 2` — 进入第二个参数，即 `y + z`；
3. `rw [Nat.add_comm]` — 只在这里交换加数；
4. 回到普通 goal 后用 `Nat.add_assoc` 整理括号。

`enter` 可写成紧凑路径：`enter [1, 2]`（等价于 `arg 1` 再 `arg 2`，具体以当前目标形状为准）。

## 示例 2：在 binder 下改写

`rw` 无法直接改 `fun x y z => ...` 函数体里的子式，需 `conv` + `intro`：

```lean
example :
    (fun (x y z : Nat) => x + (y + z))
    = (fun x y z => (z + x) + y) := by
  conv =>
    lhs
    intro x y z
    conv =>
      arg 2
      rw [Nat.add_comm]
    rw [← Nat.add_assoc]
    arg 1
    rw [Nat.add_comm]
```

内层 `conv` 改完子式后会回到外层位置；若子目标已是自反等式，`conv` 可自动关闭。

## 示例 3：`pattern` 与 `conv in`

只改第一个匹配 `y + z` 的子式：

```lean
example (x y z : Nat) : x + (y + z) + (y + z) = x + (z + y) + (z + y) := by
  conv in y + z =>
    rw [Nat.add_comm]
  rfl
```

`pattern (occs := .pos [2]) (y + z)` 可指定第 2 个匹配（类似 `rw` 的 `occs`）。

## 与普通 `rw` 的选型

| 场景 | 优先 |
| --- | --- |
| 全局一处替换 | `rw` |
| 等式只有一侧、或第 n 个 `+` | `conv` + `lhs`/`arg` |
| `λ` / `∀` 内部 | `conv` + `intro` |
| 学习站示例 10「只改第二个 2」 | `rw (occs := .pos [2])` 或 `conv` |

更多交互式说明见 [Theorem Proving in Lean 4 — conv](https://lean-lang.org/theorem_proving_in_lean4/conv.html)。