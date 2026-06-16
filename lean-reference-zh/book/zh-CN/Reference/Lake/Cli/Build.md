# `lake build`

> 对应英文：[Building and Running / `lake build`](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/#build)，抓取日期：2026-06-16。

`lake build` 是日常最核心的命令。它根据目标、依赖图、缓存和 trace，增量地产生所需 artifact。

## 基本作用

`lake build` 会：

1. 必要时重新配置 package；
2. 解析目标依赖；
3. 回放可复用的 trace / cache；
4. 只重建真正发生变化的部分。

## 常见目标

`lake build` 可以：

- 不带参数：构建默认 target；
- 指定某个 library / executable / module / facet；
- 在当前 workspace 内递归构建依赖所需内容。

## 相关命令

- `lake check-build`：检查构建状态，不一定真正重建所有内容。
- `lake exe`：构建并运行某个 executable target。
- `lake clean`：清理构建产物。
- `lake env` / `lake lean`：在 Lake 配置的环境下运行命令或 Lean。
- `lake shake`：执行更底层的构建相关动作。

## 常用选项

Lake CLI 页面列出的高频选项包括：

- `--reconfigure` / `-R`：强制重新配置。
- `--rehash` / `-H`：要求重新计算哈希。
- `--no-cache`：禁用缓存。
- `--try-cache`：尝试使用缓存。
- `--dir` / `-d`：指定工作目录。
- `--file` / `-f`：指定配置文件。

## 何时用 `-R`

若你修改了：

- `lakefile.lean`
- `lakefile.toml`
- 与配置相关的环境变量

而 Lake 没正确感知变化，可用 `lake build -R`。

## 何时怀疑缓存

若构建结果看起来“像是旧的”，再考虑：

- `--rehash`
- `--no-cache`
- 清理 `.lake/build`

通常不需要一上来就删整个 `.lake/`。

## 使用建议

- 开发期默认先试普通 `lake build`。
- 出现“配置明明改了但不生效”时，再加 `-R`。
- 出现“结果像缓存污染”时，再怀疑 hash/cache。
- 若只是运行某个程序，优先 `lake exe`，而不是手动找产物路径。