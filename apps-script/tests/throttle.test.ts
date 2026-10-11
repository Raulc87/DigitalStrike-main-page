import { describe, expect, it } from 'vitest';
import { loadAppsScript } from './helpers/loadAppsScript';

const gs = loadAppsScript();
const config = gs.readConfig({});
const NOW = new Date('2026-10-14T18:00:00Z'); // 12:00:00 in Costa Rica

function at(minutesAgo: number, email = 'other@example.com') {
  return {
    submittedAt: gs.formatCostaRicaDateTime(new Date(NOW.getTime() - minutesAgo * 60000)),
    email,
  };
}

describe('checkThrottles (contract §5.3)', () => {
  it('reads max(daily, hourly) + 1 rows', () => {
    expect(gs.throttleRowsToRead(config)).toBe(41);
  });

  it('allows when below every limit', () => {
    expect(
      gs.checkThrottles(
        [at(1, 'ana@example.com'), at(2, 'ana@example.com')],
        'ana@example.com',
        NOW,
        config,
      ),
    ).toEqual({ limited: false });
  });

  it('limits a 4th lead from the same email within 60 minutes', () => {
    const rows = [at(50, 'ana@example.com'), at(30, 'ana@example.com'), at(10, 'ana@example.com')];
    const r = gs.checkThrottles(rows, 'ana@example.com', NOW, config);
    expect(r.limited).toBe(true);
    // The oldest of the three leaves the window in 10 minutes.
    expect(r.retryAfterSeconds).toBe(600);
  });

  it('compares stored emails without a guard apostrophe and ignores other emails and older rows', () => {
    const rows = [
      at(61, 'ana@example.com'),
      at(30, "'ana@example.com"),
      at(10, 'ana@example.com'),
      at(5),
    ];
    expect(gs.checkThrottles(rows, 'ana@example.com', NOW, config).limited).toBe(false);
    rows.push(at(1, 'ana@example.com'));
    expect(gs.checkThrottles(rows, 'ana@example.com', NOW, config).limited).toBe(true);
  });

  it('limits the 21st lead within 60 minutes globally', () => {
    const rows = Array.from({ length: 20 }, (_, i) => at(59 - i));
    const r = gs.checkThrottles(rows, 'new@example.com', NOW, config);
    expect(r).toEqual({ limited: true, retryAfterSeconds: 60 });
    expect(gs.checkThrottles(rows.slice(1), 'new@example.com', NOW, config).limited).toBe(false);
  });

  it('limits the 41st lead of the Costa Rica calendar day until midnight', () => {
    // 40 leads today, spread so the hourly cap is not reached (one every 15 min since 01:00).
    const rows = Array.from({ length: 40 }, (_, i) => at(660 - i * 15 - 15)).filter((r) =>
      r.submittedAt.startsWith('2026-10-14'),
    );
    expect(rows).toHaveLength(40);
    const r = gs.checkThrottles(rows, 'new@example.com', NOW, config);
    expect(r).toEqual({ limited: true, retryAfterSeconds: 12 * 3600 });
  });

  it('does not count yesterday (Costa Rica) toward the daily cap', () => {
    const yesterday = Array.from({ length: 40 }, () => ({
      submittedAt: '2026-10-13 23:59:59',
      email: 'x@example.com',
    }));
    expect(gs.checkThrottles(yesterday, 'new@example.com', NOW, config).limited).toBe(false);
  });

  it('returns the longest wait when several limits are exceeded', () => {
    const small = gs.readConfig({ MAX_LEADS_PER_DAY: '2', MAX_LEADS_PER_EMAIL_PER_HOUR: '1' });
    const r = gs.checkThrottles([at(30, 'ana@example.com'), at(20)], 'ana@example.com', NOW, small);
    expect(r).toEqual({ limited: true, retryAfterSeconds: 12 * 3600 });
  });

  it('ignores rows whose submitted_at cannot be parsed', () => {
    const rows = Array.from({ length: 50 }, () => ({ submittedAt: '', email: 'ana@example.com' }));
    expect(gs.checkThrottles(rows, 'ana@example.com', NOW, config).limited).toBe(false);
  });
});
