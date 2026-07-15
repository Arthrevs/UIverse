'use client';

import { useGameState } from '@/hooks/useGameState';

export default function IntegrationMeter() {
  const { integrationPercent } = useGameState();
  const percent = Math.min(100, Math.floor(integrationPercent));

  let barClass = 'integration-meter__bar integration-meter__bar--safe';
  if (percent >= 80) barClass = 'integration-meter__bar integration-meter__bar--danger';
  else if (percent >= 50) barClass = 'integration-meter__bar integration-meter__bar--warning';

  const valueClass = percent >= 80
    ? 'integration-meter__value integration-meter__value--critical'
    : 'integration-meter__value';

  return (
    <div className="hud-section" id="integration-meter">
      <div className="hud-section__title">Integration</div>
      <div className="integration-meter">
        <div className={valueClass}>
          {percent}%
        </div>
        <div className="integration-meter__label">
          Sector 14 Axiom Override
        </div>
        <div className="integration-meter__bar-container">
          <div
            className={barClass}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="integration-meter__warning">
          Compiler executes at 100%
        </div>
      </div>
    </div>
  );
}
