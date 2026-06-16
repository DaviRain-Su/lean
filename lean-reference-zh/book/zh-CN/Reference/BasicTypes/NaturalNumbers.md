# 自然数

> 对应英文：[Natural Numbers](https://lean-lang.org/doc/reference/latest/Basic-Types/Natural-Numbers/)，抓取日期：2026-06-16。

自然数是非负整数。从逻辑上看，它们由 `Nat.zero` 和 `Nat.succ` 构造出 `0, 1, 2, 3, ...`。Lean 对自然数没有逻辑上的上界，唯一限制来自机器可用内存。

由于自然数既是数学推理核心对象，也是编程中的常用数据，Lean 对它们提供了专门支持：

- 逻辑模型是 inductive type；
- arithmetic operation 以该模型给出规范定义；
- kernel、interpreter 和 compiled code 中使用高效 arbitrary-precision integer 表示；
- 足够小的自然数在运行时可不经指针间接存储。

## 逻辑模型

`Nat` 是一个 inductive type，构造子只有：

- `Nat.zero`
- `Nat.succ`

由此可以导出 Peano axioms 对应的 induction principle。`Nat.rec` 同时实现 induction 和 primitive recursion。`Nat.succ` 的 injectivity，以及 `Nat.succ` 与 `Nat.zero` 的互斥性，也都可由 induction principle 导出。

因此，从逻辑上讲，`Nat` 完全是一个普通归纳类型；只是 Lean 额外为它提供了性能优化。

## 运行时表示

如果完全按逻辑模型表示，`Nat` 会像链表一样低效：加法线性、乘法平方级，内存占用也巨大。Lean 因此在 kernel 和 compiler 中都为 `Nat` 提供特殊实现。

- 在 kernel 中，闭自然数由高效 arbitrary-precision integer library 表示。
- 在 compiled code 中，较小自然数可直接装箱在机器字中，不需要额外分配。
- 过大的自然数则退回到普通 Lean object 加 arbitrary-precision payload 的形式。

## 语法

自然数字面量通过 `OfNat` type class 覆盖，因此通常直接写 `0`、`1`、`42`，而不是显式写 `Nat.zero` 或 `Nat.succ` 链。

`simp normal form` 也更偏向字面量和 `n + 1` 的写法，而非显式 constructor。

## API 概览

英文页为 `Nat` 提供大量 API，主要分为：

- arithmetic：`pred`、`add`、`sub`、`mul`、`div`、`mod`、`pow`、`log2`
- bitwise operation：`shiftLeft`、`shiftRight`、`xor`、`lor`、`land`、`testBit`
- min/max：`min`、`max`
- gcd/lcm：`gcd`、`lcm`
- comparison：`beq`、`ble`、`blt`、`decEq`、`decLe`、`decLt`、`le`、`lt`
- iteration：`repeat`、`fold`、`forM`、`all`、`any`
- conversion：到 fixed-width int、`Float`、digits 表示等
- elimination：`recAux`、`casesAuxOn` 及若干替代 induction principle

这些操作的逻辑定义通常较直观，但运行时会由更高效 primitive 覆盖。

## 性能建议

- 在性能敏感代码中，优先使用 Lean 内建 arithmetic，而不要自己重新定义 Peano 风格加减乘除。
- 若代码只关心计算结果，应依赖运行时覆盖后的实现；若关心 definitional equality 或证明行为，则要记住其逻辑定义仍是参考基准。
