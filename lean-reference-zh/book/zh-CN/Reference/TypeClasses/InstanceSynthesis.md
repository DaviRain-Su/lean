# instance synthesis

> 对应英文：[Instance Synthesis](https://lean-lang.org/doc/reference/latest/Type-Classes/Instance-Synthesis/)，抓取日期：2026-06-16。

instance synthesis 是一种递归搜索过程：给定一个 type class 类型，Lean 试图构造出该类型的项；若找不到则失败，若信息不足则可能暂时卡住。

## 两个最常用入口

### `inferInstance`

```lean
inferInstance
```

它要求当前上下文中能通过 type class inference 合成出所需实例。

### `inferInstanceAs`

```lean
inferInstanceAs (SomeClass T)
```

它先为“源类型”合成实例，再把结果调整成当前 expected type，目的是减少实现细节泄漏。它和“给 `inferInstance` 加类型注解”并不完全等价。

## 搜索的基本原则

- 只会为被注册为 class 的类型运行；
- 会考虑 local context 中类型合适的绑定；
- 会考虑已注册的全局实例；
- 候选按优先级和定义顺序尝试；
- 若候选本身又带 instance-implicit 参数，就递归生成新的搜索问题。

## 输入参数与输出参数

只有当 class 的**输入参数**都已知时，某个实例问题才真正可尝试。若某些参数还未知，搜索可能会卡住，等 elaborator 之后获得更多信息再重试。

Lean 允许用：

- `outParam`
- `semiOutParam`

来标记某些参数，使它们在匹配时的地位不同：

- output parameter 匹配时可暂不要求已知；
- semi-output parameter 会参与匹配，但语义更弱于普通输入参数。

它们的目的，是让一些“结果类型依赖前面参数”的 class 更容易被自动搜索。

## 为什么不会无限爆炸

Lean 对每个问题保存候选结果表，因此：

- 遇到循环时不会无限递归；
- 遇到 diamond 依赖图时不会指数级重复搜索。

这正是 type class 在数学层次结构、coercion 图和复杂库接口中仍能实际使用的关键。

## default instance

若普通搜索失败或卡住，Lean 还会尝试匹配的 `default_instance`。这使某些“信息尚不充分”的场景也能继续前进，但代价是更容易引入出乎意料的推断结果。

## morally canonical instances

同一 class 可能存在多个实例，但很多设计期望某些实例在“道德上”是 canonical 的，也就是虽然技术上不是唯一，却应被所有用户一致认为是默认选择。库设计时通常要主动维持这种约定，否则 instance search 会变得不可预测。

## 相关选项

英文页列出若干控制搜索规模与兼容行为的选项，例如：

- `synthInstance.maxHeartbeats`
- `synthInstance.maxSize`
- `backward.synthInstance.canonInstances`
- 与 `inferInstanceAs` wrapping 行为有关的选项

这些主要用于调试或迁移旧代码。

## 使用建议

- 设计 class 时，先分清输入参数和输出参数。
- 设计实例时，尽量让 canonical 方案明显、稳定。
- 调试搜索失败时，先用 `#synth` 和 trace，而不是盲目加更多实例。