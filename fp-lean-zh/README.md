# Lean 函数式编程（中文版）

本仓库是 *Functional Programming in Lean*（David Thrane Christiansen 著）的中文翻译项目。

原书由 Microsoft Corporation 于 2023 年以 Creative Commons Attribution 4.0 International License 发布。后续版本由作者针对新版 Lean 与 Verso 进行了修改，版权归 2023–2025 Lean FRO, LLC 所有。

## 项目结构

```
fp-lean-zh/
├── README.md              # 本文件
└── book/
    ├── FPLean_Intro.lean.txt  # 原书 Intro.lean 原文备份
    ├── GettingToKnow/         # 第 1 章英文原文备份
    ├── HelloWorld/            # 第 2 章英文原文备份
    ├── PropsProofsIndexing.lean  # 插章英文原文备份
    ├── Monads.lean            # 第 3 章英文原文备份
    ├── Monads/                # 第 3 章各节英文原文备份
    ├── FunctorApplicativeMonad.lean  # 第 4 章英文原文备份
    ├── FunctorApplicativeMonad/      # 第 4 章各节英文原文备份
    ├── MonadTransformers.lean   # 第 5 章英文原文备份
    ├── MonadTransformers/       # 第 5 章各节英文原文备份
    ├── TypeClasses.lean       # 第 6 章英文原文备份
    ├── TypeClasses/           # 第 6 章各节英文原文备份
    ├── DependentTypes.lean    # 第 7 章英文原文备份
    ├── DependentTypes/        # 第 7 章各节英文原文备份
    ├── ProgramsProofs.lean    # 第 8 章英文原文备份
    ├── ProgramsProofs/        # 第 8 章各节英文原文备份
    ├── NextSteps.lean         # 下一步英文原文备份
    ├── TacticsInductionProofs.lean  # 插章英文原文备份
    └── zh-CN/                 # 中文翻译内容
        ├── INDEX.md           # 中文翻译目录
        ├── README.md          # 原书 README 的中文翻译
        ├── Intro.md           # 前言
        ├── GettingToKnow.md   # 第 1 章：认识 Lean（概述）
        ├── GettingToKnow/     # 第 1 章各节
        │   ├── Evaluating.md      # 求值表达式
        │   ├── Types.md           # 类型
        │   ├── FunctionsDefinitions.md  # 函数与定义
        │   ├── Structures.md      # 结构体
        │   ├── DatatypesPatterns.md   # 数据类型与模式匹配
        │   ├── Polymorphism.md    # 多态性
        │   ├── Conveniences.md    # 更多便利特性
        │   └── Summary.md         # 小结
        ├── HelloWorld.md      # 第 2 章：Hello, World!（概述）
        └── HelloWorld/        # 第 2 章各节
            ├── RunningAProgram.md   # 运行一个程序
            ├── StepByStep.md        # 逐步执行
            ├── StartingAProject.md  # 启动一个项目
            ├── Cat.md               # 实践示例：cat
            ├── Conveniences.md      # 便利特性
            └── Summary.md           # 小结
        ├── PropsProofsIndexing.md # 插章：命题、证明与索引
        ├── Monads.md          # 第 3 章：单子（概述）
        └── Monads/            # 第 3 章各节
            ├── Class.md           # 单子类型类
            ├── Arithmetic.md      # 示例：单子中的算术
            ├── Do.md              # 单子的 do 记法
            ├── IO.md              # IO 单子
            ├── Conveniences.md    # 更多便利特性
            └── Summary.md         # 小结
        ├── FunctorApplicativeMonad.md  # 第 4 章：函子、应用函子与单子（概述）
        └── FunctorApplicativeMonad/    # 第 4 章各节
            ├── Inheritance.md          # 结构体与继承
            ├── Applicative.md          # 应用函子
            ├── ApplicativeContract.md  # 应用函子约定
            ├── Alternative.md          # Alternative
            ├── Universes.md            # 宇宙
            ├── Complete.md             # 完整定义
            └── Summary.md              # 小结
        ├── MonadTransformers.md   # 第 5 章：单子变换器（概述）
        └── MonadTransformers/     # 第 5 章各节
            ├── ReaderIO.md          # 组合 IO 与 Reader
            ├── Transformers.md      # 单子构造工具箱
            ├── Order.md             # 单子变换器的顺序
            ├── Do.md                # 单子变换器的 do 记法
            ├── Conveniences.md      # 更多便利特性
            └── Summary.md           # 小结
        ├── TypeClasses.md       # 第 6 章：重载与类型类（概述）
        └── TypeClasses/         # 第 6 章各节
            ├── Pos.md               # 正数
            ├── Polymorphism.md      # 类型类中的多态性
            ├── OutParams.md         # 输出参数
            ├── Indexing.md          # 索引
            ├── StandardClasses.md   # 标准类型类
            ├── Coercions.md         # 强制转换
            ├── Conveniences.md      # 更多便利特性
            └── Summary.md           # 小结
        ├── DependentTypes.md    # 第 7 章：依赖类型（概述）
        └── DependentTypes/      # 第 7 章各节
            ├── IndexedFamilies.md       # 索引族
            ├── UniversePattern.md       # 宇宙模式
            ├── TypedQueries.md          # 类型化查询
            ├── IndicesParametersUniverses.md  # 索引、参数与宇宙
            ├── Pitfalls.md              # 常见陷阱
            └── Summary.md               # 小结
        ├── ProgramsProofs.md    # 第 8 章：编程、证明与性能（概述）
        ├── ProgramsProofs/      # 第 8 章各节
        │   ├── TailRecursion.md       # 尾递归
        │   ├── TailRecursionProofs.md # 尾递归证明
        │   ├── ArraysTermination.md   # 数组与终止性
        │   ├── Inequalities.md      # 不等式
        │   ├── Fin.md               # Fin
        │   ├── InsertionSort.md     # 插入排序
        │   ├── SpecialTypes.md      # 特殊类型
        │   └── Summary.md           # 小结
        ├── NextSteps.md         # 下一步
        └── TacticsInductionProofs.md  # 插章：策略、归纳与证明
```

## 关于克隆原书

由于当前网络环境限制，直接 `git clone` 原书仓库 `leanprover/fp-lean` 多次超时（包括 `--depth 1` 和稀疏检出）。因此本项目采用 `gh api` 直接获取文件内容的方式，逐步建立中文翻译。

如果你本地网络可以正常克隆，可执行：

```bash
git clone https://github.com/leanprover/fp-lean.git fp-lean-original
```

## 翻译原则

1. **保留代码原样**：Lean 代码、命令行命令、输出结果均保持英文原文，便于直接复制运行。
2. **术语对照**：首次出现的重要术语会给出英文原词，例如：
   - evaluation：求值
   - type：类型
   - function application：函数应用
   - side effect：副作用
   - IO action：IO 动作
   - polymorphism：多态性
   - pattern matching：模式匹配
3. **step-by-step 解释**：保持原书的渐进式教学风格，对每一行代码和每个新概念都给出中文说明。

## 本地阅读

所有翻译文件均为 Markdown 格式，可直接用任意 Markdown 阅读器或编辑器打开。建议从 [book/zh-CN/INDEX.md](book/zh-CN/INDEX.md) 开始浏览。

## 原书信息

- 原书仓库：[leanprover/fp-lean](https://github.com/leanprover/fp-lean)
- 构建方式：进入 `book` 目录后运行 `lake exe fp-lean`，输出在 `book/out/html-multi`。
- 原书经测试的环境：
  1. Lean 4（见 `examples/lean-toolchain`）
  2. expect（v5.45.4 或近十年内的版本）
