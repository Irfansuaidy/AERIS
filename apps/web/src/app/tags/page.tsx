"use client";

import { ApiError } from "@/lib/api";
import { Tag, createTag, deleteTag, getTags, updateTag } from "@/lib/tags";
import { useEffect, useState } from "react";

export default function TagsPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState("");

    async function refresh() {
        setLoading(true);
        setError("");
        try {
            setTags(await getTags());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load tags");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let active = true;

        async function loadInitial() {
            try {
                const result = await getTags();
                if (active) setTags(result);
            } catch (err) {
                if (active) {
                    setError(err instanceof Error ? err.message : "Failed to load tags");
                }
            } finally {
                if (active) setLoading(false);
            }
        }

        loadInitial();
        return () => {
            active = false;
        };
    }, []);

    async function handleCreate(event: React.FormEvent) {
        event.preventDefault();
        const trimmed = name.trim();
        if (!trimmed || saving) return;

        setSaving(true);
        setError("");
        try {
            await createTag({ name: trimmed });
            setName("");
            await refresh();
        } catch (err) {
            if (err instanceof ApiError && err.status === 409) {
                setError("A tag with this name already exists.");
            } else {
                setError(err instanceof Error ? err.message : "Failed to create tag");
            }
        } finally {
            setSaving(false);
        }
    }

    function startEdit(tag: Tag) {
        setEditingId(tag.id);
        setEditName(tag.name);
    }

    function cancelEdit() {
        setEditingId(null);
        setEditName("");
    }

    async function handleRename(tagId: string) {
        const trimmed = editName.trim();
        if (!trimmed) return;

        setSaving(true);
        setError("");
        try {
            await updateTag(tagId, { name: trimmed });
            cancelEdit();
            await refresh();
        } catch (err) {
            if (err instanceof ApiError && err.status === 409) {
                setError("A tag with this name already exists.");
            } else {
                setError(err instanceof Error ? err.message : "Failed to rename tag");
            }
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(tag: Tag) {
        if (!window.confirm(`Delete tag "${tag.name}"?`)) return;

        setDeletingId(tag.id);
        setError("");
        try {
            await deleteTag(tag.id);
            await refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete tag");
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold mb-6">Tags</h1>

            {error && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleCreate} className="mb-6 flex gap-2">
                <input
                    type="text"
                    value={name}
                    onChange={event => setName(event.target.value)}
                    placeholder="New tag name"
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
                <button
                    type="submit"
                    disabled={saving}
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Create tag"}
                </button>
            </form>

            {loading ? (
                <p className="text-sm text-gray-500">Loading tags...</p>
            ) : tags.length === 0 ? (
                <p className="text-sm text-gray-500">No tags yet.</p>
            ) : (
                <ul className="space-y-2">
                    {tags.map(tag => (
                        <li
                            key={tag.id}
                            className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2"
                        >
                            {editingId === tag.id ? (
                                <div className="flex flex-1 items-center gap-2">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={event => setEditName(event.target.value)}
                                        className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRename(tag.id)}
                                        disabled={saving}
                                        className="text-xs text-gray-700 hover:text-black disabled:opacity-50"
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="text-xs text-gray-500 hover:text-gray-700"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span className="text-sm font-medium">#{tag.name}</span>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => startEdit(tag)}
                                            className="text-xs text-gray-500 hover:text-gray-800"
                                        >
                                            Rename
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(tag)}
                                            disabled={deletingId === tag.id}
                                            className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                                        >
                                            {deletingId === tag.id ? "Deleting..." : "Delete"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
