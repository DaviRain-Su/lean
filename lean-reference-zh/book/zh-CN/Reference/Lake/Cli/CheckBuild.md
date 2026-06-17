# `lake check-build`

> 对应英文：[Lake command: lake check-build](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/#lake-check-build)，抓取日期：2026-06-16。

`lake check-build` 是一个非常轻量的诊断命令。它只检查：根 package 是否配置了至少一个默认 target。

## 退出码语义

- 退出码 `0`：根 package 配置了默认 target。
- 退出码 `1`：没有配置默认 target，或配置检查失败。

## 它**不会**做什么

`lake check-build` 并不会验证：

- 这些默认 target 是否真实存在；
- target 是否能成功构建；
- target 的依赖是否完整；
- 当前缓存、配置和 toolchain 是否一致。

它只回答一个更窄的问题：**“是否至少声明了一个默认 target？”**

## 何时有用

- 调试新 package 的骨架时；
- 区分“构建失败”与“连默认目标都没配”；
- 在脚本或 CI 里先做一次低成本结构检查。

## 与 `lake build` 的区别

- `lake build`：真正解析依赖、回放缓存并执行构建。
- `lake check-build`：只看配置层面有没有默认 target。

## 使用建议

- 项目刚初始化好时，可先跑一次 `lake check-build` 看配置是否完整；
- 一旦需要验证真实可构建性，仍要回到 `lake build`。