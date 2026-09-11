import * as THREE from 'three';
import { assemblyFrame, BOARD_MOUNT, type Vec3 } from './animation';
import { ModelResources } from './modelResources';

// Representative ATX / AM5 layout. One scene unit is 100 mm; not a vendor CAD model.
export const CPU_POSITION: Vec3 = [-.38, .68, .115];
const SSD_POSITION: Vec3 = [-.7, -.03, .08];
const GPU_POSITION: Vec3 = [-.32, .02, .05];
const RAM_X = [.55, .67, .79, .91];

export function createPCModel() {
  const resources = new ModelResources();
  const root = new THREE.Group();
  const parts = new Map<string, THREE.Group>();
  const fans: THREE.Group[] = [];
  const r = resources;
  const black = r.material('anodised', 0x20272c, .65, .36);
  const edge = r.material('frame', 0x424c52, .7, .3);
  const plastic = r.material('polymer', 0x11191d, .05, .64);
  const silver = r.material('aluminium', 0xadb8bd, .85, .3);
  const darkSilver = r.material('brushed', 0x606e75, .82, .38);
  const gold = r.material('contacts', 0xb99c53, .82, .3);
  const pcb = r.material('pcb', 0x163331, .3, .7);
  const chip = r.material('silicon-packages', 0x1b2527, .2, .5);
  const copper = r.material('nickel-heatpipes', 0x9fa8a8, .92, .23);
  const cableMat = r.material('braided-cables', 0x343b40, .05, .95);
  const light = r.material('status-led', 0xc9a95c, .2, .35);
  light.emissive.set(0xf2c96a);
  light.emissiveIntensity = 0;

  function group(parent: THREE.Object3D, position: Vec3 = [0, 0, 0], key?: string) {
    const result = new THREE.Group();
    result.position.set(...position); parent.add(result);
    if (key) { result.userData.component = key; parts.set(key, result); }
    return result;
  }
  function screws(parent: THREE.Object3D, positions: Vec3[], radius = .025) {
    const geometry = r.geometry(`screw:${radius}`, () => new THREE.CylinderGeometry(radius, radius, .018, 12).rotateX(Math.PI / 2));
    r.instancesOf(parent, geometry, silver, positions);
    r.instancesOf(parent, r.geometry(`screw-slot:${radius}`, () => new THREE.BoxGeometry(radius * 1.1, .008, .005)), plastic, positions.map(p => [p[0], p[1], p[2] + .012]));
  }
  function fan(parent: THREE.Object3D, diameter: number, position: Vec3, rotation: Vec3 = [0, 0, 0]) {
    const frame = group(parent, position); frame.rotation.set(...rotation);
    const radius = diameter * .43;
    for (const sign of [-1, 1]) {
      r.box(frame, [diameter * .13, diameter, .18], [sign * diameter * .44, 0, 0], black, .025);
      r.box(frame, [diameter, diameter * .13, .18], [0, sign * diameter * .44, 0], black, .025);
    }
    r.mesh(frame, r.geometry(`fan-ring:${diameter}`, () => new THREE.TorusGeometry(radius, .035, 8, 64)), edge);
    const rotor = group(frame); fans.push(rotor);
    const hub = r.cylinder(rotor, diameter * .12, .16, [0, 0, 0], silver); hub.rotation.x = Math.PI / 2;
    // Curved swept blades stay in the fan plane; the rotor's local Z is its shaft.
    const bladeGeometry = r.geometry(`blade:${diameter}`, () => {
      const shape = new THREE.Shape();
      shape.moveTo(.09 * diameter, -.045 * diameter);
      shape.bezierCurveTo(.18 * diameter, -.14 * diameter, .4 * diameter, -.2 * diameter, .42 * diameter, -.02 * diameter);
      shape.quadraticCurveTo(.28 * diameter, .12 * diameter, .11 * diameter, .05 * diameter);
      shape.closePath();
      return new THREE.ExtrudeGeometry(shape, { depth: .018, bevelEnabled: false, curveSegments: 8 });
    });
    for (let i = 0; i < 7; i++) r.mesh(rotor, bladeGeometry, darkSilver).rotation.z = i * Math.PI * 2 / 7;
    screws(frame, [-1, 1].flatMap(x => [-1, 1].map(y => [x * diameter * .43, y * diameter * .43, .1] as Vec3)), .021);
    return frame;
  }

  const chassis = group(root, [0, 0, 0], 'case');
  // Open side, solid rear tray, front ventilation slats, separate removable glass.
  r.box(chassis, [4.25, .09, 2.5], [0, -2.2, 0], black, .025);
  r.box(chassis, [4.25, .07, 2.5], [0, 2.2, 0], black, .02);
  r.box(chassis, [4.13, 4.33, .05], [0, 0, -1.22], black, .015);
  r.box(chassis, [3.85, 3.1, .04], [-.12, .37, -.85], edge);
  for (const x of [-2.08, 2.08]) for (const z of [-1.19, 1.19]) r.box(chassis, [.09, 4.4, .09], [x, 0, z], edge, .012);
  for (const y of [-2.13, 2.13]) r.box(chassis, [4.2, .09, .075], [0, y, 1.19], edge);
  const slats: Vec3[] = Array.from({ length: 37 }, (_, i) => [2.1, -2.03 + i * .112, 0]);
  r.instancesOf(chassis, r.geometry('front-slats', () => new THREE.BoxGeometry(.055, .04, 2.3)), edge, slats);
  for (const y of [-1.32, 0, 1.32]) fan(chassis, 1.18, [1.84, y, 0], [0, -Math.PI / 2, 0]);
  fan(chassis, 1.12, [-1.95, 1.22, 0], [0, -Math.PI / 2, 0]);
  for (let i = 0; i < 7; i++) {
    r.box(chassis, [.07, .14, 1.12], [-2.07, -.4 - i * .2, .43], darkSilver);
    r.box(chassis, [.075, .04, .9], [-2.072, -.4 - i * .2, .43], plastic);
  }
  for (const x of [-1.6, 1.6]) for (const z of [-.85, .85]) r.box(chassis, [.48, .17, .34], [x, -2.31, z], plastic, .04);
  const powerLed = r.cylinder(chassis, .045, .08, [1.8, 2.24, .8], light);
  powerLed.userData.component = 'case';
  r.box(chassis, [.14, .018, .07], [1.47, 2.24, .8], plastic);
  r.box(chassis, [.14, .018, .07], [1.2, 2.24, .8], plastic);

  const boardAssembly = group(root, BOARD_MOUNT);
  const motherboard = group(boardAssembly, [0, 0, 0], 'motherboard');
  r.box(motherboard, [2.44, 3.05, .035], [0, 0, 0], pcb, .016);
  const mountHoles: Vec3[] = [-1.12, 0, 1.12].flatMap(x => [-1.42, -.3, 1.42].map(y => [x, y, .025] as Vec3));
  // Schematic mounting points, not a drilling template.
  mountHoles.forEach(p => {
    r.mesh(motherboard, r.geometry('mount-ring', () => new THREE.TorusGeometry(.038, .009, 6, 16)), gold, p);
    const standoff = r.cylinder(chassis, .033, .115, [p[0] + BOARD_MOUNT[0], p[1] + BOARD_MOUNT[1], -.795], gold, 6);
    standoff.rotation.x = Math.PI / 2;
  });
  r.box(motherboard, [.46, 1.45, .31], [-.95, .68, .17], black, .028);
  r.box(motherboard, [.91, .29, .25], [-.38, 1.28, .14], black, .02);
  for (let i = 0; i < 10; i++) {
    r.box(motherboard, [.022, 1.27, .04], [-1.13 + i * .039, .68, .343], darkSilver);
    r.box(motherboard, [.021, .25, .04], [-.78 + i * .084, 1.28, .276], darkSilver);
  }
  const boardLabel = r.label(motherboard, 'S / W    ATX', [-.96, .7, .375], .36);
  if (boardLabel) boardLabel.rotation.z = Math.PI / 2;
  r.label(motherboard, 'AM5  /  DDR5', [.35, 1.36, .035], .65);
  r.label(motherboard, 'SILICON WIKI', [-.23, -1.28, .055], 1.15);
  // Rear I/O stack, chokes, capacitors and traces make the board readable at close range.
  for (let i = 0; i < 6; i++) r.box(motherboard, [.2, .16, .2], [-1.18, .18 + i * .19, .15], silver);
  const chokes: Vec3[] = Array.from({ length: 7 }, (_, i) => [-.63 + i * .13, 1.03, .065]);
  r.instancesOf(motherboard, r.geometry('choke', () => new THREE.BoxGeometry(.09, .09, .07)), darkSilver, chokes);
  const caps: Vec3[] = Array.from({ length: 10 }, (_, i) => [-.73, -.95 + i * .18, .07]);
  r.instancesOf(motherboard, r.geometry('capacitor', () => new THREE.CylinderGeometry(.027, .027, .08, 10).rotateX(Math.PI / 2)), silver, caps);
  for (let i = 0; i < 18; i++) {
    const x = -.52 + i * .054;
    r.tube(motherboard, [[x, -.2, .021], [x, -.49 - i * .006, .021], [x + .18, -.7 - i * .006, .021], [x + .18, -1.12, .021]], .0025, darkSilver);
  }
  r.box(motherboard, [.54, .52, .1], [.65, -.88, .08], black, .02);
  for (let i = 0; i < 6; i++) r.box(motherboard, [.46, .016, .024], [.65, -1.07 + i * .073, .14], edge);
  for (const y of [-.38, -.86]) {
    r.box(motherboard, [.92, .09, .09], [-.35, y, .062], y === -.38 ? silver : plastic);
    r.box(motherboard, [.83, .018, .012], [-.35, y, .111], plastic);
  }
  r.label(motherboard, 'PCIe x16', [-.36, -.5, .04], .6);
  r.box(motherboard, [.105, .58, .16], [1.12, .53, .09], plastic);
  r.box(motherboard, [.27, .1, .13], [-.78, 1.46, .075], plastic);
  r.box(motherboard, [.22, .085, .11], [.93, -1.37, .06], plastic);

  // Socket frame surrounds the CPU, rather than covering its heat spreader.
  const socket = group(motherboard, [CPU_POSITION[0], CPU_POSITION[1], .055]);
  r.box(socket, [.56, .59, .07], [0, 0, 0], plastic, .015);
  const pins: Vec3[] = Array.from({ length: 16 * 16 }, (_, i) => [-.2 + (i % 16) * .026, -.2 + Math.floor(i / 16) * .026, .042]);
  r.instancesOf(socket, r.geometry('socket-pin', () => new THREE.BoxGeometry(.009, .009, .016)), gold, pins);
  const latch = group(socket, [0, .3, .04]);
  for (const x of [-.25, .25]) r.box(latch, [.046, .59, .022], [x, -.3, 0], silver);
  for (const y of [-.025, -.565]) r.box(latch, [.52, .045, .022], [0, y, 0], silver);
  const lever = group(socket, [.32, -.31, .04]);
  r.tube(lever, [[0, 0, 0], [0, .56, 0], [-.04, .66, .02]], .013, silver);
  const cpu = group(boardAssembly, CPU_POSITION, 'cpu');
  r.box(cpu, [.4, .4, .025], [0, 0, 0], pcb, .008);
  r.box(cpu, [.32, .34, .03], [0, 0, .027], silver, .014);
  for (const x of [-1, 1]) for (const y of [-1, 1]) r.box(cpu, [.055, .07, .028], [x * .177, y * .14, .026], silver, .004);
  r.label(cpu, 'AM5', [0, .04, .044], .22);
  r.label(cpu, 'CPU / 01', [0, -.05, .044], .25);
  const triangle = new THREE.Shape(); triangle.moveTo(0, 0); triangle.lineTo(.027, 0); triangle.lineTo(0, .027); triangle.closePath();
  r.mesh(cpu, r.geometry('orientation-triangle', () => new THREE.ShapeGeometry(triangle)), gold, [-.185, -.183, .02]);
  const pasteGroup = group(cpu, [0, 0, .049], 'thermal-paste');
  const paste = r.mesh(pasteGroup, r.geometry('paste', () => new THREE.SphereGeometry(1, 24, 12)), r.material('paste', 0x8e9699, .3, .85));

  RAM_X.forEach((x, slot) => {
    r.box(motherboard, [.078, 1.38, .11], [x, .57, .075], plastic);
    r.box(motherboard, [.018, 1.28, .006], [x, .57, .134], gold);
    r.label(motherboard, ['A1', 'A2', 'B1', 'B2'][slot], [x, -.21, .032], .105);
  });
  const ram = group(boardAssembly, [0, 0, 0], 'ram');
  const sticks = [1, 3].map(slot => {
    const stick = group(ram, [RAM_X[slot], .57, .135]);
    r.box(stick, [.018, 1.33, .31], [0, 0, .145], pcb);
    for (const y of [-.345, .32]) r.box(stick, [.02, .61, .055], [0, y, 0], gold);
    for (const x of [-.025, .025]) r.box(stick, [.025, 1.3, .27], [x, 0, .185], black, .014);
    r.box(stick, [.064, 1.26, .026], [0, 0, .333], darkSilver, .008);
    for (let i = 0; i < 8; i++) r.box(stick, [.008, .012, .21], [.042, -.54 + i * .15, .19], edge);
    const label = r.label(stick, 'DDR5', [.048, 0, .19], .37); if (label) label.rotation.y = Math.PI / 2;
    return stick;
  });
  const ramLatches = [1, 3].map(slot => [-1, 1].map(sign => {
    const clip = group(motherboard, [RAM_X[slot], .57 + sign * .715, .08]);
    r.box(clip, [.07, .08, .16], [0, 0, .045], darkSilver, .006);
    return clip;
  }));

  const ssd = group(boardAssembly, SSD_POSITION, 'ssd');
  r.box(motherboard, [.06, .25, .06], [SSD_POSITION[0] - .023, SSD_POSITION[1], .075], plastic);
  const drive = group(ssd);
  r.box(drive, [.8, .22, .018], [.4, 0, 0], pcb, .006);
  r.box(drive, [.07, .19, .021], [.018, 0, 0], gold);
  for (const x of [.22, .43, .64]) r.box(drive, [.15, .17, .022], [x, 0, .018], chip);
  r.label(drive, 'NVMe  /  2280', [.43, 0, .033], .58);
  screws(motherboard, [[.1, -.03, .082]], .03);
  const shield = group(ssd, [.42, 0, .074]);
  r.box(shield, [.74, .27, .045], [0, 0, 0], black, .01);
  for (let i = 0; i < 4; i++) r.box(shield, [.69, .012, .026], [0, -.105 + i * .07, .03], edge);

  const cooler = group(boardAssembly, [CPU_POSITION[0], CPU_POSITION[1], .175], 'cooler');
  r.box(cooler, [.44, .42, .075], [0, 0, .04], copper, .02);
  const fins = [-.31, .31].flatMap(x => Array.from({ length: 30 }, (_, i) => [x, 0, .35 + i * .03] as Vec3));
  r.instancesOf(cooler, r.geometry('cooler-fin', () => new THREE.BoxGeometry(.42, 1.15, .012)), silver, fins);
  for (const x of [-.31, .31]) {
    r.box(cooler, [.44, 1.17, .035], [x, 0, 1.26], black, .014);
    for (const y of [-.43, -.26, -.086, .086, .26, .43]) {
      r.tube(cooler, [[0, y * .38, .09], [x * .9, y * .8, .18], [x, y, .37], [x, y, 1.29]], .025, copper);
      const cap = r.cylinder(cooler, .027, .025, [x, y, 1.295], silver); cap.rotation.x = Math.PI / 2;
    }
  }
  fan(cooler, 1.14, [.66, 0, .73], [0, -Math.PI / 2, 0]);
  fan(cooler, 1.14, [0, 0, .73], [0, -Math.PI / 2, 0]);
  r.label(cooler, 'S / W', [-.31, 0, 1.281], .29);
  for (const y of [-.37, .37]) screws(cooler, [[0, y, .135]]);
  const film = group(cooler, [0, 0, -.009]);
  const filmMat = r.material('protective-film', 0x6ab3c0, .1, .3); filmMat.transparent = true; filmMat.opacity = .55;
  r.box(film, [.43, .42, .006], [0, 0, 0], filmMat);
  r.box(film, [.12, .12, .006], [.26, 0, 0], gold);
  r.tube(cooler, [[.72, -.5, .73], [.4, -.56, .27], [.16, -.48, .05], [.21, -.42, -.08]], .011, cableMat);

  const psu = group(root, [-1.22, -1.74, -.08], 'psu');
  r.box(psu, [1.5, .86, 1.5], [0, 0, 0], black, .035);
  fan(psu, 1.1, [0, -.44, 0], [Math.PI / 2, 0, 0]);
  r.label(psu, 'MODULAR  /  ATX', [0, 0, .758], 1.05);
  r.label(psu, 'POWER SUPPLY', [0, -.14, .758], .77);
  for (let i = 0; i < 10; i++) r.box(psu, [.012, .53, .028], [-.757, 0, -.57 + i * .127], darkSilver);
  for (const y of [-.17, .17]) for (const z of [-.4, 0, .4]) r.box(psu, [.026, .18, .25], [.76, y, z], plastic);

  const gpu = group(root, GPU_POSITION, 'gpu');
  // Conventional horizontal GPU: PCB lies in XZ, gold edge faces motherboard, fans face down.
  r.box(gpu, [3.02, .026, 1.22], [0, 0, 0], pcb, .015);
  r.box(gpu, [.83, .023, .11], [-.58, 0, -.63], gold);
  r.box(gpu, [3.04, .035, 1.24], [0, .037, 0], darkSilver, .02);
  for (let i = 0; i < 10; i++) r.box(gpu, [.055, .006, .65], [.5 + i * .08, .058, .02], black);
  const gpuFins: Vec3[] = Array.from({ length: 48 }, (_, i) => [-1.36 + i * .058, -.19, 0]);
  r.instancesOf(gpu, r.geometry('gpu-fin', () => new THREE.BoxGeometry(.016, .29, 1.09)), silver, gpuFins);
  for (const z of [-.6, .6]) r.box(gpu, [3.02, .38, .06], [0, -.2, z], black, .018);
  for (const x of [-1.5, 1.5]) r.box(gpu, [.06, .38, 1.22], [x, -.2, 0], black, .02);
  for (const x of [-.98, 0, .98]) fan(gpu, .9, [x, -.4, 0], [Math.PI / 2, 0, 0]);
  r.box(gpu, [.038, .58, 1.25], [-1.77, -.23, 0], silver);
  for (const z of [-.36, -.08, .2]) r.box(gpu, [.043, .09, .2], [-1.795, -.15, z], plastic);
  r.label(gpu, 'GRAPHICS  /  PCIe', [0, -.18, .633], 1.52);
  r.box(gpu, [.24, .1, .14], [.82, .07, .56], plastic);
  // Support foot reaches the floor and can be compared with the card's far end.
  r.box(gpu, [.1, 1.78, .1], [1.25, -1.29, .34], edge, .015);
  r.box(gpu, [.34, .06, .29], [1.25, -2.19, .34], black, .02);

  const cables = group(root, [0, 0, 0], 'cables');
  const powerCables = group(cables);
  const gpuCable = group(cables);
  const signalCables = group(cables);
  function cableBundle(parent: THREE.Object3D, points: Vec3[], count: number, spacing: number) {
    for (let i = 0; i < count; i++) r.tube(parent, points.map(p => [p[0], p[1] + (i - (count - 1) / 2) * spacing, p[2]]), .012, cableMat);
  }
  cableBundle(powerCables, [[-.44, -1.64, -.15], [.84, -1.58, -.55], [1.03, .61, -.55], [.84, .93, -.35], [.57, .93, -.52]], 8, .032);
  cableBundle(powerCables, [[-.46, -1.94, -.51], [.94, -1.71, -1.02], [.88, 2.01, -1.02], [-1.33, 2.03, -.54], [-1.33, 1.86, -.57]], 4, .025);
  const atxPlug = group(powerCables, [.57, .93, -.52]); r.box(atxPlug, [.13, .57, .15], [0, 0, 0], plastic);
  const epsPlug = group(powerCables, [-1.33, 1.86, -.57]); r.box(epsPlug, [.26, .11, .13], [0, 0, 0], plastic);
  cableBundle(gpuCable, [[-.45, -1.74, .28], [.96, -1.61, .45], [1.13, -.54, .93], [.6, .22, 1.02], [.5, .18, .61]], 6, .025);
  const gpuPlug = group(gpuCable, [.5, .18, .61]); r.box(gpuPlug, [.22, .1, .14], [0, 0, 0], plastic);
  cableBundle(signalCables, [[1.68, 1.9, -.68], [1.24, 1.59, -.84], [1.23, -1.06, -.83], [.39, -.97, -.51]], 3, .018);
  const signalPlug = group(signalCables, [.39, -.97, -.51]); r.box(signalPlug, [.22, .09, .09], [0, 0, 0], plastic);

  const glass = group(root, [0, 0, 1.245], 'case-glass');
  const glassMat = r.material('tempered-glass', 0xaabec5, .05, .12);
  glassMat.transparent = true; glassMat.opacity = .08; glassMat.depthWrite = false; glassMat.side = THREE.DoubleSide;
  const pane = r.box(glass, [4.05, 4.15, .035], [0, 0, 0], glassMat, .02);
  pane.castShadow = false;
  pane.userData.ignorePick = true;
  for (const x of [-2, 2]) r.box(glass, [.035, 4.15, .038], [x, 0, 0], darkSilver);
  for (const y of [-2.06, 2.06]) r.box(glass, [4.04, .035, .038], [0, y, 0], darkSilver);
  screws(glass, [-1, 1].flatMap(x => [-1, 1].map(y => [x * 1.91, y * 1.96, .03] as Vec3)), .036);

  const basePositions = new Map<THREE.Object3D, THREE.Vector3>();
  [cpu, cooler, ssd, psu, gpu, glass, ...sticks, shield, atxPlug, epsPlug, gpuPlug, signalPlug].forEach(object => basePositions.set(object, object.position.clone()));
  function offset(object: THREE.Object3D, x = 0, y = 0, z = 0) { object.position.copy(basePositions.get(object)!).add(new THREE.Vector3(x, y, z)); }

  function apply(step: number, progress: number, exploded: number) {
    const pose = assemblyFrame(step, progress);
    boardAssembly.position.set(...pose.boardPosition);
    boardAssembly.rotation.x = pose.boardRotation;
    if (step >= 5) boardAssembly.position.z += exploded * .25;
    chassis.visible = step >= 5;
    cpu.visible = true; ram.visible = step >= 2; ssd.visible = step >= 3;
    cooler.visible = step >= 4; pasteGroup.visible = step >= 4;
    psu.visible = step >= 6; gpu.visible = step >= 7; cables.visible = step >= 6;
    gpuCable.visible = step >= 7; signalCables.visible = step >= 8; glass.visible = step >= 9;
    offset(cpu, 0, 0, pose.cpuLift + exploded * .48);
    latch.rotation.x = -pose.cpuLatch * Math.PI * .62;
    lever.rotation.x = pose.cpuLatch * Math.PI * .5;
    sticks.forEach((stick, i) => {
      offset(stick, exploded * .13 * (i + 1), 0, pose.ramLift[i] + exploded * .62);
      ramLatches[i].forEach((clip, side) => clip.rotation.x = (side ? -1 : 1) * Math.min(1, pose.ramLift[i] * 5) * .55);
    });
    offset(ssd, 0, 0, exploded * .6);
    drive.position.x = pose.ssdLift;
    drive.rotation.y = pose.ssdAngle;
    offset(shield, 0, 0, pose.ssdShieldLift + exploded * .32);
    offset(cooler, -exploded * .3, exploded * .15, pose.coolerLift + exploded * 1.8);
    paste.scale.setScalar(pose.pasteAmount);
    paste.scale.multiply(new THREE.Vector3(.052 + .1 * pose.pasteSpread, .052 + .1 * pose.pasteSpread, .022 - .019 * pose.pasteSpread));
    film.visible = step === 4 && progress < .35;
    film.position.x = pose.filmPeel * .6; film.position.z = -.009 - pose.filmPeel * .24; film.rotation.y = pose.filmPeel * .8;
    offset(psu, pose.psuSlide - exploded * .9, 0, exploded * .7);
    offset(gpu, 0, -exploded * .3, pose.gpuLift + exploded * 1.4);
    offset(glass, 0, 0, pose.glassSlide + exploded * 2.6);
    offset(atxPlug, 0, 0, .18 * (1 - pose.powerCableSeat));
    offset(epsPlug, 0, 0, .18 * (1 - pose.powerCableSeat));
    offset(gpuPlug, 0, .18 * (1 - pose.gpuCableSeat), 0);
    offset(signalPlug, 0, 0, .15 * (1 - pose.cableSeat));
    cables.visible = step >= 6 && exploded < .1;
    light.emissiveIntensity = pose.powered ? 2 : 0;
    root.updateMatrixWorld(true);
    return pose;
  }

  apply(1, 1, 0);
  return { root, parts, fans, boardAssembly, sticks, drive, shield, latch, paste, resources, apply };
}

export type PCModel = ReturnType<typeof createPCModel>;
