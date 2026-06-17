# 结构体与构造子

> 对应英文：[Structures and Constructors](https://lean-lang.org/doc/reference/latest/Terms/Structures-and-Constructors/)，抓取日期：2026-06-16。

Lean 提供多种 **term 级**写法来构造归纳类型与 structure 值。它们最终都会 elaboration 成核心项（constructor 应用 + projection）。

## 位置构造（构造子应用）

```lean
inductive Color where | red | green | blue

#check Color.red                    -- 构造子
#check List.cons 1 (List.nil)       -- 前缀形式
#check (1 :: [])                    -- 中缀记号（notation 展开后仍是构造子）
```

多构造子类型按参数位置传入；notation（如 `::`、`⟨⟩`）只是 surface syntax。

## 匿名构造子 `⟨ … ⟩`

单构造子类型（含多数 `structure`）可用角括号：

```lean
structure Point where
  x y : Nat

#check Point.mk 1 2
#check ⟨1, 2⟩   -- 等价于 Point.mk 1 2（在 expected type 为 Point 时）

example : Point := ⟨x := 1, y := 2⟩   -- 具名匿名构造子
```

详见 [匿名构造子语法](../InductiveDetails/AnonymousConstructors.md)。

## Structure instance 语法

按 **字段名** 构造（不要求字段顺序与声明一致）：

```lean
structure Config where
  port : Nat
  host : String

def cfg : Config := { port := 8080, host := "localhost" }

-- 在已有值上覆盖部分字段
def cfg2 : Config := { cfg with port := 9090 }
```

`structure` 声明、字段继承见 [structure 声明](../InductiveDetails/Structures.md)、[structure 继承](../InductiveDetails/StructureInheritance.md)。

## 与 projection、field notation

构造后可读字段：

```lean
#check cfg.port
#check cfg.host
```

`cfg.port` 是 **projection**（或 generalized field notation），不是新的构造方式。错误拼 field 名会触发 [invalidField](../Errors/InvalidField.md)。

## 选型速查

| 需求 | 写法 |
| --- | --- |
| 枚举变体 | `Color.red` |
| 单构造子、参数少 | `⟨a, b⟩` |
| 字段多、易读 | `{ f := v, ... }` |
| 基于旧值改字段 | `{ old with f := v }` |
| 不确定展开结果 | `#check`、`#print` |

## 延伸阅读

- [模式匹配](PatternMatching.md) — `match` / `cases` 消去构造子
- [Structures and Constructors 英文页](https://lean-lang.org/doc/reference/latest/Terms/Structures-and-Constructors/) — 与 elaboration 交互的边界情况