# `lake test`

> 对应英文：[Running Tests / `lake test`](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/#test)，抓取日期：2026-06-16。

Lake 自身不是测试框架；`lake test` 的作用是：找到项目配置的 test driver，构建它，并在需要时运行它。

## test driver 是什么

test driver 可以是：

- executable target
- Lake script
- library target

其中：

- executable / script：Lake 会先构建，再运行；非零退出码算测试失败。
- library：Lake 只对其做 elaboration；任何 elaboration error 都算测试失败，包括 `#guard` 类命令失败。

## 配置 test driver

在 `lakefile.toml` 中，使用 `testDriver` 指定。

在 `lakefile.lean` 中，可以：

- 设置 package 的 `testDriver` 字段；
- 或给目标加 `test_driver` attribute。

也可以引用依赖包中的 test driver，格式为：

```text
<pkg>/<name>
```

## 运行参数

若 test driver 是 executable 或 script，则：

- 先传 `testDriverArgs`
- 再传命令行中 `--` 后的参数

例如：

```bash
lake test -- --filter Foo --verbose
```

若 test driver 是 library，则不接受额外参数；若配置了 `testDriverArgs` 或命令行跟了 `-- ...`，Lake 会报错。

## `lake check-test`

`lake check-test` 只检查“根包是否配置了 test driver”，并不验证目标是否真的存在。

## 使用建议

- 若测试主要靠 Lean 文件中的 `#guard_msgs`、`example`、定理检查，可考虑 library test driver。
- 若测试需要进程、命令行参数或运行时行为，优先 executable/script driver。
- CI 中要明确约定：`lake test` 是跑逻辑测试、集成测试，还是仅做 elaboration smoke test。