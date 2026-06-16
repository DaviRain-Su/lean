# 运行时代码

> 对应英文：[Run-Time Code](https://lean-lang.org/doc/reference/latest/Run-Time-Code/)，抓取日期：2026-06-16。

编译后的 Lean 代码会使用 Lean runtime 提供的服务。runtime 包含高效、低层的 primitive，用来弥合 Lean 语言与受支持平台之间的差距。它提供的服务包括内存管理、任务调度、内建类型的高效表示和 primitive operator。

## 内存管理

Lean 不要求程序员手动管理内存。需要保存某个值时会分配空间；当某些值不再可达，也就不再相关时，它们会被释放。

具体来说，Lean 使用 reference counting。每个已分配对象都会维护一个 incoming reference count。compiler 会在生成的代码中插入对内存管理例程的调用，用来分配内存并修改 reference count。这些例程由 runtime 提供；runtime 也提供编译后代码中表示 Lean value 的数据结构。

reference counting 的结果是：许多值可以在最后一次使用后立即释放，而不需要全局 garbage collection pause。另一方面，compiler 和 runtime 必须精确维护引用计数，尤其是在函数调用、结构体字段、数组更新和异常路径中。

## 多线程执行

`Task` API 提供编写 parallel 和 concurrent code 的能力。runtime 负责把 Lean task 调度到操作系统线程上执行。

这意味着用户层 Lean 程序可以通过 `Task` 等接口表达并行工作，而不需要直接管理底层线程调度。runtime 会负责将这些 task 映射到底层平台的执行资源。

## Primitive operator

出于效率原因，许多内建 type 有特殊运行时表示，例如：

- `Nat`
- `Array`
- `String`
- 固定位宽整数

runtime 为这些 type 的 primitive operator 提供实现，并利用它们的优化表示。例如，小自然数可以有更紧凑的表示，数组和字符串可以使用专门布局，固定位宽整数可以映射到底层机器操作。

Lean 有许多 primitive operator。它们不会集中在本章列完，而是在 Basic Types 下各自对应的章节中说明。

## 后续小节

英文参考手册随后把本章展开为：

- 12.1 Boxing
- 12.2 Reference Counting
- 12.3 Multi-Threaded Execution
- 12.4 Foreign Function Interface