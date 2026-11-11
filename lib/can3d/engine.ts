// @ts-nocheck

// Moteur 3D de la fiche produit Dada : canette transparente, boisson qui ballotte,
// versement piloté à la souris. Tout est créé dans createCanScene(canvas, …).
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export type CanSceneOptions = {
  flavor: any;
  assetBase?: string;
  onReady?: () => void;
  onError?: (message: string) => void;
};

export function createCanScene(canvas: HTMLCanvasElement, options: CanSceneOptions) {
const { flavor, assetBase = "/labels", onReady, onError } = options;
let cur = flavor;
const status = {
  set hidden(v) { if (v && onReady) onReady(); },
  set textContent(t) { if (onError) onError(t); },
};
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
// next/font renomme les polices : on lit leur vrai nom dans les variables CSS posées par app/layout.tsx
const cssFont = (v, fallback) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || fallback;
const DISPLAY_FONT = cssFont("--font-anton", "Anton");
const LABEL_FONT = cssFont("--font-montserrat", "Montserrat");

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
} catch (e) {
  status.textContent = "LA 3D N’EST PAS DISPONIBLE SUR CET APPAREIL";
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
camera.position.set(0, 0.6, 14);
scene.add(camera);

// Fond (halo cerise + grand mot en contour), attaché à la caméra pour rester derrière la canette
const bdCanvas = document.createElement("canvas");
bdCanvas.width = 2048; bdCanvas.height = 1152;
const bdTex = new THREE.CanvasTexture(bdCanvas);
bdTex.colorSpace = THREE.SRGBColorSpace;
let bdWord = "CERISE";
function drawBackdrop(word) {
  bdWord = word;
  const c = bdCanvas.getContext("2d");
  // Fond de scène : du noir (haut) vers la couleur de la saveur (bas), sans cassure.
  // Une lueur elliptique très large, centrée sous l'horizon, avec une courbe douce sur 24 paliers.
  c.fillStyle = "#040404";
  c.fillRect(0, 0, 2048, 1152);
  c.save();
  c.translate(1024, 1240);
  c.scale(1.7, 1);
  const glowR = 1050;
  const sky = c.createRadialGradient(0, 0, 0, 0, 0, glowR);
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const e = 1 - t * t * (3 - 2 * t); // smoothstep : départ et arrivée en douceur
    sky.addColorStop(t, `rgba(${cur.rgb},${(0.58 * e * e).toFixed(4)})`);
  }
  c.fillStyle = sky;
  c.fillRect(-glowR, -glowR, glowR * 2, glowR * 2);
  c.restore();
  const g = c.createRadialGradient(1024, 576, 0, 1024, 576, 760);
  g.addColorStop(0, `rgba(${cur.rgb},0.16)`);
  g.addColorStop(1, `rgba(${cur.rgb},0)`);
  c.fillStyle = g;
  c.fillRect(0, 0, 2048, 1152);
  c.font = `520px ${DISPLAY_FONT}, Impact, sans-serif`;
  const fit = Math.min(1, 1880 / Math.max(1, c.measureText(word).width));
  c.font = `${Math.floor(520 * fit)}px ${DISPLAY_FONT}, Impact, sans-serif`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.lineWidth = 5;
  c.strokeStyle = `rgba(${cur.rgb},0.14)`;
  c.strokeText(word, 1024, 600);
  // Grain imperceptible : supprime les paliers visibles dans le dégradé
  const img = c.getImageData(0, 0, 2048, 1152);
  const px = img.data;
  for (let i = 0; i < px.length; i += 4) {
    const n = (Math.random() - 0.5) * 3;
    px[i] += n; px[i + 1] += n; px[i + 2] += n;
  }
  c.putImageData(img, 0, 0);
  bdTex.needsUpdate = true;
}
drawBackdrop(bdWord);
document.fonts?.load(`520px ${DISPLAY_FONT}`).then(() => drawBackdrop(bdWord)).catch(() => {});
const BD_DIST = 40;
const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: bdTex, depthWrite: false, toneMapped: false, fog: false }));
backdrop.position.z = -BD_DIST;
backdrop.renderOrder = -1;
camera.add(backdrop);

// Lumières : clé blanche, contre-jour cerise
const key = new THREE.DirectionalLight(0xffffff, 0.35);
key.position.set(-4, 6, 8);
scene.add(key);
// Contre-jour à la couleur de la saveur (dessine la silhouette)
const rim = new THREE.DirectionalLight(0xff3b4f, 2.6);
rim.position.set(6, 3, -6);
scene.add(rim);
scene.add(new THREE.AmbientLight(0xffffff, 0.06));

// ---------- La canette (proportions d'une canette slim 33 cl) ----------
// rig = inclinaison / position (souris, versement) ; can = rotation sur son axe
const rig = new THREE.Group();
scene.add(rig);
const can = new THREE.Group();
rig.add(can);
const R = 1, H = 4.62, HALF = H / 2;

const metal = new THREE.MeshStandardMaterial({ color: 0xdcdee3, metalness: 1, roughness: 0.24, envMapIntensity: 0.7 });
const metalDark = new THREE.MeshStandardMaterial({ color: 0xb4b8bf, metalness: 1, roughness: 0.32, envMapIntensity: 0.7 });
// Verre / PET transparent : reflets d'environnement, très faible opacité
const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff, metalness: 0, roughness: 0.04, transparent: true, opacity: 0.16,
  clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.6, depthWrite: false,
});

// Épaule + col + couvercle (profil tourné)
const topProfile = [
  [R, HALF], [0.998, HALF + 0.05], [0.975, HALF + 0.14], [0.93, HALF + 0.23], [0.885, HALF + 0.3],
  [0.865, HALF + 0.34], [0.872, HALF + 0.375], [0.866, HALF + 0.405], [0.835, HALF + 0.41],
  [0.81, HALF + 0.37], [0.79, HALF + 0.335], [0.0, HALF + 0.335],
].map(([x, y]) => new THREE.Vector2(x, y));
const top = new THREE.Mesh(new THREE.LatheGeometry(topProfile, 128), metal);
can.add(top);

// Fond bombé
const bottomProfile = [
  [0.0, -HALF - 0.17], [0.5, -HALF - 0.2], [0.76, -HALF - 0.29], [0.83, -HALF - 0.3],
  [0.9, -HALF - 0.22], [0.965, -HALF - 0.1], [R, -HALF],
].map(([x, y]) => new THREE.Vector2(x, y));
const bottomGlass = new THREE.Mesh(new THREE.LatheGeometry(bottomProfile, 128), metalDark);
bottomGlass.renderOrder = 2;
can.add(bottomGlass);

// Languette (sur un pivot pour pouvoir l'ouvrir) — l'ouverture est côté +x
const tabPivot = new THREE.Group();
tabPivot.position.set(0, HALF + 0.35, 0);
can.add(tabPivot);
const tabShape = new THREE.Shape();
tabShape.absarc(0, 0.18, 0.2, Math.PI, 0, true);
tabShape.lineTo(0.2, -0.22);
tabShape.absarc(0, -0.22, 0.2, 0, Math.PI, true);
tabShape.lineTo(-0.2, 0.18);
const hole = new THREE.Path();
hole.absellipse(0, 0.2, 0.1, 0.07, 0, Math.PI * 2, false);
tabShape.holes.push(hole);
const tab = new THREE.Mesh(new THREE.ExtrudeGeometry(tabShape, { depth: 0.025, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.01, bevelSegments: 2 }), metal);
const tabHolder = new THREE.Group();
tabHolder.rotation.y = Math.PI / 2; // anneau côté -x, nez côté +x (vers l'ouverture)
tab.rotation.x = -Math.PI / 2;
tab.position.set(0, 0, 0.12);
tabHolder.add(tab);
tabPivot.add(tabHolder);
// Rivet + ouverture gravée
const rivet = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 24), metalDark);
rivet.position.set(0, HALF + 0.345, 0);
can.add(rivet);
const OPENING = new THREE.Vector3(0.42, HALF + 0.34, 0);
const score = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.012, 8, 48), metalDark);
score.rotation.x = Math.PI / 2;
score.scale.set(1, 0.72, 1);
score.position.set(OPENING.x, HALF + 0.338, 0);
can.add(score);
// Trou d'ouverture (visible une fois la canette ouverte)
const holeMesh = new THREE.Mesh(new THREE.CircleGeometry(0.19, 40), new THREE.MeshBasicMaterial({ color: 0x050203 }));
holeMesh.rotation.x = -Math.PI / 2;
holeMesh.scale.set(1, 0.72, 1);
holeMesh.position.set(OPENING.x, HALF + 0.343, 0);
holeMesh.visible = false;
can.add(holeMesh);

// Corps transparent
const bodyGlass = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 160, 1, true), metal);
bodyGlass.renderOrder = 2;
can.add(bodyGlass);

// ---------- Boisson dynamique ----------
// Le volume de liquide est coupé par un plan en coordonnées monde : la surface reste à plat
// quand la canette penche, et ce plan oscille (ressort amorti) selon les accélérations.
const LIQ_R = 0.955;
const LIQ_BOTTOM = -HALF - 0.12;
const LIQ_TOP = HALF + 0.3;
const FILL_FULL = H + 0.12 - 0.42; // hauteur de liquide canette pleine (poche d'air sous le couvercle)
let fill = 1;
const liqUniforms = {
  uPlane: { value: new THREE.Vector4(0, 1, 0, 0) },
  uCanInv: { value: new THREE.Matrix4() },
  uYMin: { value: LIQ_BOTTOM },
  uYMax: { value: LIQ_TOP },
};
function clipShader(shader, clipEnds) {
  Object.assign(shader.uniforms, liqUniforms);
  shader.vertexShader = "varying vec3 vLiqWorld;\n" + shader.vertexShader.replace(
    "#include <begin_vertex>",
    "#include <begin_vertex>\nvLiqWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;"
  );
  shader.fragmentShader =
    "uniform vec4 uPlane;\nuniform mat4 uCanInv;\nuniform float uYMin;\nuniform float uYMax;\nvarying vec3 vLiqWorld;\n" +
    shader.fragmentShader.replace(
      "void main() {",
      "void main() {\n" +
      (clipEnds
        ? "  vec3 lp = (uCanInv * vec4(vLiqWorld, 1.0)).xyz;\n  if (lp.y < uYMin || lp.y > uYMax || length(lp.xz) > " + LIQ_R.toFixed(3) + ") discard;\n"
        : "  if (dot(vLiqWorld, uPlane.xyz) > uPlane.w) discard;\n")
    );
}
// Volume (verre de soda translucide)
const liqGeo = new THREE.CylinderGeometry(LIQ_R, LIQ_R, LIQ_TOP - LIQ_BOTTOM, 96, 1, false);
liqGeo.translate(0, (LIQ_TOP + LIQ_BOTTOM) / 2, 0);
const drinkMat = new THREE.MeshPhysicalMaterial({
  color: 0xff3a50, transmission: 0.82, thickness: 1.8, ior: 1.34, roughness: 0.05,
  attenuationColor: new THREE.Color(0x6e0012), attenuationDistance: 0.85, clearcoat: 0.5,
});
drinkMat.onBeforeCompile = (s) => clipShader(s, false);
const drink = new THREE.Mesh(liqGeo, drinkMat);
can.add(drink);
drink.visible = false;
// Surface : une ellipse posée dans le plan, découpée aux parois de la canette
const surfMat = new THREE.MeshPhysicalMaterial({
  color: 0xff4f66, emissive: 0x6e0012, emissiveIntensity: 0.45, roughness: 0.12,
  clearcoat: 1, clearcoatRoughness: 0.05, side: THREE.DoubleSide,
});
surfMat.onBeforeCompile = (s) => clipShader(s, true);
const surface = new THREE.Mesh(new THREE.CircleGeometry(1, 96), surfMat);
surface.matrixAutoUpdate = false;
scene.add(surface);
surface.visible = false;

// Ballottement : ressort amorti piloté par l'accélération de la canette
const slosh = { w: new THREE.Vector2(), v: new THREE.Vector2(), prevP: null, prevVel: new THREE.Vector3() };
const _p = new THREE.Vector3(), _vel = new THREE.Vector3(), _acc = new THREE.Vector3();
const _n = new THREE.Vector3(), _axis = new THREE.Vector3(), _u = new THREE.Vector3(), _v = new THREE.Vector3();
const _q = new THREE.Quaternion(), _m = new THREE.Matrix4();
function updateLiquid(dt) {
  can.updateMatrixWorld(true);
  const level = LIQ_BOTTOM + FILL_FULL * fill;
  _p.set(0, level, 0);
  can.localToWorld(_p);
  if (!slosh.prevP) slosh.prevP = _p.clone();
  if (dt > 0) {
    _vel.subVectors(_p, slosh.prevP).divideScalar(dt);
    _acc.subVectors(_vel, slosh.prevVel).divideScalar(dt);
    _acc.clampLength(0, 900);
    slosh.prevVel.copy(_vel);
  }
  slosh.prevP.copy(_p);
  // La surface penche vers l'accélération (gravité apparente), puis oscille et se calme
  const tx = _acc.x * 0.0045, tz = _acc.z * 0.0045;
  const k = 42, c = 3.2;
  slosh.v.x += (-k * (slosh.w.x - tx) - c * slosh.v.x) * dt;
  slosh.v.y += (-k * (slosh.w.y - tz) - c * slosh.v.y) * dt;
  slosh.w.addScaledVector(slosh.v, dt);
  if (slosh.w.length() > 0.75) slosh.w.setLength(0.75);
  _n.set(slosh.w.x, 1, slosh.w.y).normalize();
  liqUniforms.uPlane.value.set(_n.x, _n.y, _n.z, _n.dot(_p));
  liqUniforms.uCanInv.value.copy(can.matrixWorld).invert();
  // Ellipse = intersection du plan et du cylindre
  can.getWorldQuaternion(_q);
  _axis.set(0, 1, 0).applyQuaternion(_q);
  const cos = Math.max(0.15, Math.abs(_axis.dot(_n)));
  _u.copy(_axis).addScaledVector(_n, -_axis.dot(_n));
  if (_u.lengthSq() < 1e-6) _u.set(1, 0, 0).addScaledVector(_n, -_n.x);
  _u.normalize();
  _v.crossVectors(_n, _u).normalize();
  _m.makeBasis(_u.multiplyScalar(LIQ_R / cos), _v.multiplyScalar(LIQ_R), _n);
  _m.setPosition(_p);
  surface.matrix.copy(_m);
  surface.matrixWorldNeedsUpdate = true;
}

// Bulles qui montent dans la canette (opaques pour être vues à travers le liquide)
const INNER = 150;
const inner = new THREE.InstancedMesh(
  new THREE.SphereGeometry(1, 10, 8),
  new THREE.MeshStandardMaterial({ color: 0xffe3e7, emissive: 0xff9aa8, emissiveIntensity: 0.35, roughness: 0.15 }),
  INNER
);
const innerData = Array.from({ length: INNER }, () => {
  const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 0.82;
  return { x: Math.cos(a) * r, z: Math.sin(a) * r, y: Math.random(), sp: 0.12 + Math.random() * 0.3, s: 0.012 + Math.random() * 0.03, ph: Math.random() * 6 };
});
can.add(inner);
inner.visible = false;

// Étiquette imprimée : seuls les graphismes, sur la canette transparente
const labelGeo = new THREE.CylinderGeometry(R * 1.003, R * 1.003, H, 160, 1, true);
const labelBackMat = new THREE.MeshStandardMaterial({ side: THREE.BackSide, color: 0x111111 });
// Encre sur aluminium : fond noir laqué, reflets métalliques sous le projecteur
const labelFrontMat = new THREE.MeshPhysicalMaterial({
  side: THREE.FrontSide, metalness: 0.55, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 0.6,
});
const labelBack = new THREE.Mesh(labelGeo, labelBackMat);
labelBack.renderOrder = 1;
const labelFront = new THREE.Mesh(labelGeo, labelFrontMat);
labelFront.renderOrder = 3;
labelBack.visible = labelFront.visible = false;
can.add(labelBack, labelFront);

const loader = new THREE.TextureLoader();
const labelCache = new Map();
function prepTex(tex) {
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.offset.x = 0.25; // place le logo face à la caméra
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}
const fontsReady = Promise.all([
  document.fonts?.load(`900 88px ${LABEL_FONT}`),
]).catch(() => {});

// Étiquette commune à toute la gamme : gabarit tiré de l'étiquette Cerise
// (logo DADA, feuilles, fleurs, mentions), avec le nom et le fruit de chaque saveur
// écrits au même endroit, dans la même typo et à la même hauteur.
const loadImg = (src) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
let templateP = null, cerisArtP = null;
function lighten(hex, t) { const c = new THREE.Color(hex).lerp(new THREE.Color(0xffffff), t); return `#${c.getHexString()}`; }

async function buildLabel(f) {
  templateP ||= loadImg(`${assetBase}/label-template.png`);
  const img = await templateP;
  await fontsReady;
  const W = img.width, Hh = img.height, half = W / 2, k = W / 1600;
  const c = document.createElement("canvas");
  c.width = W; c.height = Hh;
  const g = c.getContext("2d");
  g.fillStyle = "#050505"; // fond noir de l'étiquette
  g.fillRect(0, 0, W, Hh);
  g.drawImage(img, 0, 0);

  const line = (txt, y, maxW, size) => {
    g.font = `900 ${size}px ${LABEL_FONT}, system-ui, sans-serif`;
    const w = g.measureText(txt).width;
    g.save();
    g.translate(0, y);
    g.scale(Math.min(1, maxW / w), 1); // même hauteur de lettres pour tous : on resserre si le nom est long
    g.shadowColor = "rgba(0,0,0,0.7)";
    g.shadowBlur = 8 * k;
    g.shadowOffsetY = 4 * k;
    g.fillStyle = "#ffffff";
    g.fillText(txt, 0, 0);
    g.restore();
  };
  g.textAlign = "center";
  g.textBaseline = "middle";

  for (const off of [0, half]) {
    // Fruit (la Cerise garde son illustration d'origine)
    if (f.art) {
      cerisArtP ||= loadImg(f.label);
      const art = await cerisArtP;
      const sx = art.width / 1600;
      g.drawImage(art, (232 + 0) * sx, 712 * sx, 374 * sx, 366 * sx, off + 232 * k, 712 * k, 374 * k, 366 * k);
    } else {
      const fx = off + 420 * k, fy = 868 * k, fr = 128 * k;
      g.save();
      g.shadowColor = "rgba(0,0,0,0.55)";
      g.shadowBlur = 24 * k;
      g.shadowOffsetY = 10 * k;
      const grd = g.createRadialGradient(fx - fr * 0.4, fy - fr * 0.45, fr * 0.05, fx, fy, fr);
      grd.addColorStop(0, lighten((f.accent || f.hi), 0.75));
      grd.addColorStop(0.35, (f.accent || f.hi));
      grd.addColorStop(1, `rgb(${f.rgb})`);
      g.fillStyle = grd;
      g.beginPath(); g.arc(fx, fy, fr, 0, Math.PI * 2); g.fill();
      g.restore();
      // reflet
      g.fillStyle = "rgba(255,255,255,0.55)";
      g.beginPath(); g.ellipse(fx - fr * 0.38, fy - fr * 0.42, fr * 0.22, fr * 0.12, -0.6, 0, Math.PI * 2); g.fill();
      // feuille
      g.save();
      g.translate(fx + fr * 0.15, fy - fr * 0.95);
      g.rotate(-0.5);
      g.fillStyle = "#3f9a3a";
      g.beginPath(); g.ellipse(0, 0, fr * 0.42, fr * 0.16, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "rgba(255,255,255,0.35)";
      g.lineWidth = 3 * k;
      g.beginPath(); g.moveTo(-fr * 0.38, 0); g.lineTo(fr * 0.38, 0); g.stroke();
      g.restore();
    }
    // Nom FR + nom EN, comme « CERISE / CHERRY »
    g.save();
    g.translate(off + 395 * k, 620 * k);
    g.rotate(-0.05);
    line(f.name.toUpperCase(), -40 * k, 400 * k, 88 * k);
    line(f.en.toUpperCase(), 42 * k, 370 * k, 80 * k);
    g.restore();
  }
  return prepTex(new THREE.CanvasTexture(c));
}

async function getLabel(f) {
  if (labelCache.has(f.slug)) return labelCache.get(f.slug);
  const tex = await buildLabel(f);
  labelCache.set(f.slug, tex);
  return tex;
}
let labelReq = 0;
async function applyLabel(f) {
  const req = ++labelReq;
  const tex = await getLabel(f);
  if (req !== labelReq) return; // une autre saveur a été choisie entre-temps
  labelBackMat.map = labelFrontMat.map = tex;
  labelBackMat.needsUpdate = labelFrontMat.needsUpdate = true;
  labelFront.visible = true;
  status.hidden = true;
}

// Ombre de contact douce
const shadowCanvas = document.createElement("canvas");
shadowCanvas.width = shadowCanvas.height = 256;
const g = shadowCanvas.getContext("2d");
const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
grad.addColorStop(0, "rgba(0,0,0,0.7)");
grad.addColorStop(1, "rgba(0,0,0,0)");
g.fillStyle = grad;
g.fillRect(0, 0, 256, 256);
const shadow = new THREE.Mesh(
  new THREE.PlaneGeometry(4.2, 4.2),
  new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false })
);
shadow.rotation.x = -Math.PI / 2;
shadow.position.y = -HALF - 0.75;
scene.add(shadow);
shadow.visible = false; // remplacée par la vraie ombre du projecteur

// ---------- Mise en scène : la canette sous un projecteur ----------
const STAGE_FLOOR = -HALF - 0.75;
const floorFadeCanvas = document.createElement("canvas");
floorFadeCanvas.width = floorFadeCanvas.height = 512;
{
  const c = floorFadeCanvas.getContext("2d");
  const gr = c.createRadialGradient(256, 256, 0, 256, 256, 256);
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const k = Math.min(1, Math.max(0, (t - 0.25) / 0.75));
    const v = Math.round(255 * (1 - k * k * (3 - 2 * k)));
    gr.addColorStop(t, `rgb(${v},${v},${v})`);
  }
  c.fillStyle = gr;
  c.fillRect(0, 0, 512, 512);
}
const floor = new THREE.Mesh(
  new THREE.CircleGeometry(18, 96),
  new THREE.MeshStandardMaterial({
    color: 0x0c0c0d, roughness: 0.38, metalness: 0.25, envMapIntensity: 0.15,
    transparent: true, alphaMap: new THREE.CanvasTexture(floorFadeCanvas),
  })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = STAGE_FLOOR - 0.002;
floor.receiveShadow = true;
scene.add(floor);

const SPOT_ANGLE = 0.27;
const spot = new THREE.SpotLight(0xfff1dc, 9, 0, SPOT_ANGLE, 0.6, 0);
spot.position.set(0, 9.5, 2.2);
spot.target.position.set(0, STAGE_FLOOR, 0);
spot.castShadow = true;
spot.shadow.mapSize.set(2048, 2048);
spot.shadow.bias = -0.0004;
spot.shadow.normalBias = 0.03;
spot.shadow.camera.near = 2;
spot.shadow.camera.far = 22;
scene.add(spot, spot.target);
can.traverse((o) => { if (o.isMesh) o.castShadow = true; });

// Faisceau visible (cône lumineux, plus intense près du projecteur)
const beamDir = new THREE.Vector3().subVectors(spot.target.position, spot.position);
const beamH = beamDir.length();
beamDir.normalize();
const beamR = Math.tan(SPOT_ANGLE) * beamH;
const beamGeo = new THREE.ConeGeometry(beamR, beamH, 72, 1, true);
beamGeo.translate(0, -beamH / 2, 0); // pointe au niveau du projecteur
const beam = new THREE.Mesh(beamGeo, new THREE.ShaderMaterial({
  uniforms: { uColor: { value: new THREE.Color(0xfff1dc) }, uH: { value: beamH }, uStrength: { value: 0.2 } },
  vertexShader: `varying float vH; varying vec3 vN; varying vec3 vV;
    void main() {
      vH = -position.y;
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vN = normalize(normalMatrix * normal);
      vV = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: `uniform vec3 uColor; uniform float uH; uniform float uStrength;
    varying float vH; varying vec3 vN; varying vec3 vV;
    void main() {
      float t = clamp(vH / uH, 0.0, 1.0);
      float edge = pow(abs(dot(normalize(vN), normalize(vV))), 2.2);
      float a = edge * (1.0 - t * 0.6) * uStrength;
      gl_FragColor = vec4(uColor * a, a);
    }`,
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
}));
beam.position.copy(spot.position);
beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), beamDir);
scene.add(beam);

// Tache de lumière au sol
const poolCanvas = document.createElement("canvas");
poolCanvas.width = poolCanvas.height = 256;
{
  const c = poolCanvas.getContext("2d");
  const gr = c.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, "rgba(255,241,220,0.55)");
  gr.addColorStop(0.6, "rgba(255,241,220,0.18)");
  gr.addColorStop(1, "rgba(255,241,220,0)");
  c.fillStyle = gr;
  c.fillRect(0, 0, 256, 256);
}
const pool = new THREE.Mesh(
  new THREE.CircleGeometry(beamR * 1.25, 64),
  new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(poolCanvas), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
);
pool.rotation.x = -Math.PI / 2;
pool.position.set(spot.target.position.x, STAGE_FLOOR + 0.003, spot.target.position.z);
scene.add(pool);

// Poussière qui flotte dans le faisceau
const DUST = 320;
const dustPos = new Float32Array(DUST * 3);
const dustSeed = [];
for (let i = 0; i < DUST; i++) {
  const h = 0.08 + Math.random() * 0.9;
  const r = Math.sqrt(Math.random()) * beamR * h * 0.92;
  const a = Math.random() * Math.PI * 2;
  dustSeed.push({ h, r, a, sp: 0.02 + Math.random() * 0.05, ph: Math.random() * 6.28 });
}
const dustGeo = new THREE.BufferGeometry();
dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
  color: 0xfff1dc, size: 0.035, transparent: true, opacity: 0.65, depthWrite: false, blending: THREE.AdditiveBlending,
}));
scene.add(dust);
const _dp = new THREE.Vector3(), _px = new THREE.Vector3(), _pz = new THREE.Vector3();
_px.set(1, 0, 0).projectOnPlane(beamDir).normalize();
_pz.crossVectors(beamDir, _px).normalize();
function updateDust(t) {
  for (let i = 0; i < DUST; i++) {
    const d = dustSeed[i];
    const h = (d.h + t * d.sp * 0.05) % 1;
    const a = d.a + t * d.sp;
    const r = d.r * (0.95 + 0.05 * Math.sin(t * 0.7 + d.ph));
    _dp.copy(spot.position).addScaledVector(beamDir, beamH * Math.max(h, 0.08))
      .addScaledVector(_px, Math.cos(a) * r).addScaledVector(_pz, Math.sin(a) * r);
    dustPos[i * 3] = _dp.x; dustPos[i * 3 + 1] = _dp.y; dustPos[i * 3 + 2] = _dp.z;
  }
  dustGeo.attributes.position.needsUpdate = true;
}

// ---------- Mode « Verser » : jet simulé goutte à goutte ----------
// Chaque goutte sort de l'ouverture avec la vitesse de la canette, puis tombe (gravité).
// Le jet est un tube qui passe par toutes les gouttes : il se courbe quand on balade la canette.
const LIQUID = 0x9e0b22;
const flowCanvas = document.createElement("canvas");
flowCanvas.width = 256; flowCanvas.height = 64;
{
  const c = flowCanvas.getContext("2d");
  c.fillStyle = "#b8b8b8"; c.fillRect(0, 0, 256, 64);
  for (let i = 0; i < 26; i++) {
    const x = Math.random() * 256, w = 6 + Math.random() * 30, y = Math.random() * 64;
    const lg = c.createLinearGradient(x, 0, x + w, 0);
    lg.addColorStop(0, "rgba(255,255,255,0)"); lg.addColorStop(0.5, "rgba(255,255,255,0.6)"); lg.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = lg; c.fillRect(x, y, w, 3 + Math.random() * 6);
  }
}
const flowTex = new THREE.CanvasTexture(flowCanvas);
flowTex.colorSpace = THREE.SRGBColorSpace;
flowTex.wrapS = flowTex.wrapT = THREE.RepeatWrapping;
flowTex.repeat.set(3, 1);
const liquidMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff, map: flowTex, emissive: LIQUID, emissiveIntensity: 0.35,
  roughness: 0.06, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03,
  transparent: true, opacity: 0.9,
});
const stream = new THREE.Mesh(new THREE.BufferGeometry(), liquidMat);
stream.visible = false;
scene.add(stream);

const FLOOR = -HALF - 0.75;
const OPEN_OUT = OPENING.clone().add(new THREE.Vector3(0.12, 0.02, 0));
const MAX_DROPS = 240;
const drops = []; // ordre d'émission : la plus ancienne (la plus basse) en premier
let emitAcc = 0, hasPrevOpen = false;
const prevOpen = new THREE.Vector3(), openPos = new THREE.Vector3(), openVel = new THREE.Vector3();
const spoutOffset = new THREE.Vector3(0.9, -0.8, 0);

// Bulles entraînées dans le jet
const BUBBLES = 90;
const bubbles = new THREE.InstancedMesh(
  new THREE.SphereGeometry(1, 10, 8),
  new THREE.MeshStandardMaterial({ color: 0xffd6dc, emissive: 0xff8a9a, emissiveIntensity: 0.4, roughness: 0.1, transparent: true, opacity: 0.85 }),
  BUBBLES
);
const bubbleData = Array.from({ length: BUBBLES }, () => ({ u: Math.random(), sp: 0.3 + Math.random() * 0.5, r: 0.012 + Math.random() * 0.028, ang: Math.random() * Math.PI * 2, off: Math.random() * 0.08 }));
bubbles.visible = false;
scene.add(bubbles);

// Pétillement à l'ouverture
const FIZZ = 60;
const fizz = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshStandardMaterial({ color: 0xff5a6e, roughness: 0.05, transparent: true, opacity: 0.9 }), FIZZ);
const fizzData = Array.from({ length: FIZZ }, () => ({ age: 1 + Math.random(), life: 0.4 + Math.random() * 0.5, v: new THREE.Vector3(), p: new THREE.Vector3(), r: 0.012 + Math.random() * 0.025 }));
fizz.visible = false;
scene.add(fizz);

// Éclaboussures à l'impact
const SPLASH = 120;
const splash = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshStandardMaterial({ color: 0xd11a34, roughness: 0.05, emissive: 0x3a0008 }), SPLASH);
const splashData = Array.from({ length: SPLASH }, () => ({ alive: false, p: new THREE.Vector3(), v: new THREE.Vector3(), r: 0.02 }));
let splashIdx = 0;
scene.add(splash);

// Flaque qui s'étale au sol
const PUDDLES = 80;
const puddles = new THREE.InstancedMesh(
  new THREE.CircleGeometry(1, 40),
  new THREE.MeshPhysicalMaterial({ color: 0xa3102a, emissive: 0x2a0006, roughness: 0.06, clearcoat: 1, transparent: true, opacity: 0.88, depthWrite: false }),
  PUDDLES
);
const puddleData = Array.from({ length: PUDDLES }, () => ({ alive: false, x: 0, z: 0, r: 0, target: 0 }));
let puddleIdx = 0, puddleTimer = 0;
scene.add(puddles);

const POSE_REST = { rz: -0.08, x: 0, y: 0, tab: 0 };
const POSE_POUR = { rz: -1.95, x: -0.7, y: 1.35, tab: 0.55 };
let pouring = false, poseT = 0;
const pourPos = new THREE.Vector3(POSE_POUR.x, POSE_POUR.y, 0);
const pourPrev = new THREE.Vector3();
let pourSwing = 0;
const raycaster = new THREE.Raycaster();
const zPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const _hit = new THREE.Vector3(), _ndc = new THREE.Vector2(), _tgt = new THREE.Vector3();
const _axisW = new THREE.Vector3(), _sideW = new THREE.Vector3(), _wq = new THREE.Quaternion();
const lookAt = new THREE.Vector3();
const LOOK_REST = new THREE.Vector3(0, 0, 0), LOOK_POUR = new THREE.Vector3(0, -0.8, 0);
const CAM_POUR = new THREE.Vector3(0, 3.4, 13.4);

function setPouring(on) {
  if (on === pouring) return;
  pouring = on;
  drawBackdrop(pouring ? "PSCHITT" : cur.name.toUpperCase());
  if (pouring) {
    setSpin(false);
    pourPos.set(POSE_POUR.x, POSE_POUR.y, 0);
    hasPrevOpen = false;
    flyTo = { from: camera.position.clone(), to: CAM_POUR.clone(), t: reduceMotion ? 1 : 0 };
  } else {
    flyTo = { from: camera.position.clone(), to: views["v-front"].clone(), t: reduceMotion ? 1 : 0 };
  }
}

function spawnSplash(p, v) {
  const n = 2 + Math.floor(Math.random() * 2);
  for (let k = 0; k < n; k++) {
    const s = splashData[splashIdx];
    splashIdx = (splashIdx + 1) % SPLASH;
    s.alive = true;
    s.p.set(p.x, FLOOR + 0.02, p.z);
    const sp = 0.6 + Math.random() * 1.6;
    const a = Math.random() * Math.PI * 2;
    s.v.set(Math.cos(a) * sp + v.x * 0.25, 1.2 + Math.random() * 2.2, Math.sin(a) * sp + v.z * 0.25);
    s.r = 0.015 + Math.random() * 0.035;
  }
  if (puddleTimer <= 0) {
    puddleTimer = 0.05;
    const d = puddleData[puddleIdx];
    puddleIdx = (puddleIdx + 1) % PUDDLES;
    d.alive = true;
    d.x = p.x + (Math.random() - 0.5) * 0.25;
    d.z = p.z + (Math.random() - 0.5) * 0.25;
    d.r = 0.05;
    d.target = 0.35 + Math.random() * 0.45;
  }
}

const dummy = new THREE.Object3D();
const _open = new THREE.Vector3();
function updatePour(dt, t) {
  const f = (rate) => 1 - Math.exp(-rate * dt);
  const target = pouring ? 1 : 0;
  poseT += Math.sign(target - poseT) * Math.min(Math.abs(target - poseT), dt * (reduceMotion ? 100 : 0.9));
  const e = poseT < 0.5 ? 4 * poseT ** 3 : 1 - Math.pow(-2 * poseT + 2, 3) / 2;
  const free = 1 - e; // part laissée aux mouvements de la souris hors versement
  const ready = pouring && poseT >= 1;

  // En versement, l'ouverture de la canette suit le curseur
  _tgt.set(POSE_POUR.x, POSE_POUR.y, 0);
  if (ready && ix.inside) {
    _ndc.set(ix.nx, -ix.ny);
    raycaster.setFromCamera(_ndc, camera);
    if (raycaster.ray.intersectPlane(zPlane, _hit)) {
      _tgt.copy(_hit).sub(spoutOffset);
      _tgt.x = THREE.MathUtils.clamp(_tgt.x, -5, 4);
      _tgt.y = THREE.MathUtils.clamp(_tgt.y, -0.4, 3.4);
      _tgt.z = 0;
    }
  }
  pourPrev.copy(pourPos);
  pourPos.lerp(_tgt, f(7));
  const vx = dt > 0 ? (pourPos.x - pourPrev.x) / dt : 0;
  pourSwing += (THREE.MathUtils.clamp(-vx * 0.05, -0.45, 0.45) - pourSwing) * f(6);

  rig.rotation.z = THREE.MathUtils.lerp(POSE_REST.rz, POSE_POUR.rz, e) + ix.tiltZ * free + pourSwing * e;
  rig.rotation.x = ix.tiltX * free;
  const bob = reduceMotion ? 0 : Math.sin(t * 1.1) * 0.12 * free;
  rig.position.x = THREE.MathUtils.lerp(POSE_REST.x, pourPos.x, e);
  rig.position.y = THREE.MathUtils.lerp(POSE_REST.y, pourPos.y, e) + bob;
  can.rotation.y = ix.yaw;
  tabPivot.rotation.z = Math.min(1, poseT * 4) * POSE_POUR.tab;
  holeMesh.visible = poseT > 0.05;
  shadow.material.opacity = free * (0.85 - bob);
  lookAt.lerpVectors(LOOK_REST, LOOK_POUR, e);

  // Niveau de boisson : baisse pendant qu'on verse, se remplit (magie Dada) quand on referme
  const flowing = ready && drops.length > 15;
  fill = flowing ? Math.max(0.38, fill - dt * 0.07) : Math.min(1, fill + dt * 0.25);
  updateLiquid(dt);

  // Bulles intérieures : montent et disparaissent en atteignant la surface (où qu'elle soit)
  const pl = liqUniforms.uPlane.value;
  innerData.forEach((b, i) => {
    b.y += dt * b.sp * (flowing ? 2.2 : 1) * (1 + slosh.w.length() * 3);
    dummy.position.set(b.x + Math.sin(t * 2 + b.ph) * 0.02, LIQ_BOTTOM + 0.05 + b.y * FILL_FULL, b.z);
    _p.copy(dummy.position);
    can.localToWorld(_p);
    if (b.y > 1 || _p.x * pl.x + _p.y * pl.y + _p.z * pl.z > pl.w - 0.04) {
      b.y = 0;
      dummy.position.y = LIQ_BOTTOM + 0.05;
    }
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(b.s * (0.7 + b.y * 0.6));
    dummy.updateMatrix();
    inner.setMatrixAt(i, dummy.matrix);
  });
  inner.instanceMatrix.needsUpdate = true;

  // ----- Émission des gouttes -----
  rig.updateMatrixWorld(true);
  can.localToWorld(openPos.copy(OPEN_OUT));
  spoutOffset.subVectors(openPos, rig.position);
  if (hasPrevOpen && dt > 0) openVel.subVectors(openPos, prevOpen).divideScalar(dt).clampLength(0, 40);
  else openVel.set(0, 0, 0);
  if (ready) {
    can.getWorldQuaternion(_wq);
    _axisW.set(0, 1, 0).applyQuaternion(_wq);
    _sideW.set(1, 0, 0).applyQuaternion(_wq);
    emitAcc += dt * 75;
    const n = Math.floor(emitAcc);
    emitAcc -= n;
    for (let k = 0; k < n; k++) {
      const a = (k + 1) / n;
      const p = hasPrevOpen ? prevOpen.clone().lerp(openPos, a) : openPos.clone();
      const v = _axisW.clone().multiplyScalar(1.7).addScaledVector(_sideW, 0.35).addScaledVector(openVel, 0.6);
      v.x += (Math.random() - 0.5) * 0.05;
      v.z += (Math.random() - 0.5) * 0.05;
      drops.push({ p, v });
    }
  }
  prevOpen.copy(openPos);
  hasPrevOpen = true;

  // ----- Chute des gouttes -----
  puddleTimer -= dt;
  for (const d of drops) {
    d.v.y -= 11 * dt;
    d.p.addScaledVector(d.v, dt);
  }
  for (let i = drops.length - 1; i >= 0; i--) {
    if (drops[i].p.y < FLOOR) { spawnSplash(drops[i].p, drops[i].v); drops.splice(i, 1); }
  }
  while (drops.length > MAX_DROPS) drops.shift();

  // ----- Le jet : un tube qui passe par toutes les gouttes -----
  if (drops.length >= 4) {
    const curve = new THREE.CatmullRomCurve3(drops.map((d) => d.p), false, "centripetal");
    stream.geometry.dispose();
    stream.geometry = new THREE.TubeGeometry(curve, Math.min(drops.length * 2, 360), 0.09, 12, false);
    stream.visible = true;
    flowTex.offset.x -= dt * 2.4;
  } else {
    stream.visible = false;
  }

  // Bulles dans le jet
  bubbles.visible = drops.length >= 4;
  if (bubbles.visible) {
    bubbleData.forEach((b, i) => {
      b.u -= dt * b.sp * 0.6;
      if (b.u < 0) b.u += 1;
      const d = drops[Math.floor(b.u * (drops.length - 1))];
      dummy.position.set(d.p.x + Math.cos(b.ang + t * 3) * b.off, d.p.y, d.p.z + Math.sin(b.ang + t * 3) * b.off);
      dummy.scale.setScalar(b.r * (0.8 + 0.2 * Math.sin(t * 8 + i)));
      dummy.updateMatrix();
      bubbles.setMatrixAt(i, dummy.matrix);
    });
    bubbles.instanceMatrix.needsUpdate = true;
  }

  // Pétillement à l'ouverture
  fizz.visible = ready;
  if (ready) {
    fizzData.forEach((d, i) => {
      d.age += dt / d.life;
      if (d.age >= 1) {
        d.p.copy(openPos);
        d.v.set((Math.random() - 0.5) * 1.6, 0.8 + Math.random() * 1.6, (Math.random() - 0.5) * 1.4).addScaledVector(openVel, 0.3);
        d.age = 0;
      }
      d.v.y -= 7 * dt;
      d.p.addScaledVector(d.v, dt);
      dummy.position.copy(d.p);
      dummy.scale.setScalar(d.r * (1 - d.age));
      dummy.updateMatrix();
      fizz.setMatrixAt(i, dummy.matrix);
    });
    fizz.instanceMatrix.needsUpdate = true;
  }

  // Éclaboussures
  splashData.forEach((s, i) => {
    if (s.alive) {
      s.v.y -= 11 * dt;
      s.p.addScaledVector(s.v, dt);
      if (s.p.y < FLOOR) s.alive = false;
    }
    dummy.position.copy(s.p);
    dummy.scale.setScalar(s.alive ? s.r : 0);
    dummy.updateMatrix();
    splash.setMatrixAt(i, dummy.matrix);
  });
  splash.instanceMatrix.needsUpdate = true;

  // Flaque : s'étale pendant qu'on verse, se résorbe quand on referme
  puddleData.forEach((d, i) => {
    if (d.alive) {
      const goal = pouring ? d.target : 0;
      d.r += (goal - d.r) * f(pouring ? 2.5 : 1.2);
      if (!pouring && d.r < 0.01) d.alive = false;
    }
    dummy.position.set(d.x, FLOOR + 0.004 + i * 0.0004, d.z);
    dummy.rotation.set(-Math.PI / 2, 0, 0);
    dummy.scale.setScalar(d.alive ? d.r : 0);
    dummy.updateMatrix();
    puddles.setMatrixAt(i, dummy.matrix);
  });
  puddles.instanceMatrix.needsUpdate = true;
  dummy.rotation.set(0, 0, 0);
}

// ---------- Contrôles : on manipule la canette elle-même ----------
// Glisser = la faire tourner et la secouer ; survoler = elle suit légèrement le curseur.
const ix = { yaw: 0, yawVel: 0, spin: true, tiltX: 0, tiltZ: 0, tgtX: 0, tgtZ: 0, dragging: false, lx: 0, ly: 0, nx: 0, ny: 0, swing: 0, inside: false };
canvas.addEventListener("pointerdown", (ev) => {
  if (pouring) return;
  ix.dragging = true;
  ix.lx = ev.clientX; ix.ly = ev.clientY;
  canvas.setPointerCapture(ev.pointerId);
});
canvas.addEventListener("pointermove", (ev) => {
  const r = canvas.getBoundingClientRect();
  ix.nx = ((ev.clientX - r.left) / r.width) * 2 - 1;
  ix.ny = ((ev.clientY - r.top) / r.height) * 2 - 1;
  ix.inside = true;
  if (!ix.dragging) return;
  const dx = ev.clientX - ix.lx, dy = ev.clientY - ix.ly;
  ix.lx = ev.clientX; ix.ly = ev.clientY;
  ix.yaw += dx * 0.012;
  ix.yawVel = dx * 0.7;
  ix.swing = THREE.MathUtils.clamp(ix.swing - dx * 0.035, -0.7, 0.7);
  ix.tgtX = THREE.MathUtils.clamp(ix.tgtX + dy * 0.007, -0.75, 0.75);
});
const endDrag = () => { ix.dragging = false; };
canvas.addEventListener("pointerup", endDrag);
canvas.addEventListener("pointercancel", endDrag);
canvas.addEventListener("pointerleave", () => { ix.inside = false; if (!ix.dragging) { ix.nx = 0; ix.ny = 0; } });
// Clavier : flèches pour tourner / pencher
canvas.tabIndex = 0;
canvas.addEventListener("keydown", (ev) => {
  if (ev.key === "ArrowLeft") ix.yawVel -= 2.5;
  else if (ev.key === "ArrowRight") ix.yawVel += 2.5;
  else if (ev.key === "ArrowUp") ix.tgtX = Math.max(-0.75, ix.tgtX - 0.25);
  else if (ev.key === "ArrowDown") ix.tgtX = Math.min(0.75, ix.tgtX + 0.25);
  else return;
  ev.preventDefault();
});

function updateInteraction(dt) {
  const f = (rate) => 1 - Math.exp(-rate * dt);
  if (pouring) {
    // Revient face caméra pour que l'ouverture soit du bon côté
    const home = Math.round(ix.yaw / (Math.PI * 2)) * Math.PI * 2;
    ix.yaw += (home - ix.yaw) * f(4);
    ix.yawVel = 0; ix.tgtX = 0; ix.swing = 0;
  } else if (!ix.dragging) {
    ix.yaw += ((ix.spin ? 0.55 : 0) + ix.yawVel) * dt;
    ix.yawVel *= Math.exp(-2.5 * dt);
    ix.tgtX += (ix.ny * 0.16 - ix.tgtX) * f(2.5); // relâché : se redresse, suit un peu le curseur
    ix.swing *= Math.exp(-3 * dt);
  } else {
    ix.swing *= Math.exp(-5 * dt);
  }
  ix.tgtZ = ix.swing - (ix.dragging ? 0 : ix.nx * 0.18);
  ix.tiltX += (ix.tgtX - ix.tiltX) * f(9);
  ix.tiltZ += (ix.tgtZ - ix.tiltZ) * f(9);
}

const views = {
  "v-front": new THREE.Vector3(0, 0.6, 14),
  "v-side": new THREE.Vector3(14, 0.6, 0),
  "v-top": new THREE.Vector3(0, 11.5, 6.5),
};
let flyTo = null;
function setView(id) {
  if (!views[id]) return;
  flyTo = { from: camera.position.clone(), to: views[id].clone(), t: reduceMotion ? 1 : 0 };
  setSpin(false);
}
function setSpin(on) {
  ix.spin = on;
}
setSpin(!reduceMotion);

// Recentre la canette à droite sur grand écran, au centre sur téléphone
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  const wide = w > 760;
  camera.setViewOffset(w, h, wide ? -w * 0.12 : 0, wide ? 0 : -h * 0.04, w, h);
  camera.fov = wide ? 30 : 36;
  camera.updateProjectionMatrix();
  // Le fond couvre tout l'écran (avec marge pour le décalage), sans déformer le mot
  const hNeed = 2 * BD_DIST * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 1.5;
  const sx = Math.max(hNeed * camera.aspect, hNeed * 16 / 9);
  backdrop.scale.set(sx, sx * 9 / 16, 1);
}
const ro = new ResizeObserver(resize);
ro.observe(canvas);
resize();

// ---------- Changer de saveur ----------
const white = new THREE.Color(0xffffff);
function setFlavor(f, first = false) {
  cur = f;
  drinkMat.color.setHex(f.liq);
  drinkMat.attenuationColor.setHex(f.atten);
  drinkMat.attenuationDistance = f.dark ? 0.22 : 0.85;
  drinkMat.transmission = f.dark ? 0.55 : 0.82;
  surfMat.color.setHex(f.surf);
  surfMat.emissive.setHex(f.atten);
  liquidMat.color.setHex(f.liq);
  liquidMat.emissive.setHex(f.atten);
  splash.material.color.setHex(f.liq);
  splash.material.emissive.setHex(f.atten);
  puddles.material.color.setHex(f.liq).multiplyScalar(0.8);
  puddles.material.emissive.setHex(f.atten).multiplyScalar(0.4);
  fizz.material.color.setHex(f.liq);
  const light = new THREE.Color(f.liq).lerp(white, 0.75);
  bubbles.material.color.copy(light);
  bubbles.material.emissive.setHex(f.liq);
  inner.material.color.copy(light);
  inner.material.emissive.setHex(f.liq);
  drawBackdrop(pouring ? "PSCHITT" : f.name.toUpperCase());
  rim.color.set(`rgb(${f.rgb})`);
  applyLabel(f);
  // Un tour sur elle-même et un coup de ballottement à chaque changement
  if (!first && !pouring) {
    ix.yawVel += 7;
    slosh.v.x += 1.6;
  }
}
setFlavor(cur, true);

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  if (flyTo) {
    flyTo.t = Math.min(1, flyTo.t + 0.03);
    const e = 1 - Math.pow(1 - flyTo.t, 3);
    const p = flyTo.from.clone().lerp(flyTo.to, e).setLength(flyTo.from.length() + (flyTo.to.length() - flyTo.from.length()) * e);
    camera.position.copy(p);
    if (flyTo.t >= 1) flyTo = null;
  }
  camera.lookAt(lookAt);
  updateInteraction(dt);
  updatePour(dt, t);
  updateDust(t);
  renderer.render(scene, camera);
});

return {
  setFlavor,
  setPouring,
  setView,
  setSpin,
  dispose() {
    renderer.setAnimationLoop(null);
    ro.disconnect();
    labelCache.forEach((tex) => tex.dispose());
    pmrem.dispose();
    renderer.dispose();
  },
};
}
