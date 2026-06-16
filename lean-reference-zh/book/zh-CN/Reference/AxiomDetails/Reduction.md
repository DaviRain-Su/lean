# axiom 与 reduction

> 对应英文：[Reduction](https://lean-lang.org/doc/reference/latest/Axioms/#The-Lean-Language-Reference--Axioms--Reduction)，抓取日期：2026-06-16。

即使某些 axiom 是一致的，它们仍会给 reduction 和编译带来实际困难。

## 为什么会卡住

Lean 的 definitional equality 依赖一组 reduction rule。对于归纳类型，ι-reduction 描述了 recursor 与 constructor 的交互；但 axiom 不是 constructor，因此不能触发这类 reduction。

结果是：

- 原本应继续化简的闭项可能停在某个包含 axiom 的位置；
- term 会“stuck”，不能继续规约到 constructor 形态；
- 大型表达式可能因此变得难以读懂，也不利于自动化。

## 对编译的影响

Lean 编译器无法为 axiom 生成代码。运行时值必须落到具体内存表示上，而 axiom 没有对应实现。

因此：

- 任何包含“依赖 axiom 的非 proof 代码”的定义，都必须标记为 `noncomputable`；
- 这类定义不能真正编译成可执行代码。

## 实际含义

- proof 中引用 axiom，问题主要体现在可信度和 reduction；
- 程序代码中引用 axiom，问题会进一步变成“无法编译”。

## 使用建议

- 若目标是程序可执行，尽量避免依赖 axiom。
- 若目标只是逻辑规范或存在性证明，`noncomputable` + axiom 仍可能是合理组合。
- 看到 term 化简异常卡住时，要考虑是否有 axiom 阻断了 reduction。