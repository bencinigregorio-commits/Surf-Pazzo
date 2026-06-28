// BIA / composizione corporea (Fetta 7).
// Principio: segnale lento e di contesto. Si guarda il TREND su misure
// standardizzate, mai il singolo numero. Non tocca progressione né fatica.

export const PHASES = [
  { key: 'mantenimento', label: 'Mantenimento', desc: 'Come adesso.' },
  { key: 'ricomposizione', label: 'Ricomposizione', desc: 'Migliorare la composizione a peso stabile.' },
  { key: 'asciugatura', label: 'Asciugatura', desc: 'Ridurre il grasso preservando i carichi.' },
  { key: 'costruzione', label: 'Costruzione', desc: 'Aumentare massa, più recupero e fuel.' },
]

// Solo gli essenziali vanno a schermo (il resto si salva ma non in primo piano).
export const ESSENTIALS = [
  { key: 'weight', label: 'Peso', unit: 'kg' },
  { key: 'fat_pct', label: '% grasso', unit: '%' },
  { key: 'lean_mass', label: 'Massa magra', unit: 'kg' },
  { key: 'phase_angle', label: 'Angolo di fase', unit: '°' },
]

const byDateDesc = (a, b) => (b.scan_date ?? '').localeCompare(a.scan_date ?? '')

// Ultima scansione + delta rispetto alla precedente confrontabile.
export function computeTrend(scans) {
  const comp = scans.filter((s) => s.comparable).sort(byDateDesc)
  const latest = comp[0] ?? null
  const prev = comp[1] ?? null
  const deltas = {}
  if (latest && prev) {
    for (const e of ESSENTIALS) {
      if (latest[e.key] != null && prev[e.key] != null) {
        deltas[e.key] = Math.round((latest[e.key] - prev[e.key]) * 10) / 10
      }
    }
  }
  return { latest, prev, deltas, comparableCount: comp.length }
}

// Avvisi advisory (mai imposizioni), orientati a salute/recupero.
export function biaAlerts(scans, goalPhase, preTrip) {
  const comp = scans.filter((s) => s.comparable).sort(byDateDesc)
  const msgs = []

  if (preTrip && goalPhase === 'asciugatura') {
    msgs.push({ tone: 'warn', text: 'Sei in pre-trip: meglio sospendere l’asciugatura aggressiva — servono energia e recupero.' })
  }
  if (comp.length >= 2) {
    const [a, b] = comp
    if (goalPhase === 'asciugatura' && a.lean_mass != null && b.lean_mass != null && a.lean_mass < b.lean_mass) {
      msgs.push({ tone: 'warn', text: 'Massa magra in calo: valuta di ridurre il deficit o alzare le proteine, e mantieni i carichi.' })
    }
    if (a.phase_angle != null && b.phase_angle != null && a.phase_angle < b.phase_angle) {
      msgs.push({ tone: 'info', text: 'Angolo di fase in calo nel tempo: occhio a recupero e alimentazione.' })
    }
    if (goalPhase === 'asciugatura' && a.fat_pct != null && b.fat_pct != null && a.fat_pct < b.fat_pct &&
        a.lean_mass != null && b.lean_mass != null && a.lean_mass >= b.lean_mass) {
      msgs.push({ tone: 'good', text: 'Grasso giù, magra stabile: la fase sta funzionando.' })
    }
  }
  return msgs
}

// L'app suggerisce (mai impone) un cambio di fase leggendo i trend.
export function suggestedPhase(scans, goalPhase) {
  const comp = scans.filter((s) => s.comparable).sort(byDateDesc)
  if (goalPhase === 'asciugatura' && comp.length >= 3) {
    const a = comp[0], c = comp[2]
    if (a.fat_pct != null && c.fat_pct != null && Math.abs(a.fat_pct - c.fat_pct) < 0.3) {
      return 'Grasso fermo da settimane in asciugatura: valuta una fase di mantenimento.'
    }
  }
  return null
}

export function daysSinceLastScan(scans, todayIso) {
  if (!scans.length) return null
  const latest = scans.slice().sort(byDateDesc)[0]
  return Math.round((new Date(todayIso + 'T00:00:00') - new Date(latest.scan_date + 'T00:00:00')) / 86400000)
}

// È confrontabile col trend? Sì se stesso dispositivo e condizioni dell'ultima.
export function isComparable(scans, device, conditions) {
  if (scans.length === 0) return true
  const latest = scans.slice().sort(byDateDesc)[0]
  return (latest.device ?? '') === (device ?? '') && (latest.conditions ?? '') === (conditions ?? '')
}
