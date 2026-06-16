# IO

> 对应英文：[IO](https://lean-lang.org/doc/reference/latest/IO/)，抓取日期：2026-06-16。

Lean 是一门纯函数式编程语言。虽然 Lean 代码在运行时严格求值，但 type checking 期间使用的求值顺序，尤其是检查 definitional equality 时的求值顺序，在形式上没有指定；Lean 会使用许多改进性能的 heuristic，而这些 heuristic 可能随版本变化。

这意味着，如果简单地把会产生副作用的操作（例如 file I/O、exception 或 mutable reference）加入普通 term，就会得到 effect 顺序未指定的程序。type checking 期间，即使带有 free variable 的 term 也会被 reduce，这会让副作用更难预测。最后，Lean 逻辑的基本原则之一是：函数就是把 domain 中每个元素映射到 range 中唯一元素的函数。加入 console I/O、任意 mutable state 或 random number generation 等副作用，会违反这一原则。

因此，可能产生副作用的程序具有特殊 type，通常是 `IO α`，用来把它们和纯函数区分开。

## 逻辑意义

从逻辑角度看，`IO` 描述的是副作用之间的 sequencing 和 data dependency。许多基本副作用，例如读取文件，从 Lean 逻辑角度看是 opaque constant。另一些则由逻辑上等价于运行时版本的代码指定。

运行时，compiler 会生成普通可执行代码。也就是说，`IO` 既在逻辑上保持纯函数式语义，又在运行时提供与操作系统交互的能力。

## 为什么需要 `IO α`

`IO α` 可以理解为一个会在执行时产生副作用并最终返回 `α` 的 action。构造 `IO α` 本身并不会立即执行副作用；只有当它作为程序入口的一部分运行，或被 `#eval` 等机制执行时，副作用才会发生。

`do` notation 为 `IO` 程序提供命令式外观：

```lean
def main : IO Unit := do
  IO.println "Hello, world!"
```

但其本质仍是 monadic sequencing：每一步 action 的执行顺序和依赖由 `IO` 的 `Monad` instance 表达。

## 本章覆盖范围

英文参考手册随后把本章展开为：

- 21.1 Logical Model
- 21.2 Control Structures
- 21.3 Console Output
- 21.4 Mutable References
- 21.5 Files, File Handles, and Streams
- 21.6 System and Platform Information
- 21.7 Environment Variables
- 21.8 Timing
- 21.9 Processes
- 21.10 Random Numbers
- 21.11 Tasks and Threads

这些小节描述 `IO` 的逻辑模型、控制结构、终端输出、可变引用、文件与流、系统信息、环境变量、计时、进程、随机数以及 task/thread 支持。