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
  private activeComponentKey?: string;

  // Active step installation animation
  private activeAnimation: {
    item: ComponentMeshItem;
    startPos: THREE.Vector3;
    targetPos: THREE.Vector3;
    startTime: number;
    duration: number;
    onComplete?: () => void;
  } | null = null;

  // Callbacks for external React component sync
  public onComponentClick?: (componentId: string) => void;
  public onComponentHover?: (componentName: string | null) => void;

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
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
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
    // 1. Soft neutral ambient light
    const ambientLight = new THREE.AmbientLight(0xf8fafc, 0.75);
    this.scene.add(ambientLight);

    // 2. High-Precision Studio Key Light (4200K warm neutral white)
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.6);
    keyLight.position.set(6, 12, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 30;
    this.scene.add(keyLight);

    // 3. Studio Daylight Fill Light (soft neutral fill to reveal component depths)
    const fillLight = new THREE.DirectionalLight(0xf1f5f9, 0.9);
    fillLight.position.set(-6, 7, 7);
    this.scene.add(fillLight);

    // 4. Warm Studio Rim Light (golden rim backlight for sharp silhouette)
    const rimLight = new THREE.DirectionalLight(0xffeedb, 0.8);
    rimLight.position.set(0, 9, -7);
    this.scene.add(rimLight);

    // 5. Overhead Softbox Light (clean specular reflections on tops of components)
    const topLight = new THREE.DirectionalLight(0xffffff, 0.6);
    topLight.position.set(0, 14, 0);
    this.scene.add(topLight);

    // 6. Desk-surface soft bounce
    const bottomBounce = new THREE.DirectionalLight(0xe2e8f0, 0.3);
    bottomBounce.position.set(0, -4, 2);
    this.scene.add(bottomBounce);

    // 7. Subtle internal hardware diagnostic glow (calibrated natural warm glow)
    const internalGlow = new THREE.PointLight(0x38bdf8, 0.6, 7);
    internalGlow.position.set(0, 0.3, 0.3);
    this.scene.add(internalGlow);
  }

  private buildStudioStage() {
    const stageGroup = new THREE.Group();
    stageGroup.name = 'studio_stage';

    // 1. Professional ESD Silicone Anti-Static Workmat (Satin finish with refined reflections)
    const matGeom = new THREE.BoxGeometry(9.0, 0.12, 6.4);
    const matMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b, // Tech slate charcoal
      roughness: 0.32, // Satin sheen for realistic studio reflections
      metalness: 0.15,
      clearcoat: 0.25, // Clearcoat surface finish mimicking ESD silicone/rubber coating
      clearcoatRoughness: 0.35,
    });
    const workmat = new THREE.Mesh(matGeom, matMaterial);
    workmat.position.set(0, -2.25, 0);
    workmat.receiveShadow = true;
    stageGroup.add(workmat);

    // 2. Subtle beveled outer rim on the workmat
    const rimGeom = new THREE.BoxGeometry(9.2, 0.08, 6.6);
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.45,
      metalness: 0.35,
    });
    const matRim = new THREE.Mesh(rimGeom, rimMaterial);
    matRim.position.set(0, -2.29, 0);
    matRim.receiveShadow = true;
    stageGroup.add(matRim);

    // 3. Precision printed laser tick marks on mat borders
    const rulerMarkMat = new THREE.MeshBasicMaterial({
      color: 0x64748b, // Clean legible slate engraving
      transparent: true,
      opacity: 0.65,
    });

    // Top and Bottom ruler lines
    const rulerLongGeom = new THREE.BoxGeometry(7.8, 0.005, 0.02);
    const rulerTop = new THREE.Mesh(rulerLongGeom, rulerMarkMat);
    rulerTop.position.set(0, -2.18, -2.75);
    const rulerBottom = new THREE.Mesh(rulerLongGeom, rulerMarkMat);
    rulerBottom.position.set(0, -2.18, 2.75);
    stageGroup.add(rulerTop, rulerBottom);

    // Ruler tick marks along top edge
    for (let r = -3.6; r <= 3.6; r += 0.4) {
      const isMajor = Math.abs(r % 1.2) < 0.05;
      const tick = new THREE.Mesh(
        new THREE.BoxGeometry(0.015, 0.005, isMajor ? 0.14 : 0.07),
        rulerMarkMat
      );
      tick.position.set(r, -2.18, -2.75);
      stageGroup.add(tick);
    }

    // 4. Side Magnetic Screw & Small Parts Organizer Trays
    const trayMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      roughness: 0.38,
      metalness: 0.3,
      clearcoat: 0.2,
    });
    for (let t = -1.8; t <= 1.8; t += 0.9) {
      const pocketGeom = new THREE.BoxGeometry(0.8, 0.04, 0.65);
      const pocket = new THREE.Mesh(pocketGeom, trayMat);
      pocket.position.set(3.9, -2.18, t);
      pocket.receiveShadow = true;
      stageGroup.add(pocket);
    }

    // 5. Soft floor ground shadow receiver beneath the desk
    const floorGeom = new THREE.PlaneGeometry(32, 32);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.28 });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -2.35, 0);
    floor.receiveShadow = true;
    stageGroup.add(floor);

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
      color: 0xf8fafc,
      transparent: true,
      opacity: 0.08,
      roughness: 0.02,
      transmission: 0.98,
      thickness: 0.05,
    });

    const rgbCyanMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const rgbMagentaMat = new THREE.MeshBasicMaterial({ color: 0xec4899 });
    const debugLedRed = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const debugLedGreen = new THREE.MeshBasicMaterial({ color: 0x22c55e });

    // =========================================================
    // 1. CHASSIS CASE (侧透海景房机箱架构 - 开放式座舱)
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

    // Front Panoramic Glass (海景房无立柱前置透明玻璃)
    const glassFront = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.9, 2.4), glassMat);
    glassFront.position.set(2.14, 0, 0.05);
    glassFront.userData.isGlass = true;
    caseGroup.add(glassFront);

    this.registerComponent({
      id: 'case',
      name: '侧透海景房机箱架构 (开放式座舱)',
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

    // Front & Center 120mm High-Fidelity Voxel Fans with Aerodynamic Swept Sickle Blades
    const createCoolerFan = (zOffset: number) => {
      const fanRoot = new THREE.Group();

      // 1. Circular intake cowling duct (Airflow funnel ring with open center)
      const ductGeom = new THREE.CylinderGeometry(0.48, 0.50, 0.12, 32, 1, true);
      const ductMesh = new THREE.Mesh(ductGeom, darkMetalMat);
      ductMesh.rotation.x = Math.PI / 2;
      ductMesh.position.set(0, 0.2, zOffset);
      fanRoot.add(ductMesh);

      // 2. Square structural perimeter frame (hollow airflow center)
      fanRoot.add(this.createVoxel(0, 0.7, zOffset, 1.06, 0.08, 0.12, darkMetalMat));
      fanRoot.add(this.createVoxel(0, -0.3, zOffset, 1.06, 0.08, 0.12, darkMetalMat));
      fanRoot.add(this.createVoxel(-0.5, 0.2, zOffset, 0.08, 1.06, 0.12, darkMetalMat));
      fanRoot.add(this.createVoxel(0.5, 0.2, zOffset, 0.08, 1.06, 0.12, darkMetalMat));

      // 4 Anti-Vibration Silicone Corner Mounting Ears with Screw Recesses
      const corners = [
        [-0.44, 0.64],
        [0.44, 0.64],
        [-0.44, -0.24],
        [0.44, -0.24],
      ];
      corners.forEach(([cx, cy]) => {
        fanRoot.add(this.createVoxel(cx, cy, zOffset, 0.16, 0.16, 0.12, darkMetalMat));
        fanRoot.add(this.createVoxel(cx, cy, zOffset, 0.12, 0.12, 0.13, pcbMat)); // silicone pad
        fanRoot.add(this.createVoxel(cx, cy, zOffset + 0.062, 0.05, 0.05, 0.01, vrmArmorMat)); // screw hole
      });

      // 3. Rear Stator Support Struts (4 curved motor support ribs in X-pattern)
      for (let s = 0; s < 4; s++) {
        const angle = (s * Math.PI) / 2 + Math.PI / 4;
        const strut = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.03, 0.02), darkMetalMat);
        strut.rotation.z = angle;
        strut.position.set(Math.cos(angle) * 0.22, 0.2 + Math.sin(angle) * 0.22, zOffset - 0.05);
        fanRoot.add(strut);
      }

      // 4. Subtle Inner ARGB Halo Ring
      const haloGeom = new THREE.TorusGeometry(0.46, 0.015, 12, 36);
      const haloRing = new THREE.Mesh(haloGeom, rgbCyanMat);
      haloRing.position.set(0, 0.2, zOffset + 0.055);
      fanRoot.add(haloRing);

      // 5. Spinning Rotor Hub & 9 Aerodynamic Swept Sickle Blades
      const rotorGroup = new THREE.Group();
      rotorGroup.position.set(0, 0.2, zOffset);

      // Central Motor Hub
      const hubGeom = new THREE.CylinderGeometry(0.15, 0.15, 0.12, 24);
      const hub = new THREE.Mesh(hubGeom, darkMetalMat);
      hub.rotation.x = Math.PI / 2;
      rotorGroup.add(hub);

      // Silver Brushed Metallic Center Emblem
      const emblem = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.13, 20), vrmArmorMat);
      emblem.rotation.x = Math.PI / 2;
      rotorGroup.add(emblem);

      // 9 Swept Sickle Blades with Attack Pitch Angle
      const bladeCount = 9;
      for (let b = 0; b < bladeCount; b++) {
        const bladePivot = new THREE.Group();
        bladePivot.rotation.z = (b * Math.PI * 2) / bladeCount;

        // Inner Blade Section (Angled at 25 degrees)
        const innerBlade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.20, 0.02), vrmArmorMat);
        innerBlade.position.set(0.02, 0.22, 0);
        innerBlade.rotation.x = 0.42; // Pitch attack angle!
        innerBlade.rotation.y = 0.12;
        bladePivot.add(innerBlade);

        // Swept Curved Tip Section (Curved backward)
        const outerBlade = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.18, 0.018), vrmArmorMat);
        outerBlade.position.set(0.055, 0.36, 0.015);
        outerBlade.rotation.x = 0.35;
        outerBlade.rotation.z = -0.26; // Curved sickle sweep!
        bladePivot.add(outerBlade);

        rotorGroup.add(bladePivot);
      }

      // Outer Interconnected Ring Link (Axial-tech / Uni-Fan connected ring)
      const bladeRingGeom = new THREE.TorusGeometry(0.46, 0.012, 8, 36);
      const bladeRing = new THREE.Mesh(bladeRingGeom, vrmArmorMat);
      rotorGroup.add(bladeRing);

      this.rotatingFanHubs.push(rotorGroup);
      fanRoot.add(rotorGroup);
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
      // Circular recessed fan intake funnel well
      const cowlGeom = new THREE.CylinderGeometry(0.33, 0.35, 0.06, 28, 1, true);
      const cowl = new THREE.Mesh(cowlGeom, darkMetalMat);
      cowl.rotation.x = Math.PI / 2;
      cowl.position.set(posX, 0, 0.22);
      gpuGroup.add(cowl);

      // Spinning Rotor Hub & Blades
      const rotor = new THREE.Group();
      rotor.position.set(posX, 0, 0.23);

      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.06, 20), darkMetalMat);
      hub.rotation.x = Math.PI / 2;
      rotor.add(hub);

      // Center Silver Laser Emblem
      const hubEmblem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.07, 16), vrmArmorMat);
      hubEmblem.rotation.x = Math.PI / 2;
      rotor.add(hubEmblem);

      // 9 Swept Sickle Blades with Pitch Angle
      const gpuBladeCount = 9;
      for (let b = 0; b < gpuBladeCount; b++) {
        const bladePivot = new THREE.Group();
        bladePivot.rotation.z = (b * Math.PI * 2) / gpuBladeCount + (idx % 2 === 1 ? 0.35 : 0);

        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.20, 0.018), darkMetalMat);
        blade.position.set(0.02, 0.18, 0);
        blade.rotation.x = 0.40; // Pitch attack angle!
        blade.rotation.z = -0.22; // Aerodynamic swept curve!
        bladePivot.add(blade);
        rotor.add(bladePivot);
      }

      // Outer Connected Ring Link (Axial-tech / TORX 5.0)
      const ringGeom = new THREE.TorusGeometry(0.31, 0.01, 8, 32);
      const ring = new THREE.Mesh(ringGeom, darkMetalMat);
      rotor.add(ring);

      this.rotatingFanHubs.push(rotor);
      gpuGroup.add(rotor);
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

    // =========================================================
    // 10. SIDE PANORAMIC GLASS PANEL (机箱全景侧透玻璃与整机点亮)
    // =========================================================
    const sideGlassGroup = new THREE.Group();
    const glassSide = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.9, 0.06), glassMat);
    glassSide.position.set(0, 0, 0);
    glassSide.userData.isGlass = true;
    sideGlassGroup.add(glassSide);

    // Subtle magnetic metal retention borders and handle latch
    const glassFrameMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.35,
      metalness: 0.7,
    });
    // Top magnetic strip
    sideGlassGroup.add(this.createVoxel(0, 1.94, 0.01, 4.2, 0.06, 0.07, glassFrameMat));
    // Bottom sliding rail
    sideGlassGroup.add(this.createVoxel(0, -1.94, 0.01, 4.2, 0.06, 0.07, glassFrameMat));
    // Quick-release grab tab
    sideGlassGroup.add(this.createVoxel(1.95, 1.7, 0.05, 0.14, 0.18, 0.04, glassFrameMat));

    this.registerComponent({
      id: 'case-glass',
      name: '侧透全景钢化玻璃侧板 (磁吸闭合)',
      group: sideGlassGroup,
      assembledPos: new THREE.Vector3(0, 0, 1.25),
      explodedPos: new THREE.Vector3(0, 0, 2.2),
      installedStep: 9,
    });
  }

  private registerComponent(item: ComponentMeshItem) {
    this.components.set(item.id, item);
    item.group.position.copy(item.assembledPos);

    // Deep clone materials per component to ensure complete isolation across parts
    item.group.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (!Array.isArray(child.material)) {
          child.material = child.material.clone();
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.userData.baseRoughness = child.material.roughness;
            child.material.userData.baseMetalness = child.material.metalness;
          }
        }
      }
    });

    this.scene.add(item.group);
  }

  private setupControls() {
    const el = this.renderer.domElement;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let mouseDownPos = { x: 0, y: 0 };
    let mouseDownTime = 0;
    let hasMoved = false;

    const findComponentAt = (clientX: number, clientY: number): ComponentMeshItem | null => {
      const rect = el.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, this.camera);

      // Collect all visible meshes in registered components
      const candidates: { mesh: THREE.Mesh; item: ComponentMeshItem }[] = [];
      this.components.forEach((item) => {
        if (!item.group.visible) return;
        item.group.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            candidates.push({ mesh: child, item });
          }
        });
      });

      const intersects = raycaster.intersectObjects(
        candidates.map((c) => c.mesh),
        false
      );
      if (intersects.length > 0) {
        // If the first intersection is glass, check if user clicked an internal hardware component behind the glass
        let chosenObject = intersects[0].object;
        if (chosenObject.userData.isGlass) {
          const innerHit = intersects.find((hit) => !hit.object.userData.isGlass);
          if (innerHit) {
            chosenObject = innerHit.object;
          }
        }
        const matched = candidates.find((c) => c.mesh === chosenObject);
        return matched ? matched.item : null;
      }
      return null;
    };

    // Mouse Controls
    el.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      hasMoved = false;
      mouseDownTime = performance.now();
      mouseDownPos = { x: e.clientX, y: e.clientY };
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', (e) => {
      if (this.isDragging) {
        const dist = Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y);
        const elapsed = performance.now() - mouseDownTime;
        // Reliable click check: movement <= 14px or fast tap (<300ms and <=24px)
        const isClick = !hasMoved || dist <= 14 || (elapsed < 300 && dist <= 24);
        if (isClick) {
          const hitItem = findComponentAt(e.clientX, e.clientY);
          if (hitItem && this.onComponentClick) {
            this.onComponentClick(hitItem.id);
          }
        }
      }
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;

        if (Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y) > 14) {
          hasMoved = true;
        }

        this.spherical.theta -= deltaX * 0.008;
        this.spherical.phi = Math.max(
          0.2,
          Math.min(Math.PI - 0.2, this.spherical.phi - deltaY * 0.008)
        );

        this.updateCameraPosition();
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      } else {
        // Subtle hover inspection
        const hit = findComponentAt(e.clientX, e.clientY);
        if (hit) {
          el.style.cursor = 'pointer';
          this.onComponentHover?.(hit.name);
        } else {
          el.style.cursor = 'grab';
          this.onComponentHover?.(null);
        }
      }
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
    let touchStartTime = 0;
    let touchStartDist = 0;
    el.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        hasMoved = false;
        touchStartTime = performance.now();
        mouseDownPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
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

        if (Math.hypot(e.touches[0].clientX - mouseDownPos.x, e.touches[0].clientY - mouseDownPos.y) > 16) {
          hasMoved = true;
        }

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

    el.addEventListener('touchend', (e) => {
      if (this.isDragging && e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const dist = Math.hypot(touch.clientX - mouseDownPos.x, touch.clientY - mouseDownPos.y);
        const elapsed = performance.now() - touchStartTime;
        const isClick = !hasMoved || dist <= 16 || (elapsed < 350 && dist <= 26);
        if (isClick) {
          const hitItem = findComponentAt(touch.clientX, touch.clientY);
          if (hitItem && this.onComponentClick) {
            this.onComponentClick(hitItem.id);
          }
        }
      }
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
  public setStep(step: number, activeComponentKey?: string) {
    this.currentStep = step;
    this.activeComponentKey = activeComponentKey;

    // Component visibility and clean accent effect based on step
    this.components.forEach((item) => {
      const isVisible = item.installedStep <= step;
      item.group.visible = isVisible;

      // Clean, refined highlight for component of current step
      const isCurrent = activeComponentKey
        ? item.id === activeComponentKey ||
          (activeComponentKey === 'case' && item.id === 'case-glass') ||
          (activeComponentKey === 'case-glass' && item.id === 'case') ||
          (activeComponentKey === 'motherboard' && step === 5 && item.id === 'case')
        : item.installedStep === step;

      item.group.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material && !child.userData.isGlass) {
          if (Array.isArray(child.material)) return;
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.emissive.set(isCurrent ? 0x0284c7 : 0x000000);
            child.material.emissiveIntensity = isCurrent ? 0.25 : 0.0;
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

  public focusComponent(componentKey: string, flash: boolean = true) {
    const item =
      this.components.get(componentKey) ||
      (componentKey === 'case' ? this.components.get('case-glass') : undefined) ||
      (componentKey === 'case-glass' ? this.components.get('case') : undefined);
    if (item) {
      this.targetLookAt.copy(item.assembledPos);
      this.spherical.radius =
        componentKey === 'case' || componentKey === 'case-glass' ? 7.5 : 5.2;
      this.updateCameraPosition();
      if (flash) {
        this.flashComponentHighlight(item);
      }
    }
  }

  public animateInstallStep(step: number, onComplete?: () => void) {
    let targetItem: ComponentMeshItem | undefined;
    this.components.forEach((item) => {
      if (item.installedStep === step) {
        targetItem = item;
      }
    });

    if (!targetItem) {
      if (onComplete) onComplete();
      return;
    }

    targetItem.group.visible = true;
    const offset =
      targetItem.id === 'case-glass'
        ? new THREE.Vector3(0, 0.4, 1.4)
        : new THREE.Vector3(0, 1.4, 0.3);
    const elevatedPos = targetItem.assembledPos.clone().add(offset);
    targetItem.group.position.copy(elevatedPos);

    this.activeAnimation = {
      item: targetItem,
      startPos: elevatedPos,
      targetPos: targetItem.assembledPos.clone(),
      startTime: performance.now(),
      duration: 650,
      onComplete: () => {
        this.flashComponentHighlight(targetItem!);
        if (onComplete) onComplete();
      },
    };
  }

  private flashComponentHighlight(item: ComponentMeshItem) {
    item.group.traverse((child) => {
      if (
        child instanceof THREE.Mesh &&
        child.material &&
        child.material instanceof THREE.MeshStandardMaterial &&
        !child.userData.isGlass
      ) {
        const mat = child.material;
        const baseRoughness =
          typeof mat.userData.baseRoughness === 'number'
            ? mat.userData.baseRoughness
            : mat.roughness;

        // Controlled specular flash (clean tech cyan sheen, no permanent white washout)
        mat.emissive.set(0x0284c7);
        mat.emissiveIntensity = 0.35;
        mat.roughness = Math.max(0.08, baseRoughness * 0.5);

        setTimeout(() => {
          const isCurrent =
            item.id === this.activeComponentKey ||
            (this.activeComponentKey === 'case' && item.id === 'case-glass') ||
            (this.activeComponentKey === 'case-glass' && item.id === 'case') ||
            item.installedStep === this.currentStep;

          mat.emissive.set(isCurrent ? 0x0284c7 : 0x000000);
          mat.emissiveIntensity = isCurrent ? 0.25 : 0.0;
          mat.roughness = baseRoughness;
        }, 450);
      }
    });
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

    // 1. Smoothly interpolate installation animation if active
    if (this.activeAnimation) {
      const elapsed = performance.now() - this.activeAnimation.startTime;
      const t = Math.min(1.0, elapsed / this.activeAnimation.duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - t, 3);
      this.activeAnimation.item.group.position.lerpVectors(
        this.activeAnimation.startPos,
        this.activeAnimation.targetPos,
        ease
      );
      if (t >= 1.0) {
        const cb = this.activeAnimation.onComplete;
        this.activeAnimation = null;
        if (cb) cb();
      }
    } else {
      // 2. Smoothly interpolate explosion
      const targetProgress = this.isExploded ? 1.0 : 0.0;
      this.explosionProgress += (targetProgress - this.explosionProgress) * 0.08;

      this.components.forEach((item) => {
        item.group.position.lerpVectors(
          item.assembledPos,
          item.explodedPos,
          this.explosionProgress
        );
      });
    }

    // 3. Rotate all voxel fan blade assemblies continuously in real-time
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
