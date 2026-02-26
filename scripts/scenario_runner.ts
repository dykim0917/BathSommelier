import { generateCareRecommendation, generateTripRecommendation } from '../src/engine/recommend';
import { UserProfile, BathEnvironment, DailyTag } from '../src/engine/types';

function makeProfile(env: BathEnvironment, conditions: UserProfile['healthConditions']): UserProfile {
  const now = new Date().toISOString();
  return { bathEnvironment: env, healthConditions: conditions, onboardingComplete: true, createdAt: now, updatedAt: now };
}

const personas = [
  { name: 'P01 이현수', profile: makeProfile('bathtub', ['none']), tags: ['muscle_pain'] as DailyTag[], mode: 'care' as const, env: 'bathtub' as const },
  { name: 'P02 김지영', profile: makeProfile('shower', ['pregnant']), tags: ['insomnia'] as DailyTag[], mode: 'care' as const, env: 'shower' as const },
  { name: 'P03 박영호', profile: makeProfile('footbath', ['hypertension_heart']), tags: ['cold', 'swelling'] as DailyTag[], mode: 'care' as const, env: 'footbath' as const },
  { name: 'P04 최수민', profile: makeProfile('bathtub', ['none']), tags: ['hangover'] as DailyTag[], mode: 'care' as const, env: 'bathtub' as const },
  { name: 'P05 정혜린', profile: makeProfile('partial_bath', ['sensitive_skin']), tags: ['stress', 'insomnia'] as DailyTag[], mode: 'care' as const, env: 'partial_bath' as const },
  { name: 'P06 손민준', profile: makeProfile('bathtub', ['diabetes']), tags: ['muscle_pain'] as DailyTag[], mode: 'care' as const, env: 'bathtub' as const },
  { name: 'P07 강서연', profile: makeProfile('shower', ['none']), tags: ['swelling', 'muscle_pain'] as DailyTag[], mode: 'care' as const, env: 'shower' as const },
  { name: 'P08 윤태준', profile: makeProfile('bathtub', ['hypertension_heart', 'diabetes']), tags: [], mode: 'trip' as const, env: 'bathtub' as const, themeId: 'kyoto_forest' as const },
];

for (const p of personas) {
  const rec = p.mode === 'trip'
    ? generateTripRecommendation(p.profile, (p as any).themeId, p.env)
    : generateCareRecommendation(p.profile, p.tags, p.env);

  console.log(`\n=== ${p.name} ===`);
  console.log(`persona: ${rec.persona}`);
  console.log(`mode: ${rec.mode}${rec.themeTitle ? ' / ' + rec.themeTitle : ''}`);
  console.log(`bathType: ${rec.bathType}`);
  console.log(`temperature: ${rec.temperature.min}~${rec.temperature.max}°C (권장 ${rec.temperature.recommended}°C)`);
  console.log(`duration: ${rec.durationMinutes !== null ? rec.durationMinutes + '분' : '제한없음'}`);
  console.log(`ingredients: ${rec.ingredients.map(i => `${i.nameKo}(${i.id})`).join(', ')}`);
  console.log(`lighting: ${rec.lighting}`);
  console.log(`safetyWarnings: ${rec.safetyWarnings.length > 0 ? rec.safetyWarnings.join(' | ') : '없음'}`);
  console.log(`environmentHints: ${rec.environmentHints.length > 0 ? rec.environmentHints.join(' | ') : '없음'}`);
  console.log(`colorHex: ${rec.colorHex}`);
}
