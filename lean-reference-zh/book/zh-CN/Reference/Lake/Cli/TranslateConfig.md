# `lake translate-config`

> 对应英文：[Lake command: lake translate-config](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/#lake-translate-config)，抓取日期：2026-06-16。

`lake translate-config lang [out-file]` 用来在 Lake 支持的两种配置语言之间做自动转换：

- `lean`
- `toml`

## 输出位置

- 若给了 `out-file`，结果写到该文件；
- 否则，Lake 会基于当前配置文件路径和目标语言扩展名自动决定输出路径。

如果目标文件已经存在，Lake 会报错，而不是静默覆盖。

## 重要限制：转换是有损的

英文页明确强调：translation is lossy。

不会保留：

- 注释
- 原格式排版
- 非声明式配置逻辑

因此：

- 从 `lakefile.lean` 转到 TOML 时，动态逻辑可能被丢弃；
- 转回去也无法恢复原有注释和结构风格。

## 何时有用

- 把简单项目从 Lean 配置改成 TOML 配置；
- 把 TOML 配置迁移到 Lean 格式以便进一步扩展；
- 快速生成“另一种格式的大致骨架”，再手工修正。

## 使用建议

- 把它当成迁移辅助工具，不要期待完全无损 round-trip；
- 对复杂 `lakefile.lean`，转换后务必人工检查是否丢失关键逻辑；
- 若项目高度依赖自定义 target / facet / script，通常仍应继续保留 Lean 格式。