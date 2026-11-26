// Pump.fun Bot Sprint entry: flow-confirmed momentum on the agent-fun/replay/v2 harness.
// Run by the grader as `node /bot/main.ts`; the strategy lives in strategy.ts and the protocol
// in the vendored SDK shim (vendor/makefun-bot.ts, a byte-identical copy of the kit's
// sdk/ts/makefun-bot.ts).

import { runBot } from './vendor/makefun-bot.ts';
import { createStrategy, PARAMS } from './strategy.ts';

const strategy = createStrategy(PARAMS);

await runBot({
  onBatch: (state, batch) => strategy.onBatch(state, batch),
});
