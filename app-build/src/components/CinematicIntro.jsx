'use client';

import { useRef, useMemo, useState, useEffect, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, useGLTF } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// ─── Timeline Constants ───
const TOTAL_DURATION = 39;
const PHASE = {
  FOLLOW_SHIP: [0, 3],
  HOVER_SHIP: [3, 6],
  ZOOM_WING: [6, 9],
  EXIT_SHIP: [9, 12],
  LOOK_UP: [12, 14],
  STAR_GROWS: [14, 17],
  LASER_STRIKE: [17, 19],
  VORTEX_FORM: [19, 22],
  WALK_BACK: [22, 25],
  SIT_DOWN: [25, 27],
  HUD_ON: [27, 29],
  DRONE_EMERGE: [29, 32],
  DRONE_LAUNCH: [32, 35],
  TRANSITION: [35, 39],
};

function inPhase(time, phase) {
  return time >= phase[0] && time < phase[1];
}

function phaseProgress(time, phase) {
  if (time < phase[0]) return 0;
  if (time >= phase[1]) return 1;
  return (time - phase[0]) / (phase[1] - phase[0]);
}

function lerp(a, b, t) {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

function lerpVec3(a, b, t) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// ─── Spaceship (loaded from GLB model, handles landing animation) ───
const SHIP_MODEL_PATH = '/models/spaceship.glb';

function Spaceship({ timeRef }) {
  const { scene } = useGLTF(SHIP_MODEL_PATH);
  const groupRef = useRef();
  const engineGlowRef = useRef();

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 5 / maxDim;
    clone.scale.setScalar(scale);

    box.setFromObject(clone);
    const center = new THREE.Vector3();
    box.getCenter(center);
    clone.position.sub(center);
    clone.position.y += size.y * scale * 0.5;

    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  useFrame(() => {
    if (!groupRef.current) return;
    const t = timeRef.current;
    
    // Ship Landing Animation
    if (t < PHASE.FOLLOW_SHIP[1]) {
      const p = easeInOut(phaseProgress(t, PHASE.FOLLOW_SHIP));
      groupRef.current.position.y = lerp(30, 10, p);
    } else if (t < PHASE.HOVER_SHIP[1]) {
      const p = easeInOut(phaseProgress(t, PHASE.HOVER_SHIP));
      groupRef.current.position.y = lerp(10, 3, p);
    } else if (t < PHASE.ZOOM_WING[1]) {
      const p = easeInOut(phaseProgress(t, PHASE.ZOOM_WING));
      groupRef.current.position.y = lerp(3, 0, p);
    } else {
      groupRef.current.position.y = 0;
    }

    // Engine Glow Intensity
    if (engineGlowRef.current) {
      if (t < PHASE.ZOOM_WING[1]) {
        engineGlowRef.current.visible = true;
      } else {
        engineGlowRef.current.visible = false;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={clonedScene} />
      {/* Engine glow during descent */}
      <group ref={engineGlowRef}>
        <mesh position={[1.2, -0.2, 2.5]}>
          <sphereGeometry args={[0.3, 6, 6]} />
          <meshStandardMaterial color="#ff6b00" emissive="#ff6b00" emissiveIntensity={5} transparent opacity={0.7} />
        </mesh>
        <mesh position={[-1.2, -0.2, 2.5]}>
          <sphereGeometry args={[0.3, 6, 6]} />
          <meshStandardMaterial color="#ff6b00" emissive="#ff6b00" emissiveIntensity={5} transparent opacity={0.7} />
        </mesh>
      </group>
    </group>
  );
}

// ─── Guardian Drone (loaded from GLB) ───
const DRONE_MODEL_PATH = '/models/drone_design.glb';

function GuardianDrone({ timeRef }) {
  const { scene } = useGLTF(DRONE_MODEL_PATH);
  const groupRef = useRef();

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 1.0 / maxDim; // Drone should be small, ~1 unit
    clone.scale.setScalar(scale);

    box.setFromObject(clone);
    const center = new THREE.Vector3();
    box.getCenter(center);
    clone.position.sub(center);

    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = timeRef.current;

    if (t < PHASE.DRONE_EMERGE[0]) {
      groupRef.current.visible = false;
      return;
    }
    groupRef.current.visible = true;

    const emergeP = easeInOut(phaseProgress(t, PHASE.DRONE_EMERGE));
    const launchP = easeInOut(phaseProgress(t, PHASE.DRONE_LAUNCH));

    const emergeY = lerp(0.7, 2, emergeP);
    const launchY = lerp(2, 25, launchP);
    const y = t < PHASE.DRONE_LAUNCH[0] ? emergeY : launchY;

    groupRef.current.position.set(0, y, 0.5);
    
    // Rotate the drone continuously for a cool scanning effect
    groupRef.current.rotation.y += delta * 2;
  });

  return (
    <group ref={groupRef} visible={false}>
      <primitive object={clonedScene} />
      <pointLight color="#00ffcc" intensity={2} distance={5} decay={2} />
    </group>
  );
}

// ─── Growing Star ───
function GrowingStar({ timeRef }) {
  const meshRef = useRef();

  useFrame(() => {
    if (!meshRef.current) return;
    const t = timeRef.current;

    if (t < PHASE.LOOK_UP[0] || t >= PHASE.VORTEX_FORM[1]) {
      meshRef.current.visible = false;
      return;
    }
    meshRef.current.visible = true;

    const growP = easeInOut(phaseProgress(t, PHASE.STAR_GROWS));
    const scale = lerp(0.05, 1.5, growP);
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <group position={[3, 40, -10]}>
      <mesh ref={meshRef} visible={false}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#ffffff" emissive="#d4b87a" emissiveIntensity={5} transparent opacity={0.9} />
      </mesh>
      <pointLight color="#d4b87a" intensity={3} distance={100} />
    </group>
  );
}

// ─── Laser Beam ───
function LaserBeam({ timeRef }) {
  const groupRef = useRef();
  const beamRef = useRef();
  const flashRef = useRef();

  const beamGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.04, 0.08, 1, 6);
    // Base is at 0, top is at +1. So when scaled by length, it grows exactly along +Y axis.
    geo.translate(0, 0.5, 0);
    return geo;
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    const t = timeRef.current;

    if (t < PHASE.LASER_STRIKE[0] || t >= PHASE.VORTEX_FORM[1]) {
      groupRef.current.visible = false;
      return;
    }
    groupRef.current.visible = true;

    // Mathematically perfect alignment from the star to the ground target using Quaternions
    const start = new THREE.Vector3(3, 40, -10);
    const end = new THREE.Vector3(3, 0, -3);
    const direction = new THREE.Vector3().subVectors(end, start).normalize();
    
    // The cylinder geometry is aligned along the +Y axis.
    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
    groupRef.current.setRotationFromQuaternion(quaternion);

    const distance = 40.6; // exact distance
    const p = phaseProgress(t, PHASE.LASER_STRIKE);
    const beamLength = lerp(0, distance, easeInOut(Math.min(1, p * 3)));

    if (beamRef.current) {
      beamRef.current.scale.y = beamLength || 0.01;
      // No position translation needed! The geometry's base is already at 0.
    }
    if (flashRef.current) {
      flashRef.current.visible = p > 0.3;
      const s = 0.5 + p * 0.5;
      flashRef.current.scale.setScalar(s);
      flashRef.current.material.opacity = 0.5 * (1 - p);
      // Position the flash exactly at the end of the beam (+Y direction)
      flashRef.current.position.set(0, distance, 0);
    }
  });

  return (
    // Origin is exactly at the star
    <group ref={groupRef} position={[3, 40, -10]} visible={false}>
      <mesh ref={beamRef} geometry={beamGeo}>
        <meshStandardMaterial color="#d4b87a" emissive="#ff6b00" emissiveIntensity={5} transparent opacity={0.9} />
      </mesh>
      <mesh ref={flashRef} visible={false}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color="#ff6b00" emissive="#ff6b00" emissiveIntensity={4} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// ─── Ground Vortex ───
function GroundVortex({ timeRef }) {
  const groupRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = timeRef.current;

    if (t < PHASE.LASER_STRIKE[1]) {
      groupRef.current.visible = false;
      return;
    }
    groupRef.current.visible = true;

    const p = easeInOut(phaseProgress(t, PHASE.VORTEX_FORM));
    const scale = lerp(0.1, 3, Math.min(1, p));
    groupRef.current.scale.setScalar(scale);

    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 3;
    if (ring2Ref.current) ring2Ref.current.rotation.z -= delta * 2;
  });

  return (
    <group ref={groupRef} position={[3, 0.05, -3]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <mesh>
        <circleGeometry args={[0.8, 16]} />
        <meshBasicMaterial color="#000000" side={THREE.DoubleSide} transparent opacity={0.95} />
      </mesh>
      <mesh ref={ring1Ref}>
        <ringGeometry args={[0.7, 1, 24]} />
        <meshStandardMaterial color="#2a0a3a" emissive="#4a1a6a" emissiveIntensity={2} side={THREE.DoubleSide} transparent opacity={0.7} />
      </mesh>
      <mesh ref={ring2Ref}>
        <ringGeometry args={[0.9, 1.3, 16]} />
        <meshStandardMaterial color="#1a0a2a" emissive="#3a0a5a" emissiveIntensity={1} side={THREE.DoubleSide} transparent opacity={0.4} />
      </mesh>
      <pointLight color="#6a2a9a" intensity={5} distance={8} />
    </group>
  );
}

// ─── Landing Dust ───
function LandingDust({ timeRef }) {
  const pointsRef = useRef();

  const positions = useMemo(() => {
    const pos = new Float32Array(100 * 3);
    for (let i = 0; i < 100; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1 + Math.random() * 4;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.random() * 0.5;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const t = timeRef.current;
    pointsRef.current.visible = t >= PHASE.ZOOM_WING[0] && t < PHASE.EXIT_SHIP[1];
    if (!pointsRef.current.visible) return;

    const arr = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < 100; i++) {
      arr[i * 3 + 1] += delta * (0.5 + Math.random() * 0.5);
      if (arr[i * 3 + 1] > 3) arr[i * 3 + 1] = 0;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} visible={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={100} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#8b7a5e" transparent opacity={0.4} sizeAttenuation depthWrite={false} />
    </points>
  );
}

// ─── Cinematic Terrain (loaded from GLTF model) ───
const TERRAIN_MODEL_PATH = '/models/marble_cliff_05_2k/marble_cliff_05_2k.gltf';

function CinematicTerrain() {
  const { scene } = useGLTF(TERRAIN_MODEL_PATH);
  
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    
    // Scale the terrain to be large enough for the scene
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    
    // We want the terrain to be roughly 60 units wide (like our old plane)
    const targetSize = 60; 
    const scale = targetSize / maxDim;
    clone.scale.setScalar(scale);

    // Center it on X and Z, and place it just below 0 on Y
    box.setFromObject(clone);
    const center = new THREE.Vector3();
    box.getCenter(center);
    clone.position.set(-center.x, -0.35 - box.max.y, -center.z);

    // Ensure it receives shadows
    clone.traverse((child) => {
      if (child.isMesh) {
        child.receiveShadow = true;
        child.castShadow = true;
      }
    });
    
    return clone;
  }, [scene]);

  return (
    <group position={[0, -0.35, 0]}>
      <primitive object={clonedScene} />
    </group>
  );
}

// ─── Camera Controller (uses ref for time — no React state) ───
function CameraController({ timeRef }) {
  const { camera } = useThree();

  useFrame(() => {
    const t = timeRef.current;
    let pos, lookAt;
    let headBob = 0;
    let shake = 0;

    // Helper to get ship Y based on time for camera tracking
    let shipY = 0;
    if (t < PHASE.FOLLOW_SHIP[1]) shipY = lerp(30, 10, easeInOut(phaseProgress(t, PHASE.FOLLOW_SHIP)));
    else if (t < PHASE.HOVER_SHIP[1]) shipY = lerp(10, 3, easeInOut(phaseProgress(t, PHASE.HOVER_SHIP)));
    else if (t < PHASE.ZOOM_WING[1]) shipY = lerp(3, 0, easeInOut(phaseProgress(t, PHASE.ZOOM_WING)));

    if (t < PHASE.FOLLOW_SHIP[1]) {
      const p = easeInOut(phaseProgress(t, PHASE.FOLLOW_SHIP));
      pos = lerpVec3([0, 40, -15], [0, 15, -10], p);
      lookAt = lerpVec3([0, 30, 0], [0, 10, 0], p);
    } else if (t < PHASE.HOVER_SHIP[1]) {
      const p = easeInOut(phaseProgress(t, PHASE.HOVER_SHIP));
      pos = lerpVec3([0, 15, -10], [-5, 8, -5], p);
      lookAt = lerpVec3([0, 10, 0], [0, 3, 0], p);
    } else if (t < PHASE.ZOOM_WING[1]) {
      const p = easeInOut(phaseProgress(t, PHASE.ZOOM_WING));
      pos = lerpVec3([-5, 8, -5], [-3, 1, 0], p);
      lookAt = lerpVec3([0, 3, 0], [-1, 0.5, 0], p);
    } else if (t < PHASE.EXIT_SHIP[1]) {
      const p = easeInOut(phaseProgress(t, PHASE.EXIT_SHIP));
      // Drop down from left wing and stand up
      pos = lerpVec3([-3, 1, 0], [-3.5, 1.6, 2], p); 
      // Look down at the ground while stepping off, then look up slightly as we land
      lookAt = lerpVec3([-1, 0.5, 0], [-3.5, -1, 3], p < 0.5 ? p * 2 : 1 - (p - 0.5) * 2);
      if (p > 0.5) {
         lookAt = lerpVec3([-3.5, -1, 3], [-3.5, 1.6, 10], (p - 0.5) * 2);
      }
      
      // Impact shake when hitting the ground at the end of the drop
      shake = p > 0.8 ? Math.sin(p * Math.PI * 20) * (1 - p) * 0.2 : 0;
      headBob = Math.sin(p * Math.PI) * 0.1;
    } else if (t < PHASE.LOOK_UP[1]) {
      const p = easeInOut(phaseProgress(t, PHASE.LOOK_UP));
      pos = [-3.5, 1.6, 2];
      lookAt = lerpVec3([-3.5, 1.6, 10], [3, 40, -10], p);
    } else if (t < PHASE.STAR_GROWS[1]) {
      pos = [-3.5, 1.6, 2];
      lookAt = [3, 40, -10];
    } else if (t < PHASE.LASER_STRIKE[1]) {
      pos = [-3.5, 1.6, 2];
      lookAt = [3, 40, -10];
    } else if (t < PHASE.VORTEX_FORM[1]) {
      const p = easeInOut(phaseProgress(t, PHASE.VORTEX_FORM));
      pos = [-3.5, 1.6, 2];
      lookAt = lerpVec3([3, 40, -10], [3, 0, -3], p);
      shake = p > 0.3 ? Math.sin(t * 40) * 0.04 * (1 - p) : 0;
    } else if (t < PHASE.WALK_BACK[1]) {
      const p = easeInOut(phaseProgress(t, PHASE.WALK_BACK));
      pos = lerpVec3([-3.5, 1.6, 2], [-3, 1.6, 0], p); // Walk back to left wing
      lookAt = lerpVec3([3, 0, -3], [-1, 1.6, -2], p);
      headBob = Math.sin(p * Math.PI * 3) * 0.08;
    } else if (t < PHASE.SIT_DOWN[1]) {
      const p = easeInOut(phaseProgress(t, PHASE.SIT_DOWN));
      pos = lerpVec3([-3, 1.6, 0], [0, 1.3, -1], p); // Enter cockpit
      lookAt = lerpVec3([-1, 1.6, -2], [0, 1.2, 5], p);
      headBob = Math.sin(p * Math.PI * 2) * 0.05;
    } else if (t < PHASE.HUD_ON[1]) {
      pos = [0, 1.3, -1];
      lookAt = [0, 1.2, 5];
    } else if (t < PHASE.DRONE_EMERGE[1]) {
      pos = [0, 1.3, -1];
      lookAt = [0, 1.2, 5];
    } else if (t < PHASE.DRONE_LAUNCH[1]) {
      const p = easeInOut(phaseProgress(t, PHASE.DRONE_EMERGE));
      pos = lerpVec3([0, 1.3, -1], [-3, 2.5, -4], p);
      lookAt = lerpVec3([0, 1.2, 5], [0, 2, 0.5], p);
    } else if (t < PHASE.TRANSITION[1]) {
      const p = easeInOut(phaseProgress(t, PHASE.DRONE_LAUNCH));
      const droneY = lerp(2, 25, easeInOut(p));
      pos = lerpVec3([-3, 2.5, -4], [0, droneY - 1, -1], p);
      lookAt = [0, droneY, 0.5];
    } else {
      const p = easeInOut(phaseProgress(t, PHASE.TRANSITION));
      pos = lerpVec3([0, 24, -1], [0, 25, 0.5], p);
      lookAt = [0, 25.5, 0.5];
    }

    camera.position.set(pos[0] + shake, pos[1] + headBob + shake * 0.5, pos[2]);
    camera.lookAt(lookAt[0], lookAt[1], lookAt[2]);
    camera.updateProjectionMatrix();
  });

  return null;
}

// ─── Scene that reads time from ref (no re-renders) ───
function CinematicScene({ timeRef }) {
  return (
    <>
      <ambientLight intensity={0.1} color="#8b9dc3" />
      <directionalLight position={[10, 15, 5]} intensity={0.25} color="#e8dcc8" />
      <pointLight position={[0, 3, 0]} intensity={0.3} color="#d4b87a" />
      <Stars
        radius={300}
        depth={80}
        count={8000}
        factor={6}
        saturation={0}
        fade
        speed={0.3}
      />
      <CinematicTerrain />
      <Spaceship timeRef={timeRef} />
      <LandingDust timeRef={timeRef} />
      <GrowingStar timeRef={timeRef} />
      <LaserBeam timeRef={timeRef} />
      <GroundVortex timeRef={timeRef} />
      <GuardianDrone timeRef={timeRef} />
      <CameraController timeRef={timeRef} />
      <EffectComposer>
        <Bloom intensity={1.2} luminanceThreshold={0.5} luminanceSmoothing={0.9} radius={0.8} />
        <Vignette eskil={false} offset={0.3} darkness={0.9} />
      </EffectComposer>
    </>
  );
}

// ─── Overlay Component (reads time from ref via interval) ───
function CinematicOverlay({ timeRef, onGuardianPress, onSkip }) {
  const [subtitle, setSubtitle] = useState('');
  const [showGuardian, setShowGuardian] = useState(false);
  const [whiteFlash, setWhiteFlash] = useState(0);
  const guardianPressedRef = useRef(false);

  useEffect(() => {
    // Low-frequency UI update (10fps is fine for text overlays)
    const interval = setInterval(() => {
      const t = timeRef.current;

      // Subtitle
      let sub = '';
      if (inPhase(t, PHASE.FOLLOW_SHIP)) sub = 'APPROACHING SECTOR 14';
      else if (inPhase(t, PHASE.HOVER_SHIP)) sub = 'HOVERING SEQUENCE INITIATED';
      else if (inPhase(t, PHASE.ZOOM_WING)) sub = 'PREPARING TO DISEMBARK';
      else if (inPhase(t, PHASE.EXIT_SHIP)) sub = 'DISEMBARKING';
      else if (inPhase(t, PHASE.LOOK_UP)) sub = 'ANOMALY DETECTED';
      else if (inPhase(t, PHASE.STAR_GROWS)) sub = 'ANALYZING SIGNATURE...';
      else if (inPhase(t, PHASE.LASER_STRIKE)) sub = '⚠ INCOMING';
      else if (inPhase(t, PHASE.VORTEX_FORM)) sub = 'ONTOLOGICAL BREACH CONFIRMED';
      else if (inPhase(t, PHASE.WALK_BACK)) sub = 'RETURNING TO SHIP';
      else if (inPhase(t, PHASE.SIT_DOWN)) sub = 'ENGAGING COCKPIT';
      else if (inPhase(t, PHASE.HUD_ON)) sub = 'DEPLOY SURVEILLANCE';
      else if (inPhase(t, PHASE.DRONE_EMERGE)) sub = 'GUARDIAN LAUNCHING';
      else if (inPhase(t, PHASE.DRONE_LAUNCH)) sub = 'GUARDIAN ONLINE';
      else if (inPhase(t, PHASE.TRANSITION)) sub = 'ENTERING GUARDIAN VIEW';
      setSubtitle(sub);

      // Guardian button
      const shouldShow = t >= PHASE.HUD_ON[0] && t < PHASE.DRONE_EMERGE[0] && !guardianPressedRef.current;
      setShowGuardian(shouldShow);

      // White flash
      if (t >= PHASE.TRANSITION[0]) {
        setWhiteFlash(Math.min(1, phaseProgress(t, PHASE.TRANSITION)));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [timeRef]);

  const handleGuardian = useCallback(() => {
    guardianPressedRef.current = true;
    setShowGuardian(false);
    onGuardianPress();
  }, [onGuardianPress]);

  return (
    <>
      <div className="cinematic__scanline" />

      {subtitle && (
        <div className="cinematic__subtitle" key={subtitle}>
          {subtitle}
        </div>
      )}

      {showGuardian && (
        <div className="cinematic__guardian-overlay">
          <div className="cinematic__guardian-label">DEPLOY GUARDIAN DRONE</div>
          <button className="cinematic__guardian-btn" onClick={handleGuardian}>
            GUARDIAN
          </button>
        </div>
      )}

      <button className="cinematic__skip" onClick={onSkip}>
        SKIP ›
      </button>

      {whiteFlash > 0 && (
        <div className="cinematic__flash" style={{ opacity: whiteFlash }} />
      )}
    </>
  );
}

// ─── Main Cinematic Component ───
export default function CinematicIntro({ onComplete }) {
  const timeRef = useRef(0);
  const startTimeRef = useRef(null);
  const completedRef = useRef(false);

  // Drive the timeline via useFrame inside the Canvas
  function TimeDriver() {
    useFrame(() => {
      if (startTimeRef.current === null) startTimeRef.current = performance.now();
      timeRef.current = (performance.now() - startTimeRef.current) / 1000;

      if (timeRef.current >= TOTAL_DURATION && !completedRef.current) {
        completedRef.current = true;
        // Use setTimeout to avoid calling setState during render
        setTimeout(() => onComplete(), 0);
      }
    });
    return null;
  }

  const handleGuardianPress = useCallback(() => {
    // Jump to drone emerge phase
    if (timeRef.current < PHASE.DRONE_EMERGE[0]) {
      const offset = PHASE.DRONE_EMERGE[0] - timeRef.current;
      startTimeRef.current -= offset * 1000;
    }
  }, []);

  const handleSkip = useCallback(() => {
    if (!completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }, [onComplete]);

  return (
    <div className="cinematic" id="cinematic-intro">
      <Canvas
        camera={{ position: [0, 12, -8], fov: 60, near: 0.1, far: 500 }}
        gl={{ antialias: true, alpha: false }}
        shadows={{ type: THREE.PCFShadowMap }}
        style={{ background: '#050810' }}
      >
        <TimeDriver />
        <Suspense fallback={null}>
          <CinematicScene timeRef={timeRef} />
        </Suspense>
      </Canvas>

      <CinematicOverlay
        timeRef={timeRef}
        onGuardianPress={handleGuardianPress}
        onSkip={handleSkip}
      />
    </div>
  );
}

// Preload models as early as possible
useGLTF.preload(SHIP_MODEL_PATH);
useGLTF.preload(TERRAIN_MODEL_PATH);
useGLTF.preload(DRONE_MODEL_PATH);
