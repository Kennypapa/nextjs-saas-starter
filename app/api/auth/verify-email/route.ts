import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token : "";

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record || record.expires < new Date()) {
      return NextResponse.json(
        { error: "Verification link is invalid or expired" },
        { status: 400 },
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { email: record.identifier },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: record.identifier,
            token: record.token,
          },
        },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      message: "Email verified. You can sign in now.",
    });
  } catch (error) {
    console.error("[verify-email]", error);
    return NextResponse.json(
      { error: "Unable to verify email" },
      { status: 500 },
    );
  }
}
