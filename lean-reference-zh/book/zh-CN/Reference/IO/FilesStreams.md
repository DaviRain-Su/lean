# 文件、文件句柄与流

> 对应英文：[Files, File Handles, and Streams](https://lean-lang.org/doc/reference/latest/IO/Files___-File-Handles___-and-Streams/)，抓取日期：2026-06-16。

Lean 在所有受支持平台上提供一致的文件系统 API。本章的核心概念包括：

- **文件**：可持久保存数据并支持随机访问。
- **目录**：把名字映射到文件或子目录。
- **文件句柄**：对已打开文件的抽象引用，包含读写模式和当前游标。
- **路径**：访问文件的主要方式，由 `System.FilePath` 表示。
- **流**：比文件句柄更高层的抽象，可统一处理标准输入输出和内存缓冲流。

## 低层文件 API：`IO.FS.Handle`

最底层通过 `IO.FS.Handle.mk` 显式打开文件。句柄关闭没有单独的“close”命令；当最后一个引用被释放时，文件自动关闭。

句柄模式由 `IO.FS.Mode` 控制，常见构造子包括：

- `read`
- `write`
- `writeNew`
- `readWrite`
- `append`

常见操作：

- `read` / `readToEnd` / `readBinToEnd`
- `getLine`
- `write` / `putStr` / `putStrLn`
- `flush`
- `rewind`
- `truncate`
- `isTty`
- `lock` / `tryLock` / `unlock`

需要注意：

- EOF 不会自动关闭句柄；
- 读写往往是 buffered 的；
- `truncate` 前若不确定，应先 `flush`。

## 流：`IO.FS.Stream`

`IO.FS.Stream` 是用 Lean 实现的高层 POSIX-style stream 抽象。由于它是纯 Lean 结构，用户也能构造自己的 stream，并与标准库 stream 无缝协作。

常见字段和操作：

- `flush`
- `read`
- `write`
- `getLine`
- `putStr`
- `putStrLn`
- `isTty`

重要构造器：

- `IO.FS.Stream.ofHandle`：从文件句柄构造流。
- `IO.FS.Stream.ofBuffer`：从内存缓冲区构造流，可用于测试和 I/O 重定向。

## 路径：`System.FilePath`

路径由 `String` 表示，但平台差异很大：分隔符、大小写敏感性、可执行文件扩展名等都可能不同。为尽量可移植，应优先使用 Lean 提供的 path helper，而不是直接拼字符串。

常见 helper：

- `join` 或 `/`
- `normalize`
- `isAbsolute` / `isRelative`
- `parent`
- `components`
- `fileName`
- `fileStem`
- `extension`
- `withExtension`
- `exeExtension`
- `pathSeparator`

## 文件系统交互

英文页还提供大量文件系统操作，包括：

- `pathExists`、`isDir`
- `readDir`、`walkDir`
- `removeFile`、`rename`
- `removeDirAll`、`createDirAll`
- `withTempFile`、`withTempDir`
- `readFile`、`writeFile`
- `readBinFile`、`writeBinFile`
- `withFile`
- `realPath`

## 标准 I/O 与应用目录

同一页还包括：

- `getStdin` / `setStdin` / `withStdin`
- `getStdout` / `setStdout` / `withStdout`
- `getStderr` / `setStderr` / `withStderr`
- `withIsolatedStreams`
- `currentDir`
- `appPath`
- `appDir`

这些 API 共同构成 Lean 程序与操作系统文件和 I/O 环境交互的基础。