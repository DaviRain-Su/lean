# `open` 声明

> 对应英文：[Open Declarations](https://lean-lang.org/doc/reference/latest/Namespaces-and-Sections/#Lean___Parser___Command___open)，抓取日期：2026-06-16。

`open` 会把某个 namespace 的内容带入当前 section scope，使其名称可在不加前缀时直接使用。

## 打开整个 namespace

```lean
open Some.Namespace
```

这会把该 namespace 中的非 `protected` 名称带入当前作用域。

如果写成一串名字：

```lean
open A B C
```

每个 namespace 都会相对于当前已打开的 namespace 解析，并在处理下一个前先真正打开。

## `hiding`

```lean
open Some.Namespace hiding foo bar
```

这表示打开整个 namespace，但排除列出的名称。与“打开整个 namespace”不同，这里给出的 namespace 必须能唯一解析。

## `renaming`

```lean
open Some.Namespace renaming foo → foo', bar → bar'
```

允许把打开进来的名字在当前 scope 中改名。ASCII 箭头 `->` 也可替代 `→`。

## 限制性打开

```lean
open Some.Namespace (foo bar)
```

只把列出的名字带入作用域，而不是整个 namespace。所有列出的名字都必须能在候选 namespace 中唯一解析。

## `open scoped`

```lean
open scoped Some.Namespace
```

只打开该 namespace 中的 **scoped attribute、instance 和 syntax**，不把普通名称带入作用域。

这在 notation、instance 或 attribute 应按局部约定启用时很重要。

## 使用建议

- 想降低限定名前缀噪音时用 `open`；
- 公共文件中要控制污染范围，优先 `open ... (...)` 或 `open scoped ...`；
- 只为了 notation / instance 生效时，不要顺手把普通名字也带进来。