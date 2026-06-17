# totality 与终止

> 对应英文：[Totality and Termination](https://lean-lang.org/doc/reference/latest/The-Type-System/Functions/#The-Lean-Language-Reference--The-Type-System--Functions--Totality-and-Termination)，抓取日期：2026-06-16。

从 Lean 逻辑的角度看，所有函数都是 **total** 的：

- 对每个类型正确的输入都有定义；
- 在有限时间内返回某个结果；
- 不会因为少了 pattern match 分支而崩溃。

## 为什么 Lean 需要 totality

Lean 不只是编程语言，也是证明系统。若任意非终止函数都能直接进入逻辑，那么就可能通过循环定义破坏一致性。

因此，Lean 在逻辑层面把“函数是 total 的”视为基本前提之一。

## 与现实编程的张力

实际编程里，有时你仍想写：

- 尚未证明终止的递归
- 运行时可能 panic 的操作
- 某些只关心编译后行为的低层函数

Lean 因此提供了一些“逃生口”，但会显式标记可信边界变化。

## `partial` 与 `unsafe`

### `partial`

`partial` function 在 Lean 逻辑里会被当成 uninterpreted function：

- 它在编译代码中照常执行；
- 但逻辑层面不会把它当作可规约、可展开的 total function。

只要其 codomain 已知 nonempty，这类函数仍可被引入逻辑环境。

### `unsafe`

`unsafe` function 更进一步：它完全不作为普通安全逻辑对象暴露给 Lean 的推理系统。

## panic 型运行时操作

像越界数组访问这类在编译代码中可能失败的操作，也只能在“结果类型已知有 inhabitant”时使用。逻辑层面上，Lean 会用该类型的某个 inhabitant 兜底表示其结果，而不是让逻辑陷入未定义状态。

## 使用建议

- 若希望函数参与普通推理与规约，优先证明终止；
- 只有在明确接受“逻辑视角与执行视角分离”时，才使用 `partial`；
- `unsafe` 应严格限制在低层实现边界。