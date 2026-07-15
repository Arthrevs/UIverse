'use client';

import { createContext, useContext, useReducer, useCallback, useRef } from 'react';

const GameContext = createContext(null);

const TOTAL_ANCHORS = 8;
const ANCHORS_NEEDED = 5;
const BASE_INTEGRATION_SPEED = 0.15; // % per tick (~60fps)
const SLOW_FACTOR = 0.4; // multiplier per anchor placed

const initialGrowthNodes = [
  { id: 0, position: [2, 0, 1], active: true, anchored: false },
  { id: 1, position: [-3, 0, 2], active: true, anchored: false },
  { id: 2, position: [1, 0, -3], active: true, anchored: false },
  { id: 3, position: [-1, 0, -1], active: true, anchored: false },
  { id: 4, position: [4, 0, -2], active: true, anchored: false },
  { id: 5, position: [-2, 0, 3], active: true, anchored: false },
  { id: 6, position: [0, 0, 4], active: true, anchored: false },
  { id: 7, position: [3, 0, 3], active: true, anchored: false },
];

const initialState = {
  gamePhase: 'LOADING', // LOADING | STABLE | INVADING | CRITICAL | COMPILING | SUCCESS | FAILURE
  integrationPercent: 0,
  anchorsRemaining: TOTAL_ANCHORS,
  anchorsPlaced: [],
  growthNodes: initialGrowthNodes,
  systemLogs: [],
  timeElapsed: 0,
  compileProgress: 0,
};

function getTimestamp(timeElapsed) {
  const mins = Math.floor(timeElapsed / 60);
  const secs = Math.floor(timeElapsed % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_PHASE': {
      const logs = [...state.systemLogs];
      if (action.phase === 'STABLE') {
        logs.push({ type: 'system', text: 'Sector 14 loaded. Environment stable.', time: getTimestamp(state.timeElapsed) });
        logs.push({ type: 'system', text: 'Axiom Weaver terminal online.', time: getTimestamp(state.timeElapsed) });
      } else if (action.phase === 'INVADING') {
        logs.push({ type: 'axiom', text: 'ONTOLOGICAL PARASITE DETECTED — Level 5', time: getTimestamp(state.timeElapsed) });
        logs.push({ type: 'axiom', text: 'Gravity axiom rewrite initiated in Sector 14', time: getTimestamp(state.timeElapsed) });
        logs.push({ type: 'compiler', text: 'The Compiler is watching. Integration at 0%.', time: getTimestamp(state.timeElapsed) });
      } else if (action.phase === 'CRITICAL') {
        logs.push({ type: 'warning', text: '⚠ CRITICAL — Integration exceeds 80%', time: getTimestamp(state.timeElapsed) });
        logs.push({ type: 'compiler', text: 'Compiler preparing final check...', time: getTimestamp(state.timeElapsed) });
      }
      return { ...state, gamePhase: action.phase, systemLogs: logs };
    }

    case 'TICK_INTEGRATION': {
      if (state.gamePhase !== 'INVADING' && state.gamePhase !== 'CRITICAL') return state;

      const anchoredCount = state.growthNodes.filter(n => n.anchored).length;
      const speedMultiplier = Math.max(0.05, 1 - anchoredCount * SLOW_FACTOR * 0.3);
      const newPercent = Math.min(100, state.integrationPercent + BASE_INTEGRATION_SPEED * speedMultiplier);
      const newTime = state.timeElapsed + (1 / 60);

      let newPhase = state.gamePhase;
      const logs = [...state.systemLogs];

      if (newPercent >= 80 && state.gamePhase !== 'CRITICAL') {
        newPhase = 'CRITICAL';
        logs.push({ type: 'warning', text: '⚠ CRITICAL — Integration exceeds 80%', time: getTimestamp(newTime) });
        logs.push({ type: 'compiler', text: 'Compiler preparing final check...', time: getTimestamp(newTime) });
      }

      if (newPercent >= 100) {
        newPhase = 'FAILURE';
        logs.push({ type: 'compiler', text: 'COMPILER EXECUTED. Sector 14 has been rewritten.', time: getTimestamp(newTime) });
        logs.push({ type: 'compiler', text: 'Reality overwritten. Nothing left remembers.', time: getTimestamp(newTime) });
      }

      // Periodic log messages
      const prevFloor = Math.floor(state.integrationPercent / 10);
      const newFloor = Math.floor(newPercent / 10);
      if (newFloor > prevFloor && newPhase !== 'FAILURE') {
        const gridLabels = ['A-1', 'B-3', 'C-5', 'D-2', 'E-4', 'F-7', 'G-6', 'H-8', 'I-9', 'J-0'];
        logs.push({
          type: 'axiom',
          text: `Gravity axiom rewrite spreading to grid ${gridLabels[newFloor % gridLabels.length]}`,
          time: getTimestamp(newTime)
        });
      }

      return {
        ...state,
        integrationPercent: newPercent,
        gamePhase: newPhase,
        timeElapsed: newTime,
        systemLogs: logs,
      };
    }

    case 'PLACE_ANCHOR': {
      const { nodeId } = action;
      const node = state.growthNodes.find(n => n.id === nodeId);
      if (!node || node.anchored || state.anchorsRemaining <= 0) return state;

      const newNodes = state.growthNodes.map(n =>
        n.id === nodeId ? { ...n, anchored: true } : n
      );
      const newAnchorsPlaced = [...state.anchorsPlaced, { nodeId, position: node.position }];
      const logs = [...state.systemLogs];

      logs.push({
        type: 'anchor',
        text: `Syntax Anchor deployed at growth node ${nodeId + 1}`,
        time: getTimestamp(state.timeElapsed)
      });

      const anchoredCount = newNodes.filter(n => n.anchored).length;
      if (anchoredCount >= ANCHORS_NEEDED) {
        logs.push({
          type: 'system',
          text: `${anchoredCount} anchors placed. FORCE COMPILE available.`,
          time: getTimestamp(state.timeElapsed)
        });
      }

      return {
        ...state,
        growthNodes: newNodes,
        anchorsPlaced: newAnchorsPlaced,
        anchorsRemaining: state.anchorsRemaining - 1,
        systemLogs: logs,
      };
    }

    case 'MISS_ANCHOR': {
      if (state.anchorsRemaining <= 0) return state;
      const logs = [...state.systemLogs];
      logs.push({
        type: 'warning',
        text: 'Anchor misplaced — no growth node at target. Anchor lost.',
        time: getTimestamp(state.timeElapsed)
      });

      const spikePercent = Math.min(100, state.integrationPercent + 3);
      let newPhase = state.gamePhase;
      if (spikePercent >= 100) {
        newPhase = 'FAILURE';
        logs.push({ type: 'compiler', text: 'COMPILER EXECUTED. Sector 14 has been rewritten.', time: getTimestamp(state.timeElapsed) });
      }

      return {
        ...state,
        anchorsRemaining: state.anchorsRemaining - 1,
        integrationPercent: spikePercent,
        gamePhase: newPhase,
        systemLogs: logs,
      };
    }

    case 'FORCE_COMPILE': {
      const anchoredCount = state.growthNodes.filter(n => n.anchored).length;
      if (anchoredCount < ANCHORS_NEEDED) return state;

      const logs = [...state.systemLogs];
      logs.push({ type: 'system', text: 'FORCE COMPILE initiated...', time: getTimestamp(state.timeElapsed) });
      logs.push({ type: 'system', text: 'Overriding Compiler execution...', time: getTimestamp(state.timeElapsed) });

      return { ...state, gamePhase: 'COMPILING', systemLogs: logs, compileProgress: 0 };
    }

    case 'TICK_COMPILE': {
      if (state.gamePhase !== 'COMPILING') return state;
      const newProgress = state.compileProgress + 2;
      if (newProgress >= 100) {
        const logs = [...state.systemLogs];
        logs.push({ type: 'anchor', text: 'Anchored geometry shattered. Gravity reset.', time: getTimestamp(state.timeElapsed) });
        logs.push({ type: 'system', text: 'Sector 14 stabilized. Mission complete.', time: getTimestamp(state.timeElapsed) });
        return { ...state, compileProgress: 100, gamePhase: 'SUCCESS', systemLogs: logs };
      }
      return { ...state, compileProgress: newProgress };
    }

    case 'ADD_LOG': {
      return {
        ...state,
        systemLogs: [...state.systemLogs, {
          type: action.logType || 'system',
          text: action.text,
          time: getTimestamp(state.timeElapsed)
        }],
      };
    }

    case 'RESET': {
      return { ...initialState, gamePhase: 'LOADING' };
    }

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;

  const setPhase = useCallback((phase) => {
    dispatchRef.current({ type: 'SET_PHASE', phase });
  }, []);

  const tickIntegration = useCallback(() => {
    dispatchRef.current({ type: 'TICK_INTEGRATION' });
  }, []);

  const placeAnchor = useCallback((nodeId) => {
    dispatchRef.current({ type: 'PLACE_ANCHOR', nodeId });
  }, []);

  const missAnchor = useCallback(() => {
    dispatchRef.current({ type: 'MISS_ANCHOR' });
  }, []);

  const forceCompile = useCallback(() => {
    dispatchRef.current({ type: 'FORCE_COMPILE' });
  }, []);

  const tickCompile = useCallback(() => {
    dispatchRef.current({ type: 'TICK_COMPILE' });
  }, []);

  const addLog = useCallback((text, logType = 'system') => {
    dispatchRef.current({ type: 'ADD_LOG', text, logType });
  }, []);

  const reset = useCallback(() => {
    dispatchRef.current({ type: 'RESET' });
  }, []);

  const canForceCompile = state.growthNodes.filter(n => n.anchored).length >= ANCHORS_NEEDED;

  return (
    <GameContext.Provider value={{
      ...state,
      canForceCompile,
      TOTAL_ANCHORS,
      ANCHORS_NEEDED,
      setPhase,
      tickIntegration,
      placeAnchor,
      missAnchor,
      forceCompile,
      tickCompile,
      addLog,
      reset,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGameState must be used within a GameProvider');
  return context;
}
