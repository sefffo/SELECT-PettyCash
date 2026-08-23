import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RejectRequestDialog } from '@/components/shared';
import '@/i18n/config';

describe('RejectRequestDialog', () => {
  const onConfirm = vi.fn();
  const onClose = vi.fn();

  beforeEach(() => {
    onConfirm.mockReset();
    onClose.mockReset();
  });

  const renderDialog = (props: Record<string, unknown> = {}) =>
    render(
      <RejectRequestDialog
        open
        onClose={onClose}
        onConfirm={onConfirm}
        {...props}
      />,
    );

  it('renders title, employee info and reason field', () => {
    renderDialog({ title: 'Reject Request?', employeeName: 'Nada Ahmed', amount: 'EGP 1,500' });
    expect(screen.getByText('Reject Request?')).toBeDefined();
    expect(screen.getByText(/Nada Ahmed.*EGP 1,500/)).toBeDefined();
    expect(screen.getByPlaceholderText(/reason/i)).toBeDefined();
  });

  it('keeps the reject button disabled until a reason is typed', async () => {
    const user = userEvent.setup();
    renderDialog();
    const confirmBtn = screen.getByRole('button', { name: /^Reject$/i });
    expect(confirmBtn).toHaveProperty('disabled', true);
    await user.type(screen.getByPlaceholderText(/reason/i), 'Duplicate request');
    expect(confirmBtn).toHaveProperty('disabled', false);
  });

  it('confirms with the trimmed reason', async () => {
    const user = userEvent.setup();
    renderDialog();
    const textarea = screen.getByPlaceholderText(/reason/i);
    await user.type(textarea, '  Invalid receipt  ');
    await user.click(screen.getByRole('button', { name: /^Reject$/i }));
    expect(onConfirm).toHaveBeenCalledWith('Invalid receipt');
  });

  it('cancels without calling onConfirm', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByRole('button', { name: /^Cancel$/i }));
    expect(onClose).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('resets the reason after the dialog is closed', async () => {
    const user = userEvent.setup();
    const { rerender } = renderDialog();
    const textarea = screen.getByPlaceholderText(/reason/i);
    await user.type(textarea, 'Some reason');
    await user.click(screen.getByRole('button', { name: /^Cancel$/i }));
    rerender(
      <RejectRequestDialog open={false} onClose={onClose} onConfirm={onConfirm} />,
    );
    rerender(
      <RejectRequestDialog open onClose={onClose} onConfirm={onConfirm} />,
    );
    expect(screen.getByPlaceholderText(/reason/i)).toHaveProperty('value', '');
  });
});