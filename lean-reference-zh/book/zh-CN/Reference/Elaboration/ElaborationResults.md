# elaboration 结果

> 对应英文：[Elaboration Results](https://lean-lang.org/doc/reference/latest/Elaboration-and-Compilation/#elaboration-results)，抓取日期：2026-06-16。

Lean 核心类型论不直接包含 pattern matching 或递归定义。高层写法必须在 elaboration 之后被转换为 kernel 可接受、compiler 可使用的形式。

## pre-definition

term elaboration 期间，pattern matching 会先被替换成辅助 matcher function。此时结果已经是核心语言风格，但可能仍保留“当前定义对自身的递归调用”。

这种“已经 elaborated 到核心语言、但仍含 recursion”的定义称为 **pre-definition**。

## 双重去向：compiler 与 kernel

同一个 pre-definition 会同时送往：

- **compiler**：保留 recursion，用于生成高效可执行代码；
- **kernel**：继续转换，把 recursion 消去成 recursor、well-founded recursion 或 partial fixpoint 机制。

这两条路径拆开有几个原因：

- `partial` function 能被 compiler 接受，但 kernel 只把它当 opaque constant；
- `unsafe` function 可完全绕过 kernel 的可执行部分约束；
- 编译性能模型和 kernel 中的可约定义不完全一致。

## 递归函数的几种情况

- **structural recursion**：优先翻译为 type 自身的 recursor；定义方程通常 definitionally 成立。
- **well-founded recursion**：更灵活，但 kernel 中求值通常更慢，定义方程往往只 propositionally 成立。
- **partial fixpoint**：用于部分函数语义。

## equational lemma

为了统一接口并证明转换正确，elaborator 会生成一系列 equational lemma，把最终定义与原始用户写法联系起来，例如：

- `eq_unfold`
- `eq_def`
- `eq_1`, `eq_2`, ...

这些 lemma 在证明和重写中很重要，因为它们给出了“高层定义和内部变换后的定义之间的桥梁”。

## `.olean` 与 `.ilean`

当 module elaboration 完成并通过 kernel 检查后，Lean 会把 environment 改动序列化到 `.olean` 文件中。`.olean` 可被 memory-map，包含后续导入所需的编译结果。

此外还会生成 `.ilean` 文件。它主要供 language server 使用，保存无需完整加载 module 也能支持交互的索引信息，例如 declaration 源位置等。

## 与 compiler 的连接

compiler 会进一步把 intermediate representation 转成 C，再由随 Lean 分发的 C compiler 生成本地代码。若配置启用 `precompileModules`，这些产物还可被动态加载。
