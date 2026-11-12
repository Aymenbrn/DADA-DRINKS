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

function mango(): THREE.Object3D {
  const geo = new THREE.SphereGeometry(0.55, 48, 32);
  geo.scale(1.3, 0.85, 0.78);
  paint(geo, (p) => (p.x < 0 ? mixC(0x8aa83a, 0xf2b33d, (p.x + 0.7) / 0.7) : mixC(0xf2b33d, 0xe5532b, p.x / 0.6)));
  return new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.42, clearcoat: 0.4 }));
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
  const pairs = [[-0.3, 0.5], [0.0, 0.42], [0.28, 0.32]];
  pairs.forEach(([y, len], i) => {
    for (const side of [-1, 1]) {
      const l = leaf(i === 2 ? 0x6cc46a : 0x4aa552, len, len * 0.42);
      l.position.set(0, y, 0);
      l.rotation.z = side * 1.0;
      l.rotation.y = i * 1.57 + (side > 0 ? 0 : Math.PI);
      l.rotation.x = 0.25;
      g.add(l);
    }
  });
  return g;
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
  return g;
}
const limeWedge = () => citrusWedge(0x3f8a24, "#3f8a24", "#e8f2cc", "#b9de62");
const bigMint = () => {
  const m = mint();
  m.scale.setScalar(1.7);
  return m;
};
const lime = () => citrusSlice("#4a8f2a", "#e9f3cf", "#bfe06a", "#e9f3cf");
const lemonSlice = () => citrusSlice("#f1c40f", "#fbf3cf", "#f8dc4d", "#fbf3cf");

function strawberry(): THREE.Object3D {
  const g = new THREE.Group();
  const prof = [[0, -0.46], [0.12, -0.38], [0.26, -0.18], [0.33, 0.04], [0.31, 0.2], [0.2, 0.3], [0, 0.32]];
  const geo = new THREE.LatheGeometry(prof.map(([x, y]) => new THREE.Vector2(x, y)), 48);
  g.add(new THREE.Mesh(geo, glossy(0xc8102e, 0.28)));
  // Graines
  const seeds = new THREE.InstancedMesh(new THREE.SphereGeometry(0.012, 6, 4), matte(0xf0d27a, 0.4), 70);
  const d = new THREE.Object3D();
  for (let i = 0; i < 70; i++) {
    const t = (i * 0.618) % 1;
    const y = -0.38 + t * 0.62;
    const a = i * 2.399;
    // rayon du profil à cette hauteur
    let r = 0.3;
    for (let j = 0; j < prof.length - 1; j++) {
      const [x0, y0] = prof[j], [x1, y1] = prof[j + 1];
      if (y >= y0 && y <= y1) r = x0 + ((y - y0) / (y1 - y0)) * (x1 - x0);
    }
    d.position.set(Math.cos(a) * (r + 0.004), y, Math.sin(a) * (r + 0.004));
    d.scale.set(1, 1.6, 1);
    d.updateMatrix();
    seeds.setMatrixAt(i, d.matrix);
  }
  g.add(seeds);
  for (let i = 0; i < 6; i++) {
    const l = leaf(0x3d8b2f, 0.26, 0.1);
    l.position.y = 0.32;
    l.rotation.y = (i / 6) * Math.PI * 2;
    l.rotation.x = 1.2;
    g.add(l);
  }
  return g;
}

const melonWedge = () => slice(0xff8a2a, 0xffc98f, 0x8f9a55);
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
const peachSlice = () => slice(0xffa938, 0xffd27a, 0xc8382c, 0.6, 0.35, 2.0, 0.2);

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

function lemon(): THREE.Object3D {
  const prof = [[0, -0.55], [0.06, -0.47], [0.28, -0.3], [0.35, 0], [0.28, 0.3], [0.06, 0.47], [0, 0.55]];
  const geo = new THREE.LatheGeometry(prof.map(([x, y]) => new THREE.Vector2(x, y)), 48);
  const m = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: 0xf3cf2a, roughness: 0.45, clearcoat: 0.5 }));
  m.rotation.z = Math.PI / 2;
  const g = new THREE.Group();
  g.add(m);
  return g;
}

const teaLeaf = () => leaf(0x35502a, 0.6, 0.22);

/** Grappe de bulles (colas) : sphères transparentes qui ne gardent que leurs reflets */
// Bulle d'air : centre transparent, liseré lumineux sur le bord et un petit reflet
const bubbleMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uTint: { value: new THREE.Color(0xffffff) } },
    vertexShader: `varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
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
    const r = 0.08 + Math.random() * 0.22;
    const b = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), mat);
    b.position.set((Math.random() - 0.5) * 0.7, (Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 0.4);
    g.add(b);
  }
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
  mangue: { makers: [mango, mangoCubes, mango, () => leaf(0x3d7f2c)], bubbles: 18 },
  lychee: { makers: [lycheeBunch, lycheePeeled, lychee, lycheeHalf, lychee], bubbles: 14, scale: 1.25 },
  mojito: { makers: [limeWedge, bigMint, limeWedge, bigMint, lime], bubbles: 20, scale: 1.15 },
  fraise: { makers: [strawberry, strawberry, () => leaf(0x3d8b2f, 0.5)], bubbles: 18, scale: 1.25 },
  melon: { makers: [melonWedge, melonBall, melonWedge, melonBall], bubbles: 18 },
  peche: { makers: [peach, peachSlice, peach], bubbles: 18 },
  pomme: { makers: [apple, apple, () => leaf(0x3f8f2c, 0.5)], bubbles: 18 },
  lemon: { makers: [lemon, lemonSlice, lemon, lemonSlice], bubbles: 20 },
  cola: { makers: [bubbles], bubbles: 70, scale: 1.2 },
  "cola-zero": { makers: [bubbles], bubbles: 70, scale: 1.2 },
  "cola-cherry": { makers: [cherries, bubbles, cherries, bubbles], bubbles: 60, scale: 1.15 },
  "ice-tea-peche": { makers: [peachSlice, ice, teaLeaf, peachSlice, ice], bubbles: 0 },
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

export function buildUniverse(slug: string) {
  const recipe = RECIPES[slug] ?? RECIPES.cerise;
  const slots: [number, number, number, number][] = recipe.orbit
    ? ORBIT.map(([a, y, r, s]) => [Math.cos(a) * r, y, Math.sin(a) * r, s])
    : SLOTS;
  const group = new THREE.Group();
  const items: { obj: THREE.Object3D; base: THREE.Vector3; spin: THREE.Vector3; phase: number; depth: number }[] = [];

  slots.forEach(([x, y, z, s], i) => {
    const obj = recipe.makers[i % recipe.makers.length]();
    obj.scale.setScalar(s * (recipe.scale ?? 1) * (0.9 + ((i * 37) % 10) / 50));
    obj.rotation.set(i * 1.3, i * 2.1, i * 0.7);
    obj.position.set(x, y, z);
    group.add(obj);
    items.push({
      obj,
      base: new THREE.Vector3(x, y, z),
      spin: new THREE.Vector3(0.05 + (i % 3) * 0.04, 0.08 + (i % 4) * 0.03, 0.03),
      phase: i * 1.7,
      depth: 1 + z * 0.09, // les objets proches bougent plus que les lointains
    });
  });

  // Bulles fines qui montent (boissons pétillantes)
  const nb = recipe.bubbles;
  const bubbleData = Array.from({ length: nb }, (_, i) => ({
    x: ((i * 0.37) % 1) * 9 - 4.5,
    y: ((i * 0.61) % 1) * 8 - 4,
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
        if (!still) {
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
        it.obj.position.set(
          bx - mouse.x * 0.45 * it.depth,
          it.base.y + bob + mouse.y * 0.3 * it.depth,
          bz
        );
      }
      if (bubbles) {
        bubbleData.forEach((b, i) => {
          if (!still) {
            b.y += b.v * dt;
            if (b.y > 4.5) b.y = -4.5;
          }
          d.position.set(b.x + Math.sin(t + i) * 0.05 - mouse.x * 0.3, b.y, b.z);
          d.scale.setScalar(b.r);
          d.updateMatrix();
          bubbles.setMatrixAt(i, d.matrix);
        });
        bubbles.instanceMatrix.needsUpdate = true;
      }
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
