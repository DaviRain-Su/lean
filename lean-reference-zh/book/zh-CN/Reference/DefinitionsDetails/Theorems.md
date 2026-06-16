# theorem

> 对应英文：[Theorems](https://lean-lang.org/doc/reference/latest/Definitions/Theorems/)，抓取日期：2026-06-16。

从类型论角度看，theorem 和 definition 技术上非常相近：命题是类型，proof 是 inhabitant。但由于使用场景不同，Lean 对 theorem 做了若干专门约束与默认策略。

## theorem 的主要特点

### 1. 结果类型必须是 proposition

definition 可以返回任意 universe 中的类型；theorem 的结果类型必须是命题。

### 2. 先完整 elaboration 头部，再 elaboration 证明体

定理陈述会先被完整 elaboration。只有在 theorem header 中真正出现的 section variable，才会成为 theorem 参数。这可以避免“改动证明体意外改变定理陈述”。

### 3. 默认 irreducible

theorem 的 proof 默认是 **irreducible** 的。因为同一命题的 proof 之间在逻辑上通常没有值得区分的计算内容，所以很少需要主动展开 theorem proof。

### 4. 也可以递归

theorem 可以递归，理论上受和递归函数相同的安全约束；但实践中更常见的是用：

- `induction`
- `fun_induction`
- 其他 tactic

来组织证明，而不是直接写递归 proof term。

## 语法

```lean
theorem name sig := term
```

和 `def` 类似，也支持：

- pattern matching 风格
- `where` 结构体字段风格

但和 `def` 不同的是：**签名中的结果类型不可省略**。

## 在 module 中的可见性

在 module 中，theorem 的 proof 默认不暴露（not exposed by default）。这和 theorem 默认 irreducible 的整体设计是一致的：证明更偏逻辑证据，而非供外部计算使用的展开内容。

## 使用建议

- 声明数学结论、规范性质、证明性 API 时用 `theorem`。
- 若某声明虽然返回命题，但本质更像辅助定义或需要计算展开，应认真考虑是否真该写成 theorem。
- 改写 theorem proof 时，要记住 header 先行 elaboration 的规则，这对 section variable 和自动参数推断很重要。