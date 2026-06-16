# Parsing

> 对应英文：[Parsing](https://lean-lang.org/doc/reference/latest/Elaboration-and-Compilation/#parser)，抓取日期：2026-06-16。

Lean 的 parser 是 recursive-descent parser，并使用基于 Pratt parsing 的动态表来处理 operator precedence 与 associativity。对无歧义 grammar，它不需要 backtracking；当 grammar 有歧义时，会用类似 Packrat parsing 的 memoization 避免指数级爆炸。

## 可扩展性

Lean parser 高度可扩展：

- 用户可在任意 command 中定义新 syntax；
- 新 syntax 会在下一个 command 中立即可用；
- 当前 section scope 中已打开的 namespace 会影响 parser 规则，因为某些 parser extension 只在特定 namespace 打开时生效。

这意味着 parsing 不是一个静态固定阶段，而是会随着前面 command 改变语言表面的过程。

## 歧义处理

当存在多个可能 parse 时，Lean 先选**最长匹配**。如果不存在唯一的最长匹配，则把多个 parse 一起保存在 syntax tree 的 choice node 中，稍后交给 elaborator 进一步判定。

因此，parser 不总是负责做出最终唯一决定；它有时会把若干候选延后给 elaboration。

## 错误恢复

parser 失败时，会插入 `Syntax.missing` 节点，而不是直接完全放弃。这让 Lean 即使面对未完成或有语法错误的文件，也能继续提供部分交互功能与更好的错误恢复。

## SourceInfo

成功解析后，Lean 会保留足够信息重建原始源码。`SourceInfo` 记录：

- 源位置；
- 周围空白；
- 语法是否直接来自 parser，还是程序生成。

常见关系包括：

- `SourceInfo.original`：由 parser 直接产生；
- `SourceInfo.synthetic`：由程序生成，例如 macro expansion 结果；
- `SourceInfo.none`：与原文件无直接关系。

synthetic syntax 仍可被标记为 canonical，此时 Lean UI 会把它当作“用户写下的”语法对待。

## token table 与 syntax kind

parser 维护一张 token table，记录当前语言中的 reserved word。定义新 syntax 或打开 namespace 可能让原来合法的 identifier 变成 keyword。

Lean grammar 中每个 production 都有名字，即它的 **kind**。这些 syntax kind 很关键，因为 elaborator 会据此查表，决定怎样解释对应 syntax node。
