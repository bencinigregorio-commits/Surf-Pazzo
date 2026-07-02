import { useState } from 'react'
import { Icon } from './Icons'

const CONTEXTS = [
  { key: 'generico', label: 'Generico', icon: 'mobilita' },
  { key: 'calcio', label: 'Calcio', icon: 'ball' },
  { key: 'corsa', label: 'Corsa', icon: 'corsa' },
  { key: 'A', label: 'Palestra A', icon: 'forza' },
  { key: 'B', label: 'Palestra B', icon: 'forza' },
  { key: 'C', label: 'Palestra C', icon: 'forza' },
]

export default function MobilityView({ mobility, onDone }) {
  const [ctx, setCtx] = useState('generico')

  const items = mobility.filter((m) => m.context === ctx)
  const pre = items.filter((i) => i.phase === 'pre').sort((a, b) => a.order_index - b.order_index)
  const post = items.filter((i) => i.phase === 'post').sort((a, b) => a.order_index - b.order_index)

  return (
    <div className="screen">
      <div>
        <h1 className="session-title">Mobilità & Stretching</h1>
        <p className="muted small">Scegli il contesto: riscaldamento prima, stretching dopo.</p>
      </div>

      <div className="ctxrow">
        {CONTEXTS.map((c) => (
          <button
            key={c.key}
            className={'ctxchip' + (ctx === c.key ? ' ctxchip--on' : '')}
            onClick={() => setCtx(c.key)}
          >
            <Icon name={c.icon} size={22} />
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      <MobBlock title="Riscaldamento — prima" items={pre} />
      <MobBlock title="Stretching — dopo" items={post} />

      <button className="btn-primary" onClick={onDone}>Segna mobilità fatta</button>
    </div>
  )
}

function MobBlock({ title, items }) {
  return (
    <section className="card">
      <h2 className="card-title">{title}</h2>
      {items.length === 0 ? (
        <p className="muted small">
          Nessuna scheda caricata per questo contesto. Generala e mandamela: la carico io.
        </p>
      ) : (
        <ol className="exlist">
          {items.map((it, i) => (
            <li key={i} className="excard">
              <div className="exhead">
                <span className="exname">{it.name}</span>
                {it.prescription && <span className="exresc">{it.prescription}</span>}
              </div>
              {it.cue && <div className="exmeta"><span className="excue">{it.cue}</span></div>}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
