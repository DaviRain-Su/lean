# 函数类型

> 对应英文：[Function Types](https://lean-lang.org/doc/reference/latest/Terms/Function-Types/)，抓取日期：2026-06-16。

Lean 的函数类型不仅描述 domain 和 codomain，还告诉 elaborator：哪些参数要靠 unification 自动发现，哪些参数通过 type class synthesis 补齐，哪些参数有默认值，哪些参数应由 tactic 自动构造。函数类型语法也支持对 curry 风格函数做简写。

## 基本形式

dependent function type：

```lean
(x : α) → β x
```

non-dependent function type：

```lean
α → β
```

后者本质上是前者的特例：参数名不在结果类型中出现。

## Curried function type

多个同类型参数可以在一组括号内写出：

```lean
(x y z : α) → β
```

这等价于嵌套写法：

```lean
(x : α) → (y : α) → (z : α) → β
```

## 不同 binder 形式

### 显式参数

```lean
(x : α) → β
```

### Optional parameter

```lean
(x : α := default) → β
```

若调用时未提供该参数，Lean 会插入默认值。

### Automatic parameter

```lean
(x : α := by tacticSeq) → β
```

若调用时未提供该参数，Lean 会执行给定 tactic script 生成该参数。

### 普通 implicit parameter

```lean
{x : α} → β
```

Lean 通过 unification 自动推断参数值。

### Instance implicit parameter

```lean
[inst : C α] → β
```

或匿名形式：

```lean
[C α] → β
```

Lean 通过 type class synthesis 合成该参数。

### Strict implicit parameter

```lean
⦃x : α⦄ → β
```

它与普通 implicit parameter 类似，但 Lean 仅在后续显式参数出现时才尝试推断该参数。

## 为什么这些 binder 很重要

这些 binder 决定了**调用点**如何被 elaboration：

- implicit 参数靠 unification；
- instance implicit 参数靠 instance synthesis；
- optional 参数可自动插入默认值；
- automatic 参数可自动运行 tactic 填补。

因此，函数类型既是逻辑对象，也是 elaboration 指令。
