import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('email') // email | code
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function sendCode(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) setError(error.message)
    else setStep('code')
    setLoading(false)
  }

  async function verify(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: 'email' })
    if (error) setError('Codice non valido o scaduto. Richiedine uno nuovo.')
    setLoading(false)
    // Se va a buon fine, App rileva la sessione e mostra l'app.
  }

  return (
    <div className="auth">
      <img className="auth-logo" src="/icon-192.png" alt="" />
      <h1 className="auth-title">Surf Training</h1>

      {step === 'email' ? (
        <>
          <p className="auth-sub">Accedi con la tua email</p>
          <form className="auth-form" onSubmit={sendCode}>
            <input
              className="input"
              type="email"
              required
              placeholder="latua@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn-primary" disabled={loading || !email}>
              {loading ? 'Invio…' : 'Inviami il codice'}
            </button>
            {error && <p className="errdetail">{error}</p>}
          </form>
        </>
      ) : (
        <>
          <p className="auth-sub">Inserisci il codice inviato a<br /><b>{email}</b></p>
          <form className="auth-form" onSubmit={verify}>
            <input
              className="input auth-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              placeholder="••••••"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
            />
            <button className="btn-primary" disabled={loading || code.length < 4}>
              {loading ? 'Verifico…' : 'Entra'}
            </button>
            {error && <p className="errdetail">{error}</p>}
          </form>
          <button className="link" onClick={() => { setStep('email'); setCode(''); setError('') }}>
            ← cambia email
          </button>
        </>
      )}

      <p className="auth-foot muted small">
        Niente password: ricevi un codice via email, lo digiti qui, ed entri.
      </p>
    </div>
  )
}
