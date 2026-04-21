export interface QuickColor {
  readonly hex: string;
  readonly label: string;
}

export const QUICK_COLORS: readonly QuickColor[] = [
  { hex: '#FF5733', label: 'Orange-Rot' },
  { hex: '#000000', label: 'Schwarz' },
  { hex: '#FFFFFF', label: 'Weiß' },
  { hex: '#3B82F6', label: 'Blau' },
  { hex: '#10B981', label: 'Grün' },
  { hex: '#8B5CF6', label: 'Violett' },
];
