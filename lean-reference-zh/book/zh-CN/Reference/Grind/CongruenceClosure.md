# `grind`：congruence closure

> 对应英文：[Congruence Closure](https://lean-lang.org/doc/reference/latest/The--grind--tactic/Congruence-Closure/)，抓取日期：2026-06-16。

congruence closure 维护一个等价类系统：在自反、对称、传递闭包之上，再加入“相等参数产生相等函数结果”的规则。如果 `a = a'` 且 `b = b'`，那么 `f a b = f a' b'` 也会被加入。

## 在 `grind` 里的作用

可以把它理解成白板上的“等价类维护器”：

- 每个 `h : t₁ = t₂` 都在白板上连起 `t₁` 和 `t₂`；
- 一旦若干项经由这些连线联通，它们就被视为等价；
- 若某个归纳类型的不同 constructor 被放进同一类，就得到矛盾并立即关闭目标。

## 为什么它不同于 `simp`

- `simp` 是**有方向的、破坏式的**：看到 `t₁ = t₂` 就把某些 `t₁` 改成 `t₂`。
- `grind` 的 congruence closure 是**双向累积**：不替换 term，而是把代表元并入同一等价类。

这种做法对对称推理、相互依赖的等式以及深层 constructor 嵌套尤其稳健。

## 典型收益

- 从 `x = y` 和 `f y = g y` 推出 `f x = g x`；
- 从 tuple / structure 的整体相等推出投影相等；
- 利用 constructor 冲突直接得到 `False`。

## 使用建议

- 当目标本质是“大量等式闭包”时，优先考虑 `grind`；
- 若问题主要是定向化简，仍然先试 `simp` / `rw`；
- 看到大量“函数应用相等链”时，往往就是 congruence closure 发力的地方。
