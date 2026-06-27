// Motore di progressione (Fetta 4).
// Metodo: doppia progressione + autoregolazione su RPE (niente percentuali).
// Per ogni esercizio, dato lo storico dei log, propone cosa fare la volta dopo.

export const SUGGEST_META = {
  PROGREDISCI: { label: '↑ Progredisci', cls: 'sg-up' },
  MANTIENI: { label: '→ Mantieni', cls: 'sg-keep' },
  RIDUCI: { label: '↓ Riduci', cls: 'sg-down' },
  REGREDISCI: { label: '↓↓ Regredisci', cls: 'sg-down' },
  NUOVO: { label: 'da registrare', cls: 'sg-new' },
}

// Giorni dopo i quali un esercizio è "rientro dopo pausa" (niente aumento automatico).
const RIENTRO_GIORNI = 12

const firstNum = (s) => {
  const m = String(s ?? '').match(/\d+(\.\d+)?/)
  return m ? Number(m[0]) : null
}
const topNum = (s) => {
  const m = String(s ?? '').match(/\d+(\.\d+)?/g)
  return m ? Math.max(...m.map(Number)) : null
}

function daysBetween(isoFrom, isoTo) {
  if (!isoFrom || !isoTo) return null
  const a = new Date(isoFrom + 'T00:00:00')
  const b = new Date(isoTo + 'T00:00:00')
  return Math.round((b - a) / 86400000)
}

// Numero di sessioni recenti consecutive con qualità tecnica buona (>=4) e senza dolore.
function consecutiveGoodQuality(history) {
  let n = 0
  for (const h of history) {
    const good = (h.technical_quality ?? 0) >= 4 && (h.pain_severity ?? 0) === 0
    if (good) n++
    else break
  }
  return n
}

// Consiglio per la volta successiva. `exercise` = riga libreria, `history` = log
// dell'esercizio dal più recente, `todayIso` = data odierna, `ctx` = contesto
// settimanale { weekFatigue: 'verde'|'giallo'|'rosso', activeRegions: [{region,severity}] }.
export function computeSuggestion(exercise, history, todayIso, ctx = {}) {
  const base = baseSuggestion(exercise, history, todayIso, ctx)
  // Freno settimana "rossa": tetto a MANTIENI anche con buoni numeri.
  if (base.code === 'PROGREDISCI' && ctx.weekFatigue === 'rosso') {
    return { ...base, code: 'MANTIENI', hint: 'Settimana "rossa": tetto a mantieni (priorità recupero).' }
  }
  return base
}

function baseSuggestion(exercise, history, todayIso, ctx) {
  const last = history && history.length ? history[0] : null

  // Zona in dolore attivo (anche per colpa di un altro esercizio): si declassa.
  const exRegions = exercise.body_regions ?? []
  const hit = (ctx.activeRegions ?? []).find((r) => exRegions.includes(r.region))
  if (hit) {
    return hit.severity >= 2
      ? { code: 'REGREDISCI', hint: `Zona ${hit.region} in dolore: usa l'alternativa prudente/riabilitativa.`, last }
      : { code: 'RIDUCI', hint: `Zona ${hit.region} sensibile: tieni leggero, valuta l'alternativa.`, last }
  }

  if (!history || history.length === 0) {
    return { code: 'NUOVO', hint: 'Registra una volta e qui comparirà il consiglio.', last: null }
  }

  const painSev = last.pain_severity ?? 0

  // 1) Dolore sulla regione coinvolta: prudenza, sempre.
  if (painSev >= 1) {
    return painSev >= 2
      ? { code: 'REGREDISCI', hint: 'Dolore: passa a una variante più facile/riabilitativa.', last }
      : { code: 'RIDUCI', hint: 'Fastidio: alleggerisci carico o ampiezza.', last }
  }

  // 2) Rientro dopo una pausa lunga: mai aumento automatico.
  const since = daysBetween(last.log_date, todayIso)
  if (since != null && since > RIENTRO_GIORNI) {
    return { code: 'MANTIENI', hint: `Rientro dopo ${since} giorni: ripeti l'ultimo, niente aumenti.`, last }
  }

  const type = exercise.progression_type

  // 3) Balistico / tecnica: prima qualità, poi variante/carico (mai reps strappate).
  if (type === 'ballistic' || type === 'skill') {
    if (consecutiveGoodQuality(history) >= 2) {
      return type === 'skill'
        ? { code: 'PROGREDISCI', hint: 'Qualità costante: passa alla variante/livello successivo.', last }
        : { code: 'PROGREDISCI', hint: 'Gesto pulito e veloce: piccolo step di carico.', last }
    }
    return { code: 'MANTIENI', hint: 'Prima tecnica: serve qualità ≥4 per 2 volte di fila.', last }
  }

  // 4) Resistenza: progressione per volume/tempo (~+10%).
  if (type === 'endurance') {
    if (last.completed === 'full' && (last.rpe == null || last.rpe <= 7)) {
      return { code: 'PROGREDISCI', hint: '+~10% di volume o durata.', last }
    }
    return { code: 'MANTIENI', hint: 'Mantieni il volume di questa volta.', last }
  }

  // 5) Forza (load): doppia progressione.
  if (last.completed !== 'full') {
    return { code: 'MANTIENI', hint: 'Reps non complete: consolida prima di salire.', last }
  }
  // Qualità: se registrata dev'essere buona; se assente non blocca la forza.
  const qualityOk = last.technical_quality == null || last.technical_quality >= 4
  if (last.rpe != null && last.rpe <= 7 && qualityOk) {
    const top = topNum(exercise.default_reps)
    const did = firstNum(last.reps)
    const hint =
      did != null && top != null && did >= top
        ? `Tetto reps raggiunto: +${exercise.load_step ?? 2.5} kg e riparti dal fondo.`
        : `Aggiungi 1–2 reps (verso ${exercise.default_reps ?? 'il tetto del range'}).`
    return { code: 'PROGREDISCI', hint, last }
  }
  return {
    code: 'MANTIENI',
    hint: last.rpe != null && last.rpe >= 8 ? 'Eri al limite (RPE alto): mantieni.' : 'Servono RPE ≤7 e qualità buona per salire.',
    last,
  }
}

// Riassunto leggibile dell'ultimo log (per mostrarlo accanto al consiglio).
export function lastLogSummary(last) {
  if (!last) return null
  const parts = []
  if (last.load != null) parts.push(`${last.load} kg`)
  if (last.reps) parts.push(`× ${last.reps}`)
  if (last.sets) parts.push(`${last.sets} serie`)
  if (last.rpe != null) parts.push(`RPE ${last.rpe}`)
  if (last.technical_quality != null) parts.push(`qualità ${last.technical_quality}`)
  return parts.length ? parts.join(' · ') : null
}
