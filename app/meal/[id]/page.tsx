import type { Metadata } from "next";
import Image from "next/image";
import ServingsClient from "./ServingsClient";
import styles from "./RecipePaper.module.css";

type AnyMeal = Record<string, any>;

function isRealMeal(m: any): m is AnyMeal {
  return (
    m &&
    typeof m === "object" &&
    typeof m.strMeal === "string" &&
    typeof m.strInstructions === "string"
  );
}

async function fetchJsonText(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();

  let data: any = null;
  let jsonOk = true;

  try {
    data = JSON.parse(text);
  } catch {
    jsonOk = false;
  }

  return { resOk: res.ok, status: res.status, text, jsonOk, data };
}

async function getMealByIdStrict(id: string) {
  const httpsUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(
    id
  )}`;
  const httpUrl = `http://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(
    id
  )}`;

  const https = await fetchJsonText(httpsUrl);
  const http = !https.data?.meals ? await fetchJsonText(httpUrl) : null;

  const candidates = [
    { label: "https", r: https },
    ...(http ? [{ label: "http", r: http }] : []),
  ];

  for (const c of candidates) {
    const first = c.r.data?.meals?.[0];
    if (isRealMeal(first)) return { meal: first, debug: null };
  }

  return {
    meal: null,
    debug: {
      id,
      https: {
        resOk: https.resOk,
        status: https.status,
        jsonOk: https.jsonOk,
        sample: https.text.slice(0, 200),
        meals0Type: typeof https.data?.meals?.[0],
        meals0Value: https.data?.meals?.[0],
      },
      http: http
        ? {
            resOk: http.resOk,
            status: http.status,
            jsonOk: http.jsonOk,
            sample: http.text.slice(0, 200),
            meals0Type: typeof http.data?.meals?.[0],
            meals0Value: http.data?.meals?.[0],
          }
        : null,
      hint:
        "TheMealDB should return an object with strMeal/strInstructions. Your network is likely altering the response.",
    },
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const { meal } = await getMealByIdStrict(id);

  const siteUrl = "https://kitchennotes.org";
  const canonicalUrl = `${siteUrl}/meal/${id}`;

  if (!meal) {
    return {
      title: "Recipe not found — KitchenNotes",
      description: "This recipe could not be found.",
      alternates: { canonical: canonicalUrl },
      robots: { index: false, follow: false },
    };
  }

  const title = `${meal.strMeal} — KitchenNotes`;

  const raw =
    typeof meal.strInstructions === "string"
      ? meal.strInstructions
      : "Step-by-step recipe with ingredients and shopping list.";

  const cleaned = raw
    .replace(/\r\n/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\d+\s*[\.\)]\s*/g, "")
    .trim();

  const description =
    cleaned.length > 0
      ? cleaned.slice(0, 155)
      : "Step-by-step recipe with ingredients and shopping list.";

  const imageUrl = meal.strMealThumb || undefined;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonicalUrl,
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function MealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await params;

  if (!p?.id) {
    return <main style={{ padding: 24 }}>Missing meal id</main>;
  }

  const { meal, debug } = await getMealByIdStrict(p.id);

  if (!meal) {
    return (
      <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, marginBottom: 12 }}>Recipe details error</h1>
        <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(debug, null, 2)}</pre>
      </main>
    );
  }

  // Ingredients
  const ingredients: { ingredient: string; measure: string }[] = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const meas = meal[`strMeasure${i}`];

    const ingredient = typeof ing === "string" ? ing.trim() : "";
    const measure = typeof meas === "string" ? meas.trim() : "";

    if (ingredient) ingredients.push({ ingredient, measure });
  }

  // Steps
  const raw = typeof meal.strInstructions === "string" ? meal.strInstructions : "";
  const steps: string[] = raw
    .replace(/\r\n/g, "\n")
    .split(/\n+|\s+(?=\d+\.)/g)
    .map((s) => s.replace(/^\d+\.\s*/, "").trim())
    .filter((s) => s.length > 0);

  // JSON-LD
  const siteUrl = "https://kitchennotes.org";
  const canonicalUrl = `${siteUrl}/meal/${p.id}`;

  const recipeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: meal.strMeal,
    image: meal.strMealThumb ? [meal.strMealThumb] : undefined,
    url: canonicalUrl,
    description:
      typeof meal.strInstructions === "string"
        ? meal.strInstructions.replace(/\s+/g, " ").slice(0, 155)
        : "Step-by-step recipe with ingredients and shopping list.",
    recipeIngredient: ingredients.map((x) =>
      x.measure ? `${x.measure} ${x.ingredient}` : x.ingredient
    ),
    recipeInstructions: steps.map((text: string, i: number) => ({
      "@type": "HowToStep",
      position: i + 1,
      text,
    })),
  };

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <section className={styles.paper}>
        <div className={styles.inner}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeJsonLd) }}
          />

          <h1 className={styles.title}>{meal.strMeal}</h1>

          {meal.strMealThumb && (
            <Image
              src={meal.strMealThumb}
              alt={meal.strMeal}
              width={860}
              height={520}
              sizes="(max-width: 900px) 100vw, 860px"
              style={{ width: "100%", height: "auto", borderRadius: 14, marginBottom: 16 }}
            />
          )}

          <h2 className={styles.sectionTitle}>Ingredients</h2>
          {ingredients.length === 0 ? (
            <p>No ingredients found.</p>
          ) : (
            <ServingsClient ingredients={ingredients} />
          )}

          <h2 className={styles.sectionTitle}>Instructions</h2>
          <ol className={styles.instructionsList}>
            {steps.map((step, idx) => (
              <li key={idx}>{step.endsWith(".") ? step : `${step}.`}</li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
