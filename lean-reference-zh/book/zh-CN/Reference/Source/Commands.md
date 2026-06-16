# 顶层命令

> 对应英文：[Commands](https://lean-lang.org/doc/reference/latest/Source-Files-and-Modules/#The-Lean-Language-Reference--Source-Files-and-Modules--Structure--Commands)，抓取日期：2026-06-16。

在文件头之后，源文件由一串 top-level command 构成。command 是 Lean 对“顶层语句”的统一抽象。

## command 可以是什么

常见 command 包括：

- `def`
- `theorem`
- `inductive`
- `structure`
- `open`
- `variable`
- `namespace`
- `section`
- `#check`
- `#eval`

它们有的会向 environment 增加新声明，有的会改变当前作用域，有的只是查询或显示信息。

## command 的特点

- command 是**可扩展**的；
- 用户和库都能添加新的 command syntax；
- 某些 command 甚至可以继续定义后续 command 的新语法。

也就是说，Lean 顶层并不是一套固定死的关键字集合，而是一个可增长的命令系统。

## 与其他章节的关系

本节不会集中列出所有 command 的完整语法；具体 command 会在对应章节说明，例如：

- definition 相关 command 在 Definitions；
- tactic proof 相关 command 在 Tactic Proofs；
- notation / macro 相关 command 在 Notations and Macros；
- build 配置相关 command 在 Lake / Elan / CLI 小节。

## 使用建议

- 把 command 看作“改变 Lean 当前状态的顶层动作”；
- 若某段 syntax 看起来不像 term，而像“声明、设置、查询、作用域控制”，通常它就是 command；
- 读不懂某个自定义顶层语法时，先检查项目是否定义了新的 command extension。