# simp normal form

> 对应英文：[Simp Normal Forms](https://lean-lang.org/doc/reference/latest/The-Simplifier/Simp-Normal-Forms/)，抓取日期：2026-06-16。

某个表达式在默认 simp set 下反复应用 `simp`、直到再无规则可用时得到的结果，称为它的 **simp normal form**。

## 重要事实

`simp` 并不保证 confluence。也就是说，一个表达式的最终 normal form 可能取决于规则应用顺序和优先级。因此，设计良好的 simp lemma 和 simp set 非常关键。

## 设计原则

### 右侧应当已经是 normal form

若某条 simp lemma 的右侧本身还会被另外的 simp lemma 进一步改写，往往说明它不是好设计。右侧越接近最终 normal form，simplification 越稳定，也越容易终止。

### 同一概念应有单一规范表达

若一个概念有多种等价表述，而不同 simp lemma 又分别把它们导向不同形式，simplifier 就可能缺少“桥接”步骤，导致某些简化无法发生。为库设计 simp normal form 时，应尽量为每类概念选定单一规范表达。

### 默认 simp set 是库接口的一部分

一个库暴露的不只是类型签名，还包括“导入后 `simp` 的行为”。因此，simp normal form 应具有可预测性，而不是依赖偶然顺序。

## 对库作者的建议

- 若库依赖某些额外规则但这些规则不属于本库接口，不要把它们加入默认 simp set；
- 考虑建立自定义 simp set 或封装一个专门 tactic；
- 把“simp 后应该长什么样”当作库设计的一部分来审视。
