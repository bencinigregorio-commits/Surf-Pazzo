// Funzioni di supporto per la settimana (Lun–Dom) e le etichette attività.

const pad = (n) => String(n).padStart(2, '0')

// Data locale in formato YYYY-MM-DD (coerente con il campo date di Supabase).
export const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// Lunedì e domenica della settimana che contiene `base` (default: oggi).
export function weekRange(base = new Date()) {
  const day = (base.getDay() + 6) % 7 // 0 = lunedì
  const mon = new Date(base)
  mon.setDate(base.getDate() - day)
  mon.setHours(0, 0, 0, 0)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon)
    d.setDate(mon.getDate() + i)
    return d
  })
  return { mon: days[0], sun: days[6], days }
}

export const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

// Etichetta + emoji per un'attività registrata.
export function activityLabel(log) {
  if (log.status === 'rest') return '😴 Riposo'
  const map = {
    A: '🏋️ Palestra A',
    B: '🏋️ Palestra B',
    C: '🏋️ Palestra C',
    corsa: '🏃 Corsa',
    calcetto: '⚽ Calcetto',
    mobilita: '🧘 Mobilità',
    balance: '🛹 Balance',
    recovery: '♻️ Recupero',
  }
  return map[log.session_code] ?? log.session_code ?? '—'
}

// ── Fasce di completamento settimanale ──────────────────────────────
// Soglie iniziali "larghe", da tarare sui dati reali (come da specifica §13).
export const TIERS = [
  { key: 'minima',   name: 'Minima valida', msg: 'Non sei caduto dal carro. È già un successo.',     req: { portanti: 2, mobilita: 4, cardio: 0, balance: 0 } },
  { key: 'standard', name: 'Standard',      msg: 'La settimana piena e realistica. Ottimo ritmo.',    req: { portanti: 3, mobilita: 5, cardio: 1, balance: 0 } },
  { key: 'ottimale', name: 'Ottimale',      msg: 'Settimana di alto livello. Grande costanza.',       req: { portanti: 3, mobilita: 6, cardio: 1, balance: 4 } },
  { key: 'piena',    name: 'Piena',         msg: 'Tutto fatto. Eccezionale (e raro!).',                req: { portanti: 3, mobilita: 7, cardio: 2, balance: 5 } },
]

function satisfied(req, s) {
  return (
    s.portanti >= req.portanti &&
    s.mobilitaDays >= req.mobilita &&
    s.cardio >= req.cardio &&
    s.balanceDays >= req.balance
  )
}

function progressTo(req, s) {
  const parts = [
    Math.min(s.portanti / req.portanti, 1),
    req.mobilita ? Math.min(s.mobilitaDays / req.mobilita, 1) : 1,
    req.cardio ? Math.min(s.cardio / req.cardio, 1) : 1,
    req.balance ? Math.min(s.balanceDays / req.balance, 1) : 1,
  ]
  return parts.reduce((a, b) => a + b, 0) / parts.length
}

function gaps(req, s) {
  const g = []
  const d = (n, sing, plur) => `+${n} ${n === 1 ? sing : plur}`
  if (s.portanti < req.portanti) g.push(d(req.portanti - s.portanti, 'seduta portante', 'sedute portanti'))
  if (s.mobilitaDays < req.mobilita) g.push(d(req.mobilita - s.mobilitaDays, 'giorno di mobilità', 'giorni di mobilità'))
  if (s.cardio < req.cardio) g.push(d(req.cardio - s.cardio, 'tra corsa/calcetto', 'tra corsa/calcetto'))
  if (s.balanceDays < req.balance) g.push(d(req.balance - s.balanceDays, 'giorno di balance', 'giorni di balance'))
  return g
}

// Calcola lo stato della settimana a partire dalle attività registrate.
export function computeWeekStatus(logs) {
  const backbone = new Set()
  const mobilita = new Set()
  const balance = new Set()
  let cardio = 0
  for (const l of logs) {
    if (l.status === 'rest') continue
    const c = l.session_code
    if (c === 'A' || c === 'B' || c === 'C') backbone.add(c)
    else if (c === 'mobilita') mobilita.add(l.log_date)
    else if (c === 'balance') balance.add(l.log_date)
    else if (c === 'corsa' || c === 'calcetto') cardio++
  }
  const s = {
    portanti: backbone.size,
    mobilitaDays: mobilita.size,
    balanceDays: balance.size,
    cardio,
  }

  let currentIndex = -1
  for (let i = 0; i < TIERS.length; i++) if (satisfied(TIERS[i].req, s)) currentIndex = i

  const nextTier = TIERS[currentIndex + 1] ?? null
  const nextProgress = nextTier ? progressTo(nextTier.req, s) : 1
  const nextGaps = nextTier ? gaps(nextTier.req, s) : []

  return {
    s,
    currentIndex,
    currentTier: currentIndex >= 0 ? TIERS[currentIndex] : null,
    nextTier,
    nextProgress,
    nextGaps,
  }
}

// ── Motore di proposte e pianificazione (Fetta 3c) ──────────────────
export const CODE_LABEL = {
  A: 'Palestra A', B: 'Palestra B', C: 'Palestra C',
  cardio: 'Corsa o calcetto', free: 'Giornata libera', mobility: 'Mobilità',
}

function permutations(arr) {
  if (arr.length <= 1) return [arr]
  const res = []
  arr.forEach((x, i) => {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)]
    for (const p of permutations(rest)) res.push([x, ...p])
  })
  return res
}

// Regola dura: A e C non possono stare in giorni consecutivi (alto carico CNS/gambe).
function validSpacing(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    const a = arr[i], b = arr[i + 1]
    if ((a === 'A' && b === 'C') || (a === 'C' && b === 'A')) return false
  }
  return true
}

// Costruisce il piano della settimana: cosa è già fatto, cosa proporre oggi e nei
// prossimi giorni, proteggendo 2 giorni liberi e rispettando il recupero.
export function buildPlan(logs, days, todayIso) {
  const weekIso = days.map(isoDate)
  const todayIdx = Math.max(0, weekIso.indexOf(todayIso))

  const byDate = {}
  for (const l of logs) (byDate[l.log_date] ??= []).push(l)

  // Cosa è registrato in ogni giorno (priorità: portante > cardio > libero > mobilità).
  const assigned = weekIso.map((iso) => {
    const dl = byDate[iso] ?? []
    const portante = dl.find((l) => ['A', 'B', 'C'].includes(l.session_code))
    if (portante) return portante.session_code
    if (dl.some((l) => ['corsa', 'calcetto'].includes(l.session_code))) return 'cardio'
    if (dl.some((l) => l.status === 'rest')) return 'free'
    if (dl.some((l) => ['mobilita', 'balance', 'recovery'].includes(l.session_code))) return 'mobility'
    return null
  })

  const doneBackbone = ['A', 'B', 'C'].filter((c) => assigned.includes(c))
  const missing = ['A', 'B', 'C'].filter((c) => !doneBackbone.includes(c))
  const cardioCount = assigned.filter((x) => x === 'cardio').length
  const freeCount = assigned.filter((x) => x === 'free').length

  // Giorni futuri ancora vuoti (oggi incluso).
  const futureEmpty = []
  for (let i = todayIdx; i < 7; i++) if (assigned[i] === null) futureEmpty.push(i)

  // Riserva i giorni liberi mancanti (vincolo rigido: almeno 2 a settimana).
  const needFree = Math.max(0, 2 - freeCount)
  const reserved = new Set(futureEmpty.slice(futureEmpty.length - needFree))
  const workSlots = futureEmpty.filter((i) => !reserved.has(i))

  // Cosa resta da fare: prima i portanti (P1), poi un cardio se manca (P2).
  let toPlace = [...missing]
  if (cardioCount < 1) toPlace.push('cardio')

  // Se non c'è spazio sicuro, si lascia andare (dalla coda: prima il cardio, poi un portante).
  const dropped = []
  while (toPlace.length > workSlots.length) dropped.push(toPlace.pop())

  // Piano base con i giorni liberi riservati.
  const base = assigned.slice()
  for (const i of reserved) base[i] = 'free'

  // Cerca una disposizione che rispetti la spaziatura A/C.
  let plan = null
  for (const perm of permutations(toPlace)) {
    const trial = base.slice()
    perm.forEach((code, k) => (trial[workSlots[k]] = code))
    if (validSpacing(trial)) { plan = trial; break }
  }
  if (!plan) {
    plan = base.slice()
    toPlace.forEach((code, k) => (plan[workSlots[k]] = code))
  }

  // perDay: distingue ciò che è registrato da ciò che è solo proposto.
  const perDay = weekIso.map((iso, i) => ({
    iso,
    weekday: WEEKDAYS[i],
    dayNum: days[i].getDate(),
    isToday: i === todayIdx,
    isPast: i < todayIdx,
    logged: assigned[i],
    planned: assigned[i] === null ? plan[i] : null,
  }))

  // Proposta di oggi.
  let today
  if (assigned[todayIdx] !== null) {
    today = { state: 'done', code: assigned[todayIdx] }
  } else {
    today = { state: 'suggest', code: plan[todayIdx] ?? null }
  }

  return {
    perDay,
    today,
    dropped,
    missing,
    doneBackbone,
    targetPortanti: 3 - dropped.filter((x) => x !== 'cardio').length,
  }
}

// Etichetta corta (per le celle strette del calendario).
export function activityShort(log) {
  if (log.status === 'rest') return '😴'
  const map = {
    A: 'A', B: 'B', C: 'C',
    corsa: '🏃', calcetto: '⚽', mobilita: '🧘', balance: '🛹', recovery: '♻️',
  }
  return map[log.session_code] ?? '•'
}
