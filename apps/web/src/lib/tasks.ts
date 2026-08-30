import { api } from "./api";
import { getToken } from "./auth";

export interface Task {
  id: string;
  user_id: string;
  project_id: string | null;
  parent_task_id: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: number;
  due_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  project_id?: string | null;
  parent_task_id?: string | null;
  title: string;
  description?: string | null;
  status?: string;
  priority?: number;
  due_at?: string | null;
}

export interface TaskUpdate {
  project_id?: string | null;
  parent_task_id?: string | null;
  title?: string;
  description?: string | null;
  status?: string;
  priority?: number;
  due_at?: string | null;
  completed_at?: string | null;
}

function getAccessToken(): string | null {
  return getToken();
}

export function getTasks(): Promise<Task[]> {
  const token = getAccessToken();

  return api<Task[]>("/tasks", {
    token: token ?? undefined,
  });
}

export function getTask(id: string): Promise<Task> {
  const token = getAccessToken();

  return api<Task>(`/tasks/${id}`, {
    token: token ?? undefined,
  });
}

export function createTask(
  data: TaskCreate,
): Promise<Task> {
  const token = getAccessToken();

  return api<Task>("/tasks", {
    method: "POST",
    token: token ?? undefined,
    body: JSON.stringify(data),
  });
}

export function updateTask(
  id: string,
  data: TaskUpdate,
): Promise<Task> {
  const token = getAccessToken();

  return api<Task>(`/tasks/${id}`, {
    method: "PATCH",
    token: token ?? undefined,
    body: JSON.stringify(data),
  });
}

export function deleteTask(id: string): Promise<void> {
  const token = getAccessToken();

  return api<void>(`/tasks/${id}`, {
    method: "DELETE",
    token: token ?? undefined,
  });
}
