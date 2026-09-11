"use client";

import { Archive, ArrowUpRight, FolderKanban, MoreHorizontal, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ApiError } from "@/lib/api";
import { removeToken } from "@/lib/auth";
import { createProject, getProjects, type Project, type ProjectCreate, updateProject } from "@/lib/projects";
import { getTasks, type Task } from "@/lib/tasks";

const statusLabels: Record<string, string> = {
    planned: "Planned",
    in_progress: "In progress",
    completed: "Completed",
    archived: "Archived",
};

function statusLabel(status: string) {
    return statusLabels[status] ?? status.replaceAll("_", " ");
}

function formatDate(value: string | null) {
    return value
        ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value))
        : "No deadline";
}

function progressFor(projectId: string, tasks: Task[]) {
    const related = tasks.filter(task => task.project_id === projectId);
    if (!related.length) return 0;
    return Math.round((related.filter(task => task.status === "done").length / related.length) * 100);
}

function ProjectCard({
    project,
    tasks,
    selected,
    onSelect,
    onOpen,
    onArchive,
}: {
    project: Project;
    tasks: Task[];
    selected: boolean;
    onSelect: () => void;
    onOpen: () => void;
    onArchive: (project: Project) => void;
}) {
    const progress = progressFor(project.id, tasks);
    const projectTasks = tasks.filter(task => task.project_id === project.id);

    return (
        <article
            onClick={onSelect}
            onDoubleClick={onOpen}
            className={`group cursor-pointer border p-5 transition duration-200 hover:-translate-y-0.5 ${
                selected
                    ? "border-lime-300/50 bg-[#1a1f1d]"
                    : "border-white/8 bg-[#151a1b] hover:border-white/18 hover:bg-[#192020]"
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lime-300/15 text-lime-300">
                    <FolderKanban size={19} />
                </div>
                <button
                    type="button"
                    onClick={event => {
                        event.stopPropagation();
                        onArchive(project);
                    }}
                    className="rounded-md p-1 text-zinc-600 hover:bg-white/6 hover:text-zinc-300"
                    aria-label={project.status === "archived" ? "Restore project" : "Archive project"}
                >
                    <Archive size={17} />
                </button>
            </div>

            <div className="mt-5 block w-full text-left">
                <div className="flex items-center gap-2">
                    <h3 className="truncate text-[15px] font-semibold text-zinc-100">{project.name}</h3>
                    <ArrowUpRight size={14} className="shrink-0 text-zinc-600 transition group-hover:text-zinc-300" />
                </div>
                <p className="mt-2 min-h-10 text-sm leading-5 text-zinc-500">
                    {project.description || "A project waiting to be remembered."}
                </p>
            </div>

            <div className="mt-5 flex items-center justify-between text-[11px] uppercase tracking-[0.13em] text-zinc-500">
                <span className="border border-lime-300/20 bg-lime-300/10 px-2 py-1 text-lime-300">
                    {statusLabel(project.status)}
                </span>
                <span>{projectTasks.length} tasks</span>
            </div>

            <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs">
                    <span className="text-zinc-500">Progress</span>
                    <span className="font-mono text-zinc-300">{progress}%</span>
                </div>
                <div className="h-1 bg-white/8">
                    <div className="h-full bg-lime-300 transition-all" style={{ width: `${progress}%` }} />
                </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/[0.07] pt-4 text-xs">
                <div>
                    <p className="mb-1 text-zinc-600">Deadline</p>
                    <p className="text-zinc-300">{formatDate(project.target_date)}</p>
                </div>
                <div>
                    <p className="mb-1 text-zinc-600">Priority</p>
                    <p className="text-zinc-300">P{project.priority}</p>
                </div>
            </div>
        </article>
    );
}

function PreviewPanel({
    project,
    tasks,
    onClose,
    onOpen,
}: {
    project: Project;
    tasks: Task[];
    onClose: () => void;
    onOpen: () => void;
}) {
    const progress = progressFor(project.id, tasks);
    const related = tasks.filter(task => task.project_id === project.id);
    const nextTask = related.find(task => task.status !== "done");

    return (
        <aside className="fixed inset-y-0 right-0 z-30 flex w-full max-w-md flex-col border-l border-white/1 bg-[#111516] shadow-2xl shadow-black/40 sm:w-97.5">
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">Project preview</p>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md p-2 text-zinc-500 hover:bg-white/6 hover:text-white"
                    aria-label="Close preview"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-lime-300/15 text-lime-300">
                    <FolderKanban size={22} />
                </div>

                <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white">{project.name}</h2>
                <p className="mt-3 text-sm leading-6 text-zinc-500">
                    {project.description || "No description added yet."}
                </p>

                <div className="mt-6 flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-lime-300" />
                    <span className="text-sm text-zinc-300">{statusLabel(project.status)}</span>
                    <span className="text-zinc-700">/</span>
                    <span className="font-mono text-xs text-zinc-500">P{project.priority}</span>
                </div>

                <div className="mt-8 border-y border-white/8 py-5">
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Overall progress</span>
                        <span className="font-mono text-zinc-200">{progress}%</span>
                    </div>
                    <div className="mt-3 h-1 bg-white/8">
                        <div className="h-full bg-lime-300" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <dl className="mt-6 space-y-5 text-sm">
                    <div className="flex items-start justify-between gap-6">
                        <dt className="text-zinc-600">Deadline</dt>
                        <dd className="text-right text-zinc-300">{formatDate(project.target_date)}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-6">
                        <dt className="text-zinc-600">Next task</dt>
                        <dd className="text-right text-zinc-300">{nextTask?.title || "No open tasks"}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-6">
                        <dt className="text-zinc-600">Tasks</dt>
                        <dd className="text-right font-mono text-zinc-300">{related.length}</dd>
                    </div>
                </dl>
            </div>

            <div className="flex items-center justify-between border-t border-white/8 px-6 py-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="border border-white/1 px-3 py-2 text-sm text-zinc-400 hover:text-white"
                >
                    Close
                </button>
                <button
                    type="button"
                    onClick={onOpen}
                    className="bg-lime-300 px-4 py-2 text-sm font-semibold text-[#10150b] hover:bg-lime-200"
                >
                    Open project
                </button>
            </div>
        </aside>
    );
}

function CreateProjectDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (project: Project) => void }) {
    const [form, setForm] = useState<ProjectCreate>({
        name: "",
        description: "",
        status: "planned",
        priority: 3,
        target_date: null,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!form.name.trim()) return;

        setSaving(true);
        setError("");

        try {
            const created = await createProject({
                ...form,
                name: form.name.trim(),
                description: form.description?.trim() || null,
            });
            onCreated(created);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to create project");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <form onSubmit={submit} className="w-full max-w-lg border border-white/12 bg-[#151a1b] p-6 shadow-2xl">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-lime-300">New project</p>
                        <h2 className="mt-2 text-xl font-semibold text-white">Start something worth remembering.</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-zinc-500 hover:text-white"
                        aria-label="Close dialog"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="mt-7 space-y-4">
                    <label className="block text-sm text-zinc-400">
                        Project name
                        <input
                            required
                            autoFocus
                            value={form.name}
                            onChange={event => setForm({ ...form, name: event.target.value })}
                            className="mt-2 w-full border border-white/1 bg-[#0e1213] px-3 py-2.5 text-sm text-white outline-none focus:border-lime-300/60"
                            placeholder="e.g. Personal OS"
                        />
                    </label>

                    <label className="block text-sm text-zinc-400">
                        Description
                        <textarea
                            value={form.description ?? ""}
                            onChange={event => setForm({ ...form, description: event.target.value })}
                            className="mt-2 min-h-24 w-full resize-none border border-white/1 bg-[#0e1213] px-3 py-2.5 text-sm text-white outline-none focus:border-lime-300/60"
                            placeholder="What are you building?"
                        />
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block text-sm text-zinc-400">
                            Status
                            <select
                                value={form.status}
                                onChange={event => setForm({ ...form, status: event.target.value })}
                                className="mt-2 w-full border border-white/1 bg-[#0e1213] px-3 py-2.5 text-sm text-white outline-none focus:border-lime-300/60"
                            >
                                <option value="planned">Planned</option>
                                <option value="in_progress">In progress</option>
                                <option value="completed">Completed</option>
                                <option value="archived">Archived</option>
                            </select>
                        </label>

                        <label className="block text-sm text-zinc-400">
                            Priority
                            <select
                                value={String(form.priority ?? 3)}
                                onChange={event => setForm({ ...form, priority: Number(event.target.value) })}
                                className="mt-2 w-full border border-white/1 bg-[#0e1213] px-3 py-2.5 text-sm text-white outline-none focus:border-lime-300/60"
                            >
                                <option value="1">P1</option>
                                <option value="2">P2</option>
                                <option value="3">P3</option>
                                <option value="4">P4</option>
                                <option value="5">P5</option>
                            </select>
                        </label>
                    </div>

                    <label className="block text-sm text-zinc-400">
                        Deadline
                        <input
                            type="date"
                            value={form.target_date ?? ""}
                            onChange={event => setForm({ ...form, target_date: event.target.value || null })}
                            className="mt-2 w-full border border-white/1 bg-[#0e1213] px-3 py-2.5 text-sm text-white outline-none focus:border-lime-300/60"
                        />
                    </label>
                </div>

                {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}

                <div className="mt-7 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="border border-white/1 px-4 py-2.5 text-sm text-zinc-400 hover:text-white"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={saving}
                        className="bg-lime-300 px-4 py-2.5 text-sm font-semibold text-[#10150b] disabled:opacity-60"
                    >
                        {saving ? "Saving..." : "Create project"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function ProjectWorkspaceEnhanced() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [filter, setFilter] = useState<"all" | "active" | "archived" | "completed" | "planned" | "in_progress">(
        "active",
    );
    const [query, setQuery] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadData = async () => {
            try {
                const [projectResult, taskResult] = await Promise.all([getProjects(), getTasks()]);

                if (cancelled) return;

                setProjects(projectResult);
                setTasks(taskResult);
                setError("");
            } catch (err) {
                if (cancelled) return;

                if (err instanceof ApiError && err.status === 401) {
                    removeToken();
                    router.replace("/login");
                    return;
                }

                setError(err instanceof Error ? err.message : "Unable to load projects");
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadData();

        return () => {
            cancelled = true;
        };
    }, [router]);

    const visibleProjects = useMemo(() => {
        return projects.filter(project => {
            const matchesSearch = `${project.name} ${project.description ?? ""}`
                .toLowerCase()
                .includes(query.toLowerCase());
            const matchesFilter =
                filter === "all"
                    ? true
                    : filter === "active"
                      ? project.status !== "archived" && project.status !== "completed"
                      : filter === "completed"
                        ? project.status === "completed"
                        : filter === "archived"
                          ? project.status === "archived"
                          : project.status === filter;

            return matchesSearch && matchesFilter;
        });
    }, [filter, projects, query]);

    const activeCount = projects.filter(
        project => project.status !== "archived" && project.status !== "completed",
    ).length;
    const completedCount = projects.filter(project => project.status === "completed").length;

    async function handleArchive(project: Project) {
        const nextStatus = project.status === "archived" ? "planned" : "archived";

        try {
            const updated = await updateProject(project.id, { status: nextStatus });
            setProjects(current => current.map(item => (item.id === project.id ? updated : item)));
            setSelectedProject(current => (current && current.id === project.id ? updated : current));
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                removeToken();
                router.replace("/login");
                return;
            }
            setError(err instanceof Error ? err.message : "Unable to update project");
        }
    }

    if (loading) {
        return (
            <div className="animate-pulse border border-white/8 bg-white/3 p-8 text-zinc-600">Loading projects...</div>
        );
    }

    return (
        <div className="relative min-h-[calc(100vh-10rem)]">
            <div className="flex items-start justify-between gap-5">
                <div>
                    <div className="flex items-center gap-2 text-xs text-zinc-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-lime-300" /> Workspace / Projects
                    </div>
                    <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Your Projects</h1>
                    <p className="mt-2 text-sm text-zinc-500">
                        Build, track, and remember what you&apos;re working on.
                    </p>
                </div>

                <div className="hidden items-center gap-2 md:flex">
                    <button
                        type="button"
                        onClick={() => setFilter("archived")}
                        className="flex items-center gap-2 border border-white/1 px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
                    >
                        <Archive size={15} /> Archive
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 bg-lime-300 px-4 py-2 text-sm font-semibold text-[#10150b] hover:bg-lime-200"
                    >
                        <Plus size={16} /> Add project
                    </button>
                </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="border border-white/8 bg-[#121718] px-4 py-3">
                    <p className="text-xs text-zinc-600">Active projects</p>
                    <p className="mt-1 font-mono text-xl text-zinc-100">{activeCount.toString().padStart(2, "0")}</p>
                </div>
                <div className="border border-white/8 bg-[#121718] px-4 py-3">
                    <p className="text-xs text-zinc-600">Completed</p>
                    <p className="mt-1 font-mono text-xl text-zinc-100">{completedCount.toString().padStart(2, "0")}</p>
                </div>
                <div className="border border-white/8 bg-[#121718] px-4 py-3">
                    <p className="text-xs text-zinc-600">System status</p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-lime-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-lime-300" /> Local database synced
                    </p>
                </div>
            </div>

            <div className="mt-8 flex flex-col justify-between gap-3 border-b border-white/8 pb-3 sm:flex-row sm:items-center">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    {[
                        ["all", "All"],
                        ["active", "Active"],
                        ["planned", "Planned"],
                        ["in_progress", "In progress"],
                        ["completed", "Completed"],
                        ["archived", "Archived"],
                    ].map(([value, label]) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setFilter(value as typeof filter)}
                            className={`rounded-full border px-3 py-1.5 ${filter === value ? "border-lime-300/50 bg-lime-300/10 text-lime-300" : "border-white/8 text-zinc-500 hover:text-zinc-200"}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full max-w-sm">
                    <Search
                        size={15}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                    />
                    <input
                        data-project-search
                        value={query}
                        onChange={event => setQuery(event.target.value)}
                        placeholder="Search projects"
                        className="w-full border border-white/8 bg-[#121718] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-lime-300/60"
                    />
                </div>
            </div>

            {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {visibleProjects.length === 0 ? (
                    <div className="md:col-span-2 xl:col-span-3 rounded border border-dashed border-white/1 bg-[#121718] p-8 text-center text-zinc-400">
                        No projects match the current filter.
                    </div>
                ) : (
                    visibleProjects.map(project => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            tasks={tasks}
                            selected={selectedProject?.id === project.id}
                            onSelect={() => setSelectedProject(project)}
                            onOpen={() => router.push(`/projects/${project.id}`)}
                            onArchive={handleArchive}
                        />
                    ))
                )}
            </div>

            {selectedProject && (
                <PreviewPanel
                    project={selectedProject}
                    tasks={tasks}
                    onClose={() => setSelectedProject(null)}
                    onOpen={() => router.push(`/projects/${selectedProject.id}`)}
                />
            )}

            {showCreate && (
                <CreateProjectDialog
                    onClose={() => setShowCreate(false)}
                    onCreated={project => {
                        setProjects(current => [project, ...current]);
                        setSelectedProject(project);
                        setFilter("all");
                    }}
                />
            )}

            <Link
                href="/dashboard"
                className="mt-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
            >
                <MoreHorizontal size={14} /> Back to dashboard
            </Link>
        </div>
    );
}
