# Macro

> 对应英文：[Macros](https://lean-lang.org/doc/reference/latest/Notations-and-Macros/Macros/)，抓取日期：2026-06-16。

macro 是从 `Syntax` 到 `Syntax` 的转换，发生在 elaboration 和 tactic execution 期间。用 macro 转换结果替换原 syntax 的过程称为 macro expansion。

一个 syntax kind 可以关联多个 macro；Lean 会按定义顺序尝试它们。macro 在 `MacroM` monad 中运行。这个 monad 能访问部分 compile-time metadata，可以报告错误，也可以把当前 syntax 委托给后续 macro；但它远不如 elaboration monad 强大。

## Expansion 流程

macro 与 syntax kind 关联。内部表把 syntax kind 映射到类型为 `Syntax → MacroM Syntax` 的 macro。macro 若不能处理某 syntax，应抛出 `unsupportedSyntax`，让 Lean 尝试下一条 macro。如果抛出其他异常，Lean 会向用户报告错误。

elaborator 在 elaborating syntax 前，会检查该 syntax kind 是否有关联 macro。若某个 macro 成功并返回新 syntax，Lean 会重复检查新 syntax 的最外层 kind，直到最外层不再是 macro。只有最外层 syntax 被立即展开；返回结果内部嵌套的 macro 会在 elaborator 递归到那里时再展开。

macro expansion 发生在三种场景：

- term elaboration 前；
- command elaboration 前；
- tactic execution 前。

## Hygiene

macro 是 hygienic 的，意味着 expansion 不会造成 identifier capture。identifier capture 有两类：

1. macro expansion 引入 binder，导致 macro 参数中的 identifier 意外引用这些 binder；
2. macro expansion 本想引用某个全局名称，但使用处局部绑定或新全局名称遮蔽了它。

Lean 几乎总是自动提供 hygiene。它通过给 macro 引入的 identifier 添加 macro scope 来避免绑定捕获；同一 expansion 步骤引入的 binder 和使用位置拥有相同 macro scope，因此能互相引用。对全局名称，quotation 会记录可能的 referent，形成 pre-resolved identifier；elaboration 时如果 identifier 带有 pre-resolved global names，就不会考虑其他全局名称。

如果 macro 不通过 quotation 构造 syntax，而是手动拼接 node，就需要自己确保 hygiene。

## `MacroM`

`MacroM` 是 macro expansion 的主 monad。它提供 hygienic name generation 所需信息，也支持 trace 和错误报告。它相对纯：没有 `IO`，也不能直接访问完整 `Environment`。因此，像 declaration lookup、`IO.Ref` 或其他副作用操作不能在 macro 中完成。若需要更强能力，应使用 elaborator。

常用能力包括：

- `expandMacro?`：尝试展开 syntax；
- `trace`：添加 trace message；
- `throwUnsupported`：表示当前 macro 不支持该 syntax，让后续 macro 尝试；
- `throwError` / `throwErrorAt`：报告错误；
- `withFreshMacroScope` / `addMacroScope`：处理 hygiene；
- `hasDecl`、`getCurrNamespace`、`resolveNamespace`、`resolveGlobalName`：有限查询环境。

## Quotation

quotation 把代码标记为 `Syntax` 数据。quoted code 会被 parsed，但不会被 elaborated；它必须语法正确，但不必语义正确。

quotation 让生成代码更容易：不需要反向构造 parser 产生的 node 嵌套，直接让 parser 创建 syntax tree。它也更能抵抗 grammar 内部重构。

quotation 用反引号加括号包围。可以指定 syntax category：

```lean
`(term| x + y)
`(command| def x := 1)
`(tactic| simp)
```

不指定 category 时，Lean 会尝试按 term 或非空 command sequence 解析；term quotation 优先。

## Quasiquotation、splice 与 antiquotation

quasiquotation 允许在 quoted syntax 中插入已有 syntax 值。splice 用于插入 syntax 列表，token antiquotation 用于插入 token 级内容。这些机制让 macro 可以像模板一样生成 syntax，同时保留类型化结构。

## 定义 macro

Lean 提供多种定义 macro 的方式：

- `macro_rules`：为已有 syntax kind 添加按 quotation pattern 匹配的 expansion rule；
- `macro` command：同时声明 syntax 和 macro expansion；
- `macro` attribute：把已有函数注册为某 syntax kind 的 macro。

经验规则：如果新 syntax 可以翻译为已有 syntax，优先使用 macro；如果需要访问 local context、expected type、unification 或生成核心 expression，则使用 elaborator。
