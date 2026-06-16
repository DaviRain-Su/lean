# scoped attribute

> 对应英文：[Scoped Attributes](https://lean-lang.org/doc/reference/latest/Attributes/#The-Lean-Language-Reference--Attributes--Scoped-Attributes)，抓取日期：2026-06-16。

很多 attribute 都可以带作用域，这决定它们的效果：

- 只在当前 section scope 生效；
- 在打开某个 namespace 时生效；
- 或在所有导入该模块的地方全局生效。

## 三种常见作用域

### 默认：全局

没有额外 scope modifier 时，attribute 是全局的。只要定义它的模块被传递导入，其效果就存在。

### `local`

```lean
attribute [local simp] foo
```

只在当前 section scope 内生效。离开该 scope 后就恢复。

### `scoped`

```lean
attribute [scoped simp] foo
```

只要建立它的 namespace 被打开，该 attribute 效果就生效。

## 为什么重要

scoped attribute 的意义在于：

- 可以让不同局部约定和平共处；
- 不必把所有自动化规则都做成全局默认；
- 让用户通过 `open scoped ...` 显式选择一组局部语法、instance 或自动化行为。

这套机制也和 syntax extension、type class instance 的 scoped 控制共享一套词汇。

## 使用建议

- 会污染全局行为、但对某一领域局部很自然的规则，优先考虑 `scoped`。
- 只在某小段证明或某文件局部使用的规则，优先 `local`。
- 真正稳定、希望下游默认继承的规则，才使用全局 attribute。