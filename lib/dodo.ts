import "server-only"

import DodoPayments from "dodopayments"

let client: DodoPayments | undefined

/* Created on first use so a build without the keys still succeeds. Reads DODO_PAYMENTS_API_KEY
   and DODO_PAYMENTS_WEBHOOK_KEY from the environment. */
export function dodo() {
  client ??= new DodoPayments({
    environment: process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode",
  })
  return client
}
