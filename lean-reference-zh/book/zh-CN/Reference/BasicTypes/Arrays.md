# 数组

> 对应英文：[Arrays](https://lean-lang.org/doc/reference/latest/Basic-Types/Arrays/)，抓取日期：2026-06-16。

`Array α` 表示按位置可寻址的元素序列。Lean 对数组有专门支持：

- 逻辑模型以 `List α` 指定行为；
- compiled code 中以动态数组实现，并对常见操作做运行时优化；
- 提供数组字面量和 subarray 语法。

## 逻辑模型

从证明角度看，`Array α` 基本上是包着 `List α` 的结构。`toList` 给出逻辑解释，因此许多数组函数的性质可以转到列表层面证明。

数组有两个重要概念：

- **size**：当前元素个数；
- **capacity**：已分配空间大小。

Lean 代码能观察 `size`，但不能直接观察 `capacity`。`Array.emptyWithCapacity` 可在逻辑上仍为空数组的同时，预先分配更大容量。

## 运行时表示

运行时数组是动态数组：连续内存块中保存元素，记录 size 和 capacity。只要 size 小于 capacity，向尾部追加元素就不必重新分配；当空间不足时，运行时会重新分配更大数组，通常按倍增策略增长。

数组性能好的关键有两点：

- 良好的 locality：元素在内存中连续，缓存友好；
- 若数组没有共享引用，可使用 destructive update，而不需要 persistent data structure 的复制成本。

因此，线性使用数组时，Lean 代码既保持纯函数式写法，又能获得接近命令式可变数组的性能。

## 语法

数组字面量：

```lean
#[1, 2, 3]
```

subarray 语法：

```lean
xs[i:]
xs[i:j]
```

前者取从 `i` 开始到结尾；后者取 `[i, j)` 区间。

## API 概览

英文页数组 API 很丰富，主要分为：

- 构造：`empty`、`singleton`、`range`、`replicate`、`append`
- 大小：`size`、`usize`、`isEmpty`
- 查询：`extract`、`getD`、`back?`
- 修改：`push`、`pop`、`eraseIdx`、`swap`、`set`、`modify`、`reverse`
- 排序与查找：`qsort`、`binSearch`
- 迭代：`foldl`、`foldr`、`forM`
- 变换：`map`、`flatMap`、`zip`
- 过滤与分组：`filter`、`partition`
- Subarray API

## 性能建议

- 在性能关键路径中，尽量线性地使用数组，避免共享后再频繁更新。
- `Array.mk` 和 `Array.toList` 在运行时是线性操作。
- 若知道大致大小，使用 `emptyWithCapacity` 可减少扩容成本。
