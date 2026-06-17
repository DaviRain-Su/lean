# Squash 类型

> 对应英文：[Squash Types](https://lean-lang.org/doc/reference/latest/The-Type-System/Quotients/#squash-types)，抓取日期：2026-06-16。

Squash 类型把“某个类型里有一个值”这件事保留下来，同时抹去该值的具体信息。直觉上，它像是“把所有 inhabitant 都压扁成同一个不可区分代表”。

## 相关接口

英文页列出的核心名字包括：

- `Squash`
- `Squash.mk`
- `Squash.lift`
- `Squash.ind`

## 它和 `Nonempty` 的关系

从逻辑用途上，Squash 与 `Nonempty` 很接近：都表达“至少有一个值”。区别在于 Squash 是一个更显式的类型层构造，并带有自己的 API。

## 为什么有用

有时你希望：

- 保留“存在值”这一信息；
- 但不允许程序或证明继续依赖该值的具体内容；
- 让后续所有使用者只能观察到“它存在”，而观察不到“它是谁”。

Squash 正适合这类场景。

## 使用建议

- 若只想表达存在性，且不想暴露 witness 细节，可考虑 Squash / `Nonempty` 风格对象；
- 若需要后续真正取出并计算具体 witness，Squash 就不合适，应回到 `Sigma` / `Subtype` / `Exists` / 普通数据结构。