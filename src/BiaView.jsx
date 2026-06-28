import { useState } from 'react'
import {
  PHASES, ESSENTIALS, computeTrend, biaAlerts, suggestedPhase, daysSinceLastScan, isComparable,
} from './bia'
import { isoDate } from './week'

const num = (v) => (v === '' || v == null ? null : Number(v))
const TODAY = isoDate(new Date())

function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso + 'T00:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: '2-digit' })
}

export default function BiaView({ scans, goalPhase, preTrip, onAddScan, onSetPhase }) {
  const { latest, deltas, comparableCount } = computeTrend(scans)
  const alerts = biaAlerts(scans, goalPhase, preTrip)
  const phaseHint = suggestedPhase(scans, goalPhase)
  const sinceLast = daysSinceLastScan(scans, TODAY)

  return (
    <div className="screen">
      <div>
        <h1 className="session-title">Composizione corporea</h1>
        <p className="muted small">
          Conta il trend, non il singolo numero. Misure standardizzate ogni 4–8 settimane.
        </p>
      </div>

      {/* Fase obiettivo */}
      <section className="card">
        <h2 className="card-title">Fase obiettivo</h2>
        <div className="phase-grid">
          {PHASES.map((p) => (
            <button
              key={p.key}
              className={'phase-btn' + (goalPhase === p.key ? ' phase-btn--on' : '')}
              onClick={() => onSetPhase(p.key)}
            >
              <b>{p.label}</b>
              <span>{p.desc}</span>
            </button>
          ))}
        </div>
        {phaseHint && <p className="bia-suggest">💡 {phaseHint}</p>}
      </section>

      {/* Essenziali ultima scansione */}
      <section className="card">
        <div className="card-head">
          <h2 className="card-title">Ultima scansione</h2>
          {latest && <span className="muted small">{fmtDate(latest.scan_date)}</span>}
        </div>
        {!latest ? (
          <p className="muted small">Nessuna scansione registrata. Aggiungine una qui sotto.</p>
        ) : (
          <div className="ess-grid">
            {ESSENTIALS.map((e) => (
              <div key={e.key} className="ess">
                <span className="ess-label">{e.label}</span>
                <span className="ess-val">
                  {latest[e.key] != null ? `${latest[e.key]} ${e.unit}` : '—'}
                </span>
                {deltas[e.key] != null && deltas[e.key] !== 0 && (
                  <span className="ess-delta">
                    {deltas[e.key] > 0 ? '▲' : '▼'} {Math.abs(deltas[e.key])} {e.unit}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        {latest && comparableCount < 2 && (
          <p className="muted small">Serve almeno una seconda scansione confrontabile per vedere il trend.</p>
        )}
      </section>

      {/* Avvisi advisory */}
      {alerts.map((a, i) => (
        <p key={i} className={'bia-alert bia-alert--' + a.tone}>{a.text}</p>
      ))}

      {/* Aggiungi scansione */}
      <AddScanForm scans={scans} onAddScan={onAddScan} sinceLast={sinceLast} />

      {/* Storico */}
      {scans.length > 0 && (
        <section className="card">
          <div className="card-head"><h2 className="card-title">Storico</h2></div>
          <ul className="loglist">
            {scans.map((s) => (
              <li key={s.id} className="logitem">
                <span className="logdate">{fmtDate(s.scan_date)}</span>
                <span className="logmeta">
                  {s.weight != null ? `${s.weight} kg` : ''}
                  {s.fat_pct != null ? ` · ${s.fat_pct}%` : ''}
                  {!s.comparable ? ' · non confrontabile' : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function AddScanForm({ scans, onAddScan, sinceLast }) {
  const [f, setF] = useState({ scan_date: TODAY })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))

  async function save() {
    setSaving(true)
    const scan = {
      scan_date: f.scan_date || TODAY,
      device: f.device || null,
      conditions: f.conditions || null,
      weight: num(f.weight),
      fat_pct: num(f.fat_pct),
      lean_mass: num(f.lean_mass),
      phase_angle: num(f.phase_angle),
      fat_mass: num(f.fat_mass),
      tbw: num(f.tbw),
      bmr: num(f.bmr),
      visceral: num(f.visceral),
      notes: f.notes || null,
      comparable: isComparable(scans, f.device || null, f.conditions || null),
    }
    await onAddScan(scan)
    setF({ scan_date: TODAY })
    setSaving(false)
  }

  return (
    <details className="card bia-add">
      <summary>➕ Aggiungi una scansione</summary>

      {sinceLast != null && sinceLast < 28 && (
        <p className="muted small">Hai una scansione di {sinceLast} giorni fa: più spesso è rumore, non informazione.</p>
      )}

      <div className="grid2">
        <Field label="Data" type="date" value={f.scan_date} onChange={(v) => set('scan_date', v)} />
        <Field label="Dispositivo" value={f.device} onChange={(v) => set('device', v)} placeholder="es. InBody palestra" />
      </div>
      <Field label="Condizioni" value={f.conditions} onChange={(v) => set('conditions', v)} placeholder="es. a digiuno, mattina" />

      <p className="field-label" style={{ marginTop: 8 }}>Essenziali</p>
      <div className="grid2">
        <Field label="Peso (kg)" type="number" value={f.weight} onChange={(v) => set('weight', v)} />
        <Field label="% grasso" type="number" value={f.fat_pct} onChange={(v) => set('fat_pct', v)} />
        <Field label="Massa magra (kg)" type="number" value={f.lean_mass} onChange={(v) => set('lean_mass', v)} />
        <Field label="Angolo di fase (°)" type="number" value={f.phase_angle} onChange={(v) => set('phase_angle', v)} />
      </div>

      <details className="bia-more">
        <summary>Altri dati (facoltativi)</summary>
        <div className="grid2">
          <Field label="Massa grassa (kg)" type="number" value={f.fat_mass} onChange={(v) => set('fat_mass', v)} />
          <Field label="Acqua totale (l)" type="number" value={f.tbw} onChange={(v) => set('tbw', v)} />
          <Field label="Metab. basale" type="number" value={f.bmr} onChange={(v) => set('bmr', v)} />
          <Field label="Grasso viscerale" type="number" value={f.visceral} onChange={(v) => set('visceral', v)} />
        </div>
        <Field label="Note" value={f.notes} onChange={(v) => set('notes', v)} placeholder="opzionale" />
      </details>

      <div className="actions">
        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Salvo…' : 'Salva scansione'}
        </button>
      </div>
    </details>
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
