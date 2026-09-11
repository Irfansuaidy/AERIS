"use client";

import { useEffect, useMemo, useState } from "react";

import {
    DashboardHeader,
    DashboardPanel,
    DashboardSkeleton,
    ErrorState,
    EventList,
    NoteList,
    ProjectList,
    SectionHeader,
    StatGrid,
    TaskList,
} from "@/components/dashboard/DashboardSections";
import { getCurrentUser, getToken } from "@/lib/auth";
import { getEvents, type Event } from "@/lib/events";
import { listNotes, type Note } from "@/lib/note";
import { getProjects, type Project } from "@/lib/projects";
import { getTasks, updateTask, type Task } from "@/lib/tasks";

interface DashboardErrors {
    projects: boolean;
    tasks: boolean;
    events: boolean;
    notes: boolean;
}

const initialErrors: DashboardErrors = {
    projects: false,
    tasks: false,
    events: false,
    notes: false,
};

function isUpcoming(date: string): boolean {
    return new Date(date) >= new Date();
}

function getGreeting(): string {
    const hour = new Date().getHours();

    if (hour < 5) {
        return "Good night";
    }

    if (hour < 12) {
        return "Good morning";
    }

    if (hour < 18) {
        return "Good afternoon";
    }

    return "Good evening";
}

export default function DashboardPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [username, setUsername] = useState("there");
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<DashboardErrors>(initialErrors);

    async function loadData() {
        setLoading(true);

        const token = getToken();
        const results = await Promise.allSettled([
            getProjects(),
            getTasks(),
            getEvents(),
            listNotes(),
            token ? getCurrentUser(token) : Promise.resolve(null),
        ]);

        const [projectsResult, tasksResult, eventsResult, notesResult, userResult] = results;

        setProjects(projectsResult.status === "fulfilled" ? projectsResult.value : []);
        setTasks(tasksResult.status === "fulfilled" ? tasksResult.value : []);
        setEvents(eventsResult.status === "fulfilled" ? eventsResult.value : []);
        setNotes(notesResult.status === "fulfilled" ? notesResult.value : []);

        if (userResult.status === "fulfilled" && userResult.value) {
            setUsername(userResult.value.username.split(/[._ -]/)[0]);
        }

        setErrors({
            projects: projectsResult.status === "rejected",
            tasks: tasksResult.status === "rejected",
            events: eventsResult.status === "rejected",
            notes: notesResult.status === "rejected",
        });
        setLoading(false);
    }

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadData();
        }, 0);

        return () => window.clearTimeout(timer);
    }, []);

    const activeProjects = useMemo(
        () => projects.filter(project => project.status !== "completed").slice(0, 5),
        [projects],
    );

    const pendingTasks = useMemo(
        () =>
            tasks
                .filter(task => task.status !== "done")
                .sort(
                    (first, second) =>
                        Number(new Date(first.due_at ?? "9999")) - Number(new Date(second.due_at ?? "9999")),
                )
                .slice(0, 5),
        [tasks],
    );

    const upcomingEvents = useMemo(
        () =>
            events
                .filter(event => isUpcoming(event.start_at))
                .sort((first, second) => Number(new Date(first.start_at)) - Number(new Date(second.start_at)))
                .slice(0, 4),
        [events],
    );

    const recentNotes = useMemo(
        () =>
            [...notes]
                .sort((first, second) => Number(new Date(second.updated_at)) - Number(new Date(first.updated_at)))
                .slice(0, 4),
        [notes],
    );

    const overdueTasks = tasks.filter(
        task => task.status !== "done" && task.due_at !== null && new Date(task.due_at) < new Date(),
    ).length;

    async function toggleTask(task: Task) {
        const status = task.status === "done" ? "todo" : "done";

        setTasks(current => current.map(item => (item.id === task.id ? { ...item, status } : item)));

        try {
            await updateTask(task.id, {
                status,
                completed_at: status === "done" ? new Date().toISOString() : null,
            });
        } catch {
            setTasks(current => current.map(item => (item.id === task.id ? task : item)));
        }
    }

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-8 pb-10">
            <DashboardHeader firstName={username} greeting={getGreeting()} />

            <StatGrid
                openTasks={tasks.filter(task => task.status !== "done").length}
                overdue={overdueTasks}
                activeProjects={projects.filter(project => project.status !== "completed").length}
                upcomingEvents={events.filter(event => isUpcoming(event.start_at)).length}
            />

            <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                <DashboardPanel>
                    <SectionHeader title="Today's tasks" href="/tasks" />
                    {errors.tasks ? (
                        <ErrorState onRetry={loadData} label="Unable to load tasks." />
                    ) : (
                        <TaskList tasks={pendingTasks} onToggle={toggleTask} />
                    )}
                </DashboardPanel>
                <DashboardPanel>
                    <SectionHeader title="Upcoming events" href="/calendar" />
                    {errors.events ? (
                        <ErrorState onRetry={loadData} label="Unable to load events." />
                    ) : (
                        <EventList events={upcomingEvents} />
                    )}
                </DashboardPanel>
            </div>
            <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                <DashboardPanel>
                    <SectionHeader title="Active projects" href="/projects" />
                    {errors.projects ? (
                        <ErrorState onRetry={loadData} label="Unable to load projects." />
                    ) : (
                        <ProjectList projects={activeProjects} />
                    )}
                </DashboardPanel>
                <DashboardPanel>
                    <SectionHeader title="Recent notes" href="/note" />
                    {errors.notes ? (
                        <ErrorState onRetry={loadData} label="Unable to load notes." />
                    ) : (
                        <NoteList notes={recentNotes} />
                    )}
                </DashboardPanel>
            </div>
        </div>
    );
}
