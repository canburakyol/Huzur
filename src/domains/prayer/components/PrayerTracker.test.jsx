import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PrayerTracker from './PrayerTracker';
import { normalizePrayerTrackerCounts } from './prayerTrackerState';

const storageMock = vi.hoisted(() => ({ getItem: vi.fn(), setItem: vi.fn() }));

vi.mock('../../../services/storageService', () => ({ storageService: storageMock }));
vi.mock('../../../components/shared/IslamicBackButton', () => ({ default: ({ onClick }) => <button type="button" onClick={onClick}>Geri</button> }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key, fallback, options) => options?.count != null ? fallback.replace('{{count}}', options.count) : fallback,
  }),
}));

describe('PrayerTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageMock.getItem.mockImplementation((key, fallback) => key === 'prayerTracker'
      ? { sabah: undefined, ogle: 'bozuk', ikindi: -4, aksam: 0, yatsi: 0, vitir: 0, oruc: 0 }
      : fallback);
  });

  it('normalizes missing, malformed and negative persisted counts', () => {
    expect(normalizePrayerTrackerCounts({ sabah: undefined, ogle: 'bozuk', ikindi: -4, aksam: '2' }))
      .toEqual({ sabah: 0, ogle: 0, ikindi: 0, aksam: 2, yatsi: 0, vitir: 0, oruc: 0 });
  });

  it('increments a count and persists the normalized state', () => {
    render(<PrayerTracker onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Sabah Namazı borç ekle, sayıyı artır' }));
    expect(screen.getByLabelText('Sabah Namazı sayacı')).toHaveTextContent('1');
    expect(storageMock.setItem).toHaveBeenCalledWith('prayerTracker', expect.objectContaining({ sabah: 1, ogle: 0, ikindi: 0 }));
  });
});
