# 参数与索引

> 对应英文：[Parameters and Indices](https://lean-lang.org/doc/reference/latest/The-Type-System/Inductive-Types/#inductive-datatypes-parameters-and-indices)，抓取日期：2026-06-16。

归纳类型设计中最重要的区分之一，是：

- **parameter**：在整个归纳族里固定不变
- **index**：可随 constructor 结果而变化

## parameter

parameter 写在 `inductive` 名称之后、冒号之前。它们会出现在每个 constructor 结果中，并且必须保持一致。

典型例子：

- `List α` 里的 `α`
- `Option α` 里的 `α`

这些参数在所有构造子结果里都不变化。

## index

index 写在冒号右侧，属于结果类型的一部分。不同 constructor 可以产生不同 index 的值。

典型例子：

- `Vec α n` 里的 `n`
- “偶长度/奇长度列表”一类 family 中的奇偶标签

index 让归纳类型成为 **indexed family**，并使模式匹配能在 proof 中进一步 refine 类型信息。

## 自动提升为索引

Lean 有选项：

- `inductive.autoPromoteIndices`

它会在某些情况下自动把写法中模糊的部分提升为 index；但库设计上通常仍应显式区分参数和索引，而不是依赖自动提升。

## 设计建议

- 若某个量在所有构造子结果中都相同，用 parameter；
- 若某个量会随构造子不同而变化，用 index；
- 一旦需要利用模式匹配让类型“变得更具体”，通常就意味着这个量应该是 index。