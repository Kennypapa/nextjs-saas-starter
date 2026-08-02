"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PermissionsProvider } from "@/components/auth/permissions-context";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/team", label: "Team" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/dashboard/profile", label: "Profile" },
];

interface DashboardShellProps {
  children: React.ReactNode;
  userName?: string | null;
  userEmail?: string | null;
  permissions: string[];
}

export function DashboardShell({
  children,
  userName,
  userEmail,
  permissions,
}: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <PermissionsProvider permissions={permissions}>
      <div className="flex min-h-screen bg-background">
        <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:flex md:flex-col">
          <div className="flex h-16 items-center border-b border-border px-6">
            <Link href="/dashboard" className="font-display text-lg font-semibold">
              SaaS Starter
            </Link>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border p-4">
            <SignOutButton />
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-6">
            <div className="md:hidden">
              <Link href="/dashboard" className="font-display font-semibold">
                SaaS Starter
              </Link>
            </div>
            <nav className="flex gap-1 overflow-x-auto md:hidden">
              {navItems.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden text-right text-sm sm:block">
                <p className="font-medium">{userName ?? "User"}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </PermissionsProvider>
  );
}
