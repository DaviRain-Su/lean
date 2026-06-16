# toolchain identifier

> 对应英文：[Toolchain Identifiers](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Managing-Toolchains-with-Elan/#The-Lean-Language-Reference--Build-Tools-and-Distribution--Managing-Toolchains-with-Elan--Selecting-Toolchains--Toolchain-Identifiers)，抓取日期：2026-06-16。

Elan 用 **toolchain identifier** 指定要安装或运行的 Lean 版本。identifier 可以是：

- 一个 **channel**；
- 带可选 **origin** 的 channel；
- 通过 `elan toolchain link` 建立的自定义本地 toolchain 名称。

## 常见 channel

### `stable`

最新稳定版。Elan 会自动跟踪 stable，并在新稳定版发布时提示升级。

### `beta`

最新 release candidate，适合在稳定版发布前提前测试。

### `nightly`

最新 nightly build，适合试验新功能和向 Lean 开发者反馈问题。

### 指定版本 / 指定 nightly

你也可以直接指定版本或某天的 nightly：

- `4.17.0`
- `v4.17.0`
- `nightly-YYYY-MM-DD`

项目中的 `lean-toolchain` 文件通常应写**具体版本**，而不是笼统地写 `stable` 或 `nightly`。这样更利于团队协作与历史版本重建。

### 自定义本地 toolchain

`elan toolchain link` 可给一个本地编译出的 Lean 建立名字。这对开发 Lean 编译器本身尤其有用。

## origin

toolchain 也可以显式指定下载来源。默认 origin 是官方 GitHub 仓库：

```text
leanprover/lean4
```

写法是：

```text
origin:channel
```

例如：

- `leanprover/lean4:stable`
- `leanprover/lean4:nightly-2025-03-25`

对 nightly，Elan 会自动把 `-nightly` 附加到 origin 仓库名上。因此 `leanprover/lean4:nightly-2025-03-25` 实际会去 `leanprover/lean4-nightly` 查询发布。

## 使用建议

- 团队项目：`lean-toolchain` 里写固定版本。
- 试验新特性：可临时用 `nightly-日期`。
- 本地 Lean 编译器联调：用 `elan toolchain link`。
