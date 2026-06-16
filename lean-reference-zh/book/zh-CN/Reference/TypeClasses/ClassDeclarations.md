# class 声明

> 对应英文：[Class Declarations](https://lean-lang.org/doc/reference/latest/Type-Classes/Class-Declarations/)，抓取日期：2026-06-16。

Lean 用 `class` 关键字声明 type class。语法上它看起来很像 `structure`，而内部实现也确实接近：普通 class 声明会生成一个**单构造子 inductive type**。

## 基本形态

```lean
class Name params (: resultType)? (extends ...)? where
  ...
```

它支持：

- 普通参数与可选结果类型
- `extends` 继承父类
- `where` 中定义方法
- `deriving` 子句

## class 与 structure 的关键区别

### 1. 生成的是 method，而不是普通 field projection

对 `structure` 而言，field projection 接收一个显式结构值；对 `class` 而言，方法把当前实例作为**实例隐式参数**接收。

### 2. 父类实例参数自动变成实例隐式参数

若 `class` 继承其他 class，则其底层构造子接收这些父类实例作为 instance-implicit parameter，而不是普通显式参数。定义该类实例时，Lean 会用 instance synthesis 自动寻找这些继承字段的值。

### 3. 父类投影通过 instance synthesis 获得

structure 的继承通常通过 field projection 追踪父结构字段；class 则依赖 instance synthesis：给定子类实例时，系统会去合成父类实例。

### 4. 结果会注册为 type class

这意味着它可以：

- 作为 instance-implicit parameter 的类型
- 参与 `inferInstance` / `#synth`
- 被 `instance` 声明填充

### 5. `outParam` / `semiOutParam` 生效

这些 gadget 在普通 structure 中没有特别语义，但在 class 中会影响 instance search，因此 class 声明会考虑它们。

## class 不改变 definitional equality

某个类型是不是 class，并不会改变其 definitional equality。即使两个实例拥有相同参数，它们也不一定相同；同一 class 的实例完全可能有不同实现。

## class inductive

某些 class 不是 product of methods，而更像“多个可能构造子中的一个”。Lean 也允许：

```lean
class inductive ... where
| ...
| ...
```

这类 sum-shaped class 的典型例子是 `Decidable`：instance synthesis 既可能给出 `isTrue`，也可能给出 `isFalse`。

## class abbreviation

若一组 class 经常一起出现，可以用 `class abbrev` 创建简写。它本质上等同于“定义一个只 `extends` 其他 class、没有新方法的 class”，但额外自动把其构造子声明为 instance，使新 class 可仅靠 instance synthesis 构造。

## 使用建议

- 需要重载方法、约束接口或表达结构定律时用 `class`。
- 只是装数据、不需要 instance search 时优先 `structure`。
- 只有在“实例本身有多个互斥构造子”时，才考虑 `class inductive`。