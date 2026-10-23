import "server-only"

import { Resend } from "resend"

export const resend = new Resend(process.env.RESEND_API_KEY)

/* ui.krutikraut.com is verified in Resend, so any local part works. */
export const EMAIL_FROM = process.env.EMAIL_FROM ?? "creative-ui <noreply@ui.krutikraut.com>"
