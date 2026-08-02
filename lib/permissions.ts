export type Permission =
  | "users:read"
  | "users:manage"
  | "billing:read"
  | "billing:manage"
  | "org:read"
  | "org:manage"
  | "members:read"
  | "members:manage"
  | "roles:read"
  | "roles:manage";

export const ALL_PERMISSIONS: Permission[] = [
  "users:read",
  "users:manage",
  "billing:read",
  "billing:manage",
  "org:read",
  "org:manage",
  "members:read",
  "members:manage",
  "roles:read",
  "roles:manage",
];

export function permissionKey(resource: string, action: string) {
  return `${resource}:${action}` as Permission;
}

export function hasPermission(
  userPermissions: string[] | undefined,
  required: Permission | Permission[],
) {
  if (!userPermissions?.length) return false;
  const needed = Array.isArray(required) ? required : [required];
  return needed.every((p) => userPermissions.includes(p));
}

export function hasAnyPermission(
  userPermissions: string[] | undefined,
  required: Permission[],
) {
  if (!userPermissions?.length) return false;
  return required.some((p) => userPermissions.includes(p));
}
