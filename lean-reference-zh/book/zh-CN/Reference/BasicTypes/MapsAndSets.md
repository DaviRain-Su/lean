# 映射与集合

> 对应英文：[Maps and Sets](https://lean-lang.org/doc/reference/latest/Basic-Types/Maps-and-Sets/)，抓取日期：2026-06-16。

map 是把 key 关联到 value 的数据结构；set 则可视为“只关心 key 是否存在的 map”。Lean 标准库同时提供基于 hash table 和基于 tree 的多种变体，并区分是否 dependent、是否 extensional。

## 设计维度

Lean 中 map/set 的选择主要沿三条轴展开：

### 表示方式

- **Hash table**：当结构不共享、且主要关心查找/插入效率时常更快。
- **Tree**：当结构共享较多，或需要有序遍历、按顺序查询时更合适。

### Extensionality

extensional map 把 map 看作 partial function：若两个 map 对所有 key 给出相同结果，则 propositionally equal。它对证明方便，但会限制某些依赖内部表示差异的操作。

### Dependent 与否

- 非 dependent map：所有 value 共享同一类型。
- dependent map：value type 由 key 决定，表达力更强，但使用门槛更高。

## 主要类型

### Hash 风格

- `HashMap`
- `DHashMap`
- `ExtHashMap`
- `ExtDHashMap`
- `HashSet`
- `ExtHashSet`

### Tree 风格

- `TreeMap`
- `DTreeMap`
- `TreeSet`

## 常见操作

无论是 map 还是 set，常见 API 基本围绕：

- 创建：`empty` / `emptyWithCapacity`
- 查询：`contains`、`get`、`get?`、`get!`、`getD`
- 修改：`insert`、`erase`、`alter`、`modify`
- 批量：`insertMany`、`union`、`partition`
- 迭代：`iter`、`fold`、`forIn`、`forM`
- 转换：`ofList`、`toList`、`ofArray`、`toArray`

Tree 风格 map/set 还额外提供按顺序访问的查询，例如：

- `min` / `max`
- `getGE` / `getGT` / `getLE` / `getLT`
- `entryAtIdx` / `keyAtIdx`

## Fused operation 与 raw data

英文页特别强调几个设计点：

- **fused operation**：把多个常见步骤合并为一次 traversal，减少中间结构和重复查找；
- **raw data and invariants**：部分底层表示需要额外不变量，普通用户应优先使用高层包装类型；
- **suitable operators for uniqueness**：在共享与唯一引用场景下，不同表示的性能差异很大。

## 选择建议

- 若需要有序遍历或顺序查询，优先 `TreeMap` / `TreeSet`；
- 若更在意平均查找速度，且结构通常不共享，优先 `HashMap` / `HashSet`；
- 若证明中需要 extensional equality，再考虑 `ExtHashMap` / `ExtHashSet`；
- 若 value type 依赖 key，再使用 dependent 版本。
