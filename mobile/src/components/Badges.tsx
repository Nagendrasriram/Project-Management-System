import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProjectStatus, TaskPriority, TaskStatus } from '@project-mgmt/shared';

export const StatusBadge: React.FC<{ status: ProjectStatus | TaskStatus }> = ({ status }) => {
  let bgColor = '#f1f5f9';
  let textColor = '#475569';
  let label = status.replace('_', ' ');

  if (status === ProjectStatus.COMPLETED || status === TaskStatus.COMPLETED) {
    bgColor = '#ecfdf5';
    textColor = '#047857';
  } else if (status === ProjectStatus.IN_PROGRESS || status === TaskStatus.IN_PROGRESS) {
    bgColor = '#eff6ff';
    textColor = '#1d4ed8';
  } else if (status === ProjectStatus.NOT_STARTED || status === TaskStatus.PENDING) {
    bgColor = '#fffbeb';
    textColor = '#b45309';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
};

export const PriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
  let bgColor = '#f1f5f9';
  let textColor = '#475569';

  if (priority === TaskPriority.HIGH) {
    bgColor = '#fff1f2';
    textColor = '#be123c';
  } else if (priority === TaskPriority.MEDIUM) {
    bgColor = '#fffbeb';
    textColor = '#b45309';
  } else if (priority === TaskPriority.LOW) {
    bgColor = '#f8fafc';
    textColor = '#64748b';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{priority}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
