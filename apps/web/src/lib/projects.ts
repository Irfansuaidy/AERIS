import { api } from "./api";
import { getToken } from "./auth";

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: string;
  priority: number;
  start_date: string | null;
  target_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
  description?: string | null;
  status?: string;
  priority?: number;
  start_date?: string | null;
  target_date?: string | null;
}

export interface ProjectUpdate {
  name?: string;
  description?: string | null;
  status?: string;
  priority?: number;
  start_date?: string | null;
  target_date?: string | null;
}

function getAccessToken(): string | null {
  return getToken();
}

export function getProjects(): Promise<Project[]> {
  const token = getAccessToken();

  return api<Project[]>("/projects", {
    token: token ?? undefined,
  });
}

export function getProject(id: string): Promise<Project> {
  const token = getAccessToken();

  return api<Project>(`/projects/${id}`, {
    token: token ?? undefined,
  });
}

export function createProject(
  data: ProjectCreate,
): Promise<Project> {
  const token = getAccessToken();

  return api<Project>("/projects", {
    method: "POST",
    token: token ?? undefined,
    body: JSON.stringify(data),
  });
}

export function updateProject(
  id: string,
  data: ProjectUpdate,
): Promise<Project> {
  const token = getAccessToken();

  return api<Project>(`/projects/${id}`, {
    method: "PATCH",
    token: token ?? undefined,
    body: JSON.stringify(data),
  });
}

export function deleteProject(id: string): Promise<void> {
  const token = getAccessToken();

  return api<void>(`/projects/${id}`, {
    method: "DELETE",
    token: token ?? undefined,
  });
}
