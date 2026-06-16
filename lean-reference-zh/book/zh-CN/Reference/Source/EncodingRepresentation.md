# 编码与表示

> 对应英文：[Encoding and Representation](https://lean-lang.org/doc/reference/latest/Source-Files-and-Modules/#The-Lean-Language-Reference--Source-Files-and-Modules--Encoding-and-Representation)，抓取日期：2026-06-16。

Lean 源文件是以 UTF-8 编码的 Unicode 文本文件。

## 行尾规范

Lean 允许两种行尾：

- 换行符 `
`
- 回车换行序列 `
`

不过，在解析和比较文件时，Lean 会把行尾规范化，因此逻辑上所有文件都会被当作“行尾都是 `
`”来处理。

## 这意味着什么

- 跨平台协作时，不必为 `LF` / `CRLF` 差异过度担心；
- 版本控制里的行尾变化，通常不会改变 Lean 对源码语义的理解；
- 但在外部工具链、脚本或文本比较中，行尾差异仍可能影响结果，因此仍建议团队统一编辑器设置。

## 实用建议

- 源码统一使用 UTF-8；
- 若编辑器支持，建议统一为 LF，以减少无关 diff；
- 处理 Lean 文件的外部脚本也应假定 UTF-8，而不是平台本地编码。