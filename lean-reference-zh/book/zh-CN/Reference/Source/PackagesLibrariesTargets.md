# package、library 与 target

> 对应英文：[Packages, Libraries, and Targets](https://lean-lang.org/doc/reference/latest/Source-Files-and-Modules/#The-Lean-Language-Reference--Source-Files-and-Modules--Packages-Libraries-and-Targets)，抓取日期：2026-06-16。

Lean 的 source file / module system 与更高层的构建概念相连：

- **package**：代码分发基本单位；
- **library**：一组模块化组织的 Lean 模块；
- **target**：Lake 中用户可请求构建的对象，例如 library、executable 或其它产物。

## 为什么这一节属于模块系统

文件、module、package、target 不是彼此独立的层：

- 文件路径决定 import 名；
- import 名决定模块边界；
- 模块集合构成 library；
- library / executable 等又构成 package 中的 target；
- Lake 根据这些 target 构建 `.olean`、可执行文件、缓存产物等。

## 直观关系

- 一个 `.lean` 文件是最小编译单元；
- 多个文件按 import 关系形成模块图；
- 若干模块根组织成 library；
- package 把 library、executable、依赖声明与构建配置放到一起；
- Lake 以 target 为粒度做构建。

## 使用建议

- 设计项目结构时，不要只想“文件怎么放”，还要想“哪些模块构成一个 library”、“哪些 target 对外暴露”；
- import 层级、package 边界和 target 设置应尽量一致；
- 避免让一个 target 同时承载过多不相关职责，否则后续缓存、构建和发布都会变复杂。