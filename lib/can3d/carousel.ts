// Accueil : les canettes Dada disposées en arc de cercle autour d'une canette centrale,
// posée sur un podium métallique, plus grande, inclinée, qui suit la souris ; l'univers de sa saveur
// flotte derrière elle. Flèches, clavier, clic sur une canette ou glisser pour changer de saveur.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import type { Flavor } from "@/lib/flavors";
import { getRibbonLabel } from "./labels";
import { buildUniverse } from "./universe";
import { backdropColor } from "./showcase";

export type CarouselOptions = {
  flavors: Flavor[];
  start: number;
  /** Appelé quand la saveur au centre change (index dans flavors) */
  onSelect?: (index: number) => void;
  onReady?: () => void;
};

const R = 1, H = 4.62, HALF = H / 2;
const mod = (a: number, n: number) => ((a % n) + n) % n;

/** Géométries partagées par toutes les canettes */
function canGeometries() {
  const top = new THREE.LatheGeometry(
    [
      [R, HALF], [0.998, HALF + 0.05], [0.975, HALF + 0.14], [0.93, HALF + 0.23], [0.885, HALF + 0.3],
      [0.865, HALF + 0.34], [0.872, HALF + 0.375], [0.866, HALF + 0.405], [0.835, HALF + 0.41],
      [0.81, HALF + 0.37], [0.79, HALF + 0.335], [0.0, HALF + 0.335],
    ].map(([x, y]) => new THREE.Vector2(x, y)),
    96
  );
  const bottom = new THREE.LatheGeometry(
    [[0.0, -HALF - 0.17], [0.5, -HALF - 0.2], [0.76, -HALF - 0.29], [0.83, -HALF - 0.3], [0.9, -HALF - 0.22], [0.965, -HALF - 0.1], [R, -HALF]].map(
      ([x, y]) => new THREE.Vector2(x, y)
    ),
    96
  );
  const body = new THREE.CylinderGeometry(R, R, H, 128, 1, true);
  const tabShape = new THREE.Shape();
  tabShape.absarc(0, 0.18, 0.2, Math.PI, 0, true);
  tabShape.lineTo(0.2, -0.22);
  tabShape.absarc(0, -0.22, 0.2, 0, Math.PI, true);
  tabShape.lineTo(-0.2, 0.18);
  const hole = new THREE.Path();
  hole.absellipse(0, 0.2, 0.1, 0.07, 0, Math.PI * 2, false);
  tabShape.holes.push(hole);
  const tab = new THREE.ExtrudeGeometry(tabShape, { depth: 0.025, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.01, bevelSegments: 2 });
  return { top, bottom, body, tab };
}

/** Réduit une étiquette pour la texture (13 canettes à l'écran) */
function toTexture(img: HTMLCanvasElement | HTMLImageElement, maxAniso: number) {
  const w = 1024, h = Math.round((1024 * img.height) / img.width);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  c.getContext("2d")!.drawImage(img, 0, 0, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.offset.x = 0.25; // face avant vers la caméra
  tex.anisotropy = maxAniso;
  return tex;
}

export function createCarousel(canvas: HTMLCanvasElement, opts: CarouselOptions) {
  const { flavors } = opts;
  const n = flavors.length;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.fog = new THREE.Fog(backdropColor(flavors[opts.start]), 24, 44);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  const LOOK_Y = -1.15;
  camera.position.set(0, 0.9, 20);
  camera.lookAt(0, LOOK_Y, 0);

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-4, 5, 7);
  scene.add(key);
  const rim = new THREE.DirectionalLight(new THREE.Color(flavors[opts.start].hi), 1.6);
  rim.position.set(5, 2, -5);
  scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff, 0.15));

  // ---------- Les 13 canettes ----------
  const geo = canGeometries();
  const metal = new THREE.MeshStandardMaterial({ color: 0xdfe1e5, metalness: 1, roughness: 0.22, envMapIntensity: 0.65 });
  const metalDark = new THREE.MeshStandardMaterial({ color: 0xb6b9bf, metalness: 1, roughness: 0.3, envMapIntensity: 0.65 });
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  const cans = flavors.map((f, i) => {
    const group = new THREE.Group();
    const spin = new THREE.Group(); // rotation propre de la canette
    group.add(spin);
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(f.c), metalness: 0.45, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 0.55,
    });
    spin.add(new THREE.Mesh(geo.body, bodyMat));
    spin.add(new THREE.Mesh(geo.top, metal));
    spin.add(new THREE.Mesh(geo.bottom, metalDark));
    const tab = new THREE.Mesh(geo.tab, metal);
    tab.rotation.x = -Math.PI / 2;
    tab.position.set(0, HALF + 0.35, 0.12);
    spin.add(tab);
    group.userData.index = i;
    scene.add(group);
    return { group, spin, bodyMat, x: 0, y: 0, z: 0, s: 1 };
  });

  // Étiquettes : la canette du centre d'abord, puis ses voisines
  let disposed = false;
  (async () => {
    const order = [...Array(n).keys()].sort((a, b) => {
      const da = Math.abs(((a - opts.start + n + n / 2) % n) - n / 2);
      const db = Math.abs(((b - opts.start + n + n / 2) % n) - n / 2);
      return da - db;
    });
    let first = true;
    for (const i of order) {
      try {
        const img = await getRibbonLabel(flavors[i]);
        if (disposed) return;
        const c = cans[i];
        c.bodyMat.map = toTexture(img, maxAniso);
        c.bodyMat.color.set(0xffffff);
        c.bodyMat.needsUpdate = true;
      } catch {
        // la canette garde sa couleur unie
      }
      if (first) {
        first = false;
        opts.onReady?.();
      }
    }
  })();

  // ---------- Podium métallique sous la canette du centre ----------
  const CENTER_S = 1.12, CAN_Y = 0.35;
  const PODIUM_TOP = CAN_Y - (HALF + 0.3) * CENTER_S - 1.75; // la canette flotte au-dessus, le nom passe devant
  const podium = new THREE.Group();
  const podMat = new THREE.MeshStandardMaterial({ color: 0x9a9da3, metalness: 1, roughness: 0.28, envMapIntensity: 0.9 });
  const podTop = new THREE.MeshStandardMaterial({ color: 0x2a2b2e, metalness: 0.9, roughness: 0.35, envMapIntensity: 0.6 });
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(2.35, 2.5, 0.55, 96), [podMat, podTop, podMat]);
  drum.position.y = -0.275;
  podium.add(drum);
  const step = new THREE.Mesh(new THREE.CylinderGeometry(2.85, 2.95, 0.3, 96), podMat);
  step.position.y = -0.7;
  podium.add(step);
  const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(flavors[opts.start].hi), toneMapped: false });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.42, 0.035, 12, 128), ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -0.52;
  podium.add(ring);
  podium.position.set(0, PODIUM_TOP, 1.2);
  podium.rotation.x = 0.06;
  scene.add(podium);

  // Ombre douce sous la canette du centre
  const sc = document.createElement("canvas");
  sc.width = sc.height = 128;
  const sg = sc.getContext("2d")!;
  const grad = sg.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(0,0,0,0.55)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  sg.fillStyle = grad;
  sg.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.8, 1.3),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, PODIUM_TOP + 0.01, 1.2);
  shadow.visible = false;
  scene.add(shadow);

  // ---------- Univers de la saveur au centre ----------
  const UNI_S = 0.92;
  type Uni = { u: ReturnType<typeof buildUniverse>; scale: number; target: number };
  const universes: Uni[] = [];
  const showUniverse = (i: number) => {
    universes.forEach((x) => (x.target = 0));
    // demi-largeur / demi-hauteur visibles au plan de l'univers, pour le semer sur tout l'écran
    const dist = camera.position.z + 1.6;
    const hh = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist;
    const u = buildUniverse(flavors[i].slug, { w: (hh * camera.aspect) / UNI_S, h: hh / UNI_S });
    u.group.position.set(0, CAN_Y, -1.6);
    u.group.scale.setScalar(0.001);
    scene.add(u.group);
    universes.push({ u, scale: 0.001, target: UNI_S });
  };

  // ---------- Sélection ----------
  let sel = opts.start; // entier continu (peut dépasser n), affiché modulo n
  let pos = sel; // position animée du ruban
  let vel = 0;
  const fogTarget = backdropColor(flavors[opts.start]);
  const rimTarget = new THREE.Color(flavors[opts.start].hi);
  const ringTarget = new THREE.Color(flavors[opts.start].hi);
  const select = (next: number, notify = true) => {
    if (next === sel) return;
    sel = next;
    const i = mod(sel, n);
    fogTarget.copy(backdropColor(flavors[i]));
    rimTarget.set(flavors[i].hi);
    ringTarget.set(flavors[i].hi);
    showUniverse(i);
    if (notify) opts.onSelect?.(i);
  };

  // ---------- Souris, clic, glisser, clavier ----------
  const mouse = new THREE.Vector2(), cur = new THREE.Vector2();
  const section = canvas.closest("section") ?? canvas.parentElement ?? canvas;
  let downX = 0, downY = 0, dragging = false;
  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = THREE.MathUtils.clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
    mouse.y = THREE.MathUtils.clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
  };
  const onLeave = () => mouse.set(0, 0);
  const onDown = (e: PointerEvent) => {
    downX = e.clientX;
    downY = e.clientY;
    dragging = true;
  };
  const raycaster = new THREE.Raycaster();
  const onUp = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    const dx = e.clientX - downX, dy = e.clientY - downY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      select(sel + (dx < 0 ? 1 : -1)); // glisser
      return;
    }
    if (Math.hypot(dx, dy) > 6) return;
    // clic sur une canette du ruban
    const r = canvas.getBoundingClientRect();
    raycaster.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
    const hit = raycaster.intersectObjects(cans.map((c) => c.group), true)[0];
    if (!hit) return;
    let o: THREE.Object3D | null = hit.object;
    while (o && o.userData.index === undefined) o = o.parent;
    if (!o) return;
    const i = o.userData.index as number;
    let d = i - mod(sel, n);
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    if (d !== 0) select(sel + d);
  };
  section.addEventListener("pointermove", onMove);
  section.addEventListener("pointerleave", onLeave);
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointerup", onUp);

  // ---------- Taille et visibilité ----------
  let narrow = false;
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    narrow = w < 760;
    camera.fov = narrow ? 40 : 30;
    camera.updateProjectionMatrix();
  };
  // l'univers est semé à la taille de l'écran : on le resème si le format change nettement
  let uniAspect = 0;
  const ro = new ResizeObserver(() => {
    resize();
    if (uniAspect && Math.abs(camera.aspect - uniAspect) / uniAspect > 0.2) {
      uniAspect = camera.aspect;
      showUniverse(mod(sel, n));
    }
  });
  ro.observe(canvas);
  resize();
  uniAspect = camera.aspect;
  showUniverse(opts.start);
  let visible = true;
  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
  io.observe(canvas);

  // ---------- Boucle ----------
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    if (!visible) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    const k = (rate: number) => 1 - Math.exp(-dt * rate);
    // Ressort : le carrousel part vite, dépasse un peu et se pose (comme la référence)
    if (reduceMotion) pos = sel;
    else {
      vel += ((sel - pos) * 85 - vel * 12.5) * dt;
      pos += vel * dt;
    }
    cur.lerp(mouse, k(4));

    // Couronne de canettes d'un bord à l'autre de l'écran, en vague, chacune avec son inclinaison ;
    // celle du centre est éclairée, les autres restent dans la pénombre
    const G = narrow ? 0.8 : 0.84; // taille des canettes à l'écran
    const S0 = (narrow ? 2.8 : 3.6) * G; // écart autour de la canette du centre (place pour les flèches)
    const S = (narrow ? 2.25 : 2.6) * G; // écart entre les autres canettes
    cans.forEach((c, i) => {
      let d = i - pos;
      d = mod(d + n / 2, n) - n / 2; // la voisine la plus proche, d'un côté ou de l'autre
      const a = Math.abs(d), sg = Math.sign(d);
      const focus = Math.max(0, 1 - a); // 1 au centre, 0 dès la voisine
      const out = Math.min(1, a);
      const far = Math.max(0, a - 1);
      const bob = reduceMotion ? 0 : Math.sin(t * 0.8 + i * 1.9) * 0.08;
      c.group.position.set(
        sg * (out * S0 + far * S),
        CAN_Y + 0.85 * Math.sin(d * 0.45) - far * far * 0.05 + bob - focus * 0.25,
        -a * 0.35 - d * d * 0.09 + focus * 0.9
      );
      c.group.scale.setScalar(G * (1 + focus * (CENTER_S - 1)));
      c.group.visible = a < n / 2 - 0.3;
      // inclinaison propre à chaque canette ; la canette du centre penche vers la gauche,
      // le mouvement du carrousel les fait balancer
      const lean = -0.06 - 0.22 * (0.5 + 0.5 * Math.sin(i * 2.7 + 0.6));
      const sway = THREE.MathUtils.clamp(-vel * 0.05, -0.22, 0.22);
      c.group.rotation.set(
        -0.42 * out + focus * cur.y * 0.12,
        -d * 0.24,
        out * lean + focus * (0.2 - cur.x * 0.06) + sway * (0.6 + 0.4 * out)
      );
      // la canette du centre tourne doucement vers le curseur
      const idle = reduceMotion ? 0 : Math.sin(t * 0.45) * 0.18;
      const targetSpin = focus * (idle + cur.x * 0.55);
      c.spin.rotation.y += (targetSpin - c.spin.rotation.y) * k(6);
      // pénombre des canettes de côté
      if (c.bodyMat.map) c.bodyMat.color.setScalar(0.2 + 0.8 * focus);
      c.bodyMat.envMapIntensity = 0.22 + 0.33 * focus;
      c.bodyMat.clearcoat = 0.35 + 0.65 * focus;
    });
    key.position.set(-4 + cur.x * 4, 5 - cur.y * 2, 7);

    // Couleurs de la saveur (fond lointain, contre-jour)
    (scene.fog as THREE.Fog).color.lerp(fogTarget, k(4));
    rim.color.lerp(rimTarget, k(4));
    ringMat.color.lerp(ringTarget, k(4));
    podium.rotation.y = cur.x * 0.15;

    // Univers : l'ancien s'efface, le nouveau apparaît
    for (let j = universes.length - 1; j >= 0; j--) {
      const x = universes[j];
      x.scale += (x.target - x.scale) * k(x.target ? 3.5 : 7);
      x.u.group.scale.setScalar(Math.max(0.001, x.scale));
      x.u.update(dt, t, cur, reduceMotion);
      if (x.target === 0 && x.scale < 0.02) {
        scene.remove(x.u.group);
        x.u.dispose();
        universes.splice(j, 1);
      }
    }

    renderer.render(scene, camera);
  });

  return {
    next: () => select(sel + 1),
    prev: () => select(sel - 1),
    /** Aller à une saveur (index dans flavors) par le chemin le plus court */
    goTo: (i: number) => {
      let d = i - mod(sel, n);
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;
      select(sel + d);
    },
    dispose() {
      disposed = true;
      renderer.setAnimationLoop(null);
      ro.disconnect();
      io.disconnect();
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      universes.forEach((x) => x.u.dispose());
      cans.forEach((c) => {
        c.bodyMat.map?.dispose();
        c.bodyMat.dispose();
      });
      Object.values(geo).forEach((g) => g.dispose());
      podium.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
      podMat.dispose();
      podTop.dispose();
      ringMat.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
