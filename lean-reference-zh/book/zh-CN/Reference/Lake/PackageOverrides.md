# Lake package override

> 对应英文：[Package Overrides](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/#package-overrides)，抓取日期：2026-06-16。

package override 允许在 workspace 中临时或局部地替换某个依赖 package 的来源、路径或版本解析结果。它的核心目标是：在不永久修改上游声明的前提下，对依赖进行开发、调试或实验。

## 适用场景

- 本地调试某个依赖 package；
- 暂时把远程 Git 依赖切换到本地路径；
- 在上游修复尚未发布前，先在当前项目里试验补丁；
- 多个 package 联调时，让根工作区优先使用一份本地 checkout。

## 使用时的注意点

override 会改变依赖解析结果，因此应明确区分：

- **项目正式依赖**：应体现在 `lakefile` / `lake-manifest.json` 中；
- **本地开发覆盖**：应尽量局部、可撤销，避免误提交。

## 风险

- 若团队成员没有相同 override，本地构建结果可能与 CI 不同；
- 若 override 依赖未同步到 manifest，调试结束后可能难以复现；
- 覆盖多个依赖时，容易造成“本地能过、别人不能过”的状态。

## 建议

- override 主要用于临时开发和联调，不作为长期依赖管理手段；
- 调试完成后，要么回到正式依赖，要么把需要的变更合并到真正依赖源并更新 manifest；
- 在 bug 报告或协作说明里显式写出当前是否启用了本地 override。
