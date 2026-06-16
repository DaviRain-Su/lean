# 位向量

> 对应英文：[Bitvectors](https://lean-lang.org/doc/reference/latest/Basic-Types/Bitvectors/)，抓取日期：2026-06-16。

位向量是固定宽度的二进制位序列。它们在软件验证里非常常见，因为既接近硬件层面的表示，也适合描述位运算、溢出和有限宽度整数语义。

一个位向量既可以从“位序列”角度理解，也可以从“某个数的编码”角度理解；若按数解释，还可区分有符号和无符号语义。

## 逻辑模型

从逻辑上看，`BitVec w` 是某个 `Fin (2 ^ w)` 的包装，因此最终仍建立在 `Nat` 和 `Fin` 的高效核心支持之上。

```lean
structure BitVec (w : Nat) where
  toFin : Fin (2 ^ w)
```

这意味着：

- 宽度固定为 `w`
- 所有值都自动限制在 `0 .. 2^w - 1`
- 溢出自然按模 `2^w` 处理

## 运行时表示

由于 `BitVec` 是 `Fin` 的 trivial wrapper，而 `Fin` 又是 `Nat` 的 trivial wrapper，所以编译后位向量与 `Nat` 共享运行时表示。

## 语法

有两类常见写法：

- 在 expected type 已知时，直接使用数字字面量；
- 显式写固定宽度字面量，例如 `num#width` 形式。

位向量也支持二进制、十六进制等数值字面量，只要上下文能确定宽度或字面量显式给出了宽度。

## 自动化

位向量相关问题可大量借助 `bv_decide` tactic。它会调用外部 SAT/SMT 风格求解器，再把结果重建回 Lean proof；因此高层自动化很强，而最终 proof 仍能被 Lean 检查。

## API 概览

英文页把 API 分成：

- bounds
- construction
- conversion
- comparisons
- hashing
- sequence operations
- bit extraction
- bitwise operators
- arithmetic
- iteration
- proof automation

### 常见构造与转换

- `fill`
- `zero`
- `allOnes`
- `twoPow`
- `toHex`
- `toInt`
- `toNat`
- `ofBool`
- `ofInt`
- `ofNat`
- `cast`

### 常见比较

- `ule`
- `sle`
- `ult`
- `slt`
- `decEq`

### 序列与位操作

- `append`
- `truncate`
- `setWidth`
- `zeroExtend`
- `signExtend`
- `rotateLeft`
- `rotateRight`
- `getMsb`
- `getLsb`
- `extractLsb`

### arithmetic

- `add`
- `sub`
- `mul`
- `udiv`
- `umod`
- `sdiv`
- `smod`
- `srem`
- overflow 检测函数

## 使用建议

- 做低层程序验证、溢出语义推理、位运算建模时，优先用 `BitVec`。
- 若问题本质是无界整数，优先 `Nat` / `Int`，避免不必要的模语义。
- 需要自动化时，先考虑 `bv_decide`；它通常比手工拆位证明高效得多。