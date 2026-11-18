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

  // 2) 2007 : la canette transparente, boisson ambrée et bulles
  const glass = new THREE.Group();
  const glassMat = track(fadeable(new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, opacity: 0.22, envMapIntensity: 1.4, side: THREE.DoubleSide })));
  const bodyGeo = track(new THREE.CylinderGeometry(R, R, H, 96, 1, true));
  glass.add(new THREE.Mesh(bodyGeo, glassMat));
  const liquidMat = track(fadeable(new THREE.MeshPhysicalMaterial({ color: 0xff9a1f, roughness: 0.15, opacity: 0.72, emissive: 0x6a2a00, emissiveIntensity: 0.35 })));
  const liquid = new THREE.Mesh(track(new THREE.CylinderGeometry(R * 0.93, R * 0.93, H * 0.8, 64)), liquidMat);
  liquid.position.y = -H * 0.08;
  glass.add(liquid);
  // Bandeau « Dada » des débuts, posé sur le verre
  const oldBand = new THREE.Mesh(
    track(new THREE.CylinderGeometry(R * 1.005, R * 1.005, 1.1, 96, 1, true, -Math.PI * 0.42, Math.PI * 0.84)),
    track(fadeable(new THREE.MeshBasicMaterial({
      map: track(canvasTex(512, 128, (g) => {
        g.fillStyle = "rgba(255,255,255,0.0)"; g.fillRect(0, 0, 512, 128);
        g.fillStyle = "#ffffff"; g.font = "italic 900 92px Montserrat, Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText("dada", 256, 66);
      })), side: THREE.DoubleSide,
    }))),
  );
  oldBand.position.y = 0.3;
  glass.add(oldBand);
  // Bulles dans la boisson
  const bubbleGeo = track(new THREE.SphereGeometry(0.05, 8, 6));
  const bubbleMat = track(fadeable(new THREE.MeshBasicMaterial({ color: 0xfff3d6, opacity: 0.85 })));
  const BUB = 46;
  const bubbles = new THREE.InstancedMesh(bubbleGeo, bubbleMat, BUB);
  const bubSeed = Array.from({ length: BUB }, (_, i) => ({ a: (i * 2.39996) % (Math.PI * 2), r: 0.15 + ((i * 37) % 70) / 100, s: 0.4 + ((i * 13) % 10) / 12, o: (i * 0.137) % 1, z: 0.6 + ((i * 7) % 6) / 6 }));
  glass.add(bubbles);
  hero.add(glass);

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

  // — 0 · Nanterre : les tours nuages (Tours Aillaud), ciel étoilé
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
    const ground = new THREE.Mesh(track(new THREE.CircleGeometry(14, 64)), track(fadeable(new THREE.MeshStandardMaterial({ color: 0x1a2238, roughness: 0.9 }))));
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
    // étoiles
    const starGeo = track(new THREE.BufferGeometry());
    const sp: number[] = [];
    for (let i = 0; i < 260; i++) sp.push(((i * 73) % 100) / 100 * 60 - 30, ((i * 41) % 100) / 100 * 22 + 2, -18 - ((i * 29) % 10));
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    g.add(new THREE.Points(starGeo, track(fadeable(new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, opacity: 0.8 })))));
  }

  // Les enfants qui jouent au ballon au pied des tours (chapitre 1, à la place de la canette)
  type Kid = { g: THREE.Group; legL: THREE.Object3D; legR: THREE.Object3D; armL: THREE.Object3D; armR: THREE.Object3D; ph: number; base: THREE.Vector3 };
  const kids: Kid[] = [];
  const ball = new THREE.Mesh(track(new THREE.SphereGeometry(0.17, 20, 14)), track(fadeable(new THREE.MeshStandardMaterial({
    map: track(canvasTex(128, 64, (c) => {
      c.fillStyle = "#ffffff"; c.fillRect(0, 0, 128, 64);
      c.fillStyle = "#111111"; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(10 + i * 22, 16 + (i % 2) * 32, 7, 0, Math.PI * 2); c.fill(); }
    })), roughness: 0.5,
  }))));
  {
    const g = chapters[0];
    const skin = [0x8d5524, 0xc68642, 0xe0ac69, 0x5c3a21];
    const shirts = [0xe6003c, 0xffdd00, 0x3d6fd6, 0x1fb38a];
    const pants = [0x1e2a44, 0x2b2b2b, 0x3b2a1a, 0x23304f];
    const limbGeo = track(new THREE.CapsuleGeometry(0.075, 0.42, 4, 8));
    const armGeo = track(new THREE.CapsuleGeometry(0.06, 0.34, 4, 8));
    const bodyGeo2 = track(new THREE.CapsuleGeometry(0.2, 0.36, 4, 12));
    const headGeo = track(new THREE.SphereGeometry(0.2, 20, 14));
    const hairGeo = track(new THREE.SphereGeometry(0.21, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.55));
    const spots: [number, number, number][] = [[-1.5, 2.6, 0.3], [1.4, 2.2, -0.4], [0.1, 3.6, 3.1], [-0.2, 1.4, 0]];
    spots.forEach(([x, z, ry], i) => {
      const std = (c: number) => track(fadeable(new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 })));
      const kid = new THREE.Group();
      const hip = 0.62;
      const mkLimb = (geo: THREE.BufferGeometry, mat: THREE.Material, px: number, py: number, len: number) => {
        const pivot = new THREE.Group();
        pivot.position.set(px, py, 0);
        const m = new THREE.Mesh(geo, mat);
        m.position.y = -len / 2;
        pivot.add(m);
        kid.add(pivot);
        return pivot;
      };
      const legL = mkLimb(limbGeo, std(pants[i]), -0.1, hip, 0.56);
      const legR = mkLimb(limbGeo, std(pants[i]), 0.1, hip, 0.56);
      const torso = new THREE.Mesh(bodyGeo2, std(shirts[i]));
      torso.position.y = hip + 0.36;
      kid.add(torso);
      const armL = mkLimb(armGeo, std(skin[i]), -0.27, hip + 0.6, 0.46);
      const armR = mkLimb(armGeo, std(skin[i]), 0.27, hip + 0.6, 0.46);
      const head = new THREE.Mesh(headGeo, std(skin[i]));
      head.position.y = hip + 0.9;
      kid.add(head);
      const hair = new THREE.Mesh(hairGeo, std(0x1a120c));
      hair.position.y = hip + 0.92;
      hair.rotation.x = -0.25;
      kid.add(hair);
      kid.scale.setScalar(1.35);
      kid.position.set(x, GROUND, z);
      kid.rotation.y = ry;
      g.add(kid);
      kids.push({ g: kid, legL, legR, armL, armR, ph: i * 1.7, base: kid.position.clone() });
    });
    g.add(ball);
    // Ombres des enfants
    kids.forEach((k) => {
      const sh = new THREE.Mesh(track(new THREE.PlaneGeometry(1.2, 1.2)), track(fadeable(new THREE.MeshBasicMaterial({ map: shadowTex, depthWrite: false, opacity: 0.8 }))));
      sh.rotation.x = -Math.PI / 2;
      sh.position.set(k.base.x, GROUND + 0.012, k.base.z);
      g.add(sh);
    });
  }

  // — 1 · La pizzeria : la canette tourne au-dessus d'une pizza
  const pizza = new THREE.Group();
  {
    const g = chapters[1];
    const std = (c: number, r = 0.7) => track(fadeable(new THREE.MeshStandardMaterial({ color: c, roughness: r })));
    const base = new THREE.Mesh(track(new THREE.CylinderGeometry(3.2, 3.2, 0.22, 64)), std(0xe3b26e));
    const crust = new THREE.Mesh(track(new THREE.TorusGeometry(3.1, 0.32, 16, 64)), std(0xc98a45));
    crust.rotation.x = Math.PI / 2; crust.position.y = 0.12;
    const sauce = new THREE.Mesh(track(new THREE.CylinderGeometry(2.85, 2.85, 0.26, 64)), std(0xc0392b, 0.5));
    pizza.add(base, crust, sauce);
    const cheese = std(0xffe08a, 0.6), pep = std(0x9e2a22, 0.5), basil = std(0x2f8f3a, 0.6);
    for (let i = 0; i < 26; i++) {
      const a = i * 2.39996, r = 0.4 + (i % 9) * 0.27;
      const m = new THREE.Mesh(track(new THREE.SphereGeometry(0.42, 16, 8)), cheese);
      m.scale.set(1, 0.18, 1); m.position.set(Math.cos(a) * r, 0.16, Math.sin(a) * r);
      pizza.add(m);
    }
    for (let i = 0; i < 12; i++) {
      const a = i * 2.1 + 0.6, r = 0.6 + (i % 5) * 0.45;
      const m = new THREE.Mesh(track(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 24)), pep);
      m.position.set(Math.cos(a) * r, 0.2, Math.sin(a) * r);
      pizza.add(m);
    }
    for (let i = 0; i < 7; i++) {
      const a = i * 0.9 + 0.3, r = 1.1 + (i % 3) * 0.6;
      const m = new THREE.Mesh(track(new THREE.SphereGeometry(0.22, 10, 6)), basil);
      m.scale.set(1.4, 0.15, 0.7); m.position.set(Math.cos(a) * r, 0.22, Math.sin(a) * r); m.rotation.y = a;
      pizza.add(m);
    }
    pizza.position.y = GROUND + 0.4;
    g.add(pizza);
  }

  // — 2 · Le voyage : globe en points, vol Paris → Kuala Lumpur
  const globe = new THREE.Group();
  const plane = new THREE.Group();
  let flight: THREE.QuadraticBezierCurve3;
  {
    const g = chapters[2];
    const GR = 2.6;
    const ll = (lat: number, lon: number, r = GR) => {
      const la = THREE.MathUtils.degToRad(lat), lo = THREE.MathUtils.degToRad(lon);
      return new THREE.Vector3(r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo));
    };
    // Océan
    globe.add(new THREE.Mesh(track(new THREE.SphereGeometry(GR * 0.985, 48, 32)), track(fadeable(new THREE.MeshStandardMaterial({ color: 0x0b2a4a, roughness: 0.6, metalness: 0.1 })))));
    // Continents très simplifiés (ellipses lat/lon), dessinés en points
    const lands: [number, number, number, number][] = [
      [50, 10, 14, 26], [8, 20, 28, 20], [55, 90, 18, 55], [25, 78, 10, 14], [15, 103, 10, 10], [-25, 134, 12, 18],
      [45, -100, 18, 32], [-15, -60, 26, 16], [65, -42, 8, 14], [0, 115, 6, 14],
    ];
    const pts: number[] = [];
    const n = 7000;
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.39996;
      const lat = THREE.MathUtils.radToDeg(Math.asin(y)), lon = THREE.MathUtils.radToDeg(Math.atan2(r * Math.sin(th), r * Math.cos(th)));
      const land = lands.some(([la, lo, dla, dlo]) => ((lat - la) / dla) ** 2 + ((((lon - lo + 540) % 360) - 180) / dlo) ** 2 < 1);
      if (!land) continue;
      const v = ll(lat, lon, GR * 1.005);
      pts.push(v.x, v.y, v.z);
    }
    const dotGeo = track(new THREE.BufferGeometry());
    dotGeo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    globe.add(new THREE.Points(dotGeo, track(fadeable(new THREE.PointsMaterial({ color: 0x7fe0a8, size: 0.055 })))));
    // Vol
    const paris = ll(48.8, 2.3, GR * 1.01), kl = ll(3.1, 101.7, GR * 1.01);
    const mid = paris.clone().add(kl).multiplyScalar(0.5).normalize().multiplyScalar(GR * 1.75);
    flight = new THREE.QuadraticBezierCurve3(paris, mid, kl);
    globe.add(new THREE.Mesh(track(new THREE.TubeGeometry(flight, 64, 0.025, 8)), track(fadeable(new THREE.MeshBasicMaterial({ color: 0xffdd00 })))));
    const pin = (v: THREE.Vector3) => { const m = new THREE.Mesh(track(new THREE.SphereGeometry(0.09, 12, 8)), track(fadeable(new THREE.MeshBasicMaterial({ color: 0xffffff })))); m.position.copy(v); globe.add(m); };
    pin(paris); pin(kl);
    // Petit avion
    const pm = track(fadeable(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })));
    const fus = new THREE.Mesh(track(new THREE.CapsuleGeometry(0.06, 0.32, 4, 8)), pm);
    fus.rotation.x = Math.PI / 2;
    const wings = new THREE.Mesh(track(new THREE.BoxGeometry(0.46, 0.015, 0.1)), pm);
    plane.add(fus, wings);
    globe.add(plane);
    globe.rotation.y = -THREE.MathUtils.degToRad(52); // l'Europe et l'Asie face à nous
    globe.rotation.x = 0.25;
    g.add(globe);
  }

  // — 4 · 2009 : les contrats s'envolent
  const papers: THREE.Mesh[] = [];
  {
    const g = chapters[4];
    const paperMat = track(fadeable(new THREE.MeshStandardMaterial({
      map: track(canvasTex(128, 160, (c) => {
        c.fillStyle = "#f4f2ee"; c.fillRect(0, 0, 128, 160);
        c.fillStyle = "#b9b4aa"; for (let y = 22; y < 140; y += 12) c.fillRect(14, y, 100 - ((y * 7) % 30), 4);
        c.fillStyle = "#e6003c"; c.font = "900 22px Montserrat, Arial"; c.fillText("CONTRAT", 14, 18);
      })), side: THREE.DoubleSide, roughness: 0.9,
    })));
    const pg = track(new THREE.PlaneGeometry(0.62, 0.8));
    for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(pg, paperMat); papers.push(m); g.add(m); }
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
        return { pos: [Math.cos(a) * 3.9, 1.0, Math.sin(a) * 1.8 + 0.6], rot: [0.3, spin, 0.35], scale: [0.38, 0.38, 0.38] };
      }
      case 3: return { pos: [0, -0.05, 0], rot: [0.05, spin * 0.6 + u * 1.5, -0.08], scale: [1, 1, 1] };
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
      case 0: return { pos: [0 + u * 1.2, 2.6, 15], look: [0, -0.4, -0.5] };
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
    const kWire = smooth((p - 0.45) / 0.4) * (1 - smooth((p - 2.45) / 0.45));
    const kLabel = smooth((p - 5.55) / 0.4);
    const kGlass = (1 - kWire) * (1 - kLabel);
    setGroupFade(wire, kWire);
    setGroupFade(glass, kGlass);
    setGroupFade(labelled, kLabel);
    setGroupFade(metal, Math.max(kGlass, kLabel));
    // Bulles qui montent dans la canette transparente
    if (glass.visible) {
      for (let k = 0; k < BUB; k++) {
        const s = bubSeed[k];
        const y = ((s.o + t * s.s * 0.25) % 1) * H * 0.78 - H * 0.47;
        tmpP.set(Math.cos(s.a + t * 0.3) * s.r, y, Math.sin(s.a + t * 0.3) * s.r);
        tmpS.setScalar(s.z);
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
    if (chapters[0].visible) {
      // Passes de ballon entre les trois premiers enfants, le quatrième court autour
      const tt = reduceMotion ? 0 : t;
      const passDur = 1.1;
      const n = 3, seg = Math.floor(tt / passDur), fr = (tt / passDur) % 1;
      const from = kids[seg % n].base, to = kids[(seg + 1) % n].base;
      ball.position.set(lerp(from.x, to.x, fr), GROUND + 0.18 + Math.sin(Math.PI * fr) * 1.4, lerp(from.z, to.z, fr));
      ball.rotation.x = tt * 6;
      kids.forEach((k, i) => {
        const run = i === 3;
        const sp = run ? 9 : 5;
        const sw = Math.sin(tt * sp + k.ph) * (run ? 0.8 : 0.35);
        k.legL.rotation.x = sw; k.legR.rotation.x = -sw;
        k.armL.rotation.x = -sw * 0.9; k.armR.rotation.x = sw * 0.9;
        const target = i < n ? ball.position : kids[0].base;
        if (run) {
          const a = tt * 0.9;
          k.g.position.set(k.base.x + Math.cos(a) * 1.6, GROUND + Math.abs(Math.sin(tt * 9)) * 0.12, k.base.z + Math.sin(a) * 0.9);
          k.g.rotation.y = -a;
        } else {
          k.g.position.y = GROUND + Math.abs(Math.sin(tt * 2.4 + k.ph)) * 0.08;
          k.g.rotation.y = Math.atan2(target.x - k.g.position.x, target.z - k.g.position.z);
          // celui qui reçoit lève les bras
          if ((seg + 1) % n === i && fr > 0.6) { k.armL.rotation.x = -2.4; k.armR.rotation.x = -2.4; }
        }
      });
    }
    if (chapters[1].visible && !reduceMotion) pizza.rotation.y = t * 0.25;
    if (chapters[2].visible) {
      const fu = clamp01((p - 2 + 0.45) / 0.9);
      const pt = flight.getPoint(fu), tg = flight.getTangent(fu);
      plane.position.copy(pt);
      plane.lookAt(pt.clone().add(tg));
      if (!reduceMotion) globe.rotation.y = -THREE.MathUtils.degToRad(52) + Math.sin(t * 0.2) * 0.08;
    }
    if (chapters[4].visible) {
      papers.forEach((m, k) => {
        const ph = k * 0.77, r = 2.2 + (k % 6) * 0.55;
        const ang = ph + t * (0.5 + (k % 4) * 0.12);
        m.position.set(Math.cos(ang) * r, GROUND + 0.6 + ((k * 0.37 + t * 0.35) % 1) * 5.5, Math.sin(ang) * r * 0.6);
        m.rotation.set(t * 1.3 + k, t * 0.9 + k * 0.5, t * 0.7);
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
