import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { Toaster } from "sonner";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://saas-starter.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SaaS Starter",
    template: "%s | SaaS Starter",
  },
  description:
    "Production-ready Next.js SaaS starter with auth, billing, teams, and RBAC.",
  keywords: [
    "SaaS",
    "Next.js",
    "Stripe",
    "Auth",
    "Multi-tenant",
    "Dashboard",
  ],
  authors: [{ name: "SaaS Starter" }],
  creator: "SaaS Starter",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "SaaS Starter",
    title: "SaaS Starter",
    description:
      "Production-ready Next.js SaaS starter with auth, billing, teams, and RBAC.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SaaS Starter",
    description:
      "Production-ready Next.js SaaS starter with auth, billing, teams, and RBAC.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${fraunces.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <ThemeProvider>
          <AuthSessionProvider>
            <QueryProvider>
              {children}
              <Toaster richColors closeButton position="top-right" />
            </QueryProvider>
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
