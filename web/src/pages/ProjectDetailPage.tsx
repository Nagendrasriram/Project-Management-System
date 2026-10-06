import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import {
  ProjectResponse,
  TaskResponse,
  PaginatedResponse,
  ProjectStatus,
  TaskStatus,
  TaskPriority,
  UpdateProjectInput,
  CreateTaskInput,
  UpdateTaskInput,
} from '@project-mgmt/shared';
import { Navbar } from '../components/common/Navbar';
import { StatusBadge } from '../components/common/Badge';
import { TaskItem } from '../components/tasks/TaskItem';
import { TaskModal } from '../components/tasks/TaskModal';
import { ProjectModal } from '../components/projects/ProjectModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Calendar,
  ChevronLeft,
  Edit2,
  Trash2,
  Plus,
  Search,
  CheckSquare,
} from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Filters for tasks
  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<string>('');

  // Modals state
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskResponse | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaskResponse | null>(null);

  // Fetch Project Details
  const {
    data: project,
    isLoading: projectLoading,
    isError: projectError,
  } = useQuery<ProjectResponse>({
    queryKey: ['project', id],
    queryFn: async () => {
      const res = await apiClient.get<ProjectResponse>(`/projects/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // Fetch Tasks for this Project
  const {
    data: tasksData,
    isLoading: tasksLoading,
  } = useQuery<PaginatedResponse<TaskResponse>>({
    queryKey: ['tasks', id, taskSearch, taskStatusFilter, taskPriorityFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        projectId: id!,
        limit: '100',
      });
      if (taskSearch) params.append('search', taskSearch);
      if (taskStatusFilter) params.append('status', taskStatusFilter);
      if (taskPriorityFilter) params.append('priority', taskPriorityFilter);

      const res = await apiClient.get<PaginatedResponse<TaskResponse>>(`/tasks?${params.toString()}`);
      return res.data;
    },
    enabled: !!id,
  });

  // Project Mutations
  const updateProjectMutation = useMutation({
    mutationFn: async (data: UpdateProjectInput) => {
      const res = await apiClient.put<ProjectResponse>(`/projects/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      navigate('/projects');
    },
  });

  // Task Mutations
  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload: CreateTaskInput = {
        ...data,
        projectId: id!,
      };
      const res = await apiClient.post<TaskResponse>('/tasks', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: UpdateTaskInput }) => {
      const res = await apiClient.put<TaskResponse>(`/tasks/${taskId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await apiClient.delete(`/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setDeletingTask(null);
    },
  });

  const handleToggleTaskComplete = async (task: TaskResponse) => {
    const newStatus =
      task.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED;
    await updateTaskMutation.mutateAsync({
      taskId: task.id,
      data: { status: newStatus },
    });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <LoadingSpinner size="lg" className="py-24" />
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-16 px-4 text-center">
          <h2 className="text-xl font-bold text-slate-800">Project Not Found</h2>
          <p className="mt-2 text-sm text-slate-500">
            The project you are looking for does not exist or you do not have permission to access it.
          </p>
          <Link
            to="/projects"
            className="mt-6 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const tasks = tasksData?.data || [];
  const completedTasksCount = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
  const progressPercent =
    tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <Link
          to="/projects"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Projects
        </Link>

        {/* Project Header Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {project.name}
                </h1>
                <StatusBadge status={project.status} />
              </div>
              <p className="mt-2 text-slate-600 max-w-3xl">
                {project.description || 'No description provided.'}
              </p>
            </div>

            <div className="flex items-center space-x-3 self-start lg:self-center">
              <button
                onClick={() => setIsEditProjectOpen(true)}
                className="inline-flex items-center px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button
                onClick={() => setIsDeleteProjectOpen(true)}
                className="inline-flex items-center px-3.5 py-2 border border-rose-200 rounded-lg text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>
                Timeline: <strong>{formatDate(project.startDate)}</strong> –{' '}
                <strong>{formatDate(project.endDate)}</strong>
              </span>
            </div>

            <div className="sm:col-span-2 flex items-center space-x-4">
              <div className="text-xs text-slate-500 font-medium">
                Progress: {completedTasksCount}/{tasks.length} tasks ({progressPercent}%)
              </div>
              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Section Header */}
        <div className="mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Project Tasks</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Organize, prioritize, and track tasks for this workspace.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </button>
        </div>

        {/* Tasks Filter Bar */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={taskStatusFilter}
              onChange={(e) => setTaskStatusFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              <option value="">All Statuses</option>
              <option value={TaskStatus.PENDING}>Pending</option>
              <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
              <option value={TaskStatus.COMPLETED}>Completed</option>
            </select>

            <select
              value={taskPriorityFilter}
              onChange={(e) => setTaskPriorityFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              <option value="">All Priorities</option>
              <option value={TaskPriority.LOW}>Low</option>
              <option value={TaskPriority.MEDIUM}>Medium</option>
              <option value={TaskPriority.HIGH}>High</option>
            </select>
          </div>
        </div>

        {/* Task List */}
        <div className="mt-6 space-y-3">
          {tasksLoading ? (
            <LoadingSpinner size="md" className="py-12" />
          ) : tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={handleToggleTaskComplete}
                onEdit={(t) => {
                  setEditingTask(t);
                  setIsTaskModalOpen(true);
                }}
                onDelete={(t) => setDeletingTask(t)}
              />
            ))
          ) : (
            <EmptyState
              icon={<CheckSquare className="w-8 h-8 text-slate-400" />}
              title="No tasks found"
              description={
                taskSearch || taskStatusFilter || taskPriorityFilter
                  ? 'No tasks match the filter conditions.'
                  : 'Get started by creating your first task for this project.'
              }
              actionText={
                taskSearch || taskStatusFilter || taskPriorityFilter ? undefined : 'Add Task'
              }
              onAction={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
            />
          )}
        </div>
      </main>

      {/* Edit Project Modal */}
      <ProjectModal
        isOpen={isEditProjectOpen}
        onClose={() => setIsEditProjectOpen(false)}
        initialData={project}
        onSubmit={async (val) => {
          await updateProjectMutation.mutateAsync(val);
        }}
        isLoading={updateProjectMutation.isPending}
      />

      {/* Delete Project Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteProjectOpen}
        onClose={() => setIsDeleteProjectOpen(false)}
        title="Delete Project"
        message="Are you sure you want to delete this project? All associated tasks will be permanently removed. This action cannot be undone."
        onConfirm={async () => {
          await deleteProjectMutation.mutateAsync();
        }}
        isLoading={deleteProjectMutation.isPending}
      />

      {/* Add / Edit Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        initialData={editingTask}
        onSubmit={async (val) => {
          if (editingTask) {
            await updateTaskMutation.mutateAsync({
              taskId: editingTask.id,
              data: val,
            });
          } else {
            await createTaskMutation.mutateAsync(val);
          }
        }}
        isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
      />

      {/* Delete Task Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        title="Delete Task"
        message={`Are you sure you want to delete the task "${deletingTask?.name}"?`}
        onConfirm={async () => {
          if (deletingTask) {
            await deleteTaskMutation.mutateAsync(deletingTask.id);
          }
        }}
        isLoading={deleteTaskMutation.isPending}
      />
    </div>
  );
};
