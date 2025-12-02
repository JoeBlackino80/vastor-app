# VASTOR - Kurýrní služba Praha

Kompletní webová aplikace pro kurýrní službu s objednávkovým systémem, registrací kurýrů a admin panelem.

## Funkce

- **Objednávkový formulář** - zákazníci mohou objednat kurýra online
- **Registrace kurýrů** - kurýři se mohou registrovat přes formulář
- **Admin panel** - přehled objednávek a kurýrů
- **Ceník** - 3 úrovně služeb (Standard, Express, Premium)
- **Responsivní design** - funguje na všech zařízeních

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Databáze**: Supabase (PostgreSQL)
- **Validace**: Zod
- **Ikony**: Lucide React

---

## Rychlý start (10 minut)

### 1. Naklonujte projekt

```bash
# Pokud používáte Git
git clone <your-repo>
cd vastor-app

# Nebo zkopírujte soubory do nové složky
```

### 2. Nainstalujte závislosti

```bash
npm install
```

### 3. Vytvořte Supabase projekt (ZDARMA)

1. Jděte na [supabase.com](https://supabase.com)
2. Klikněte "Start your project"
3. Přihlaste se přes GitHub
4. Vytvořte nový projekt (vyberte region EU - Frankfurt)
5. Počkejte ~2 minuty na inicializaci

### 4. Nastavte databázi

1. V Supabase dashboardu jděte do **SQL Editor**
2. Klikněte **New query**
3. Zkopírujte obsah souboru `supabase-schema.sql`
4. Klikněte **Run** (Ctrl+Enter)

### 5. Získejte API klíče

1. V Supabase jděte do **Settings** → **API**
2. Zkopírujte:
   - Project URL
   - anon public key
   - service_role key (klikněte na "Reveal")

### 6. Nastavte environment variables

```bash
# Zkopírujte example soubor
cp .env.example .env.local

# Upravte .env.local s vašimi klíči:
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 7. Spusťte aplikaci

```bash
npm run dev
```

Otevřete [http://localhost:3000](http://localhost:3000)

---

## Nasazení na Vercel (ZDARMA)

### 1. Pushněte na GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/vastor-app.git
git push -u origin main
```

### 2. Nasaďte na Vercel

1. Jděte na [vercel.com](https://vercel.com)
2. Klikněte "Add New Project"
3. Importujte váš GitHub repozitář
4. V sekci "Environment Variables" přidejte:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Klikněte "Deploy"

Hotovo! Aplikace běží na `https://vastor-app.vercel.app`

---

## Struktura projektu

```
vastor-app/
├── app/
│   ├── api/
│   │   ├── orders/route.ts      # API pro objednávky
│   │   └── couriers/route.ts    # API pro kurýry
│   ├── admin/page.tsx           # Admin panel
│   ├── kuryr/page.tsx           # Registrace kurýrů
│   ├── objednavka/page.tsx      # Objednávkový formulář
│   ├── page.tsx                 # Homepage
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Globální styly
├── components/
│   ├── Navigation.tsx           # Navigace
│   └── Footer.tsx               # Patička
├── lib/
│   ├── supabase.ts              # Supabase client
│   ├── database.types.ts        # TypeScript typy
│   └── validations.ts           # Zod schémata
├── supabase-schema.sql          # SQL pro databázi
├── package.json
└── README.md
```

---

## Stránky

| URL | Popis |
|-----|-------|
| `/` | Hlavní stránka s ceníkem a informacemi |
| `/objednavka` | Formulář pro objednání kurýra |
| `/kuryr` | Registrace nových kurýrů |
| `/admin` | Admin panel (správa objednávek a kurýrů) |

---

## API Endpointy

### POST /api/orders
Vytvoří novou objednávku.

```json
{
  "customer_name": "Jan Novák",
  "customer_email": "jan@email.cz",
  "customer_phone": "+420123456789",
  "pickup_address": "Václavské náměstí 1, Praha",
  "delivery_address": "Karlovo náměstí 10, Praha",
  "package_type": "document",
  "service_type": "express",
  "price": 149
}
```

### POST /api/couriers
Registruje nového kurýra.

```json
{
  "first_name": "Petr",
  "last_name": "Svoboda",
  "email": "petr@email.cz",
  "phone": "+420987654321",
  "vehicle_type": "bike"
}
```

---

## Další rozvoj

### Co můžete přidat:

1. **Autentizace** - přihlašování kurýrů a adminů
2. **Platební brána** - Stripe pro online platby
3. **SMS notifikace** - Twilio pro upozornění
4. **Mapy** - Google Maps pro sledování
5. **Mobilní app** - React Native verze

### Užitečné služby:

- **Stripe** - platby (stripe.com)
- **Resend** - emaily (resend.com)
- **Twilio** - SMS (twilio.com)
- **Mapbox** - mapy (mapbox.com)

---

## Podpora

Máte otázky? Vytvořte issue na GitHubu nebo kontaktujte podporu.

---

**VASTOR CAPITAL s.r.o.** - Kurýrní služba Praha
