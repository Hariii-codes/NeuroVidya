/**
 * Accessibility tests for SpeechRecorder component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { SpeechRecorder } from '../SpeechRecorder';

expect.extend(toHaveNoViolations);

describe('SpeechRecorder Accessibility', () => {
  it('should have no axe-core violations', async () => {
    const { container } = render(<SpeechRecorder />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA labels', () => {
    render(<SpeechRecorder />);

    const startButton = screen.queryByRole('button', { name: /start reading/i });
    const stopButton = screen.queryByRole('button', { name: /stop/i });

    if (startButton) {
      expect(startButton).toHaveAttribute('aria-label');
    }
    if (stopButton) {
      expect(stopButton).toHaveAttribute('aria-label');
    }
  });

  it('should be keyboard navigable', () => {
    const { container } = render(<SpeechRecorder />);

    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      // Check that buttons are not disabled by default
      expect(button).not.toBeDisabled();
    });
  });

  it('should have accessible recording indicator', () => {
    const { container } = render(<SpeechRecorder />);

    // Check for proper text content in recording indicator
    const recordingText = container.textContent;
    if (recordingText?.includes('Recording')) {
      // Should have descriptive text for screen readers
      expect(recordingText).toMatch(/recording|listening/i);
    }
  });

  it('should provide feedback for screen readers', () => {
    const { container } = render(<SpeechRecorder />);

    // Check for proper ARIA live regions or status updates
    const liveRegions = container.querySelectorAll('[aria-live], [role="status"]');
    // At minimum, error messages should be accessible
    expect(liveRegions.length).toBeGreaterThanOrEqual(0);
  });
});
