import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ZakatCalculator from './ZakatCalculator';

vi.mock('../../../components/shared/IslamicBackButton', () => ({ default: () => <button type="button">Geri</button> }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (_key, fallback) => fallback || _key }) }));

// Inputs in order: gold price, silver price, cash, gold g, silver g, stocks, receivables, business, debts.
const fill = (values) => {
  const inputs = screen.getAllByRole('spinbutton');
  Object.entries(values).forEach(([i, v]) => fireEvent.change(inputs[i], { target: { value: String(v) } }));
};

describe('ZakatCalculator', () => {
  it('asks for the gold price instead of using a stale default', () => {
    render(<ZakatCalculator onClose={vi.fn()} />);
    fill({ 2: 300000 });
    expect(screen.getByText(/güncel altın/)).toBeInTheDocument();
    expect(screen.queryByText('Ödenmesi Gereken Zekat')).not.toBeInTheDocument();
  });

  it('takes 2.5% of net wealth above the 80.18 g gold nisab', () => {
    render(<ZakatCalculator onClose={vi.fn()} />);
    // nisab = 80.18 * 3000 = 240,540; net = 300,000 + 10 g * 3000 - 30,000 = 300,000
    fill({ 0: 3000, 2: 300000, 3: 10, 8: 30000 });
    expect(screen.getByText('Ödenmesi Gereken Zekat')).toBeInTheDocument();
    expect(screen.getByText(/7\.500,00/)).toBeInTheDocument();
  });

  it('values silver with the entered silver price', () => {
    render(<ZakatCalculator onClose={vi.fn()} />);
    fill({ 0: 3000, 2: 200000, 4: 1000 });
    expect(screen.getByText(/güncel altın/)).toBeInTheDocument();
    fill({ 1: 50 }); // 200,000 + 1000 g * 50 = 250,000 -> 6,250
    expect(screen.getByText(/6\.250,00/)).toBeInTheDocument();
  });
});
