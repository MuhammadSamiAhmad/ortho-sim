import type { Metadata } from "next";
import { Faustina } from "next/font/google";
import "./globals.css";

const faustina = Faustina({
  subsets: ["latin"],
  weight: ["300", "800"],
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
      <body className={`${faustina.className}`}>{children}</body>
    </html>
  );
}
