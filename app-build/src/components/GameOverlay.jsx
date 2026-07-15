'use client';

import { useGameState } from '@/hooks/useGameState';

export default function GameOverlay() {
  const { gamePhase, integrationPercent, anchorsPlaced, growthNodes, TOTAL_ANCHORS, timeElapsed } = useGameState();

  if (gamePhase !== 'SUCCESS' && gamePhase !== 'FAILURE') return null;

  const isSuccess = gamePhase === 'SUCCESS';
  const anchoredCount = growthNodes.filter(n => n.anchored).length;
  const anchorsUsed = TOTAL_ANCHORS - (TOTAL_ANCHORS - anchorsPlaced.length);
  const mins = Math.floor(timeElapsed / 60);
  const secs = Math.floor(timeElapsed % 60);
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div className={`game-overlay ${isSuccess ? 'game-overlay--success' : 'game-overlay--failure'}`}>
      <div className="game-overlay__status-line">
        {isSuccess ? 'MISSION COMPLETE // SECTOR 14' : 'MISSION FAILED // SECTOR 14'}
      </div>
      <div className="game-overlay__title">
        {isSuccess ? 'SECTOR STABILIZED' : 'SECTOR LOST'}
      </div>
      <div className="game-overlay__divider" />
      <div className="game-overlay__subtitle">
        {isSuccess
          ? 'Gravity axiom restored. Ontological parasite neutralized. Compiler override successful.'
          : 'The Compiler has executed. Local physics overwritten. Sector 14 no longer exists.'}
      </div>
      <div className="game-overlay__stats">
        <span>ANCHORS DEPLOYED: <span className="game-overlay__stat-value">{anchorsPlaced.length}</span></span>
        <span>NODES SECURED: <span className="game-overlay__stat-value">{anchoredCount}</span></span>
        <span>ELAPSED: <span className="game-overlay__stat-value">{timeStr}</span></span>
        <span>INTEGRATION: <span className="game-overlay__stat-value">{Math.floor(integrationPercent)}%</span></span>
      </div>
      <button className="game-overlay__btn" onClick={() => window.location.reload()}>
        {isSuccess ? 'REVIEW DEBRIEF' : 'RETRY MISSION'}
      </button>
    </div>
  );
}
