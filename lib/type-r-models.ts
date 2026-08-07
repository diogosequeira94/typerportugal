export type TypeRPreset = {
  code: string;
  era: "Atmosférica" | "Turbo";
  engine: string;
  powerCv: number;
  transmission: string;
};

export const typeRPresets: TypeRPreset[] = [
  { code: "EK9", era: "Atmosférica", engine: "1.6 VTEC", powerCv: 185, transmission: "Manual de 5 velocidades" },
  { code: "EP3", era: "Atmosférica", engine: "2.0 VTEC", powerCv: 200, transmission: "Manual de 6 velocidades" },
  { code: "FN2", era: "Atmosférica", engine: "2.0 VTEC", powerCv: 201, transmission: "Manual de 6 velocidades" },
  { code: "FD2", era: "Atmosférica", engine: "2.0 VTEC", powerCv: 225, transmission: "Manual de 6 velocidades" },
  { code: "FK2", era: "Turbo", engine: "2.0 VTEC TURBO", powerCv: 310, transmission: "Manual de 6 velocidades" },
  { code: "FK8", era: "Turbo", engine: "2.0 VTEC TURBO", powerCv: 320, transmission: "Manual de 6 velocidades" },
  { code: "FL5", era: "Turbo", engine: "2.0 VTEC TURBO", powerCv: 329, transmission: "Manual de 6 velocidades" },
];

export function getTypeRPreset(code: string | null | undefined) {
  return typeRPresets.find((preset) => preset.code === code?.toUpperCase());
}
