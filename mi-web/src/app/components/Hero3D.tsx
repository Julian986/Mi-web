"use client";

import React from "react";
import { Loader } from "@react-three/drei";
import dynamic from "next/dynamic";

const MacbookScene3D = dynamic(() => import("./3d/Macbook").then((m) => m.MacbookScene3D), {
  ssr: false,
  loading: () => null,
});

export function Scene3D() {
  return (
    <div className="relative w-full h-full">
      <MacbookScene3D />
      <Loader />
    </div>
  );
}

export function Scene3DDisabled() {
  return null;
}
