import { supabase } from './supabaseClient'

// Errore "morbido" quando le tabelle non esistono ancora (script SQL non eseguito).
function throwIfMissingTables(error) {
  const tablesMissing =
    error.code === 'PGRST205' || /Could not find the table/i.test(error.message)
  if (tablesMissing) {
    const e = new Error('TABLES_MISSING')
    e.tablesMissing = true
    throw e
  }
  throw error
}

// Legge le 3 sedute portanti (A, B, C) con dentro i loro esercizi.
export async function getBackboneSessions() {
  const { data, error } = await supabase
    .from('session_template')
    .select(
      `code, name,
       session_exercise (
         order_index,
         prescription,
         exercise (
           id, name, progression_type, cue, default_reps, load_step, body_regions,
           exercise_alternative ( alt_name, alt_prescription, reason, order_index )
         )
       )`
    )
    .in('code', ['A', 'B', 'C'])

  if (error) throwIfMissingTables(error)

  const order = { A: 0, B: 1, C: 2 }
  return (data ?? [])
    .sort((a, b) => order[a.code] - order[b.code])
    .map((s) => ({
      ...s,
      session_exercise: [...(s.session_exercise ?? [])].sort(
        (a, b) => a.order_index - b.order_index
      ),
    }))
}

// Salva una seduta registrata.
// payload = { session_code, status, session_rpe, notes, exercises: [{ exercise_id, ...campi }] }
export async function saveSession(payload) {
  const { exercises, ...day } = payload

  // 1) crea la "seduta del giorno"
  const record = {
    session_code: day.session_code,
    status: day.status ?? 'done',
    session_rpe: day.session_rpe ?? null,
    notes: day.notes ?? null,
  }
  if (day.log_date) record.log_date = day.log_date

  const { data: dayLog, error: dayError } = await supabase
    .from('day_log')
    .insert(record)
    .select()
    .single()

  if (dayError) throwIfMissingTables(dayError)

  // 2) se ci sono esercizi col dettaglio, li aggiungiamo
  if (exercises && exercises.length > 0) {
    const rows = exercises.map((ex) => ({ day_log_id: dayLog.id, ...ex }))
    const { error: exError } = await supabase.from('exercise_log').insert(rows)
    if (exError) throwIfMissingTables(exError)
  }

  return dayLog
}

// Check-in soggettivo di fatica.
export async function saveCheckin(state) {
  const { error } = await supabase.from('week_checkin').insert({ state })
  if (error) throwIfMissingTables(error)
}

export async function getLatestCheckin() {
  const { data, error } = await supabase
    .from('week_checkin')
    .select('state, checkin_date')
    .order('created_at', { ascending: false })
    .limit(1)
  if (error) throwIfMissingTables(error)
  return data?.[0] ?? null
}

// Attività registrate in un intervallo di date (per la vista settimana).
export async function getWeekLogs(startISO, endISO) {
  const { data, error } = await supabase
    .from('day_log')
    .select('id, log_date, session_code, status, session_rpe, exercise_log(id)')
    .gte('log_date', startISO)
    .lte('log_date', endISO)
    .order('log_date', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throwIfMissingTables(error)

  return (data ?? []).map((d) => ({ ...d, exercise_count: d.exercise_log?.length ?? 0 }))
}

// Storico dei log per esercizio (per i consigli di progressione).
// Restituisce una mappa: exercise_id -> array di log ordinati dal più recente.
export async function getProgressionData() {
  const { data, error } = await supabase
    .from('exercise_log')
    .select(
      'exercise_id, completed, load, sets, reps, rpe, technical_quality, pain_region, pain_severity, day_log ( log_date )'
    )
    .limit(500)

  if (error) throwIfMissingTables(error)

  const byEx = {}
  for (const r of data ?? []) {
    const log_date = r.day_log?.log_date ?? null
    ;(byEx[r.exercise_id] ??= []).push({ ...r, log_date })
  }
  for (const id in byEx) {
    byEx[id].sort((a, b) => (b.log_date ?? '').localeCompare(a.log_date ?? ''))
  }
  return byEx
}

// Storico recente delle sedute registrate (con conteggio esercizi).
export async function getRecentLogs() {
  const { data, error } = await supabase
    .from('day_log')
    .select('id, log_date, session_code, status, session_rpe, exercise_log(id)')
    .order('log_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) throwIfMissingTables(error)

  return (data ?? []).map((d) => ({
    ...d,
    exercise_count: d.exercise_log?.length ?? 0,
  }))
}
