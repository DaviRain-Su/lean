# quotient 的替代方案

> 对应英文：[Alternatives to Quotient Types](https://lean-lang.org/doc/reference/latest/The-Type-System/Quotients/#quotient-alternatives)，抓取日期：2026-06-16。

`Quotient` 提供了一个方便且计算上可接受的商类型机制，但它并不是所有场景的唯一答案。

## universal property 视角

若类型 `Q` 连同函数 `q : A → Q` 满足：

- `q a = q b` 当且仅当 `a ∼ b`

那么从范畴论/集合论视角看，`Q` 就是 `A` 按关系 `∼` 的 quotient。`Quotient` 给出的对象在命题相等意义下满足这个性质。

## canonical representative 方案

另一种常见做法是：

1. 在每个等价类中选一个 canonical representative；
2. 直接把 quotient 实现为“这些 canonical representative 的子类型”；
3. 再给出从原类型到 canonical representative 的归约函数。

这种方式的好处：

- 同一等价类的代表值往往是 definitionally equal；
- 从 quotient 出发定义函数时，不必再反复证明“尊重等价关系”；
- 在某些场景下计算行为更好，因为结果总是归一化后的 canonical form。

## 局限

- 并不是所有 quotient 都容易挑出 canonical representative；
- canonicalization 本身可能很难、很昂贵，甚至依赖额外公理；
- 某些数学对象自然上更适合真正的 quotient，而不是“先归一化再包装”。

## 与归纳类型的关系

手工 canonical representative 方案往往更适合与归纳类型嵌套使用，因为它仍是普通 inductive / subtype 风格对象，而不是 primitive quotient。

## 使用建议

- 若每个等价类都容易选规范代表元，优先考虑“正规化 + 子类型/结构体”方案；
- 若想要更直接的抽象屏障，或规范代表元难以选取，则用 `Quotient` 更自然。