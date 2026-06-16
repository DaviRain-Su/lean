# Logic and Proof

> 英文原版：[leanprover.github.io/logic_and_proof](https://leanprover.github.io/logic_and_proof/) · 源码：[leanprover-community/logic_and_proof](https://github.com/leanprover-community/logic_and_proof)

本科数学严格证明写作 + 经典逻辑 + Lean 形式化。全书共 24 章，目前逐步翻译中。

## 说明

- 已翻译章节可直接点击阅读。
- 未翻译章节仅列出目录，后续分批补齐。

## 已翻译章节

### 第 1 章：引言

- [引言](introduction.md) — 数学证明、符号逻辑、交互式定理证明、语义观点、课程目标

### 第 2 章：命题逻辑

- [命题逻辑](propositional_logic.md) — 谜题、解法、推理规则、命题逻辑的语言、练习

### 第 3 章：命题逻辑的自然演绎

- [命题逻辑的自然演绎](natural_deduction_for_propositional_logic.md) — 自然演绎中的推导、示例、前向与后向推理、分情况讨论、逻辑恒等式、练习

### 第 4 章：Lean 中的命题逻辑

- [Lean 中的命题逻辑](propositional_logic_in_lean.md) — 命题与证明的表达式、更多命令、构建自然演绎证明、策略模式、前向推理、定义与定理、额外语法、练习

### 第 5 章：经典推理

- [经典推理](classical_reasoning.md) — 反证法、若干经典原则、`contradiction` 策略、练习

### 第 6 章：命题逻辑的语义

- [命题逻辑的语义](semantics_of_propositional_logic.md) — 真值与赋值、真值表、可靠性与完全性、练习

### 第 7 章：一阶逻辑

- [一阶逻辑](first_order_logic.md) — 函数、谓词与关系、全称量词、存在量词、相对化与类、相等、练习

### 第 8 章：一阶逻辑的自然演绎

- [一阶逻辑的自然演绎](natural_deduction_for_first_order_logic.md) — 推理规则、全称量词、存在量词、相等、反例与相对化量词、练习

## 待翻译章节

### 第 9 章：Lean 中的一阶逻辑

- [Lean 中的一阶逻辑](first_order_logic_in_lean.md) — 量词、等式、相等的计算、练习

### 第 5 章：经典推理

- [经典推理](classical_reasoning.md) — 反证法、若干经典原则、`contradiction` 策略、练习

### 第 6 章：命题逻辑的语义

- [命题逻辑的语义](semantics_of_propositional_logic.md) — 真值与赋值、真值表、可靠性与完全性、练习

### 第 7 章：一阶逻辑

- [一阶逻辑](first_order_logic.md) — 函数、谓词与关系、全称量词、存在量词、相对化与类、相等、练习

### 第 8 章：一阶逻辑的自然演绎

- [一阶逻辑的自然演绎](natural_deduction_for_first_order_logic.md) — 推理规则、全称量词、存在量词、相等、反例与相对化量词、练习

### 第 9 章：Lean 中的一阶逻辑

- [Lean 中的一阶逻辑](first_order_logic_in_lean.md) — 函数、谓词与关系、使用全称量词、使用存在量词、相等、策略模式、计算式证明、练习

### 第 10 章：一阶逻辑的语义

- [一阶逻辑的语义](semantics_of_first_order_logic.md) — 解释、模型中的真、示例、有效性与逻辑后承、可靠性与完全性、练习

### 第 11 章：集合

- [集合](sets.md) — 初等集合论、集合运算、指标集族、笛卡尔积与幂集、练习

### 第 12 章：Lean 中的集合

- [Lean 中的集合](sets_in_lean.md) — 基础、若干恒等式、指标集族、幂集、练习

### 第 13 章：关系

- [关系](relations.md) — 序关系、序关系进阶、等价关系与相等、练习

### 第 14 章：Lean 中的关系

- [Lean 中的关系](relations_in_lean.md) — 序关系、数上的序、等价关系、练习

### 第 15 章：函数

- [函数](functions.md) — 函数概念、单射、满射与双射、函数与定义域子集、函数与关系、练习

### 第 16 章：Lean 中的函数

- [Lean 中的函数](functions_in_lean.md) — 函数与符号逻辑、二阶与高阶逻辑、Lean 中的函数、经典地定义逆、Lean 中的函数与集合、练习

### 第 17 章：自然数与归纳法

- [自然数与归纳法](the_natural_numbers_and_induction.md) — 归纳原理、归纳变体、递归定义、定义算术运算、自然数上的算术、整数、练习

### 第 18 章：Lean 中的自然数与归纳法

- [Lean 中的自然数与归纳法](the_natural_numbers_and_induction_in_lean.md) — Lean 中的归纳与递归、Lean 中定义算术运算、练习

### 第 19 章：初等数论

- [初等数论](elementary_number_theory.md) — 商-余定理、整除性、素数、模算术、平方数的性质、练习

### 第 20 章：组合数学

- [组合数学](combinatorics.md) — 有限集与基数、计数原理、有序选取、组合与二项式系数、容斥原理、练习

### 第 21 章：实数

- [实数](the_real_numbers.md) — 数系、商构造、构造实数、实数的完全性、另一种构造、练习

### 第 22 章：无穷

- [无穷](the_infinite.md) — 等势、可数无穷集、Cantor 定理、有限性的另一种定义、Cantor-Bernstein 定理、练习

### 第 23 章：公理化基础

- [公理化基础](axiomatic_foundations.md) — 集合的基本公理、无穷公理、其余公理、类型论、练习

### 第 24 章：附录

- [附录：自然演绎规则](nd_quickref.md) — 自然演绎规则速查
