"use client";
import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import * as THREE from "three";
import { ScrollControlsState } from "@react-three/drei";

interface OculusModelProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scroll: ScrollControlsState;
}

const OculusModel: React.FC<OculusModelProps> = ({
  position,
  rotation,
  scroll,
}) => {
  const gltf = useGLTF("/model/scene.gltf");
  const modelRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (modelRef.current) {
      gsap.to(modelRef.current.rotation, {
        y: Math.PI * 2,
        duration: 1,
        repeat: -1,
        ease: "none",
      });
    }
  }, []);

  useFrame(() => {
    if (modelRef.current) {
      const scrollOffset = scroll.offset;
      const featuresCount = 3; // Adjust based on your features array length
      const featureIndex = Math.floor(scrollOffset * featuresCount);
      const featureProgress = (scrollOffset * featuresCount) % 1;

      const targetRotation =
        featureIndex % 2 === 0 ? Math.PI / 4 : -Math.PI / 4;
      modelRef.current.rotation.y = gsap.utils.interpolate(
        modelRef.current.rotation.y,
        targetRotation,
        0.1
      );

      const targetPosition = featureIndex % 2 === 0 ? [1, 0, 0] : [-1, 0, 0];
      modelRef.current.position.x = gsap.utils.interpolate(
        modelRef.current.position.x,
        targetPosition[0] * featureProgress,
        0.1
      );
    }
  });

  return (
    <group ref={modelRef} position={position} rotation={rotation}>
      <primitive object={gltf.scene} />
    </group>
  );
};

export default OculusModel;
