# quotation 与 antiquotation

> 对应英文：[Quotation and Antiquotation](https://lean-lang.org/doc/reference/latest/Terms/Quotation-and-Antiquotation/)，抓取日期：2026-06-16。

quotation 把 Lean **语法**当作数据构造；antiquotation 在模板里插入已有的 `Syntax` 片段。二者是 macro、notation、elaborator 扩展的核心工具。

## 最小示例

```lean
import Lean

open Lean

-- 引号内是 syntax 模板；$(...) 是 antiquotation 插入点
#eval `(def $id:ident := $e:term)  -- 需在其他 meta 代码里用 id、e 实例化
```

常见 antiquotation 片（在 `syntax` / `macro` 规则里声明）：

| 片 | 含义 |
| --- | --- |
| `$e:term` | 插入 term 语法 |
| `$id:ident` | 插入标识符 |
| `$t:tactic` | 插入 tactic 语法 |
| `$(stx)` | 插入任意 Syntax 变量 |

## 在 term 里的位置

用户可在 term 位置写 quotation（经 macro 展开后生成 `Syntax` 值）。因此它列在 [Term](../Terms.md) 章节下，并与 [Notation 与 Macro](../NotationsMacros.md) 衔接。

## hygiene

quotation 生成的标识符默认带 **hygiene**：在 macro 展开处自动加 scope，避免与用户代码里的同名标识符意外捕获。需要故意引用用户名字时，用 **antiquotation 插入的 ident** 或 `noHygiene` 等机制（见 [Macro](../Macros/Macros.md)）。

## 该继续读什么

| 目标 | 章节 |
| --- | --- |
| 定义 macro、`macro_rules` | [Macro](../Macros/Macros.md) |
| 注册 elaborator | [Elaborator](../Macros/Elaborators.md) |
| 扩展 parser / notation | [Notation](../Macros/Notations.md)、[定义新语法](../Macros/DefiningNewSyntax.md) |
| `do` 元编程 | [扩展 `do` 记法](../Macros/DoNotation.md) |

## 使用建议

- 日常证明与编程可只了解「语法可引用、可生成」；
- 写 linter、命令、战术宏时再深入 quotation / antiquotation；
- 调试展开结果用 `#print`、trace `Elab` / `Macro` 或 `set_option trace.Macro true`。