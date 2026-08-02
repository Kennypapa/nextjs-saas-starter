"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    async function verify() {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        setStatus("error");
        toast.error("Verification failed");
        return;
      }

      setStatus("success");
      toast.success("Email verified!");
      setTimeout(() => router.push("/login"), 2000);
    }

    verify();
  }, [token, router]);

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-destructive">Invalid verification link.</p>
        <Link href="/login" className="text-sm text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="space-y-4 text-center">
        <Skeleton className="mx-auto h-10 w-10 rounded-full" />
        <p className="text-sm text-muted-foreground">Verifying your email…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-destructive">
          This verification link is invalid or has expired.
        </p>
        <Button href="/login" variant="outline">
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-muted-foreground">
        Your email has been verified. Redirecting to sign in…
      </p>
      <Button href="/login">Sign in</Button>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Verify email
        </h1>
        <p className="text-sm text-muted-foreground">
          Confirming your email address
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4 text-center">
            <Skeleton className="mx-auto h-10 w-10 rounded-full" />
            <Skeleton className="mx-auto h-4 w-48" />
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
