import "./globals.css";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Footer } from "@/components/Footer";
import { ToastProvider, Toaster } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "UNAWATUNA",
  description: "Tech + Relax Nordic e-commerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>
        <ToastProvider>
          <Header />
          <main className="mx-auto max-w-[1200px] px-4 pt-10 pb-24 md:pb-10">
            {children}
          </main>
          <Footer />
          <BottomNav />
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  );
}
