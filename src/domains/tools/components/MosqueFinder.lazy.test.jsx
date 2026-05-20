import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const geolocationMock = vi.hoisted(() => ({
  checkPermissions: vi.fn(),
  requestPermissions: vi.fn(),
  getCurrentPosition: vi.fn(),
}));

const mapRenderMock = vi.hoisted(() => vi.fn());

vi.mock('@capacitor/geolocation', () => ({
  Geolocation: geolocationMock,
}));

vi.mock('./MosqueFinderMap', () => ({
  default: (props) => {
    mapRenderMock(props);
    return <div data-testid="mosque-map">Map loaded</div>;
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key, fallback) => fallback,
  }),
}));

vi.mock('../utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    log: vi.fn(),
  },
}));

const importMosqueFinder = async () => import('./MosqueFinder');

describe('MosqueFinder lazy map loading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        elements: [
          {
            id: 1,
            lat: 41.01,
            lon: 28.97,
            tags: { name: 'Test Cami' },
          },
        ],
      }),
    });
    geolocationMock.checkPermissions.mockResolvedValue({ location: 'granted' });
    geolocationMock.requestPermissions.mockResolvedValue({ location: 'granted' });
    geolocationMock.getCurrentPosition.mockResolvedValue({
      coords: { latitude: 41, longitude: 29 },
    });
  });

  it('does not render the lazy map when location permission is denied', async () => {
    geolocationMock.checkPermissions.mockResolvedValue({ location: 'denied' });
    geolocationMock.requestPermissions.mockResolvedValue({ location: 'denied' });
    const { default: MosqueFinder } = await importMosqueFinder();

    render(<MosqueFinder onClose={vi.fn()} />);

    await screen.findByText(/Konum/);
    expect(screen.queryByTestId('mosque-map')).not.toBeInTheDocument();
    expect(mapRenderMock).not.toHaveBeenCalled();
  });

  it('loads the map component only after a native location is available', async () => {
    const { default: MosqueFinder } = await importMosqueFinder();

    render(<MosqueFinder onClose={vi.fn()} />);

    expect(screen.queryByTestId('mosque-map')).not.toBeInTheDocument();
    await screen.findByTestId('mosque-map');

    expect(mapRenderMock).toHaveBeenCalledWith(
      expect.objectContaining({
        location: [41, 29],
      })
    );
  });

  it('does not set state after unmount while async location lookup is still pending', async () => {
    let resolvePosition;
    geolocationMock.getCurrentPosition.mockReturnValue(
      new Promise((resolve) => {
        resolvePosition = resolve;
      })
    );
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { default: MosqueFinder } = await importMosqueFinder();

    const { unmount } = render(<MosqueFinder onClose={vi.fn()} />);
    unmount();
    resolvePosition({ coords: { latitude: 41, longitude: 29 } });

    await waitFor(() => expect(geolocationMock.getCurrentPosition).toHaveBeenCalled());
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(mapRenderMock).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
