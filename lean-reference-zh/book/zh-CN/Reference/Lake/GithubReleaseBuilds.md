# Lake GitHub Release 构建

> 对应英文：[GitHub Release Builds](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/#The-Lean-Language-Reference--Build-Tools-and-Distribution--Lake--Concepts-and-Terminology--GitHub-Release-Builds)，抓取日期：2026-06-16。

Lake 支持把构建产物上传到 package 的 GitHub release，或从其中下载。这一机制的核心价值是：终端用户可以直接获取预构建产物，而不必在本地重新从源码编译。

## 适用场景

- 大型项目构建成本高；
- 希望 CI 产物能被下游直接复用；
- 希望把发布流程和 GitHub release 绑定；
- 希望为依赖提供“云端构建缓存”。

## 下载（Downloading）

下载逻辑的目标是：让用户在本地缺少构建产物时，直接从发布的 artifact 中恢复，而不是重新编译全部依赖。

通常需要配置 package 选项，例如：

- `releaseRepo`
- `buildArchive`
- `preferReleaseBuild`

这样 Lake 才知道去哪个仓库、用什么归档名、以及是否优先使用 release build。

## 上传（Uploading）

上传逻辑则面向项目维护者或 CI：当某次构建成功后，把对应构建目录打包，并作为 release artifact 发布到 GitHub。

这样，下游就可以通过 Lake 或相关命令自动获取这些预构建产物。

## 与本地 cache 的关系

GitHub release build 关注的是“对外发布与复用的构建结果”；本地 cache 关注的是“在本机或团队缓存中复用构建产物”。二者目标相近，但层次不同：

- release build：偏发布与分发；
- artifact cache：偏缓存与增量复用。

## 使用建议

- 若项目构建昂贵、用户很多，优先考虑提供 release build；
- 若只是本地/CI 加速，先用 artifact cache 即可；
- 若同时做发布与缓存，应明确区分“正式发布产物”和“内部缓存产物”的用途。
