import { useState } from 'react'
import { stimaCalorie, DURATA_TIPICA } from './calories'
import { Icon } from './Icons'

const META = {
  corsa: { label: 'Corsa', icon: 'corsa', campi: ['durata', 'distanza', 'battito'] },
  calcetto: { label: 'Calcetto', icon: 'ball', campi: ['durata'] },
  beachvolley: { label: 'Beach volley', icon: 'ball', campi: ['durata'] },
}

const num = (v) => (v === '' || v == null ? null : Number(v))

export default function QuickActivityForm({ code, pesoKg, onSave, onCancel }) {
  const meta = META[code] ?? { label: code, icon: 'wave', campi: ['durata'] }
  const [durata, setDurata] = useState(String(DURATA_TIPICA[code] ?? ''))
  const [distanza, setDistanza] = useState('')
  const [battito, setBattito] = useState('')
  const [rpe, setRpe] = useState(null)
  const [calorie, setCalorie] = useState('')
  const [calorieTocche, setCalorieTocche] = useState(false)
  const [saving, setSaving] = useState(false)

  // Stima automatica finché non le scrivi a mano.
  const stimate = stimaCalorie(code, num(durata), pesoKg)
  const calorieMostrate = calorieTocche ? calorie : (stimate ?? '')

  async function save() {
    setSaving(true)
    await onSave({
      duration_min: num(durata),
      distance_km: meta.campi.includes('distanza') ? num(distanza) : null,
      avg_hr: meta.campi.includes('battito') ? num(battito) : null,
      calories: num(calorieMostrate),
      session_rpe: rpe,
    })
  }

  return (
    <div className="screen">
      <button className="link" onClick={onCancel}>← annulla</button>
      <h1 className="session-title">
        <Icon name={meta.icon} size={26} /> {meta.label}
      </h1>

      <section className="card">
        <h2 className="card-title">Dati attività</h2>
        <div className="grid2">
          <Campo label="Durata (min)" value={durata} onChange={setDurata} />
          {meta.campi.includes('distanza') && (
            <Campo label="Distanza (km)" value={distanza} onChange={setDistanza} step="0.1" />
          )}
          {meta.campi.includes('battito') && (
            <Campo label="Battito medio (bpm)" value={battito} onChange={setBattito} />
          )}
          <Campo
            label="Calorie"
            value={calorieMostrate}
            onChange={(v) => { setCalorieTocche(true); setCalorie(v) }}
          />
        </div>
        {!calorieTocche && stimate != null && (
          <p className="muted small">🔥 Stima automatica su {pesoKg} kg. Puoi correggerla (es. dal tuo orologio).</p>
        )}
      </section>

      <section className="card">
        <h2 className="card-title">Fatica percepita (RPE)</h2>
        <div className="rpe">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              className={'rpe-btn' + (rpe === n ? ' rpe-btn--on' : '')}
              onClick={() => setRpe(rpe === n ? null : n)}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="muted small">Facoltativo. Insieme alla durata determina il carico della settimana.</p>
      </section>

      <div className="actions">
        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Salvo…' : 'Salva attività'}
        </button>
      </div>
    </div>
  )
}

function Campo({ label, value, onChange, step }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      <input
        className="input"
        type="number"
        step={step}
        inputMode="decimal"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
