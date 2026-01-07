"use client";

import { useMemo, useState } from "react";
import styles from "./RecipePaper.module.css";

type IngredientRow = { ingredient: string; measure: string };

function toNumber(x: string) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

function formatNumber(n: number) {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 10) / 10);
}

function parseMeasure(measure: string) {
  const m = measure.trim().match(/^(\d+(\.\d+)?)\s*(.*)$/);
  if (!m) return { amount: null as number | null, unit: measure.trim() };
  return { amount: toNumber(m[1]), unit: (m[3] || "").trim() };
}

function convertMeasureToMetric(measure: string) {
  const { amount, unit } = parseMeasure(measure);
  if (amount == null || !unit) return measure.trim();

  const u = unit.toLowerCase();

  // volume
  if (u.startsWith("tsp") || u.includes("teaspoon")) {
    return `${formatNumber(amount)} tsp (${formatNumber(amount * 4.93)} ml)`;
  }
  if (u.startsWith("tbsp") || u.includes("tablespoon") || u === "tbs") {
    return `${formatNumber(amount)} tbsp (${formatNumber(amount * 14.8)} ml)`;
  }
  if (u.startsWith("cup")) {
    return `${formatNumber(amount)} cups (${formatNumber(amount * 236.6)} ml)`;
  }

  // weight
  if (u.startsWith("oz") || u.includes("ounce")) {
    return `${formatNumber(amount)} ounces (${formatNumber(amount * 28.35)} g)`;
  }
  if (u.startsWith("lb") || u.includes("pound")) {
    return `${formatNumber(amount)} lb (${formatNumber(amount * 453.6)} g)`;
  }

  return measure.trim();
}

function scaleMeasure(measure: string, factor: number) {
  const { amount, unit } = parseMeasure(measure);
  if (amount == null) return measure.trim();
  const scaled = amount * factor;
  return `${formatNumber(scaled)}${unit ? ` ${unit}` : ""}`.trim();
}

/** Exclude from SHOPPING LIST (not from ingredients on page) */
const EXCLUDE_WORDS = ["water", "salt", "pepper"];

function shouldExcludeFromShopping(ingredient: string) {
  const t = ingredient.toLowerCase().trim();
  return EXCLUDE_WORDS.some((w) => new RegExp(`\\b${w}\\b`, "i").test(t));
}

export default function ServingsClient({
  ingredients,
}: {
  ingredients: IngredientRow[];
}) {
  const [servings, setServings] = useState<2 | 4 | 6>(2);
  const [copied, setCopied] = useState(false);

  const factor = servings / 2;

  const scaledIngredients = useMemo(() => {
    return ingredients.map((x) => ({
      ingredient: x.ingredient,
      measure: x.measure ? scaleMeasure(x.measure, factor) : "",
    }));
  }, [ingredients, factor]);

  const shoppingItems = useMemo(() => {
    return scaledIngredients.filter((x) => !shouldExcludeFromShopping(x.ingredient));
  }, [scaledIngredients]);

  const shoppingText = useMemo(() => {
    return shoppingItems
      .map((x) => {
        const left = x.measure ? `${convertMeasureToMetric(x.measure)} ` : "";
        return `${left}${x.ingredient}`.trim();
      })
      .join("\n");
  }, [shoppingItems]);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(shoppingText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // no-op
    }
  }

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[2, 4, 6].map((n) => (
          <button
            key={n}
            onClick={() => setServings(n as 2 | 4 | 6)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: servings === n ? "#000" : "#fff",
              color: servings === n ? "#fff" : "#000",
              cursor: "pointer",
            }}
          >
            {n} servings
          </button>
        ))}
      </div>

      {/* Ingredients list (stays as-is, but with notebook rhythm) */}
      <ul className={styles.ruledList}>
        {scaledIngredients.map((x, idx) => (
          <li key={idx}>
            {x.measure ? `${convertMeasureToMetric(x.measure)} ` : ""}
            {x.ingredient}
          </li>
        ))}
      </ul>

      {/* Torn note card (shopping list) */}
      <div className={styles.noteCard}>
        <div className={styles.tape} />
        <div className={styles.tape2} />

        <div className={styles.noteInner}>
          <div className={styles.noteHeader}>
            <h3 className={styles.noteTitle}>Shopping list</h3>

            <button
              onClick={onCopy}
              className={`${styles.copyBtn} ${copied ? styles.copyBtnSuccess : ""}`}
              aria-label="Copy shopping list"
            >
              {copied ? (
                <>
                  <span aria-hidden>✓</span> Copied
                </>
              ) : (
                "Copy"
              )}
            </button>
          </div>

          <ul className={styles.ruledList} style={{ margin: 0 }}>
            {shoppingItems.map((x, idx) => (
              <li key={idx}>
                {x.measure ? `${convertMeasureToMetric(x.measure)} ` : ""}
                {x.ingredient}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
