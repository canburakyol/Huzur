import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PrayerTracker from './PrayerTracker';
import { normalizePrayerTrackerCounts } from './prayerTrackerState';
import { coreFeatures } from '../../../features/core';
import { ibadatFeatures } from '../../../features/ibadet';

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
      ? { sabah: undefined, ogle: 'bozuk', ikindi: -4, aksam: 0, yatsi: 0, vitir: 0, oruc: 7 }
      : fallback);
  });

  it('normalizes missing, malformed and negative persisted counts', () => {
    expect(normalizePrayerTrackerCounts({ sabah: undefined, ogle: 'bozuk', ikindi: -4, aksam: '2' }))
      .toEqual({ sabah: 0, ogle: 0, ikindi: 0, aksam: 2, yatsi: 0, vitir: 0 });
  });

  it('uses one hamburger-reachable personal prayer record and not the legacy calculator route', () => {
    expect(coreFeatures.tracker).toBeDefined();
    expect(ibadatFeatures.missedPrayers).toBeUndefined();
  });

  it('shows manual-record caveat, excludes fasting and does not turn zero into a legal finding', () => {
    render(<PrayerTracker onClose={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Kişisel kaza kaydı' })).toBeInTheDocument();
    expect(screen.getByText(/Bu ekran kişisel kayıt içindir/i)).toBeInTheDocument();
    expect(screen.getByText(/mezhep ve kişisel duruma göre değişebilir/i)).toBeInTheDocument();
    expect(screen.getByText(/dinî bir görevliye danışın/i)).toBeInTheDocument();
    expect(screen.queryByText('Oruç')).not.toBeInTheDocument();
    expect(screen.queryByText(/Tahmini gün/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Kayıtlı kaza borcunuz bulunmuyor/i)).not.toBeInTheDocument();
  });

  it('increments a manually entered count and persists only prayer counts', () => {
    render(<PrayerTracker onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Sabah Namazı kayda ekle, sayıyı artır' }));
    expect(screen.getByLabelText('Sabah Namazı sayacı')).toHaveTextContent('1');
    expect(storageMock.setItem).toHaveBeenCalledWith('prayerTracker', expect.objectContaining({ sabah: 1, ogle: 0, ikindi: 0 }));
    expect(storageMock.setItem).toHaveBeenCalledWith('prayerTracker', expect.not.objectContaining({ oruc: expect.anything() }));
  });
});
