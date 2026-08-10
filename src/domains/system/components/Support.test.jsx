import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Support from './Support';

vi.mock('../../../components/shared/IslamicBackButton', () => ({
  default: ({ onClick }) => <button type="button" onClick={onClick}>Back</button>,
}));

vi.mock('../../../utils/logger', () => ({
  logger: { error: vi.fn() },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key, fallback) => fallback,
    i18n: { language: 'en' },
  }),
}));

describe('Support', () => {
  it('states that the email app opened and the user still needs to send the message', () => {
    render(<Support onClose={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('Write your issue or suggestion in detail...'), {
      target: { value: 'Please help with a problem.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    expect(screen.getByRole('heading', { name: 'Email app opened' })).toBeInTheDocument();
    expect(screen.getByText('Review the email and send it to contact support.')).toBeInTheDocument();
    expect(screen.queryByText('Your request has been submitted!')).not.toBeInTheDocument();
  });
});
