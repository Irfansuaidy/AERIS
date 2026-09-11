"use client";

import { Note, createNote, deleteNote, listNotes, updateNote } from "@/lib/note";
import Link from "next/link";
import { useEffect, useState } from "react";

import EntityTagsEditor from "@/components/tags/EntityTagsEditor";
import { Tag, addNoteTag, createTag, getNoteTagIds, getTags, removeNoteTag } from "@/lib/tags";

const NOTE_TYPES = ["general", "idea", "meeting", "learning", "reflection", "decision", "reference"];

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [noteTagIds, setNoteTagIds] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [noteType, setNoteType] = useState("general");
    const [editingId, setEditingId] = useState<string | null>(null);
    async function refresh() {
        setLoading(true);
        try {
            const data = await listNotes();
            setNotes(data);
            setError(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load notes");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let active = true;

        async function loadInitialNotes() {
            try {
                const data = await listNotes();

                if (active) {
                    setNotes(data);
                    setError(null);
                }
            } catch (e) {
                if (active) {
                    setError(e instanceof Error ? e.message : "Failed to load notes");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadInitialNotes();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        getTags()
            .then(setAllTags)
            .catch(() => {
                // Tag loading is non-fatal; notes remain usable without the picker.
            });
    }, []);

    useEffect(() => {
        let active = true;

        async function loadNoteTagIds() {
            const missing = notes.filter(note => !(note.id in noteTagIds));
            if (missing.length === 0) return;

            const entries = await Promise.all(
                missing.map(async note => {
                    try {
                        return [note.id, await getNoteTagIds(note.id)] as const;
                    } catch {
                        return [note.id, []] as const;
                    }
                }),
            );

            if (active) {
                setNoteTagIds(current => ({
                    ...current,
                    ...Object.fromEntries(entries),
                }));
            }
        }

        loadNoteTagIds();

        return () => {
            active = false;
        };
    }, [notes, noteTagIds]);

    function resetForm() {
        setTitle("");
        setContent("");
        setNoteType("general");
        setEditingId(null);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        try {
            if (editingId) {
                await updateNote(editingId, { title, content, note_type: noteType });
            } else {
                await createNote({ title, content, note_type: noteType });
            }
            resetForm();
            await refresh();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to save note");
        }
    }

    function startEdit(note: Note) {
        setEditingId(note.id);
        setTitle(note.title);
        setContent(note.content);
        setNoteType(note.note_type);
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this note?")) return;
        try {
            await deleteNote(id);
            if (editingId === id) resetForm();
            await refresh();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to delete note");
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold">Notes</h1>
                <Link
                    href="/vocabulary"
                    className="rounded-md border border-lime-300/30 bg-lime-300/10 px-3 py-2 text-sm text-lime-300 hover:bg-lime-300/20"
                >
                    IELTS Vocabulary
                </Link>
            </div>

            {error && (
                <div className="mb-4 rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="mb-8 space-y-3 rounded-lg border border-gray-200 p-4">
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                    required
                />
                <textarea
                    placeholder="Write your note..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    rows={5}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                    required
                />
                <div className="flex items-center gap-3">
                    <select
                        value={noteType}
                        onChange={e => setNoteType(e.target.value)}
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                        {NOTE_TYPES.map(t => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        className="rounded-md bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-700"
                    >
                        {editingId ? "Update Note" : "Add Note"}
                    </button>
                    {editingId && (
                        <button type="button" onClick={resetForm} className="text-sm text-gray-500 hover:text-gray-700">
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {loading ? (
                <p className="text-sm text-gray-500">Loading notes...</p>
            ) : notes.length === 0 ? (
                <p className="text-sm text-gray-500">No notes yet.</p>
            ) : (
                <div className="space-y-3">
                    {notes.map(note => (
                        <div
                            key={note.id}
                            className="rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-medium truncate">{note.title}</h2>
                                        <span className="text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                                            {note.note_type}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap line-clamp-3">
                                        {note.content}
                                    </p>
                                    <p className="mt-2 text-xs text-gray-400">
                                        Updated {new Date(note.updated_at).toLocaleString()}
                                    </p>
                                    <div className="mt-3">
                                        <EntityTagsEditor
                                            allTags={allTags}
                                            attachedTagIds={noteTagIds[note.id] ?? []}
                                            onAdd={async tagId => {
                                                await addNoteTag(note.id, tagId);
                                                setNoteTagIds(current => ({
                                                    ...current,
                                                    [note.id]: [...(current[note.id] ?? []), tagId],
                                                }));
                                            }}
                                            onRemove={async tagId => {
                                                await removeNoteTag(note.id, tagId);
                                                setNoteTagIds(current => ({
                                                    ...current,
                                                    [note.id]: (current[note.id] ?? []).filter(id => id !== tagId),
                                                }));
                                            }}
                                            onCreateTag={async name => {
                                                const tag = await createTag({ name });
                                                setAllTags(current => [...current, tag]);
                                                return tag;
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={() => startEdit(note)}
                                        className="text-xs text-gray-500 hover:text-gray-800"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(note.id)}
                                        className="text-xs text-red-500 hover:text-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
