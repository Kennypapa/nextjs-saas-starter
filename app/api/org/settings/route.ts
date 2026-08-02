import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const settingsSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, hyphens"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const org = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
    select: { id: true, name: true, slug: true },
  });

  return NextResponse.json({ organization: org });
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.permissions, "org:manage")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = settingsSchema.safeParse({
      ...body,
      slug: body.slug ? slugify(body.slug) : undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const clash = await prisma.organization.findFirst({
      where: {
        slug: parsed.data.slug,
        NOT: { id: session.user.organizationId },
      },
    });
    if (clash) {
      return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
    }

    const organization = await prisma.organization.update({
      where: { id: session.user.organizationId },
      data: parsed.data,
      select: { id: true, name: true, slug: true },
    });

    return NextResponse.json({ organization });
  } catch (error) {
    console.error("[org/settings]", error);
    return NextResponse.json(
      { error: "Unable to update settings" },
      { status: 500 },
    );
  }
}
