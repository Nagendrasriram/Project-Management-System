import { ProjectResponse, TaskResponse } from '@project-mgmt/shared';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  DashboardTab: undefined;
  ProjectsTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProjectDetail: { projectId: string; projectName?: string };
  TaskForm: { projectId: string; task?: TaskResponse };
  ProjectForm: { project?: ProjectResponse };
};
