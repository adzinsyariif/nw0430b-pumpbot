# Early Flow Scalper — Pump.fun Bot Sprint entry

[![make.fun · u-riidzhsn-pump-fun-bot-sprint-make-bot-and-win-cb203fed](https://make.fun/badge/u-riidzhsn-pump-fun-bot-sprint-make-bot-and-win-cb203fed.svg)](https://make.fun/bounty/u-riidzhsn-pump-fun-bot-sprint-make-bot-and-win-cb203fed?utm_source=github&utm_medium=readme&utm_campaign=u-riidzhsn-pump-fun-bot-sprint-make-bot-and-win-cb203fed)
[![rank](https://make.fun/badge/u-riidzhsn-pump-fun-bot-sprint-make-bot-and-win-cb203fed/adzinsyariif/nw0430b-pumpbot/rank.svg)](https://make.fun/bounty/u-riidzhsn-pump-fun-bot-sprint-make-bot-and-win-cb203fed/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-riidzhsn-pump-fun-bot-sprint-make-bot-and-win-cb203fed)
[![reward](https://make.fun/badge/u-riidzhsn-pump-fun-bot-sprint-make-bot-and-win-cb203fed/adzinsyariif/nw0430b-pumpbot/reward.svg)](https://make.fun/bounty/u-riidzhsn-pump-fun-bot-sprint-make-bot-and-win-cb203fed?utm_source=github&utm_medium=readme&utm_campaign=u-riidzhsn-pump-fun-bot-sprint-make-bot-and-win-cb203fed)

Bounty: https://make.fun/bounty/u-riidzhsn-pump-fun-bot-sprint-make-bot-and-win-cb203fed

A deterministic trading bot for the `agent-fun/replay/v2` pump.fun bonding-curve replay.
It runs as `node main.ts` with no dependencies and no network: the protocol shim in
`vendor/makefun-bot.ts` is the kit's SDK file vendored byte for byte, and the strategy
lives in `strategy.ts`.

## Strategy

The dev window is unforgiving: every house reference bot loses money on it after fees.
So this bot is built around fee discipline first and signal second.

**Entries — early, flow-confirmed scalps.** Each curve is watched from its CreateEvent.
A buy is only considered in the first 30 slots of a coin's life, while the curve holds
between 2 and 25 SOL of real reserves (enough that a meaningful buy fits under the
1%-of-reserve order cap and an exit has liquidity). Over a 12-slot window the tape must
show at least 0.5 SOL of net inflow from at least 3 distinct buyers, no single wallet
accounting for more than 60% of buy volume, the price up 3–80% and sitting at 95% or
more of its window high, with flow not decelerating. A creator sell inside the window
vetoes the entry.

**Sizing.** One 0.05 SOL buy per coin (capped at 97% of the per-reply size cap), never
below 0.015 SOL so the fixed per-order transaction fee stays a small share of the trade.
At most 4 main positions and 1.0 SOL of total cost exposure at once; sizes halve when
equity sags below 8.5 SOL and stop below 7.5 SOL.

**Exits — fast, valued at liquidation.** Positions are valued at what a sell would
actually pay after curve fees, never at the marginal price. The whole position is sold
on the first of: −7% against cost, +10% take-profit, a 6% trailing stop once up 5%, 25
slots held, the creator selling, or net outflow of 0.5 SOL over 6 slots. Sells go out
with wide slippage so exits fill.

**Guardrails.** If round trips on distinct coins lag the pace needed for the 20-coin
minimum bar, small 0.02 SOL probe round trips run on the most liquid curve available.
Entry thresholds are never relaxed — on the dev window that only added losing trades.

**Determinism.** No clock, no randomness, no I/O. Iteration is over insertion-ordered
maps fed by the batch stream, with ties broken on the mint string, so the two graded
executions produce byte-identical action logs (verified locally: identical
`result_sha256` across repeated grades).

## Dev-window results (local grade, `grade-local --driver process`)

Six variants were graded on the kit's dev window; the shipped one is the best compliant
result. All house references lose money on this window, so the goal was the least-bad,
fee-aware profile with a wide guardrail margin:

| Variant | Net PnL (SOL) | Fills | Coins | Max DD | Compliant |
|---|---|---|---|---|---|
| V1 selective momentum, pyramided | −2.038 | 497 | 105 | 21.1% | yes |
| V2 strict momentum, fast exits | −0.335 | 121 | 62 | 5.5% | yes |
| V3 let-winners-run (wide TP) | −0.791 | 144 | 62 | 11.4% | yes |
| **V4 early flow scalp (shipped)** | **−0.294** | **487** | **245** | **3.0%** | **yes** |
| V5 V4 with wider TP / bigger size | −0.403 | 394 | 198 | 6.4% | yes |
| V6 V4 even faster + creator-sell veto | −0.320 | 442 | 223 | 3.2% | yes |

House references on the same window: hold-cash 0.000 (not compliant, 0 coins),
equal-weight −0.019 (not compliant, 1 counted coin), pilot momentum −9.460 (not
compliant, 95.6% drawdown), pilot sniper −0.468 (compliant), pilot reversion −3.887
(compliant).

Shipped variant detail: net PnL −0.2942 SOL, 487 fills, 245 distinct coins with
counted round trips (bar: 20), max drawdown 3.02% (bar: 50%), win rate 24.5%,
90% bootstrap interval [−0.505, −0.098] SOL, `action_log_sha256`
`25a86c29b0c67e9771829aa0583f47f8f4b7d75bb0e4656555636054a7b71a22` (identical across
repeated grades of the shipped code, including the committed HEAD).

## Layout

- `main.ts` — entrypoint; wires the strategy to the vendored SDK shim.
- `strategy.ts` — the strategy and its parameters.
- `vendor/makefun-bot.ts` — kit SDK shim, vendored unchanged.
- `.makefun/owner.json` — repository claim file.
- `LICENSE` — MIT.
