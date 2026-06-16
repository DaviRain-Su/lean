# Tuple

> 对应英文：[Tuples](https://lean-lang.org/doc/reference/latest/Basic-Types/Tuples/)，抓取日期：2026-06-16。

Lean 标准库包含多种“tuple-like”类型。它们的区别主要取决于：

- 第一投影是 `Type` 还是 `Prop`
- 第二投影是 `Type` 还是 `Prop`
- 第二投影的类型是否依赖第一投影的值
- 整体处于 `Type` 还是 `Prop`

在实践中，本章最重要的是：

- **有序对**：`Prod`
- **依赖对**：`Sigma`

## 有序对：`Prod`

普通 tuple / pair 由 `Prod α β` 表示，通常写作：

```lean
α × β
```

值写作：

```lean
(x, y)
```

更大的 tuple 按右结合嵌套，因此：

- `α × β × γ` 等价于 `α × (β × γ)`
- `(x, y, z)` 等价于 `(x, (y, z))`

### 核心投影

- `fst`
- `snd`

### 常见 API

- `map`
- `swap`
- `allI`
- `anyI`
- `foldI`
- `lexLt`

此外还有更少见的变体：

- `PProd`：允许投影是 proposition
- `MProd`：要求两个分量在同一 universe

`PProd` 更多见于 proof automation 或实现细节，手写代码通常优先普通 `Prod`。

## 依赖对：`Sigma`

依赖对又称 dependent pair 或 dependent sum。其第二个分量的类型可以依赖第一个分量：

```lean
Sigma (fun a => β a)
```

常见语法：

```lean
Σ a : α, β a
(a : α) × β a
```

### 典型用途

1. **把索引和值打包**
   - 例如 `Σ n, Fin n`：一对自然数和“小于它的值”。
2. **把 tag 与不同类型值打包**
   - 类似某些手工编码的 dependent sum / tagged union。

### 核心投影

- `fst`
- `snd : β fst`

也存在 universe 更一般的 `PSigma`，但它更容易触发 universe 约束问题，通常只在自动化或较底层实现里使用。

## 与 `Subtype` 和 `Exists` 的区别

- `Subtype`：第二部分是 `Prop` proof，强调“带性质的值”。
- `Exists`：整体在 `Prop` 中，不是计算型数据。
- `Sigma`：第二部分是计算型数据，整体在 `Type` 中。

## 使用建议

- 普通二元打包优先 `Prod`。
- 需要让第二个值依赖第一个值时用 `Sigma`。
- 若第二个分量只是性质证明，通常更适合 `Subtype`。
- 若只想表达“存在某值满足性质”，通常更适合 `Exists`。