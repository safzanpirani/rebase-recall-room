# Rebase Recall Room

A fast-recall trivia trainer for the browser. Six general-knowledge decks of 64 questions each, spaced review, per-deck stats, a timed simulation mode, and a dark theme by default. No build step, no framework, no accounts.

The 384 questions are general trivia, not tied to any show or exam, and are open data. See [data/](data/) for JSON and CSV exports under CC0.

## Run it

Open `index.html` in a browser. Everything works from a local file, including progress tracking.

For the optional AI explanations, run the tiny Bun server:

```sh
cp .env.example .env   # add an API key
bun run start          # http://localhost:4173
```

The server serves the same static files and adds one endpoint, `POST /api/explain`, which sends the question, its answer, and its note to an OpenAI-compatible Responses API and returns a short plain-language explanation. Without a key the app still runs and the button reports that AI is offline.

## Modes

- **Adaptive 12**: twelve questions weighted toward your misses and unseen cards.
- **Due review**: cards whose spaced-review timer has expired. Wrong answers return in ten minutes, correct answers on a widening schedule.
- **Full deck**: all 64 cards of the current deck, shuffled.
- **Simulation**: twelve questions with a 15-second timer each, then a review of your misses.

Every answer shows a one-line reason and a link to the source.

## Progress

Progress lives in `localStorage`. You can also connect a file on disk and the app will write a detailed answer history to `rebase-progress.json` after each answer. That file is gitignored.

## Question format

Each deck lives in `sets/set-N.js` and registers itself on `window.REBASE_EXTRA_SETS`. Each question has the same shape:

```js
{
  category: 'Nature',
  question: 'Which marine mammal has the densest fur?',
  options: ['Harbor seal', 'Sea otter', 'Walrus', 'Polar bear'],
  answer: 1,                      // index into options
  note: 'Sea otters can have up to about one million hairs per square inch.',
  source: 'https://www.fisheries.noaa.gov/species/sea-otter'
}
```

Categories: Screen & sound, Sports, Food & kitchen, Nature, Science, World.

Regenerate the exports after editing a deck:

```sh
bun run export
```

## Contributing

Corrections and new questions are welcome. Every question needs four options, one correct index, a one-sentence note, and a link to a public source that states the fact. Keep questions self-contained and avoid duplicates of existing cards. Run `bun run export` and include the regenerated `data/` files in your pull request.

## License

Code: [MIT](LICENSE). Questions: [CC0](data/LICENSE).
