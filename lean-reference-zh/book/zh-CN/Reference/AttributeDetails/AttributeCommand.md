# `attribute` 命令

> 对应英文：[The attribute Command](https://lean-lang.org/doc/reference/latest/Attributes/#The-Lean-Language-Reference--Attributes--The-attribute-Command)，抓取日期：2026-06-16。

`attribute` 命令用于修改**已有声明**的 attribute，而不需要重写该声明本身。

## 基本语法

```lean
attribute [attr1, attr2, ...] ident
```

其中 `ident` 是要修改 attribute 的现有名字。

## 典型用途

英文页列出的典型场景包括：

- 把一个已有声明注册为 local instance；
- 把已有 theorem 标记为 simp lemma 或 extensionality lemma；
- 临时把某个 simp lemma 从默认 simp set 中移除。

## 擦除 attribute

有些 attribute 允许“移除”，称为 **erasing**：

```lean
attribute [-simp] foo
```

也就是在 attribute 名前加 `-`。

注意：并不是所有 attribute 都支持擦除。

## 什么时候用 `attribute` 而不是在声明头上写

适合 `attribute` 命令的情况：

- 声明已经存在；
- 你不想或不能修改原始声明源文件；
- 需要局部启用/禁用某个自动化特性；
- 想根据当前文件上下文临时重组某套规则。

## 使用建议

- 对“声明身份固有”的 attribute，优先直接写在声明头上；
- 对“当前上下文临时策略”的 attribute，优先单独使用 `attribute` 命令；
- 对 `simp` 等重要自动化，添加与移除都应谨慎，因为它们会显著改变后续 proof 行为。