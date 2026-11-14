// Page Collaborations : un bras en relief (3D) qui lève une canette Dada, poing serré, comme sur le croquis.
// Style « argile » rouge Dada, éclairage studio ; la canette porte la vraie étiquette de la saveur.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import type { Flavor } from "@/lib/flavors";
import { getLabelImage } from "./labels";

export function createArm(canvas: HTMLCanvasElement, flavor: Flavor, opts: { onReady?: () => void } = {}) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, -0.6, 28);
  camera.lookAt(-1.0, -1.6, 0);

  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(-5, 6, 7);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xff3b30, 3.2);
  rim.position.set(6, 1, -4);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffd2c2, 0.5);
  fill.position.set(2, -4, 6);
  scene.add(fill);

  // ---------- Matières ----------
  const skin = new THREE.MeshPhysicalMaterial({
    color: 0xb3142b, roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.45,
    sheen: 1, sheenColor: new THREE.Color(0xff7a86), sheenRoughness: 0.55, envMapIntensity: 0.7,
  });
  const metal = new THREE.MeshStandardMaterial({ color: 0xdfe1e5, metalness: 1, roughness: 0.22, envMapIntensity: 0.7 });
  const metalDark = new THREE.MeshStandardMaterial({ color: 0xb6b9bf, metalness: 1, roughness: 0.3, envMapIntensity: 0.7 });

  const rig = new THREE.Group(); // tout le bras
  scene.add(rig);
  const hand = new THREE.Group(); // poing + canette
  rig.add(hand);
  hand.position.set(0, 0.9, 0);
  // la main est construite côté droit puis retournée : le bras part en bas à gauche, comme sur le croquis
  const grip = new THREE.Group();
  grip.scale.x = -1;
  hand.add(grip);

  // ---------- Canette (33 cl slim, même gabarit que les fiches) ----------
  const R = 1, H = 4.62, HALF = H / 2;
  const can = new THREE.Group();
  can.position.y = 0.55;
  hand.add(can);
  const lathe = (pts: number[][], m: THREE.Material) =>
    new THREE.Mesh(new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 96), m);
  can.add(lathe([[R, HALF], [0.998, HALF + 0.05], [0.975, HALF + 0.14], [0.93, HALF + 0.23], [0.885, HALF + 0.3], [0.865, HALF + 0.34], [0.872, HALF + 0.375], [0.866, HALF + 0.405], [0.835, HALF + 0.41], [0.81, HALF + 0.37], [0.79, HALF + 0.335], [0, HALF + 0.335]], metal));
  can.add(lathe([[0, -HALF - 0.17], [0.5, -HALF - 0.2], [0.76, -HALF - 0.29], [0.83, -HALF - 0.3], [0.9, -HALF - 0.22], [0.965, -HALF - 0.1], [R, -HALF]], metalDark));
  const bodyMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(flavor.c), metalness: 0.45, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 0.55 });
  can.add(new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 128, 1, true), bodyMat));
  getLabelImage(flavor)
    .then((img) => {
      const tex = img instanceof HTMLCanvasElement ? new THREE.CanvasTexture(img) : new THREE.Texture(img);
      tex.needsUpdate = true;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.offset.x = 0.25;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      bodyMat.map = tex;
      bodyMat.color.set(0xffffff);
      bodyMat.needsUpdate = true;
      opts.onReady?.();
    })
    .catch(() => opts.onReady?.());

  // ---------- Poing ----------
  const add = (g: THREE.BufferGeometry, p: [number, number, number], s: [number, number, number] = [1, 1, 1], parent: THREE.Object3D = grip) => {
    const m = new THREE.Mesh(g, skin);
    m.position.set(...p);
    m.scale.set(...s);
    parent.add(m);
    return m;
  };
  const ball = new THREE.SphereGeometry(1, 48, 32);
  const deg = Math.PI / 180;

  // Doigts : anneaux partiels qui enserrent la canette, de l'arrière droit vers l'avant puis la gauche
  const fingers: [number, number, number, number][] = [
    // y, épaisseur, début (°), étendue (°)
    [-0.2, 0.27, -38, 222],
    [-0.74, 0.28, -40, 226],
    [-1.27, 0.265, -40, 220],
    [-1.76, 0.23, -36, 206],
  ];
  for (const [y, t, start, span] of fingers) {
    const r = R + t * 0.82;
    const g = new THREE.TorusGeometry(r, t, 28, 72, span * deg);
    g.rotateX(Math.PI / 2);
    g.rotateY(-start * deg);
    add(g, [0, y, 0]);
    // bout du doigt (arrondi) et articulation (relief de la jointure)
    const end = (start + span) * deg;
    add(ball, [Math.cos(end) * r, y, Math.sin(end) * r], [t, t * 0.98, t]);
    for (const a of [start + 62, start + 128]) {
      const k = a * deg;
      add(ball, [Math.cos(k) * (r + t * 0.35), y + 0.02, Math.sin(k) * (r + t * 0.35)], [t * 0.72, t * 0.78, t * 0.72]);
    }
  }
  // Pouce : passe par-dessus l'index, côté gauche
  {
    const t = 0.3, r = R + 0.36;
    const g = new THREE.TorusGeometry(r, t, 28, 64, 92 * deg);
    g.rotateX(Math.PI / 2);
    g.rotateY(-128 * deg);
    const th = add(g, [0.02, 0.18, 0]);
    th.rotation.z = -0.12;
    const end = (128 + 92) * deg;
    add(ball, [Math.cos(end) * r, 0.18 + 0.12, Math.sin(end) * r], [t, t, t]);
    add(ball, [Math.cos(128 * deg) * r, 0.16, Math.sin(128 * deg) * r], [t * 1.05, t, t * 1.05]);
  }
  // Dos de la main (côté droit), paume derrière la canette, éminence du pouce
  add(ball, [1.28, -0.95, -0.45], [0.72, 1.32, 1.05]);
  add(ball, [0.25, -0.95, -1.12], [1.25, 1.25, 0.55]);
  add(ball, [-0.85, -0.25, -0.75], [0.6, 0.85, 0.55]);
  // Poignet
  add(ball, [1.15, -2.25, -0.55], [0.9, 0.95, 0.85]);

  // ---------- Avant-bras : du poignet vers le bas de l'écran ----------
  {
    const a = new THREE.Vector3(-1.15, -2.25, -0.55);
    const b = new THREE.Vector3(-4.6, -13.5, -1.6);
    const dir = b.clone().sub(a);
    const len = dir.length();
    // profil légèrement galbé (muscle) : du poignet fin vers l'avant-bras plus épais
    const prof: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) {
      const u = i / 24;
      const rr = 0.86 + 0.42 * Math.sin(Math.min(1, u * 1.6) * Math.PI * 0.5) - 0.06 * u;
      prof.push(new THREE.Vector2(rr, -u * len));
    }
    const g = new THREE.LatheGeometry(prof, 64);
    const m = new THREE.Mesh(g, skin);
    m.position.copy(a).add(hand.position);
    m.position.y += 0.05;
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir.clone().normalize());
    m.scale.set(1, 1, 0.86);
    rig.add(m);
  }

  // Pose : poing levé, légèrement penché, vu de trois-quarts
  hand.rotation.set(0.05, 0.32, -0.1);

  // ---------- Taille / animation ----------
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  const target = new THREE.Vector2(), cur = new THREE.Vector2();
  const onMove = (e: PointerEvent) => {
    target.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  let visible = true;
  const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
  io.observe(canvas);

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    if (!visible) return;
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    cur.lerp(target, 1 - Math.exp(-dt * 3));
    const s = reduceMotion ? 0 : 1;
    rig.rotation.set(cur.y * 0.06, cur.x * 0.18 + s * Math.sin(t * 0.5) * 0.06, s * Math.sin(t * 0.8) * 0.025);
    rig.position.y = s * Math.sin(t * 0.8) * 0.12;
    key.position.x = -5 + cur.x * 3;
    renderer.render(scene, camera);
  });

  return {
    dispose() {
      renderer.setAnimationLoop(null);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose();
      });
      bodyMat.map?.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
