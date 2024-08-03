import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ClientProvider from '../components/ClientProvider';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pantry App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <GoogleAnalytics />
      <body className={inter.className}><ClientProvider>{children}</ClientProvider></body>
    </html>
  );
}
