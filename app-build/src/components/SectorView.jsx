'use client';

import { Suspense, useRef, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useGameState } from '@/hooks/useGameState';
import Terrain from './Terrain';
import CrystallineIntrusion from './CrystallineIntrusion';
import SyntaxAnchor from './SyntaxAnchor';
import FloatingObjects from './FloatingObjects';
import Particles from './Particles';
import { useGLTF } from '@react-three/drei';

function MiniSpaceship() {
  const { scene } = useGLTF('/models/spaceship.glb');
  
  const cloned = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const scale = 0.5 / Math.max(size.x, size.y, size.z);
    clone.scale.setScalar(scale);
    return clone;
  }, [scene]);

  return (
    <group position={[-3, 1, 2]} rotation={[0, Math.PI / 4, 0]}>
      <primitive object={cloned} />
    </group>
  );
}

useGLTF.preload('/models/spaceship.glb');

function GameLoop() {
  const { gamePhase, tickIntegration, tickCompile, setPhase } = useGameState();
  const phaseTimerRef = useRef(0);
  const startedRef = useRef(false);

  useFrame((state, delta) => {
    if (gamePhase === 'LOADING' && !startedRef.current) {
      startedRef.current = true;
      // Transition straight to INVADING after 2 seconds (bypassing STABLE)
      setTimeout(() => setPhase('INVADING'), 2000);
      return;
    }

    if (gamePhase === 'INVADING' || gamePhase === 'CRITICAL') {
      tickIntegration();
    }

    if (gamePhase === 'COMPILING') {
      tickCompile();
    }
  });

  return null;
}

function SceneContent() {
  const { growthNodes, integrationPercent, anchorsPlaced, gamePhase, placeAnchor, missAnchor } = useGameState();

  const handleNodeClick = useCallback((nodeId) => {
    if (gamePhase !== 'INVADING' && gamePhase !== 'CRITICAL') return;
    placeAnchor(nodeId);
  }, [gamePhase, placeAnchor]);

  const handleMissClick = useCallback((e) => {
    // Only count if we're in an active phase and click wasn't on a node
    if (gamePhase !== 'INVADING' && gamePhase !== 'CRITICAL') return;
    // The miss handler is on the terrain — only fires if no crystal was clicked
  }, [gamePhase]);

  const showCrystals = gamePhase !== 'LOADING' && gamePhase !== 'STABLE' && gamePhase !== 'SUCCESS';

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.15} color="#8b9dc3" />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.3}
        color="#e8dcc8"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[0, 5, 0]} intensity={0.2} color="#d4b87a" />

      {/* Environment */}
      <Stars
        radius={100}
        depth={50}
        count={3000}
        factor={3}
        saturation={0}
        fade
        speed={0.5}
      />

      {/* Terrain */}
      <Terrain integrationPercent={integrationPercent} />

      {/* Crystalline Intrusion */}
      {showCrystals && (
        <CrystallineIntrusion
          growthNodes={growthNodes}
          integrationPercent={integrationPercent}
          onNodeClick={handleNodeClick}
        />
      )}

      {/* Placed Syntax Anchors */}
      <SyntaxAnchor anchorsPlaced={anchorsPlaced} />

      {/* Mini Spaceship sitting on the terrain */}
      <MiniSpaceship />

      {/* Floating debris (gravity reversal) */}
      {showCrystals && (
        <FloatingObjects integrationPercent={integrationPercent} />
      )}

      {/* Ambient particles */}
      <Particles
        integrationPercent={integrationPercent}
        gamePhase={gamePhase}
      />

      {/* Camera Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={5}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 6}
        autoRotate
        autoRotateSpeed={0.3}
        target={[0, -1, 0]}
      />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          intensity={0.8}
          luminanceThreshold={0.6}
          luminanceSmoothing={0.9}
          radius={0.8}
        />
        <Vignette eskil={false} offset={0.2} darkness={0.8} />
      </EffectComposer>
    </>
  );
}

export default function SectorView() {
  return (
    <div className="viewport" id="sector-viewport">
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        camera={{ position: [8, 6, 8], fov: 50, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#0a0c14' }}
      >
        <Suspense fallback={null}>
          <SceneContent />
          <GameLoop />
        </Suspense>
      </Canvas>

      {/* Overlay effects */}
      <div className="viewport__overlay">
        <div className="viewport__scanline" />
        <div className="viewport__vignette" />
      </div>
    </div>
  );
}
