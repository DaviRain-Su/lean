# simplification 与 rewriting

> 对应英文：[Simplification vs Rewriting](https://lean-lang.org/doc/reference/latest/The-Simplifier/Simplification-vs-Rewriting/)，抓取日期：2026-06-16。

`simp` 与 `rw` / `rewrite` 都会用等式引理替换 term 的一部分，但它们的目标和策略不同。

## `simp` 的目标

`simp` 主要用于把问题改写成更规范、更易读、更利于自动化的形式。它倾向于：

- 由内向外简化；
- 先简化最小子表达式，再利用这些结果解锁更外层简化；
- 把表达式推向某个约定俗成的 normal form。

设计上，`simp` 不应把一个本来可证明的目标改成不可证明的目标。

## `rw` 的目标

`rw` 更像手工控制的定点变换：

- 选择匹配的子项；
- 一次性按指定方向重写；
- 不追求规范化，只执行用户选定的变换。

默认情况下，`rw` 会选择**最左侧最外层**的匹配项。

## 二者的核心差异

- `simp`：inside-out、可迭代、多规则数据库驱动。
- `rw`：用户显式选规则、单次重写、关注局部变换。

## 何时用哪个

优先用 `simp`：

- 清理 if/match/projection/let；
- 归一化代数或逻辑表达式；
- 利用库中已有 `[simp]` 规则。

优先用 `rw`：

- 需要精确控制方向；
- 只想改某一步，而不想触发整个 simp database；
- 要保留当前表达式形状，只替换某个指定等式。

## 可覆盖默认策略

- `simp` 中使用 `↓` 可以让某条规则在进入子项前就先应用；
- `rw` 的 `occs` 配置可改变目标 occurrence 的选择。

这说明二者并非完全刚性工具，但其默认意图始终不同：`simp` 面向规范化，`rw` 面向精确改写。
