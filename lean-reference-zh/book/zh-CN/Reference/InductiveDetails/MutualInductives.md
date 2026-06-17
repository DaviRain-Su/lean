# 互递归归纳类型

> 对应英文：[Mutual Inductive Types](https://lean-lang.org/doc/reference/latest/The-Type-System/Inductive-Types/#mutual-inductive-types)，抓取日期：2026-06-16。

Lean 允许若干归纳类型一起声明，并相互在 constructor 中引用。这类定义称为 **mutual inductive types**。

## 何时需要

当两个或多个数据类型天然彼此递归依赖时，mutual declaration 比强行编码到单一大类型里更自然。例如：

- 表达式与声明
- even / odd 结构
- 语法树与辅助节点

## 需要满足什么

英文页特别强调了几类要求：

- 参数必须一致
- universe level 必须兼容
- positivity 仍要成立
- 递归依赖图要满足相应限制

也就是说，mutual 不会绕过普通归纳定义的安全检查；它只是把检查对象从“一个定义”扩展为“一组联立定义”。

## recursor 与运行时表示

Lean 会为 mutual inductive 组生成对应的 recursor。运行时表示仍由构造子形状决定，并不因为“互递归”就自动享有某种特殊对象模型。

## 使用建议

- 真正存在双向结构依赖时再用 mutual；
- 若只是语法上看起来方便，但能重构成单一归纳类型，通常单一类型更易维护；
- 遇到 mutual 定义被拒绝，优先检查“参数必须一致”和 positivity。