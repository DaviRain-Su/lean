# Attribute

> 对应英文：[Attributes](https://lean-lang.org/doc/reference/latest/Attributes/)，抓取日期：2026-06-16。

attribute 是 declaration 上一组可扩展的编译期注解。attribute 可以作为 declaration modifier 添加，也可以用 `attribute` command 添加。

attribute 可以把信息与 declaration 关联到编译期表中，例如自定义 simp set、macro 和 instance；也可以对 definition 施加额外要求，例如当其 type 不是 type class 时拒绝；还可以生成额外代码。和 term、command、tactic 的 macro 与自定义 elaborator 一样，attribute 的语法类别 `attr` 被设计为可扩展的，并且存在一张表，把每个 extension 映射到解释它的编译期程序。

attribute 会以 attribute instance 的形式应用。attribute instance 由可选 scope indicator 和具体 attribute 组成。它既可以出现在 declaration modifier 中，也可以出现在独立的 `attribute` command 中。

```lean
@[attrInstance, ...]
def name := ...
```

`attrKind` 是可选的 attribute scope keyword，即 `local` 或 `scoped`。它们控制 attribute 效果的可见性。attribute 本身则来自可扩展语法类别 `attr`。

attribute 系统非常强大：它们可以把任意信息与 declaration 关联起来，也可以生成任意数量的辅助定义。这带来一些设计取舍：存储信息需要空间，读取信息需要时间。因此，有些 attribute 只能应用于定义该 declaration 的 module 中。这样在大型项目中查找会快得多，因为不需要检查所有 module 的数据。每个 attribute 自行决定如何存储 metadata，以及在具体用例中如何平衡灵活性与性能。

## 9.1 作为 modifier 的 attribute

attribute 可以作为 declaration modifier 加到 declaration 上。它们放在 documentation comment 和 visibility modifier 之间。

```lean
/-- doc comment -/
@[simp]
theorem example_thm : ... := ...
```

语法上，attribute modifier 是：

```lean
@[attrInstance,*]
```

## 9.2 `attribute` command

`attribute` command 可用于修改已有 declaration 的 attribute。常见用途包括：

- 给已有 declaration 添加 `instance`，在当前 scope 中注册为 instance；
- 用 `simp` 或 `ext` 把已有 theorem 标记为 simp lemma 或 extensionality lemma；
- 临时从默认 simp set 中移除某个 simp lemma。

语法上：

```lean
attribute [attrInstance, ...] ident
```

`ident` 是要修改 attribute 的名称。

除了添加 attribute instance，有些 attribute 也可以移除；这称为 erasing attribute。移除 attribute 时在名称前加 `-`：

```lean
attribute [-simp] some_theorem
```

并非所有 attribute 都支持 erasure。

## 9.3 Scoped attribute

许多 attribute 可以应用在特定 scope 中。scope 决定 attribute 的效果只在当前 section scope 可见、在打开当前 namespace 的 namespace 中可见，还是处处可见。这些 scope 标记也用于控制 syntax extension 和 type class instance。每个 attribute 负责定义这些词对自身效果的精确含义。

### 全局 attribute

默认情况下，attribute 是 globally scoped。只要建立它的 module 被传递导入，它就生效。全局 attribute 没有额外 scope modifier。

```lean
@[simp]
theorem add_zero' : ... := ...
```

### `local`

`local` attribute 只在建立它的 section scope 范围内生效。

```lean
attribute [local simp] some_theorem
```

### `scoped`

`scoped` attribute 在建立它的 namespace 被打开时生效。

```lean
attribute [scoped simp] some_theorem
```

`scoped` 对 notation、instance 和 attribute 尤其有用：库可以把某些局部约定附着到 namespace 上，用户通过 `open scoped Namespace` 明确启用，而不必打开普通名称。