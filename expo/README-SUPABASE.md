# Supabase Setup Instructions

## 1. Přihlaste se do Supabase

Otevřete: https://vfgoizqsdljodwffcgyi.supabase.co

## 2. Spusťte SQL Migration

1. V levém menu klikněte na **SQL Editor**
2. Klikněte na **New query**
3. Zkopírujte celý obsah souboru `supabase-migrations.sql`
4. Vložte ho do SQL editoru
5. Klikněte na **Run** (nebo stiskněte Ctrl+Enter)

Migration vytvoří:
- Tabulky: `profiles`, `fights`, `weight_logs`, `hydration_logs`, `meal_logs`
- Indexy pro rychlé dotazy
- Row Level Security (RLS) políčka pro bezpečnost
- Triggery pro automatickou aktualizaci timestampů

## 3. Nastavte Environment Variables

Vytvořte soubor `.env` v kořenové složce projektu:

```env
EXPO_PUBLIC_SUPABASE_URL=https://vfgoizqsdljodwffcgyi.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Najděte váš Anon Key:
1. V Supabase dashboardu jděte na **Settings** → **API**
2. Zkopírujte `anon` `public` key
3. Vložte ho do `.env` souboru

## 4. Ověření

Po spuštění migration můžete ověřit, že všechno funguje:

1. Jděte do **Table Editor** v Supabase
2. Měli byste vidět všechny tabulky: `profiles`, `fights`, `weight_logs`, `hydration_logs`, `meal_logs`

## 5. Test v aplikaci

Po nastavení můžete aplikaci otestovat:

```bash
npm start
```

Aplikace teď bude synchronizovat data do Supabase místo pouze lokálního AsyncStorage.

## Struktura databáze

### Profiles
- Ukládá profily uživatelů (fighters a coaches)
- Obsahuje osobní údaje, váhové údaje, a tréningové preference

### Fights
- Nadcházející a minulé zápasy
- Datum, soupeř, váhová kategorie

### Weight Logs
- Denní záznamy váhy (ráno/večer)
- Tělesný tuk (volitelně)

### Hydration Logs
- Záznamy příjmu vody
- Množství v ml

### Meal Logs
- Záznamy jídel
- Kalorie, makroživiny, sodík

## Poznámky k bezpečnosti

- Row Level Security (RLS) je aktivní na všech tabulkách
- Uživatelé můžou číst/upravovat pouze svá vlastní data
- Autentizace probíhá přes Supabase Auth
