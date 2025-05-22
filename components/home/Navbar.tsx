"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import gsap from "gsap";

export function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const headerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;

      // Set visible if scrolling up or at the top of the page
      const isVisible =
        prevScrollPos > currentScrollPos || currentScrollPos < 10;

      if (isVisible !== visible) {
        setVisible(isVisible);
      }

      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos, visible]);

  useEffect(() => {
    if (headerRef.current) {
      if (visible) {
        gsap.to(headerRef.current, {
          y: 0,
          duration: 1,
          ease: "power3.out",
          opacity: 1,
        });
      } else {
        gsap.to(headerRef.current, {
          y: -100,
          duration: 0.5,
          ease: "power3.out",
          opacity: 0,
        });
      }
    }
  }, [visible]);

  return (
    <header ref={headerRef} className="fixed top-0 z-50 w-full">
      <div className="glass-effect bg-black/40 backdrop-blur-lg w-full md:w-[90%] md:max-w-7xl mx-auto md:rounded-3xl md:mt-4">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden">
              <Link href="/">
                <Image
                  src="/images/Logo_Nav.png"
                  alt="Logo"
                  width={50}
                  height={50}
                  className="rounded-full"
                />
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#hero"
              className="text-white text-lg font-medium transition-colors hover:text-theme-primary"
            >
              Home
            </Link>
            <Link
              href="#about"
              className="text-white text-lg font-medium transition-colors hover:text-theme-primary"
            >
              About
            </Link>
            <Link
              href="#features"
              className="text-white text-lg font-medium transition-colors hover:text-theme-primary"
            >
              Features
            </Link>
            <Link
              href="#team"
              className="text-white text-lg font-medium transition-colors hover:text-theme-primary"
            >
              Team
            </Link>
            <Link
              href="#contact"
              className="text-white text-lg font-medium transition-colors hover:text-theme-primary"
            >
              Contact
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="outline"
              asChild
              className="border-white/20 text-base text-white rounded-full px-6 hover:bg-white/10 hover:text-theme-primary"
            >
              <Link href="/login">Login</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white text-base"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 px-4 border-t border-white/10 backdrop-blur-lg bg-black/40">
            <nav className="flex flex-col gap-4">
              <Link
                href="#hero"
                className="text-white text-base font-medium hover:text-theme-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="#about"
                className="text-white text-base font-medium hover:text-theme-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="#features"
                className="text-white text-base font-medium hover:text-theme-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#team"
                className="text-white text-base font-medium hover:text-theme-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Team
              </Link>
              <Link
                href="#contact"
                className="text-white text-base font-medium hover:text-theme-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  variant="outline"
                  asChild
                  className="w-full border-white/20 text-white rounded-full hover:bg-white/10"
                >
                  <Link href="/login">Login</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
