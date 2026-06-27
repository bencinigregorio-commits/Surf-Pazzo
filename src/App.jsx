import { useEffect, useState } from 'react'
import { getBackboneSessions, getProgressionData } from './queries'
import { computeSuggestion, lastLogSummary, SUGGEST_META } from './progression'
import { isoDate } from './week'
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
  const [logging, setLogging] = useState(false) // modulo di registrazione aperto
  const [toast, setToast] = useState('')
  const [progByEx, setProgByEx] = useState({})

  useEffect(() => {
    getBackboneSessions()
      .then((data) => {
        if (data.length === 0) {
          setState('empty')
        } else {
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
    refreshProgression()
  }, [])

  function refreshProgression() {
    getProgressionData()
      .then(setProgByEx)
      .catch(() => setProgByEx({}))
  }

  const current = sessions.find((s) => s.code === active)

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  // Apre il modulo di registrazione per una palestra (da "Oggi cosa fai?").
  function openSessionLog(code) {
    setActive(code)
    setLogging(true)
    setNav('sessions')
  }

  function handleSaved() {
    setLogging(false)
    setNav('week')
    showToast('Seduta registrata ✓')
    refreshProgression()
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
          <WeekView onOpenSessionLog={openSessionLog} onToast={showToast} />
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
                  <ProgBadge exercise={se.exercise} history={progByEx[se.exercise.id]} />
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
function ProgBadge({ exercise, history }) {
  const sug = computeSuggestion(exercise, history ?? [], TODAY_ISO)
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
