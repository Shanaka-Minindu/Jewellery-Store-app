import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Toaster } from "sonner";
import { CartDrawer } from "@/components/CartDrawer";
import { Header } from "@/components/Header";
import { NavDrawer } from "@/components/NavDrawer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jewellery Store",
  description: "Enterprise Online Jewellery Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <CartDrawer />
        <NavDrawer />
        <Toaster position="top-right" richColors />
        
        {/* Wrap Header in Suspense to satisfy client-side hooks like usePathname during prerender */}
        <Suspense fallback={<div className="h-20 bg-transparent" />}>
          <Header />
        </Suspense>

        {children}
      </body>
    </html>
  );
}