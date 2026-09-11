"use client";

import { Tag } from "@/lib/tags";
import { useMemo, useState } from "react";

interface EntityTagsEditorProps {
    allTags: Tag[];
    attachedTagIds: string[];
    onAdd: (tagId: string) => Promise<void>;
    onRemove: (tagId: string) => Promise<void>;
    onCreateTag?: (name: string) => Promise<Tag>;
}

export default function EntityTagsEditor({
    allTags,
    attachedTagIds,
    onAdd,
    onRemove,
    onCreateTag,
}: EntityTagsEditorProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [pending, setPending] = useState<string | null>(null);
    const [error, setError] = useState("");

    const attachedTags = useMemo(
        () => allTags.filter(tag => attachedTagIds.includes(tag.id)),
        [allTags, attachedTagIds],
    );

    const availableTags = useMemo(
        () =>
            allTags
                .filter(tag => !attachedTagIds.includes(tag.id))
                .filter(tag => tag.name.toLowerCase().includes(search.toLowerCase())),
        [allTags, attachedTagIds, search],
    );

    async function handleAdd(tagId: string) {
        if (pending) return;
        setPending(tagId);
        setError("");
        try {
            await onAdd(tagId);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to attach tag");
        } finally {
            setPending(null);
        }
    }

    async function handleRemove(tagId: string) {
        if (pending) return;
        setPending(tagId);
        setError("");
        try {
            await onRemove(tagId);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to remove tag");
        } finally {
            setPending(null);
        }
    }

    async function handleCreate() {
        const name = search.trim();
        if (!name || !onCreateTag || pending) return;

        setPending("create");
        setError("");
        try {
            const tag = await onCreateTag(name);
            await onAdd(tag.id);
            setSearch("");
            setOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create tag");
        } finally {
            setPending(null);
        }
    }

    return (
        <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
                {attachedTags.map(tag => (
                    <span
                        key={tag.id}
                        className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                    >
                        #{tag.name}
                        <button
                            type="button"
                            onClick={() => handleRemove(tag.id)}
                            disabled={pending === tag.id}
                            className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                            aria-label={`Remove tag ${tag.name}`}
                        >
                            ×
                        </button>
                    </span>
                ))}
                <button
                    type="button"
                    onClick={() => setOpen(current => !current)}
                    className="rounded-full border border-dashed px-2 py-1 text-xs text-gray-500 hover:border-gray-400"
                >
                    + Add tag
                </button>
            </div>

            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

            {open && (
                <div className="absolute z-10 mt-2 w-56 rounded border bg-white p-2 shadow-lg">
                    <input
                        type="text"
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                        placeholder="Search tags..."
                        className="mb-2 w-full rounded border p-1 text-sm"
                        autoFocus
                    />

                    <div className="max-h-48 overflow-auto">
                        {availableTags.length === 0 ? (
                            <>
                                <p className="p-1 text-xs text-gray-400">No matching tags.</p>
                                {search.trim() && onCreateTag && (
                                    <button
                                        type="button"
                                        onClick={handleCreate}
                                        disabled={pending === "create"}
                                        className="block w-full rounded px-2 py-1 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                    >
                                        {pending === "create" ? "Creating..." : `Create #${search.trim()}`}
                                    </button>
                                )}
                            </>
                        ) : (
                            availableTags.map(tag => (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => handleAdd(tag.id)}
                                    disabled={pending === tag.id}
                                    className="block w-full rounded px-2 py-1 text-left text-sm hover:bg-gray-100 disabled:opacity-50"
                                >
                                    #{tag.name}
                                </button>
                            ))
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="mt-2 w-full rounded border px-2 py-1 text-xs text-gray-500"
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}
