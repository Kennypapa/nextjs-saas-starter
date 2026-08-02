import { MemberRole, Plan, SubscriptionStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { appUrl, sendEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const orgName =
      parsed.data.organizationName?.trim() ||
      `${parsed.data.name.split(" ")[0]}'s Workspace`;
    let slug = slugify(orgName) || "workspace";

    const slugTaken = await prisma.organization.findUnique({ where: { slug } });
    if (slugTaken) {
      slug = `${slug}-${randomBytes(3).toString("hex")}`;
    }

    const userRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });

    const verifyToken = randomBytes(32).toString("hex");
    const verifyExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const autoVerify = process.env.NODE_ENV !== "production";

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: parsed.data.name,
          email,
          passwordHash,
          emailVerified: autoVerify ? new Date() : null,
          roles: userRole
            ? { create: [{ roleId: userRole.id }] }
            : undefined,
        },
      });

      const org = await tx.organization.create({
        data: {
          name: orgName,
          slug,
          ownerId: created.id,
          members: {
            create: {
              userId: created.id,
              role: MemberRole.OWNER,
            },
          },
          subscription: {
            create: {
              plan: Plan.FREE,
              status: SubscriptionStatus.ACTIVE,
            },
          },
        },
      });

      await tx.verificationToken.create({
        data: {
          identifier: email,
          token: verifyToken,
          expires: verifyExpires,
        },
      });

      return { created, org };
    });

    const verifyUrl = appUrl(`/verify-email?token=${verifyToken}`);
    await sendEmail({
      to: email,
      subject: "Verify your SaaS Starter email",
      html: `<p>Welcome! <a href="${verifyUrl}">Verify your email</a> to sign in.</p><p>Or open: ${verifyUrl}</p>`,
    });

    return NextResponse.json(
      {
        ok: true,
        userId: user.created.id,
        organizationId: user.org.id,
        message: autoVerify
          ? "Account created. You can sign in now (email auto-verified in development)."
          : "Account created. Check your email to verify before signing in.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[register]", error);
    return NextResponse.json(
      { error: "Unable to create account" },
      { status: 500 },
    );
  }
}
