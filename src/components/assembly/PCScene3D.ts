import * as THREE from 'three';

export interface ComponentMeshItem {
  id: string;
  name: string;
  group: THREE.Group;
  assembledPos: THREE.Vector3;
  explodedPos: THREE.Vector3;
  installedStep: number; // 几步时安装完成
}

export class PCScene3D {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animId: number = 0;

  // Components registry
  private components: Map<string, ComponentMeshItem> = new Map();
  private rotatingFanHubs: THREE.Group[] = [];

  // Interaction & animation state
  private isExploded: boolean = false;
  private explosionProgress: number = 0; // 0 = assembled, 1 = exploded
  private currentStep: number = 1;

  // Camera Orbit State
  private isDragging: boolean = false;
  private previousMousePosition = { x: 0, y: 0 };
  private spherical = { radius: 7.8, theta: 0.65, phi: 1.15 };
  private targetLookAt = new THREE.Vector3(0, 0, 0);

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent background for theme compatibility

    // 2. Camera
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.updateCameraPosition();

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // 4. Lights
    this.setupLighting();

    // 5. Studio Stage Platform
    this.buildStudioStage();

    // 6. Build High-Precision Voxel Hardware Models
    this.buildVoxelPCModels();

    // 7. Event listeners
    this.setupControls();

    // 8. Render Loop
    this.animate = this.animate.bind(this);
    this.animate();
  }

  private setupLighting() {
    // Ambient light - boosted for crystal-clear component visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.2);
    this.scene.add(ambientLight);

    // Key Light: High-angle direct warm-white illumination
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.8);
    dirLight1.position.set(6, 12, 7);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 2048;
    dirLight1.shadow.mapSize.height = 2048;
    dirLight1.shadow.bias = -0.0005;
    this.scene.add(dirLight1);

    // Fill Light: Soft frontal illumination to eliminate deep chassis shadows
    const fillLight = new THREE.DirectionalLight(0xf0f9ff, 1.8);
    fillLight.position.set(-6, 5, 7);
    this.scene.add(fillLight);

    // Rim / Back Light: Cool cyan edge accent separator
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.4);
    rimLight.position.set(0, 8, -7);
    this.scene.add(rimLight);

    // Low bounce light to illuminate motherboard underside and PSU shroud
    const bottomBounce = new THREE.DirectionalLight(0x94a3b8, 1.0);
    bottomBounce.position.set(0, -6, 2);
    this.scene.add(bottomBounce);

    // Internal vibrant RGB components
    const internalRgb = new THREE.PointLight(0x06b6d4, 2.8, 8);
    internalRgb.position.set(0, 0.4, 0.4);
    this.scene.add(internalRgb);

    const magentaAccent = new THREE.PointLight(0xec4899, 2.0, 7);
    magentaAccent.position.set(-0.5, 1.0, 0.2);
    this.scene.add(magentaAccent);
  }

  private buildStudioStage() {
    const stageGroup = new THREE.Group();
    stageGroup.name = 'studio_stage';

    // 1. Sleek metallic pedestal platform
    const platformGeom = new THREE.CylinderGeometry(4.6, 5.0, 0.22, 64);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Slate 800 metallic brushed finish
      roughness: 0.4,
      metalness: 0.65,
    });
    const platform = new THREE.Mesh(platformGeom, platformMat);
    platform.position.set(0, -2.26, 0);
    platform.receiveShadow = true;
    stageGroup.add(platform);

    // 2. Glowing perimeter ring (Chiseled Cyber Neon Ring)
    const ringGeom = new THREE.TorusGeometry(4.62, 0.035, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8, // Sky-blue / cyan emissive glow
    });
    const neonRing = new THREE.Mesh(ringGeom, ringMat);
    neonRing.rotation.x = Math.PI / 2;
    neonRing.position.set(0, -2.14, 0);
    stageGroup.add(neonRing);

    // 3. Inner concentric measurement circle
    const innerRingGeom = new THREE.TorusGeometry(3.0, 0.015, 16, 64);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7, // Slightly deeper blue
      transparent: true,
      opacity: 0.7,
    });
    const innerNeonRing = new THREE.Mesh(innerRingGeom, innerRingMat);
    innerNeonRing.rotation.x = Math.PI / 2;
    innerNeonRing.position.set(0, -2.14, 0);
    stageGroup.add(innerNeonRing);

    // 4. Subtle radial alignment tick marks on the platform
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      const tickGeom = new THREE.BoxGeometry(0.3, 0.005, 0.02);
      const tickMat = new THREE.MeshBasicMaterial({
        color: 0x64748b,
        transparent: true,
        opacity: 0.5,
      });
      const tick = new THREE.Mesh(tickGeom, tickMat);
      tick.position.set(Math.cos(angle) * 3.8, -2.14, Math.sin(angle) * 3.8);
      tick.rotation.y = -angle;
      stageGroup.add(tick);
    }

    this.scene.add(stageGroup);
  }

  // ==========================================
  // Voxel Construction Helpers
  // ==========================================
  private createVoxel(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    mat: THREE.Material
  ): THREE.Mesh {
    const geom = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  private buildVoxelPCModels() {
    // ----------------- PBR Materials -----------------
    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x111c16, // Matte emerald-black PCB
      roughness: 0.5,
      metalness: 0.2,
    });

    const vrmArmorMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8, // Brushed silver aluminum
      roughness: 0.25,
      metalness: 0.85,
    });

    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x27272a, // Gunmetal zinc
      roughness: 0.35,
      metalness: 0.8,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // 24K Gold contacts
      roughness: 0.15,
      metalness: 0.95,
    });

    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Thermal copper heat pipes
      roughness: 0.2,
      metalness: 0.9,
    });

    const capacitorMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Shiny silver solid capacitors
      roughness: 0.15,
      metalness: 0.9,
    });

    const bgaChipMat = new THREE.MeshStandardMaterial({
      color: 0x09090b, // Black epoxy IC chip
      roughness: 0.7,
      metalness: 0.1,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.22,
      roughness: 0.05,
      transmission: 0.92,
      thickness: 0.1,
    });

    const rgbCyanMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const rgbMagentaMat = new THREE.MeshBasicMaterial({ color: 0xec4899 });
    const debugLedRed = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const debugLedGreen = new THREE.MeshBasicMaterial({ color: 0x22c55e });

    // =========================================================
    // 1. CHASSIS CASE (侧透海景房机箱 - 体素框架与透视玻璃)
    // =========================================================
    const caseGroup = new THREE.Group();
    // Bottom panel with ventilation voxel array
    caseGroup.add(this.createVoxel(0, -2.1, 0, 4.4, 0.18, 2.6, darkMetalMat));
    // Feet
    caseGroup.add(this.createVoxel(-1.9, -2.25, 1.0, 0.3, 0.15, 0.3, darkMetalMat));
    caseGroup.add(this.createVoxel(1.9, -2.25, 1.0, 0.3, 0.15, 0.3, darkMetalMat));
    caseGroup.add(this.createVoxel(-1.9, -2.25, -1.0, 0.3, 0.15, 0.3, darkMetalMat));
    caseGroup.add(this.createVoxel(1.9, -2.25, -1.0, 0.3, 0.15, 0.3, darkMetalMat));

    // Top panel with magnetic dust filter voxel pattern
    caseGroup.add(this.createVoxel(0, 2.1, 0, 4.4, 0.16, 2.6, darkMetalMat));
    for (let i = -1.6; i <= 1.6; i += 0.4) {
      caseGroup.add(this.createVoxel(i, 2.19, 0, 0.25, 0.02, 1.8, pcbMat));
    }

    // Rear metal chassis wall & I/O cutout
    caseGroup.add(this.createVoxel(0, 0, -1.24, 4.4, 4.1, 0.14, darkMetalMat));
    caseGroup.add(this.createVoxel(-2.14, 0, 0, 0.14, 4.1, 2.6, darkMetalMat));

    // Front corner pillar-less structural joiner
    caseGroup.add(this.createVoxel(2.14, 0, -1.18, 0.12, 4.1, 0.14, darkMetalMat));

    // Front I/O Ports voxel console
    const ioPanel = new THREE.Group();
    ioPanel.add(this.createVoxel(1.9, 2.19, 1.0, 0.08, 0.03, 0.08, rgbCyanMat)); // Power Button
    ioPanel.add(this.createVoxel(1.7, 2.19, 1.0, 0.05, 0.02, 0.1, darkMetalMat)); // Type-C
    ioPanel.add(this.createVoxel(1.5, 2.19, 1.0, 0.08, 0.02, 0.1, rgbCyanMat)); // USB 3.0
    caseGroup.add(ioPanel);

    // Front & Side Panoramic Glass Panels (海景房无立柱双面玻璃)
    const glassSide = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.9, 0.06), glassMat);
    glassSide.position.set(0, 0, 1.25);
    const glassFront = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.9, 2.4), glassMat);
    glassFront.position.set(2.14, 0, 0.05);
    caseGroup.add(glassSide, glassFront);

    this.registerComponent({
      id: 'case',
      name: '侧透海景房机箱 (无立柱全景透视)',
      group: caseGroup,
      assembledPos: new THREE.Vector3(0, 0, 0),
      explodedPos: new THREE.Vector3(0, 0, -0.7),
      installedStep: 5,
    });

    // =========================================================
    // 2. MOTHERBOARD (ATX 主板 - 供电鳍片、电容阵列与插槽)
    // =========================================================
    const mbGroup = new THREE.Group();
    // PCB base slab (Matte Emerald / Carbon Black PCB)
    mbGroup.add(this.createVoxel(0, 0, 0, 2.8, 3.2, 0.08, pcbMat));

    // Decorative golden PCB circuit trace voxel strips & bus lines
    mbGroup.add(this.createVoxel(-0.6, 0.2, 0.05, 0.04, 2.2, 0.02, goldMat));
    mbGroup.add(this.createVoxel(0.4, -0.4, 0.05, 1.2, 0.04, 0.02, goldMat));
    mbGroup.add(this.createVoxel(0.9, 0.1, 0.05, 0.03, 1.6, 0.02, goldMat));
    mbGroup.add(this.createVoxel(-0.2, -0.75, 0.05, 1.5, 0.03, 0.02, goldMat));

    // VRM Heatsink Armor (Top & Left Aluminum Fin Voxels)
    const vrmLeft = new THREE.Group();
    vrmLeft.add(this.createVoxel(-0.9, 0.6, 0.2, 0.55, 1.4, 0.32, vrmArmorMat));
    for (let f = -0.45; f <= 0.45; f += 0.15) {
      vrmLeft.add(this.createVoxel(-0.9, 0.6 + f, 0.38, 0.52, 0.05, 0.06, darkMetalMat));
    }
    mbGroup.add(vrmLeft);

    const vrmTop = new THREE.Group();
    vrmTop.add(this.createVoxel(0.1, 1.25, 0.2, 1.1, 0.45, 0.32, vrmArmorMat));
    for (let f = -0.35; f <= 0.35; f += 0.18) {
      vrmTop.add(this.createVoxel(0.1 + f, 1.25, 0.38, 0.06, 0.42, 0.06, darkMetalMat));
    }
    mbGroup.add(vrmTop);

    // VRM Solid Capacitors Array (Nichicon Black/Silver Caps)
    for (let i = 0; i < 7; i++) {
      const capGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.14, 8);
      const cap = new THREE.Mesh(capGeom, capacitorMat);
      cap.rotation.x = Math.PI / 2;
      cap.position.set(-0.55, 0.05 + i * 0.18, 0.12);
      mbGroup.add(cap);
    }
    for (let i = 0; i < 5; i++) {
      const capGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.14, 8);
      const cap = new THREE.Mesh(capGeom, capacitorMat);
      cap.rotation.x = Math.PI / 2;
      cap.position.set(-0.35 + i * 0.2, 0.96, 0.12);
      mbGroup.add(cap);
    }

    // Dual 8-Pin CPU EPS Power Sockets (Top Left)
    const eps1 = this.createVoxel(-0.82, 1.48, 0.11, 0.2, 0.16, 0.14, darkMetalMat);
    const eps2 = this.createVoxel(-0.58, 1.48, 0.11, 0.2, 0.16, 0.14, darkMetalMat);
    mbGroup.add(eps1, eps2);
    // Gold contact pins inside EPS
    mbGroup.add(this.createVoxel(-0.82, 1.48, 0.18, 0.16, 0.12, 0.02, goldMat));
    mbGroup.add(this.createVoxel(-0.58, 1.48, 0.18, 0.16, 0.12, 0.02, goldMat));

    // AM5 CPU Socket Outline & Load Lever
    mbGroup.add(this.createVoxel(-0.05, 0.65, 0.06, 0.85, 0.85, 0.04, darkMetalMat));
    mbGroup.add(this.createVoxel(-0.05, 0.65, 0.085, 0.72, 0.72, 0.02, goldMat)); // Pin grid area
    // Metal Socket Retention Lever
    const socketLever = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.85, 6), vrmArmorMat);
    socketLever.position.set(0.42, 0.65, 0.1);
    mbGroup.add(socketLever);

    // 4 DDR5 RAM Slots with Reinforced Metallic End Clips
    for (let s = 0; s < 4; s++) {
      const slotX = 0.62 + s * 0.16;
      mbGroup.add(this.createVoxel(slotX, 0.65, 0.08, 0.06, 1.4, 0.08, darkMetalMat));
      // Top & Bottom End clips
      mbGroup.add(this.createVoxel(slotX, 1.36, 0.09, 0.08, 0.06, 0.08, vrmArmorMat));
      mbGroup.add(this.createVoxel(slotX, -0.06, 0.09, 0.08, 0.06, 0.08, vrmArmorMat));
      // Center notch
      mbGroup.add(this.createVoxel(slotX, 0.65, 0.11, 0.07, 0.08, 0.04, darkMetalMat));
    }

    // 24-Pin ATX Mainboard Power Socket (Right Edge)
    const atx24pSocket = this.createVoxel(1.28, 0.65, 0.12, 0.16, 0.75, 0.16, darkMetalMat);
    mbGroup.add(atx24pSocket);
    for (let p = -0.32; p <= 0.32; p += 0.064) {
      mbGroup.add(this.createVoxel(1.28, 0.65 + p, 0.2, 0.1, 0.025, 0.02, goldMat));
    }

    // PCIe x16 Steel Reinforced Slots (Slot 1 & Slot 2)
    mbGroup.add(this.createVoxel(0.05, -0.45, 0.1, 1.9, 0.12, 0.12, vrmArmorMat));
    mbGroup.add(this.createVoxel(0.05, -0.45, 0.17, 1.8, 0.03, 0.03, goldMat));
    // PCIe Retention Latch
    mbGroup.add(this.createVoxel(1.02, -0.45, 0.14, 0.08, 0.14, 0.1, darkMetalMat));

    mbGroup.add(this.createVoxel(0.05, -1.05, 0.08, 1.9, 0.11, 0.1, darkMetalMat));
    mbGroup.add(this.createVoxel(0.05, -1.05, 0.14, 1.8, 0.03, 0.02, goldMat));

    // CR2032 CMOS Coin Battery with retention socket (Center-Lower)
    const cmosHolder = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.05, 16), darkMetalMat);
    cmosHolder.rotation.x = Math.PI / 2;
    cmosHolder.position.set(0.15, -0.15, 0.07);
    const cmosBattery = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16), vrmArmorMat);
    cmosBattery.rotation.x = Math.PI / 2;
    cmosBattery.position.set(0.15, -0.15, 0.09);
    mbGroup.add(cmosHolder, cmosBattery);

    // 4x Stacked SATA 6Gbps Ports on lower right edge
    for (let sp = 0; sp < 2; sp++) {
      const sataY = -0.55 + sp * 0.22;
      mbGroup.add(this.createVoxel(1.3, sataY, 0.12, 0.14, 0.18, 0.16, darkMetalMat));
      mbGroup.add(this.createVoxel(1.36, sataY, 0.12, 0.02, 0.14, 0.12, goldMat)); // L-shaped contact
    }

    // Chipset Armor with CNC Grooves & RGB Accent
    mbGroup.add(this.createVoxel(0.8, -0.95, 0.14, 0.75, 0.75, 0.2, vrmArmorMat));
    mbGroup.add(this.createVoxel(0.8, -0.95, 0.25, 0.45, 0.06, 0.02, rgbCyanMat));
    // M.2 Armor heatsink block
    mbGroup.add(this.createVoxel(0.05, -0.75, 0.12, 1.4, 0.26, 0.12, darkMetalMat));

    // Rear I/O Ports Block & Wi-Fi 7 Antenna gold posts
    const rearIo = new THREE.Group();
    rearIo.add(this.createVoxel(-1.25, 0.8, 0.25, 0.25, 1.2, 0.42, darkMetalMat));
    rearIo.add(this.createVoxel(-1.25, 1.2, 0.47, 0.12, 0.08, 0.04, rgbCyanMat)); // USB 3.0
    rearIo.add(this.createVoxel(-1.25, 1.0, 0.47, 0.12, 0.08, 0.04, rgbCyanMat));
    rearIo.add(this.createVoxel(-1.25, 0.75, 0.47, 0.08, 0.06, 0.04, debugLedRed)); // USB 3.2 Gen 2x2
    rearIo.add(this.createVoxel(-1.25, 0.55, 0.47, 0.06, 0.12, 0.04, darkMetalMat)); // RJ45 2.5G LAN
    // Wi-Fi 7 SMA threaded gold antenna posts
    const wifiPost1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 8), goldMat);
    wifiPost1.position.set(-1.25, 0.38, 0.49);
    wifiPost1.rotation.x = Math.PI / 2;
    const wifiPost2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 8), goldMat);
    wifiPost2.position.set(-1.25, 0.26, 0.49);
    wifiPost2.rotation.x = Math.PI / 2;
    rearIo.add(wifiPost1, wifiPost2);
    mbGroup.add(rearIo);

    // 2-Digit 7-Segment Debug LED (Top-Right: "A0" Status)
    const debugLedBezel = this.createVoxel(1.18, 1.35, 0.07, 0.18, 0.12, 0.04, bgaChipMat);
    const debugSegment1 = this.createVoxel(1.14, 1.35, 0.095, 0.06, 0.08, 0.01, debugLedGreen);
    const debugSegment2 = this.createVoxel(1.22, 1.35, 0.095, 0.06, 0.08, 0.01, debugLedGreen);
    mbGroup.add(debugLedBezel, debugSegment1, debugSegment2);

    // Front-panel USB 3.2 Key-A & 19-Pin Headers (Right lower border)
    mbGroup.add(this.createVoxel(1.28, 0.1, 0.1, 0.12, 0.14, 0.12, darkMetalMat));
    mbGroup.add(this.createVoxel(1.28, -0.2, 0.1, 0.12, 0.22, 0.12, darkMetalMat));

    this.registerComponent({
      id: 'motherboard',
      name: 'ATX 旗舰主板 (带 VRM 供电散热鳍片与电容阵列)',
      group: mbGroup,
      assembledPos: new THREE.Vector3(-0.25, 0.3, -0.85),
      explodedPos: new THREE.Vector3(-0.25, 0.3, -1.9),
      installedStep: 1,
    });

    // =========================================================
    // 3. CPU (处理器 - 带金色防呆三角标与顶盖镭雕)
    // =========================================================
    const cpuGroup = new THREE.Group();
    // Substrate PCB with SMD capacitors in center cutout
    cpuGroup.add(this.createVoxel(0, 0, 0, 0.68, 0.68, 0.05, goldMat));
    // Nickel-plated IHS copper heat spreader
    cpuGroup.add(this.createVoxel(0, 0, 0.05, 0.58, 0.58, 0.06, vrmArmorMat));
    // Top central laser etched surface
    cpuGroup.add(this.createVoxel(0, 0, 0.085, 0.48, 0.48, 0.02, darkMetalMat));
    // CPU IHS octagonal heatspreader wing cutouts
    cpuGroup.add(this.createVoxel(-0.27, 0, 0.06, 0.04, 0.3, 0.05, darkMetalMat));
    cpuGroup.add(this.createVoxel(0.27, 0, 0.06, 0.04, 0.3, 0.05, darkMetalMat));

    // Golden Alignment Triangle (Pin 1 Indicator)
    const triGeom = new THREE.ConeGeometry(0.045, 0.06, 3);
    const triMesh = new THREE.Mesh(triGeom, goldMat);
    triMesh.rotation.z = Math.PI / 4;
    triMesh.position.set(-0.24, -0.24, 0.1);
    cpuGroup.add(triMesh);

    this.registerComponent({
      id: 'cpu',
      name: 'CPU 处理器 (带金色防呆三角标)',
      group: cpuGroup,
      assembledPos: new THREE.Vector3(-0.3, 0.95, -0.74),
      explodedPos: new THREE.Vector3(-0.3, 1.9, -0.74),
      installedStep: 1,
    });

    // =========================================================
    // 4. RAM (双通道内存 - 颗粒、装甲与 RGB 导光条)
    // =========================================================
    const ramGroup = new THREE.Group();
    const createVoxelRamStick = () => {
      const stick = new THREE.Group();
      // PCB
      stick.add(this.createVoxel(0, 0, 0, 0.05, 1.35, 0.28, pcbMat));
      // Gold teeth with center notch
      stick.add(this.createVoxel(0, -0.66, -0.06, 0.04, 0.06, 0.24, goldMat));
      // Metal armor with brushed chamfers
      stick.add(this.createVoxel(0, 0.05, 0.04, 0.09, 1.25, 0.24, vrmArmorMat));
      // BGA DRAM chip voxels
      for (let c = -0.45; c <= 0.45; c += 0.28) {
        stick.add(this.createVoxel(0.05, c, 0.02, 0.03, 0.16, 0.16, bgaChipMat));
      }
      // Top RGB Diffuser Bar & Frosted Fins
      stick.add(this.createVoxel(0, 0.7, 0.05, 0.08, 0.08, 0.26, rgbCyanMat));
      stick.add(this.createVoxel(0, 0.73, 0.05, 0.04, 0.04, 0.22, vrmArmorMat));
      return stick;
    };

    // Placed in Channel 2 & 4 (Standard dual channel best practice)
    const ram1 = createVoxelRamStick();
    ram1.position.set(0.62 + 0.16, 0.65, 0.1);
    const ram2 = createVoxelRamStick();
    ram2.position.set(0.62 + 0.48, 0.65, 0.1);
    ramGroup.add(ram1, ram2);

    this.registerComponent({
      id: 'ram',
      name: 'DDR5 32G 双通道内存 (插在 2/4 槽位)',
      group: ramGroup,
      assembledPos: new THREE.Vector3(-0.25, 0.3, -0.85),
      explodedPos: new THREE.Vector3(1.1, 0.3, -0.85),
      installedStep: 2,
    });

    // =========================================================
    // 5. M.2 NVMe SSD (PCIe 4.0 固态硬盘与散热马甲)
    // =========================================================
    const ssdGroup = new THREE.Group();
    // 2280 PCB
    ssdGroup.add(this.createVoxel(0, 0, 0, 0.85, 0.26, 0.04, pcbMat));
    // Gold contacts with M-Key notch
    ssdGroup.add(this.createVoxel(-0.41, 0, 0, 0.06, 0.2, 0.03, goldMat));
    // Controller & NAND Flash Dies
    ssdGroup.add(this.createVoxel(-0.15, 0, 0.03, 0.18, 0.18, 0.03, bgaChipMat));
    ssdGroup.add(this.createVoxel(0.18, 0, 0.03, 0.22, 0.2, 0.03, bgaChipMat));
    // Grooved Aluminum Heatsink
    ssdGroup.add(this.createVoxel(0.05, 0, 0.07, 0.78, 0.26, 0.06, darkMetalMat));
    // CNC Heatsink Fins
    for (let hf = -0.25; hf <= 0.35; hf += 0.12) {
      ssdGroup.add(this.createVoxel(0.05 + hf, 0, 0.11, 0.04, 0.24, 0.03, vrmArmorMat));
    }
    // Thermal Pad Layer indicator (blue)
    ssdGroup.add(this.createVoxel(0.05, 0, 0.045, 0.76, 0.24, 0.01, rgbCyanMat));

    this.registerComponent({
      id: 'ssd',
      name: 'PCIe 4.0 NVMe M.2 固态硬盘 (带金属散热装甲)',
      group: ssdGroup,
      assembledPos: new THREE.Vector3(-0.2, 0.05, -0.74),
      explodedPos: new THREE.Vector3(-0.2, 0.05, 0.35),
      installedStep: 3,
    });

    // =========================================================
    // 6. COOLER (双塔风冷散热器 - 7根热管与旋转体素风扇)
    // =========================================================
    const coolerGroup = new THREE.Group();
    // Pure Copper mirror nickel-plated base
    coolerGroup.add(this.createVoxel(0, -0.5, 0, 0.85, 0.12, 0.85, copperMat));

    // 6 U-shaped Sintered Copper Heat Pipes
    for (let hp = -0.3; hp <= 0.3; hp += 0.12) {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.4, 8), copperMat);
      pipe.position.set(hp, 0.1, 0);
      coolerGroup.add(pipe);
    }

    // Twin Voxel Fin Radiator Towers (Tower 1 & Tower 2)
    const tower1 = new THREE.Group();
    tower1.add(this.createVoxel(0, 0.2, -0.26, 0.95, 1.1, 0.36, vrmArmorMat));
    for (let f = -0.3; f <= 0.7; f += 0.12) {
      tower1.add(this.createVoxel(0, f, -0.26, 0.98, 0.02, 0.38, darkMetalMat));
    }
    // Heatpipe End Sealing Caps on top of Tower 1
    for (let hp = -0.3; hp <= 0.3; hp += 0.12) {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.06, 8), copperMat);
      cap.position.set(hp, 0.78, -0.26);
      tower1.add(cap);
    }

    const tower2 = new THREE.Group();
    tower2.add(this.createVoxel(0, 0.2, 0.26, 0.95, 1.1, 0.36, vrmArmorMat));
    for (let f = -0.3; f <= 0.7; f += 0.12) {
      tower2.add(this.createVoxel(0, f, 0.26, 0.98, 0.02, 0.38, darkMetalMat));
    }
    // Heatpipe End Sealing Caps on top of Tower 2
    for (let hp = -0.3; hp <= 0.3; hp += 0.12) {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.06, 8), copperMat);
      cap.position.set(hp, 0.78, 0.26);
      tower2.add(cap);
    }
    coolerGroup.add(tower1, tower2);

    // Front & Center 120mm Voxel Fans with Anti-Vibration Pads
    const createCoolerFan = (zOffset: number) => {
      const fanRoot = new THREE.Group();
      // Outer Fan Frame
      fanRoot.add(this.createVoxel(0, 0.2, zOffset, 1.05, 1.05, 0.12, darkMetalMat));

      // 4 Anti-Vibration Silicone Corner Pads
      const corners = [
        [-0.46, 0.66],
        [0.46, 0.66],
        [-0.46, -0.26],
        [0.46, -0.26],
      ];
      corners.forEach(([cx, cy]) => {
        fanRoot.add(this.createVoxel(cx, cy, zOffset, 0.12, 0.12, 0.14, pcbMat));
      });

      // Spinning Blade Hub with Metallic Center Badge
      const bladeHub = new THREE.Group();
      bladeHub.position.set(0, 0.2, zOffset);
      bladeHub.add(this.createVoxel(0, 0, 0, 0.22, 0.22, 0.14, darkMetalMat));
      // Center silver metallic emblem ring
      const emblem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.15, 16), vrmArmorMat);
      emblem.rotation.x = Math.PI / 2;
      bladeHub.add(emblem);

      // 7 Aerodynamic Voxel Blades
      for (let b = 0; b < 7; b++) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.38, 0.04), vrmArmorMat);
        blade.rotation.z = (b * Math.PI * 2) / 7;
        blade.position.y = 0.22;
        bladeHub.add(blade);
      }
      this.rotatingFanHubs.push(bladeHub);
      fanRoot.add(bladeHub);
      return fanRoot;
    };

    coolerGroup.add(createCoolerFan(0.5));
    coolerGroup.add(createCoolerFan(0.0));

    this.registerComponent({
      id: 'cooler',
      name: '双塔 7 热管风冷散热器 (双旋转静音风扇)',
      group: coolerGroup,
      assembledPos: new THREE.Vector3(-0.3, 0.95, -0.55),
      explodedPos: new THREE.Vector3(-0.3, 0.95, 1.1),
      installedStep: 4,
    });

    // =========================================================
    // 7. GPU (显卡 - 三风扇机甲外壳、金属背板与旋转风扇)
    // =========================================================
    const gpuGroup = new THREE.Group();
    // Shroud body with chamfered sci-fi armor
    gpuGroup.add(this.createVoxel(0, 0, 0, 2.7, 0.9, 0.42, darkMetalMat));
    // Metal backplate
    gpuGroup.add(this.createVoxel(0, 0.44, 0, 2.7, 0.06, 0.44, vrmArmorMat));

    // Flow-Through Cutout Window on Backplate (exposing copper heatpipe fins)
    gpuGroup.add(this.createVoxel(0.85, 0.44, 0, 0.7, 0.07, 0.32, darkMetalMat));
    for (let cFin = 0.55; cFin <= 1.15; cFin += 0.1) {
      gpuGroup.add(this.createVoxel(cFin, 0.38, 0, 0.03, 0.1, 0.3, copperMat));
    }

    // PCIe 5.0 x16 Gold Finger with Key Notch
    gpuGroup.add(this.createVoxel(-0.3, 0.52, -0.15, 1.4, 0.1, 0.04, goldMat));

    // Rear Dual-Slot Metal Bracket & DisplayPort / HDMI outputs
    const ioBracket = new THREE.Group();
    ioBracket.add(this.createVoxel(-1.4, 0.1, 0, 0.1, 1.2, 0.44, vrmArmorMat));
    // 3x DisplayPort 2.1 & 1x HDMI 2.1
    ioBracket.add(this.createVoxel(-1.46, 0.3, -0.1, 0.04, 0.08, 0.12, darkMetalMat)); // DP 1
    ioBracket.add(this.createVoxel(-1.46, 0.1, -0.1, 0.04, 0.08, 0.12, darkMetalMat)); // DP 2
    ioBracket.add(this.createVoxel(-1.46, -0.1, -0.1, 0.04, 0.08, 0.12, darkMetalMat)); // DP 3
    ioBracket.add(this.createVoxel(-1.46, -0.1, 0.1, 0.04, 0.08, 0.12, goldMat)); // HDMI
    gpuGroup.add(ioBracket);

    // 16-Pin 12V-2x6 Power Connector on top edge (with 4 Micro-Sense Pins)
    const pwrConnector = new THREE.Group();
    pwrConnector.add(this.createVoxel(0.5, 0.48, 0.1, 0.24, 0.08, 0.14, darkMetalMat));
    pwrConnector.add(this.createVoxel(0.5, 0.51, 0.1, 0.2, 0.02, 0.1, goldMat)); // 12 power pins
    pwrConnector.add(this.createVoxel(0.5, 0.53, 0.14, 0.12, 0.02, 0.03, goldMat)); // 4 sense pins
    gpuGroup.add(pwrConnector);

    // Side RGB Logo Bar
    gpuGroup.add(this.createVoxel(0, -0.42, 0.22, 1.6, 0.06, 0.03, rgbCyanMat));
    // GeForece RTX Brand badge inlay
    gpuGroup.add(this.createVoxel(-0.4, -0.42, 0.23, 0.5, 0.04, 0.02, vrmArmorMat));

    // 3 Voxel Rotating Cooling Fans (Alternate Direction Ring Blade Fans)
    const fanPositions = [-0.75, 0, 0.75];
    fanPositions.forEach((posX, idx) => {
      const fanAssembly = new THREE.Group();
      fanAssembly.position.set(posX, 0, 0.23);

      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 16), darkMetalMat);
      hub.rotation.x = Math.PI / 2;
      fanAssembly.add(hub);
      // Silver Metallic Center Inlay
      const hubEmblem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.07, 12), vrmArmorMat);
      hubEmblem.rotation.x = Math.PI / 2;
      fanAssembly.add(hubEmblem);

      // 9 Voxel Ring Blades
      for (let b = 0; b < 9; b++) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.26, 0.02), darkMetalMat);
        blade.rotation.z = (b * Math.PI * 2) / 9 + (idx % 2 === 1 ? 0.3 : 0);
        blade.position.y = 0.15;
        fanAssembly.add(blade);
      }

      this.rotatingFanHubs.push(fanAssembly);
      gpuGroup.add(fanAssembly);
    });

    this.registerComponent({
      id: 'gpu',
      name: 'RTX 4070 Super 独立显卡 (三风扇赛博机甲装甲)',
      group: gpuGroup,
      assembledPos: new THREE.Vector3(-0.2, -0.15, -0.4),
      explodedPos: new THREE.Vector3(-0.2, -0.15, 1.2),
      installedStep: 7,
    });

    // =========================================================
    // 8. POWER SUPPLY (850W 金牌模组电源与风扇进风网)
    // =========================================================
    const psuGroup = new THREE.Group();
    // Outer metal chassis
    psuGroup.add(this.createVoxel(0, 0, 0, 1.9, 1.1, 1.6, darkMetalMat));

    // Bottom Fan Intake Grill with Hexagonal Pattern
    psuGroup.add(this.createVoxel(0, -0.56, 0, 1.3, 0.04, 1.3, pcbMat));
    const psuFan = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.06, 16), darkMetalMat);
    psuFan.position.set(0, -0.52, 0);
    psuGroup.add(psuFan);

    // Rear AC Power C14 Receptacle & Rocker Switch
    psuGroup.add(this.createVoxel(-0.96, 0.15, 0.3, 0.04, 0.25, 0.3, darkMetalMat)); // C14 housing
    // 3 Copper Pins inside C14
    for (let cp = -0.06; cp <= 0.06; cp += 0.06) {
      psuGroup.add(this.createVoxel(-0.98, 0.15, 0.3 + cp, 0.03, 0.06, 0.02, copperMat));
    }
    // Red Lighted AC Master Rocker Switch
    psuGroup.add(this.createVoxel(-0.96, 0.15, -0.25, 0.04, 0.18, 0.14, debugLedRed));
    // Eco / Hybrid Fan Mode Switch
    psuGroup.add(this.createVoxel(-0.96, 0.15, -0.05, 0.03, 0.08, 0.08, vrmArmorMat));

    // 80Plus Gold Emblem Badge
    psuGroup.add(this.createVoxel(0, 0.1, 0.81, 0.35, 0.25, 0.02, goldMat));

    // Full Modular Cable Socket Array (Front)
    // 24P Motherboard (10+14 split)
    psuGroup.add(this.createVoxel(0.96, 0.22, 0.25, 0.04, 0.14, 0.42, pcbMat));
    // 4x 8-Pin CPU/PCIe sockets
    psuGroup.add(this.createVoxel(0.96, -0.05, 0.25, 0.04, 0.12, 0.42, darkMetalMat));
    // 3x 6-Pin SATA/Molex sockets
    psuGroup.add(this.createVoxel(0.96, -0.28, 0.25, 0.04, 0.1, 0.38, pcbMat));

    this.registerComponent({
      id: 'psu',
      name: '850W ATX 3.0 金牌全模组电源',
      group: psuGroup,
      assembledPos: new THREE.Vector3(-0.95, -1.45, -0.15),
      explodedPos: new THREE.Vector3(-2.3, -1.45, -0.15),
      installedStep: 6,
    });

    // =========================================================
    // 9. CABLES (模组走线与机箱跳线 - 蛇皮网编织质感与理线梳)
    // =========================================================
    const cablesGroup = new THREE.Group();
    const cableMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6, // Sleek cobalt blue braided sleeves
      roughness: 0.6,
      metalness: 0.1,
    });
    const cable24pMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Stealth carbon dark weave
      roughness: 0.7,
    });
    const combMat = new THREE.MeshStandardMaterial({
      color: 0x09090b, // Stealth black cable combs
      roughness: 0.3,
      metalness: 0.5,
    });

    // 24-Pin ATX Mainboard Braided Cable curve
    const atxCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.05, 0.7, -0.75),
      new THREE.Vector3(1.4, 0.65, -0.5),
      new THREE.Vector3(1.45, -0.2, -0.4),
      new THREE.Vector3(0.5, -1.2, -0.2),
    ]);
    const atxGeo = new THREE.TubeGeometry(atxCurve, 28, 0.085, 8, false);
    cablesGroup.add(new THREE.Mesh(atxGeo, cable24pMat));

    // Cable Combs along the 24-Pin cable run
    const comb1 = this.createVoxel(1.35, 0.6, -0.52, 0.06, 0.22, 0.18, combMat);
    const comb2 = this.createVoxel(1.42, 0.1, -0.42, 0.06, 0.22, 0.18, combMat);
    cablesGroup.add(comb1, comb2);

    // 16-Pin 12V-2x6 GPU Braided Power Cable
    const gpuCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.3, -0.15, -0.3),
      new THREE.Vector3(0.4, -0.7, -0.2),
      new THREE.Vector3(0.2, -1.2, -0.15),
    ]);
    const gpuCableGeo = new THREE.TubeGeometry(gpuCurve, 22, 0.055, 8, false);
    cablesGroup.add(new THREE.Mesh(gpuCableGeo, cableMat));

    // GPU Cable Comb
    const gpuComb = this.createVoxel(0.38, -0.65, -0.21, 0.04, 0.14, 0.12, combMat);
    cablesGroup.add(gpuComb);

    // Front Panel Jumpers Cable
    const fpanelCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.8, -1.15, -0.8),
      new THREE.Vector3(1.4, -1.4, -0.6),
      new THREE.Vector3(1.7, 1.8, 0.6),
    ]);
    const fpanelGeo = new THREE.TubeGeometry(fpanelCurve, 20, 0.03, 6, false);
    cablesGroup.add(new THREE.Mesh(fpanelGeo, rgbMagentaMat));

    // Top CPU 8-Pin EPS Braided Power Cable
    const cpuEpsCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.7, 1.55, -0.75),
      new THREE.Vector3(-0.8, 1.85, -0.6),
      new THREE.Vector3(-1.2, 1.9, -0.3),
    ]);
    const cpuEpsGeo = new THREE.TubeGeometry(cpuEpsCurve, 16, 0.05, 8, false);
    cablesGroup.add(new THREE.Mesh(cpuEpsGeo, cable24pMat));

    this.registerComponent({
      id: 'cables',
      name: '编织网模组电源线与理线梳',
      group: cablesGroup,
      assembledPos: new THREE.Vector3(0, 0, 0),
      explodedPos: new THREE.Vector3(0, -0.8, 0.4),
      installedStep: 8,
    });
  }

  private registerComponent(item: ComponentMeshItem) {
    this.components.set(item.id, item);
    item.group.position.copy(item.assembledPos);
    this.scene.add(item.group);
  }

  private setupControls() {
    const el = this.renderer.domElement;

    // Mouse Controls
    el.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.spherical.theta -= deltaX * 0.008;
      this.spherical.phi = Math.max(
        0.2,
        Math.min(Math.PI - 0.2, this.spherical.phi - deltaY * 0.008)
      );

      this.updateCameraPosition();
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    // Zoom via Wheel
    el.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.spherical.radius = Math.max(3.5, Math.min(14, this.spherical.radius + e.deltaY * 0.006));
        this.updateCameraPosition();
      },
      { passive: false }
    );

    // Touch controls for mobile
    let touchStartDist = 0;
    el.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    });

    el.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && this.isDragging) {
        const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
        const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

        this.spherical.theta -= deltaX * 0.008;
        this.spherical.phi = Math.max(
          0.2,
          Math.min(Math.PI - 0.2, this.spherical.phi - deltaY * 0.008)
        );

        this.updateCameraPosition();
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const diff = touchStartDist - dist;
        this.spherical.radius = Math.max(3.5, Math.min(14, this.spherical.radius + diff * 0.02));
        touchStartDist = dist;
        this.updateCameraPosition();
      }
    });

    el.addEventListener('touchend', () => {
      this.isDragging = false;
    });
  }

  private updateCameraPosition() {
    const x =
      this.spherical.radius *
      Math.sin(this.spherical.phi) *
      Math.sin(this.spherical.theta);
    const y = this.spherical.radius * Math.cos(this.spherical.phi);
    const z =
      this.spherical.radius *
      Math.sin(this.spherical.phi) *
      Math.cos(this.spherical.theta);

    this.camera.position.set(x, y, z).add(this.targetLookAt);
    this.camera.lookAt(this.targetLookAt);
  }

  // ==========================================
  // Public API
  // ==========================================
  public setStep(step: number) {
    this.currentStep = step;

    // Component visibility and ghost effect based on step
    this.components.forEach((item) => {
      const isVisible = item.installedStep <= step;
      item.group.visible = isVisible;

      // Highlight the component of current step
      const isCurrent = item.installedStep === step;
      item.group.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) return;
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.emissive = new THREE.Color(isCurrent ? 0x06b6d4 : 0x000000);
            child.material.emissiveIntensity = isCurrent ? 0.35 : 0.0;
          }
        }
      });
    });
  }

  public getCurrentStep(): number {
    return this.currentStep;
  }

  public setExploded(exploded: boolean) {
    this.isExploded = exploded;
  }

  public resetCamera() {
    this.spherical = { radius: 7.8, theta: 0.65, phi: 1.15 };
    this.targetLookAt.set(0, 0, 0);
    this.updateCameraPosition();
  }

  public focusComponent(componentKey: string) {
    const item = this.components.get(componentKey);
    if (item) {
      this.targetLookAt.copy(item.assembledPos);
      this.spherical.radius = 5.2;
      this.updateCameraPosition();
    }
  }

  public handleResize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width > 0 && height > 0) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }

  private animate() {
    this.animId = requestAnimationFrame(this.animate);

    // 1. Smoothly interpolate explosion
    const targetProgress = this.isExploded ? 1.0 : 0.0;
    this.explosionProgress += (targetProgress - this.explosionProgress) * 0.08;

    this.components.forEach((item) => {
      item.group.position.lerpVectors(
        item.assembledPos,
        item.explodedPos,
        this.explosionProgress
      );
    });

    // 2. Rotate all voxel fan blade assemblies continuously in real-time
    for (const fan of this.rotatingFanHubs) {
      fan.rotation.z += 0.045;
    }

    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    cancelAnimationFrame(this.animId);
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
