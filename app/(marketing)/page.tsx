import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-4 py-24 sm:px-6">
      <div
        aria-hidden
        className="animate-gradient pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-100 via-slate-50 to-slate-100 dark:from-teal-950/40 dark:via-slate-950 dark:to-slate-900"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-teal-400/20 blur-3xl dark:bg-teal-500/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-slate-400/10 blur-3xl dark:bg-slate-600/10"
      />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <p
          className="animate-fade-up mb-4 text-sm font-medium uppercase tracking-widest text-primary"
          style={{ animationDelay: "0ms" }}
        >
          SaaS Starter
        </p>
        <h1
          className="animate-fade-up font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl"
          style={{ animationDelay: "80ms" }}
        >
          Ship your SaaS product with confidence
        </h1>
        <p
          className="animate-fade-up mx-auto mt-6 max-w-xl text-lg text-muted-foreground"
          style={{ animationDelay: "160ms" }}
        >
          Auth, billing, teams, and RBAC — wired together in a production-ready
          Next.js foundation so you can focus on what makes your product unique.
        </p>
        <div
          className="animate-fade-up mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          style={{ animationDelay: "240ms" }}
        >
          <Button href="/register" size="lg">
            Start free trial
          </Button>
          <Button href="/pricing" variant="outline" size="lg">
            View pricing
          </Button>
        </div>
      </div>
    </section>
  );
}
