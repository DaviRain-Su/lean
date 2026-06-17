# simp set

> 对应英文：[Simp sets](https://lean-lang.org/doc/reference/latest/The-Simplifier/Simp-sets/)，抓取日期：2026-06-16。

simplifier 使用的一组规则称为 **simp set**。每次 `simp` 调用都以某个 simp set 为起点，再叠加本次调用的增删。

## 默认 simp set

默认 simp set = 所有带 `[simp]` attribute 的 theorem、definition 和 simproc。

```lean
-- 在默认 set 上工作
example (n : Nat) : n + 0 = n := by simp

-- 从空 set 起步，只用自己的规则
example (n : Nat) : n + 0 = n := by simp only [Nat.add_zero]
```

`only` 会**丢弃**默认 set，适合精确控制、减少误伤。

## 单次调用如何改 set

| 写法 | 含义 |
| --- | --- |
| `simp [h, foo]` | 在默认 set 上**增加** `h`、`foo` |
| `simp [-foo]` | 从默认 set **移除** `foo` |
| `simp [*]` | 把当前 proof state 里**所有假设**加入 set |
| `simp only [a, b]` | **仅**用 `a`、`b`（及内建 reduction） |
| `simp ↓ [foo]` | 本条调用里 `foo` 优先在子项前应用 |

```lean
example (n : Nat) (h : n + 0 = n) : n = n := by
  simp [*] at h   -- 用 h 的类型参与化简 h 本身
  exact h
```

## `[simp]` attribute

把声明注册进**默认** simp set 的主要方式：

```lean
@[simp] theorem add_zero (n : Nat) : n + 0 = n := rfl

-- definition 标记为可展开
@[simp] def double (n : Nat) : Nat := n + n
```

方向与优先级：

| 写法 | 作用 |
| --- | --- |
| `@[simp]` | 加入默认 set |
| `@[simp ↓]` | 进入子项**之前**先尝试该规则 |
| `@[simp ↑]` | 进入子项**之后**再试（默认倾向） |
| `@[simp 100]` | 更高优先级（数字越大越优先） |

库作者应谨慎往默认 set 加规则：导入你的库会改变**全局** `simp` 行为。

## 自定义 simp set

用 `registerSimpAttr` 创建独立 attribute，不污染默认 set：

```lean
-- 库内常见模式（示意）
-- registerSimpAttr my_simp "my_simp"
-- @[my_simp] theorem myLemma ...
-- example : ... := by my_simp
```

适合：领域专用规则、实验性自动化、为自定义 tactic 准备规则库。

## 与 `simp at` 的配合

```lean
example (n m : Nat) (h : n + 0 = m) : m = n := by
  simp only [Nat.add_zero] at h
  rw [← h]
```

`at h` 只化简假设 `h` 的类型；`at *` 化简所有假设和目标。

## 设计建议

- 默认 simp set 是**库公共接口**的一部分，改动会影响所有下游 `simp`；
- 不确定是否该 `[simp]` 时，先用 `simp only [myLemma]` 在局部验证；
- 专用工作流优先自定义 simp set 或封装 `my_tactic := simp only [...]`；
- 用 `simp?` 看实际用到的规则，再收窄为稳定 `simp only` 列表。