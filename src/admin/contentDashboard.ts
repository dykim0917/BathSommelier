import { type ContentApiResponse, type ContentApiStatus } from '@/src/contracts/contentApi';
import { buildStaticContentApiResponse } from '@/src/data/contentRuntime';

export type AdminContentSectionId = 'products' | 'care' | 'trip' | 'audio';

export interface AdminContentSectionSummary {
  id: AdminContentSectionId;
  title: string;
  subtitle: string;
  totalCount: number;
  activeCount: number;
  draftCount: number;
  pausedCount: number;
  retiredCount: number;
  publishBlockers: string[];
}

interface StatusCountable {
  status?: ContentApiStatus | 'active' | 'paused' | 'retired';
}

function countByStatus(items: StatusCountable[]) {
  return items.reduce(
    (acc, item) => {
      const status = item.status ?? 'active';
      if (status === 'active') acc.activeCount += 1;
      if (status === 'draft') acc.draftCount += 1;
      if (status === 'paused') acc.pausedCount += 1;
      if (status === 'retired') acc.retiredCount += 1;
      return acc;
    },
    {
      activeCount: 0,
      draftCount: 0,
      pausedCount: 0,
      retiredCount: 0,
    }
  );
}

function buildSectionSummary(
  section: Pick<AdminContentSectionSummary, 'id' | 'title' | 'subtitle'>,
  items: StatusCountable[],
  publishBlockers: string[] = []
): AdminContentSectionSummary {
  return {
    ...section,
    totalCount: items.length,
    ...countByStatus(items),
    publishBlockers,
  };
}

function findCarePublishBlockers(payload: ContentApiResponse): string[] {
  return payload.care.intents
    .filter((intent) => intent.status === 'active')
    .filter((intent) => {
      const options = payload.care.subprotocols[intent.intent_id] ?? [];
      return !options.some(
        (option) => option.status === 'active' && option.id === intent.default_subprotocol_id
      );
    })
    .map((intent) => `Care intent ${intent.intent_id} has no active default subprotocol`);
}

function findTripPublishBlockers(payload: ContentApiResponse): string[] {
  const activeAudioIds = new Set(
    payload.audio.tracks.filter((track) => track.status === 'active').map((track) => track.id)
  );
  const blockers: string[] = [];

  for (const theme of payload.trip.themes.filter((item) => item.status === 'active')) {
    if (!activeAudioIds.has(theme.music_id)) {
      blockers.push(`Trip theme ${theme.id} references missing music ${theme.music_id}`);
    }
    if (!activeAudioIds.has(theme.ambience_id)) {
      blockers.push(`Trip theme ${theme.id} references missing ambience ${theme.ambience_id}`);
    }
  }

  return blockers;
}

export function buildAdminContentSectionSummaries(
  payload: ContentApiResponse = buildStaticContentApiResponse()
): AdminContentSectionSummary[] {
  const productItems = [
    ...payload.catalog.canonical_products,
    ...payload.catalog.match_rules,
    ...payload.catalog.presentations.map((item) => ({ ...item, status: 'active' as const })),
  ];
  const careItems = [
    ...payload.care.intents,
    ...Object.values(payload.care.subprotocols).flat(),
  ];
  const tripItems = [
    ...payload.trip.themes,
    ...payload.trip.intents,
    ...Object.values(payload.trip.subprotocols).flat(),
  ];

  return [
    buildSectionSummary(
      {
        id: 'products',
        title: '제품',
        subtitle: '상품, 구매처, 추천 규칙',
      },
      productItems
    ),
    buildSectionSummary(
      {
        id: 'care',
        title: '케어 루틴',
        subtitle: '의도 카드와 세부 루틴',
      },
      careItems,
      findCarePublishBlockers(payload)
    ),
    buildSectionSummary(
      {
        id: 'trip',
        title: '무드 루틴',
        subtitle: '테마, 의도 카드, 세부 루틴',
      },
      tripItems,
      findTripPublishBlockers(payload)
    ),
    buildSectionSummary(
      {
        id: 'audio',
        title: '음악',
        subtitle: '음악과 앰비언스 트랙',
      },
      payload.audio.tracks
    ),
  ];
}

export function countPublishBlockers(sections: AdminContentSectionSummary[]): number {
  return sections.reduce((total, section) => total + section.publishBlockers.length, 0);
}
