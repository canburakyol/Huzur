import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DuaTracker from './DuaTracker';

const storageMock = vi.hoisted(() => ({ getItem: vi.fn(), setItem: vi.fn() }));
const addXPMock = vi.hoisted(() => vi.fn());

vi.mock('../../../services/storageService', () => ({ storageService: storageMock }));
vi.mock('../../../hooks/useGamification', () => ({ useGamification: () => ({ addXP: addXPMock }) }));
vi.mock('../../../components/shared/IslamicBackButton', () => ({ default: () => <button type="button">Geri</button> }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (_key, fallback) => fallback, i18n: { language: 'tr' } }) }));

describe('DuaTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageMock.getItem.mockReturnValue(null);
  });

  it('labels suggested text as a general example rather than a Qur’an or hadith quotation', () => {
    render(<DuaTracker onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Yeni Dua Ekle' }));

    expect(screen.getByText('Genel dua örneği — Kur’an/hadis alıntısı değildir')).toBeInTheDocument();
  });

  it('records “Dua edildi” personally without implying acceptance or awarding XP', () => {
    render(<DuaTracker onClose={vi.fn()} />);
    expect(screen.getByText(/“Dua edildi” işareti yalnızca kişisel kayıttır; kabul edildiği anlamına gelmez/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Yeni Dua Ekle' }));
    fireEvent.change(screen.getByPlaceholderText('Duanızı yazın...'), { target: { value: 'Kişisel dua' } });
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dua edildi olarak işaretle' }));

    expect(storageMock.setItem).toHaveBeenLastCalledWith('huzur_dua_tracker', expect.objectContaining({
      duas: [expect.objectContaining({ text: 'Kişisel dua', completed: true })],
    }));
    expect(addXPMock).not.toHaveBeenCalled();
  });
});