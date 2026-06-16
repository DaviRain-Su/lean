# section scope

> 对应英文：[Section Scopes](https://lean-lang.org/doc/reference/latest/Namespaces-and-Sections/#scopes)，抓取日期：2026-06-16。

每个 Lean module 都有一个 **section scope**。许多 command 都会修改当前 section scope；`namespace`、`section` 以及 `in` combinator 则会创建嵌套 scope。

## scope 中跟踪什么

英文页指出，section scope 主要跟踪：

- **current namespace**
- **opened namespaces**
- **compiler options**
- **section variables**

换言之，section scope 决定了：

- 新声明会落在哪个 namespace
- 哪些名字可以无前缀直接用
- 哪些局部约定、instance、syntax 正在生效
- 哪些变量会自动传播到声明头里

## 为什么重要

很多“这段代码在这里能编过、移出去就不行”的现象，本质上都来自 section scope 差异。例如：

- 某 namespace 在这里被打开了
- 某 option 在这里被局部改了
- 某 section variable 在这里自动传播

## 使用建议

- 调试名字解析问题时，不要只看源码字面，要看当前 scope 状态；
- 写库时，尽量让 scope 局部化，避免把过多假设泄漏到大文件后面；
- 若某段代码依赖细微 scope 约定，可考虑用 `in` 缩小其影响范围。