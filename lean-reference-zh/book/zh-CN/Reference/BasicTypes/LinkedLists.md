# 链表

> 对应英文：[Linked Lists](https://lean-lang.org/doc/reference/latest/Basic-Types/Linked-Lists/)，抓取日期：2026-06-16。

`List α` 是 Lean 中最常见的序列结构之一。它是经典的单向 linked list：

- 空列表 `[]`
- 头元素加尾列表 `x :: xs`

## 逻辑模型

从逻辑上看，`List` 是一个普通归纳类型。它非常适合：

- 递归定义；
- 归纳证明；
- 表示“顺序序列但不要求随机访问”的数据。

构造子是：

- `List.nil`
- `List.cons`

## 语法

常见语法包括：

- `[]`
- `[a, b, c]`
- `x :: xs`

这些都只是构造子语法糖。

## 性能特征

链表的主要特点：

- 头部插入便宜；
- 顺序遍历自然；
- 按索引随机访问昂贵；
- 在尾部追加通常需要线性时间。

因此：

- 频繁头插、递归消费时很适合用 `List`；
- 频繁随机访问或原地风格更新时更适合 `Array`。

## API 概览

英文页把 `List` API 分成：

- predicate / relation
- constructing lists
- length
- head and tail
- lookups
- queries
- conversions
- modification / insertion
- sorting
- iteration / folds
- transformation
- filtering / partitioning
- element predicates
- comparisons
- termination helpers

## 常见操作

- `length`
- `head?` / `tail`
- `get?`
- `append`
- `map`
- `filter`
- `foldl` / `foldr`
- `reverse`
- `zip`
- `partition`
- `sort`

## 使用建议

- 若算法天然按“取头 + 递归处理尾部”组织，优先用 `List`；
- 若最后要高效消费，可先用 `List` 累积，再统一转 `Array`；
- 若要频繁尾插，不要把 `List` 当动态数组用。
