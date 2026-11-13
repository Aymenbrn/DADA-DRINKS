// Vitrine d'une canette : section « Nouveauté » de l'accueil et « univers » de chaque fiche produit.
// Volontairement sobre : la canette se tourne doucement vers le curseur, le reflet suit la souris,
// un léger balancement au repos. Sur les fiches, l'univers de la saveur flotte en profondeur.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import type { Flavor } from "@/lib/flavors";
import { getLabelImage } from "./labels";
import { buildUniverse } from "./universe";

export type ShowcaseOptions = {
  flavor: Flavor;
  /** Fruits / glaçons 3D autour de la canette */
  universe?: boolean;
  /** Sur grand écran, décale la canette vers la droite (fraction de la largeur) quand la scène couvre toute la section */
  shift?: number;
  onReady?: () => void;
  /** Couleur du brouillard (fond derrière les fruits lointains) ; par défaut le fond sombre de la saveur */
  fogColor?: string;
  /** La souris n'est suivie que sur l'élément parent du canvas (cartes de la boutique) */
  localPointer?: boolean;
};

/** Couleur du fond de section à l'endroit des objets lointains (même mélange que le CSS) */
export function backdropColor(f: Flavor) {
  return new THREE.Color(f.c).multiplyScalar(0.4).add(new THREE.Color(0x0a0a0a).multiplyScalar(0.6));
}

export function createShowcase(canvas: HTMLCanvasElement, opts: ShowcaseOptions) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
  camera.position.set(0, 0.25, 15);

  // Lumière principale douce + contre-jour léger ; la principale suit un peu la souris
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-3, 4, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(new THREE.Color(opts.flavor.hi), 1.4);
  rim.position.set(4, 2, -5);
  scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff, 0.15));

  // ---------- La canette (canette slim 33 cl) ----------
  const R = 1, H = 4.62, HALF = H / 2;
  const rig = new THREE.Group();
  scene.add(rig);
  const can = new THREE.Group();
  rig.add(can);

  const metal = new THREE.MeshStandardMaterial({ color: 0xdfe1e5, metalness: 1, roughness: 0.22, envMapIntensity: 0.6 });
  const metalDark = new THREE.MeshStandardMaterial({ color: 0xb6b9bf, metalness: 1, roughness: 0.3, envMapIntensity: 0.6 });

  const topProfile = [
    [R, HALF], [0.998, HALF + 0.05], [0.975, HALF + 0.14], [0.93, HALF + 0.23], [0.885, HALF + 0.3],
    [0.865, HALF + 0.34], [0.872, HALF + 0.375], [0.866, HALF + 0.405], [0.835, HALF + 0.41],
    [0.81, HALF + 0.37], [0.79, HALF + 0.335], [0.0, HALF + 0.335],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  can.add(new THREE.Mesh(new THREE.LatheGeometry(topProfile, 128), metal));

  const bottomProfile = [
    [0.0, -HALF - 0.17], [0.5, -HALF - 0.2], [0.76, -HALF - 0.29], [0.83, -HALF - 0.3],
    [0.9, -HALF - 0.22], [0.965, -HALF - 0.1], [R, -HALF],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  can.add(new THREE.Mesh(new THREE.LatheGeometry(bottomProfile, 128), metalDark));

  // Languette
  const tabShape = new THREE.Shape();
  tabShape.absarc(0, 0.18, 0.2, Math.PI, 0, true);
  tabShape.lineTo(0.2, -0.22);
  tabShape.absarc(0, -0.22, 0.2, 0, Math.PI, true);
  tabShape.lineTo(-0.2, 0.18);
  const hole = new THREE.Path();
  hole.absellipse(0, 0.2, 0.1, 0.07, 0, Math.PI * 2, false);
  tabShape.holes.push(hole);
  const tab = new THREE.Mesh(
    new THREE.ExtrudeGeometry(tabShape, { depth: 0.025, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.01, bevelSegments: 2 }),
    metal
  );
  tab.rotation.x = -Math.PI / 2;
  tab.position.set(0, HALF + 0.35, 0.12);
  can.add(tab);
  const rivet = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 24), metalDark);
  rivet.position.set(0, HALF + 0.345, 0);
  can.add(rivet);

  // Corps imprimé : encre sur aluminium, vernis brillant
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(opts.flavor.c), metalness: 0.45, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 0.55,
  });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 160, 1, true), bodyMat);
  can.add(body);

  getLabelImage(opts.flavor).then((img) => {
    const tex = img instanceof HTMLCanvasElement ? new THREE.CanvasTexture(img) : new THREE.Texture(img);
    tex.needsUpdate = true;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.offset.x = 0.25; // face avant vers la caméra
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    bodyMat.map = tex;
    bodyMat.color.set(0xffffff);
    bodyMat.needsUpdate = true;
    opts.onReady?.();
  }).catch(() => opts.onReady?.());

  // Univers de la saveur (fiches produits)
  const universe = opts.universe ? buildUniverse(opts.flavor.slug) : null;
  if (universe) {
    camera.position.z = 17.5; // un peu plus de recul : canette, ombre et fruits tiennent dans le cadre
    scene.add(universe.group);
    scene.fog = new THREE.Fog(opts.fogColor ? new THREE.Color(opts.fogColor) : backdropColor(opts.flavor), 16, 28); // les objets lointains se fondent dans le fond
  }

  // Ombre de contact très douce
  const sc = document.createElement("canvas");
  sc.width = sc.height = 128;
  const sg = sc.getContext("2d")!;
  const grad = sg.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(0,0,0,0.55)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  sg.fillStyle = grad;
  sg.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 1.2),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -HALF - 0.65;
  scene.add(shadow);

  // ---------- Souris ----------
  const target = new THREE.Vector2(); // -1..1
  const cur = new THREE.Vector2();
  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    target.x = THREE.MathUtils.clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
    target.y = THREE.MathUtils.clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
  };
  const onLeave = () => target.set(0, 0);
  const section = (opts.localPointer ? canvas.parentElement : canvas.closest("section")) ?? canvas.parentElement ?? canvas;
  section.addEventListener("pointermove", onMove);
  section.addEventListener("pointerleave", onLeave);

  // ---------- Taille ----------
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    if (opts.shift && w > 860) camera.setViewOffset(w, h, -w * opts.shift, 0, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // Ne dessine que lorsque la section est visible
  let visible = true;
  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
  io.observe(canvas);

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    if (!visible) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    const k = 1 - Math.exp(-dt * 4);
    cur.lerp(target, k);

    const idle = reduceMotion ? 0 : Math.sin(t * 0.45) * 0.18;
    can.rotation.y = idle + cur.x * 0.55; // se tourne vers le curseur
    rig.rotation.x = cur.y * 0.12; // s'incline à peine
    rig.rotation.z = -0.06 - cur.x * 0.05;
    rig.position.y = reduceMotion ? 0 : Math.sin(t * 0.9) * 0.06;
    shadow.material.opacity = 0.9 - (reduceMotion ? 0 : Math.sin(t * 0.9) * 0.08);
    // Le reflet glisse sur le métal avec la souris
    key.position.set(-3 + cur.x * 4, 4 - cur.y * 2, 6);
    universe?.update(dt, t, cur, reduceMotion);

    renderer.render(scene, camera);
  });

  return {
    dispose() {
      renderer.setAnimationLoop(null);
      ro.disconnect();
      io.disconnect();
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      bodyMat.map?.dispose();
      universe?.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss(); // libère vraiment le contexte WebGL (plusieurs scènes sur une même page)
    },
  };
}
