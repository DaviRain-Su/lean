# tactic 选项

> 对应英文：[Options](https://lean-lang.org/doc/reference/latest/Tactic-Proofs/Options/)，抓取日期：2026-06-16。

这一页列出会直接影响 tactic 语义的几个选项。它们不像普通 pretty-printer 或 editor 选项那样只改变显示，而是真能改变 tactic 如何工作。

## `tactic.customEliminators`

默认值：`true`

作用：允许 `induction` 和 `cases` tactic 使用通过：

- `@[induction_eliminator]`
- `@[cases_eliminator]`

注册的自定义 eliminator。

### 何时重要

如果某个类型或结构希望自定义更合适的归纳/分情况原则，这个选项决定 tactic 是否会尊重这些定制。

## `tactic.skipAssignedInstances`

默认值：`true`

作用：在 `rw` 和 `simp` 中，如果某个实例隐式参数已经被赋值，就不要再对它运行 instance synthesis。

### 为什么有用

这能避免：

- 不必要的重复实例搜索；
- 某些 rewrite / simplification 过程中意外触发更昂贵的 type class 推断；
- 在已有实例信息明确时，搜索结果变得不可预测。

## `tactic.simp.trace`

默认值：`false`

作用：开启后，`simp` 或 `dsimp` 会打印一个等价的 `simp only` 调用。

### 何时有用

这对调试 simplifier 极其有帮助，因为你可以看见：

- 这次 simplification 实际用了哪些规则；
- 如果想把它固化成更稳定的 proof，应写出什么 `simp only [...]`。

## 使用建议

- 日常写 proof 通常保持默认值；
- 调试 `induction` / `cases` 行为时，关注 `tactic.customEliminators`；
- 调试 `simp` 规则集时，优先打开 `tactic.simp.trace`。