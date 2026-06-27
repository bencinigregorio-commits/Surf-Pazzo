import { createClient } from '@supabase/supabase-js'

// Legge le chiavi dal file .env (mai scritte qui dentro, cosi restano protette).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('Mancano le chiavi Supabase nel file .env')
}

// Questo "client" e' l'oggetto che useremo per leggere/scrivere i dati.
export const supabase = createClient(supabaseUrl, supabaseKey)
