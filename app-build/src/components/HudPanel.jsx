'use client';

import IntegrationMeter from './IntegrationMeter';
import AnchorInventory from './AnchorInventory';
import SystemLog from './SystemLog';

export default function HudPanel() {
  return (
    <div className="hud-panel" id="hud-panel">
      <IntegrationMeter />
      <AnchorInventory />
      <SystemLog />
    </div>
  );
}
