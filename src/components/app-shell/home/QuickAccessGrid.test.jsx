import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import QuickAccessGrid from './QuickAccessGrid';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key, fallback) => fallback,
  }),
}));

describe('QuickAccessGrid', () => {
  it('opens the registered tespihat feature from its tile', () => {
    const onSelectFeature = vi.fn();

    render(<QuickAccessGrid onSelectFeature={onSelectFeature} onShowMenu={vi.fn()} />);
    fireEvent.click(screen.getByText('Tespihat'));

    expect(onSelectFeature).toHaveBeenCalledWith('tespihat', 'quick_access');
  });

  it('opens the feature menu from both all-features controls', () => {
    const onSelectFeature = vi.fn();
    const onShowMenu = vi.fn();

    render(<QuickAccessGrid onSelectFeature={onSelectFeature} onShowMenu={onShowMenu} />);
    fireEvent.click(screen.getByRole('button', { name: 'Tümü' }));
    fireEvent.click(screen.getByText('Daha Fazla'));

    expect(onShowMenu).toHaveBeenCalledTimes(2);
    expect(onSelectFeature).not.toHaveBeenCalledWith('all_features', expect.anything());
    expect(onSelectFeature).not.toHaveBeenCalledWith('more', expect.anything());
  });
});
