'use client';

import { useRef, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export default function Terrain({ integrationPercent }) {
  const meshRef = useRef();
  
  // Load the marble cliff model as requested
  const { scene } = useGLTF('/models/marble_cliff_05_2k/marble_cliff_05_2k.gltf');

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const center = new THREE.Vector3();
    box.getCenter(center);
    clone.position.sub(center);
    
    // Scale it to cover the sector view ground
    clone.scale.setScalar(4);
    // Lower it slightly so it acts as a floor
    clone.position.y -= 1;

    clone.traverse((child) => {
      if (child.isMesh) {
        child.receiveShadow = true;
        child.castShadow = true;
        // The integrationPercent could subtly shift the color, but the user explicitly requested "use the surface that I gave you"
        // so we preserve the original textures and material fully.
      }
    });

    return clone;
  }, [scene]);

  return (
    <group ref={meshRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

// Preload the surface
useGLTF.preload('/models/marble_cliff_05_2k/marble_cliff_05_2k.gltf');
