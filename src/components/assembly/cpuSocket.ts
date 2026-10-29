import * as THREE from 'three';
import type { ModelResources } from './modelResources';
import type { Vec3 } from './animation';
import { brushedSurface } from './hardwareSurfaces';

/** AM5-style structure in the main model's XY board plane. Dimensions/pin count are illustrative. */
export function createCpuSocket(r: ModelResources) {
  const socket = new THREE.Group(); const cpu = new THREE.Group();
  const black = r.material('socket-polymer', 0x141b18, .03, .68);
  const pcb = r.material('cpu-substrate', 0x244c3b, .12, .7);
  const nickel = r.material('socket-nickel', 0xb5bfc1, .94, .38);
  nickel.roughnessMap = brushedSurface(r); nickel.bumpMap = nickel.roughnessMap; nickel.bumpScale = .00012;
  const gold = r.material('socket-gold', 0xc7a65e, .85, .3);
  const ceramic = r.material('socket-ceramic', 0x726d5f, .2, .65);
  r.box(socket, [.54, .56, .055], [0, 0, 0], black, .01);
  r.box(socket, [.39, .4, .009], [0, 0, .032], pcb, .004);
  for (const x of [-.232, .232]) r.box(socket, [.046, .43, .03], [x, 0, .035], black, .004);
  const contacts: Vec3[] = [];
  for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) {
    if (x > 8 && x < 15 && y > 8 && y < 15) continue;
    contacts.push([-.178 + x * .0155, -.178 + y * .0155, .043]);
  }
  const pins = r.instancesOf(socket, r.geometry('socket-lga-contacts', () => new THREE.BoxGeometry(.004, .007, .01)), gold, contacts);
  pins.castShadow = false;
  r.box(cpu, [.4, .4, .025], [0, 0, 0], pcb, .004);
  const lands = r.instancesOf(cpu, r.geometry('cpu-flat-lands', () => new THREE.PlaneGeometry(.007, .007).rotateY(Math.PI)), gold, contacts.map(([x, y]) => [x, y, -.0127]));
  lands.castShadow = false;
  const outline = new THREE.Shape();
  const points = [[-.12,-.185],[-.055,-.185],[-.055,-.15],[.055,-.15],[.055,-.185],[.12,-.185],[.12,-.12],[.185,-.12],[.185,-.055],[.15,-.055],[.15,.055],[.185,.055],[.185,.12],[.12,.12],[.12,.185],[.055,.185],[.055,.15],[-.055,.15],[-.055,.185],[-.12,.185],[-.12,.12],[-.185,.12],[-.185,.055],[-.15,.055],[-.15,-.055],[-.185,-.055],[-.185,-.12],[-.12,-.12]];
  points.forEach(([x, y], i) => i ? outline.lineTo(x, y) : outline.moveTo(x, y)); outline.closePath();
  const ihs = r.mesh(cpu, r.geometry('notched-ihs', () => new THREE.ExtrudeGeometry(outline, { depth: .025, bevelEnabled: true, bevelThickness: .002, bevelSize: .002, bevelSegments: 2, steps: 1 })), nickel, [0, 0, .015]);
  ihs.name = 'am5-notched-heatspreader'; ihs.userData.surface = 'heatspreader';
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#38413d'; ctx.textAlign = 'center';
      ctx.font = '500 76px sans-serif'; ctx.fillText('Si', 128, 110);
      ctx.font = '500 28px monospace'; ctx.fillText('AM5', 128, 158);
      ctx.font = '14px monospace'; ctx.fillText('SOCKET STUDY', 128, 195);
      const map = r.texture('cpu-etching', () => { const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; return t; });
      const ink = r.material('cpu-etching', 0xffffff, 0, .8); ink.map = map; ink.transparent = true; ink.depthWrite = false;
      const print = r.mesh(cpu, r.geometry('cpu-etching-plane', () => new THREE.PlaneGeometry(.3, .3)), ink, [0, 0, .044]); print.castShadow = false;
    }
  }
  const smds: Vec3[] = [];
  for (const sign of [-1, 1]) for (let i = 0; i < 5; i++) smds.push([sign * .177, -.035 + i * .0175, .018], [-.035 + i * .0175, sign * .177, .018]);
  r.instancesOf(cpu, r.geometry('cpu-edge-smd', () => new THREE.BoxGeometry(.008, .008, .007)), ceramic, smds);
  const marker = new THREE.Shape(); marker.moveTo(0, 0); marker.lineTo(.027, 0); marker.lineTo(0, .027); marker.closePath();
  const mark = r.geometry('cpu-alignment', () => new THREE.ShapeGeometry(marker));
  r.mesh(cpu, mark, gold, [-.195, -.195, .013]); r.mesh(socket, mark, gold, [-.265, -.275, .029]);

  const latch = new THREE.Group(); latch.position.set(0, .296, .087); socket.add(latch);
  const frame = new THREE.Shape(); frame.moveTo(-.24, .012); frame.lineTo(.24, .012); frame.lineTo(.27, -.04); frame.lineTo(.27, -.50); frame.lineTo(.225, -.578); frame.lineTo(-.225, -.578); frame.lineTo(-.27, -.50); frame.lineTo(-.27, -.04); frame.closePath();
  const hole = new THREE.Path(); hole.moveTo(-.191, -.075); hole.lineTo(-.191, -.505); hole.lineTo(.191, -.505); hole.lineTo(.191, -.075); hole.closePath(); frame.holes.push(hole);
  r.mesh(latch, r.geometry('socket-retention-frame', () => new THREE.ExtrudeGeometry(frame, { depth: .014, bevelEnabled: true, bevelThickness: .002, bevelSize: .004, bevelSegments: 2, steps: 1 })), nickel);
  const hinge = r.cylinder(socket, .024, .53, [0, .296, .077], nickel, 20); hinge.rotation.z = Math.PI / 2;
  for (const x of [-.235, .235]) for (const y of [-.335, .34]) {
    const head = r.cylinder(socket, .025, .018, [x, y, .067], nickel, 20); head.rotation.x = Math.PI / 2;
    r.box(socket, [.029, .005, .003], [x, y, .077], black); r.box(socket, [.005, .029, .003], [x, y, .077], black);
  }
  const lever = new THREE.Group(); lever.position.set(.314, -.30, .071); socket.add(lever);
  r.tube(lever, [[0,0,0],[0,.56,0],[-.012,.61,.015],[-.068,.63,.017]], .009, nickel);
  r.box(socket, [.03, .037, .04], [.314, .20, .045], black, .003);
  return { socket, cpu, latch, lever };
}
