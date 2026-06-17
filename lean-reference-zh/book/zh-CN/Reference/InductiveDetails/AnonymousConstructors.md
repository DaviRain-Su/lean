# 匿名构造子语法

> 对应英文：[Anonymous Constructor Syntax](https://lean-lang.org/doc/reference/latest/The-Type-System/Inductive-Types/#anonymous-constructor-syntax)，抓取日期：2026-06-16。

如果某个归纳类型只有一个构造子，那么 Lean 允许使用匿名构造子语法，而不必显式写出构造子名。

## 基本写法

```lean
⟨a, b, c⟩
```

这会把显式参数按顺序传给该类型唯一的构造子。

## 适用范围

匿名构造子语法可用于：

- expression 位置
- pattern 位置

因此它既适合构造值，也适合在模式匹配中拆开值。

## 限制

若你需要：

- 按字段名提供参数
- 使用 `@` 把隐式参数显式化
- 明确指明是哪个构造子

那就必须回到普通构造子语法。

## 与 structure 的关系

`structure` 经常只有一个构造子，因此匿名构造子在结构体中尤其常见。但它本质上仍是单构造子归纳类型的通用语法糖，而不只是 structure 专属功能。

## 使用建议

- 只关心“按顺序把值塞进去”时，匿名构造子最简洁；
- 若值有多个同类型字段、顺序不易读，优先显式构造子或 structure instance 语法；
- 公共 API 示例里，若匿名构造子会降低可读性，不妨写出完整构造子名。