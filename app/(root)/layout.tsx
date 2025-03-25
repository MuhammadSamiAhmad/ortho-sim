import { ReactNode } from "react";
import Navbar from "@/components/Navbar";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative overflow-x-hidden">
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

export default RootLayout;
