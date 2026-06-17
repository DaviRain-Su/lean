# Lean 策略索引

> 本译文对应原书 [Index of Lean tactics](https://hrmacbeth.github.io/math2001/Index_of_Tactics.html)；英文 Sphinx 源：`Index_of_Tactics.rst`。

标有 \* 的策略是本书特有的，你无法通过谷歌或论坛等途径获得帮助。请重读书中相应部分，或向授课教师请教！

### \* `addarith`（首次使用：[第 1.5 节](01_Proofs_by_Calculation.md#15-一种捷径)）

尝试通过把项从左端移到右端（或反之）来解决等式或不等式。

### `apply`（首次使用：[第 2.2 节](02_Proofs_with_Structure.md#22-调用引理)；对 $\forall$ 与 $\to$ 假设：[第 4.1 节](04_Proofs_with_Structure_II.md#41-对所有与蕴涵)）

调用指定的引理或假设来修改目标。

### `by_cases`（首次使用：[第 5.2 节](05_Logic.md#52-排中律)）

对给定陈述为真或为假进行分情形讨论。

### \* `cancel`（首次使用：[第 2.1 节](02_Proofs_with_Structure.md#21-中间步骤)）

消去等式/不等式左右两边的公因子，消去两边共同的指数运算等。

### `constructor`（首次使用：[第 2.4 节](02_Proofs_with_Structure.md#24-与land)；对 `↔` 目标：[第 4.2 节](04_Proofs_with_Structure_II.md#42-当且仅当)）

把「与」（$\land$）目标拆成左右两部分的子目标。

### `contradiction`（首次使用：[第 4.4 节](04_Proofs_with_Structure_II.md#44-矛盾的假设)）

若有两个互相矛盾的假设可用，则以此结束证明。

### `dsimp`（首次使用：[第 3.1 节](03_Parity_and_Divisibility.md#31-定义奇偶)）

展开定义。通常在证明过程中使用，而非出现在最终版本里；它有助于更仔细地检查目标或假设，但在多数情况下，删掉 `dsimp` 那一行证明仍然成立。

### \* `extra`（首次使用：[第 1.4 节](01_Proofs_by_Calculation.md#14-证明不等式)；对同余：[第 3.4 节](03_Parity_and_Divisibility.md#34-模算术计算)）

用于不等式或其他关系（如同余）的比较策略：检查两边相差一个正量加法的不等式、两边相差 3 的倍数而模 3 同余的陈述等。

### `interval_cases`（首次使用：[第 4.1 节](04_Proofs_with_Structure_II.md#41-对所有与蕴涵)）

对自然数或整数变量 $n$，在已知数值上下界时，为 $n$ 的每个数值可能产生一个情形。

### `intro`（首次使用：[第 4.1 节](04_Proofs_with_Structure_II.md#41-对所有与蕴涵)；对 $\lnot$ 目标：[第 4.5 节](04_Proofs_with_Structure_II.md#45-反证法)）

从目标中引入全称量词变量（$\forall$）或蕴涵的前件（$\to$），或对否定（$\lnot$）目标（为反证）假设其肯定形式。

### `left`（首次使用：[第 2.3 节](02_Proofs_with_Structure.md#23-或lor与分情形证明)）

选择「或」（$\lor$）目标的左支。

### `have`（首次使用：[第 2.1 节](02_Proofs_with_Structure.md#21-中间步骤)；配合引理：[第 2.3 节](02_Proofs_with_Structure.md#23-或lor与分情形证明)；引入新目标：[第 2.4 节](02_Proofs_with_Structure.md#24-与land)）

记录一个事实（后接该事实的证明），随后可作为额外假设使用。

### `mod_cases`（首次使用：[第 3.4 节](03_Parity_and_Divisibility.md#34-模算术计算)）

按变量对指定数取模的余数引入情形。

### \* `numbers`（首次使用：[第 1.4 节](01_Proofs_by_Calculation.md#14-证明不等式)；配合 `at` 用于矛盾：[第 4.4 节](04_Proofs_with_Structure_II.md#44-矛盾的假设)）

证明数值事实，如 $3\cdot 12 < 13 + 25$ 或 $3\cdot 5+1=4\cdot 4$。

### `obtain`（对 $\lor$ 首次使用：[第 2.3 节](02_Proofs_with_Structure.md#23-或lor与分情形证明)；对 $\land$：[第 2.4 节](02_Proofs_with_Structure.md#24-与land)；对 $\exists$：[第 2.5 节](02_Proofs_with_Structure.md#25-存在exists证明)）

拆开形如「或」（$\lor$）、「与」（$\land$）或「存在」（$\exists$）的假设。

### `push_neg`（首次使用：[第 5.3 节](05_Logic.md#53-否定的范式)）

把假设或目标化为逻辑等价形式，并尽可能把否定向内推。

### `rel`（首次使用：[第 1.4 节](01_Proofs_by_Calculation.md#14-证明不等式)；对同余：[第 3.4 节](03_Parity_and_Divisibility.md#34-模算术计算)；对逻辑等价：[第 5.3 节](05_Logic.md#53-否定的范式)）

类似「代入」的策略，用于不等式或其他关系（如同余）：在目标中寻找指定不等式（或同余等）事实的左端，若该替换是「显然」有效的不等式（或模算术等）推理，则将其替换为该事实的右端。可与 `rw` 比较。

### `right`（首次使用：[第 2.3 节](02_Proofs_with_Structure.md#23-或lor与分情形证明)）

选择「或」（$\lor$）目标的右支。

### `ring`（首次使用：[第 1.2 节](01_Proofs_by_Calculation.md#12-在-lean-中证明等式)）

解决代数等式目标，如 $(x + y) ^ 2 = x ^ 2 + 2xy + y ^ 2$，当证明实质上就是「两边展开并重排」时。

### `rw`（首次使用：[第 1.2 节](01_Proofs_by_Calculation.md#12-在-lean-中证明等式)；对 `↔` 假设/引理：[第 4.2 节](04_Proofs_with_Structure_II.md#42-当且仅当)）

代入：在目标中寻找指定等式事实的左端，并将其替换为该事实的右端。

对 `↔` 假设/引理，把指定 `↔` 事实的左端替换为右端。

### `use`（首次使用：[第 2.5 节](02_Proofs_with_Structure.md#25-存在exists证明)）

为存在（$\exists$）目标提供一个见证。