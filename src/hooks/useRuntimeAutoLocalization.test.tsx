import { describe, expect, it } from 'vitest';
import { act, render } from '@testing-library/react';
import { useRuntimeAutoLocalization } from './useRuntimeAutoLocalization';

function Harness({ label }: { label: string }) {
  useRuntimeAutoLocalization();
  return <div data-i18n-autolocalize="true"><h2 title={label}>{label}</h2></div>;
}

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

describe('useRuntimeAutoLocalization', () => {
  it('keeps React in-place text and attribute updates instead of reverting them', async () => {
    const { container, rerender } = render(<Harness label="Adım 1 / 3" />);
    await act(nextFrame);

    rerender(<Harness label="Adım 2 / 3" />);
    await act(async () => { await nextFrame(); await nextFrame(); });

    const heading = container.querySelector('h2');
    expect(heading?.textContent).toBe('Adım 2 / 3');
    expect(heading?.getAttribute('title')).toBe('Adım 2 / 3');
  });
});
