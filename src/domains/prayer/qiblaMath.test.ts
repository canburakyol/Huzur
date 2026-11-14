import { describe, expect, it } from 'vitest';
import { calculateQiblaDirection, distanceToKaabaKm, turnToQibla } from './qiblaMath';

describe('qiblaMath', () => {
  it('gives the known qibla bearing and distance for Istanbul', () => {
    expect(calculateQiblaDirection(41.0082, 28.9784)).toBeCloseTo(151.6, 0);
    expect(distanceToKaabaKm(41.0082, 28.9784)).toBeGreaterThan(2350);
    expect(distanceToKaabaKm(41.0082, 28.9784)).toBeLessThan(2450);
  });

  it('turns the short way round, signed right-positive', () => {
    expect(turnToQibla(100, 144)).toBe(44);
    expect(turnToQibla(200, 144)).toBe(-56);
    expect(turnToQibla(350, 10)).toBe(20);
    expect(turnToQibla(10, 350)).toBe(-20);
    expect(Math.abs(turnToQibla(144, 144))).toBe(0);
  });
});
