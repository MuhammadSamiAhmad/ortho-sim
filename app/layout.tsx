import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OrthoSim",
  description: "VR administration system for orthopedic surgery simulation",
  keywords: "VR, Orthopedic Surgery, Simulation, Surgery",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
