# ERAMUS - Frontend (EramusFE)

Interfaccia web sviluppata con Next.js 14 (App Router) e TypeScript.

---

## Stack Tecnologico

- **Next.js 14** (App Router)
- **TypeScript**
- **Bootstrap Italia** per lo stile grafico
- **Axios** per le chiamate API con gestione automatica JWT
- **Recharts** per i grafici nella dashboard
- **js-cookie** per la gestione dei token

---

## Struttura Cartelle

```
EramusFE/
├── .env.local                    ← URL del backend (non su GitHub)
├── declarations.d.ts             ← supporto import CSS in TypeScript
├── lib/
│   ├── api.ts                    ← client Axios con interceptor JWT automatico
│   └── auth.ts                   ← funzioni login, logout, getUtenteCorrente, isAdmin
└── app/
    ├── layout.tsx                ← layout base con Bootstrap Italia
    ├── login/
    │   └── page.tsx              ← pagina di login
    ├── dashboard/
    │   └── page.tsx              ← dashboard con statistiche e grafico
    ├── utenti/
    │   └── page.tsx              ← gestione utenti
    ├── inventario/
    │   └── page.tsx              ← gestione inventario e movimenti
    └── movimenti/
        └── page.tsx              ← lista movimenti magazzino
```

---

## File .env.local

Crea il file `.env.local` nella root del progetto con:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

> Il file `.env.local` è già nel `.gitignore` e non verrà mai caricato su GitHub.

---

## Setup da Zero

```bash
# 1. Entra nella cartella
cd EramusFE

# 2. Installa le dipendenze
npm install

# 3. Avvia il server
npm run dev
```

Il frontend sarà disponibile su `http://localhost:3000`

---

## Riavvio dopo spegnimento PC

```bash
cd ~/GitHub/Eramus/EramusFE
npm run dev
```

> Assicurati che il backend sia avviato prima di usare il frontend.

---

## Pagine

| URL | Descrizione |
|-----|-------------|
| /login | Maschera di login con validazione AGID e recupera password |
| /dashboard | Statistiche, ultimi movimenti e grafico prodotti per categoria |
| /utenti | Gestione utenti con paginazione, ricerca e CRUD (solo Admin) |
| /inventario | Gestione prodotti con filtri, ordinamento e movimenti magazzino |
| /movimenti | Lista ultimi movimenti di magazzino |

---

## Funzionalità

- **Refresh automatico** del JWT token scaduto tramite interceptor Axios
- **Protezione route**: redirect automatico a /login se non autenticato
- **Validazione password AGID** lato frontend prima dell'invio
- **Paginazione** su utenti e prodotti
- **Ricerca** per username/email (utenti) e nome (prodotti)
- **Filtro per tipo** prodotto (Buste/Carta/Toner)
- **Ordinamento** per prezzo e quantità
- **Evidenziazione** prodotti sotto soglia minima (riga gialla)
- **Grafico** prodotti per categoria con Recharts
- **Solo Admin** può accedere alla gestione utenti

---

## Credenziali Admin

- **Username:** `admin`
- **Password:** `Admin123!`
