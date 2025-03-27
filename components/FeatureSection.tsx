"use client";
import React from "react";
import dynamic from "next/dynamic";
import { useScroll } from "@react-three/drei";

const DynamicCanvas = dynamic(
  () => import("@react-three/fiber").then((mod) => mod.Canvas),
  {
    ssr: false,
  }
);

const DynamicScrollControls = dynamic(
  () => import("@react-three/drei").then((mod) => mod.ScrollControls),
  {
    ssr: false,
  }
);

const DynamicOculusModel = dynamic(() => import("./OculusModel"), {
  ssr: false,
});

const features = [
  { title: "Feature 1", description: "Description 1" },
  { title: "Feature 2", description: "Description 2" },
  { title: "Feature 3", description: "Description 3" },
  // Add more features as needed
];

const ScrollHandler: React.FC = () => {
  const scroll = useScroll();

  return (
    <DynamicOculusModel
      position={[0, 0, 0]}
      rotation={[0, Math.PI, 0]}
      scroll={scroll}
    />
  );
};

const FeaturesSection: React.FC = () => {
  return (
    <section className="relative h-screen">
      <div className="absolute inset-0 flex items-center justify-center">
        <DynamicCanvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <DynamicScrollControls pages={3}>
            <ScrollHandler />
          </DynamicScrollControls>
        </DynamicCanvas>
      </div>
      <div className="absolute inset-0 flex flex-col justify-center space-y-8">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className={`flex items-center ${
              index % 2 === 0 ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`w-1/2 p-4 bg-white rounded-lg shadow-lg ${
                index % 2 === 0 ? "ml-8" : "mr-8"
              }`}
            >
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
