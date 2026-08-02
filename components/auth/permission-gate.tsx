"use client";

import { usePermissions } from "@/components/auth/permissions-context";

interface PermissionGateProps {
  permission: string;
  permissions?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  permission,
  permissions: permissionsProp,
  children,
  fallback = null,
}: PermissionGateProps) {
  const contextPermissions = usePermissions();
  const permissions = permissionsProp ?? contextPermissions;
  const allowed = permissions.includes(permission);

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
