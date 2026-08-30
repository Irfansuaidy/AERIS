"use client";

import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api";
import { getToken, removeToken } from "@/lib/auth";
import { Project, getProjects } from "@/lib/projects";
import {
  Task,
  TaskCreate,
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "@/lib/tasks";

interface TaskFormState {
  title: string;
  description: string;
  status: string;
  priority: string;
  project_id: string;
  parent_task_id: string;
  due_at: string;
}

const emptyForm: TaskFormState = {
  title: "",
  description: "",
  status: "todo",
  priority: "3",
  project_id: "",
  parent_task_id: "",
  due_at: "",
};

function toTaskPayload(
  form: TaskFormState,
): TaskCreate {
  return {
    title: form.title.trim(),
    description: form.description.trim() || null,
    status: form.status.trim() || "todo",
    priority: Number(form.priority),
    project_id: form.project_id || null,
    parent_task_id: form.parent_task_id || null,
    due_at: form.due_at || null,
  };
}

function formatDate(value: string | null): string {
  if (!value) {
    return "Not set";
  }

  return value.slice(0, 10);
}

function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

export default function TasksPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState<TaskFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAuthError = useCallback((
    error: unknown,
  ): boolean => {
    if (!isUnauthorized(error)) {
      return false;
    }

    removeToken();
    router.replace("/login");
    return true;
  }, [router]);

  async function loadData() {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [tasksResult, projectsResult] = await Promise.all([
        getTasks(),
        getProjects(),
      ]);
      setTasks(tasksResult);
      setProjects(projectsResult);
    } catch (error) {
      if (!handleAuthError(error)) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load data",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function loadInitialData() {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const [tasksResult, projectsResult] = await Promise.all([
          getTasks(),
          getProjects(),
        ]);

        if (active) {
          setTasks(tasksResult);
          setProjects(projectsResult);
        }
      } catch (error) {
        if (handleAuthError(error) || !active) {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load data",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      active = false;
    };
  }, [handleAuthError, router]);

  function updateField(
    field: keyof TaskFormState,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setError("");
    setForm({
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: String(task.priority),
      project_id: task.project_id ?? "",
      parent_task_id: task.parent_task_id ?? "",
      due_at: task.due_at ?? "",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (saving) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = toTaskPayload(form);

      if (editingId) {
        await updateTask(editingId, payload);
      } else {
        await createTask(payload);
      }

      resetForm();
      await loadData();
    } catch (error) {
      if (!handleAuthError(error)) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to save task",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(task: Task) {
    const confirmed = window.confirm(
      `Delete "${task.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(task.id);
    setError("");

    try {
      await deleteTask(task.id);
      await loadData();
    } catch (error) {
      if (!handleAuthError(error)) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to delete task",
        );
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen p-6 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Tasks
            </h1>

            <p className="text-gray-500">
              Manage your IRIS tasks.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded border px-4 py-2 text-center"
          >
            Dashboard
          </Link>
        </header>

        {error && (
          <p className="mt-6 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <section className="mt-8">
          <h2 className="text-xl font-semibold">
            {editingId ? "Edit task" : "Create task"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="mt-4 grid gap-4 rounded border p-4 sm:grid-cols-2"
          >
            <label className="block text-sm font-medium">
              Title
              <input
                value={form.title}
                onChange={(event) =>
                  updateField("title", event.target.value)
                }
                className="mt-1 w-full rounded border p-2"
                required
              />
            </label>

            <label className="block text-sm font-medium">
              Status
              <input
                value={form.status}
                onChange={(event) =>
                  updateField("status", event.target.value)
                }
                className="mt-1 w-full rounded border p-2"
                required
              />
            </label>

            <label className="block text-sm font-medium sm:col-span-2">
              Description
              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value,
                  )
                }
                className="mt-1 min-h-24 w-full rounded border p-2"
              />
            </label>

            <label className="block text-sm font-medium">
              Priority
              <input
                type="number"
                min="1"
                max="5"
                value={form.priority}
                onChange={(event) =>
                  updateField("priority", event.target.value)
                }
                className="mt-1 w-full rounded border p-2"
                required
              />
            </label>

            <label className="block text-sm font-medium">
              Due date
              <input
                type="date"
                value={form.due_at}
                onChange={(event) =>
                  updateField("due_at", event.target.value)
                }
                className="mt-1 w-full rounded border p-2"
              />
            </label>

            <label className="block text-sm font-medium">
              Project
              <select
                value={form.project_id}
                onChange={(event) =>
                  updateField("project_id", event.target.value)
                }
                className="mt-1 w-full rounded border p-2"
              >
                <option value="">No Project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium">
              Parent Task
              <select
                value={form.parent_task_id}
                onChange={(event) =>
                  updateField("parent_task_id", event.target.value)
                }
                className="mt-1 w-full rounded border p-2"
              >
                <option value="">No Parent Task</option>
                {tasks
                  .filter((t) => t.id !== editingId)
                  .map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
              </select>
            </label>

            <div className="flex items-end gap-3 sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update task"
                    : "Create task"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded border px-4 py-2"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">
            Task list
          </h2>

          {loading ? (
            <p className="mt-4 text-gray-500">
              Loading tasks...
            </p>
          ) : tasks.length === 0 ? (
            <p className="mt-4 text-gray-500">
              No tasks yet.
            </p>
          ) : (
            <div className="mt-4 grid gap-4">
              {tasks.map((task) => (
                <article
                  key={task.id}
                  className="rounded border p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {task.title}
                      </h3>

                      <p className="mt-1 text-sm text-gray-600">
                        {task.description ||
                          "No description"}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(task)}
                        className="rounded border px-3 py-2 text-sm"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(task)}
                        disabled={deletingId === task.id}
                        className="rounded border border-red-200 px-3 py-2 text-sm text-red-700 disabled:opacity-50"
                      >
                        {deletingId === task.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
                    <div>
                      <dt className="text-gray-500">
                        Status
                      </dt>
                      <dd>{task.status}</dd>
                    </div>

                    <div>
                      <dt className="text-gray-500">
                        Priority
                      </dt>
                      <dd>{task.priority}</dd>
                    </div>

                    <div>
                      <dt className="text-gray-500">
                        Due date
                      </dt>
                      <dd>{formatDate(task.due_at)}</dd>
                    </div>

                    <div>
                      <dt className="text-gray-500">
                        Project
                      </dt>
                      <dd>
                        {task.project_id
                          ? projects.find((p) => p.id === task.project_id)?.name || "Unknown project"
                          : "None"}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-gray-500">
                        Parent Task
                      </dt>
                      <dd>
                        {task.parent_task_id
                          ? tasks.find((t) => t.id === task.parent_task_id)?.title || "Unknown task"
                          : "None"}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
