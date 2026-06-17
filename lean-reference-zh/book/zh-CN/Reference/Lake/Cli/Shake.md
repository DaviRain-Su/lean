# `lake shake`

> 对应英文：[Lake command: lake shake](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/#lake-shake)，抓取日期：2026-06-16。

`lake shake` 用于检查项目里**未使用的 import**。它通过分析生成的 `.olean` 文件来推断真正需要的依赖，从而判断哪些 import 没有贡献任何常量或 elaboration 依赖。

## 作用范围

- 若指定 `module ...`，则检查该模块及其传递可达模块；
- 否则，检查 package 的默认 target roots。

## 源文件中的控制注释

英文页列出三种特殊注释：

- `module -- shake: keep-downstream`
- `module -- shake: keep-all`
- `import X -- shake: keep`

它们分别用于：

- 保留某模块在下游中的 import 影响；
- 保留该模块现有所有 import；
- 保留某条特定 import。

## 常见选项

- `--force`：跳过 `lake build --no-build` 的 sanity check
- `--keep-implied`
- `--keep-prefix`
- `--keep-public`
- `--add-public`
- `--explain`
- `--fix`
- `--gh-style`

其中：

- `--explain` 说明某个 import 是被哪些常量需要的；
- `--fix` 会把建议直接写回源文件；
- `--gh-style` 适合 GitHub problem matcher。

## 何时有用

- 清理过度导入；
- 减少 API 面污染；
- 缩短编译依赖链；
- 在大工程里做 import hygiene。

## 使用建议

- 先用普通模式查看建议，再决定是否 `--fix`；
- 若项目很在意 API 稳定性，检查 `--keep-public` / `--add-public` 等选项含义后再自动修改。