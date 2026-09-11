import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { ModelResources } from './modelResources';

/** Batch only opaque siblings: animated groups and component picking boundaries survive. */
export function batchStaticMeshes(root: THREE.Object3D, resources: ModelResources) {
  for (const child of [...root.children]) if (!(child instanceof THREE.Mesh)) batchStaticMeshes(child, resources);
  const buckets = new Map<string, THREE.Mesh<THREE.BufferGeometry, THREE.Material>[]>();
  for (const child of root.children) {
    if (!(child instanceof THREE.Mesh) || child instanceof THREE.InstancedMesh || Array.isArray(child.material)
      || child.material.transparent || Object.keys(child.userData).length || !child.visible) continue;
    const key = `${child.material.id}:${child.castShadow}:${child.receiveShadow}:${child.renderOrder}`;
    const bucket = buckets.get(key) || [];
    bucket.push(child as THREE.Mesh<THREE.BufferGeometry, THREE.Material>); buckets.set(key, bucket);
  }
  for (const [key, meshes] of buckets) {
    if (meshes.length < 2) continue;
    const geometries = meshes.map(mesh => {
      mesh.updateMatrix();
      const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
      return geometry.applyMatrix4(mesh.matrix);
    });
    let merged: THREE.BufferGeometry | null;
    try { merged = mergeGeometries(geometries, false); }
    finally { geometries.forEach(geometry => geometry.dispose()); }
    if (!merged) continue;
    const geometry = resources.geometry(`batch:${root.id}:${key}`, () => merged!);
    geometry.computeBoundingBox(); geometry.computeBoundingSphere();
    const mesh = new THREE.Mesh(geometry, meshes[0].material);
    mesh.castShadow = meshes[0].castShadow; mesh.receiveShadow = meshes[0].receiveShadow;
    mesh.renderOrder = meshes[0].renderOrder;
    root.remove(...meshes); root.add(mesh);
  }
  for (const child of root.children) {
    if (child instanceof THREE.Mesh && !child.userData.dynamic) {
      child.updateMatrix(); child.matrixAutoUpdate = false;
    }
  }
}
