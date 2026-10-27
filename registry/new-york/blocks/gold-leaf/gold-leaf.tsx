"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type GoldLeafTone = "yellow" | "rose" | "white" | "copper"

type Metal = { dark: string; mid: string; light: string; bright: string }

/** Metal ramps, shadow to burnished highlight. "white" is palladium, which stays bright without tarnishing. */
export const goldLeafTones: Record<GoldLeafTone, Metal> = {
  yellow: { dark: "#5f3d0b", mid: "#b8893a", light: "#e9c873", bright: "#fff5d2" },
  rose: { dark: "#62301f", mid: "#b6735a", light: "#e8b296", bright: "#ffe8da" },
  white: { dark: "#4d4a44", mid: "#9d998f", light: "#d9d5ca", bright: "#ffffff" },
  copper: { dark: "#4a1c0b", mid: "#a4522b", light: "#df9165", bright: "#ffdcc4" },
}

/** Oil size, the tacky amber mordant the leaf is laid onto. Shows under the leaves while they settle. */
const SIZE = "#a87b2e"

/** Leaves per tile. Rows are offset at random, so the repeat is hard to spot. */
const COLS = 6
const ROWS = 5

/** Per-leaf ramp steepness for the lay. Higher is a crisper hand-off from size to leaf. */
const RAMP = 5
/** Pushes an unloaded delay map to "not laid yet" instead of "laid", so nothing flashes in early. */
const GUARD = 60

/** Where the light rests when nothing is moving it, as a fraction of the box, and how strong. */
const REST = { x: 0.24, y: 0.16, e: 0.42 }

function prng(seed: number) {
  let a = seed >>> 0 || 1
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const f = (n: number) => Math.round(n * 10) / 10
const clamp01 = (n: number) => Math.min(1, Math.max(0, n))
const svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`

type Leaf = {
  x: number
  y: number
  w: number
  h: number
  /** -1 to 1. Leaves from one book differ slightly in thickness and tone. */
  tone: number
  /** 0 to 1. How squarely the leaf faces the light, so each one catches the glint differently. */
  facet: number
  /** 0 to 1. Random part of the lay order. */
  order: number
  /** Leaf-local SVG for the face texture and for the missing flecks. */
  face: string
  holes: string
}

/**
 * Lays one tile of leaves, row by row, each overlapping the last by a few percent the way a gilder
 * works along a line. Seeded, so the server and client draw the same sheet.
 */
function layLeaves(size: number, cracks: number, seed: number, metal: Metal): Leaf[] {
  const rand = prng(seed)
  const crackRand = prng(seed + 101)
  const fleckRand = prng(seed + 202)
  const leaves: Leaf[] = []
  const c = clamp01(cracks)

  for (let r = 0; r < ROWS; r++) {
    const offset = rand() * size
    for (let col = 0; col < COLS; col++) {
      const j = () => (rand() - 0.5) * size * 0.08
      const w = size * (1.04 + rand() * 0.05)
      const h = size * (1.04 + rand() * 0.05)
      const tone = rand() * 2 - 1
      const wave1 = j() * 0.25
      const wave2 = j() * 0.25

      // Only the top and left edges show: the next leaf covers this one's right and bottom.
      const seam = `M0 ${f(h)}L${f(wave1)} ${f(h / 2)}L0 0L${f(w / 2)} ${f(wave2)}L${f(w)} 0`
      const lip = `M0.9 ${f(h)}L${f(wave1 + 0.9)} ${f(h / 2)}L0.9 0.9L${f(w / 2)} ${f(wave2 + 0.9)}L${f(w)} 0.9`
      let face =
        `<rect width="${f(w)}" height="${f(h)}" fill="${tone > 0 ? metal.bright : metal.dark}" fill-opacity="${(Math.abs(tone) * 0.24).toFixed(3)}"/>` +
        `<path d="${seam}" fill="none" stroke="#24160a" stroke-opacity="0.5" stroke-width="0.9"/>` +
        `<path d="${lip}" fill="none" stroke="${metal.bright}" stroke-opacity="0.55" stroke-width="0.6"/>`

      // Skewings: faint creases where the leaf folded on the cushion.
      const creases = Math.floor(crackRand() * 2.2)
      for (let k = 0; k < creases; k++) {
        const x = crackRand() * w
        const y = crackRand() * h
        const a = crackRand() * Math.PI
        const len = size * (0.2 + crackRand() * 0.3)
        face += `<path d="M${f(x)} ${f(y)}l${f(Math.cos(a) * len)} ${f(Math.sin(a) * len)}" stroke="${metal.bright}" stroke-opacity="0.16" stroke-width="0.7"/>`
      }

      // Cracks: jagged hairlines that wander across the leaf.
      const count = Math.floor(c * 2.6 + crackRand() * c * 1.4)
      for (let k = 0; k < count; k++) {
        let x = crackRand() * w
        let y = crackRand() * h
        let a = crackRand() * Math.PI * 2
        let d = `M${f(x)} ${f(y)}`
        const steps = 4 + Math.floor(crackRand() * 4)
        for (let s = 0; s < steps; s++) {
          a += (crackRand() - 0.5) * 1.3
          const len = size * (0.05 + crackRand() * 0.08)
          x += Math.cos(a) * len
          y += Math.sin(a) * len
          d += `L${f(x)} ${f(y)}`
        }
        face +=
          `<path d="${d}" fill="none" stroke="#2b1405" stroke-opacity="0.6" stroke-width="0.75" stroke-linejoin="round"/>` +
          `<path d="${d}" transform="translate(0.7 0.7)" fill="none" stroke="${metal.bright}" stroke-opacity="0.3" stroke-width="0.5"/>`
      }

      // Flecks the leaf missed, mostly along the seams where it tore.
      let holes = ""
      const flecks = Math.floor(c * 2.4 + fleckRand() * c * 2)
      for (let k = 0; k < flecks; k++) {
        const edge = fleckRand() < 0.7
        const cx = edge && fleckRand() < 0.5 ? fleckRand() * size * 0.12 : fleckRand() * w
        const cy = edge && cx > size * 0.12 ? fleckRand() * size * 0.12 : fleckRand() * h
        const radius = size * (0.012 + fleckRand() * 0.035)
        let p = ""
        for (let v = 0; v < 6; v++) {
          const ang = (v / 6) * Math.PI * 2
          const rr = radius * (0.5 + fleckRand() * 0.8)
          p += `${v ? "L" : "M"}${f(cx + Math.cos(ang) * rr)} ${f(cy + Math.sin(ang) * rr)}`
        }
        holes += `<path d="${p}Z"/>`
      }

      leaves.push({
        x: offset + col * size + j(),
        y: r * size + j(),
        w,
        h,
        tone,
        facet: rand(),
        order: rand(),
        face,
        holes,
      })
    }
  }
  return leaves
}

/** Places each leaf in the tile, plus the copies that wrap round the edges so the tile repeats seamlessly. */
function placements(leaves: Leaf[], tw: number, th: number, draw: (leaf: Leaf, x: number, y: number) => string) {
  let out = ""
  for (const leaf of leaves) {
    for (const dy of [-th, 0, th]) {
      for (const dx of [-tw, 0, tw]) {
        const x = leaf.x + dx
        const y = leaf.y + dy
        if (x > tw || y > th || x + leaf.w < 0 || y + leaf.h < 0) continue
        out += draw(leaf, x, y)
      }
    }
  }
  return out
}

function sheet(size: number, cracks: number, seed: number, metal: Metal) {
  const leaves = layLeaves(size, cracks, seed, metal)
  const tw = COLS * size
  const th = ROWS * size
  const open = `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}" viewBox="0 0 ${tw} ${th}">`
  const at = (x: number, y: number) => `transform="translate(${f(x)} ${f(y)})"`

  const face = placements(leaves, tw, th, (l, x, y) => `<g ${at(x, y)}>${l.face}</g>`)
  // Masks are luminance inside the SVG so a later leaf can replace an earlier one, then become alpha outside.
  const holes = placements(leaves, tw, th, (l, x, y) => (l.holes ? `<g ${at(x, y)} fill="#000">${l.holes}</g>` : ""))
  const facets = placements(leaves, tw, th, (l, x, y) => {
    const g = Math.round((0.3 + l.facet * 0.7) * 255)
    return `<g ${at(x, y)}><rect width="${f(l.w)}" height="${f(l.h)}" fill="rgb(${g},${g},${g})"/><g fill="#000">${l.holes}</g></g>`
  })
  const mask = (body: string, base: string) =>
    `${open}<defs><mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="${tw}" height="${th}">${base}${body}</mask></defs>` +
    `<rect width="${tw}" height="${th}" fill="#fff" mask="url(#m)"/></svg>`

  return {
    leaves,
    tw,
    th,
    face: svgUrl(`${open}${face}</svg>`),
    holes: svgUrl(mask(holes, `<rect width="${tw}" height="${th}" fill="#fff"/>`)),
    facets: svgUrl(mask(facets, "")),
  }
}

/** Filter region for the lay, as a fraction of the box. Generous, so serif overhangs are not clipped. */
const REGION = { x: -0.1, y: -0.2, w: 1.2, h: 1.4 }

/**
 * A grey map the size of the element: each leaf's grey is when it lands. Mostly a left-to-right sweep,
 * with some randomness so it reads as a hand laying leaves, not a wipe.
 */
function delayMap(leaves: Leaf[], tw: number, th: number, width: number, height: number, seed: number) {
  const x0 = REGION.x * width
  const y0 = REGION.y * height
  const mw = REGION.w * width
  const mh = REGION.h * height
  let rects = ""
  for (let ty = Math.floor(y0 / th) - 1; ty <= Math.ceil((y0 + mh) / th); ty++) {
    for (let r = 0; r < ROWS; r++) {
      for (let tx = Math.floor(x0 / tw) - 1; tx <= Math.ceil((x0 + mw) / tw); tx++) {
        for (let c = 0; c < COLS; c++) {
          const leaf = leaves[r * COLS + c]
          const x = leaf.x + tx * tw
          const y = leaf.y + ty * th
          if (x > x0 + mw || y > y0 + mh || x + leaf.w < x0 || y + leaf.h < y0) continue
          const sweep = clamp01(((x + leaf.w / 2) / width) * 0.82 + ((y + leaf.h / 2) / height) * 0.18)
          const jitter = prng(seed * 7919 + (tx + 64) * 131 + (ty + 64) * 9173 + r * COLS + c)()
          const g = Math.round(clamp01(sweep * 0.7 + (leaf.order * 0.5 + jitter * 0.5) * 0.3) * 255)
          rects += `<rect x="${f(x)}" y="${f(y)}" width="${f(leaf.w)}" height="${f(leaf.h)}" fill="rgb(${g},${g},${g})"/>`
        }
      }
    }
  }
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${f(mw)}" height="${f(mh)}" viewBox="${f(x0)} ${f(y0)} ${f(mw)} ${f(mh)}" preserveAspectRatio="none">` +
    `<rect x="${f(x0)}" y="${f(y0)}" width="${f(mw)}" height="${f(mh)}" fill="#fff"/>${rects}</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/** Leaf cover at lay time `t`: alpha ramps from 0 to 1 as `t` passes each leaf's grey. */
const coverMatrix = (t: number) => `0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${-RAMP} 0 0 ${GUARD} ${f(RAMP * t - GUARD)}`

const reducedQuery = "(prefers-reduced-motion: reduce)"
function subscribeReduced(onChange: () => void) {
  const mq = window.matchMedia(reducedQuery)
  mq.addEventListener("change", onChange)
  return () => mq.removeEventListener("change", onChange)
}
function useReducedMotion() {
  return React.useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(reducedQuery).matches,
    () => false
  )
}

export interface GoldLeafProps extends React.HTMLAttributes<HTMLElement> {
  /** Element to render. Default "span". */
  as?: React.ElementType
  /** Metal. "yellow" is 23k gold, "white" is palladium. Default "yellow". */
  tone?: GoldLeafTone
  /** Edge of one leaf in px. Real leaf is about 80mm; on a title, 24 to 48 reads well. Default 32. */
  leafSize?: number
  /** Cracks and missing flecks, 0 to 1. 0 is a fresh, perfect lay. Default 0.3. */
  cracks?: number
  /** Strength of the moving highlight, 0 to 1. Default 0.85. */
  sheen?: number
  /** Light follows the pointer, or sweeps slowly on touch screens. Off leaves a still highlight. Default true. */
  interactive?: boolean
  /** Lay the leaves on in a staggered sweep the first time it scrolls into view. Default false. */
  lay?: boolean
  /** Length of the lay in ms. Default 1800. */
  layDuration?: number
  /** Seed for the leaf layout, cracks and flecks. Default 7. */
  seed?: number
  ref?: React.Ref<HTMLElement>
}

/**
 * Text gilded with gold leaf: square leaves with visible seams, cracks and missed flecks, burnished
 * metal and a highlight that follows the pointer. The text stays real, selectable text.
 */
export function GoldLeaf({
  as: Comp = "span",
  tone = "yellow",
  leafSize = 32,
  cracks = 0.3,
  sheen = 0.85,
  interactive = true,
  lay = false,
  layDuration = 1800,
  seed = 7,
  className,
  children,
  ...props
}: GoldLeafProps) {
  const id = React.useId().replace(/[^\w-]/g, "")
  const reliefId = `gl-relief-${id}`
  const layFaceId = `gl-lay-${id}`
  const layMaskId = `gl-mask-${id}`

  const boxRef = React.useRef<HTMLSpanElement>(null)
  const faceRef = React.useRef<HTMLSpanElement>(null)
  const glintRef = React.useRef<HTMLSpanElement>(null)
  const faceMatrixRef = React.useRef<SVGFEColorMatrixElement>(null)
  const maskMatrixRef = React.useRef<SVGFEColorMatrixElement>(null)

  const reduced = useReducedMotion()
  const [phase, setPhase] = React.useState<"unlaid" | "laying" | "laid">(lay ? "unlaid" : "laid")
  const [map, setMap] = React.useState<string | undefined>(undefined)
  const state = reduced ? "laid" : phase

  const metal = goldLeafTones[tone] ?? goldLeafTones.yellow
  const size = Math.max(8, leafSize)
  const leaf = React.useMemo(() => sheet(size, cracks, seed, metal), [size, cracks, seed, metal])

  // Wait for the element to be seen (in a visible tab), then build its delay map and start laying.
  React.useEffect(() => {
    const face = faceRef.current
    if (state !== "unlaid" || !face) return
    let observer: IntersectionObserver | undefined
    const start = () => {
      if (document.visibilityState !== "visible") return
      document.removeEventListener("visibilitychange", start)
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return
          observer?.disconnect()
          const { width, height } = face.getBoundingClientRect()
          setMap(delayMap(leaf.leaves, leaf.tw, leaf.th, width, height, seed))
          setPhase("laying")
        },
        { threshold: 0.35 }
      )
      observer.observe(face)
    }
    document.addEventListener("visibilitychange", start)
    start()
    return () => {
      document.removeEventListener("visibilitychange", start)
      observer?.disconnect()
    }
  }, [state, leaf, seed])

  // The lay itself: one filter attribute per frame, with the glint riding the leading edge.
  React.useEffect(() => {
    if (state !== "laying" || !map) return
    const glint = glintRef.current
    const mats = [faceMatrixRef.current, maskMatrixRef.current]
    let raf = 0
    let t0 = 0
    let cancelled = false

    const tick = (now: number) => {
      if (!t0) t0 = now
      const p = Math.min(1, (now - t0) / layDuration)
      // A gentle ease-out, so the first leaves go down briskly and the last few settle.
      const t = (1 - (1 - p) ** 1.5) * (1 + 1 / RAMP)
      for (const m of mats) m?.setAttribute("values", coverMatrix(t))
      if (glint) {
        glint.style.setProperty("--gl-x", `${((t * 0.95 - 0.08) * 100).toFixed(2)}%`)
        glint.style.setProperty("--gl-y", `${(40 + p * 20).toFixed(2)}%`)
        glint.style.setProperty("--gl-e", (Math.sin(Math.PI * p) * 0.75 + REST.e * p).toFixed(3))
      }
      if (p < 1) raf = requestAnimationFrame(tick)
      else setPhase("laid")
    }
    // Let the map decode first; feImage would otherwise show nothing for a frame or two.
    const img = new Image()
    img.src = map
    img
      .decode()
      .catch(() => undefined)
      .then(() => {
        if (!cancelled) raf = requestAnimationFrame(tick)
      })
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [state, map, layDuration])

  // The light. A spring towards the pointer on mouse and pen, a slow sweep on touch, still otherwise.
  React.useEffect(() => {
    const box = boxRef.current
    const glint = glintRef.current
    if (state !== "laid" || !box || !glint) return

    let rect = box.getBoundingClientRect()
    const write = (x: number, y: number, e: number) => {
      const r = Math.max(48, Math.min(rect.width * 0.45, rect.height * 1.1))
      glint.style.setProperty("--gl-x", `${(x * 100).toFixed(2)}%`)
      glint.style.setProperty("--gl-y", `${(y * 100).toFixed(2)}%`)
      glint.style.setProperty("--gl-r", `${r.toFixed(1)}px`)
      glint.style.setProperty("--gl-e", e.toFixed(3))
    }

    if (reduced || !interactive) {
      write(REST.x, REST.y, REST.e)
      const ro = new ResizeObserver(() => {
        rect = box.getBoundingClientRect()
        write(REST.x, REST.y, REST.e)
      })
      ro.observe(box)
      return () => ro.disconnect()
    }

    const follow = window.matchMedia("(any-pointer: fine)").matches
    let x = REST.x
    let y = REST.y
    let e = REST.e
    let vx = 0
    let vy = 0
    let px: number | null = null
    let py = 0
    let raf = 0
    let timer = 0
    let last = 0
    let visible = false
    let t0 = 0
    write(x, y, e)

    // Pointer to light: under the pointer while it is over the text, then easing out past the edges.
    // Far away the highlight dims but never goes dark, so the metal still reads as metal.
    const aim = () => {
      if (px === null) return [REST.x, REST.y, REST.e] as const
      const hw = rect.width / 2
      const hh = rect.height / 2
      const dx = (px - (rect.left + hw)) / hw
      const dy = (py - (rect.top + hh)) / hh
      const soft = (d: number) => d / (1 + 0.25 * Math.abs(d))
      const ox = Math.max(0, Math.abs(px - rect.left - hw) - hw)
      const oy = Math.max(0, Math.abs(py - rect.top - hh) - hh)
      const reach = Math.max(rect.height * 2, 180)
      const near = 1 / (1 + (Math.hypot(ox, oy) / reach) ** 2)
      return [0.5 + soft(dx) * 0.5, 0.5 + soft(dy) * 0.5, 0.3 + 0.7 * near] as const
    }

    const followTick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      rect = box.getBoundingClientRect()
      const [tx, ty, te] = aim()
      // Slightly under-damped spring: it glides after the pointer and settles without a wobble.
      const k = 140
      const c = 22
      vx += ((tx - x) * k - vx * c) * dt
      vy += ((ty - y) * k - vy * c) * dt
      x += vx * dt
      y += vy * dt
      e += (te - e) * (1 - Math.exp(-dt * 6))
      write(x, y, e)
      const settled =
        Math.abs(tx - x) < 5e-4 && Math.abs(ty - y) < 5e-4 && Math.abs(vx) + Math.abs(vy) < 1e-3 && Math.abs(te - e) < 2e-3
      raf = settled ? 0 : requestAnimationFrame(followTick)
    }

    // Touch: a pass of light every few seconds, from the resting spot off the far corner, then back.
    const PERIOD = 7000
    const PASS = 2400
    const RETURN = 700
    const sweepTick = (now: number) => {
      const t = (now - t0) % PERIOD
      if (t < PASS) {
        const p = t / PASS
        const s = p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2
        const fade = 1 - clamp01((p - 0.7) / 0.3)
        write(REST.x + (1.35 - REST.x) * s, REST.y + (0.85 - REST.y) * s, REST.e * fade + 0.55 * Math.sin(Math.PI * p))
      } else if (t < PASS + RETURN) {
        const q = (t - PASS) / RETURN
        write(REST.x, REST.y, REST.e * (1 - (1 - q) ** 3))
      } else {
        write(REST.x, REST.y, REST.e)
        raf = 0
        timer = window.setTimeout(() => {
          raf = requestAnimationFrame(sweepTick)
        }, PERIOD - t)
        return
      }
      raf = requestAnimationFrame(sweepTick)
    }

    const stop = () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
      raf = 0
    }
    const kick = () => {
      if (raf || !visible || document.hidden) return
      if (follow) {
        last = performance.now()
        raf = requestAnimationFrame(followTick)
      } else {
        clearTimeout(timer)
        // First pass a beat after it comes into view.
        t0 = performance.now() - PERIOD + 1200
        raf = requestAnimationFrame(sweepTick)
      }
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return
      px = event.clientX
      py = event.clientY
      kick()
    }
    const onOut = (event: PointerEvent) => {
      if (event.relatedTarget) return
      px = null
      kick()
    }
    const onVisibility = () => (document.hidden ? stop() : kick())
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) kick()
        else stop()
      },
      { rootMargin: "20% 0px" }
    )
    io.observe(box)
    document.addEventListener("visibilitychange", onVisibility)
    if (follow) {
      window.addEventListener("pointermove", onMove, { passive: true })
      window.addEventListener("pointerout", onOut, { passive: true })
      window.addEventListener("scroll", kick, { passive: true, capture: true })
    }

    return () => {
      stop()
      io.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerout", onOut)
      window.removeEventListener("scroll", kick, { capture: true })
    }
  }, [state, reduced, interactive])

  // Burnished metal, one reflection per line of text: bright sky above, dark horizon below the middle.
  const env = `linear-gradient(180deg, ${metal.mid} 0%, ${metal.light} 16%, ${metal.bright} 30%, ${metal.light} 42%, ${metal.dark} 60%, ${metal.mid} 74%, ${metal.light} 88%, ${metal.mid} 100%)`
  const tile = `${leaf.tw}px ${leaf.th}px`
  const glint =
    `radial-gradient(circle var(--gl-r, 120px) at var(--gl-x, 24%) var(--gl-y, 16%), ${metal.bright} 0%, ${metal.bright}e6 10%, ${metal.light}80 34%, ${metal.light}00 100%),` +
    `linear-gradient(104deg, transparent calc(var(--gl-x, 24%) - 24%), ${metal.bright}66 var(--gl-x, 24%), transparent calc(var(--gl-x, 24%) + 24%))`

  // Room around the glyphs so serif overhangs sit inside the box, and so inside the masks and filters.
  const pad = "0.15em 0.1em"
  const textClip: React.CSSProperties = { WebkitBackgroundClip: "text", backgroundClip: "text" }

  return (
    <Comp
      data-slot="gold-leaf"
      data-state={state}
      className={cn("group/gold-leaf inline-block", className)}
      {...props}
    >
      <span
        ref={boxRef}
        // flow-root stops the face's negative margin collapsing through, which would offset the glint copy.
        className="relative isolate flow-root"
        style={
          {
            "--gl-relief": `url(#${reliefId})`,
            "--gl-lay": `url(#${reliefId}) url(#${layFaceId})`,
            "--gl-mask": `url(#${layMaskId})`,
          } as React.CSSProperties
        }
      >
        <svg aria-hidden className="pointer-events-none absolute size-0 overflow-hidden" focusable="false">
          <defs>
            {/* Leaf relief: bevelled glyph edges plus a fine crinkle, lit from the upper left. */}
            <filter id={reliefId} x="-10%" y="-20%" width="120%" height="140%" colorInterpolationFilters="sRGB">
              <feGaussianBlur in="SourceAlpha" stdDeviation={1.1} result="bevel" />
              <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves={2} seed={seed} result="crinkle" />
              <feComposite in="bevel" in2="crinkle" operator="arithmetic" k2={1} k3={0.07} result="height" />
              <feDiffuseLighting in="height" surfaceScale={2.5} diffuseConstant={1.08} lightingColor="#fff" result="diffuse">
                <feDistantLight azimuth={225} elevation={58} />
              </feDiffuseLighting>
              <feSpecularLighting
                in="height"
                surfaceScale={2.5}
                specularConstant={0.85}
                specularExponent={22}
                lightingColor={metal.bright}
                result="spec"
              >
                <feDistantLight azimuth={225} elevation={58} />
              </feSpecularLighting>
              <feComposite in="SourceGraphic" in2="diffuse" operator="arithmetic" k1={1} result="shaded" />
              <feComposite in="spec" in2="SourceAlpha" operator="in" result="spec" />
              <feComposite in="shaded" in2="spec" operator="arithmetic" k2={1} k3={0.5} result="lit" />
              <feComposite in="lit" in2="SourceAlpha" operator="in" />
            </filter>
            {lay && (
              <>
                <filter
                  id={layFaceId}
                  x={REGION.x}
                  y={REGION.y}
                  width={REGION.w}
                  height={REGION.h}
                  primitiveUnits="objectBoundingBox"
                  colorInterpolationFilters="sRGB"
                >
                  <feImage href={map} x={REGION.x} y={REGION.y} width={REGION.w} height={REGION.h} preserveAspectRatio="none" result="map" />
                  <feColorMatrix ref={faceMatrixRef} in="map" type="matrix" values={coverMatrix(0)} result="cover" />
                  {/* A leaf brightens as it lands: 4a(1 - a) peaks halfway through its ramp. */}
                  <feComposite in="cover" in2="cover" operator="arithmetic" k1={-4} k2={4} result="flash" />
                  <feComposite in="SourceGraphic" in2="cover" operator="in" result="leaf" />
                  <feFlood floodColor={SIZE} floodOpacity={0.55} />
                  <feComposite in2="SourceAlpha" operator="in" result="size" />
                  <feComposite in="leaf" in2="size" operator="over" result="laid" />
                  <feFlood floodColor={metal.bright} />
                  <feComposite in2="flash" operator="in" />
                  <feComposite in2="SourceAlpha" operator="in" result="glow" />
                  <feComposite in="laid" in2="glow" operator="arithmetic" k2={1} k3={0.35} />
                </filter>
                <filter
                  id={layMaskId}
                  x={REGION.x}
                  y={REGION.y}
                  width={REGION.w}
                  height={REGION.h}
                  primitiveUnits="objectBoundingBox"
                  colorInterpolationFilters="sRGB"
                >
                  <feImage href={map} x={REGION.x} y={REGION.y} width={REGION.w} height={REGION.h} preserveAspectRatio="none" result="map" />
                  <feColorMatrix ref={maskMatrixRef} in="map" type="matrix" values={coverMatrix(0)} result="cover" />
                  <feComposite in="SourceGraphic" in2="cover" operator="in" />
                </filter>
              </>
            )}
          </defs>
        </svg>

        <span
          ref={faceRef}
          data-slot="gold-leaf-face"
          className={cn(
            "block text-transparent [filter:var(--gl-relief)]",
            "motion-safe:group-data-[state=unlaid]/gold-leaf:[filter:var(--gl-lay)] motion-safe:group-data-[state=laying]/gold-leaf:[filter:var(--gl-lay)]"
          )}
          style={{
            ...textClip,
            padding: pad,
            margin: "-0.15em -0.1em",
            backgroundImage: `${leaf.face}, ${env}`,
            backgroundSize: `${tile}, 100% 1lh`,
            backgroundPosition: "0 0, 0 0.15em",
            backgroundOrigin: "border-box",
            maskImage: leaf.holes,
            WebkitMaskImage: leaf.holes,
            maskSize: tile,
            WebkitMaskSize: tile,
          }}
        >
          {children}
        </span>

        {/* The highlight: a copy of the text on its own layer, so moving it never re-runs the relief filter. */}
        <span
          ref={glintRef}
          aria-hidden
          inert
          data-slot="gold-leaf-glint"
          className={cn(
            "pointer-events-none absolute text-transparent select-none",
            "motion-safe:group-data-[state=unlaid]/gold-leaf:[filter:var(--gl-mask)] motion-safe:group-data-[state=laying]/gold-leaf:[filter:var(--gl-mask)]"
          )}
          style={{
            ...textClip,
            inset: "-0.15em -0.1em",
            padding: pad,
            backgroundImage: glint,
            backgroundOrigin: "border-box",
            maskImage: leaf.facets,
            WebkitMaskImage: leaf.facets,
            maskSize: tile,
            WebkitMaskSize: tile,
            mixBlendMode: "screen",
            opacity: `calc(var(--gl-e, ${REST.e}) * ${clamp01(sheen)})`,
            willChange: "opacity",
          }}
        >
          {children}
        </span>
      </span>
    </Comp>
  )
}
