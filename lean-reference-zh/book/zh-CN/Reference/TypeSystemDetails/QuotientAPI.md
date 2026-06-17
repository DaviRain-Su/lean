# quotient API

> 对应英文：[Quotient API](https://lean-lang.org/doc/reference/latest/The-Type-System/Quotients/#quotient-api)，抓取日期：2026-06-16。

quotient 的日常使用主要围绕三组操作：

- 把底层值放进 quotient
- 从 quotient 定义函数到别的类型
- 对 quotient 做证明

## 1. 引入 quotient

常见构造：

- `Quotient.mk`
- `Quotient.mk'`

它们把底层类型 `α` 的值放进某个 `Quotient s` 中。区别在于：

- `Quotient.mk` 显式接收 `Setoid`
- `Quotient.mk'` 通过 instance synthesis 找 `Setoid`

## 2. 消去 quotient

从 quotient 出发定义函数时，必须证明你的函数**尊重等价关系**。常见接口：

- `Quotient.lift`
- `Quotient.liftOn`
- `Quotient.lift₂`
- `Quotient.liftOn₂`

它们都体现同一个原则：你不能观察等价类代表元之间的差异；若函数会受代表元选择影响，它就不能被提升到 quotient 上。

## 3. 关于 quotient 的证明

常用证明工具：

- `Quotient.sound`
- `Quotient.ind`
- `Quotient.rec`
- `Quotient.recOn`
- `Quotient.hrecOn`

其中：

- `Quotient.sound`：若底层值满足等价关系，则它们在 quotient 中相等；
- `Quotient.ind` / `recOn`：允许你“假定元素都是由 `mk` 构造的”来证明 quotient 上的性质。

## 与低层 `Quot` 的关系

`Quotient` 建立在更原始的 `Quot` 之上。普通用户应优先使用 `Quotient`，因为它要求你先证明关系确实是等价关系，更安全也更符合数学直觉。

## 使用建议

- 定义 quotient 上的函数时，优先先写底层版本，再证明它 respects equivalence relation。
- 调试 quotient 证明时，通常先分清：你现在是在“引入值”、“消去函数”还是“证明等价”。