export type PreviewModel = 'socket' | 'system';

export function clampSeparation(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
}

export const previewSources = [
  { title: 'MSI · AM5 installation', url: 'https://www.msi.com/support/technical_details/MB_CPU_Upgrade_Installation' },
  { title: 'ASUS · CPU alignment', url: 'https://www.asus.com/support/faq/1047659/' },
];
