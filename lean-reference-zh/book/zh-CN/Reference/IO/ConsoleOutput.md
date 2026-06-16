# 控制台输出

> 对应英文：[Console Output](https://lean-lang.org/doc/reference/latest/IO/Console-Output/)，抓取日期：2026-06-16。

Lean 提供若干便捷函数，把文本写到标准输出或标准错误。它们都依赖 `ToString` instance；名字以 `-ln` 结尾的版本会在输出后自动追加换行符。

这些函数只暴露了标准 I/O stream 功能的一部分。若要直接从标准输入读一行，应组合使用 `IO.getStdin` 与 `IO.FS.Stream.getLine`。

## 基本函数

- `IO.print`：把值转成字符串并写到当前标准输出。
- `IO.println`：和 `print` 类似，但会追加换行。
- `IO.eprint`：写到当前标准错误。
- `IO.eprintln`：写到当前标准错误，并追加换行。

它们的共同点是：

- 参数类型不必是 `String`，只要有 `ToString` instance；
- 实际写到哪个 stream，由当前 `IO.getStdout` / `IO.getStderr` 决定；
- 因为标准输入/输出/错误都可以被重定向，所以这些函数也会自动遵从重定向后的环境。

## 何时用它们

适合：

- 小型脚本和示例；
- 教程、文档、命令行 demo；
- 快速调试 `IO` 程序。

如果需要更细粒度控制（例如手动 flush、从特定 handle/stream 读取或写入、捕获与重定向输出），应直接使用 `IO.FS.Handle` 或 `IO.FS.Stream` API。

## 与 `#eval` 的关系

在 `#eval` 中运行 `IO.println` 一类函数时，Lean 会把标准输出/错误重定向到 message log，因此你在编辑器中看到的是交互式消息，而不是外部终端输出。