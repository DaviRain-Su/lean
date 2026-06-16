# inductiveParamMismatch

> 对应英文：[About: inductiveParamMismatch](https://lean-lang.org/doc/reference/latest/Error-Explanations/About___--inductiveParamMismatch/)，抓取日期：2026-06-16。

错误码：`lean.inductiveParamMismatch`

含义：constructor 中出现 inductive type 时使用了无效参数。

严重性：Error。起始版本：4.22.0。

这个错误发生在 inductive type 的 parameter 在 declaration 中不 uniform。`inductive` 关键字后、冒号前出现的参数是 parameter；它们在所有 constructor type 中出现当前 inductive type 时必须完全相同。

如果某个参数必须随 constructor 改变，它不应是 parameter，而应放到冒号右侧作为 index。

## 典型例子

向量长度如果写成 parameter：

```lean
inductive Vec (α : Type) (n : Nat) : Type where
  | nil  : Vec α 0
  | cons : α → Vec α n → Vec α (n + 1)
```

这里 `n` 是 parameter，但 constructor 中出现了 `0` 和 `n + 1`，与固定参数 `n` 不一致，因此报错。

## 修复方向

把会变化的量移动到冒号右侧作为 index：

```lean
inductive Vec (α : Type) : Nat → Type where
  | nil  : Vec α 0
  | cons : α → Vec α n → Vec α (n + 1)
```

经验规则：整个 inductive family 固定不变的是 parameter；不同 constructor 或不同结果中会变化的是 index。
