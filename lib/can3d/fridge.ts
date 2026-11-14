// Vitrines Dada en 3D, fidèles aux photos officielles : la face avant et le flanc décoré
// sont les photos redressées, posées sur un caisson aux dimensions réelles ; poignées,
// vitre (reflets), roulettes et ombre au sol sont modélisés.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export type FridgeVariant = "slim" | "moyen" | "big";

type Spec = {
  w: number; h: number; d: number; // dimensions en mètres
  feet: "pads" | "casters";
  glass: [number, number, number, number]; // vitre (fractions de la face) : x0, x1, y0 (haut), y1 (bas)
  handles: [number, number, number, number][]; // poignées : x centre, largeur, y haut, y bas (fractions)
};

const SPECS: Record<FridgeVariant, Spec> = {
  slim: { w: 0.39, h: 1.855, d: 0.48, feet: "pads", glass: [0.17, 0.93, 0.15, 0.84], handles: [[0.08, 0.06, 0.38, 0.52]] },
  moyen: { w: 0.62, h: 1.95, d: 0.62, feet: "casters", glass: [0.1, 0.95, 0.15, 0.84], handles: [[0.06, 0.05, 0.43, 0.56]] },
  big: { w: 1.0, h: 2.0, d: 0.65, feet: "casters", glass: [0.04, 0.97, 0.15, 0.85], handles: [[0.475, 0.025, 0.43, 0.56], [0.525, 0.025, 0.43, 0.56]] },
};

export function createFridge(canvas: HTMLCanvasElement, variant: FridgeVariant, opts: { onReady?: () => void } = {}) {
  const S = SPECS[variant];
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;
  const camera = new THREE.PerspectiveCamera(24, 1, 0.05, 50);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8cbb5, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-2.5, 4, 3);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -1.5, right: 1.5, top: 2.6, bottom: -0.5, near: 0.5, far: 12 });
  key.shadow.camera.updateProjectionMatrix();
  key.shadow.radius = 5;
  scene.add(key);

  const disposables: { dispose: () => void }[] = [envRT, pmrem];
  const track = <T extends { dispose: () => void }>(o: T) => (disposables.push(o), o);
  const loader = new THREE.TextureLoader();
  let pending = 0;
  const done = () => { if (--pending === 0) opts.onReady?.(); };
  const tex = (url: string) => {
    pending++;
    const t = loader.load(url, done, undefined, done);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return track(t);
  };

  const root = new THREE.Group();
  scene.add(root);
  const footH = S.feet === "casters" ? 0.07 : 0.025;

  // Caisson : face avant et flanc gauche en photo, le reste en tôle noire laquée
  const black = track(new THREE.MeshPhysicalMaterial({ color: 0x111113, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.2 }));
  const front = track(new THREE.MeshPhysicalMaterial({ map: tex(`/pro/fridge/${variant}-front.webp`), roughness: 0.4, clearcoat: 0.4, clearcoatRoughness: 0.25 }));
  const side = track(new THREE.MeshPhysicalMaterial({ map: tex(`/pro/fridge/${variant}-side.webp`), roughness: 0.45, clearcoat: 0.5, clearcoatRoughness: 0.2 }));
  const body = new THREE.Mesh(track(new THREE.BoxGeometry(S.w, S.h, S.d)), [black, side, black, black, front, black]);
  body.position.y = footH + S.h / 2;
  body.castShadow = body.receiveShadow = true;
  root.add(body);
  const fx = (f: number) => -S.w / 2 + f * S.w;
  const fy = (f: number) => footH + S.h - f * S.h;
  const zf = S.d / 2;

  // Vitre : verre légèrement en avant, reflets de la pièce
  const [gx0, gx1, gy0, gy1] = S.glass;
  const glass = new THREE.Mesh(
    track(new THREE.PlaneGeometry((gx1 - gx0) * S.w, (gy1 - gy0) * S.h)),
    track(new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.16, roughness: 0.04, metalness: 0, envMapIntensity: 1.6, clearcoat: 1 }))
  );
  glass.position.set(fx((gx0 + gx1) / 2), fy((gy0 + gy1) / 2), zf + 0.004);
  root.add(glass);

  // Poignées en relief
  const handleMat = track(new THREE.MeshPhysicalMaterial({ color: 0x0b0b0c, roughness: 0.3, clearcoat: 0.8 }));
  for (const [cx, w, y0, y1] of S.handles) {
    const hgeo = track(new THREE.BoxGeometry(w * S.w, (y1 - y0) * S.h, 0.035));
    const hm = new THREE.Mesh(hgeo, handleMat);
    hm.position.set(fx(cx), fy((y0 + y1) / 2), zf + 0.02);
    hm.castShadow = true;
    root.add(hm);
  }

  // Pieds ou roulettes aux quatre coins
  const wheelMat = track(new THREE.MeshStandardMaterial({ color: 0x222224, roughness: 0.5, metalness: 0.4 }));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x = sx * (S.w / 2 - 0.05), z = sz * (S.d / 2 - 0.05);
    if (S.feet === "casters") {
      const fork = new THREE.Mesh(track(new THREE.BoxGeometry(0.03, 0.03, 0.04)), wheelMat);
      fork.position.set(x, footH - 0.015, z);
      const wheel = new THREE.Mesh(track(new THREE.CylinderGeometry(0.025, 0.025, 0.022, 16)), wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.025, z);
      root.add(fork, wheel);
    } else {
      const pad = new THREE.Mesh(track(new THREE.CylinderGeometry(0.018, 0.022, footH, 12)), wheelMat);
      pad.position.set(x, footH / 2, z);
      root.add(pad);
    }
  }

  // Sol : uniquement l'ombre
  const ground = new THREE.Mesh(track(new THREE.PlaneGeometry(10, 10)), track(new THREE.ShadowMaterial({ opacity: 0.3 })));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const totalH = footH + S.h;
  const target = new THREE.Vector3(0, totalH * 0.5, 0);
  const fit = () => {
    const w = canvas.clientWidth || 300, h = canvas.clientHeight || 300;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const dist = Math.max((totalH * 1.08) / (2 * t), ((S.w + S.d) * 0.95) / (2 * t * camera.aspect)) + S.d / 2;
    camera.position.set(0, target.y + dist * 0.12, dist);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
  };
  fit();

  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  let raf = 0;
  const t0 = performance.now();
  const loop = (t: number) => {
    raf = requestAnimationFrame(loop);
    if (document.visibilityState !== "visible") return;
    root.rotation.y = 0.5 + (reduce ? 0 : Math.sin((t - t0) / 2800) * 0.14); // 3/4 gauche, comme les photos
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(loop);
  const ro = new ResizeObserver(fit);
  ro.observe(canvas);

  return {
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
