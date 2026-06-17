# 自定义 tactic

> 对应英文：[Custom Tactics](https://lean-lang.org/doc/reference/latest/Tactic-Proofs/Custom-Tactics/)，抓取日期：2026-06-16。

自定义 tactic = 扩展 `tactic` 语法 + 给出实现（macro 或 elaborator）。

## 路径选择

| 需求 | 首选 |
| --- | --- |
| 新语法 = 已有 tactic 的组合 | **tactic macro** |
| 向现有 tactic 加一条分支 | **`macro_rules`** |
| 读 goal、改 proof state、复杂逻辑 | **tactic elaborator**（`TacticM`） |

## 示例 1：tactic macro

```lean
import Lean

open Lean Parser.Tactic

macro "my_ring" : tactic => `(tactic| simp [Nat.add_assoc, Nat.add_comm, Nat.add_left_comm])

example (a b c : Nat) : a + b + c = c + a + b := by
  my_ring
```

macro 在**执行时**交错展开，可递归；只要递归调用落在会执行的 tactic 之后，就不会无限展开。

## 示例 2：可扩展 macro（`macro_rules`）

向已有语法注入行为（与内建 `simp`、`rw` 扩展方式相同）：

```lean
-- 示意：为自定义关键字注册展开规则
-- macro_rules
--   | `(tactic| my_simp) => `(tactic| simp only [Lemma.a, Lemma.b])
```

若展开后的 tactic **执行失败**，解释器可尝试匹配下一条 `macro_rules`（tactic macro 的回溯）。

## 示例 3：何时用 elaborator

需要直接操作 `TacticM` 时，例如查询 main goal 类型、按条件选不同 tactic：

```lean
-- 仅示意结构；完整实现需 import Mathlib 或自建 TacticM 逻辑
-- elab "inspect_goal" : tactic => fun _ stx => do
--   let goal ← getMainGoal
--   logInfo m!"{← goal.getType}"
```

日常项目 99% 情况 **macro 足够**；elaborator 留给元编程库与工具。

## `TacticM` 是什么

tactic interpreter 在 `TacticM` 中运行脚本，它在 term elaborator 之上增加：

- goal / metavariable 管理；
- `getMainGoal`、`replaceMainGoal`、`evalTactic`；
- tactic 级回溯与错误。

写 elaborator 前，先查是否可用 `by ...` + 现有 tactic 组合表达。

## Hygiene

tactic macro 与 term macro 一样 **hygienic**：

- 宏体内引用的全局名在**定义处**解析；
- 宏引入的局部名不会捕获调用点用户变量。

选项 `set_option tactic.hygienic false` 一般不要关。

## 使用建议

1. 先写 `macro "name" : tactic => \`(tactic| ...)\`` 验证行为；
2. 需要参数时用 `syntax` + `macro` 的 pattern 绑定（如 `ident`、`term`）；
3. 扩展现有 tactic 优先 `macro_rules`；
4. 发布到库时给自定义 tactic 写清「等价于哪组内置 tactic」，便于维护。