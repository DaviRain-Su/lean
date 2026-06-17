# 归纳类型的运行时表示

> 对应英文：[Run-Time Representation](https://lean-lang.org/doc/reference/latest/The-Type-System/Inductive-Types/#run-time-inductives)，抓取日期：2026-06-16。

归纳类型在运行时的表示并不总是“每个值都变成同一种通用盒子”。Lean 编译器会根据归纳类型的具体形状，为不同情况选择更高效的表示策略。

## 英文页强调的几个方面

- exceptions
- relevance
- trivial wrappers
- other inductive types
- FFI

## relevance

proof 与其他命题层字段在编译后会被擦除，因此某些归纳类型在运行时比逻辑模型看起来更精简。

## trivial wrappers

若某个归纳类型本质上只是“一个非 proof 字段外加若干 proof 字段”或类似轻量包装，它在运行时常可退化成与底层值相同或近似相同的表示。

这也是为什么像：

- `Subtype`
- 某些单字段结构
- 一些轻量 wrapper

往往几乎没有额外运行时成本。

## exceptions 与其他特殊情况

某些归纳类型还会获得额外的运行时特殊支持，例如异常机制或与外部接口互通的场景。

## FFI

归纳类型的运行时表示还会影响它们与外部语言或 FFI 的交互方式。若某类型准备暴露给外部系统使用，除了逻辑定义外，还必须考虑运行时布局与可传递性。

## 使用建议

- 证明里看到的归纳类型结构，不一定等于运行时代码里的真实布局；
- 性能敏感代码设计时，要留意 proof 擦除、trivial wrapper 和特殊表示带来的优化机会；
- 与 FFI 交互时，不能只看高层逻辑模型，还要看运行时表示约束。