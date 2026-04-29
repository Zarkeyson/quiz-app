# Quiz App

Aplikacija za kreiranje i igranje kvizova u realnom vremenu. Napravljena u **Next.js 16** sa **Firebase** bazom podataka.

---

## Tehnologije

- [Next.js 16](https://nextjs.org/) — React framework
- [Firebase Firestore](https://firebase.google.com/) — baza podataka u realnom vremenu
- [Tailwind CSS v4](https://tailwindcss.com/) — stilizovanje
- [Framer Motion](https://www.framer.com/motion/) — animacije

---

## Pokretanje projekta

### 1. Kloniranje i instalacija

```bash
git clone <repo-url>
cd quiz-app
npm install
```

### 2. Firebase konfiguracija

Napravi `.env` fajl u root-u projekta i dodaj Firebase kredencijale:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

> Kredencijale nađeš u [Firebase konzoli](https://console.firebase.google.com/) → Project Settings → Your apps.

### 3. Pokretanje

```bash
npm run dev
```

Aplikacija je dostupna na [http://localhost:3000](http://localhost:3000).

---

## Kako funkcioniše

1. **Kreator** otvori aplikaciju, unese pitanja i klikne *Kreiraj kviz* — dobija jedinstveni 5-slovni kod (npr. `XKQTB`)
2. **Igrači** unesu taj kod i odgovaraju na pitanja
3. **Kreator** može da vidi odgovore svih igrača u Admin panelu

---

## Skripte

| Komanda | Opis |
|---|---|
| `npm run dev` | Pokreće development server |
| `npm run build` | Pravi produkcijski build |
| `npm run start` | Pokreće produkcijski server |
| `npm run lint` | Proverava kod |

---

## Struktura projekta

```
quiz-app/
├── app/
│   ├── page.js          # Početna stranica (kreiranje i joinovanje kviza)
│   ├── quiz/            # Stranica za igranje kviza
│   ├── responses/       # Admin pregled odgovora
│   ├── results/         # Rezultati kviza
│   ├── layout.tsx       # Root layout
│   └── globals.css      # Globalni stilovi
├── lib/
│   └── firebase.js      # Firebase konfiguracija
└── .env                 # Environment varijable (ne commitovati!)
```