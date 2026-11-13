// L'univers 3D de chaque saveur : quelques fruits (ou glaçons et bulles pour les colas)
// qui flottent autour de la canette, en profondeur. Peu d'objets, matières naturelles,
// mouvement lent : un décor, pas un feu d'artifice.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

type Maker = () => THREE.Object3D;

// ---------- Matières ----------
const glossy = (color: number, roughness = 0.3) =>
  new THREE.MeshPhysicalMaterial({ color, roughness, clearcoat: 1, clearcoatRoughness: 0.15 });
const matte = (color: number, roughness = 0.6) => new THREE.MeshStandardMaterial({ color, roughness });
const leafMat = (color = 0x2f7d32) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.55, side: THREE.DoubleSide });
// Glace : vraie transparence (réfraction), légèrement bleutée, arêtes brillantes
const iceMat = () =>
  new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.08, metalness: 0, transmission: 1, thickness: 0.8, ior: 1.31,
    attenuationColor: new THREE.Color(0xcfe9ff), attenuationDistance: 1.5,
    clearcoat: 1, clearcoatRoughness: 0.03, specularIntensity: 1, envMapIntensity: 1.6,
  });

/** Couleurs par sommet, d'après une fonction de la position */
function paint(geo: THREE.BufferGeometry, fn: (p: THREE.Vector3) => THREE.Color) {
  const pos = geo.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const p = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i);
    const c = fn(p);
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return geo;
}
const C = (hex: number) => new THREE.Color(hex);
const mixC = (a: number, b: number, t: number) => C(a).lerp(C(b), Math.min(1, Math.max(0, t)));

// ---------- Bruit et textures peintes sur la sphère ----------
function hash3(x: number, y: number, z: number) {
  const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return h - Math.floor(h);
}
/** Bruit de valeur 3D lissé, entre 0 et 1 */
function vnoise(x: number, y: number, z: number) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const l = (a: number, b: number, t: number) => a + (b - a) * t;
  const c = (dx: number, dy: number, dz: number) => hash3(xi + dx, yi + dy, zi + dz);
  return l(
    l(l(c(0, 0, 0), c(1, 0, 0), u), l(c(0, 1, 0), c(1, 1, 0), u), v),
    l(l(c(0, 0, 1), c(1, 0, 1), u), l(c(0, 1, 1), c(1, 1, 1), u), v),
    w,
  );
}
function fbm(x: number, y: number, z: number, oct = 4) {
  let a = 0.5, f = 1, sum = 0, norm = 0;
  for (let i = 0; i < oct; i++) { sum += a * vnoise(x * f, y * f, z * f); norm += a; f *= 2.03; a *= 0.5; }
  return sum / norm;
}
const smooth = (e0: number, e1: number, x: number) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
/** Petits points (lenticelles, pores) : 0 → 1 au centre de quelques cellules d'une grille 3D */
function dots(x: number, y: number, z: number, freq: number, density: number, size: number) {
  const X = x * freq, Y = y * freq, Z = z * freq;
  const xi = Math.floor(X), yi = Math.floor(Y), zi = Math.floor(Z);
  if (hash3(xi, yi, zi) > density) return 0;
  const cx = xi + 0.25 + hash3(xi + 7, yi, zi) * 0.5, cy = yi + 0.25 + hash3(xi, yi + 7, zi) * 0.5, cz = zi + 0.25 + hash3(xi, yi, zi + 7) * 0.5;
  const d = Math.hypot(X - cx, Y - cy, Z - cz);
  return 1 - smooth(size * 0.5, size, d);
}
/**
 * Texture peinte pixel par pixel d'après le point de la sphère unité correspondant
 * (même paramétrage que les UV de THREE.SphereGeometry). Mise en cache par clé.
 */
const sphereTexCache = new Map<string, THREE.Texture>();
function sphereTex(key: string, W: number, H: number, fn: (x: number, y: number, z: number) => THREE.Color) {
  const hit = sphereTexCache.get(key);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const g = cv.getContext("2d")!;
  const img = g.createImageData(W, H);
  for (let j = 0; j < H; j++) {
    const th = ((j + 0.5) / H) * Math.PI, st = Math.sin(th), y = Math.cos(th);
    for (let i = 0; i < W; i++) {
      const ph = ((i + 0.5) / W) * Math.PI * 2;
      const c = fn(-Math.cos(ph) * st, y, Math.sin(ph) * st);
      const o = (j * W + i) * 4;
      img.data[o] = Math.round(Math.min(1, c.r) * 255);
      img.data[o + 1] = Math.round(Math.min(1, c.g) * 255);
      img.data[o + 2] = Math.round(Math.min(1, c.b) * 255);
      img.data[o + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  sphereTexCache.set(key, t);
  return t;
}
/** Mélange de couleurs THREE en place, renvoie a */
const lerpC = (a: THREE.Color, hex: number, t: number) => a.lerp(C(hex), Math.min(1, Math.max(0, t)));

// ---------- Éléments communs ----------
function leaf(color = 0x2f7d32, len = 0.7, width = 0.28): THREE.Object3D {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.quadraticCurveTo(width, len * 0.45, 0, len);
  s.quadraticCurveTo(-width, len * 0.45, 0, 0);
  const geo = new THREE.ShapeGeometry(s, 16);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    pos.setZ(i, -1.2 * x * x + 0.12 * Math.sin((y / len) * Math.PI)); // nervure centrale et courbure
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, leafMat(color));
  const g = new THREE.Group();
  m.position.y = -len / 2;
  g.add(m);
  return g;
}

function stem(points: [number, number, number][], radius = 0.02, color = 0x5d6b2c) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  return new THREE.Mesh(new THREE.TubeGeometry(curve, 24, radius, 8, false), matte(color, 0.7));
}

function ice(): THREE.Object3D {
  const s = 0.42 + Math.random() * 0.18;
  return new THREE.Mesh(new RoundedBoxGeometry(s, s * 0.9, s, 3, s * 0.12), iceMat());
}

/** Couleurs d'un agrume coupé */
type CitrusColors = { rind: string; rindDark: string; pith: string; flesh: string; fleshLight: string; membrane: string };
const LIME: CitrusColors = { rind: "#3f8a24", rindDark: "#24561a", pith: "#e6efc4", flesh: "#a9cc45", fleshLight: "#d8eb94", membrane: "#eef5d2" };
const LEMON: CitrusColors = { rind: "#f2c418", rindDark: "#c99a06", pith: "#fff8dc", flesh: "#f7d33a", fleshLight: "#fff09a", membrane: "#fffbe6" };

/** Coupe d'agrume dessinée finement : écorce, peau blanche, quartiers juteux (vésicules serrées), membranes, cœur */
function drawCitrus(g: CanvasRenderingContext2D, S: number, col: CitrusColors) {
  const c = S / 2, k = S / 512;
  // écorce : bord plus foncé, liseré de pores
  const rg = g.createRadialGradient(c, c, c * 0.88, c, c, c);
  rg.addColorStop(0, col.rind); rg.addColorStop(1, col.rindDark);
  g.fillStyle = rg; g.beginPath(); g.arc(c, c, c, 0, Math.PI * 2); g.fill();
  // peau blanche (albédo), plus épaisse côté écorce
  const pg = g.createRadialGradient(c, c, c * 0.84, c, c, c * 0.93);
  pg.addColorStop(0, col.membrane); pg.addColorStop(1, col.pith);
  g.fillStyle = pg; g.beginPath(); g.arc(c, c, c * 0.925, 0, Math.PI * 2); g.fill();
  const n = 10;
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < n; i++) {
    const w = 0.03 + rnd() * 0.02;
    const a0 = (i / n) * Math.PI * 2 + w, a1 = ((i + 1) / n) * Math.PI * 2 - w;
    g.save();
    g.beginPath(); g.moveTo(c + Math.cos((a0 + a1) / 2) * c * 0.08, c + Math.sin((a0 + a1) / 2) * c * 0.08);
    g.arc(c, c, c * 0.86, a0, a1); g.closePath();
    const fg = g.createRadialGradient(c, c, c * 0.05, c, c, c * 0.86);
    fg.addColorStop(0, col.fleshLight); fg.addColorStop(0.55, col.flesh); fg.addColorStop(1, col.flesh);
    g.fillStyle = fg; g.fill();
    g.clip();
    // vésicules de jus : gouttes allongées vers le centre, serrées, avec un reflet
    for (let q = 0; q < 260; q++) {
      const a = a0 + rnd() * (a1 - a0), r = c * (0.1 + Math.sqrt(rnd()) * 0.76);
      const x = c + Math.cos(a) * r, y = c + Math.sin(a) * r;
      const len = (5 + rnd() * 9) * k * (0.6 + r / c), wid = (1.6 + rnd() * 2) * k;
      g.fillStyle = rnd() > 0.45 ? `rgba(255,255,255,${0.12 + rnd() * 0.2})` : `rgba(0,0,0,${0.04 + rnd() * 0.07})`;
      g.beginPath(); g.ellipse(x, y, len, wid, a, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  // membranes et cœur
  g.strokeStyle = col.membrane; g.lineWidth = S / 170;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (rnd() - 0.5) * 0.02;
    g.beginPath(); g.moveTo(c + Math.cos(a) * c * 0.08, c + Math.sin(a) * c * 0.08); g.lineTo(c + Math.cos(a) * c * 0.87, c + Math.sin(a) * c * 0.87); g.stroke();
  }
  g.fillStyle = col.membrane; g.beginPath(); g.arc(c, c, c * 0.08, 0, Math.PI * 2); g.fill();
  // reflet humide
  const hl = g.createRadialGradient(c * 0.7, c * 0.65, 0, c * 0.7, c * 0.65, c * 0.6);
  hl.addColorStop(0, "rgba(255,255,255,0.22)"); hl.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = hl; g.beginPath(); g.arc(c, c, c * 0.86, 0, Math.PI * 2); g.fill();
}
const citrusFaceMat = (col: CitrusColors) =>
  new THREE.MeshPhysicalMaterial({
    map: canvasTex(1024, (g, S) => drawCitrus(g, S, col)),
    roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.4, sheenColor: new THREE.Color(col.fleshLight), side: THREE.DoubleSide,
  });

/** Rondelle d'agrume : tranche épaisse, écorce sur la tranche, faces finement dessinées */
function citrusSlice(col: CitrusColors, skin?: THREE.Material): THREE.Object3D {
  const face = citrusFaceMat(col);
  const side = skin ?? new THREE.MeshPhysicalMaterial({ color: new THREE.Color(col.rind), roughness: 0.45, clearcoat: 0.6 });
  return new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.09, 64), [side, face, face]);
}

/** Tranche en croissant (melon, pêche) : chair dégradée vers le cœur + bande de peau */
function slice(fleshOut: number, fleshIn: number, skin: number, R = 0.85, inner = 0.48, angle = 2.3, depth = 0.22): THREE.Object3D {
  const g = new THREE.Group();
  const ring = (r0: number, r1: number) => {
    const sh = new THREE.Shape();
    sh.absarc(0, 0, r1, Math.PI / 2 - angle / 2, Math.PI / 2 + angle / 2, false);
    sh.absarc(0, 0, r0, Math.PI / 2 + angle / 2, Math.PI / 2 - angle / 2, true);
    return sh;
  };
  const extrude = { depth, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.025, bevelSegments: 3, curveSegments: 40 };
  const flesh = new THREE.ExtrudeGeometry(ring(R * inner, R * 0.93), extrude);
  paint(flesh, (p) => mixC(fleshIn, fleshOut, (Math.hypot(p.x, p.y) - R * inner) / (R * (0.93 - inner))));
  g.add(new THREE.Mesh(flesh, new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.25 })));
  const rind = new THREE.ExtrudeGeometry(ring(R * 0.92, R), { ...extrude, bevelSize: 0.02 });
  g.add(new THREE.Mesh(rind, matte(skin, 0.55)));
  g.children.forEach((m) => m.position.set(0, -R * 0.7, -depth / 2));
  return g;
}

// ---------- Fruits ----------
// ---------- Cerises ----------
/** Une cerise : ronde un peu en cœur, creux profond à la queue, sillon sur un côté, petit bout dessous */
function cherryGeo(r: number) {
  const geo = new THREE.SphereGeometry(r, 56, 40);
  const pos = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    let x = v.x * 1.08, y = v.y * 0.94, z = v.z * 1.04;
    const ny = v.y / r, rad = Math.hypot(v.x, v.z) / r;
    if (ny > 0.45) y -= (ny - 0.45) * r * 0.75 * (1 - rad * 0.6); // creux de la queue
    if (ny < -0.85) y -= (-0.85 - ny) * r * 0.25; // petit bout
    // sillon vertical sur la face avant
    if (z > 0) {
      const k = 0.035 * r * Math.exp(-Math.pow(v.x / (r * 0.12), 2)) * (z / r);
      z -= k;
    }
    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  // rouge très foncé près de la queue, plus vif sur les flancs, quelques nuances
  paint(geo, (p) => {
    const ny = p.y / r;
    const t = Math.min(1, Math.max(0, 0.55 - ny * 0.5 + 0.08 * Math.sin(p.x * 30) * Math.sin(p.z * 26)));
    return mixC(0x3e0208, 0xa8101f, t);
  });
  return geo;
}
let cherryMatCache: THREE.MeshPhysicalMaterial | null = null;
const cherryMat = () =>
  (cherryMatCache ??= new THREE.MeshPhysicalMaterial({
    vertexColors: true, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.15, sheen: 0.2, sheenColor: new THREE.Color(0xff6070),
  }));
/** Queue : verte, un peu plus brune au point d'attache */
function cherryStem(points: [number, number, number][]) {
  return stem(points, 0.017, 0x6f8f2c);
}

function cherries(): THREE.Object3D {
  const g = new THREE.Group();
  const a = new THREE.Mesh(cherryGeo(0.3), cherryMat());
  a.position.set(-0.22, 0, 0.02);
  a.rotation.set(0.1, 0.4, 0.12);
  const b = new THREE.Mesh(cherryGeo(0.28), cherryMat());
  b.position.set(0.24, -0.12, -0.03);
  b.rotation.set(-0.05, -0.6, -0.15);
  g.add(a, b);
  g.add(cherryStem([[-0.22, 0.2, 0.02], [-0.16, 0.55, 0.01], [-0.04, 0.85, 0], [0.02, 0.97, 0]]));
  g.add(cherryStem([[0.24, 0.06, -0.03], [0.22, 0.45, -0.02], [0.12, 0.8, 0], [0.02, 0.97, 0]]));
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), matte(0x5d4a2a, 0.8));
  knot.position.set(0.02, 0.97, 0);
  g.add(knot);
  const l = mintLeaf(0.5);
  l.scale.set(0.62, 1, 1); // feuille de cerisier : plus étroite
  l.position.set(0.02, 0.97, 0);
  l.rotation.z = -1.0;
  l.rotation.y = 0.5;
  g.add(l);
  return g;
}

/** Cerise seule avec sa queue */
function cherrySingle(): THREE.Object3D {
  const g = new THREE.Group();
  const m = new THREE.Mesh(cherryGeo(0.3), cherryMat());
  m.rotation.set(0.15, 0.3, 0.1);
  g.add(m);
  g.add(cherryStem([[0, 0.18, 0], [0.04, 0.5, 0], [0.14, 0.8, 0.02]]));
  return g;
}

function mangoCubes(): THREE.Object3D {
  const g = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({ color: 0xffa21f, roughness: 0.3, clearcoat: 0.7, transmission: 0 });
  [[0, 0, 0], [0.3, 0.06, 0.05], [0.12, 0.3, -0.05]].forEach(([x, y, z], i) => {
    const m = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.28, 0.28, 3, 0.05), mat);
    m.position.set(x, y, z);
    m.rotation.set(i * 0.6, i * 0.9, i * 0.3);
    g.add(m);
  });
  return g;
}

/** Points répartis régulièrement sur une sphère (spirale de Fibonacci) */
function spherePoints(n: number) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < n; i++) {
    const y = 1 - (2 * (i + 0.5)) / n;
    const r = Math.sqrt(1 - y * y);
    const a = i * 2.39996;
    pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
  }
  return pts;
}

/** Peau de litchi : fines écailles plates à petite pointe, rouge marbré (cramoisi, rose, touches orangées), sillons sombres */
const lycheeSkinCache = new Map<string, THREE.BufferGeometry>();
/** Géométrie partagée (le calcul des écailles est coûteux) */
function lycheeSkinGeo(r = 0.32, thetaStart = 0, thetaLength = Math.PI) {
  const key = `${r}:${thetaStart}:${thetaLength}`;
  let g = lycheeSkinCache.get(key);
  if (!g) {
    g = buildLycheeSkin(r, thetaStart, thetaLength);
    lycheeSkinCache.set(key, g);
  }
  return g;
}
function buildLycheeSkin(r: number, thetaStart: number, thetaLength: number) {
  const geo = new THREE.SphereGeometry(r, 128, 96, 0, Math.PI * 2, thetaStart, thetaLength);
  const cells = spherePoints(420);
  // une teinte par écaille, pour l'aspect marbré du litchi
  const tones = [0xa8162f, 0xc22a3e, 0xd2475a, 0x8f1428, 0xc4583f, 0xb83a3a, 0xd9666a];
  const cellCol = cells.map((c, i) => C(tones[(i * 7 + Math.floor((c.y + 1) * 3)) % tones.length]));
  const pos = geo.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const v = new THREE.Vector3(), n = new THREE.Vector3();
  const crease = C(0x4e0a14), tip = C(0xf09a8a);
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    n.copy(v).normalize();
    let d1 = 9, d2 = 9, k1 = 0;
    for (let k = 0; k < cells.length; k++) {
      const d = n.distanceToSquared(cells[k]);
      if (d < d1) { d2 = d1; d1 = d; k1 = k; } else if (d < d2) d2 = d;
    }
    const e = Math.sqrt(d2) - Math.sqrt(d1); // 0 sur les sillons
    const bump = Math.min(1, e / 0.07);
    const peak = Math.pow(Math.max(0, 1 - Math.sqrt(d1) / 0.05), 2); // petite pointe au centre de l'écaille
    // grandes taches plus sombres / plus claires sur le fruit
    const mott = 0.5 + 0.5 * Math.sin(n.x * 4.1 + n.y * 2.3) * Math.sin(n.z * 3.7 - n.y * 1.9);
    v.copy(n).multiplyScalar(r * (1 + 0.018 * bump + 0.014 * peak));
    v.y *= 1.08; // légèrement ovale
    if (v.y > 0) v.y *= 1 + 0.06 * (v.y / r); // épaule vers la queue
    pos.setXYZ(i, v.x, v.y, v.z);
    const c = crease.clone().lerp(cellCol[k1], Math.pow(bump, 0.6)).multiplyScalar(0.82 + 0.3 * mott).lerp(tip, peak * 0.45);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();
  return geo;
}
const lycheeSkinMat = () => new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.58, clearcoat: 0.25, clearcoatRoughness: 0.5 });

/** Chair de litchi : blanc nacré translucide, fines stries, très humide */
let lycheeFleshTex: THREE.Texture | null = null;
const lycheeFleshMat = () => {
  if (!lycheeFleshTex) {
    lycheeFleshTex = canvasTex(256, (g, S) => {
      g.fillStyle = "#f6f1e8"; g.fillRect(0, 0, S, S);
      for (let i = 0; i < 70; i++) {
        const x = Math.random() * S;
        g.strokeStyle = `rgba(${Math.random() > 0.5 ? "255,255,255" : "215,205,185"},${0.25 + Math.random() * 0.35})`;
        g.lineWidth = 1 + Math.random() * 3;
        g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 12, S * 0.3, x - 12, S * 0.7, x + (Math.random() - 0.5) * 20, S); g.stroke();
      }
    });
  }
  return new THREE.MeshPhysicalMaterial({
    map: lycheeFleshTex, color: 0xffffff, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.04,
    transmission: 0.55, thickness: 0.6, ior: 1.36, attenuationColor: new THREE.Color(0xeee3cf), attenuationDistance: 0.5,
    sheen: 0.6, sheenColor: new THREE.Color(0xffffff), sheenRoughness: 0.4,
  });
};
/** Chair irrégulière (pas une sphère parfaite) */
function lycheeFleshGeo(r: number) {
  const geo = new THREE.SphereGeometry(r, 64, 48);
  const pos = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const k = 1 + 0.035 * Math.sin(v.x * 18 + v.y * 7) * Math.sin(v.z * 15 - v.y * 9);
    pos.setXYZ(i, v.x * k, v.y * 1.12 * k, v.z * k);
  }
  geo.computeVertexNormals();
  return geo;
}
/** Noyau brun brillant, visible à travers la chair */
const lycheeSeed = (r: number) => {
  const geo = new THREE.SphereGeometry(r, 32, 24);
  geo.scale(0.85, 1.25, 0.85);
  return new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: 0x3a1c0e, roughness: 0.25, clearcoat: 1 }));
};

function lychee(): THREE.Object3D {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(lycheeSkinGeo(), lycheeSkinMat()));
  g.add(stem([[0, 0.34, 0], [0.03, 0.48, 0], [0.1, 0.62, 0.02]], 0.02, 0x6b4a2a));
  return g;
}

/** Litchi épluché : chair nacrée translucide, le noyau sombre devine au centre */
function lycheePeeled(): THREE.Object3D {
  const g = new THREE.Group();
  g.add(lycheeSeed(0.13));
  g.add(new THREE.Mesh(lycheeFleshGeo(0.28), lycheeFleshMat()));
  return g;
}

/** Litchi à moitié épluché : la peau garde le bas, la chair sort par le haut */
function lycheeHalf(): THREE.Object3D {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(lycheeSkinGeo(0.32, Math.PI * 0.5, Math.PI * 0.5), lycheeSkinMat()));
  const flesh = new THREE.Mesh(lycheeFleshGeo(0.29), lycheeFleshMat());
  flesh.position.y = 0.04;
  const seed = lycheeSeed(0.13);
  seed.position.y = 0.05;
  g.add(seed, flesh);
  return g;
}

/** Grappe : deux litchis sur une tige, avec une feuille */
function lycheeBunch(): THREE.Object3D {
  const g = new THREE.Group();
  const a = lychee(), b = lychee();
  a.position.set(-0.24, -0.1, 0);
  b.position.set(0.26, -0.22, 0.05);
  b.rotation.z = -0.3;
  g.add(a, b);
  g.add(stem([[-0.14, 0.52, 0], [0.05, 0.75, 0], [0.18, 0.4, 0.05]], 0.02, 0x6b4a2a));
  const l = leaf(0x2f6b2a, 0.8, 0.2);
  l.position.set(0.05, 0.75, 0);
  l.rotation.z = -1.3;
  g.add(l);
  return g;
}

/**
 * Textures de feuille (couleur avec découpe, relief), mises en cache par sorte :
 *  - menthe : ovale à pointe aiguë, bord en dents de scie, nervures creusées, limbe gaufré entre les nervures ;
 *  - lancéolée : feuille longue et fine (pêcher), dents fines.
 */
type LeafKind = "mint" | "lance";
const leafTexCache = new Map<LeafKind, { map: THREE.Texture; bump: THREE.Texture }>();
function leafTextures(kind: LeafKind = "mint") {
  const hit = leafTexCache.get(kind);
  if (hit) return hit;
  const W = kind === "mint" ? 512 : 256, Hh = kind === "mint" ? 768 : 1024;
  const teeth = kind === "mint" ? 14 : 34, toothAmp = kind === "mint" ? 0.09 : 0.035;
  const half = (yy: number) =>
    kind === "mint"
      ? Math.sin(Math.PI * Math.pow(yy, 0.72)) * (1 - 0.12 * yy) * 0.46 // ovale, large vers la base, pointe aiguë
      : Math.sin(Math.PI * Math.pow(yy, 0.85)) * 0.42;
  const yOf = (yy: number) => Hh * 0.975 - yy * Hh * 0.955;
  const outline = (g: CanvasRenderingContext2D) => {
    g.beginPath();
    const N = 400;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const side = t < 0.5 ? 1 : -1;
      const yy = t < 0.5 ? t * 2 : (1 - t) * 2;
      // dents de scie tournées vers la pointe
      const saw = yy > 0.1 && yy < 0.96 ? ((yy * teeth) % 1) : 0;
      const tooth = 1 + toothAmp * saw;
      const x = W / 2 + side * half(yy) * tooth * W;
      if (i === 0) g.moveTo(x, yOf(yy)); else g.lineTo(x, yOf(yy));
    }
    g.closePath();
  };
  // nervures : centrale + paires latérales qui remontent vers la pointe
  const pairs = kind === "mint" ? 6 : 9;
  const veinPaths: [number, number, number, number, number, number][] = [];
  for (let k = 0; k < pairs; k++) {
    const y0 = 0.08 + (k / pairs) * 0.78, y1 = Math.min(0.97, y0 + (kind === "mint" ? 0.2 : 0.12));
    for (const sd of [-1, 1]) {
      const xe = W / 2 + sd * half(y1) * W * 0.88;
      veinPaths.push([W / 2, yOf(y0), W / 2 + sd * half(y0) * W * 0.55, yOf(y0 + 0.05), xe, yOf(y1)]);
    }
  }
  const drawVeins = (g: CanvasRenderingContext2D, color: string, w: number) => {
    g.strokeStyle = color; g.lineCap = "round";
    g.lineWidth = w * 1.8;
    g.beginPath(); g.moveTo(W / 2, Hh); g.quadraticCurveTo(W / 2 + W * 0.01, Hh * 0.5, W / 2, yOf(0.985)); g.stroke();
    g.lineWidth = w;
    for (const [x0, y0, cx, cy, x1, y1] of veinPaths) { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(cx, cy, x1, y1); g.stroke(); }
  };
  // bosses du limbe : mêmes positions sur la couleur et le relief
  let seed = kind === "mint" ? 321 : 654;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const blobs = Array.from({ length: kind === "mint" ? 520 : 260 }, () => [rnd() * W, rnd() * Hh, (kind === "mint" ? 7 : 5) + rnd() * 12]);

  const cv = document.createElement("canvas"); cv.width = W; cv.height = Hh;
  const g = cv.getContext("2d")!;
  outline(g);
  const gr = g.createLinearGradient(0, Hh, 0, 0);
  if (kind === "mint") { gr.addColorStop(0, "#2a6b2a"); gr.addColorStop(0.55, "#358a34"); gr.addColorStop(1, "#47a33f"); }
  else { gr.addColorStop(0, "#2f6a24"); gr.addColorStop(1, "#4b8a2c"); }
  g.fillStyle = gr; g.fill();
  g.save(); outline(g); g.clip();
  for (const [x, y, r] of blobs) {
    const bg = g.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
    bg.addColorStop(0, "rgba(190,240,150,0.16)"); bg.addColorStop(1, "rgba(190,240,150,0)");
    g.fillStyle = bg; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  g.shadowColor = "rgba(10,40,10,0.6)"; g.shadowBlur = 6;
  drawVeins(g, "rgba(150,205,110,0.85)", kind === "mint" ? 3 : 2.2);
  g.shadowBlur = 0;
  // bord un peu plus clair
  g.lineWidth = 5; g.strokeStyle = "rgba(170,220,120,0.35)"; outline(g); g.stroke();
  g.restore();
  const map = new THREE.CanvasTexture(cv);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  // relief : nervures creusées, limbe bombé entre elles
  const bv = document.createElement("canvas"); bv.width = W; bv.height = Hh;
  const b = bv.getContext("2d")!;
  b.fillStyle = "#808080"; b.fillRect(0, 0, W, Hh);
  for (const [x, y, r] of blobs) {
    const bg = b.createRadialGradient(x, y, 0, x, y, r);
    bg.addColorStop(0, "rgba(255,255,255,0.55)"); bg.addColorStop(1, "rgba(255,255,255,0)");
    b.fillStyle = bg; b.beginPath(); b.arc(x, y, r, 0, Math.PI * 2); b.fill();
  }
  b.filter = "blur(3px)";
  drawVeins(b, "#1a1a1a", kind === "mint" ? 9 : 6);
  b.filter = "none";
  drawVeins(b, "#0a0a0a", kind === "mint" ? 4 : 3);
  const bump = new THREE.CanvasTexture(bv);
  const res = { map, bump };
  leafTexCache.set(kind, res);
  return res;
}

/** Feuille texturée : plan courbé (gouttière, cambrure, petites ondulations), découpé par la texture */
function texturedLeaf(len: number, kind: LeafKind, aspect: number): THREE.Object3D {
  const { map, bump } = leafTextures(kind);
  const w = len * aspect;
  const geo = new THREE.PlaneGeometry(w, len, 24, 36);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const u = x / (w / 2), v = y / len + 0.5;
    pos.setZ(i,
      -0.3 * w * u * u // gouttière le long de la nervure
      + 0.08 * len * Math.sin(v * Math.PI) - 0.13 * len * v * v // cambrure
      + 0.012 * len * Math.sin(u * 11 + v * 9) * Math.abs(u) // bord ondulé
      + 0.006 * len * Math.sin(u * 23) * Math.sin(v * 31),
    );
  }
  geo.translate(0, len / 2, 0); // base de la feuille à l'origine
  geo.computeVertexNormals();
  const mat = new THREE.MeshPhysicalMaterial({
    map, alphaTest: 0.5, bumpMap: bump, bumpScale: kind === "mint" ? 2.2 : 1.2,
    roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.45, sheen: 0.3, sheenColor: new THREE.Color(0xc8f0b0), side: THREE.DoubleSide,
  });
  return new THREE.Mesh(geo, mat);
}
/** Feuille de menthe */
const mintLeaf = (len: number) => texturedLeaf(len, "mint", 0.66);

/** Brin de menthe : tige, paires de feuilles opposées et croisées, petit bouquet au sommet */
function mint(): THREE.Object3D {
  const g = new THREE.Group();
  g.add(stem([[0, -0.5, 0], [0.02, 0, 0.01], [0, 0.48, 0]], 0.022, 0x4c6b2c));
  const nodes = [[-0.38, 0.52], [-0.1, 0.46], [0.16, 0.38], [0.36, 0.28], [0.48, 0.18]];
  nodes.forEach(([y, len], i) => {
    for (const side of [-1, 1]) {
      const l = mintLeaf(len);
      const holder = new THREE.Group();
      holder.position.set(0, y, 0);
      holder.rotation.y = (i % 2) * (Math.PI / 2) + (side < 0 ? Math.PI : 0); // paires croisées
      l.rotation.z = -(0.95 - i * 0.12); // la feuille s'écarte de la tige vers le haut
      l.rotation.y = 0.2;
      holder.add(l);
      g.add(holder);
    }
  });
  const tip = mintLeaf(0.16);
  tip.position.y = 0.48;
  g.add(tip);
  const wrap = new THREE.Group();
  wrap.add(g);
  wrap.userData.steady = true; // reste face à l'écran, se balance doucement
  return wrap;
}

/** Quartier d'agrume : peau grêlée et les deux faces coupées, détaillées */
function citrusWedge(skin: number, col: CitrusColors, skinMat?: THREE.Material): THREE.Object3D {
  const faceMat = citrusFaceMat(col);
  const r = 0.36;
  const g = new THREE.Group();
  const peel = new THREE.SphereGeometry(r, 48, 36, 0, Math.PI / 2);
  peel.scale(1, 1.15, 1);
  const pos = peel.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const k = 1 - 0.015 * Math.abs(Math.sin(v.x * 80) * Math.sin(v.y * 80) * Math.sin(v.z * 80)); // peau grêlée
    pos.setXYZ(i, v.x * k, v.y * k, v.z * k);
  }
  peel.computeVertexNormals();
  g.add(new THREE.Mesh(peel, skinMat ?? new THREE.MeshPhysicalMaterial({ color: skin, roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.25 })));
  // Les deux faces coupées (demi-disques)
  const f1 = new THREE.CircleGeometry(r, 48, Math.PI / 2, Math.PI);
  f1.scale(1, 1.15, 1);
  g.add(new THREE.Mesh(f1, faceMat));
  const f2 = new THREE.CircleGeometry(r, 48, -Math.PI / 2, Math.PI);
  f2.scale(1, 1.15, 1);
  const m2 = new THREE.Mesh(f2, faceMat);
  m2.rotation.y = -Math.PI / 2;
  g.add(m2);
  g.rotation.y = (-3 * Math.PI) / 4; // les deux faces coupées face à l'écran
  const wrap = new THREE.Group();
  wrap.add(g);
  wrap.userData.steady = true;
  return wrap;
}
/** Écorce de citron vert : vert profond marbré, pores plus clairs, quelques reflets jaunes */
const limeSkinMat = () =>
  new THREE.MeshPhysicalMaterial({
    map: sphereTex("lime", 512, 256, (x, y, z) => {
      const n = fbm(x * 3 + 4, y * 3, z * 3);
      const c = mixC(0x2f6e1a, 0x5a9e2c, n * 1.3 - 0.15);
      lerpC(c, 0x9fb83a, smooth(0.62, 0.85, fbm(x * 1.5, y * 1.5 + 9, z * 1.5)) * 0.45); // zones mûres plus jaunes
      lerpC(c, 0x8fc25a, dots(x, y, z, 70, 0.6, 0.32) * 0.55); // pores
      return c;
    }),
    bumpMap: lemonTextures().bump, bumpScale: 0.7,
    roughness: 0.38, clearcoat: 0.7, clearcoatRoughness: 0.2,
  });
const limeWedge = () => citrusWedge(0x3d8a22, LIME, limeSkinMat());
const bigMint = () => {
  const m = mint();
  m.scale.setScalar(1.5);
  return m;
};
const lime = () => {
  const sl = citrusSlice(LIME, limeSkinMat());
  sl.rotation.x = Math.PI / 2; // la tranche face à l'écran
  return facing(sl);
};

// ---------- Fraise ----------
// Profil en cœur (rayon, hauteur), lissé en spline : épaules larges, pointe arrondie
const STRAW_PROF = [[0, -0.47], [0.07, -0.45], [0.16, -0.37], [0.25, -0.22], [0.32, -0.05], [0.35, 0.1], [0.34, 0.22], [0.29, 0.3], [0.18, 0.345], [0.06, 0.356], [0, 0.35]];
const strawCurve = () => new THREE.SplineCurve(STRAW_PROF.map(([x, y]) => new THREE.Vector2(x, y))).getPoints(48);
/** Rayon de la fraise à une hauteur donnée */
function strawRadius(y: number, pts: THREE.Vector2[]) {
  for (let j = 0; j < pts.length - 1; j++) {
    const a = pts[j], b = pts[j + 1];
    if ((y >= a.y && y <= b.y) || (y <= a.y && y >= b.y)) return a.x + ((y - a.y) / (b.y - a.y || 1)) * (b.x - a.x);
  }
  return 0.3;
}
/** Graines (akènes) réparties en spirale régulière */
function strawSeeds(pts: THREE.Vector2[], n = 120) {
  const out: { p: THREE.Vector3; n: THREE.Vector3 }[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const y = -0.43 + t * 0.71; // de la pointe jusque sous la collerette
    const a = i * 2.39996;
    const r = strawRadius(y, pts);
    const nrm = new THREE.Vector3(Math.cos(a), 0.25 - t * 0.5, Math.sin(a)).normalize();
    out.push({ p: new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r), n: nrm });
  }
  return out;
}
/** Sépale : petite feuille pointue, base à l'origine, couchée dans le plan XZ */
function sepal(len: number, w: number, color: number) {
  const s = new THREE.Shape();
  s.moveTo(-w * 0.35, 0);
  s.quadraticCurveTo(-w, len * 0.4, 0, len);
  s.quadraticCurveTo(w, len * 0.4, w * 0.35, 0);
  s.lineTo(-w * 0.35, 0);
  const geo = new THREE.ShapeGeometry(s, 10);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    pos.setZ(i, -2.2 * x * x + 0.05 * Math.sin((y / len) * Math.PI)); // creusée en gouttière
  }
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, leafMat(color));
}
/** Collerette verte (calice) + petit pédoncule */
function strawCalyx(full = true): THREE.Object3D {
  const g = new THREE.Group();
  const n = 9;
  for (let i = 0; i < n; i++) {
    if (!full && Math.cos((i / n) * Math.PI * 2) < 0.2) continue; // fraise coupée : seulement les sépales côté peau
    const holder = new THREE.Group();
    holder.rotation.y = (i / n) * Math.PI * 2 + (i % 2) * 0.12;
    const sp = sepal(0.2 + (i % 3) * 0.035, 0.07, i % 2 ? 0x3f8f2f : 0x4fa236);
    sp.rotation.x = -Math.PI / 2 + 0.28 + (i % 3) * 0.12; // couchées, légèrement retombantes
    holder.add(sp);
    g.add(holder);
  }
  const st = stem([[0, 0, 0], [0.01, 0.1, 0.01], [0.04, 0.19, 0.02]], 0.022, 0x5f8f2c);
  g.add(st);
  g.position.y = 0.345;
  return g;
}

function strawberry(): THREE.Object3D {
  const g = new THREE.Group();
  const pts = strawCurve();
  const geo = new THREE.LatheGeometry(pts, 72);
  const seeds = strawSeeds(pts);
  // petits creux autour de chaque graine, et légère irrégularité de la forme
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const rr = Math.hypot(v.x, v.z);
    if (rr < 1e-4) continue;
    let dent = 0;
    for (const sd of seeds) {
      const d2 = v.distanceToSquared(sd.p);
      if (d2 < 0.0025) dent += 0.012 * Math.exp(-d2 / 0.0005);
    }
    const ang = Math.atan2(v.z, v.x);
    const k = 1 + 0.035 * Math.sin(ang * 3 + v.y * 4) - dent / rr;
    pos.setXYZ(i, v.x * k, v.y, v.z * k);
  }
  geo.computeVertexNormals();
  // rouge profond, plus clair vers la collerette, pointe un peu plus vive
  paint(geo, (p) => {
    const top = Math.max(0, (p.y - 0.2) / 0.15);
    return mixC(0xb0061c, 0xe2192f, (0.35 - p.y) * 1.1).lerp(C(0xf3b0a4), top * 0.75);
  });
  g.add(new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 0.9 })));

  // graines jaunes, posées à plat dans leurs creux
  const seedMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.016, 8, 6), new THREE.MeshPhysicalMaterial({ color: 0xf2cf62, roughness: 0.35, clearcoat: 0.6 }), seeds.length);
  const d = new THREE.Object3D();
  seeds.forEach((sd, i) => {
    d.position.copy(sd.p).addScaledVector(sd.n, -0.004);
    d.lookAt(d.position.clone().add(sd.n));
    d.scale.set(0.8, 1.25, 0.55);
    d.updateMatrix();
    seedMesh.setMatrixAt(i, d.matrix);
  });
  g.add(seedMesh);
  g.add(strawCalyx());
  return g;
}

/** Peau de pêche : fond jaune orangé, joue rouge marbrée et mouchetée, velours (sheen) */
const peachSkinTex = () =>
  sphereTex("peach2", 512, 256, (x, y, z) => {
    const n = fbm(x * 1.6 + 3, y * 1.6, z * 1.6);
    const c = mixC(0xf7c45c, 0xee9a34, smooth(0.2, 0.9, 0.45 - y * 0.35 + (n - 0.5) * 0.6));
    // joue rouge : grand dégradé continu, plus soutenu du côté exposé
    const blush = smooth(0.3, 0.78, 0.5 + 0.5 * x + 0.22 * y + 0.3 * (n - 0.5));
    lerpC(c, 0xd23d2c, blush);
    lerpC(c, 0xb02a28, blush * smooth(0.45, 0.8, n) * 0.6);
    // fines stries verticales dans le rouge
    const streak = vnoise(x * 38, y * 3.5, z * 38);
    lerpC(c, 0xa32525, smooth(0.62, 0.85, streak) * blush * 0.35);
    // mouchetures à la lisière de la joue
    const edge = 1 - Math.abs(blush - 0.5) * 2;
    lerpC(c, 0xc8392b, dots(x, y, z, 60, 0.6, 0.3) * edge * 0.7);
    return c;
  });
const peachSkinMat = () =>
  new THREE.MeshPhysicalMaterial({ map: peachSkinTex(), roughness: 0.78, sheen: 1, sheenColor: C(0xffe2cc), sheenRoughness: 0.55 });

/** Pêche entière : ronde, cavité à la queue, sillon marqué, petite pointe ; feuille lancéolée */
function peach(): THREE.Object3D {
  const g = new THREE.Group();
  const R = 0.45;
  const geo = new THREE.SphereGeometry(R, 96, 64);
  const pos = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const ny = v.y / R;
    let x = v.x * 1.02, y = v.y * 0.97, z = v.z;
    if (ny > 0.72) y -= (ny - 0.72) * R * 0.55 * (1 - Math.hypot(v.x, v.z) / R); // creux de la queue
    if (ny < -0.9) y -= (-0.9 - ny) * R * 0.35; // petite pointe
    if (z > 0) z -= 0.05 * Math.exp(-(x * x) / 0.0035) * (0.4 + 0.6 * (1 - ny * ny)); // sillon
    // l'un des côtés du sillon un peu plus renflé
    if (z > 0) z += 0.02 * Math.max(0, x) * 4 * (1 - ny * ny);
    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  g.add(new THREE.Mesh(geo, peachSkinMat()));
  const st = stem([[0, R * 0.8, 0], [0.01, R * 0.88, 0], [0.03, R * 0.94, 0]], 0.022, 0x5b4024);
  g.add(st);
  const l = texturedLeaf(0.62, "lance", 0.26);
  l.position.set(0.03, R * 0.92, 0);
  l.rotation.set(0.25, 0.3, -1.05);
  g.add(l);
  g.rotation.set(0.2, -0.35, 0.1); // le sillon légèrement de profil
  return g;
}

// ---------- Pomme ----------
// Profil lissé : creux marqué autour de la queue, épaules rondes, petit creux dessous
const APPLE_PROF = [[0, -0.37], [0.07, -0.4], [0.18, -0.43], [0.31, -0.37], [0.41, -0.22], [0.46, -0.02], [0.45, 0.16], [0.39, 0.3], [0.27, 0.37], [0.15, 0.35], [0.07, 0.28], [0, 0.24]];
const applePts = () => new THREE.SplineCurve(APPLE_PROF.map(([x, y]) => new THREE.Vector2(x, y))).getPoints(56);

/** Peau de pomme verte : dégradé vert → jaune, joue dorée, stries, lenticelles, roussi autour de la queue */
let appleSkinTex: THREE.Texture | null = null;
function appleSkin() {
  if (appleSkinTex) return appleSkinTex;
  const W = 1024, Hh = 512;
  const cv = document.createElement("canvas"); cv.width = W; cv.height = Hh;
  const g = cv.getContext("2d")!;
  // v (hauteur dans le profil) : 0 en bas → 1 en haut ; u : tour de la pomme
  const base = g.createLinearGradient(0, Hh, 0, 0);
  base.addColorStop(0, "#9bc53d"); base.addColorStop(0.45, "#7cbc36"); base.addColorStop(0.85, "#6aa82e"); base.addColorStop(1, "#8a8a3a");
  g.fillStyle = base; g.fillRect(0, 0, W, Hh);
  // joue dorée/rosée d'un côté
  const blush = g.createRadialGradient(W * 0.3, Hh * 0.5, 0, W * 0.3, Hh * 0.5, W * 0.28);
  blush.addColorStop(0, "rgba(232,200,70,0.55)"); blush.addColorStop(0.6, "rgba(220,160,60,0.18)"); blush.addColorStop(1, "rgba(220,160,60,0)");
  g.fillStyle = blush; g.fillRect(0, 0, W, Hh);
  let seed = 5;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  // stries verticales fines
  for (let i = 0; i < 160; i++) {
    const x = rnd() * W;
    g.strokeStyle = rnd() > 0.5 ? "rgba(255,255,200,0.07)" : "rgba(40,90,20,0.08)";
    g.lineWidth = 2 + rnd() * 5;
    g.beginPath(); g.moveTo(x, Hh * 0.1); g.bezierCurveTo(x + 10, Hh * 0.4, x - 10, Hh * 0.6, x + rnd() * 8, Hh * 0.92); g.stroke();
  }
  // lenticelles (petits points clairs)
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(240,245,200,${0.25 + rnd() * 0.35})`;
    g.beginPath(); g.ellipse(rnd() * W, Hh * (0.08 + rnd() * 0.84), 1.2 + rnd() * 1.6, 1 + rnd() * 1.2, 0, 0, Math.PI * 2); g.fill();
  }
  // roussi autour de la queue (haut du profil) et sous la pomme
  const top = g.createLinearGradient(0, 0, 0, Hh * 0.18);
  top.addColorStop(0, "rgba(120,100,40,0.75)"); top.addColorStop(1, "rgba(120,100,40,0)");
  g.fillStyle = top; g.fillRect(0, 0, W, Hh * 0.18);
  const bot = g.createLinearGradient(0, Hh, 0, Hh * 0.9);
  bot.addColorStop(0, "rgba(110,95,40,0.6)"); bot.addColorStop(1, "rgba(110,95,40,0)");
  g.fillStyle = bot; g.fillRect(0, Hh * 0.9, W, Hh * 0.1);
  appleSkinTex = new THREE.CanvasTexture(cv);
  appleSkinTex.colorSpace = THREE.SRGBColorSpace;
  appleSkinTex.wrapS = THREE.RepeatWrapping;
  appleSkinTex.anisotropy = 4;
  return appleSkinTex;
}
const appleSkinMat = () =>
  new THREE.MeshPhysicalMaterial({ map: appleSkin(), roughness: 0.38, clearcoat: 0.7, clearcoatRoughness: 0.28, sheen: 0.25, sheenColor: new THREE.Color(0xeaf5c0) });

/** Queue de pomme : fine, courbée, bout plus foncé */
function appleStem() {
  return stem([[0, 0.25, 0], [0.015, 0.36, 0.005], [0.05, 0.46, 0.01], [0.09, 0.52, 0.015]], 0.016, 0x5b3d1f);
}

function apple(): THREE.Object3D {
  const g = new THREE.Group();
  const geo = new THREE.LatheGeometry(applePts(), 96);
  // légers lobes (5 bosses vers le bas) et petite asymétrie
  const pos = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const ang = Math.atan2(v.z, v.x);
    const low = Math.max(0, -v.y) / 0.43;
    const k = 1 + 0.03 * low * Math.cos(ang * 5) + 0.025 * Math.cos(ang - 0.6);
    pos.setXYZ(i, v.x * k, v.y + 0.015 * Math.cos(ang), v.z * k);
  }
  geo.computeVertexNormals();
  g.add(new THREE.Mesh(geo, appleSkinMat()));
  g.add(appleStem());
  const l = leaf(0x4a9a35, 0.42, 0.17);
  l.position.set(0.07, 0.47, 0.01);
  l.rotation.z = -1.25;
  l.rotation.x = 0.35;
  g.add(l);
  return g;
}



// ---------- Fruits coupés : la chair face à l'écran ----------

/** Canvas → texture */
function canvasTex(size: number, draw: (g: CanvasRenderingContext2D, s: number) => void) {
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  draw(cv.getContext("2d")!, size);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
// Chair juteuse mais pas délavée : reflet discret
const fleshMat = (map: THREE.Texture) =>
  new THREE.MeshPhysicalMaterial({
    map, roughness: 0.5, clearcoat: 0.3, clearcoatRoughness: 0.35, envMapIntensity: 0.45, side: THREE.DoubleSide,
  });

/** UV d'une ShapeGeometry ramenées entre 0 et 1 */
function fitUV(geo: THREE.BufferGeometry) {
  geo.computeBoundingBox();
  const b = geo.boundingBox!;
  const uv = geo.attributes.uv;
  const pos = geo.attributes.position;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, (pos.getX(i) - b.min.x) / (b.max.x - b.min.x), (pos.getY(i) - b.min.y) / (b.max.y - b.min.y));
  }
  return geo;
}

/** Objet qui reste face à l'écran et se balance doucement */
function facing(obj: THREE.Object3D): THREE.Object3D {
  const w = new THREE.Group();
  w.add(obj);
  w.userData.steady = true;
  return w;
}

/** Demi-fruit ellipsoïdal (mangue, pêche, melon) : la face coupée regarde l'écran */
function halfEllipsoid(r: number, sx: number, sy: number, sz: number, skin: THREE.Material, face: THREE.Texture) {
  const g = new THREE.Group();
  const back = new THREE.SphereGeometry(r, 56, 40, Math.PI, Math.PI); // moitié arrière (z ≤ 0)
  back.scale(sx, sy, sz);
  g.add(new THREE.Mesh(back, skin));
  const f = new THREE.CircleGeometry(r, 64);
  f.scale(sx, sy, 1);
  g.add(new THREE.Mesh(f, fleshMat(face)));
  return facing(g);
}

/** Demi-fruit de révolution (pomme, fraise) : profil tourné + face coupée */
function halfLathe(prof: number[][], skin: THREE.Material, face: THREE.Texture) {
  const g = new THREE.Group();
  const pts = prof.map(([x, y]) => new THREE.Vector2(x, y));
  const shell = new THREE.LatheGeometry(pts, 48, Math.PI / 2, Math.PI); // moitié arrière
  g.add(new THREE.Mesh(shell, skin));
  const sh = new THREE.Shape();
  sh.moveTo(prof[0][0], prof[0][1]);
  for (const [x, y] of prof) sh.lineTo(x, y);
  for (let i = prof.length - 1; i >= 0; i--) sh.lineTo(-prof[i][0], prof[i][1]);
  g.add(new THREE.Mesh(fitUV(new THREE.ShapeGeometry(sh, 24)), fleshMat(face)));
  return facing(g);
}

// Mangue : forme en haricot, peau verte → jaune → rouge, petits points clairs
function mangoGeo() {
  const geo = new THREE.SphereGeometry(0.5, 120, 80);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i) * 1.38, y = pos.getY(i) * 0.95, z = pos.getZ(i) * 0.78;
    y += 0.2 * Math.pow(x / 0.69, 2) - 0.1; // courbe en haricot
    if (x > 0.45) y -= (x - 0.45) * 0.35; // le « bec »
    if (x < -0.3 && y > 0) y += 0.05 * ((-0.3 - x) / 0.39) * (y / 0.5); // épaule pleine côté pédoncule
    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  paint(geo, (p) => {
    const t = (p.x + 0.69) / 1.38;
    const c = t < 0.45 ? mixC(0x6f9a35, 0xe9b43c, t / 0.45) : mixC(0xe9b43c, 0xd9452c, (t - 0.45) / 0.55 + p.y * 0.4);
    const h = Math.abs(Math.sin(p.x * 91.7 + p.y * 47.3 + p.z * 13.1) * 43758.5) % 1;
    return h > 0.985 ? c.lerp(C(0xfff1c2), 0.6) : c; // lenticelles
  });
  return geo;
}
/** Peau de mangue : vert près du pédoncule et dessous, jaune doré, joue rouge rosé au soleil, lenticelles claires */
const mangoSkinTex = () =>
  sphereTex("mango2", 512, 256, (x, y, z) => {
    const t = (x + 1) / 2; // 0 : côté pédoncule, 1 : le bec
    const n = fbm(x * 1.8 + 11, y * 1.8, z * 1.8), n2 = fbm(x * 4, y * 4 + 3, z * 4);
    const c = mixC(0xe8b13a, 0xf3c853, n2);
    // vert vers le bec et sur une face, en larges zones fondues
    lerpC(c, 0x7c9c38, smooth(0.5, 0.85, t * 0.55 - z * 0.25 + (n - 0.5) * 0.9 + 0.2) * 0.85);
    // rouge rosé autour du pédoncule, fondu dans l'orangé
    const blush = smooth(0.5, 0.85, (1 - t) * 0.75 + y * 0.2 + (n - 0.5) * 0.7);
    lerpC(c, 0xe0763a, smooth(0.35, 0.6, (1 - t) * 0.75 + y * 0.2 + (n - 0.5) * 0.7) * 0.7);
    lerpC(c, 0xc43b38, blush * 0.9);
    // lenticelles : petits points clairs, discrets
    lerpC(c, 0xf6e6aa, dots(x, y, z, 75, 0.35, 0.24) * 0.3);
    return c;
  });

/** Mangue entière : forme en haricot, peau mate et légèrement cireuse, petit pédoncule */
function mango(): THREE.Object3D {
  const g = new THREE.Group();
  const geo = mangoGeo();
  geo.deleteAttribute("color");
  g.add(new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({
    map: mangoSkinTex(), roughness: 0.6, clearcoat: 0.12, clearcoatRoughness: 0.55,
    sheen: 0.3, sheenRoughness: 0.8, sheenColor: new THREE.Color(0xffe6b0), envMapIntensity: 0.75,
  })));
  const st = stem([[-0.66, 0.12, 0], [-0.7, 0.18, 0], [-0.72, 0.25, 0.01]], 0.022, 0x4f5a26);
  g.add(st);
  return g;
}
const mangoFace = () =>
  canvasTex(512, (g, S) => {
    const c = S / 2;
    g.fillStyle = "#e5a531"; g.beginPath(); g.arc(c, c, c, 0, Math.PI * 2); g.fill();
    const gr = g.createRadialGradient(c, c, 0, c, c, c * 0.95);
    gr.addColorStop(0, "#f58a00"); gr.addColorStop(1, "#ffa81f");
    g.fillStyle = gr; g.beginPath(); g.arc(c, c, c * 0.95, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(170,70,0,0.22)"; g.lineWidth = 4; // découpe en hérisson, discrète
    for (let k = -4; k <= 4; k++) {
      g.beginPath(); g.moveTo(c + k * 52, 0); g.lineTo(c + k * 52, S); g.stroke();
      g.beginPath(); g.moveTo(0, c + k * 52); g.lineTo(S, c + k * 52); g.stroke();
    }
  });
function mangoHalf(): THREE.Object3D {
  const skin = new THREE.MeshPhysicalMaterial({ color: 0xdf8a2e, roughness: 0.4, clearcoat: 0.5 });
  return halfEllipsoid(0.48, 1.3, 0.92, 0.6, skin, mangoFace());
}

// Fraise coupée en deux : bord rouge, chair rose veinée de rouge, cœur blanc
const strawberryFace = () =>
  canvasTex(512, (g, S) => {
    g.fillStyle = "#b80a22"; g.fillRect(0, 0, S, S);
    // chair : rose clair, plus rouge vers le bord
    const gr = g.createRadialGradient(S / 2, S * 0.52, S * 0.05, S / 2, S * 0.5, S * 0.46);
    gr.addColorStop(0, "#ffd9d6"); gr.addColorStop(0.55, "#f88a8f"); gr.addColorStop(0.85, "#e3313f"); gr.addColorStop(1, "#c4122a");
    g.fillStyle = gr;
    g.beginPath(); g.ellipse(S / 2, S * 0.5, S * 0.43, S * 0.47, 0, 0, Math.PI * 2); g.fill();
    // veines rouges qui partent du cœur vers les graines
    g.strokeStyle = "rgba(214,40,60,0.55)"; g.lineCap = "round";
    for (let k = 0; k < 22; k++) {
      const a = (k / 22) * Math.PI * 2;
      g.lineWidth = 3 + (k % 3);
      g.beginPath();
      g.moveTo(S / 2 + Math.cos(a) * S * 0.07, S * 0.5 + Math.sin(a) * S * 0.2);
      g.quadraticCurveTo(S / 2 + Math.cos(a + 0.15) * S * 0.25, S * 0.5 + Math.sin(a + 0.15) * S * 0.33, S / 2 + Math.cos(a) * S * 0.42, S * 0.5 + Math.sin(a) * S * 0.45);
      g.stroke();
    }
    // cœur blanc allongé
    const core = g.createRadialGradient(S / 2, S * 0.45, 0, S / 2, S * 0.45, S * 0.3);
    core.addColorStop(0, "rgba(255,248,244,0.95)"); core.addColorStop(1, "rgba(255,230,228,0)");
    g.fillStyle = core;
    g.beginPath(); g.ellipse(S / 2, S * 0.47, S * 0.09, S * 0.33, 0, 0, Math.PI * 2); g.fill();
    // graines visibles sur le pourtour
    g.fillStyle = "#f2cf62";
    for (let k = 0; k < 26; k++) {
      const a = (k / 26) * Math.PI * 2;
      g.beginPath(); g.ellipse(S / 2 + Math.cos(a) * S * 0.425, S * 0.5 + Math.sin(a) * S * 0.465, 4, 6, a, 0, Math.PI * 2); g.fill();
    }
  });
function strawberryHalf(): THREE.Object3D {
  const pts = strawCurve();
  const h = halfLathe(pts.map((p) => [p.x, p.y]), glossy(0xc20d25, 0.3), strawberryFace());
  const inner = h.children[0];
  inner.add(strawCalyx(false));
  return h;
}

// ---------- Melon (charentais) ----------
// Petit générateur déterministe pour les textures (même rendu à chaque chargement)
function melonRng(seed: number) {
  let t = seed;
  return () => ((t = (t * 16807) % 2147483647) / 2147483647);
}

/** Face coupée : écorce fine, liseré vert pâle, chair orange fibreuse, cavité aux trois loges de graines */
const melonFace = () =>
  canvasTex(1024, (g, S) => {
    const c = S / 2, r = melonRng(4242);
    // écorce + liseré
    g.fillStyle = "#4a6630"; g.beginPath(); g.arc(c, c, c, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#a9b96c"; g.beginPath(); g.arc(c, c, c * 0.972, 0, Math.PI * 2); g.fill();
    // chair : orange profond près de la cavité, plus clair et presque vert pâle sous l'écorce
    const fl = g.createRadialGradient(c, c, c * 0.36, c, c, c * 0.955);
    fl.addColorStop(0, "#d4520c");
    fl.addColorStop(0.35, "#f0701c");
    fl.addColorStop(0.72, "#ff8c2e");
    fl.addColorStop(0.9, "#f9b061");
    fl.addColorStop(1, "#d9d98e");
    g.fillStyle = fl; g.beginPath(); g.arc(c, c, c * 0.955, 0, Math.PI * 2); g.fill();
    // fibres rayonnantes de la chair
    for (let k = 0; k < 900; k++) {
      const a = r() * Math.PI * 2, r0 = c * (0.4 + r() * 0.45), len = c * (0.04 + r() * 0.1);
      g.strokeStyle = r() > 0.5 ? `rgba(255,214,150,${0.06 + r() * 0.1})` : `rgba(205,85,15,${0.05 + r() * 0.08})`;
      g.lineWidth = 1 + r() * 1.6;
      g.beginPath(); g.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0);
      g.lineTo(c + Math.cos(a) * (r0 + len), c + Math.sin(a) * (r0 + len)); g.stroke();
    }
    // reflets de jus
    for (let k = 0; k < 160; k++) {
      const a = r() * Math.PI * 2, rr = c * (0.42 + r() * 0.48);
      g.fillStyle = `rgba(255,245,225,${0.08 + r() * 0.14})`;
      g.beginPath(); g.ellipse(c + Math.cos(a) * rr, c + Math.sin(a) * rr, 2 + r() * 4, 1 + r() * 2, a, 0, Math.PI * 2); g.fill();
    }
    // cavité irrégulière en trois lobes
    const cav = (k: number) => c * (0.37 + 0.035 * Math.cos(3 * k + 0.4) + 0.012 * Math.sin(7 * k));
    g.beginPath();
    for (let i = 0; i <= 120; i++) {
      const k = (i / 120) * Math.PI * 2, rr = cav(k);
      if (i === 0) g.moveTo(c + Math.cos(k) * rr, c + Math.sin(k) * rr); else g.lineTo(c + Math.cos(k) * rr, c + Math.sin(k) * rr);
    }
    g.closePath();
    const cv = g.createRadialGradient(c, c, 0, c, c, c * 0.4);
    cv.addColorStop(0, "#b8480a"); cv.addColorStop(0.7, "#d45f14"); cv.addColorStop(1, "#e56f1e");
    g.fillStyle = cv; g.fill();
    g.save(); g.clip();
    // filaments humides de la cavité
    for (let k = 0; k < 140; k++) {
      const a = r() * Math.PI * 2, rr = c * r() * 0.36;
      g.strokeStyle = `rgba(${r() > 0.5 ? "255,190,120" : "150,55,10"},${0.15 + r() * 0.2})`;
      g.lineWidth = 1.5 + r() * 2;
      g.beginPath(); g.moveTo(c + Math.cos(a) * rr, c + Math.sin(a) * rr);
      g.quadraticCurveTo(c + Math.cos(a + 0.6) * rr * 0.6, c + Math.sin(a + 0.6) * rr * 0.6, c + Math.cos(a + 1.1) * rr * 0.9, c + Math.sin(a + 1.1) * rr * 0.9);
      g.stroke();
    }
    // graines : trois loges, graines plates crème orientées vers le centre
    for (let lobe = 0; lobe < 3; lobe++) {
      const base = 0.4 + lobe * (Math.PI * 2 / 3);
      for (let k = 0; k < 24; k++) {
        const a = base + (r() - 0.5) * 1.5, rr = c * (0.12 + r() * 0.2);
        const x = c + Math.cos(a) * rr, y = c + Math.sin(a) * rr;
        g.save(); g.translate(x, y); g.rotate(a + (r() - 0.5) * 0.6);
        g.fillStyle = "rgba(120,50,10,0.35)"; g.beginPath(); g.ellipse(2, 3, 17, 7.5, 0, 0, Math.PI * 2); g.fill(); // ombre
        const sg = g.createLinearGradient(0, -7, 0, 7);
        sg.addColorStop(0, "#fbf1d6"); sg.addColorStop(1, "#d9bf88");
        g.fillStyle = sg; g.beginPath(); g.ellipse(0, 0, 16, 7, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.ellipse(-4, -2.5, 6, 1.6, 0, 0, Math.PI * 2); g.fill();
        g.restore();
      }
    }
    g.restore();
    // ombre douce au bord de la cavité
    g.strokeStyle = "rgba(150,55,10,0.35)"; g.lineWidth = 6;
    g.beginPath();
    for (let i = 0; i <= 120; i++) {
      const k = (i / 120) * Math.PI * 2, rr = cav(k);
      if (i === 0) g.moveTo(c + Math.cos(k) * rr, c + Math.sin(k) * rr); else g.lineTo(c + Math.cos(k) * rr, c + Math.sin(k) * rr);
    }
    g.stroke();
  });

/** Écorce du charentais : vert-gris marbré, dix sillons vert foncé du pédoncule à la base */
const MELON_RIBS = 10;
const melonSkinTex = () =>
  canvasTex(1024, (g, S) => {
    const r = melonRng(777);
    g.fillStyle = "#b8bf86"; g.fillRect(0, 0, S, S);
    // marbrures
    for (let k = 0; k < 500; k++) {
      g.fillStyle = r() > 0.5 ? `rgba(150,165,95,${0.15 + r() * 0.2})` : `rgba(215,214,165,${0.15 + r() * 0.2})`;
      g.beginPath(); g.ellipse(r() * S, r() * S, 10 + r() * 40, 6 + r() * 20, r() * 3, 0, Math.PI * 2); g.fill();
    }
    // léger réseau brodé
    g.strokeStyle = "rgba(225,222,185,0.35)"; g.lineWidth = 1.5;
    for (let k = 0; k < 700; k++) {
      const x = r() * S, y = r() * S, a = r() * Math.PI;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14); g.stroke();
    }
    // sillons (u = autour du fruit)
    for (let k = 0; k < MELON_RIBS; k++) {
      const x = ((k + 0.5) / MELON_RIBS) * S; // au creux de chaque sillon
      const gr = g.createLinearGradient(x - 22, 0, x + 22, 0);
      gr.addColorStop(0, "rgba(60,95,45,0)"); gr.addColorStop(0.5, "rgba(48,82,38,0.95)"); gr.addColorStop(1, "rgba(60,95,45,0)");
      g.fillStyle = gr; g.fillRect(x - 22, 0, 44, S);
    }
  });

/** Sphère du melon creusée de dix sillons ; `phiStart`/`phiLen` pour n'en garder qu'une partie */
function melonGeo(R: number, phiStart = 0, phiLen = Math.PI * 2) {
  const geo = new THREE.SphereGeometry(R, 96, 64, phiStart, phiLen);
  const pos = geo.attributes.position, uv = geo.attributes.uv, v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const phi = phiStart + uv.getX(i) * phiLen; // angle autour de l'axe
    const d = Math.cos(phi * MELON_RIBS); // 1 au milieu d'un côte, -1 dans un sillon
    const ny = v.y / R;
    const k = 1 - 0.035 * Math.pow((1 - d) / 2, 3) * (1 - ny * ny);
    pos.setXYZ(i, v.x * k, v.y * 0.9, v.z * k);
  }
  geo.computeVertexNormals();
  return geo;
}
const melonSkinMat = () => new THREE.MeshPhysicalMaterial({ map: melonSkinTex(), roughness: 0.62, clearcoat: 0.15, clearcoatRoughness: 0.6 });

/** Melon entier, avec son pédoncule */
function melonWhole(): THREE.Object3D {
  const g = new THREE.Group();
  const R = 0.62;
  g.add(new THREE.Mesh(melonGeo(R), melonSkinMat()));
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, 0.1, 12), matte(0x6b6a3a, 0.8));
  stem.position.y = R * 0.9 + 0.02; stem.rotation.z = 0.25;
  g.add(stem);
  g.rotation.set(0.35, 0.4, -0.2);
  return g;
}

/** Demi-melon : la face coupée regarde l'écran */
function melonHalf(): THREE.Object3D {
  const g = new THREE.Group();
  const R = 0.62;
  // moitié arrière, axe du melon couché pour voir la cavité de face
  const skin = melonSkinMat();
  skin.map!.repeat.set(0.5, 1); skin.map!.offset.set(0.5, 0); // la texture suit la moitié de sphère gardée
  const back = new THREE.Mesh(melonGeo(R, Math.PI, Math.PI), skin);
  g.add(back);
  const f = new THREE.CircleGeometry(R, 96);
  f.scale(1, 0.9, 1);
  g.add(new THREE.Mesh(f, fleshMat(melonFace())));
  return facing(g);
}

/** Quartier de melon : écorce verte, liseré pâle, chair orange plus foncée vers le cœur, quelques graines */
function melonSlice(): THREE.Object3D {
  const g = new THREE.Group();
  const R = 0.85, inner = 0.46, angle = 2.2, depth = 0.24;
  const ring = (r0: number, r1: number) => {
    const sh = new THREE.Shape();
    sh.absarc(0, 0, r1, Math.PI / 2 - angle / 2, Math.PI / 2 + angle / 2, false);
    sh.absarc(0, 0, r0, Math.PI / 2 + angle / 2, Math.PI / 2 - angle / 2, true);
    return sh;
  };
  const ex = { depth, bevelEnabled: true, bevelSize: 0.022, bevelThickness: 0.022, bevelSegments: 3, curveSegments: 48 };
  const flesh = new THREE.ExtrudeGeometry(ring(R * inner, R * 0.9), ex);
  paint(flesh, (p) => {
    const t = (Math.hypot(p.x, p.y) - R * inner) / (R * (0.9 - inner));
    return t < 0.7 ? mixC(0xd9560f, 0xff8a2c, t / 0.7) : mixC(0xff8a2c, 0xe8d088, (t - 0.7) / 0.3);
  });
  g.add(new THREE.Mesh(flesh, new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.3 })));
  g.add(new THREE.Mesh(new THREE.ExtrudeGeometry(ring(R * 0.895, R * 0.94), { ...ex, bevelSize: 0.015 }), matte(0xb3c174, 0.5)));
  g.add(new THREE.Mesh(new THREE.ExtrudeGeometry(ring(R * 0.935, R), { ...ex, bevelSize: 0.018 }), matte(0x4c6a31, 0.6)));
  // graines restées accrochées au cœur
  const seedGeo = new THREE.SphereGeometry(0.035, 12, 8);
  seedGeo.scale(1, 0.4, 0.5);
  const seedMat = new THREE.MeshPhysicalMaterial({ color: 0xf2e3bd, roughness: 0.35, clearcoat: 0.6 });
  const r = melonRng(99);
  for (let k = 0; k < 7; k++) {
    const a = Math.PI / 2 + (r() - 0.5) * angle * 0.8;
    const s = new THREE.Mesh(seedGeo, seedMat);
    s.position.set(Math.cos(a) * R * inner * 0.99, Math.sin(a) * R * inner * 0.99, depth * (0.15 + r() * 0.7));
    s.rotation.z = a; s.rotation.x = r();
    g.add(s);
  }
  g.children.forEach((m) => m.position.add(new THREE.Vector3(0, -R * 0.7, -depth / 2)));
  return facing(g);
}

// Pêche coupée : chair jaune orangé, rouge autour du noyau
/** Pêche coupée : chair jaune orangé fibreuse, rouge autour du noyau, noyau brun creusé de sillons */
const peachFace = () =>
  canvasTex(1024, (g, S) => {
    const c = S / 2;
    let seed = 515;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    // peau fine
    g.fillStyle = "#c43a29"; g.beginPath(); g.arc(c, c, c, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#f2a13c"; g.beginPath(); g.arc(c, c, c * 0.975, 0, Math.PI * 2); g.fill();
    const gr = g.createRadialGradient(c, c, c * 0.28, c, c, c * 0.97);
    gr.addColorStop(0, "#c8321f"); gr.addColorStop(0.18, "#ec6a2a"); gr.addColorStop(0.42, "#ffa63a");
    gr.addColorStop(0.85, "#ffbb4d"); gr.addColorStop(1, "#f7a840");
    g.fillStyle = gr; g.beginPath(); g.arc(c, c, c * 0.97, 0, Math.PI * 2); g.fill();
    // fibres rouges qui partent du noyau
    for (let k = 0; k < 520; k++) {
      const a = rnd() * Math.PI * 2, r0 = c * (0.27 + rnd() * 0.08), len = c * (0.06 + rnd() * rnd() * 0.32);
      g.strokeStyle = `rgba(${170 + rnd() * 40},${30 + rnd() * 30},20,${0.08 + rnd() * 0.22})`;
      g.lineWidth = 1 + rnd() * 2.2;
      g.beginPath(); g.moveTo(c + Math.cos(a) * r0 * 0.9, c + Math.sin(a) * r0 * 1.2);
      g.lineTo(c + Math.cos(a + (rnd() - 0.5) * 0.1) * (r0 + len) * 0.95, c + Math.sin(a) * (r0 + len) * 1.1); g.stroke();
    }
    // brillance juteuse
    for (let k = 0; k < 300; k++) {
      const a = rnd() * Math.PI * 2, rr = c * (0.35 + rnd() * 0.58);
      g.fillStyle = `rgba(255,240,200,${0.05 + rnd() * 0.12})`;
      g.beginPath(); g.ellipse(c + Math.cos(a) * rr, c + Math.sin(a) * rr, 3 + rnd() * 7, 1 + rnd() * 2, a, 0, Math.PI * 2); g.fill();
    }
    // creux rouge sombre autour du noyau
    g.fillStyle = "#7d1b14"; g.beginPath(); g.ellipse(c, c, c * 0.27, c * 0.36, 0, 0, Math.PI * 2); g.fill();
    // noyau : ovale pointu, brun, creusé de sillons sinueux
    const pit = () => { g.beginPath(); g.ellipse(c, c, c * 0.235, c * 0.32, 0, 0, Math.PI * 2); };
    const pg = g.createRadialGradient(c - c * 0.06, c - c * 0.08, 0, c, c, c * 0.34);
    pg.addColorStop(0, "#b0643a"); pg.addColorStop(0.6, "#8a4526"); pg.addColorStop(1, "#5e2a16");
    pit(); g.fillStyle = pg; g.fill();
    g.save(); pit(); g.clip();
    for (let k = 0; k < 70; k++) {
      let x = c + (rnd() - 0.5) * c * 0.46, y = c + (rnd() - 0.5) * c * 0.64;
      g.strokeStyle = `rgba(55,22,10,${0.45 + rnd() * 0.4})`; g.lineWidth = 3 + rnd() * 5;
      g.beginPath(); g.moveTo(x, y);
      for (let q = 0; q < 4; q++) { x += (rnd() - 0.5) * 50; y += (rnd() - 0.5) * 50; g.lineTo(x, y); }
      g.stroke();
      g.strokeStyle = "rgba(220,150,100,0.25)"; g.lineWidth = 2; g.stroke();
    }
    // arête centrale du noyau
    g.strokeStyle = "rgba(60,25,12,0.8)"; g.lineWidth = 7;
    g.beginPath(); g.moveTo(c, c - c * 0.32); g.quadraticCurveTo(c + c * 0.03, c, c, c + c * 0.32); g.stroke();
    g.restore();
  });
function peachHalf(): THREE.Object3D {
  return halfEllipsoid(0.45, 1, 1, 0.95, peachSkinMat(), peachFace());
}
const peachSliceF = () => facing(slice(0xffb041, 0xe0532a, 0xc0342a, 0.6, 0.35, 2.0, 0.2));

// Pomme coupée : chair crème, trognon en étoile, pépins, fine peau verte
const appleFace = () =>
  canvasTex(512, (g, S) => {
    const c = S / 2;
    g.fillStyle = "#6fae35"; g.fillRect(0, 0, S, S);
    // chair : crème, plus claire au centre, légère oxydation dorée vers le bord
    const fl = g.createRadialGradient(c, c * 1.02, S * 0.05, c, c, S * 0.47);
    fl.addColorStop(0, "#fffbe8"); fl.addColorStop(0.7, "#f7efcc"); fl.addColorStop(0.95, "#eedfa6"); fl.addColorStop(1, "#d9e39a");
    g.fillStyle = fl;
    g.beginPath(); g.ellipse(c, c, S * 0.465, S * 0.455, 0, 0, Math.PI * 2); g.fill();
    // grain de la chair
    for (let i = 0; i < 500; i++) {
      g.fillStyle = `rgba(255,255,255,${Math.random() * 0.25})`;
      g.beginPath(); g.arc(c + (Math.random() - 0.5) * S * 0.85, c + (Math.random() - 0.5) * S * 0.85, 1 + Math.random() * 2, 0, Math.PI * 2); g.fill();
    }
    // ligne des faisceaux (anneau pointillé) autour du trognon
    g.fillStyle = "rgba(190,170,110,0.6)";
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      g.beginPath(); g.arc(c + Math.cos(a) * S * 0.2, c + Math.sin(a) * S * 0.22, 3.5, 0, Math.PI * 2); g.fill();
    }
    // trognon en étoile à 5 branches
    g.save(); g.translate(c, c);
    g.fillStyle = "rgba(225,210,160,0.9)"; g.strokeStyle = "rgba(180,160,100,0.8)"; g.lineWidth = 2.5;
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? S * 0.045 : S * 0.13;
      g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    g.closePath(); g.fill(); g.stroke();
    // pépins dans les loges
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      g.save(); g.rotate(a); g.translate(S * 0.085, 0);
      const pg = g.createLinearGradient(-12, 0, 12, 0);
      pg.addColorStop(0, "#3a2210"); pg.addColorStop(1, "#7a4a22");
      g.fillStyle = pg;
      g.beginPath(); g.moveTo(-13, 0); g.quadraticCurveTo(0, -9, 14, 0); g.quadraticCurveTo(0, 9, -13, 0); g.fill();
      g.restore();
    }
    g.restore();
    // reflet humide
    const hl = g.createRadialGradient(c * 0.75, c * 0.7, 0, c * 0.75, c * 0.7, S * 0.3);
    hl.addColorStop(0, "rgba(255,255,255,0.22)"); hl.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = hl; g.fillRect(0, 0, S, S);
  });
function appleHalf(): THREE.Object3D {
  const h = halfLathe(applePts().map((p) => [p.x, p.y]), appleSkinMat(), appleFace());
  const st = appleStem();
  st.position.z = -0.03;
  h.children[0].add(st);
  return h;
}

// Citron : ovale à deux petits bouts, peau grêlée (pores) jaune vif, verdâtre aux extrémités
let lemonTex: { map: THREE.Texture; bump: THREE.Texture } | null = null;
function lemonTextures() {
  if (lemonTex) return lemonTex;
  const W = 512, Hh = 256;
  const mk = () => { const c = document.createElement("canvas"); c.width = W; c.height = Hh; return c; };
  // couleur : v = 0 (bas) → 1 (haut), les deux bouts tirent sur le vert-jaune
  const cv = mk(), g = cv.getContext("2d")!;
  const grd = g.createLinearGradient(0, 0, 0, Hh);
  grd.addColorStop(0, "#c8c23a"); grd.addColorStop(0.12, "#f1cf22"); grd.addColorStop(0.5, "#f8d834");
  grd.addColorStop(0.88, "#f1cf22"); grd.addColorStop(1, "#bfbb36");
  g.fillStyle = grd; g.fillRect(0, 0, W, Hh);
  // reflets plus clairs et petites taches
  for (let i = 0; i < 600; i++) {
    g.fillStyle = Math.random() > 0.5 ? "rgba(255,245,170,0.25)" : "rgba(200,150,10,0.12)";
    g.beginPath(); g.arc(Math.random() * W, Math.random() * Hh, 1 + Math.random() * 2.5, 0, Math.PI * 2); g.fill();
  }
  // relief : pores (points sombres = creux)
  const bv = mk(), b = bv.getContext("2d")!;
  b.fillStyle = "#c8c8c8"; b.fillRect(0, 0, W, Hh);
  for (let i = 0; i < 5000; i++) {
    b.fillStyle = `rgba(40,40,40,${0.35 + Math.random() * 0.4})`;
    b.beginPath(); b.arc(Math.random() * W, Math.random() * Hh, 0.8 + Math.random() * 1.4, 0, Math.PI * 2); b.fill();
  }
  const map = new THREE.CanvasTexture(cv); map.colorSpace = THREE.SRGBColorSpace;
  const bump = new THREE.CanvasTexture(bv);
  [map, bump].forEach((t) => { t.wrapS = THREE.RepeatWrapping; t.anisotropy = 4; });
  lemonTex = { map, bump };
  return lemonTex;
}
function lemonDimpled(): THREE.Object3D {
  // profil lissé : petit téton en bas, corps ovale, petit téton à la queue
  const prof = [[0, -0.6], [0.035, -0.585], [0.06, -0.54], [0.12, -0.47], [0.24, -0.36], [0.33, -0.18], [0.36, 0], [0.33, 0.18], [0.24, 0.36], [0.12, 0.47], [0.07, 0.53], [0.045, 0.575], [0, 0.59]];
  const pts = new THREE.SplineCurve(prof.map(([x, y]) => new THREE.Vector2(x, y))).getPoints(64);
  const geo = new THREE.LatheGeometry(pts, 96);
  // légère asymétrie, comme un vrai fruit
  const pos = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const k = 1 + 0.03 * Math.cos(Math.atan2(v.z, v.x) * 2 + v.y * 2);
    pos.setXYZ(i, v.x * k, v.y, v.z * k * 0.96);
  }
  geo.computeVertexNormals();
  const { map, bump } = lemonTextures();
  const m = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({
    map, bumpMap: bump, bumpScale: 0.9, roughness: 0.4, clearcoat: 0.55, clearcoatRoughness: 0.3, sheen: 0.3, sheenColor: new THREE.Color(0xfff5c0),
  }));
  m.rotation.z = Math.PI / 2;
  const g = new THREE.Group();
  g.add(m);
  // petite queue verte et une feuille dentée
  const st = stem([[-0.585, 0, 0], [-0.64, 0.02, 0], [-0.68, 0.06, 0]], 0.018, 0x5f7d2a);
  g.add(st);
  const l = mintLeaf(0.42);
  l.scale.set(0.75, 1, 1);
  l.position.set(-0.64, 0.03, 0);
  l.rotation.z = 2.0;
  l.rotation.y = 0.4;
  g.add(l);
  return g;
}
const lemonWedge = () => citrusWedge(0xf2c418, LEMON);
const lemonRound = () => {
  const s = citrusSlice(LEMON);
  s.rotation.x = Math.PI / 2; // la tranche face à l'écran
  return facing(s);
};

// Thé : feuilles de thé, face à l'écran
const teaLeafF = () => facing(leaf(0x3c5a2a, 0.7, 0.26));


/** Grappe de bulles (colas) : sphères transparentes qui ne gardent que leurs reflets */
// Bulle d'air : centre transparent, liseré lumineux sur le bord et un petit reflet
const bubbleMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uTint: { value: new THREE.Color(0xffffff) } },
    vertexShader: `varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 p = vec4(position, 1.0);
        vec3 nn = normal;
        #ifdef USE_INSTANCING
          p = instanceMatrix * p; // bulles du champ (InstancedMesh)
          nn = mat3(instanceMatrix) * nn;
        #endif
        vec4 mv = modelViewMatrix * p;
        vN = normalize(normalMatrix * nn);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `uniform vec3 uTint; varying vec3 vN; varying vec3 vV;
      void main() {
        vec3 n = normalize(vN);
        float rim = pow(1.0 - abs(dot(n, normalize(vV))), 2.6);
        float spec = pow(max(dot(n, normalize(vec3(-0.45, 0.6, 0.65))), 0.0), 60.0);
        float a = clamp(rim * 0.85 + spec * 0.9 + 0.03, 0.0, 1.0);
        gl_FragColor = vec4(uTint * (0.75 + spec), a);
      }`,
  });
function bubbles(): THREE.Object3D {
  const g = new THREE.Group();
  const mat = bubbleMat();
  const n = 3 + Math.floor(Math.random() * 4);
  for (let i = 0; i < n; i++) {
    const r = 0.04 + Math.random() * 0.1;
    const b = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), mat);
    b.position.set((Math.random() - 0.5) * 0.7, (Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 0.4);
    g.add(b);
  }
  g.userData.bubble = true; // la grappe remonte vers la surface
  return g;
}


// ---------- Recettes par saveur ----------
type Recipe = {
  makers: Maker[];
  bubbles: number;
  scale?: number;
  /** Les fruits entourent la canette et tournent lentement autour d'elle */
  orbit?: boolean;
};

const RECIPES: Record<string, Recipe> = {
  cerise: { makers: [cherries, cherrySingle, cherries], bubbles: 18, scale: 1.15, orbit: true },
  mangue: { makers: [mango], bubbles: 16, scale: 1.05, orbit: true }, // uniquement des mangues entières
  lychee: { makers: [lycheeBunch, lycheePeeled, lychee, lycheeHalf, lychee], bubbles: 14, scale: 1.25 },
  mojito: { makers: [limeWedge, bigMint, limeWedge, bigMint, lime], bubbles: 20, scale: 1.15 },
  fraise: { makers: [strawberry, strawberryHalf, strawberry, strawberryHalf, strawberry], bubbles: 16, scale: 1.25, orbit: true },
  melon: { makers: [melonHalf, melonSlice, melonWhole, melonSlice, melonHalf], bubbles: 16, scale: 1.05, orbit: true },
  peche: { makers: [peach, peachHalf, peachSliceF, peach, peachHalf], bubbles: 16, scale: 1.1, orbit: true },
  pomme: { makers: [apple, appleHalf, apple, appleHalf, () => leaf(0x3f8f2c, 0.6)], bubbles: 16, scale: 1.15, orbit: true },
  lemon: { makers: [lemonDimpled, lemonWedge, lemonRound, lemonDimpled, lemonWedge], bubbles: 18, scale: 1.1, orbit: true },
  cola: { makers: [bubbles], bubbles: 70, scale: 1.2 },
  "cola-zero": { makers: [bubbles], bubbles: 70, scale: 1.2 },
  "cola-cherry": { makers: [cherries, cherrySingle, cherries, bubbles, cherries, cherrySingle], bubbles: 60, scale: 1.15 },
  "ice-tea-peche": { makers: [peachHalf, teaLeafF, peachSliceF, peach, teaLeafF, peach], bubbles: 0, scale: 1.05, orbit: true }, // sans glaçons
};

// Emplacements autour de la canette (x, y, z, échelle) : surtout derrière, deux petits devant
const SLOTS: [number, number, number, number][] = [
  [-2.5, 1.7, -2.5, 1.0],
  [2.6, 2.1, -3.2, 0.95],
  [-3.0, -1.5, -1.5, 1.05],
  [2.9, -1.7, -2.0, 1.0],
  [-1.5, 3.4, -6.0, 1.2],
  [1.5, -3.5, -5.0, 1.1],
  [4.8, 0.4, -7.0, 1.3],
  [-5.0, 0.1, -8.0, 1.3],
  [2.2, 0.8, 2.6, 0.6],
  [-2.0, -2.5, 3.0, 0.55],
];

// Couronne autour de la canette : (angle, hauteur, rayon, échelle)
const ORBIT: [number, number, number, number][] = [
  [0.3, 1.9, 2.1, 1.0], [1.1, -0.4, 2.3, 0.95], [1.9, 2.4, 2.0, 0.9], [2.6, -1.9, 2.2, 1.0],
  [3.4, 0.9, 2.3, 0.95], [4.1, -2.6, 2.0, 0.85], [4.8, 2.9, 2.2, 0.9], [5.6, -1.0, 2.1, 1.0],
  [0.8, -2.9, 3.6, 1.1], [2.3, 3.4, 3.8, 1.1], [3.9, -3.3, 4.2, 1.15], [5.2, 3.6, 4.0, 1.1],
];

/** Plein écran (accueil) : les fruits sont semés sur toute la largeur, en profondeur,
 *  en laissant dégagée la colonne de la canette du centre. w, h = demi-largeur/hauteur visibles. */
function fieldSlots(w: number, h: number): [number, number, number, number][] {
  // Semis en vrac (aucun alignement) : points tirés au hasard sur les côtés, avec un écart minimal entre eux
  let seed = 9173;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const out: [number, number, number, number][] = [];
  const gap = w * 0.3; // colonne centrale laissée libre (canette, nom)
  const target = w > h * 1.2 ? 20 : 14;
  for (let tries = 0; out.length < target && tries < 2000; tries++) {
    const side = rnd() < 0.5 ? -1 : 1;
    const x = side * (gap + rnd() * (w * 0.98 - gap));
    const y = (rnd() * 2 - 1) * h * 0.92;
    const minD = 2.3 + rnd() * 0.7;
    if (out.some(([px, py]) => Math.hypot(px - x, py - y) < minD)) continue;
    // tous derrière la couronne de canettes, à des profondeurs variées
    const z = -4.6 - rnd() * 4.2;
    const s = (0.95 + rnd() * 0.75) * 2.15; // fruits bien visibles
    out.push([x, y, z, s]);
  }
  return out;
}

/** Référence au créateur de grappes (le nom « bubbles » est repris plus bas dans buildUniverse) */
const bubbleCluster: Maker = bubbles;

const easeInOut = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

/** Champ de bulles fines qui montent en continu (accueil) : il ne change pas avec la saveur */
export function buildBubbleField(w: number, h: number, n = 70) {
  const data = Array.from({ length: n }, (_, i) => ({
    x: (((i * 0.37) % 1) * 2 - 1) * w,
    y: (((i * 0.61) % 1) * 2 - 1) * h,
    z: -1 - ((i * 0.29) % 1) * 6,
    // une bulle sur cinq est plus grosse, comme les grappes des colas
    r: i % 5 === 0 ? 0.07 + ((i * 0.43) % 1) * 0.07 : 0.014 + ((i * 0.43) % 1) * 0.03,
    v: 0.6 + ((i * 0.53) % 1) * 0.8,
  }));
  const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 20, 14), bubbleMat(), n);
  mesh.frustumCulled = false;
  const d = new THREE.Object3D();
  return {
    mesh,
    update(dt: number, t: number, mouse: THREE.Vector2, still: boolean) {
      data.forEach((b, i) => {
        if (!still) {
          b.y += b.v * dt;
          if (b.y > h) b.y = -h;
        }
        // ondulation latérale, et les bulles grossissent un peu en approchant de la surface
        const grow = 0.7 + 0.5 * ((b.y + h) / (2 * h));
        const born = Math.min(1, (b.y + h) / 0.6); // apparition douce en bas
        d.position.set(b.x + Math.sin(t * 1.8 + i * 1.3) * 0.09 - mouse.x * 0.3, b.y, b.z);
        d.scale.setScalar(b.r * grow * born);
        d.updateMatrix();
        mesh.setMatrixAt(i, d.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    },
    dispose() {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    },
  };
}

// Cartes de la boutique : 4 fruits seulement, en gros plan dans les coins, la canette reste dégagée au centre
const CARD_SLOTS: [number, number, number, number][] = [
  [-2.6, 1.95, 3.6, 2.35],
  [2.65, -1.85, 4.2, 2.45],
  [2.9, 2.25, 1.6, 1.75],
  [-2.95, -2.15, 2.4, 2.0],
];

// Réglages propres à certaines saveurs (la grappe de litchis, plus large, est rentrée dans la carte)
const CARD_SLOTS_BY: Record<string, [number, number, number, number][]> = {
  lychee: [
    [-1.95, 1.45, 2.8, 1.75],
    [2.65, -1.85, 4.2, 2.45],
    [2.9, 2.25, 1.6, 1.75],
    [-2.95, -2.15, 2.4, 2.0],
  ],
};

export function buildUniverse(slug: string, field?: { w: number; h: number }, card = false) {
  const base = RECIPES[slug] ?? RECIPES.cerise;
  // accueil : les bulles fines sont un champ à part, permanent (voir buildBubbleField)
  // sur l'accueil, toutes les bulles (fines et grappes) vivent dans le champ permanent : elles restent pendant les transitions
  const recipe: Recipe = field ? { ...base, orbit: false, bubbles: 0 } : card ? { ...base, orbit: false, bubbles: Math.round(base.bubbles * 0.35) } : base;
  const slots: [number, number, number, number][] = field
    ? fieldSlots(field.w, field.h)
    : card
      ? (CARD_SLOTS_BY[slug] ?? CARD_SLOTS)
    : recipe.orbit
      ? ORBIT.map(([a, y, r, s]) => [Math.cos(a) * r, y, Math.sin(a) * r, s])
      : SLOTS;
  const BW = field ? field.w : 4.5, BH = field ? field.h + 0.5 : 4.5;
  const group = new THREE.Group();
  let enter = field ? 0 : 1;
  const items: { obj: THREE.Object3D; base: THREE.Vector3; spin: THREE.Vector3; phase: number; depth: number; steady: boolean; rx: number; ry: number; rz: number; rise: number; speed: number }[] = [];

  slots.forEach(([x, y, z, s], i) => {
    const maker = recipe.makers[i % recipe.makers.length];
    if (field && maker === bubbleCluster) return; // accueil : ces bulles-là sont dans le champ permanent
    // accueil : mangues entières plutôt que des moitiés vues de face (elles ressemblaient à des disques)
    const obj = field && maker === mangoHalf ? mango() : maker();
    obj.scale.setScalar(s * (recipe.scale ?? 1) * (0.9 + ((i * 37) % 10) / 50));
    const steady = !!obj.userData.steady;
    if (steady) obj.rotation.set(0.25 * Math.sin(i * 1.7), 0.35 * Math.cos(i * 1.3), 0.5 * Math.sin(i * 2.3));
    else obj.rotation.set(i * 1.3, i * 2.1, i * 0.7);
    obj.position.set(x, y, z);
    group.add(obj);
    items.push({
      obj,
      base: new THREE.Vector3(x, y, z),
      spin: new THREE.Vector3(0.05 + (i % 3) * 0.04, 0.08 + (i % 4) * 0.03, 0.03),
      phase: i * 1.7,
      depth: 1 + z * 0.09, // les objets proches bougent plus que les lointains
      steady,
      rx: obj.rotation.x,
      ry: obj.rotation.y,
      rz: obj.rotation.z,
      rise: 0,
      speed: obj.userData.bubble ? 0.55 + ((i * 0.37) % 1) * 0.6 : 0,
    });
  });

  // Bulles fines qui montent (boissons pétillantes)
  const nb = recipe.bubbles;
  const bubbleData = Array.from({ length: nb }, (_, i) => ({
    x: (((i * 0.37) % 1) * 2 - 1) * BW,
    y: (((i * 0.61) % 1) * 2 - 1) * BH,
    z: -1 - ((i * 0.29) % 1) * 6,
    r: 0.03 + ((i * 0.43) % 1) * 0.06,
    v: 0.25 + ((i * 0.53) % 1) * 0.35,
  }));
  const bubbles = nb
    ? new THREE.InstancedMesh(
        new THREE.SphereGeometry(1, 20, 14),
        bubbleMat(),
        nb
      )
    : null;
  if (bubbles) group.add(bubbles);
  const d = new THREE.Object3D();

  return {
    group,
    /** dt en secondes, t temps total, mouse en -1..1 */
    update(dt: number, t: number, mouse: THREE.Vector2, still: boolean) {
      for (const it of items) {
        if (it.steady) {
          const w = still ? 0 : 1;
          it.obj.rotation.set(
            it.rx + w * 0.22 * Math.sin(t * 0.5 + it.phase),
            it.ry + w * 0.35 * Math.sin(t * 0.35 + it.phase),
            it.rz + w * 0.12 * Math.sin(t * 0.4 + it.phase)
          );
        } else if (!still) {
          it.obj.rotation.x += it.spin.x * dt;
          it.obj.rotation.y += it.spin.y * dt;
        }
        const bob = still ? 0 : Math.sin(t * 0.6 + it.phase) * 0.12;
        let bx = it.base.x, bz = it.base.z;
        if (recipe.orbit) {
          // rotation lente autour de la canette ; la souris l'accompagne
          const a = (still ? 0 : t * 0.12) + mouse.x * 0.5;
          const ca = Math.cos(a), sa = Math.sin(a);
          bx = it.base.x * ca - it.base.z * sa;
          bz = it.base.x * sa + it.base.z * ca;
          it.obj.position.set(bx, it.base.y + bob + mouse.y * 0.25, bz);
          continue;
        }
        // grappes de bulles : elles remontent sans cesse, en ondulant, et repartent du bas
        if (it.speed) {
          if (!still) it.rise += it.speed * dt;
          const span = BH * 2 + 1.5;
          const yy = (((it.base.y + it.rise + BH + 0.75) % span) + span) % span - BH - 0.75;
          const wob = still ? 0 : Math.sin(t * 1.6 + it.phase) * 0.12;
          const slideB = field ? Math.sign(it.base.x || 1) * (1 - easeInOut(enter)) * field.w * 1.5 : 0;
          it.obj.position.set(bx + wob - mouse.x * 0.45 * it.depth + slideB, yy, bz);
          continue;
        }
        // entrée / sortie par les côtés de l'écran (accueil)
        const slide = field ? Math.sign(it.base.x || 1) * (1 - easeInOut(enter)) * field.w * 1.5 : 0;
        it.obj.position.set(
          bx - mouse.x * 0.45 * it.depth + slide,
          it.base.y + bob + mouse.y * 0.3 * it.depth,
          bz
        );
      }
      if (bubbles) {
        bubbleData.forEach((b, i) => {
          if (!still) {
            b.y += b.v * dt;
            if (b.y > BH) b.y = -BH;
          }
          d.position.set(b.x + Math.sin(t + i) * 0.05 - mouse.x * 0.3, b.y, b.z);
          d.scale.setScalar(b.r);
          d.updateMatrix();
          bubbles.setMatrixAt(i, d.matrix);
        });
        bubbles.instanceMatrix.needsUpdate = true;
      }
    },
    /** 0 = fruits hors de l'écran, sur les côtés ; 1 = en place */
    setEnter(v: number) {
      enter = v;
    },
    dispose() {
      group.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        mats.forEach((mat) => {
          (mat as THREE.MeshStandardMaterial).map?.dispose();
          mat.dispose();
        });
      });
    },
  };
}
