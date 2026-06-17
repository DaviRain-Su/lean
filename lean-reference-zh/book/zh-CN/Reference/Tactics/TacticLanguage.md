# Tactic 语言

> 对应英文：[The Tactic Language](https://lean-lang.org/doc/reference/latest/Tactic-Proofs/The-Tactic-Language/)，抓取日期：2026-06-16。

一个 tactic script 是一串 tactic 的序列。它们可以用分号分隔，也可以按相同缩进逐行书写；若某处语法上只允许一个 tactic，也可以用括号把一串 tactic 组合起来。

通常执行顺序是自上而下：每个 tactic 都在上一个 tactic 留下的 proof state 上运行。不过，tactic 语言还提供了一套控制结构，可以改变这一流程。

## 成功与失败

每个 tactic 要么成功，要么失败。失败类似异常：会一直向外冒泡，直到被更外层控制结构处理。

常见控制结构：

- `fail`：总是失败，并给出消息；
- `fail_if_success t`：若 `t` 成功则失败；
- `try t`：运行 `t`，即使失败也整体成功；
- `first | t1 | t2 | ...`：依次尝试，取第一个成功分支。

## 分支

在 tactic mode 中，`if` 和 `match` 不是“运行时选一个分支”，而是**做分类讨论**。

- `if h : t then ... else ...` 可视为 `by_cases h : t` 的语法糖；
- tactic 中的 `match` 会对 discriminant 做 cases analysis，每个分支都必须分别完成证明。

这和 term mode 的 `if` / `match` 差异很大：proof 脚本是对所有情况同时推理，而不是对某个已知值执行程序。

## goal 选择与多 goal 处理

多数 tactic 只作用于 main goal。常见 goal 管理工具：

- `case` / `case'`
- `rotate_left` / `rotate_right`
- `<;>`
- `all_goals`
- `any_goals`

其中：

- `tac <;> tac'`：先运行 `tac`，再对它生成的每个子 goal 运行 `tac'`；
- `all_goals tac`：把 `tac` 应用于每个 goal，若有任一失败则整体失败；
- `any_goals tac`：只要求至少一个 goal 应用成功。

## 聚焦与子证明结构

聚焦类 tactic 用于把后续脚本限制在某个 goal 上：

- `·` bullet
- `next`
- `focus`
- `case` / `case'`

良好风格通常要求：一旦某行 tactic 生成多个子 goal，就尽快使用 bullet 或 `case` 把它们分开。这会让 proof 更稳，也更容易维护。

## 重复与迭代

- `iterate n tac`：精确运行 `n` 次；
- `iterate tac`：运行直到失败；
- `repeat tac`：反复应用 `tac`，每次失败时回滚该次局部效果；
- `repeat' tac`：递归地对所有新 goal 重复；
- `repeat1' tac`：像 `repeat'`，但要求至少成功一次。

这些 combinator 很适合写轻量自动化，但必须保证最终会停止。

## 名字与 hygiene

tactic 语言是 **hygienic** 的：脚本中名字的含义由源代码中的词法作用域决定，而不是由 tactic 生成 term 时临时取的内部名字决定。这样可以避免变量捕获，也让 proof 对 tactic 内部实现细节更稳定。

选项：

- `tactic.hygienic`：默认 `true`。

通常不建议关闭它。

## 假设管理与局部定义

常见假设管理 tactic：

- `rename`
- `revert`
- `clear`
- `rename_i`

局部证明/定义相关 tactic：

- `have`
- `have'`
- `let`
- `let rec`
- `letI`
- `let'`

一般经验：

- 中间 lemma 用 `have`；
- 真正的局部定义用 `let`；
- 若想保证某个局部对象不可展开，也可用 `have` 引入非 proposition，但应有明确性能或表达上的理由。

## namespace 与 option 管理

tactic 中也可以临时调整：

- `set_option`
- `open`
- `with_reducible`
- `with_reducible_and_instances`
- `with_unfolding_all`

这些构造主要用于控制 elaboration、instance search 和 unfolding 行为。

## 示例：控制流

`first` 与 `try`：

```lean
example (p q : Prop) (hp : p) : p ∨ q := by
  first | apply Or.inl; exact hp | apply Or.inr; sorry
```

`tac <;> tac'`（先 `tac`，再对每个子 goal 跑 `tac'`）：

```lean
example (a b : Nat) : a + 0 = a ∧ b + 0 = b := by
  constructor <;> simp
```

## 示例：分支 = 分类讨论

tactic 里的 `if` 不是运行时分支，而是对两种情况都要证：

```lean
example (p q : Prop) (hp : p) : p ∨ q := by
  if h : p then exact Or.inl hp else exact Or.inr (by sorry)
```

`match` 同理——每个分支都是独立子证明。

## 示例：多 goal 与 bullet

```lean
theorem and_comm (p q : Prop) (hp : p) (hq : q) : q ∧ p := by
  apply And.intro
  · exact hq
  · exact hp
```

`·` 聚焦第一个子 goal；`case` 可按名称选 goal：`case left => ...`。

## 示例：假设管理

```lean
example (a b c : Nat) (h : a + b = c) : c = a + b := by
  have h' : c = a + b := h.symm
  exact h'
```

`clear` 删掉无用假设；`revert` 把变量移回目标；`rename_i x y` 给不可访问假设起名。

## 组合子速查

| 组合子 | 行为 |
| --- | --- |
| `t1; t2` | 顺序执行 |
| `t1 <;> t2` | `t1` 后对每个子 goal 执行 `t2` |
| `all_goals t` | 每个 goal 都要成功 |
| `any_goals t` | 至少一个 goal 成功即可 |
| `focus t` | 只看 main goal |
| `repeat t` | 重复直到失败并回滚最后一次 |
| `iterate n t` | 精确 `n` 次 |
