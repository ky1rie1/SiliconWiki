import * as THREE from 'three';
import { ModelResources } from '../assembly/modelResources';
import { batchStaticMeshes } from '../assembly/batchStaticMeshes';
import { clampSeparation } from './previewState';
import type { Vec3 } from '../assembly/animation';

/** Original AM5-like teaching study, 100 mm/unit. Not a certified socket/CAD footprint. */
export function createSocketModel() {
  const r = new ModelResources();
  const root = new THREE.Group();
  const textures: THREE.Texture[] = [];
  const pcb = r.material('study-pcb', 0x203d35, .18, .77);
  const polymer = r.material('study-polymer', 0x111817, .04, .48);
  const metal = r.material('study-nickel', 0xb8c2c5, .92, .29);
  const darkMetal = r.material('study-anodized', 0x303938, .75, .35);
  const gold = r.material('study-gold', 0xc9a35a, .8, .3);
  const ceramic = r.material('study-ceramic', 0x5e6158, .3, .58);
  const silver = r.material('study-solder', 0x899793, .85, .36);
  // A small deterministic surface map adds machining grain without more geometry.
  if (typeof document !== 'undefined') {
    const surface = document.createElement('canvas'); surface.width = surface.height = 256;
    const brush = surface.getContext('2d');
    if (brush) {
      brush.fillStyle = '#b8b8b8'; brush.fillRect(0, 0, 256, 256);
      for (let y = 0; y < 256; y++) {
        const tone = 155 + ((y * 73 + 19) % 65);
        brush.fillStyle = `rgb(${tone},${tone},${tone})`; brush.fillRect(0, y, 256, 1);
      }
      const grain = new THREE.CanvasTexture(surface); grain.wrapS = grain.wrapT = THREE.RepeatWrapping;
      grain.repeat.set(3, 3); textures.push(grain);
      metal.roughness = .47; metal.roughnessMap = grain; metal.bumpMap = grain; metal.bumpScale = .0002;
    }
  }
  const group = (parent: THREE.Object3D, p: Vec3) => {
    const g = new THREE.Group(); g.position.set(...p); parent.add(g); return g;
  };
  const label = (parent: THREE.Object3D, text: string, p: Vec3, width: number, color = '#bdc9bf') => {
    const mesh = r.label(parent, text, p, width, color);
    if (mesh) { mesh.rotation.x = -Math.PI / 2; mesh.scale.y = width / 4; }
  };
  function screw(parent: THREE.Object3D, x: number, z: number, y = .055) {
    r.cylinder(parent, .023, .009, [x, y, z], metal, 20);
    r.box(parent, [.024, .0015, .004], [x, y + .005, z], polymer);
    r.box(parent, [.004, .0015, .024], [x, y + .005, z], polymer);
  }

  // Thin board crop with actual edge depth; no invented complete board layout.
  r.box(root, [1.2, .018, 1.08], [0, -.012, 0], pcb, .012);
  r.box(root, [1.19, .003, 1.07], [0, -.023, 0], darkMetal, .007);
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = '#789786'; ctx.lineWidth = 1;
      for (let i = 0; i < 65; i++) {
        const n = i * 13 + 30;
        ctx.globalAlpha = .14 + (i % 5) * .035;
        ctx.beginPath(); ctx.moveTo(n, 60); ctx.lineTo(n, 190 + i % 8 * 18);
        ctx.lineTo(n + 60, 250 + i % 8 * 18); ctx.lineTo(n + 60, 900); ctx.stroke();
      }
      ctx.globalAlpha = .7; ctx.fillStyle = '#aebdb3'; ctx.font = '12px monospace';
      for (let i = 0; i < 10; i++) ctx.fillText(`C${120 + i}   R${38 + i}`, 55 + (i % 2) * 780, 110 + i * 82);
      const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; textures.push(texture);
      const ink = r.material('study-board-print', 0xffffff, 0, .9); ink.map = texture; ink.transparent = true; ink.depthWrite = false;
      const print = r.mesh(root, r.geometry('study-print-plane', () => new THREE.PlaneGeometry(1.19, 1.07)), ink, [0, -.001, 0]);
      print.rotation.x = -Math.PI / 2; print.castShadow = false;
    }
  }
  // Shared components around the socket: capacitors, VRM chokes, solder lands.
  for (let i = 0; i < 8; i++) {
    const z = -.42 + i * .105;
    r.box(root, [.095, .072, .082], [-.415, .036, z], darkMetal, .008);
    label(root, 'R22', [-.415, .074, z], .058, '#697873');
    r.cylinder(root, .026, .07, [-.32, .035, z], polymer, 20);
    r.cylinder(root, .025, .003, [-.32, .071, z], metal, 20);
    r.box(root, [.036, .016, .045], [-.53, .009, z], polymer, .003);
  }
  const smds: Vec3[] = [];
  for (let i = 0; i < 40; i++) smds.push([-.48 + (i % 10) * .09, .006, .38 + Math.floor(i / 10) * .035]);
  r.instancesOf(root, r.geometry('study-smd', () => new THREE.BoxGeometry(.018, .012, .01)), ceramic, smds);
  r.instancesOf(root, r.geometry('study-smd-end', () => new THREE.BoxGeometry(.004, .013, .011)), silver,
    smds.flatMap(([x, y, z]) => [[x - .008, y, z], [x + .008, y, z]] as Vec3[]));
  // A heatsink shows a real silhouette; repeated fins share geometry.
  r.box(root, [.13, .09, .83], [-.55, .045, -.015], darkMetal, .008);
  r.instancesOf(root, r.geometry('study-fin', () => new THREE.BoxGeometry(.009, .04, .8)), metal,
    Array.from({ length: 8 }, (_, i) => [-.605 + i * .015, .1, -.015] as Vec3));
  // Cropped DIMM slot pair, including the central notch and separate end latches.
  for (const x of [.415, .505]) {
    r.box(root, [.055, .056, .91], [x, .028, -.02], polymer, .004);
    r.box(root, [.016, .002, .85], [x, .057, -.02], darkMetal);
    r.box(root, [.018, .013, .024], [x, .06, .04], polymer);
    for (const z of [-.49, .45]) r.box(root, [.061, .068, .045], [x, .039, z], darkMetal, .008);
  }
  label(root, 'DDR5_A2     DDR5_B2', [.46, .004, .51], .28);
  label(root, 'SILICON WIKI  /  SOCKET STUDY', [-.04, .004, -.47], .62);
  for (const x of [-.55, .55]) for (const z of [-.47, .47]) {
    r.cylinder(root, .027, .004, [x, .002, z], gold, 24);
    r.cylinder(root, .014, .005, [x, .005, z], polymer, 20);
  }

  // LGA contacts belong to the socket. CPU has flat lands on its underside.
  r.box(root, [.49, .032, .49], [0, .016, 0], polymer, .009);
  r.box(root, [.385, .004, .385], [0, .035, 0], darkMetal, .004);
  const contacts: Vec3[] = [];
  for (let z = 0; z < 32; z++) for (let x = 0; x < 32; x++) {
    if (x > 11 && x < 20 && z > 11 && z < 20) continue;
    contacts.push([-.176 + x * .01135, .04, -.176 + z * .01135]);
  }
  const pins = r.instancesOf(root, r.geometry('study-contact', () => new THREE.BoxGeometry(.003, .007, .0025)), gold, contacts);
  pins.castShadow = false;
  for (const x of [-.225, .225]) r.box(root, [.032, .025, .46], [x, .041, 0], polymer, .003);
  for (const z of [-.225, .225]) r.box(root, [.46, .025, .032], [0, .041, z], polymer, .003);

  const cpu = group(root, [0, .052, 0]); cpu.name = 'intact-processor-package';
  r.box(cpu, [.4, .012, .4], [0, .006, 0], pcb, .005);
  r.box(cpu, [.395, .002, .395], [0, .0005, 0], darkMetal, .004);
  const lands = r.instancesOf(cpu, r.geometry('study-cpu-land', () => new THREE.BoxGeometry(.005, .001, .005)), gold,
    contacts.map(([x, , z]) => [x, -.001, z])); lands.castShadow = false;
  // Eight notched lobes approximate the AM5 IHS profile, not an exact mechanical drawing.
  const outline = new THREE.Shape();
  const points = [[-.12,-.185],[-.055,-.185],[-.055,-.147],[.055,-.147],[.055,-.185],[.12,-.185],[.12,-.12],[.185,-.12],[.185,-.055],[.147,-.055],[.147,.055],[.185,.055],[.185,.12],[.12,.12],[.12,.185],[.055,.185],[.055,.147],[-.055,.147],[-.055,.185],[-.12,.185],[-.12,.12],[-.185,.12],[-.185,.055],[-.147,.055],[-.147,-.055],[-.185,-.055],[-.185,-.12],[-.12,-.12]];
  points.forEach(([x, y], i) => i ? outline.lineTo(x, y) : outline.moveTo(x, y)); outline.closePath();
  const ihs = r.geometry('study-ihs', () => new THREE.ExtrudeGeometry(outline, { depth: .025, bevelEnabled: true, bevelThickness: .002, bevelSize: .002, bevelSegments: 2, steps: 1 }).rotateX(-Math.PI / 2));
  r.mesh(cpu, ihs, metal, [0, .014, 0]);
  label(cpu, 'Si', [0, .045, -.045], .28, '#283330');
  label(cpu, 'AM5', [0, .045, .045], .18, '#283330');
  label(cpu, 'TEACHING STUDY', [0, .045, .103], .23, '#4a5655');
  const triangle = new THREE.Shape(); triangle.moveTo(0, 0); triangle.lineTo(.026, 0); triangle.lineTo(0, .026); triangle.closePath();
  const markGeometry = r.geometry('study-triangle', () => new THREE.ShapeGeometry(triangle).rotateX(-Math.PI / 2));
  r.mesh(cpu, markGeometry, gold, [-.193, .013, .192]);
  r.mesh(root, markGeometry, gold, [-.247, .06, .245]);

  // Hinged open frame: CPU stays one package throughout separation.
  const retention = group(root, [0, .069, -.276]); retention.name = 'retention-frame';
  const frame = new THREE.Shape(); frame.moveTo(-.26, 0); frame.lineTo(.26, 0); frame.lineTo(.26, .56); frame.lineTo(-.26, .56); frame.closePath();
  const hole = new THREE.Path(); hole.moveTo(-.187, .074); hole.lineTo(-.187, .486); hole.lineTo(.187, .486); hole.lineTo(.187, .074); hole.closePath(); frame.holes.push(hole);
  r.mesh(retention, r.geometry('study-retention', () => new THREE.ExtrudeGeometry(frame, { depth: .012, bevelEnabled: true, bevelThickness: .002, bevelSize: .004, bevelSegments: 2, steps: 1 }).rotateX(Math.PI / 2).translate(0, .012, 0)), metal);
  for (const x of [-.21, .21]) { screw(retention, x, .028, .016); screw(root, x, .31, .055); }
  r.box(root, [.56, .025, .035], [0, .04, -.28], metal, .005);
  const lever = group(root, [.292, .063, .27]); lever.name = 'locking-lever';
  r.tube(lever, [[0,0,0],[0,0,-.52],[-.012,0,-.57],[-.065,.004,-.59]], .009, metal);
  r.box(root, [.028, .029, .028], [.292, .045, -.24], polymer, .004);

  function apply(value: number) {
    const t = clampSeparation(value);
    lever.rotation.x = Math.min(1, t / .15) * Math.PI * .53;
    retention.rotation.x = -Math.min(1, Math.max(0, (t - .08) / .24)) * Math.PI * .57;
    cpu.position.y = .052 + Math.max(0, (t - .35) / .65) * .38;
    root.updateMatrixWorld(true);
  }
  batchStaticMeshes(root, r);
  apply(0);
  let disposed = false;
  return { root, cpu, retention, lever, apply, dispose() {
    if (disposed) return; disposed = true; r.dispose(); textures.forEach(texture => texture.dispose());
  } };
}
