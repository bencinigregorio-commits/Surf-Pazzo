import { useState } from 'react'
import { updateExercise, updateSessionExercise, addSessionExercise, removeSessionExercise } from './queries'

// Modifica gli esercizi di una seduta: nome, serie/carico (prescrizione), nota;
// aggiungi e rimuovi esercizi. Salva tutto insieme.
export default function EditSession({ session, onSaved, onCancel }) {
  const [rows, setRows] = useState(() =>
    session.session_exercise.map((se) => ({
      seId: se.id,
      exId: se.exercise.id,
      name: se.exercise.name,
      prescription: se.prescription ?? '',
      cue: se.exercise.cue ?? '',
      isNew: false,
      deleted: false,
    }))
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (i, patch) => setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)))
  const addRow = () =>
    setRows((r) => [...r, { seId: null, exId: null, name: '', prescription: '', cue: '', isNew: true, deleted: false }])
  const delRow = (i) => setRows((r) => r.map((row, idx) => (idx === i ? { ...row, deleted: true } : row)))

  async function save() {
    setSaving(true)
    setError('')
    try {
      let order = 1
      for (const row of rows) {
        if (row.deleted) {
          if (row.seId) await removeSessionExercise(row.seId)
          continue
        }
        if (!row.name.trim()) continue
        if (row.isNew) {
          await addSessionExercise(session.id, {
            name: row.name.trim(),
            prescription: row.prescription,
            cue: row.cue,
            order_index: order,
          })
        } else {
          await updateExercise(row.exId, { name: row.name.trim(), cue: row.cue || null })
          await updateSessionExercise(row.seId, { prescription: row.prescription || null, order_index: order })
        }
        order++
      }
      onSaved()
    } catch (e) {
      setError(e.message ?? String(e))
      setSaving(false)
    }
  }

  return (
    <div className="screen">
      <button className="link" onClick={onCancel}>← annulla</button>
      <h1 className="session-title">Modifica: Palestra {session.code}</h1>
      <p className="muted small">Cambia nome, serie/carico e note. Aggiungi o rimuovi esercizi.</p>

      <ol className="exlist">
        {rows.map((row, i) =>
          row.deleted ? null : (
            <li key={i} className="excard">
              <input
                className="input"
                value={row.name}
                placeholder="Nome esercizio"
                onChange={(e) => set(i, { name: e.target.value })}
              />
              <div className="grid2" style={{ marginTop: 8 }}>
                <input
                  className="input"
                  value={row.prescription}
                  placeholder="es. 3 × 8 @ 14 kg"
                  onChange={(e) => set(i, { prescription: e.target.value })}
                />
                <input
                  className="input"
                  value={row.cue}
                  placeholder="Nota (facoltativa)"
                  onChange={(e) => set(i, { cue: e.target.value })}
                />
              </div>
              <button className="link small" onClick={() => delRow(i)}>rimuovi</button>
            </li>
          )
        )}
      </ol>

      <button className="dbtn" onClick={addRow}>+ Aggiungi esercizio</button>

      {error && <p className="errdetail">{error}</p>}

      <div className="actions">
        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Salvo…' : 'Salva modifiche'}
        </button>
      </div>
    </div>
  )
}
