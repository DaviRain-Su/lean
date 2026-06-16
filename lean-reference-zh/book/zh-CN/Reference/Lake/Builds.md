# Lake 构建

> 对应英文：[Builds](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/#The-Lean-Language-Reference--Build-Tools-and-Distribution--Lake--Concepts-and-Terminology--Builds)，抓取日期：2026-06-16。

Lake 中的 **build** 是为了产生某个目标 artifact 而执行的一系列步骤。它不仅仅是“调用一次编译器”，而是围绕依赖图、缓存、trace 与 target/facet 的完整流程。

## build 会做什么

典型构建流程包括：

1. **配置 package**：必要时重新 elaborates `lakefile`。
2. **解析依赖**：确定要产出某个目标需要哪些 artifact、facet 和依赖 package。
3. **回放 trace / 复用缓存**：判断哪些内容可直接复用。
4. **真正构建**：只对需要重建的部分运行 Lean、C 编译器或其他工具。

## 何时会重建

Lake 会根据：

- 输入文件是否变更；
- 配置是否变更；
- 依赖是否变更；
- trace 是否仍匹配；
- 用户是否显式要求重新配置或重新哈希；

来决定哪些部分需要重新构建。

## 常见命令

- `lake build`：构建默认 target 或指定 target。
- `lake check-build`：检查构建状态。
- `lake clean`：清理构建产物。
- `lake exe`：构建并运行可执行目标。

## 经验规则

- 普通日常开发优先 `lake build`。
- 若 `lakefile` 改动后行为异常，可尝试 `lake build -R` / `--reconfigure`。
- 若怀疑 hash 或缓存判断不正确，再考虑 `--rehash`、`--no-cache` 等更强手段。
- 真正的“删库重来”应最后才用，因为 Lake 已尽量做增量构建。
