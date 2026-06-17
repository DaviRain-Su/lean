# `lake script`

> 对应英文：[Lake Scripts](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/#scripts)，抓取日期：2026-06-16。

Lake 把脚本当作一类“项目内置命令”。CLI 里与脚本相关的三个高频命令是：

- `lake script list`
- `lake script run`
- `lake script doc`

## `lake script list`

别名：

- `lake scripts`

作用：列出当前 workspace 中可用的脚本。

## `lake script run`

```bash
lake script run [[package/]script [args...]]
```

别名：

- `lake run`

作用：运行某个脚本，并把后续参数传给它。

若直接写裸的 `lake run`，则会运行 root package 的默认脚本（不带额外参数）。

## `lake script doc`

```bash
lake script doc script
```

作用：打印该脚本的 documentation comment。它适合在不读源码的情况下快速查看脚本的用途。

## 何时用脚本而不是 target

脚本更适合：

- 管理任务；
- 生成辅助文件；
- 运行开发工具；
- 包装多步工作流。

若目标是产出某个可缓存 build artifact，则通常更应考虑 target / facet。