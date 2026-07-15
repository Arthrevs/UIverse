'use client';

import { useGameState } from '@/hooks/useGameState';

export default function AnchorInventory() {
  const { anchorsRemaining, TOTAL_ANCHORS, ANCHORS_NEEDED, growthNodes } = useGameState();
  const anchorsUsed = TOTAL_ANCHORS - anchorsRemaining;
  const anchoredCount = growthNodes.filter(n => n.anchored).length;

  return (
    <div className="hud-section" id="anchor-inventory">
      <div className="hud-section__title">Syntax Anchors</div>
      <div className="anchor-inventory">
        <div className="anchor-inventory__grid">
          {Array.from({ length: TOTAL_ANCHORS }).map((_, i) => (
            <div
              key={i}
              className={`anchor-inventory__item ${
                i < anchorsRemaining
                  ? 'anchor-inventory__item--available'
                  : 'anchor-inventory__item--used'
              }`}
            >
              <span className="anchor-inventory__icon">◆</span>
            </div>
          ))}
        </div>
        <div className="anchor-inventory__count">
          <span>{anchorsRemaining}</span> / {TOTAL_ANCHORS} remaining
          {anchoredCount >= ANCHORS_NEEDED && (
            <span style={{ color: '#22c55e', display: 'block', marginTop: '4px', fontSize: '10px' }}>
              ✓ Minimum anchors reached
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
