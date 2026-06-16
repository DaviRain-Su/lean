# 对抗性输入

在讨论“可信度”这一更宏观的问题时，人们常会提到 Lean 在面对 **对抗性输入** 时的稳健性。

一个正确实现的类型检查器，会把它接收到的输入严格限制在 Lean 类型系统的规则之内，并尊重操作者允许使用的公理。如果操作者只准许 Lean 的三条“官方”公理（`propext`、`Quot.sound`、`Classical.choice`），那么无论在何种情况下，输入文件都不应能向类型检查器提供 Prelude 中 `False` 的证明。

然而，一个最小化的类型检查器并不会主动防御那些“在逻辑上正确，却意在欺骗人工审阅者”的输入。举例来说，攻击者可能 **重新定义** 他们确信审稿人不会查看的深层依赖，或插入“Unicode 同形异义字符”，使得美化打印器的输出隐藏了对关键定义的微妙篡改。

“用户以为某定理已被形式化证明，实际上却被系统的行为误导”这一风险，被称为 **Pollack 不一致性（Pollack-inconsistency）**，Freek Wiedijk 在其论文中对此进行了探讨 [^pollack]。

从原理上讲，开发者完全可以编写软件，或扩展类型检查器，以抵御这类攻击——只是这些防护并不属于“内核所需的最小功能”。然而，Lean 用户对其强大的自定义语法与宏系统的广泛使用，的确给改进此方面的防护带来了一定挑战。对此，读者可将其视为一种[未来工作的开放议题](../future_work.md#improving-pollack-consistency)。

[^pollack]: Freek Wiedijk. Pollack-inconsistency. Electronic Notes in Theoretical Computer Science, 285:85–100, 2012