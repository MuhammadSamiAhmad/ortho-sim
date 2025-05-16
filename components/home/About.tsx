"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Define subsections
const subsections = [
  {
    id: "what-we-offer",
    title: "What We Offer",
    content:
      "Our project is a cutting-edge Virtual Reality (VR) surgery simulation designed to train medical students and surgical residents in Intramedullary Nailing of the Tibia. The system combines immersive VR technology with real-time feedback to provide a hands-on, realistic surgical experience.",
    img: "/images/WhatWeOffer.jpg",
  },
  {
    id: "why-it-matters",
    title: "Why It Matters",
    content:
      "Traditional surgical training is often limited by cost, availability of cadavers, and patient safety concerns. Our simulation offers a safe, repeatable, and engaging environment for trainees to build competence and confidence before entering the operating room.",
    img: "/images/WhyItMatters.jpg",
  },
  {
    id: "who-its-for",
    title: "Who Is It For",
    content:
      "This project is aimed at medical schools, surgical training programs, and hospitals seeking innovative ways to enhance surgical education. It also supports surgeon trainees by providing progress tracking, mentor feedback, and integrated learning modules.",
    img: "/images/WhoIsItFor.png",
  },
  {
    id: "our-vision",
    title: "Our Vision",
    content:
      "We believe immersive technology has the power to revolutionize medical training. Our goal is to build a platform that not only bridges the gap between theory and practice but also personalizes learning through data-driven insights and mentor interaction.",
    img: "/images/OurVision.jpg",
  },
];

const About = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const subsectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  return (
    <section id="about" className="py-20 relative bg-theme-background">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            About OrthoSim
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto text-[#00cfb6]">
            Learn more about our innovative approach to orthopedic surgical
            training
          </p>
        </div>

        <div className="flex" ref={sectionRef}>
          {/* Main content */}
          <div className="flex-1 space-y-10 md:space-y-24">
            {subsections.map((section, index) => (
              <div
                key={section.id}
                id={section.id}
                ref={(el) => {
                  subsectionRefs.current[index] = el;
                }}
                className="flex flex-col items-center justify-center lg:flex-row lg:space-x-8"
              >
                <Image
                  src={section.img}
                  alt={section.title}
                  width={600}
                  height={400}
                  className="mt-8 rounded-lg shadow-lg"
                />
                <div className="max-w-3xl mx-auto">
                  <h3 className="text-2xl md:text-3xl mt-3 md:mt-0 font-bold mb-3 md:mb-6 text-[#00cfb6]">
                    {section.title}
                  </h3>
                  <p className="text-lg leading-relaxed">{section.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
