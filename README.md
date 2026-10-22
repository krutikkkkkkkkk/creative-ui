# creative-ui

My shadcn registry "creative-ui", served at https://ui.krutikraut.com. Built from the official
[shadcn registry template](https://github.com/shadcn-ui/registry-template) (Next.js 15 + Tailwind v4).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add components and skills and what to check before a PR.

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
npm run registry:build   # regenerates public/r/*.json
```

## Add a component

1. Put the file(s) in `registry/new-york/blocks/<name>/`.
2. Add an entry to `registry.json` (name, type, title, description, `dependencies` for npm packages,
   `registryDependencies` for shadcn components like `button`, and `files`).
3. Run `npm run registry:build`. The index page lists every item automatically.
4. Delete the `hello-world` placeholder once you have real items.

Item types: `registry:block`, `registry:component`, `registry:ui`, `registry:hook`, `registry:lib`,
`registry:page` (needs `target`), `registry:style`, `registry:theme`.
Schema: https://ui.shadcn.com/docs/registry/registry-json

## Share a Claude skill

Skills ship as `registry:item` entries whose files install into the project's
`.claude/skills/<name>/` folder (in shadcn targets, `~` means the project root).

To add a skill from a GitHub repo, or to pull in updates after you change it there:

```bash
npm run sync:skill -- https://github.com/krutikkkkkkkkk/classical-collage-web-design
npm run registry:build
```

The script copies the repo (minus README and .git) into `registry/skills/<name>/` and
writes the item into `registry.json`. People install it with:

```bash
npx shadcn@latest add https://ui.krutikraut.com/r/classical-collage-web-design.json
```

## Deploy (Vercel)

1. `git init && git add . && git commit -m "init"` and push to a new GitHub repo.
2. Import it on Vercel. Build command is `npm run build` (it runs `shadcn build` first).
3. Env var: `NEXT_PUBLIC_BASE_URL=https://ui.krutikraut.com` (used by the Open in v0 button).
4. Project → Domains → add `ui.krutikraut.com`, then at your DNS provider add
   `CNAME ui → cname.vercel-dns.com`.

## Install from it

Direct URL:

```bash
npx shadcn@latest add https://ui.krutikraut.com/r/hello-world.json
```

Or with a namespace. Add this to the project's `components.json`:

```json
"registries": {
  "@creative-ui": "https://ui.krutikraut.com/r/{name}.json"
}
```

then `npx shadcn@latest add @creative-ui/hello-world`.

To work without that config line, submit the registry to the public directory:
https://ui.shadcn.com/docs/registry/registry-index
