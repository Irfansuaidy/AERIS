import { api } from "./api";
import { getToken } from "./auth";

export interface Tag {
    id: string;
    user_id: string;
    name: string;
    created_at: string;
}

export interface TagCreateInput {
    name: string;
}

export interface TagUpdateInput {
    name: string;
}

function authToken(): string | undefined {
    return getToken() ?? undefined;
}

export async function getTags(): Promise<Tag[]> {
    return api<Tag[]>("/tags", { token: authToken() });
}

export async function createTag(data: TagCreateInput): Promise<Tag> {
    return api<Tag>("/tags", {
        method: "POST",
        body: JSON.stringify(data),
        token: authToken(),
    });
}

export async function updateTag(tagId: string, data: TagUpdateInput): Promise<Tag> {
    return api<Tag>(`/tags/${tagId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        token: authToken(),
    });
}

export async function deleteTag(tagId: string): Promise<void> {
    return api<void>(`/tags/${tagId}`, {
        method: "DELETE",
        token: authToken(),
    });
}

// ---- Tag links ----
// Link endpoints only return { <entity>_id, tag_ids: string[] } — not full
// Tag objects — so callers resolve names against getTags() themselves.

interface TagLinkResponse {
    tag_ids: string[];
}

async function getEntityTagIds(path: string): Promise<string[]> {
    const result = await api<TagLinkResponse>(path, { token: authToken() });
    return result.tag_ids;
}

async function addEntityTag(path: string, tagId: string): Promise<void> {
    await api<{ tag_id: string }>(path, {
        method: "POST",
        body: JSON.stringify({ tag_id: tagId }),
        token: authToken(),
    });
}

async function removeEntityTag(path: string): Promise<void> {
    await api<void>(path, {
        method: "DELETE",
        token: authToken(),
    });
}

// Projects
export function getProjectTagIds(projectId: string) {
    return getEntityTagIds(`/projects/${projectId}/tags`);
}
export function addProjectTag(projectId: string, tagId: string) {
    return addEntityTag(`/projects/${projectId}/tags`, tagId);
}
export function removeProjectTag(projectId: string, tagId: string) {
    return removeEntityTag(`/projects/${projectId}/tags/${tagId}`);
}

// Tasks
export function getTaskTagIds(taskId: string) {
    return getEntityTagIds(`/tasks/${taskId}/tags`);
}
export function addTaskTag(taskId: string, tagId: string) {
    return addEntityTag(`/tasks/${taskId}/tags`, tagId);
}
export function removeTaskTag(taskId: string, tagId: string) {
    return removeEntityTag(`/tasks/${taskId}/tags/${tagId}`);
}

// Notes
export function getNoteTagIds(noteId: string) {
    return getEntityTagIds(`/notes/${noteId}/tags`);
}
export function addNoteTag(noteId: string, tagId: string) {
    return addEntityTag(`/notes/${noteId}/tags`, tagId);
}
export function removeNoteTag(noteId: string, tagId: string) {
    return removeEntityTag(`/notes/${noteId}/tags/${tagId}`);
}
