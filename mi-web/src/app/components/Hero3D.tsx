"use client";

import React, { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Fisheye, CameraControls, PerspectiveCamera, Environment, Html, Loader } from "@react-three/drei";
import { Level, Sudo, CameraObj, Cactus, Box as BoxObj } from "../components/3d/Scene";
import * as THREE from 'three';


type Hero3DProps = {
  onClickItem?: (id: string) => void;
};

// Wrapper para animar objetos con click
function InteractiveBox(props: { position?: [number, number, number]; scale?: number; name: string; onClickItem?: (id: string) => void }) {
    const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = React.useState(false);
  const [clicked, setClicked] = React.useState(false);

  // Floating y rotación
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.5;
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <mesh
      {...props}
      ref={ref}
      scale={(clicked ? 1.5 : 1) * (props.scale || 1)}
      onClick={() => {
        setClicked(!clicked);
        props.onClickItem?.(props.name);
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}

export default function Hero3D({ onClickItem = () => {} }: Hero3DProps) {
  return (
    <section className="relative w-full h-[80vh] md:h-[85vh]">
      <Canvas flat>
        <Fisheye zoom={0}>
          <CameraControls minPolarAngle={0} maxPolarAngle={Math.PI / 1.6} />
          <ambientLight intensity={1} />
          <group scale={20} position={[5, -11, -5]}>
            <Suspense fallback={<Html center>Loading 3D...</Html>}>
              <Level />
              <Sudo />
              <CameraObj />
              <Cactus />
              <InteractiveBox position={[-0.8, 1.4, 0.4]} scale={0.15} name="Box1" onClickItem={onClickItem} />
              <InteractiveBox position={[0.5, 1.6, -0.3]} scale={0.1} name="Box2" onClickItem={onClickItem} />
              <InteractiveBox position={[-1.2, 1.2, 0.6]} scale={0.12} name="Box3" onClickItem={onClickItem} />
            </Suspense>
          </group>
          <Environment preset="city" background blur={1} />
          <PerspectiveCamera makeDefault position={[0, 0, 18.5]} />
        </Fisheye>
      </Canvas>
      <Loader />
    </section>
  );
}
