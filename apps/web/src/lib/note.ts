import { api } from "./api";
import { getToken } from "./auth";

export interface Note {
    id: string;
    user_id: string;
    project_id: string | null;
    title: string;
    content: string;
    note_type: string;
    created_at: string;
    updated_at: string;
}

export interface NoteCreateInput {
    title: string;
    content: string;
    note_type?: string;
    project_id?: string | null;
}

export interface NoteUpdateInput {
    title?: string;
    content?: string;
    note_type?: string;
    project_id?: string | null;
}

function getAccessToken(): string | null {
    return getToken();
    }

export async function listNotes(): Promise<Note[]> {
    const token = getAccessToken()
    return api<Note[]>("/notes", { 
        method: "GET",
        token: token ?? undefined,
    });
}

export async function getNote(id: string): Promise<Note> {
    const token = getAccessToken();
    return api<Note>(`/notes/${id}`, { 
        method: "GET",
        token: token ?? undefined,
    });
}

export async function createNote(data: NoteCreateInput): Promise<Note> {
    const token = getAccessToken();
    return api<Note>("/notes", {
        method: "POST",
        token: token ?? undefined,
        body: JSON.stringify(data),
    });
}

export async function updateNote(id: string, data: NoteUpdateInput): Promise<Note> {
    const token = getAccessToken();
    return api<Note>(`/notes/${id}`, {
    method: "PATCH",
    token: token ?? undefined,
    body: JSON.stringify(data),
    });
}

export async function deleteNote(id: string): Promise<void> {
    const token = getAccessToken();
    return api<void>(`/notes/${id}`, { 
        method: "DELETE", 
        token: token ?? undefined,
    });
}