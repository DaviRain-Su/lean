# 定义新语法

> 对应英文：[Defining New Syntax](https://lean-lang.org/doc/reference/latest/Notations-and-Macros/Defining-New-Syntax/)，抓取日期：2026-06-16。

Lean 对 syntax 使用统一、通用且灵活的表示。这意味着扩展 Lean parser 时，不需要扩展 parsed syntax 的数据表示。无论是 command、term、tactic，还是用户自定义语法，最终都由 `Lean.Syntax` 表示。

## Syntax model

Lean parser 产生 concrete syntax tree，类型是 `Lean.Syntax`。`Lean.Syntax` 是一个 inductive type，用少数基本构件表示所有 Lean syntax。

### Atom

atom 是 grammar 的基本 terminal，包括 literal、括号、operator 和 keyword。

### Identifier

identifier 表示名称，例如 `x`、`Nat` 或 `Nat.add`。identifier syntax 还包含 pre-resolved name 列表，用于 hygienic macro。

### Node

node 表示 nonterminal 的解析结果。node 包含 syntax kind，以及 child `Syntax` values 数组。syntax kind 标识该 node 来自哪条 syntax rule。

### Missing syntax

parser 遇到错误时会返回 partial result，使 Lean 能对未写完或有错误的程序提供反馈。partial result 中会包含 missing syntax。

atom 和 identifier 合称 token。

## Syntax kind

syntax node kind 通常标识生成该 node 的 parser。operator 或 notation 的名称会在这里出现。虽然只有 node 真正保存 kind，identifier 按惯例使用 `identKind`，atom 按惯例使用其内部字符串作为 kind。

`Syntax.getKind` 可取得 syntax 的 kind；`Syntax.isOfKind` 可检查 kind；`Syntax.setKind` 可修改 node root 的 kind。

## Token 与 literal kind

Lean 为 parser 产生的基本 token 关联了许多具名 kind，例如：

- `identKind`
- `strLitKind`
- `charLitKind`
- `numLitKind`
- `scientificLitKind`
- `nameLitKind`
- `fieldIdxKind`

literal atom 本身不会由 parser 解码；例如 string atom 会保留引号和 escape sequence。需要时可用 `TSyntax.getString` 等 helper 解码。

## Source position

atom、identifier 和 node 都可包含 source information，用于跟踪它们与原文件的对应关系。parser 会保存 token 的 source information；node 的位置信息通常可由首尾 token 重构。

source information 有两类：

- **Original**：来自 parser，包含源位置和 leading/trailing whitespace，可重构原始字符串。
- **Synthetic**：来自 metaprogram 或 Lean 内部，例如 macro expansion 或 delaboration 生成的 syntax。

这些信息支撑错误定位、hover、go-to-definition、proof state 中的交互等功能。

## Typed syntax

`TSyntax` 为 syntax category 提供 typed wrapper，使 metaprogram 更容易表达“这是 term syntax”“这是 command syntax”等不变量。Lean 还提供 `TSyntaxArray`、`TSepArray` 等结构，方便处理重复项和带分隔符列表。

常用别名包括：

- `Term`
- `Command`
- `Level`
- `Tactic`
- `Prec`
- `Prio`
- `Ident`
- `StrLit`
- `CharLit`
- `NameLit`
- `NumLit`
- `ScientificLit`

## 构造 syntax 的 helper

Lean 提供大量 helper 创建 syntax，例如：

- `mkIdent`
- `mkIdentFrom`
- `mkCIdent`
- `mkApp`
- `mkCApp`
- `mkLit`
- `mkCharLit`
- `mkStrLit`
- `mkNumLit`
- `mkNatLit`
- `mkNameLit`
- `mkHole`

对大多数 macro 来说，quotation 往往比手写这些 node 更稳健，因为 grammar 内部结构可能随重构变化，而具体 syntax 通常更稳定。

## Syntax category

可以用 `declare_syntax_cat` 声明新的 syntax category。syntax category 定义一类可由 parser 识别的语法，例如 term、command、tactic 或自定义 DSL 片段。

## Syntax rule

`syntax` command 用于声明新 syntax rule：

```lean
syntax:prec item* : category
```

item 可以是 atom、带 precedence 的 term 位置、重复项、可选项、带分隔符列表、alternative 等。常见 combinator 包括：

- `*` / `+` / `?`
- `optional(...)`
- `sepBy(...)` / `sepBy1(...)`
- `<|>` / `orelse(...)`
- `many(...)` / `many1(...)`

## Indentation

Lean parser 也支持 indentation-sensitive syntax。定义新 syntax 时，如果它需要像 `do` block、match alternative 或 tactic block 一样依赖缩进，就必须考虑 indentation rule。

经验规则：优先使用已有语法类别和 parser combinator；只有在 notation/macro 不足以表达需求时，才引入复杂 syntax extension。
