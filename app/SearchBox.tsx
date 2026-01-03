"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBox({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/?i=${encodeURIComponent(q)}` : "/");
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="e.g. beef"
        style={{
          padding: 10,
          borderRadius: 10,
          border: "1px solid #ccc",
          width: 260,
        }}
      />
      <button
        type="submit"
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid #ccc",
          cursor: "pointer",
        }}
      >
        Search
      </button>
    </form>
  );
}
