"use client";

import NoteForm from "../../../components/NoteForm";


export default function NewNotePage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-zinc-300 bg-white p-6 shadow-sm 
                          transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            New note
          </h1>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
            Save a recipe idea, ingredients, or steps.
          </p>

          <div className="mt-6">
            <NoteForm mode="create" />
          </div>
        </div>
      </div>
    </main>
  );
}
