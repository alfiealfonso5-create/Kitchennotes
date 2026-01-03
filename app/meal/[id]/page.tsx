import ServingsClient from "./ServingsClient";



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

  // No valid meal object found — return debug info
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
        <p>
          I didn&apos;t receive a valid meal object from TheMealDB (it should have
          <code> strMeal</code> and <code>strInstructions</code>).
        </p>

        <pre
          style={{
            whiteSpace: "pre-wrap",
            padding: 12,
            borderRadius: 12,
            border: "1px solid #eee",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(debug, null, 2)}
        </pre>

        <p style={{ marginTop: 12 }}>
          Quick test: open this in your browser and see if it shows JSON:
          <br />
          <code>
            https://www.themealdb.com/api/json/v1/1/lookup.php?i={p.id}

          </code>
        </p>
      </main>
    );
  }

  const ingredients: { ingredient: string; measure: string }[] = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const meas = meal[`strMeasure${i}`];

    const ingredient = typeof ing === "string" ? ing.trim() : "";
    const measure = typeof meas === "string" ? meas.trim() : "";

    if (ingredient) ingredients.push({ ingredient, measure });
  }
const raw = typeof meal.strInstructions === "string" ? meal.strInstructions : "";

const steps: string[] = raw
  .replace(/\r\n/g, "\n")
  .split(/\n+|\s+(?=\d+\.)/g)
  .map((s) => s.replace(/^\d+\.\s*/, "").trim())
  .filter((s) => s.length > 0);



  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, marginBottom: 12 }}>{meal.strMeal}</h1>

      {meal.strMealThumb && (
        <img
          src={meal.strMealThumb}
          alt={meal.strMeal}
          style={{ width: 360, borderRadius: 14, marginBottom: 16 }}
        />
      )}

      <h2>Ingredients</h2>

{ingredients.length === 0 ? (
  <p>No ingredients found.</p>
) : (
  <ServingsClient ingredients={ingredients} />
)}


      <h2 style={{ marginTop: 18 }}>Instructions</h2>

<ol style={{ paddingLeft: 20, listStyleType: "decimal" }}>
  {steps.map((step, idx) => (
    <li key={idx} style={{ marginBottom: 8 }}>
      {step.endsWith(".") ? step : `${step}.`}
    </li>
  ))}
</ol>


    </main>
  );
}
