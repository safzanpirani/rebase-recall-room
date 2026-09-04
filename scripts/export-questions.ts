// Exports every deck to data/questions.json and data/questions.csv.
// Run: bun scripts/export-questions.ts
const ROOT = `${import.meta.dir}/..`;

type Question = { category: string; question: string; options: string[]; answer: number; note: string; source: string };
type Deck = { key: string; name: string; subtitle?: string; questions: Question[] };

async function loadSetOne(): Promise<Deck> {
  const html = await Bun.file(`${ROOT}/index.html`).text();
  const start = html.indexOf("const calibrationQuestions = [");
  const end = html.indexOf("];", start) + 2;
  if (start < 0 || end < 2) throw new Error("Could not locate Set 1 in index.html");
  const Q = (category: string, question: string, options: string[], answer: number, note: string, source: string) =>
    ({ category, question, options, answer, note, source });
  const questions: Question[] = new Function("Q", `${html.slice(start, end)} return calibrationQuestions;`)(Q);
  return { key: "set-1", name: "Set 1", questions };
}

async function loadExtraSets(): Promise<Deck[]> {
  const decks: Deck[] = [];
  for (let i = 2; i <= 6; i++) {
    const src = await Bun.file(`${ROOT}/sets/set-${i}.js`).text();
    const win: { REBASE_EXTRA_SETS: Record<string, Omit<Deck, "key">> } = { REBASE_EXTRA_SETS: {} };
    new Function("window", src)(win);
    const key = `set-${i}`;
    const deck = win.REBASE_EXTRA_SETS[key];
    if (!deck) throw new Error(`sets/set-${i}.js did not define ${key}`);
    decks.push({ key, ...deck });
  }
  return decks;
}

const decks = [await loadSetOne(), ...(await loadExtraSets())];
const total = decks.reduce((n, d) => n + d.questions.length, 0);

await Bun.write(`${ROOT}/data/questions.json`, JSON.stringify({ decks, total }, null, 2) + "\n");

const csvCell = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
const rows = [["deck", "category", "question", "option_a", "option_b", "option_c", "option_d", "answer", "note", "source"].join(",")];
for (const d of decks) for (const q of d.questions) {
  rows.push([d.name, q.category, q.question, ...q.options, q.options[q.answer], q.note, q.source].map(csvCell).join(","));
}
await Bun.write(`${ROOT}/data/questions.csv`, rows.join("\n") + "\n");
console.log(`Exported ${total} questions across ${decks.length} decks to data/`);
