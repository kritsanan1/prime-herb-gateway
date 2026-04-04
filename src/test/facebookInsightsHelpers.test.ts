import { describe, it, expect } from 'vitest';

interface InsightValue {
  end_time: string;
  value: number;
}
interface InsightMetric {
  name: string;
  period: string;
  values: InsightValue[];
  title: string;
}

function metricTotal(metrics: InsightMetric[], name: string): number {
  const m = metrics.find(x => x.name === name);
  if (!m) return 0;
  return m.values.reduce((s, v) => s + (v.value || 0), 0);
}

function metricSeries(metrics: InsightMetric[], name: string) {
  const m = metrics.find(x => x.name === name);
  if (!m) return [];
  return m.values.map(v => ({
    date: new Date(v.end_time).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
    value: v.value || 0,
  }));
}

const mockMetrics: InsightMetric[] = [
  {
    name: 'page_impressions',
    period: 'day',
    title: 'Daily Impressions',
    values: [
      { end_time: '2024-01-01T00:00:00Z', value: 100 },
      { end_time: '2024-01-02T00:00:00Z', value: 200 },
      { end_time: '2024-01-03T00:00:00Z', value: 150 },
    ],
  },
  {
    name: 'page_impressions_unique',
    period: 'day',
    title: 'Daily Reach',
    values: [
      { end_time: '2024-01-01T00:00:00Z', value: 80 },
      { end_time: '2024-01-02T00:00:00Z', value: 120 },
    ],
  },
  {
    name: 'page_engaged_users',
    period: 'day',
    title: 'Engaged Users',
    values: [
      { end_time: '2024-01-01T00:00:00Z', value: 0 },
      { end_time: '2024-01-02T00:00:00Z', value: 45 },
    ],
  },
];

describe('metricTotal', () => {
  it('returns sum of values for a known metric', () => {
    expect(metricTotal(mockMetrics, 'page_impressions')).toBe(450);
  });

  it('returns correct sum for reach metric', () => {
    expect(metricTotal(mockMetrics, 'page_impressions_unique')).toBe(200);
  });

  it('returns 0 for unknown metric name', () => {
    expect(metricTotal(mockMetrics, 'page_fan_adds')).toBe(0);
  });

  it('returns 0 for empty metrics array', () => {
    expect(metricTotal([], 'page_impressions')).toBe(0);
  });

  it('handles zero values correctly', () => {
    expect(metricTotal(mockMetrics, 'page_engaged_users')).toBe(45);
  });
});

describe('metricSeries', () => {
  it('returns array of date/value pairs', () => {
    const series = metricSeries(mockMetrics, 'page_impressions');
    expect(series).toHaveLength(3);
    expect(series[0]).toHaveProperty('date');
    expect(series[0]).toHaveProperty('value');
    expect(series[0].value).toBe(100);
    expect(series[1].value).toBe(200);
    expect(series[2].value).toBe(150);
  });

  it('returns empty array for unknown metric', () => {
    const series = metricSeries(mockMetrics, 'page_nonexistent');
    expect(series).toEqual([]);
  });

  it('returns empty array for empty metrics', () => {
    expect(metricSeries([], 'page_impressions')).toEqual([]);
  });

  it('treats falsy values as 0', () => {
    const metrics: InsightMetric[] = [{
      name: 'test',
      period: 'day',
      title: 'Test',
      values: [{ end_time: '2024-01-01T00:00:00Z', value: 0 }],
    }];
    const series = metricSeries(metrics, 'test');
    expect(series[0].value).toBe(0);
  });
});
