// Set di icone "a linea" coerenti (stroke = currentColor), riusate in tutta l'app.
const PATHS = {
  calendar: (
    <>
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" />
    </>
  ),
  wave: (
    <>
      <path d="M2 9c3-3 5 3 8 0s5-3 8 0 4 0 4 0" />
      <path d="M2 14c3-3 5 3 8 0s5-3 8 0 4 0 4 0" />
    </>
  ),
  body: (
    <>
      <circle cx="12" cy="4.5" r="2" />
      <path d="M12 7v8M5 9h14M9 21l3-6 3 6" />
    </>
  ),
  chart: (
    <>
      <path d="M5 21V10M12 21V4M19 21v-7" />
    </>
  ),
  dumbbell: (
    <>
      <path d="M3 9v6M6 7.5v9M18 7.5v9M21 9v6M6 12h12" />
    </>
  ),
  run: (
    <>
      <circle cx="13" cy="4.5" r="1.8" />
      <path d="M11 8l-3 3 3 2 1 5M11 8l4 1 2 3 3 1M9 21l2-3" />
    </>
  ),
  ball: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7l3.5 2.5-1.3 4.2H9.8L8.5 9.5 12 7zM12 3v4M3.5 9.5l5 .1M20.5 9.5l-5 .1M7 20l1.8-5M17 20l-1.8-5" />
    </>
  ),
  yoga: (
    <>
      <circle cx="12" cy="4.5" r="2" />
      <path d="M12 7v5M6 10c2 1.5 10 1.5 12 0M8.5 20l3.5-8 3.5 8" />
    </>
  ),
  balance: (
    <>
      <path d="M4 16c3-2.5 5 2.5 8 0s5-2.5 8 0" />
      <ellipse cx="12" cy="19.5" rx="8" ry="1.6" />
      <circle cx="12" cy="6" r="1.6" />
      <path d="M12 8v4" />
    </>
  ),
  recovery: (
    <>
      <path d="M4.5 9a8 8 0 0 1 13-2.5L20 9M19.5 15a8 8 0 0 1-13 2.5L4 15" />
      <path d="M20 5v4h-4M4 19v-4h4" />
    </>
  ),
  rest: (
    <>
      <path d="M3 18v-5a2 2 0 0 1 2-2h11a4 4 0 0 1 4 4v3M3 14h18M3 18v2M21 18v2" />
      <path d="M7 11V8.5A1.5 1.5 0 0 1 8.5 7h2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  chevron: <path d="M9 6l6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  flame: (
    <path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-1.5.5-2.5 1.2-3.3C9.5 9 10 7 9 5c2 .5 2.5 1.5 3 2 .3-1.5 0-3 0-4z" />
  ),
  logout: <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11" />,
}

// Icone personalizzate (neon) fornite dall'utente.
const CUSTOM = {
  settimana: '/icons/settimana.png',
  training: '/icons/training.png',
  corpo: '/icons/corpo.png',
  forza: '/icons/forza.png',
  corsa: '/icons/corsa.png',
  mobilita: '/icons/mobilita.png',
  balance: '/icons/balance.png',
  recupero: '/icons/recupero.png',
  riposo: '/icons/riposo.png',
  stats: '/icons/stats.png',
}

export function Icon({ name, size = 22, className, style }) {
  if (CUSTOM[name]) {
    return <img src={CUSTOM[name]} width={size} height={size} className={className} style={style} alt="" />
  }
  const path = PATHS[name]
  if (!path) return null
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {path}
    </svg>
  )
}
