# coercion 到函数类型

> 对应英文：[Coercing to Function Types](https://lean-lang.org/doc/reference/latest/Coercions/Coercing-to-Function-Types/)，抓取日期：2026-06-16。

另一类没有明确 expected type 的场景，是**函数应用位置**：当某个 term 被写成 `f x`，但 `f` 的类型本来不是函数类型时，Lean 会尝试把它 coercion 成函数。

## 为什么这是单独机制

函数位置常涉及：

- dependent function type
- implicit parameter
- 参数间的信息流

因此，不能简单靠“整个应用的 expected type + 每个参数局部类型”反推出所需函数类型。Lean 为此提供了专门的 class：`CoeFun`。

## `CoeFun`

`CoeFun α γ` 的第二个参数不是“某个固定函数类型”，而是一个根据值本身计算目标函数类型的函数：

- `γ : α → Sort v`

也就是说，目标函数类型本身可以依赖被 coercion 的值。

## 不参与普通链式函数 coercion

在“把某个值当函数调用”的时候，`CoeFun` 本身不再继续和其它函数 coercion 链接；它主要是专门修复“`f` 不是函数，却出现在函数位置”这一类错误。

不过，`CoeFun` 实例仍可在普通 coercion 插入中作为 `CoeOut` 使用。

## 显式语法：`⇑ t`

```lean
⇑ t
```

显式请求“把 `t` 当函数”。这通常用于调试函数 coercion，或让意图更清晰。

## 典型用途

- 某个结构体封装了函数，但想直接像函数一样调用它；
- 某个对象在不同值下应表现为不同函数类型；
- API 想提供“对象可调用”风格语法。

## 使用建议

- 若只是想暴露一个普通字段函数，先考虑直接显式访问字段，而不是引入 `CoeFun`。
- 只有在“这个对象从用户视角就应该像函数”时，再考虑 `CoeFun`。
- 依赖值决定函数类型虽然强大，但也会增加可读性成本。