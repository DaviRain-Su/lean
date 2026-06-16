# 阅读 proof state

> 对应英文：[Reading Proof States](https://lean-lang.org/doc/reference/latest/Tactic-Proofs/Reading-Proof-States/)，抓取日期：2026-06-16。

proof state 中的 goal 按顺序显示，最上方的是 **main goal**。goal 可以是具名的，也可以是匿名的：

- 具名 goal 顶部会显示 `case ...`，称为 case label；
- 匿名 goal 没有该标记。

许多 tactic 会根据 constructor 名、参数名、field 名或证明步骤的性质为 goal 命名。若某个已命名 goal 再产生子 goal，新 goal 名通常会在父 goal 名后附加一个点号和后缀，形成层级名称。

## goal 结构

每个 goal 由两部分组成：

- 一串 assumptions（局部假设）
- 一个 conclusion（需要证明的目标类型）

每个 assumption 都有名字和类型。它可能表示“某个类型中的任意元素”，也可能表示“某个命题为真”。

## 不可访问假设

有些 assumption 无法通过名字直接引用，称为 **inaccessible assumption**。这通常发生在：

- 创建 assumption 时没有显式提供名字；
- 后来又有新的 assumption 遮蔽了旧名字。

它们在 proof state 中仍会显示一个名字，但名字后带匕首 `†`，提醒你这个名字不能直接拿来引用。虽然不能直接点名，它们仍能被 tactic 使用，例如：

- `assumption`
- `simp`
- `contradiction`

如果确实需要手工引用，可使用：

- `rename_i`
- `next`
- `case`

给它们重新命名。

## 按类型引用假设

Lean 支持用单书名号按类型引用局部项：

```lean
‹term›
```

这在两类场景中很有用：

- 某个局部 lemma 的名字不重要，只关心其定理陈述；
- 某个 assumption 不可访问，但其类型足以唯一确定它。

## 隐藏 proof 与大 term

proof state 中的 term 可能非常大。由于 definitional proof irrelevance，proof term 往往信息不多，所以 Lean 默认会隐藏较大的 proof，并在必要时把深层 term 折叠成 `⋯`。

相关 pretty-printer 选项：

- `pp.proofs`
- `pp.proofs.threshold`
- `pp.deepTerms`
- `pp.deepTerms.threshold`
- `pp.maxSteps`

调大这些选项可以看到更多细节，但也可能让编辑器变慢，甚至导致工具栈溢出。

## metavariable

以问号开头的项是 metavariable，表示“值尚未确定”：

- `?m.392` 一类常来自 elaboration 过程；
- `?x`、`?_` 常来自 tactic 或 synthetic hole；
- universe level metavariable 和 term metavariable 都会出现在输出中。

选项 `pp.mvars` 控制是否显示这些 metavariable 的具体名字。在写 `#guard_msgs` 测试时，这个选项尤其有用，因为 metavariable 编号不稳定。
