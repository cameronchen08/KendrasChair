export const CHIP_COLORS = [
  { bg: '#fde8ee', border: '#f4b8cc', text: '#9a3455' },
  { bg: '#e8f4e8', border: '#b8d8b8', text: '#2d5a2d' },
  { bg: '#e8eef8', border: '#b8c8e8', text: '#2d4a8a' },
  { bg: '#fef3e2', border: '#e8d0a0', text: '#7a4a10' },
  { bg: '#f0e8f8', border: '#d0b8e8', text: '#5a2a8a' },
  { bg: '#e8f8f4', border: '#b0ddd0', text: '#1a6a50' },
  { bg: '#fdf0e8', border: '#e8c8a8', text: '#8a3a10' },
  { bg: '#f8e8f4', border: '#e0b8d4', text: '#8a1a5a' },
] as const;

export type ChipColor = typeof CHIP_COLORS[number];

export function buildProfColorMap(clients: { profession: string }[]): Map<string, ChipColor> {
  const sorted = [...new Set(clients.map(c => (c.profession || '').trim()).filter(Boolean))].sort();
  return new Map(sorted.map((p, i) => [p, CHIP_COLORS[i % CHIP_COLORS.length]]));
}
