# trivial wrapper

> 对应英文：[Trivial Wrappers](https://lean-lang.org/doc/reference/latest/The-Type-System/Inductive-Types/#inductive-types-trivial-wrappers)，抓取日期：2026-06-16。

某些归纳类型在逻辑上看是完整的新类型，但在运行时几乎只是“把一个底层值包起来”。这类类型常被称为 **trivial wrapper**。

## 典型特征

- 只有一个真正相关的非 proof 字段；
- 其余字段是 proof，或在运行时会被擦除；
- 编译后可与底层值共享相同或近似相同表示。

## 为什么重要

trivial wrapper 解释了许多常见现象：

- 某些逻辑上很丰富的类型几乎没有运行时开销；
- `Subtype`、部分结构体包装、某些 refinement 风格对象在性能上并不昂贵；
- 证明层面的抽象与运行时代码的轻量表示可以同时成立。

## 与 proof 擦除的关系

proof 字段在编译后会被擦除，因此一个“值 + proof”的包装常常最终只剩下那个值本身。正因为如此，很多用类型携带不变量的建模方式在 Lean 中既安全又高效。

## 使用建议

- 若某类型只是在已有数据上附加 proof 或很薄的一层标记，可以把它视作 trivial wrapper 候选；
- 性能敏感代码里，不要过早因为“逻辑上多了一层包装”就担心运行时开销。