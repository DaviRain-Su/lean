# coercion 插入

> 对应英文：[Coercion Insertion](https://lean-lang.org/doc/reference/latest/Coercions/Coercion-Insertion/)，抓取日期：2026-06-16。

Lean 把“从一个类型自动转到另一个类型”的搜索过程称为 **coercion insertion**。当某处代码本来会报类型错误时，elaborator 会先尝试看看能否自动插入合适 coercion。

## 会触发 coercion 插入的三类情况

### 1. 期望类型与推断类型不一致

某个 term 已成功构造并推断出类型，但当前上下文期望另一个类型时，Lean 会尝试从“推断类型”到“期望类型”插入 coercion。

### 2. 需要 type / proposition，但当前不是 universe

有些位置要求一个 type 或 proposition，而当前 term 的类型本身不是 universe。此时 Lean 可能尝试插入“到 sort 的 coercion”。

### 3. 某个值被当作函数来调用，但它本身不是函数类型

若某个 term 出现在函数应用的位置，但它的类型并不是函数类型，Lean 会尝试插入“到函数的 coercion”。

## 显式请求 coercion

每一类自动插入场景都对应一个显式前缀操作符；因此，即使没有发生自动类型错误，也可以主动要求 Lean 插入对应 coercion。

## 用双重 type ascription 精确控制

嵌套 type ascription 提供了一种非常精确的方式来控制 coercion：

```lean
((e : α) : β)
```

这会先强制 `e` 被当作 `α`，然后再从 `α` coercion 到 `β`。因此它非常适合调试“Lean 到底想从哪转到哪”的问题。

## coercion 会被展开

一旦找到 coercion，Lean 会把用于找到它的实例展开并从最终 term 中移除；尽量不保留显式的 `Coe.coe` 之类调用。

这样做有两个重要目的：

- 让最终项更可读；
- 允许 coercion 通过包装函数来精确控制被 coercion 项的求值方式。

## 使用建议

- 调试类型不匹配时，先确认 Lean 期望的类型是什么，再判断是否真的应该靠 coercion 修复。
- 若 coercion 结果让行为难以理解，可用显式 `↑x` 或双重 type ascription 把路径写清楚。
- 自动 coercion 过多时会削弱可读性；公共 API 设计时应控制 coercion 数量与方向。