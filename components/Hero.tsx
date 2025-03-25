import React from "react";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="hero">
      <div className="heroContent">
        <h1>Explore Beyond the Ordinary</h1>
        <button className="ctaButton">Get Started</button>
        <p>Transform Your World with Cutting-Edge VR Experiences</p>
      </div>

      {/* Optimized background image */}
      <div className="background">
        <Image
          src="/images/289jpXiaomi-VR.jpg"
          alt="VR Experience"
          layout="fill"
          objectFit="cover"
          quality={100}
          priority
        />
      </div>
    </section>
  );
};

export default Hero;
