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

/** Rondelle d'agrume : écorce, peau blanche et quartiers dessinés */
function citrusSlice(rind: string, pith: string, flesh: string, line: string): THREE.Object3D {
  const size = 256;
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const g = cv.getContext("2d")!;
  const c = size / 2;
  g.fillStyle = rind;
  g.beginPath(); g.arc(c, c, c, 0, Math.PI * 2); g.fill();
  g.fillStyle = pith;
  g.beginPath(); g.arc(c, c, c * 0.9, 0, Math.PI * 2); g.fill();
  const n = 10;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2 + 0.04, a1 = ((i + 1) / n) * Math.PI * 2 - 0.04;
    g.fillStyle = flesh;
    g.beginPath(); g.moveTo(c, c); g.arc(c, c, c * 0.84, a0, a1); g.closePath(); g.fill();
  }
  g.strokeStyle = line;
  g.lineWidth = 3;
  g.beginPath(); g.arc(c, c, c * 0.08, 0, Math.PI * 2); g.stroke();
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const face = new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.2 });
  const side = matte(new THREE.Color(rind).getHex(), 0.5);
  return new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.07, 48), [side, face, face]);
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
function cherries(): THREE.Object3D {
  const g = new THREE.Group();
  const mat = glossy(0x7a0c1a, 0.22);
  for (const sx of [-0.2, 0.22]) {
    const geo = new THREE.SphereGeometry(0.3, 40, 28);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      if (y > 0.2) pos.setY(i, y - (y - 0.2) * 0.6); // petit creux à l'attache
    }
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat);
    m.position.set(sx, sx > 0 ? -0.08 : 0, 0);
    g.add(m);
  }
  g.add(stem([[-0.2, 0.2, 0], [-0.12, 0.6, 0], [0.02, 0.95, 0]]));
  g.add(stem([[0.22, 0.12, 0], [0.18, 0.55, 0], [0.02, 0.95, 0]]));
  const l = leaf(0x3b7f2a, 0.5, 0.18);
  l.position.set(0.02, 0.95, 0);
  l.rotation.z = -1.1;
  g.add(l);
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

/** Peau de litchi : petites écailles en pointe, rouge framboise, sillons plus sombres */
function lycheeSkinGeo(r = 0.32, thetaStart = 0, thetaLength = Math.PI) {
  const geo = new THREE.SphereGeometry(r, 112, 84, 0, Math.PI * 2, thetaStart, thetaLength);
  const cells = spherePoints(260);
  const pos = geo.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const v = new THREE.Vector3(), n = new THREE.Vector3();
  const crease = C(0x6e0f1f), red = C(0xc0283d), tip = C(0xe86a72);
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    n.copy(v).normalize();
    let d1 = 9, d2 = 9;
    for (const c of cells) {
      const d = n.distanceToSquared(c);
      if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
    }
    const e = Math.sqrt(d2) - Math.sqrt(d1); // 0 sur les sillons, grand au centre des écailles
    const bump = Math.min(1, e / 0.11);
    const peak = Math.pow(Math.max(0, 1 - Math.sqrt(d1) / 0.09), 3); // pointe au centre
    v.copy(n).multiplyScalar(r * (1 + 0.035 * bump + 0.025 * peak));
    v.y *= 1.1; // légèrement ovale
    if (v.y < 0) v.y *= 1 + 0.08 * (-v.y / r); // base un peu en pointe
    pos.setXYZ(i, v.x, v.y, v.z);
    const c = crease.clone().lerp(red, bump).lerp(tip, peak * 0.6);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();
  return geo;
}
const lycheeSkinMat = () => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.72 });
const lycheeFleshMat = () =>
  new THREE.MeshPhysicalMaterial({
    color: 0xf7f2ea, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05,
    transmission: 0.45, thickness: 0.5, ior: 1.36, attenuationColor: new THREE.Color(0xefe6d6), attenuationDistance: 0.6,
  });

function lychee(): THREE.Object3D {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(lycheeSkinGeo(), lycheeSkinMat()));
  g.add(stem([[0, 0.34, 0], [0.03, 0.48, 0], [0.1, 0.62, 0.02]], 0.022, 0x6b4a2a));
  return g;
}

/** Litchi épluché : chair blanche nacrée, translucide */
function lycheePeeled(): THREE.Object3D {
  const geo = new THREE.SphereGeometry(0.28, 48, 36);
  geo.scale(1, 1.12, 1);
  return new THREE.Mesh(geo, lycheeFleshMat());
}

/** Litchi à moitié épluché : la peau garde le bas, la chair sort par le haut */
function lycheeHalf(): THREE.Object3D {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(lycheeSkinGeo(0.32, Math.PI * 0.5, Math.PI * 0.5), lycheeSkinMat()));
  const flesh = new THREE.SphereGeometry(0.29, 48, 36);
  flesh.scale(1, 1.12, 1);
  const m = new THREE.Mesh(flesh, lycheeFleshMat());
  m.position.y = 0.04;
  g.add(m);
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

/** Brin de menthe : une tige et des paires de feuilles opposées */
function mint(): THREE.Object3D {
  const g = new THREE.Group();
  g.add(stem([[0, -0.45, 0], [0.02, 0, 0], [0, 0.45, 0]], 0.018, 0x3f7a35));
  const pairs = [[-0.3, 0.62], [0.02, 0.52], [0.3, 0.4]];
  pairs.forEach(([y, len], i) => {
    for (const side of [-1, 1]) {
      const l = leaf(i === 2 ? 0x6cc46a : 0x4aa552, len, len * 0.45);
      l.position.set(0, y, 0);
      l.rotation.z = side * (1.05 - i * 0.15) + Math.PI; // les feuilles s'ouvrent vers le haut
      l.rotation.x = (i % 2 ? 0.25 : -0.25);
      g.add(l);
    }
  });
  g.rotation.z = Math.PI; // remet le brin à l'endroit
  const wrap = new THREE.Group();
  wrap.add(g);
  wrap.userData.steady = true; // reste face à l'écran, se balance doucement
  return wrap;
}

/** Quartier de citron vert : peau, chair et quartiers visibles sur les faces coupées */
function citrusWedge(skin: number, rind: string, pith: string, flesh: string): THREE.Object3D {
  const size = 256, c = size / 2;
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const g2 = cv.getContext("2d")!;
  g2.fillStyle = rind; g2.beginPath(); g2.arc(c, c, c, 0, Math.PI * 2); g2.fill();
  g2.fillStyle = pith; g2.beginPath(); g2.arc(c, c, c * 0.88, 0, Math.PI * 2); g2.fill();
  for (let i = 0; i < 10; i++) {
    const a0 = (i / 10) * Math.PI * 2 + 0.05, a1 = ((i + 1) / 10) * Math.PI * 2 - 0.05;
    g2.fillStyle = flesh; g2.beginPath(); g2.moveTo(c, c); g2.arc(c, c, c * 0.82, a0, a1); g2.closePath(); g2.fill();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const faceMat = new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.15, side: THREE.DoubleSide });
  const r = 0.36;
  const g = new THREE.Group();
  const peel = new THREE.SphereGeometry(r, 40, 30, 0, Math.PI / 2);
  peel.scale(1, 1.15, 1);
  g.add(new THREE.Mesh(peel, new THREE.MeshPhysicalMaterial({ color: skin, roughness: 0.45, clearcoat: 0.5 })));
  // Les deux faces coupées (demi-disques)
  const f1 = new THREE.CircleGeometry(r, 32, Math.PI / 2, Math.PI);
  f1.scale(1, 1.15, 1);
  g.add(new THREE.Mesh(f1, faceMat));
  const f2 = new THREE.CircleGeometry(r, 32, -Math.PI / 2, Math.PI);
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
const limeWedge = () => citrusWedge(0x3f8a24, "#3f8a24", "#e8f2cc", "#b9de62");
const bigMint = () => {
  const m = mint();
  m.scale.setScalar(1.5);
  return m;
};
const lime = () => citrusSlice("#4a8f2a", "#e9f3cf", "#bfe06a", "#e9f3cf");

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

function melonBall(): THREE.Object3D {
  return new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 24), glossy(0xff9440, 0.3));
}

function peach(): THREE.Object3D {
  const g = new THREE.Group();
  const geo = new THREE.SphereGeometry(0.45, 56, 40);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    if (z > 0) pos.setZ(i, z - 0.05 * Math.exp(-(x * x) / 0.004)); // le sillon
  }
  geo.computeVertexNormals();
  paint(geo, (p) => mixC(0xf5b456, 0xd2432f, 0.5 + p.x * 0.9 + p.y * 0.6));
  g.add(new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.7, sheen: 1, sheenColor: C(0xffd8bf), sheenRoughness: 0.8 })));
  const l = leaf(0x3f7f2a, 0.5, 0.18);
  l.position.set(0.04, 0.45, 0);
  l.rotation.z = -1.0;
  g.add(l);
  return g;
}

function apple(): THREE.Object3D {
  const g = new THREE.Group();
  const prof = [[0, -0.36], [0.16, -0.42], [0.36, -0.28], [0.45, -0.02], [0.42, 0.22], [0.26, 0.36], [0.1, 0.32], [0, 0.25]];
  const geo = new THREE.LatheGeometry(prof.map(([x, y]) => new THREE.Vector2(x, y)), 56);
  paint(geo, (p) => mixC(0x6fb43a, 0xb9d257, (p.y + 0.4) / 0.9 + p.x * 0.3));
  g.add(new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.3, clearcoat: 0.8 })));
  g.add(stem([[0, 0.26, 0], [0.02, 0.4, 0], [0.06, 0.5, 0]], 0.022, 0x5a3f22));
  const l = leaf(0x3f8f2c, 0.36, 0.14);
  l.position.set(0.05, 0.45, 0);
  l.rotation.z = -1.2;
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
  const geo = new THREE.SphereGeometry(0.5, 72, 52);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i) * 1.38, y = pos.getY(i) * 0.95, z = pos.getZ(i) * 0.78;
    y += 0.2 * Math.pow(x / 0.69, 2) - 0.1; // courbe en haricot
    if (x > 0.45) y -= (x - 0.45) * 0.35; // le « bec »
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
function mango(): THREE.Object3D {
  return new THREE.Mesh(mangoGeo(), new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.38, clearcoat: 0.5 }));
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

// Melon : demi-melon avec ses graines, écorce brodée
const melonFace = () =>
  canvasTex(512, (g, S) => {
    const c = S / 2;
    g.fillStyle = "#9da06a"; g.beginPath(); g.arc(c, c, c, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#e7e3a8"; g.beginPath(); g.arc(c, c, c * 0.93, 0, Math.PI * 2); g.fill();
    const gr = g.createRadialGradient(c, c, c * 0.3, c, c, c * 0.88);
    gr.addColorStop(0, "#ff8c2e"); gr.addColorStop(1, "#ffb15e");
    g.fillStyle = gr; g.beginPath(); g.arc(c, c, c * 0.88, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#f08a35"; g.beginPath(); g.arc(c, c, c * 0.38, 0, Math.PI * 2); g.fill(); // cavité
    g.fillStyle = "#f5e6c0";
    for (let k = 0; k < 26; k++) {
      const a = k * 2.4, r = c * (0.12 + (k % 5) * 0.05);
      g.save(); g.translate(c + Math.cos(a) * r, c + Math.sin(a) * r); g.rotate(a);
      g.beginPath(); g.ellipse(0, 0, 13, 6, 0, 0, Math.PI * 2); g.fill(); g.restore();
    }
  });
const melonSkinTex = () =>
  canvasTex(512, (g, S) => {
    g.fillStyle = "#a9a46a"; g.fillRect(0, 0, S, S);
    g.strokeStyle = "rgba(235,228,190,0.8)"; g.lineWidth = 3; // réseau brodé du cantaloup
    for (let k = 0; k < 420; k++) {
      const x = (k * 97.3) % S, y = (k * 57.1) % S, a = k * 1.7;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 26, y + Math.sin(a) * 26); g.stroke();
    }
  });
function melonHalf(): THREE.Object3D {
  const skin = new THREE.MeshStandardMaterial({ map: melonSkinTex(), roughness: 0.8 });
  return halfEllipsoid(0.62, 1, 0.95, 1, skin, melonFace());
}
const melonSlice = () => facing(slice(0xff8a2a, 0xffc98f, 0x8f9a55));

// Pêche coupée : chair jaune orangé, rouge autour du noyau
const peachFace = () =>
  canvasTex(512, (g, S) => {
    const c = S / 2;
    g.fillStyle = "#d2432f"; g.beginPath(); g.arc(c, c, c, 0, Math.PI * 2); g.fill();
    const gr = g.createRadialGradient(c, c, c * 0.25, c, c, c * 0.95);
    gr.addColorStop(0, "#e2512f"); gr.addColorStop(0.35, "#ffad3a"); gr.addColorStop(1, "#ffc75e");
    g.fillStyle = gr; g.beginPath(); g.arc(c, c, c * 0.95, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#7a3a1e"; g.beginPath(); g.ellipse(c, c, c * 0.24, c * 0.32, 0, 0, Math.PI * 2); g.fill(); // noyau
    g.strokeStyle = "rgba(60,25,10,0.7)"; g.lineWidth = 5;
    for (let k = 0; k < 7; k++) {
      g.beginPath(); g.moveTo(c - c * 0.16, c - c * 0.25 + k * c * 0.08); g.quadraticCurveTo(c, c - c * 0.22 + k * c * 0.08, c + c * 0.16, c - c * 0.25 + k * c * 0.08); g.stroke();
    }
  });
function peachHalf(): THREE.Object3D {
  const skin = new THREE.MeshPhysicalMaterial({ color: 0xe0703a, roughness: 0.7, sheen: 1, sheenColor: C(0xffd8bf), sheenRoughness: 0.8 });
  return halfEllipsoid(0.45, 1, 1, 0.95, skin, peachFace());
}
const peachSliceF = () => facing(slice(0xffa938, 0xffd27a, 0xc8382c, 0.6, 0.35, 2.0, 0.2));

// Pomme coupée : chair crème, trognon en étoile et pépins
const appleProf = [[0, -0.36], [0.16, -0.42], [0.36, -0.28], [0.45, -0.02], [0.42, 0.22], [0.26, 0.36], [0.1, 0.32], [0, 0.25]];
const appleFace = () =>
  canvasTex(512, (g, S) => {
    g.fillStyle = "#6fb43a"; g.fillRect(0, 0, S, S);
    g.fillStyle = "#f6f0d2";
    g.beginPath(); g.ellipse(S / 2, S * 0.5, S * 0.47, S * 0.45, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(200,190,140,0.6)"; g.lineWidth = 4;
    g.beginPath(); g.ellipse(S / 2, S * 0.5, S * 0.17, S * 0.22, 0, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "#5a3a1e"; // pépins
    for (const [dx, dy, a] of [[-0.06, -0.05, 0.4], [0.06, -0.05, -0.4], [-0.05, 0.07, -0.4], [0.05, 0.07, 0.4]]) {
      g.save(); g.translate(S / 2 + dx * S, S * 0.5 + dy * S); g.rotate(a);
      g.beginPath(); g.ellipse(0, 0, 10, 18, 0, 0, Math.PI * 2); g.fill(); g.restore();
    }
    g.strokeStyle = "rgba(140,120,70,0.6)"; g.lineWidth = 5;
    g.beginPath(); g.moveTo(S / 2, S * 0.08); g.lineTo(S / 2, S * 0.3); g.stroke();
  });
function appleHalf(): THREE.Object3D {
  const h = halfLathe(appleProf, new THREE.MeshPhysicalMaterial({ color: 0x7cc243, roughness: 0.3, clearcoat: 0.8 }), appleFace());
  h.children[0].add(stem([[0, 0.26, -0.02], [0.02, 0.4, -0.02], [0.06, 0.5, -0.02]], 0.022, 0x5a3f22));
  return h;
}

// Citron : peau légèrement grêlée, quartiers et rondelles tournés vers l'écran
function lemonDimpled(): THREE.Object3D {
  const prof = [[0, -0.55], [0.06, -0.47], [0.28, -0.3], [0.35, 0], [0.28, 0.3], [0.06, 0.47], [0, 0.55]];
  const geo = new THREE.LatheGeometry(prof.map(([x, y]) => new THREE.Vector2(x, y)), 64);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = Math.sin(v.x * 70) * Math.sin(v.y * 70) * Math.sin(v.z * 70);
    const k = 1 - 0.012 * Math.abs(n);
    pos.setXYZ(i, v.x * k, v.y, v.z * k);
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: 0xf3cf2a, roughness: 0.42, clearcoat: 0.5 }));
  m.rotation.z = Math.PI / 2;
  const g = new THREE.Group();
  g.add(m);
  const l = leaf(0x3d7f2c, 0.45, 0.16);
  l.position.set(-0.55, 0.05, 0);
  l.rotation.z = 2.2;
  g.add(l);
  return g;
}
const lemonWedge = () => citrusWedge(0xf1c40f, "#f1c40f", "#fbf3cf", "#f8dc4d");
const lemonRound = () => {
  const s = citrusSlice("#f1c40f", "#fbf3cf", "#f8dc4d", "#fbf3cf");
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
  cerise: { makers: [cherries], bubbles: 18, scale: 1.15, orbit: true },
  mangue: { makers: [mango, mangoHalf, mangoCubes, mango, mangoHalf, () => leaf(0x3d7f2c, 0.8)], bubbles: 16, scale: 1.05, orbit: true },
  lychee: { makers: [lycheeBunch, lycheePeeled, lychee, lycheeHalf, lychee], bubbles: 14, scale: 1.25 },
  mojito: { makers: [limeWedge, bigMint, limeWedge, bigMint, lime], bubbles: 20, scale: 1.15 },
  fraise: { makers: [strawberry, strawberryHalf, strawberry, strawberryHalf, strawberry], bubbles: 16, scale: 1.25, orbit: true },
  melon: { makers: [melonHalf, melonSlice, melonBall, melonSlice, melonBall], bubbles: 16, scale: 1.05, orbit: true },
  peche: { makers: [peach, peachHalf, peachSliceF, peach, peachHalf], bubbles: 16, scale: 1.1, orbit: true },
  pomme: { makers: [apple, appleHalf, apple, appleHalf, () => leaf(0x3f8f2c, 0.6)], bubbles: 16, scale: 1.15, orbit: true },
  lemon: { makers: [lemonDimpled, lemonWedge, lemonRound, lemonDimpled, lemonWedge], bubbles: 18, scale: 1.1, orbit: true },
  cola: { makers: [bubbles], bubbles: 70, scale: 1.2 },
  "cola-zero": { makers: [bubbles], bubbles: 70, scale: 1.2 },
  "cola-cherry": { makers: [cherries, bubbles, cherries, bubbles], bubbles: 60, scale: 1.15 },
  "ice-tea-peche": { makers: [peachHalf, teaLeafF, peachSliceF, ice, teaLeafF, peach], bubbles: 0, scale: 1.05, orbit: true },
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
  const out: [number, number, number, number][] = [];
  const cols = w > h * 1.2 ? 6 : 4, rows = 4;
  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++, i++) {
      const u = ((c + 0.5) / cols) * 2 - 1, v = ((r + 0.5) / rows) * 2 - 1;
      const j1 = ((i * 0.618) % 1) - 0.5, j2 = ((i * 0.381) % 1) - 0.5;
      const x = (u + (j1 * 0.9) / cols) * w * 0.95;
      const y = (v + (j2 * 0.8) / rows) * h * 0.9;
      const z = ((i * 0.7548) % 1) * 4.5 - 3.5; // -3,5 … +1
      // les fruits restent sur les côtés : la colonne centrale (canette, nom) est laissée libre
      const gap = w * 0.3;
      const sx = Math.sign(x || (i % 2 ? 1 : -1)) * (gap + Math.abs(x) * (1 - gap / (w * 0.95)));
      out.push([sx, y, z, 0.95 + ((i * 0.45) % 1) * 0.5]);
    }
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

export function buildUniverse(slug: string, field?: { w: number; h: number }) {
  const base = RECIPES[slug] ?? RECIPES.cerise;
  // accueil : les bulles fines sont un champ à part, permanent (voir buildBubbleField)
  // sur l'accueil, toutes les bulles (fines et grappes) vivent dans le champ permanent : elles restent pendant les transitions
  const recipe: Recipe = field ? { ...base, orbit: false, bubbles: 0 } : base;
  const slots: [number, number, number, number][] = field
    ? fieldSlots(field.w, field.h)
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
    const obj = maker();
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
