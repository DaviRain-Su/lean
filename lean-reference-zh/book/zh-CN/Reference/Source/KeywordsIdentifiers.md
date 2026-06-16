# 关键字与标识符

> 对应英文：[Keywords and Identifiers](https://lean-lang.org/doc/reference/latest/Source-Files-and-Modules/#The-Lean-Language-Reference--Source-Files-and-Modules--Concrete-Syntax--Keywords-and-Identifiers)，抓取日期：2026-06-16。

Lean 的 identifier 由一个或多个 identifier component 组成，component 之间用 `.` 分隔。

## identifier component

每个 component 以以下字符之一开头：

- 英文字母
- 类字母 Unicode 字符
- 下划线 `_`

随后可跟零个或多个 continuation character，例如：

- 字母 / 类字母字符
- `_`
- `!`
- `?`
- 下标
- 单引号 `'`

唯一特例是：**单独的 `_` 不是合法 identifier**。

## Unicode 支持

Lean 允许大量非 ASCII 字母字符进入 identifier，这就是为什么：

- `α`、`β`、`γ` 可直接作变量名；
- `ℕ`、`ℤ` 等数学字符可直接作名字的一部分。

## 双书名号引用

identifier component 还可以用双书名号包围：

```text
«... »
```

这种形式里，除了右书名号 `»` 之外，几乎任何字符都可出现，甚至包括：

- `.`
- 换行
- 左书名号 `«`

注意：`«x»` 和 `x` 表示同一个 component；但 `«Nat.add»` 是**单个** component，而 `Nat.add` 是两个 component。

## 关键字

某些原本可能合法的 component 会被保留为关键字。具体哪些词是关键字，并不是 Lean 全局固定死的：它取决于当前激活的 syntax extension、导入的文件以及当前打开的 namespace。

在大多数语法位置中，若想把关键字当作 identifier component 使用，需要用双书名号引用。某些 **raw identifier context** 允许关键字不加书名号直接出现，例如某些归纳类型构造子的命名环境。

## 层级标识符

包含一个或多个 `.` 的 identifier 称为 **hierarchical identifier**。它既可表示：

- import name
- namespace 中的名称

## 使用建议

- 普通代码中优先使用简单、清晰的 identifier；
- 只有在必须嵌入特殊字符或保留字时，再使用 `«... »`；
- 导出库接口时，尽量避免过度依赖花哨 Unicode 组合，除非它们确实显著提升数学可读性。