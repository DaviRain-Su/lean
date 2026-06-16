# dependsOnNoncomputable

> 对应英文：[About: dependsOnNoncomputable](https://lean-lang.org/doc/reference/latest/Error-Explanations/About___--dependsOnNoncomputable/)，抓取日期：2026-06-16。

错误码：`lean.dependsOnNoncomputable`

含义：declaration 依赖 noncomputable definition，但自身没有标记为 `noncomputable`。

严重性：Error。起始版本：4.22.0。

这个错误表示当前 definition 依赖一个或多个不含可执行代码的 definition，因此当前 definition 也必须标记为 `noncomputable`。这类 definition 可以通过 type checking，但 Lean 不能为它们生成可执行代码。

## 常见原因

- 依赖 axiom。axiom 有 type，但没有运行时实现。
- 使用 `Classical.choice` 或 `Classical` namespace 中的 noncomputable `Decidable` instance。
- 间接调用了已经标记为 `noncomputable` 的 definition。
- 某个依赖本身编译失败，因此只能作为 noncomputable 使用。

## 修复方向

如果当前 definition 本来就不需要执行，给它加：

```lean
noncomputable def name := ...
```

如果它应该可执行，就要移除 noncomputable 依赖。例如：

- 用 `Inhabited` 替代 `Nonempty` 加 `Classical.choice`；
- 避免 `open Classical` 影响实例搜索；
- 给 proposition 提供可计算的 `Decidable` instance；
- 替换 axiom 为真正实现。

`noncomputable` 是语义声明，不是“忽略错误”。它表示该 declaration 只用于逻辑推理或 specification，不提供可执行代码。
