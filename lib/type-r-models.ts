export type TypeRPreset = {
  code: string;
  era: "Atmosférica" | "Turbo";
  years: string;
  civicGeneration: string;
  engine: string;
  powerCv: number;
  powerLabel: string;
  transmission: string;
  note: string;
};

export const typeRPresets: TypeRPreset[] = [
  { code: "EK9", era: "Atmosférica", years: "1997–2000", civicGeneration: "6.ª geração", engine: "1.6 B16B NA", powerCv: 185, powerLabel: "185 CV", transmission: "Manual de 5 velocidades", note: "🔥 Primeiro Civic Type R" },
  { code: "EP3", era: "Atmosférica", years: "2001–2005", civicGeneration: "7.ª geração", engine: "2.0 K20A/K20A2 NA", powerCv: 200, powerLabel: "200–215 CV", transmission: "Manual de 6 velocidades", note: "Muito leve e analógico" },
  { code: "FN2", era: "Atmosférica", years: "2007–2011", civicGeneration: "8.ª geração", engine: "2.0 K20Z4 NA", powerCv: 201, powerLabel: "201 CV", transmission: "Manual de 6 velocidades", note: "Type R europeu" },
  { code: "FD2", era: "Atmosférica", years: "2007–2010", civicGeneration: "8.ª geração", engine: "2.0 K20A NA", powerCv: 225, powerLabel: "225 CV", transmission: "Manual de 6 velocidades", note: "Sedan japonês, mais hardcore" },
  { code: "FK2", era: "Turbo", years: "2015–2017", civicGeneration: "9.ª geração", engine: "2.0 K20C1 Turbo", powerCv: 310, powerLabel: "310 CV", transmission: "Manual de 6 velocidades", note: "🚀 Primeiro Type R turbo" },
  { code: "FK8", era: "Turbo", years: "2017–2021", civicGeneration: "10.ª geração", engine: "2.0 K20C1 Turbo", powerCv: 320, powerLabel: "320 CV", transmission: "Manual de 6 velocidades", note: "Muito mais agressivo visualmente" },
  { code: "FL5", era: "Turbo", years: "2022–presente", civicGeneration: "11.ª geração", engine: "2.0 K20C1 Turbo", powerCv: 329, powerLabel: "329 CV EU", transmission: "Manual de 6 velocidades", note: "Type R atual" },
];

export function getTypeRPreset(code: string | null | undefined) {
  return typeRPresets.find((preset) => preset.code === code?.toUpperCase());
}
