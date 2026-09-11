"use client";

import { CalendarDays, CheckCircle2, Circle, Flag, Milestone } from "lucide-react";

import type { Event } from "@/lib/events";
import type { Project } from "@/lib/projects";
import type { Task } from "@/lib/tasks";

type TimelineItem = {
    id: string;
    title: string;
    date: string;
    kind: "project" | "task" | "event";
    status: string;
    detail: string;
};

function displayDate(value: string) {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
        new Date(value),
    );
}

function iconFor(item: TimelineItem) {
    if (item.kind === "project") return <Flag size={15} />;
    if (item.kind === "event") return <CalendarDays size={15} />;
    return item.status === "done" ? <CheckCircle2 size={15} /> : <Milestone size={15} />;
}

function toneFor(item: TimelineItem) {
    if (item.kind === "project") return "border-lime-300/40 bg-lime-300/15 text-lime-300";
    if (item.kind === "event") return "border-sky-300/30 bg-sky-300/10 text-sky-300";
    if (item.status === "done") return "border-lime-300/30 bg-lime-300/10 text-lime-300";
    if (item.status === "in_progress") return "border-amber-300/30 bg-amber-300/10 text-amber-200";
    return "border-white/15 bg-white/[0.05] text-zinc-400";
}

export default function ProjectTimelineGraph({
    project,
    tasks,
    events,
}: {
    project: Project;
    tasks: Task[];
    events: Event[];
}) {
    const taskItems: TimelineItem[] = tasks
        .filter(task => task.due_at)
        .map(task => ({
            id: `task-${task.id}`,
            title: task.title,
            date: task.due_at as string,
            kind: "task",
            status: task.status,
            detail: task.parent_task_id ? "Subtask deadline" : "Task deadline",
        }));
    const eventItems: TimelineItem[] = events
        .filter(event => event.project_id === project.id && event.event_type !== "deadline")
        .map(event => ({
            id: `event-${event.id}`,
            title: event.title,
            date: event.start_at,
            kind: "event",
            status: event.event_type,
            detail: event.event_type || "Calendar event",
        }));
    const items = [
        {
            id: "project-created",
            title: "Project created",
            date: project.start_date ?? project.created_at,
            kind: "project" as const,
            status: project.status,
            detail: project.start_date ? "Start date" : "Created",
        },
        ...(project.start_date && project.start_date !== project.created_at
            ? [
                  {
                      id: "project-start",
                      title: "Project started",
                      date: project.start_date,
                      kind: "project" as const,
                      status: project.status,
                      detail: "Start date",
                  },
              ]
            : []),
        ...eventItems,
        ...taskItems,
        ...(project.target_date
            ? [
                  {
                      id: "project-target",
                      title: "Project target",
                      date: `${project.target_date}T23:59:59`,
                      kind: "project" as const,
                      status: project.status,
                      detail: "Target date",
                  },
              ]
            : []),
    ].sort((first, second) => new Date(first.date).getTime() - new Date(second.date).getTime());

    return (
        <section className="rounded-xl border border-white/8 bg-[#121718] p-5">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">Calendar graph</p>
                    <h2 className="mt-2 text-lg font-semibold text-white">Project timeline</h2>
                </div>
                <p className="text-xs text-zinc-600">{items.length} milestones plotted</p>
            </div>
            <div className="mt-6 overflow-x-auto pb-2">
                <div className="relative min-w-170 pt-2">
                    <div className="absolute left-6 right-6 top-7.75 h-px bg-linear-to-r from-lime-300/40 via-sky-300/30 to-white/10" />
                    <div className="relative grid grid-flow-col auto-cols-[minmax(150px,1fr)] gap-4">
                        {items.map(item => (
                            <div key={item.id} className="relative min-w-0">
                                <div
                                    className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border ${toneFor(item)}`}
                                >
                                    {iconFor(item)}
                                </div>
                                <p className="mt-4 truncate text-xs font-medium text-zinc-200" title={item.title}>
                                    {item.title}
                                </p>
                                <p className="mt-1 text-[11px] text-zinc-500">{displayDate(item.date)}</p>
                                <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-zinc-700">
                                    {item.detail}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/[0.07] pt-4 text-[11px] text-zinc-500">
                <span className="inline-flex items-center gap-1.5">
                    <Circle size={10} className="text-zinc-400" /> Task
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={11} className="text-sky-300" /> Event
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <Flag size={11} className="text-lime-300" /> Project milestone
                </span>
            </div>
        </section>
    );
}
