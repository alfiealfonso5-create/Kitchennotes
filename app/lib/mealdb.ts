export type MealSummary = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
};

export type FullMeal = MealSummary & {
  strInstructions: string;
  // TheMealDB returns up to 20 ingredient/measure pairs:
  [key: `strIngredient${number}`]: string | undefined;
  [key: `strMeasure${number}`]: string | undefined;
};

type SearchResponse = { meals: MealSummary[] | null };
type LookupResponse = { meals: FullMeal[] | null };

export async function searchMeals(ingredient: string): Promise<MealSummary[]> {
  const q = ingredient.trim();
  if (!q) return [];

  const url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(q)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch meals");

  const data: SearchResponse = await res.json();
  return data.meals ?? [];
}

export async function getMealById(id: string) {
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(id)}`,
    { cache: "no-store" }
  );

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`lookup failed: ${res.status} ${res.statusText}\n${text}`);
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Response was not JSON:\n${text.slice(0, 200)}`);
  }

  return data?.meals?.[0] ?? null;
}

