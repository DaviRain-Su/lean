# `lake upload` / `lake pack` / `lake unpack`

> 对应英文：[Packaging and Distribution](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/#packaging-and-distribution)，抓取日期：2026-06-16。

Lake 还提供面向发布与归档的命令：

- `lake upload`
- `lake pack`
- `lake unpack`

## `lake upload`

```bash
lake upload tag
```

作用：把 root package 的 `buildDir` 打包成 `tar.gz`，然后用 `gh release upload` 上传到指定 tag 对应的 GitHub release。

要求：

- 本机已安装 `gh`
- 已存在目标 GitHub release

适用场景：给下游用户发布预构建产物。

## `lake pack`

```bash
lake pack [archive.tar.gz]
```

作用：把 root package 的 build directory 打包成一个 gzipped tar archive。

注意：它**不会主动构建**任何东西，只会归档当前已经存在的产物。因此在运行前，应先确认需要的 artifact 已经被构建出来。

若未指定归档路径，则会根据 package 的 `buildArchive` 设置，默认放在 `.lake/` 目录下。

## `lake unpack`

```bash
lake unpack [archive.tar.gz]
```

作用：把前述打包好的 archive 解到 root package 的 build directory 中。

若未指定路径，则同样基于 `buildArchive` 设定和 `.lake/` 目录约定来找文件。

## 使用建议

- 需要把构建产物发给别人或放进 release 时，用 `upload`；
- 需要本地/离线保存一个完整 build 结果时，用 `pack`；
- 需要恢复某次已打包构建时，用 `unpack`。

这些命令偏“分发和搬运产物”，而不是日常开发。