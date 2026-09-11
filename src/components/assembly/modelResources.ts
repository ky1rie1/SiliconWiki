import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { Vec3 } from './animation';

/** Shared GPU assets have one owner, including instanced meshes and label textures. */
export class ModelResources {
  private geometries = new Map<string, THREE.BufferGeometry>();
  private materials = new Map<string, THREE.Material>();
  private textures = new Set<THREE.Texture>();
  private instances = new Set<THREE.InstancedMesh>();

  material(name: string, color: number, metalness = .15, roughness = .55) {
    if (!this.materials.has(name)) this.materials.set(name, new THREE.MeshStandardMaterial({ color, metalness, roughness }));
    return this.materials.get(name) as THREE.MeshStandardMaterial;
  }

  geometry(key: string, create: () => THREE.BufferGeometry) {
    if (!this.geometries.has(key)) this.geometries.set(key, create());
    return this.geometries.get(key)!;
  }

  mesh(parent: THREE.Object3D, geometry: THREE.BufferGeometry, material: THREE.Material, position: Vec3 = [0, 0, 0]) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  box(parent: THREE.Object3D, size: Vec3, position: Vec3, material: THREE.Material, radius = 0) {
    const geometry = this.geometry(`box:${size}:${radius}`, () => radius
      ? new RoundedBoxGeometry(...size, 2, radius)
      : new THREE.BoxGeometry(...size));
    return this.mesh(parent, geometry, material, position);
  }

  cylinder(parent: THREE.Object3D, radius: number, length: number, position: Vec3, material: THREE.Material, segments = 24) {
    return this.mesh(parent, this.geometry(`cyl:${radius}:${length}:${segments}`, () => new THREE.CylinderGeometry(radius, radius, length, segments)), material, position);
  }

  instancesOf(parent: THREE.Object3D, geometry: THREE.BufferGeometry, material: THREE.Material, positions: Vec3[]) {
    const mesh = new THREE.InstancedMesh(geometry, material, positions.length);
    const matrix = new THREE.Matrix4();
    positions.forEach((position, i) => mesh.setMatrixAt(i, matrix.makeTranslation(...position)));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    this.instances.add(mesh);
    return mesh;
  }

  tube(parent: THREE.Object3D, points: Vec3[], radius: number, material: THREE.Material) {
    const key = `tube:${points}:${radius}`;
    return this.mesh(parent, this.geometry(key, () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), 32, radius, 6, false)), material);
  }

  label(parent: THREE.Object3D, text: string, position: Vec3, width: number, color = '#c8cecb') {
    if (typeof document === 'undefined') return;
    const key = `label:${text}:${color}`;
    if (!this.materials.has(key)) {
      const canvas = document.createElement('canvas');
      canvas.width = 512; canvas.height = 64;
      const context = canvas.getContext('2d');
      if (!context) return;
      context.font = '500 32px monospace';
      context.fillStyle = color;
      context.textAlign = 'center'; context.textBaseline = 'middle';
      context.fillText(text, 256, 32, 500);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      this.textures.add(texture);
      this.materials.set(key, new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    }
    const mesh = this.mesh(parent, this.geometry('label-plane', () => new THREE.PlaneGeometry(1, 1)), this.materials.get(key)!, position);
    mesh.scale.set(width, width / 8, 1);
    mesh.castShadow = false;
    return mesh;
  }

  dispose() {
    this.instances.forEach(mesh => mesh.dispose());
    this.geometries.forEach(geometry => geometry.dispose());
    this.materials.forEach(material => material.dispose());
    this.textures.forEach(texture => texture.dispose());
    this.instances.clear(); this.geometries.clear(); this.materials.clear(); this.textures.clear();
  }
}
