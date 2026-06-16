# 模式匹配

> 对应英文：[Pattern Matching](https://lean-lang.org/doc/reference/latest/Terms/Pattern-Matching/)，抓取日期：2026-06-16。

pattern matching 用 pattern 识别并解构值。pattern 是 term 的子集：能够识别并拆解某值的 pattern，在语法上通常看起来像“构造这个值”的写法。

一个或多个 discriminant 会同时与一系列 match alternative 比较。每个 alternative 有一组 pattern；当某个 pattern sequence 匹配全部 discriminant 时，对应 `=>` 后的 term 会在扩展后的环境中求值：其中包含 pattern variable 绑定，以及对每个具名 discriminant 的 equality hypothesis。

## 基本语法

```lean
match discr with
| pat => rhs
| ...
```

也可以带：

- `(generalizing := true/false)`
- `(motive := ...)`
- 具名 discriminant，例如 `h : term`

## Pattern 可以包含什么

- `_`：匹配任意值，不绑定变量；
- 未绑定 identifier：pattern variable；
- constructor 应用；
- 带 `match_pattern` attribute 的定义应用；
- 字面量；
- structure instance pattern；
- quoted name；
- macro 展开后的 pattern；
- inaccessible pattern：`. (term)`；
- named pattern：`x@pat`。

## 类型与 refinement

每个 discriminant 都必须 well-typed；对应 pattern 也必须与其类型一致。每个 right-hand side 的 type 必须与整个 match term type 一致。

为了支持 dependent type，匹配某个 discriminant 到特定 pattern 时，会 refinement 后续 pattern 和 right-hand side 中出现的类型：在这些位置，discriminant 的出现会被匹配到的 pattern 替换。

### Pattern equality proof

若 discriminant 具名，match 会在 right-hand side 中额外绑定一个 proof，证明“该 pattern 与该 discriminant 相等”。这对 indexed family 和显式 proposition argument 的桥接很有用。

### Explicit motive

pattern matching 并不是内建 primitive，而是通过 recursor 和辅助 matching function 实现，因此需要 motive。通常 elaborator 能自动合成 motive；特殊情况下可用 `(motive := ...)` 显式给出。

### Discriminant refinement 与 generalization

对 indexed family 做匹配时，Lean 会自动进行 discriminant refinement：必要时把 index 加入 discriminant，使 pattern 类型成立。Lean 还会默认 generalize expected type 和局部变量类型中出现的 discriminant；可用 `(generalizing := false)` 关闭这一行为。

## `match_pattern` 与 pattern function

带 `match_pattern` attribute 的定义在 pattern 中不会被拒绝，而会被展开并规约后继续检查。这让诸如 `n + 1` 这样的 pattern 成为可能，而不必手写 `Nat.succ n`。

## Pattern-matching function

函数也可直接用 pattern matching 形式写：

```lean
fun
| pat1 => rhs1
| pat2 => rhs2
```

它会 desugar 为“先接收参数，再立即对参数做 match”的函数。

## 其他 pattern matching operator

- `e matches pat`：若 `e` 能匹配 `pat` 则返回 `true`；
- `nomatch ...`：零分支匹配，表达“不可能发生”的情况；
- `nofun`：当 expected type 是函数类型时，表示一个不可能被调用的函数。
