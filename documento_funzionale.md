# Surf Training — Come è fatta e come funziona (stato attuale)

> Documento per un lettore **non tecnico**. Descrive l'app così com'è oggi: cosa vedi, come si usa, quali dati salva, cosa fa già e cosa manca, e dove ci siamo discostati dal progetto iniziale (con il motivo).

---

## 1. Cos'è, in due righe

Un'app personale (solo per te) per gestire l'allenamento in vista del surf: ti dice **cosa fare oggi**, registri **cosa hai fatto**, e lei tiene il conto della settimana, ti consiglia **quando aumentare i carichi**, ti protegge da **stanchezza e infortuni**, e traccia la **composizione corporea**.

- È una **web-app installabile** (PWA): la apri da un indirizzo internet e la puoi "aggiungere alla Home" del telefono, dove si comporta come un'app normale.
- Indirizzo: **https://surf-pazzo.vercel.app** · Accesso con **codice**.
- I dati vivono nel cloud (Supabase), quindi sono al sicuro e sincronizzati tra i dispositivi.

---

## 2. Come si accede

All'apertura compare una schermata con il logo e un campo **codice**. Inserisci il tuo codice e sei dentro. L'app **si ricorda** di te su quel dispositivo, quindi il codice lo digiti in pratica una volta sola (finché non premi "blocca" o cambi telefono).

---

## 3. Le schermate (le 4 schede in basso)

In fondo trovi quattro linguette con le tue icone: **Settimana · Training · Mobilità · Corpo**.

### 🗓️ Settimana (la home)
La schermata principale, quella che apri ogni giorno. Contiene, dall'alto:

1. **Card "OGGI"** — la proposta del giorno (es. *"Oggi: Palestra A"*), con durata stimata, focus surf e un pulsante grande per **iniziare/registrare** la seduta. Se la proposta è una corsa/calcetto propone quelli; se è giornata libera te lo dice.
2. **Promemoria fase** (quando serve) — se le tue scansioni corporee suggeriscono un cambio di fase obiettivo, compare un avviso con un pulsante per applicarlo.
3. **Carico settimana** — un **anello** colorato (🟢 verde / 🟡 giallo / 🔴 rosso) con un punteggio, che dice quanto è carica la tua settimana. Sotto, tre pulsanti **"Come ti senti?"** (Fresco / Ok / Cotto): il tuo parere **vince** sul numero.
4. **Striscia della settimana** (Lun→Dom) — cosa hai fatto ogni giorno, con le icone delle attività. **Tocca un giorno** per vederne il dettaglio e **rimuovere** un'attività registrata per sbaglio.
5. **Progresso settimana** — quattro riquadri (Portanti, Mobilità, Cardio, Balance) con mini-grafici, e il totale **🔥 calorie** della settimana.
6. **Aggiungi attività** — una griglia di pulsanti per registrare al volo: Forza A/B/C, Campagna, Corsa, Calcetto, Beach volley, Mobilità, Balance, Recupero, Riposo.

### 💪 Training (le schede di allenamento)
Le linguette **A · B · C · Camp.** (Campagna). Per la scheda scelta vedi:
- Un'intestazione con nome, focus e pulsante **"Registra seduta"**.
- Un link **"✏️ Modifica esercizi"** per cambiare nome, serie/carico o note, e aggiungere/rimuovere esercizi.
- La **lista degli esercizi**, ognuno con: prescrizione (serie×reps), tipo (forza/balistico/tecnica/resistenza), nota tecnica, **consiglio per la prossima volta** (Progredisci/Mantieni/Riduci), **recupero consigliato** (adattato a fatica/RPE/dolore), un pulsante **▶ Video** (ricerca YouTube) e l'**alternativa** ("piano B").

### 🧘 Mobilità (riscaldamento e stretching)
Scegli il **contesto** (Generico · Calcio · Corsa · Palestra A/B/C) da una griglia di 6. Per ciascuno vedi due liste: **PRIMA** (riscaldamento) e **DOPO** (stretching). Ogni voce ha nome, dose, etichetta **Essenziale/Utile** e pulsante **▶ Video**.

### ⚖️ Corpo (composizione corporea / BIA)
- **Fase obiettivo**: Mantenimento / Ricomposizione / Asciugatura / Costruzione (la scegli tu; l'app la suggerisce leggendo i trend).
- **Ultima scansione**: i 4 essenziali (Peso · % Grasso · Massa magra · **Massa muscolare**) con le variazioni rispetto alla precedente.
- **Aggiungi scansione**: alleghi la **foto** del referto, premi **🔎 Leggi i numeri** (lettura automatica) e correggi; oppure inserisci i 4 numeri a mano. La foto resta come archivio per tutti gli altri dati.
- **Storico** delle scansioni, ognuna con link alla foto.

In alto a destra: un'icona **statistiche** (porta a Corpo) con un **pallino** quando c'è un suggerimento di fase, e un pulsante per **bloccare** l'app.

---

## 4. Il flusso d'uso quotidiano tipico

1. Apri l'app → sei sulla **Settimana**.
2. Guardi la **card OGGI**: *"Oggi Palestra A"*. Controlli il **semaforo fatica** e fai il check-in *"come ti senti"*.
3. Vai in palestra. Prima consulti la **Mobilità** del contesto giusto (riscaldamento).
4. Durante/dopo la seduta apri **Registra**: spunti gli esercizi fatti e, se vuoi, scrivi carichi/reps/RPE. Per gli esercizi di resistenza inserisci durata/distanza, non kg.
5. Salvi. La **striscia** si aggiorna, il **progresso** sale, e alla prossima apertura i **consigli di carico** tengono conto di quello che hai messo.
6. Se fai corsa/calcetto/beach volley, li registri con durata (e distanza/battito per la corsa): l'app stima le **calorie** e pesa la **fatica** in base alla durata.
7. Ogni 4–8 settimane fai una **BIA** e la carichi in **Corpo** (foto + lettura automatica). Se il trend lo richiede, l'app ti propone un **cambio di fase**.

---

## 5. Cosa "ragiona" dietro le quinte (i motori)

- **Fasce settimanali** — misura la settimana a livelli (Minima → Standard → Ottimale → Piena), mai "fallito". 3 sedute portanti + mobilità + un cardio = *Standard*.
- **Fatica** — somma un "carico" delle attività (tipo × intensità RPE × **durata**) e lo traduce in verde/giallo/rosso; il check-in soggettivo può correggerlo.
- **Progressione** — dopo ogni log, per esercizio propone *Progredisci / Mantieni / Riduci / Regredisci*, con regole diverse per forza, balistico, tecnica, resistenza. Freni: settimana "rossa" o pre-trip in giallo → si mantiene; asciugatura → si preservano i carichi.
- **Recuperi** — tempo base per esercizio, allungato in automatico se sei stanco/dolorante (con l'eccezione della seduta B, dove si riducono le serie invece di allungare il riposo).
- **Dolore** — se segnali un fastidio su una zona, gli esercizi che la caricano vengono declassati (consiglio prudente + recupero più lungo).
- **Pre-trip** — imposti la data del viaggio; nelle 4 settimane prima l'app cambia priorità (pagaiata, pop-up, balance) e diventa più prudente.
- **Calorie** — stima con la formula standard (dispendio per tipo × peso dalla BIA × durata), sempre correggibile a mano.
- **BIA** — segnale **lento e di contesto**: guida peso→calorie, fase obiettivo ed eventuali avvisi, ma **non** tocca fatica, progressione o recuperi del giorno.

---

## 6. I dati salvati (le tabelle Supabase, spiegate semplici)

Pensa a ogni tabella come a un foglio Excel nel cloud.

**Il programma (contenuti, non personali):**
| Tabella | Cosa contiene |
|---|---|
| `exercise` | La libreria di tutti gli esercizi (nome, tipo, serie/reps di base, note, zone del corpo). |
| `session_template` | Le sedute: A, B, C, Campagna, e le "voci" corsa/calcetto/beach volley/mobilità/balance/recupero. |
| `session_exercise` | Quale esercizio sta in quale seduta, in che ordine, con che prescrizione e **recupero**. |
| `exercise_alternative` | Le alternative ("piano B") di ogni esercizio. |
| `mobility_exercise` | Le schede di mobilità/stretching per contesto e fase (con dose, priorità, termine video). |

**I tuoi dati personali:**
| Tabella | Cosa contiene |
|---|---|
| `day_log` | Ogni attività registrata: giorno, tipo, RPE, e (per corsa/calcetto/beach volley) **durata, distanza, battito, calorie**. |
| `exercise_log` | I singoli esercizi loggati in una seduta: completamento, carico, serie, reps, RPE, qualità, **durata/distanza/variante**, dolore. |
| `week_checkin` | Il check-in fatica (fresco/ok/cotto). |
| `trip_config` | La data del prossimo viaggio (per la modalità pre-trip). |
| `bia_scan` | Le scansioni corporee: peso, % grasso, massa magra, **massa muscolare**, acqua, BMR, viscerale, **foto**, ecc. |
| `goal_phase` | La fase obiettivo scelta e il suo storico. |

In più, un **archivio immagini** ("bucket" `bia`) conserva le foto delle scansioni.

---

## 7. Funzioni già attive ✅ e ancora da fare 🔜

**Già attive:**
- ✅ Le 3 sedute A/B/C + Campagna, con esercizi, alternative e recuperi
- ✅ Registrazione delle sedute (3 livelli di dettaglio) e delle attività cardio con metriche
- ✅ Calendario settimanale, fasce, motore di proposte, protezione dei 2 giorni liberi
- ✅ Progressione per esercizio (con campi giusti per tipo: il vogatore non chiede kg)
- ✅ Fatica + check-in, gestione dolore, recuperi adattivi
- ✅ Modalità pre-trip
- ✅ Beach volley + stima calorie (peso dalla BIA × durata)
- ✅ Mobilità/stretching per 6 contesti, con pulsanti video
- ✅ Corpo/BIA: inserimento con **foto + lettura automatica (OCR)**, trend, suggerimento di fase evidente
- ✅ Modifica esercizi e rimozione attività dall'app
- ✅ Pulsanti **▶ Video** su esercizi e mobilità
- ✅ App online (Vercel) e installabile sul telefono, accesso con codice

**Ancora da fare:**
- 🔜 **Timer di recupero** — un countdown avviabile a fine serie (i tempi ci sono già, manca il cronometro)
- 🔜 **Scorciatoia iPhone → Salute** — per inviare le attività registrate all'app Salute (vedi §8)
- 🔜 Eventuale **login vero** (email/password) se un giorno l'app non fosse più solo tua

---

## 8. Dove ci siamo discostati dal design originale (e perché)

Questi sono i punti in cui l'app reale differisce dal progetto iniziale, sempre con una motivazione concreta.

1. **Accesso: codice semplice, non link via email.**
   Il design prevedeva l'accesso "via link email". In pratica, sul telefono, il link apriva un browser diverso dall'app installata (login perso) e l'email gratuita di Supabase aveva un **limite** di invii. Abbiamo quindi scelto un **codice** che apri direttamente nell'app: semplice, immediato, senza email. *Conseguenza:* la protezione è "da app personale" (un codice + indirizzo non indovinabile), non una password robusta. Adeguato a un uso solo tuo; irrobustibile se un domani servisse.

2. **BIA: 4° essenziale = Massa muscolare, non Angolo di fase.**
   Il design metteva tra gli essenziali l'**angolo di fase**. Il tuo dispositivo reale (**Evolt 360**) **non lo misura**. L'abbiamo sostituito con la **Massa muscolare scheletrica**, che il tuo referto fornisce ed è più utile per l'allenamento.

3. **Collegamento con "Salute" di iPhone: non fattibile come immaginato.**
   Una web-app (PWA) **non può** leggere né scrivere su Salute di iPhone: è una funzione riservata alle app native. L'unica via reale è una **Scorciatoia** (Shortcut) che porti i dati dall'app a Salute. È in coda come attività a sé.

4. **Lettura automatica della BIA (OCR): aggiunta.**
   Il design prevedeva l'inserimento manuale. Abbiamo aggiunto la **lettura automatica** dei numeri dalla foto (tarata sul tuo Evolt 360). Resta "best-effort": precompila, tu controlli e correggi.

5. **Tipo di esercizio "resistenza": aggiunto.**
   Il design prevedeva solo forza/balistico/tecnica. Abbiamo aggiunto **resistenza** (vogatore, corda, corsa) perché progredisce per **volume/tempo**, non per carico: così questi esercizi non chiedono più i kg.

6. **Beach volley e scheda "Campagna": aggiunti su tua richiesta.**
   Non erano nel programma originale. La Campagna è marcata come **mantenimento**: conta come seduta portante per le fasce, ma **non** altera le progressioni delle sedute A/B/C (i suoi esercizi hanno nomi propri, separati).

7. **Calorie e "peso" della durata: aggiunti.**
   Il design non stimava le calorie. Le abbiamo aggiunte, e abbiamo fatto sì che la **durata** pesi sul calcolo della fatica (2 ore di calcetto ≠ mezz'ora).

8. **Pulsanti video, modifica esercizi, rimozione attività: aggiunti.**
   Migliorie d'uso non presenti nel design, richieste durante lo sviluppo.

9. **Sicurezza dei dati (RLS) al momento "aperta".**
   Il design chiedeva regole di accesso ai dati anche per utente singolo. Con il passaggio al codice (niente login vero), le regole sui dati personali sono tornate **aperte**: i dati sono protetti dal codice dell'app e dall'indirizzo segreto, non da un vero account. È una scelta consapevole per la semplicità; si può stringere aggiungendo un login vero.

Tutto il resto (fasce senza "fallito", settimana Lun–Dom, freni fatica, pre-trip, principio "la BIA non guida il giorno") è **fedele al design**.

---

## 9. In una frase

L'app fa già **tutto il cuore del progetto** — proporre, registrare, progredire, proteggere, tracciare — con parecchie aggiunte utili (calorie, mobilità, video, modifica, BIA da foto). Restano da rifinire il **timer di recupero** e il **ponte verso Salute** di iPhone.
