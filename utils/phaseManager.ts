import { 
  PrepPhase, 
  PhaseInfo, 
  RWLProtocol, 
  REGENProtocol, 
  SupplementSchedule,
  UserProfile,
  Fight,
  WeighInRecord 
} from '@/constants/types';

export class PhaseManager {
  static determineCurrentPhase(
    profile: UserProfile,
    upcomingFight: Fight | null,
    weighInRecord?: WeighInRecord
  ): PhaseInfo {
    if (!upcomingFight) {
      return {
        phase: 'MAINTENANCE',
        startDate: new Date(),
        daysRemaining: 0,
        description: 'Žádný nadcházející zápas. Udržujte formu a sledujte váhu.',
      };
    }

    const now = new Date();
    const fightDate = new Date(upcomingFight.date);
    const daysUntilFight = Math.ceil((fightDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (weighInRecord && weighInRecord.regenProtocolStarted) {
      const hoursSinceWeighIn = Math.floor(
        (now.getTime() - new Date(weighInRecord.regenProtocolStarted).getTime()) / (1000 * 60 * 60)
      );
      
      if (weighInRecord.fightTime) {
        const hoursUntilFight = Math.floor(
          (new Date(weighInRecord.fightTime).getTime() - now.getTime()) / (1000 * 60 * 60)
        );
        
        if (hoursUntilFight > 0) {
          return {
            phase: 'RECOVERY',
            startDate: new Date(weighInRecord.regenProtocolStarted),
            endDate: new Date(weighInRecord.fightTime),
            daysRemaining: 0,
            description: `Obnova výkonu - ${hoursUntilFight} hodin do zápasu. Rehydratace a doplnění glykogenu.`,
          };
        }
      }
      
      if (hoursSinceWeighIn <= 36) {
        return {
          phase: 'RECOVERY',
          startDate: new Date(weighInRecord.regenProtocolStarted),
          daysRemaining: 0,
          description: `Obnova výkonu - ${hoursSinceWeighIn} hodin od vážení. Fokus na rehydrataci a energii.`,
        };
      }
    }

    if (daysUntilFight <= 7) {
      return {
        phase: 'WATER_CUT',
        startDate: new Date(now.getTime() - (7 - daysUntilFight) * 24 * 60 * 60 * 1000),
        endDate: fightDate,
        daysRemaining: daysUntilFight,
        description: `Shazování váhy vodou - ${daysUntilFight} dní do váhy. Manipulace s vodou/sodíkem.`,
      };
    }

    return {
      phase: 'WEIGHT_LOSS',
      startDate: profile.cuttingStartDate || now,
      endDate: new Date(fightDate.getTime() - 7 * 24 * 60 * 60 * 1000),
      daysRemaining: daysUntilFight - 7,
      description: `Dlouhodobé hubnutí - ${daysUntilFight - 7} dní do shazování vodou. Kalorický deficit a tělesné složení.`,
    };
  }

  static generateRWLProtocol(
    daysUntilWeighIn: number,
    currentWeight: number,
    targetWeight: number
  ): RWLProtocol[] {
    const protocol: RWLProtocol[] = [];

    for (let day = 7; day >= 1; day--) {
      let waterTarget: number;
      let sodiumTarget: number;
      let potassiumTarget: number;
      let magnesiumTarget: number;
      let phase: 'loading' | 'medium' | 'cutting' | 'final';
      let instructions: string[] = [];
      let warnings: string[] = [];

      if (day === 7 || day === 6) {
        phase = 'loading';
        waterTarget = 8000;
        sodiumTarget = 5000;
        potassiumTarget = 4000;
        magnesiumTarget = 500;
        instructions = [
          'Zvyšte příjem vody na 8+ litrů denně',
          'Konzumujte slané potraviny (okurky, slaný roztok)',
          'Cíl: Nasytit tělo vodou a naučit ho vypouštět přebytečnou vodu',
          'Udržujte vysoký příjem sodíku (4000-5000 mg)',
        ];
      } else if (day === 5 || day === 4) {
        phase = 'medium';
        waterTarget = 5000;
        sodiumTarget = 2000;
        potassiumTarget = 3500;
        magnesiumTarget = 400;
        instructions = [
          'Snižte příjem vody na 5 litrů',
          'Začněte výrazně omezovat sodík (max 2500 mg)',
          'Zvyšte příjem draslíku (banány, špenát)',
          'Tělo stále vypouští vodu, ale příjem klesá',
        ];
      } else if (day === 3 || day === 2) {
        phase = 'cutting';
        waterTarget = 1500;
        sodiumTarget = 500;
        potassiumTarget = 3000;
        magnesiumTarget = 400;
        instructions = [
          'KRITICKÝ DEN - Minimální voda (1-2 L max)',
          'Téměř NULOVÝ sodík (< 500 mg)',
          'Vyhněte se objemným potravinám (syrová zelenina, celozrnné)',
          'Fokus na lehké, nízkosolné potraviny',
        ];
        warnings = [
          'Toto je klíčová fáze pro vyloučení vody',
          'Dbejte na signály těla - závratě, slabost',
          'Omezení tréninku - pouze lehké techniky',
        ];
      } else {
        phase = 'final';
        waterTarget = 250;
        sodiumTarget = 0;
        potassiumTarget = 2000;
        magnesiumTarget = 300;
        instructions = [
          'FINÁLNÍ CUT - Méně než 0,5L vody',
          'ŽÁDNÝ sodík',
          'Pouze srkání vody při absolutní nutnosti',
          'Zvažte saunování/koupel (max 15-20 min intervaly)',
        ];
        warnings = [
          'KRITICKÉ OBDOBÍ - Maximální pozornost na bezpečnost',
          'Nepřehřívejte se v sauně',
          'Mějte po ruce asistenci',
          'Stop při závratích nebo křečích',
        ];
      }

      protocol.push({
        day: 8 - day,
        daysOut: day,
        waterTargetMl: waterTarget,
        sodiumTargetMg: sodiumTarget,
        potassiumTargetMg: potassiumTarget,
        magnesiumTargetMg: magnesiumTarget,
        phase,
        instructions,
        warnings,
      });
    }

    return protocol;
  }

  static generateREGENProtocol(
    weightCut: number,
    hoursUntilFight: number
  ): REGENProtocol[] {
    const protocol: REGENProtocol[] = [];

    if (hoursUntilFight >= 24) {
      protocol.push({
        timeElapsedMinutes: 0,
        taskNumber: 1,
        taskTitle: 'Okamžitá rehydratace (0-90 min)',
        fluidTargetMl: 1500,
        carbsTargetG: 0,
        instructions: [
          'Vypijte 1,5L ORS (Oral Rehydration Solution) v prvních 90 minutách',
          'Používejte elektrolytové roztoky s Na+, K+, Mg2+',
          'Pijte po malých doušcích, ne najednou',
        ],
        completed: false,
      });

      protocol.push({
        timeElapsedMinutes: 90,
        taskNumber: 2,
        taskTitle: 'První jídlo + Glykogen Loading (90-180 min)',
        fluidTargetMl: 1000,
        carbsTargetG: 80,
        proteinTargetG: 30,
        instructions: [
          'Lehce stravitelné sacharidy: Bílá rýže, banány, rýžové koláčky',
          'Cíl: 1,0-1,2 g sacharidů/kg/hodinu',
          'Přidejte malé množství libového proteinu',
          'Vyhněte se tučným jídlům - zpomalují absorpci',
        ],
        completed: false,
      });

      protocol.push({
        timeElapsedMinutes: 180,
        taskNumber: 3,
        taskTitle: 'Pokračování glykogenu (3-6 hodin)',
        fluidTargetMl: 1500,
        carbsTargetG: 120,
        proteinTargetG: 40,
        instructions: [
          'Bílé těstoviny, rýže, brambory',
          'Pokračujte v příjmu vysokoglykemických sacharidů',
          'Udržujte kontinuální hydrataci',
          'Malé množství sodíku pro retenci vody',
        ],
        completed: false,
      });

      protocol.push({
        timeElapsedMinutes: 360,
        taskNumber: 4,
        taskTitle: 'Hlavní jídlo a stabilizace (6-12 hodin)',
        fluidTargetMl: 2000,
        carbsTargetG: 150,
        proteinTargetG: 60,
        instructions: [
          'Plnohodnotné jídlo: Kuřecí prsa, rýže, vařená zelenina',
          'Začněte přidávat zdravé tuky v malém množství',
          'Celkový příjem 70-80% běžných kalorií',
        ],
        completed: false,
      });

      protocol.push({
        timeElapsedMinutes: 720,
        taskNumber: 5,
        taskTitle: 'Večerní stabilizace (12-20 hodin)',
        fluidTargetMl: 1500,
        carbsTargetG: 100,
        proteinTargetG: 40,
        instructions: [
          'Lehčí večeře - vyvarujte se přejídání',
          'Zaměřte se na kvalitní spánek',
          'Kreatin MEGA-DÁVKA: 20g rozdělených do 4 dávek',
          'L-Citrulin: 6-8g pro zlepšení prokrvení',
        ],
        completed: false,
      });

      protocol.push({
        timeElapsedMinutes: 1200,
        taskNumber: 6,
        taskTitle: 'Ranní příprava (20-23 hodin)',
        fluidTargetMl: 500,
        carbsTargetG: 60,
        proteinTargetG: 25,
        instructions: [
          'Lehká snídaně: Ovesná kaše, vajíčka, ovoce',
          'Omezte vlákninu a objem',
          'Udržujte lehkou hydrataci',
        ],
        completed: false,
      });

      protocol.push({
        timeElapsedMinutes: 1380,
        taskNumber: 7,
        taskTitle: 'Poslední příprava (1 hod před zápasem)',
        fluidTargetMl: 250,
        carbsTargetG: 30,
        instructions: [
          'Banán nebo energetická tyčinka',
          'Minimální tekutiny - jen srkat',
          'Fokus na mentální přípravu',
        ],
        completed: false,
      });
    } else {
      protocol.push({
        timeElapsedMinutes: 0,
        taskNumber: 1,
        taskTitle: 'Rychlá rehydratace (0-60 min)',
        fluidTargetMl: 1000,
        carbsTargetG: 50,
        instructions: [
          'RYCHLE - Vypijte 1L ORS do 60 minut',
          'Rychlé sacharidy: Med, banán, glukóza',
          'Cíl: Maximální absorpce v krátkém čase',
        ],
        completed: false,
      });

      protocol.push({
        timeElapsedMinutes: 60,
        taskNumber: 2,
        taskTitle: 'Energetický náboj (1-3 hodiny)',
        fluidTargetMl: 1000,
        carbsTargetG: 80,
        proteinTargetG: 30,
        instructions: [
          'Bílá rýže, kuřecí prsa (minimální množství)',
          'Zaměřte se na rychle stravitelné zdroje',
          'Vyvarujte se tučných a objemných jídel',
        ],
        completed: false,
      });

      protocol.push({
        timeElapsedMinutes: 180,
        taskNumber: 3,
        taskTitle: 'Finální příprava',
        fluidTargetMl: 500,
        carbsTargetG: 40,
        instructions: [
          'Lehký snack: Banán, rýžové koláčky',
          'Pouze srkat vodu',
          'Mentální fokus',
        ],
        completed: false,
      });
    }

    return protocol;
  }

  static getSupplementSchedule(phase: PrepPhase, daysUntilFight?: number): SupplementSchedule[] {
    const schedule: SupplementSchedule[] = [];

    switch (phase) {
      case 'WEIGHT_LOSS':
        schedule.push({
          supplementName: 'Kreatin monohydrát',
          type: 'creatine',
          phase: 'WEIGHT_LOSS',
          dosage: '5g denně',
          timing: 'Ráno s jídlem',
          action: 'maintain',
          reasoning: 'Udržuje svalovou hmotu během deficitu.',
        });
        schedule.push({
          supplementName: 'Multivitamin',
          type: 'vitamins',
          phase: 'WEIGHT_LOSS',
          dosage: '1x denně',
          timing: 'S hlavním jídlem',
          action: 'maintain',
          reasoning: 'Prevence deficitů při kalorické restrikci.',
        });
        schedule.push({
          supplementName: 'Omega-3',
          type: 'other',
          phase: 'WEIGHT_LOSS',
          dosage: '2-3g EPA+DHA',
          timing: 'S jídlem',
          action: 'maintain',
          reasoning: 'Protizánětlivé účinky, podpora regenerace.',
        });
        break;

      case 'WATER_CUT':
        if (daysUntilFight && daysUntilFight <= 7) {
          schedule.push({
            supplementName: 'Kreatin monohydrát',
            type: 'creatine',
            phase: 'WATER_CUT',
            dosage: '0g',
            timing: 'STOP',
            action: 'stop',
            reasoning: 'KRITICKÉ: Kreatin zadržuje vodu v buňkách. OKAMŽITĚ PŘESTAT 7 dní před vážením.',
          });
        }
        schedule.push({
          supplementName: 'Elektrolyty (K+, Mg2+)',
          type: 'electrolytes',
          phase: 'WATER_CUT',
          dosage: 'Hořčík 400mg, Draslík 3000-4000mg',
          timing: 'Rozdělit na celý den',
          action: 'increase',
          reasoning: 'Prevence křečí při manipulaci s vodou a sodíkem.',
        });
        schedule.push({
          supplementName: 'Multivitamin',
          type: 'vitamins',
          phase: 'WATER_CUT',
          dosage: '1x denně',
          timing: 'Ráno',
          action: 'maintain',
          reasoning: 'Podpora imunity ve stresovém období.',
        });
        break;

      case 'RECOVERY':
        schedule.push({
          supplementName: 'Kreatin monohydrát - LOADING',
          type: 'creatine',
          phase: 'RECOVERY',
          dosage: '20g rozdělených na 4 dávky',
          timing: 'Každé 4-6 hodin',
          action: 'start',
          reasoning: 'MEGA-DÁVKA ihned po vážení! Rychlá resaturace svalových buněk vodou.',
        });
        schedule.push({
          supplementName: 'L-Citrulin',
          type: 'other',
          phase: 'RECOVERY',
          dosage: '6-8g',
          timing: 'Během prvních 6 hodin',
          action: 'start',
          reasoning: 'Vazodilatace - urychluje absorpci živin do svalů.',
        });
        schedule.push({
          supplementName: 'Elektrolyty ORS',
          type: 'electrolytes',
          phase: 'RECOVERY',
          dosage: 'Podle protokolu (Na+, K+, Mg2+)',
          timing: 'S každou dávkou vody',
          action: 'increase',
          reasoning: 'Kritické pro rychlou rehydrataci a prevenci křečí.',
        });
        schedule.push({
          supplementName: 'Rychlé sacharidy (Maltodextrin/Glukóza)',
          type: 'other',
          phase: 'RECOVERY',
          dosage: '1,0-1,2 g/kg/hodinu prvních 4-6 hodin',
          timing: 'Kontinuálně prvních 6 hodin',
          action: 'start',
          reasoning: 'Maximální rychlost doplnění glykogenu.',
        });
        break;

      case 'MAINTENANCE':
        schedule.push({
          supplementName: 'Kreatin monohydrát',
          type: 'creatine',
          phase: 'MAINTENANCE',
          dosage: '5g denně',
          timing: 'Kdykoliv',
          action: 'maintain',
          reasoning: 'Standardní udržovací dávka.',
        });
        schedule.push({
          supplementName: 'Protein',
          type: 'protein',
          phase: 'MAINTENANCE',
          dosage: 'Podle potřeby k dosažení 2,0g/kg',
          timing: 'Po tréninku nebo mezi jídly',
          action: 'maintain',
          reasoning: 'Podpora regenerace a udržení svalové hmoty.',
        });
        break;
    }

    return schedule;
  }

  static getPhaseSpecificAdvice(phase: PrepPhase, daysRemaining: number): string[] {
    const advice: string[] = [];

    switch (phase) {
      case 'WEIGHT_LOSS':
        advice.push('Zaměřte se na pomalý, stabilní úbytek váhy (max 1% týdně).');
        advice.push('Udržujte vysoký příjem bílkovin (2,0-2,4 g/kg) pro ochranu svalů.');
        advice.push('Využívejte carb cycling - více sacharidů v dny s vysokou intenzitou tréninku.');
        advice.push('Monitorujte tělesné složení, ne pouze váhu.');
        if (daysRemaining <= 14) {
          advice.push('⚠️ Blížíte se fázi shazování vodou - začněte redukovat intenzitu tréninku.');
        }
        break;

      case 'WATER_CUT':
        advice.push('Přesně dodržujte protokol voda/sodík pro váš den.');
        advice.push('Výrazně snižte objem a intenzitu tréninku.');
        advice.push('Vyhněte se objemným potravinám, zvláště poslední 2-3 dny.');
        advice.push('Monitorujte váhu denně ráno.');
        if (daysRemaining <= 2) {
          advice.push('🔴 KRITICKÁ FÁZE - Maximální pozornost na hydrataci a sodík.');
          advice.push('Zvažte saunování/horké koupele v krátkých intervalech.');
        }
        if (daysRemaining === 1) {
          advice.push('⚠️ FINÁLNÍ CUT - Minimální tekutiny, nulový sodík.');
        }
        break;

      case 'RECOVERY':
        advice.push('PRIORITA 1: Rehydratace pomocí ORS s elektrolyty.');
        advice.push('PRIORITA 2: Vysokoglykemické sacharidy prvních 4-6 hodin.');
        advice.push('Vyvarujte se tučných jídel - zpomalují absorpci.');
        advice.push('OKAMŽITĚ spustit kreatin loading protokol (20g/den).');
        advice.push('L-Citrulin 6-8g pro zlepšení prokrvení a absorpce.');
        break;

      case 'MAINTENANCE':
        advice.push('Udržujte stabilní váhu a formu.');
        advice.push('Zaměřte se na kvalitu tréninku a regeneraci.');
        advice.push('Zvažte plánování dalšího zápasu.');
        break;
    }

    return advice;
  }

  static getSafetyWarnings(phase: PrepPhase, daysRemaining: number, weeklyWeightLoss?: number): string[] {
    const warnings: string[] = [];

    if (phase === 'WEIGHT_LOSS' && weeklyWeightLoss && weeklyWeightLoss > 1.0) {
      warnings.push('⚠️ NEBEZPEČNÉ TEMPO: Váš týdenní úbytek překračuje 1% tělesné hmotnosti.');
      warnings.push('🔴 RIZIKO: Ztráta svalové hmoty a výkonu.');
      warnings.push('✅ AKCE: Zvyšte kalorický příjem o 200-300 kcal denně.');
    }

    if (phase === 'WATER_CUT' && daysRemaining <= 2) {
      warnings.push('⚠️ KRITICKÁ FÁZE: Maximální pozornost na signály těla.');
      warnings.push('STOP při: Závratích, křečích, extrémní slabosti.');
      warnings.push('Mějte k dispozici asistenci při saunování.');
    }

    if (phase === 'WATER_CUT' && daysRemaining === 1) {
      warnings.push('🔴 FINÁLNÍ CUT: Toto je nejrizikovější den.');
      warnings.push('Nepřehřívejte se - sauna max 15-20 min s přestávkami.');
      warnings.push('Okamžitě ukončete při zdravotních problémech.');
    }

    return warnings;
  }
}
