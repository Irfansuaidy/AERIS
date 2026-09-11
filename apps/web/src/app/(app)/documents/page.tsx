"use client";

import { ApiError } from "@/lib/api";
import { getToken, removeToken } from "@/lib/auth";
import { DocumentRecord, deleteDocument, getDocuments, moveDocument, scanDocuments } from "@/lib/documents";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

function formatSize(size: number | null): string {
    if (size === null) return "Unknown size";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function fileType(document: DocumentRecord): string {
    return (
        document.mime_type?.split("/").pop()?.toUpperCase() ?? document.name.split(".").pop()?.toUpperCase() ?? "FILE"
    );
}

function folderName(path: string): string {
    const parts = path.split("/");
    return parts.length > 1 ? parts[parts.length - 2] : "Unfiled";
}

export default function DocumentsPage() {
    const router = useRouter();
    const [documents, setDocuments] = useState<DocumentRecord[]>([]);
    const [query, setQuery] = useState("");
    const [folder, setFolder] = useState("All folders");
    const [loading, setLoading] = useState(true);
    const [working, setWorking] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        try {
            setDocuments(await getDocuments());
            setError("");
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                removeToken();
                router.replace("/login");
            } else setError(err instanceof Error ? err.message : "Unable to load documents");
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        if (!getToken()) {
            router.replace("/login");
            return;
        }

        async function loadInitialDocuments() {
            await load();
        }

        loadInitialDocuments();
    }, [load, router]);

    const folders = useMemo(
        () => ["All folders", ...Array.from(new Set(documents.map(document => folderName(document.file_path)))).sort()],
        [documents],
    );
    const visibleDocuments = useMemo(
        () =>
            documents.filter(document => {
                const matchesQuery = document.name.toLowerCase().includes(query.toLowerCase());
                return matchesQuery && (folder === "All folders" || folderName(document.file_path) === folder);
            }),
        [documents, folder, query],
    );

    async function handleScan() {
        setWorking(true);
        try {
            const imported = await scanDocuments();
            if (imported.length) setDocuments(current => [...imported, ...current]);
            else await load();
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                removeToken();
                router.replace("/login");
                return;
            }
            setError(err instanceof Error ? err.message : "Unable to scan documents");
        } finally {
            setWorking(false);
        }
    }

    async function handleMove(document: DocumentRecord) {
        const destination = window.prompt(
            "Move to subfolder under /data/documents",
            folderName(document.file_path) === "Unfiled" ? "" : folderName(document.file_path),
        );
        if (destination === null) return;
        setWorking(true);
        try {
            const updated = await moveDocument(document.id, destination.trim());
            setDocuments(current => current.map(item => (item.id === updated.id ? updated : item)));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to move document");
        } finally {
            setWorking(false);
        }
    }

    async function handleDelete(document: DocumentRecord) {
        if (!window.confirm(`Remove metadata for "${document.name}"? The file will remain on disk.`)) return;
        try {
            await deleteDocument(document.id);
            setDocuments(current => current.filter(item => item.id !== document.id));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to remove document");
        }
    }

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Library</p>
                    <h1 className="mt-1 text-3xl font-semibold tracking-tight">Documents</h1>
                    <p className="mt-2 text-sm text-gray-500">Organize files from /data/documents</p>
                </div>
                <button
                    type="button"
                    onClick={() => void handleScan()}
                    disabled={working}
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                >
                    {working ? "Working..." : "Scan folder"}
                </button>
            </div>
            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}
            <div className="flex flex-wrap gap-3">
                <input
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder="Search documents..."
                    className="min-w-64 flex-1 rounded-md border px-3 py-2 text-sm"
                />
                <select
                    value={folder}
                    onChange={event => setFolder(event.target.value)}
                    className="rounded-md border px-3 py-2 text-sm"
                >
                    {folders.map(item => (
                        <option key={item}>{item}</option>
                    ))}
                </select>
            </div>
            {loading ? (
                <p className="text-sm text-gray-500">Loading documents...</p>
            ) : visibleDocuments.length === 0 ? (
                <div className="rounded-lg border border-dashed p-10 text-center">
                    <p className="font-medium">No documents found</p>
                    <p className="mt-1 text-sm text-gray-500">Put files in /data/documents, then scan the folder.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-lg border">
                    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        <span>Name</span>
                        <span>Folder</span>
                        <span>Size</span>
                        <span>Action</span>
                    </div>
                    {visibleDocuments.map(document => (
                        <div
                            key={document.id}
                            className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b px-4 py-4 last:border-0"
                        >
                            <div className="min-w-0">
                                <p className="truncate font-medium">{document.name}</p>
                                <p className="truncate text-xs text-gray-500">
                                    {fileType(document)} · {document.file_path}
                                </p>
                            </div>
                            <span className="text-sm text-gray-500">{folderName(document.file_path)}</span>
                            <span className="text-sm text-gray-500">{formatSize(document.file_size)}</span>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => void handleMove(document)}
                                    disabled={working}
                                    className="rounded border px-3 py-1.5 text-xs hover:bg-gray-100"
                                >
                                    Move
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void handleDelete(document)}
                                    className="rounded border border-red-200 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
