# `def` / `abbrev` / `opaque`

> 对应英文：[Definitions](https://lean-lang.org/doc/reference/latest/Definitions/Definitions/)，抓取日期：2026-06-16。

definition 会向全局环境加入一个新常量，这个常量代表某个 term。作为 definitional equality 的一部分，该常量在合适情况下可通过 δ-reduction 被其定义体替换。

## `def`

```lean
def name sig := term
```

`def` 是最常见的定义形式。它产生的是 **semireducible** 定义：

- kernel 中保留可展开的定义体；
- elaborator / simplifier 是否主动展开，还受 reducibility 策略控制。

`def` 也支持：

- pattern matching 写法
- `where` 结构体字段写法

## `abbrev`

```lean
abbrev name sig := term
```

`abbrev` 与 `def` 最大区别在于：它是 **reducible** 的。

适用场景：

- 想提供一个更短、更可读的别名；
- 希望 elaboration 和 simplification 更积极地展开它；
- 该名字主要是书写便利，而不是新的抽象边界。

在 module 中，`abbrev` 的定义体默认是 exposed 的；而 `def` 默认不是。

## `opaque`

`opaque` 表示“这是一个已知存在的常量，但 kernel 不会对它做 δ-reduction”。

两种主要形式：

```lean
opaque name sig := term
opaque name sig
```

### 带右侧

带右侧时，Lean 会像其他定义一样 elaboration 该 term，以证明该类型确实 inhabited；但之后 kernel 不再使用这个定义体来展开它。

### 不带右侧

不带右侧时，elaborator 会尝试通过 `Inhabited`，若失败再通过 `Nonempty` 来自动合成一个 inhabitant。

## 为什么需要 `opaque`

`opaque` 适合表达：

- “某函数存在，但不希望逻辑上展开其实现”
- “编译器可用某实现生成代码，但证明层面只需要知道它存在”
- “把逻辑接口与运行时实现彻底分开”

它不像 `axiom` 那样会引入任意不一致风险，因为 `opaque` 仍要求类型可 inhabit；只是它的计算行为不暴露给 kernel。

## pattern matching 与 `where`

定义可写成：

- `def f ... | pat => rhs`
- `def x ... where field := ...`

前者会被 desugar 为 `match`；后者特别适合定义 structure 值或返回 structure 的函数。

## 使用建议

- 默认优先 `def`。
- 只是别名或书写便利，优先 `abbrev`。
- 需要逻辑上隐藏实现、但仍要编译运行时，考虑 `opaque`。
- 若后续证明依赖展开行为，要明确区分 semireducible / reducible / opaque 的差异。