import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { DashboardStats, ProjectResponse, PaginatedResponse } from '@project-mgmt/shared';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/Badges';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

export const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
    isRefetching: statsRefetching,
  } = useQuery<DashboardStats>({
    queryKey: ['mobile-dashboard-stats'],
    queryFn: async () => {
      const res = await apiClient.get<DashboardStats>('/dashboard');
      return res.data;
    },
  });

  const {
    data: recentProjects,
    isLoading: projectsLoading,
    refetch: refetchProjects,
    isRefetching: projectsRefetching,
  } = useQuery<PaginatedResponse<ProjectResponse>>({
    queryKey: ['mobile-recent-projects'],
    queryFn: async () => {
      const res = await apiClient.get<PaginatedResponse<ProjectResponse>>(
        '/projects?limit=4&sortBy=createdAt&order=desc'
      );
      return res.data;
    },
  });

  const onRefresh = async () => {
    await Promise.all([refetchStats(), refetchProjects()]);
  };

  const statCards = [
    { title: 'Total Projects', value: stats?.totalProjects ?? 0, icon: 'folder-outline', color: '#4f46e5' },
    { title: 'In Progress', value: stats?.projectsInProgress ?? 0, icon: 'pulse-outline', color: '#2563eb' },
    { title: 'Total Tasks', value: stats?.totalTasks ?? 0, icon: 'list-outline', color: '#7c3aed' },
    { title: 'Completed', value: stats?.completedTasks ?? 0, icon: 'checkmark-circle-outline', color: '#059669' },
    { title: 'Pending', value: stats?.pendingTasks ?? 0, icon: 'time-outline', color: '#d97706' },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={statsRefetching || projectsRefetching}
          onRefresh={onRefresh}
          colors={['#4f46e5']}
        />
      }
    >
      {/* Welcome Banner */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
      </View>

      {/* Stats Cards Section */}
      <Text style={styles.sectionTitle}>Overview</Text>
      {statsLoading ? (
        <ActivityIndicator size="small" color="#4f46e5" style={{ marginVertical: 20 }} />
      ) : (
        <View style={styles.statsGrid}>
          {statCards.map((item) => (
            <View key={item.title} style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statTitle}>{item.title}</Text>
                <Ionicons name={item.icon as any} size={18} color={item.color} />
              </View>
              <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Recent Projects Section */}
      <View style={styles.recentSectionHeader}>
        <Text style={styles.sectionTitle}>Recent Projects</Text>
        <TouchableOpacity onPress={() => (navigation as any).navigate('ProjectsTab')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {projectsLoading ? (
        <ActivityIndicator size="small" color="#4f46e5" style={{ marginVertical: 20 }} />
      ) : recentProjects?.data && recentProjects.data.length > 0 ? (
        recentProjects.data.map((proj) => (
          <TouchableOpacity
            key={proj.id}
            style={styles.projectCard}
            onPress={() =>
              navigation.navigate('ProjectDetail', {
                projectId: proj.id,
                projectName: proj.name,
              })
            }
          >
            <View style={styles.projectCardHeader}>
              <Text style={styles.projectName}>{proj.name}</Text>
              <StatusBadge status={proj.status} />
            </View>

            {proj.description ? (
              <Text style={styles.projectDesc} numberOfLines={2}>
                {proj.description}
              </Text>
            ) : null}

            <View style={styles.projectCardFooter}>
              <View style={styles.taskCountBadge}>
                <Ionicons name="checkbox-outline" size={14} color="#64748b" />
                <Text style={styles.taskCountText}>{proj._count?.tasks ?? 0} tasks</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Ionicons name="folder-open-outline" size={32} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No projects created yet</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    width: '48%',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  recentSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 13,
    color: '#4f46e5',
    fontWeight: '600',
  },
  projectCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 10,
  },
  projectCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  projectName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  projectDesc: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 10,
  },
  projectCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  taskCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskCountText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 8,
  },
});
