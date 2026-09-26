import { createNote, type NoteCreateInput } from "@/lib/note";
import { getToken } from "@/lib/auth";

export const CATEGORIES = ["Conceptual", "Misread", "Calculation", "Time Pressure"] as const;
export const TOPICS = [
  "Algebra - Linear Equations",
  "Algebra - Systems",
  "Algebra - Inequalities",
  "Algebra - Functions",
  "Algebra - Quadratics",
  "Geometry - Lines & Angles",
  "Geometry - Triangles",
  "Geometry - Circles",
  "Geometry - Coordinate",
  "Data Analysis - Ratios",
  "Data Analysis - Percentages",
  "Data Analysis - Probability",
  "Data Analysis - Tables",
  "Reading - Main Idea",
  "Reading - Detail",
  "Reading - Inference",
  "Reading - Text Structure",
  "Writing - Grammar",
  "Writing - Punctuation",
  "Writing - Sentence Structure",
  "Desmos - Graphing",
  "Desmos - Tables",
  "Desmos - Calculator",
] as const;

export type MistakeCategory = typeof CATEGORIES[number];
export type MistakeTopic = typeof TOPICS[number];

export interface MistakeLogInput {
  questionRef: string;
  topic: MistakeTopic;
  category: MistakeCategory;
  misconception: string;
  correctStrategy: string;
}

export async function saveMistakeLog(data: MistakeLogInput, satProjectId: string) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const input: NoteCreateInput = {
    title: `Mistake - ${data.questionRef} - ${data.topic}`,
    content: JSON.stringify({
      category: data.category,
      misconception: data.misconception,
      correctStrategy: data.correctStrategy,
    }),
    note_type: "mistake",
    project_id: satProjectId,
  };

  return createNote(input);
}
