import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createSocketModel } from './socketModel';
import { createPCModel } from '../assembly/pcModel';
import { renderingBudget, type RenderingQuality } from '../assembly/renderingBudget';
import { clampSeparation, type PreviewModel } from './previewState';

/** One owner per canvas; interaction invalidates a frame, idle never runs a loop. */
export class PrototypeScene {
  private renderer?: THREE.WebGLRenderer;
  private controls?: OrbitControls;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(36, 1, .1, 120);
  private socket?: ReturnType<typeof createSocketModel>;
  private system?: ReturnType<typeof createPCModel>;
  private environment?: THREE.WebGLRenderTarget;
  private floor?: THREE.Mesh<THREE.PlaneGeometry, THREE.ShadowMaterial>;
  private key?: THREE.DirectionalLight;
  private resizeObserver?: ResizeObserver;
  private intersectionObserver?: IntersectionObserver;
  private frame = 0;
  private disposed = false;
  private visible = true;
  private view: PreviewModel = 'socket';
  private quality: RenderingQuality = 'balanced';
  private frames = 0;

  constructor(private host: HTMLElement, private onFailure: () => void) {
    try {
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
      this.renderer = renderer;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.shadowMap.autoUpdate = false;
      renderer.domElement.setAttribute('aria-hidden', 'true');
      renderer.domElement.addEventListener('webglcontextlost', this.contextLost);
      host.appendChild(renderer.domElement);

      const room = new RoomEnvironment();
      const pmrem = new THREE.PMREMGenerator(renderer);
      try { this.environment = pmrem.fromScene(room, .04); }
      finally { room.dispose(); pmrem.dispose(); }
      this.scene.environment = this.environment.texture;
      this.scene.environmentIntensity = .8;
      this.scene.add(new THREE.HemisphereLight(0xf9f7ef, 0x8c948a, .65));
      this.key = new THREE.DirectionalLight(0xfff6df, 2.2);
      this.key.position.set(-5, 9, 5);
      this.key.castShadow = true;
      this.key.shadow.mapSize.set(1024, 1024);
      Object.assign(this.key.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: .1, far: 30 });
      this.key.shadow.normalBias = .025;
      this.key.shadow.bias = -.0002;
      this.scene.add(this.key);
      const rim = new THREE.DirectionalLight(0xdfeaff, 1.5);
      rim.position.set(4, 6, -4); this.scene.add(rim);
      this.floor = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.ShadowMaterial({ color: 0x202720, opacity: .18 }));
      this.floor.rotation.x = -Math.PI / 2; this.floor.position.y = -.18; this.floor.receiveShadow = true; this.scene.add(this.floor);
      this.socket = createSocketModel(); this.socket.root.scale.setScalar(6); this.scene.add(this.socket.root);

      this.controls = new OrbitControls(this.camera, renderer.domElement);
      this.controls.enableDamping = false;
      this.controls.enablePan = false;
      this.controls.minDistance = 6;
      this.controls.maxDistance = 26;
      this.controls.maxPolarAngle = Math.PI * .485;
      this.controls.addEventListener('change', this.invalidate);
      this.resizeObserver = new ResizeObserver(this.resize);
      this.resizeObserver.observe(host);
      this.intersectionObserver = new IntersectionObserver(entries => {
        this.visible = entries[0]?.isIntersecting ?? true;
        if (this.visible) this.invalidate(); else this.cancelFrame();
      });
      this.intersectionObserver.observe(host);
      document.addEventListener('visibilitychange', this.visibilityChange);
      this.setTheme(false); this.resize(); this.resetCamera();
    } catch (error) { this.dispose(); throw error; }
  }

  private contextLost = (event: Event) => {
    event.preventDefault(); this.cancelFrame(); this.onFailure();
  };
  private visibilityChange = () => {
    if (document.hidden) this.cancelFrame(); else this.invalidate();
  };
  private cancelFrame() { cancelAnimationFrame(this.frame); this.frame = 0; }
  private invalidate = () => {
    if (this.disposed || this.frame || !this.visible || document.hidden) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      if (!this.renderer || this.disposed) return;
      this.renderer.render(this.scene, this.camera);
      // Read-only QA counters, deliberately kept out of the learning interface.
      Object.assign(this.renderer.domElement.dataset, {
        frames: String(++this.frames), calls: String(this.renderer.info.render.calls),
        triangles: String(this.renderer.info.render.triangles),
      });
    });
  };
  private resize = () => {
    if (!this.renderer) return;
    const { width, height } = this.host.getBoundingClientRect();
    if (!width || !height) return;
    const budget = renderingBudget(this.quality, width, height, window.devicePixelRatio);
    this.renderer.setPixelRatio(budget.pixelRatio);
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = budget.shadows;
    this.renderer.shadowMap.needsUpdate = true;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.invalidate();
  };
  setView(model: PreviewModel, separation: number) {
    const changed = this.view !== model;
    this.view = model;
    if (model === 'system' && !this.system) {
      this.system = createPCModel(); this.scene.add(this.system.root);
    }
    if (this.socket) { this.socket.root.visible = model === 'socket'; this.socket.apply(separation); }
    if (this.system) { this.system.root.visible = model === 'system'; this.system.apply(9, 1, clampSeparation(separation)); }
    if (this.floor) this.floor.position.y = model === 'socket' ? -.18 : -2.45;
    if (changed) this.resetCamera();
    if (this.renderer) this.renderer.shadowMap.needsUpdate = true;
    this.invalidate();
  }
  setQuality(quality: RenderingQuality) { this.quality = quality; this.resize(); }
  setTheme(dark: boolean) {
    this.scene.background = new THREE.Color(dark ? 0x202622 : 0xf1f0eb);
    if (this.floor) this.floor.material.opacity = dark ? .3 : .18;
    this.invalidate();
  }
  resetCamera() {
    // Narrow viewports keep the full board in frame; zoom remains user controlled.
    const narrow = Math.max(1, .95 / Math.max(.35, this.camera.aspect));
    if (this.view === 'socket') {
      this.camera.position.set(7.7 * narrow, 9.7 * narrow, 10.1 * narrow);
      this.controls?.target.set(0, .3, 0);
    } else {
      this.camera.position.set(7 * narrow, 4.5 * narrow, 8.5 * narrow);
      this.controls?.target.set(0, .15, 0);
    }
    this.controls?.update(); this.invalidate();
  }
  rotateQuarter() {
    if (!this.controls) return;
    const offset = this.camera.position.clone().sub(this.controls.target);
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4);
    this.camera.position.copy(this.controls.target).add(offset);
    this.controls.update(); this.invalidate();
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true; this.cancelFrame();
    document.removeEventListener('visibilitychange', this.visibilityChange);
    this.resizeObserver?.disconnect(); this.intersectionObserver?.disconnect();
    this.controls?.removeEventListener('change', this.invalidate); this.controls?.dispose();
    this.socket?.dispose(); this.system?.resources.dispose();
    this.floor?.geometry.dispose(); this.floor?.material.dispose();
    this.key?.shadow.dispose(); this.environment?.dispose();
    this.renderer?.domElement.removeEventListener('webglcontextlost', this.contextLost);
    this.renderer?.dispose(); this.renderer?.forceContextLoss(); this.renderer?.domElement.remove();
    this.scene.clear();
  }
}
