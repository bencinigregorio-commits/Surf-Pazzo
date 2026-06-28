// Fatica / recupero e dolore (Fetta 5). Volutamente semplice (niente TSS/ACWR).

// Peso "di fatica" per tipo di attività.
const PESO_TIPO = { A: 3, B: 3, C: 3, calcetto: 3, corsa: 1, mobilita: 0, balance: 0, recovery: 0 }
// Banda di intensità in base all'RPE di seduta.
function bandaRPE(rpe) {
  if (rpe == null) return 1.5 // dato mancante: intensità media, prudente
  if (rpe <= 4) return 1
  if (rpe <= 7) return 1.5
  return 2
}

// Soglie verde/giallo/rosso — larghe e tarabili (come da specifica §8/§13).
const VERDE_MAX = 16
const GIALLO_MAX = 26

export const FATIGUE_META = {
  verde: { label: 'Verde', sub: 'Si può progredire', cls: 'fat-green' },
  giallo: { label: 'Giallo', sub: 'Mantenimento, niente nuovi massimali', cls: 'fat-yellow' },
  rosso: { label: 'Rosso', sub: 'Meglio recuperare o scaricare', cls: 'fat-red' },
}

// Carico settimanale = somma su tutte le attività della settimana.
export function computeWeeklyLoad(weekLogs) {
  let load = 0
  for (const l of weekLogs) {
    if (l.status === 'rest') continue
    const peso = PESO_TIPO[l.session_code] ?? 0
    if (peso === 0) continue
    load += peso * bandaRPE(l.session_rpe)
  }
  return Math.round(load * 10) / 10
}

// Punteggio 0-100 per l'anello della fatica (il soggettivo sposta la lancetta).
export function fatigueScore(load, checkin) {
  const adj = checkin === 'cotto' ? 25 : checkin === 'fresco' ? -25 : 0
  return Math.max(0, Math.min(100, Math.round((load / GIALLO_MAX) * 100 + adj)))
}

// Stato di fatica: dal carico, corretto dal check-in soggettivo (che vince).
export function fatigueState(load, checkin) {
  const base = load <= VERDE_MAX ? 'verde' : load <= GIALLO_MAX ? 'giallo' : 'rosso'
  let state = base
  if (checkin === 'cotto') state = base === 'verde' ? 'giallo' : 'rosso'
  else if (checkin === 'fresco') state = base === 'rosso' ? 'giallo' : 'verde'
  return { base, state, load }
}

// Suggerimento di scarico (advisory, mai imposto).
export function deloadAdvice(state, checkin, activeRegions) {
  if (state === 'rosso') return 'Settimana pesante: valuta una settimana di mantenimento/scarico.'
  if (checkin === 'cotto') return 'Ti senti cotto: oggi punta a recupero e mobilità leggera.'
  if (activeRegions && activeRegions.length > 0)
    return `Zona sensibile (${activeRegions.map((r) => r.region).join(', ')}): niente nuovi carichi su quell'area.`
  return null
}

// Regioni "in dolore attivo", derivate dai log.
// Una regione si attiva con un log di dolore (severità>=1) e si "spegne" dopo
// 2 sessioni indolori su quella regione (come da §9).
export function computeActivePain(progByEx, exById) {
  const painEvents = {} // regione -> [{date, sev}]
  const touches = {} // regione -> [{date, painful}]

  for (const exId in progByEx) {
    const regions = exById[exId]?.body_regions ?? []
    for (const log of progByEx[exId]) {
      const sev = log.pain_severity ?? 0
      if (log.pain_region && sev >= 1) {
        ;(painEvents[log.pain_region] ??= []).push({ date: log.log_date, sev })
      }
      for (const r of regions) {
        const painful = sev >= 1 && (log.pain_region ? log.pain_region === r : true)
        ;(touches[r] ??= []).push({ date: log.log_date, painful })
      }
    }
  }

  const active = []
  for (const region in painEvents) {
    const lastPain = painEvents[region].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))[0]
    const painlessAfter = (touches[region] ?? []).filter(
      (t) => (t.date ?? '') > (lastPain.date ?? '') && !t.painful
    ).length
    if (painlessAfter < 2) active.push({ region, severity: lastPain.sev })
  }
  return active
}
