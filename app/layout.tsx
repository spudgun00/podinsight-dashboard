import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { DataModeProvider } from "@/contexts/DataModeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PodInsightHQ - Topic Velocity Tracker",
  description: "Transform 1,000+ hours of podcast content into instant intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0A0A0A] text-white`}>
        <QueryProvider>
          <DataModeProvider>
            {children}
          </DataModeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}