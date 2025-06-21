"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuthStore, type UserType } from "@/lib/auth-store";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const GetStartedPage = () => {
  const router = useRouter();
  const { setUserType } = useAuthStore();
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Refs for GSAP animations
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const featureRefs = useRef<(HTMLLIElement | null)[][]>([[], []]);

  // Store hover timelines in ref to access them in event handlers
  const hoverTimelinesRef = useRef<gsap.core.Timeline[]>([]);

  useGSAP(
    () => {
      // Create main timeline
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Set initial states
      gsap.set(
        [headerRef.current, cardsContainerRef.current, actionsRef.current],
        {
          opacity: 0,
          y: 50,
        }
      );

      gsap.set(cardRefs.current, {
        opacity: 0,
        y: 30,
        scale: 0.95,
      });

      // Animate header
      tl.to(headerRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
      });

      // Animate cards container
      tl.to(
        cardsContainerRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
        },
        "-=0.4" // start 0.4s before the previous finishes
      );

      // Animate individual cards
      tl.to(
        cardRefs.current,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.3,
        },
        "-=0.1"
      );

      // Animate features with stagger
      featureRefs.current.forEach((cardFeatures, cardIndex) => {
        tl.to(
          cardFeatures,
          {
            opacity: 1,
            x: 0,
            duration: 0.4,
            stagger: 0.2,
          },
          `-=${0.3 - cardIndex * 0.1}`
        );
      });

      // Animate actions
      tl.to(actionsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
      });

      // Set up card hover animations
      cardRefs.current.forEach((card, index) => {
        if (card) {
          const hoverTl = gsap.timeline({ paused: true });
          hoverTl.to(card, {
            scale: 1.02,
            duration: 0.3,
            ease: "power2.out",
          });

          // Store timeline for cleanup
          hoverTimelinesRef.current[index] = hoverTl;

          const handleMouseEnter = () => hoverTl.play();
          const handleMouseLeave = () => hoverTl.reverse();

          card.addEventListener("mouseenter", handleMouseEnter);
          card.addEventListener("mouseleave", handleMouseLeave);

          // Return cleanup function for this specific card
          return () => {
            card.removeEventListener("mouseenter", handleMouseEnter);
            card.removeEventListener("mouseleave", handleMouseLeave);
            hoverTl.kill();
          };
        }
      });
    },
    { scope: containerRef }
  ); // Scope to container for better performance

  const handleTypeSelect = (type: UserType) => {
    if (isAnimating) return;

    const previousSelected = cardRefs.current.find((card) =>
      card?.classList.contains("selected")
    );
    const currentSelected = cardRefs.current[type === "MENTOR" ? 0 : 1];

    // Remove previous selection animation
    if (previousSelected) {
      gsap.to(previousSelected, {
        scale: 1,
        duration: 0.2,
      });
    }

    // Add selection animation
    if (currentSelected) {
      gsap.to(currentSelected, {
        scale: 1.05,
        duration: 0.3,
        ease: "back.out(1.7)",
      });
    }

    setSelectedType(type);
  };

  const handleContinue = () => {
    if (!selectedType || isAnimating) return;

    setIsAnimating(true);
    setUserType(selectedType);

    // Exit animation - removed body opacity animation
    const exitTl = gsap.timeline({
      onComplete: () => router.push("/register"),
    });

    exitTl.to(
      [headerRef.current, cardsContainerRef.current, actionsRef.current],
      {
        opacity: 0,
        y: -30,
        duration: 0.4,
        stagger: 0.1,
      }
    );
  };

  const userTypes = [
    {
      type: "MENTOR" as UserType,
      title: "Mentor",
      description:
        "I am an experienced surgeon who wants to guide and evaluate trainees",
      icon: Users,
      gradient: "from-blue-500/20 to-cyan-500/20",
      borderGradient: "from-blue-500 to-cyan-500",
      features: [
        "Review trainee performance",
        "Provide detailed feedback",
        "Track progress over time",
      ],
    },
    {
      type: "TRAINEE" as UserType,
      title: "Trainee",
      description:
        "I am a medical student or resident who wants to practice surgical procedures",
      icon: GraduationCap,
      gradient: "from-emerald-500/20 to-teal-500/20",
      borderGradient: "from-emerald-500 to-teal-500",
      features: [
        "Practice VR simulations",
        "Receive mentor feedback",
        "Track my progress",
      ],
    },
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-6xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Role
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Select your role to get started with OrthoSim and begin your
            surgical training journey
          </p>
        </div>

        {/* User Type Cards */}
        <div
          ref={cardsContainerRef}
          className="grid md:grid-cols-2 gap-8 mb-12"
        >
          {userTypes.map((userType, index) => {
            const Icon = userType.icon;
            const isSelected = selectedType === userType.type;

            return (
              <div
                key={userType.type}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
              >
                <Card
                  className={`relative cursor-pointer transition-all duration-300 overflow-hidden ${
                    isSelected
                      ? "ring-2 ring-[#00cfb6] shadow-2xl shadow-[#00cfb6]/20 selected"
                      : "hover:shadow-xl"
                  } min-h-90`}
                  onClick={() => handleTypeSelect(userType.type)}
                >
                  {/* Gradient Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${userType.gradient} opacity-50`}
                  />

                  {/* Glass Effect */}
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />

                  {/* Border Gradient */}
                  {isSelected && (
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${userType.borderGradient} opacity-20 rounded-lg`}
                    />
                  )}

                  <CardContent className="relative p-8">
                    {/* Icon */}
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-r ${userType.borderGradient} p-0.5 mb-6`}
                    >
                      <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {userType.title}
                    </h3>
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      {userType.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-2">
                      {userType.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          ref={(el) => {
                            if (!featureRefs.current[index])
                              featureRefs.current[index] = [];
                            featureRefs.current[index][featureIndex] = el;
                          }}
                          className="flex items-center text-gray-300 text-sm opacity-0 -translate-x-2"
                        >
                          <div className="w-1.5 h-1.5 bg-[#00cfb6] rounded-full mr-3" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-[#00cfb6] rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div
          ref={actionsRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* Back to Home */}
          <Link href="/">
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="mb-1">Back to Home</span>
            </Button>
          </Link>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            disabled={!selectedType || isAnimating}
            className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
              selectedType
                ? "bg-[#00cfb6] hover:bg-[#00cfb6]/90 text-slate-900 shadow-lg shadow-[#00cfb6]/25"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isAnimating ? (
              <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
            ) : (
              <>
                Continue to Registration
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          {/* Already have account */}
          <Link href="/login">
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              <span className="mb-1">Already have an account?</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GetStartedPage;
