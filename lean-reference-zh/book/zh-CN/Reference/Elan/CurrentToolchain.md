# 当前 toolchain 的判定

> 对应英文：[Determining the Current Toolchain](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Managing-Toolchains-with-Elan/#The-Lean-Language-Reference--Build-Tools-and-Distribution--Managing-Toolchains-with-Elan--Selecting-Toolchains--Determining-the-Current-Toolchain)，抓取日期：2026-06-16。

Elan 会把 toolchain 与目录关联，并从当前工作目录开始向上寻找最近的配置来源。

## 判定顺序

某个目录的 toolchain 可能来自：

- `lean-toolchain` 文件；
- `elan override` 配置。

Elan 的查找规则是：

1. 从当前目录开始向父目录逐级向上找；
2. 若某目录同时有 override 和 `lean-toolchain` 文件，则 **override 优先**；
3. 更近的父目录优先于更远祖先目录；
4. 如果一直找不到目录级配置，就退回到 Elan 的默认 toolchain。

## `lean-toolchain` 文件

这是最常见的配置方式。它是项目根目录中的纯文本文件，只包含一行合法 toolchain identifier。

优点：

- 可提交进版本控制；
- 团队所有成员都能自动使用同一 Lean 版本；
- 升级只需改这一个文件。

## override

override 也会把 toolchain 关联到某目录及其子目录，但它存放在 Elan 自身配置中，而不是项目文件里。

适用场景：

- 本地临时测试；
- 用本地编译出的 Lean 测某个项目；
- 某些不适合提交给团队的个人设置。

## 推荐实践

- 共享项目优先用 `lean-toolchain`。
- override 主要用于本地实验，不要把它当团队协作机制。
- 若“为什么这个项目突然换版本了”很难解释，优先检查是否有本地 override。
