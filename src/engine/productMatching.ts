import { BathEnvironment, BathRecommendation, Ingredient } from './types';

export type ProductSlot = 'A' | 'B' | 'C';
export type ProductMechanism = 'bicarbonate' | 'magnesium' | 'aromatic' | 'neutral';
export type ProductPriceTier = 'low' | 'mid' | 'high';

export interface ProductMatchItem {
  slot: ProductSlot;
  ingredient: Ingredient;
  mechanism: ProductMechanism;
  reason: string;
  priceTier: ProductPriceTier;
  sommelierPick: boolean;
}

function normalizeEnvironment(environment: BathEnvironment): 'bathtub' | 'shower' {
  if (environment === 'shower') return 'shower';
  return 'bathtub';
}

function resolveMechanism(ingredient: Ingredient): ProductMechanism {
  if (ingredient.id.includes('carbonated')) return 'bicarbonate';
  if (ingredient.id.includes('epsom')) return 'magnesium';
  if (
    ingredient.id.includes('oil') ||
    ingredient.id.includes('steamer') ||
    ingredient.id.includes('body_wash')
  ) {
    return 'aromatic';
  }
  return 'neutral';
}

function isEnvironmentCompatible(
  ingredient: Ingredient,
  environment: BathEnvironment
): boolean {
  const normalized = normalizeEnvironment(environment);

  if (normalized === 'shower') {
    return (
      ingredient.id.includes('shower_steamer') ||
      ingredient.id.includes('body_wash') ||
      ingredient.id.includes('carbonated')
    );
  }

  return !(
    ingredient.id.includes('shower_steamer') || ingredient.id.includes('body_wash')
  );
}

function pickByMechanism(
  candidates: Array<{ ingredient: Ingredient; mechanism: ProductMechanism }>,
  preferred: ProductMechanism[],
  usedIds: Set<string>
): { ingredient: Ingredient; mechanism: ProductMechanism } | null {
  for (const mechanism of preferred) {
    const found = candidates.find(
      (item) => item.mechanism === mechanism && !usedIds.has(item.ingredient.id)
    );
    if (found) return found;
  }

  const fallback = candidates.find((item) => !usedIds.has(item.ingredient.id));
  return fallback ?? null;
}

function ensureThreeSlots(
  compatible: Array<{ ingredient: Ingredient; mechanism: ProductMechanism }>
): Array<{ ingredient: Ingredient; mechanism: ProductMechanism }> {
  if (compatible.length === 0) return [];

  const items = [...compatible];
  while (items.length < 3) {
    items.push(items[items.length - 1]);
  }
  return items;
}

export function buildProductMatchingSlots(
  recommendation: BathRecommendation,
  environment: BathEnvironment
): ProductMatchItem[] {
  const compatible = ensureThreeSlots(
    recommendation.ingredients
      .filter((ingredient) => isEnvironmentCompatible(ingredient, environment))
      .map((ingredient) => ({
        ingredient,
        mechanism: resolveMechanism(ingredient),
      }))
  );

  if (compatible.length === 0) {
    return [];
  }

  const usedIds = new Set<string>();
  const mode = recommendation.mode === 'trip' ? 'recovery' : recommendation.persona === 'P4_SLEEP' ? 'sleep' : 'recovery';

  const slotAPrefer: ProductMechanism[] =
    mode === 'sleep' ? ['bicarbonate', 'magnesium', 'aromatic', 'neutral'] : ['magnesium', 'bicarbonate', 'aromatic', 'neutral'];

  const slotA = pickByMechanism(compatible, slotAPrefer, usedIds) ?? compatible[0];
  usedIds.add(slotA.ingredient.id);

  const slotB = pickByMechanism(compatible, ['aromatic', 'neutral', 'bicarbonate', 'magnesium'], usedIds) ?? compatible[1];
  usedIds.add(slotB.ingredient.id);

  const slotC = pickByMechanism(compatible, ['neutral', 'bicarbonate', 'magnesium', 'aromatic'], usedIds) ?? compatible[2];

  return [
    {
      slot: 'A',
      ingredient: slotA.ingredient,
      mechanism: slotA.mechanism,
      reason: slotA.mechanism === 'magnesium' ? '회복 중심 기전 대표' : slotA.mechanism === 'bicarbonate' ? '수면/이완 기전 대표' : '핵심 루틴 대표',
      priceTier: 'high',
      sommelierPick: true,
    },
    {
      slot: 'B',
      ingredient: slotB.ingredient,
      mechanism: slotB.mechanism,
      reason: '향/감성 중심 보조 옵션',
      priceTier: 'mid',
      sommelierPick: false,
    },
    {
      slot: 'C',
      ingredient: slotC.ingredient,
      mechanism: slotC.mechanism,
      reason: '가성비 대안 옵션',
      priceTier: 'low',
      sommelierPick: false,
    },
  ];
}
