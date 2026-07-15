'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Targeting reticle — wireframe diagnostic brackets around a growth node on hover
function TargetingReticle({ position, active }) {
  const groupRef = useRef();
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current || !active) return;
    timeRef.current += delta;

    // Slow rotation
    groupRef.current.rotation.y += delta * 1.5;

    // Subtle scale pulse
    const pulse = 1 + Math.sin(timeRef.current * 4) * 0.05;
    groupRef.current.scale.setScalar(pulse);
  });

  if (!active) return null;

  const [bx, by, bz] = position;
  const reticleY = by - 1.5;

  return (
    <group ref={groupRef} position={[bx, reticleY, bz]}>
      {/* Outer wireframe octahedron */}
      <mesh>
        <octahedronGeometry args={[1.0, 0]} />
        <meshBasicMaterial
          color="#d4b87a"
          wireframe
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Inner wireframe box — diagnostic bracket */}
      <mesh rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshBasicMaterial
          color="#d4b87a"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Corner bracket lines — 4 L-shaped indicators */}
      {[
        [0.5, 0, 0.5],
        [-0.5, 0, 0.5],
        [0.5, 0, -0.5],
        [-0.5, 0, -0.5],
      ].map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.04, 0.6, 0.04]} />
          <meshBasicMaterial color="#d4b87a" transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Horizontal ring at base */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
        <ringGeometry args={[0.6, 0.65, 16]} />
        <meshBasicMaterial
          color="#d4b87a"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Targeting cross at center */}
      <mesh>
        <boxGeometry args={[1.2, 0.015, 0.015]} />
        <meshBasicMaterial color="#d4b87a" transparent opacity={0.2} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.015, 0.015, 1.2]} />
        <meshBasicMaterial color="#d4b87a" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

function CrystalShard({ position, scale, delay, anchored, growthFactor, onClick, isHovered, onPointerOver, onPointerOut }) {
  const meshRef = useRef();
  const materialRef = useRef();
  const timeRef = useRef(0);

  const geometry = useMemo(() => {
    // Sharp, angular crystal shape
    const geo = new THREE.ConeGeometry(0.15, 1, 5, 1);
    // Randomize vertices slightly for organic crystal look
    const positions = geo.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += (Math.random() - 0.5) * 0.05;
      positions[i + 2] += (Math.random() - 0.5) * 0.05;
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;
    timeRef.current += delta;

    const t = Math.max(0, (timeRef.current - delay) * 0.5);
    const grow = anchored
      ? Math.max(0, meshRef.current.scale.y - delta * 2) // Shrink when anchored
      : Math.min(growthFactor, t);

    meshRef.current.scale.set(
      scale * grow * 0.5,
      scale * grow,
      scale * grow * 0.5
    );

    // Pulsing glow
    const pulse = Math.sin(timeRef.current * 3 + delay) * 0.3 + 0.7;
    const baseIntensity = anchored ? 0.1 : isHovered ? 2.5 : 1.2;
    materialRef.current.emissiveIntensity = baseIntensity * pulse;

    // Slow rotation
    meshRef.current.rotation.y += delta * 0.3;
  });

  const color = anchored ? '#22c55e' : '#d4b87a';
  const emissive = anchored ? '#22c55e' : isHovered ? '#ffd700' : '#d4b87a';

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={position}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      scale={[0, 0, 0]}
      castShadow
    >
      <meshStandardMaterial
        ref={materialRef}
        color={color}
        emissive={emissive}
        emissiveIntensity={1.2}
        roughness={0.2}
        metalness={0.8}
        transparent
        opacity={anchored ? 0.3 : 0.9}
        flatShading
      />
    </mesh>
  );
}

export default function CrystallineIntrusion({ growthNodes, integrationPercent, onNodeClick }) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const groupRef = useRef();
  const growthFactor = integrationPercent / 25; // Crystals grow with integration

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Subtle group rotation
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {growthNodes.map((node) => {
        const [bx, by, bz] = node.position;
        // Generate a cluster of shards per growth node
        const shards = [];
        const clusterSize = 5;

        for (let i = 0; i < clusterSize; i++) {
          const angle = (i / clusterSize) * Math.PI * 2;
          const radius = 0.3 + Math.random() * 0.3;
          const height = Math.random() * 0.5;
          const sx = bx + Math.cos(angle) * radius;
          const sz = bz + Math.sin(angle) * radius;
          const sy = by - 1.5 + height;

          shards.push(
            <CrystalShard
              key={`${node.id}-${i}`}
              position={[sx, sy, sz]}
              scale={0.8 + Math.random() * 1.2}
              delay={node.id * 0.5 + i * 0.2}
              anchored={node.anchored}
              growthFactor={growthFactor}
              isHovered={hoveredNode === node.id}
              onClick={(e) => {
                e.stopPropagation();
                if (!node.anchored) onNodeClick(node.id);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                if (!node.anchored) setHoveredNode(node.id);
              }}
              onPointerOut={() => setHoveredNode(null)}
            />
          );
        }

        // Growth point indicator (glowing sphere at base)
        if (!node.anchored) {
          shards.push(
            <mesh
              key={`glow-${node.id}`}
              position={[bx, by - 1.8, bz]}
              onClick={(e) => {
                e.stopPropagation();
                onNodeClick(node.id);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredNode(node.id);
              }}
              onPointerOut={() => setHoveredNode(null)}
            >
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshStandardMaterial
                color={hoveredNode === node.id ? '#ffd700' : '#d4b87a'}
                emissive={hoveredNode === node.id ? '#ffd700' : '#d4b87a'}
                emissiveIntensity={hoveredNode === node.id ? 3 : 1.5}
                transparent
                opacity={0.6}
              />
            </mesh>
          );
        }

        return (
          <group key={node.id}>
            {shards}
            {/* Targeting reticle on hover */}
            <TargetingReticle
              position={node.position}
              active={hoveredNode === node.id && !node.anchored}
            />
          </group>
        );
      })}

      {/* Central crystal spire */}
      <mesh position={[0, -0.5, 0]} castShadow>
        <octahedronGeometry args={[0.5 * Math.max(0.1, growthFactor * 0.5), 0]} />
        <meshStandardMaterial
          color="#d4b87a"
          emissive="#d4b87a"
          emissiveIntensity={1.5}
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.7}
          flatShading
        />
      </mesh>
    </group>
  );
}
