import type { Metadata } from "next";
import Link from "next/link";
import { Roboto, Roboto_Mono } from "next/font/google";
import { GdgDots } from "@/components/gdg-dots";
import { HeaderAuth } from "@/components/header-auth";
import { LoadingIndicator } from "@/components/loading-indicator";
import "./globals.css";

// GDG's brand guidelines specify "Google Sans" / "Google Sans Mono" as the
// typefaces, but those are proprietary Google fonts with no public Google
// Fonts entry. Roboto is Google's own open-source Material Design typeface
// and the standard public substitute for Google Sans in non-Google-internal
// material — closest openly-licensed match to the brand spec.
const googleSans = Roboto({
  variable: "--font-google-sans",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

const googleSansMono = Roboto_Mono({
  variable: "--font-google-sans-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GDGoC",
  description: "Google Developer Groups on Campus — membership and events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      style={{ colorScheme: "light" }}
      className={`${googleSans.variable} ${googleSansMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <header className="sticky top-0 z-10 bg-background border-b border-black/10">
          <nav className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
              <GdgDots />
              GDGoC
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/events" className="hover:text-gdg-blue transition-colors">
                Events <LoadingIndicator />
              </Link>
              <Link href="/merch" className="hover:text-gdg-green transition-colors">
                Merch <LoadingIndicator />
              </Link>
              <Link href="/about" className="hover:text-gdg-yellow transition-colors">
                About <LoadingIndicator />
              </Link>
              <Link href="/apply" className="btn-press rounded-full bg-gdg-blue text-white px-4 py-1.5 font-medium">
                Apply
              </Link>
              <HeaderAuth />
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-black/10 py-10">
          <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-between gap-6 text-sm">
            <div className="flex items-center gap-2 font-medium">
              <GdgDots />
              GDGoC
            </div>
            <div className="flex gap-8 opacity-70">
              <Link href="/about">About GDG</Link>
              <Link href="/events">Events</Link>
              <Link href="/privacy-policy">Privacy Policy</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
