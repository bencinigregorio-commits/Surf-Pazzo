import { useEffect, useMemo, useState } from 'react'
import {
  getBackboneSessions, getProgressionData, getWeekLogs, getLatestCheckin,
  getTripConfig, setTripDate, saveSession, saveCheckin,
  getBiaScans, addBiaScan, getGoalPhase, setGoalPhase,
} from './queries'
import { computeSuggestion, lastLogSummary, SUGGEST_META } from './progression'
import { computeWeeklyLoad, fatigueState, deloadAdvice, computeActivePain } from './recovery'
import { computeTripPhase } from './trip'
import { isoDate, weekRange } from './week'
import LogForm from './LogForm'
import WeekView from './WeekView'
import BiaView from './BiaView'
import Lock from './Lock'
import { Icon } from './Icons'

const TODAY_ISO = isoDate(new Date())

const TYPE_LABEL = {
  load: 'forza',
  ballistic: 'balistico',
  skill: 'tecnica',
  endurance: 'resistenza',
}

const FOCUS_SUB = {
  A: 'Forza gambe · Core · Pop-up power',
  B: 'Pagaiata · Spalla · Resistenza',
  C: 'Equilibrio · Rotazione · Atletismo',
}

export default function App() {
  const [state, setState] = useState('loading') // loading | empty | error | ready
  const [sessions, setSessions] = useState([])
  const [active, setActive] = useState('A')
  const [errorMsg, setErrorMsg] = useState('')
  const [nav, setNav] = useState('week') // week | sessions
  const [logging, setLogging] = useState(false)
  const [toast, setToast] = useState('')
  const [progByEx, setProgByEx] = useState({})
  const [weekLogs, setWeekLogs] = useState([])
  const [checkin, setCheckin] = useState(null)
  const [tripDate, setTripDateState] = useState(null)
  const [biaScans, setBiaScans] = useState([])
  const [goalPhase, setGoalPhaseState] = useState('mantenimento')
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem('surf_ok') === '1')

  const days = weekRange().days

  useEffect(() => {
    getBackboneSessions()
      .then((data) => {
        if (data.length === 0) setState('empty')
        else {
          setSessions(data)
          setState('ready')
        }
      })
      .catch((err) => {
        if (err.tablesMissing) setState('empty')
        else {
          setErrorMsg(err.message ?? String(err))
          setState('error')
        }
      })
    refreshData()
  }, [])

  function refreshData() {
    getProgressionData().then(setProgByEx).catch(() => setProgByEx({}))
    getWeekLogs(isoDate(days[0]), isoDate(days[6])).then(setWeekLogs).catch(() => setWeekLogs([]))
    getLatestCheckin().then(setCheckin).catch(() => setCheckin(null))
    getTripConfig().then((t) => setTripDateState(t?.trip_date ?? null)).catch(() => setTripDateState(null))
    getBiaScans().then(setBiaScans).catch(() => setBiaScans([]))
    getGoalPhase().then(setGoalPhaseState).catch(() => setGoalPhaseState('mantenimento'))
  }

  // Indice esercizi (per le zone del corpo) e stato derivato di fatica/dolore.
  const exById = useMemo(() => {
    const m = {}
    for (const s of sessions) for (const se of s.session_exercise) m[se.exercise.id] = se.exercise
    return m
  }, [sessions])

  const activeRegions = useMemo(() => computeActivePain(progByEx, exById), [progByEx, exById])
  const fatigue = useMemo(() => fatigueState(computeWeeklyLoad(weekLogs), checkin?.state), [weekLogs, checkin])
  const deload = deloadAdvice(fatigue.state, checkin?.state, activeRegions)
  const tripPhase = useMemo(() => computeTripPhase(tripDate, TODAY_ISO), [tripDate])
  const suggestCtx = { weekFatigue: fatigue.state, activeRegions, preTrip: tripPhase.active, goalPhase }

  const current = sessions.find((s) => s.code === active)

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function openSessionLog(code) {
    setActive(code)
    setLogging(true)
    setNav('sessions')
  }

  function handleSaved() {
    setLogging(false)
    setNav('week')
    showToast('Seduta registrata ✓')
    refreshData()
  }

  async function quickLog(code) {
    try {
      await saveSession({
        session_code: code === '__rest__' ? null : code,
        status: code === '__rest__' ? 'rest' : 'done',
        log_date: TODAY_ISO,
      })
      refreshData()
      showToast('Segnato per oggi ✓')
    } catch (e) {
      showToast('Errore: ' + (e.message ?? e))
    }
  }

  async function doCheckin(s) {
    try {
      await saveCheckin(s)
      refreshData()
      showToast('Sensazione registrata ✓')
    } catch (e) {
      showToast('Errore: ' + (e.message ?? e))
    }
  }

  async function changeTripDate(date) {
    try {
      await setTripDate(date)
      refreshData()
      showToast(date ? 'Viaggio impostato ✓' : 'Viaggio rimosso')
    } catch (e) {
      showToast('Errore: ' + (e.message ?? e))
    }
  }

  async function addScan(scan) {
    try {
      await addBiaScan(scan)
      refreshData()
      showToast('Scansione salvata ✓')
    } catch (e) {
      showToast('Errore: ' + (e.message ?? e))
    }
  }

  async function changeGoalPhase(phase) {
    try {
      await setGoalPhase(phase)
      refreshData()
      showToast('Fase obiettivo aggiornata ✓')
    } catch (e) {
      showToast('Errore: ' + (e.message ?? e))
    }
  }

  function relock() {
    localStorage.removeItem('surf_ok')
    setUnlocked(false)
  }

  if (!unlocked) return <Lock onUnlock={() => setUnlocked(true)} />

  return (
    <div className="page">
      <header className="appbar">
        <img className="appbar-logo" src="/icon-192.png" alt="" />
        <div className="appbar-titles">
          <span className="appbar-title">Surf Training</span>
          <span className="appbar-sub">Base atletica</span>
        </div>
        <div className="appbar-actions">
          {state === 'ready' && (
            <button className="appbar-stats" onClick={() => setNav('corpo')} aria-label="Corpo">
              <Icon name="stats" size={24} />
            </button>
          )}
          <button className="appbar-stats appbar-logout" onClick={relock} aria-label="Blocca">
            <Icon name="logout" size={18} />
          </button>
        </div>
        <svg className="appbar-deco" viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 26 C40 10 70 34 110 22 S180 12 200 22" fill="none" stroke="rgba(34,211,238,0.35)" strokeWidth="1.5" />
          <path d="M0 32 C40 18 70 40 110 28 S180 18 200 28" fill="none" stroke="rgba(125,211,252,0.18)" strokeWidth="1.5" />
        </svg>
      </header>

      <main className="content">
        {toast && <div className="toast">{toast}</div>}

        {state === 'loading' && <p className="muted center">Carico…</p>}

        {state === 'error' && (
          <div className="panel panel--err">
            <strong>Collegamento al database non riuscito</strong>
            <p className="errdetail">{errorMsg}</p>
          </div>
        )}

        {state === 'empty' && (
          <div className="panel">
            <strong>Database collegato, ma ancora vuoto.</strong>
            <p className="muted">Manca solo eseguire lo script SQL su Supabase.</p>
          </div>
        )}

        {state === 'ready' && logging && current && (
          <LogForm session={current} onSaved={handleSaved} onCancel={() => setLogging(false)} />
        )}

        {state === 'ready' && !logging && nav === 'week' && (
          <WeekView
            weekLogs={weekLogs}
            days={days}
            fatigue={fatigue}
            deload={deload}
            checkin={checkin}
            activeRegions={activeRegions}
            tripDate={tripDate}
            tripPhase={tripPhase}
            sessionsByCode={Object.fromEntries(sessions.map((s) => [s.code, s]))}
            onSetTripDate={changeTripDate}
            onOpenSessionLog={openSessionLog}
            onQuickLog={quickLog}
            onCheckin={doCheckin}
          />
        )}

        {state === 'ready' && !logging && nav === 'corpo' && (
          <BiaView
            scans={biaScans}
            goalPhase={goalPhase}
            preTrip={tripPhase.active}
            onAddScan={addScan}
            onSetPhase={changeGoalPhase}
          />
        )}

        {state === 'ready' && !logging && nav === 'sessions' && current && (
          <div className="screen">
            <div className="tabs">
              {sessions.map((s) => (
                <button
                  key={s.code}
                  className={'tab' + (s.code === active ? ' tab--on' : '')}
                  onClick={() => setActive(s.code)}
                >
                  {s.code}
                </button>
              ))}
            </div>

            <section className="hero-card">
              <div className="hero-wavebg" aria-hidden="true">
                <Icon name="forza" size={150} className="hero-wavebg-ico" />
              </div>
              <div className="hero-body">
                <span className="hero-pill">PALESTRA {current.code}</span>
                <h2 className="hero-h">{current.name.replace(/^Palestra [ABC] — /, '')}</h2>
                <p className="hero-sub">{FOCUS_SUB[current.code]} · {current.session_exercise.length} esercizi</p>
                <button className="hero-cta" onClick={() => setLogging(true)}>
                  Registra seduta<Icon name="chevron" size={20} />
                </button>
              </div>
            </section>

            <ol className="exlist">
              {current.session_exercise.map((se) => (
                <li key={se.order_index} className="excard">
                  <div className="exhead">
                    <span className="exname">{se.exercise.name}</span>
                    <span className="exresc">{se.prescription}</span>
                  </div>
                  <div className="exmeta">
                    <span className={'pill pill--' + se.exercise.progression_type}>
                      {TYPE_LABEL[se.exercise.progression_type]}
                    </span>
                    {se.exercise.cue && <span className="excue">{se.exercise.cue}</span>}
                  </div>
                  <ProgBadge exercise={se.exercise} history={progByEx[se.exercise.id]} ctx={suggestCtx} />
                  <AlternativeBlock alternatives={se.exercise.exercise_alternative} />
                </li>
              ))}
            </ol>
          </div>
        )}
      </main>

      {state === 'ready' && !logging && (
        <nav className="tabbar">
          {[
            ['week', 'settimana', 'Settimana'],
            ['sessions', 'training', 'Training'],
            ['corpo', 'corpo', 'Corpo'],
          ].map(([key, icon, label]) => (
            <button
              key={key}
              className={'tabbar-btn' + (nav === key ? ' tabbar-btn--on' : '')}
              onClick={() => setNav(key)}
            >
              <Icon name={icon} size={23} className="tabbar-ico" />
              <span className="tabbar-lbl">{label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}

// Consiglio di progressione per la volta successiva, calcolato dallo storico.
function ProgBadge({ exercise, history, ctx }) {
  const sug = computeSuggestion(exercise, history ?? [], TODAY_ISO, ctx)
  const meta = SUGGEST_META[sug.code]
  const summary = lastLogSummary(sug.last)

  return (
    <div className="prog">
      <div className="prog-line">
        <span className={'sgbadge ' + meta.cls}>{meta.label}</span>
        <span className="prog-hint">{sug.hint}</span>
      </div>
      {summary && <p className="prog-last">Ultima volta: {summary}</p>}
    </div>
  )
}

// Mostra le alternative ("piano B") di un esercizio, apribili al tocco.
function AlternativeBlock({ alternatives }) {
  const [open, setOpen] = useState(false)
  const list = [...(alternatives ?? [])].sort((a, b) => a.order_index - b.order_index)
  if (list.length === 0) return null

  return (
    <div className="alt">
      <button className="altbtn" onClick={() => setOpen((o) => !o)}>
        ↔ Alternativa{list.length > 1 ? ` (${list.length})` : ''} {open ? '▴' : '▾'}
      </button>
      {open && (
        <ul className="altlist">
          {list.map((a, i) => (
            <li key={i} className="altitem">
              <div className="althead">
                <span className="altname">{a.alt_name}</span>
                {a.alt_prescription && <span className="exresc">{a.alt_prescription}</span>}
              </div>
              {a.reason && <p className="altreason">{a.reason}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
