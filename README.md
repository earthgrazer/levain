# levain

A client-side sourdough hydration calculator. Enter your starter weight and hydration, set your target dough hydration and starter percentage, and get back exactly how much flour, water, and salt to add.

**Live:** https://earthgrazer.github.io/levain/

---

## what it does

Given four inputs:

| input | meaning |
|---|---|
| starter weight | grams of starter you're using |
| starter hydration | water ÷ flour ratio of your starter (%) |
| starter amount | starter as % of total dough weight |
| target hydration | desired final dough hydration (%) |

It calculates:
- flour to add
- water to add
- salt to add (as % of total flour)
- total dough weight

You can save, load, rename, and delete named presets — stored in `localStorage`.

## stack

- [Vite](https://vite.dev/) — dev server and build
- vanilla JS — no framework
- CSS custom properties — no CSS framework
- `localStorage` — preset persistence
- GitHub Actions + GitHub Pages — deploy on push to `main`

## local dev

```sh
npm install
npm run dev
```

## deploy

Push to `main`. GitHub Actions builds and deploys to GitHub Pages automatically.

## license

Apache 2.0
