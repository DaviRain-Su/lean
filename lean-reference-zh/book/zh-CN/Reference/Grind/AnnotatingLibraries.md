# 为 `grind` 标注库

> 对应英文：[Annotating Libraries for grind](https://lean-lang.org/doc/reference/latest/The--grind--tactic/Annotating-Libraries-for--grind/)，抓取日期：2026-06-16。

`grind` 要想高效使用一个库，库本身必须提供适当注解：通过 `@[grind ...]` 或 `grind_pattern` 告诉系统哪些 theorem 值得自动实例化、在什么模式下实例化。

## 标注过少 vs 过多

- 标注太少：`grind` 根本不会想到用这些 theorem；
- 标注太多：匹配和实例化开销膨胀，可能耗尽资源或变慢。

因此原则应偏保守：只有当你预期“只要 pattern 命中，就几乎总值得实例化”时，才加注解。

## 与 `[simp]` 的关系

英文页特别指出：许多 `@[simp]` theorem 也适合加 `@[grind =]`。但有一个重要例外：

- 对于通常用两条正/负条件定理代替的 if-introducing simp theorem，`grind` 更适合直接处理那条引入 if 的 theorem，因为它本身就擅长 case split。

此外：

- `@[grind =]`：偏左到右重写；
- `@[grind _=_]`：更接近“双向饱和”。

## 前向与后向推理

- `@[grind ←]`：适合“当结论形状匹配 goal 时尝试”的后向推理 theorem；
- `@[grind →]`：适合“已有前提事实时继续传播”的前向推理 theorem。

## 自定义 pattern

`grind_pattern` 常用于：

- 只在某些关键 term 已出现时才引入不等式；
- 把 membership、size、某类函数值等作为匹配触发器；
- 使用 multi-pattern 限制实例化条件，避免无谓爆炸。

## 使用建议

- 先从少量高价值 theorem 开始标注；
- 对 theorem 触发频率和资源成本敏感时，优先用 multi-pattern 或 `where` 约束；
- 用 `grind?`、trace 和失败诊断观察实际实例化情况，再逐步调整。
