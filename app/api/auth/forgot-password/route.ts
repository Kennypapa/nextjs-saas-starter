import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { appUrl, sendEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    // Always succeed to avoid email enumeration
    if (user) {
      await prisma.passwordResetToken.deleteMany({ where: { email } });
      const token = randomBytes(32).toString("hex");
      await prisma.passwordResetToken.create({
        data: {
          email,
          token,
          expires: new Date(Date.now() + 1000 * 60 * 60),
        },
      });

      const resetUrl = appUrl(`/reset-password?token=${token}`);
      await sendEmail({
        to: email,
        subject: "Reset your SaaS Starter password",
        html: `<p><a href="${resetUrl}">Reset your password</a></p><p>Or open: ${resetUrl}</p>`,
      });
    }

    return NextResponse.json({
      ok: true,
      message: "If that email exists, a reset link was sent.",
    });
  } catch (error) {
    console.error("[forgot-password]", error);
    return NextResponse.json(
      { error: "Unable to process request" },
      { status: 500 },
    );
  }
}
