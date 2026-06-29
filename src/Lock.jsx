import { useState } from 'react'

// Codice di accesso dell'app (modificabile qui). Repo privato: ok tenerlo qui.
export const ACCESS_CODE = '1506'

export default function Lock({ onUnlock }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)

  function submit(e) {
    e.preventDefault()
    if (code === ACCESS_CODE) {
      localStorage.setItem('surf_ok', '1')
      onUnlock()
    } else {
      setError(true)
      setCode('')
    }
  }

  return (
    <div className="auth">
      <img className="auth-logo" src="/icon-192.png" alt="" />
      <h1 className="auth-title">Surf Training</h1>
      <p className="auth-sub">Inserisci il codice</p>

      <form className="auth-form" onSubmit={submit}>
        <input
          className="input auth-code"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          placeholder="••••"
          value={code}
          onChange={(e) => { setError(false); setCode(e.target.value.replace(/\D/g, '').slice(0, 8)) }}
        />
        <button className="btn-primary" disabled={code.length < 4}>Entra</button>
        {error && <p className="errdetail">Codice errato. Riprova.</p>}
      </form>

      <p className="auth-foot muted small">App personale. Inserisci il codice per accedere.</p>
    </div>
  )
}
