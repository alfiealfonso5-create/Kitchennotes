import Link from "next/link";
import SearchBox from "./SearchBox";
import { searchMeals } from "./lib/mealdb";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ i?: string }>;
}) {
  const sp = await searchParams;          // ✅ unwrap promise
  const ingredient = sp.i ?? "";
  const meals = ingredient ? await searchMeals(ingredient) : [];

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Meal Finder</h1>

      <SearchBox initialValue={ingredient} />

      {!ingredient ? (
        <p>Type an ingredient and hit Search.</p>
      ) : meals.length === 0 ? (
        <p>No meals found for “{ingredient}”.</p>
      ) : (
        <>
          <p style={{ marginBottom: 12 }}>
            Found {meals.length} meal(s) for “{ingredient}”
          </p>

          <ul
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 14,
              padding: 0,
              listStyle: "none",
            }}
          >
            {meals.map((m) => {
  return m.idMeal ? (
    <li
      key={m.idMeal}
      style={{
        border: "1px solid #eee",
        borderRadius: 14,
        padding: 12,
        listStyle: "none",
      }}
    >
      <Link
        href={`/meal/${m.idMeal}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        {m.strMealThumb && (
          <img
            src={m.strMealThumb}
            alt={m.strMeal}
            style={{
              width: "100%",
              borderRadius: 12,
              marginBottom: 10,
            }}
          />
        )}

        <div style={{ fontWeight: 600 }}>{m.strMeal}</div>
      </Link>
    </li>
  ) : null;
})}


          </ul>
        </>
      )}
    </main>
  );
}
