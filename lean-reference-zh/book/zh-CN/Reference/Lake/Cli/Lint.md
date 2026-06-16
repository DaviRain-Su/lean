# `lake lint`

> 对应英文：[Tests and Linters / `lake lint`](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/#lint)，抓取日期：2026-06-16。

`lake lint` 用于运行项目的 lint driver，检查那些“不一定是编译错误，但通常表示问题”的情况。

## lint driver

lint driver 只能是：

- executable
- script

与 test driver 不同，lint driver **不能**是 library。

## 配置方式

在 `lakefile.toml` 中，使用 `lintDriver` 字段。

在 `lakefile.lean` 中，可以：

- 设置 package 的 `lintDriver`；
- 或给目标加 `lint_driver` attribute。

也可用 `<pkg>/<name>` 指向依赖包中的 lint driver。

## 参数传递

`lake lint` 会：

- 先传 `lintDriverArgs`
- 再传命令行 `--` 之后的参数

例如：

```bash
lake lint -- --warnings-as-errors
```

## builtin linter

Lake 还有独立的内建 linter，直接对 Lean module 工作，而不是走配置的 driver。它可通过：

- `--builtin-lint`
- 相关 flag
- 或 package 配置中的 `builtinLint = true`

启用。

启用 builtin lint 时，`--` 前的模块参数会被 Lake 自己消费，而不是传给 driver。

## `lake check-lint`

`lake check-lint` 在以下情况返回成功：

- 根包配置了 lint driver；
- 或启用了 builtin lint。

## 使用建议

- 想做项目级风格 / API / 约束检查时，配置 lint driver。
- 想做 Lean module 的通用静态检查时，考虑 builtin linter。
- 若二者都需要，可以同时启用，但要清楚职责边界。