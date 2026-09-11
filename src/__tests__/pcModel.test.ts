import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createPCModel, type PCModel } from '../components/assembly/pcModel';
import { BOARD_MOUNT } from '../components/assembly/animation';

let model: PCModel | undefined;
afterEach(() => { model?.resources.dispose(); model = undefined; });
const world = (object: THREE.Object3D) => object.getWorldPosition(new THREE.Vector3());

describe('assembled geometry relationships', () => {
  it('carries preinstalled components as one board and inserts below the chassis roof', () => {
    model = createPCModel();
    const attached = ['cpu', 'ram', 'ssd', 'cooler'].map(key => model!.parts.get(key)!);
    for (let i = 0; i <= 100; i++) {
      model.apply(5, i / 100, 0);
      for (const part of attached) expect(part.parent).toBe(model.boardAssembly);
      const corners = [-1.22, 1.22].flatMap(x => [-1.525, 1.525].map(y => model!.boardAssembly.localToWorld(new THREE.Vector3(x, y, 0))));
      for (const corner of corners) {
        if (Math.abs(corner.z) < 1.3) expect(corner.y).toBeLessThan(2.15);
      }
    }
    expect(model.boardAssembly.position.toArray()).toEqual(BOARD_MOUNT);
  });

  it('restores exact assembly transforms after repeated explosion and arbitrary step changes', () => {
    model = createPCModel(); model.apply(9, 1, 0);
    const snapshot = () => [...model!.parts].map(([key, part]) => [key, ...world(part).toArray(), ...part.quaternion.toArray()]);
    const original = snapshot();
    for (const step of [1, 4, 3, 9, 5, 2, 7, 6, 8]) { model.apply(step, .43, 1); model.apply(step, 1, 0); }
    model.apply(9, 1, 0);
    expect(snapshot()).toEqual(original);
    const cpu = model.parts.get('cpu')!;
    const paste = model.parts.get('thermal-paste')!;
    const localPaste = paste.position.clone();
    model.apply(4, 1, 1);
    expect(paste.parent).toBe(cpu);
    expect(paste.position.toArray()).toEqual(localPaste.toArray());
  });

  it('orients GPU fans downward and tower fans toward the case rear', () => {
    model = createPCModel(); model.apply(9, 1, 0);
    for (const [key, expected] of [['gpu', new THREE.Vector3(0, -1, 0)], ['cooler', new THREE.Vector3(-1, 0, 0)]] as const) {
      const component = model.parts.get(key)!;
      const rotors = model.fans.filter(fan => fan.parent?.parent === component);
      expect(rotors.length).toBeGreaterThan(1);
      for (const rotor of rotors) expect(new THREE.Vector3(0, 0, 1).transformDirection(rotor.matrixWorld).distanceTo(expected)).toBeLessThan(.00001);
    }
  });

  it('lifts the M.2 tip, seats it flat, and keeps the shield clear until pressing completes', () => {
    model = createPCModel(); model.apply(3, .3, 0);
    const connector = model.drive.localToWorld(new THREE.Vector3(0, 0, 0));
    const tip = model.drive.localToWorld(new THREE.Vector3(.8, 0, 0));
    expect(tip.y - connector.y).toBeCloseTo(.4);
    model.apply(3, .7, 0);
    expect(model.drive.rotation.y).toBeCloseTo(0);
    expect(model.shield.position.z).toBeGreaterThan(.5);
    model.apply(3, 1, 0);
    expect(model.shield.position.z).toBeCloseTo(.074);
  });

  it('disposes shared geometry and materials only once across repeated cleanup', () => {
    model = createPCModel();
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    model.root.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      geometries.add(object.geometry);
      (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material));
    });
    let geometryDisposals = 0; let materialDisposals = 0;
    geometries.forEach(geometry => geometry.addEventListener('dispose', () => geometryDisposals++));
    materials.forEach(material => material.addEventListener('dispose', () => materialDisposals++));
    model.resources.dispose(); model.resources.dispose();
    expect(geometryDisposals).toBe(geometries.size);
    expect(materialDisposals).toBe(materials.size);
  });
});
