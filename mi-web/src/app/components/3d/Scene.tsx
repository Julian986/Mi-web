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
