# Meta phase

> 对应英文：[The Meta Phase](https://lean-lang.org/doc/reference/latest/Source-Files-and-Modules/#The-Lean-Language-Reference--Source-Files-and-Modules--Modules-and-Visibility--The-Meta-Phase)，抓取日期：2026-06-16。

Lean 区分普通声明与 **meta phase** 中使用的内容。meta phase 的代码主要服务于：

- tactic
- elaborator
- macro
- pretty-printer
- 编译期辅助逻辑

## 为什么需要单独的相位

有些代码只在编译期 / elaboration 期间使用，不应被当成普通运行时代码或逻辑核心接口的一部分。把这些内容限制在 meta phase，有助于：

- 分离“证明/程序本体”和“辅助生成逻辑”；
- 控制某些实现细节不被普通代码依赖；
- 让 module import 时只在需要处暴露元编程能力。

## `meta import`

在 module 中，`meta import` 用于把某模块内容导入当前 module 的 meta phase。这样可让 tactic 或 elaborator 使用这些定义，而不把它们当作普通运行时依赖暴露给下游。

## 何时会碰到它

普通 Lean 学习路径中，很多用户几乎不会手写 meta phase import。它主要出现在：

- Lean 内核 / 标准库实现；
- 元编程工具；
- tactic、macro、custom elaborator 开发；
- 更底层的语言扩展工程。

## 使用建议

- 普通数学与应用代码，通常不需要主动设计 meta phase 可见性；
- 做元编程库时，要明确哪些定义只是编译期工具，哪些应成为普通 API；
- 若某依赖只服务 tactic / elaboration，优先考虑把它限制在 meta phase。