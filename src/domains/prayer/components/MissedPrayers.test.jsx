import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MissedPrayers from './MissedPrayers';

const storageMock = vi.hoisted(() => ({ getItem: vi.fn(), setItem: vi.fn() }));
vi.mock('../../../services/storageService', () => ({ storageService: storageMock }));
vi.mock('../../../components/shared/IslamicBackButton', () => ({ default: () => <button type="button">Geri</button> }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (_key, fallback) => fallback }) }));

describe('MissedPrayers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageMock.getItem.mockImplementation((key, fallback) => {
      if (key === 'missedPrayerCalc') return { birthDate: '1990-01-01', pubertyAge: 12 };
      if (key === 'missedPrayerCounts') return { fajr: null, dhuhr: 'bozuk', asr: -2 };
      return fallback;
    });
  });

  it('normalizes legacy counts and increments the visible counter', () => {
    render(<MissedPrayers onClose={vi.fn()} />);
    const counter = screen.getByLabelText('Sabah sayacı');
    expect(counter).toHaveTextContent('0');
    fireEvent.click(screen.getByRole('button', { name: 'Sabah sayısını artır' }));
    expect(counter).toHaveTextContent('1');
    expect(storageMock.setItem).toHaveBeenLastCalledWith('missedPrayerCounts', expect.objectContaining({ fajr: 1, dhuhr: 0, asr: 0 }));
  });
});
