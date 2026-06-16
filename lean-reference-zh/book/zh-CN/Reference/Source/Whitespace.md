# 空白符

> 对应英文：[Whitespace](https://lean-lang.org/doc/reference/latest/Source-Files-and-Modules/#The-Lean-Language-Reference--Source-Files-and-Modules--Concrete-Syntax--Whitespace)，抓取日期：2026-06-16。

Lean token 之间可以出现任意数量的空白序列。

合法空白包括：

- 普通空格 ` `
- 合法换行序列
- 注释

## 不是合法空白的内容

以下内容**不**算合法空白：

- 制表符 `	`
- 单独出现且后面不跟换行的回车 ``

这和很多语言不同：Lean 并不把所有看起来“像空白”的字符都当作可自由分隔 token 的空白。

## 实用建议

- 编辑 Lean 文件时尽量使用空格缩进，而不是 tab；
- 若复制外部文本进 Lean 文件，遇到奇怪 parser 错误时，先检查是否混入了 tab 或异常回车；
- 团队编辑器设置里最好统一关闭制表符缩进。