# 递归定义总览

> 对应英文：[Recursive Definitions](https://lean-lang.org/doc/reference/latest/Definitions/Recursive-Definitions/)，抓取日期：2026-06-16。

Lean 不能允许任意递归定义，因为那会破坏逻辑一致性：若任意循环都被接受，就可能写出循环证明，甚至让无限循环得到 `Empty` 之类类型并进而推出任意结论。

但彻底禁止递归也会让 Lean 失去实用性。因此 Lean 的做法是：**允许递归，但要求 elaborator 同时产出“这一定义是安全的”证明或替代解释。**

## 六类主要递归方式

英文页把可接受的递归定义大致分为六类：

1. **structural recursion**
2. **well-founded recursion**
3. **partial fixpoint recursion**
4. **coinductive / inductive predicates as fixpoints**
5. **partial functions with inhabited codomain**
6. **unsafe recursive definitions**

## 结构递归

结构递归要求每次递归调用都发生在某个参数的严格子部分上。Lean 会把这种递归翻译成 recursor 的使用，因此 termination 由 recursor 自身的良性结构保证。

优点：

- kernel 中通常计算较高效；
- 许多定义方程 definitionally 成立；
- 对证明和重写最友好。

## 良基递归

若函数并不是直接对某个参数的子结构递归，而是对某个“会下降的度量”递归，则可用 well-founded recursion。

它更灵活，但通常：

- 定义方程只 propositionally 成立；
- kernel 中归约可能更慢；
- termination proof 更复杂。

## partial fixpoint

某些函数并不保证对所有输入都终止，但仍可通过“固定点语义”安全地引入。尤其是某些 monadic partial function 可用这种方式定义，并配套生成 partial correctness theorem。

## mutual recursion

多个定义之间互相递归时，需要放在 `mutual ... end` block 中。Lean 会把整个互递归块先一起 elaboration，再识别其中真正相互递归的部分并分别处理。

## `partial` 与 `unsafe`

- `partial`：kernel 把它当 opaque 常量，只要求返回类型 inhabited，从而不破坏 soundness。
- `unsafe`：进一步放宽限制，允许使用可能破坏逻辑模型与程序行为一致性的底层特性。

## reduction 控制

英文页最后还讨论 reducibility：

- `reducible`
- `implicit_reducible`
- `semireducible`
- `irreducible`
- `seal` / `unseal`

这些影响 elaborator、simplifier 和 tactic 在何时展开定义。

## 使用建议

- 能写成结构递归时，优先结构递归。
- 结构递归写不出来，再考虑良基递归。
- 只需程序能跑、不依赖强等式理论时，才考虑 `partial`。
- `unsafe` 是最后手段，应明确隔离并仔细审计。