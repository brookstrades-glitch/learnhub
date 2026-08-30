import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "LearnHub", template: "%s · LearnHub" },
  description: "Simple online courses.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="border-t py-6 text-center text-xs text-muted-foreground">
          LearnHub
        </footer>
      </body>
    </html>
  );
}
