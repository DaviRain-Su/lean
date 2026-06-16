# simp set

> 对应英文：[Simp sets](https://lean-lang.org/doc/reference/latest/The-Simplifier/Simp-sets/)，抓取日期：2026-06-16。

simplifier 所使用的一组规则称为 **simp set**。一个 `simp` 调用实际做的是：以默认 simp set 为基础，再叠加若干修改。

## 默认 simp set

默认 simp set 由所有带 `[simp]` attribute 的 theorem、definition 和 simproc 组成。`simp` tactic 会在此基础上工作，除非使用 `only` 从空集合开始。

## 如何修改 simp set

常见操作：

- 增加规则：`simp [h, foo]`
- 移除规则：`simp [-foo]`
- 加入当前所有 assumptions：`simp [*]`
- 仅使用指定规则：`simp only [foo, bar]`

## `[simp]` attribute

`[simp]` 是把声明加入默认 simp set 的主要方式。

- 如果声明是 definition，则它会被标记为“可由 simplifier 展开”；
- 如果声明是 theorem，则它会被注册为 rewrite rule。

还可以用：

- `@[simp]`
- `@[simp ↑]`
- `@[simp ↓]`
- `@[simp prio]`

来指定方向或优先级。

## 自定义 simp set

Lean 允许用 `registerSimpAttr` 创建新的自定义 simp set。它会生成一个与 `simp` 类似接口的新 attribute，把声明加入该自定义集合，同时返回一个 `SimpExtension`，供程序化访问。

这非常适合：

- 某类专门领域的简化规则；
- 不想污染默认 simp set 的库局部自动化；
- 为专门 tactic 准备独立规则库。

## 设计建议

- 默认 simp set 是库接口的一部分；
- 不要随意把与本库无关的规则塞进默认 simp set；
- 若某套规则只对特定工作流有意义，优先做自定义 simp set 或专用 tactic。
