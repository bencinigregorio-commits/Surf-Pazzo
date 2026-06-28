import {
  isoDate, weekRange, WEEKDAYS, activityLabel,
  computeWeekStatus, buildPlan, CODE_LABEL,
} from './week'
import { FATIGUE_META, fatigueScore } from './recovery'
import { Icon } from './Icons'

// Icona (neon personalizzata) per ogni tipo di attività.
const ACT_ICON = {
  A: 'forza', B: 'forza', C: 'forza',
  corsa: 'corsa', calcetto: 'ball', mobilita: 'mobilita',
  balance: 'balance', recovery: 'recupero', rest: 'riposo',
}

// Sottotitolo e focus surf per le sedute portanti.
const SESSION_FOCUS = {
  A: { sub: 'Forza gambe · Core · Pop-up power', surf: 'spinta, stabilità, take-off' },
  B: { sub: 'Pagaiata · Spalla · Resistenza', surf: 'remata potente, spalla sana' },
  C: { sub: 'Equilibrio · Rotazione · Atletismo', surf: 'stabilità, bottom turn' },
}

const QUICK = [
  { code: 'corsa', label: 'Corsa', icon: 'corsa' },
  { code: 'calcetto', label: 'Calcetto', icon: 'ball' },
  { code: 'mobilita', label: 'Mobilità', icon: 'mobilita' },
  { code: 'balance', label: 'Balance', icon: 'balance' },
  { code: 'recovery', label: 'Recupero', icon: 'recupero' },
  { code: '__rest__', label: 'Riposo', icon: 'riposo' },
]

const CHECKINS = [
  { state: 'fresco', label: 'Fresco' },
  { state: 'ok', label: 'Ok' },
  { state: 'cotto', label: 'Cotto' },
]

export default function WeekView({
  weekLogs, days, fatigue, deload, checkin, activeRegions,
  tripDate, tripPhase, sessionsByCode,
  onSetTripDate, onOpenSessionLog, onQuickLog, onCheckin,
}) {
  const todayIso = isoDate(new Date())
  const byDate = {}
  for (const l of weekLogs) (byDate[l.log_date] ??= []).push(l)

  const status = computeWeekStatus(weekLogs)
  const plan = buildPlan(weekLogs, days, todayIso)
  const planByIso = Object.fromEntries(plan.perDay.map((p) => [p.iso, p]))

  return (
    <div className="screen">
      {tripPhase.active && <TripBanner phase={tripPhase} tripDate={tripDate} onSetDate={onSetTripDate} />}

      <TodayHero
        plan={plan}
        sessionsByCode={sessionsByCode}
        onOpenSessionLog={onOpenSessionLog}
        onQuickLog={onQuickLog}
      />

      <FatigueCard fatigue={fatigue} deload={deload} checkin={checkin} activeRegions={activeRegions} onCheckin={onCheckin} />

      {/* Striscia settimana */}
      <div className="weekstrip">
        {days.map((d, i) => {
          const iso = isoDate(d)
          const dayLogs = byDate[iso] ?? []
          const isToday = iso === todayIso
          const planned = planByIso[iso]?.planned
          return (
            <div key={iso} className={'wday' + (isToday ? ' wday--today' : '')}>
              <span className="wdname">{WEEKDAYS[i]}</span>
              <span className="wdnum">{d.getDate()}</span>
              <div className="wdacts">
                {dayLogs.map((l) => (
                  <Icon key={l.id} name={l.status === 'rest' ? 'riposo' : ACT_ICON[l.session_code] ?? 'training'} size={18} className="wdico" />
                ))}
                {dayLogs.length === 0 && planned && planned !== 'free' && (
                  <Icon name={ACT_ICON[planned] ?? (planned === 'cardio' ? 'corsa' : planned === 'mobility' ? 'mobilita' : 'training')} size={18} className="wdico wdico--plan" />
                )}
              </div>
            </div>
          )
        })}
      </div>

      <ProgressCard status={status} />

      {/* Aggiungi attività */}
      <section className="card actcard">
        <h2 className="card-title">Aggiungi attività</h2>
        <div className="actgrid">
          {['A', 'B', 'C'].map((code) => (
            <button key={code} className="actbtn actbtn--gym" onClick={() => onOpenSessionLog(code)}>
              <Icon name="forza" size={26} />
              <span>Forza {code}</span>
            </button>
          ))}
          {QUICK.map((q) => (
            <button key={q.code} className="actbtn" onClick={() => onQuickLog(q.code)}>
              <Icon name={q.icon} size={26} />
              <span>{q.label}</span>
            </button>
          ))}
        </div>
      </section>

      {!tripPhase.active && <TripSetter tripDate={tripDate} onSetDate={onSetTripDate} />}
    </div>
  )
}

/* ---------- Card OGGI (proposta del giorno) ---------- */
function TodayHero({ plan, sessionsByCode, onOpenSessionLog, onQuickLog }) {
  const { today } = plan
  const code = today.code
  const done = today.state === 'done'
  const isGym = ['A', 'B', 'C'].includes(code)

  let title, sub, rows = [], action = null
  if (isGym) {
    const s = sessionsByCode?.[code]
    const focus = SESSION_FOCUS[code]
    title = `Palestra ${code}`
    sub = focus.sub
    const dmin = s?.target_duration_min, dmax = s?.target_duration_max
    rows = [
      { icon: 'clock', label: 'Durata stimata', value: dmin && dmax ? `${dmin}–${dmax} min` : '—' },
      { icon: 'target', label: 'Focus surf', value: focus.surf },
    ]
    action = (
      <button className="hero-cta" onClick={() => onOpenSessionLog(code)}>
        {done ? 'Apri la seduta' : 'Inizia sessione'}<Icon name="chevron" size={20} />
      </button>
    )
  } else if (code === 'cardio') {
    title = 'Motore aerobico'
    sub = 'Una corsa facile o un calcetto'
    action = (
      <div className="hero-quick">
        <button className="hero-cta" onClick={() => onQuickLog('corsa')}><Icon name="corsa" size={20} />Corsa</button>
        <button className="hero-cta hero-cta--ghost" onClick={() => onQuickLog('calcetto')}><Icon name="ball" size={18} />Calcetto</button>
      </div>
    )
  } else if (code === 'free') {
    title = 'Giornata libera'
    sub = 'Protegge il recupero · al massimo mobilità leggera'
  } else {
    title = 'Niente di obbligatorio'
    sub = 'Mobilità o balance se ti va, poi riposa'
  }

  return (
    <section className="hero-card">
      <div className="hero-wavebg" aria-hidden="true">
        <Icon name="wave" size={170} className="hero-wavebg-ico" />
      </div>
      <div className="hero-body">
        <span className={'hero-pill' + (done ? ' hero-pill--done' : '')}>{done ? 'FATTO ✓' : 'OGGI'}</span>
        <h2 className="hero-h">{title}</h2>
        <p className="hero-sub">{sub}</p>
        {rows.length > 0 && (
          <div className="hero-rows">
            {rows.map((r) => (
              <div key={r.label} className="hero-row">
                <span className="hero-row-ic"><Icon name={r.icon} size={18} /></span>
                <span>
                  <span className="hero-row-lbl">{r.label}</span>
                  <span className="hero-row-val">{r.value}</span>
                </span>
              </div>
            ))}
          </div>
        )}
        {action}
      </div>
    </section>
  )
}

/* ---------- Carico settimana (anello) ---------- */
const STATE_ADVICE = {
  verde: 'Via libera. Si può progredire.',
  giallo: 'Mantieni. Evita nuovi massimali.',
  rosso: 'Recupera. Niente nuovi carichi.',
}

function FatigueCard({ fatigue, deload, checkin, activeRegions, onCheckin }) {
  const meta = FATIGUE_META[fatigue.state]
  const score = fatigueScore(fatigue.load, checkin?.state)
  const r = 34
  const c = 2 * Math.PI * r
  const off = c * (1 - score / 100)

  return (
    <section className={'card fatigue ' + meta.cls}>
      <div className="card-head">
        <h2 className="card-title">Carico settimana</h2>
        <span className="muted small">carico {fatigue.load}</span>
      </div>
      <div className="fat-main">
        <svg className="ring" width="84" height="84" viewBox="0 0 84 84">
          <circle className="ring-bg" cx="42" cy="42" r={r} />
          <circle className="ring-fg" cx="42" cy="42" r={r} strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 42 42)" />
        </svg>
        <div className="fat-readout">
          <div className="fat-state">{meta.label}</div>
          <div className="fat-score">{score}<span> /100</span></div>
        </div>
        <p className="fat-advice">{STATE_ADVICE[fatigue.state]}</p>
      </div>

      <div className="checkin-row">
        {CHECKINS.map((ci) => (
          <button
            key={ci.state}
            className={'cbtn' + (checkin?.state === ci.state ? ' cbtn--on' : '')}
            onClick={() => onCheckin(ci.state)}
          >
            <Icon name="wave" size={16} /> {ci.label}
          </button>
        ))}
      </div>

      {activeRegions.length > 0 && (
        <p className="fatigue-pain">⚠️ Zona in attenzione: {activeRegions.map((x) => x.region).join(', ')}.</p>
      )}
      {deload && <p className="fatigue-deload">💡 {deload}</p>}
    </section>
  )
}

/* ---------- Progresso settimana ---------- */
function ProgressCard({ status }) {
  const { s, currentTier } = status
  const cells = [
    { label: 'Portanti', val: s.portanti, tot: 3 },
    { label: 'Mobilità', val: s.mobilitaDays, tot: 5 },
    { label: 'Cardio', val: s.cardio, tot: 2 },
    { label: 'Balance', val: s.balanceDays, tot: 4 },
  ]
  return (
    <section className="card">
      <div className="card-head">
        <h2 className="card-title">Progresso settimana</h2>
        <span className="muted small">{currentTier ? currentTier.name : `${s.portanti}/3 portanti`}</span>
      </div>
      <div className="progrid">
        {cells.map((c) => (
          <div key={c.label} className="procell">
            <span className="pro-lbl">{c.label}</span>
            <span className="pro-val">{c.val}<span className="pro-tot">/{c.tot}</span></span>
            <Spark frac={Math.min(1, c.val / c.tot)} />
          </div>
        ))}
      </div>
    </section>
  )
}

function Spark({ frac }) {
  return (
    <svg className="spark" viewBox="0 0 100 26" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 22 C 22 20, 32 6, 52 10 S 82 4, 100 7" fill="none" stroke="url(#sparkg)" strokeWidth="2.5" strokeLinecap="round" style={{ opacity: 0.4 + frac * 0.6 }} />
      <defs>
        <linearGradient id="sparkg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#5eead4" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/* ---------- Pre-trip ---------- */
function formatItDate(iso) {
  if (!iso) return ''
  return new Date(iso + 'T00:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
}

function TripBanner({ phase, tripDate, onSetDate }) {
  return (
    <section className="card trip--on">
      <div className="trip-head">
        <span className="trip-title">🏝️ Pre-trip · {phase.label}</span>
        <button className="link small" onClick={() => onSetDate(null)}>rimuovi</button>
      </div>
      <p className="trip-focus">{phase.focus}</p>
      <p className="trip-emph">Priorità: pagaiata (B/ski-erg), pop-up, balance. Alleggerisci la forza pesante (A). In giallo: niente nuovi carichi.</p>
      {phase.deload && <p className="trip-deload">💡 Settimana di scarico: tanta mobilità/pop-up/balance, arriva riposato.</p>}
      <p className="muted small">Mancano {phase.days} {phase.days === 1 ? 'giorno' : 'giorni'} (il {formatItDate(tripDate)}).</p>
    </section>
  )
}

function TripSetter({ tripDate, onSetDate }) {
  return (
    <details className="card trip">
      <summary>🏝️ Viaggio surf in vista? Imposta la data</summary>
      <div className="trip-set">
        <input type="date" className="input" value={tripDate ?? ''} onChange={(e) => onSetDate(e.target.value || null)} />
        {tripDate && <button className="link small" onClick={() => onSetDate(null)}>rimuovi</button>}
      </div>
      <p className="muted small">A 4 settimane dal viaggio l'app cambia priorità per arrivare al top.</p>
    </details>
  )
}
