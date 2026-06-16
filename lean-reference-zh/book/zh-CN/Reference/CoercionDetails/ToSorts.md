# coercion 到 sort

> 对应英文：[Coercing to Sorts](https://lean-lang.org/doc/reference/latest/Coercions/Coercing-to-Sorts/)，抓取日期：2026-06-16。

有些位置并不要求一个“具体已知类型”，而是要求一个 **type 或 proposition**。这类位置下，普通 `Coe` 机制往往不够，因为它要求一个明确的 expected type；但这里 expected type 只是“某个 universe”。

## 为什么普通 coercion 不够

例如：

- definition header 里的冒号后面
- 函数类型中的 domain / codomain
- 某些 binder 的类型位置

在这些位置，Lean 知道“这里要的是 type/proposition”，却未必提前知道是哪个 universe，因此普通 `CoeT` 机制不够表达。

## `CoeSort`

Lean 用 `CoeSort` 处理这种情况。若某个 term 出现在需要 sort 的位置，而它本身不是 sort，Lean 会尝试合成：

- `CoeSort α β`

其中 `β` 必须本身是一个 universe。

## 显式语法：`↥ t`

```lean
↥ t
```

可显式请求“把 `t` coercion 成一个 sort”。

## 与普通 coercion 的关系

- 当 expected type 只是“某个 universe”时，Lean 优先考虑 `CoeSort`。
- 若某处其实已经有具体 expected type，则仍可能直接走普通 `CoeT`。
- `CoeSort` 实例也可作为 `CoeOut` 的来源，因此二者不是完全割裂的系统。

## 适用场景

`CoeSort` 适合把某些“携带类型信息的对象”当作 type 使用。例如某个包装器、描述器或 universe-level 结构，本质上代表一个类型，但其表面并不是 sort。

## 使用建议

- 只在确实需要“值到类型”的桥接时使用 `CoeSort`。
- 若只是普通值到值的转换，不要滥用 `CoeSort`。
- 设计 API 时要谨慎：一旦允许值被当作 type 使用，阅读和调试门槛会上升。