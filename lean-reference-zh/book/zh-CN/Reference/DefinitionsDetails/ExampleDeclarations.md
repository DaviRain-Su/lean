# example 声明

> 对应英文：[Example Declarations](https://lean-lang.org/doc/reference/latest/Definitions/Example-Declarations/)，抓取日期：2026-06-16。

`example` 是一种匿名声明：它会被完整 elaboration，但随后被丢弃，不进入全局环境。

## 作用

`example` 很适合：

- 在开发时做增量测试；
- 展示某种写法确实可以通过 type check；
- 在文档中给出可机器检查的示例；
- 验证某个 theorem / tactic / notation 是否按预期工作。

## 语法

```lean
example sig := term
```

和 `def` / `theorem` 类似，也支持：

- pattern matching 风格
- `where` 风格

但它没有声明名，因此 elaboration 成功后不会向环境导出新常量。

## 为什么有用

相比写具名 `theorem` 或 `def`：

- 不会污染命名空间；
- 不需要为一次性验证发明名字；
- 适合教程、测试文件和探索式开发。

## 与 `#check` / `#eval` 的区别

- `#check`：只检查类型。
- `#eval`：运行表达式。
- `example`：要求你真正构造一个满足目标类型的 term / proof，并让 Lean 完整 elaboration 它。

所以，当你想确认“这个 proof / term 真的成立”而又不想保留名字时，`example` 最方便。

## 使用建议

- 文档示例和单次实验优先 `example`。
- 若这个内容后续还要被引用、重写或导出，改用具名 `theorem` / `def`。
- 测试文件里可大量使用 `example`，保持环境干净。