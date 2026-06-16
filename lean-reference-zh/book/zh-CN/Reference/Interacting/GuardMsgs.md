# `#guard_msgs`

> 对应英文：[Testing Output with `#guard_msgs`](https://lean-lang.org/doc/reference/latest/Interacting-with-Lean/#hash-guard_msgs)，抓取日期：2026-06-16。

`#guard_msgs` 用于测试后续 command 产生的消息是否符合预期。它常用于：

- 文档示例；
- 编译器 / elaborator / tactic 测试；
- 保证错误、警告、信息输出在升级时不会悄悄改变。

## 基本形式

```lean
#guard_msgs in
command
```

它会捕获 `command` 产生的 message，并与期望规范比较。

## 可控制内容

英文页列出了多种配置项，例如：

- `whitespace := exact | lax | normalized`
- `ordering := ...`
- `drop? all | info | warning | error`
- `guard_msgs.diff`

这些选项用于控制比较时：

- 是否严格比较空白；
- 是否要求消息顺序完全一致；
- 是否忽略某些类别的消息；
- 失败时如何显示 diff。

## 典型用途

### 测试错误信息

若某段代码应当报错，可以把它包进 `#guard_msgs`，并把预期错误文本写入测试文件。升级 Lean 后，如果错误消息变化，测试会失败，从而提醒维护者更新说明或修正实现。

### 测试 warning / info

除了错误，`#guard_msgs` 也适合测试：

- warning 是否出现；
- `#eval` / `#check` / `#print` 的输出是否稳定；
- tactic 在文档里的展示是否与预期一致。

## 与 `#check_failure` 的关系

- `#check_failure` 只测试“这段代码应当失败”；
- `#guard_msgs` 可进一步测试**失败时输出的具体内容**。

在需要精确锁定 message 内容时，应使用 `#guard_msgs`。
