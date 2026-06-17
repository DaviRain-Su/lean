# invalidField

> 对应英文：[About: invalidField](https://lean-lang.org/doc/reference/latest/Error-Explanations/About___--invalidField/)，抓取日期：2026-06-16。

错误码：`lean.invalidField`

含义：generalized field notation 以潜在歧义或无效方式使用。

严重性：Error。起始版本：4.22.0。

这个错误表示 Lean 遇到了一个“表达式后接点号和 identifier”的形式，但无法把该 identifier 理解为 field 或 generalized field notation 调用。

Lean 的 field notation 很强，也容易混淆。`color.value` 可能是一个完整 identifier，也可能是 structure field projection，也可能是 generalized field notation：把函数应用到点号前的值上。

## 常见原因

- field 名拼错，例如写了 `.suc`，但实际没有 `Nat.suc`。
- 点号前表达式的 type 不对。例如想调用 `List.leftpad`，却写成 `'>' .leftpad` 一类以 `Char` 为 receiver 的形式。
- receiver 的 type 太泛，例如只有 `[Add α]`，并不知道 `α` 具体是哪种 type，因此不能解析 `.succ`。
- type 信息不足，例如 `fun n => n.succ.succ` 中 `n` 的 type 未知。

## 修复方向

- 检查 field/function 名是否存在。
- 让点号前表达式具有正确 type。
- 添加 type annotation，使 Lean 能确定 receiver type。
- 必要时改用完整函数调用，例如 `Nat.succ n`。

## 示例

```lean
-- 错误：List 没有 .suc 字段
#check ([] : List Nat).suc

-- 修复：用 Nat.succ 或先取 head 再 succ
#check Nat.succ 0
```

类型太泛时：

```lean
-- 错误：只知道 [Add α]，无法解析 .succ
example [Add α] (n : α) : α := n.succ

-- 修复：写清类型
example (n : Nat) : Nat := n.succ
-- 或
example (n : Nat) : Nat := Nat.succ n
```
