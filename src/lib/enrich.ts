import type { EnrichedAnnahmen, EnrichedEntscheidungen, EnrichedErkenntnisse, EnrichedRegeln } from '@/types/enriched';
import type { Annahmen, Entscheidungen, Erkenntnisse, Regeln, Vorgaenge } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveDisplay(url: unknown, map: Map<string, any>, ...fields: string[]): string {
  if (!url) return '';
  const id = extractRecordId(url);
  if (!id) return '';
  const r = map.get(id);
  if (!r) return '';
  return fields.map(f => String(r.fields[f] ?? '')).join(' ').trim();
}

interface EntscheidungenMaps {
  vorgaengeMap: Map<string, Vorgaenge>;
}

export function enrichEntscheidungen(
  entscheidungen: Entscheidungen[],
  maps: EntscheidungenMaps
): EnrichedEntscheidungen[] {
  return entscheidungen.map(r => ({
    ...r,
    vorgangName: resolveDisplay(r.fields.vorgang, maps.vorgaengeMap, 'titel'),
  }));
}

interface AnnahmenMaps {
  vorgaengeMap: Map<string, Vorgaenge>;
  entscheidungenMap: Map<string, Entscheidungen>;
}

export function enrichAnnahmen(
  annahmen: Annahmen[],
  maps: AnnahmenMaps
): EnrichedAnnahmen[] {
  return annahmen.map(r => ({
    ...r,
    vorgangName: resolveDisplay(r.fields.vorgang, maps.vorgaengeMap, 'titel'),
    entscheidungName: resolveDisplay(r.fields.entscheidung, maps.entscheidungenMap, 'titel'),
  }));
}

interface ErkenntnisseMaps {
  vorgaengeMap: Map<string, Vorgaenge>;
  entscheidungenMap: Map<string, Entscheidungen>;
  annahmenMap: Map<string, Annahmen>;
}

export function enrichErkenntnisse(
  erkenntnisse: Erkenntnisse[],
  maps: ErkenntnisseMaps
): EnrichedErkenntnisse[] {
  return erkenntnisse.map(r => ({
    ...r,
    vorgangName: resolveDisplay(r.fields.vorgang, maps.vorgaengeMap, 'titel'),
    entscheidungName: resolveDisplay(r.fields.entscheidung, maps.entscheidungenMap, 'titel'),
    annahmeName: resolveDisplay(r.fields.annahme, maps.annahmenMap, 'aussage'),
  }));
}

interface RegelnMaps {
  erkenntnisseMap: Map<string, Erkenntnisse>;
  entscheidungenMap: Map<string, Entscheidungen>;
}

export function enrichRegeln(
  regeln: Regeln[],
  maps: RegelnMaps
): EnrichedRegeln[] {
  return regeln.map(r => ({
    ...r,
    erkenntnisName: resolveDisplay(r.fields.erkenntnis, maps.erkenntnisseMap, 'titel'),
    entscheidungName: resolveDisplay(r.fields.entscheidung, maps.entscheidungenMap, 'titel'),
  }));
}
