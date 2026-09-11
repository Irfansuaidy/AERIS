import type { LucideIcon } from "lucide-react";
import {
    AlertCircle,
    ArrowUpRight,
    CalendarDays,
    Check,
    CheckSquare,
    Clock3,
    FileText,
    FolderKanban,
    Inbox,
    RefreshCw,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { Event } from "@/lib/events";
import type { Note } from "@/lib/note";
import type { Project } from "@/lib/projects";
import type { Task } from "@/lib/tasks";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
});

function isSameDay(value: string | null, date = new Date()): boolean {
    if (!value) {
        return false;
    }

    return new Date(value).toDateString() === date.toDateString();
}

function priorityLabel(priority: number): string {
    if (priority <= 1) {
        return "High";
    }

    return priority === 2 ? "Medium" : "Low";
}

function priorityClass(priority: number): string {
    if (priority <= 1) {
        return "bg-red-400/10 text-red-300";
    }

    if (priority === 2) {
        return "bg-amber-300/10 text-amber-200";
    }

    return "bg-white/6 text-zinc-400";
}

export function DashboardHeader({ firstName, greeting }: { firstName: string; greeting: string }) {
    return (
        <section className="flex flex-col justify-between gap-5 border-b border-white/8 pb-8 sm:flex-row sm:items-end">
            <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#c7f36b]">
                    {new Intl.DateTimeFormat("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                    }).format(new Date())}
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    {greeting}, {firstName}
                </h1>
                <p className="mt-2 text-sm text-zinc-500">Here&apos;s what needs your attention today.</p>
            </div>
            <Link
                href="/tasks"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#c7f36b] px-4 py-2.5 text-sm font-semibold text-[#142006] transition hover:bg-[#d8ff8e]"
            >
                <CheckSquare size={16} />
                Open task list
            </Link>
        </section>
    );
}

export function StatGrid({
    openTasks,
    overdue,
    activeProjects,
    upcomingEvents,
}: {
    openTasks: number;
    overdue: number;
    activeProjects: number;
    upcomingEvents: number;
}) {
    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Open tasks" value={openTasks} detail="Across your workspace" icon={CheckSquare} />
            <StatCard
                label="Overdue"
                value={overdue}
                detail={overdue ? "Needs attention" : "You are on track"}
                icon={Clock3}
                accent={overdue > 0}
            />
            <StatCard label="Active projects" value={activeProjects} detail="Moving forward" icon={FolderKanban} />
            <StatCard label="Upcoming events" value={upcomingEvents} detail="On your calendar" icon={CalendarDays} />
        </div>
    );
}

export function DashboardPanel({ children }: { children: ReactNode }) {
    return <section className="rounded-2xl border border-white/8 bg-[#111516] p-5 sm:p-6">{children}</section>;
}

export function SectionHeader({ title, href, label = "View all" }: { title: string; href: string; label?: string }) {
    return (
        <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wide text-white">{title}</h2>
            <Link href={href} className="flex items-center gap-1 text-xs font-medium text-[#c7f36b] hover:text-white">
                {label}
                <ArrowUpRight size={14} />
            </Link>
        </div>
    );
}

export function TaskList({ tasks, onToggle }: { tasks: Task[]; onToggle: (task: Task) => void }) {
    if (tasks.length === 0) {
        return <EmptyState icon={CheckSquare}>No tasks need your attention today.</EmptyState>;
    }

    return (
        <div className="divide-y divide-white/6">
            {tasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <button
                        onClick={() => onToggle(task)}
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-600 text-[#142006] hover:border-[#c7f36b] hover:bg-[#c7f36b]"
                        aria-label={`Mark ${task.title} complete`}
                    >
                        {task.status === "done" && <Check size={13} />}
                    </button>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-200">{task.title}</p>
                        <p className="mt-1 text-xs text-zinc-600">
                            {task.due_at
                                ? isSameDay(task.due_at)
                                    ? `Today, ${timeFormatter.format(new Date(task.due_at))}`
                                    : `Due ${dateFormatter.format(new Date(task.due_at))}`
                                : "No due date"}
                        </p>
                    </div>
                    <span
                        className={`rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${priorityClass(task.priority)}`}
                    >
                        {priorityLabel(task.priority)}
                    </span>
                </div>
            ))}
        </div>
    );
}

export function EventList({ events }: { events: Event[] }) {
    if (events.length === 0) {
        return <EmptyState icon={CalendarDays}>No upcoming events.</EmptyState>;
    }

    return (
        <div className="space-y-2">
            {events.map(event => (
                <Link href="/calendar" key={event.id} className="flex gap-3 rounded-xl p-2 transition hover:bg-white/5">
                    <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-[#c7f36b]/10 text-[#c7f36b]">
                        <span className="text-[10px] font-semibold uppercase">
                            {new Date(event.start_at).toLocaleDateString("en-US", {
                                month: "short",
                            })}
                        </span>
                        <span className="text-lg font-semibold leading-4">{new Date(event.start_at).getDate()}</span>
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-200">{event.title}</p>
                        <p className="mt-1 text-xs text-zinc-600">
                            {timeFormatter.format(new Date(event.start_at))}
                            {event.location ? ` · ${event.location}` : ""}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    );
}

export function ProjectList({ projects }: { projects: Project[] }) {
    if (projects.length === 0) {
        return <EmptyState icon={FolderKanban}>No active projects.</EmptyState>;
    }

    return (
        <div className="divide-y divide-white/6">
            {projects.map(project => (
                <Link
                    href={`/projects?selected=${project.id}`}
                    key={project.id}
                    className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/6 text-zinc-400">
                        <FolderKanban size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-200">{project.name}</p>
                        <p className="mt-1 text-xs capitalize text-zinc-600">
                            {project.target_date
                                ? `Target ${dateFormatter.format(new Date(project.target_date))}`
                                : "No target date"}
                        </p>
                    </div>
                    <span className="rounded-full border border-[#c7f36b]/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#c7f36b]">
                        {project.status}
                    </span>
                </Link>
            ))}
        </div>
    );
}

export function NoteList({ notes }: { notes: Note[] }) {
    if (notes.length === 0) {
        return <EmptyState icon={FileText}>No recent notes.</EmptyState>;
    }

    return (
        <div className="space-y-1">
            {notes.map(note => (
                <Link
                    href="/note"
                    key={note.id}
                    className="group flex items-start gap-3 rounded-xl p-2 transition hover:bg-white/5"
                >
                    <FileText size={16} className="mt-0.5 shrink-0 text-zinc-600 group-hover:text-[#c7f36b]" />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-200">{note.title}</p>
                        <p className="mt-1 text-xs text-zinc-600">
                            Updated {dateFormatter.format(new Date(note.updated_at))}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    );
}

export function ErrorState({ onRetry, label }: { onRetry: () => void; label: string }) {
    return (
        <div className="flex min-h-32 flex-col items-center justify-center gap-3 text-center text-sm text-zinc-500">
            <AlertCircle size={20} className="text-amber-300" />
            <span>{label}</span>
            <button
                onClick={onRetry}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#c7f36b] hover:text-white"
            >
                <RefreshCw size={13} />
                Retry
            </button>
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="animate-pulse space-y-8">
            <div className="space-y-3 border-b border-white/8 pb-8">
                <div className="h-3 w-32 rounded bg-white/8" />
                <div className="h-10 w-80 max-w-full rounded bg-white/8" />
                <div className="h-4 w-64 rounded bg-white/5" />
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-32 rounded-2xl border border-white/8 bg-[#111516]" />
                ))}
            </div>
            <div className="grid gap-6 xl:grid-cols-2">
                {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="h-64 rounded-2xl border border-white/8 bg-[#111516]" />
                ))}
            </div>
        </div>
    );
}

function EmptyState({ icon: Icon = Inbox, children }: { icon?: LucideIcon; children: ReactNode }) {
    return (
        <div className="flex min-h-32 flex-col items-center justify-center gap-2 px-4 text-center text-sm text-zinc-500">
            <Icon size={20} className="text-zinc-700" />
            {children}
        </div>
    );
}

function StatCard({
    label,
    value,
    detail,
    icon: Icon,
    accent = false,
}: {
    label: string;
    value: number;
    detail: string;
    icon: LucideIcon;
    accent?: boolean;
}) {
    return (
        <div className="rounded-2xl border border-white/8 bg-[#111516] p-4 sm:p-5">
            <div className="flex items-start justify-between">
                <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent ? "bg-red-400/10 text-red-300" : "bg-[#c7f36b]/10 text-[#c7f36b]"}`}
                >
                    <Icon size={16} />
                </div>
                <span className="text-2xl font-semibold tracking-tight text-white">{value}</span>
            </div>
            <p className="mt-5 text-xs font-medium text-zinc-400">{label}</p>
            <p className={`mt-1 text-[11px] ${accent ? "text-red-300" : "text-zinc-600"}`}>{detail}</p>
        </div>
    );
}
