import { api } from "./api";
import { getToken } from "./auth";

export type VocabularyStatus = "new" | "learning" | "mastered";

export interface VocabularyEntry {
    id: string;
    word: string;
    meaning: string;
    partOfSpeech: string;
    example: string;
    translation: string;
    synonyms: string;
    topic: string;
    status: VocabularyStatus;
    createdAt: string;
    updatedAt: string;
}

export type VocabularyInput = Omit<VocabularyEntry, "id" | "createdAt" | "updatedAt">;

interface VocabularyResponse {
    id: string;
    user_id: string;
    word: string;
    meaning: string;
    part_of_speech: string;
    example: string;
    translation: string;
    synonyms: string;
    topic: string;
    status: VocabularyStatus;
    created_at: string;
    updated_at: string;
}

function token() {
    return getToken() ?? undefined;
}

function fromResponse(entry: VocabularyResponse): VocabularyEntry {
    return {
        id: entry.id,
        word: entry.word,
        meaning: entry.meaning,
        partOfSpeech: entry.part_of_speech,
        example: entry.example,
        translation: entry.translation,
        synonyms: entry.synonyms,
        topic: entry.topic,
        status: entry.status,
        createdAt: entry.created_at,
        updatedAt: entry.updated_at,
    };
}

function toPayload(input: VocabularyInput) {
    return {
        word: input.word,
        meaning: input.meaning,
        part_of_speech: input.partOfSpeech,
        example: input.example,
        translation: input.translation,
        synonyms: input.synonyms,
        topic: input.topic,
        status: input.status,
    };
}

export async function listVocabulary(): Promise<VocabularyEntry[]> {
    const entries = await api<VocabularyResponse[]>("/vocabulary", { token: token() });
    return entries.map(fromResponse);
}

export async function createVocabulary(input: VocabularyInput): Promise<VocabularyEntry> {
    const entry = await api<VocabularyResponse>("/vocabulary", {
        method: "POST",
        token: token(),
        body: JSON.stringify(toPayload(input)),
    });
    return fromResponse(entry);
}

export async function updateVocabulary(id: string, input: VocabularyInput): Promise<VocabularyEntry> {
    const entry = await api<VocabularyResponse>(`/vocabulary/${id}`, {
        method: "PATCH",
        token: token(),
        body: JSON.stringify(toPayload(input)),
    });
    return fromResponse(entry);
}

export function deleteVocabulary(id: string): Promise<void> {
    return api<void>(`/vocabulary/${id}`, {
        method: "DELETE",
        token: token(),
    });
}
