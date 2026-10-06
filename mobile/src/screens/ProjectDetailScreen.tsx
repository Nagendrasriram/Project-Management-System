import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import {
  ProjectResponse,
  TaskResponse,
  PaginatedResponse,
  TaskStatus,
  TaskPriority,
} from '@project-mgmt/shared';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ProjectDetail'>;

export const ProjectDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { projectId } = route.params;
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  // Fetch Project
  const { data: project, isLoading: projectLoading } = useQuery<ProjectResponse>({
    queryKey: ['mobile-project', projectId],
    queryFn: async () => {
      const res = await apiClient.get<ProjectResponse>(`/projects/${projectId}`);
      return res.data;
    },
  });

  // Fetch Tasks
  const {
    data: tasksData,
    isLoading: tasksLoading,
    refetch: refetchTasks,
    isRefetching: tasksRefetching,
  } = useQuery<PaginatedResponse<TaskResponse>>({
    queryKey: ['mobile-tasks', projectId, search, statusFilter, priorityFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        projectId,
        limit: '100',
      });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);

      const res = await apiClient.get<PaginatedResponse<TaskResponse>>(
        `/tasks?${params.toString()}`
      );
      return res.data;
    },
  });

  // Toggle Task Completion Mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ taskId, newStatus }: { taskId: string; newStatus: TaskStatus }) => {
      await apiClient.put(`/tasks/${taskId}`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['mobile-dashboard-stats'] });
    },
  });

  // Delete Task Mutation
  const deleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await apiClient.delete(`/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['mobile-dashboard-stats'] });
    },
  });

  const handleToggle = (task: TaskResponse) => {
    const newStatus =
      task.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED;
    toggleMutation.mutate({ taskId: task.id, newStatus });
  };

  const confirmDelete = (task: TaskResponse) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(task.id),
        },
      ]
    );
  };

  const tasks = tasksData?.data || [];
  const completedCount = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;

  return (
    <View style={styles.container}>
      {/* Project Info Header */}
      {project && (
        <View style={styles.projectHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.projectTitle}>{project.name}</Text>
            <StatusBadge status={project.status} />
          </View>
          {project.description ? (
            <Text style={styles.projectDesc}>{project.description}</Text>
          ) : null}
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>
              Completed {completedCount} of {tasks.length} tasks
            </Text>
          </View>
        </View>
      )}

      {/* Task Filters */}
      <View style={styles.filterSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={15} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.filterChipsRow}>
          <TouchableOpacity
            style={[styles.chip, !statusFilter && styles.chipActive]}
            onPress={() => setStatusFilter('')}
          >
            <Text style={[styles.chipText, !statusFilter && styles.chipTextActive]}>All Status</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, statusFilter === TaskStatus.PENDING && styles.chipActive]}
            onPress={() => setStatusFilter(TaskStatus.PENDING)}
          >
            <Text style={[styles.chipText, statusFilter === TaskStatus.PENDING && styles.chipTextActive]}>
              Pending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, statusFilter === TaskStatus.COMPLETED && styles.chipActive]}
            onPress={() => setStatusFilter(TaskStatus.COMPLETED)}
          >
            <Text style={[styles.chipText, statusFilter === TaskStatus.COMPLETED && styles.chipTextActive]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tasks List */}
      {tasksLoading || projectLoading ? (
        <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={tasksRefetching}
              onRefresh={refetchTasks}
              colors={['#4f46e5']}
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard-outline" size={36} color="#cbd5e1" />
              <Text style={styles.emptyText}>No tasks found in this project</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isDone = item.status === TaskStatus.COMPLETED;
            return (
              <View style={[styles.taskCard, isDone && styles.taskCardDone]}>
                <TouchableOpacity
                  style={styles.checkButton}
                  onPress={() => handleToggle(item)}
                >
                  <Ionicons
                    name={isDone ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={isDone ? '#059669' : '#94a3b8'}
                  />
                </TouchableOpacity>

                <View style={styles.taskBody}>
                  <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]}>
                    {item.name}
                  </Text>
                  {item.description ? (
                    <Text style={styles.taskDesc} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}

                  <View style={styles.badgesRow}>
                    <PriorityBadge priority={item.priority} />
                    <StatusBadge status={item.status} />
                  </View>
                </View>

                <View style={styles.actionsColumn}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() =>
                      navigation.navigate('TaskForm', {
                        projectId,
                        task: item,
                      })
                    }
                  >
                    <Ionicons name="pencil" size={16} color="#64748b" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => confirmDelete(item)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#e11d48" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Floating Add Task Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('TaskForm', { projectId })}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  projectHeader: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  projectDesc: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4f46e5',
  },
  filterSection: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 13,
    color: '#0f172a',
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
  },
  chipActive: {
    backgroundColor: '#4f46e5',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 14,
    paddingBottom: 80,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCardDone: {
    backgroundColor: '#f8fafc',
    opacity: 0.8,
  },
  checkButton: {
    marginRight: 10,
  },
  taskBody: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  taskDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 6,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  actionsColumn: {
    marginLeft: 8,
    flexDirection: 'column',
    gap: 8,
  },
  actionBtn: {
    padding: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4f46e5',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: '#94a3b8',
  },
});
