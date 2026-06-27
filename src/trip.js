// Modalità pre-trip (Fetta 6). Calcola la fase in base alla data del viaggio.

const PHASE_META = {
  '-4': { label: '−4 settimane', focus: 'Costruzione della specificità' },
  '-3': { label: '−3 settimane', focus: 'Costruzione della specificità' },
  '-2': { label: '−2 settimane', focus: 'Picco di specificità' },
  '-1': { label: 'Ultima settimana', focus: 'Scarico: volume giù, qualità su — arriva fresco' },
}

// Restituisce { active, phase, label, focus, deload, days, weeks }.
export function computeTripPhase(tripDate, todayIso) {
  if (!tripDate) return { active: false }
  const days = Math.round(
    (new Date(tripDate + 'T00:00:00') - new Date(todayIso + 'T00:00:00')) / 86400000
  )
  if (days < 0) return { active: false, past: true, days }

  const weeks = Math.max(1, Math.ceil((days + 1) / 7)) // 0-6gg → 1, 7-13 → 2, ...
  if (weeks > 4) return { active: false, days, weeks }

  const phase = -weeks
  return { active: true, days, weeks, phase, deload: phase === -1, ...PHASE_META[String(phase)] }
}
