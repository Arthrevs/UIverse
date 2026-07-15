'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { GameProvider } from '@/hooks/useGameState';
import StatusBar from '@/components/StatusBar';
import HudPanel from '@/components/HudPanel';
import ForceCompile from '@/components/ForceCompile';
import GameOverlay from '@/components/GameOverlay';

// Dynamically import heavy 3D components to avoid SSR issues with Three.js
const SectorView = dynamic(() => import('@/components/SectorView'), {
  ssr: false,
  loading: () => (
    <div className="viewport" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0c14',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '36px',
          fontWeight: 900,
          fontStyle: 'italic',
          color: '#d4b87a',
          marginBottom: '12px',
          letterSpacing: '3px',
        }}>
          AXIOM WEAVER
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: '#4a5568',
          animation: 'flash-text 1.5s ease-in-out infinite',
        }}>
          Initializing Terminal...
        </div>
      </div>
    </div>
  ),
});

const CinematicIntro = dynamic(() => import('@/components/CinematicIntro'), {
  ssr: false,
  loading: () => (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#050810',
      zIndex: 300,
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        letterSpacing: '4px',
        textTransform: 'uppercase',
        color: '#4a5568',
        animation: 'flash-text 1.5s ease-in-out infinite',
      }}>
        Loading Cinematic...
      </div>
    </div>
  ),
});

export default function Home() {
  const [showCinematic, setShowCinematic] = useState(true);

  const handleCinematicComplete = useCallback(() => {
    setShowCinematic(false);
  }, []);

  return (
    <GameProvider>
      {showCinematic ? (
        <CinematicIntro onComplete={handleCinematicComplete} />
      ) : (
        <div className="dashboard" id="axiom-weaver-dashboard">
          <StatusBar />
          <SectorView />
          <HudPanel />
          <ForceCompile />
          <GameOverlay />
        </div>
      )}
    </GameProvider>
  );
}
