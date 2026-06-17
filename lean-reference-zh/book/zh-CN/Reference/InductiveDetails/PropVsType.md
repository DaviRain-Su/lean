# `Prop` 与 `Type`

> 对应英文：[Prop vs Type](https://lean-lang.org/doc/reference/latest/The-Type-System/Inductive-Types/#prop-vs-type)，抓取日期：2026-06-16。

归纳定义落在 `Prop` 还是 `Type`，会显著影响其 elimination 和运行时意义。

## 落在 `Prop`

若归纳类型是 proposition：

- proof 在运行时会被擦除；
- elimination 一般更受限制；
- 重点是逻辑推理，而不是计算。

例如 `True`、`False`、`And`、`Or`、`Exists` 都属于这一类。

## 落在 `Type`

若归纳类型是普通数据类型：

- 值会参与运行时表示；
- elimination 可进入更一般的结果类型；
- recursor 更偏计算和数据结构处理。

例如 `Nat`、`List α`、`Tree α` 等都在 `Type` 中。

## 为什么需要区分

Lean 之所以区分这两类，是为了同时满足：

- 证明的 proof irrelevance 与擦除语义；
- 程序计算时对数据的正常可观察性。

若不区分，命题 proof 可能泄漏到运行时；反过来，普通数据又可能被错误地当成“无信息的证明对象”。

## 实践含义

- 同样是 `inductive` 关键字，定义落点不同，后续可做的事情也不同；
- 某些 elimination 被拒绝，往往不是因为语法错，而是因为你在试图把 `Prop` 当普通数据消去；
- 设计 API 时要先问自己：这个对象是为了计算，还是为了陈述/证明。