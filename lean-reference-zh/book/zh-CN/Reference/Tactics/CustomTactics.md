# 自定义 tactic

> 对应英文：[Custom Tactics](https://lean-lang.org/doc/reference/latest/Tactic-Proofs/Custom-Tactics/)，抓取日期：2026-06-16。

自定义 tactic 的本质是：

1. 扩展 syntax category `tactic`
2. 再给这段新 syntax 配一个实现方式

实现方式有两类：

- **macro**：把新 tactic syntax 展开成已有 tactic syntax
- **elaborator**：直接在 `TacticM` 中执行动作

## tactic interpreter 的角色

给定 tactic 的 syntax 后，tactic interpreter 负责在 `TacticM` 中真正执行它。`TacticM` 本身是建立在 Lean term elaborator 之上的一层包装，多了：

- goal / proof state 管理
- tactic 特有的控制流
- tactic 级别的错误与回溯

## tactic macro

最容易写的新 tactic，通常就是 macro：

- 你发明一段更顺手的 tactic 语法；
- 把它展开为现有 tactic 组合。

### 为什么 tactic macro 很强

英文页强调：tactic macro 的展开与 tactic 执行是交错进行的，而不是在脚本开始前一次性完全展开。因此：

- tactic macro 可以递归；
- 只要递归调用出现在某个会真正执行的 tactic 之后，就不会形成无限展开链。

### hygiene

和其他 Lean macro 一样，tactic macro 是 hygienic 的：

- 对全局名的引用在定义时确定；
- 它引入的新名字不会捕获调用点的名字。

## 可扩展 tactic macro

tactic macro 的回溯规则比普通 macro 更进一步：即便某个 macro 成功展开，如果展开后的 tactic 执行失败，解释器仍可尝试后续匹配的 tactic macro。正因如此，Lean 能把一些内建 tactic 设计成可扩展的：你只需额外加一条 `macro_rules`，就能向现有 tactic 注入新行为。

## 何时需要 elaborator

如果只是“把新语法翻成旧语法”，优先 macro；只有当你需要：

- 直接操纵 proof state
- 查询 elaboration / goal 细节
- 运行更复杂的 `TacticM` 逻辑

时，才值得写真正的 tactic elaborator。

## 使用建议

- 自定义 tactic 首选 macro；
- 需要访问底层 proof state 时，再考虑 elaborator；
- 扩展现有 tactic 行为时，优先想想是否能用 `macro_rules` 做可扩展 tactic macro。