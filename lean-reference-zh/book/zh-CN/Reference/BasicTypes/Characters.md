# 字符

> 对应英文：[Characters](https://lean-lang.org/doc/reference/latest/Basic-Types/Characters/)，抓取日期：2026-06-16。

`Char` 表示 Unicode scalar value。和 UTF-8 编码的字符串不同，单个字符在逻辑和运行时上都使用完整标量值来表示。

## 逻辑模型

从逻辑角度看，字符是一个结构：

```lean
structure Char where
  val   : UInt32
  valid : val.isValidChar
```

也就是说，`Char` 本质上是一个 32 位无符号整数，加上“它是合法 Unicode scalar value”的证明。

## 运行时表示

`Char` 是 trivial wrapper，因此编译后在许多场景里与 `UInt32` 具有相同表示：

- 在单态上下文里通常是直接的 32 位立即值；
- 在多态上下文里则可能被装箱。

## 语法

字符字面量用单引号包围，例如：

```lean
'a'
'中'
'\n'
```

支持常见转义：

- `\r`、`\n`、`\t`
- `\\`、`\"`、`\'`
- `\xNN`
- `\uNNNN`

## API 概览

### conversion

- `ofNat`
- `toNat`
- `isValidCharNat`
- `ofUInt8`
- `toUInt8`
- `toString`
- `quote`

### 字符类别

- `isAlpha`
- `isAlphanum`
- `isDigit`
- `isLower`
- `isUpper`
- `isWhitespace`

这些主要基于 ASCII 语义，而不是完整 Unicode 语义。

### 大小写转换

- `toUpper`
- `toLower`

同样主要针对 ASCII 字母。

### comparison / Unicode

- `le` / `lt`
- `utf8Size`
- `utf16Size`

## 使用建议

- 处理文本遍历时，要区分“单个 `Char`”和“UTF-8 字节序列中的一个字符位置”。
- `isAlpha` / `isUpper` 等更偏 ASCII 工具；若做完整 Unicode 语义处理，需要更高层库支持。
- 在构造字符串或字符字面量时，优先使用内建转义和 `quote` 辅助。