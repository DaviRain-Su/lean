# 命题（类型系统层）

> 对应英文：[Propositions](https://lean-lang.org/doc/reference/latest/The-Type-System/Propositions/)，抓取日期：2026-06-16。

命题是“有意义、并且允许证明”的陈述。错误陈述仍然是命题；只有无意义的陈述才不是。所有命题都由 `Prop` 分类。

## 命题的关键性质

### 1. definitional proof irrelevance

同一命题的任意两个证明在 definitional 层面完全可互换。也就是说，Lean 不把“你是怎样证明的”当作命题意义的一部分。

### 2. run-time irrelevance

命题和证明在编译后会被擦除，不参与运行时代码。

### 3. impredicativity

命题可以量化任意 universe 中的类型。也就是说，`Prop` 可以谈论所有类型，而不仅仅是较小 universe 的类型。

### 4. restricted elimination

除 subsingleton 等特殊情况外，命题不能随意消去到非 proposition 类型。这保证了 proof irrelevance 等性质与运行时代码行为不冲突。

### 5. extensionality

逻辑等价的命题可借 `propext` 证明相等。

## `propext`

Lean 提供公理：

- `propext : (a ↔ b) → a = b`

它说明：若两个命题逻辑等价，则它们可在所有上下文中彼此替换。

`propext` 特别重要，因为：

- 普通逻辑连接词都应尊重命题外延性；
- 对高阶表达式（如 `P a`，其中 `P : Prop → Prop`）而言，没有它很难进行等价替换；
- 它也是很多更高级命题等价推理的基础。

## 使用建议

- 证明里把 proposition 当 type 看待时，始终记住 proof 会被擦除；
- 想从命题推出运行时数据时，要非常小心，因为 Lean 只允许受限消去；
- 当需要把逻辑等价升级成真正的等号时，考虑 `propext`。