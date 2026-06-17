# `lake query`

> 对应英文：[Lake command: lake query](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/#lake-query)，抓取日期：2026-06-16。

`lake query` 会构建一组 target，并把这些 target 的“查询结果”输出到标准输出。

## 输出形式

- 默认：按原始字符串输出，每个结果末尾带换行。
- `--json`：以 JSON 形式输出。

结果顺序与命令行里给出的 target 顺序一致。

## 若 target 没有输出

某些 target 没有配置输出结果。在这种情况下：

- 文本模式下通常输出空字符串；
- JSON 模式下通常是 `null`。

对于 executable target，输出通常是构建后可执行文件的路径。

## target 语法

`lake query` 使用和 `lake build` 相同的 target 指定语法。因此：

- 可以查询 package / library / module / facet；
- 也可配合模块文件名与 facet 使用。

## 何时有用

- 想脚本化获取某个 target 的产物路径；
- 想让外部工具读取构建结果，而不是手工解析 `lake build` 输出；
- 想在自动化流程中拿到“这个 target 对应的具体文件或值”。

## 与 `lake build` 的区别

- `lake build` 偏“把东西构建出来”。
- `lake query` 偏“构建后把关心的结果值吐出来”。

因此，`query` 更适合机器消费。