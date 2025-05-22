"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

import gsap from "gsap";

export function HeroSection() {
  // Refs for GSAP animations with proper typing
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Create a timeline for smooth animations
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Initial state - elements are invisible
    gsap.set(
      [titleRef.current, subtitleRef.current, buttonContainerRef.current],
      {
        opacity: 0,
        y: 50,
      }
    );

    // Add a slight overlay fade-in
    tl.fromTo(
      sectionRef.current,
      { opacity: 0.7 },
      { opacity: 1, duration: 1 }
    );

    // Animate title
    tl.to(
      titleRef.current,
      {
        opacity: 1,
        y: 0,
        duration: 1.5,
      },
      0.3
    );

    // Animate subtitle
    tl.to(
      subtitleRef.current,
      {
        opacity: 1,
        y: 0,
        duration: 1.6,
      },
      0.5
    );

    // Animate button
    tl.to(
      buttonContainerRef.current,
      {
        opacity: 1,
        y: 0,
        duration: 2,
      },
      0.7
    );

    // Set up arrow hover animation
    if (buttonContainerRef.current && arrowRef.current) {
      const buttonContainer = buttonContainerRef.current;
      const arrow = arrowRef.current;

      // Create the hover animation
      const hoverAnimation = gsap.to(arrow, {
        x: 5,
        duration: 0.4,
        ease: "power2.out",
        paused: true,
      });

      // Event listeners for hover
      const onMouseEnter = () => {
        hoverAnimation.play();
      };

      const onMouseLeave = () => {
        hoverAnimation.reverse();
      };

      // Add event listeners to the button container div
      buttonContainer.addEventListener("mouseenter", onMouseEnter);
      buttonContainer.addEventListener("mouseleave", onMouseLeave);

      // Clean up event listeners on component unmount
      return () => {
        buttonContainer.removeEventListener("mouseenter", onMouseEnter);
        buttonContainer.removeEventListener("mouseleave", onMouseLeave);
      };
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative h-screen flex items-start justify-center"
    >
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/289jpXiaomi-VR.jpg"
          alt="VR Experience"
          fill
          quality={100}
          priority
          className="object-cover"
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="container flex h-full pt-32 md:pt-40 lg:pt-48">
        <div className="mt-60 md:mt-20 xl:mt-40 max-w-2xl px-4">
          <h1
            ref={titleRef}
            className="text-4xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl"
          >
            Master Orthopedic Surgery <br />
            <span className="text-[#00cfb6]">In Virtual Reality</span>
          </h1>

          <p
            ref={subtitleRef}
            className="mt-6 max-w-xl text-lg text-gray-200 md:text-xl"
          >
            OrthoSim provides cutting-edge VR training for orthopedic surgeons,
            focusing on intramedullary nailing of the tibia with real-time
            feedback and performance analytics.
          </p>

          <Link href="/login">
            <div
              ref={buttonContainerRef}
              className="max-w-[150px] mt-10 flex items-center"
            >
              <Button
                variant="secondary"
                size="lg"
                className="group text-base bg-theme-primary text-[#1a3957] flex items-center justify-center rounded-full px-6 py-3 font-semibold transition duration-300 ease-in-out hover:bg-[#00cfb6]/90 focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2 focus:ring-offset-[#1a3957] shadow-lg"
              >
                Get Started
                <span ref={arrowRef}>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Button>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
