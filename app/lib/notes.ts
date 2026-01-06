export type Note = {
  id: string;
  title: string;
  ingredients: string;
  steps: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY = "kitchennotes.v1";

function safeParse(json: string | null): Note[] {
  if (!json) return [];
  try {
    const data = JSON.parse(json);
    if (!Array.isArray(data)) return [];
    return data as Note[];
  } catch {
    return [];
  }
}

export function getNotes(): Note[] {
  if (typeof window === "undefined") return [];
  return safeParse(localStorage.getItem(STORAGE_KEY));
}

export function saveNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function getNote(id: string): Note | undefined {
  return getNotes().find((n) => n.id === id);
}

export function createNote(input: {
  title: string;
  ingredients: string;
  steps: string;
  tags: string[];
}): Note {
  const now = Date.now();
  const note: Note = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    ingredients: input.ingredients.trim(),
    steps: input.steps.trim(),
    tags: input.tags.map((t) => t.trim()).filter(Boolean),
    createdAt: now,
    updatedAt: now,
  };

  const notes = getNotes();
  notes.unshift(note);
  saveNotes(notes);
  return note;
}

export function updateNote(
  id: string,
  patch: Partial<Pick<Note, "title" | "ingredients" | "steps" | "tags">>
): Note | undefined {
  const notes = getNotes();
  const idx = notes.findIndex((n) => n.id === id);
  if (idx === -1) return undefined;

  const current = notes[idx];
  const updated: Note = {
    ...current,
    ...patch,
    title: (patch.title ?? current.title).trim(),
    ingredients: (patch.ingredients ?? current.ingredients).trim(),
    steps: (patch.steps ?? current.steps).trim(),
    tags: (patch.tags ?? current.tags).map((t) => t.trim()).filter(Boolean),
    updatedAt: Date.now(),
  };

  notes[idx] = updated;
  saveNotes(notes);
  return updated;
}

export function deleteNote(id: string): boolean {
  const notes = getNotes();
  const next = notes.filter((n) => n.id !== id);
  if (next.length === notes.length) return false;
  saveNotes(next);
  return true;
}
