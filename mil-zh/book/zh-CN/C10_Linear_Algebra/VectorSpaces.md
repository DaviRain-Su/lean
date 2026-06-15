# 向量空间与线性映射

## 向量空间

我们从抽象的线性代数直接入手：在任意域（field）上的向量空间（vector space）中讨论。关于矩阵的具体内容见[矩阵、基与维数](Bases.md)中的矩阵一节；该节在逻辑上不依赖本章的抽象理论。Mathlib 实际上处理的是更一般的**模**（module）理论，但眼下可以把它当作一种略显古怪的拼写习惯。

要说「设 $K$ 为域，$V$ 为 $K$ 上的向量空间」，并让 $K$、$V$ 成为后续结果的隐式参数，写法如下：

```lean
variable {K : Type*} [Field K] {V : Type*} [AddCommGroup V] [Module K V]
```

[第 8 章：层次结构](../C08_Hierarchies.md)解释了为何需要两个独立的类型类 `[AddCommGroup V] [Module K V]`。简而言之：数学上我们希望 $K$-向量空间结构蕴含加法交换群结构，Lean 也可以这样声明；但一旦对类型 $V$ 寻找这样的群结构，类型类合成会去搜寻向量空间结构，而所用的域 $K$ 完全未指定、也无法从 $V$ 推断——这对类型类合成非常不利。

向量 `v` 与标量 `a` 的数乘记作 `a • v`。下面列出该运算与加法交互的若干代数规则；当然 `simp` 或 `apply?` 都能找到这些证明。还有 **`module`** 策略，可解决由向量空间与域公理推出的目标，用法类似交换环中的 `ring` 策略或群中的 `group` 策略。记住：引理名中数乘常缩写为 `smul`。

```lean
example (a : K) (u v : V) : a • (u + v) = a • u + a • v :=
  smul_add a u v

example (a b : K) (u : V) : (a + b) • u = a • u + b • u :=
  add_smul a b u

example (a b : K) (u : V) : a • b • u = b • a • u :=
  smul_comm a b u
```

对进阶读者：如术语所示，Mathlib 的线性代数也覆盖环（未必交换）上的模，甚至半环（semiring）上的半模（semi-module）。若觉得不必如此一般，可思考下面这个例子——它优雅地刻画了理想在子模上作用的大量代数规则：

```lean
example {R M : Type*} [CommSemiring R] [AddCommMonoid M] [Module R M] :
    Module (Ideal R) (Submodule R M) :=
  inferInstance
```

要说 `M` 是环 `R` 上的模，写作：

```lean
section
variable {R : Type*} [Ring R] {M : Type*} [AddCommGroup M] [Module R M]
end
```

与声明向量空间相比，除变量名外，唯一变化是把 `Field K` 换成 `Ring R`。

要说 `M` 是半环 `R` 上的半模，把 `Ring R` 换成 `Semiring R`，并把 `AddCommGroup M` 换成 `AddCommMonoid M`——半模没有取负运算。

```lean
section
variable {R : Type*} [Semiring R] {M : Type*} [AddCommMonoid M] [Module R M]
end
```

Lean **不能**在只给定任意 `M` 时自动从 `R` 为环推断 `M` 有取负，因为无法先猜出正确的 `R`。因此若声明 `R` 为环、`M` 为 `R`-模，须同时声明 `M` 为 `AddCommGroup`，或手动把实例加入上下文：

```lean
example {R : Type*} [Ring R] {M : Type*} [AddCommMonoid M] [Module R M] : M → M :=
  -- 用 `letI`（而非 `haveI` 或 `let`），便于把 `AddCommMonoid M` 中已有的加法结构与下面新引入的对应起来
  letI : AddCommGroup M := Module.addCommMonoidToAddCommGroup R
  fun x => - x
```

## 线性映射

与群态射类似，Mathlib 中的线性映射（linear map）是**捆绑映射**（bundled map）：函数加上线性性证明；应用时自动强制为普通函数。设计动机见[第 8 章：层次结构](../C08_Hierarchies.md)。

两个 `K`-向量空间 `V` 与 `W` 之间线性映射的类型为 `V →ₗ[K] W`，下标 `l` 表示 linear。起初在记号里写 `K` 可能显得奇怪，但多个域同时出现时至关重要。例如从 $\mathbb{C}$ 到 $\mathbb{C}$ 的**实线性**映射是全体 $z \mapsto az + b\bar{z}$，而**复线性**映射仅为 $z \mapsto az$——这在复分析中至关重要。

```lean
variable {W : Type*} [AddCommGroup W] [Module K W]

variable (φ : V →ₗ[K] W)

example (a : K) (v : V) : φ (a • v) = a • φ v :=
  map_smul φ a v

example (v w : V) : φ (v + w) = φ v + φ w :=
  map_add φ v w
```

`V →ₗ[K] W` 本身也有有趣的代数结构（这也是捆绑映射的动机之一）：它是 `K`-向量空间，可对线性映射做加法与标量乘法。

```lean
variable (ψ : V →ₗ[K] W)

#check (2 • φ + ψ : V →ₗ[K] W)
```

捆绑映射的代价是不能用普通函数复合，须用 `LinearMap.comp` 或记号 `∘ₗ`：

```lean
variable (θ : W →ₗ[K] V)

#check (φ.comp θ : W →ₗ[K] W)
#check (φ ∘ₗ θ : W →ₗ[K] W)
```

构造线性映射主要有两种方式。一是直接给出函数与线性性证明；可用结构体代码动作：输入 `example : V →ₗ[K] V := _`，在 `_` 上使用「Generate a skeleton」。

```lean
example : V →ₗ[K] V where
  toFun v := 3 • v
  map_add' _ _ := smul_add ..
  map_smul' _ _ := smul_comm ..
```

`LinearMap` 证明字段名末尾带撇号，是因为它们在强制到函数的 coercion 定义之前就写好，用 `LinearMap.toFun` 表述；之后又以 `LinearMap.map_add`、`LinearMap.map_smul` 用函数视角重述。故事还没完：我们还想要适用于任意保加法的捆绑映射（加法群态射、线性映射、连续线性映射、`K`-代数映射等）的 `map_add` 版本——它在根命名空间里就叫 `map_add`。中间的 `LinearMap.map_add` 略冗余，但有时点记号更方便。`map_smul` 有类似故事；一般框架见[第 8 章](../C08_Hierarchies.md)。

```lean
#check (φ.map_add' : ∀ x y : V, φ.toFun (x + y) = φ.toFun x + φ.toFun y)
#check (φ.map_add : ∀ x y : V, φ (x + y) = φ x + φ y)
#check (map_add φ : ∀ x y : V, φ (x + y) = φ x + φ y)
```

也可用 Mathlib 已有线性映射的各种组合子构造。上例在库中即 `LinearMap.lsmul K V 3`。此处 `K`、`V` 为显式参数：从裸的 `LinearMap.lsmul 3` Lean 无法推断 `V` 甚至 `K`；且 `LinearMap.lsmul K V` 本身有趣，类型为 `K →ₗ[K] V →ₗ[K] V`——把 `K`（视为自身上的向量空间）映到 `V →ₗ[K] V` 的 `K`-线性映射。

```lean
#check (LinearMap.lsmul K V 3 : V →ₗ[K] V)
#check (LinearMap.lsmul K V : K →ₗ[K] V →ₗ[K] V)
```

还有线性同构（linear isomorphism）类型 `LinearEquiv`，记号 `V ≃ₗ[K] W`。`f : V ≃ₗ[K] W` 的逆为 `f.symm : W ≃ₗ[K] V`，复合为 `f.trans g` 或 `f ≪≫ₗ g`，`V` 的恒等同构为 `LinearEquiv.refl K V`。需要时会自动强制为态射与函数。

```lean
example (f : V ≃ₗ[K] W) : f ≪≫ₗ f.symm = LinearEquiv.refl K V :=
  f.self_trans_symm
```

可用 `LinearEquiv.ofBijective` 从双射线性映射构造同构；这样做会使逆函数不可计算（noncomputable）。

```lean
noncomputable example (f : V →ₗ[K] W) (h : Function.Bijective f) : V ≃ₗ[K] W :=
  .ofBijective f h
```

上例中 Lean 根据声明的类型理解 `.ofBijective` 指 `LinearEquiv.ofBijective`（无需打开命名空间）。

## 向量空间的和与积

可用直和（direct sum）与直积（direct product）从旧空间构造新空间。先从两个向量空间开始：此时和与积无区别，直接用积类型即可。下面展示如何得到所有结构映射（嵌入与投影）作为线性映射，以及进入积、离开和的泛性质（若不熟悉范畴论中和与积的区分，可忽略「泛性质」用语，只关注下面各例的类型）。

```lean
section binary_product

variable {W : Type*} [AddCommGroup W] [Module K W]
variable {U : Type*} [AddCommGroup U] [Module K U]
variable {T : Type*} [AddCommGroup T] [Module K T]

-- 第一投影
example : V × W →ₗ[K] V := LinearMap.fst K V W

-- 第二投影
example : V × W →ₗ[K] W := LinearMap.snd K V W

-- 积的泛性质
example (φ : U →ₗ[K] V) (ψ : U →ₗ[K] W) : U →ₗ[K]  V × W := LinearMap.prod φ ψ

example (φ : U →ₗ[K] V) (ψ : U →ₗ[K] W) : LinearMap.fst K V W ∘ₗ LinearMap.prod φ ψ = φ := rfl

example (φ : U →ₗ[K] V) (ψ : U →ₗ[K] W) : LinearMap.snd K V W ∘ₗ LinearMap.prod φ ψ = ψ := rfl

-- 平行组合映射
example (φ : V →ₗ[K] U) (ψ : W →ₗ[K] T) : (V × W) →ₗ[K] (U × T) := φ.prodMap ψ

example (φ : V →ₗ[K] U) (ψ : W →ₗ[K] T) :
  φ.prodMap ψ = (φ ∘ₗ .fst K V W).prod (ψ ∘ₗ .snd K V W) := rfl

-- 第一嵌入
example : V →ₗ[K] V × W := LinearMap.inl K V W

-- 第二嵌入
example : W →ₗ[K] V × W := LinearMap.inr K V W

-- 和（余积）的泛性质
example (φ : V →ₗ[K] U) (ψ : W →ₗ[K] U) : V × W →ₗ[K] U := φ.coprod ψ

example (φ : V →ₗ[K] U) (ψ : W →ₗ[K] U) : φ.coprod ψ ∘ₗ LinearMap.inl K V W = φ :=
  LinearMap.coprod_inl φ ψ

example (φ : V →ₗ[K] U) (ψ : W →ₗ[K] U) : φ.coprod ψ ∘ₗ LinearMap.inr K V W = ψ :=
  LinearMap.coprod_inr φ ψ

example (φ : V →ₗ[K] U) (ψ : W →ₗ[K] U) (v : V) (w : W) :
    φ.coprod ψ (v, w) = φ v + ψ w :=
  rfl

end binary_product
```

对任意族的向量空间，下面只看如何定义一族空间并访问和与积的泛性质。直和记号作用域在 `DirectSum` 命名空间；直和的泛性质要求指标类型可判定相等（decidable equality），这算是实现上的偶然。

```lean
section families
open DirectSum

variable {ι : Type*} [DecidableEq ι]
         (V : ι → Type*) [∀ i, AddCommGroup (V i)] [∀ i, Module K (V i)]

-- 直和的泛性质：由各分量上的映射组装出从直和出发的映射
example (φ : Π i, (V i →ₗ[K] W)) : (⨁ i, V i) →ₗ[K] W :=
  DirectSum.toModule K ι W φ

-- 直积的泛性质：由映到各因子的映射组装出映到直积的映射
example (φ : Π i, (W →ₗ[K] V i)) : W →ₗ[K] (Π i, V i) :=
  LinearMap.pi φ

-- 从直积出发的投影
example (i : ι) : (Π j, V j) →ₗ[K] V i := LinearMap.proj i

-- 嵌入直和
example (i : ι) : V i →ₗ[K] (⨁ i, V i) := DirectSum.lof K ι V i

-- 嵌入直积
example (i : ι) : V i →ₗ[K] (Π i, V i) := LinearMap.single K V i

-- 若 `ι` 有限，直和与直积同构
example [Fintype ι] : (⨁ i, V i) ≃ₗ[K] (Π i, V i) :=
  linearEquivFunOnFintype K ι V

end families
```