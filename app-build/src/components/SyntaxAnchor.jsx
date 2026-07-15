'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

function AnchorRing({ position }) {
  const ringRef = useRef();
  const innerRef = useRef();

  useFrame((state, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.y += delta * 2;
      ringRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 3;
    }
  });

  return (
    <group position={position}>
      {/* Outer containment ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.6, 0.03, 8, 24]} />
        <meshStandardMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={2}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Inner ring */}
      <mesh ref={innerRef}>
        <torusGeometry args={[0.35, 0.02, 8, 16]} />
        <meshStandardMaterial
          color="#4ade80"
          emissive="#4ade80"
          emissiveIntensity={1.5}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Central glow point */}
      <mesh>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={3}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Point light for local illumination */}
      <pointLight color="#22c55e" intensity={2} distance={4} decay={2} />
    </group>
  );
}

export default function SyntaxAnchor({ anchorsPlaced }) {
  return (
    <group>
      {anchorsPlaced.map((anchor, i) => (
        <AnchorRing
          key={i}
          position={[anchor.position[0], anchor.position[1] - 1.5, anchor.position[2]]}
        />
      ))}
    </group>
  );
}
