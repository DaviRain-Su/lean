# 证明

> 对应英文：[Proofs](https://lean-lang.org/doc/reference/latest/Terms/Proofs/)，抓取日期：2026-06-16。

在 Lean 中，proof 本身也是 **term**。证明命题与构造某个 type 的 inhabitant 在语言层面是同一件事：命题是 `Prop` 中的 type，proof 是该 type 的 inhabitant。

## 两条进入路径

理解 Lean 证明通常有两条线索，它们最终生成同一个核心 proof term：

1. **Term 角度**：proof 是普通表达式，例如函数、pair、constructor、`match`、对已证定理的应用。
2. **Tactic 角度**：`by ...` 会逐步构造这个表达式；你在 InfoView 里看到的是中间状态，内核检查的是最终 term。

因此「手写 term 证明」与「策略脚本证明」不是两套系统，而是同一对象的两种写法。

## `by` 与 tactic 证明

调用 tactic 的语法是 `` `by tac` ``：在需要 proof term 的位置运行 tactic（或缩进式 tactic block），由 elaborator 把脚本收束成一个 term。

```lean
example (n : Nat) : n + 0 = n := by
  rw [Nat.add_zero]
```

这里 `by` 后面的 `rw` 并不直接出现在内核里；内核看到的是 `rw` 生成的等式证明 term。`by` 的完整行为见 [运行 tactic](../Tactics/RunningTactics.md)。

## Term 证明示例

不用 `by` 也可以直接给出 proof term：

```lean
example (a b : Nat) (h : a = b) : b = a := h.symm

example (p q : Prop) (hp : p) (hq : q) : p ∧ q := ⟨hp, hq⟩
```

第一种是对假设 `h` 调用 `Eq.symm`；第二种用 `And` 的 constructor `⟨_, _⟩` 把两个子证明打包。许多「intro / apply / exact」策略本质上就是在帮你拼这类 term。

## 与 `Prop`、proof irrelevance 的关系

`Prop` 中的 inhabitant 是 proof。Lean 对 proof 采用 **proof irrelevance**：同一命题的两个 proof 在定义上等价。这使得我们在 tactic 里可以「只关心有没有证出来」，而不必记住具体用了哪条路径——但最终仍会有一个具体的 proof term 交给内核。

## 何时用哪种风格

| 场景 | 更常见的写法 |
| --- | --- |
| 教学、探索、中等复杂度的等式/逻辑证明 | `by` + tactic |
| 小型 combinator 式证明、定义性等式 | 直接 term |
| 需要精确控制项结构（例如元编程、自定义 tactic） | term，或 `by` 后再 `show` / `exact` 对齐 |

交互式证明的语法、proof state 与 goal 管理见 [策略证明](../TacticProofs.md) 与 [Tactic 详解](../Tactics/RunningTactics.md)。