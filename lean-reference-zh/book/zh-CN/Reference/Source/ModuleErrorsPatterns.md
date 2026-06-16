# 模块系统错误与模式

> 对应英文：[Module System Errors and Patterns](https://lean-lang.org/doc/reference/latest/Source-Files-and-Modules/#The-Lean-Language-Reference--Source-Files-and-Modules--Module-System-Errors-and-Patterns)，抓取日期：2026-06-16。

Lean 的 module system 与文件路径、包根目录、import 名、public/private scope 和 build 产物都紧密耦合。因此常见问题往往不是“语法错”，而是“模块结构和工具链假设不一致”。

## 常见问题类型

- `import` 名与实际目录层级不对应；
- root directory 配置错误，导致同一文件在当前项目里对应不同 import 名；
- 旧代码对 public/private import 语义有不同假设；
- 依赖被导入了，但不在当前 scope 中可见；
- `.olean` 产物、缓存或 package 边界与源码布局不一致。

## 排查思路

1. 先确认项目根目录和 `srcDir`。
2. 再确认文件的 import 名应该是什么。
3. 检查 `import` 的模块名是否与磁盘层级匹配。
4. 检查是否误以为默认 import 会“重新导出”依赖。
5. 最后再怀疑缓存或构建产物问题。

## 模式层面建议

- 项目结构尽量保持“目录层级 = import 层级”；
- 不要把“某个模块当前刚好被别的模块重导出”当成稳定接口；
- 库边界处尽量明确哪些 import 是 public、哪些只是内部实现依赖；
- 迁移旧项目时，优先先让 import 路径和 package 边界清晰，再处理更细的 elaboration 问题。