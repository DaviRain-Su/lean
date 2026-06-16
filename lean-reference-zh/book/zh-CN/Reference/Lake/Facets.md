# Lake facet

> 对应英文：[Facets](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/#lake-facets)，抓取日期：2026-06-16。

facet 是 Lake 对某个 target 的“某一种产物或观察角度”的命名。一个 target 不只对应一种输出；同一逻辑目标可能有多个相关 artifact，因此 Lake 需要 facet 来区分它们。

## 直观理解

例如，一个 Lean library target 可能关联：

- `.olean` 文件；
- 本地库文件；
- 预编译模块；
- 插件；
- 额外依赖产物。

这些都属于“同一个 target 的不同 facet”。

## 为什么 facet 有用

facet 让 Lake 能：

- 精确指定“我要这个 target 的哪种产物”；
- 把依赖图拆得更细，避免无谓构建；
- 支持自定义 target / 自定义产物；
- 对 library、module、package 这几类对象统一建模。

## 自定义 facet

Lake 允许定义 package facet、library facet、module facet。这样用户不仅能扩展 target，还能为已有 target 系统地增加新的构建产物或检查过程。

## 使用建议

- 普通用户日常不必记住 facet 细节，但理解其存在有助于读懂 Lake 的内部 API 和高级配置。
- 当需要自定义构建、代码生成、额外缓存、插件构建流程时，facet 会成为核心概念。
