import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      organizationId?: string | null;
      organizationSlug?: string | null;
      memberRole?: string | null;
      permissions: string[];
    } & DefaultSession["user"];
  }

  interface User {
    organizationId?: string | null;
    organizationSlug?: string | null;
    memberRole?: string | null;
    permissions?: string[];
  }
}

async function getUserAuthContext(userId: string) {
  const [membership, roleLinks] = await Promise.all([
    prisma.membership.findFirst({
      where: { userId },
      include: { organization: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    }),
  ]);

  const permissions = Array.from(
    new Set(
      roleLinks.flatMap((link) =>
        link.role.permissions.map(
          (rp) => `${rp.permission.resource}:${rp.permission.action}`,
        ),
      ),
    ),
  );

  return {
    organizationId: membership?.organizationId ?? null,
    organizationSlug: membership?.organization.slug ?? null,
    memberRole: membership?.role ?? null,
    permissions,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });

        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );
        if (!valid) return null;

        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        const ctx = await getUserAuthContext(user.id);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          ...ctx,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.organizationId = user.organizationId;
        token.organizationSlug = user.organizationSlug;
        token.memberRole = user.memberRole;
        token.permissions = user.permissions ?? [];
      }

      if (trigger === "update" && session) {
        token.name = session.name ?? token.name;
      }

      if (token.id && (!token.permissions || trigger === "update")) {
        const ctx = await getUserAuthContext(token.id as string);
        token.organizationId = ctx.organizationId;
        token.organizationSlug = ctx.organizationSlug;
        token.memberRole = ctx.memberRole;
        token.permissions = ctx.permissions;
      }

      return token;
    },
  },
});
