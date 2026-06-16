# 策略证明

> 对应英文：[Tactic Proofs](https://lean-lang.org/doc/reference/latest/Tactic-Proofs/)，抓取日期：2026-06-16。

`tactic language` 是一门专门用于构造证明的编程语言。在 Lean 中，命题由类型表示，证明则是居住在这些类型中的项。关于命题的更多细节见参考手册的 propositions 章节。

term 的设计目标，是方便指出某个类型的具体居住者；tactic 的设计目标，则是方便展示某个类型确实有居住者。二者的区别来自 Lean 的使用场景：定义需要精确指定目标对象，程序需要返回预期结果；但由于 proof irrelevance，技术上通常没有理由偏好某个证明项而不是另一个证明项。例如，若有两个同类型假设，程序必须小心选择正确的那个；而证明中使用任意一个通常都不会影响结论。

## proof state 与 goal

tactic 是会修改 proof state 的命令式程序。proof state 由一个有序的 goal 序列组成。每个 goal 是一组局部假设语境，加上一个需要构造居住者的类型。

一个 tactic 可以：

- 成功，并产生零个或多个后续 goal，这些后续 goal 称为 subgoal；
- 失败，表示无法继续推进。

如果 tactic 成功且没有 subgoal，证明就完成了。如果它成功但产生一个或多个 subgoal，那么当这些 subgoal 都被证明后，原 goal 也就被证明。

proof state 中的第一个 goal 称为 main goal。多数 tactic 只影响 main goal；但 `<;>`、`all_goals` 等组合子可以把 tactic 应用于多个 goal，而 bullet、`next`、`case` 等结构可以把后续 tactic 的焦点限制到 proof state 中的单个 goal。

## kernel 检查

在幕后，tactic 会构造 proof term。proof term 是用 Lean 类型论写成、可独立检查的定理真实性证据。每个证明都由 kernel 检查，也可以用独立实现的外部检查器验证。因此，tactic bug 的最坏结果应该是令人困惑的错误信息，而不是错误定理被接受。

在 tactic proof 中，每个 goal 都对应一个 proof term 中尚未完成的部分。

## 英文章节结构

- 14.1 Running Tactics
- 14.2 Reading Proof States
- 14.3 The Tactic Language
- 14.4 Options
- 14.5 Tactic Reference
- 14.6 Targeted Rewriting with `conv`
- 14.7 Naming Bound Variables
- 14.8 Custom Tactics