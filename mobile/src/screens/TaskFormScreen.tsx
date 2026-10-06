import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { CreateTaskSchema, TaskPriority, TaskStatus } from '@project-mgmt/shared';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskForm'>;

export const TaskFormScreen: React.FC<Props> = ({ route, navigation }) => {
  const { projectId, task } = route.params;
  const isEditing = !!task;
  const queryClient = useQueryClient();

  const [name, setName] = useState(task?.name || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || TaskPriority.MEDIUM);
  const [status, setStatus] = useState<TaskStatus>(task?.status || TaskStatus.PENDING);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        priority,
        status,
        projectId,
      };

      if (isEditing) {
        await apiClient.put(`/tasks/${task.id}`, payload);
      } else {
        await apiClient.post('/tasks', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['mobile-project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['mobile-dashboard-stats'] });
      navigation.goBack();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || 'Failed to save task';
      Alert.alert('Error', msg);
    },
  });

  const handleSubmit = () => {
    setErrors({});
    const validation = CreateTaskSchema.safeParse({
      name,
      description,
      priority,
      status,
      projectId,
    });

    if (!validation.success) {
      const fieldErrors: { name?: string } = {};
      validation.error.errors.forEach((e) => {
        if (e.path[0] === 'name') fieldErrors.name = e.message;
      });
      setErrors(fieldErrors);
      return;
    }

    mutation.mutate();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.formCard}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Task Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.name ? styles.inputError : null]}
            placeholder="e.g. Design app mockups"
            value={name}
            onChangeText={setName}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Task description or notes..."
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Priority Segmented Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.segmentRow}>
            {[TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH].map((p) => {
              const selected = priority === p;
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.segmentBtn, selected && styles.segmentBtnActive]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[styles.segmentText, selected && styles.segmentTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Status Segmented Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.segmentRow}>
            {[TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED].map((s) => {
              const selected = status === s;
              return (
                <TouchableOpacity
                  key={s}
                  style={[styles.segmentBtn, selected && styles.segmentBtnActive]}
                  onPress={() => setStatus(s)}
                >
                  <Text style={[styles.segmentText, selected && styles.segmentTextActive]}>
                    {s.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, mutation.isPending && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitBtnText}>
              {isEditing ? 'Save Changes' : 'Create Task'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  required: {
    color: '#f43f5e',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#f43f5e',
  },
  errorText: {
    color: '#f43f5e',
    fontSize: 12,
    marginTop: 4,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 6,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#4f46e5',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'capitalize',
  },
  segmentTextActive: {
    color: '#ffffff',
  },
  submitBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
