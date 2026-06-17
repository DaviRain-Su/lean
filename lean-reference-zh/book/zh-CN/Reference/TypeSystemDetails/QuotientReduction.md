# quotient reduction

> 对应英文：[Quotient Reduction](https://lean-lang.org/doc/reference/latest/The-Type-System/Quotients/#quotient-reduction)，抓取日期：2026-06-16。

quotient 在 Lean 里有专门的 reduction 规则，但这类 reduction 与普通 constructor/recursor 的 ι-reduction 不同。

## 基本直觉

quotient 允许你：

- 把底层值放进 quotient；
- 用 `lift` 一类 API 从 quotient 上定义函数；
- 保证结果不依赖代表元的具体选择。

当一个 `lift` 立即作用在由 `mk` 构造的元素上时，会发生相应 reduction，把它化成底层函数应用结果。

## 为什么这很重要

如果 quotient 完全不能规约，那么：

- quotient 上的计算会几乎不可执行；
- `funext` 等依赖 quotient 的构造很难工作；
- 很多看似自然的高层定义会退化成纯逻辑存在物，而不是可计算对象。

quotient reduction 保证：quotient 既保持抽象屏障，又不会完全失去计算性。

## 使用建议

- 推理 quotient 上函数时，优先记住 “mk + lift 会化简”；
- 若某处规约没有按预期发生，先检查是否真的使用了 quotient API 的标准引入/消去形式，而不是绕过它们写了更底层对象。