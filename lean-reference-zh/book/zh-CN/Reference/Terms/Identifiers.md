# Identifier

> 对应英文：[Identifiers](https://lean-lang.org/doc/reference/latest/Terms/Identifiers/)，抓取日期：2026-06-16。

identifier term 是对某个 name 的引用。identifier 的词法语法见 Lean concrete syntax 一章，但真正把 identifier 解析为具体 name 并不简单：某一位置可能有打开的 namespace、section variable、local binding、export alias，以及包含多个点号分量的层级名称。

因此，给定一个 identifier，elaborator 必须决定它到底引用哪个 name，以及尾部哪些分量应被解释为 field projection 或 generalized field notation。这一过程称为 **name resolution**。

如果某个声明第一次被引用时才惰性创建，那么“既解析 name 又触发声明创建”的过程称为 **realizing the name**。realization 与 resolution 规则相同，因此本节关于 resolution 的说明同样适用于 realization。

## Name resolution 受哪些因素影响

- identifier 上附着的 pre-resolved name；
- identifier 的 macro scope；
- 当前作用域中的 local binding，包括 `let rec` 产生的辅助定义；
- 传递导入 module 中通过 `export` 创建的 alias；
- 当前 section scope，尤其是当前 namespace、打开的 namespace 和 section variable。

任意 identifier prefix 都可能解析成一组名称；剩余后缀再被解释为 field projection 或 field notation。Lean 总是优先把**更长的 prefix** 解析成 name，也就是尽量让尽可能少的分量落入 field notation。

## 解析优先级

identifier prefix 可能解析到以下对象，优先级从高到低：

1. 名称完全相同的 local variable（更近的 binding 优先）。
2. 名称完全相同的 local auxiliary definition。
3. 名称完全相同的 section variable。
4. 当前 namespace 前缀附加后匹配的 global name，或该前缀中的 alias；当前 namespace 越长越优先。
5. 通过 `open` 带入作用域的 global name。

如果一个 identifier 解析到多个 name，elaborator 会全部尝试；恰好一个成功时使用之，否则报错。

## 点号前缀 `.name`

以点号开头的 identifier 不使用当前 namespace / opened namespace 解析，而是使用 **expected type** 的 namespace。它和 generalized field notation 相关：

- leading dot notation：根据 expected type 解析；
- field notation：根据点号前表达式的 inferred type 解析。

如果 expected type 是某个常量应用（例如 `Option α`），则其 namespace 是该常量名（这里是 `Option`），`.some`、`.none` 一类写法就能解析到该 namespace。

若 expected type 不是常量应用（例如 metavariable、函数类型或 universe），则它没有 namespace，leading dot notation 不能使用。

如果未找到名称，但该常量可以展开成另一个常量，Lean 会继续沿着展开后的常量 namespace 查找，直到不能再展开为止。

## 实用建议

- identifier 解析问题优先检查 `open`、当前 namespace、`protected`、field notation 和 type annotation。
- 看到 ambiguity 时，优先写完整限定名；确认无误后再酌情改短。
- 用 `.name` 时要确认 expected type 足够明确。
