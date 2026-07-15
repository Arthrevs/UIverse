'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function FloatingRock({ position, size, speed, delay }) {
  const meshRef = useRef();
  const initialY = position[1];

  const geometry = useMemo(() => {
    const geo = new THREE.DodecahedronGeometry(size, 0);
    // Distort slightly for organic look
    const positions = geo.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += (Math.random() - 0.5) * size * 0.3;
      positions[i + 1] += (Math.random() - 0.5) * size * 0.3;
      positions[i + 2] += (Math.random() - 0.5) * size * 0.3;
    }
    geo.computeVertexNormals();
    return geo;
  }, [size]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    // Float upward (gravity reversal)
    const floatHeight = Math.sin((t + delay) * speed) * 1.5 + Math.sin((t + delay) * speed * 0.5) * 0.5;
    meshRef.current.position.y = initialY + Math.max(0, floatHeight);

    // Slow tumble
    meshRef.current.rotation.x += 0.003 * speed;
    meshRef.current.rotation.z += 0.002 * speed;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={position}
      castShadow
    >
      <meshStandardMaterial
        color="#2a2a35"
        roughness={0.9}
        metalness={0.1}
        flatShading
      />
    </mesh>
  );
}

export default function FloatingObjects({ integrationPercent }) {
  const rocks = useMemo(() => {
    const items = [];
    for (let i = 0; i < 15; i++) {
      items.push({
        position: [
          (Math.random() - 0.5) * 16,
          -1.5 + Math.random() * 0.5,
          (Math.random() - 0.5) * 16,
        ],
        size: 0.1 + Math.random() * 0.25,
        speed: 0.3 + Math.random() * 0.7,
        delay: Math.random() * 10,
      });
    }
    return items;
  }, []);

  // Only show floating objects when integration is progressing
  if (integrationPercent < 5) return null;

  const visibleCount = Math.min(rocks.length, Math.floor(integrationPercent / 7) + 1);

  return (
    <group>
      {rocks.slice(0, visibleCount).map((rock, i) => (
        <FloatingRock key={i} {...rock} />
      ))}
    </group>
  );
}
