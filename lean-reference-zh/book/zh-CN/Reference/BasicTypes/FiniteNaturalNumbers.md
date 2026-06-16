# 有限自然数

> 对应英文：[Finite Natural Numbers](https://lean-lang.org/doc/reference/latest/Basic-Types/Finite-Natural-Numbers/)，抓取日期：2026-06-16。

`Fin n` 表示所有严格小于 `n` 的自然数，因此它恰好有 `n` 个元素。它既能表示数组/列表的合法索引，也能作为标准的 n 元类型。

## 逻辑模型

```lean
structure Fin (n : Nat) where
  val  : Nat
  isLt : val < n
```

也就是说，`Fin n` 是一个自然数，加上“它小于上界 `n`”的证明。`Fin.val` 还是一个 coercion，因此在需要 `Nat` 的地方，`Fin n` 往往可直接使用。

## 运行时特点

`Fin n` 除了证明字段外只保存一个非 proof 字段，因此它是 trivial wrapper：编译后表示与底层 `Nat` 相同，不会额外增加运行时包装开销。

## 字面量与 coercion

- 有从 `Fin n` 到 `Nat` 的 coercion。
- 有 `OfNat` instance，可直接写数字字面量。
- 若字面量超出上界，使用对 `n` 取模后的结果。

## 常见 API

### 构造

- `last`
- `succ`
- `pred`

### arithmetic

- `add`
- `sub`
- `mul`
- `div`
- `mod`
- `log2`
- `natAdd`
- `addNat`
- `subNat`

这些运算通常带有模 `n` 的语义，因此和普通自然数 arithmetic 不完全相同。

### bitwise

- `shiftLeft`
- `shiftRight`
- `land`
- `lor`
- `xor`

### conversion

- `toNat`
- `ofNat`
- `cast`
- `castLT`
- `castLE`
- `castAdd`
- `castSucc`
- `rev`
- `elim0`

### iteration / reasoning

- `foldl` / `foldr`
- `foldlM` / `foldrM`
- `hIterate` / `hIterateFrom`
- `induction` / `inductionOn`
- `cases` / `lastCases` / `addCases`

## 使用建议

- 表示“合法索引”时优先用 `Fin n`，比单独拿 `Nat` 再到处携带边界证明更自然。
- 证明里若频繁在 `Fin` 和 `Nat` 间切换，要注意 coercion 和取模语义。
- 运行时代码里它通常很轻量，但逻辑层面的证明义务仍然真实存在。