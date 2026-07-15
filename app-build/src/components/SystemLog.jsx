'use client';

import { useEffect, useRef } from 'react';
import { useGameState } from '@/hooks/useGameState';

// Highlight known keywords in log text with distinct colors
function highlightText(text) {
  const parts = [];
  // Pattern: match sector/grid references, percentages, and alert keywords
  const regex = /(Sector \d+|grid [A-Z]-\d+|growth node \d+|\d+%|ONTOLOGICAL PARASITE|FORCE COMPILE|Level \d+|CRITICAL|Compiler|Syntax Anchor)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Push preceding plain text
    if (match.index > lastIndex) {
      parts.push(<span key={`t-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>);
    }

    // Determine keyword class
    let cls = 'system-log__keyword';
    const val = match[0];
    if (/Sector \d+|grid [A-Z]-\d+|growth node \d+/.test(val)) {
      cls += ' system-log__keyword--sector';
    } else if (/\d+%/.test(val)) {
      cls += ' system-log__keyword--percent';
    } else {
      cls += ' system-log__keyword--alert';
    }

    parts.push(<span key={`k-${match.index}`} className={cls}>{val}</span>);
    lastIndex = regex.lastIndex;
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push(<span key={`t-${lastIndex}`}>{text.slice(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : text;
}

export default function SystemLog() {
  const { systemLogs } = useGameState();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [systemLogs]);

  return (
    <div className="hud-section" id="system-log">
      <div className="hud-section__title">System Log</div>
      <div className="system-log" ref={scrollRef}>
        {systemLogs.length === 0 && (
          <div className="system-log__entry system-log__entry--system">
            <span className="system-log__timestamp">[--:--]</span>
            <span className="system-log__tag">[SYSTEM]</span>
            Awaiting connection...
          </div>
        )}
        {systemLogs.map((log, i) => (
          <div key={i} className={`system-log__entry system-log__entry--${log.type}`}>
            <span className="system-log__timestamp">[{log.time}]</span>
            <span className="system-log__tag">[{log.type.toUpperCase()}]</span>
            {highlightText(log.text)}
          </div>
        ))}
      </div>
    </div>
  );
}
