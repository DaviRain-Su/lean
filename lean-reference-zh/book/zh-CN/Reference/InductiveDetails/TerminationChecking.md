# 终止检查辅助构造

> 对应英文：[Constructions for Termination Checking](https://lean-lang.org/doc/reference/latest/The-Type-System/Inductive-Types/#recursor-elaboration-helpers)，抓取日期：2026-06-16。

Lean 用 recursor 作为递归定义终止性的最终基础。但在 elaboration 过程中，还需要一些辅助构造来把用户写的高层递归整理成内核可接受的形式。

## `SizeOf`

英文页特别列出 `SizeOf`。它为许多类型提供“大小”概念，使 Lean 能把某些递归调用解释为“参数在某个良基度量上严格减小”。

这类辅助构造的角色是：

- 帮 termination checker 建立度量；
- 把用户眼中的“显然变小”转成系统可验证的形式；
- 支撑一些不完全是结构递归、但仍可证明终止的定义。

## 为什么需要辅助构造

用户写下的递归函数往往经过了：

- 模式匹配
- 局部定义
- 语法糖
- 多层辅助函数

这些高层结构不一定直接暴露“递归参数变小”这一事实。辅助构造的任务，就是把这种信息重新显式化。

## 使用建议

- 看到 termination checker 报错时，不要只盯着代码表面；要想一想系统是否缺少“规模减小”的证据。
- 若结构递归不明显，往往需要借助 size / measure / well-founded 视角重新组织定义。