import { describe, expect, it } from 'vitest';
import { SubmissionIdTracker } from '../../src/lib/lead/submission';

// Contract §5.4: same id for retries of an unchanged payload; new id after a success and whenever
// a field changes after an attempt was sent.

function counter() {
  let n = 0;
  return () => `id-${++n}`;
}

describe('SubmissionIdTracker', () => {
  it('keeps the id across retries of an unchanged payload', () => {
    const tracker = new SubmissionIdTracker(counter());
    expect(tracker.forAttempt()).toBe('id-1');
    expect(tracker.forAttempt()).toBe('id-1');
  });

  it('edits before any attempt keep the id', () => {
    const tracker = new SubmissionIdTracker(counter());
    tracker.edited();
    tracker.edited();
    expect(tracker.forAttempt()).toBe('id-1');
  });

  it('renews the id when a field changes after a sent attempt, once', () => {
    const tracker = new SubmissionIdTracker(counter());
    tracker.forAttempt();
    tracker.edited();
    expect(tracker.current).toBe('id-2');
    tracker.edited();
    expect(tracker.forAttempt()).toBe('id-2');
  });

  it('renews the id after a success', () => {
    const tracker = new SubmissionIdTracker(counter());
    tracker.forAttempt();
    tracker.succeeded();
    expect(tracker.forAttempt()).toBe('id-2');
  });

  it('uses crypto.randomUUID (v4) by default', () => {
    expect(new SubmissionIdTracker().current).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});
