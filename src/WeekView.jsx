import {
  isoDate, weekRange, WEEKDAYS, activityLabel, activityShort,
  computeWeekStatus, TIERS, buildPlan, CODE_LABEL,
} from './week'
import { FATIGUE_META } from './recovery'

const PLAN_SHORT = { A: 'A', B: 'B', C: 'C', cardio: '🏃', free: '·', mobility: '🧘' }

const QUICK = [
  { code: 'corsa', label: '🏃 Corsa' },
  { code: 'calcetto', label: '⚽ Calcetto' },
  { code: 'mobilita', label: '🧘 Mobilità' },
  { code: 'balance', label: '🛹 Balance' },
  { code: 'recovery', label: '♻️ Recupero' },
  { code: '__rest__', label: '😴 Riposo' },
]

const CHECKINS = [
  { state: 'fresco', label: '😀 Fresco' },
  { state: 'ok', label: '🙂 Ok' },
  { state: 'cotto', label: '🥵 Cotto' },
]

export default function WeekView({
  weekLogs, days, fatigue, deload, checkin, activeRegions,
  onOpenSessionLog, onQuickLog, onCheckin,
}) {
  const todayIso = isoDate(new Date())

  const byDate = {}
  for (const l of weekLogs) (byDate[l.log_date] ??= []).push(l)

  const status = computeWeekStatus(weekLogs)
  const plan = buildPlan(weekLogs, days, todayIso)
  const planByIso = Object.fromEntries(plan.perDay.map((p) => [p.iso, p]))
  const todayLogs = byDate[todayIso] ?? []

  return (
    <div>
      <h1 className="session-title">La tua settimana</h1>

      <FasceCard status={status} />
      <ProposteCard plan={plan} onOpenSessionLog={onOpenSessionLog} onQuickLog={onQuickLog} />
      <FatigueCard fatigue={fatigue} deload={deload} checkin={checkin} activeRegions={activeRegions} onCheckin={onCheckin} />

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
            <button key={q.code} className="dbtn" onClick={() => onQuickLog(q.code)}>
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
        {todayLogs.length === 0 ? (
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

// Stato di fatica + check-in soggettivo + avvisi (zone in dolore, scarico).
function FatigueCard({ fatigue, deload, checkin, activeRegions, onCheckin }) {
  const meta = FATIGUE_META[fatigue.state]
  return (
    <div className={'fatigue ' + meta.cls}>
      <div className="fatigue-head">
        <div>
          <span className="fasce-label">Fatica settimana</span>
          <div className="fatigue-state">
            <span className="fatigue-dot" /> {meta.label}
          </div>
        </div>
        <span className="fatigue-load">carico {fatigue.load}</span>
      </div>
      <p className="fatigue-sub">{meta.sub}</p>

      <div className="checkin">
        <span className="muted small">Come ti senti oggi?</span>
        <div className="checkin-row">
          {CHECKINS.map((c) => (
            <button
              key={c.state}
              className={'cbtn' + (checkin?.state === c.state ? ' cbtn--on' : '')}
              onClick={() => onCheckin(c.state)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {activeRegions.length > 0 && (
        <p className="fatigue-pain">
          ⚠️ Zona in attenzione: {activeRegions.map((r) => `${r.region}${r.severity >= 2 ? ' (forte)' : ''}`).join(', ')}.
        </p>
      )}
      {deload && <p className="fatigue-deload">💡 {deload}</p>}
    </div>
  )
}

// Proposta del giorno + piano dei prossimi giorni (motore 3c).
function ProposteCard({ plan, onOpenSessionLog, onQuickLog }) {
  const { today, dropped, missing, perDay } = plan
  const code = today.code

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
        <span className="fasce-tier">{currentTier ? currentTier.name : 'In costruzione'}</span>
      </div>

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
