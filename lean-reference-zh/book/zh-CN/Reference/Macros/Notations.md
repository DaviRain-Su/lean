# Notation

> 对应英文：[Notations](https://lean-lang.org/doc/reference/latest/Notations-and-Macros/Notations/)，抓取日期：2026-06-16。

Lean 中的 “notation” 有两层含义：一是一般意义上简洁表达想法的写法；二是 Lean 的一个语言功能，它允许用少量代码方便地实现新 notation。

和 custom operator 一样，Lean notation 可以用新形式扩展 term grammar。不过 notation 更一般：新 syntax 可以自由混合必须出现的 keyword/operator 和 subterm，并且能更精确地控制 precedence。notation 还能在 expansion 中重新排列参数；而 infix operator 总是按固定顺序把参数传给函数 term。

因为 notation 可以混合 prefix、infix 和 postfix 组成部分，所以它们也常被称为 mixfix operator。

## 定义 notation

notation 使用 `notation` command 定义：

```lean
notation:prec "keyword" x:prec " => " y:prec => expansion
```

notation body 是 notation item 序列。notation item 可以是：

- string literal：表示必须出现的 atom，例如 keyword、符号、delimiter；
- identifier 加可选 precedence：表示要解析的 term，并给该 term 命名，供 expansion 使用。

documentation comment 会在交互时显示给用户。`inherit_doc` 会把 expansion 中函数头的 documentation comment 复制到新 syntax。attribute 也可用于触发其他 compile-time metaprogram。

## Scope 与 disambiguation

notation 与 section scope 的交互方式和 attribute/operator 相同。默认情况下，notation 在任何传递 import 定义它的 module 中可用；也可以声明为 `scoped` 或 `local`。

解析 notation 时同样使用 local longest-match rule。如果多个 notation 并列为最长匹配，则用声明 priority 决定；若仍无法决定，会保存所有 parse，由 elaborator 尝试找到唯一可 elaboration 的结果。

## Atom 与 term 位置

notation declaration 的 body 包含 atom 和 term 位置。string literal 放置 atom，例如 `if`、`#eval`、`where`、`=>`、`+`、`↗`、`⟦`、`⋉` 等。identifier 表示期望 term 的位置，并把对应 term 命名，供 expansion 使用。

string literal 前后的空格不影响 parsing，但会影响 Lean 在 proof state 和 error message 中显示该 syntax 时是否插入空格。

## Precedence

notation 涉及多个 precedence：notation 整体有 precedence，每个 term item 也有 precedence。整体 precedence 决定 notation 可以在哪些上下文中被解析；term item 的 precedence 决定其内部可包含哪些其他 syntax。

如果 notation 自身没有给 precedence，默认值取决于形式：若 notation 以 atom 开头且以 atom 结尾，则默认 precedence 是 `max`；否则默认是 `lead`。term item 如果没有给 precedence，默认是 `min`。

## Expansion

`=>` 后给出 notation 的 expansion。operator 总是按固定顺序应用函数，而 notation 可以把 term item 放到 expansion 任意位置，甚至多次使用或完全不使用。

因为 notation expansion 是 elaboration 和 code generation 之前发生的纯 syntax 过程，在 expansion 中重复某个 term 可能导致重复计算；在 monad 中还可能导致重复副作用。

## Unexpander

如果 expansion 是全局函数应用，并且每个 term item 在 expansion 中恰好出现一次，Lean 会自动生成 unexpander。这样 proof state、error message 和其他输出中会尽量显示新 notation，而不是底层函数应用。

## Operator 与 notation

内部上，operator declaration 会被翻译为 notation declaration。prefix/postfix/infix operator 通过 term item 和 expansion 的对应位置表达。associativity 则通过给左右参数不同 precedence 实现：non-associative operator 会把两个参数都提高一个 precedence，防止无括号连续使用；left-associative 和 right-associative 分别只提高其中一侧。
