# universe 变量绑定

> 对应英文：[Universe Variable Bindings](https://lean-lang.org/doc/reference/latest/The-Type-System/Universes/#The-Lean-Language-Reference--The-Type-System--Universes--Polymorphism--Universe-Variable-Bindings)，抓取日期：2026-06-16。

Lean 支持显式绑定 universe 变量。除了把 level 直接写在名字后，如 `foo.{u,v}`，也可以先声明一组 universe 名称，再在后续定义中复用。

## `universe` 命令

```lean
universe u v w
```

它会把 `u`、`v`、`w` 作为当前作用域中的 universe 变量引入。之后你就可以在：

- 类型签名
- level expression
- 显式 universe 参数

中使用这些名字。

## 为什么需要显式绑定

自动 universe 推断大多数时候够用，但在以下场景中经常需要显式绑定：

- 定义右侧用了某个 universe 变量，而左侧 header 没显式出现它；
- 希望控制多个定义共享同一组 universe 参数；
- 想让代码更明确表达“这是一个 universe-polymorphic 构造”。

## 与 automatic implicit parameter 的区别

`universe` 绑定的是 **level variable**，不是普通 term 变量。它不会出现在值级别的局部上下文里，也不参与普通参数推断；它只影响类型所在 universe。

## 作用域

和普通名字绑定类似，`universe` 命令引入的变量也受作用域控制。若在某个局部块中声明 universe 名称，离开该块后它们就不再可见。

## 使用建议

- 只要 universe 参数已经开始出现在错误消息里，通常就值得把它们显式命名；
- 若某定义明显面向多 universe 复用，优先写清楚 `universe u v`，比完全依赖推断更可维护。