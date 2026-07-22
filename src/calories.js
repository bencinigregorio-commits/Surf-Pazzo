// Stima calorie e "peso" temporale delle attività.
// Formula standard: kcal = MET × peso(kg) × ore. È una STIMA (buona per i trend).

// MET indicativi (Compendium of Physical Activities, valori ricreativi).
export const MET = {
  A: 5, B: 5, C: 5, campagna: 4.5,
  corsa: 8, calcetto: 7, beachvolley: 8,
  mobilita: 2.5, balance: 2.5, recovery: 2.5,
}

// Durata tipica (minuti) usata quando non la inserisci.
export const DURATA_TIPICA = {
  A: 50, B: 50, C: 50, campagna: 45,
  corsa: 45, calcetto: 60, beachvolley: 60,
  mobilita: 10, balance: 10, recovery: 20,
}

export const PESO_DEFAULT = 80 // kg, se non c'è ancora una scansione BIA

// Peso corporeo più recente dalle scansioni BIA.
export function pesoDaBia(scans) {
  const conPeso = (scans ?? []).filter((s) => s.weight != null)
  if (conPeso.length === 0) return PESO_DEFAULT
  return conPeso.sort((a, b) => (b.scan_date ?? '').localeCompare(a.scan_date ?? ''))[0].weight
}

// Calorie stimate per un'attività.
export function stimaCalorie(code, minuti, pesoKg = PESO_DEFAULT) {
  const met = MET[code]
  const min = minuti ?? DURATA_TIPICA[code]
  if (!met || !min) return null
  return Math.round(met * pesoKg * (min / 60))
}

// Quanto "conta" la durata rispetto a quella tipica (per la fatica).
// Tra 0.5× e 2×: mezz'ora di calcetto pesa meno di due ore.
export function fattoreDurata(code, minuti) {
  const tipica = DURATA_TIPICA[code]
  if (!minuti || !tipica) return 1
  return Math.max(0.5, Math.min(2, minuti / tipica))
}
