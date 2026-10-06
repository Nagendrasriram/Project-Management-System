import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { DashboardStats, ProjectResponse, PaginatedResponse, CreateProjectInput } from '@project-mgmt/shared';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/common/Navbar';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectModal } from '../components/projects/ProjectModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Activity,
  Plus,
  ArrowRight,
  ListTodo,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch dashboard aggregate statistics
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await apiClient.get<DashboardStats>('/dashboard');
      return res.data;
    },
  });

  // Fetch recent projects
  const { data: recentProjects, isLoading: projectsLoading } = useQuery<PaginatedResponse<ProjectResponse>>({
    queryKey: ['recent-projects'],
    queryFn: async () => {
      const res = await apiClient.get<PaginatedResponse<ProjectResponse>>('/projects?limit=3&sortBy=createdAt&order=desc');
      return res.data;
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectInput) => {
      const res = await apiClient.post<ProjectResponse>('/projects', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const statCards = [
    {
      title: 'Total Projects',
      value: stats?.totalProjects ?? 0,
      icon: FolderKanban,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      title: 'Projects in Progress',
      value: stats?.projectsInProgress ?? 0,
      icon: Activity,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      title: 'Total Tasks',
      value: stats?.totalTasks ?? 0,
      icon: ListTodo,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
    },
    {
      title: 'Completed Tasks',
      value: stats?.completedTasks ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Pending Tasks',
      value: stats?.pendingTasks ?? 0,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.fullName?.split(' ')[0] || 'User'} 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Here is what is happening across your projects and tasks today.
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </button>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="mt-8">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Performance Overview</h2>
          {statsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 p-4 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">{card.title}</span>
                      <div className={`p-2 rounded-lg border ${card.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 text-2xl font-bold text-slate-900">{card.value}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Projects Section */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">Recent Projects</h2>
            <Link
              to="/projects"
              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View all projects
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {projectsLoading ? (
            <LoadingSpinner size="md" />
          ) : recentProjects?.data && recentProjects.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {recentProjects.data.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <FolderKanban className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-800">No projects created yet</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Get started by creating your first project to organize tasks.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Create Project
              </button>
            </div>
          )}
        </div>
      </main>

      <ProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (data) => {
          await createProjectMutation.mutateAsync(data);
        }}
        isLoading={createProjectMutation.isPending}
      />
    </div>
  );
};
