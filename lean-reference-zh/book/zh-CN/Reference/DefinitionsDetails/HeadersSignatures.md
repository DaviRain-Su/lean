# 头部与签名

> 对应英文：[Headers and Signatures](https://lean-lang.org/doc/reference/latest/Definitions/Headers-and-Signatures/)，抓取日期：2026-06-16。

声明的 header 由两部分组成：

- 要声明/定义的名字
- 这个名字的签名（参数与结果类型）

Lean 在不同种类的声明中都尽量复用同一套 header / signature 书写规则。

## 声明名

大多数声明以 `declId` 开头，也就是一个可选带 universe 参数的名字：

- 普通形式：`ident`
- 带 universe 参数：`ident.{u, v, ...}`

这些 universe 参数名在这里是绑定出现。

`example` 没有声明名；某些 `instance` 也可以省略名字。

## 签名

signature 说明：

- 有哪些参数
- 结果类型是什么

基本形态是：

- 若干参数
- 后接冒号 `:`
- 再后接结果类型 term

某些声明允许省略结果类型，此时 header 只有参数，类型由 elaboration 尝试恢复。

## 参数的三种表面形式

### 1. 裸 identifier

只写参数名，不写类型。类型需要由 elaboration 推断。

### 2. `_`

匿名参数，同样需要 elaboration 推断类型。

### 3. bracketed binder

最完整的参数写法。它可指定：

- 名字
- 类型
- 是否显式/隐式/严格隐式/实例隐式
- 默认值
- 自动 tactic 生成值

## bracketed binder 细分

### 显式参数

```lean
(x y : α)
```

### 可选参数 / 自动参数

```lean
(x : α := t)
```

如果右侧是普通 term，就是 optional parameter；如果右侧位置放的是 tactic script，则表示 automatic parameter。

### 普通隐式参数

```lean
{x : α}
```

调用点若不显式提供，会由 unification 尝试补出。

### 严格隐式参数

```lean
⦃x : α⦄
```

只有在后续参数也被提供时，Lean 才尝试自动补它。

### 实例隐式参数

```lean
[inst : C α]
[C α]
```

由 type class synthesis 自动补出。

## 参数作用域

这些参数名：

- 在结果类型中可见；
- 在声明体中也可见。

也就是说，它们既属于函数类型的一部分，也属于实现体的局部作用域。

## automatic implicit parameter

Lean 默认会把某些“本来未绑定、但看起来可以推断”的名字自动插入为隐式参数。这就是 automatic implicit parameter 机制。

特点：

- 它发生在 section variable 插入之后；
- 生成的名字若不是用户显式写出的，通常带有不可引用的标记（如匕首）；
- 是否启用、启用到什么程度，由两个选项控制：
  - `autoImplicit`
  - `relaxedAutoImplicit`

其中 `relaxedAutoImplicit = false` 时，自动插入会保守得多，只接受“单字符加数字”这一类名字模式。

## 使用建议

- 公共 API 优先写完整、明确的参数类型，不要过度依赖自动推断。
- 调试 header 行为异常时，先检查是不是 automatic implicit parameter 在工作。
- 若要让调用点稳定、可读，谨慎区分显式参数、隐式参数和实例隐式参数。