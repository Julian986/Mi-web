"use client";

import * as THREE from "three";
import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Environment, useGLTF, ContactShadows, OrbitControls } from "@react-three/drei";

function ScreenContent() {
  return (
    <div className="content">
      <div className="wrapper bg-white">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900">Proyecto Destacado</h3>
          <p className="mt-2 text-gray-600 text-sm">Interfaz embebida en la pantalla 3D.</p>
          <div className="mt-4">
            <a className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm" href="#">
              Ver más
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

type ModelProps = React.ComponentProps<"group">; 

function Model(props: ModelProps) {
  const group = useRef<THREE.Group>(null!);
  type GLTFResult = {
    nodes: Record<string, { geometry: THREE.BufferGeometry }> & { keyboard: { geometry: THREE.BufferGeometry }; touchbar: { geometry: THREE.BufferGeometry } };
    materials: Record<string, THREE.Material> & { aluminium: THREE.Material; trackpad: THREE.Material; keys: THREE.Material; touchbar: THREE.Material };
  };
  const { nodes, materials } = useGLTF("/mac-draco.glb") as unknown as GLTFResult;
  useFrame((state) => {
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
          <mesh geometry={nodes["Cube008_2"].geometry}>
            <Html className="content" rotation-x={-Math.PI / 2} position={[0, 0.05, -0.09]} transform occlude>
              <ScreenContent />
            </Html>
          </mesh>
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
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  return (
    <Canvas
      camera={{ position: [-5, 0, -15], fov: 55 }}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      gl={{ alpha: true, antialias: !isMobile, powerPreference: isMobile ? "low-power" : "high-performance" }}
      style={{ background: "transparent" }}
    >
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <Suspense fallback={null}>
        <group rotation={[0, Math.PI, 0]} position={[0, 1, 0]}>
          <Model />
        </group>
        <Environment preset="city" />
      </Suspense>
      {/* ContactShadows eliminado para no mostrar óvalo en fondo transparente */}
      <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 2.2} maxPolarAngle={Math.PI / 2.2} />
    </Canvas>
  );
}

useGLTF.preload("/mac-draco.glb");


