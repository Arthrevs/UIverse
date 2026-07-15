'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Terrain({ integrationPercent }) {
  const meshRef = useRef();

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(30, 30, 60, 60);
    const positions = geo.attributes.position.array;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1];
      // Low-poly terrain with gentle hills
      positions[i + 2] =
        Math.sin(x * 0.3) * Math.cos(z * 0.3) * 0.8 +
        Math.sin(x * 0.7 + 1) * 0.3 +
        Math.cos(z * 0.5 + 2) * 0.4 +
        (Math.random() - 0.5) * 0.15;
    }

    geo.computeVertexNormals();
    // Make it low-poly by using flat shading (handled by material)
    return geo;
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      // Subtle corruption color shift based on integration
      const t = integrationPercent / 100;
      const r = THREE.MathUtils.lerp(0.08, 0.15, t);
      const g = THREE.MathUtils.lerp(0.15, 0.05, t);
      const b = THREE.MathUtils.lerp(0.1, 0.12, t);
      meshRef.current.material.color.setRGB(r, g, b);
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -2, 0]}
      receiveShadow
    >
      <meshStandardMaterial
        flatShading
        roughness={0.9}
        metalness={0.1}
        color="#142619"
      />
    </mesh>
  );
}
