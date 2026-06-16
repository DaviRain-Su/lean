# deriving instance

> 对应英文：[Deriving Instances](https://lean-lang.org/doc/reference/latest/Type-Classes/Deriving-Instances/)，抓取日期：2026-06-16。

Lean 可以自动为许多 class 生成实例，这就是 deriving instance。它既可以：

- 在定义新 inductive / structure 时通过 `deriving ...` 触发；
- 也可以作为独立命令使用。

## 两种入口

### 1. 随类型声明一起 deriving

```lean
inductive Foo where
  ...
  deriving Repr, BEq, Inhabited
```

### 2. 独立 deriving 命令

```lean
deriving instance Repr, BEq for Foo, Bar
```

它会对每个目标类型分别尝试为每个 class 生成实例。

## deriving handler

Lean 内部通过一张 deriving handler 表实现该功能。每个 handler 负责某个 class：

- 如果能为给定类型生成实例，则返回成功；
- 如果不能处理，则返回失败，让下一个 handler 继续尝试。

这些 handler 通过 `registerDerivingHandler` 注册，通常在 `initialize` block 中完成。也就是说，用户与库都可以扩展“哪些 class 支持自动 deriving”。

## Lean 内置支持的 class

英文页列出的内置 deriving handler 包括：

- `BEq`
- `DecidableEq`
- `Hashable`
- `Inhabited`
- `LawfulBEq`
- `Nonempty`
- `Ord`
- `ReflBEq`
- `Repr`
- `SizeOf`
- `TypeName`

## 何时适合 deriving

适合：

- 枚举型 / 结构型数据的常规实例；
- 你并不想手写 `Repr` / `BEq` / `DecidableEq`；
- 标准派生策略已经足够好。

不一定适合：

- 需要自定义展示格式；
- 需要特殊 equality / ordering 语义；
- 你想显式控制性能或实例结构。

## 使用建议

- 默认先尝试 deriving，只有当生成结果不合适时再手写实例。
- 面向公共 API 时，仍应检查派生实例是否符合你的语义预期。
- 自定义库若引入新 class，可考虑补一个 deriving handler，提升用户体验。