# Guida operativa — dal documento all'app (PWA)

> Per chi **non programma**. L'idea: Claude Code scrive il codice, tu fai gli account, incolli le chiavi, clicchi e provi. Ogni fase distingue **TU** da **CLAUDE CODE**.

---

## La regola d'oro (leggi questa prima di tutto)

**Si costruisce a fette, una funzione alla volta — mai "fammi tutta l'app".** È l'errore numero uno e il modo più rapido per impantanarsi. Ogni fetta: Claude Code la scrive → tu la provi → ok → si salva → fetta successiva.

Ordine delle fette (dal design doc):
1. Scheletro + dati (schema Supabase + le 3 sedute visibili)
2. Log (i 3 livelli) + completamento
3. Calendario flessibile + riorganizzazione + fasce
4. Progressione
5. Fatica/recupero + dolore
6. Pre-trip
7. BIA

---

## Chi fa cosa

- **TU:** crei gli account, copi/incolli le chiavi nei posti giusti, clicchi "deploy", provi l'app sul telefono, dai feedback.
- **CLAUDE CODE:** scrive ed edita il codice, esegue i comandi al posto tuo, crea le tabelle del database, ti spiega ogni passo.

Non devi saper programmare. Devi saper **seguire istruzioni e incollare chiavi nel posto giusto.**

---

## Gli strumenti e perché servono

- **Claude Code** — l'AI che scrive l'app sul tuo computer.
- **React + Vite** — l'app vera e propria (React) e lo strumento che la fa girare/compila (Vite).
- **Supabase** — database nel cloud + sincronizzazione tra dispositivi. Serve perché vuoi che i dati non si perdano e siano anche sul telefono.
  - *Alternativa più semplice:* salvare tutto solo nel browser (niente account, niente cloud). Più semplice, ma niente sync e rischi di perdere i dati svuotando la cache. Per il tuo caso Supabase vale la candela.
- **GitHub** — salva la cronologia del codice (non perdi lavoro) e fa da ponte verso Vercel.
- **Vercel** — mette l'app online con un indirizzo web, e la aggiorna in automatico a ogni modifica.
- **PWA** — l'app "installabile": apri l'indirizzo sul telefono, "Aggiungi a Home", e si comporta come un'app vera, anche offline.

---

## Fase 0 — Prerequisiti

- **Account Claude a pagamento** (Pro o Max): Claude Code lo richiede.
- **Installa Claude Code** nel modo più semplice per te:
  - *App desktop* (macOS/Windows) — nessun terminale.
  - *oppure* installer nativo da terminale: `curl -fsSL https://claude.ai/install.sh | bash` (Mac/Linux). Niente Node da gestire.
  - (La via `npm` è per sviluppatori e richiede Node.js 18+: a te non serve.)
- **Crea tre account gratuiti:** GitHub, Supabase, Vercel. Tieni email e password a portata.
- Se mancasse Git o altro, Claude Code te lo dice e ti guida.

---

## Fase 1 — Scheletro in locale

- **TU:** apri Claude Code nella cartella dove vuoi il progetto. Incolla il **primo messaggio** (in fondo a questa guida).
- **CLAUDE CODE:** crea un progetto Vite + React già configurato come PWA, lo avvia in locale e ti mostra il risultato.
- **Risultato atteso:** una pagina che si apre nel browser del tuo computer (su `localhost`). È l'app "in prova", solo sul tuo PC.

---

## Fase 2 — Database (Supabase)

- **TU:** crea un nuovo progetto su Supabase. Nelle impostazioni trovi due cose da copiare: l'**URL del progetto** e l'**anon key**. Le incolli quando Claude Code te lo chiede.
- **CLAUDE CODE:** crea le tabelle a partire dal modello dati del design doc (gli dai `app_design_funzionale.md`), e collega l'app a Supabase.
- **Auth:** sei utente singolo, quindi la teniamo minima (accesso via link email solo per te). Niente complessità da multi-utente.
- ⚠️ **Sicurezza:** le chiavi vanno in un file `.env` che **non** finisce su GitHub. Claude Code lo sa, ma è la cosa numero uno da non sbagliare.

---

## Fase 3 — Le funzioni, a fette

Costruisci nell'ordine della "regola d'oro". Per ogni fetta: Claude Code scrive → provi su `localhost` → feedback → si salva (commit). Non passare oltre finché la fetta non funziona.

---

## Fase 4 — GitHub (salvare la cronologia)

- **TU:** crea un repository **vuoto** su GitHub; copia il suo indirizzo.
- **CLAUDE CODE:** inizializza il versionamento, fa il primo salvataggio (commit) e carica tutto su GitHub (push).
- Da qui in poi non perdi lavoro e abiliti il deploy automatico.

---

## Fase 5 — Vercel (mettere l'app online)

- **TU:** su Vercel scegli "Import" e selezioni il repo GitHub. Poi, nelle **Settings → Environment Variables**, incolli le stesse chiavi Supabase (URL + anon key).
- **VERCEL:** compila l'app e ti dà un **indirizzo pubblico**. A ogni modifica caricata su GitHub, l'app online si aggiorna da sola.

---

## Fase 6 — Sul telefono

- **TU:** apri l'indirizzo Vercel sul telefono → menù del browser → **"Aggiungi alla schermata Home"**. Ora è un'app.
- Provala nell'uso reale, anche offline, e torna da Claude Code per le rifiniture.

---

## Trappole da conoscere (onesto)

- **Chiavi segrete:** mai dentro GitHub. Solo nel `.env` locale e nelle Settings di Vercel.
- **Locale vs online:** `localhost` è la prova sul tuo PC; Vercel è la versione vera, online. Sono due posti diversi.
- **Cache PWA:** a volte il telefono mostra una versione vecchia dopo un aggiornamento. Capita; Claude Code gestisce il "service worker" per ridurlo, ma sappilo.
- **Sicurezza dati (RLS) su Supabase:** va impostata anche se sei solo tu. Claude Code la configura.
- **Voler fare tutto subito:** è la trappola più grande. Fette.

---

## Il primo messaggio da dare a Claude Code (copia-incolla)

> Sto costruendo una PWA personale di allenamento (single-user) con React + Vite + Supabase, da pubblicare su Vercel. Sono un **non-sviluppatore**: spiegami ogni passo in modo semplice e dimmi chiaramente quando devo fare qualcosa io (creare un account, incollare una chiave). Ti darò due documenti: una **specifica funzionale** e un **programma di allenamento**. Per ora **non** costruire tutto. Partiamo dalla **Fase 1**: scaffolda un progetto Vite + React configurato come PWA, fallo girare in locale e mostrami il risultato. Useremo Supabase per i dati e procederemo **a fette, una funzione alla volta**: aspetta sempre il mio ok prima di passare alla fetta successiva.

Poi, quando te li chiede, dagli in quest'ordine:
- `app_design_funzionale.md` → la specifica (cosa fa il sistema, schema dati, logica).
- `programma_surf_completo.md` → i contenuti (sedute, esercizi, cue, progressioni).
- `bia_baseline_2026-06.md` → il primo dato BIA.
