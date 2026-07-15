'use client';

import { useGameState } from '@/hooks/useGameState';

export default function StatusBar() {
  const { gamePhase, integrationPercent, timeElapsed, setPhase } = useGameState();

  const mins = Math.floor(timeElapsed / 60);
  const secs = Math.floor(timeElapsed % 60);
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const isStable = gamePhase === 'STABLE' || gamePhase === 'LOADING';
  const isInvading = gamePhase === 'INVADING' || gamePhase === 'CRITICAL';
  const isCritical = gamePhase === 'CRITICAL' || gamePhase === 'FAILURE';

  return (
    <div className="status-bar" id="status-bar">
      <div className="status-bar__sector">
        Sector 14 // Level 5 Breach: Gravity Reversal
      </div>

      <div className="status-bar__indicators">
        <div className="status-indicator">
          <div className={`status-indicator__dot ${isStable ? 'status-indicator__dot--stable' : ''}`} />
          <span>Stable</span>
        </div>
        <div className="status-indicator">
          <div className={`status-indicator__dot ${isInvading ? 'status-indicator__dot--invading' : ''} ${isCritical ? 'status-indicator__dot--danger' : ''}`} />
          <span>Invading</span>
        </div>
        <div className="status-indicator">
          <div className="status-indicator__dot status-indicator__dot--system" />
          <span>System</span>
        </div>
      </div>

      <div className="status-bar__controls">
        <div className={`status-bar__timer ${isCritical ? 'status-bar__timer--critical' : ''}`}>
          {timeStr}
        </div>
      </div>
    </div>
  );
}
