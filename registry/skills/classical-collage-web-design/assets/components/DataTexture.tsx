/* eslint-disable */
// @ts-nocheck
// Reference file from a Claude skill: type-checking and lint are off so it can't break your project.
// If you copy it into your app, install the packages it imports and delete these four lines.
/** Faint monospace "system text" behind a hero (Aureon signature). Server component. */
const TOKENS = {
  finance: ['SETTLEMENT_STATUS: COMPLETE', 'TXN_ID 0x8F2C7A91', 'API_RESPONSE 200 OK', 'LEDGER_SYNC OK', 'FX_RATE USD/EUR 0.9213', 'ENCRYPTION AES-256', 'NODE FRA-02', 'LATENCY 12MS', 'BALANCE_CHECK PASSED', 'AMOUNT 248,560.00', 'NETWORK GLOBAL', 'KYC VERIFIED'],
  ai: ['EVAL_RUN 2041', 'PREF_SCORE 0.82', 'TOKENS 4,096', 'RATER_ID R-1182', 'MODEL_A WIN', 'TRAJECTORY_LEN 312', 'DATASET IMAGE/VIDEO', 'AGREEMENT 0.91', 'STATUS COMPLETE', 'SEED 7731', 'LATENCY 840MS', 'BENCHMARK V3'],
};

function seeded(n: number) { let s = n; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }

export function DataTexture({ kind = 'finance', rows = 48 }: { kind?: keyof typeof TOKENS; rows?: number }) {
  const rand = seeded(42);
  const list = TOKENS[kind];
  const lines = Array.from({ length: rows }, () =>
    Array.from({ length: 8 }, () => list[Math.floor(rand() * list.length)] + ' '.repeat(2 + Math.floor(rand() * 6))).join(''),
  );
  return <div aria-hidden className="data-texture">{lines.join('\n')}</div>;
}
