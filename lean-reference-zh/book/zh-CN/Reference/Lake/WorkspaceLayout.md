# Lake 工作区布局

> 对应英文：[Workspace Layout](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/#workspace-layout)，抓取日期：2026-06-16。

Lake workspace 是磁盘上的一个目录，其中包含：

- root package 的源码；
- 该 package 的构建产物；
- 非本地传递依赖的源码副本；
- 这些依赖自己的 `.lake` 构建产物。

## 典型结构

常见文件和目录包括：

- `lean-toolchain`：指定项目使用的 Lean toolchain。
- `lakefile.toml` 或 `lakefile.lean`：package configuration file。
- `lake-manifest.json`：锁定依赖版本的 manifest。
- `.lake/`：Lake 管理的中间状态目录。
- `.lake/packages/`：非本地依赖的源码副本。
- `.lake/build/`：root package 的构建目录。
- `.lake/build/bin`：构建出的可执行文件。
- `.lake/build/lib`：库文件和 `.olean` 文件。
- `.lake/build/ir`：中间表示与生成的 C 等产物。

## 为什么这很重要

理解工作区布局有助于：

- 判断哪些文件应提交到版本控制；
- 区分源码、锁文件与缓存目录；
- 排查构建失败时该删什么、该保留什么；
- 知道 `lake build`、`lake clean`、`lake update` 各自主要影响哪些目录。

## 经验规则

- `lean-toolchain`、`lakefile.*`、`lake-manifest.json` 属于项目定义的一部分，通常应提交。
- `.lake/build/` 和 `.lake/packages/` 属于 Lake 生成内容，通常不提交。
- 若怀疑缓存污染，优先清理 `.lake/build`；若怀疑依赖版本或拉取状态异常，再考虑 `.lake/packages` 或重新 `lake update`。
