// « Notre histoire » racontée au scroll : une seule scène 3D, une canette héroïne qui traverse les chapitres.
//  0 Nanterre     : la canette n'est qu'une idée (fil de fer) qui flotte au-dessus des tours nuages
//  1 La pizzeria  : elle tourne au-dessus d'une pizza
//  2 Le voyage    : un globe en points, l'avion file de Paris à Kuala Lumpur
//  3 2007         : l'idée devient une vraie canette… transparente, pleine de bulles
//  4 2009         : le coup dur — la canette est écrasée, les contrats s'envolent
//  5 2011         : elle remonte les marches, une à une
//  6 Le renouveau : elle tourne sur elle-même et prend son nouveau design, explosion de confettis
//  7 Aujourd'hui  : en rayon, à côté des géants, avec toute la gamme
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { FLAVORS } from "@/lib/flavors";
import { getLabelImage } from "./labels";

export const STORY_CHAPTERS = 8;

type V3 = [number, number, number];
type CanState = { pos: V3; rot: V3; scale: V3 };
type CamState = { pos: V3; look: V3 };

const R = 1, H = 4.62, HALF = H / 2;
const GROUND = -2.6;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => { const t = clamp01(x); return t * t * (3 - 2 * t); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
/** Fondu d'une plage : 0 avant a, 1 entre b et c, 0 après d */
const band = (p: number, a: number, b: number, c: number, d: number) => smooth((p - a) / (b - a)) * (1 - smooth((p - c) / (d - c)));

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Pose un matériau en mode fondu (opacité pilotée par le scroll) */
function fadeable<T extends THREE.Material>(m: T): T {
  m.transparent = true;
  m.userData.baseOpacity = m.opacity;
  return m;
}

/** Applique une opacité globale à tout un groupe (et le masque s'il est invisible) */
function setGroupFade(g: THREE.Object3D, k: number) {
  g.visible = k > 0.002;
  if (!g.visible) return;
  g.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
    if (!m) return;
    (Array.isArray(m) ? m : [m]).forEach((mm) => {
      if (mm.userData.baseOpacity === undefined) fadeable(mm);
      mm.opacity = mm.userData.baseOpacity * k;
      mm.depthWrite = k > 0.98 && mm.userData.baseOpacity >= 1;
    });
  });
}

export function createStory(canvas: HTMLCanvasElement, opts: { onReady?: () => void } = {}) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = window.innerWidth < 760;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-4, 6, 8);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffdd00, 1.2);
  rim.position.set(5, 3, -6);
  scene.add(rim);
  const amb = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(amb);

  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(x: T) => { disposables.push(x); return x; };

  // ═══════════ La canette héroïne ═══════════
  const hero = new THREE.Group();
  scene.add(hero);

  // 1) L'idée : canette en fil de fer, lumineuse
  const wireMat = track(fadeable(new THREE.MeshBasicMaterial({ color: 0xffdd00, wireframe: true, opacity: 0.9 })));
  const wire = new THREE.Group();
  wire.add(new THREE.Mesh(track(new THREE.CylinderGeometry(R, R, H, 22, 7, true)), wireMat));
  const wireCap = new THREE.Mesh(track(new THREE.CylinderGeometry(0.86, R, 0.4, 22, 1, true)), wireMat);
  wireCap.position.y = HALF + 0.2;
  wire.add(wireCap);
  const wireBot = new THREE.Mesh(track(new THREE.CylinderGeometry(R, 0.8, 0.3, 22, 1, true)), wireMat);
  wireBot.position.y = -HALF - 0.15;
  wire.add(wireBot);
  hero.add(wire);

  // Métal du haut et du bas (canette réelle)
  const metalMat = track(fadeable(new THREE.MeshStandardMaterial({ color: 0xdfe1e5, metalness: 1, roughness: 0.22, envMapIntensity: 0.7 })));
  const metal = new THREE.Group();
  const topProfile = [
    [R, HALF], [0.998, HALF + 0.05], [0.975, HALF + 0.14], [0.93, HALF + 0.23], [0.885, HALF + 0.3],
    [0.865, HALF + 0.34], [0.872, HALF + 0.375], [0.866, HALF + 0.405], [0.835, HALF + 0.41], [0.81, HALF + 0.37], [0.79, HALF + 0.335], [0.0, HALF + 0.335],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const topGeo = track(new THREE.LatheGeometry(topProfile, 64));
  const bottomProfile = [
    [0.0, -HALF - 0.17], [0.5, -HALF - 0.2], [0.76, -HALF - 0.29], [0.83, -HALF - 0.3], [0.9, -HALF - 0.22], [0.965, -HALF - 0.1], [R, -HALF],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const botGeo = track(new THREE.LatheGeometry(bottomProfile, 64));
  metal.add(new THREE.Mesh(topGeo, metalMat), new THREE.Mesh(botGeo, metalMat));
  const tab = new THREE.Mesh(track(new THREE.BoxGeometry(0.4, 0.03, 0.6)), metalMat);
  tab.position.set(0, HALF + 0.35, 0.1);
  metal.add(tab);
  hero.add(metal);

  // 2) 2007 → 2011 : la première canette Dada, d'après la photo (plastique transparent, étiquette Cerise).
  //    En 2007 elle s'ouvre en deux comme une coupe : on voit la boisson et ses bulles à l'intérieur.
  const OR = 1.25, OH = 4.7, OHALF = OH / 2;
  const glass = new THREE.Group(); // la canette entière (deux moitiés)
  const halves: THREE.Group[] = [];
  const BUB = 70;
  const bubbleGeo = track(new THREE.SphereGeometry(0.045, 10, 8));
  const bubbleMat = track(fadeable(new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, clearcoat: 1, opacity: 0.9, envMapIntensity: 1.5 })));
  const bubbles = new THREE.InstancedMesh(bubbleGeo, bubbleMat, BUB);
  const bubSeed = Array.from({ length: BUB }, (_, i) => ({ side: i % 2 ? 1 : -1, z: (((i * 37) % 100) / 100 - 0.5) * 2 * OR * 0.8, x: 0.02 + ((i * 13) % 10) / 70, s: 0.35 + ((i * 17) % 10) / 14, o: (i * 0.137) % 1, k: 0.5 + ((i * 7) % 8) / 8 }));
  {
    const decalTex = track(new THREE.TextureLoader().load("/story/old-can-cerise.webp"));
    decalTex.colorSpace = THREE.SRGBColorSpace;
    decalTex.anisotropy = 8;
    const plasticMat = track(fadeable(new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.04, opacity: 0.2, envMapIntensity: 1.6, side: THREE.DoubleSide })));
    const decalMat = track(fadeable(new THREE.MeshPhysicalMaterial({ map: decalTex, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.06, alphaTest: 0.04, envMapIntensity: 0.9 })));
    const liquidMat = track(fadeable(new THREE.MeshPhysicalMaterial({ color: 0x5a0a16, roughness: 0.12, clearcoat: 1, opacity: 0.88, emissive: 0x220006, emissiveIntensity: 0.4 })));
    const cutTex = track(canvasTex(256, 512, (c) => {
      const lg = c.createLinearGradient(0, 0, 256, 0);
      lg.addColorStop(0, "#5a0c18"); lg.addColorStop(0.5, "#a3192e"); lg.addColorStop(1, "#5a0c18");
      c.fillStyle = lg; c.fillRect(0, 0, 256, 512);
      const vg = c.createLinearGradient(0, 0, 0, 512); vg.addColorStop(0, "rgba(255,120,140,0.25)"); vg.addColorStop(0.2, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.3)");
      c.fillStyle = vg; c.fillRect(0, 0, 256, 512);
      let bs = 3;
      const br = () => ((bs = (bs * 16807) % 2147483647) / 2147483647);
      for (let i = 0; i < 300; i++) { // bulles figées dans la coupe, plus nombreuses vers le haut
        const x = br() * 256, y = Math.pow(br(), 0.8) * 512, r = 1 + br() * br() * 9;
        const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
        g.addColorStop(0, "rgba(255,255,255,0.95)"); g.addColorStop(0.6, "rgba(255,220,225,0.45)"); g.addColorStop(1, "rgba(255,255,255,0.05)");
        c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
      }
    }));
    const cutMat = track(fadeable(new THREE.MeshPhysicalMaterial({ map: cutTex, roughness: 0.1, clearcoat: 1, opacity: 0.96, side: THREE.DoubleSide })));
    const lidMat = track(fadeable(new THREE.MeshStandardMaterial({ color: 0xd9dbdf, metalness: 1, roughness: 0.25, envMapIntensity: 0.8 })));
    const lidProfile = [[0, OHALF + 0.02], [1.02, OHALF + 0.02], [1.1, OHALF - 0.02], [1.12, OHALF - 0.2], [1.17, OHALF - 0.3]].map(([x, y]) => new THREE.Vector2(x, y));
    const liqH = OH * 0.8, liqY = -OHALF + 0.32 + liqH / 2;
    for (const side of [1, -1]) {
      const half = new THREE.Group();
      const t0 = side === 1 ? 0 : Math.PI; // moitié droite (x > 0) ou gauche (x < 0)
      half.add(new THREE.Mesh(track(new THREE.CylinderGeometry(OR, OR * 0.9, OH * 0.98, 48, 1, true, t0, Math.PI)), plasticMat));
      // Étiquette : la photo de la canette, posée sur la face avant (projection fidèle : u = position horizontale)
      const dGeo = track(new THREE.CylinderGeometry(OR + 0.006, OR + 0.006, OH, 48, 24, true, side === 1 ? 0 : -Math.PI / 2, Math.PI / 2));
      const uv = dGeo.attributes.uv as THREE.BufferAttribute, dp = dGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < uv.count; i++) uv.setX(i, (dp.getX(i) / OR + 1) / 2);
      half.add(new THREE.Mesh(dGeo, decalMat));
      // Boisson et coupe
      const liq = new THREE.Mesh(track(new THREE.CylinderGeometry(OR * 0.93, OR * 0.93, liqH, 48, 1, false, t0, Math.PI)), liquidMat);
      liq.position.y = liqY;
      half.add(liq);
      const cut = new THREE.Mesh(track(new THREE.PlaneGeometry(OR * 0.93 * 2, liqH)), cutMat);
      cut.rotation.y = side === 1 ? -Math.PI / 2 : Math.PI / 2;
      cut.position.set(0.004 * side, liqY, 0);
      half.add(cut);
      half.add(new THREE.Mesh(track(new THREE.LatheGeometry(lidProfile, 48, t0, Math.PI)), lidMat));
      glass.add(half);
      halves.push(half);
    }
    glass.add(bubbles);
  }
  hero.add(glass);

  const bodyGeo = track(new THREE.CylinderGeometry(R, R, H, 96, 1, true));
  // 3) Le renouveau : le design actuel (Cola Cherry, la nouveauté)
  const labelMat = track(fadeable(new THREE.MeshPhysicalMaterial({ color: 0x892d73, metalness: 0.45, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 0.6 })));
  const labelled = new THREE.Mesh(bodyGeo, labelMat);
  hero.add(labelled);

  // Ombre de contact
  const shadowTex = track(canvasTex(128, 128, (g) => {
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(0,0,0,0.6)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  }));
  const shadowMat = track(fadeable(new THREE.MeshBasicMaterial({ map: shadowTex, depthWrite: false })));
  const heroShadow = new THREE.Mesh(track(new THREE.PlaneGeometry(3.4, 3.4)), shadowMat);
  heroShadow.rotation.x = -Math.PI / 2;
  scene.add(heroShadow);

  // ═══════════ Décors des chapitres ═══════════
  const chapters: THREE.Group[] = Array.from({ length: STORY_CHAPTERS }, () => { const g = new THREE.Group(); scene.add(g); return g; });

  // — 0 · Nanterre : les tours nuages (Tours Aillaud) sous un ciel bleu (le ciel et ses nuages sont dessinés derrière la scène)
  {
    const g = chapters[0];
    const cloudColors = ["#7fb6e6", "#a8d4f2", "#5d9bd1", "#9fd3a8", "#6fbf8f", "#f2b6c6", "#e8eef5"];
    const towerTex = (seed: number) => canvasTex(256, 512, (c) => {
      c.fillStyle = "#cfe3f3"; c.fillRect(0, 0, 256, 512);
      for (let i = 0; i < 46; i++) { // taches façon nuages
        const x = ((seed * 97 + i * 53) % 256), y = ((seed * 31 + i * 89) % 512), r = 18 + ((i * 7 + seed) % 34);
        c.fillStyle = cloudColors[(i + seed) % cloudColors.length];
        c.beginPath(); c.ellipse(x, y, r * 1.3, r, 0, 0, Math.PI * 2); c.fill();
      }
      c.fillStyle = "rgba(20,30,50,0.55)"; // petites fenêtres
      for (let y = 10; y < 512; y += 22) for (let x = 6; x < 256; x += 18) if ((x * y + seed) % 5 !== 0) c.fillRect(x, y, 6, 9);
    });
    const ground = new THREE.Mesh(track(new THREE.CircleGeometry(14, 64)), track(fadeable(new THREE.MeshStandardMaterial({ color: 0x9aa39a, roughness: 0.95 }))));
    ground.rotation.x = -Math.PI / 2; ground.position.y = GROUND;
    g.add(ground);
    for (let i = 0; i < 20; i++) {
      const a = -1.45 + (i / 19) * 2.9; // demi-cercle derrière la canette
      const rad = 5.2 + ((i * 37) % 40) / 10;
      const h = 2.2 + ((i * 53) % 40) / 10;
      const r = 0.5 + ((i * 17) % 4) / 10;
      const mat = track(fadeable(new THREE.MeshStandardMaterial({ map: track(towerTex(i)), roughness: 0.75 })));
      const t = new THREE.Mesh(track(new THREE.CylinderGeometry(r, r, h, 28)), mat);
      t.position.set(Math.sin(a) * rad * 1.15, GROUND + h / 2, -Math.cos(a) * rad - 1);
      g.add(t);
    }
  }

  // — 1 · La pizzeria : une vraie pizza napolitaine (pâte, sauce, mozzarella fondue, pepperoni, basilic)
  const pizza = new THREE.Group();
  {
    const g = chapters[1];
    // Pseudo-aléatoire stable
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const blob = (c: CanvasRenderingContext2D, x: number, y: number, r: number, jag = 0.35, pts = 14) => {
      c.beginPath();
      for (let i = 0; i <= pts; i++) {
        const a = (i / pts) * Math.PI * 2, rr = r * (1 - jag / 2 + rnd() * jag);
        const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      }
      c.closePath();
    };
    const S = 1024, C = S / 2;
    const top = canvasTex(S, S, (c) => {
      // pâte
      c.fillStyle = "#e7c088"; c.fillRect(0, 0, S, S);
      // sauce tomate, bord irrégulier, nuances
      const sg = c.createRadialGradient(C, C, 40, C, C, 470);
      sg.addColorStop(0, "#b8281c"); sg.addColorStop(0.8, "#a52016"); sg.addColorStop(1, "#8a1a12");
      c.fillStyle = sg; blob(c, C, C, 462, 0.06, 90); c.fill();
      for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(${90 + rnd() * 60},${10 + rnd() * 20},10,${0.15 + rnd() * 0.2})`; const a = rnd() * 6.283, r = rnd() * 440; c.fillRect(C + Math.cos(a) * r, C + Math.sin(a) * r, 2 + rnd() * 4, 2 + rnd() * 4); }
      // mozzarella fondue : grandes plaques irrégulières, centre clair, bords dorés
      for (let i = 0; i < 34; i++) {
        const a = rnd() * 6.283, r = Math.sqrt(rnd()) * 380, x = C + Math.cos(a) * r, y = C + Math.sin(a) * r, rr = 38 + rnd() * 52;
        const cg = c.createRadialGradient(x, y, rr * 0.1, x, y, rr);
        cg.addColorStop(0, "#fff8e6"); cg.addColorStop(0.65, "#f7e7b8"); cg.addColorStop(1, "rgba(226,180,96,0.9)");
        c.fillStyle = cg; blob(c, x, y, rr, 0.45, 18); c.fill();
        for (let k = 0; k < 3; k++) { c.fillStyle = `rgba(190,120,50,${0.25 + rnd() * 0.25})`; blob(c, x + (rnd() - 0.5) * rr, y + (rnd() - 0.5) * rr, 4 + rnd() * 9, 0.5, 8); c.fill(); }
      }
      // pepperoni : rouge profond, bord sombre et légèrement grillé, gouttes de gras
      for (let i = 0; i < 15; i++) {
        const a = i * 2.39996 + rnd() * 0.4, r = 70 + Math.sqrt((i + 0.5) / 15) * 330, x = C + Math.cos(a) * r, y = C + Math.sin(a) * r, rr = 34 + rnd() * 10;
        c.fillStyle = "#5e120c"; c.beginPath(); c.arc(x, y, rr + 3, 0, 6.283); c.fill();
        const pg = c.createRadialGradient(x - rr * 0.3, y - rr * 0.3, 2, x, y, rr);
        pg.addColorStop(0, "#c4402e"); pg.addColorStop(1, "#8e2117");
        c.fillStyle = pg; c.beginPath(); c.arc(x, y, rr, 0, 6.283); c.fill();
        for (let k = 0; k < 7; k++) { c.fillStyle = `rgba(240,170,140,${0.35 + rnd() * 0.3})`; c.beginPath(); c.arc(x + (rnd() - 0.5) * rr * 1.4, y + (rnd() - 0.5) * rr * 1.4, 1.5 + rnd() * 3, 0, 6.283); c.fill(); }
      }
      // basilic frais
      for (let i = 0; i < 8; i++) {
        const a = rnd() * 6.283, r = 60 + rnd() * 320, x = C + Math.cos(a) * r, y = C + Math.sin(a) * r, ang = rnd() * 6.283;
        c.save(); c.translate(x, y); c.rotate(ang);
        const lg = c.createLinearGradient(-30, 0, 30, 0); lg.addColorStop(0, "#1f6b2a"); lg.addColorStop(1, "#3e9b45");
        c.fillStyle = lg; c.beginPath(); c.moveTo(-34, 0); c.quadraticCurveTo(0, -20, 34, 0); c.quadraticCurveTo(0, 20, -34, 0); c.fill();
        c.strokeStyle = "rgba(200,240,190,0.5)"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-30, 0); c.lineTo(30, 0); c.stroke();
        c.restore();
      }
      // filet d'huile d'olive, reflets
      for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(255,235,150,${0.12 + rnd() * 0.15})`; const a = rnd() * 6.283, r = rnd() * 430; c.beginPath(); c.arc(C + Math.cos(a) * r, C + Math.sin(a) * r, 1 + rnd() * 3, 0, 6.283); c.fill(); }
    });
    top.anisotropy = 8;
    const crustTex = canvasTex(512, 64, (c) => {
      const lg = c.createLinearGradient(0, 0, 0, 64); lg.addColorStop(0, "#c98b47"); lg.addColorStop(0.5, "#e2ae68"); lg.addColorStop(1, "#b97a3a");
      c.fillStyle = lg; c.fillRect(0, 0, 512, 64);
      for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(${70 + rnd() * 40},${35 + rnd() * 20},12,${0.15 + rnd() * 0.3})`; blob(c, rnd() * 512, 10 + rnd() * 30, 3 + rnd() * 10, 0.6, 9); c.fill(); }
      for (let i = 0; i < 200; i++) { c.fillStyle = "rgba(255,240,210,0.35)"; c.fillRect(rnd() * 512, rnd() * 64, 1.5, 1.5); }
    });
    crustTex.wrapS = THREE.RepeatWrapping; crustTex.repeat.set(6, 1);
    // Pâte
    const base = new THREE.Mesh(track(new THREE.CylinderGeometry(3.25, 3.15, 0.16, 96)), track(fadeable(new THREE.MeshStandardMaterial({ color: 0xdcae72, roughness: 0.9 }))));
    // Garniture (texture peinte, relief léger)
    const topMat = track(fadeable(new THREE.MeshStandardMaterial({ map: track(top), bumpMap: top, bumpScale: 2.2, roughness: 0.55 })));
    const topping = new THREE.Mesh(track(new THREE.CircleGeometry(3.02, 96)), topMat);
    topping.rotation.x = -Math.PI / 2; topping.position.y = 0.085;
    // Corniche gonflée et irrégulière
    const crustGeo = track(new THREE.TorusGeometry(3.05, 0.3, 20, 120));
    const pos = crustGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const ang = Math.atan2(y, x);
      const k = 1 + 0.12 * Math.sin(ang * 7) + 0.07 * Math.sin(ang * 17 + 1.3) + 0.05 * Math.sin(ang * 31);
      const cx = Math.cos(ang) * 3.05, cy = Math.sin(ang) * 3.05;
      pos.setXYZ(i, cx + (x - cx) * k, cy + (y - cy) * k, z * k * (z > 0 ? 1.15 : 0.8));
    }
    crustGeo.computeVertexNormals();
    const crust = new THREE.Mesh(crustGeo, track(fadeable(new THREE.MeshStandardMaterial({ map: track(crustTex), roughness: 0.85 }))));
    crust.rotation.x = Math.PI / 2; crust.position.y = 0.1;
    // Planche en bois
    const boardTex = canvasTex(512, 512, (c) => {
      c.fillStyle = "#6b4426"; c.fillRect(0, 0, 512, 512);
      for (let y = 0; y < 512; y += 2) { c.fillStyle = `rgba(${40 + rnd() * 50},${22 + rnd() * 25},${10 + rnd() * 10},0.35)`; c.fillRect(0, y + Math.sin(y * 0.05) * 3, 512, 1 + rnd() * 2); }
    });
    const board = new THREE.Mesh(track(new THREE.CylinderGeometry(3.9, 3.9, 0.22, 96)), track(fadeable(new THREE.MeshStandardMaterial({ map: track(boardTex), roughness: 0.8 }))));
    board.position.y = -0.2;
    pizza.add(board, base, topping, crust);
    pizza.position.y = GROUND + 0.4;
    g.add(pizza);
  }

  // — 2 · Le voyage : la Terre (textures NASA via three.js), vol Paris → Kuala Lumpur
  const globe = new THREE.Group();
  const plane = new THREE.Group();
  let clouds: THREE.Mesh | null = null;
  let flight: THREE.QuadraticBezierCurve3;
  {
    const g = chapters[2];
    const GR = 2.6;
    const ll = (lat: number, lon: number, r = GR) => {
      const la = THREE.MathUtils.degToRad(lat), lo = THREE.MathUtils.degToRad(lon);
      return new THREE.Vector3(r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo));
    };
    const loader = new THREE.TextureLoader();
    const load = (url: string, srgb = false) => {
      const t = track(loader.load(url));
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      return t;
    };
    const earthMat = track(fadeable(new THREE.MeshPhongMaterial({
      map: load("/story/earth/day.webp", true),
      specularMap: load("/story/earth/specular.webp"),
      normalMap: load("/story/earth/normal.webp"),
      normalScale: new THREE.Vector2(0.85, -0.85),
      specular: new THREE.Color(0x3a4a5a),
      shininess: 18,
    })));
    const earth = new THREE.Mesh(track(new THREE.SphereGeometry(GR, 96, 64)), earthMat);
    earth.rotation.y = -Math.PI / 2; // aligne la texture sur nos coordonnées (longitude 0 face à nous)
    globe.add(earth);
    const cloudMat = track(fadeable(new THREE.MeshLambertMaterial({ map: load("/story/earth/clouds.webp", true), opacity: 0.85, depthWrite: false })));
    clouds = new THREE.Mesh(track(new THREE.SphereGeometry(GR * 1.012, 96, 64)), cloudMat);
    clouds.rotation.y = -Math.PI / 2;
    globe.add(clouds);
    // Atmosphère : halo bleuté sur le bord
    const atmo = new THREE.Mesh(track(new THREE.SphereGeometry(GR * 1.09, 64, 48)), track(fadeable(new THREE.MeshBasicMaterial({ color: 0x5aa8ff, opacity: 0.07, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false }))));
    globe.add(atmo);
    // Vol
    const paris = ll(48.8, 2.3, GR * 1.02), kl = ll(3.1, 101.7, GR * 1.02);
    const mid = paris.clone().add(kl).multiplyScalar(0.5).normalize().multiplyScalar(GR * 1.65);
    flight = new THREE.QuadraticBezierCurve3(paris, mid, kl);
    globe.add(new THREE.Mesh(track(new THREE.TubeGeometry(flight, 64, 0.022, 8)), track(fadeable(new THREE.MeshBasicMaterial({ color: 0xffdd00 })))));
    const pin = (v: THREE.Vector3) => { const m = new THREE.Mesh(track(new THREE.SphereGeometry(0.07, 12, 8)), track(fadeable(new THREE.MeshBasicMaterial({ color: 0xffdd00 })))); m.position.copy(v); globe.add(m); };
    pin(paris); pin(kl);
    // Petit avion
    const pm = track(fadeable(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })));
    const fus = new THREE.Mesh(track(new THREE.CapsuleGeometry(0.06, 0.32, 4, 8)), pm);
    fus.rotation.x = Math.PI / 2;
    const wings = new THREE.Mesh(track(new THREE.BoxGeometry(0.46, 0.015, 0.1)), pm);
    plane.add(fus, wings);
    globe.add(plane);
    globe.rotation.y = -THREE.MathUtils.degToRad(52); // l'Europe et l'Asie face à nous
    globe.rotation.x = 0.3;
    g.add(globe);
  }

  // — 4 · 2009 : les contrats s'envolent
  const papers: THREE.Mesh[] = [];
  {
    const g = chapters[4];
    // Contrats réalistes : en-tête, articles, paraphes, signature, tampon ; feuilles légèrement cintrées
    const paperTex = (variant: number) => canvasTex(512, 680, (c) => {
      let sd = 11 + variant * 97;
      const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
      c.fillStyle = "#fbfaf6"; c.fillRect(0, 0, 512, 680);
      const sh = c.createLinearGradient(0, 0, 512, 680); sh.addColorStop(0, "rgba(0,0,0,0)"); sh.addColorStop(1, "rgba(120,100,70,0.08)");
      c.fillStyle = sh; c.fillRect(0, 0, 512, 680);
      c.fillStyle = "#1b1b1b"; c.font = "700 26px Georgia, 'Times New Roman', serif"; c.textAlign = "center";
      c.fillText(["CONTRAT DE DISTRIBUTION", "BON DE COMMANDE", "CONTRAT COMMERCIAL"][variant % 3], 256, 64);
      c.font = "15px Georgia, serif"; c.fillStyle = "#555"; c.fillText("Entre les soussignés", 256, 92);
      c.textAlign = "left";
      let y = 130;
      for (let art = 1; art <= 5 && y < 560; art++) {
        c.fillStyle = "#222"; c.font = "700 14px Georgia, serif"; c.fillText(`Article ${art}`, 44, y); y += 20;
        const lines = 3 + Math.floor(rr() * 3);
        for (let l = 0; l < lines; l++) { c.fillStyle = "rgba(40,40,40,0.55)"; c.fillRect(44, y - 9, (l === lines - 1 ? 0.45 + rr() * 0.3 : 0.92 + rr() * 0.06) * 424, 5); y += 15; }
        y += 10;
      }
      // signatures
      c.strokeStyle = "#1d2f6b"; c.lineWidth = 2.2; c.beginPath(); c.moveTo(60, 620);
      for (let i = 0; i < 9; i++) c.quadraticCurveTo(70 + i * 18, 590 + rr() * 50, 80 + i * 18, 615);
      c.stroke();
      c.fillStyle = "#888"; c.font = "12px Georgia, serif"; c.fillText("Lu et approuvé", 60, 650); c.fillText("Le distributeur", 330, 650);
      // tampon rouge « ANNULÉ » de travers
      c.save(); c.translate(350, 470); c.rotate(-0.35);
      c.strokeStyle = "rgba(200,20,40,0.75)"; c.lineWidth = 5; c.strokeRect(-110, -34, 220, 68);
      c.fillStyle = "rgba(200,20,40,0.75)"; c.font = "900 44px Montserrat, Arial, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("ANNULÉ", 0, 3);
      c.restore();
    });
    const paperMats = [0, 1, 2].map((v) => track(fadeable(new THREE.MeshStandardMaterial({ map: track(paperTex(v)), side: THREE.DoubleSide, roughness: 0.92 }))));
    const paperGeos = [0.18, -0.12, 0.28].map((bend) => {
      const pg = track(new THREE.PlaneGeometry(0.72, 0.96, 12, 12));
      const pp = pg.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pp.count; i++) { const x = pp.getX(i), y = pp.getY(i); pp.setZ(i, bend * (x * x) * 1.6 + 0.06 * Math.sin(y * 4 + x * 2)); }
      pg.computeVertexNormals();
      return pg;
    });
    for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(paperGeos[i % 3], paperMats[(i * 7) % 3]); papers.push(m); g.add(m); }
    const floor = new THREE.Mesh(track(new THREE.CircleGeometry(9, 48)), track(fadeable(new THREE.MeshStandardMaterial({ color: 0x220407, roughness: 1 }))));
    floor.rotation.x = -Math.PI / 2; floor.position.y = GROUND;
    g.add(floor);
  }

  // — 5 · 2011 : les marches
  const STEPS = 5, STEP_W = 1.45;
  const stepTop = (i: number) => GROUND + 0.55 * (i + 1);
  const stepX = (i: number) => (i - (STEPS - 1) / 2) * STEP_W;
  {
    const g = chapters[5];
    for (let i = 0; i < STEPS; i++) {
      const h = 0.55 * (i + 1);
      const m = new THREE.Mesh(track(new THREE.BoxGeometry(STEP_W * 0.94, h, 1.8)), track(fadeable(new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.135, 1, 0.12 + i * 0.07), roughness: 0.45, metalness: 0.1 }))));
      m.position.set(stepX(i), GROUND + h / 2, 0);
      g.add(m);
    }
  }

  // — 6 · Le renouveau : confettis
  const CONF = small ? 120 : 200;
  const confetti = new THREE.InstancedMesh(track(new THREE.PlaneGeometry(0.16, 0.26)), track(fadeable(new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }))), CONF);
  {
    const palette = [0xe6003c, 0xffdd00, 0xffffff, 0x892d73];
    for (let i = 0; i < CONF; i++) confetti.setColorAt(i, new THREE.Color(palette[i % palette.length]));
    chapters[6].add(confetti);
  }
  const confSeed = Array.from({ length: CONF }, (_, i) => {
    const th = i * 2.39996, ph = Math.acos(1 - 2 * ((i + 0.5) / CONF));
    return { d: new THREE.Vector3(Math.sin(ph) * Math.cos(th), Math.cos(ph) * 0.8 + 0.4, Math.sin(ph) * Math.sin(th)), sp: 3 + (i % 7) * 0.6, rot: i * 0.7 };
  });

  // — 7 · Aujourd'hui : le rayon, à côté des géants
  const shelfCans: { mesh: THREE.Group; mat: THREE.MeshPhysicalMaterial }[] = [];
  {
    const g = chapters[7];
    const shelfMat = track(fadeable(new THREE.MeshStandardMaterial({ color: 0xe9e6df, roughness: 0.6 })));
    const backMat = track(fadeable(new THREE.MeshStandardMaterial({ color: 0x2a2620, roughness: 0.9 })));
    const back = new THREE.Mesh(track(new THREE.PlaneGeometry(22, 9)), backMat);
    back.position.set(0, 0.6, -1.6);
    g.add(back);
    for (const y of [GROUND - 0.05, GROUND + 4.1]) {
      const s = new THREE.Mesh(track(new THREE.BoxGeometry(22, 0.16, 2.6)), shelfMat);
      s.position.set(0, y, -0.2);
      g.add(s);
      const edge = new THREE.Mesh(track(new THREE.BoxGeometry(22, 0.32, 0.06)), track(fadeable(new THREE.MeshBasicMaterial({ color: 0xffdd00 }))));
      edge.position.set(0, y - 0.04, 1.12);
      g.add(edge);
    }
    const sc = 0.58;
    const smallTop = new THREE.Mesh(topGeo, metalMat);
    const smallBot = new THREE.Mesh(botGeo, metalMat);
    const mkCan = (mat: THREE.Material, x: number, y: number, z: number, s = sc, sy = 1) => {
      const c = new THREE.Group();
      c.add(new THREE.Mesh(bodyGeo, mat), smallTop.clone(), smallBot.clone());
      c.scale.set(s, s * sy, s);
      c.position.set(x, y + (HALF + 0.3) * s * sy, z);
      g.add(c);
      return c;
    };
    // Les « géants » : canettes génériques, sans marque, plus grandes et toutes pareilles
    const giantMats = [0xb3121d, 0x1d3f8f, 0x1f7a3a].map((col) => track(fadeable(new THREE.MeshPhysicalMaterial({
      map: track(canvasTex(256, 256, (c) => {
        c.fillStyle = "#" + col.toString(16).padStart(6, "0"); c.fillRect(0, 0, 256, 256);
        c.fillStyle = "rgba(255,255,255,0.85)"; c.fillRect(0, 110, 256, 18); c.fillRect(0, 140, 256, 6);
      })), metalness: 0.4, roughness: 0.35, clearcoat: 1,
    }))));
    const row = (y: number, z: number, from: number, to: number, giants: number[]) => {
      let fi = 0;
      for (let k = from; k <= to; k++) {
        const x = k * 1.32;
        if (y < GROUND + 1 && k === 0) continue; // la place de la canette héroïne
        if (giants.includes(k)) mkCan(giantMats[(k + 30) % 3], x, y, z, sc * 1.12, 1.08);
        else {
          const f = FLAVORS[fi++ % FLAVORS.length];
          const mat = track(fadeable(new THREE.MeshPhysicalMaterial({ color: new THREE.Color(f.c), metalness: 0.45, roughness: 0.3, clearcoat: 1 })));
          shelfCans.push({ mesh: mkCan(mat, x, y, z), mat });
        }
      }
    };
    // Rayon bas : la gamme Dada au centre, encadrée par les géants ; rayon haut : un mélange
    row(GROUND + 0.03, 0.1, -8, 8, [-8, -7, -6, -5, 5, 6, 7, 8]);
    row(GROUND + 4.18, 0.1, -8, 8, [-8, -6, -4, -2, 2, 4, 6, 8]);
  }

  // ═══════════ Étiquettes : design actuel sur la canette héroïne et la gamme en rayon ═══════════
  const toTex = (img: HTMLCanvasElement | HTMLImageElement) => {
    const t = img instanceof HTMLCanvasElement ? new THREE.CanvasTexture(img) : new THREE.Texture(img);
    t.needsUpdate = true; t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.offset.x = 0.25;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return track(t);
  };
  const cherry = FLAVORS.find((f) => f.slug === "cola-cherry") ?? FLAVORS[0];
  const heroLabel = getLabelImage(cherry).then((img) => { labelMat.map = toTex(img); labelMat.color.set(0xffffff); labelMat.needsUpdate = true; }).catch(() => undefined);
  const shelfLabels = Promise.all(shelfCans.map(({ mat }, i) => {
    const f = FLAVORS[i % FLAVORS.length];
    return getLabelImage(f).then((img) => { mat.map = toTex(img); mat.color.set(0xffffff); mat.needsUpdate = true; }).catch(() => undefined);
  }));
  heroLabel.finally(() => opts.onReady?.());
  void shelfLabels;

  // ═══════════ Mise en scène par chapitre ═══════════
  const canKF = (i: number, u: number, t: number): CanState => {
    const spin = reduceMotion ? 0 : t * 0.5;
    switch (i) {
      case 0: return { pos: [0, 1.9 + Math.sin(t * 1.2) * 0.15, 3], rot: [0.1, spin, -0.12], scale: [0.62, 0.62, 0.62] };
      case 1: return { pos: [0, GROUND + 0.6 + 2.6 * 0.66 + 0.5 + Math.sin(t * 1.6) * 0.1, 0], rot: [0, spin * 2, 0.08], scale: [0.66, 0.66, 0.66] };
      case 2: {
        const a = u * 2.2 + 0.4;
        return { pos: [Math.cos(a) * 3.3, 1.2, Math.sin(a) * 1.4 + 1.6], rot: [0.3, spin, 0.35], scale: [0.36, 0.36, 0.36] };
      }
      case 3: return { pos: [0, -0.05, 0], rot: [0.08, 0.12 + (reduceMotion ? 0 : Math.sin(t * 0.4) * 0.06), -0.04], scale: [0.95, 0.95, 0.95] };
      case 4: return { pos: [0.2, GROUND + 0.95, 0], rot: [0, 0.4, Math.PI / 2 - 0.08], scale: [1.18, 0.66, 1.18] };
      case 5: {
        const s = clamp01(u + 0.5) * (STEPS - 1); // de la première à la dernière marche
        const k = Math.min(STEPS - 2, Math.floor(s)), f = s - k;
        const x = lerp(stepX(k), stepX(k + 1), smooth(f));
        const y = lerp(stepTop(k), stepTop(k + 1), smooth(f)) + Math.sin(Math.PI * f) * 0.9 + (HALF + 0.3) * 0.48;
        return { pos: [x, y, 0], rot: [0, spin, Math.sin(Math.PI * f) * -0.25], scale: [0.48, 0.48, 0.48] };
      }
      case 6: return { pos: [0, 0.1, 0], rot: [0.05, (u + 0.5) * Math.PI * 4 + spin * 0.4, -0.06], scale: [1.05, 1.05, 1.05] };
      default: return { pos: [0, GROUND + 0.03 + (HALF + 0.3) * 0.58, 0.1], rot: [0, spin * 0.5, 0], scale: [0.58, 0.58, 0.58] };
    }
  };
  const camKF = (i: number, u: number): CamState => {
    switch (i) {
      case 0: return { pos: [0 + u * 1.2, 3.4, 16], look: [0, -0.2, -1] };
      case 1: return { pos: [0, 7, 14.5], look: [0, -0.8, 0] };
      case 2: return { pos: [0 + u * 1.4, 1.2, 17], look: [0, 0.3, 0] };
      case 3: return { pos: [0, 0.4, 16.5 - u * 1.4], look: [0, 0, 0] };
      case 4: return { pos: [4.2, 1.6, 14], look: [0, -1.2, 0] };
      case 5: return { pos: [lerp(-1.5, 1.5, clamp01(u + 0.5)), 1.6, 15.5], look: [lerp(-1.2, 1.2, clamp01(u + 0.5)), -0.4, 0] };
      case 6: return { pos: [0, 0.3, 15.5 - u * 1.2], look: [0, 0.1, 0] };
      default: return { pos: [0, 0.6, 22 + u * 2], look: [0, 0.4, 0] };
    }
  };

  // ═══════════ Taille / visibilité ═══════════
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Grand écran : la scène se décale à droite, le texte vit à gauche
    if (w > 900) camera.setViewOffset(w, h, -w * 0.16, 0, w, h);
    else camera.setViewOffset(w, h, 0, h * 0.12, w, h); // mobile : la scène remonte, le texte est en bas
    camera.fov = w < h ? 44 : 32;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  let visible = false;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: "100px" });
  io.observe(canvas);

  let progress = 0; // 0 → STORY_CHAPTERS-1, piloté par le scroll
  let shown = 0;
  const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
  const tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpS = new THREE.Vector3(), tmpP = new THREE.Vector3(), tmpE = new THREE.Euler();

  const clock = new THREE.Clock();
  let shake = 0;
  renderer.setAnimationLoop(() => {
    if (!visible) { clock.getDelta(); return; }
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    shown += (progress - shown) * (1 - Math.exp(-dt * 6));
    const p = shown;
    const i0 = Math.max(0, Math.min(STORY_CHAPTERS - 1, Math.floor(p))), i1 = Math.min(STORY_CHAPTERS - 1, i0 + 1);
    const f = smooth((p - i0 - 0.3) / 0.4); // on reste sur un chapitre, puis on bascule vite vers le suivant
    const u0 = p - i0, u1 = p - i1;

    // Canette héroïne
    const a = canKF(i0, u0, t), b = canKF(i1, u1, t);
    hero.position.set(...lerp3(a.pos, b.pos, f));
    hero.rotation.set(...lerp3(a.rot, b.rot, f));
    hero.scale.set(...lerp3(a.scale, b.scale, f));
    // Ce que la canette « est » : idée → verre 2007 → design actuel
    const kWire = smooth((p - 1.45) / 0.4) * (1 - smooth((p - 2.45) / 0.45));
    const kLabel = smooth((p - 5.55) / 0.4);
    const kGlass = smooth((p - 2.45) / 0.45) * (1 - kLabel);
    setGroupFade(wire, kWire);
    setGroupFade(glass, kGlass);
    setGroupFade(labelled, kLabel);
    setGroupFade(metal, kLabel);
    // 2007 : la canette s'ouvre en deux (les moitiés s'écartent et pivotent), puis se referme
    const open = band(p, 2.55, 2.85, 3.3, 3.6);
    halves.forEach((h, k) => {
      const sd = k === 0 ? 1 : -1;
      h.position.x = sd * open * 1.0;
      h.rotation.y = sd * open * 0.55;
    });
    // Bulles qui montent le long de la coupe, à l'intérieur
    if (glass.visible) {
      for (let k = 0; k < BUB; k++) {
        const b = bubSeed[k];
        const hh = halves[b.side === 1 ? 0 : 1];
        const y = -OHALF + 0.4 + ((b.o + t * b.s * 0.22) % 1) * OH * 0.76;
        tmpP.set(b.side * b.x, y, b.z).applyEuler(hh.rotation).add(hh.position);
        tmpS.setScalar(b.k * (0.6 + open * 0.8));
        tmpM.compose(tmpP, tmpQ.identity(), tmpS);
        bubbles.setMatrixAt(k, tmpM);
      }
      bubbles.instanceMatrix.needsUpdate = true;
    }
    // Ombre sous la canette (au sol quand elle est posée)
    heroShadow.position.set(hero.position.x, (i0 === 5 || i1 === 5) ? hero.position.y - (HALF + 0.3) * hero.scale.y - 0.02 : GROUND + 0.01, hero.position.z);
    heroShadow.scale.setScalar(Math.max(0.3, hero.scale.x));
    setGroupFade(heroShadow, Math.min(Math.max(kGlass, kLabel), 1 - band(p, 1.5, 2, 2.6, 3)));

    // Décors : chaque chapitre apparaît autour de son passage
    chapters.forEach((g, i) => {
      const k = band(p, i - 0.75, i - 0.3, i + 0.3, i + 0.75);
      setGroupFade(g, i === 0 ? Math.max(k, p < 0 ? 1 : 0) : i === STORY_CHAPTERS - 1 ? smooth((p - i + 0.75) / 0.45) : k);
      g.position.y = (1 - k) * -0.6;
    });
    // Animations propres à chaque décor
    if (chapters[1].visible && !reduceMotion) pizza.rotation.y = t * 0.25;
    if (chapters[2].visible) {
      const fu = clamp01((p - 2 + 0.45) / 0.9);
      const pt = flight.getPoint(fu), tg = flight.getTangent(fu);
      plane.position.copy(pt);
      plane.lookAt(pt.clone().add(tg));
      if (!reduceMotion) { globe.rotation.y = -THREE.MathUtils.degToRad(52) + Math.sin(t * 0.2) * 0.08; if (clouds) clouds.rotation.y = -Math.PI / 2 + t * 0.012; }
    }
    if (chapters[4].visible) {
      papers.forEach((m, k) => {
        const ph = k * 0.77, r = 2.2 + (k % 6) * 0.55;
        const ang = ph + t * (0.5 + (k % 4) * 0.12);
        m.position.set(Math.cos(ang) * r, GROUND + 0.6 + ((k * 0.37 + t * 0.35) % 1) * 5.5, Math.sin(ang) * r * 0.6);
        m.rotation.set(Math.sin(t * 0.7 + k) * 1.2 + k, t * 0.45 + k * 0.5, Math.sin(t * 0.5 + k * 2) * 0.6);
      });
      shake = band(p, 3.6, 3.85, 4.15, 4.4) * (reduceMotion ? 0 : 0.09);
    } else shake = 0;
    if (chapters[6].visible) {
      const bt = clamp01((p - 5.6) / 0.9); // l'explosion démarre quand le design change
      for (let k = 0; k < CONF; k++) {
        const s = confSeed[k];
        const d = bt * s.sp;
        tmpP.copy(s.d).multiplyScalar(d);
        tmpP.y -= bt * bt * 2.8;
        tmpE.set(s.rot + t * 2, s.rot * 0.5 + t * 1.4, 0);
        tmpQ.setFromEuler(tmpE);
        tmpS.setScalar(bt > 0.001 ? 1 : 0);
        tmpM.compose(tmpP, tmpQ, tmpS);
        confetti.setMatrixAt(k, tmpM);
      }
      confetti.instanceMatrix.needsUpdate = true;
    }

    // Lumières : plus chaudes à la pizzeria, rouges au coup dur, jaunes au renouveau
    rim.color.setHSL(band(p, 3.5, 3.9, 4.1, 4.5) > 0.5 ? 0.99 : 0.14, 1, 0.55);
    amb.intensity = 0.35 + band(p, 6.5, 7, 8, 9) * 0.4;

    // Caméra
    const ca = camKF(i0, u0), cb = camKF(i1, u1);
    camPos.set(...lerp3(ca.pos, cb.pos, f));
    camLook.set(...lerp3(ca.look, cb.look, f));
    if (shake) camPos.add(tmpP.set(Math.sin(t * 43) * shake, Math.cos(t * 37) * shake, 0));
    camera.position.copy(camPos);
    camera.lookAt(camLook);

    renderer.render(scene, camera);
  });

  return {
    setProgress(p: number) { progress = Math.max(0, Math.min(STORY_CHAPTERS - 1, p)); },
    dispose() {
      renderer.setAnimationLoop(null);
      ro.disconnect();
      io.disconnect();
      disposables.forEach((d) => d.dispose());
      confetti.dispose();
      bubbles.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
