# 声明修饰符

> 对应英文：[Modifiers](https://lean-lang.org/doc/reference/latest/Definitions/Modifiers/)，抓取日期：2026-06-16。

Lean 的声明共享一套统一的 modifier 体系。它们全部可选，但顺序固定。modifier 改变的是“这个声明如何被解释”，例如是否公开、是否可计算、是否允许不安全特性、是否附带文档和 attribute。

## 固定顺序

声明修饰符按如下顺序出现：

1. documentation comment
2. attribute 列表
3. 可见性控制（`private` / `protected`）
4. `noncomputable`
5. `unsafe`
6. 递归修饰符（`partial` 或 `nonrec`）

并不是每一种声明都接受所有 modifier，但整体顺序是一致的。

## documentation comment

`/-- ... -/` 是文档注释。它不是“普通注释”，而是实际语法成分：放在不允许文档注释的位置会直接变成语法错误。

主要用途：

- 为 declaration 提供 API 文档；
- 在编辑器中 hover 时显示说明；
- 作为某些命令期望的长文本输入。

## attribute

attribute 是可扩展的声明附加信息系统。它可以：

- 把 theorem 加入某个自动化集合，例如 `[simp]`；
- 注册实例、pretty-printer、parser 或其他元数据；
- 改变某些工具链组件如何处理该声明。

attribute 本身在专门章节中单独说明。

## 可见性：`private` / `protected`

- `private`：声明只在当前 module 内可访问。
- `protected`：即便打开其 namespace，也不会自动把该名字带入作用域。

这两个修饰符的重点都在于**缩小 API 暴露面**。

## `noncomputable`

`noncomputable` 表示该定义不参与代码生成。典型原因：

- 使用了 choice、classical reasoning 等非计算原则；
- 依赖某些只适合证明、而不适合高效执行的构造；
- 逻辑上有意义，但不打算运行。

这类定义对规范说明和证明非常有用，即使它们不能编译运行。

## `unsafe`

`unsafe` 把声明从 kernel 检查和一部分安全约束中豁免出来，使其可以访问某些可能破坏 Lean 保证的底层能力。

它应只在明确理解 Lean 内部机制时使用，因为它可能让程序行为偏离逻辑模型，甚至破坏 soundness 假设链条。

## `partial` 与 `nonrec`

- `partial`：允许把递归函数当作 partial function 处理，不强求 termination 证明。
- `nonrec`：显式声明该定义不是递归定义，防止名字解析把它误解成递归引用。

`partial` 倾向于“我知道它可能不终止，但接受这种语义”；`nonrec` 更偏“这里不要把同名东西当递归调用”。

## 使用建议

- 文档和 attribute 属于对外接口设计的一部分，应认真维护。
- `private` / `protected` 优先用于收紧命名暴露，而不是事后补救。
- `noncomputable` 是语义声明，不是“先让它过编译”的补丁。
- `unsafe` 和 `partial` 都应被视为高风险选择，只有在确有需要时才使用。