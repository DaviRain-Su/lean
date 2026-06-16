# 宇宙层级

本节将从实现的角度讲解 **宇宙层级**（Universe levels）的相关内容，并说明类型检查 Lean 声明时读者需要掌握的重点。若要更深入了解宇宙层级在 Lean 类型理论中的作用，请参考 [TPIL4](https://lean-lang.org/theorem_proving_in_lean4/dependent_type_theory.html#types-as-objects)，或 [Mario Carneiro 博士论文](https://github.com/digama0/lean-type-theory)第 2 节。

宇宙层级的语法定义如下：

```
Level ::= Zero | Succ Level | Max Level Level | IMax Level Level | Param Name
```

读者应特别注意 `Level` 类型的几个关键性质：

* 存在宇宙层级上的偏序关系（partial order）。
* 存在变量形式的层级，即 `Param` 构造子。
* `Max` 和 `IMax` 两个构造子的区别。

具体而言：

* `Max` 构造出一个宇宙层级，表示左右参数中较大的那一个。例如：

  * `Max(1, 2)` 简化为 `2`
  * `Max(u, u+1)` 简化为 `u+1`

* `IMax` 同样表示左右参数中较大的那一个，**除非** 右边的参数化简到 `Zero`，此时整个 `IMax` 表达式会化简为 `0`。

`IMax` 的重要作用在于配合类型推断过程，确保如下推断规则成立：

* `forall (x y : Sort 3), Nat` 会被推断为 `Sort 4`，
* 而 `forall (x y : Sort 3), True` 会被推断为 `Prop`。

---

## 宇宙层级上的偏序关系

Lean 中的 `Level` 类型具备一个 **偏序关系**，意味着我们可以对任意两个层级进行“小于或等于”的测试。

下述高质量的实现示例摘自 Gabriel Ebner 开发的 Lean 3 检查器 [trepplein](https://github.com/gebner/trepplein/tree/master)。尽管有许多情况需要逐一处理，但真正复杂的匹配只有那些依赖于 `cases` 的情形。`cases` 操作会检查 `x ≤ y` 是否成立，这通过分别将某个参数 `p` 替换为 `Zero` 或 `Succ p`，并据此判断 `x ≤ y` 是否依然成立来实现。

```lean
  leq (x y : Level) (balance : Integer): bool :=
    Zero, _ if balance >= 0 => true
    _, Zero if balance < 0 => false
    Param(i), Param(j) => i == j && balance >= 0
    Param(_), Zero => false
    Zero, Param(_) => balance >= 0
    Succ(l1_), _ => leq l1_ l2 (balance - 1)
    _, Succ(l2_) => leq l1 l2_ (balance + 1)

    -- descend left
    Max(a, b), _ => (leq a l2 balance) && (leq b l2 balance)

    -- descend right
    (Param(_) | Zero), Max(a, b) => (leq l1 a balance) || (leq l1 b balance)

    -- imax
    IMax(a1, b1), IMax(a2, b2) if a1 == a2 && b1 == b2 => true
    IMax(_, p @ Param(_)), _ => cases(p)
    _, IMax(_, p @ Param(_)) => cases(p)
    IMax(a, IMax(b, c)), _ => leq Max(IMax(a, c), IMax(b, c)) l2 balance
    IMax(a, Max(b, c)), _ => leq (simplify Max(IMax(a, b), IMax(a, c))) l2 balance
    _, IMax(a, IMax(b, c)) => leq l1 Max(IMax(a, c), IMax(b, c)) balance
    _, IMax(a, Max(b, c)) => leq l1 (simplify Max(IMax(a, b), IMax(a, c))) balance


  cases l1 l2 p: bool :=
    leq (simplify $ subst l1 p zero) (simplify $ subst l2 p zero)
    ∧
    leq (simplify $ subst l1 p (Succ p)) (simplify $ subst l2 p (Succ p))
```

## 宇宙层级的相等性

`Level` 类型通过反对称性（antisymmetry）来判定相等性，即：

如果两个宇宙层级 `l1` 和 `l2` 同时满足 `l1 ≤ l2` 和 `l2 ≤ l1` 则判定这两个层级是相等的。

# 实现细节（Implementation notes）

特别注意：导出器（exporter）并不会显式导出 `Zero`，而是默认将其视作导入的 `Level` 序列中的第 0 个元素。

值得一提的是，`Level` 类型的实现对整体性能并无显著影响，因此在此无需过于积极地进行优化。
