# Lake script

> 对应英文：[Scripts](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/#lake-scripts)，抓取日期：2026-06-16。

Lake 除了构建 Lean 代码，还支持 **script**。script 用于封装开发工作流中的管理任务、查询任务或自动化任务，而不一定对应某个可发布 artifact。

## script 与 build target 的区别

- **build target**：主要目标是产生可复用 artifact。
- **script**：主要目标是执行某个开发或维护动作。

script 更像“项目内置命令”。

## 常见命令

- `lake script list`：列出可用脚本。
- `lake script run <name>`：运行脚本。
- `lake script doc <name>`：查看脚本文档。

## 适合写成 script 的任务

- 项目诊断；
- 生成辅助文件；
- 清洗或迁移配置；
- 包装多个 Lake / Lean 命令；
- 团队内部工具入口。

## 配置形式

Lake 既支持在 Lean format 中声明 script，也有 `Lake.ScriptM` 作为脚本 API 基础。这样脚本既能访问 Lake 环境，又能复用项目配置、依赖图和路径信息。

## 建议

- 如果任务目的是“执行一次动作”，优先考虑 script；
- 如果任务目的是“产出某种可缓存构建结果”，优先考虑 target / facet。
