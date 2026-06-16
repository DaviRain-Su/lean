# Lake 测试与 lint driver

> 对应英文：[Test and Lint Drivers](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/#The-Lean-Language-Reference--Build-Tools-and-Distribution--Lake--Concepts-and-Terminology--Test-and-Lint-Drivers)，抓取日期：2026-06-16。

Lake 本身不是测试框架。它通过 **driver** 概念把测试和 lint 工作流接入构建系统。

## test driver

test driver 用于运行某个 package 的测试。它可以是：

- executable target
- Lake script
- library target

Lake 的职责只是：

- 找到配置的 driver
- 构建它
- 在需要时执行它

真正的断言、测试发现、报告格式，都由 driver 自己决定。

### executable / script test driver

若 test driver 是 executable 或 script：

- Lake 会先构建；
- 再执行它；
- 非零退出码视为测试失败。

### library test driver

若 test driver 是 library：

- Lake 不会额外“运行”它；
- 只对它做 elaboration；
- 任何 elaboration error 都算测试失败，包括 `#guard` 类命令失败。

## 配置 test driver

### TOML

在 `lakefile.toml` 中，使用 package 级字段：

- `testDriver`
- `testDriverArgs`

### Lean format

在 `lakefile.lean` 中，可以：

- 设置 package 的 `testDriver` 字段；
- 或给某个 script / executable / library 加 `test_driver` attribute。

同一个 package 只能有一个 `test_driver` 标注对象；同时使用 attribute 和非空 `testDriver` 字段会报错。

### 依赖包中的 driver

也可以引用依赖包里的 target，形式是：

```text
<pkg>/<name>
```

## 运行测试

`lake test` 只运行 **root package** 配置的 test driver，不会递归去跑依赖包自己的测试。

若 driver 是 executable / script，则命令行 `--` 之后的参数会传给它，且会排在 `testDriverArgs` 之后：

```bash
lake test -- --filter Foo --verbose
```

若 driver 是 library，则不接受额外参数；若配置了 `testDriverArgs` 或在命令行传了参数，Lake 会报错。

## `lake check-test`

`lake check-test` 只检查“根包是否配置了 test driver”，并不验证该 target 是否真实存在。

## lint driver

lint driver 与 test driver 类似，但用途是检查风格、结构和其他非致命问题。lint driver 只能是：

- executable
- script

与 test driver 不同，lint driver **不能**是 library。

### 配置 lint driver

在 TOML 中使用：

- `lintDriver`
- `lintDriverArgs`

在 Lean format 中可以设置 package 字段，或用 `lint_driver` attribute 标记目标。

同样，也可用 `<pkg>/<name>` 引用依赖包中的 lint driver。

### `lake lint`

`lake lint` 会运行配置好的 lint driver，并在 `--` 后转发参数。

## builtin linter

Lake 还有独立的 builtin linter，直接对 Lean module 工作，而不是通过配置的 driver。它可以通过：

- `--builtin-lint`
- 相关 CLI flag
- package 配置中的 `builtinLint = true`

启用。

当 builtin linter 启用时，命令行中 `--` 之前的模块名参数由 Lake 自己消费，而不会传给配置的 driver。

## 使用建议

- 逻辑测试、`#guard_msgs` 文档测试：适合 library test driver。
- 需要运行程序、传 CLI 参数或做集成测试：适合 executable / script test driver。
- 代码规范和项目级检查：适合 lint driver。
- 想直接对 Lean module 做静态检查：考虑 builtin linter。
