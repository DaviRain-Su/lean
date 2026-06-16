# 控制 section scope

> 对应英文：[Controlling Section Scopes](https://lean-lang.org/doc/reference/latest/Namespaces-and-Sections/#scope-commands)，抓取日期：2026-06-16。

Lean 主要通过 `section`、`namespace`、`end` 和 `in` 来控制 section scope。

## `section`

```lean
section
  ...
end
```

它创建新的嵌套 scope，但不自动改变 current namespace、opened namespace 或 section variable 集合；在内部所做更改会在 `end` 时恢复。

具名形式：

```lean
section MySection
  ...
end MySection
```

若 section 名包含多个 component，则引入多个嵌套 section。名字主要用于可读性和匹配 `end`。

### section header modifier

section 还可以带 header modifier，例如：

```lean
section noncomputable
  ...
end
```

这会让 section 内所有定义都视为 `noncomputable`。类似地，也可看到：

- `@[expose]`
- `public`
- `meta`

这些主要在 module / 库设计中使用。

## `namespace`

```lean
namespace My.Namespace
  ...
end My.Namespace
```

`namespace` 同样创建新 scope，但会把 current namespace 改为给定名字（相对于外层 current namespace 解析）。作用域结束时恢复。

## `end`

- 不带参数的 `end`：关闭最近打开的匿名 section
- 带参数的 `end Name`：关闭最近打开的具名 section 或 namespace

当关闭 namespace 时，`end` 后的名字必须是当前 namespace 的后缀。

## `in`

`in` combinator 把某个 scope 修改限制到紧随其后的一个 command 或 expression：

```lean
open Nat in
#check succ
```

它适合把局部命名约定精确限制在最小范围内。

## 使用建议

- 想局部化影响时，优先 `in`；
- 想组织一段共享设置的代码时，用 `section`；
- 想给一组声明统一加 namespace 时，用 `namespace`；
- 长文件中频繁切 scope 时，具名 `section` / `namespace` 更易维护。