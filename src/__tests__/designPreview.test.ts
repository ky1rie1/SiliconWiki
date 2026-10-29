import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createSocketModel } from '../components/lab/socketModel';
import { clampSeparation } from '../components/lab/previewState';
import { computeTabNavigationUrl, parseHardwareFromUrl } from '../utils/navigation';

describe('design preview contracts', () => {
  it('keeps the preview route out of hardware IDs and clears detail on exit', () => {
    expect(parseHardwareFromUrl('https://example.com/#/lab')).toBeNull();
    expect(computeTabNavigationUrl('https://example.com/?hardware=cpu-a#/wiki', 'lab')).toBe('/#/lab');
  });
  it('bounds invalid slider values without poisoning model transforms', () => {
    expect([NaN, Infinity, -1, .4, 2].map(clampSeparation)).toEqual([0, 0, 0, .4, 1]);
  });
  it('opens retention before lifting the intact CPU package and restores its pose', () => {
    const model = createSocketModel();
    try {
      const base = model.cpu.position.clone();
      const frameBounds = new THREE.Box3().setFromObject(model.retention);
      expect(frameBounds.min.z).toBeLessThan(-.27);
      expect(frameBounds.max.z).toBeGreaterThan(.27);
      const childPositions = model.cpu.children.map(child => child.position.clone());
      model.apply(.25);
      expect(model.retention.rotation.x).toBeLessThan(-.5);
      expect(model.cpu.position.equals(base)).toBe(true);
      model.apply(1);
      expect(model.cpu.position.y).toBeGreaterThan(base.y + .2);
      model.cpu.children.forEach((child, i) => expect(child.position.equals(childPositions[i])).toBe(true));
      model.apply(0);
      expect(model.cpu.position.equals(base)).toBe(true);
      expect(model.retention.rotation.x).toBeCloseTo(0);
    } finally { model.dispose(); }
  });
  it('disposes shared GPU resources once, including repeated cleanup', () => {
    const model = createSocketModel();
    const resources = new Set<THREE.BufferGeometry | THREE.Material | THREE.Texture>();
    model.root.traverse(object => {
      if (object instanceof THREE.Mesh) {
        resources.add(object.geometry);
        (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => {
          resources.add(material);
          for (const value of Object.values(material)) if (value instanceof THREE.Texture) resources.add(value);
        });
      }
    });
    let count = 0;
    resources.forEach(resource => resource.addEventListener('dispose', () => count++));
    model.dispose(); model.dispose();
    expect(count).toBe(resources.size);
  });
});
