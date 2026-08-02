/**
 * Dev-friendly mailer. In production, swap for Resend/SendGrid/SES.
 * Tokens are logged so local flows stay testable without SMTP.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (process.env.NODE_ENV !== "production") {
    console.info("[mail:dev]", { to, subject, html });
    return { ok: true as const };
  }

  // Production: integrate your provider here.
  console.info("[mail]", { to, subject });
  return { ok: true as const };
}

export function appUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}
