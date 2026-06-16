# 基础 class 总览

> 对应英文：[Basic Classes](https://lean-lang.org/doc/reference/latest/Type-Classes/Basic-Classes/)，抓取日期：2026-06-16。

Lean 中许多最常见的内建 notation，都是通过 type class 重载实现的。本节给出高频基础 class 的概览。

## 1. 布尔相等与哈希

### `BEq`

`BEq α` 提供布尔值相等判定：

- 记号：`a == b`
- 结果类型：`Bool`

它面向编程，而不是证明；因此不像 `DecidableEq` 那样自动带有逻辑公理。

### `Hashable`

`Hashable α` 提供：

- `hash : α → UInt64`

与 `BEq` 一起使用时，理想上应满足：若 `a == b`，则 `hash a = hash b`。

### `LawfulBEq` / `ReflBEq` / `EquivBEq` / `LawfulHashable`

这些是“lawfulness”类，用于把布尔比较与逻辑相等、哈希兼容性等联系起来。

## 2. 排序与顺序

### `Ord`

`Ord α` 提供三值比较：

- `compare : α → α → Ordering`

配套还有：

- `Ordering.lt` / `.eq` / `.gt`
- `Ordering.then`
- `compareOn`
- `Ord.opposite`

### `LT` / `LE`

这些 class 用于重载：

- `<`
- `≤`

它们是 `Prop` 值关系，不要求一定可判定。

## 3. 最小值与最大值

- `Min`
- `Max`

用于为某类型提供“最小/最大”操作接口。

## 4. 可判定性

- `Decidable`
- `DecidablePred`
- `DecidableRel`
- `DecidableEq`
- `DecidableLT`
- `DecidableLE`
- `decide`
- `byCases`

这些 class 与工具把 proposition 和可执行判断联系起来。

## 5. inhabited / nonempty

- `Inhabited`
- `Nonempty`

`Inhabited` 提供默认值；`Nonempty` 只声明“存在某值”，但不承诺能计算出 canonical 默认值。

## 6. subsingleton

- `Subsingleton`
- `elim`
- `helim`

用于表示某类型中任意两值都相等。

## 7. arithmetic 与 bitwise operator

Lean 用一大组 class 重载常见算术与位运算：

- `Zero`
- `HAdd` / `Add`
- `HSub` / `Sub`
- `HMul` / `Mul` / `SMul`
- `HDiv` / `Div`
- `HMod` / `Mod`
- `Pow` / `NatPow` / `HomogeneousPow`
- `ShiftLeft` / `ShiftRight`
- `Neg`
- `AndOp` / `OrOp` / `XorOp`

## 8. append

- `HAppend`
- `Append`

用于重载拼接行为，例如字符串、列表、数组等。

## 9. 数据查找

- `GetElem`
- `GetElem?`
- `LawfulGetElem`

这组 class 支撑数组、列表、映射等结构上的索引语法与安全访问约定。

## 使用建议

- 读不懂某个内建符号是怎么来的时，先找它背后的基础 class。
- 写通用库时，尽量依赖这些标准 class，而不是发明自定义“近似接口”。
- 若某类运算涉及 lawfulness，最好同时考虑对应的 `Lawful...` 版本，而不是只给出裸操作。