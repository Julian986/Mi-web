"use client";

import * as THREE from "three";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, useGLTF, OrbitControls } from "@react-three/drei";

type ModelProps = React.ComponentProps<"group">; 

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);

    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

function Controls() {
  const { invalidate } = useThree();
  return (
    <OrbitControls
      enablePan={false}
      enableZoom={false}
      minPolarAngle={Math.PI / 2.2}
      maxPolarAngle={Math.PI / 2.2}
      onChange={() => invalidate()}
    />
  );
}

function Model(props: ModelProps & { animate?: boolean }) {
  const group = useRef<THREE.Group>(null!);
  const animate = props.animate ?? true;
  type GLTFResult = {
    nodes: Record<string, { geometry: THREE.BufferGeometry }> & { keyboard: { geometry: THREE.BufferGeometry }; touchbar: { geometry: THREE.BufferGeometry } };
    materials: Record<string, THREE.Material> & { aluminium: THREE.Material; trackpad: THREE.Material; keys: THREE.Material; touchbar: THREE.Material };
  };
  const { nodes, materials } = useGLTF("/mac-draco.glb") as unknown as GLTFResult;
  useFrame((state) => {
    if (!animate) return;
    const t = state.clock.getElapsedTime();
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, Math.cos(t / 2) / 20 + 0.25, 0.1);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, Math.sin(t / 4) / 20, 0.1);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, Math.sin(t / 8) / 20, 0.1);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, (-2 + Math.sin(t / 2)) / 2, 0.1);
  });
  return (
    <group ref={group} {...props} dispose={null}>
      <group rotation-x={-0.425} position={[0, -0.04, 0.41]}>
        <group position={[0, 2.96, -0.13]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh material={materials.aluminium} geometry={nodes["Cube008"].geometry} />
          <mesh material={materials["matte.001"]} geometry={nodes["Cube008_1"].geometry} />
          <mesh geometry={nodes["Cube008_2"].geometry} />
        </group>
      </group>
      <mesh material={materials.keys} geometry={nodes.keyboard.geometry} position={[1.79, 0, 3.45]} />
      <group position={[0, -0.1, 3.39]}>
        <mesh material={materials.aluminium} geometry={nodes["Cube002"].geometry} />
        <mesh material={materials.trackpad} geometry={nodes["Cube002_1"].geometry} />
      </group>
      <mesh material={materials.touchbar} geometry={nodes.touchbar.geometry} position={[0, -0.03, 1.2]} />
    </group>
  );
}

export function MacbookScene3D() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const animate = !isMobile && !prefersReducedMotion;
  const [isDragging, setIsDragging] = useState(false);
  const cursor = isDragging ? "grabbing" : "grab";

  return (
    <Canvas
      camera={{ position: [-5, 0, -15], fov: 55 }}
      frameloop={animate ? "always" : "demand"}
      dpr={isMobile ? [1, 1.25] : [1, 2]}
      performance={{ min: 0.5 }}
      gl={{ alpha: true, antialias: !isMobile, powerPreference: isMobile ? "low-power" : "high-performance" }}
      style={{ background: "transparent", cursor }}
      onPointerDown={() => setIsDragging(true)}
      onPointerUp={() => setIsDragging(false)}
      onPointerLeave={() => setIsDragging(false)}
    >
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <Suspense fallback={null}>
        <group rotation={[0, Math.PI, 0]} position={[0, 1, 0]}>
          <Model animate={animate} />
        </group>
        <Environment preset="city" resolution={isMobile ? 128 : 256} />
      </Suspense>
      {/* ContactShadows eliminado para no mostrar óvalo en fondo transparente */}
      <Controls />
    </Canvas>
  );
}

useGLTF.preload("/mac-draco.glb");


