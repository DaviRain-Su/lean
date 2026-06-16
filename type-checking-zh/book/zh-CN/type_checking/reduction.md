# 归约

归约（Reduction）旨在推动表达式趋近其[规范形式](https://en.wikipedia.org/wiki/Normal_form_%28abstract_rewriting%29)，以便判断表达式是否定义等价。例如，我们需要执行 β 归约来确定 `(fun x => x) Nat.zero` 定义等价于 `Nat.zero`，以及执行 δ 归约来确定 `id List.nil` 定义等价于 `List.nil`。

Lean 内核的归约有两个特殊性质，常被基础教材忽略：

1. 归约有时与类型推断交织进行，意味着归约可能在开放项（open terms）上执行，尽管归约过程本身不产生自由变量。

2. 对于应用了多个参数的 `const` 表达式，归约时可能需要将其与参数一并考虑（例如 ι 归约），因此应用序列需在归约开始时一并展开。

## β 归约

β 归约（Beta reduction）即函数应用的归约。具体如：

```lean
(fun x => x) a    ~~>    a
```

实现时需要将表达式“去脊”（despine），收集所有 `app` 应用的参数，检查被应用的表达式是否为 lambda，然后用对应参数替换函数体中相应的绑定变量：

```lean
betaReduce e:
  betaReduceAux e.unfoldApps

betaReduceAux f args:
  match f, args with
  | lambda _ body, arg :: rest => betaReduceAux (inst body arg) rest
  | _, _ => foldApps f args
```

性能优化中常用“广义 β 归约”（generalized beta reduction），即将所有对应的参数一次性替换，避免对 `n` 个连续 lambda 表达式做 `n` 次遍历：

```lean
betaReduce e:
  betaReduceAux e.unfoldApps []

betaReduceAux f remArgs argsToApply:
  match f, remArgs with
  | lambda _ body, arg :: rest => betaReduceAux body rest (arg :: argsToApply)
  | _, _ => foldApps (inst f argsToApply) remArgs
```

## ζ 归约（Zeta reduction，let 表达式归约）

ζ 归约即 `let` 表达式的归约。例：

```lean
let (x : T) := y; x + 1    ~~>    (y : T) + 1
```

简单实现：

```lean
reduce Let _ val body:
  instantiate body val
```

## δ 归约（Delta reduction，定义展开）

δ 归约是展开定义（及定理）。将 `const ..` 表达式替换为其引用声明的值，替换时要将声明的泛型宇宙参数替换为当前上下文对应的宇宙层级。

若环境中声明 `x` 具有宇宙参数 `u*` 和值 `v`，则表达式 `Const(x, w*)` 可 δ 归约为

```lean
substituteLevels (e := v) (ks := d.uparams) (vs := levels)
```

若归约过程中移除了应用到 `const` 上的参数，则归约后应重新应用这些参数。

## 投影归约

`proj` 表达式包含投影字段的自然数索引和结构体表达式。结构体本质上是一系列应用于构造子的参数。

注意：构造子参数包括所有参数，且投影索引从 0 开始计数，0 表示跳过所有参数后的第一个非参数字段，因为投影不能访问参数。

归约时，将结构体归约为弱头范式，展开应用得 `(constructor, args)`，再返回

```lean
args[fieldIdx + numParams]
```

例如，`Prod.mk` 的构造子为 `Const(Prod.mk, [u, v])`，参数为 `[A, B, a, b]`。

### 字符串字面量的特殊投影归约

字符串字面量扩展在投影归约和 ι 归约时各有特殊处理。

投影归约中，结构体可能归约为字符串字面量 `StringLit(s)`，此时转为

```lean
String.mk (.. : List Char)
```

并按常规投影归约处理。

## 自然数字字面量归约

自然数字字面量扩展支持 `Nat.succ` 的归约及二元运算（加减乘除、指数、模运算、布尔相等、小于等于）。

归约规则示例：

* 表达式 `Const(Nat.succ, []) n`，若 `n` 可归约为自然数字字面量 `n'`，则归约为 `NatLit(n' + 1)`。
* 表达式 `Const(Nat.<binop>, []) x y`，若 `x, y` 可归约为自然数字字面量 `x', y'`，则归约为二元操作 `<binop>` 作用于 `x', y'` 的结果。

示例：

```lean
Const(Nat.succ, []) NatLit(100) ~> NatLit(101)

Const(Nat.add, []) NatLit(2) NatLit(3) ~> NatLit(5)

Const(Nat.add, []) (Const Nat.succ [], NatLit(10)) NatLit(3) ~> NatLit(14)
```

## ι 归约（Iota reduction，模式匹配）

ι 归约针对归纳声明的递归器展开归约，或特例 `Quot`。

每个递归器有对应构造子的一组递归规则，这些规则为值级表达式，描述如何消解由构造子构造的类型元素。例如，`Nat.rec` 对 `Nat.zero` 和 `Nat.succ` 各有一个递归规则。

对于归纳声明 `T`，递归器接收的“主要前提”（major premise）是某个 `(t : T)`，ι 归约通过拆解该前提，确定其用哪个构造子创建，进而从环境中检索对应递归规则并应用。

递归器类型签名同时包含参数、动机和次要前提，因此无需修改递归器参数即可对 `Nat.zero` 或 `Nat.succ` 等不同情况归约。

实际中，有时需要先将主要前提转换成构造子的直接应用形式，才能找到对应构造子。例如，`NatLit(n)` 会被转换为 `Nat.zero` 或 `App Const(Nat.succ, []) ...`。

对于结构体，还可能执行结构 η 展开，将 `(t : T)` 转为 `T.mk t.1 .. t.N`，显露构造子 `mk`，使得 ι 归约得以继续；否则归约失败。

## List.rec type

```lean
forall 
  {α : Type.{u}} 
  {motive : (List.{u} α) -> Sort.{u_1}}, 
  (motive (List.nil.{u} α)) -> 
  (forall (head : α) (tail : List.{u} α), (motive tail) -> (motive (List.cons.{u} α head tail))) -> (forall (t : List.{u} α), motive t)
```

## List.nil rec rule

```lean
fun 
  (α : Type.{u}) 
  (motive : (List.{u} α) -> Sort.{u_1}) 
  (nilCase : motive (List.nil.{u} α)) 
  (consCase : forall (head : α) (tail : List.{u} α), (motive tail) -> (motive (List.cons.{u} α head tail))) => 
  nilCase
```

## List.cons rec rule

```lean
fun 
  (α : Type.{u}) 
  (motive : (List.{u} α) -> Sort.{u_1}) 
  (nilCase : motive (List.nil.{u} α)) 
  (consCase : forall (head : α) (tail : List.{u} α), (motive tail) -> (motive (List.cons.{u} α head tail))) 
  (head : α) 
  (tail : List.{u} α) => 
  consCase head tail (List.rec.{u_1, u} α motive nilCase consCase tail)
```

### k-型归约（k-like reduction）

对于某些归纳类型，被称为“子单元消解器”（subsingleton eliminators），即使主要前提的构造子未直接暴露，只要知道其类型，也可以继续执行 ι 归约。这种情况可能发生在主要前提是自由变量时。之所以允许，是因为子单元消解器的所有元素都是相同的。

要成为子单元消解器，归纳声明必须满足：

* 是归纳命题；
* 不是互归纳或嵌套归纳；
* 只有一个构造子；
* 唯一的构造子仅接受该类型的参数作为参数（不能隐藏类型签名中未完全体现的信息）。

举例来说，类型 `Eq Char 'x'` 的任意元素的值完全由其类型决定，因为该类型的所有元素均相同。

当 ι 归约遇到一个子单元消解器的主要前提时，可以将该前提替换为该类型构造子的应用，因为自由变量只能是该唯一元素。例如，类型为 `Eq Char 'a'` 的自由变量可以被替换为显式构造的 `Eq.refl Char 'a'`。

如果忽略 k-型归约，自由变量作为子单元消解器时将无法识别对应的递归规则，导致 ι 归约失败，使某些预期成功的转换无法完成。

### Quot 归约：`Quot.ind` 和 `Quot.lift`

`Quot` 引入了两个需要内核特殊处理的案例，分别对应 `Quot.ind` 和 `Quot.lift`。

二者都涉及将函数 `f` 应用于参数 `(a : α)`，其中 `a` 是某个由 `Quot.mk r a` 形成的 `Quot r` 的组成部分。

执行归约时，需要：

* 取出函数 `f`；
* 取出包含 `(a : α)` 的 `Quot` 参数；
* 将 `f` 应用于 `a`；
* 最后重新应用所有与 `Quot.ind` 或 `Quot.lift` 调用无关的外层表达式中的其他参数。

由于这只是归约步骤，整体表达式的类型正确性依赖于其他阶段的类型检查保证。

下述为 `Quot.ind` 和 `Quot.mk` 的类型签名片段，展示望远镜参数与归约时关心的参数对应关系，其中带 `*` 的元素为归约关注点。

```lean
Quotient primitive Quot.ind.{u} : ∀ {α : Sort u} {r : α → α → Prop} 
  {β : Quot r → Prop}, (∀ (a : α), β (Quot.mk r a)) → ∀ (q : Quot r), β q

  0  |-> {α : Sort u} 
  1  |-> {r : α → α → Prop} 
  2  |-> {β : Quot r → Prop}
  3* |-> (∀ (a : α), β (Quot.mk r a)) 
  4* |-> (q : Quot r)
  ...
```

```lean
Quotient primitive Quot.lift.{u, v} : {α : Sort u} →
  {r : α → α → Prop} → {β : Sort v} → (f : α → β) → 
  (∀ (a b : α), r a b → f a = f b) → Quot r → β

  0  |-> {α : Sort u}
  1  |-> {r : α → α → Prop} 
  2  |-> {β : Sort v} 
  3* |-> (f : α → β) 
  4  |-> (∀ (a b : α), r a b → f a = f b)
  5* |-> Quot r
  ...
```
