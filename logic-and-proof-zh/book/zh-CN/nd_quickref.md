# 附录：自然演绎规则

> 本译文对应原书 [Appendix: Natural Deduction Rules](https://leanprover.github.io/logic_and_proof/nd_quickref.html)；英文 Sphinx 源：`nd_quickref.rst`（含 `inference_rules_for_propositional_logic.rst` 与 `inference_rules_for_first_order_logic.rst`）。

本附录汇总全书使用的自然演绎推理规则，便于速查。详细说明见[第 3 章](natural_deduction_for_propositional_logic.md)与[第 8 章](natural_deduction_for_first_order_logic.md)。

## 命题逻辑

_蕴涵：_

![推理规则 1](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.8.png)

_合取：_

![推理规则 2](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.9.png)

_否定：_

![推理规则 3](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.10.png)

_析取：_

![推理规则 4](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.11.png)

_真与假：_

![推理规则 5](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.12.png)

_双向蕴涵：_

![推理规则 6](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.13.png)

_反证法（reductio ad absurdum）：_

![推理规则 7](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.14.png)

## 一阶逻辑

_全称量词：_

![推理规则 8](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_first_order_logic.1.png)

在引入规则中，$x$ 不应在任何未取消的假设中自由出现。在消去规则中，$t$ 可以是任意不与 $A$ 中任何约束变量冲突的项。

_存在量词：_

![推理规则 9](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_first_order_logic.2.png)

在引入规则中，$t$ 可以是任意不与 $A$ 中任何约束变量冲突的项。在消去规则中，$y$ 不应在 $B$ 或任何未取消的假设中自由出现。

_相等：_

![推理规则 10](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_first_order_logic.3.png)

严格说，只有 $\mathrm{refl}$ 与第二条代入规则是必需的，其余可由它们推出。