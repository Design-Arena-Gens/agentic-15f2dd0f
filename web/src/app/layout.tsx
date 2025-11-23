import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { getAuth } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CrowdTester",
  description: "Lightweight crowdtesting platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const auth = await getAuth();
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 min-h-screen`}> 
        <header className="border-b bg-white">
          <nav className="mx-auto max-w-5xl flex items-center justify-between p-4">
            <Link href="/" className="font-semibold text-lg">CrowdTester</Link>
            <div className="flex items-center gap-4">
              {auth ? (
                <>
                  <span className="text-sm text-zinc-700">{auth.name} ({auth.role})</span>
                  <Link href="/dashboard" className="px-3 py-1.5 rounded bg-black text-white text-sm">Dashboard</Link>
                  <form action="/api/auth/logout" method="post">
                    <button className="px-3 py-1.5 rounded border text-sm">Logout</button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm">Login</Link>
                  <Link href="/register" className="px-3 py-1.5 rounded bg-black text-white text-sm">Sign up</Link>
                </>
              )}
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl p-6">{children}</main>
      </body>
    </html>
  );
}
