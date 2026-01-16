import { BrewPhase } from './types';

export const PHASE_ORDER = [
  BrewPhase.Mashing,
  BrewPhase.Sparging,
  BrewPhase.Boiling,
  BrewPhase.Chilling,
  BrewPhase.Fermentation,
  BrewPhase.Secondary,
  BrewPhase.Bottling,
  BrewPhase.Completed
];

export const PHASE_DESCRIPTIONS: Record<BrewPhase, string> = {
  [BrewPhase.Mashing]: "Soaking grains in hot water to convert starch to sugar.",
  [BrewPhase.Sparging]: "Rinsing grains to extract remaining sugars.",
  [BrewPhase.Boiling]: "Boiling wort and adding hops.",
  [BrewPhase.Chilling]: "Rapidly cooling the wort.",
  [BrewPhase.Fermentation]: "Yeast converting sugar to alcohol.",
  [BrewPhase.Secondary]: "Conditioning and clarifying.",
  [BrewPhase.Bottling]: "Carbonating and packaging.",
  [BrewPhase.Completed]: "Brew day finished!"
};