import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Imsakiye from './Imsakiye';
import QiblaCompass from './QiblaCompass';

const fetchMonthlyPrayerTimes = vi.hoisted(() => vi.fn());
const translation = vi.hoisted(() => ({
  t: (_key, fallback) => fallback,
  i18n: { language: 'tr' },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => translation }));
vi.mock('../../../components/shared/IslamicBackButton', () => ({ default: () => <button type="button">Geri</button> }));
vi.mock('../../../services/prayerService', () => ({ fetchMonthlyPrayerTimes }));

const monthlyData = {
  timings: [{
    date: { readable: '01 Oca 2026' },
    timings: { Fajr: '06:00', Sunrise: '07:30', Dhuhr: '12:30', Asr: '15:30', Maghrib: '17:30', Isha: '19:00' },
    meta: { method: { name: 'Diyanet' } },
  }],
};

describe('location integrity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMonthlyPrayerTimes.mockResolvedValue(monthlyData);
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: undefined });
  });

  afterEach(() => vi.restoreAllMocks());

  it('does not show an imsak schedule without trustworthy coordinates', async () => {
    render(<Imsakiye onClose={vi.fn()} locationName="İzmir" location={null} />);

    expect(await screen.findByText('İmsakiye için doğrulanmış konum gerekli.')).toBeInTheDocument();
    expect(fetchMonthlyPrayerTimes).not.toHaveBeenCalled();
  });

  it('requests the monthly schedule for the propagated location and labels its Diyanet source', async () => {
    render(<Imsakiye onClose={vi.fn()} locationName="Marmaris" location={{ latitude: 36.855, longitude: 28.274 }} />);

    await waitFor(() => expect(fetchMonthlyPrayerTimes).toHaveBeenCalledWith(
      36.855,
      28.274,
      'Marmaris',
      'Turkey',
      expect.any(Date),
    ));
    expect(await screen.findByText('Kaynak: Diyanet')).toBeInTheDocument();
  });

  it('blocks qibla guidance when current location is unavailable', async () => {
    render(<QiblaCompass onClose={vi.fn()} location={null} />);

    expect(await screen.findByText('Kıble yönü için güncel konum gerekli.')).toBeInTheDocument();
    expect(screen.queryByText(/Hedef$/)).not.toBeInTheDocument();
    expect(screen.queryByText('Kıble Bulundu')).not.toBeInTheDocument();
  });
});
