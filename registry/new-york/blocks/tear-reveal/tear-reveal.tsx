"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type TearDirection = "down" | "across" | "corner"

type Pt = { x: number; y: number }
type Sample = Pt & { nx: number; ny: number; s: number }

/** The sheet at rest: a rectangle with a small V notch cut where the tear starts. */
const REST: Record<TearDirection, string> = {
  down: "polygon(0 0, calc(50% - 7px) 0, 50% 9px, calc(50% + 7px) 0, 100% 0, 100% 100%, 0 100%)",
  across: "polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 calc(50% + 7px), 9px 50%, 0 calc(50% - 7px))",
  corner: "polygon(0 0, calc(100% - 16px) 0, calc(100% - 13px) 13px, 100% 16px, 100% 100%, 0 100%)",
}

const HANDLE: Record<TearDirection, string> = {
  down: "left-1/2 top-0 h-12 w-28 -translate-x-1/2",
  across: "left-0 top-1/2 h-28 w-12 -translate-y-1/2",
  corner: "right-0 top-0 size-16",
}

const GUIDE: Record<TearDirection, string> = {
  down: "left-1/2 top-3 h-[26%] border-l [mask-image:linear-gradient(to_bottom,#000,transparent)]",
  across: "left-3 top-1/2 w-[26%] border-t [mask-image:linear-gradient(to_right,#000,transparent)]",
  corner:
    "right-[13px] top-[13px] w-[min(34%,110px)] origin-right -rotate-45 border-t [mask-image:linear-gradient(to_left,#000,transparent)]",
}

/** Half the crack width at its mouth, in px. */
const MAX_GAP = 12
const GRAVITY = 2600
const FALL_MS = 900

/** Paper tooth: dark and light specks on transparent, so it needs no blend mode. */
const PAPER_TOOTH = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'>" +
    "<filter id='p' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>" +
    "<feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' seed='4' stitchTiles='stitch' result='t'/>" +
    "<feColorMatrix in='t' type='matrix' values='0 0 0 0 0.2 0 0 0 0 0.16 0 0 0 0 0.1 -2 0 0 0 1' result='d'/>" +
    "<feColorMatrix in='t' type='matrix' values='0 0 0 0 1 0 0 0 0 0.99 0 0 0 0 0.95 2 0 0 0 -1' result='l'/>" +
    "<feMerge><feMergeNode in='d'/><feMergeNode in='l'/></feMerge>" +
    "</filter><rect width='100%' height='100%' filter='url(#p)'/></svg>"
)}")`

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const at = (u: number, a: number, b: number) => ((1 - 3 * b + 3 * a) * u + (3 * b - 6 * a)) * u * u + 3 * a * u
  return (t: number) => {
    if (t <= 0) return 0
    if (t >= 1) return 1
    let lo = 0
    let hi = 1
    let u = t
    for (let i = 0; i < 20; i++) {
      u = (lo + hi) / 2
      if (at(u, x1, x2) < t) lo = u
      else hi = u
    }
    return at(u, y1, y2)
  }
}

const EASE_OUT = cubicBezier(0.23, 1, 0.32, 1)
const EASE_IN_OUT = cubicBezier(0.77, 0, 0.175, 1)

function hash(i: number, seed: number) {
  let h = Math.imul(i + 374761393, 668265263) ^ Math.imul(seed + 1, 2246822519)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return ((h >>> 0) / 4294967295) * 2 - 1
}

/** Smooth 1D value noise in -1 to 1. Keyed by arc length, so a growing tear never reshuffles its edge. */
function noise(x: number, seed: number) {
  const i = Math.floor(x)
  const f = x - i
  const u = f * f * (3 - 2 * f)
  return hash(i, seed) * (1 - u) + hash(i + 1, seed) * u
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Dark ink on light paper, light ink on dark paper. */
function inkFor(paper: string) {
  const hex = paper.trim().replace(/^#/, "")
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex.slice(0, 6)
  const n = Number.parseInt(full, 16)
  if (full.length !== 6 || Number.isNaN(n)) return "#241d17"
  const lum = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255
  return lum > 0.55 ? "#241d17" : "#f4f1ea"
}

interface Geo {
  W: number
  H: number
  P: number
  /** Notch tip, where every tear starts. */
  S: Pt
  /** Direction the tear runs. */
  d: Pt
  /** Perimeter positions of the notch corners on the A and B side. */
  tA: number
  tB: number
  /** Distance from the notch to the far edge along `d`. */
  reach: number
}

function rayLength({ W, H }: Geo, p: Pt, d: Pt) {
  let t = Infinity
  if (d.x > 1e-6) t = Math.min(t, (W - p.x) / d.x)
  if (d.x < -1e-6) t = Math.min(t, -p.x / d.x)
  if (d.y > 1e-6) t = Math.min(t, (H - p.y) / d.y)
  if (d.y < -1e-6) t = Math.min(t, -p.y / d.y)
  return Number.isFinite(t) ? Math.max(0, t) : 0
}

function makeGeo(direction: TearDirection, W: number, H: number): Geo {
  let S: Pt
  let d: Pt
  let tA: number
  let tB: number
  if (direction === "across") {
    const t = 2 * W + 1.5 * H
    S = { x: 9, y: H / 2 }
    d = { x: 1, y: 0 }
    tA = t - 7
    tB = t + 7
  } else if (direction === "corner") {
    const len = Math.hypot(W, H)
    S = { x: W - 13, y: 13 }
    d = { x: -W / len, y: H / len }
    tA = W - 16
    tB = W + 16
  } else {
    S = { x: W / 2, y: 9 }
    d = { x: 0, y: 1 }
    tA = W / 2 - 7
    tB = W / 2 + 7
  }
  const geo: Geo = { W, H, P: 2 * (W + H), S, d, tA, tB, reach: 0 }
  geo.reach = rayLength(geo, S, d)
  return geo
}

/** Perimeter position (clockwise from the top-left corner) to a point. */
function pointAt({ W, H, P }: Geo, t: number): Pt {
  const u = ((t % P) + P) % P
  if (u <= W) return { x: u, y: 0 }
  if (u <= W + H) return { x: W, y: u - W }
  if (u <= 2 * W + H) return { x: W - (u - W - H), y: H }
  return { x: 0, y: H - (u - 2 * W - H) }
}

function perimeterOf({ W, H }: Geo, p: Pt) {
  const m = Math.min(p.y, W - p.x, H - p.y, p.x)
  if (m === p.y) return clamp(p.x, 0, W)
  if (m === W - p.x) return W + clamp(p.y, 0, H)
  if (m === H - p.y) return W + H + (W - clamp(p.x, 0, W))
  return 2 * W + H + (H - clamp(p.y, 0, H))
}

/** The sheet's outline between two perimeter positions, corners included. */
function walk(geo: Geo, from: number, to: number, clockwise: boolean): Pt[] {
  const { W, H, P } = geo
  const along = (t: number) => (clockwise ? (((t - from) % P) + P) % P : (((from - t) % P) + P) % P)
  const span = along(to)
  const out = [0, W, W + H, 2 * W + H]
    .filter((c) => along(c) > 0.01 && along(c) < span)
    .sort((a, b) => along(a) - along(b))
    .map((c) => pointAt(geo, c))
  out.push(pointAt(geo, to))
  return out
}

function polyLength(pts: Pt[]) {
  let len = 0
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
  return len
}

/** Resamples the tear path every `step` px, after one pass of corner cutting so pointer jitter reads as paper, not polyline. */
function sampleEdge(plan: Pt[], step: number) {
  let path = plan
  if (plan.length > 2) {
    path = [plan[0]]
    for (let i = 0; i < plan.length - 1; i++) {
      const a = plan[i]
      const b = plan[i + 1]
      if (i > 0) path.push({ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 })
      if (i < plan.length - 2) path.push({ x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 })
    }
    path.push(plan[plan.length - 1])
  }
  const samples: Sample[] = []
  let s0 = 0
  let nx = 0
  let ny = 0
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i]
    const b = path[i + 1]
    const len = Math.hypot(b.x - a.x, b.y - a.y)
    if (len < 1e-3) continue
    const tx = (b.x - a.x) / len
    const ty = (b.y - a.y) / len
    nx = -ty
    ny = tx
    for (let s = Math.ceil(s0 / step) * step; s < s0 + len; s += step) {
      const k = s - s0
      samples.push({ x: a.x + tx * k, y: a.y + ty * k, nx, ny, s })
    }
    s0 += len
  }
  const end = path[path.length - 1]
  samples.push({ x: end.x, y: end.y, nx, ny, s: s0 })
  return { samples, total: s0 }
}

/** Jagged offset of the torn edge, by arc length. Faded in from the notch so the tear starts at its tip. */
function jag(s: number, seed: number) {
  const k = Math.min(1, s / 14)
  return k * (3.6 * noise(s / 38, seed) + 1.8 * noise(s / 11, seed + 7) + 1.1 * noise(s / 2.6, seed + 13))
}

const xy = (x: number, y: number) => `${x.toFixed(1)}px ${y.toFixed(1)}px`
const polygon = (edge: string[], rest: Pt[]) => `polygon(${edge.concat(rest.map((p) => xy(p.x, p.y))).join(",")})`

/**
 * Clip paths for both halves. Side A is to the right of the walking direction, side B to the left. Each half has
 * a face, a lighter core showing past the face as the fibrous rim, a soft shade cast into the crack, and a darker
 * band where the torn edge curls up.
 */
function shapes(geo: Geo, samples: Sample[], torn: number, gapK: number, seed: number) {
  const G = gapK * Math.min(MAX_GAP, 1.5 + torn * 0.05)
  const face: [string[], string[]] = [[], []]
  const core: [string[], string[]] = [[], []]
  const shade: [string[], string[]] = [[], []]
  const curl: [string[], string[]] = [[], []]
  const curlIn: [string[], string[]] = [[], []]
  let cx = [0, 0]
  let cy = [0, 0]

  for (const p of samples) {
    const j = jag(p.s, seed)
    const x = p.x + p.nx * j
    const y = p.y + p.ny * j
    const live = p.s < torn
    // Rims and shade thin out over the last few px, so the crack ends in a sharp point.
    const fade = live ? Math.min(1, (torn - p.s) / 14) : 0
    const g = live ? G * Math.pow(1 - p.s / torn, 0.8) : 0
    // Real tears are lopsided: one side keeps a wide white bevel, the other barely any.
    const rim = [
      fade * Math.max(0.3, 1.1 + 0.9 * noise(p.s / 7, seed + 21) + 1.1 * noise(p.s / 1.3, seed + 22)),
      fade * Math.max(0.6, 2.2 + 1.4 * noise(p.s / 9, seed + 31) + 1.5 * noise(p.s / 1.2, seed + 32)),
    ]
    for (let k = 0; k < 2; k++) {
      const side = k === 0 ? 1 : -1
      const fx = x + side * p.nx * g
      const fy = y + side * p.ny * g
      const out = rim[k]
      const cast = out + fade * (2.5 + g * 0.9)
      face[k].push(xy(fx, fy))
      core[k].push(xy(fx - side * p.nx * out, fy - side * p.ny * out))
      shade[k].push(xy(fx - side * p.nx * cast, fy - side * p.ny * cast))
      if (live) {
        const c = Math.min(3.5, g * 0.25 + 0.6) * fade * (0.6 + 0.4 * noise(p.s / 5, seed + 41))
        curl[k].push(xy(fx, fy))
        curlIn[k].push(xy(fx + side * p.nx * c, fy + side * p.ny * c))
      }
      cx[k] += fx
      cy[k] += fy
    }
  }

  const end = samples[samples.length - 1]
  const tX = perimeterOf(geo, end)
  const wa = walk(geo, tX, geo.tA, true)
  const wb = walk(geo, tX, geo.tB, false)
  const walls = [wa, wb]
  const n = samples.length
  cx = cx.map((v, k) => (v + walls[k].reduce((a, p) => a + p.x * 6, 0)) / (n + walls[k].length * 6))
  cy = cy.map((v, k) => (v + walls[k].reduce((a, p) => a + p.y * 6, 0)) / (n + walls[k].length * 6))

  const band = (k: number) =>
    curl[k].length > 1 ? `polygon(${curl[k].concat(curlIn[k].slice().reverse()).join(",")})` : "inset(50%)"

  return {
    faceA: polygon(face[0], wa),
    faceB: polygon(face[1], wb),
    coreA: polygon(core[0], wa),
    coreB: polygon(core[1], wb),
    shadeA: polygon(shade[0], wa),
    shadeB: polygon(shade[1], wb),
    curlA: band(0),
    curlB: band(1),
    centre: [
      { x: cx[0], y: cy[0] },
      { x: cx[1], y: cy[1] },
    ],
  }
}

const LAYERS = ["shadeA", "shadeB", "coreA", "coreB", "faceA", "curlA", "faceB", "curlB"] as const
type LayerName = (typeof LAYERS)[number]
type Layers = Record<LayerName, [outer: HTMLElement, inner: HTMLElement]>
const PIECES: LayerName[][] = [
  ["shadeA", "coreA", "faceA", "curlA"],
  ["shadeB", "coreB", "faceB", "curlB"],
]

interface EngineOptions {
  direction: TearDirection
  seed: number
  threshold: number
  onCommit: (byUser: boolean) => void
  onDone: () => void
}

interface Tween {
  t0: number
  dur: number
  ease: (t: number) => number
  torn: [number, number]
  gap: [number, number]
  done: () => void
}

interface Piece {
  x: number
  y: number
  r: number
  rx: number
  ry: number
  vx: number
  vy: number
  vr: number
  vrx: number
  vry: number
}

/**
 * Everything that moves per frame lives here, outside React. Pointer events and the rAF loop write clip paths and
 * transforms straight to the layers; React only mounts and unmounts the cover.
 */
function createTearEngine(getCover: () => HTMLDivElement | null, getOptions: () => EngineOptions) {
  const s = {
    mode: "rest" as "rest" | "drag" | "tween" | "fall" | "fade",
    geo: null as Geo | null,
    layers: null as Layers | null,
    visible: false,
    pts: [] as Pt[],
    live: null as Pt | null,
    samples: [] as Sample[],
    total: 0,
    torn: 0,
    gapK: 1,
    tease: 0,
    tween: null as Tween | null,
    pieces: [] as Piece[],
    fallStart: 0,
    pointer: null as number | null,
    moved: 0,
    hist: [] as { t: number; x: number; y: number }[],
    raf: 0,
    last: 0,
    timer: 0,
  }

  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

  function measure() {
    const cover = getCover()
    if (!cover) return false
    const W = cover.offsetWidth
    const H = cover.offsetHeight
    if (!W || !H) return false
    const layers = {} as Layers
    for (const name of LAYERS) {
      const outer = cover.querySelector<HTMLElement>(`[data-tear="${name}"]`)
      const inner = outer?.firstElementChild as HTMLElement | null
      if (!outer || !inner) return false
      layers[name] = [outer, inner]
    }
    s.layers = layers
    s.geo = makeGeo(getOptions().direction, W, H)
    return true
  }

  function toLocal(e: PointerEvent): Pt {
    const cover = getCover()!
    const r = cover.getBoundingClientRect()
    // Layout px, not screen px, in case an ancestor is scaled.
    return {
      x: ((e.clientX - r.left) * cover.offsetWidth) / (r.width || 1),
      y: ((e.clientY - r.top) * cover.offsetHeight) / (r.height || 1),
    }
  }

  function setPlan(plan: Pt[]) {
    const { samples, total } = sampleEdge(plan, 2)
    s.samples = samples
    s.total = total
  }

  function straightPlan() {
    const { S, d } = s.geo!
    const len = rayLength(s.geo!, S, d)
    setPlan([S, { x: S.x + d.x * len, y: S.y + d.y * len }])
  }

  function show(on: boolean) {
    if (!s.layers || s.visible === on) return
    s.visible = on
    for (const name of LAYERS) {
      if (name !== "faceA") s.layers[name][0].style.visibility = on ? "visible" : "hidden"
    }
    if (!on) s.layers.faceA[1].style.clipPath = REST[getOptions().direction]
  }

  function paint() {
    if (!s.layers || !s.geo || !s.samples.length) return
    const sh = shapes(s.geo, s.samples, s.torn, s.gapK, getOptions().seed)
    for (const name of LAYERS) s.layers[name][1].style.clipPath = sh[name]
    return sh
  }

  function frame(now: number) {
    s.raf = 0
    const dt = Math.min(0.034, Math.max(0, (now - s.last) / 1000))
    s.last = now
    let again = false

    if (s.mode === "rest") {
      s.torn += (s.tease - s.torn) * (1 - Math.exp(-dt * 16))
      if (Math.abs(s.tease - s.torn) < 0.15) s.torn = s.tease
      if (s.torn <= 0.01) {
        s.torn = 0
        show(false)
      } else {
        show(true)
        paint()
      }
      again = s.torn !== s.tease
    } else if (s.mode === "drag") {
      paint()
    } else if (s.mode === "tween" && s.tween) {
      const tw = s.tween
      const t = clamp((now - tw.t0) / tw.dur, 0, 1)
      const e = tw.ease(t)
      s.torn = tw.torn[0] + (tw.torn[1] - tw.torn[0]) * e
      s.gapK = tw.gap[0] + (tw.gap[1] - tw.gap[0]) * e
      paint()
      again = true
      if (t >= 1) {
        s.tween = null
        // Whatever comes next (fall, fade, rest) schedules its own frames.
        again = false
        tw.done()
      }
    } else if (s.mode === "fall") {
      const t = (now - s.fallStart) / FALL_MS
      const drag = Math.exp(-dt * 0.8)
      const opacity = 1 - clamp((t - 0.3) / 0.7, 0, 1) ** 2
      const scale = 1 + 0.03 * Math.sin(Math.min(1, t * 3) * (Math.PI / 2)) - 0.06 * t
      s.pieces.forEach((p, k) => {
        p.vy += GRAVITY * dt
        p.vx *= drag
        p.vy *= drag
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.r += p.vr * dt
        p.rx += p.vrx * dt
        p.ry += p.vry * dt
        const transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) rotate(${p.r.toFixed(2)}deg) rotateX(${p.rx.toFixed(2)}deg) rotateY(${p.ry.toFixed(2)}deg) scale(${scale.toFixed(4)})`
        for (const name of PIECES[k]) {
          const el = s.layers![name][0]
          el.style.transform = transform
          // The contact shadow belongs to the surface, not the piece. It goes first.
          el.style.opacity = String(name.startsWith("shade") ? Math.max(0, 1 - t * 8) : opacity)
        }
      })
      again = t < 1
      if (!again) finish()
    } else if (s.mode === "fade") {
      const t = clamp((now - s.fallStart) / 200, 0, 1)
      const cover = getCover()
      if (cover) cover.style.opacity = String(1 - EASE_OUT(t))
      again = t < 1
      if (!again) finish()
    }

    if (again) s.raf = requestAnimationFrame(frame)
  }

  function kick() {
    if (s.raf) return
    s.last = performance.now()
    s.raf = requestAnimationFrame(frame)
  }

  function finish() {
    s.mode = "rest"
    s.torn = 0
    s.tease = 0
    s.visible = false
    getOptions().onDone()
  }

  function track(p: Pt) {
    const geo = s.geo!
    const { S, d, W, H, reach } = geo
    let q = { x: clamp(p.x, 3, W - 3), y: clamp(p.y, 3, H - 3) }
    let a = (q.x - S.x) * d.x + (q.y - S.y) * d.y
    // Keep the tip between the notch and the far edge; it never runs backwards past the path behind it.
    const shift = a < 0 ? -a : a > reach - 3 ? reach - 3 - a : 0
    if (shift) {
      q = { x: clamp(q.x + d.x * shift, 3, W - 3), y: clamp(q.y + d.y * shift, 3, H - 3) }
      a = (q.x - S.x) * d.x + (q.y - S.y) * d.y
    }
    const along = (v: Pt) => (v.x - S.x) * d.x + (v.y - S.y) * d.y
    while (s.pts.length > 1 && along(s.pts[s.pts.length - 1]) >= a - 2) s.pts.pop()
    const last = s.pts[s.pts.length - 1]
    if (Math.hypot(q.x - last.x, q.y - last.y) >= 10 && along(last) < a - 2) s.pts.push(q)
    s.live = q
    const path = s.pts.slice()
    const tail = path[path.length - 1]
    if (Math.hypot(q.x - tail.x, q.y - tail.y) > 0.5) path.push(q)
    s.torn = polyLength(path)
    const ext = rayLength(geo, q, d)
    setPlan(ext > 1 ? [...path, { x: q.x + d.x * ext, y: q.y + d.y * ext }] : path)
  }

  function velocity(): Pt {
    const h = s.hist
    if (h.length < 2) return { x: 0, y: 0 }
    const b = h[h.length - 1]
    const a = h.find((p) => b.t - p.t <= 100) ?? h[0]
    const dt = Math.max(1, b.t - a.t)
    return { x: (b.x - a.x) / dt, y: (b.y - a.y) / dt }
  }

  function springBack() {
    s.mode = "tween"
    s.tween = {
      t0: performance.now(),
      dur: 320,
      ease: EASE_OUT,
      torn: [s.torn, 0],
      gap: [s.gapK, 0],
      done: () => {
        s.mode = "rest"
        s.gapK = 1
        s.tease = 0
        s.torn = 0
        show(false)
      },
    }
    kick()
  }

  function startFall(v: Pt) {
    const { d } = s.geo!
    const sh = paint()
    if (!sh || !s.layers) return finish()
    const cover = getCover()
    if (cover) cover.style.overflow = "visible"
    const rnd = mulberry32(getOptions().seed * 31 + 7)
    const speed = Math.hypot(v.x, v.y)
    const k = speed > 2400 ? 2400 / speed : 1
    s.pieces = [1, -1].map((side, i) => {
      const out = { x: -d.y * side, y: d.x * side }
      const spin = -(d.x * out.y - d.y * out.x)
      const c = sh.centre[i]
      for (const name of PIECES[i]) {
        const el = s.layers![name][0]
        el.style.transformOrigin = `${c.x.toFixed(1)}px ${c.y.toFixed(1)}px`
        // Airborne now, so the face casts a shadow of its own. Set once; only the transform changes per frame.
        if (name.startsWith("face")) el.style.filter = "drop-shadow(0 12px 14px rgb(20 14 10 / 0.22))"
      }
      return {
        x: 0,
        y: 0,
        r: 0,
        rx: 0,
        ry: 0,
        vx: v.x * k * 0.35 + out.x * 190 + (rnd() - 0.5) * 60,
        vy: v.y * k * 0.35 + out.y * 190 - 240 - rnd() * 120,
        vr: spin * (50 + rnd() * 60),
        vrx: side * (40 + rnd() * 60),
        vry: -side * (30 + rnd() * 50),
      }
    })
    s.mode = "fall"
    s.fallStart = performance.now()
    kick()
  }

  function fade() {
    s.mode = "fade"
    s.fallStart = performance.now()
    const cover = getCover()
    if (cover) cover.style.transition = "none"
    kick()
  }

  /** Runs the tear from its tip to the far edge, then drops the halves. */
  function rip(plan: Pt[], from: number, dur: number, ease: (t: number) => number, v: Pt) {
    setPlan(plan)
    s.mode = "tween"
    s.tween = {
      t0: performance.now(),
      dur,
      ease,
      torn: [from, s.total],
      gap: [s.gapK, 1],
      done: () => startFall(v),
    }
    show(true)
    kick()
  }

  function commit(v: Pt) {
    getOptions().onCommit(true)
    if (reduced()) return fade()
    const geo = s.geo!
    const { d } = geo
    const path = s.pts.slice()
    const q = s.live ?? geo.S
    const tail = path[path.length - 1]
    if (Math.hypot(q.x - tail.x, q.y - tail.y) > 0.5) path.push(q)
    // Carry on in the direction the hand was going, bent back toward the far edge.
    let dir = d
    if (path.length > 1) {
      const a = path[path.length - 2]
      const len = Math.hypot(q.x - a.x, q.y - a.y) || 1
      const bx = d.x + ((q.x - a.x) / len) * 0.6
      const by = d.y + ((q.y - a.y) / len) * 0.6
      const bl = Math.hypot(bx, by) || 1
      if ((bx * d.x + by * d.y) / bl > 0.3) dir = { x: bx / bl, y: by / bl }
    }
    const ext = rayLength(geo, q, dir)
    const plan = ext > 1 ? [...path, { x: q.x + dir.x * ext, y: q.y + dir.y * ext }] : path
    const remaining = Math.max(0, polyLength(plan) - s.torn)
    rip(plan, s.torn, clamp(remaining / 2.2, 120, 260), EASE_OUT, { x: v.x * 1000, y: v.y * 1000 })
  }

  /** A short pull at the notch, to show where the tear starts. */
  function nudge() {
    if (reduced()) return
    window.clearTimeout(s.timer)
    const run = () => {
      if (s.mode !== "rest" || !measure()) return
      straightPlan()
      s.tease = 22
      kick()
      s.timer = window.setTimeout(() => {
        if (s.mode !== "rest") return
        s.tease = 0
        kick()
      }, 200)
    }
    if (s.mode === "rest") run()
    else s.timer = window.setTimeout(run, 340)
  }

  return {
    down(e: PointerEvent, handle: HTMLElement) {
      if (s.pointer !== null || (s.mode !== "rest" && !(s.mode === "tween" && s.tween?.torn[1] === 0))) return
      if (!measure()) return
      s.pointer = e.pointerId
      handle.setPointerCapture(e.pointerId)
      s.mode = "drag"
      s.tween = null
      s.gapK = 1
      s.moved = 0
      s.pts = [s.geo!.S]
      const p = toLocal(e)
      s.hist = [{ t: e.timeStamp, ...p }]
      track(p)
      show(true)
      kick()
    },
    move(e: PointerEvent) {
      if (e.pointerId !== s.pointer || s.mode !== "drag") return
      const p = toLocal(e)
      const prev = s.hist[s.hist.length - 1]
      s.moved += Math.hypot(p.x - prev.x, p.y - prev.y)
      s.hist.push({ t: e.timeStamp, ...p })
      if (s.hist.length > 8) s.hist.shift()
      track(p)
      kick()
    },
    up(e: PointerEvent) {
      if (e.pointerId !== s.pointer) return
      s.pointer = null
      if (s.mode !== "drag") return
      const geo = s.geo!
      const q = s.live ?? geo.S
      const progress = ((q.x - geo.S.x) * geo.d.x + (q.y - geo.S.y) * geo.d.y) / (geo.reach || 1)
      const v = velocity()
      // A quick flick tears it even short of the threshold.
      const flick = v.x * geo.d.x + v.y * geo.d.y > 0.55 && progress > 0.12
      if (e.type !== "pointercancel" && (progress >= getOptions().threshold || flick)) commit(v)
      else if (s.moved < 4) {
        springBack()
        nudge()
      } else springBack()
    },
    hover(on: boolean) {
      if (s.mode !== "rest" || reduced()) return
      if (on) {
        if (!measure()) return
        straightPlan()
      }
      s.tease = on ? 12 : 0
      kick()
    },
    nudge,
    /** Keyboard and controlled tears: one automatic pass along a gently wandering line. */
    auto(byUser: boolean) {
      if (s.mode !== "rest" || s.pointer !== null) return
      if (!measure()) {
        getOptions().onCommit(byUser)
        return finish()
      }
      if (byUser) getOptions().onCommit(true)
      if (reduced()) return fade()
      const geo = s.geo!
      const { S, d, reach, W, H } = geo
      const seed = getOptions().seed
      const wobble = Math.min(16, reach * 0.06)
      const plan: Pt[] = []
      for (let a = 0; a < reach - 1; a += 28) {
        const off = a < 20 ? 0 : wobble * noise(a / 90, seed + 51)
        plan.push({ x: clamp(S.x + d.x * a - d.y * off, 3, W - 3), y: clamp(S.y + d.y * a + d.x * off, 3, H - 3) })
      }
      plan.push({ x: S.x + d.x * reach, y: S.y + d.y * reach })
      s.tease = 0
      s.gapK = 1
      rip(plan, s.torn, 560, EASE_IN_OUT, { x: d.x * 500, y: d.y * 500 })
    },
    dispose() {
      cancelAnimationFrame(s.raf)
      window.clearTimeout(s.timer)
      s.raf = 0
    },
  }
}

type TearEngine = ReturnType<typeof createTearEngine>

export interface TearRevealProps extends Omit<React.ComponentProps<"div">, "children"> {
  /**
   * What is printed on the paper: a label, an image, any node. It fills the sheet and inherits an ink colour that
   * reads on `paper`. Omit for blank paper.
   */
  cover?: React.ReactNode
  /** The content under the paper. It sets the size, unless you size the component with className. */
  children?: React.ReactNode
  /**
   * Where the tear starts. "down" runs from a notch in the top edge, "across" from the left edge, "corner" from the
   * top-right corner. Default "down".
   */
  direction?: TearDirection
  /** Paper colour, as hex. The torn rim is a lighter mix of it. Default "#f4f1ea". */
  paper?: string
  /** How far the tear must run before letting go tears it free, 0 to 1. A quick flick also counts. Default 0.4. */
  threshold?: number
  /** Controlled torn state. Set it back to false to put the paper back. */
  torn?: boolean
  /** Initial torn state when uncontrolled. Default false. */
  defaultTorn?: boolean
  /** Called when the paper tears free by drag or keyboard. Not called when `torn` is set from outside. */
  onTear?: () => void
  /** Seed for the jagged edge and the way the halves fall. Default 5. */
  seed?: number
  /** Accessible name for the cover. Default "Tear to reveal". */
  label?: string
}

/**
 * A sheet of paper over some content. Drag from the notch and the paper tears along your path, with a jagged edge
 * and a pale fibrous rim. Let go past the threshold and the halves fall away; let go early and it springs shut.
 * Enter or Space tears it in one pass.
 */
export function TearReveal({
  cover,
  children,
  direction = "down",
  paper = "#f4f1ea",
  threshold = 0.4,
  torn,
  defaultTorn = false,
  onTear,
  seed = 5,
  label = "Tear to reveal",
  className,
  ...props
}: TearRevealProps) {
  const coverRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const engineRef = React.useRef<TearEngine | null>(null)
  const focusAfterRef = React.useRef(false)

  const [inner, setInner] = React.useState(defaultTorn)
  const isTorn = torn ?? inner
  const [shown, setShown] = React.useState(!isTorn)
  const [generation, setGeneration] = React.useState(0)
  const [entering, setEntering] = React.useState(false)
  const [prevTorn, setPrevTorn] = React.useState(isTorn)
  if (prevTorn !== isTorn) {
    setPrevTorn(isTorn)
    if (!isTorn && !shown) {
      setShown(true)
      setEntering(true)
    }
  }

  const optionsRef = React.useRef<EngineOptions & { isTorn: boolean }>(null)
  React.useEffect(() => {
    optionsRef.current = {
      direction,
      seed,
      threshold: clamp(threshold, 0.05, 0.95),
      isTorn,
      onCommit: (byUser) => {
        if (!byUser) return
        setInner(true)
        onTear?.()
      },
      onDone: () => {
        const el = coverRef.current
        focusAfterRef.current = !!el && el.contains(document.activeElement)
        if (optionsRef.current?.isTorn) setShown(false)
        else {
          // Controlled and the parent kept it closed: put a fresh sheet back.
          setGeneration((g) => g + 1)
          setEntering(true)
        }
      },
    }
  })

  React.useEffect(() => {
    const engine = createTearEngine(
      () => coverRef.current,
      () => optionsRef.current!
    )
    engineRef.current = engine
    return () => {
      engine.dispose()
      engineRef.current = null
    }
  }, [])

  // `torn` flipped to true from outside: tear it the same way the keyboard does.
  React.useEffect(() => {
    if (isTorn && shown) engineRef.current?.auto(false)
  }, [isTorn, shown])

  React.useEffect(() => {
    if (shown || !focusAfterRef.current) return
    focusAfterRef.current = false
    contentRef.current?.focus({ preventScroll: true })
  }, [shown])

  const ink = inkFor(paper)
  const face = (
    <>
      {cover}
      <div
        className="pointer-events-none absolute inset-0 forced-colors:hidden"
        style={{ backgroundImage: PAPER_TOOTH, backgroundSize: "320px 320px", opacity: 0.4 }}
      />
      <span
        className={cn("pointer-events-none absolute border-dashed", GUIDE[direction])}
        style={{ borderColor: ink, opacity: 0.4 }}
      />
    </>
  )
  const faceStyle: React.CSSProperties = { backgroundColor: paper, color: ink }
  const layerStyle: Record<LayerName, React.CSSProperties> = {
    shadeA: { backgroundColor: "rgb(20 14 10 / 0.42)" },
    shadeB: { backgroundColor: "rgb(20 14 10 / 0.42)" },
    coreA: { backgroundColor: `color-mix(in oklab, ${paper} 22%, white)` },
    coreB: { backgroundColor: `color-mix(in oklab, ${paper} 22%, white)` },
    faceA: { ...faceStyle, clipPath: REST[direction] },
    curlA: { backgroundColor: `color-mix(in oklab, ${paper} 88%, #241d17)` },
    faceB: faceStyle,
    curlB: { backgroundColor: `color-mix(in oklab, ${paper} 88%, #241d17)` },
  }

  return (
    <div
      data-slot="tear-reveal"
      data-state={shown ? "covered" : "torn"}
      className={cn("relative isolate", className)}
      {...props}
    >
      <div ref={contentRef} tabIndex={-1} inert={shown} className="size-full rounded-[inherit] outline-none">
        {children}
      </div>
      {shown && (
        <div
          key={generation}
          ref={coverRef}
          role="button"
          tabIndex={0}
          aria-label={label}
          data-slot="tear-reveal-cover"
          className={cn(
            "absolute inset-0 z-10 overflow-hidden rounded-[inherit] outline-none select-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            entering && "transition-opacity duration-200 ease-out starting:opacity-0"
          )}
          style={{ perspective: 900 }}
          onKeyDown={(e) => {
            if (e.key !== "Enter" && e.key !== " ") return
            e.preventDefault()
            if (!e.repeat) engineRef.current?.auto(true)
          }}
          onClick={(e) => {
            if (!(e.target as HTMLElement).closest("[data-tear-handle]")) engineRef.current?.nudge()
          }}
          onFocus={(e) => {
            if (e.target === e.currentTarget && e.currentTarget.matches(":focus-visible")) engineRef.current?.hover(true)
          }}
          onBlur={() => engineRef.current?.hover(false)}
        >
          {LAYERS.map((name) => (
            <div
              key={name}
              data-tear={name}
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit]"
              style={{
                visibility: name === "faceA" ? undefined : "hidden",
                filter: name.startsWith("shade") ? "blur(3px)" : undefined,
              }}
            >
              <div className="absolute inset-0 overflow-hidden rounded-[inherit]" style={layerStyle[name]}>
                {name.startsWith("face") ? face : null}
              </div>
            </div>
          ))}
          <div
            data-tear-handle
            aria-hidden
            className={cn("absolute z-10 cursor-grab touch-none active:cursor-grabbing", HANDLE[direction])}
            onPointerDown={(e) => {
              if (e.button !== 0) return
              e.preventDefault()
              engineRef.current?.down(e.nativeEvent, e.currentTarget)
            }}
            onPointerMove={(e) => engineRef.current?.move(e.nativeEvent)}
            onPointerUp={(e) => engineRef.current?.up(e.nativeEvent)}
            onPointerCancel={(e) => engineRef.current?.up(e.nativeEvent)}
            onPointerEnter={(e) => e.pointerType === "mouse" && engineRef.current?.hover(true)}
            onPointerLeave={(e) => e.pointerType === "mouse" && engineRef.current?.hover(false)}
          />
        </div>
      )}
    </div>
  )
}
