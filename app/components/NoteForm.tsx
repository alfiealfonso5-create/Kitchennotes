"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createNote, updateNote, type Note } from "../lib/notes";
import { Save, X } from "lucide-react";

type Props = {
  mode: "create" | "edit";
  note?: Note;
};

export default function NoteForm({ mode, note }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState<string>(note?.title ?? "");
  const [ingredients, setIngredients] = useState<string>(note?.ingredients ?? "");
  const [steps, setSteps] = useState<string>(note?.steps ?? "");
  const [tagsText, setTagsText] = useState<string>((note?.tags ?? []).join(", "));

  const tags = useMemo<string[]>(() => {
    return tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }, [tagsText]);

  const canSave = title.trim().length > 0;

  function onCancel() {
    if (mode === "create") router.push("/");
    else if (note) router.push(`/note/${note.id}`);
    else router.push("/");
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSave) return;

    if (mode === "create") {
      const created = createNote({ title, ingredients, steps, tags });
      router.push(`/note/${created.id}`);
      router.refresh();
      return;
    }

    if (mode === "edit" && note) {
      updateNote(note.id, { title, ingredients, steps, tags });
      router.push(`/note/${note.id}`);
      router.refresh();
    }
  }

  const inputClass =
    "w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 " +
    "border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-500 focus:ring-zinc-900 " +
    "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-400 dark:focus:ring-zinc-200";

  const textareaClass = inputClass;

  const labelClass = "text-sm font-semibold text-zinc-900 dark:text-zinc-100";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className={labelClass}>Title *</label>
        <input
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Creamy garlic pasta"
        />
      </div>

      <div className="space-y-2">
        <label className={labelClass}>Ingredients</label>
        <textarea
          className={textareaClass + " min-h-[120px]"}
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Write ingredients here…"
        />
      </div>

      <div className="space-y-2">
        <label className={labelClass}>Steps</label>
        <textarea
          className={textareaClass + " min-h-[160px]"}
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          placeholder="Write cooking steps here…"
        />
      </div>

      <div className="space-y-2">
        <label className={labelClass}>Tags</label>
        <input
          className={inputClass}
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="comma separated: quick, pasta, dinner"
        />

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          disabled={!canSave}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Save size={16} />
          Save
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          <X size={16} />
          Cancel
        </button>
      </div>
    </form>
  );
}
