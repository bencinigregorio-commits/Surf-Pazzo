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

// Cerca il primo numero plausibile vicino a una delle parole chiave.
function findNear(text, keywords, { min, max, decimals }) {
  const lines = text.split(/\n+/)
  const numRe = /(\d{1,3}(?:[.,]\d{1,2})?)/g
  const inRange = (n) => n >= min && n <= max

  // 1) stessa riga di una parola chiave
  for (const line of lines) {
    const low = line.toLowerCase()
    if (!keywords.some((k) => low.includes(k))) continue
    const nums = [...line.matchAll(numRe)].map((m) => parseFloat(m[1].replace(',', '.')))
    const good = nums.find((n) => inRange(n) && (!decimals || String(n).includes('.') || max < 20))
    if (good != null) return good
  }
  // 2) riga immediatamente sotto la parola chiave
  for (let i = 0; i < lines.length - 1; i++) {
    if (!keywords.some((k) => lines[i].toLowerCase().includes(k))) continue
    const nums = [...lines[i + 1].matchAll(numRe)].map((m) => parseFloat(m[1].replace(',', '.')))
    const good = nums.find((n) => inRange(n))
    if (good != null) return good
  }
  return null
}

// Estrae { weight, fat_pct, lean_mass, phase_angle } dal testo OCR.
export function parseBiaText(text) {
  const t = text.replace(/[|]/g, ' ')
  const leanRange = { min: 20, max: 90 }
  return {
    weight: findNear(t, ['peso', 'weight'], { min: 35, max: 200 }),
    fat_pct: findNear(t, ['grasso', 'fat', 'pbf', 'bfp', '% grass'], { min: 3, max: 60, decimals: true }),
    // Prima "massa magra / lean body / FFM"; solo se non c'è, ripiega su muscolo/SMM.
    lean_mass:
      findNear(t, ['magra', 'lean body', 'fat free', 'fat-free', 'ffm'], leanRange) ??
      findNear(t, ['muscol', 'muscle', 'smm', 'lean'], leanRange),
    phase_angle: findNear(t, ['fase', 'phase', 'angol', 'angle'], { min: 3, max: 12, decimals: true }),
  }
}
