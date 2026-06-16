# 把 attribute 用作声明修饰符

> 对应英文：[Attributes as Modifiers](https://lean-lang.org/doc/reference/latest/Attributes/#The-Lean-Language-Reference--Attributes--Attributes-as-Modifiers)，抓取日期：2026-06-16。

attribute 可以直接作为声明 modifier 放在 declaration 上。它们位于：

- documentation comment 之后
- 可见性修饰符之前

## 基本语法

```lean
@[attr1, attr2, ...]
def name := ...
```

更准确地说，attribute modifier 由若干 `attrInstance` 组成。

## 这样做的好处

把 attribute 直接贴在声明上，有几个优势：

- 语义与定义靠得更近；
- 阅读时更容易看出该声明有哪些额外角色；
- 避免定义后再另写一条 `attribute` 命令分散信息。

## 适合的 attribute 类型

最常见的例子包括：

- `@[simp]`
- `@[ext]`
- `@[instance]`
- `@[coe]`
- `@[grind]`

它们分别可能把声明加入某套自动化、注册实例、标记 coercion 或暴露给其它工具链组件。

## 使用建议

- 若 attribute 是该声明身份的一部分，优先直接写在声明头上；
- 若 attribute 只是临时局部修改现有声明，则更适合单独 `attribute` 命令。