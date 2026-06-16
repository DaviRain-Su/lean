# `#check`

> 对应英文：[Checking Types / `#check`](https://lean-lang.org/doc/reference/latest/Interacting-with-Lean/#hash-check)，抓取日期：2026-06-16。

`#check` 让 Lean elaborates 一个 term，并把其 type 输出到 message log。它是探索库、确认 API、检查 notation 实际含义时最常用的命令之一。

## 基本形式

```lean
#check term
#check_failure term
```

- `#check term`：显示 term 的 type。
- `#check_failure term`：断言该 term 无法通过 type check；常用于测试错误消息或文档示例。

## 典型用途

- 查看某个 constant、theorem、constructor 的精确 type；
- 确认 notation 最终对应什么函数或结构；
- 探索 type class method、namespace 中的 API；
- 在 proof 中确认局部表达式的 type 是否如预期。

例如：

```lean
#check Nat.succ
#check List.map
#check fun x : Nat => x + 1
```

## 与其他命令的区别

- `#check` 只关心 type，不运行程序。
- `#eval` 运行程序并显示结果。
- `#reduce` 观察 definitional reduction。
- `#synth` 专门请求 type class instance synthesis。

因此，当问题是“这到底是什么 type？”时，优先用 `#check`。

## `#check_failure`

`#check_failure` 适合：

- 文档里说明某种写法是错误的；
- 测试 parser/elaborator 是否拒绝某个坏例子；
- 配合 `#guard_msgs` 精确测试错误输出。

它不是简单地忽略错误，而是把“这里应当失败”本身当成测试目标。
