import { readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// US-006 AC2 / US-021 AC1: showroom screenshots are 1200×750 JPGs of at most 200 KB.
const files = ['gaby', 'cami', 'poliart'] as const;

/** Width and height from the JPEG's start-of-frame marker (no image library needed). */
function jpegSize(buffer: Buffer): { width: number; height: number } {
  expect(buffer[0]).toBe(0xff);
  expect(buffer[1]).toBe(0xd8); // SOI
  let offset = 2;
  while (offset < buffer.length) {
    expect(buffer[offset]).toBe(0xff);
    const marker = buffer[offset + 1]!;
    const length = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  throw new Error('no start-of-frame marker found');
}

describe.each(files)('public/images/work/%s.jpg', (name) => {
  const path = new URL(`../../public/images/work/${name}.jpg`, import.meta.url);

  it('is a 1200×750 JPEG', () => {
    expect(jpegSize(readFileSync(path))).toEqual({ width: 1200, height: 750 });
  });

  it('is at most 200 KB', () => {
    expect(statSync(path).size).toBeLessThanOrEqual(200 * 1024);
  });
});
