// Lettura automatica dei numeri da una foto/screenshot di BIA.
// OCR client-side (Tesseract) + parsing per estrarre i 4 essenziali.
// È best-effort: precompila ciò che trova, l'utente controlla e corregge.

// Esegue l'OCR e restituisce il testo grezzo. Import dinamico: il motore
// (qualche MB) si scarica solo la prima volta che serve.
export async function readImageText(file, onProgress) {
  const { default: Tesseract } = await import('tesseract.js')
  const { data } = await Tesseract.recognize(file, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) onProgress(Math.round(m.progress * 100))
    },
  })
  return data.text || ''
}

// Cerca il primo numero plausibile DOPO una delle parole chiave.
// (dopo, così non prende il numero di elenco "6." a inizio riga)
function findNear(text, keywords, { min, max, decimals }) {
  const lines = text.split(/\n+/)
  const numRe = /\d+(?:[.,]\d{1,2})?/g
  const inRange = (n) => n >= min && n <= max
  const okDec = (n) => !decimals || String(n).includes('.') || max < 20

  // 1) sulla stessa riga, numero dopo la parola chiave
  for (const line of lines) {
    const low = line.toLowerCase()
    const kw = keywords.find((k) => low.includes(k))
    if (!kw) continue
    const after = low.indexOf(kw) + kw.length
    for (const m of line.matchAll(numRe)) {
      if (m.index < after) continue
      const n = parseFloat(m[0].replace(',', '.'))
      if (inRange(n) && okDec(n)) return n
    }
  }
  // 2) riga immediatamente sotto la parola chiave
  for (let i = 0; i < lines.length - 1; i++) {
    if (!keywords.some((k) => lines[i].toLowerCase().includes(k))) continue
    for (const m of lines[i + 1].matchAll(numRe)) {
      const n = parseFloat(m[0].replace(',', '.'))
      if (inRange(n) && okDec(n)) return n
    }
  }
  return null
}

// Estrae { weight, fat_pct, lean_mass, phase_angle } dal testo OCR.
export function parseBiaText(text) {
  const t = text.replace(/[|]/g, ' ')
  const leanRange = { min: 20, max: 120 }
  return {
    weight: findNear(t, ['weight', 'peso'], { min: 35, max: 250 }),
    // % grasso: prima la "percentuale" (per non prendere la massa grassa in kg).
    fat_pct:
      findNear(t, ['percentage', 'body fat perc', 'fat perc', 'pbf', 'bfp', '% grass', 'percentuale grass'], { min: 3, max: 60, decimals: true }) ??
      findNear(t, ['body fat', 'grasso corpore'], { min: 3, max: 60, decimals: true }),
    // Massa magra = Lean Body Mass / FFM (non la muscolare scheletrica).
    lean_mass:
      findNear(t, ['lean body', 'massa magra', 'fat free', 'fat-free', 'ffm'], leanRange) ??
      findNear(t, ['lean'], leanRange),
    phase_angle: findNear(t, ['phase angle', 'angolo di fase', 'fase'], { min: 3, max: 12, decimals: true }),
    // Bonus disponibili sull'Evolt 360 (e su molti device):
    fat_mass: findNear(t, ['body fat mass', 'massa grassa'], { min: 2, max: 80 }),
    tbw: findNear(t, ['total body water', 'acqua total'], { min: 20, max: 90 }),
    bmr: findNear(t, ['bmr', 'basal metab', 'metabolismo bas'], { min: 800, max: 4500 }),
    visceral: findNear(t, ['visceral fat level', 'grasso viscerale', 'livello grasso'], { min: 1, max: 30 }),
  }
}
