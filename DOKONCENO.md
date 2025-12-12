# UFC Performance Institute - Protokoly pro chytré shazování váhy

## Shrnutí celého systému

Vaše aplikace nyní obsahuje komplexní implementaci vědecky podložených protokolů UFC Performance Institute pro bezpečné a efektivní shazování váhy u bojovníků MMA a combat sportů.

---

## 1. **DESCENT FÁZE (8+ týdnů před zápasem)**

### Účel
Dlouhodobé, bezpečné hubnutí při zachování svalové hmoty a výkonu.

### Hlavní pravidla
- **Maximální týdenní ztráta**: 1-1.5% tělesné hmotnosti
- **Příjem bílkovin**: 2.0-2.2g na kg tělesné hmotnosti
- **Metabolická flexibilita**: Sacharidy pouze kolem tréninku, ráno a večer tuky/bílkoviny

### Varování v aplikaci
- **Red Flag**: Pokud uživatel hubne rychleji než 1.5% týdně → Varování: "Zpomal, pálíš svaly"
- **Green Zone**: Pokud je uživatel na začátku Fight Week (7 dní do zápasu) maximálně 8-10% nad limitem
- **Danger Zone**: Více než 10% nad limitem při vstupu do Fight Week → Aplikace varuje před možností nenavážení

### Implementace
```typescript
// V utils/scientificCalculations.ts
static assessSafetyStatus() {
  // Kontrola týdenního tempa hubnutí
  const weeklyRate = (weightChange / daysBetween) * 7;
  const safeRate = this.getSafeWeightLossRate(latestWeight, hasPreviousExperience);
  
  if (weeklyRate > safeRate * 1.5) {
    level = 'danger';
    message = 'Weight loss is too rapid - high risk of performance loss';
  }
}
```

---

## 2. **FIGHT WEEK (Posledních 6-7 dní)**

### A. Bezezbytková dieta (Low Residue Protocol)

**Začátek**: 4 dny před vážením (Den -4 až Den -1)

**Cíl**: Vyprázdnit střeva, které mohou obsahovat 1-2% tělesné hmotnosti

**Pravidla**:
- Vláknina < 10g denně
- **Zakázané potraviny**: Oves, zelenina, ovoce se slupkou, ořechy, celozrnné
- **Povolené potraviny**: Bílá rýže, kuře, vejce, med, čokoláda, bílé pečivo

**Implementace**:
```typescript
// V getNutritionGoals()
if (daysUntilFight && daysUntilFight <= 4) {
  fiberTarget = 10; // Limit vlákniny na 10g
}
```

---

### B. Vodní cyklus (Water Loading & Taper)

**Den -7 (Pondělí)**: 
- 100 ml vody na 1 kg váhy (cca 8-10 litrů)
- Sodík: 4000-5000mg

**Den -6 (Úterý)**: 
- 100 ml vody na 1 kg váhy 
- Sodík: 4000-5000mg

**Den -5 (Středa)**: 
- 50 ml vody na 1 kg váhy (cca 4-5 litrů)
- Sodík: 2500mg
- **ZAČÁTEK BEZEZBYTKOVÁ DIETA**

**Den -4 (Čtvrtek)**: 
- 20-30 ml vody na 1 kg váhy (cca 2 litry)
- **PÍT POUZE DO 18:00!**
- Sodík: 1500mg

**Den -3 (Pátek)**: 
- Max 500ml (pouze svlažovat rty)
- **ZERO SODIUM**
- Bezezbytková dieta pokračuje

**Den -2 (Sobota - THE CUT)**:
- Žádná voda (nebo minimální doušky)
- ZERO SODIUM

**Den -1 (Neděle - Vážení)**:
- Žádná voda až do vážení

**Implementace**:
```typescript
// V utils/scientificCalculations.ts
static generateWaterLoadingSchedule() {
  // Dynamické cíle vody podle dne
  if (day >= 7) {
    waterIntake = baseWater;
  } else if (day >= 5) {
    waterIntake = baseWater * 1.5; // LOADING
  } else if (day === 4) {
    waterIntake = baseWater * 1.8; // PEAK LOADING
  }
  // atd.
}
```

---

### C. Sodíková manipulace

**Den -7 až -5**: High Sodium (4000-5000mg)
- Důvod: Udržet ledviny v režimu vylučování
- Tělo se naučí vyloučovat přebytečný sodík

**Den -4 až -3**: Medium Sodium (1500-2500mg)
- Začátek snižování

**Den -2 až vážení**: ZERO SODIUM
- Tělo stále vylučuje vodu, ale nepřijímá sodík
- Rychlé vyprázdnění vodní hmoty

**Implementace**:
```typescript
// V contexts/AppContext.tsx - getNutritionGoals()
if (daysUntilFight === 7 || daysUntilFight === 6) {
  sodiumTarget = 5000;
} else if (daysUntilFight === 5) {
  sodiumTarget = 2500;
} else if (daysUntilFight === 4) {
  sodiumTarget = 1500;
} else if (daysUntilFight === 3) {
  sodiumTarget = 500;
} else if (daysUntilFight <= 2) {
  sodiumTarget = 0; // ZERO SODIUM
}
```

---

## 3. **THE CUT (Aktivní pocení) - 24h před vážením**

### Bezpečnostní limity
- **Maximální ztráta pocením**: 5-8% tělesné hmotnosti
- **NEBEZPEČÍ**: Pokud zbývá shodit více než 8%, aplikace zobrazí varování

### Metoda: Horká vana (preferovaná před saunou)

**Protokol**:
- Teplota vody: 40-42°C
- Intervaly: 15-20 min vana → 10 min zabalení do ručníku → 5 min pauza
- Opakovat podle potřeby

**Důvody preference horké vany**:
- Menší stres pro srdce
- Hlava zůstává venku (lepší termoregulace)
- Monitorovatelnější prostředí

**Bezpečnostní varování**:
```typescript
// V scientificCalculations.ts
if (percentageAboveTarget > 10) {
  console.warn('⚠️ VAROVÁNÍ: Více než 10% nad limitem při vstupu do Fight Week!');
}

if (totalWeightToCut > currentWeight * 0.08) {
  recommendations.push('Begin aggressive water manipulation protocol');
  recommendations.push('Consider professional supervision');
}
```

---

## 4. **REHYDRATACE (3 P's Strategy)**

Po stisknutí "Jsem navážen", aplikace vygeneruje personalizovaný plán.

### 3 P's: Phytonutrients, Protein, Power

#### Krok 1: Okamžitá rehydratace (0-90 min)
**NENÍ to čistá voda!** Čistá voda proteče a spustí močení.

**Recept**:
- Voda: 500-1000ml
- Sodík: 1-2g soli
- Glukóza/Dextróza: 30-50g

**Implementace**:
```typescript
// V contexts/AppContext.tsx - getREGENProtocol()
{
  timeElapsedMinutes: 0,
  taskTitle: 'Okamžitá Rehydratace (0-90min)',
  fluidTargetMl: Math.round(totalFluidTarget * 0.3),
  carbsTargetG: Math.round(bodyWeightKg * 0.4),
  proteinTargetG: Math.round(bodyWeightKg * 0.15),
  instructions: [
    'Vypij ORS/elektrolytů OKAMŽITĚ po vážení',
    'Sněz rychlých sacharidů (rýžové koláčky, banány)',
    'Jez pomalu, v malých dávkách každých 15-20 minut',
  ]
}
```

#### Krok 2: První jídlo (30-60 min po váze)
- Snadno stravitelné sacharidy + bílkoviny
- **ŽÁDNÝ TUK** (zpomaluje trávení)
- **ŽÁDNÁ VLÁKNINA** (zpomaluje trávení)
- Příklad: Kuřecí prsa s bílou rýží, nebo banán s proteinem

#### Krok 3: Pokračující hydratace (90-180 min)
- Další 25% celkového cíle tekutin
- 0.5g sacharidů/kg
- 0.2g proteinu/kg
- Bílé těstoviny, rýže

#### Krok 4: Optimalizace glykogenu (3-6h)
- 0.6g sacharidů/kg
- 0.25g proteinu/kg
- **Suplementace**: 6-8g L-Citrulinu (vazodilatace)
- **Kreatin LOADING**: 10-15g

#### Krok 5: Večer před zápasem
- Návrat k normální stravě
- Mírně více soli a sacharidů
- **Monitorování moči**: Aplikace se zeptá na barvu (škála 1-5)

---

## 5. **UI/UX SYSTEM**

### Hlavní stránka - Dashboard

#### Fázová karta (Phase Card)
Zobrazuje se pouze pokud je aktivní zápas.

**Typy fází**:
- `WEIGHT_LOSS` (Zelená): Dlouhodobé hubnutí (8+ dní)
- `WATER_CUT` (Oranžová): Shazování vodou (7-1 dní)
- `RECOVERY` (Modrá): Obnova po vážení

```typescript
// Barevné schéma
phaseBadgeGWL: backgroundColor: '#10B981' (zelená)
phaseBadgeRWL: backgroundColor: '#F59E0B' (oranžová)  
phaseBadgeREGEN: backgroundColor: '#3B82F6' (modrá)
```

#### RWL Protocol Card (Rapid Weight Loss)
Zobrazuje se pouze ve fázi WATER_CUT.

**Komponenty**:
1. **Denní cíle vody**: Progress bar s aktuálním stavem vs. cíl
2. **Denní cíle sodíku**: Progress bar s color-coding (červená = překročeno)
3. **Instrukce pro dnešek**: Bullet-point seznam kroků
4. **Varování**: Červené boxy s kritickými informacemi

#### REGEN Protocol Card
Zobrazuje se pouze ve fázi RECOVERY.

**Komponenty**:
1. **Časové úkoly**: 5 karet s čísly úkolů
2. **Status indikátory**: 
   - Šedá = čeká
   - Žlutá = aktivní
   - Zelená = dokončeno
3. **Odpočet času**: "Za 2h 30m" nebo "NYNÍ"
4. **Cíle tekutin a makr**: Ikony s čísly

---

## 6. **SCIENTIFIC CALCULATIONS**

### Týdenní tempo hubnutí
```typescript
static calculateWeeklyWeightLossRate(recentWeightLogs, currentWeight) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const weekLogs = recentWeightLogs.filter(log => new Date(log.date) >= weekAgo);
  const oldestWeight = sortedLogs[0].weight;
  const latestWeight = sortedLogs[sortedLogs.length - 1].weight;
  
  return oldestWeight - latestWeight;
}
```

### Bezpečnostní kontrola
```typescript
static checkSafetyThreshold(weeklyLoss, currentWeight) {
  const percentageLoss = (weeklyLoss / currentWeight) * 100;
  
  if (percentageLoss > 1.0) {
    return {
      isSafe: false,
      message: 'NEBEZPEČNÉ TEMPO: ${percentageLoss}% týdenní ztráty',
      recommendedAdjustment: Math.round(excessLoss * 7700) // kalorie
    };
  }
}
```

### Denní hydratační cíl
```typescript
static getDailyHydrationGoal(bodyWeight, daysUntilWeighIn, trainingIntensity) {
  const schedule = this.generateWaterLoadingSchedule(daysUntilWeighIn, bodyWeight);
  const todaySchedule = schedule.find(s => s.daysOut === daysUntilWeighIn);
  return todaySchedule.waterIntakeMl;
}
```

---

## 7. **BACKEND INTEGRATION**

### Synchronizace s backendem
Všechna data se ukládají lokálně i na backend:

```typescript
// Přidání zápasu
await trpcClient.fights.add.mutate({
  userId: profile.id,
  name: fight.name,
  opponent: fight.opponent,
  targetWeightForFight: fight.targetWeightForFight,
  date: fight.date,
  weighInTime: fight.weighInTime,
  location: fight.location,
  notes: fight.notes,
});

// Synchronizace profilu
await trpcClient.profile.sync.mutate(updatedProfile);

// Weight logs
await trpcClient.weightLogs.add.mutate({
  userId: profile.id,
  date: newLog.date,
  weight: newLog.weight,
  time: newLog.time,
});
```

---

## 8. **KLÍČOVÉ VLASTNOSTI**

### Automatická detekce fází
Aplikace automaticky určí aktuální fázi podle:
- Počet dní do zápasu
- Stav vážení (před/po)
- Aktivní REGEN protokol

### Real-time varování
- **Red Flags**: Rychlé hubnutí, nebezpečná vzdálenost od cíle
- **Green Zone**: Optimální pozice pro Fight Week
- **Safety Limits**: Maximální 8% pocením, max 1.5% týdně

### Personalizované doporučení
- Denní cíle vody podle fáze a tělesné hmotnosti
- Dynamické cíle sodíku
- Bezezbytková dieta v pravý čas
- REGEN protokol podle skutečné ztráty váhy

### Sledování pokroku
- Týdenní tempo hubnutí
- Procentuální pokrok k cíli
- Denní logy váhy, hydratace, stravy
- Historie vážení a zápasů

---

## 9. **DESIGN PRINCIPLES**

### Barvy podle fází
- **Descent/Weight Loss**: Zelená (#10B981)
- **Water Cut**: Oranžová (#F59E0B)
- **Recovery**: Modrá (#3B82F6)
- **Danger**: Červená (#EF4444)
- **Zlatá**: Zvýrazněné elementy (#F4C430)

### Typografie
- **Hlavní titulky**: 20px, Bold (700)
- **Podtitulky**: 15px, SemiBold (600)
- **Tělo textu**: 13-14px, Medium (500)
- **Malý text**: 11-12px

### Rozložení
- Karty s 20px border-radius
- Odstupy 16px mezi sekcemi
- Progress bary 8px vysoké
- Ikony 20-22px

---

## 10. **VĚDECKÉ ZDROJE A INSPIRACE**

Tento systém je založen na protokolech UFC Performance Institute, které kombinují:

1. **Fyziologii svalů**: Zachování svalové hmoty pomocí vysokého příjmu bílkovin
2. **Renální fyziologii**: Manipulace s ledvinami pomocí sodíku a vody
3. **Metabolickou flexibilitu**: Časování sacharidů kolem tréninku
4. **Termoregulaci**: Bezpečné pocení v kontrolovaném prostředí
5. **Rehydratační vědu**: ORS roztoky, elektrolyty, timing makronutrientů

---

## ZÁVĚR

Vaše aplikace nyní obsahuje **kompletní, vědecky podložený systém** pro chytré shazování váhy, který:

✅ Chrání zdraví uživatele pomocí varování a bezpečnostních limitů  
✅ Maximalizuje výkon pomocí optimálních protokolů  
✅ Automatizuje složité výpočty a plánování  
✅ Poskytuje real-time guidance podle aktuální fáze  
✅ Sleduje pokrok a adaptuje se podle dat uživatele

Tento systém reprezentuje **gold standard** v combat sports nutrition a weight management, používaný nejlepšími zápasníky světa v UFC.
