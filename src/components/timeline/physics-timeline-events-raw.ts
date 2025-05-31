import { TimelineEvent } from './timeline-types';

export const rawPhysicsTimelineEvents: TimelineEvent[] = [
  {
    id: 'principia-mathematica',
    category: 'classical-theory',
    title: 'Principia Mathematica Published',
    shortDescription: 'Newton publishes his laws of motion and universal gravitation.',
    year: 1687,
    laneKey: 'classical-physics', // Corrected laneKey
    icon: 'Atom',
    details: [],
  },
  {
    id: 'huygens-principle',
    category: 'classical-theory',
    title: 'Huygens Principle',
    shortDescription: 'Huygens describes wave propagation as secondary wavelets.',
    year: 1678,
    laneKey: 'classical-physics', // Corrected laneKey
    details: [],
  },
  {
    id: 'electromagnetic-waves-theory',
    category: 'theory-development',
    title: 'Theory of Electromagnetic Waves',
    shortDescription: 'Maxwell unifies electricity, magnetism, and light.',
    year: 1864,
    laneKey: 'classical-physics', // Corrected laneKey
    color: '#FFD700',
    details: [],
  },
  {
    id: 'cathode-rays-discovery',
    category: 'experimental-discovery',
    title: 'Discovery of Cathode Rays',
    shortDescription: 'Crookes and others experiment with electrical discharges in vacuum tubes.',
    startYear: 1870,
    endYear: 1880,
    laneKey: 'particle-discoveries', // Corrected laneKey
    details: [],
  },
  {
    id: 'photoelectric-effect-discovery',
    category: 'experimental-discovery',
    title: 'Discovery of Photoelectric Effect',
    shortDescription: 'Hertz observes that light can eject electrons from a metal surface.',
    year: 1887,
    laneKey: 'modern-physics', // Corrected laneKey
    icon: 'Sparkles',
    details: [],
  },
  {
    id: 'x-rays-discovery',
    category: 'experimental-discovery',
    title: 'Discovery of X-rays',
    shortDescription: 'Roentgen discovers X-rays, a new type of radiation.',
    year: 1895,
    laneKey: 'modern-physics', // Corrected laneKey
    icon: 'Radical',
    details: [],
  },
  {
    id: 'radioactivity-discovery',
    category: 'experimental-discovery',
    title: 'Discovery of Radioactivity',
    shortDescription: 'Becquerel discovers radioactivity in uranium salts. Marie Curie later does extensive work.',
    year: 1896,
    laneKey: 'modern-physics', // Corrected laneKey
    icon: 'Radical',
    details: [],
  },
  {
    id: 'electron-discovery',
    category: 'experimental-discovery',
    title: 'Discovery of the Electron',
 shortDescription: 'J.J. Thomson identifies the electron as a fundamental particle.',
    year: 1897, // Corrected year
    laneKey: 'particle-discoveries', // Changed laneKey for consistency with timeline-types
    icon: 'Beaker',
    details: [],
  },
  {
    id: 'blackbody-radiation-planck',
    category: 'quantum-discovery',
    title: 'Blackbody Radiation Explained',
    shortDescription: 'Planck proposes energy quantization to explain blackbody radiation.',
    year: 1900,
    laneKey: 'quantum-mechanics', // Corrected laneKey
    icon: 'Sparkles',
    details: [],
  },
  {
    id: 'atomic-nucleus-discovery',
    category: 'experimental-discovery',
    title: 'Discovery of the Atomic Nucleus',
 shortDescription: 'Rutherford\'s gold foil experiment reveals the nucleus.',
    year: 1911,
    laneKey: 'particle-discoveries', // Corrected laneKey
    icon: 'Atom',
    details: [],
  },
  {
    id: 'bohr-model',
    category: 'theory-development',
    title: 'Bohr Model of the Atom',
    shortDescription: 'Bohr applies quantum ideas to the atomic structure.',
    year: 1913,
    laneKey: 'quantum-mechanics', // Corrected laneKey
    icon: 'Atom',
    details: [],
  },
  {
    id: 'general-relativity',
    category: 'relativity-discovery',
    title: 'General Relativity',
    shortDescription: 'Einstein publishes his theory of general relativity.',
    year: 1915,
    laneKey: 'relativity-cosmology', // Corrected laneKey
    icon: 'Rocket',
    details: [],
  },
  {
    id: 'wave-particle-duality-debroglie',
    category: 'quantum-discovery',
    title: 'Wave-Particle Duality Proposed',
    shortDescription: 'de Broglie proposes that particles have wave-like properties.',
    year: 1924,
    laneKey: 'quantum-mechanics', // Corrected laneKey
    icon: 'Sparkles',
    details: [],
  },
  {
    id: 'schrodinger-equation',
    category: 'theory-development',
    title: 'Schrödinger Equation',
    shortDescription: 'Schrödinger develops the wave equation for quantum systems.',
    year: 1926,
    laneKey: 'quantum-mechanics', // Corrected laneKey
    icon: 'Sparkles',
    details: [],
  },
  {
    id: 'uncertainty-principle',
    category: 'quantum-discovery',
    title: 'Uncertainty Principle',
    shortDescription: 'Heisenberg formulates the uncertainty principle.',
    year: 1927,
    laneKey: 'quantum-mechanics', // Corrected laneKey
    icon: 'Sparkles',
    details: [],
  },
  {
    id: 'discovery-neutron',
    category: 'experimental-discovery',
    title: 'Discovery of the Neutron',
    shortDescription: 'Chadwick discovers the neutron, a neutral particle in the nucleus.',
    year: 1932,
    laneKey: 'particle-discoveries', // Corrected laneKey
    icon: 'Beaker',
    details: [],
  },
  {
    id: 'nuclear-fission-discovery',
    category: 'experimental-discovery',
    title: 'Discovery of Nuclear Fission',
    shortDescription: 'Hahn and Strassmann discover nuclear fission.',
    year: 1938,
    laneKey: 'modern-physics', // Corrected laneKey
    icon: 'Radical',
    details: [],
  },
  {
    id: 'first-nuclear-reactor',
    category: 'technological-advancement',
    title: 'First Nuclear Reactor',
    shortDescription: 'Fermi leads the construction of the first self-sustaining nuclear chain reaction.',
    year: 1942,
    laneKey: 'big-machines', // Corrected laneKey
    icon: 'Construction',
    details: [],
  },
  {
    id: 'big-bang-theory-lemaitre',
    category: 'cosmology-discovery',
    title: 'Big Bang Theory Proposed',
    shortDescription: 'Lemaître proposes the theory of the expanding universe.',
    year: 1927, // Although Hubble's observations were later, Lemaître's theory was earlier.
    laneKey: 'space-missions', // Corrected laneKey
    icon: 'Galaxy',
    details: [],
  },
  {
    id: 'hubble-expansion',
    category: 'cosmology-discovery',
    title: 'Hubble\'s Law (Expansion of the Universe)',
    shortDescription: 'Hubble observes the redshift of distant galaxies, indicating expansion.',
    year: 1929,
    laneKey: 'space-missions', // Corrected laneKey
    icon: 'Galaxy',
    details: [],
  },
  {
    id: 'light-speed-measure',
    category: 'measurement',
    title: 'Measurement of Speed of Light',
    shortDescription: 'Fizeau and Foucault make early accurate measurements.',
    startYear: 1849,
    endYear: 1862, // Keeping the original end year
    laneKey: 'classical-physics', // Corrected laneKey
    color: '#FFD700',
    details: [],
  },
  // Add more events here, ensuring they have unique IDs and relevant details
  {
    id: 'photoelectric-effect',
    category: 'quantum-discovery',
    title: 'Photoelectric Effect Explained',
    shortDescription: 'Einstein explains the effect using light quanta (photons).',
    year: 1905,
    laneKey: 'modern-physics', // Corrected laneKey
    icon: 'Sparkles',
    details: [],
  },
  {
    id: 'relativity-special',
    category: 'relativity-discovery',
    title: 'Special Relativity',
    shortDescription: 'Einstein introduces his theory of special relativity.',
    year: 1905,
    laneKey: 'modern-physics', // Corrected laneKey
    icon: 'Rocket',
    details: [],
  },
  {
    id: 'cosmic-microwave-background-discovery',
    category: 'cosmology-discovery',
    title: 'Discovery of Cosmic Microwave Background',
    shortDescription: 'Penzias and Wilson accidentally discover the CMB radiation, evidence for the Big Bang.',
    year: 1964,
    laneKey: 'space-missions', // Corrected laneKey
    icon: 'Galaxy',
    details: [],
  },
  {
    id: 'standard-model-dev',
    category: 'theory-development',
    title: 'Development of the Standard Model',
    shortDescription: 'Period of significant progress towards the Standard Model.',
    startYear: 1960,
    endYear: 1973, // Keeping the original end year
    laneKey: 'particle-discoveries', // Corrected laneKey
    color: '#8A2BE2',
    details: [],
  },
  {
    id: 'higgs-boson-discovery',
    category: 'experimental-discovery',
    title: 'Higgs Boson Discovery',
    shortDescription: 'CERN announces the discovery of the Higgs boson.',
    year: 2012,
    laneKey: 'particle-discoveries', // Corrected laneKey
    icon: 'Sparkles',
    details: [],
  },
];
