# recursor

> 对应英文：[Recursors](https://lean-lang.org/doc/reference/latest/The-Type-System/Inductive-Types/#recursors)，抓取日期：2026-06-16。

每个归纳类型声明后，Lean 都会自动生成 recursor。recursor 是“如何对该类型进行消去”的正式接口，也是：

- 递归函数定义的目标形式
- 归纳证明的核心原理
- pattern matching 最终被 elaboration 到的形式

## 直观理解

若 constructor 说明“怎样造出一个值”，recursor 就说明“怎样拆开一个值并对其做推理/计算”。

因此，高层写法如：

- `match`
- 递归 `def`
- `induction`

最终都会借助 recursor 实现。

## recursor 类型

recursor 的类型通常包含：

- motive：结果类型如何依赖被消去的值
- 每个 constructor 的处理分支
- 最终待分析的归纳值

依赖类型版本的 recursor 比简单 case distinction 更强，因为 motive 本身可以依赖输入值。

## subsingleton elimination

对 proposition 或其他 subsingleton 场景，Lean 允许更强的消去能力，这在 recursor 生成上也会体现出来。也就是说，并不是所有归纳类型都只能以同样方式被消去；`Prop` 与 `Type` 之间就有重要差异。

## reduction

recursor 与 constructor 配对时会触发 ι-reduction。这正是归纳类型“能计算”的基础：当你拿已知 constructor 形式的值去跑 recursor 时，结果会规约到相应分支。

## 使用建议

- 调试复杂 pattern matching / 递归 elaboration 时，回到 recursor 视角最可靠；
- 理解某个归纳类型的证明原理时，直接看 recursor 往往比只看 tactic 更清楚。