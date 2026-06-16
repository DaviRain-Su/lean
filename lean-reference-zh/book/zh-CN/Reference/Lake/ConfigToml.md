# Lake TOML 配置格式

> 对应英文：[Declarative TOML Format](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/#lake-config-toml)，抓取日期：2026-06-16。

Lake 提供声明式 TOML 配置格式，适合不需要完整 Lean 元编程能力的 package。它让常见项目配置能用结构化数据表示，而不必直接写 `lakefile.lean`。

## 适合 TOML 的场景

- 普通 library / executable 项目；
- 配置需求主要是字段赋值，而不是复杂逻辑；
- 团队希望配置更直观、更接近数据文件。

若项目需要动态逻辑、条件分支、脚本式配置或高度自定义 target，则更适合 Lean format。

## 主要部分

英文页把 TOML 配置分成几类：

### Package Configuration

顶层 package 字段包括：

- `name`
- `defaultTargets`
- `srcDir`
- `buildDir`
- `binDir`
- `version`
- `description`
- `homepage`
- `license`
- `readmeFile`
- `precompileModules`
- `testDriver` / `lintDriver`
- `leanOptions` / `moreLeanArgs` / `moreLeancArgs`
- `moreLinkObjs` / `moreLinkLibs` / `moreLinkArgs`

### Dependencies

`[[require]]` 用于声明依赖。常见字段包括：

- `path`
- `git`
- `rev`
- `source`
- `version`
- `name`
- `scope`

### Library Targets

`[[lean_lib]]` 描述 library target。典型字段包括：

- `name`
- `srcDir`
- `roots`
- `needs`
- `precompileModules`
- `defaultFacets`

### Executable Targets

`[[lean_exe]]` 描述 executable target。典型字段包括：

- `name`
- `srcDir`
- `root`
- `exeName`
- `needs`
- `supportInterpreter`

## TOML 与 Lean format 的关系

TOML 是声明式子集；Lean format 则提供完整表达能力。两者可以通过 `lake translate-config` 在一定程度上互转，但复杂语义不一定能无损还原。

## 使用建议

- 如果项目配置只是常规 package/依赖/库/可执行项，优先用 TOML；
- 一旦需要条件逻辑、自定义 facet/target、脚本、复杂自动化，再切到 Lean format；
- 团队协作时，先保持配置简单，比一开始就过度使用动态配置更稳妥。
