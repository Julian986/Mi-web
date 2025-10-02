import * as THREE from 'three';
import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, MeshWobbleMaterial } from '@react-three/drei';
import { a, useSpring } from '@react-spring/three';

type BoxProps = {
  scale?: number;
  position?: [number, number, number];
};

export function Level() {
  const { nodes }: any = useGLTF('/assets/3d/level-react-draco.glb');
  return (
    <mesh
      geometry={nodes.Level.geometry}
      material={nodes.Level.material}
      position={[-0.38, 0.69, 0.62]}
      rotation={[Math.PI / 2, -Math.PI / 9, 0]}
    />
  );
}

export function Sudo() {
    const { nodes }: any = useGLTF('/assets/3d/level-react-draco.glb');
  
    const [spring, api] = useSpring(() => ({
      rotationX: Math.PI / 2,
      rotationY: 0,
      rotationZ: 0.29,
      config: { friction: 40 },
    }));
  
    useEffect(() => {
      let timeout: any;
      const wander = () => {
        api.start({
          rotationX: Math.PI / 2 + THREE.MathUtils.randFloatSpread(2) * 0.3,
          rotationY: 0,
          rotationZ: 0.29 + THREE.MathUtils.randFloatSpread(2) * 0.2,
        });
        timeout = setTimeout(wander, (1 + Math.random() * 2) * 800);
      };
      wander();
      return () => clearTimeout(timeout);
    }, []);
  
    return (
      <>
        <mesh
          geometry={nodes.Sudo.geometry}
          material={nodes.Sudo.material}
          position={[0.68, 0.33, -0.67]}
          rotation={[Math.PI / 2, 0, 0.29]}
        />
        <a.mesh
          geometry={nodes.SudoHead.geometry}
          material={nodes.SudoHead.material}
          position={[0.68, 0.33, -0.67]}
          rotation-x={spring.rotationX}
          rotation-y={spring.rotationY}
          rotation-z={spring.rotationZ}
        />
      </>
    );
  }
  

export function CameraObj() {
  const { nodes, materials }: any = useGLTF('/assets/3d/level-react-draco.glb');

  const [spring, api] = useSpring(() => ({
    rotationZ: 0,
    config: { friction: 40 },
  }));

  useEffect(() => {
    let timeout: any;
    const wander = () => {
      api.start({ rotationZ: Math.random() });
      timeout = setTimeout(wander, (1 + Math.random() * 2) * 800);
    };
    wander();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <a.group position={[-0.58, 0.83, -0.03]} rotation={[Math.PI / 2, 0, 0.47]} rotation-z={spring.rotationZ}>
      <mesh geometry={nodes.Camera.geometry} material={nodes.Camera.material} />
      <mesh geometry={nodes.Camera_1.geometry} material={materials.Lens} />
    </a.group>
  );
}

export function Cactus() {
  const { nodes, materials }: any = useGLTF('/assets/3d/level-react-draco.glb');

  return (
    <mesh
      geometry={nodes.Cactus.geometry}
      position={[-0.42, 0.51, -0.62]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <MeshWobbleMaterial factor={0.4} map={materials.Cactus.map} />
    </mesh>
  );
}

export function Box({ scale = 1, position }: BoxProps) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta;
      ref.current.rotation.y += delta;
    }
  });

  return (
    <mesh
      position={position}
      ref={ref}
      scale={(clicked ? 1.5 : 1) * scale}
      onClick={() => click(!clicked)}
      onPointerOver={(event) => (event.stopPropagation(), hover(true))}
      onPointerOut={() => hover(false)}
    >
      <boxGeometry />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  );
}

// Piso superior rediseñado - más sutil y elegante
export function UpperFloor() {
  return (
    <group>
      {/* Plataforma superior más pequeña y elegante */}
      <mesh position={[0, 1.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.5, 2]} />
        <meshStandardMaterial color="#F5F5F5" />
      </mesh>
      
      {/* Pared trasera del piso superior */}
      <mesh position={[0, 2.2, -1]} rotation={[0, 0, 0]}>
        <planeGeometry args={[2.5, 1.2]} />
        <meshStandardMaterial color="#E8E8E8" />
      </mesh>
    </group>
  );
}

// Escaleras más elegantes
export function Stairs() {
  return (
    <group position={[0.8, 0, -0.5]}>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[0, i * 0.15, i * 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.6, 0.08, 0.25]} />
          <meshStandardMaterial color="#F0F0F0" />
        </mesh>
      ))}
    </group>
  );
}

// Telescopio más pequeño y elegante
export function Telescope() {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group ref={ref} position={[0, 1.9, 0]}>
      {/* Base del telescopio */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1]} />
        <meshStandardMaterial color="#4A90E2" />
      </mesh>
      
      {/* Tubo del telescopio */}
      <mesh position={[0, 0.1, 0]} rotation={[0, 0, Math.PI / 8]}>
        <cylinderGeometry args={[0.03, 0.05, 0.4]} />
        <meshStandardMaterial color="#2C5F8A" />
      </mesh>
    </group>
  );
}

// Ventana espacial más sutil
export function GalaxyWindow() {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group position={[0, 2.5, -0.95]}>
      {/* Marco de la ventana */}
      <mesh>
        <torusGeometry args={[0.4, 0.03, 16, 32]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Galaxia espiral más sutil */}
      <mesh ref={ref}>
        <planeGeometry args={[0.7, 0.7]} />
        <meshStandardMaterial 
          color="#6A4C93"
          transparent
          opacity={0.6}
          emissive="#2D1B69"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Estrellas más pequeñas */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh 
          key={i} 
          position={[
            (Math.random() - 0.5) * 0.6,
            (Math.random() - 0.5) * 0.6,
            0.01
          ]}
        >
          <sphereGeometry args={[0.005]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// Luces más suaves y elegantes
export function UpperFloorLights() {
  return (
    <group>
      {/* Luz principal más suave */}
      <pointLight 
        position={[0.5, 2.2, 0]} 
        color="#FFB366" 
        intensity={1.2} 
        distance={3}
      />
      
      {/* Luz ambiental */}
      <pointLight 
        position={[-0.5, 2.0, 0.5]} 
        color="#FFD700" 
        intensity={0.8} 
        distance={2.5}
      />
    </group>
  );
}