# `mvcgen` tactic

> 对应英文：[The mvcgen tactic](https://lean-lang.org/doc/reference/latest/The--mvcgen--tactic/)，抓取日期：2026-06-16。

`mvcgen` tactic 实现了 monadic verification condition generator。它会把一个涉及 Lean 命令式 `do` notation 程序的 goal，拆解成若干更小的 verification condition（VC）；证明这些 VC 就足以证明原始 goal。

本章英文原文既包含 `mvcgen` 的参考说明，也包含一个可独立阅读的教程：**Verifying Imperative Programs Using mvcgen**。

## 使用前提

要使用 `mvcgen`，需要导入：

```lean
import Std.Tactic.Do
```

并打开 namespace：

```lean
open Std.Do
```

## 用途

`mvcgen` 面向用 monadic `do` notation 写出的程序，尤其是看起来像命令式程序的代码。它不会直接替用户证明所有性质，而是生成足够证明程序正确性的 VC。随后用户可以用普通 tactic、`simp`、`grind`、线性算术等工具解决这些 VC。

这种工作流类似传统程序验证中的 verification condition generation：

1. 用户写出程序和规格；
2. `mvcgen` 分解程序结构；
3. tactic 产生每个路径、每个条件需要证明的逻辑目标；
4. 用户或自动化证明这些目标。

## Predicate transformer

`mvcgen` 的核心思想是 predicate transformer：它描述一个程序片段如何把后置条件转换为需要在执行前成立的前置条件。对 `do` block 中的 bind、let、条件、循环或其他 monadic 操作，`mvcgen` 会根据可用规则逐步向后传播规格，从而生成 VC。

## Verification condition

verification condition 是一个普通 Lean goal。它可能包含程序变量、循环不变量、路径条件、函数前置条件或后置条件。`mvcgen` 的目标是把程序结构相关的证明工作机械化，让用户只需要证明这些数学或逻辑条件。

## 为 monad 启用 `mvcgen`

不同 monad 需要提供对应规则，使 `mvcgen` 知道如何解释其操作。这通常通过 `Std.Do` 中的机制完成。库可以为自己的 monad 添加支持，让 `mvcgen` 能处理特定 effect 或程序模型。

## Proof mode

英文参考手册还包含 proof mode 说明。proof mode 提供一种更结构化的交互方式，用来在 `mvcgen` 生成的 VC 与程序结构之间导航。实际使用时，常见流程是先运行 `mvcgen` 拆分目标，再用已有自动化或手写 proof 完成剩余条件。

## 后续小节

英文参考手册随后把本章展开为：

- 17.1 Overview
- 17.2 Predicate Transformers
- 17.3 Verification Conditions
- 17.4 Enabling `mvcgen` For Monads
- 17.5 Proof Mode