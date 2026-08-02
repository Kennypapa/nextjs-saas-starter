import { MemberRole } from "@prisma/client";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { appUrl, sendEmail } from "@/lib/mail";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.permissions, "members:manage")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parsed = inviteSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const token = randomBytes(32).toString("hex");

    const invitation = await prisma.invitation.create({
      data: {
        email,
        organizationId: session.user.organizationId,
        role: parsed.data.role as MemberRole,
        token,
        invitedById: session.user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
      include: { organization: true },
    });

    const inviteUrl = appUrl(`/register?invite=${token}`);
    await sendEmail({
      to: email,
      subject: `Join ${invitation.organization.name} on SaaS Starter`,
      html: `<p>You were invited to ${invitation.organization.name}.</p><p><a href="${inviteUrl}">Accept invite</a></p>`,
    });

    return NextResponse.json({ ok: true, invitationId: invitation.id });
  } catch (error) {
    console.error("[team/invite]", error);
    return NextResponse.json(
      { error: "Unable to send invite" },
      { status: 500 },
    );
  }
}
