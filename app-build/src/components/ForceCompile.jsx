'use client';

import { useGameState } from '@/hooks/useGameState';

export default function ForceCompile() {
  const { gamePhase, canForceCompile, forceCompile, compileProgress, integrationPercent, growthNodes, ANCHORS_NEEDED } = useGameState();
  const anchoredCount = growthNodes.filter(n => n.anchored).length;

  const isCompiling = gamePhase === 'COMPILING';
  const isEnded = gamePhase === 'SUCCESS' || gamePhase === 'FAILURE';

  if (isEnded) return null;

  let btnClass = 'force-compile__btn';
  let btnText = 'FORCE COMPILE';

  if (isCompiling) {
    btnClass += ' force-compile__btn--compiling';
    btnText = `COMPILING... ${Math.floor(compileProgress)}%`;
  } else if (canForceCompile) {
    btnClass += ' force-compile__btn--ready';
  }

  const handleClick = () => {
    if (canForceCompile && !isCompiling) {
      forceCompile();
    }
  };

  return (
    <div className="force-compile" id="force-compile-bar">
      <div className="force-compile__info">
        {canForceCompile
          ? `${anchoredCount} / ${ANCHORS_NEEDED} anchors placed — READY`
          : `${anchoredCount} / ${ANCHORS_NEEDED} anchors needed to compile`
        }
        &nbsp;&nbsp;|&nbsp;&nbsp;
        Integration: {Math.floor(integrationPercent)}%
      </div>
      <button
        className={btnClass}
        onClick={handleClick}
        disabled={!canForceCompile || isCompiling}
      >
        {btnText}
      </button>
    </div>
  );
}
