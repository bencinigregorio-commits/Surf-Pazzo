import { useEffect, useMemo, useState } from 'react'
import {
  getBackboneSessions, getProgressionData, getWeekLogs, getLatestCheckin,
  saveSession, saveCheckin,
} from './queries'
import { computeSuggestion, lastLogSummary, SUGGEST_META } from './progression'
import { computeWeeklyLoad, fatigueState, deloadAdvice, computeActivePain } from './recovery'
import { isoDate, weekRange } from './week'
import LogForm from './LogForm'
import WeekView from './WeekView'

const TODAY_ISO = isoDate(new Date())

const TYPE_LABEL = {
  load: 'forza',
  ballistic: 'balistico',
  skill: 'tecnica',
  endurance: 'resistenza',
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
  const suggestCtx = { weekFatigue: fatigue.state, activeRegions }

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

  return (
    <div className="page">
      <header className="topbar">
        <span className="brand">🏄 Surf Training</span>
      </header>

      {state === 'ready' && !logging && (
        <nav className="mainnav">
          <button className={'navbtn' + (nav === 'week' ? ' navbtn--on' : '')} onClick={() => setNav('week')}>
            Settimana
          </button>
          <button className={'navbtn' + (nav === 'sessions' ? ' navbtn--on' : '')} onClick={() => setNav('sessions')}>
            Allenamenti
          </button>
        </nav>
      )}

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
            onOpenSessionLog={openSessionLog}
            onQuickLog={quickLog}
            onCheckin={doCheckin}
          />
        )}

        {state === 'ready' && !logging && nav === 'sessions' && current && (
          <>
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

            <div className="title-row">
              <div>
                <h1 className="session-title">{current.name}</h1>
                <p className="muted small">{current.session_exercise.length} esercizi</p>
              </div>
              <button className="btn-primary sm" onClick={() => setLogging(true)}>
                Registra
              </button>
            </div>

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
          </>
        )}
      </main>
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
