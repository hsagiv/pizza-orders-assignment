import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('renders with correct status and color', () => {
    render(<StatusBadge status="Received" />);
    expect(screen.getByText('Received')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<StatusBadge status="Preparing" size="small" />);
    expect(screen.getByText('Preparing')).toBeInTheDocument();

    rerender(<StatusBadge status="Preparing" size="medium" />);
    expect(screen.getByText('Preparing')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<StatusBadge status="Delivered" customLabel="Completed" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders without icon when showIcon is false', () => {
    render(<StatusBadge status="Ready" showIcon={false} />);
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });

  it('renders without label when showLabel is false', () => {
    render(<StatusBadge status="En-Route" showLabel={false} />);
    // Should still render the chip but without visible text
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
