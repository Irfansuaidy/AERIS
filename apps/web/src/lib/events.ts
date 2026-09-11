import { api } from "./api";
import { getToken } from "./auth";

export interface Event {
    id: string;
    user_id: string;
    project_id: string | null;
    title: string;
    description: string | null;
    start_at: string;
    end_at: string | null;
    location: string | null;
    event_type: string;
    created_at: string;
    updated_at: string;
}

export interface EventCreate {
    user_id: string;
    project_id?: string | null;
    title: string;
    description?: string | null;
    start_at: string;
    end_at?: string | null;
    location?: string | null;
    event_type?: string;
}

export type EventUpdate = Partial<Omit<EventCreate, "user_id">>;

function token(): string | undefined {
    return getToken() ?? undefined;
}

export function getEvents(): Promise<Event[]> {
    return api<Event[]>("/events", { token: token() });
}

export function createEvent(data: EventCreate): Promise<Event> {
    return api<Event>("/events", {
        method: "POST",
        body: JSON.stringify(data),
        token: token(),
    });
}

export function updateEvent(id: string, data: EventUpdate): Promise<Event> {
    return api<Event>(`/events/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        token: token(),
    });
}

export function deleteEvent(id: string): Promise<void> {
    return api<void>(`/events/${id}`, {
        method: "DELETE",
        token: token(),
    });
}
