# 逻辑连接词

> 对应英文：[Logical Connectives](https://lean-lang.org/doc/reference/latest/Basic-Propositions/Logical-Connectives/)，抓取日期：2026-06-16。

Lean 中除了 implication 之外，常见逻辑连接词大多通过独立的归纳/结构类型实现。它们既有数学上的含义，也有对应的构造子、投影和消去原则。

## 合取 `And`

`And a b`，记作 `a ∧ b`，是 conjunction。

### 构造

- `And.intro`
- 匿名构造子 `⟨ha, hb⟩`

### 消去

若 `h : a ∧ b`，可取：

- `h.left` 或 `h.1`
- `h.right` 或 `h.2`

Lean 还提供：

- `And.elim`

从 proof 角度看，`And` 像 pair；但因为它位于 `Prop` 中，所以 proof 本身不会成为普通运行时数据。

## 析取 `Or`

`Or a b`，记作 `a ∨ b`，有两个构造子：

- `Or.inl : a → a ∨ b`
- `Or.inr : b → a ∨ b`

与 `Sum α β` 不同，`Or` 位于 `Prop` 中，因此它的 proof 不能像普通数据那样被任意“读取出到底来自左边还是右边”。

## 否定 `Not`

`¬ p` 并不是单独的归纳类型，而被定义为：

```text
p → False
```

因此：

- 证明否定，本质上是“假设 `p`，推出矛盾”；
- `absurd` 与 `Not.elim` 都可用于从 `p` 和 `¬p` 推出任意结论。

## 蕴含与双向蕴含

### implication

`a → b` 直接由函数类型表示：证明一个 implication，本质上就是给出一个把 `a` 的 proof 变成 `b` 的 proof 的函数。

### `Iff`

`a ↔ b` 通过结构体 `Iff` 表示，本质上同时保存两个方向：

- `mp : a → b`
- `mpr : b → a`

它既可视为“两个 implication 的打包”，也可视为逻辑等价。

## 语法

常见逻辑连接词写法：

- `a ∧ b`
- `a ∨ b`
- `¬ a`
- `a ↔ b`

## 使用建议

- 证明 `∧` 时，先想怎么分别证明左右两边；
- 证明 `∨` 时，先决定要走哪一支构造；
- 处理 `¬p` 时，把它当成 `p → False` 往往最清晰；
- 需要在两个命题之间双向转换时，用 `↔`。