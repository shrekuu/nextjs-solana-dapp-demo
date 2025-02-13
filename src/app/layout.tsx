import type { Metadata } from "next";
import "./globals.css";
import SolanaProviders from "./SolanaProviders";
import { Toaster } from "react-hot-toast";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Next.js + Solana",
  description: "A demo app for Next.js + Solana",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <SolanaProviders>
          <Toaster />
          {children}
        </SolanaProviders>
      </body>
    </html>
  );
}
