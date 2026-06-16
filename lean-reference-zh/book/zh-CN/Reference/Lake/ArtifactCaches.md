# Lake artifact cache

> 对应英文：[Artifact Caches](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/#The-Lean-Language-Reference--Build-Tools-and-Distribution--Lake--Concepts-and-Terminology--Artifact-Caches)，抓取日期：2026-06-16。

Lake 支持 artifact cache，用于保存已构建产物并在后续构建中复用。它既可以是本地 cache，也可以是远程 cache service。

## 目标

artifact cache 解决的问题不是“依赖如何解析”，而是“同样的构建输出如何避免重复生成”。这适合：

- CI 加速
- 大型工程的重复构建
- 团队共享预编译产物
- 云端构建与本地恢复

## 远程 artifact cache

英文页的远程缓存命令主要包括：

- `lake cache get`
- `lake cache put`
- `lake cache add`
- `lake cache clean`
- `lake cache services`
- `lake cache stage`
- `lake cache unstage`

### `lake cache get`

从远程服务下载构建输出到本地 cache。可用选项包括：

- `--service`
- `--repo`
- `--scope`
- `--platform`
- `--toolchain`
- `--rev`
- `--mappings-only`
- `--force-download`
- `--max-revs`

若未指定 `--rev`，Lake 会沿历史回溯，寻找最近可用的构建产物。

### `lake cache put`

把 mappings 与 artifact 上传到远程 cache。通常需指定：

- `--scope=<remote-scope>`
- 或 `--repo=<github-repo>`

认证常由 `LAKE_CACHE_KEY` 提供。

### `lake cache add`

把一组 mappings 加入本地 cache。若给了远程服务，未来构建还可按需惰性获取对应 artifact。

### `lake cache clean`

删除本地 Lake artifact cache 目录。

### `lake cache services`

列出已配置的远程 cache service 名称。服务配置通常来自系统级 Lake 配置文件，例如 `~/.lake/config.toml`。

### `lake cache stage` / `lake cache unstage`

把 cache 中的 mappings/artifact 导出到 staging directory，或再导回 cache。适合离线搬运、归档或跨环境传输。

## mappings

Lake 会把“输入到输出的映射关系”单独保存。这样系统不仅知道有哪些 artifact，还知道它们是由哪些输入导出的，从而支撑更细粒度的缓存复用。

## 配置

artifact cache 的配置可以来自：

- package 配置中的相关字段；
- 环境变量；
- 系统级 Lake 配置。

常见环境变量包括：

- `LAKE_NO_CACHE`
- `LAKE_ARTIFACT_CACHE`
- `LAKE_CACHE_KEY`
- `LAKE_CACHE_ARTIFACT_ENDPOINT`
- `LAKE_CACHE_REVISION_ENDPOINT`

## 使用建议

- 先把 cache 当作“构建加速器”，不要把它误当作依赖管理器；
- cache 命中失败不一定说明项目坏了，可能只是远程还没有对应产物；
- 若怀疑缓存污染，先试 `--no-cache` 排查；
- scope 设计要稳定，避免不同平台/仓库的产物混淆。
