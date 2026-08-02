import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ErrorBoundary } from "@/components/error-boundary";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <DashboardShell
      userName={session.user.name}
      userEmail={session.user.email}
      permissions={session.user.permissions ?? []}
    >
      <ErrorBoundary>{children}</ErrorBoundary>
    </DashboardShell>
  );
}
