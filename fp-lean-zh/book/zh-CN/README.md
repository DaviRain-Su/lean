# Lean 函数式编程

本仓库包含 David Thrane Christiansen 所著 *Functional Programming in Lean* 一书的源码。

原书版本由 Microsoft Corporation 于 2023 年以 Creative Commons Attribution 4.0 International License 发布。当前版本已由作者针对新版 Lean 以及 Verso 的使用进行了修改；这些修改版权归 2023–2025 Lean FRO, LLC 所有。详细变更说明可在本书的[源码仓库](https://github.com/leanprover/fp-lean/)中找到。

本书的构建环境已通过以下配置测试：

1. Lean 4（版本见 `examples/lean-toolchain`）
2. expect（已在 v5.45.4 上测试，近十年内的版本通常都可正常工作）

要构建本书，请切换到 `book` 目录并运行 `lake exe fp-lean`。构建完成后，多页面网页版位于 `book/out/html-multi`。
