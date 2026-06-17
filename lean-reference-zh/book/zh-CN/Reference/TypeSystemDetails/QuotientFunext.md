# quotient 与函数外延性

> 对应英文：[Quotients and Function Extensionality](https://lean-lang.org/doc/reference/latest/The-Type-System/Quotients/#quotient-funext)，抓取日期：2026-06-16。

Lean 中的函数外延性 theorem `funext` 并不是额外作为公理塞进系统的，而是可以借助 quotient 构造证明出来。

## 这说明什么

它说明 quotient 不只是数学建模工具，还深度参与 Lean 自身逻辑的组织：

- quotient 提供了把“对所有输入结果一致”提升为“函数相等”的关键桥梁；
- `funext` 因此能作为 theorem，而不是必须作为 primitive axiom。

## 实践意义

从日常证明角度，你通常只需要记住：

- 用 `funext` 可以把函数相等化成逐点相等；
- Lean 之所以能把它当 theorem，是因为 quotient theory 足够强。

但从元理论角度，这一点很重要：它展示了 quotient 在 Lean 逻辑中的表达力。