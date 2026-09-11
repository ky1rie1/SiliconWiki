import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { ModelResources } from '../components/assembly/modelResources';
import { batchStaticMeshes } from '../components/assembly/batchStaticMeshes';
import { renderingBudget } from '../components/assembly/renderingBudget';

describe('static mesh batching', () => {
  it('reduces draws while preserving local bounds and separate animated parents', () => {
    const r = new ModelResources(); const root = new THREE.Group();
    const part = new THREE.Group(); root.add(part); part.position.x = 3;
    const mat = r.material('test', 0xffffff);
    for (let i = 0; i < 8; i++) r.box(part, [1, 1, 1], [i * 2, 0, 0], mat).rotation.z = i * .1;
    const before = new THREE.Box3().setFromObject(root);
    batchStaticMeshes(root, r);
    expect(root.children[0]).toBe(part); expect(part.children).toHaveLength(1);
    const after = new THREE.Box3().setFromObject(root);
    expect(after.min.distanceTo(before.min)).toBeLessThan(.00001);
    expect(after.max.distanceTo(before.max)).toBeLessThan(.00001);
    part.position.y = 5;
    expect(new THREE.Box3().setFromObject(root).min.y - after.min.y).toBeCloseTo(5);
    r.dispose();
  });

  it('keeps dynamic parts, instanced geometry, transparent surfaces and pick semantics intact', () => {
    const r = new ModelResources(); const root = new THREE.Group(); const mat = r.material('base', 0xffffff);
    const dynamic = r.box(root, [1, 1, 1], [0, 0, 0], mat); dynamic.userData.dynamic = true;
    const tagged = r.box(root, [1, 1, 1], [1, 0, 0], mat); tagged.userData.component = 'cpu';
    const glass = r.material('glass', 0xffffff); glass.transparent = true;
    const pane = r.box(root, [1, 1, 1], [2, 0, 0], glass);
    const instances = r.instancesOf(root, dynamic.geometry, mat, [[3, 0, 0], [4, 0, 0]]);
    batchStaticMeshes(root, r);
    for (const object of [dynamic, tagged, pane, instances]) expect(root.children).toContain(object);
    dynamic.scale.z = .1; dynamic.updateMatrix(); expect(dynamic.matrix.elements[10]).toBeCloseTo(.1);
    r.dispose();
  });
});

describe('pixel and motion budgets', () => {
  it('bounds retina framebuffer pixels and never upscales a low-density display', () => {
    const budget = renderingBudget('balanced', 1200, 800, 3);
    expect(1200 * 800 * budget.pixelRatio ** 2).toBeLessThanOrEqual(900001);
    expect(renderingBudget('quality', 400, 400, 1).pixelRatio).toBe(1);
  });
  it('uses fewer resources in saver mode and handles temporarily hidden containers', () => {
    const balanced = renderingBudget('balanced', 740, 520, 2);
    const saver = renderingBudget('saver', 740, 520, 2);
    expect(saver.pixelRatio).toBeLessThan(balanced.pixelRatio);
    expect(saver.shadows).toBe(false); expect(saver.fanInterval).toBeGreaterThan(balanced.fanInterval);
    expect(Number.isFinite(renderingBudget('balanced', 0, 0, 2).pixelRatio)).toBe(true);
  });
});
