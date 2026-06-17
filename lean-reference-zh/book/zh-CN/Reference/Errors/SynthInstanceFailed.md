# synthInstanceFailed

> 对应英文：[About: synthInstanceFailed](https://lean-lang.org/doc/reference/latest/Error-Explanations/About___--synthInstanceFailed/)，抓取日期：2026-06-16。

错误码：`lean.synthInstanceFailed`

含义：type class instance synthesis 失败。

严重性：Error。起始版本：4.26.0。

type class 是 Lean 处理 overloaded operation 的机制。处理某个 overloaded operation 的代码是一个 type class instance；为具体操作选择要用哪个 instance 的过程称为 instance synthesis。

例如，Lean 遇到 `x + y` 且 `x y : Int` 时，需要查找如何给两个 `Int` 做加法，以及结果 type 是什么。这可以描述为合成某个 `HAdd Int Int t` instance。

## 常见原因

- 使用了错误的 operator。例如 string append 应使用 `++`，而不是 `+`。
- 参数 type 不对。例如把 `Int` 当成可 append 的值。
- 缺少 instance。例如自定义 inductive type 没有 `Inhabited`、`Repr`、`BEq`、`ToString` 等 instance。
- instance 依赖其他 instance，递归搜索失败。

## 调试方式

可打开 trace：

```lean
set_option trace.Meta.synthInstance true
```

这会显示 instance synthesis 的搜索过程，适合诊断复杂失败。

## 修复方向

- 换正确 operator 或函数。
- 补充 type annotation，帮助 Lean 确定要合成哪个 class。
- 用 `deriving` 自动生成 instance：

```lean
inductive MyColor where
  | chartreuse | sienna | thistle
  deriving Inhabited, Repr, BEq
```

- 或手写 instance。

## 示例

```lean
-- 错误：字符串不能用 +
#check "hello" + "world"

-- 正确
#check "hello" ++ "world"
```

自定义类型忘记 `deriving` 时：

```lean
inductive Color where | red | green
-- 下面会报 synthInstanceFailed：没有 Inhabited Color
#check (default : Color)
```

加上 `deriving Inhabited` 或手写 `instance : Inhabited Color where default := .red` 即可。
