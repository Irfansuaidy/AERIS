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
import {
  Project,
  ProjectCreate,
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from "@/lib/projects";

interface ProjectFormState {
  name: string;
  description: string;
  status: string;
  priority: string;
  start_date: string;
  target_date: string;
}

const emptyForm: ProjectFormState = {
  name: "",
  description: "",
  status: "planned",
  priority: "3",
  start_date: "",
  target_date: "",
};

function toProjectPayload(
  form: ProjectFormState,
): ProjectCreate {
  return {
    name: form.name.trim(),
    description: form.description.trim() || null,
    status: form.status.trim() || "planned",
    priority: Number(form.priority),
    start_date: form.start_date || null,
    target_date: form.target_date || null,
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

export default function ProjectsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ProjectFormState>(emptyForm);
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

  async function loadProjects() {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await getProjects();
      setProjects(result);
    } catch (error) {
      if (!handleAuthError(error)) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load projects",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function loadInitialProjects() {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const result = await getProjects();

        if (active) {
          setProjects(result);
        }
      } catch (error) {
        if (handleAuthError(error) || !active) {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load projects",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadInitialProjects();

    return () => {
      active = false;
    };
  }, [handleAuthError, router]);

  function updateField(
    field: keyof ProjectFormState,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function startEdit(project: Project) {
    setEditingId(project.id);
    setError("");
    setForm({
      name: project.name,
      description: project.description ?? "",
      status: project.status,
      priority: String(project.priority),
      start_date: project.start_date ?? "",
      target_date: project.target_date ?? "",
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
      const payload = toProjectPayload(form);

      if (editingId) {
        await updateProject(editingId, payload);
      } else {
        await createProject(payload);
      }

      resetForm();
      await loadProjects();
    } catch (error) {
      if (!handleAuthError(error)) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to save project",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(project: Project) {
    const confirmed = window.confirm(
      `Delete "${project.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(project.id);
    setError("");

    try {
      await deleteProject(project.id);
      await loadProjects();
    } catch (error) {
      if (!handleAuthError(error)) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to delete project",
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
              Projects
            </h1>

            <p className="text-gray-500">
              Plan and track your IRIS projects.
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
            {editingId ? "Edit project" : "Create project"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="mt-4 grid gap-4 rounded border p-4 sm:grid-cols-2"
          >
            <label className="block text-sm font-medium">
              Name
              <input
                value={form.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
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
              Start date
              <input
                type="date"
                value={form.start_date}
                onChange={(event) =>
                  updateField("start_date", event.target.value)
                }
                className="mt-1 w-full rounded border p-2"
              />
            </label>

            <label className="block text-sm font-medium">
              Target date
              <input
                type="date"
                value={form.target_date}
                onChange={(event) =>
                  updateField("target_date", event.target.value)
                }
                className="mt-1 w-full rounded border p-2"
              />
            </label>

            <div className="flex items-end gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update project"
                    : "Create project"}
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
            Project list
          </h2>

          {loading ? (
            <p className="mt-4 text-gray-500">
              Loading projects...
            </p>
          ) : projects.length === 0 ? (
            <p className="mt-4 text-gray-500">
              No projects yet.
            </p>
          ) : (
            <div className="mt-4 grid gap-4">
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="rounded border p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {project.name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-600">
                        {project.description ||
                          "No description"}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(project)}
                        className="rounded border px-3 py-2 text-sm"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(project)}
                        disabled={deletingId === project.id}
                        className="rounded border border-red-200 px-3 py-2 text-sm text-red-700 disabled:opacity-50"
                      >
                        {deletingId === project.id
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
                      <dd>{project.status}</dd>
                    </div>

                    <div>
                      <dt className="text-gray-500">
                        Priority
                      </dt>
                      <dd>{project.priority}</dd>
                    </div>

                    <div>
                      <dt className="text-gray-500">
                        Start date
                      </dt>
                      <dd>{formatDate(project.start_date)}</dd>
                    </div>

                    <div>
                      <dt className="text-gray-500">
                        Target date
                      </dt>
                      <dd>{formatDate(project.target_date)}</dd>
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
