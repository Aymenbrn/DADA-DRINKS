"use client";

import { useState } from "react";

/**
 * Clip YouTube d'une actualité : l'image de couverture s'affiche d'abord,
 * le lecteur YouTube ne se charge qu'au clic (et démarre aussitôt).
 */
export default function NewsVideo({ id, poster, title }: { id: string; poster: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="news-video">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" className="news-video-poster" onClick={() => setPlaying(true)} aria-label={`Lire le clip : ${title}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster} alt="" />
          <span className="news-video-pill">▶ Lire le clip</span>
        </button>
      )}
    </div>
  );
}
