import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function sendLink(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <div className="auth">
      <img className="auth-logo" src="/icon-192.png" alt="" />
      <h1 className="auth-title">Surf Training</h1>
      <p className="auth-sub">Accedi con la tua email</p>

      {sent ? (
        <div className="auth-sent">
          <p>📨 Ti ho inviato un link a <b>{email}</b>.</p>
          <p className="muted small">Apri la mail e clicca il link per entrare. Puoi tornare qui dopo.</p>
        </div>
      ) : (
        <form className="auth-form" onSubmit={sendLink}>
          <input
            className="input"
            type="email"
            required
            placeholder="latua@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn-primary" disabled={loading || !email}>
            {loading ? 'Invio…' : 'Inviami il link'}
          </button>
          {error && <p className="errdetail">{error}</p>}
        </form>
      )}

      <p className="auth-foot muted small">
        Solo per te. Niente password: ricevi un link sicuro via email.
      </p>
    </div>
  )
}
