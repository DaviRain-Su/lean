# 公理

> 对应英文：[Axioms](https://lean-lang.org/doc/reference/latest/Axioms/)，抓取日期：2026-06-16。

axiom 是被假定存在的常量。axiom 的 type 本身必须是一个 type，也就是说它必须具有 type `Sort u`；除此之外没有进一步要求。axiom 不会 reduce 到其他 term。

axiom 可用于在投入时间构造模型或证明定理之前，先实验某个想法的后果。它们也可用于采用 Lean 类型论中无法直接获得的推理原则；Lean 本身提供三个已知一致的此类公理。不过 axiom 必须谨慎使用：彼此不一致或本身为假的 axiom 会破坏证明的基础。Lean 会自动跟踪每个 proof 依赖的 axiom，以便审计。

## 8.1 Axiom declaration

axiom declaration 包含名称和 type：

```lean
axiom name : type
```

语法上，axiom declaration 可写作：

```lean
axiom declId declSig
```

axiom declaration 可以使用所有 declaration modifier。documentation comment、attribute、`private` 和 `protected` 与其他 declaration 中含义相同。`partial`、`nonrec`、`noncomputable` 和 `unsafe` 对 axiom 没有效果。

## 8.2 一致性

使用 axiom 有风险。因为 axiom 会引入任意 type 的新常量，而 proposition 类型的 inhabitant 就是该 proposition 的 proof，所以 axiom 甚至可以用于证明假命题。任何依赖 axiom 的 proof，只有在该 axiom 为真且与其他已用 axiom 一致的程度上才可信。

从本质上说，Lean 无法检查新 axiom 是否一致。因此，添加 axiom 时必须非常谨慎。

## 8.3 Reduction

即使是一致的 axiom 也可能造成困难。definitional equality 会根据 reduction rule 识别 term。ι-reduction rule 描述 recursor 和 constructor 的交互；由于 axiom 不是 constructor，该规则不适用于 axiom。

通常，没有 free variable 的 term 会 reduce 为 constructor 的应用；但 axiom 可能让它们卡住（stuck），从而产生很大的 term。

此外，Lean compiler 无法为 axiom 生成代码。运行时，Lean value 必须由内存中的具体数据表示，但 axiom 没有具体表示。包含依赖 axiom 的非 proof code 的 definition 必须标记为 `noncomputable`，并且不能编译。

## 8.4 标准公理

Lean 中有七个标准 axiom。前三个是 Lean 中进行数学推理的重要组成部分：

```lean
Classical.choice.{u} {α : Sort u} : Nonempty α → α
propext {a b : Prop} : (a ↔ b) → a = b
Quot.sound.{u} {α : Sort u}
  {r : α → α → Prop} {a b : α} :
  r a b → Quot.mk r a = Quot.mk r b
```

这三个 axiom 都在 *Theorem Proving in Lean* 中讨论过。

`sorryAx` 是 `sorry` tactic 和 `sorry` term 实现的一部分。完成的 proof 中不应出现该 axiom，因为它可以证明任意命题：

```lean
sorryAx {α : Sort u} (synthetic := true) : α
```

最后三个 axiom 并不真正因为数学内容而存在；从数学角度看，它们证明的都是平凡命题：

```lean
Lean.trustCompiler : True
Lean.ofReduceBool (a b : Bool) : Lean.reduceBool a = b → a = b
Lean.ofReduceNat (a b : Nat) : Lean.reduceNat a = b → a = b
```

这些 axiom 用于跟踪某些 proof 依赖整个 compiler 的正确性，而不只是依赖更小的 kernel。

## 8.5 显示 axiom 依赖

`#print axioms` 后接一个已定义 identifier，会显示该定义传递依赖的所有 axiom。换言之，如果某个 proof 使用另一个 proof，而后者使用了 axiom，那么这两个 proof 的 `#print axioms` 都会报告该 axiom。

这可以用于审计某个 proof 的假设，例如检测一个 proof 是否传递依赖 `sorry` tactic。

```lean
def lazy : 4 == 2 + 1 + 1 := by
  sorry

#print axioms lazy
```

输出会指出：

```text
'lazy' depends on axioms: [sorryAx]
```

结合 `#guard_msgs`，可以把 axiom 依赖输出写入测试，从而防止某个证明意外开始依赖额外 axiom。