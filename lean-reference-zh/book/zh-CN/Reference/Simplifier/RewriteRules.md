# simplifier 的重写规则

> 对应英文：[Rewrite Rules](https://lean-lang.org/doc/reference/latest/The-Simplifier/Rewrite-Rules/)，抓取日期：2026-06-16。

simplifier 主要使用三类重写规则。

## 1. 要展开的声明

默认情况下，simplifier 只自动展开 `reducible` 定义。若显式把某个 semireducible 或 irreducible 定义加入 simp 规则，那么 `simp` 也可展开它。

在 `dsimp` 这类 definitional mode 中，展开只是把定义名替换成定义值；在普通 `simp` 中，还会进一步使用 equation compiler 生成的 equational lemma。

## 2. 等式引理

`simp` 可以把任意等式证明当作重写规则：把等式左边换成右边。等式引理可以带参数，simplifier 会：

- 先匹配目标中的左侧模式；
- 再尝试用 proof search 填补额外参数。

此外，由于 propositional extensionality，命题本身也能被改写成更简单但逻辑等价的命题。若 simplifier 把目标命题改写成 `True`，它会自动关闭该目标。

## 3. Simproc

除了方程式重写，Lean 还支持 simplification procedure，也就是 **simproc**。它们用 Lean 元编程实现，适合那些“不易用等式高效表达”的简化。标准库为许多内建类型的重要运算提供了 simproc。

## 内建 reduction

即使 simp set 为空，`simp` 仍有若干内建 reduction 规则，例如：

- 把 `let` 绑定变量替换为其值；
- 对 constructor discriminant 的 `match` 做 reduction；
- 对 structure projection 做 reduction；
- 把 lambda 应用到参数上。

这些行为由配置项控制，因此“没有 lemma”并不等于“什么也不做”。

## 使用建议

- 若只是想展开某定义，可显式把它加入 `simp` 参数；
- 若某种简化依赖复杂计算而不是纯等式，考虑 simproc；
- 写 simp lemma 时，优先让右侧更接近预期的 normal form。
