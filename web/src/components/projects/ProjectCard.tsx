import React from 'react';
import { Link } from 'react-router-dom';
import { ProjectResponse } from '@project-mgmt/shared';
import { StatusBadge } from '../common/Badge';
import { Calendar, CheckCircle2, ChevronRight } from 'lucide-react';

interface ProjectCardProps {
  project: ProjectResponse;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group block bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <h4 className="text-base font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
          {project.name}
        </h4>
        <StatusBadge status={project.status} />
      </div>

      <p className="mt-2 text-sm text-slate-500 line-clamp-2 min-h-[2.5rem]">
        {project.description || 'No description provided.'}
      </p>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-1.5">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>
            {formatDate(project.startDate)} - {formatDate(project.endDate)}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 font-medium text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
            <span>{project._count?.tasks ?? 0} tasks</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
};
