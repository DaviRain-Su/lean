# Lean 4 元编程（中文版）目录

本目录由 [Lean-zh/mp-lean-zh](https://github.com/Lean-zh/mp-lean-zh) 的 Lean 源文件经 `scripts/mdgen-lite.mjs` 生成 Markdown，供学习工作台阅读。

> 英文原版：[Metaprogramming in Lean 4](https://leanprover-community.github.io/lean4-metaprogramming-book/)

## 说明

译者：[subfish_zhou](https://github.com/subfish-zhou)。正文与习题解答由 `lean/` 目录中的 `.lean` 文件导出；修改译文请编辑 Lean 源文件后运行 `node scripts/sync-md.mjs`。

代码片段须从每章开头增量运行，不宜单独复制中间片段。

## 已翻译章节

### 正文

- [介绍](main/01_intro.md) — 元编程概述与示例
- [概述](main/02_overview.md) — 核心概念鸟瞰
- [表达式](main/03_expressions.md) — `Expr` 与表达式操作
- [MetaM](main/04_metam.md) — 元编程 monad
- [语法](main/05_syntax.md) — `Syntax` 与解析
- [宏](main/06_macros.md) — 宏系统
- [繁饰](main/07_elaboration.md) — elaboration 与自定义命令
- [通过繁饰嵌入 DSL](main/08_dsls.md) — 领域特定语言
- [证明策略](main/09_tactics.md) — 编写 tactic
- [Lean 4 速查表](main/10_cheat-sheet.md) — 关键 API 备忘

### 额外内容

- [选项](extra/01_options.md) — `set_option` 与 trace
- [美观打印](extra/03_pretty-printing.md) — pretty printer

### 习题解答

- [表达式（解答）](solutions/03_expressions.md)
- [MetaM（解答）](solutions/04_metam.md)
- [语法（解答）](solutions/05_syntax.md)
- [繁饰（解答）](solutions/07_elaboration.md)
- [证明策略（解答）](solutions/09_tactics.md)