# axiom 声明

> 对应英文：[Axiom Declarations](https://lean-lang.org/doc/reference/latest/Axioms/#The-Lean-Language-Reference--Axioms--Axiom-Declarations)，抓取日期：2026-06-16。

axiom 声明会向环境中加入一个**后设常量**：它有给定类型，但没有定义体，也不会规约为别的项。

## 基本语法

```lean
axiom name : type
```

也就是说，axiom declaration 只包含：

- 名字
- 类型

与 `def` / `theorem` 不同，它没有 `:= body`。

## 可用 modifier

axiom 支持普通声明的大部分 modifier，例如：

- documentation comment
- attribute
- `private`
- `protected`

但以下 modifier 对 axiom **没有效果**：

- `partial`
- `nonrec`
- `noncomputable`
- `unsafe`

原因很简单：axiom 本身既没有递归体，也没有可执行实现，更不存在“是否安全地编译”这一层问题。

## axiom 在逻辑中的地位

axiom 声明并不是“证明了某个命题”，而是“直接假定了某个项存在”。如果该项的类型是 proposition，那么它就直接是该 proposition 的 proof。

因此 axiom 是极其强力也极其危险的机制：它能让你快速引入推理原则，也能在不加约束时破坏整个证明体系。

## 使用建议

- 只有在确实需要引入外部假设、或模拟尚未实现的原则时才使用 axiom。
- 若某个内容最终可由定理证明、由定义构造，优先不用 axiom。
- 库中公开暴露的 axiom 应在文档里明确说明其数学含义和风险。