# 归纳类型

> 对应英文：[Inductive Types](https://lean-lang.org/doc/reference/latest/The-Type-System/Inductive-Types/)，抓取日期：2026-06-16。

归纳类型是 Lean 中最核心的数据与证明构造机制之一。列表、自然数、树、命题连接词、结构体等，很多对象都建立在归纳类型之上。

## 它们提供什么

归纳类型同时给出：

- 一组 constructor
- 用这些 constructor 生成值的方式
- 与之匹配的 recursor / eliminator
- 一套 reduction 规则

因此，定义一个归纳类型不只是“声明几个构造子”，也是在向内核说明“如何消去它、如何递归它”。

## 参数与索引

Lean 区分：

- **parameter**：在整个归纳族中固定不变
- **index**：在不同构造子结果中可以变化

这是很多归纳类型设计的关键。若某个量需要随构造子变化，它就不该放成 parameter，而应作为 index。

## structure 也是特殊归纳类型

`structure` 可看作“单构造子的归纳类型”，但 Lean 为它提供了字段投影、实例语法、继承等更友好的表面接口。

## 逻辑模型与 recursor

每个归纳类型都会生成 recursor。recursor 决定：

- 如何对该类型做 case analysis
- 如何定义递归函数
- 如何做归纳证明

因此，很多高层 pattern matching、递归定义，最终都会编译成 recursor 应用。

## 良构性要求

英文页详细讨论了归纳类型的良构性要求，包括：

- universe level 约束
- strict positivity
- `Prop` 与 `Type` 的区别

这些限制保证：

- 归纳定义不会破坏一致性
- 递归和模式匹配仍有可预测语义

## 运行时表示

归纳类型在运行时的表示依赖具体形状：

- 某些是普通 tagged union
- 某些是 trivial wrapper
- 某些在 proof 擦除后会进一步简化
- mutual / nested inductive type 也有各自约束

## 互递归与嵌套归纳

Lean 还支持：

- mutual inductive types
- nested inductive types
- 某些 lattice-theoretic inductive / coinductive predicate 视角

这让它能表达非常复杂的语言和数学结构。

## 使用建议

- 设计数据结构前，先分清 parameter 与 index。
- 当递归定义或证明行为异常时，优先回到 recursor / positivity / universe 这几层理解。
- 结构体能解决的问题优先用 `structure`；真正需要多 constructor 时再用一般 `inductive`。