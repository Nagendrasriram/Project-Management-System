import React from 'react';
import { ProjectStatus, TaskPriority, TaskStatus } from '@project-mgmt/shared';

interface BadgeProps {
  status?: ProjectStatus | TaskStatus;
  priority?: TaskPriority;
  className?: string;
}

export const StatusBadge: React.FC<{ status: ProjectStatus | TaskStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  let color = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = status.replace('_', ' ');

  if (status === ProjectStatus.COMPLETED || status === TaskStatus.COMPLETED) {
    color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (status === ProjectStatus.IN_PROGRESS || status === TaskStatus.IN_PROGRESS) {
    color = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (status === ProjectStatus.NOT_STARTED || status === TaskStatus.PENDING) {
    color = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color} ${className}`}
    >
      {label}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: TaskPriority; className?: string }> = ({
  priority,
  className = '',
}) => {
  let color = 'bg-slate-100 text-slate-700 border-slate-200';

  if (priority === TaskPriority.HIGH) {
    color = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (priority === TaskPriority.MEDIUM) {
    color = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (priority === TaskPriority.LOW) {
    color = 'bg-slate-50 text-slate-600 border-slate-200';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${color} ${className}`}
    >
      {priority}
    </span>
  );
};
