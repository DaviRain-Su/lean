# section variable

> 对应英文：[Section Variables](https://lean-lang.org/doc/reference/latest/Namespaces-and-Sections/#section-variables)，抓取日期：2026-06-16。

section variable 是会自动加入声明参数列表的变量。它们让一组共享参数的声明不必在每个 header 中重复书写。

## `variable` 命令

```lean
variable {α : Type u}
variable (x : α)
variable [inst : C α]
variable [C α]
```

`variable` 后可使用与函数参数几乎同样的 binder 语法：显式、隐式、严格隐式、实例隐式都支持。

## 自动加入声明

对**非 theorem 声明**，若 declaration 中出现某个 section variable 名称，Lean 会把它加入参数列表；若该变量依赖别的变量，也会把依赖变量一并加上，并按声明顺序排在其他参数之前。

对 **theorem**，只有在 theorem statement 中真正出现的 section variable，才会被加入定理参数。这是为了避免修改 proof 体时意外改变 theorem statement。

## 修改绑定方式

已经声明过的 section variable 还可改变绑定方式，例如把显式变量改成隐式：

```lean
variable {x}
```

## `include` / `omit`

有时即使 section variable 没有在 theorem statement 中显式出现，你也希望它进入 theorem。此时可用：

- `include`
- `omit`

`include` 会把指定变量强制视为应加入后续 theorem；`omit` 则取消这种效果。它们通常和 `in` 组合使用，以限制影响范围。

## 使用建议

- 多个声明共享参数时，优先 `variable`，减少重复 header。
- theorem 中若参数传播看起来“少了”或“多了”，先检查 statement 里是否真的出现了这些变量，或是否用了 `include`。
- 共享设置很方便，但也会增加隐式背景；文件过长时要谨慎使用，以免读者难以看出某声明到底依赖哪些参数。