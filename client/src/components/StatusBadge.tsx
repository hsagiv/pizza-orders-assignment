import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { 
  CheckCircle, 
  Schedule, 
  LocalShipping, 
  Restaurant, 
  RadioButtonUnchecked 
} from '@mui/icons-material';

export type OrderStatus = 'Received' | 'Preparing' | 'Ready' | 'En-Route' | 'Delivered';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
  showIcon?: boolean;
  showLabel?: boolean;
  customLabel?: string;
}

const statusConfig = {
  Received: {
    color: 'default' as const,
    label: 'Received',
    icon: RadioButtonUnchecked,
  },
  Preparing: {
    color: 'warning' as const,
    label: 'Preparing',
    icon: Restaurant,
  },
  Ready: {
    color: 'info' as const,
    label: 'Ready',
    icon: CheckCircle,
  },
  'En-Route': {
    color: 'primary' as const,
    label: 'En Route',
    icon: LocalShipping,
  },
  Delivered: {
    color: 'success' as const,
    label: 'Delivered',
    icon: CheckCircle,
  },
} as const;

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'small',
  variant = 'filled',
  showIcon = true,
  showLabel = true,
  customLabel,
}) => {
  const config = statusConfig[status];
  const IconComponent = config.icon;
  const displayLabel = customLabel || config.label;

  return (
    <Chip
      icon={showIcon ? <IconComponent /> : undefined}
      label={showLabel ? displayLabel : undefined}
      color={config.color}
      size={size}
      variant={variant}
      sx={{
        fontWeight: 600,
        '& .MuiChip-icon': {
          fontSize: size === 'small' ? '16px' : '20px',
        },
        '& .MuiChip-label': {
          fontSize: size === 'small' ? '0.75rem' : '0.875rem',
        },
      }}
    />
  );
};

export default StatusBadge;
