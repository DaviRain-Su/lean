# 缩进

> 对应英文：[Indentation](https://lean-lang.org/doc/reference/latest/Interacting-with-Lean/#The-Lean-Language-Reference--Interacting-with-Lean--Formatted-Output--Format--Indentation)，抓取日期：2026-06-16。

缩进是让多行错误消息、证明状态和嵌套结构保持可读的关键。`Format` 为此提供了专门 API，而不是要求用户手工往字符串前塞空格。

## 常见工具

英文页列出：

- `nestD`
- `defIndent`
- `indentD`

## 直观理解

- `nestD`：把某块文档在换行后整体右移若干层。
- `defIndent`：给出系统默认缩进量，方便整体风格统一。
- `indentD`：在默认缩进规则上构造新的缩进文档。

## 为什么不用手工空格

手工空格的问题在于：

- 只有真正换行渲染后才知道哪些行需要缩进；
- 压平成单行时，多余空格可能变成噪音；
- 与括号和 group 组合时很难统一控制。

`Format` 的缩进 API 把这些决策延迟到渲染阶段。

## 使用建议

- 想让嵌套结构更清晰时，优先用缩进组合器；
- 设计自定义 `Repr` / `ToFormat` 时，先决定层次，再决定缩进。