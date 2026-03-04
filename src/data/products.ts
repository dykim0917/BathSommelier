export type ProductCategory = 'all' | 'essential_oil' | 'bath_salt' | 'herb';

export interface ProductItem {
  id: string;
  name: string;
  brand: string;
  description: string;
  category: Exclude<ProductCategory, 'all'>;
  tags: string[];
  emoji: string;
  bgColor: string;
}

export const PRODUCTS: ProductItem[] = [
  // ── 에센셜 오일 ──────────────────────────────────────
  {
    id: 'p_lavender_eo',
    name: '라벤더 에센셜 오일',
    brand: '퓨어센스',
    description: '깊은 수면과 이완을 도와주는 꽃향기',
    category: 'essential_oil',
    tags: ['수면', '이완', '스트레스'],
    emoji: '🌿',
    bgColor: '#E8E1F9',
  },
  {
    id: 'p_eucalyptus_eo',
    name: '유칼립투스 에센셜 오일',
    brand: '아로마랩',
    description: '시원한 청량감으로 호흡을 열어줘요',
    category: 'essential_oil',
    tags: ['호흡', '감기', '집중'],
    emoji: '🍃',
    bgColor: '#D8ECDE',
  },
  {
    id: 'p_peppermint_eo',
    name: '페퍼민트 에센셜 오일',
    brand: '아로마랩',
    description: '두통과 피로 해소에 효과적이에요',
    category: 'essential_oil',
    tags: ['두통', '피로', '집중'],
    emoji: '✨',
    bgColor: '#D8ECDE',
  },
  {
    id: 'p_rosemary_eo',
    name: '로즈마리 에센셜 오일',
    brand: '퓨어센스',
    description: '혈액순환과 근육 활성화에 좋아요',
    category: 'essential_oil',
    tags: ['순환', '근육', '활력'],
    emoji: '🌱',
    bgColor: '#DCE6F8',
  },
  // ── 입욕소금 ──────────────────────────────────────
  {
    id: 'p_himalayan_salt',
    name: '히말라야 핑크 솔트',
    brand: '바스젠',
    description: '미네랄이 풍부한 천연 암염이에요',
    category: 'bath_salt',
    tags: ['혈액순환', '근육', '미네랄'],
    emoji: '🧂',
    bgColor: '#F0D5BC',
  },
  {
    id: 'p_dead_sea_salt',
    name: '데드씨 솔트',
    brand: '미네라인',
    description: '피부 정화와 이완에 효과적이에요',
    category: 'bath_salt',
    tags: ['피부', '해독', '이완'],
    emoji: '💎',
    bgColor: '#AECDE0',
  },
  {
    id: 'p_epsom_salt',
    name: '엡솜 솔트',
    brand: '바스젠',
    description: '근육통 완화와 부기 제거에 좋아요',
    category: 'bath_salt',
    tags: ['근육통', '부기', '회복'],
    emoji: '💪',
    bgColor: '#B5D5C0',
  },
  {
    id: 'p_eucalyptus_salt',
    name: '유칼립투스 배스 솔트',
    brand: '미네라인',
    description: '감기 기운에 청량한 솔트 배스',
    category: 'bath_salt',
    tags: ['감기', '호흡', '청량'],
    emoji: '❄️',
    bgColor: '#D8ECDE',
  },
  // ── 허브 ──────────────────────────────────────────
  {
    id: 'p_chamomile',
    name: '캐모마일 드라이 허브',
    brand: '허브림',
    description: '수면과 이완에 탁월한 허브예요',
    category: 'herb',
    tags: ['수면', '이완', '소화'],
    emoji: '🌼',
    bgColor: '#F5E5A3',
  },
  {
    id: 'p_lavender_herb',
    name: '라벤더 드라이 허브',
    brand: '허브림',
    description: '스트레스와 불안을 가라앉혀요',
    category: 'herb',
    tags: ['수면', '스트레스', '진정'],
    emoji: '💜',
    bgColor: '#E8E1F9',
  },
  {
    id: 'p_rose_petal',
    name: '로즈 페탈',
    brand: '플로랄베스',
    description: '피부 케어와 기분 전환에 좋아요',
    category: 'herb',
    tags: ['피부', '기분', '여성'],
    emoji: '🌸',
    bgColor: '#F0C5CC',
  },
];

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  all: '전체',
  essential_oil: '에센셜 오일',
  bath_salt: '입욕소금',
  herb: '허브',
};

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'all',
  'essential_oil',
  'bath_salt',
  'herb',
];
