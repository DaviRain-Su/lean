# Lean 标准公理

> 对应英文：[Standard Axioms](https://lean-lang.org/doc/reference/latest/Axioms/#The-Lean-Language-Reference--Axioms--Standard-Axioms)，抓取日期：2026-06-16。

Lean 英文参考页列出七个“标准公理”。其中前三个是数学实践中非常重要的逻辑原则：

- `Classical.choice`
- `propext`
- `Quot.sound`

它们分别对应：

- 从 `Nonempty α` 选出一个 `α`
- 命题外延性
- quotient 的等价关系兼容性

这三者都在 *Theorem Proving in Lean* 中有详细背景。

## `sorryAx`

```lean
sorryAx {α : Sort u} (synthetic := true) : α
```

它是 `sorry` tactic 和 `sorry` term 的实现基础。由于它可以构造任意类型的项，因此任何依赖 `sorryAx` 的证明本质上都还没有完成。

## 与编译器可信边界相关的公理

另外三个标准公理并不是因为数学内容而存在，而是用来标记“这个证明额外依赖了 Lean 整个编译器/运行时链路的正确性”：

- `Lean.trustCompiler`
- `Lean.ofReduceBool`
- `Lean.ofReduceNat`

它们让系统能追踪：某个 proof 是否不仅依赖小 kernel，还依赖更大的编译器可信边界。

## 实际意义

- 前三类公理更多是数学推理层面的基础设施；
- `sorryAx` 是未完成证明的红旗；
- `Lean.trustCompiler` 一类则反映 proof 对 native evaluation 或编译器正确性的依赖。

## 使用建议

- 完成版证明中不应残留 `sorryAx`。
- 看到 `Lean.trustCompiler` 时，应意识到此 proof 的可信边界更大。
- 数学库和形式化结果若要强调高可信度，应明确说明是否依赖这些标准公理中的哪几种。