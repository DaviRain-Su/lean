# 查询上下文

> 对应英文：[Querying the Context](https://lean-lang.org/doc/reference/latest/Interacting-with-Lean/#hash-print)，抓取日期：2026-06-16。

除了 `#check`、`#eval` 和 `#synth` 之外，Lean 还提供一组“查询当前环境/上下文”的命令。它们不会改变证明或程序本体，而是把当前环境中的信息打印到 message log，帮助你理解定义、定理、公理依赖和方程式。

## `#print`

```lean
#print name
```

打印某个 declaration 的主要信息。它常用于：

- 查看 theorem / definition 的完整 type；
- 确认 notation 背后的真实常量名；
- 检查某个 structure、inductive type 或 constant 当前到底是什么。

某些 declaration 还支持额外的打印形式，例如下一条里的 `#print axioms`、`#print equations`。

## `#print axioms`

```lean
#print axioms name
```

显示某个声明**传递依赖**的所有公理。它的典型用途包括：

- 检查某个 proof 是否依赖 `sorryAx`；
- 检查是否用了自定义 axiom；
- 观察是否出现 `Lean.trustCompiler` 之类更大的可信边界。

在验证证明可靠性时，这个命令非常关键。

## `#print equations` / `#print eqns`

```lean
#print equations name
#print eqns name
```

打印由 equation compiler 为定义生成的方程式。对理解：

- pattern matching definition
- recursive definition
- 编译后生成的 case split

很有帮助。调试复杂递归定义时，这比直接看原源码更接近 elaboration 之后的形状。

## `#where`

```lean
#where
```

显示当前上下文中的位置与环境信息，典型包括当前 namespace、open namespace 等。它常用于调试：

- 为什么某个名字现在能直接用；
- 当前到底在什么 namespace 里；
- 某段 proof / file 的局部作用域状态。

## `#version`

```lean
#version
```

输出当前 Lean / toolchain 的版本信息。它适合：

- 文档和 issue 报告；
- 检查本地版本是否和项目 `lean-toolchain` 对齐；
- 确认某行为是否可能由版本差异导致。

## 使用建议

- 想看“这个名字到底是什么”，优先 `#print`。
- 想看“这个证明最终依赖了哪些公理”，用 `#print axioms`。
- 想看“递归/匹配定义经过 equation compiler 后长什么样”，用 `#print equations`。
- 想看“我现在在什么上下文里”，用 `#where`。
- 想确认版本，直接 `#version`。
