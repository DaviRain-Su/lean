# 嵌套归纳类型

> 对应英文：[Nested Inductive Types](https://lean-lang.org/doc/reference/latest/The-Type-System/Inductive-Types/#nested-inductive-types)，抓取日期：2026-06-16。

Lean 允许某些 **nested inductive types**，也就是归纳类型在其构造子里嵌套出现在其他类型构造子内部，而不是只直接作为字段出现。

## 为什么会需要它

有些数据结构自然长这样：

- 子节点包在别的容器里；
- 语法树里夹杂列表、可选值或其它结构；
- 某层结构递归地嵌入到更复杂外壳中。

若只能写“直接递归字段”，很多自然模型就会变得很别扭。

## 为什么又危险

嵌套归纳类型比普通递归字段更复杂，因为：

- positivity 检查更难；
- recursor 生成更复杂；
- 终止与规约行为要更谨慎分析。

因此 Lean 并不是对所有嵌套形态都开放，而是只接受符合其安全条件的那部分。

## 与 mutual inductive 的关系

- mutual inductive：多个归纳类型彼此直接互递归；
- nested inductive：递归出现被包在别的类型构造子之中。

这两者都比普通单一归纳定义更强，但关注点不同。

## 使用建议

- 先问自己：能否用普通字段递归或 mutual inductive 更清晰地表达；
- 只有在嵌套模型明显更自然时，再追求 nested inductive；
- 若 Lean 拒绝某个嵌套定义，优先回头检查 positivity 和整体建模方式。