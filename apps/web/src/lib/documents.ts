import { api } from "./api";
import { getToken } from "./auth";

export interface DocumentRecord {
    id: string;
    user_id: string;
    project_id: string | null;
    name: string;
    file_path: string;
    mime_type: string | null;
    file_size: number | null;
    checksum: string | null;
    created_at: string;
    updated_at: string;
}

function token(): string | undefined {
    return getToken() ?? undefined;
}

export function getDocuments(): Promise<DocumentRecord[]> {
    return api<DocumentRecord[]>("/documents", { token: token() });
}

export function scanDocuments(): Promise<DocumentRecord[]> {
    return api<DocumentRecord[]>("/documents/scan", { method: "POST", token: token() });
}

export function moveDocument(id: string, folder: string): Promise<DocumentRecord> {
    return api<DocumentRecord>(`/documents/${id}/move`, {
        method: "PATCH",
        body: JSON.stringify({ folder }),
        token: token(),
    });
}

export function deleteDocument(id: string): Promise<void> {
    return api<void>(`/documents/${id}`, { method: "DELETE", token: token() });
}
