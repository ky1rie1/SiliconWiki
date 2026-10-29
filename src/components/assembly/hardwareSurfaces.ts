import * as THREE from 'three';
import type { ModelResources } from './modelResources';

/** Shared small procedural maps; deterministic, original, and owned by model resources. */
export function brushedSurface(resources: ModelResources) {
  return resources.texture('machining-grain', () => {
    const size = 256; const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const tone = 158 + ((y * 73 + 19) % 58) + ((x * 13 + y * 7) % 13);
      const i = (y * size + x) * 4; data[i] = data[i + 1] = data[i + 2] = tone; data[i + 3] = 255;
    }
    const texture = new THREE.DataTexture(data, size, size);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(4, 4);
    texture.magFilter = THREE.LinearFilter; texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true; texture.needsUpdate = true;
    return texture;
  });
}

export function addBoardPrint(parent: THREE.Object3D, resources: ModelResources) {
  if (typeof document === 'undefined') return;
  const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 960;
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  ctx.lineWidth = 1.2; ctx.strokeStyle = '#93b3a1';
  for (let i = 0; i < 70; i++) {
    const x = 80 + (i * 47) % 600; const y = 50 + (i * 31) % 620;
    ctx.globalAlpha = .12 + (i % 5) * .025;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 60); ctx.lineTo(x + 35, y + 95); ctx.lineTo(x + 35, y + 220); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 35, y + 220, 2, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.globalAlpha = .65; ctx.fillStyle = '#c7d6c8'; ctx.font = '9px monospace';
  for (let i = 0; i < 35; i++) ctx.fillText(`R${100 + i} C${72 + i}`, 24 + (i * 103) % 640, 54 + i * 25);
  const texture = resources.texture('board-silkscreen', () => {
    const result = new THREE.CanvasTexture(canvas); result.colorSpace = THREE.SRGBColorSpace; return result;
  });
  const ink = resources.material('board-ink', 0xffffff, 0, .85);
  ink.map = texture; ink.transparent = true; ink.depthWrite = false;
  const print = resources.mesh(parent, resources.geometry('board-print', () => new THREE.PlaneGeometry(2.42, 3.03)), ink, [0, 0, .019]);
  print.castShadow = false;
}
