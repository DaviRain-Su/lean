# `lake update`

> 对应英文：[Dependency Management / `lake update`](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/#update)，抓取日期：2026-06-16。

`lake update` 用于同步依赖与 manifest。它是“让当前配置与锁定结果重新一致”的关键命令。

## 它解决什么问题

Lake 把依赖信息分成两层：

- `lakefile.*`：声明“想要什么依赖”；
- `lake-manifest.json`：记录“实际锁定到了什么版本”。

如果二者不一致，构建前通常需要 `lake update`。

## 典型场景

- 新增 / 删除 / 修改依赖后；
- 切换依赖的 Git revision、tag、branch 或 path 后；
- 合并分支导致 manifest 与配置冲突后；
- 依赖本地状态损坏，需要重新解析锁定结果时。

## 行为概述

`lake update` 会：

- 重新解析依赖声明；
- 获取匹配版本；
- 同步本地依赖副本；
- 重写 `lake-manifest.json`。

## 使用建议

- 修改依赖配置后，优先先跑 `lake update`，再 `lake build`。
- `lake-manifest.json` 通常应提交到版本控制，因为它决定了可复现依赖集。
- 若团队中有人“同一配置却构建结果不同”，首先检查 manifest 是否一致。