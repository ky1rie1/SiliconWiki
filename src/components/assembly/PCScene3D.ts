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
  private fanBlades: THREE.Mesh[] = [];

  // Interaction & animation state
  private isExploded: boolean = false;
  private explosionProgress: number = 0; // 0 = assembled, 1 = exploded
  private currentStep: number = 1;

  // Camera Orbit State
  private isDragging: boolean = false;
  private previousMousePosition = { x: 0, y: 0 };
  private spherical = { radius: 7.5, theta: 0.6, phi: 1.1 };
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

    // 5. Build Procedural Hardware Models
    this.buildPCModels();

    // 6. Event listeners
    this.setupControls();

    // 7. Render Loop
    this.animate = this.animate.bind(this);
    this.animate();
  }

  private setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(5, 8, 5);
    dirLight1.castShadow = true;
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.2); // Cool cyan fill
    dirLight2.position.set(-6, -2, -4);
    this.scene.add(dirLight2);

    const internalRgb = new THREE.PointLight(0x60a5fa, 2.5, 6);
    internalRgb.position.set(0, 0.5, 0.5);
    this.scene.add(internalRgb);
  }

  private buildPCModels() {
    // ----------------- Materials -----------------
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x27272a, // dark zinc
      metalness: 0.85,
      roughness: 0.25,
    });

    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x18181b, // matte black PCB
      roughness: 0.4,
      metalness: 0.2,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      metalness: 0.9,
      roughness: 0.15,
    });

    const silverMat = new THREE.MeshStandardMaterial({
      color: 0xe4e4e7,
      metalness: 0.95,
      roughness: 0.1,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xdbeafe,
      transparent: true,
      opacity: 0.22,
      roughness: 0.05,
      transmission: 0.9,
      thickness: 0.1,
    });

    const rgbMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    // ----------------- 1. Chassis Case Frame -----------------
    const caseGroup = new THREE.Group();
    // Bottom panel
    const bottom = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.15, 2.4), metalMat);
    bottom.position.set(0, -2, 0);
    caseGroup.add(bottom);

    // Top panel
    const top = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.15, 2.4), metalMat);
    top.position.set(0, 2, 0);
    caseGroup.add(top);

    // Back I/O frame
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.15, 4, 2.4), metalMat);
    back.position.set(-2, 0, 0);
    caseGroup.add(back);

    // Rear metal wall
    const rearWall = new THREE.Mesh(new THREE.BoxGeometry(4.2, 4, 0.12), metalMat);
    rearWall.position.set(0, 0, -1.14);
    caseGroup.add(rearWall);

    // Front Glass/Metal column
    const frontCol = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4, 0.12), metalMat);
    frontCol.position.set(2, 0, 1.14);
    caseGroup.add(frontCol);

    // Tempered Glass Panel (Detachable)
    const glass = new THREE.Mesh(new THREE.BoxGeometry(4.0, 3.8, 0.06), glassMat);
    glass.position.set(0, 0, 1.16);
    caseGroup.add(glass);

    this.registerComponent({
      id: 'case',
      name: '侧透海景房机箱',
      group: caseGroup,
      assembledPos: new THREE.Vector3(0, 0, 0),
      explodedPos: new THREE.Vector3(0, 0, -0.6),
      installedStep: 5,
    });

    // ----------------- 2. Motherboard -----------------
    const mbGroup = new THREE.Group();
    const mbPcb = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.0, 0.08), pcbMat);
    mbGroup.add(mbPcb);

    // Heatsink armor on VRM
    const vrmArmor1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.35), silverMat);
    vrmArmor1.position.set(-0.85, 0.6, 0.2);
    mbGroup.add(vrmArmor1);

    const vrmArmor2 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.45, 0.35), silverMat);
    vrmArmor2.position.set(0.1, 1.1, 0.2);
    mbGroup.add(vrmArmor2);

    // PCIe Slot
    const pcieSlot = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.15, 0.15), silverMat);
    pcieSlot.position.set(0.1, -0.6, 0.1);
    mbGroup.add(pcieSlot);

    this.registerComponent({
      id: 'motherboard',
      name: 'ATX 主板',
      group: mbGroup,
      assembledPos: new THREE.Vector3(-0.3, 0.3, -0.85),
      explodedPos: new THREE.Vector3(-0.3, 0.3, -1.8),
      installedStep: 5,
    });

    // ----------------- 3. CPU -----------------
    const cpuGroup = new THREE.Group();
    const cpuBase = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.65, 0.05), goldMat);
    const cpuIhs = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.08), silverMat);
    cpuIhs.position.set(0, 0, 0.05);
    // Golden alignment triangle
    const tri = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.06, 3), goldMat);
    tri.position.set(-0.22, -0.22, 0.1);
    cpuGroup.add(cpuBase, cpuIhs, tri);

    this.registerComponent({
      id: 'cpu',
      name: 'CPU 处理器 (带金色防呆三角标)',
      group: cpuGroup,
      assembledPos: new THREE.Vector3(-0.25, 0.75, -0.76),
      explodedPos: new THREE.Vector3(-0.25, 1.6, -0.76),
      installedStep: 1,
    });

    // ----------------- 4. RAM (双通道内存) -----------------
    const ramGroup = new THREE.Group();
    const ramStick1 = this.createRamStick(silverMat, rgbMat);
    ramStick1.position.set(0.55, 0.75, 0.15);
    const ramStick2 = this.createRamStick(silverMat, rgbMat);
    ramStick2.position.set(0.72, 0.75, 0.15); // Slot 2 & 4
    ramGroup.add(ramStick1, ramStick2);

    this.registerComponent({
      id: 'ram',
      name: 'DDR5 32G 双通道内存',
      group: ramGroup,
      assembledPos: new THREE.Vector3(-0.3, 0.3, -0.85),
      explodedPos: new THREE.Vector3(0.8, 0.3, -0.85),
      installedStep: 2,
    });

    // ----------------- 5. M.2 SSD -----------------
    const ssdGroup = new THREE.Group();
    const ssdPcb = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 0.04), pcbMat);
    const ssdHeatsink = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.26, 0.08), metalMat);
    ssdHeatsink.position.set(0, 0, 0.04);
    ssdGroup.add(ssdPcb, ssdHeatsink);

    this.registerComponent({
      id: 'ssd',
      name: 'PCIe 4.0 NVMe M.2 固态硬盘',
      group: ssdGroup,
      assembledPos: new THREE.Vector3(-0.25, 0.05, -0.76),
      explodedPos: new THREE.Vector3(-0.25, 0.05, 0.2),
      installedStep: 3,
    });

    // ----------------- 6. Cooler (双塔风冷 / 水冷头) -----------------
    const coolerGroup = new THREE.Group();
    const tower1 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.4), silverMat);
    tower1.position.set(0, 0, 0);
    coolerGroup.add(tower1);

    // Heat pipes
    for (let i = -0.3; i <= 0.3; i += 0.15) {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.0, 8), goldMat);
      pipe.position.set(i, 0, 0);
      coolerGroup.add(pipe);
    }

    // Fans on cooler
    const fan1 = this.createFanMesh();
    fan1.position.set(0, 0, 0.25);
    coolerGroup.add(fan1);
    this.fanBlades.push(fan1);

    this.registerComponent({
      id: 'cooler',
      name: '双塔双风扇 CPU 散热器',
      group: coolerGroup,
      assembledPos: new THREE.Vector3(-0.25, 0.75, -0.35),
      explodedPos: new THREE.Vector3(-0.25, 1.2, 0.8),
      installedStep: 4,
    });

    // ----------------- 7. GPU (独立显卡) -----------------
    const gpuGroup = new THREE.Group();
    const gpuBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 0.45), metalMat);
    const gpuBackplate = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 0.05), silverMat);
    gpuBackplate.position.set(0, 0, -0.25);
    gpuGroup.add(gpuBody, gpuBackplate);

    // GPU Fans
    for (let f = -0.7; f <= 0.7; f += 0.7) {
      const gFan = this.createFanMesh();
      gFan.scale.set(0.7, 0.7, 0.7);
      gFan.position.set(f, 0, 0.25);
      gpuGroup.add(gFan);
      this.fanBlades.push(gFan);
    }

    // Glowing RGB strip on GPU side
    const gpuLed = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.04), rgbMat);
    gpuLed.position.set(0, 0.45, 0.1);
    gpuGroup.add(gpuLed);

    this.registerComponent({
      id: 'gpu',
      name: '独立显卡 (带三风扇与金属背板)',
      group: gpuGroup,
      assembledPos: new THREE.Vector3(-0.1, -0.3, -0.2),
      explodedPos: new THREE.Vector3(-0.1, -0.3, 1.4),
      installedStep: 7,
    });

    // ----------------- 8. PSU (电源仓) -----------------
    const psuGroup = new THREE.Group();
    const psuBox = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.0, 1.6), metalMat);
    psuGroup.add(psuBox);

    this.registerComponent({
      id: 'psu',
      name: 'ATX 3.0 金牌电源',
      group: psuGroup,
      assembledPos: new THREE.Vector3(-1.0, -1.4, 0),
      explodedPos: new THREE.Vector3(-1.0, -2.5, 0),
      installedStep: 6,
    });

    // ----------------- 9. Cables (走线与跳线) -----------------
    const cablesGroup = new THREE.Group();
    const mbCable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
    );
    mbCable.position.set(0.9, 0.2, -0.5);
    cablesGroup.add(mbCable);

    this.registerComponent({
      id: 'cables',
      name: '机箱面板跳线与主板供电线',
      group: cablesGroup,
      assembledPos: new THREE.Vector3(0, 0, 0),
      explodedPos: new THREE.Vector3(0.5, -0.5, 0.6),
      installedStep: 8,
    });
  }

  private createRamStick(metal: THREE.Material, rgb: THREE.Material) {
    const group = new THREE.Group();
    const stick = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.1, 0.35), metal);
    const light = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 0.35), rgb);
    light.position.set(0, 0.58, 0);
    group.add(stick, light);
    return group;
  }

  private createFanMesh() {
    const group = new THREE.Group();
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.35, 0.03, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0x3f3f46 })
    );
    const center = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.05, 16),
      new THREE.MeshStandardMaterial({ color: 0x18181b })
    );
    center.rotation.x = Math.PI / 2;
    group.add(rim, center);

    for (let i = 0; i < 7; i++) {
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.08, 0.015),
        new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.5 })
      );
      blade.position.set(0.16, 0, 0);
      blade.rotation.z = (i * Math.PI * 2) / 7;
      blade.rotation.x = 0.4;
      group.add(blade);
    }
    return group as any;
  }

  private registerComponent(item: ComponentMeshItem) {
    this.scene.add(item.group);
    item.group.position.copy(item.assembledPos);
    this.components.set(item.id, item);
  }

  private updateCameraPosition() {
    const { radius, theta, phi } = this.spherical;
    this.camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
    this.camera.position.y = radius * Math.cos(phi);
    this.camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
    this.camera.lookAt(this.targetLookAt);
  }

  private setupControls() {
    const el = this.renderer.domElement;

    const onMouseDown = (e: MouseEvent) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.spherical.theta -= deltaX * 0.007;
      this.spherical.phi -= deltaY * 0.007;
      // Clamp phi to prevent flip
      this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.spherical.phi));

      this.updateCameraPosition();
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      this.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      this.spherical.radius += e.deltaY * 0.005;
      this.spherical.radius = Math.max(3.5, Math.min(14, this.spherical.radius));
      this.updateCameraPosition();
    };

    // Touch support for mobile
    let touchStartX = 0;
    let touchStartY = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;

        this.spherical.theta -= deltaX * 0.008;
        this.spherical.phi -= deltaY * 0.008;
        this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.spherical.phi));

        this.updateCameraPosition();
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart);
    el.addEventListener('touchmove', onTouchMove);
  }

  // ----------------- Public API -----------------

  public setStep(stepNumber: number) {
    this.currentStep = stepNumber;
    // Highlight or show items installed up to this step
    this.components.forEach((item) => {
      const isInstalled = item.installedStep <= stepNumber;
      item.group.visible = true;
      item.group.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = child.material as THREE.Material;
          if (isInstalled) {
            mat.opacity = 1.0;
            mat.transparent = false;
          } else {
            mat.opacity = 0.2;
            mat.transparent = true;
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
    this.spherical = { radius: 7.5, theta: 0.6, phi: 1.1 };
    this.targetLookAt.set(0, 0, 0);
    this.updateCameraPosition();
  }

  public focusComponent(componentKey: string) {
    const item = this.components.get(componentKey);
    if (item) {
      this.targetLookAt.copy(item.assembledPos);
      this.spherical.radius = 5.0;
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

    // 2. Rotate fan blades
    for (const fan of this.fanBlades) {
      fan.rotation.z += 0.04;
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
