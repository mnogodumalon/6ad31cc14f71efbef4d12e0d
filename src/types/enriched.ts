import type { Annahmen, Entscheidungen, Erkenntnisse, Regeln } from './app';

export type EnrichedEntscheidungen = Entscheidungen & {
  vorgangName: string;
};

export type EnrichedAnnahmen = Annahmen & {
  vorgangName: string;
  entscheidungName: string;
};

export type EnrichedErkenntnisse = Erkenntnisse & {
  vorgangName: string;
  entscheidungName: string;
  annahmeName: string;
};

export type EnrichedRegeln = Regeln & {
  erkenntnisName: string;
  entscheidungName: string;
};
