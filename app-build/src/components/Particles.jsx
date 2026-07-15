'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Particles({ integrationPercent, gamePhase }) {
  const pointsRef = useRef();
  const count = 200;

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = Math.random() * 8 - 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;

      vel[i * 3] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 1] = Math.random() * 0.005 + 0.002;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }

    return [pos, vel];
  }, []);

  const colors = useMemo(() => {
    const cols = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Gold-ish particles
      cols[i * 3] = 0.83 + Math.random() * 0.1;
      cols[i * 3 + 1] = 0.72 + Math.random() * 0.1;
      cols[i * 3 + 2] = 0.48 + Math.random() * 0.1;
    }
    return cols;
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const posArray = pointsRef.current.geometry.attributes.position.array;
    const gravityReverse = integrationPercent > 10;
    const speed = gamePhase === 'CRITICAL' ? 3 : gamePhase === 'COMPILING' ? 5 : 1;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      posArray[i3] += velocities[i3] * speed;
      posArray[i3 + 1] += (gravityReverse ? velocities[i3 + 1] * 2 : velocities[i3 + 1]) * speed;
      posArray[i3 + 2] += velocities[i3 + 2] * speed;

      // Reset particles that go too high or too far
      if (posArray[i3 + 1] > 8) {
        posArray[i3 + 1] = -2;
        posArray[i3] = (Math.random() - 0.5) * 20;
        posArray[i3 + 2] = (Math.random() - 0.5) * 20;
      }

      if (Math.abs(posArray[i3]) > 12 || Math.abs(posArray[i3 + 2]) > 12) {
        posArray[i3] = (Math.random() - 0.5) * 8;
        posArray[i3 + 2] = (Math.random() - 0.5) * 8;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
