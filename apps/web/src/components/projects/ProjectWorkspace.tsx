"use client";

import {
    Archive,
    ArrowUpRight,
    CircleDot,
    Clock3,
    Filter,
    FolderKanban,
    GitBranch,
    LayoutGrid,
    MoreHorizontal,
    Plus,
    Search,
    Sparkles,
    X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ApiError } from "@/lib/api";
import { removeToken } from "@/lib/auth";
import { createProject, getProjects, type Project, type ProjectCreate } from "@/lib/projects";
import { getTasks, type Task } from "@/lib/tasks";

type Accent = "lime" | "cyan" | "amber" | "rose" | "violet";
const accents: Accent[] = ["lime", "cyan", "amber", "rose", "violet"];
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
function relativeTime(value: string) {
    const days = Math.round((Date.now() - new Date(value).getTime()) / 86400000);
    return days < 1 ? "Today" : `${days}d ago`;
}
function progressFor(projectId: string, tasks: Task[]) {
    const related = tasks.filter(task => task.project_id === projectId);
    return related.length
        ? Math.round((related.filter(task => task.status === "done").length / related.length) * 100)
        : 0;
}
function accentFor(index: number): Accent {
    return accents[index % accents.length];
}
function colors(accent: Accent) {
    return {
        lime: {
            badge: "border-lime-300/20 bg-lime-300/10 text-lime-300",
            bar: "bg-lime-300",
            icon: "bg-lime-300/15 text-lime-300",
        },
        cyan: {
            badge: "border-cyan-300/20 bg-cyan-300/10 text-cyan-300",
            bar: "bg-cyan-300",
            icon: "bg-cyan-300/15 text-cyan-300",
        },
        amber: {
            badge: "border-amber-300/20 bg-amber-300/10 text-amber-300",
            bar: "bg-amber-300",
            icon: "bg-amber-300/15 text-amber-300",
        },
        rose: {
            badge: "border-rose-300/20 bg-rose-300/10 text-rose-300",
            bar: "bg-rose-300",
            icon: "bg-rose-300/15 text-rose-300",
        },
        violet: {
            badge: "border-violet-300/20 bg-violet-300/10 text-violet-300",
            bar: "bg-violet-300",
            icon: "bg-violet-300/15 text-violet-300",
        },
    }[accent];
}

function ProjectCard({
    project,
    tasks,
    index,
    onSelect,
    onOpen,
}: {
    project: Project;
    tasks: Task[];
    index: number;
    onSelect: () => void;
    onOpen: () => void;
}) {
    const progress = progressFor(project.id, tasks);
    const accent = colors(accentFor(index));
    const related = tasks.filter(task => task.project_id === project.id);
    return (
        <article
            onClick={onSelect}
            onDoubleClick={onOpen}
            className="group cursor-pointer border border-white/8 bg-[#151a1b] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-white/18 hover:bg-[#192020]"
        >
            <div className="flex items-start justify-between gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent.icon}`}>
                    <FolderKanban size={19} />
                </div>
                <button
                    type="button"
                    className="rounded-md p-1 text-zinc-600 hover:bg-white/6 hover:text-zinc-300"
                    aria-label="Project options"
                >
                    <MoreHorizontal size={18} />
                </button>
            </div>
            <div className="mt-5">
                <div className="flex items-center gap-2">
                    <h3 className="truncate text-[15px] font-semibold text-zinc-100">{project.name}</h3>
                    <ArrowUpRight size={14} className="shrink-0 text-zinc-600 transition group-hover:text-zinc-300" />
                </div>
                <p className="mt-2 min-h-10 text-sm leading-5 text-zinc-500">
                    {project.description || "A project waiting to be remembered."}
                </p>
            </div>
            <div className="mt-5 flex items-center justify-between text-[11px] uppercase tracking-[0.13em] text-zinc-500">
                <span className={`border px-2 py-1 ${accent.badge}`}>{statusLabel(project.status)}</span>
                <span>{related.length} tasks</span>
            </div>
            <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs">
                    <span className="text-zinc-500">Progress</span>
                    <span className="font-mono text-zinc-300">{progress}%</span>
                </div>
                <div className="h-1 bg-white/8">
                    <div className={`h-full ${accent.bar} transition-all`} style={{ width: `${progress}%` }} />
                </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/[0.07] pt-4 text-xs">
                <div>
                    <p className="mb-1 text-zinc-600">Deadline</p>
                    <p className="text-zinc-300">{formatDate(project.target_date)}</p>
                </div>
                <div>
                    <p className="mb-1 text-zinc-600">Last activity</p>
                    <p className="text-zinc-300">{relativeTime(project.updated_at)}</p>
                </div>
            </div>
            <div className="mt-4 flex items-center gap-2 overflow-hidden text-xs text-zinc-600">
                <GitBranch size={13} />
                <span className="truncate font-mono">
                    local / {project.priority <= 2 ? "high-priority" : "workspace"}
                </span>
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
                        <dt className="text-zinc-600">Last update</dt>
                        <dd className="text-right text-zinc-300">{relativeTime(project.updated_at)}</dd>
                    </div>
                </dl>
                <div className="mt-8">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">Current focus</p>
                    <div className="mt-3 border border-white/8 bg-white/2 p-4">
                        <div className="flex gap-3">
                            <CircleDot size={16} className="mt-0.5 text-lime-300" />
                            <p className="text-sm text-zinc-300">
                                {nextTask?.title || "Capture the first task for this project"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-white/8 p-6">
                <button
                    type="button"
                    onClick={onOpen}
                    className="flex items-center justify-center gap-2 bg-lime-300 px-4 py-3 text-sm font-semibold text-[#10150b] hover:bg-lime-200"
                >
                    Open project <ArrowUpRight size={15} />
                </button>
                <button
                    type="button"
                    className="flex items-center justify-center gap-2 border border-white/1 px-4 py-3 text-sm text-zinc-300 hover:bg-white/5"
                >
                    <Archive size={15} /> Archive
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
        setSaving(true);
        setError("");
        try {
            onCreated(await createProject(form));
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
                        className="bg-lime-300 px-4 py-2.5 text-sm font-semibold text-[#10150b] disabled:opacity-50"
                    >
                        {saving ? "Creating..." : "Create project"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function ProjectWorkspace() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selected, setSelected] = useState<Project | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("active");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    useEffect(() => {
        Promise.all([getProjects(), getTasks()])
            .then(([projectResult, taskResult]) => {
                setProjects(projectResult);
                setTasks(taskResult);
            })
            .catch(err => {
                if (err instanceof ApiError && err.status === 401) removeToken();
                setError(err instanceof Error ? err.message : "Unable to load projects");
            })
            .finally(() => setLoading(false));
    }, []);
    useEffect(() => {
        function shortcut(event: KeyboardEvent) {
            if (
                (event.key === "n" || event.key === "N") &&
                !["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName)
            )
                setShowCreate(true);
            if (event.key === "/" && !["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName)) {
                event.preventDefault();
                document.querySelector<HTMLInputElement>("[data-project-search]")?.focus();
            }
        }
        window.addEventListener("keydown", shortcut);
        return () => window.removeEventListener("keydown", shortcut);
    }, []);
    const visibleProjects = useMemo(
        () =>
            projects.filter(project => {
                const matchesSearch = `${project.name} ${project.description ?? ""}`
                    .toLowerCase()
                    .includes(query.toLowerCase());
                const matchesFilter =
                    filter === "all" ||
                    (filter === "active"
                        ? project.status !== "archived" && project.status !== "completed"
                        : project.status === filter);
                return matchesSearch && matchesFilter;
            }),
        [filter, projects, query],
    );
    const activeCount = projects.filter(
        project => project.status !== "archived" && project.status !== "completed",
    ).length;
    const completedCount = projects.filter(project => project.status === "completed").length;
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
                    <button
                        type="button"
                        className="border border-white/1 p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
                        aria-label="Filter projects"
                    >
                        <Filter size={16} />
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
                <div className="flex gap-5 text-sm">
                    <button
                        type="button"
                        onClick={() => setFilter("active")}
                        className={`border-b-2 pb-3 ${filter === "active" ? "border-lime-300 text-zinc-100" : "border-transparent text-zinc-600 hover:text-zinc-300"}`}
                    >
                        Active <span className="ml-1 font-mono text-xs text-zinc-600">{activeCount}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter("all")}
                        className={`border-b-2 pb-3 ${filter === "all" ? "border-lime-300 text-zinc-100" : "border-transparent text-zinc-600 hover:text-zinc-300"}`}
                    >
                        All projects <span className="ml-1 font-mono text-xs text-zinc-600">{projects.length}</span>
                    </button>
                </div>
                <label className="flex items-center gap-2 border border-white/8 bg-[#121718] px-3 py-2 text-sm text-zinc-600">
                    <Search size={15} />
                    <input
                        data-project-search
                        value={query}
                        onChange={event => setQuery(event.target.value)}
                        placeholder="Search projects"
                        className="w-36 bg-transparent text-xs text-zinc-200 outline-none placeholder:text-zinc-700"
                    />
                </label>
            </div>
            {error && (
                <div className="mt-6 border border-rose-300/20 bg-rose-300/5 px-4 py-3 text-sm text-rose-300">
                    {error}
                </div>
            )}
            {loading ? (
                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3].map(item => (
                        <div key={item} className="h-72 animate-pulse border border-white/6 bg-white/3" />
                    ))}
                </div>
            ) : visibleProjects.length === 0 ? (
                <div className="mt-8 flex min-h-72 flex-col items-center justify-center border border-dashed border-white/12 bg-[#121718] text-center">
                    <Sparkles size={22} className="text-lime-300/70" />
                    <h2 className="mt-4 text-lg font-medium text-zinc-200">No active projects yet.</h2>
                    <p className="mt-2 text-sm text-zinc-600">Start something worth remembering.</p>
                    <button
                        type="button"
                        onClick={() => setShowCreate(true)}
                        className="mt-6 flex items-center gap-2 bg-lime-300 px-4 py-2.5 text-sm font-semibold text-[#10150b] hover:bg-lime-200"
                    >
                        <Plus size={16} /> Create your first project
                    </button>
                </div>
            ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {visibleProjects.map((project, index) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            tasks={tasks}
                            index={index}
                            onSelect={() => setSelected(project)}
                            onOpen={() => router.push(`/projects/${project.id}`)}
                        />
                    ))}
                </div>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-zinc-600">
                <span className="flex items-center gap-2">
                    <LayoutGrid size={14} /> {visibleProjects.length} visible
                </span>
                <span className="flex items-center gap-2">
                    <Clock3 size={14} /> Updated from local workspace
                </span>
                <Link href="/tasks" className="ml-auto flex items-center gap-1 text-zinc-500 hover:text-lime-300">
                    View all tasks <ArrowUpRight size={14} />
                </Link>
            </div>
            <div className="fixed bottom-5 right-5 hidden items-center gap-2 border border-white/1 bg-[#151a1b] px-3 py-2 font-mono text-[10px] text-zinc-600 shadow-xl lg:flex">
                <span className="border border-white/1 px-1.5 py-0.5 text-zinc-400">N</span> new project{" "}
                <span className="ml-2 border border-white/1 px-1.5 py-0.5 text-zinc-400">/</span> search
            </div>
            {selected && (
                <>
                    <button
                        type="button"
                        className="fixed inset-0 z-20 bg-black/40"
                        onClick={() => setSelected(null)}
                        aria-label="Close project preview"
                    />
                    <PreviewPanel
                        project={selected}
                        tasks={tasks}
                        onClose={() => setSelected(null)}
                        onOpen={() => router.push(`/projects/${selected.id}`)}
                    />
                </>
            )}
            {showCreate && (
                <CreateProjectDialog
                    onClose={() => setShowCreate(false)}
                    onCreated={project => {
                        setProjects(current => [project, ...current]);
                        setShowCreate(false);
                        setSelected(project);
                    }}
                />
            )}
        </div>
    );
}
