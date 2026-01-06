"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteNote, getNote, type Note } from "../../../lib/notes";
import NoteForm from "../../../components/NoteForm";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

function fmtDate(ms: number) {
  return new Date(ms).toLocaleString();
}

export default function NoteDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [mode, setMode] = useState<"view" | "edit">("view");

  useEffect(() => {
    const n = getNote(params.id);
    setNote(n ?? null);
  }, [params.id]);

  if (!note) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-2xl border border-zinc-300 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Note not found
            </div>
            <Link
              href="/notes"
              className="mt-3 inline-flex text-sm text-zinc-700 underline dark:text-zinc-300"
            >
              Go back
            </Link>
          </div>
        </div>
      </main>
    );
  }

function onDelete() {
  if (!note) return;

  const ok = confirm("Delete this note? This cannot be undone.");
  if (!ok) return;

  deleteNote(note.id);
  router.push("/notes");
  router.refresh();
}


  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <ArrowLeft size={16} />
            Back
          </Link>

          <div className="flex items-center gap-2">
            {mode === "view" ? (
              <button
                onClick={() => setMode("edit")}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800
                           dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                <Pencil size={16} />
                Edit
              </button>
            ) : (
              <button
                onClick={() => setMode("view")}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900
                           dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <Pencil size={16} />
                View
              </button>
            )}

            <button
              onClick={onDelete}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-red-600
                         dark:border-zinc-800 dark:bg-zinc-900"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-300 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {mode === "edit" ? (
            <>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Edit note
              </h1>
              <div className="mt-6">
                <NoteForm mode="edit" note={note} />
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {note.title}
              </h1>
              <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                Created: {fmtDate(note.createdAt)} • Updated: {fmtDate(note.updatedAt)}
              </div>

              {note.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-900
                                 dark:bg-zinc-950/40 dark:text-zinc-200 dark:border dark:border-zinc-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-6 grid gap-6">
                <section>
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Ingredients
                  </h2>
                  <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-zinc-50 p-4 text-sm text-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-200">
                    {note.ingredients || "—"}
                  </pre>
                </section>

                <section>
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Steps
                  </h2>
                  <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-zinc-50 p-4 text-sm text-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-200">
                    {note.steps || "—"}
                  </pre>
                </section>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
