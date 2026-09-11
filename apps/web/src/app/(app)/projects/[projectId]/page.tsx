"use client";

import ProjectTimelineGraph from "@/components/projects/ProjectTimelineGraph";
import { ApiError } from "@/lib/api";
import { type CurrentUser, getCurrentUser, getToken, removeToken } from "@/lib/auth";
import { createEvent, deleteEvent, type Event, getEvents, updateEvent } from "@/lib/events";
import { getProject, type Project, updateProject } from "@/lib/projects";
import { createTask, deleteTask, getTasks, type Task, type TaskCreate, updateTask } from "@/lib/tasks";
import { ArrowLeft, CalendarDays, CircleDot, Clock3, Plus, RotateCcw } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";

const columns = [
    { id: "todo", label: "To do" },
    { id: "in_progress", label: "In progress" },
    { id: "done", label: "Done" },
];
const emptyTask = { title: "", description: "", status: "todo", priority: "3", due_at: "", parent_task_id: "" };
const dateText = (value: string | null) =>
    value
        ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value))
        : "No deadline";
const inputDate = (value: string | null) => (value ? new Date(value).toISOString().slice(0, 10) : "");
const percentDone = (tasks: Task[]) =>
    tasks.length ? Math.round((tasks.filter(task => task.status === "done").length / tasks.length) * 100) : 0;

async function syncDeadline(projectId: string, task: Task, user: CurrentUser, events: Event[]) {
    const existing = events.find(event => event.project_id === projectId && event.title === task.title);
    if (!task.due_at) {
        if (existing) await deleteEvent(existing.id);
        return;
    }
    const data = {
        user_id: user.id,
        project_id: projectId,
        title: task.title,
        description: task.description ?? `Project task: ${task.title}`,
        start_at: new Date(task.due_at).toISOString(),
        end_at: new Date(new Date(task.due_at).getTime() + 3600000).toISOString(),
        location: null,
        event_type: "deadline",
    };
    if (existing) await updateEvent(existing.id, data);
    else await createEvent(data);
}

export default function ProjectDetailPage() {
    const router = useRouter();
    const { projectId } = useParams<{ projectId: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [tab, setTab] = useState<"planning" | "progress">("planning");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [taskModal, setTaskModal] = useState(false);
    const [projectModal, setProjectModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [taskForm, setTaskForm] = useState(emptyTask);
    const [projectForm, setProjectForm] = useState({
        name: "",
        description: "",
        status: "planned",
        priority: "3",
        target_date: "",
    });

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const token = getToken();
                if (!token) {
                    router.replace("/login");
                    return;
                }
                const [currentProject, allTasks, allEvents, currentUser] = await Promise.all([
                    getProject(projectId),
                    getTasks(),
                    getEvents(),
                    getCurrentUser(token),
                ]);
                if (cancelled) return;
                setProject(currentProject);
                setTasks(allTasks.filter(task => task.project_id === projectId));
                setEvents(allEvents);
                setUser(currentUser);
                setProjectForm({
                    name: currentProject.name,
                    description: currentProject.description ?? "",
                    status: currentProject.status,
                    priority: String(currentProject.priority),
                    target_date: inputDate(currentProject.target_date),
                });
            } catch (err) {
                if (cancelled) return;
                if (err instanceof ApiError && err.status === 401) {
                    removeToken();
                    router.replace("/login");
                    return;
                }
                setError(err instanceof Error ? err.message : "Unable to load project");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        void load();
        return () => {
            cancelled = true;
        };
    }, [projectId, router]);

    const grouped = useMemo(
        () => columns.map(column => ({ ...column, tasks: tasks.filter(task => task.status === column.id) })),
        [tasks],
    );
    const completion = percentDone(tasks);
    const setTask = (patch: Partial<typeof emptyTask>) => setTaskForm(current => ({ ...current, ...patch }));

    async function changeStatus(task: Task, status: string) {
        const previous = task;
        const completedAt = status === "done" ? new Date().toISOString() : null;
        setTasks(current =>
            current.map(item => (item.id === task.id ? { ...item, status, completed_at: completedAt } : item)),
        );
        try {
            const updated = await updateTask(task.id, { status, completed_at: completedAt });
            setTasks(current => current.map(item => (item.id === task.id ? updated : item)));
            if (user) {
                await syncDeadline(projectId, updated, user, events);
                setEvents(await getEvents());
            }
        } catch (err) {
            setTasks(current => current.map(item => (item.id === task.id ? previous : item)));
            setError(err instanceof Error ? err.message : "Unable to update task");
        }
    }

    async function saveTask(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!project || !user || !taskForm.title.trim()) return;
        const payload: TaskCreate = {
            project_id: project.id,
            parent_task_id: taskForm.parent_task_id || null,
            title: taskForm.title.trim(),
            description: taskForm.description.trim() || null,
            status: taskForm.status,
            priority: Number(taskForm.priority),
            due_at: taskForm.due_at ? new Date(`${taskForm.due_at}T09:00:00`).toISOString() : null,
        };
        try {
            const saved = editingId ? await updateTask(editingId, payload) : await createTask(payload);
            setTasks(current =>
                editingId ? current.map(task => (task.id === editingId ? saved : task)) : [saved, ...current],
            );
            await syncDeadline(project.id, saved, user, events);
            setEvents(await getEvents());
            setTaskForm(emptyTask);
            setEditingId(null);
            setTaskModal(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to save task");
        }
    }

    async function removeTask(task: Task) {
        if (!window.confirm(`Delete "${task.title}"?`)) return;
        try {
            await deleteTask(task.id);
            setTasks(current => current.filter(item => item.id !== task.id));
            const event = events.find(item => item.project_id === projectId && item.title === task.title);
            if (event) await deleteEvent(event.id);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to delete task");
        }
    }

    async function saveProject(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!project) return;
        try {
            const updated = await updateProject(project.id, {
                name: projectForm.name.trim(),
                description: projectForm.description.trim() || null,
                status: projectForm.status,
                priority: Number(projectForm.priority),
                target_date: projectForm.target_date || null,
            });
            setProject(updated);
            setProjectModal(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to update project");
        }
    }

    function editTask(task: Task) {
        setEditingId(task.id);
        setTaskForm({
            title: task.title,
            description: task.description ?? "",
            status: task.status,
            priority: String(task.priority),
            due_at: inputDate(task.due_at),
            parent_task_id: task.parent_task_id ?? "",
        });
        setTaskModal(true);
    }
    function openNewTask() {
        setEditingId(null);
        setTaskForm(emptyTask);
        setTaskModal(true);
    }

    if (loading)
        return (
            <div className="animate-pulse border border-white/8 bg-white/3 p-8 text-zinc-600">Loading project...</div>
        );
    if (!project)
        return (
            <div className="border border-rose-300/20 bg-rose-300/5 p-6 text-rose-300">
                {error || "Project not found."}
            </div>
        );

    return (
        <div>
            <button
                type="button"
                onClick={() => router.push("/projects")}
                className="flex items-center gap-2 text-xs text-zinc-600 hover:text-lime-300"
            >
                <ArrowLeft size={14} /> Projects
            </button>
            <div className="mt-6 flex flex-col justify-between gap-5 border-b border-white/8 pb-7 lg:flex-row lg:items-end">
                <div>
                    <p className="text-xs text-zinc-600">
                        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-lime-300" />
                        {project.status}
                    </p>
                    <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">{project.name}</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                        {project.description || "No project description yet."}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setProjectModal(true)}
                        className="border border-white/10 px-3 py-2 text-sm text-zinc-400 hover:bg-white/5"
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        onClick={() =>
                            void updateProject(project.id, {
                                status: project.status === "archived" ? "planned" : "archived",
                            }).then(setProject)
                        }
                        className="border border-white/10 px-3 py-2 text-sm text-zinc-400 hover:bg-white/5"
                    >
                        {project.status === "archived" ? "Restore" : "Archive"}
                    </button>
                </div>
            </div>
            <div className="grid gap-4 border-b border-white/8 py-5 sm:grid-cols-4">
                <div>
                    <p className="text-xs text-zinc-600">Progress</p>
                    <p className="mt-1 font-mono text-xl text-zinc-100">{completion}%</p>
                </div>
                <div>
                    <p className="text-xs text-zinc-600">Deadline</p>
                    <p className="mt-1 text-sm text-zinc-300">{dateText(project.target_date)}</p>
                </div>
                <div>
                    <p className="text-xs text-zinc-600">Tasks</p>
                    <p className="mt-1 font-mono text-xl text-zinc-100">{String(tasks.length).padStart(2, "0")}</p>
                </div>
                <div>
                    <p className="text-xs text-zinc-600">Priority</p>
                    <p className="mt-1 text-sm text-zinc-300">P{project.priority}</p>
                </div>
            </div>
            <div className="mt-6">
                <ProjectTimelineGraph project={project} tasks={tasks} events={events} />
            </div>
            <div className="mt-6 flex gap-6 border-b border-white/8 text-sm">
                <button
                    type="button"
                    onClick={() => setTab("planning")}
                    className={`border-b-2 pb-3 ${tab === "planning" ? "border-lime-300 text-zinc-100" : "border-transparent text-zinc-600"}`}
                >
                    Planning
                </button>
                <button
                    type="button"
                    onClick={() => setTab("progress")}
                    className={`border-b-2 pb-3 ${tab === "progress" ? "border-lime-300 text-zinc-100" : "border-transparent text-zinc-600"}`}
                >
                    Progress
                </button>
            </div>
            {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
            {tab === "progress" ? (
                <div className="mt-6 rounded-xl border border-white/8 bg-[#121718] p-5">
                    <p className="text-sm text-zinc-400">Completion</p>
                    <div className="mt-3 h-2 bg-white/5">
                        <div className="h-full bg-lime-300" style={{ width: `${completion}%` }} />
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        {columns.map(column => (
                            <div key={column.id} className="border border-white/8 bg-[#0d1112] p-3">
                                <p className="text-xs text-zinc-600">{column.label}</p>
                                <p className="mt-2 font-mono text-xl text-zinc-100">
                                    {String(tasks.filter(task => task.status === column.id).length).padStart(2, "0")}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
                    <section className="rounded-xl border border-white/8 bg-[#121718] p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">Plan</p>
                                <h2 className="mt-2 text-lg font-semibold text-white">Project timeline</h2>
                            </div>
                            <button
                                type="button"
                                onClick={openNewTask}
                                className="flex items-center gap-2 border border-white/10 px-3 py-2 text-sm text-zinc-400 hover:bg-white/5"
                            >
                                <Plus size={15} /> Add task
                            </button>
                        </div>
                        <div className="mt-5 space-y-4">
                            {grouped.map(column => (
                                <div key={column.id} className="rounded-lg border border-white/8 bg-[#0d1112] p-3">
                                    <div className="mb-3 flex justify-between">
                                        <span className="text-sm font-medium text-zinc-200">{column.label}</span>
                                        <span className="text-xs text-zinc-500">{column.tasks.length}</span>
                                    </div>
                                    {column.tasks.length === 0 ? (
                                        <p className="rounded border border-dashed border-white/10 p-4 text-sm text-zinc-600">
                                            No tasks yet.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {column.tasks.map(task => (
                                                <div
                                                    key={task.id}
                                                    className="rounded border border-white/8 bg-[#151a1b] p-3"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <CircleDot
                                                                    size={14}
                                                                    className={
                                                                        task.status === "done"
                                                                            ? "text-lime-300"
                                                                            : "text-zinc-500"
                                                                    }
                                                                />
                                                                <p className="truncate text-sm font-medium text-white">
                                                                    {task.title}
                                                                </p>
                                                            </div>
                                                            <p className="mt-2 text-xs text-zinc-500">
                                                                {task.description || "No additional notes."}
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => editTask(task)}
                                                            className="text-xs text-zinc-400 hover:text-white"
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>
                                                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-zinc-500">
                                                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-1">
                                                            <Clock3 size={11} />{" "}
                                                            {task.due_at ? dateText(task.due_at) : "No date"}
                                                        </span>
                                                        {task.parent_task_id && (
                                                            <span className="rounded-full border border-lime-300/20 bg-lime-300/10 px-2 py-1 text-lime-300">
                                                                Subtask
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-3 flex gap-3">
                                                        <select
                                                            value={task.status}
                                                            onChange={event =>
                                                                void changeStatus(task, event.target.value)
                                                            }
                                                            className="rounded border border-white/10 bg-[#0d1112] px-2 py-1.5 text-xs text-zinc-200"
                                                        >
                                                            <option value="todo">To do</option>
                                                            <option value="in_progress">In progress</option>
                                                            <option value="done">Done</option>
                                                        </select>
                                                        <button
                                                            type="button"
                                                            onClick={() => void removeTask(task)}
                                                            className="text-xs text-rose-300 hover:text-rose-200"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                    <aside className="rounded-xl border border-white/8 bg-[#121718] p-4">
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">Overview</p>
                        <div className="mt-5 space-y-4">
                            <div className="border border-white/8 bg-[#0d1112] p-3">
                                <p className="text-xs text-zinc-600">Next task</p>
                                <p className="mt-2 text-sm text-zinc-200">
                                    {tasks.find(task => task.status !== "done")?.title || "Everything is complete."}
                                </p>
                            </div>
                            <div className="border border-white/8 bg-[#0d1112] p-3">
                                <p className="text-xs text-zinc-600">Calendar sync</p>
                                <p className="mt-2 text-sm text-zinc-200">
                                    <CalendarDays className="mr-2 inline text-lime-300" size={15} />
                                    {tasks.some(task => task.due_at) ? "Deadlines synced" : "No deadlines yet"}
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            )}
            {taskModal && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
                    <form
                        onSubmit={saveTask}
                        className="w-full max-w-xl rounded-xl border border-white/12 bg-[#151a1b] p-6"
                    >
                        <div className="flex justify-between">
                            <h2 className="text-xl font-semibold text-white">
                                {editingId ? "Edit task" : "Add task or subtask"}
                            </h2>
                            <button type="button" onClick={() => setTaskModal(false)} aria-label="Close task form">
                                <RotateCcw size={18} />
                            </button>
                        </div>
                        <div className="mt-6 space-y-4">
                            <input
                                required
                                placeholder="Task title"
                                value={taskForm.title}
                                onChange={event => setTask({ title: event.target.value })}
                                className="w-full border border-white/10 bg-[#0e1213] px-3 py-2.5 text-sm text-white"
                            />
                            <textarea
                                placeholder="Description"
                                value={taskForm.description}
                                onChange={event => setTask({ description: event.target.value })}
                                className="min-h-24 w-full border border-white/10 bg-[#0e1213] px-3 py-2.5 text-sm text-white"
                            />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <select
                                    value={taskForm.status}
                                    onChange={event => setTask({ status: event.target.value })}
                                    className="border border-white/10 bg-[#0e1213] px-3 py-2.5 text-sm text-white"
                                >
                                    <option value="todo">To do</option>
                                    <option value="in_progress">In progress</option>
                                    <option value="done">Done</option>
                                </select>
                                <input
                                    type="date"
                                    value={taskForm.due_at}
                                    onChange={event => setTask({ due_at: event.target.value })}
                                    className="border border-white/10 bg-[#0e1213] px-3 py-2.5 text-sm text-white"
                                />
                            </div>
                            <select
                                value={taskForm.parent_task_id}
                                onChange={event => setTask({ parent_task_id: event.target.value })}
                                className="w-full border border-white/10 bg-[#0e1213] px-3 py-2.5 text-sm text-white"
                            >
                                <option value="">No parent task</option>
                                {tasks
                                    .filter(task => task.id !== editingId)
                                    .map(task => (
                                        <option key={task.id} value={task.id}>
                                            {task.title}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div className="mt-7 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setTaskModal(false)}
                                className="border border-white/10 px-4 py-2.5 text-sm text-zinc-400"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-lime-300 px-4 py-2.5 text-sm font-semibold text-[#10150b]"
                            >
                                Save task
                            </button>
                        </div>
                    </form>
                </div>
            )}
            {projectModal && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
                    <form
                        onSubmit={saveProject}
                        className="w-full max-w-xl rounded-xl border border-white/12 bg-[#151a1b] p-6"
                    >
                        <h2 className="text-xl font-semibold text-white">Edit project</h2>
                        <div className="mt-6 space-y-4">
                            <input
                                required
                                value={projectForm.name}
                                onChange={event => setProjectForm({ ...projectForm, name: event.target.value })}
                                className="w-full border border-white/10 bg-[#0e1213] px-3 py-2.5 text-sm text-white"
                            />
                            <textarea
                                value={projectForm.description}
                                onChange={event => setProjectForm({ ...projectForm, description: event.target.value })}
                                className="min-h-24 w-full border border-white/10 bg-[#0e1213] px-3 py-2.5 text-sm text-white"
                            />
                            <select
                                value={projectForm.status}
                                onChange={event => setProjectForm({ ...projectForm, status: event.target.value })}
                                className="w-full border border-white/10 bg-[#0e1213] px-3 py-2.5 text-sm text-white"
                            >
                                <option value="planned">Planned</option>
                                <option value="in_progress">In progress</option>
                                <option value="completed">Completed</option>
                                <option value="archived">Archived</option>
                            </select>
                            <input
                                type="date"
                                value={projectForm.target_date}
                                onChange={event => setProjectForm({ ...projectForm, target_date: event.target.value })}
                                className="w-full border border-white/10 bg-[#0e1213] px-3 py-2.5 text-sm text-white"
                            />
                        </div>
                        <div className="mt-7 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setProjectModal(false)}
                                className="border border-white/10 px-4 py-2.5 text-sm text-zinc-400"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-lime-300 px-4 py-2.5 text-sm font-semibold text-[#10150b]"
                            >
                                Save changes
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
