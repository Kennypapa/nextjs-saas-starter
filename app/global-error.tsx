"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center text-slate-900">
        <AlertTriangle className="h-10 w-10 text-red-600" />
        <div>
          <h1 className="text-2xl font-semibold">Application error</h1>
          <p className="mt-2 text-sm opacity-70">
            {error.message || "A critical error occurred."}
          </p>
        </div>
        <Button onClick={reset}>Try again</Button>
      </body>
    </html>
  );
}
