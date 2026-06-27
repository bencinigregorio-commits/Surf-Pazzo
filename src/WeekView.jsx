import { useEffect, useState } from 'react'
import { getWeekLogs, saveSession } from './queries'
import {
  isoDate, weekRange, WEEKDAYS, activityLabel, activityShort,
  computeWeekStatus, TIERS, buildPlan, CODE_LABEL,
} from './week'

// Icona-fantasma per un'attività solo proposta (non ancora fatta).
const PLAN_SHORT = { A: 'A', B: 'B', C: 'C', cardio: '🏃', free: '·', mobility: '🧘' }

// Attività che si registrano con un tocco (le palestre A/B/C aprono invece il modulo).
const QUICK = [
  { code: 'corsa', label: '🏃 Corsa' },
  { code: 'calcetto', label: '⚽ Calcetto' },
  { code: 'mobilita', label: '🧘 Mobilità' },
  { code: 'balance', label: '🛹 Balance' },
  { code: 'recovery', label: '♻️ Recupero' },
  { code: '__rest__', label: '😴 Riposo' },
]

export default function WeekView({ onOpenSessionLog, onToast }) {
  const { days } = weekRange()
  const todayIso = isoDate(new Date())
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await getWeekLogs(isoDate(days[0]), isoDate(days[6]))
      setLogs(data)
    } catch {
      setLogs([])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Raggruppa le attività per data.
  const byDate = {}
  for (const l of logs) (byDate[l.log_date] ??= []).push(l)

  async function quickLog(code) {
    setSaving(true)
    try {
      await saveSession({
        session_code: code === '__rest__' ? null : code,
        status: code === '__rest__' ? 'rest' : 'done',
        log_date: todayIso,
      })
      await load()
      onToast?.('Segnato per oggi ✓')
    } catch (e) {
      onToast?.('Errore: ' + (e.message ?? e))
    }
    setSaving(false)
  }

  const todayLogs = byDate[todayIso] ?? []
  const status = computeWeekStatus(logs)
  const plan = buildPlan(logs, days, todayIso)
  const planByIso = Object.fromEntries(plan.perDay.map((p) => [p.iso, p]))

  return (
    <div>
      <h1 className="session-title">La tua settimana</h1>

      {!loading && <FasceCard status={status} />}
      {!loading && <ProposteCard plan={plan} onOpenSessionLog={onOpenSessionLog} onQuickLog={quickLog} />}

      {/* Striscia Lun–Dom */}
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
                  <span key={l.id} className="wdchip" title={activityLabel(l)}>
                    {activityShort(l)}
                  </span>
                ))}
                {dayLogs.length === 0 && planned && planned !== 'free' && (
                  <span className="wdchip wdchip--plan" title={'Proposto: ' + (CODE_LABEL[planned] ?? planned)}>
                    {PLAN_SHORT[planned] ?? '·'}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Oggi cosa fai */}
      <section className="declare">
        <h2 className="h2">Oggi cosa fai?</h2>
        <div className="declare-row">
          {['A', 'B', 'C'].map((code) => (
            <button key={code} className="dbtn dbtn--gym" onClick={() => onOpenSessionLog(code)}>
              🏋️ {code}
            </button>
          ))}
        </div>
        <div className="declare-row">
          {QUICK.map((q) => (
            <button key={q.code} className="dbtn" disabled={saving} onClick={() => quickLog(q.code)}>
              {q.label}
            </button>
          ))}
        </div>
        <p className="muted small">
          A / B / C aprono la registrazione dettagliata. Le altre si segnano subito.
        </p>
      </section>

      {/* Riepilogo di oggi */}
      <section className="today">
        <h2 className="h2">Oggi</h2>
        {loading ? (
          <p className="muted small">Carico…</p>
        ) : todayLogs.length === 0 ? (
          <p className="muted small">Niente di registrato oggi. Scegli qui sopra.</p>
        ) : (
          <ul className="loglist">
            {todayLogs.map((l) => (
              <li key={l.id} className="logitem">
                <span className="logdate">{activityLabel(l)}</span>
                <span className="logmeta">
                  {l.session_rpe ? `RPE ${l.session_rpe}` : ''}
                  {l.exercise_count ? ` · ${l.exercise_count} es.` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

// Proposta del giorno + piano dei prossimi giorni (motore 3c).
function ProposteCard({ plan, onOpenSessionLog, onQuickLog }) {
  const { today, dropped, missing, perDay } = plan
  const code = today.code

  // Testo della proposta di oggi.
  let title, reason, action = null
  if (today.state === 'done') {
    title = `Oggi: ${CODE_LABEL[code] ?? code} ✓`
    reason = ['A', 'B', 'C'].includes(code)
      ? 'Il grosso è fatto. Se ti va, aggiungi mobilità o balance.'
      : 'Registrato. Aggiungi pure altro se vuoi.'
  } else if (['A', 'B', 'C'].includes(code)) {
    title = `Oggi: ${CODE_LABEL[code]}`
    reason = missing.length > 1
      ? `Questa settimana restano ${missing.join(' e ')}: oggi parti da qui.`
      : 'È l’ultima portante che ti manca questa settimana.'
    action = <button className="btn-primary sm" onClick={() => onOpenSessionLog(code)}>Registra {code}</button>
  } else if (code === 'cardio') {
    title = 'Oggi: motore aerobico'
    reason = 'Una corsa facile o un calcetto: basta uno per la fascia Standard.'
    action = (
      <div className="declare-row">
        <button className="dbtn" onClick={() => onQuickLog('corsa')}>🏃 Corsa</button>
        <button className="dbtn" onClick={() => onQuickLog('calcetto')}>⚽ Calcetto</button>
      </div>
    )
  } else if (code === 'free') {
    title = 'Oggi: giornata libera'
    reason = 'Protegge il recupero (servono almeno 2 giorni liberi). Al massimo mobilità leggera.'
  } else {
    title = 'Oggi: niente di obbligatorio'
    reason = 'Mobilità o balance se ti va, poi riposa.'
  }

  // Piano dei prossimi giorni (futuri, oggi escluso).
  const futuro = perDay.filter((p) => !p.isPast && !p.isToday)

  return (
    <div className="proposte">
      <span className="prop-kicker">Proposta</span>
      <h2 className="prop-title">{title}</h2>
      <p className="prop-reason">{reason}</p>
      {action && <div className="prop-action">{action}</div>}

      {dropped.some((x) => x !== 'cardio') && (
        <p className="prop-note">
          Questa settimana punta a {plan.targetPortanti}/3 portanti: va bene così, niente da rincorrere.
        </p>
      )}

      {futuro.length > 0 && (
        <div className="prop-plan">
          {futuro.map((p) => (
            <span key={p.iso} className="planpill">
              <b>{p.weekday}</b>{' '}
              {p.logged
                ? CODE_LABEL[p.logged] ?? p.logged
                : p.planned && p.planned !== 'free'
                ? CODE_LABEL[p.planned] ?? p.planned
                : 'libero'}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// Indicatore "a livello che si riempie" delle fasce settimanali.
function FasceCard({ status }) {
  const { s, currentIndex, currentTier, nextTier, nextProgress, nextGaps } = status

  return (
    <div className="fasce">
      <div className="fasce-head">
        <span className="fasce-label">Questa settimana</span>
        <span className="fasce-tier">
          {currentTier ? currentTier.name : 'In costruzione'}
        </span>
      </div>

      {/* Barra a 4 segmenti (minima → standard → ottimale → piena) */}
      <div className="fascebar">
        {TIERS.map((t, i) => {
          const fill = i <= currentIndex ? 1 : i === currentIndex + 1 ? nextProgress : 0
          return (
            <div key={t.key} className="fseg" title={t.name}>
              <div className="fseg-fill" style={{ width: `${Math.round(fill * 100)}%` }} />
            </div>
          )
        })}
      </div>

      <p className="fasce-msg">
        {currentTier ? currentTier.msg : 'Hai iniziato: ogni attività riempie il livello.'}
      </p>

      {nextTier && nextGaps.length > 0 && (
        <p className="fasce-next">
          Verso <b>{nextTier.name}</b>: {nextGaps.join(' · ')}
        </p>
      )}

      <div className="fasce-stats">
        <span>Portanti {s.portanti}/3</span>
        <span>Mobilità {s.mobilitaDays}g</span>
        <span>Cardio {s.cardio}</span>
        <span>Balance {s.balanceDays}g</span>
      </div>
    </div>
  )
}
