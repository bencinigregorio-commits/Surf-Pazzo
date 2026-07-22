import { useState } from 'react'
import { saveSession } from './queries'

const PAIN_REGIONS = [
  'cervicale/trapezi',
  'spalla',
  'lombare',
  'ginocchio',
  'caviglia',
  'piede',
  'polso',
]

// Converte testo in numero, oppure null se vuoto.
const num = (v) => (v === '' || v == null ? null : Number(v))

// Quali indicatori ha senso chiedere, per tipo di esercizio.
// (il vogatore non chiede kg, il pop-up non chiede carico, ecc.)
const CAMPI_PER_TIPO = {
  load: ['load', 'sets', 'reps', 'rpe', 'quality'],
  ballistic: ['sets', 'reps', 'load', 'rpe', 'quality'],
  skill: ['sets', 'reps', 'duration', 'quality', 'variant'],
  endurance: ['duration', 'distance', 'rpe'],
}

const DEF_CAMPO = {
  load: { label: 'Carico (kg)', type: 'number' },
  sets: { label: 'Serie', type: 'number' },
  reps: { label: 'Reps', type: 'text', placeholder: 'es. 10' },
  rpe: { label: 'RPE (1-10)', type: 'number' },
  quality: { label: 'Qualità (1-5)', type: 'number' },
  duration: { label: 'Durata (min)', type: 'number' },
  distance: { label: 'Distanza (m)', type: 'number' },
  variant: { label: 'Variante / livello', type: 'text', placeholder: 'es. livello 3' },
}

const TIPO_NOTA = {
  endurance: 'Resistenza: conta il volume (durata/distanza), non il carico.',
  skill: 'Tecnica: conta la qualità e la variante, non il peso.',
  ballistic: 'Balistico: prima gesto pulito e veloce, poi eventuale carico.',
}

export default function LogForm({ session, onSaved, onCancel }) {
  const [sessionRpe, setSessionRpe] = useState(null)
  // Stato per esercizio: { done, expanded, load, sets, reps, rpe, quality, pain_region, pain_severity, notes }
  const [rows, setRows] = useState(() =>
    Object.fromEntries(
      session.session_exercise.map((se) => [se.exercise.id, { done: false, expanded: false }])
    )
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const update = (id, patch) =>
    setRows((r) => ({ ...r, [id]: { ...r[id], ...patch } }))

  const doneCount = Object.values(rows).filter((r) => r.done).length
  const total = session.session_exercise.length

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      // Esercizi da salvare: quelli spuntati o con almeno un dettaglio compilato.
      const exercises = session.session_exercise
        .map((se) => {
          const r = rows[se.exercise.id]
          const hasDetail =
            r.load || r.sets || r.reps || r.rpe || r.quality ||
            r.duration || r.distance || r.variant || r.pain_region || r.notes
          if (!r.done && !hasDetail) return null
          return {
            exercise_id: se.exercise.id,
            completed: 'full',
            load: num(r.load),
            sets: num(r.sets),
            reps: r.reps || null,
            rpe: num(r.rpe),
            technical_quality: num(r.quality),
            duration_min: num(r.duration),
            distance_m: num(r.distance),
            variant: r.variant || null,
            pain_region: r.pain_region || null,
            pain_severity: r.pain_region ? num(r.pain_severity ?? 0) : null,
            notes: r.notes || null,
          }
        })
        .filter(Boolean)

      const status = doneCount > 0 && doneCount < total ? 'partial' : 'done'

      await saveSession({
        session_code: session.code,
        status,
        session_rpe: sessionRpe,
        exercises,
      })
      onSaved()
    } catch (err) {
      setError(err.message ?? String(err))
      setSaving(false)
    }
  }

  return (
    <div>
      <button className="link" onClick={onCancel}>← indietro</button>
      <h1 className="session-title">Registra: {session.name}</h1>

      {/* Livello ultra-rapido: voto fatica di seduta */}
      <div className="panel soft">
        <label className="field-label">Fatica della seduta (RPE)</label>
        <div className="rpe">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              className={'rpe-btn' + (sessionRpe === n ? ' rpe-btn--on' : '')}
              onClick={() => setSessionRpe(sessionRpe === n ? null : n)}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="muted small">Facoltativo. 1 = leggerissima, 10 = massimale.</p>
      </div>

      {/* Livello rapido/completo: esercizi */}
      <p className="field-label" style={{ marginTop: 18 }}>
        Esercizi fatti <span className="muted">({doneCount}/{total})</span>
      </p>
      <ul className="exlist">
        {session.session_exercise.map((se) => {
          const id = se.exercise.id
          const r = rows[id]
          return (
            <li key={id} className={'excard' + (r.done ? ' excard--done' : '')}>
              <div className="logrow">
                <label className="check">
                  <input
                    type="checkbox"
                    checked={r.done}
                    onChange={(e) => update(id, { done: e.target.checked })}
                  />
                  <span className="exname">{se.exercise.name}</span>
                </label>
                <button className="link small" onClick={() => update(id, { expanded: !r.expanded })}>
                  {r.expanded ? 'chiudi' : 'dettagli'}
                </button>
              </div>

              {r.expanded && (
                <div className="details">
                  {TIPO_NOTA[se.exercise.progression_type] && (
                    <p className="muted small" style={{ marginBottom: 8 }}>
                      {TIPO_NOTA[se.exercise.progression_type]}
                    </p>
                  )}
                  <div className="grid2">
                    {(CAMPI_PER_TIPO[se.exercise.progression_type] ?? CAMPI_PER_TIPO.load).map((k) => (
                      <Field
                        key={k}
                        label={DEF_CAMPO[k].label}
                        type={DEF_CAMPO[k].type}
                        placeholder={DEF_CAMPO[k].placeholder}
                        value={r[k]}
                        onChange={(v) => update(id, { [k]: v })}
                      />
                    ))}
                    <div className="field">
                      <label className="field-label">Dolore</label>
                      <select
                        className="input"
                        value={r.pain_region || ''}
                        onChange={(e) => update(id, { pain_region: e.target.value })}
                      >
                        <option value="">nessuno</option>
                        {PAIN_REGIONS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    {r.pain_region && (
                      <Field label="Intensità dolore (0-3)" value={r.pain_severity} onChange={(v) => update(id, { pain_severity: v })} type="number" />
                    )}
                  </div>
                  <Field label="Note" value={r.notes} onChange={(v) => update(id, { notes: v })} placeholder="opzionale" />
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {error && <p className="errdetail">{error}</p>}

      <div className="actions">
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Salvo…' : 'Salva seduta'}
        </button>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      <input
        className="input"
        type={type}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
