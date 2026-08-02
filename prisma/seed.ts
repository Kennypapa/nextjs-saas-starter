import {
  MemberRole,
  Plan,
  PrismaClient,
  SubscriptionStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const permissions = [
  { resource: "users", action: "read", description: "View users" },
  { resource: "users", action: "manage", description: "Manage users" },
  { resource: "billing", action: "read", description: "View billing" },
  { resource: "billing", action: "manage", description: "Manage billing" },
  { resource: "org", action: "read", description: "View organization" },
  { resource: "org", action: "manage", description: "Manage organization" },
  { resource: "members", action: "read", description: "View members" },
  { resource: "members", action: "manage", description: "Invite/manage members" },
  { resource: "roles", action: "read", description: "View roles" },
  { resource: "roles", action: "manage", description: "Manage roles" },
];

async function main() {
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: {
        action_resource: {
          action: permission.action,
          resource: permission.resource,
        },
      },
      update: { description: permission.description },
      create: permission,
    });
  }

  const allPermissions = await prisma.permission.findMany();

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: { description: "Full access" },
    create: { name: "ADMIN", description: "Full access" },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: "MANAGER" },
    update: { description: "Team + billing" },
    create: { name: "MANAGER", description: "Team + billing" },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "USER" },
    update: { description: "Standard member" },
    create: { name: "USER", description: "Standard member" },
  });

  await prisma.rolePermission.deleteMany({ where: { roleId: adminRole.id } });
  await prisma.rolePermission.createMany({
    data: allPermissions.map((p) => ({
      roleId: adminRole.id,
      permissionId: p.id,
    })),
  });

  const managerPerms = allPermissions.filter((p) =>
    ["billing:read", "billing:manage", "members:read", "members:manage", "org:read", "users:read"].includes(
      `${p.resource}:${p.action}`,
    ),
  );
  await prisma.rolePermission.deleteMany({ where: { roleId: managerRole.id } });
  await prisma.rolePermission.createMany({
    data: managerPerms.map((p) => ({
      roleId: managerRole.id,
      permissionId: p.id,
    })),
  });

  const userPerms = allPermissions.filter((p) =>
    ["org:read", "members:read", "billing:read", "users:read"].includes(
      `${p.resource}:${p.action}`,
    ),
  );
  await prisma.rolePermission.deleteMany({ where: { roleId: userRole.id } });
  await prisma.rolePermission.createMany({
    data: userPerms.map((p) => ({
      roleId: userRole.id,
      permissionId: p.id,
    })),
  });

  const passwordHash = await bcrypt.hash("Admin123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      name: "Admin User",
      passwordHash,
      emailVerified: new Date(),
    },
    create: {
      email: "admin@example.com",
      name: "Admin User",
      passwordHash,
      emailVerified: new Date(),
      roles: { create: [{ roleId: adminRole.id }] },
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId: admin.id, roleId: adminRole.id },
    },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });

  const org = await prisma.organization.upsert({
    where: { slug: "acme" },
    update: { name: "Acme Inc", ownerId: admin.id },
    create: {
      name: "Acme Inc",
      slug: "acme",
      ownerId: admin.id,
      members: {
        create: {
          userId: admin.id,
          role: MemberRole.OWNER,
        },
      },
      subscription: {
        create: {
          plan: Plan.PRO,
          status: SubscriptionStatus.ACTIVE,
        },
      },
    },
  });

  await prisma.membership.upsert({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: admin.id,
      },
    },
    update: { role: MemberRole.OWNER },
    create: {
      organizationId: org.id,
      userId: admin.id,
      role: MemberRole.OWNER,
    },
  });

  console.log("Seed complete");
  console.log("Admin login: admin@example.com / Admin123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
