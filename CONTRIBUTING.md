# Contributing to creative-ui

Thanks for helping out. This repo is a [shadcn registry](https://ui.shadcn.com/docs/registry)
served at https://ui.krutikraut.com. It holds two kinds of items:

- **Components** – React/Tailwind files installed with `npx shadcn@latest add`.
- **Claude skills** – `SKILL.md` bundles installed into a project's `.claude/skills/` folder.

Both are declared in `registry.json` and built into `public/r/*.json` by `shadcn build`.

## Setup

```bash
git clone https://github.com/krutikkkkkkkkk/creative-ui
cd creative-ui
npm install
npm run dev          # http://localhost:3000
```

Node 20+ is required. The site is Next.js 15 (App Router) with Tailwind v4 and shadcn v3.

## Adding a component

1. Create a folder under `registry/new-york/blocks/<name>/` and put the source files in it.
   Use kebab-case for the folder and the item name. Import shadcn primitives from
   `@/components/ui/*` and utilities from `@/lib/utils` as you would in any shadcn project.
2. Add an entry to `registry.json`:

   ```json
   {
     "name": "my-component",
     "type": "registry:component",
     "title": "My Component",
     "description": "One or two sentences on what it does and when to use it.",
     "dependencies": ["motion"],
     "registryDependencies": ["button", "card"],
     "files": [
       { "path": "registry/new-york/blocks/my-component/my-component.tsx", "type": "registry:component" }
     ]
   }
   ```

   - `dependencies` lists npm packages the files import.
   - `registryDependencies` lists shadcn components the files import (`button`, `dialog`, …).
   - Every file the item needs must appear in `files`. Pick the `type` that matches the file:
     `registry:component`, `registry:ui`, `registry:hook`, `registry:lib`, `registry:block`,
     or `registry:page` (which also needs a `target`).

3. Document it in `lib/docs/<name>.ts` and register it in `lib/docs/index.ts`. The page shows a usage
   example, a props table (name, type, default, description), any helpers exported next to the
   component, and notes on caveats such as browser support or sizing. Copy an existing file for the
   shape; keep defaults and descriptions in sync with the component's props.
4. Add a live demo in `components/demos/<name>-demo.tsx` and register it in `components/previews.tsx`.
5. Run `npm run registry:build` and check that `public/r/<name>.json` was generated.
   The build also stamps `"meta": { "addedAt": "<today>" }` on any entry that has no date. That
   date gives the item a "new" dot in the sidebar for three days (`NEW_FOR_DAYS` in `lib/registry.ts`).
   Commit the stamped `registry.json` so the date stays fixed.

   Where the entry sits in `registry.json` is where it appears on the site. Showpieces go first and
   quiet building blocks such as Halftone Image and Grain Overlay go last.
6. Open http://localhost:3000/docs/<name> and confirm the page renders, the install command is right,
   and the file list is complete.
7. Test the install in a scratch project:

   ```bash
   npx shadcn@latest add http://localhost:3000/r/<name>.json
   ```

Full schema: https://ui.shadcn.com/docs/registry/registry-json

## Adding a Claude skill

Skills live in their own GitHub repo and are synced into this one, so the registry copy is never
edited by hand. The skill repo needs a `SKILL.md` at its root with `name` and `description`
frontmatter.

```bash
npm run sync:skill -- https://github.com/<you>/<skill-repo>
npm run registry:build
```

The sync script copies the repo (minus `README.md`, `.git` and `.github`) into
`registry/skills/<name>/` and writes or replaces the `registry:item` entry in `registry.json`.
Re-run the same command to pull in updates from the skill repo.

Commit both the files under `registry/skills/<name>/` and the `registry.json` change.

To give an item a hero image, add `public/banners/<name>.png` (16:9, around 3200×1800). It is
picked up automatically on the item page and used as the page's social preview image.

## Changing the site

The site itself lives in `app/`, `components/` and `lib/`. A few conventions:

- Item pages are generated from `registry.json` by `lib/registry.ts`. If you add a new item type or
  field, update the types there first.
- Icons come from Hugeicons (`@hugeicons/react`). Avoid mixing in other icon sets.
- Styling is Tailwind v4 with the theme tokens in `app/globals.css`. Use the semantic tokens
  (`bg-background`, `text-muted-foreground`, …) instead of raw colors so dark mode keeps working.
- shadcn primitives in `components/ui/` are generated. Change them through the shadcn CLI, not by hand,
  unless the change is intentional for this site.

## Before you open a pull request

Run the full check and make sure it passes cleanly:

```bash
npm run lint
npm run build
```

`npm run build` runs `shadcn build` first, so a broken `registry.json` fails here rather than on deploy.

Then:

- Keep each PR to one item or one change. Separate "add component" from "redesign the header".
- Do not commit `public/r/`, `.next/` or `.env*`. The build regenerates `public/r/` on deploy.
- Write a short PR description saying what the item is for and link a screenshot or preview for
  anything visual.
- Make sure any code you contribute is yours to license. Skills must carry their own `LICENSE`
  in the skill repo.

## Reporting problems

Open an issue at https://github.com/krutikkkkkkkkk/creative-ui/issues with the item name, the
command you ran, and the full error output. For install failures, include the `components.json`
of the target project.
