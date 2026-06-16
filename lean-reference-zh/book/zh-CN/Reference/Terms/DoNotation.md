# `do` 记法

> 对应英文：[do-Notation](https://lean-lang.org/doc/reference/latest/Terms/do--Notation/)，抓取日期：2026-06-16。

这一页本身也很短：它明确说明，`do` notation 的详细语义不在 `Terms` 章节里单独展开，而在 **Functors, Monads and do-Notation** 章节中说明。

## 为什么如此安排

虽然 `do` 是用户可以直接写下的 term 语法，但它的真正含义高度依赖：

- `Monad`
- `Bind`
- `Pure`
- 相关 `do` desugaring 规则

因此，把它和 monad 章节放在一起，更能反映它的真实语义来源。

## 在 `Terms` 章节中应该如何理解它

你可以把 `do` 看作：

- 一种高层 term 语法
- 它最终会被 elaboration 成 `bind`、`pure`、`let`、`match` 等组合
- 它本身不是 kernel 里的原始构造子

## 使用建议

- 想理解 `do` 的表面语法与它属于 term 这一事实时，看本页；
- 想真正理解 `do` 的执行顺序、monad 依赖与扩展方式，应继续看 monad 章节及 `Extending do-Notation`。