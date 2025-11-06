"use client";

import React from "react";
import { Loader } from "@react-three/drei";
import { MacbookScene3D } from "./3d/Macbook";

type Hero3DProps = {
  onClickItem?: (id: string) => void;
};

export function Scene3D({ onClickItem = () => {} }: Hero3DProps) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div className="relative w-full h-full">
      <MacbookScene3D />
      <Loader />
    </div>
  );
}

export function Scene3DDisabled({ onClickItem = () => {} }: Hero3DProps) {
  return null;
}
