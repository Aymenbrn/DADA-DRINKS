"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { STORY_IMG } from "@/components/OurStory";
import DadaFill from "@/components/DadaFill";

/**
 * L'histoire de Dada racontée au scroll : la page reste « collée » pendant qu'on défile,
 * une canette en 3D traverse chaque chapitre, le texte change à côté.
 */
type Chapter = {
  when: string;
  title: string;
  text: string;
  quote?: string;
  imgs?: { src: string; alt: string; bg?: string }[];
  bg: string; // couleur dominante du fond
  glow: string; // halo
};

const CHAPTERS: Chapter[] = [
  {
    when: "Nanterre", title: "Un aîné de Nanterre", bg: "#0c1428", glow: "#3d6fd6",
    text: "Mohamed grandit au pied des tours Aillaud, aîné d’une famille modeste. Vendeur sur les marchés, voiturier, groom, livreur : il enchaîne les petits boulots. Dada n’est encore qu’une idée.",
    quote: "Ma famille m’a transmis sa niaque.",
    imgs: [{ src: STORY_IMG.nanterre, alt: "Les tours Aillaud à Nanterre" }],
  },
  {
    when: "Pizzeria", title: "Le premier pari", bg: "#2a0f07", glow: "#ff7a2a",
    text: "Le gérant d’une pizzeria lui propose de reprendre l’affaire. Il emprunte, rachète, modernise et efface les dettes en un an. Sa leçon : c’est l’expérience client qui crée la fidélité.",
  },
  {
    when: "Voyage", title: "Le déclic", bg: "#03121f", glow: "#1fb38a",
    text: "Australie, Asie du Sud-Est : il travaille dans des fermes et des restaurants pour financer le voyage. En Malaisie, il goûte une boisson pétillante et fruitée — et mesure à quel point l’offre de soft drinks est limitée en France.",
  },
  {
    when: "2007", title: "Naissance de Dada", bg: "#120c03", glow: "#ffb02e",
    text: "L’idée devient une canette, et pas n’importe laquelle : transparente. Il dessine le packaging, le logo, imprime les flyers. Les supermarchés hésitent ; les restaurants et les épiceries de quartier se lancent.",
    imgs: [
      { src: STORY_IMG.logo2007, alt: "Premier logo Dada Drinks (2007)", bg: "#f4f2ee" },
      { src: STORY_IMG.cans2007, alt: "Les premières canettes transparentes", bg: "#ffffff" },
    ],
  },
  {
    when: "2009", title: "Le coup dur", bg: "#1c0306", glow: "#e6003c",
    text: "Un gros contrat arrive, mais l’entreprise n’a pas encore les moyens de le livrer. Tout vacille. Il faut réduire la voilure pour reconstruire sur des bases solides.",
  },
  {
    when: "2011", title: "Ne jamais lâcher", bg: "#100d04", glow: "#ffdd00",
    text: "Une marque de tiramisu, un restaurant… mais Dada ne le quitte pas. Une rencontre avec Xavier Fontanet, alors PDG d’Essilor, à HEC, relance tout. Un associé lui prédit l’échec : raison de plus pour s’accrocher, marche après marche.",
    quote: "Ils voulaient me décourager, mais cela m’a au contraire poussé à m’accrocher !",
  },
  {
    when: "Renouveau", title: "Dada repart", bg: "#1e0516", glow: "#e58ad0",
    text: "Nouveau logo, nouveau design, réseaux sociaux, artistes et influenceurs : la canette change de peau et la croissance revient.",
    imgs: [{ src: STORY_IMG.logoNow, alt: "Le nouveau logo Dada Drinks", bg: "#0a0a0a" }],
  },
  {
    when: "Aujourd’hui", title: "À côté des géants", bg: "#14110c", glow: "#ffdd00",
    text: "Les canettes Dada sont en rayon à côté des sodas les plus célèbres, en supermarché comme en supérette. Prochaines étapes : une usine en France, plus de présence en ligne, et toujours plus de points de vente.",
  },
];

const N = CHAPTERS.length;

export default function StoryScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const apiRef = useRef<{ setProgress(p: number): void; dispose(): void } | null>(null);

  // Scène 3D (chargée à part pour ne pas alourdir la page)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let alive = true;
    let api: { setProgress(p: number): void; dispose(): void } | null = null;
    import("@/lib/can3d/story")
      .then(({ createStory }) => {
        if (!alive) return;
        try {
          api = createStory(canvas, { onReady: () => alive && setReady(true) });
          apiRef.current = api;
          onScroll();
        } catch {
          setReady(true); // pas de WebGL : le récit reste lisible
        }
      })
      .catch(() => setReady(true));
    return () => {
      alive = false;
      api?.dispose();
      apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Le scroll pilote l'histoire
  const onScroll = () => {
    const sec = sectionRef.current, stage = stageRef.current;
    if (!sec || !stage) return;
    const r = sec.getBoundingClientRect();
    const run = r.height - window.innerHeight;
    const raw = Math.min(1, Math.max(0, -r.top / Math.max(1, run)));
    const p = raw * (N - 1);
    apiRef.current?.setProgress(p);
    const idx = Math.round(p);
    setActive((a) => (a === idx ? a : idx));
    // Fond : on mélange les couleurs des deux chapitres voisins
    const i0 = Math.floor(p), i1 = Math.min(N - 1, i0 + 1), f = p - i0;
    stage.style.setProperty("--sx-bg", mix(CHAPTERS[i0].bg, CHAPTERS[i1].bg, f));
    stage.style.setProperty("--sx-glow", mix(CHAPTERS[i0].glow, CHAPTERS[i1].glow, f));
    stage.style.setProperty("--sx-p", `${raw}`);
  };

  useEffect(() => {
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (i: number) => {
    const sec = sectionRef.current;
    if (!sec) return;
    const run = sec.offsetHeight - window.innerHeight;
    const top = sec.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (run * i) / (N - 1) + 2, behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="sx" style={{ "--sx-n": N } as CSSProperties} aria-label="L’histoire de Dada, chapitre par chapitre">
      <div ref={stageRef} className="sx-stage">
        <div className="sx-glow" aria-hidden="true" />
        <p className="sx-big" aria-hidden="true">
          {CHAPTERS.map((c, i) => (
            <span key={c.when} className={i === active ? "is-on" : undefined}>{c.when}</span>
          ))}
        </p>
        <canvas ref={canvasRef} className={`sx-canvas${ready ? " is-ready" : ""}`} aria-hidden="true" />
        {!ready && (
          <div className="sx-loading" aria-hidden="true">
            <DadaFill size={180} />
          </div>
        )}

        <div className="sx-copy container">
          {CHAPTERS.map((c, i) => (
            <article key={c.when} className={`sx-ch${i === active ? " is-on" : ""}${i < active ? " is-past" : ""}`} aria-hidden={i !== active}>
              <p className="sx-n">
                <span>{String(i + 1).padStart(2, "0")}</span> / {String(N).padStart(2, "0")} — {c.when}
              </p>
              <h2 className="sx-title">{c.title}</h2>
              <p className="sx-text">{c.text}</p>
              {c.quote && <blockquote className="sx-quote">« {c.quote} »<cite>Mohamed, fondateur</cite></blockquote>}
              {c.imgs && (
                <div className="sx-imgs">
                  {c.imgs.map((m, k) => (
                    <figure key={m.src} style={{ background: m.bg, "--r": `${k % 2 ? 4 : -3}deg` } as CSSProperties}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.src} alt={m.alt} loading="lazy" decoding="async" />
                    </figure>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>

        <nav className="sx-rail" aria-label="Chapitres">
          {CHAPTERS.map((c, i) => (
            <button key={c.when} type="button" className={i === active ? "is-on" : i < active ? "is-past" : undefined} onClick={() => goTo(i)} aria-label={`Chapitre ${i + 1} : ${c.title}`}>
              <i />
              <span>{c.when}</span>
            </button>
          ))}
        </nav>
        <p className={`sx-hint${active > 0 ? " is-hidden" : ""}`} aria-hidden="true">Faites défiler pour avancer dans l’histoire ↓</p>
      </div>
    </section>
  );
}

function mix(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const c = (s: number) => Math.round(((pa >> s) & 255) + (((pb >> s) & 255) - ((pa >> s) & 255)) * t);
  return `rgb(${c(16)}, ${c(8)}, ${c(0)})`;
}
