import React from 'react';
import { RiskLevel } from '../../types/api';

interface RiskBadgeProps {
  score?: number | null;
  level?: RiskLevel | string | null;
  showScore?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ score, level, showScore = true }) => {
  const normLevel = (level || 'LOW').toUpperCase();

  let badgeClass = 'badge-easy';
  if (normLevel === 'CRITICAL') {
    badgeClass = 'badge-hard';
  } else if (normLevel === 'HIGH') {
    badgeClass = 'badge-high';
  } else if (normLevel === 'MEDIUM') {
    badgeClass = 'badge-medium';
  }

  return (
    <span className={`${badgeClass} space-x-1`}>
      <span className="font-mono text-[11px]">{normLevel}</span>
      {showScore && score !== undefined && score !== null && (
        <span className="font-mono opacity-85 text-[10px]">({score})</span>
      )}
    </span>
  );
};
