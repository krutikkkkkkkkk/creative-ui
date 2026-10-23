import "server-only"

import { GITHUB_URL } from "@/lib/registry"

/* The repo's star count, cached for an hour. Null when GitHub is unreachable or rate-limited,
   so the nav falls back to the bare icon. */
export async function getStarCount(): Promise<number | null> {
  const repo = GITHUB_URL.replace("https://github.com/", "")
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const data = await res.json()
    return typeof data.stargazers_count === "number" ? data.stargazers_count : null
  } catch {
    return null
  }
}
