"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getNotes, type Note } from "../lib/notes";
import { Plus, Search } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

function fmtDate(ms: number) {
  return new Date(ms).toLocaleString();
}

export default function NotesHomePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    setNotes(getNotes());
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return notes;

    return notes.filter((n) => {
      const hay = [n.title, n.ingredients, n.steps, n.tags.join(" ")]
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }, [notes, q]);

  return (
    <main className="min-h-screen bg-zinc-50 transition-colors duration-300 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Kitchennotes
            </h1>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
              Quick recipe notes. Searchable. Yours.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/notes/note/new"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800
                         dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              <Plus size={16} />
              New note
            </Link>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-4 py-3 transition-colors duration-300
                        dark:border-zinc-800 dark:bg-zinc-900">
          <Search size={18} className="text-zinc-600 dark:text-zinc-300" />
          <input
            className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-500 outline-none
                       dark:text-zinc-100 dark:placeholder:text-zinc-500"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, ingredients, steps, tags…"
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {filtered.map((n) => (
            <Link
              key={n.id}
              href={`/notes/note/${n.id}`}
              className="rounded-2xl border border-zinc-300 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md transition-colors duration-300
                         dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div>
                <div className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {n.title}
                </div>
                <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Updated: {fmtDate(n.updatedAt)}
                </div>
              </div>

              {n.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {n.tags.slice(0, 4).map((tag) => (
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

              <div className="mt-3 max-h-[4.5rem] overflow-hidden text-sm text-zinc-700 dark:text-zinc-300">
                {n.ingredients || n.steps || "No content yet — open to add details."}
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center transition-colors duration-300
                          dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              No notes found
            </div>
            <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
              Create your first note or try a different search.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
