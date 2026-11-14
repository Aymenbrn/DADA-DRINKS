// Palette mixte en 3D : trois étages de plateaux (deux saveurs par étage), canettes
// texturées avec les visuels officiels, palette en bois et bandeau « Saveurs au choix ».
import * as THREE from "three";

const BASE = "/pro/pallet";
/** Étages du bas vers le haut, chacun : saveur de gauche, saveur de droite (+ couleur du plateau) */
const LAYERS: [string, number][][] = [
  [["cola", 0xb30f1a], ["melon", 0xe0841c]],
  [["pomme", 0x5b8a2a], ["cerise", 0x2d2d2d]],
  [["lychee", 0xc96b78], ["mojito", 0xd8d659]],
];

// Proportions réelles (1 unité = 10 cm) : canette slim 33 cl Ø 5,7 cm × 14,6 cm,
// quart de palette 60 × 40 cm, plateaux carton de 3,5 cm.
const R = 0.285; // rayon d'une canette
const CAN_H = 1.46;
const TRAY_H = 0.35;
const COLS = 5, DEPTH = 7; // canettes par plateau : 5 de face, 7 en profondeur
const TIERS = 2; // deux rangs de canettes par saveur
const TIER_H = TRAY_H * 0.25 + CAN_H + 0.02; // le plateau du rang suivant repose sur les canettes
const LAYER_H = TIERS * TIER_H;

function woodTexture() {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = "#c69a5c"; g.fillRect(0, 0, 512, 64);
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 90; i++) {
    const y = rnd() * 64;
    g.strokeStyle = rnd() > 0.5 ? `rgba(120,80,40,${0.12 + rnd() * 0.18})` : `rgba(240,200,140,${0.1 + rnd() * 0.15})`;
    g.lineWidth = 0.6 + rnd() * 1.6;
    g.beginPath(); g.moveTo(0, y);
    g.bezierCurveTo(170, y + (rnd() - 0.5) * 8, 340, y + (rnd() - 0.5) * 8, 512, y + (rnd() - 0.5) * 6);
    g.stroke();
  }
  for (let i = 0; i < 4; i++) { // nœuds
    const x = rnd() * 512, y = 10 + rnd() * 44;
    g.fillStyle = "rgba(110,70,35,0.45)"; g.beginPath(); g.ellipse(x, y, 7 + rnd() * 6, 3 + rnd() * 2, 0, 0, Math.PI * 2); g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export function createPallet(canvas: HTMLCanvasElement, opts: { onReady?: () => void } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 200);

  // Lumières : ciel doux + lumière principale de 3/4 avec ombres + contre-jour
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8cbb5, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-8, 16, 12);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 12, bottom: -2, near: 1, far: 50 });
  key.shadow.camera.updateProjectionMatrix();
  key.shadow.radius = 4;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xfff1dc, 0.8);
  rim.position.set(10, 8, -10);
  scene.add(rim);

  const root = new THREE.Group();
  scene.add(root);
  const loader = new THREE.TextureLoader();
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(o: T) => (disposables.push(o), o);

  const W = COLS * 2 * R * 2; // largeur de deux plateaux côte à côte
  const D = DEPTH * 2 * R;

  // ---------- Palette ----------
  const wood = track(woodTexture());
  const woodMat = track(new THREE.MeshStandardMaterial({ map: wood, roughness: 0.85 }));
  const pallet = new THREE.Group();
  const PW = 6, PD = 4; // quart de palette 60 × 40 cm
  const board = (w: number, h: number, d: number, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(track(new THREE.BoxGeometry(w, h, d)), woodMat);
    m.position.set(x, y, z); m.castShadow = m.receiveShadow = true;
    pallet.add(m);
  };
  for (let i = 0; i < 5; i++) board(PW, 0.22, PD / 5 - 0.12, 0, 1.33, -PD / 2 + (i + 0.5) * (PD / 5)); // planches du dessus
  for (const x of [-PW / 2 + 0.5, 0, PW / 2 - 0.5]) {
    board(1.0, 0.22, PD, x, 1.11, 0); // traverses
    for (const z of [-PD / 2 + 0.45, 0, PD / 2 - 0.45]) board(1.0, 0.78, 0.9, x, 0.61, z); // dés
  }
  for (const z of [-PD / 2 + 0.45, 0, PD / 2 - 0.45]) board(PW, 0.22, 0.9, 0, 0.11, z); // semelles
  root.add(pallet);

  // ---------- Plateaux et canettes ----------
  const lidMat = track(new THREE.MeshStandardMaterial({ color: 0xd7dade, metalness: 0.9, roughness: 0.28 }));
  const canGeo = track(new THREE.CylinderGeometry(R, R, CAN_H, 40, 1, true, -Math.PI / 2, Math.PI * 2));
  const lidGeo = track(new THREE.CylinderGeometry(R * 0.84, R * 0.97, 0.08, 32));
  const rimGeo = track(new THREE.TorusGeometry(R * 0.86, 0.02, 8, 32));
  let pending = 0;
  const done = () => { if (--pending === 0) opts.onReady?.(); };
  const tex = (url: string, setup?: (t: THREE.Texture) => void) => {
    pending++;
    const t = loader.load(url, () => { render(); done(); }, undefined, done);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    setup?.(t);
    return track(t);
  };

  const y0 = 1.44;
  LAYERS.forEach((layer, li) => {
    layer.forEach(([name, color], side) => {
      const bx = (side === 0 ? -1 : 1) * (W / 4);
      const by = y0 + li * LAYER_H;
      const band = tex(`${BASE}/band-${name}.webp`);
      const plain = track(new THREE.MeshStandardMaterial({ color, roughness: 0.7 }));
      const printed = track(new THREE.MeshStandardMaterial({ map: band, roughness: 0.6 }));
      const label = tex(`${BASE}/can-${name}.webp`, (t) => { t.wrapS = THREE.MirroredRepeatWrapping; t.repeat.set(2, 1); });
      const canMat = track(new THREE.MeshStandardMaterial({ map: label, metalness: 0.35, roughness: 0.32 }));
      const trayGeo = track(new THREE.BoxGeometry(W / 2 - 0.02, TRAY_H, D));
      for (let tier = 0; tier < TIERS; tier++) {
        const ty = by + tier * TIER_H;
        // plateau carton : bandeau imprimé sur la face avant
        const tray = new THREE.Mesh(trayGeo, [plain, plain, plain, plain, printed, plain]);
        tray.position.set(bx, ty + TRAY_H / 2, 0);
        tray.castShadow = tray.receiveShadow = true;
        root.add(tray);
        const topTier = li === LAYERS.length - 1 && tier === TIERS - 1;
        for (let i = 0; i < COLS; i++) {
          for (let k = 0; k < DEPTH; k++) {
            // seules les canettes visibles sont créées : face avant, côté extérieur, rang du dessus
            const outer = (side === 0 && i === 0) || (side === 1 && i === COLS - 1);
            if (!(k === 0 || outer || topTier)) continue;
            const x = bx - W / 4 + R + i * 2 * R;
            const z = D / 2 - R - k * 2 * R;
            const cy = ty + TRAY_H * 0.25 + CAN_H / 2;
            const can = new THREE.Mesh(canGeo, canMat);
            can.position.set(x, cy, z);
            can.castShadow = true;
            root.add(can);
            if (topTier || k === 0) {
              const lid = new THREE.Mesh(lidGeo, lidMat);
              lid.position.set(x, cy + CAN_H / 2 + 0.04, z);
              root.add(lid);
              const rimM = new THREE.Mesh(rimGeo, lidMat);
              rimM.rotation.x = Math.PI / 2;
              rimM.position.copy(lid.position).y += 0.04;
              root.add(rimM);
            }
          }
        }
      }
    });
  });

  // ---------- Bandeau « Saveurs au choix » posé sur le dessus ----------
  const topY = y0 + LAYERS.length * LAYER_H;
  const signTex = tex(`${BASE}/sign.webp`);
  const signH = W * (74 / 558);
  const sign = new THREE.Mesh(track(new THREE.BoxGeometry(W, signH, 0.05)), [
    track(new THREE.MeshStandardMaterial({ color: 0xc8102e })), track(new THREE.MeshStandardMaterial({ color: 0xc8102e })),
    track(new THREE.MeshStandardMaterial({ color: 0xc8102e })), track(new THREE.MeshStandardMaterial({ color: 0xc8102e })),
    track(new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.5 })), track(new THREE.MeshStandardMaterial({ color: 0xffffff })),
  ]);
  sign.position.set(0, topY + 0.12 + signH / 2, D / 2 - 0.15);
  sign.castShadow = true;
  root.add(sign);

  // ---------- Sol : ombre seule ----------
  const ground = new THREE.Mesh(track(new THREE.PlaneGeometry(40, 40)), track(new THREE.ShadowMaterial({ opacity: 0.28 })));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Cadrage : vue de 3/4, légèrement plongeante
  const totalH = topY + 0.12 + signH;
  const target = new THREE.Vector3(0, totalH * 0.48, 0);
  const fit = () => {
    const w = canvas.clientWidth || 300, h = canvas.clientHeight || 300;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const needH = totalH * 1.1, needW = (W + 1) * 1.1;
    const dist = Math.max(needH / (2 * Math.tan(vFov / 2)), needW / (2 * Math.tan(vFov / 2) * camera.aspect)) + D / 2;
    camera.position.set(0, target.y + dist * 0.2, dist);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
  };
  fit();

  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  function render() { renderer.render(scene, camera); }
  let raf = 0, t0 = performance.now(), visible = true;
  const loop = (t: number) => {
    raf = requestAnimationFrame(loop);
    if (!visible) return;
    root.rotation.y = -0.42 + (reduce ? 0 : Math.sin((t - t0) / 2600) * 0.16); // léger balancement de 3/4
    render();
  };
  raf = requestAnimationFrame(loop);
  const ro = new ResizeObserver(() => { fit(); render(); });
  ro.observe(canvas);
  const onVis = () => { visible = document.visibilityState === "visible"; };
  document.addEventListener("visibilitychange", onVis);

  return {
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
