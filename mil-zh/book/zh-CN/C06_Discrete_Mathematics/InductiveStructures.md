# 归纳定义的类型

Lean 的基础允许定义 **归纳类型**（inductive types），即自下而上生成实例的数据类型。例如 `List α`（α 中元素的列表）从空列表 `nil` 出发，逐次在列表前端添加元素生成。下文将定义二叉树类型 `BinTree`：从空树出发，将新节点接到两棵已有树上构造新树。

Lean 中可定义对象无限的归纳类型，如可数分支的良基树。有限归纳定义在离散数学中很常见，尤其与计算机科学相关的分支。Lean 不仅提供定义手段，还提供归纳原理与递归定义。例如 `List α` 归纳定义如下：

```lean
namespace MyListSpace

inductive List (α : Type*) where
  | nil  : List α
  | cons : α → List α → List α

end MyListSpace
```

归纳定义说：`List α` 的每个元素要么是空列表 `nil`，要么是 `cons a as`（a : α，as : List α）。构造子全名为 `List.nil`、`List.cons`；`open List` 时可用短记号。未 `open List` 时，可在 Lean 期望列表处写 `.nil`、`.cons a as`，Lean 自动插入 `List` 限定。本节将临时定义放在 `MyListSpace` 等命名空间以避免与标准库冲突；离开临时命名空间后恢复标准库定义。

Lean 定义 `[]` 为 `nil`、`::` 为 `cons`，可写 `[a, b, c]` 表示 `a :: b :: c :: []`。连接（append）与映射（map）递归定义如下：

```lean
def append {α : Type*} : List α → List α → List α
  | [],      bs => bs
  | a :: as, bs => a :: append as bs

def map {α β : Type*} (f : α → β) : List α → List β
  | []      => []
  | a :: as => f a :: map f as

#eval append [1, 2, 3] [4, 5, 6]
#eval map (fun n => n^2) [1, 2, 3, 4, 5]
```

各有基例与递归情形；两定义子句按定义成立：

```lean
theorem nil_append {α : Type*} (as : List α) : append [] as = as := rfl

theorem cons_append {α : Type*} (a : α) (as : List α) (bs : List α) :
    append (a :: as) bs = a :: append as bs := rfl

theorem map_nil {α β : Type*} (f : α → β) : map f [] = [] := rfl

theorem map_cons {α β : Type*} (f : α → β) (a : α) (as : List α) :
    map f (a :: as) = f a :: map f as := rfl
```

`append` 与 `map` 在标准库中已定义；`append as bs` 可写 `as ++ bs`。

Lean 允许按定义结构写归纳证明：

```lean
variable {α β γ : Type*}
variable (as bs cs : List α)
variable (a b c : α)

open List

theorem append_nil : ∀ as : List α, as ++ [] = as
  | [] => rfl
  | a :: as => by rw [cons_append, append_nil as]

theorem map_map (f : α → β) (g : β → γ) :
    ∀ as : List α, map g (map f as) = map (g ∘ f) as
  | [] => rfl
  | a :: as => by rw [map_cons, map_cons, map_cons, map_map f g as]; rfl
```

也可用 `induction'` 策略：

```lean
theorem append_nil' : as ++ [] = as := by
  induction' as with a as ih
  . rfl
  . rw [cons_append, ih]

theorem map_map' (f : α → β) (g : β → γ) (as : List α) :
    map g (map f as) = map (g ∘ f) as := by
  induction' as with a as ih
  . rfl
  . simp [map, ih]
```

这些定理已在标准库中。练习：在 `MyListSpace3` 命名空间定义 `reverse`（避免与 `List.reverse` 冲突），可用 `#eval reverse [1, 2, 3, 4, 5]` 测试。最直白的 `reverse` 需二次时间，不必担心；可跳转标准库 `List.reverse` 看线性实现。尝试证明 `reverse (as ++ bs) = reverse bs ++ reverse as` 与 `reverse (reverse as) = as`；可用 `cons_append`、`append_assoc`，但可能需要辅助引理：

```lean
def reverse : List α → List α := sorry

theorem reverse_append (as bs : List α) : reverse (as ++ bs) = reverse bs ++ reverse as := by
  sorry

theorem reverse_reverse (as : List α) : reverse (reverse as) = as := by sorry
```

## 二叉树

下面是二叉树的归纳定义，以及计算大小与深度的函数：

```lean
inductive BinTree where
  | empty : BinTree
  | node  : BinTree → BinTree → BinTree

namespace BinTree

def size : BinTree → ℕ
  | empty    => 0
  | node l r => size l + size r + 1

def depth : BinTree → ℕ
  | empty    => 0
  | node l r => max (depth l) (depth r) + 1
```

将空二叉树计为大小 0、深度 0 较方便。文献中该类型有时称为 **扩展二叉树**（extended binary trees）。包含空树意味着可定义如 `node empty (node empty empty)`：根节点、空左子树、右子树为单节点。

大小与深度的重要不等式：

```lean
theorem size_le : ∀ t : BinTree, size t ≤ 2^depth t - 1
  | empty    => Nat.zero_le _
  | node l r => by
    simp only [depth, size]
    calc l.size + r.size + 1
      ≤ (2^l.depth - 1) + (2^r.depth - 1) + 1 := by
          gcongr <;> apply size_le
    _ ≤ (2 ^ max l.depth r.depth - 1) + (2 ^ max l.depth r.depth - 1) + 1 := by
          gcongr <;> simp
    _ ≤ 2 ^ (max l.depth r.depth + 1) - 1 := by
          have : 0 < 2 ^ max l.depth r.depth := by simp
          omega
```

尝试证明较易的下列不等式。若像上一定理那样归纳证明，须删去 `:= by`：

```lean
theorem depth_le_size : ∀ t : BinTree, depth t ≤ size t := by sorry
```

再定义二叉树上的 `flip` 运算，递归交换左右子树：

```lean
def flip : BinTree → BinTree := sorry
```

若定义正确，下列证明应为 `rfl`：

```lean
example: flip (node (node empty (node empty empty)) (node empty empty)) =
    node (node empty empty) (node (node empty empty) empty) := sorry
```

证明：

```lean
theorem size_flip : ∀ t, size (flip t) = size t := by sorry
```

## 命题公式

以形式逻辑收束本节。下面是命题公式的归纳定义：

```lean
inductive PropForm : Type where
  | var (n : ℕ)           : PropForm
  | fls                   : PropForm
  | conj (A B : PropForm) : PropForm
  | disj (A B : PropForm) : PropForm
  | impl (A B : PropForm) : PropForm
```

每个命题公式或是变量 `var n`、常元假 `fls`，或是复合公式 `conj A B`、`disj A B`、`impl A B`。常规记号常写为 p_n、⊥、A ∧ B、A ∨ B、A → B。其他联结词可用这些定义，例如 ¬A 为 A → ⊥，A ↔ B 为 (A → B) ∧ (B → A)。

定义公式类型后，定义在将布尔真值赋给变量的赋值 `v` 下 **求值**（evaluate）命题公式的含义：

```lean
def eval : PropForm → (ℕ → Bool) → Bool
  | var n,    v => v n
  | fls,      _ => false
  | conj A B, v => A.eval v && B.eval v
  | disj A B, v => A.eval v || B.eval v
  | impl A B, v => ! A.eval v || B.eval v
```

下一定义给出公式中出现的变量集；随后定理说明：在两个在公式变量上一致的赋值下求值，结果相同：

```lean
def vars : PropForm → Finset ℕ
  | var n    => {n}
  | fls      => ∅
  | conj A B => A.vars ∪ B.vars
  | disj A B => A.vars ∪ B.vars
  | impl A B => A.vars ∪ B.vars

theorem eval_eq_eval : ∀ (A : PropForm) (v1 v2 : ℕ → Bool),
    (∀ n ∈ A.vars, v1 n = v2 n) → A.eval v1 = A.eval v2
  | var n, v1, v2, h    => by simp_all [vars, eval]
  | fls, v1, v2, h      => by simp_all [eval]
  | conj A B, v1, v2, h => by
      simp_all [vars, eval, eval_eq_eval A v1 v2, eval_eq_eval B v1 v2]
  | disj A B, v1, v2, h => by
      simp_all [vars, eval, eval_eq_eval A v1 v2, eval_eq_eval B v1 v2]
  | impl A B, v1, v2, h => by
      simp_all [vars, eval, eval_eq_eval A v1 v2, eval_eq_eval B v1 v2]
```

注意到重复模式，可更聪明地使用自动化：

```lean
theorem eval_eq_eval' (A : PropForm) (v1 v2 : ℕ → Bool) (h : ∀ n ∈ A.vars, v1 n = v2 n) :
    A.eval v1 = A.eval v2 := by
  cases A <;> simp_all [eval, vars, fun A => eval_eq_eval' A v1 v2]
```

函数 `subst A m C` 描述在公式 `A` 中将每个 `var m` 出现替换为公式 `C` 的结果：

```lean
def subst : PropForm → ℕ → PropForm → PropForm
  | var n,    m, C => if n = m then C else var n
  | fls,      _, _ => fls
  | conj A B, m, C => conj (A.subst m C) (B.subst m C)
  | disj A B, m, C => disj (A.subst m C) (B.subst m C)
  | impl A B, m, C => impl (A.subst m C) (B.subst m C)
```

例：替换不在公式中出现的变量无效果：

```lean
theorem subst_eq_of_not_mem_vars :
    ∀ (A : PropForm) (n : ℕ) (C : PropForm), n ∉ A.vars → A.subst n C = A := sorry
```

下列定理更微妙：在赋值 `v` 上对 `A.subst n C` 求值，等于在将 `C` 的值赋给 `var n` 的赋值上对 `A` 求值。请尝试证明：

```lean
theorem subst_eval_eq : ∀ (A : PropForm) (n : ℕ) (C : PropForm) (v : ℕ → Bool),
  (A.subst n C).eval v = A.eval (fun m => if m = n then C.eval v else v m) := sorry
```