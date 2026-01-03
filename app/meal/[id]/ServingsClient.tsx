"use client";

import { useState } from "react";

type Ingredient = {
  ingredient: string;
  measure: string;
};
function normalizeName(name: string) {
  return name.toLowerCase().trim();
}
function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function parseAmount(s: string): { amount: number; rest: string } | null {
  // supports: "1", "1.5", "1/2", "1 1/2"
  const trimmed = s.trim();

  // mixed fraction: "1 1/2"
  const mixed = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)\s*(.*)$/);
  if (mixed) {
    const whole = parseFloat(mixed[1]);
    const num = parseFloat(mixed[2]);
    const den = parseFloat(mixed[3]);
    return { amount: whole + num / den, rest: (mixed[4] || "").trim() };
  }

  // simple fraction: "1/2"
  const frac = trimmed.match(/^(\d+)\/(\d+)\s*(.*)$/);
  if (frac) {
    const num = parseFloat(frac[1]);
    const den = parseFloat(frac[2]);
    return { amount: num / den, rest: (frac[3] || "").trim() };
  }

  // decimal/int: "1.5"
  const dec = trimmed.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  if (dec) {
    return { amount: parseFloat(dec[1]), rest: (dec[2] || "").trim() };
  }

  return null;
}

function convertMeasureToMetric(measure: string): string {
  // Examples: "2 tbsp", "1 tablespoon", "8 oz", "1 lb", "1 cup", "250 ml"
  const parsed = parseAmount(measure);
  if (!parsed) return measure;

  const { amount, rest } = parsed;
  if (!rest) return measure;

  const lower = rest.toLowerCase();

  // normalize common unit variants
  const unitMatch = lower.match(
    /^(tablespoons?|tbsp|tbs|teaspoons?|tsp|cups?|cup|fl\s?oz|fluid\s?ounces?|ounces?|oz|pounds?|lbs?|lb|milliliters?|ml|liters?|l)\b(.*)$/
  );
  if (!unitMatch) return measure;

  const unit = unitMatch[1].replace(/\s+/g, " ").trim();
  const tail = (unitMatch[2] || "").trim(); // anything after unit (e.g. "cold water")

  // If already metric, keep as-is
  if (unit === "ml" || unit.startsWith("milliliter")) return measure;
  if (unit === "l" || unit.startsWith("liter")) return measure;

  // Conversions
  // Volume → ml
  const ML_PER_TSP = 4.92892;
  const ML_PER_TBSP = 14.7868;
  const ML_PER_CUP = 236.588;
  const ML_PER_FLOZ = 29.5735;

  // Weight → g
  const G_PER_OZ = 28.3495;
  const G_PER_LB = 453.592;

  let converted: string | null = null;

  if (unit.startsWith("teaspoon") || unit === "tsp") {
    converted = `${round1(amount * ML_PER_TSP)} ml`;
  } else if (unit.startsWith("tablespoon") || unit === "tbsp" || unit === "tbs") {
    converted = `${round1(amount * ML_PER_TBSP)} ml`;
  } else if (unit.startsWith("cup") || unit === "cup") {
    converted = `${round1(amount * ML_PER_CUP)} ml`;
  } else if (unit === "fl oz" || unit.startsWith("fluid ounce")) {
    converted = `${round1(amount * ML_PER_FLOZ)} ml`;
  } else if (unit === "oz" || unit.startsWith("ounce")) {
    converted = `${round1(amount * G_PER_OZ)} g`;
  } else if (unit === "lb" || unit === "lbs" || unit.startsWith("pound")) {
    converted = `${round1(amount * G_PER_LB)} g`;
  }

  if (!converted) return measure;

  // Keep original + show metric in parentheses. Keep tail if present.
  const original = tail ? `${amount} ${unit} ${tail}` : `${amount} ${unit}`;
  const metric = tail ? `${converted} ${tail}` : converted;

  return `${original} (${metric})`;
}


export default function ServingsClient({
  ingredients,
}: {
  ingredients: Ingredient[];
}) {
  const [servings, setServings] = useState(2);
  const [copied, setCopied] = useState(false);

  const baseServings = 2;

  function scaleMeasure(measure: string) {
    const match = measure.match(/([\d.]+)/);
    if (!match) return measure;

    const value = parseFloat(match[1]);
    const scaled = (value * servings) / baseServings;

    return measure.replace(match[1], scaled.toString());
  }
  function buildShoppingList() {
  const map = new Map<string, string[]>();

  ingredients.forEach((x) => {
    const key = normalizeName(x.ingredient);
    const scaled = x.measure ? scaleMeasure(x.measure) : "";

    if (!map.has(key)) {
      map.set(key, []);
    }

    if (scaled) {
      map.get(key)!.push(scaled);
    }
  });

  return Array.from(map.entries()).map(([ingredient, measures]) => ({
    ingredient,
    measure: measures.join(" + "),
  }));
}

const shoppingList = buildShoppingList();
function copyShoppingList() {
  const text = shoppingList
   .map((x) =>
  x.measure
    ? `${convertMeasureToMetric(x.measure)} ${x.ingredient}`
    : x.ingredient
)
.join("\n");


  navigator.clipboard.writeText(text);
  setCopied(true);

  setTimeout(() => setCopied(false), 1500);
}




  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[2, 4, 6].map((s) => (
          <button
            key={s}
            onClick={() => setServings(s)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: servings === s ? "#000" : "#fff",
              color: servings === s ? "#fff" : "#000",
              cursor: "pointer",
            }}
          >
            {s} servings
          </button>
        ))}
      </div>

      <ul>
        {ingredients.map((x, idx) => (
          <li key={idx}>
           {x.measure ? `${convertMeasureToMetric(x.measure)} ` : ""}{x.ingredient}

          </li>
        ))}
      </ul>
<div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
  }}
>
  <h3>Shopping list</h3>

<button
  onClick={copyShoppingList}
  style={{
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid #ccc",
    cursor: "pointer",
    background: "#fff",
    color: copied ? "#16a34a" : "#000",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 6,
  }}
>
  {copied ? (
    <>
      <span>✔</span>
      <span>Copied</span>
    </>
  ) : (
    "Copy"
  )}
</button>

</div>


<ul>
  {shoppingList.map((x, idx) => (
    <li key={idx}>
      {x.measure ? `${convertMeasureToMetric(x.measure)} ` : ""}{x.ingredient}

    </li>
  ))}
</ul>

    </>
  );
}
