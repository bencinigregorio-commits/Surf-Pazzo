// Recupero adattivo: parte dal tempo base e lo aggiusta in base a
// stato fatica settimanale, RPE dell'ultima serie, dolore, caldo.
// Eccezione seduta B (resistenza): niente allungamenti oltre +30";
// se troppo cotto, meglio ridurre le serie che allungare il riposo.

function fmt(sec) {
  if (sec == null) return null
  if (sec < 60) return `${sec}"`
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return s === 0 ? `${m}'` : `${m}'${String(s).padStart(2, '0')}"`
}

// Restituisce { seconds, label, note } o null se non c'è un recupero base.
export function adaptRest({ baseSeconds, baseLabel, code, weekFatigue, lastRpe, pain, heat }) {
  if (baseSeconds == null) return null

  const isB = code === 'B' // resistenza: recuperi corti, tetto +30"
  let extra = 0            // secondi aggiunti
  let mult = 1            // moltiplicatore
  let note = null

  if (pain) {
    mult = Math.max(mult, 1.5)
    note = 'Dolore: recupero più lungo e valuta di ridurre volume/carico.'
  }
  if (weekFatigue === 'rosso' || lastRpe === 10) {
    mult = Math.max(mult, 1.5)
  } else if (weekFatigue === 'giallo' || (lastRpe != null && lastRpe >= 8)) {
    extra = Math.max(extra, 30)
  }
  if (heat) extra = Math.max(extra, 30)

  let seconds = Math.round(baseSeconds * mult) + extra

  // Eccezione B: non allungare oltre +30" sul base.
  if (isB && seconds > baseSeconds + 30) {
    seconds = baseSeconds + 30
    note = pain
      ? 'Dolore: tieni il recupero corto e riduci volume/carico (non allungare oltre).'
      : 'Resistenza: non allungare oltre. Se sei cotto, riduci le serie (non il recupero).'
  }

  const adattato = seconds !== baseSeconds
  return {
    seconds,
    label: adattato ? fmt(seconds) : (baseLabel || fmt(baseSeconds)),
    base: baseLabel || fmt(baseSeconds),
    adattato,
    note,
  }
}
