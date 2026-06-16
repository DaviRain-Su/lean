# 模块头

> 对应英文：[Headers](https://lean-lang.org/doc/reference/latest/Source-Files-and-Modules/#The-Lean-Language-Reference--Source-Files-and-Modules--Structure--Headers)，抓取日期：2026-06-16。

source file 由文件头和一串 command 组成。文件头列出：在当前文件 elaboration 之前，哪些 module 需要先被 elaboration 与导入。

## 基本形态

文件头由：

- 可选的 `module` 关键字
- 若干 `import` 语句

组成。

如果文件头以 `module` 开始，该源文件会被称为 module。module 可以更精细地控制对客户端暴露的信息。

## `prelude`

还有一种特殊头部形式带 `prelude`：

- 它只应出现在 Lean 自身源码中；
- 表示该文件属于 Lean prelude 的实现；
- 不应在普通 Lean 项目中使用。

prelude 中的代码会成为“无需显式 import 也可直接使用”的基础环境的一部分。

## `import`

普通源文件都可以写：

```lean
import Some.Module
```

这会导入指定 Lean 文件，使：

- 该文件中的声明可见；
- 其传递导入的内容也可见。

## 文件名与 namespace 不是同一回事

source file 名称不一定对应 namespace。导入某个文件不会自动改变当前打开的 namespace 集合；一个文件也可以向任意 namespace 添加名称。

## import 名如何转成文件名

Lean 会把 import 名中的 `.` 变成目录分隔符，并追加 `.lean` 或 `.olean`，再到 include path 中查找对应文件。

## 使用建议

- 普通项目不要写 `prelude`；
- `import` 写“逻辑模块名”，不要手工写磁盘路径；
- 若模块找不到，优先检查 root directory、package 配置和文件层级是否一致。