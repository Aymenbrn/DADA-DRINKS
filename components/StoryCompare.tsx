"use client";

import { useRef, useState } from "react";
import { STORY_IMG } from "@/components/OurStory";

/**
 * Nouveauté « Notre histoire » : avant / après glissant.
 * On fait glisser la poignée pour passer de la Dada de 2007 (logo rond, canette transparente) à la Dada d'aujourd'hui.
 */
export default function StoryCompare() {
  const [pos, setPos] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef(false);
  const move = (x: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100)));
  };

  return (
    <div className="cmp">
      <div
        ref={box}
        className="cmp-stage"
        onPointerDown={(e) => {
          drag.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          move(e.clientX);
        }}
        onPointerMove={(e) => drag.current && move(e.clientX)}
        onPointerUp={() => (drag.current = false)}
        onPointerCancel={() => (drag.current = false)}
      >
        <div className="cmp-side is-now" aria-hidden="true">
          <span className="cmp-tag">AUJOURD’HUI</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="cmp-logo" src={STORY_IMG.logoNow} alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="cmp-cans" src={STORY_IMG.cansNow} alt="" />
        </div>
        <div className="cmp-side is-then" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} aria-hidden="true">
          <span className="cmp-tag">2007</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="cmp-logo" src={STORY_IMG.logo2007} alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="cmp-cans" src={STORY_IMG.cans2007} alt="" />
        </div>
        <div className="cmp-handle" style={{ left: `${pos}%` }} aria-hidden="true">
          <span>‹ ›</span>
        </div>
        <input
          className="cmp-range"
          type="range"
          min={0}
          max={100}
          value={Math.round(pos)}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label="Comparer la Dada de 2007 et celle d’aujourd’hui"
        />
      </div>
      <p className="cmp-legend">
        <span>Logo rond et canette transparente</span>
        <span>Nouveau logo, univers tropical, 13 saveurs</span>
      </p>
    </div>
  );
}
