# `grind` tactic

> 对应英文：[The grind tactic](https://lean-lang.org/doc/reference/latest/The--grind--tactic/)，抓取日期：2026-06-16。

`grind` tactic 使用受现代 SMT solver 启发的技术自动构造 proof。它会逐步收集事实集合，并用一组协同技术从已有事实推出新事实。幕后所有 proof 都按反证法组织，因此 expected conclusion 和 premise 之间没有操作层面的区别；`grind` 总是试图推出矛盾。

可以把 `grind` 想象成一块虚拟白板。每当它发现新的 equality、inequality 或 boolean literal，就把该事实写到白板上，把等价 term 合并到同一 bucket 中，并邀请各个 engine 从白板读取事实、再把新事实写回白板。特别地，因为所有真 proposition 都等于 `True`，所有假 proposition 都等于 `False`，`grind` 在跟踪 equivalence class 时也跟踪已知事实集合。

## 协同 engine

`grind` 使用的协同 engine 包括：

- congruence closure；
- constraint propagation；
- E-matching；
- guided case analysis；
- 一组 satellite theory solver，包括 linear integer arithmetic 和 commutative ring solver。

和其他 tactic 一样，`grind` 会为它添加的每个事实生成普通 Lean proof term。Lean 标准库已经用 `@[grind]` attribute 标注了许多 lemma，因此常见 lemma 可以自动被发现。

## 适用范围与边界

`grind` 不适合 search space 组合爆炸的目标，例如大规模 pigeonhole instance、graph-coloring reduction、高阶 N-queens 棋盘，或把 200 变量 Sudoku 编码成 boolean constraint。这类编码需要成千上万甚至数百万次 case split，会压垮 `grind` 的 branching search。

对于 bit-level 或纯 boolean combinatorial problem，应使用 `bv_decide`。`bv_decide` 会调用现代 SAT solver（例如 CaDiCaL 或 Kissat），然后返回紧凑、可由机器检查的 certificate。繁重搜索发生在 Lean 外部；certificate 在 Lean 内部 replay 并验证，因此仍保持 trust。验证时间随 certificate size 增长。

## 示例：congruence closure

下面的 proof 可由 congruence closure 立即完成，因为它会发现相等 term 的集合：

```lean
example (a b c : Nat) (h₁ : a = b) (h₂ : b = c) :
    a = c := by
  grind
```

## 示例：代数推理

`grind` 可以使用 commutative ring solver：

```lean
example [CommRing α] [NoNatZeroDivisors α] (a b c : α) :
    a + b + c = 3 →
    a ^ 2 + b ^ 2 + c ^ 2 = 5 →
    a ^ 3 + b ^ 3 + c ^ 3 = 7 →
    a ^ 4 + b ^ 4 = 9 - c ^ 4 := by
  grind
```

## 示例：有限域推理

`Fin` 上的 arithmetic operation 会 overflow；结果超出边界时会 wrap around 到 `0`。`grind` 可以利用这一事实证明相应 theorem：

```lean
example (x y : Fin 11) :
    x ^ 2 * y = 1 →
    x * y ^ 2 = y →
    y * x = 1 := by
  grind
```

## 示例：带 case analysis 的线性整数算术

```lean
example (x y : Int) :
    27 ≤ 11 * x + 13 * y →
    11 * x + 13 * y ≤ 45 →
    -10 ≤ 7 * x - 9 * y →
    7 * x - 9 * y ≤ 4 →
    False := by
  grind
```

## 后续小节

英文参考手册随后把本章展开为：

- 16.1 Error Messages
- 16.2 Minimizing `grind` calls
- 16.3 Congruence Closure
- 16.4 Constraint Propagation
- 16.5 Case Analysis
- 16.6 E-matching
- 16.7 Linear Integer Arithmetic
- 16.8 Algebraic Solver (Commutative Rings, Fields)
- 16.9 Linear Arithmetic Solver
- 16.10 Annotating Libraries for `grind`
- 16.11 Reducibility
- 16.12 Bigger Examples