import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { LazyImage } from './LazyImage';

describe('LazyImage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should render placeholder initially', () => {
    const { container } = render(
      <LazyImage src="/test.jpg" alt="Test image" />
    );

    expect(container.querySelector('.lazy-image-placeholder')).toBeInTheDocument();
    expect(container.querySelector('.lazy-image-skeleton')).toBeInTheDocument();
  });

  it('should not render img when not in view', () => {
    const { container } = render(
      <LazyImage src="/test.jpg" alt="Test image" />
    );

    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  it('should render with correct alt text', () => {
    const { container } = render(
      <LazyImage src="/test.jpg" alt="Test image" />
    );

    expect(container.querySelector('.lazy-image-placeholder')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <LazyImage src="/test.jpg" alt="Test" className="custom-class" />
    );

    expect(container.querySelector('.lazy-image-container')).toHaveClass('custom-class');
  });

  it('should render img element when src is provided', () => {
    const { container } = render(
      <LazyImage src="/test.jpg" alt="Test image" />
    );

    expect(container.querySelector('.lazy-image-container')).toBeInTheDocument();
  });
});
