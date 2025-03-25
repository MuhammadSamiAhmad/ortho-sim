"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen((prevState) => !prevState);
  };

  return (
    <div
      className={`md:block md:glass-effect bg-black/80 md:bg-black/40 absolute z-10 w-full md:w-[60%] md:rounded-3xl md:left-[20%] md:mt-10`}
    >
      <div className="text-white flex flex-col md:flex-row justify-around items-start px-4 md:px-0 md:items-center py-8">
        <div>
          <Link href="/">Logo</Link>
        </div>
        <nav
          className={`md:flex ${
            isMobileMenuOpen ? "flex" : "hidden"
          } flex-col md:flex-row justify-around items-start md:items-center w-[75%] mt-4 md:mt-0`}
        >
          <Link href="#home" className="py-2 md:py-0">
            Home
          </Link>
          <Link href="#about" className="py-2 md:py-0">
            About
          </Link>
          <Link href="#services" className="py-2 md:py-0">
            Features
          </Link>
          <Link href="#contact" className="py-2 md:py-0">
            Contact
          </Link>
        </nav>
      </div>
      <div>
        <button
          onClick={toggleMobileMenu}
          className="text-white text-3xl md:hidden absolute right-4 top-8"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </div>
  );
};

export default Navbar;
