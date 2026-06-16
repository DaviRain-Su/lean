# 结构体与构造子

> 对应英文：[Structures and Constructors](https://lean-lang.org/doc/reference/latest/Terms/Structures-and-Constructors/)，抓取日期：2026-06-16。

这一页本身非常短。它主要起导航作用：提醒读者，匿名构造子和 structure instance syntax 在各自专门章节中说明，而不是在这里展开。

## 这意味着什么

如果你想了解：

- 如何用匿名构造子快速构造某个 structure 或 inductive 值；
- 如何使用 structure instance 语法按字段名构造值；
- 这些语法如何与 elaboration、projection、field notation 互动；

就应继续去对应的专门章节，而不是把这里当成完整说明页。

## 与 term 章节的关系

之所以把它列在 `Terms` 下面，是因为：

- 它们都属于用户可以直接写下的 term 语法；
- 构造子和 structure instance 最终都会被 elaboration 成普通 Lean 核心项；
- 这些语法对日常编程和证明都非常常见。

## 使用建议

- 需要按位置传参时，优先用普通构造子调用；
- 需要按字段名组织值时，优先用 structure instance 语法；
- 若某写法看起来像 term 语法糖，却不确定它最终展开为什么核心形式，可结合 `#print`、`#check` 和 elaboration 相关章节理解。