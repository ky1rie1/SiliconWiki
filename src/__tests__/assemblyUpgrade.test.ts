import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createPCModel } from '../components/assembly/pcModel';
import { PCScene3D } from '../components/assembly/PCScene3D';

describe('production assembly model upgrade', () => {
  it('restores the same CPU camera framing before and after the CPU finishes lowering', () => {
    const model = createPCModel();
    const scene = Object.assign(Object.create(PCScene3D.prototype), {
      model, step: 1, explodeTarget: 0, reducedEffects: false, motion: { matches: false },
      camera: new THREE.PerspectiveCamera(38, 1.5), cameraTarget: new THREE.Vector3(), lookTarget: new THREE.Vector3(), requestFrame: () => {},
    });
    try {
      model.apply(1, 1, 1); scene.resetCamera();
      const camera = scene.cameraTarget.clone(); const target = scene.lookTarget.clone();
      model.apply(1, 1, 0); scene.resetCamera();
      expect(scene.cameraTarget.distanceTo(camera)).toBeCloseTo(0);
      expect(scene.lookTarget.distanceTo(target)).toBeCloseTo(0);
    } finally { model.resources.dispose(); }
  });
  it('unlocks the socket before lifting the intact CPU in exploded mode', () => {
    const m = createPCModel();
    try {
      m.apply(1, 1, 0);
      const cpu = m.parts.get('cpu')!; const start = cpu.position.clone();
      const children = cpu.children.map(child => child.position.clone());
      m.apply(1, 1, .15);
      expect(m.latch.rotation.x).toBeLessThan(-.5);
      expect(cpu.position.distanceTo(start)).toBeCloseTo(0);
      m.apply(1, 1, 1);
      expect(cpu.position.z).toBeGreaterThan(start.z + .4);
      cpu.children.forEach((child, i) => expect(child.position.equals(children[i])).toBe(true));
      expect(cpu.getObjectByName('am5-notched-heatspreader')).toBeDefined();
      m.apply(1, 1, 0);
      expect(cpu.position.distanceTo(start)).toBeCloseTo(0);
      expect(m.latch.rotation.x).toBeCloseTo(0);
    } finally { m.resources.dispose(); }
  });
  it('keeps the detailed model under a fixed geometry budget and releases shared textures once', () => {
    const m = createPCModel();
    const textures = new Set<THREE.Texture>(); let triangles = 0;
    m.root.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      triangles += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3 * (object instanceof THREE.InstancedMesh ? object.count : 1);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
      }
    });
    expect(triangles).toBeLessThan(100_000);
    expect(textures.size).toBeGreaterThan(0);
    let disposed = 0; textures.forEach(texture => texture.addEventListener('dispose', () => disposed++));
    m.resources.dispose(); m.resources.dispose();
    expect(disposed).toBe(textures.size);
  });
});
