import {
  buildAdminContentSectionSummaries,
  countPublishBlockers,
} from '@/src/admin/contentDashboard';
import { type ContentApiResponse } from '@/src/contracts/contentApi';
import { buildStaticContentApiResponse } from '@/src/data/contentRuntime';

function cloneStaticPayload(): ContentApiResponse {
  return JSON.parse(JSON.stringify(buildStaticContentApiResponse())) as ContentApiResponse;
}

describe('contentDashboard', () => {
  test('builds admin summaries for the four MVP sections', () => {
    const sections = buildAdminContentSectionSummaries();

    expect(sections.map((section) => section.id)).toEqual([
      'products',
      'care',
      'trip',
      'audio',
    ]);
    expect(sections.every((section) => section.totalCount > 0)).toBe(true);
    expect(countPublishBlockers(sections)).toBe(0);
  });

  test('counts draft and paused rows separately', () => {
    const payload = cloneStaticPayload();
    payload.care.intents[0].status = 'draft';
    payload.audio.tracks[0].status = 'paused';

    const sections = buildAdminContentSectionSummaries(payload);

    expect(sections.find((section) => section.id === 'care')?.draftCount).toBe(1);
    expect(sections.find((section) => section.id === 'audio')?.pausedCount).toBe(1);
  });

  test('reports trip publish blockers in the dashboard summary', () => {
    const payload = cloneStaticPayload();
    payload.trip.themes[0].music_id = 'missing_music';

    const sections = buildAdminContentSectionSummaries(payload);
    const trip = sections.find((section) => section.id === 'trip');

    expect(trip?.publishBlockers).toEqual([
      expect.stringContaining('missing music'),
    ]);
    expect(countPublishBlockers(sections)).toBe(1);
  });
});
