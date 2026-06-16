# 函数（类型系统层）

> 对应英文：[Functions](https://lean-lang.org/doc/reference/latest/The-Type-System/Functions/)，抓取日期：2026-06-16。

函数类型是 Lean 核心语言的内建特性。函数把一个类型中的值映射到另一个类型中的值；函数类型则描述这种映射的 domain 与 codomain。

## 两类函数类型

### 非依赖函数

```lean
α → β
```

结果类型不依赖具体参数值。

### 依赖函数

```lean
(x : α) → β x
```

结果类型可以显式依赖参数 `x`。因此，从集合论直觉看，它更像“按索引变化的一族类型的乘积”。

## 核心语言中的统一视角

Lean 核心里所有函数类型其实都是依赖函数类型；非依赖函数只是“参数名不在 codomain 中出现”的特例。

另外，两个依赖函数类型即使绑定变量名不同，也可能 definitionally equal，只要改名后完全一致。

## 抽象与 β-reduction

函数值通过 function abstraction 构造，也就是 lambda：

```lean
fun x => body
```

函数应用后，结果通过 β-reduction 得到：把实参替换到函数体中。编译代码里，这种替换只对值进行；但在 type checking 的 definitional equality 中，任何项都可参与 β-reduction。

## Currying

Lean 核心中每个函数都只接收**一个**参数。多参数函数只是高阶函数的嵌套：给第一个参数后返回另一个函数，再继续接收后续参数。表面语法制造了“多参数函数”的幻觉，但 elaboration 之后只剩单参数函数。

## 外延性与 intensional equality

Lean 的函数 definitional equality 是 **intensional** 的：它关注语法、重命名与规约，而不是“数学上对所有输入结果都相同”这一外延意义。

为了推理函数相等，Lean 提供 theorem：

- `funext`

以及 tactic：

- `funext`
- `ext`

它们让你能从“对任意输入结果相等”推出“两个函数相等”。

## η-equivalence

虽然 Lean 没有把一般函数外延性放进 definitional equality，但它支持受限的 η-equivalence：

```lean
f  ≡  fun x => f x
```

前提是 `f` 有适当函数类型。

## 全函数与终止

从 Lean 逻辑角度看，所有函数都是 total 的：

- 对任意类型正确输入都有定义；
- 会在有限时间内给出结果。

现实编程中，Lean 也允许某些“逃生口”：

- `partial` function
- `unsafe` function
- 运行时 panic 型操作（需结果类型 `Inhabited`）

这些让 Lean 既能作为实用编程语言，也能在逻辑上维持更强保证。