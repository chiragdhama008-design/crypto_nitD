import React from 'react';
import { KnownLabel } from '../../types/api';

interface LabelBadgeProps {
  label: KnownLabel | string;
  isPrediction?: boolean;
}

export const LabelBadge: React.FC<LabelBadgeProps> = ({ label, isPrediction = false }) => {
  const norm = (label || 'UNKNOWN').toUpperCase();

  let badgeClass = 'badge-medium';
  if (norm === 'ILLICIT') {
    badgeClass = 'badge-hard';
  } else if (norm === 'LICIT') {
    badgeClass = 'badge-easy';
  }

  return (
    <span
      className={`${badgeClass} font-mono uppercase tracking-wider text-[10px]`}
      title={isPrediction ? `Model Prediction: ${norm}` : `Dataset Ground Truth: ${norm}`}
    >
      {isPrediction && <span className="mr-1 text-[9px] opacity-70">PRED:</span>}
      {norm}
    </span>
  );
};
