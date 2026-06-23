import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/lib/LangContext";

export const metadata: Metadata = {
  title: "Trekly Agency Panel",
  description: "Manage your nature tours and bookings with Trekly",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body><LangProvider>{children}</LangProvider></body>
    </html>
  );
}
