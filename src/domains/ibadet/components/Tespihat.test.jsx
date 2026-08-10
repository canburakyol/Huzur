import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Tespihat from './Tespihat';

const storageMock = vi.hoisted(() => ({ getItem: vi.fn(), setItem: vi.fn() }));
vi.mock('../../../services/storageService', () => ({ storageService: storageMock }));
vi.mock('../../../components/shared/IslamicBackButton', () => ({ default: () => <button type="button">Geri</button> }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (_key, fallback) => fallback || _key }) }));

describe('Tespihat source labels', () => {
  beforeEach(() => {
    storageMock.getItem.mockReturnValue(null);
  });

  it('shows the Sahih Muslim citation for the prescribed post-prayer istighfar', () => {
    render(<Tespihat onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('İstiğfar'));

    expect(screen.getByTestId('source-istigfar')).toHaveTextContent('Hadis · Sahih Muslim 591');
  });

  it('labels Quran duas as optional instead of a prescribed post-prayer sequence', () => {
    render(<Tespihat onClose={vi.fn()} />);

    expect(screen.getByText('TEVHİD VE İSTEĞE BAĞLI KUR’AN DUALARI')).toBeInTheDocument();
    expect(screen.getByText('İsteğe bağlı Kur’an duası · Kur’an 2:201')).toBeInTheDocument();
  });
});
