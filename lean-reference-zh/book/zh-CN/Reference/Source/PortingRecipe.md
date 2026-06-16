# 迁移旧文件的配方

> 对应英文：[Recipe for Porting Existing Files](https://lean-lang.org/doc/reference/latest/Source-Files-and-Modules/#The-Lean-Language-Reference--Source-Files-and-Modules--Module-System-Errors-and-Patterns--Recipe-for-Porting-Existing-Files)，抓取日期：2026-06-16。

当把旧代码迁移到新的 module 语义、package 布局或新版本 Lean 时，最稳妥的做法不是“一次性大改”，而是按层次收敛。

## 推荐顺序

1. **确定根目录与包布局**
   - 先明确 `srcDir`、package 根和 import 根。
2. **修正 import 名**
   - 让每个文件的 import 与实际路径完全对应。
3. **修正 public/private 假设**
   - 不要再依赖旧行为隐式暴露导入模块内容。
4. **单文件过 elaboration**
   - 逐个修正 `unknown identifier`、可见性和 namespace 问题。
5. **最后处理缓存与构建产物**
   - 确认不是 `.olean` / Lake cache 导致的假象。

## 迁移时的经验规则

- 先修模块边界，再修 tactic / proof；
- 对可见性问题，宁可显式 import / 显式限定名，也不要靠偶然重导出；
- 迁移完成后，再考虑做目录整理和接口美化。

## 目标

迁移的最终目标不是“刚好能编译”，而是：

- import 层级清晰；
- package 边界清晰；
- 下游依赖关系稳定；
- 不再依赖旧兼容选项或隐式可见性行为。