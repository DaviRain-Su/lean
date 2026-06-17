# 空文档

> 对应英文：[Empty Documents](https://lean-lang.org/doc/reference/latest/Interacting-with-Lean/#The-Lean-Language-Reference--Interacting-with-Lean--Formatted-Output--Format--Empty-Documents)，抓取日期：2026-06-16。

在 `Format` 世界里，空文档不是小事。很多复杂 pretty-printer 都需要先判断：某个子块到底有没有内容，决定要不要加分隔符、缩进或换行。

## 常见判定

英文页列出的两个名字是：

- `isEmpty`
- `isNil`

它们都用于测试某个 `Format` 是否为空，但服务的内部语义略有差异。对使用者来说，重要的是：空文档可以被显式识别，而不必依赖把它先渲染成字符串再检查。

## 为什么重要

若不处理空文档，常见问题包括：

- 多余逗号
- 多余空格或空行
- 左右括号中间出现奇怪布局
- 某些“只有内容存在时才应显示”的区块被错误打印

## 使用建议

- 组合一组子文档前，先决定空文档该如何处理；
- 复杂 pretty-printer 中，空文档判定通常应比字符串长度判断更早发生。