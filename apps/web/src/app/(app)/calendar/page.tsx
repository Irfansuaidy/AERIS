"use client";

import { ApiError } from "@/lib/api";
import { CurrentUser, getCurrentUser, getToken, removeToken } from "@/lib/auth";
import { Event, EventCreate, createEvent, deleteEvent, getEvents, updateEvent } from "@/lib/events";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

const emptyForm = {
    title: "",
    description: "",
    start_at: "",
    end_at: "",
    location: "",
    event_type: "general",
};

type EventForm = typeof emptyForm;

function dateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function toInputDateTime(value: string): string {
    const date = new Date(value);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function toIso(value: string): string {
    return new Date(value).toISOString();
}

function formatTime(value: string): string {
    return new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function CalendarPage() {
    const router = useRouter();
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [month, setMonth] = useState(() => new Date());
    const [form, setForm] = useState<EventForm>(emptyForm);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function loadEvents() {
        try {
            setEvents(await getEvents());
            setError("");
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                removeToken();
                router.replace("/login");
            } else {
                setError(err instanceof Error ? err.message : "Unable to load events");
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.replace("/login");
            return;
        }

        Promise.all([getCurrentUser(token), getEvents()])
            .then(([currentUser, result]) => {
                setUser(currentUser);
                setEvents(result);
            })
            .catch((err: unknown) => {
                if (err instanceof ApiError && err.status === 401) {
                    removeToken();
                    router.replace("/login");
                } else {
                    setError(err instanceof Error ? err.message : "Unable to load calendar");
                }
            })
            .finally(() => setLoading(false));
    }, [router]);

    const days = useMemo(() => {
        const first = new Date(month.getFullYear(), month.getMonth(), 1);
        const start = new Date(first);
        start.setDate(1 - first.getDay());
        return Array.from({ length: 42 }, (_, index) => {
            const day = new Date(start);
            day.setDate(start.getDate() + index);
            return day;
        });
    }, [month]);

    const eventsByDay = useMemo(() => {
        const grouped: Record<string, Event[]> = {};
        for (const event of events) {
            const key = dateKey(new Date(event.start_at));
            grouped[key] = [...(grouped[key] ?? []), event];
        }
        return grouped;
    }, [events]);

    function openNew(day?: Date) {
        const date = day ?? new Date();
        date.setHours(9, 0, 0, 0);
        setEditingId(null);
        setForm({ ...emptyForm, start_at: toInputDateTime(date.toISOString()) });
        setShowForm(true);
        setError("");
    }

    function openEdit(event: Event) {
        setEditingId(event.id);
        setForm({
            title: event.title,
            description: event.description ?? "",
            start_at: toInputDateTime(event.start_at),
            end_at: event.end_at ? toInputDateTime(event.end_at) : "",
            location: event.location ?? "",
            event_type: event.event_type,
        });
        setShowForm(true);
        setError("");
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!user || !form.title.trim() || !form.start_at || saving) return;
        setSaving(true);
        setError("");
        const payload = {
            title: form.title.trim(),
            description: form.description.trim() || null,
            start_at: toIso(form.start_at),
            end_at: form.end_at ? toIso(form.end_at) : null,
            location: form.location.trim() || null,
            event_type: form.event_type,
        };

        try {
            if (editingId) {
                await updateEvent(editingId, payload);
            } else {
                await createEvent({ ...payload, user_id: user.id } satisfies EventCreate);
            }
            setShowForm(false);
            setForm(emptyForm);
            await loadEvents();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to save event");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(event: Event) {
        if (!window.confirm(`Delete "${event.title}"?`)) return;
        try {
            await deleteEvent(event.id);
            await loadEvents();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to delete event");
        }
    }

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Planning</p>
                    <h1 className="mt-1 text-3xl font-semibold tracking-tight">Calendar</h1>
                </div>
                <button
                    type="button"
                    onClick={() => openNew()}
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                    + New event
                </button>
            </div>

            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                    <h2 className="text-lg font-semibold">
                        {month.toLocaleDateString([], { month: "long", year: "numeric" })}
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setMonth(new Date())}
                            className="rounded border px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                        >
                            Today
                        </button>
                        <button
                            type="button"
                            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                            aria-label="Previous month"
                            className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
                        >
                            &lt;
                        </button>
                        <button
                            type="button"
                            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                            aria-label="Next month"
                            className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
                        >
                            &gt;
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-7 border-b bg-gray-50 text-xs font-medium text-gray-500">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                        <div key={day} className="px-3 py-2">
                            {day}
                        </div>
                    ))}
                </div>
                {loading ? (
                    <p className="p-6 text-sm text-gray-500">Loading calendar...</p>
                ) : (
                    <div className="grid grid-cols-7">
                        {days.map(day => {
                            const dayEvents = eventsByDay[dateKey(day)] ?? [];
                            const inMonth = day.getMonth() === month.getMonth();
                            const today = dateKey(day) === dateKey(new Date());
                            return (
                                <div
                                    key={dateKey(day)}
                                    onDoubleClick={() => openNew(day)}
                                    className={`min-h-32 border-b border-r p-2 ${inMonth ? "bg-white" : "bg-gray-50 text-gray-400"}`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => openNew(day)}
                                        className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full text-xs ${today ? "bg-gray-900 font-semibold text-white" : "hover:bg-gray-100"}`}
                                    >
                                        {day.getDate()}
                                    </button>
                                    <div className="space-y-1">
                                        {dayEvents.map(item => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => openEdit(item)}
                                                className="block w-full truncate rounded border-l-2 border-gray-900 bg-gray-100 px-2 py-1 text-left text-xs text-gray-700 hover:bg-gray-200"
                                            >
                                                <span className="font-medium">{formatTime(item.start_at)}</span>{" "}
                                                {item.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {showForm && (
                <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 p-4">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full max-w-lg space-y-4 rounded-lg bg-white p-6 shadow-xl"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">{editingId ? "Edit event" : "New event"}</h2>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                aria-label="Close"
                                className="text-xl text-gray-400 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>
                        <input
                            required
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            placeholder="Event title"
                            className="w-full rounded border px-3 py-2 text-sm"
                        />
                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="text-sm text-gray-600">
                                Starts
                                <input
                                    required
                                    type="datetime-local"
                                    value={form.start_at}
                                    onChange={e => setForm({ ...form, start_at: e.target.value })}
                                    className="mt-1 w-full rounded border px-3 py-2 text-sm text-gray-900"
                                />
                            </label>
                            <label className="text-sm text-gray-600">
                                Ends
                                <input
                                    type="datetime-local"
                                    value={form.end_at}
                                    onChange={e => setForm({ ...form, end_at: e.target.value })}
                                    className="mt-1 w-full rounded border px-3 py-2 text-sm text-gray-900"
                                />
                            </label>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <input
                                value={form.location}
                                onChange={e => setForm({ ...form, location: e.target.value })}
                                placeholder="Location"
                                className="rounded border px-3 py-2 text-sm"
                            />
                            <select
                                value={form.event_type}
                                onChange={e => setForm({ ...form, event_type: e.target.value })}
                                className="rounded border px-3 py-2 text-sm"
                            >
                                <option value="general">General</option>
                                <option value="meeting">Meeting</option>
                                <option value="deadline">Deadline</option>
                                <option value="personal">Personal</option>
                            </select>
                        </div>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Description"
                            rows={3}
                            className="w-full rounded border px-3 py-2 text-sm"
                        />
                        <div className="flex justify-between gap-2">
                            <div>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const item = events.find(current => current.id === editingId);
                                            if (item) void handleDelete(item);
                                            setShowForm(false);
                                        }}
                                        className="rounded border border-red-200 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="rounded border px-4 py-2 text-sm text-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                                >
                                    {saving ? "Saving..." : editingId ? "Save changes" : "Create event"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </section>
    );
}
