# 渲染 `Format`

> 对应英文：[Rendering](https://lean-lang.org/doc/reference/latest/Interacting-with-Lean/#The-Lean-Language-Reference--Interacting-with-Lean--Formatted-Output--Format--Rendering)，抓取日期：2026-06-16。

`Format` 在构造阶段只是结构化文档；真正把它变成可显示文本，需要进入**渲染**阶段。

## 常见入口

英文页列出：

- `pretty`
- `defWidth`
- `prettyM`
- `MonadPrettyFormat`

## `pretty`

`pretty` 负责把一个文档在给定宽度下排版成字符串/文本。它会综合考虑：

- 哪些块能压成一行；
- 哪些地方必须换行；
- 缩进该如何传播。

## `defWidth`

`defWidth` 给出默认渲染宽度。许多“看起来像默认终端宽度”的排版效果，都以它为基准。

## `prettyM` 与 `MonadPrettyFormat`

有些渲染工作不只是纯函数，还需要额外上下文或 monadic 资源。`prettyM` 和 `MonadPrettyFormat` 提供了这种能力，使 pretty-printing 能在 monad 里完成。

## 为什么单独区分构造与渲染

把“构造文档”与“渲染成字符串”分开，有几个好处：

- 同一文档可在不同宽度下重排；
- 上层 API 专注结构，而非输出设备细节；
- 更适合错误消息、IDE 输出、终端和日志等多场景复用。

## 使用建议

- 尽量让中间层都保留 `Format`，最后一步再统一渲染；
- 若输出效果不理想，优先调文档结构和宽度，而不是直接改字符串。