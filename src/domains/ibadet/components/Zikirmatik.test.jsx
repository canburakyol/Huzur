import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Zikirmatik from './Zikirmatik';

const storageMock = vi.hoisted(() => ({
  getItem: vi.fn(),
  getString: vi.fn(),
  setItem: vi.fn(),
  setString: vi.fn(),
}));

vi.mock('../../../services/storageService', () => ({ storageService: storageMock }));
vi.mock('../../../components/shared/IslamicBackButton', () => ({
  default: ({ onClick }) => <button type="button" onClick={onClick}>Geri</button>,
}));
vi.mock('../../../context/FocusContext', () => ({
  useFocus: () => ({ isFocusMode: false, toggleFocusMode: vi.fn() }),
}));
vi.mock('../../../hooks/useGamification', () => ({
  useGamification: () => ({ checkQuestProgress: vi.fn() }),
}));
vi.mock('../../../services/activationService', () => ({
  markFirstIbadahActionCompleted: vi.fn(),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_key, fallback) => fallback }),
}));

describe('Zikirmatik', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageMock.getItem.mockImplementation((_key, fallback) => fallback);
    storageMock.getString.mockImplementation((_key, fallback) => fallback);
  });

  it('renders Hasbünallâh with uncorrupted Arabic, Turkish reading, meaning, and Quran citation', () => {
    render(<Zikirmatik onClose={vi.fn()} />);

    fireEvent.click(screen.getByText('Hasbünallâh'));

    expect(screen.getByText('حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ')).toBeInTheDocument();
    expect(screen.getByText("Hasbünallâhü ve ni'mel vekîl.")).toBeInTheDocument();
    expect(screen.getByText('Allah bize yeter; O ne güzel vekildir.')).toBeInTheDocument();
    expect(screen.getByText('Kur’an-ı Kerim, Âl-i İmrân 3:173')).toBeInTheDocument();
  });

  it('identifies free dhikr as user-authored and unverified', () => {
    render(<Zikirmatik onClose={vi.fn()} />);

    fireEvent.click(screen.getByText('Serbest Zikir'));

    expect(screen.getByText('Kullanıcı tarafından yazılır; doğrulanmamıştır.')).toBeInTheDocument();
  });
});
