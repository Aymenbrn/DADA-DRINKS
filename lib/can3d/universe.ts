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

/** Tranche en croissant (melon, pêche) : chair + bande de peau */
function wedge(flesh: number, skin: number, r = 0.75, depth = 0.3, angle = 1.0): THREE.Object3D {
  const g = new THREE.Group();
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.absarc(0, 0, r * 0.94, -angle / 2, angle / 2, false);
  s.lineTo(0, 0);
  const extrude = { depth, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 3, curveSegments: 32 };
  g.add(new THREE.Mesh(new THREE.ExtrudeGeometry(s, extrude), matte(flesh, 0.45)));
  const band = new THREE.Shape();
  band.absarc(0, 0, r, -angle / 2, angle / 2, false);
  band.absarc(0, 0, r * 0.93, angle / 2, -angle / 2, true);
  g.add(new THREE.Mesh(new THREE.ExtrudeGeometry(band, { ...extrude, bevelSize: 0.02 }), matte(skin, 0.55)));
  g.children.forEach((m) => (m.position.set(-r * 0.5, 0, -depth / 2)));
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

function lychee(): THREE.Object3D {
  const geo = new THREE.SphereGeometry(0.32, 64, 48);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = Math.sin(v.x * 38) * Math.sin(v.y * 38) * Math.sin(v.z * 38);
    v.multiplyScalar(1 + 0.035 * Math.abs(n)); // peau granuleuse
    v.y *= 1.08;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  paint(geo, (p) => mixC(0xb8263f, 0xd85a63, (p.y + 0.3) / 0.7));
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75 }));
}

function lycheePeeled(): THREE.Object3D {
  const geo = new THREE.SphereGeometry(0.28, 40, 30);
  geo.scale(1, 1.08, 1);
  return new THREE.Mesh(
    geo,
    new THREE.MeshPhysicalMaterial({ color: 0xf4efe6, roughness: 0.15, clearcoat: 1, transmission: 0.25, thickness: 0.4 })
  );
}

function mint(): THREE.Object3D {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const l = leaf(0x2f8f45, 0.55, 0.26);
    l.rotation.z = (i - 1) * 0.7;
    l.rotation.y = i * 0.5;
    l.position.y = 0.25;
    g.add(l);
  }
  return g;
}
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

const melonWedge = () => wedge(0xf6a35a, 0x9fa36a, 0.8, 0.32, 0.9);
function melonBall(): THREE.Object3D {
  return new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 24), glossy(0xf7a35c, 0.35));
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
const peachSlice = () => wedge(0xf7b04c, 0xd2452f, 0.7, 0.24, 0.8);

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

// ---------- Recettes par saveur ----------
type Recipe = { makers: Maker[]; bubbles: number; scale?: number };

const RECIPES: Record<string, Recipe> = {
  cerise: { makers: [cherries], bubbles: 18, scale: 1.25 },
  mangue: { makers: [mango, mangoCubes, mango, () => leaf(0x3d7f2c)], bubbles: 18 },
  lychee: { makers: [lychee, lycheePeeled, lychee, () => leaf(0x3d7f2c, 0.6)], bubbles: 18, scale: 1.3 },
  mojito: { makers: [mint, lime, ice, mint, lime], bubbles: 24 },
  fraise: { makers: [strawberry, strawberry, () => leaf(0x3d8b2f, 0.5)], bubbles: 18, scale: 1.25 },
  melon: { makers: [melonWedge, melonBall, melonWedge, melonBall], bubbles: 18 },
  peche: { makers: [peach, peachSlice, peach], bubbles: 18 },
  pomme: { makers: [apple, apple, () => leaf(0x3f8f2c, 0.5)], bubbles: 18 },
  lemon: { makers: [lemon, lemonSlice, lemon, lemonSlice], bubbles: 20 },
  cola: { makers: [ice, ice, ice], bubbles: 40 },
  "cola-zero": { makers: [ice, ice, ice], bubbles: 40 },
  "cola-cherry": { makers: [cherries, ice, cherries, ice], bubbles: 32, scale: 1.15 },
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

export function buildUniverse(slug: string) {
  const recipe = RECIPES[slug] ?? RECIPES.cerise;
  const group = new THREE.Group();
  const items: { obj: THREE.Object3D; base: THREE.Vector3; spin: THREE.Vector3; phase: number; depth: number }[] = [];

  SLOTS.forEach(([x, y, z, s], i) => {
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
        new THREE.SphereGeometry(1, 16, 12),
        new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.28, depthWrite: false }),
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
        it.obj.position.set(
          it.base.x - mouse.x * 0.45 * it.depth,
          it.base.y + bob + mouse.y * 0.3 * it.depth,
          it.base.z
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
