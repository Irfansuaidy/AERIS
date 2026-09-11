"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Check, Edit3, Flame, Plus, Search, Trash2, X } from "lucide-react";
import {
  createVocabulary,
  deleteVocabulary,
  listVocabulary,
  updateVocabulary,
  type VocabularyEntry,
  type VocabularyInput,
  type VocabularyStatus,
} from "@/lib/ieltsVocabulary";

const emptyForm: VocabularyInput = {
  word: "",
  meaning: "",
  partOfSpeech: "noun",
  example: "",
  translation: "",
  synonyms: "",
  topic: "General",
  status: "new",
};

const statusLabels: Record<VocabularyStatus, string> = {
  new: "New",
  learning: "Learning",
  mastered: "Mastered",
};

function statusTone(status: VocabularyStatus) {
  if (status === "mastered") return "border-lime-300/30 bg-lime-300/10 text-lime-300";
  if (status === "learning") return "border-amber-300/30 bg-amber-300/10 text-amber-200";
  return "border-white/10 bg-white/[0.04] text-zinc-400";
}

export default function IeltsVocabularyPage() {
  const [entries, setEntries] = useState<VocabularyEntry[]>([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | VocabularyStatus>("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VocabularyInput>(emptyForm);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    let active = true;

    listVocabulary()
      .then((data) => {
        if (active) setEntries(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Unable to load vocabulary");
      })
    return () => {
      active = false;
    };
  }, []);

  const topics = useMemo(() => ["all", ...Array.from(new Set(entries.map((entry) => entry.topic).filter(Boolean))).sort()], [entries]);
  const filteredEntries = useMemo(() => entries.filter((entry) => {
    const haystack = `${entry.word} ${entry.meaning} ${entry.example} ${entry.translation} ${entry.synonyms}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (statusFilter === "all" || entry.status === statusFilter) && (topicFilter === "all" || entry.topic === topicFilter);
  }), [entries, query, statusFilter, topicFilter]);
  const practiceEntry = filteredEntries[practiceIndex % Math.max(filteredEntries.length, 1)];
  const mastered = entries.filter((entry) => entry.status === "mastered").length;
  const learning = entries.filter((entry) => entry.status === "learning").length;

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.word.trim() || !form.meaning.trim() || !form.example.trim()) return;

    const input = { ...form, word: form.word.trim(), meaning: form.meaning.trim(), example: form.example.trim() };
    try {
      if (editingId) {
        await updateVocabulary(editingId, input);
      } else {
        await createVocabulary(input);
      }
      setEntries(await listVocabulary());
      resetForm();
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save vocabulary");
    }
  }

  function editEntry(entry: VocabularyEntry) {
    setEditingId(entry.id);
    setForm({
      word: entry.word,
      meaning: entry.meaning,
      partOfSpeech: entry.partOfSpeech,
      example: entry.example,
      translation: entry.translation,
      synonyms: entry.synonyms,
      topic: entry.topic,
      status: entry.status,
    });
    setShowForm(true);
  }

  async function removeEntry(entry: VocabularyEntry) {
    if (!window.confirm(`Delete “${entry.word}” from your vocabulary?`)) return;
    try {
      await deleteVocabulary(entry.id);
      setEntries(await listVocabulary());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete vocabulary");
    }
  }

  async function changeStatus(entry: VocabularyEntry, status: VocabularyStatus) {
    try {
      await updateVocabulary(entry.id, { ...entry, status });
      setEntries(await listVocabulary());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update vocabulary status");
    }
  }

  function nextPractice() {
    setRevealed(false);
    setPracticeIndex((current) => current + 1);
  }

  return (
    <div className="space-y-8 pb-12">
      {error && <p className="border border-rose-300/20 bg-rose-300/5 p-3 text-sm text-rose-300">{error}</p>}
      <div className="flex flex-col justify-between gap-5 border-b border-white/8 pb-7 lg:flex-row lg:items-end">
        <div>
          <p className="flex items-center gap-2 text-xs text-zinc-600"><span className="h-1.5 w-1.5 rounded-full bg-lime-300" /> IELTS / Vocabulary workspace</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Words worth remembering</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">Capture the word, understand its meaning, and anchor it in a sentence you can actually use.</p>
        </div>
        <button type="button" onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }} className="flex items-center justify-center gap-2 bg-lime-300 px-4 py-2.5 text-sm font-semibold text-[#10150b] hover:bg-lime-200"><Plus size={16} /> Add vocabulary</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border border-white/8 bg-[#121718] p-4"><p className="text-xs text-zinc-600">Total words</p><p className="mt-2 font-mono text-2xl text-white">{entries.length.toString().padStart(2, "0")}</p></div>
        <div className="border border-white/8 bg-[#121718] p-4"><p className="text-xs text-zinc-600">Learning now</p><p className="mt-2 flex items-center gap-2 font-mono text-2xl text-amber-200"><Flame size={18} />{learning.toString().padStart(2, "0")}</p></div>
        <div className="border border-white/8 bg-[#121718] p-4"><p className="text-xs text-zinc-600">Mastered</p><p className="mt-2 flex items-center gap-2 font-mono text-2xl text-lime-300"><Check size={18} />{mastered.toString().padStart(2, "0")}</p></div>
      </div>

      {practiceEntry ? <section className="border border-lime-300/20 bg-[#171d18] p-5 sm:p-6"><div className="flex items-center justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-lime-300">Quick recall</p><h2 className="mt-2 text-lg font-semibold text-white">Practice one word</h2></div><BookOpen size={20} className="text-lime-300" /></div><div className="mt-5 rounded-lg border border-white/8 bg-[#0e1213] p-5"><p className="text-xs uppercase tracking-[0.16em] text-zinc-600">{practiceEntry.topic}</p><p className="mt-3 text-2xl font-semibold text-white">{practiceEntry.word}</p>{revealed ? <div className="mt-4 space-y-2 text-sm"><p className="text-zinc-300">{practiceEntry.meaning}</p><p className="italic leading-6 text-zinc-500">“{practiceEntry.example}”</p></div> : <p className="mt-4 text-sm text-zinc-600">Recall the meaning and a natural sentence before revealing it.</p>}</div><div className="mt-4 flex gap-2"><button type="button" onClick={() => setRevealed(true)} className="border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5">Reveal meaning</button><button type="button" onClick={nextPractice} className="bg-lime-300 px-3 py-2 text-sm font-semibold text-[#10150b] hover:bg-lime-200">Next word</button></div></section> : <div className="border border-dashed border-white/10 bg-[#121718] p-8 text-center"><BookOpen className="mx-auto text-zinc-600" size={24} /><p className="mt-3 text-sm text-zinc-400">Your IELTS vocabulary bank is empty.</p><p className="mt-1 text-xs text-zinc-600">Add your first word to start building it.</p></div>}

      <div className="flex flex-col justify-between gap-3 border-b border-white/8 pb-3 sm:flex-row sm:items-center"><div className="flex flex-wrap gap-2">{(["all", "new", "learning", "mastered"] as const).map((status) => <button key={status} type="button" onClick={() => setStatusFilter(status)} className={`rounded-full border px-3 py-1.5 text-xs capitalize ${statusFilter === status ? "border-lime-300/40 bg-lime-300/10 text-lime-300" : "border-white/10 text-zinc-500 hover:text-zinc-200"}`}>{status === "all" ? "All words" : statusLabels[status]}</button>)}</div><div className="flex gap-2"><select value={topicFilter} onChange={(event) => setTopicFilter(event.target.value)} className="border border-white/10 bg-[#121718] px-3 py-2 text-xs text-zinc-300"><option value="all">All topics</option>{topics.filter((topic) => topic !== "all").map((topic) => <option key={topic} value={topic}>{topic}</option>)}</select><div className="relative"><Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search vocabulary" className="w-full border border-white/10 bg-[#121718] py-2 pl-8 pr-3 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-lime-300/50 sm:w-56" /></div></div></div>

      <div className="grid gap-4 md:grid-cols-2">{filteredEntries.map((entry) => <article key={entry.id} className="border border-white/8 bg-[#121718] p-5 transition hover:border-white/16"><div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold text-white">{entry.word}</h2><span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${statusTone(entry.status)}`}>{statusLabels[entry.status]}</span></div><p className="mt-1 text-xs text-zinc-600">{entry.partOfSpeech} · {entry.topic}</p></div><div className="flex gap-1"><button type="button" onClick={() => editEntry(entry)} className="rounded p-2 text-zinc-600 hover:bg-white/5 hover:text-white" aria-label={`Edit ${entry.word}`}><Edit3 size={15} /></button><button type="button" onClick={() => removeEntry(entry)} className="rounded p-2 text-zinc-600 hover:bg-white/5 hover:text-rose-300" aria-label={`Delete ${entry.word}`}><Trash2 size={15} /></button></div></div><p className="mt-5 text-sm text-zinc-300">{entry.meaning}</p>{entry.translation && <p className="mt-2 text-xs text-zinc-500">Bahasa Indonesia: {entry.translation}</p>}<div className="mt-4 border-l border-lime-300/40 pl-3"><p className="text-sm italic leading-6 text-zinc-500">“{entry.example}”</p></div>{entry.synonyms && <p className="mt-4 text-xs text-zinc-600">Synonyms: <span className="text-zinc-400">{entry.synonyms}</span></p>}<div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-3"><span className="text-[11px] text-zinc-600">Review status</span><select value={entry.status} onChange={(event) => changeStatus(entry, event.target.value as VocabularyStatus)} className="border border-white/10 bg-[#0e1213] px-2 py-1.5 text-xs text-zinc-300"><option value="new">New</option><option value="learning">Learning</option><option value="mastered">Mastered</option></select></div></article>)}</div>
      {filteredEntries.length === 0 && entries.length > 0 && <p className="border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">No vocabulary matches these filters.</p>}

      {showForm && <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"><form onSubmit={submitForm} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto border border-white/12 bg-[#151a1b] p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-lime-300">{editingId ? "Edit vocabulary" : "New vocabulary"}</p><h2 className="mt-2 text-xl font-semibold text-white">Make the word usable</h2></div><button type="button" onClick={resetForm} className="text-zinc-500 hover:text-white" aria-label="Close form"><X size={18} /></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-sm text-zinc-400">Word<input required value={form.word} onChange={(event) => setForm({ ...form, word: event.target.value })} placeholder="e.g. compelling" className="mt-2 w-full border border-white/10 bg-[#0e1213] px-3 py-2.5 text-sm text-white outline-none focus:border-lime-300/60" /></label><label className="text-sm text-zinc-400">Part of speech<select value={form.partOfSpeech} onChange={(event) => setForm({ ...form, partOfSpeech: event.target.value })} className="mt-2 w-full border border-white/10 bg-[#0e1213] px-3 py-2.5 text-sm text-white"><option>noun</option><option>verb</option><option>adjective</option><option>adverb</option><option>phrase</option></select></label></div><label className="mt-4 block text-sm text-zinc-400">Meaning<textarea required value={form.meaning} onChange={(event) => setForm({ ...form, meaning: event.target.value })} placeholder="Explain the meaning in your own words" className="mt-2 min-h-20 w-full resize-y border border-white/10 bg-[#0e1213] px-3 py-2.5 text-sm text-white outline-none focus:border-lime-300/60" /></label><label className="mt-4 block text-sm text-zinc-400">Your example sentence<textarea required value={form.example} onChange={(event) => setForm({ ...form, example: event.target.value })} placeholder="Write a sentence you could use in IELTS Speaking or Writing" className="mt-2 min-h-24 w-full resize-y border border-white/10 bg-[#0e1213] px-3 py-2.5 text-sm text-white outline-none focus:border-lime-300/60" /></label><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm text-zinc-400">Indonesian translation<input value={form.translation} onChange={(event) => setForm({ ...form, translation: event.target.value })} className="mt-2 w-full border border-white/10 bg-[#0e1213] px-3 py-2.5 text-sm text-white" /></label><label className="text-sm text-zinc-400">Topic<input value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })} placeholder="Education, Environment..." className="mt-2 w-full border border-white/10 bg-[#0e1213] px-3 py-2.5 text-sm text-white" /></label></div><label className="mt-4 block text-sm text-zinc-400">Synonyms<input value={form.synonyms} onChange={(event) => setForm({ ...form, synonyms: event.target.value })} placeholder="powerful, persuasive" className="mt-2 w-full border border-white/10 bg-[#0e1213] px-3 py-2.5 text-sm text-white" /></label><div className="mt-4"><p className="text-sm text-zinc-400">Learning status</p><div className="mt-2 flex flex-wrap gap-2">{(["new", "learning", "mastered"] as const).map((status) => <button key={status} type="button" onClick={() => setForm({ ...form, status })} className={`rounded-full border px-3 py-1.5 text-xs ${form.status === status ? statusTone(status) : "border-white/10 text-zinc-500"}`}>{statusLabels[status]}</button>)}</div></div><div className="mt-7 flex justify-end gap-3"><button type="button" onClick={resetForm} className="border border-white/10 px-4 py-2.5 text-sm text-zinc-400 hover:text-white">Cancel</button><button type="submit" className="bg-lime-300 px-4 py-2.5 text-sm font-semibold text-[#10150b] hover:bg-lime-200">{editingId ? "Save changes" : "Save word"}</button></div></form></div>}
    </div>
  );
}
