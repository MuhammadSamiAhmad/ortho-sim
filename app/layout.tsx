import type React from "react";
import type { Metadata } from "next";
import { Faustina } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeProvider } from "@/components/ui/theme-provider";

const faustina = Faustina({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-faustina",
});

export const metadata: Metadata = {
  title: "OrthoSim - Orthopedic Surgery Simulator",
  description:
    "VR-based orthopedic surgery simulator for intramedullary nailing of the tibia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${faustina.className}`}>
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
