# `lake clean`

> 对应英文：[Lake command: lake clean](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/#lake-clean)，抓取日期：2026-06-16。

`lake clean [packages...]` 用于删除构建目录。

## 基本行为

- 不带参数：删除 workspace 中**每个 package** 的构建目录。
- 带 `packages...`：只删除指定 package 的构建目录。

## 它清什么

`lake clean` 面向的是“构建产物”，而不是源码、manifest 或依赖声明。因此它通常用于：

- 清掉旧 `.olean` / 中间产物；
- 迫使 Lake 重新构建某些 package；
- 排查“是不是 build 目录里残留旧结果”的问题。

## 它不做什么

- 不会修改 `lakefile.*`
- 不会改 `lean-toolchain`
- 不会主动重新解析依赖
- 不等于删除整个 `.lake/packages` 依赖副本

## 使用建议

- 构建异常但怀疑只是产物脏了时，先试 `lake clean`；
- 若问题更像依赖版本或下载状态异常，再考虑 `lake update` 或更激进的手工清理。