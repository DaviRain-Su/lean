# 定义等价

定义等价（Definitional equality）是一个函数，输入两个表达式，如果它们在 Lean 理论下定义等价，则返回 `true`，否则返回 `false`。

在内核中，定义等价是类型检查的核心组成部分。即使对于不深入内核的 Lean 用户，定义等价仍然是重要概念，因为在 Lean 表层语言中，对于任意定义等价的表达式 `a` 和 `b`，无需额外提示即可判断它们相等。

实现定义等价分为两部分：一是用于检测各种定义等价的个别测试（这对用户理解定义等价很重要）；二是将这些测试结合归约和缓存等技术，提升性能以应对复杂度（这对编写类型检查器者尤为关键）。

## Sort 等价

两个 `Sort` 表达式定义等价当且仅当它们的层级在偏序中通过反对称性相等：

```lean
defEq (Sort x) (Sort y):
  x ≤ y ∧ y ≤ x
```

## Const 等价

两个 `Const` 表达式定义等价当且仅当它们名称相同，且层级列表在反对称意义上相等：

```lean
defEq (Const n xs) (Const m ys):
  n == m ∧ forall (x, y) in (xs, ys), antisymmEq x y
  -- 若 zip 不保证长度相等，还需断言 xs 与 ys 长度相同
```

## 绑定变量

采用基于替换的实现（如局部无名法，C++或lean4lean实现）时，遇到绑定变量表示错误；因为弱归约时引用参数的绑定变量应已被替换，强归约时用于 pi 或 lambda 的定义等价检查时绑定变量应被自由变量替代。

基于闭包的实现中，应查找绑定变量对应元素并断言定义等价。

## 自由变量

两个自由变量定义等价当且仅当它们的标识符相同（唯一ID或deBruijn层级）。绑定类型的等价断言应在自由变量创建时完成，无需重复检查。

```lean
defEqFVar (id1, _) (id2, _):
  id1 == id2
```

## 应用（App）

两个应用表达式定义等价当且仅当其函数部分和参数部分分别定义等价：

```lean
defEqApp (App f a) (App g b):
  defEq f g && defEq a b
```

## Pi 表达式

两个 Pi 表达式定义等价当且仅当它们的绑定类型定义等价，且将合适自由变量代入主体后主体定义等价：

```lean
defEq (Pi s a) (Pi t b)
  if defEq s.type t.type
  then
    let thisFvar := fvar s
    defEq (inst a thisFvar) (inst b thisFvar)
  else
    false
```

## Lambda 表达式

Lambda 的定义等价测试与 Pi 相同：

```lean
defEq (Lambda s a) (Lambda t b)
  if defEq s.type t.type
  then
    let thisFvar := fvar s
    defEq (inst a thisFvar) (inst b thisFvar)
  else
    false
```

## 结构的 η 等价（Structural eta）

当两个元素 `x` 和 `y` 均属于某结构类型，且其构造子参数与投影字段定义等价时，Lean 认定它们定义等价。具体做法是：

```lean
defEqEtaStruct x y:
  let (yF, yArgs) := unfoldApps y
  if 
    yF is a constructor for an inductive type `T` 
    && `T` can be a struct
    && yArgs.len == T.numParams + T.numFields
    && defEq (infer x) (infer y)
  then
    forall i in 0..t.numFields, defEq Proj(i+T.numParams, x) yArgs[i+T.numParams]
  -- 这里给索引加上 `T.numParams`，因为我们只想测试非参数部分的参数。
  -- 参数部分已经不必测试，因为推断出的类型已经定义等价。
```

更简单的情况（如 `T.mk a .. N = T.mk x .. M` 当且仅当 `[a, .., N] = [x, .., M]`）由 `App` 测试处理。

## 类单元类型等价（Unit-like equality）

Lean 认定两个元素 `x: S p_0 .. p_N` 和 `y: T p_0 .. p_M` 定义等价，若：

* `S` 是归纳类型；
* `S` 无指标（indices）；
* `S` 仅有一个构造子，且除参数 `p_0 .. p_N` 外无其他参数；
* `S p_0 .. p_N` 和 `T p_0 .. p_M` 定义等价。

此处定义等价合理，因为这些类型的元素所有信息均由其类型决定。

## η 展开（Eta expansion）

```lean
defEqEtaExpansion x y : bool :=
  match x, (whnf $ infer y) with
  | Lambda .., Pi binder _ => defEq x (App (Lambda binder (Var 0)) y)
  | _, _ => false
```

右侧创建的 lambda `(fun _ => $0) y` 显然归约为 `y`，但 lambda 绑定器的加入使 `x` 与 `y'` 能在定义等价的其余流程中匹配。

## 证明无关等价

Lean 将证明无关等价（Proof irrelevant equality）视为定义等价。例如，任何两个证明 `2 + 2 = 4` 的表达式在定义等价检查中视为相等。

若类型 `T` 被推断为 `Sort 0`（即 `Prop` 的元素），则它是一个证明。

```lean
defEqByProofIrrelevance p q :
  infer(p) == S ∧ 
  infer(q) == T ∧
  infer(S) == Sort(0) ∧
  infer(T) == Sort(0) ∧
  defEq(S, T)
```

若 `p` 是类型 `A` 的证明，`q` 是类型 `B` 的证明，且 `A` 定义等价于 `B`，则 `p` 和 `q` 通过证明无关性被视为定义等价。

## 自然数字面量

两个自然数字面量定义等价当且仅当它们归约为 `Nat.zero`，或归约为 `(Nat.succ x, Nat.succ y)` 且 `x` 与 `y` 定义等价。

```lean
match X, Y with
| Nat.zero, Nat.zero => true
| NatLit 0, NatLit 0 => true
| Nat.succ x, NatLit (y+1) => defEq x (NatLit y)
| NatLit (x+1), Nat.succ y => defEq (NatLit x) y
| NatLit (x+1), NatLit (y+1) => x == y
| _, _ => false
```

## 字符串字面量

字符串字面量 `s` 被转换为

```
App(Const(String.mk, []), List Char)
```

因为 Lean 的 `Char` 用于表示 Unicode 标量值，对应的整数是 32 位无符号整数。

例如字符串 `"ok"`（由字符对应的 32 位无符号整数 111 和 107 组成）被转换为：

```
String.mk (((List.cons Char) (Char.ofNat NatLit(111))) (((List.cons Char) (Char.ofNat NatLit(107))) (List.nil Char)))
```

## 惰性 δ-归约与合取（Lazy delta reduction and congruence）

现有内核实现将“惰性 δ-归约”作为定义等价检查的一部分，利用[可展性提示](./declarations.md#reducibility-hints)延迟展开定义，并在可能相符时进行合取检查。这比完全展开两个表达式后再检查定义等价更高效。

假设有表达式 `a` 是高度为 10 的定义的应用，`b` 是高度为 12 的定义的应用，惰性 δ-归约会优先展开 `b` 以接近 `a`，而非盲目完全展开或随意选择一侧展开。

当惰性 δ-归约遇到两个应用了相同声明的 `const` 表达式时，会检查它们是否合取（即是否是同一常量应用于定义等价的参数）。合取失败会被缓存。对于自行实现内核的读者来说，缓存合取失败是关键性能优化，因为合取检查可能涉及开销较大的参数定义等价比较。


## 语法相等（Syntactic equality，也称结构或指针相等）

两个表达式定义等价当且仅当它们指向完全相同的实现对象，前提是类型检查器确保两个对象当且仅当它们由相同组件（Name、Level、Expr 构造子）构造时相等。
