// src/lib/elements-data.ts

export interface ElementInfo {
  symbol: string;
  name: string;
  atomicMass?: number;
  group?: number;
  period?: number;
  category?: string;
  electronConfiguration?: string;
}

// Sourced from public periodic table JSONs, truncated for brevity. Complete as needed.
export const ELEMENTS_DATA: { [atomicNumber: number]: ElementInfo } = {
  1: { symbol: "H", name: "Hydrogen", atomicMass: 1.008, group: 1, period: 1, category: "Nonmetal", electronConfiguration: "1s1" },
  2: { symbol: "He", name: "Helium", atomicMass: 4.0026, group: 18, period: 1, category: "Noble Gas", electronConfiguration: "1s2" },
  3: { symbol: "Li", name: "Lithium", atomicMass: 6.94, group: 1, period: 2, category: "Alkali Metal", electronConfiguration: "[He] 2s1" },
  4: { symbol: "Be", name: "Beryllium", atomicMass: 9.0122, group: 2, period: 2, category: "Alkaline Earth Metal", electronConfiguration: "[He] 2s2" },
  5: { symbol: "B", name: "Boron", atomicMass: 10.81, group: 13, period: 2, category: "Metalloid", electronConfiguration: "[He] 2s2 2p1" },
  6: { symbol: "C", name: "Carbon", atomicMass: 12.011, group: 14, period: 2, category: "Nonmetal", electronConfiguration: "[He] 2s2 2p2" },
  7: { symbol: "N", name: "Nitrogen", atomicMass: 14.007, group: 15, period: 2, category: "Nonmetal", electronConfiguration: "[He] 2s2 2p3" },
  8: { symbol: "O", name: "Oxygen", atomicMass: 15.999, group: 16, period: 2, category: "Nonmetal", electronConfiguration: "[He] 2s2 2p4" },
  9: { symbol: "F", name: "Fluorine", atomicMass: 18.998, group: 17, period: 2, category: "Halogen", electronConfiguration: "[He] 2s2 2p5" },
  10: { symbol: "Ne", name: "Neon", atomicMass: 20.180, group: 18, period: 2, category: "Noble Gas", electronConfiguration: "[He] 2s2 2p6" },
  11: { symbol: "Na", name: "Sodium", atomicMass: 22.990, group: 1, period: 3, category: "Alkali Metal", electronConfiguration: "[Ne] 3s1" },
  12: { symbol: "Mg", name: "Magnesium", atomicMass: 24.305, group: 2, period: 3, category: "Alkaline Earth Metal", electronConfiguration: "[Ne] 3s2" },
  13: { symbol: "Al", name: "Aluminium", atomicMass: 26.982, group: 13, period: 3, category: "Post-transition Metal", electronConfiguration: "[Ne] 3s2 3p1" },
  14: { symbol: "Si", name: "Silicon", atomicMass: 28.085, group: 14, period: 3, category: "Metalloid", electronConfiguration: "[Ne] 3s2 3p2" },
  15: { symbol: "P", name: "Phosphorus", atomicMass: 30.974, group: 15, period: 3, category: "Nonmetal", electronConfiguration: "[Ne] 3s2 3p3" },
  16: { symbol: "S", name: "Sulfur", atomicMass: 32.06, group: 16, period: 3, category: "Nonmetal", electronConfiguration: "[Ne] 3s2 3p4" },
  17: { symbol: "Cl", name: "Chlorine", atomicMass: 35.45, group: 17, period: 3, category: "Halogen", electronConfiguration: "[Ne] 3s2 3p5" },
  18: { symbol: "Ar", name: "Argon", atomicMass: 39.948, group: 18, period: 3, category: "Noble Gas", electronConfiguration: "[Ne] 3s2 3p6" },
  19: { symbol: "K", name: "Potassium", atomicMass: 39.098, group: 1, period: 4, category: "Alkali Metal", electronConfiguration: "[Ar] 4s1" },
  20: { symbol: "Ca", name: "Calcium", atomicMass: 40.078, group: 2, period: 4, category: "Alkaline Earth Metal", electronConfiguration: "[Ar] 4s2" },
  21: { symbol: "Sc", name: "Scandium", atomicMass: 44.956, group: 3, period: 4, category: "Transition Metal", electronConfiguration: "[Ar] 3d1 4s2" },
  22: { symbol: "Ti", name: "Titanium", atomicMass: 47.867, group: 4, period: 4, category: "Transition Metal", electronConfiguration: "[Ar] 3d2 4s2" },
  23: { symbol: "V", name: "Vanadium", atomicMass: 50.942, group: 5, period: 4, category: "Transition Metal", electronConfiguration: "[Ar] 3d3 4s2" },
  24: { symbol: "Cr", name: "Chromium", atomicMass: 51.996, group: 6, period: 4, category: "Transition Metal", electronConfiguration: "[Ar] 3d5 4s1" },
  25: { symbol: "Mn", name: "Manganese", atomicMass: 54.938, group: 7, period: 4, category: "Transition Metal", electronConfiguration: "[Ar] 3d5 4s2" },
  26: { symbol: "Fe", name: "Iron", atomicMass: 55.845, group: 8, period: 4, category: "Transition Metal", electronConfiguration: "[Ar] 3d6 4s2" },
  27: { symbol: "Co", name: "Cobalt", atomicMass: 58.933, group: 9, period: 4, category: "Transition Metal", electronConfiguration: "[Ar] 3d7 4s2" },
  28: { symbol: "Ni", name: "Nickel", atomicMass: 58.693, group: 10, period: 4, category: "Transition Metal", electronConfiguration: "[Ar] 3d8 4s2" },
  29: { symbol: "Cu", name: "Copper", atomicMass: 63.546, group: 11, period: 4, category: "Transition Metal", electronConfiguration: "[Ar] 3d10 4s1" },
  30: { symbol: "Zn", name: "Zinc", atomicMass: 65.38, group: 12, period: 4, category: "Transition Metal", electronConfiguration: "[Ar] 3d10 4s2" },
  31: { symbol: "Ga", name: "Gallium", atomicMass: 69.723, group: 13, period: 4, category: "Post-transition Metal", electronConfiguration: "[Ar] 3d10 4s2 4p1" },
  32: { symbol: "Ge", name: "Germanium", atomicMass: 72.630, group: 14, period: 4, category: "Metalloid", electronConfiguration: "[Ar] 3d10 4s2 4p2" },
  33: { symbol: "As", name: "Arsenic", atomicMass: 74.922, group: 15, period: 4, category: "Metalloid", electronConfiguration: "[Ar] 3d10 4s2 4p3" },
  34: { symbol: "Se", name: "Selenium", atomicMass: 78.971, group: 16, period: 4, category: "Nonmetal", electronConfiguration: "[Ar] 3d10 4s2 4p4" },
  35: { symbol: "Br", name: "Bromine", atomicMass: 79.904, group: 17, period: 4, category: "Halogen", electronConfiguration: "[Ar] 3d10 4s2 4p5" },
  36: { symbol: "Kr", name: "Krypton", atomicMass: 83.798, group: 18, period: 4, category: "Noble Gas", electronConfiguration: "[Ar] 3d10 4s2 4p6" },
  // ...add more as needed...
};

export const COMMON_ISOTOPES: { [atomicNumber: number]: number } = {
  1: 0, 2: 2, 3: 4, 4: 5, 5: 6, 6: 6, 7: 7, 8: 8, 9: 10, 10: 10, 11: 12, 12: 12, 13: 14, 14: 14, 15: 16, 16: 16, 17: 18, 18: 22, 19: 20, 20: 20, 21: 24, 22: 26, 23: 28, 24: 28, 25: 30, 26: 30, 27: 32, 28: 31, 29: 34, 30: 35, 31: 39, 32: 41, 33: 42, 34: 45, 35: 44, 36: 48
  // ...add more as needed...
};

export const AUFBAU_SUBSHELLS = [
  { n:1, l:'s', max:2 }, { n:2, l:'s', max:2 }, { n:2, l:'p', max:6 },
  { n:3, l:'s', max:2 }, { n:3, l:'p', max:6 }, { n:4, l:'s', max:2 },
  { n:3, l:'d', max:10 }, { n:4, l:'p', max:6 }, { n:5, l:'s', max:2 },
  { n:4, l:'d', max:10 }, { n:5, l:'p', max:6 }, { n:6, l:'s', max:2 },
  { n:4, l:'f', max:14 }, { n:5, l:'d', max:10 }, { n:6, l:'p', max:6 },
  { n:7, l:'s', max:2 }, { n:5, l:'f', max:14 }, { n:6, l:'d', max:10 },
  { n:7, l:'p', max:6 }
];
