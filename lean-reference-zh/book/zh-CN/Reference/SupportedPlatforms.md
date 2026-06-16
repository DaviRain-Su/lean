# 支持平台

> 对应英文：[Supported Platforms](https://lean-lang.org/doc/reference/latest/platforms/)，抓取日期：2026-06-16。

Lean 按支持等级列出平台。支持等级描述官方构建、测试和二进制发布的保障程度。

## Tier 1

Tier 1 平台是 Lean CI infrastructure 会构建并测试的平台。通过 `elan` 可以获得这些平台的 Lean binary release。

当前 Tier 1 平台包括：

- x86-64 Linux，glibc 2.26+；
- aarch64 Linux，glibc 2.27+；
- aarch64（Apple Silicon）macOS 10.15+；
- x86-64 Windows 11（任意版本）、Windows 10（1903 或更高版本）、Windows Server 2022、Windows Server 2025。

如果要在生产环境、CI 或教学环境中部署 Lean，优先选择 Tier 1 平台。它们能获得最完整的自动化测试覆盖。

## Tier 2

Tier 2 平台是 Lean 会 cross-compile 但 CI 不测试的平台。这些平台也有 binary release。

由于缺少自动化测试，release 可能在没有提示的情况下损坏。欢迎提交 issue report 和 fix。

当前 Tier 2 平台包括：

- x86-64 macOS 10.15+；
- Emscripten WebAssembly。

## 使用建议

- 通过 `elan` 安装 Lean 时，优先使用官方支持的 binary release。
- 如果在非 Tier 1 平台遇到异常，先确认问题是否能在 Tier 1 平台复现。
- 浏览器或 WebAssembly 环境适合演示和轻量交互，但不应默认等同于完整本地 toolchain。
- 项目 CI 应尽量运行在 Tier 1 平台上，以减少平台相关故障。