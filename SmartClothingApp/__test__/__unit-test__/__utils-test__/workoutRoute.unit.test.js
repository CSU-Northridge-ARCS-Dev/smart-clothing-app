/**
 * @file workoutRoute.unit.test.js
 * Zone grouping, map framing and heart rate chart placement for the Workout page.
 */
import {
  groupByZone,
  routeSegments,
  routeMapHtml,
  heartRateChart,
  monthOf,
} from '../../../src/utils/workoutRoute';

const p = (t, zone, lat = null, lon = null, bpm = 120) => ({ t, lat, lon, bpm, zone });

describe('groupByZone', () => {
  it('groups consecutive points in the same zone, sharing the boundary point', () => {
    const points = [p(0, 'fatBurn'), p(1, 'fatBurn'), p(2, 'cardio'), p(3, 'cardio'), p(4, 'peak')];
    const groups = groupByZone(points);
    expect(groups.map((g) => g.zone)).toEqual(['fatBurn', 'cardio', 'peak']);
    expect(groups.map((g) => g.points.map((x) => x.t))).toEqual([
      [0, 1],
      [1, 2, 3],
      [3, 4],
    ]);
  });

  it('treats a point without a zone as outOfRange', () => {
    expect(groupByZone([p(0, null), p(1, 'outOfRange')])).toEqual([
      { zone: 'outOfRange', points: [p(0, null), p(1, 'outOfRange')] },
    ]);
  });

  it('returns no groups for no points', () => {
    expect(groupByZone([])).toEqual([]);
    expect(groupByZone(undefined)).toEqual([]);
  });
});

describe('routeSegments', () => {
  it('turns GPS points into map coordinates per zone and skips points without a position', () => {
    const segments = routeSegments([
      p(0, 'fatBurn', 34.1, -118.1),
      p(1, 'fatBurn'),
      p(2, 'cardio', 34.2, -118.2),
    ]);
    expect(segments).toEqual([
      { zone: 'fatBurn', coordinates: [{ latitude: 34.1, longitude: -118.1 }] },
      {
        zone: 'cardio',
        coordinates: [
          { latitude: 34.1, longitude: -118.1 },
          { latitude: 34.2, longitude: -118.2 },
        ],
      },
    ]);
  });
});

describe('routeMapHtml', () => {
  const COLORS = { outOfRange: '#111111', cardio: '#222222', peak: '#333333' };

  it('draws one colored line per zone run and fits the map to the route', () => {
    const html = routeMapHtml(
      [
        { zone: 'cardio', coordinates: [{ latitude: 34.1, longitude: -118.1 }] },
        {
          zone: 'peak',
          coordinates: [
            { latitude: 34.1, longitude: -118.1 },
            { latitude: 34.2, longitude: -118.2 },
          ],
        },
      ],
      COLORS
    );
    expect(html).toContain(
      '[{"color":"#222222","latlngs":[[34.1,-118.1]]},' +
        '{"color":"#333333","latlngs":[[34.1,-118.1],[34.2,-118.2]]}]'
    );
    expect(html).toContain('leaflet@1.9.4');
    expect(html).toContain('basemaps.cartocdn.com');
    expect(html).toContain('OpenStreetMap');
    expect(html).toContain('map.fitBounds(bounds');
  });

  it('falls back to the out-of-range color for an unknown zone', () => {
    const html = routeMapHtml(
      [{ zone: 'mystery', coordinates: [{ latitude: 1, longitude: 2 }] }],
      COLORS
    );
    expect(html).toContain('"color":"#111111"');
  });

  it('is null without coordinates', () => {
    expect(routeMapHtml([], COLORS)).toBeNull();
    expect(routeMapHtml([{ zone: 'cardio', coordinates: [] }], COLORS)).toBeNull();
    expect(routeMapHtml(undefined, COLORS)).toBeNull();
  });
});

describe('heartRateChart', () => {
  it('places points by time across and bpm up', () => {
    const chart = heartRateChart(
      [p(0, 'fatBurn', null, null, 100), p(50, 'cardio', null, null, 150), p(100, 'peak', null, null, 200)],
      200,
      100
    );
    expect(chart.minBpm).toBe(100);
    expect(chart.maxBpm).toBe(200);
    const placed = chart.groups.flatMap((g) => g.points);
    expect(placed[0]).toMatchObject({ x: 0, y: 100 });
    expect(chart.groups[1].points[1]).toMatchObject({ x: 100, y: 50 });
    expect(placed[placed.length - 1]).toMatchObject({ x: 200, y: 0 });
    expect(chart.groups.map((g) => g.zone)).toEqual(['fatBurn', 'cardio', 'peak']);
  });

  it('skips points without a bpm', () => {
    const chart = heartRateChart(
      [p(0, 'cardio', null, null, 140), p(5, null, null, null, null), p(10, 'cardio', null, null, 150)],
      100,
      50
    );
    expect(chart.groups[0].points).toHaveLength(2);
  });

  it('is null with fewer than two readings or no size yet', () => {
    expect(heartRateChart([p(0, 'cardio')], 100, 50)).toBeNull();
    expect(heartRateChart([p(0, 'cardio'), p(1, 'cardio')], 0, 50)).toBeNull();
  });

  it('draws a flat line when the bpm never changes', () => {
    const chart = heartRateChart([p(0, 'cardio'), p(10, 'cardio')], 100, 50);
    expect(chart.groups[0].points.map((x) => x.y)).toEqual([50, 50]);
  });
});

describe('monthOf', () => {
  it('returns the YYYY-MM of a date', () => {
    expect(monthOf('2026-10-11')).toBe('2026-10');
    expect(monthOf(undefined)).toBeNull();
  });
});
