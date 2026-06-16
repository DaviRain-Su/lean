# 发布说明

> 对应英文：[Release Notes](https://lean-lang.org/doc/reference/latest/releases/)，抓取日期：2026-06-16。

本节提供 Lean 近期版本的 release notes。升级到新版本时，应阅读对应版本的 release notes；其中可能包含理解前一版本差异、迁移项目和处理 breaking changes 的建议。

## 为什么要看 release notes

Lean 和 Mathlib 生态更新很快。即使项目代码没有主动修改，升级 toolchain 也可能改变：

- elaborator 行为；
- tactic 输出和自动化能力；
- standard library API；
- Lake 配置或构建行为；
- warning/error 名称与内容；
- compiler、runtime 或 proof checking 细节。

因此，项目升级时建议同时检查：

1. `lean-toolchain` 中的 Lean 版本；
2. `lake-manifest.json` 中依赖版本；
3. 当前版本和目标版本之间的所有 release notes；
4. CI、缓存、Mathlib 版本和本地 editor extension 是否匹配。

## 当前英文页列出的版本

- Lean 4.31.0-rc2 (2026-06-04)
- Lean 4.30.0 (2026-05-26)
- Lean 4.29.1 (2026-04-14)
- Lean 4.29.0 (2026-03-27)
- Lean 4.28.1 (2026-04-14)
- Lean 4.28.0 (2026-02-17)
- Lean 4.27.0 (2026-01-24)
- Lean 4.26.0 (2025-12-13)
- Lean 4.25.1 (2025-11-18)
- Lean 4.25.0 (2025-11-14)
- Lean 4.24.0 (2025-10-14)
- Lean 4.23.0 (2025-09-15)
- Lean 4.22.0 (2025-08-14)
- Lean 4.21.0 (2025-06-30)
- Lean 4.20.0 (2025-06-02)
- Lean 4.19.0 (2025-05-01)
- Lean 4.18.0 (2025-04-02)
- Lean 4.17.0 (2025-03-03)
- Lean 4.16.0 (2025-02-03)
- Lean 4.15.0 (2025-01-04)
- Lean 4.14.0 (2024-12-02)
- Lean 4.13.0 (2024-11-01)
- Lean 4.12.0 (2024-10-01)
- Lean 4.11.0 (2024-09-02)
- Lean 4.10.0 (2024-07-31)
- Lean 4.9.0 (2024-07-01)
- Lean 4.8.0 (2024-06-05)
- Lean 4.7.0 (2024-04-03)
- Lean 4.6.0 (2024-02-29)
- Lean 4.5.0 (2024-02-01)
- Lean 4.4.0 (2023-12-31)
- Lean 4.3.0 (2023-11-30)
- Lean 4.2.0 (2023-10-31)
- Lean 4.1.0 (2023-09-26)
- Lean 4.0.0 (2023-09-08)
- Lean 4.0.0-m5 (2022-08-22)
- Lean 4.0.0-m4 (2022-03-27)
- Lean 4.0.0-m3 (2022-01-31)
- Lean 4.0.0-m2 (2021-03-02)
- Lean 4.0.0-m1 (2021-01-04)

## 翻译策略

release notes 会随版本持续增长，且每个版本的详细条目通常只在升级时需要。因此本中文页先翻译 release notes 总览和版本索引。后续如果要支持某次具体升级，应按目标版本范围翻译对应版本的详细 release note，而不是一次性翻译所有历史版本。