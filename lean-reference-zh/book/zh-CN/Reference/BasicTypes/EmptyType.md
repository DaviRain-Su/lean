# Empty 类型

> 对应英文：[The Empty Type](https://lean-lang.org/doc/reference/latest/Basic-Types/The-Empty-Type/)，抓取日期：2026-06-16。

`Empty` 表示“不可能存在的值”。它是一个**没有任何构造子**的归纳类型。

## Empty 与 Unit 的区别

- `Unit`：恰好有一个值，用于表示“没有额外信息”。
- `Empty`：根本没有值，用于表示“这条路径不可能发生”。

因此：

- `Unit` 适合函数“返回 nothing”；
- `Empty` 适合表达 unreachable code path 或逻辑矛盾。

## universe-polymorphic 版本

与 `Unit` / `PUnit` 类似，`Empty` 也有一个 universe-polymorphic 版本：

- `Empty`
- `PEmpty`

通常优先使用 `Empty`；只有真的需要更一般的 universe 行为时，才使用 `PEmpty`。

## `Empty.elim`

由于 `Empty` 没有构造子，一旦上下文中真的拿到了一个 `h : Empty`，就代表进入了不可能分支。因此可以从它推出任意结果：

- `Empty.elim`
- `PEmpty.elim`

这可以被看作“由不可能前提出发，任意命题都成立”的程序化形式，也可看作编译器帮助你确认某分支 unreachable。

## 典型使用场景

- 描述某些泛型结构中“不允许出现”的参数位置；
- 在 pattern matching 中消去不可能情况；
- 作为逻辑矛盾的承载类型；
- 辅助表明某 API 某路径绝不会返回值。

## 使用建议

- 想表达“不可能发生”时，用 `Empty` 而不是 `Unit`。
- 进入 impossible branch 后，尽快用 `Empty.elim` 结束该分支，不要继续书写伪造逻辑。
- 若目标本身是 proposition，也可直接用 `False`；若需要的是普通 `Type` 中的不可能值，则用 `Empty` 更自然。