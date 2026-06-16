# `#synth`

> 对应英文：[Synthesizing Instances / `#synth`](https://lean-lang.org/doc/reference/latest/Interacting-with-Lean/#hash-synth)，抓取日期：2026-06-16。

`#synth` 要求 Lean 为给定 type 合成一个 type class instance。它是调试 type class 搜索最直接的工具。

## 基本形式

```lean
#synth C α
```

如果 synthesis 成功，Lean 会把找到的 instance 显示出来；若失败，则报错。

## 典型用途

- 检查某个 type class instance 是否在当前环境中可见；
- 确认 `deriving`、局部 instance、`open scoped` 等是否生效；
- 调试 overloaded operator 背后到底会选哪个 instance；
- 理解 `Decidable`、`Repr`、`Inhabited`、`BEq`、`Monad` 等实例链。

例如：

```lean
#synth Inhabited Nat
#synth Repr (List Nat)
```

## 失败时怎么办

如果 `#synth` 失败，通常应检查：

- 是否导入了声明该 instance 的 module；
- 当前 namespace / `open scoped` 是否正确；
- 目标 type 是否足够具体；
- 是否需要显式 type annotation；
- 是否缺少上游依赖 instance。

复杂情况下，可打开 trace：

```lean
set_option trace.Meta.synthInstance true
```

它会显示 Lean 如何搜索 instance、在哪一步卡住。

## 与 `#check` 的区别

- `#check` 只查看一个 term 的 type；
- `#synth` 主动请求 Lean 构造一个 instance term。

当你想确认“Lean 是否知道这里该用哪个 instance”时，用 `#synth` 最直接。
