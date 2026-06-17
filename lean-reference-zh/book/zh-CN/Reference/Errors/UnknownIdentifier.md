# unknownIdentifier

> 对应英文：[About: unknownIdentifier](https://lean-lang.org/doc/reference/latest/Error-Explanations/About___--unknownIdentifier/)，抓取日期：2026-06-16。

错误码：`lean.unknownIdentifier`

含义：identifier 无法解析为 variable 或 constant。

严重性：Error。起始版本：4.23.0。

这个错误表示 Lean 无法找到与给定名称匹配的 variable 或 constant。更精确地说，该名称无法解析为 local/section variable、已声明的 global constant，或这些名称的 projection。

错误消息通常只显示某一种可能解析失败，但这个错误意味着所有可能解释都失败。例如，若打开了 namespace `A` 和 `B`，输入 `x` 后报 unknown identifier，说明 `x`、`A.x`、`B.x` 都找不到，或者找到的是 protected declaration，不能这样引用。

## 常见原因

- 忘记 import 定义该 constant 的 module。
- namespace 没有打开，也没有写限定名。
- local variable 已经离开 scope。
- constructor 名没有加 type namespace 前缀，例如写 `rgb` 而实际名称是 `Color.rgb`。
- protected declaration 即使 namespace 已 open，也不能直接用短名引用。
- dotted identifier notation 根据 expected type 推断出不存在的名称。
- 项目关闭了 `autoImplicit` 或 `relaxedAutoImplicit`，未知 identifier 不再自动变成 implicit parameter。

## 修复方向

- 添加缺失 import。
- 使用完整限定名，例如 `Color.rgb`。
- `open` 对应 namespace，或使用 restricted opening。
- 检查变量是否仍在 scope 中；必要时把 `let` binding 移到外层。
- 对 protected 名称至少写出最内层 namespace。
- 对自动隐式变量问题，显式添加 implicit parameter，或调整 `autoImplicit` / `relaxedAutoImplicit` 选项。

支持 code action 的编辑器通常会给出相似 constant 名称和可导入 module 的建议。

## 示例

```lean
-- 未 import Mathlib 时
#check Nat.Prime   -- unknown identifier

-- 补上 import 或使用限定名（取决于项目配置）
import Mathlib.Data.Nat.Prime
#check Nat.Prime
```

constructor 未加类型前缀：

```lean
inductive Color where | rgb (r g b : Nat)
example : Color := rgb 255 0 0   -- 可能 unknown：应为 Color.rgb
```

protected 名称即使 `open` 了也不能省略外层 namespace；至少写出最内层限定名，例如 `Submodule.span` 而不是单独的 `span`（当 `span` 受保护时）。
