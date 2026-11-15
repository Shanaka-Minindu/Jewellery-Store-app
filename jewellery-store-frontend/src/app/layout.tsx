import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
        <CartDrawer/>
        <NavDrawer />
      <Toaster position="top-right" richColors />
      <Header/>
        {children}
      </body>
    </html>
  );
}