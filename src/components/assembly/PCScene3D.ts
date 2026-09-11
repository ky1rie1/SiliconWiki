import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { AssemblyTimeline, type AnimationResult } from './animation';
import { createPCModel, type PCModel } from './pcModel';

const viewportFit = (aspect: number) => Math.max(1, 1.15 / aspect);

/** Scene lifecycle and input. Geometry and deterministic assembly poses live separately. */
export class PCScene3D {
  onComponentClick?: (key: string) => void;
  onComponentHover?: (key: string | null) => void;
  onAnimationProgress?: (progress: number) => void;
  onError?: () => void;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(38, 1, .05, 70);
  private controls!: OrbitControls;
  private model!: PCModel;
  private bench!: THREE.Mesh;
  private floor!: THREE.Mesh;
  private grid!: THREE.GridHelper;
  private environment?: THREE.WebGLRenderTarget;
  private selection = new THREE.Box3Helper(new THREE.Box3(), 0xc4a663);
  private resizeObserver?: ResizeObserver;
  private intersectionObserver?: IntersectionObserver;
  private themeObserver?: MutationObserver;
  private motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  private timeline = new AssemblyTimeline();
  private step = 1;
  private exploded = 0;
  private explodeTarget = 0;
  private cameraTarget = new THREE.Vector3();
  private lookTarget = new THREE.Vector3();
  private cameraMoving = false;
  private frameId = 0;
  private lastTime = 0;
  private disposed = false;
  private onScreen = true;
  private powered = false;
  private lastProgress = -1;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private pointerDirty = false;
  private pointerDown?: { x: number; y: number };
  private hovered: string | null = null;

  constructor(private container: HTMLDivElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
    try {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.08;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.domElement.setAttribute('aria-label', 'Interactive PC assembly model');
      this.renderer.domElement.style.display = 'block';
      this.container.appendChild(this.renderer.domElement);
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      const room = new RoomEnvironment();
      try { this.environment = pmrem.fromScene(room, .04); }
      finally { room.dispose(); pmrem.dispose(); }
      this.scene.environment = this.environment.texture;
      this.scene.environmentIntensity = .7;
      this.scene.add(new THREE.HemisphereLight(0xf1f5f5, 0x59636a, 1.2));
      const key = new THREE.DirectionalLight(0xfff5e0, 3.5);
      key.position.set(2, 7, 6); key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.left = -5; key.shadow.camera.right = 5;
      key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
      key.shadow.normalBias = .025; key.shadow.bias = -.0002;
      this.scene.add(key);
      const rim = new THREE.DirectionalLight(0xc4e1ff, 3); rim.position.set(-5, 3, -2); this.scene.add(rim);
      this.model = createPCModel(); this.scene.add(this.model.root);
      const r = this.model.resources;
      this.floor = r.box(this.scene, [200, .08, 200], [0, -2.45, 0], r.material('studio-floor', 0xe2e5e4, .05, .9));
      this.floor.castShadow = false;
      this.bench = r.box(this.scene, [3.35, .53, 3.85], [0, -2.115, 0], r.material('bench', 0xc8cfcc, .1, .8), .045);
      this.grid = new THREE.GridHelper(16, 32, 0xb8c2be, 0xcdd5d1); this.grid.position.y = -2.401; this.scene.add(this.grid);
      this.selection.visible = false;
      const selectionMaterial = this.selection.material as THREE.LineBasicMaterial;
      selectionMaterial.depthTest = false; selectionMaterial.transparent = true; selectionMaterial.opacity = .5; this.scene.add(this.selection);
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true; this.controls.dampingFactor = .09;
      this.controls.minDistance = 1.3; this.controls.maxDistance = 22; this.controls.maxPolarAngle = Math.PI * .86;
      this.controls.addEventListener('change', this.requestFrame); this.controls.addEventListener('start', this.stopCameraTransition);
      const canvas = this.renderer.domElement;
      canvas.addEventListener('pointermove', this.onPointerMove); canvas.addEventListener('pointerdown', this.onPointerDown);
      canvas.addEventListener('pointerup', this.onPointerUp); canvas.addEventListener('pointerleave', this.onPointerLeave);
      canvas.addEventListener('pointercancel', this.onPointerLeave); canvas.addEventListener('webglcontextlost', this.onContextLost);
      document.addEventListener('visibilitychange', this.onVisibility); this.motion.addEventListener('change', this.onMotionChange);
      this.resizeObserver = new ResizeObserver(this.handleResize); this.resizeObserver.observe(this.container);
      this.intersectionObserver = new IntersectionObserver(entries => { this.onScreen = entries[0].isIntersecting; if (this.onScreen) this.requestFrame(); });
      this.intersectionObserver.observe(this.container);
      this.themeObserver = new MutationObserver(this.updateTheme);
      this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      this.updateTheme(); this.handleResize(); this.resetCamera(true);
    } catch (error) { this.dispose(); throw error; }
  }

  private updateTheme = () => {
    const dark = document.documentElement.classList.contains('dark');
    this.scene.background = new THREE.Color(dark ? 0x252e34 : 0xe8eeeb);
    this.scene.fog = new THREE.Fog(dark ? 0x252e34 : 0xe8eeeb, 10, 28);
    if (this.floor) (this.floor.material as THREE.MeshStandardMaterial).color.set(dark ? 0x0a1015 : 0xaebbb3);
    if (this.bench) (this.bench.material as THREE.MeshStandardMaterial).color.set(dark ? 0x394449 : 0xbfcac5);
    this.grid.visible = !dark; this.requestFrame();
  };
  private onMotionChange = () => {
    if (this.motion.matches) {
      this.timeline.cancel(); this.exploded = this.explodeTarget;
      this.camera.position.copy(this.cameraTarget); this.controls.target.copy(this.lookTarget); this.cameraMoving = false;
    }
    this.requestFrame();
  };
  private onVisibility = () => { if (!document.hidden) this.requestFrame(); };
  private onContextLost = (event: Event) => { event.preventDefault(); this.timeline.cancel(); this.onError?.(); this.dispose(); };
  private stopCameraTransition = () => { this.cameraMoving = false; };

  handleResize = () => {
    if (this.disposed) return;
    const { width, height } = this.container.getBoundingClientRect();
    if (!width || !height) return;
    const previousAspect = this.camera.aspect;
    this.camera.aspect = width / height; this.camera.updateProjectionMatrix();
    const scale = viewportFit(this.camera.aspect) / viewportFit(previousAspect);
    this.camera.position.sub(this.controls.target).multiplyScalar(scale).add(this.controls.target);
    this.cameraTarget.sub(this.lookTarget).multiplyScalar(scale).add(this.lookTarget);
    this.renderer.setSize(width, height); this.requestFrame();
  };
  setStep(step: number) {
    this.timeline.cancel(); this.step = Math.max(1, Math.min(9, step)); this.lastProgress = -1;
    this.applyPose(1); this.clearHover(); this.resetCamera(); this.requestFrame();
  }
  setExploded(exploded: boolean) {
    this.timeline.cancel(); this.explodeTarget = exploded ? 1 : 0;
    if (this.motion.matches) this.exploded = this.explodeTarget;
    this.resetCamera(); this.requestFrame();
  }
  resetCamera(immediate = false) {
    if (this.step < 5) {
      this.lookTarget.set(0, (this.step < 4 ? -1.7 : -1.05) + this.explodeTarget * .45, 0);
      this.cameraTarget.copy(this.lookTarget).add(new THREE.Vector3(3.2, 3.9 + this.explodeTarget, 4.4 + this.explodeTarget * 1.5));
    } else {
      this.lookTarget.set(0, -.05, this.explodeTarget * .65);
      this.cameraTarget.set(6.2, 3.3, 8.3 + this.explodeTarget * 3);
    }
    this.cameraTarget.sub(this.lookTarget).multiplyScalar(viewportFit(this.camera.aspect)).add(this.lookTarget);
    if (immediate || this.motion.matches) {
      this.camera.position.copy(this.cameraTarget); this.controls.target.copy(this.lookTarget); this.controls.update(); this.cameraMoving = false;
    } else this.cameraMoving = true;
    this.requestFrame();
  }
  setCameraView(view: 'front' | 'detail') {
    this.model.root.updateMatrixWorld(true);
    if (view === 'front') {
      this.lookTarget.set(0, this.step < 5 ? -1.4 : 0, 0);
      this.cameraTarget.copy(this.lookTarget).add(this.step < 5 ? new THREE.Vector3(0, 6.3, .001) : new THREE.Vector3(0, .2, 9.5));
    } else {
      const keys = ['cpu', 'ram', 'ssd', 'cooler', 'motherboard', 'psu', 'gpu', 'cables', 'case'];
      const part = this.model.parts.get(keys[this.step - 1])!;
      const box = new THREE.Box3().setFromObject(part); box.getCenter(this.lookTarget);
      const distance = Math.max(1.6, box.getSize(new THREE.Vector3()).length() * 1.45);
      this.cameraTarget.copy(this.lookTarget).add(new THREE.Vector3(.5, .6, 1).normalize().multiplyScalar(distance));
    }
    this.cameraTarget.sub(this.lookTarget).multiplyScalar(viewportFit(this.camera.aspect)).add(this.lookTarget);
    this.cameraMoving = true;
    if (this.motion.matches) { this.camera.position.copy(this.cameraTarget); this.controls.target.copy(this.lookTarget); this.cameraMoving = false; }
    this.requestFrame();
  }
  animateInstallStep(step: number, onComplete?: (result: AnimationResult) => void) {
    if (step !== this.step) { onComplete?.('cancelled'); return; }
    this.timeline.cancel(); this.exploded = 0; this.explodeTarget = 0; this.resetCamera(); this.lastProgress = -1;
    if (this.motion.matches) { this.applyPose(1); onComplete?.('completed'); this.requestFrame(); return; }
    this.timeline.start(performance.now(), step === 5 ? 4400 : step === 9 ? 4600 : 3400, onComplete);
    this.applyPose(0); this.requestFrame();
  }
  private applyPose(progress: number) {
    const pose = this.model.apply(this.step, progress, this.exploded); this.powered = pose.powered; this.bench.visible = this.step < 5;
    const quantized = Math.round(progress * 100);
    if (quantized !== this.lastProgress) { this.lastProgress = quantized; this.onAnimationProgress?.(quantized); }
  }
  private requestFrame = () => {
    if (!this.disposed && !this.frameId && this.onScreen && !document.hidden) this.frameId = requestAnimationFrame(this.render);
  };
  private render = (now: number) => {
    this.frameId = 0;
    if (this.disposed || !this.onScreen || document.hidden) return;
    const delta = Math.min(.05, (now - (this.lastTime || now)) / 1000); this.lastTime = now;
    let moving = false;
    if (Math.abs(this.explodeTarget - this.exploded) > .001) { this.exploded = THREE.MathUtils.damp(this.exploded, this.explodeTarget, 7, delta); moving = true; }
    else this.exploded = this.explodeTarget;
    this.applyPose(this.timeline.progress(now));
    if (this.cameraMoving) {
      const factor = 1 - Math.exp(-8 * delta);
      this.camera.position.lerp(this.cameraTarget, factor); this.controls.target.lerp(this.lookTarget, factor);
      if (this.camera.position.distanceTo(this.cameraTarget) < .006) this.cameraMoving = false;
      moving = this.cameraMoving || moving;
    }
    this.controls.update();
    if (this.powered && !this.motion.matches && this.exploded < .01) { this.model.fans.forEach(fan => fan.rotation.z = (fan.rotation.z + delta * 5) % (Math.PI * 2)); moving = true; }
    if (this.pointerDirty) { this.pointerDirty = false; this.pickHover(); }
    if (this.hovered) { const part = this.model.parts.get(this.hovered); if (part) this.selection.box.setFromObject(part); }
    this.renderer.render(this.scene, this.camera);
    if (moving || this.timeline.running) this.requestFrame();
  };
  private onPointerDown = (event: PointerEvent) => { this.pointerDown = { x: event.clientX, y: event.clientY }; };
  private onPointerMove = (event: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    if (!event.buttons && event.pointerType !== 'touch') { this.pointerDirty = true; this.requestFrame(); }
  };
  private onPointerUp = (event: PointerEvent) => {
    const start = this.pointerDown; this.pointerDown = undefined;
    if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 5 || event.button !== 0) return;
    this.onPointerMove(event); const key = this.pick(); if (key) this.onComponentClick?.(key);
  };
  private onPointerLeave = () => { this.pointerDown = undefined; this.clearHover(); };
  private clearHover() { this.hovered = null; this.selection.visible = false; this.onComponentHover?.(null); this.requestFrame(); }
  private pick() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const meshes: THREE.Object3D[] = [];
    this.model.root.traverseVisible(object => { if (object instanceof THREE.Mesh && !object.userData.ignorePick) meshes.push(object); });
    for (const hit of this.raycaster.intersectObjects(meshes, false)) {
      let object: THREE.Object3D | null = hit.object;
      while (object) { if (object.userData.component) return object.userData.component as string; object = object.parent; }
    }
    return null;
  }
  private pickHover() { const key = this.pick(); if (key === this.hovered) return; this.hovered = key; this.selection.visible = !!key; this.onComponentHover?.(key); }

  dispose() {
    if (this.disposed) return;
    this.disposed = true; this.timeline.cancel(); cancelAnimationFrame(this.frameId);
    this.resizeObserver?.disconnect(); this.intersectionObserver?.disconnect(); this.themeObserver?.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility); this.motion.removeEventListener('change', this.onMotionChange);
    this.controls?.removeEventListener('change', this.requestFrame); this.controls?.removeEventListener('start', this.stopCameraTransition); this.controls?.dispose();
    const canvas = this.renderer.domElement;
    canvas.removeEventListener('pointermove', this.onPointerMove); canvas.removeEventListener('pointerdown', this.onPointerDown);
    canvas.removeEventListener('pointerup', this.onPointerUp); canvas.removeEventListener('pointerleave', this.onPointerLeave);
    canvas.removeEventListener('pointercancel', this.onPointerLeave); canvas.removeEventListener('webglcontextlost', this.onContextLost);
    this.scene.traverse(object => { if (object instanceof THREE.DirectionalLight) object.shadow.dispose(); });
    this.model?.resources.dispose(); this.environment?.dispose(); this.selection.geometry.dispose();
    (this.selection.material as THREE.Material).dispose();
    this.grid?.geometry.dispose();
    if (this.grid) { const mats = Array.isArray(this.grid.material) ? this.grid.material : [this.grid.material]; mats.forEach(material => material.dispose()); }
    this.renderer.dispose(); this.renderer.forceContextLoss(); canvas.remove(); this.scene.clear();
    this.onComponentClick = undefined; this.onComponentHover = undefined; this.onAnimationProgress = undefined; this.onError = undefined;
  }
}
