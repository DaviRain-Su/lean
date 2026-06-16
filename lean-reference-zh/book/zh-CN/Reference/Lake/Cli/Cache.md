# `lake cache`

> 对应英文：[Artifact Caches](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/#lake-cache)，抓取日期：2026-06-16。

Lake 支持本地与远程 artifact cache，用于缓存构建输出，减少重复编译成本。

## 典型命令

### `lake cache get`

从远程 cache 下载构建输出到本地 cache。它可以：

- 为 root package 下载；
- 或为依赖树中的包下载；
- 支持 `--service`、`--repo`、`--scope`、`--platform`、`--toolchain`、`--rev`、`--mappings-only`、`--force-download` 等选项。

若未显式给 `--rev`，Lake 会沿历史回溯，寻找最近可用的构建产物。

### `lake cache put`

把 mappings 与对应 artifact 上传到远程 cache。通常要显式给：

- `--scope=<remote-scope>`
- 或 `--repo=<github-repo>`

认证通常通过 `LAKE_CACHE_KEY` 环境变量完成。

### `lake cache add`

把一组 mappings 加入本地 cache；若指定远程服务，则对应 artifact 可在未来构建时按需延迟获取。

### `lake cache clean`

删除当前配置使用的本地 Lake artifact cache 目录。

### `lake cache services`

列出已配置的远程 cache service 名称。可通过系统级 Lake 配置文件（通常 `~/.lake/config.toml`）添加新服务。

### `lake cache stage` / `lake cache unstage`

把 mappings 和 artifact 导出到 staging directory，或再导回 cache。适合某些离线搬运、打包或跨环境缓存分发场景。

## 作用与边界

cache 解决的是“构建结果复用”，而不是依赖解析本身。它适合：

- CI 加速；
- 频繁重建的大项目；
- 团队共享预编译产物；
- GitHub release build / cloud build 场景。

## 风险与建议

- cache 命中失败不一定表示项目坏了，可能只是远程服务缺少对应产物；
- 若 cache 行为可疑，可先试 `--no-cache` 排除缓存因素；
- 上传 cache 前，最好确认工作树干净，否则 revision/mappings 很难复现；
- 远程 cache 的 scope 设计要稳定，避免不同项目或平台产物冲突。