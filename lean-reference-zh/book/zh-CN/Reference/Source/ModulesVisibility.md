# module 与可见性

> 对应英文：[Modules and Visibility](https://lean-lang.org/doc/reference/latest/Source-Files-and-Modules/#The-Lean-Language-Reference--Source-Files-and-Modules--Modules-and-Visibility)，抓取日期：2026-06-16。

普通源文件与 `module` 文件的主要差别，在于它们如何暴露内容给后续 import 它们的文件。

## 非 module 文件

若文件头没有 `module` 关键字，那么它只是普通源文件：

- 其声明可供当前文件自身使用；
- 通过 import 引入时，不提供额外的 public/private 相位控制；
- 更适合作为简单代码组织单元。

## module 文件

若文件头以 `module` 开始，则该文件是 module。module 允许更精细地控制“哪些内容对导入者可见”。

当一个 module import 另一个 module 时，默认情况下：

- 被导入 module 的 **public scope** 会加入当前 module 的 **private scope**；
- 当前 module 的导入者**看不到**这些通过默认 import 引入的内容。

这意味着：默认 import 更像“我自己要用，但我不替下游重新导出”。

## import 修饰符

module 中可用的 import 修饰符有：

### `public`

把被导入 module 的 public scope 加入当前 module 的 public scope，因此当前 module 的导入者也能看到这些内容。

### `meta`

把被导入 module 的内容仅带到 **meta phase**。

### `all`

把被导入 module 的 **private scope** 也加入当前 module 的 private scope。

## 为什么要区分 public/private

这个区分有几个用途：

- 控制库对外暴露的接口面；
- 避免不稳定或内部辅助定义泄漏给下游；
- 允许一个 module 使用大量实现细节，同时只公开少数稳定定义。

## 相关兼容性选项

英文页列出了若干与旧行为兼容相关的选项，例如：

- `backward.privateInPublic`
- `backward.privateInPublic.warn`
- `backward.proofsInPublic`

这些选项用于迁移旧代码或维持历史行为。新代码通常应优先遵循当前 module 可见性语义，而不是依赖兼容性开关。
