import { describe, expect, it } from 'vitest';
import { photoWidths } from '../../src/components/sections/photoWidths';

// US-022 AC2: 2× only when the source is at least twice the displayed size; never upscaled.
describe('photoWidths', () => {
  it('gives 1× only for the current 200 px source', () => {
    expect(photoWidths(200, 200)).toEqual([200]);
  });

  it('never upscales a source smaller than the displayed size', () => {
    expect(photoWidths(200, 150)).toEqual([]);
  });

  it('gives 1× only just below twice the displayed size', () => {
    expect(photoWidths(200, 399)).toEqual([200]);
  });

  it('adds the 2× variant from exactly twice the displayed size', () => {
    expect(photoWidths(200, 400)).toEqual([200, 400]);
  });

  it('caps a larger source (800×800) at the 2× variant', () => {
    expect(photoWidths(200, 800)).toEqual([200, 400]);
  });
});
