# 低层 quotient API

> 对应英文：[Low-Level Quotient API](https://lean-lang.org/doc/reference/latest/The-Type-System/Quotients/#The-Lean-Language-Reference--The-Type-System--Quotients--Logical-Model--Low-Level-Quotient-API)，抓取日期：2026-06-16。

`Quotient` 是面向日常使用的高层接口；其底层 primitive 是 `Quot`。英文页列出了一组更接近 primitive quotient 的 API：

- `Quot.liftOn`
- `Quot.recOnSubsingleton`
- `Quot.rec`
- `Quot.recOn`
- `Quot.hrecOn`

## 为什么存在低层 API

这些接口暴露得更接近内核 primitive，因此适合：

- 研究 Lean 逻辑本身；
- 证明一些更底层的元理论性质；
- 实现像 `Quotient` 这样建立在 `Quot` 上的高层包装；
- 特殊场景下进行更精细的控制。

## 日常代码是否该用它们

通常不应该。

对普通库和应用代码而言：

- 优先使用 `Quotient`
- 优先使用 `Quotient.mk` / `lift` / `sound` / `ind`

因为这些接口已经把“等价关系必须真的是 equivalence relation”这一层约束表达出来，更安全也更贴近数学直觉。

## 何时可能需要

- 做 Lean 核心理论相关研究；
- 写非常底层的元编程或库基础设施；
- 想证明 `Quotient` 的某些高层性质是如何从 `Quot` primitive 推出来的。

## 使用建议

- 若你不确定是否需要低层 quotient API，那大概率不需要；
- 只有当高层 `Quotient` 抽象挡住了你需要表达的内容时，才考虑往下走到 `Quot`。