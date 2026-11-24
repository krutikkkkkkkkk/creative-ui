"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type Pt = { x: number; y: number }
type Spring = readonly [stiffness: number, damping: number]

/** Silhouette grid cell, in px. */
const CELL = 2
/** How far the hidden layers reach past the sticker, for its border and shadows, in px. */
const PAD = 40
/** How much a lifted sticker grows. */
const LIFT_SCALE = 0.05
const DIAGONALS: Pt[] = [
  { x: -Math.SQRT1_2, y: -Math.SQRT1_2 },
  { x: Math.SQRT1_2, y: -Math.SQRT1_2 },
  { x: Math.SQRT1_2, y: Math.SQRT1_2 },
  { x: -Math.SQRT1_2, y: Math.SQRT1_2 },
]
/** Critically damped where a fold must never swing past flat, bouncy where it should land with a slap. */
const SPRINGS = {
  hover: [300, 35],
  back: [520, 46],
  unfold: [380, 39],
  follow: [900, 56],
  lift: [320, 30],
  slap: [700, 22],
  tilt: [240, 20],
} satisfies Record<string, Spring>

/** The sticker touched last sits on top, like the real thing. */
let topLayer = 10

const add = (a: Pt, b: Pt): Pt => ({ x: a.x + b.x, y: a.y + b.y })
const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y })
const mul = (a: Pt, k: number): Pt => ({ x: a.x * k, y: a.y * k })
const dot = (a: Pt, b: Pt) => a.x * b.x + a.y * b.y
const len = (a: Pt) => Math.hypot(a.x, a.y)
const unit = (a: Pt): Pt => {
  const n = len(a)
  return n ? { x: a.x / n, y: a.y / n } : { x: 0, y: 1 }
}
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** Keeps the half of a polygon on one side of the line through `m` with normal `u`. */
function clipHalf(pts: Pt[], m: Pt, u: Pt, sign: 1 | -1) {
  const out: Pt[] = []
  const side = (p: Pt) => sign * ((p.x - m.x) * u.x + (p.y - m.y) * u.y)
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]
    const b = pts[(i + 1) % pts.length]
    const fa = side(a)
    const fb = side(b)
    if (fa >= 0) out.push(a)
    if (fa >= 0 !== fb >= 0) {
      const t = fa / (fa - fb)
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
    }
  }
  return out
}

function polygon(pts: Pt[], off: number) {
  if (pts.length < 3) return "polygon(0 0, 0 0, 0 0)"
  return `polygon(${pts.map((p) => `${(p.x + off).toFixed(2)}px ${(p.y + off).toFixed(2)}px`).join(", ")})`
}

/* ------------------------------------------------------------------ */
/* Silhouette: where the sticker actually is, so peels start at its    */
/* real edge instead of the empty corners of its box.                 */
/* ------------------------------------------------------------------ */

interface Shape {
  /** Offset of the grid from the sticker's top-left, in px. */
  pad: number
  cols: number
  rows: number
  mask: Uint8Array
  total: number
  center: Pt
  /** The sticker's furthest points along each diagonal, where hover peels start. */
  corners: Pt[]
}

type Op =
  | { kind: "box"; x: number; y: number; w: number; h: number; r: number }
  | { kind: "img"; el: HTMLImageElement; fit: string; x: number; y: number; w: number; h: number }
  | { kind: "svg"; url: string; x: number; y: number; w: number; h: number }

const SVG_PROPS = [
  "fill",
  "fill-opacity",
  "fill-rule",
  "stroke",
  "stroke-width",
  "stroke-opacity",
  "stroke-linecap",
  "stroke-linejoin",
  "opacity",
  "display",
  "visibility",
]

/** An inline SVG as a standalone image, with its CSS-driven paint baked in. */
function svgUrl(svg: SVGSVGElement) {
  const clone = svg.cloneNode(true) as SVGSVGElement
  const from = [svg, ...svg.querySelectorAll("*")]
  const to = [clone, ...clone.querySelectorAll("*")]
  from.forEach((node, i) => {
    const cs = getComputedStyle(node)
    const target = to[i] as SVGElement
    for (const p of SVG_PROPS) target.style.setProperty(p, cs.getPropertyValue(p))
  })
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg")
  clone.setAttribute("width", String(svg.clientWidth))
  clone.setAttribute("height", String(svg.clientHeight))
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`
}

const CLEAR = /^transparent$|rgba\(.*,\s*0\)$|\/\s*0\)$/

/** Lists what paints inside the sticker: images, inline SVGs, backgrounds and text. Call untransformed. */
function measure(front: HTMLElement, k: number) {
  const origin = front.getBoundingClientRect()
  const box = (r: DOMRect) => ({
    x: (r.left - origin.left) / k,
    y: (r.top - origin.top) / k,
    w: r.width / k,
    h: r.height / k,
  })
  const ops: Op[] = []
  const walk = (el: Element) => {
    if (el instanceof SVGSVGElement) {
      ops.push({ kind: "svg", url: svgUrl(el), ...box(el.getBoundingClientRect()) })
      return
    }
    if (!(el instanceof HTMLElement)) return
    const cs = getComputedStyle(el)
    if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") return
    if (el instanceof HTMLImageElement) {
      ops.push({ kind: "img", el, fit: cs.objectFit, ...box(el.getBoundingClientRect()) })
      return
    }
    if (cs.backgroundImage !== "none" || !CLEAR.test(cs.backgroundColor)) {
      ops.push({ kind: "box", r: Number.parseFloat(cs.borderTopLeftRadius) || 0, ...box(el.getBoundingClientRect()) })
    }
    for (const node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        const range = document.createRange()
        range.selectNodeContents(node)
        for (const r of range.getClientRects()) ops.push({ kind: "box", r: 0, ...box(r) })
      } else if (node instanceof Element) walk(node)
    }
  }
  for (const child of front.children) walk(child)
  return ops
}

function fitBox(el: HTMLImageElement, fit: string, x: number, y: number, w: number, h: number) {
  const nw = el.naturalWidth
  const nh = el.naturalHeight
  if (fit === "fill" || !nw || !nh) return { x, y, w, h }
  let k = 1
  if (fit === "contain") k = Math.min(w / nw, h / nh)
  else if (fit === "cover") k = Math.max(w / nw, h / nh)
  else if (fit === "scale-down") k = Math.min(1, w / nw, h / nh)
  return { x: x + (w - nw * k) / 2, y: y + (h - nh * k) / 2, w: nw * k, h: nh * k }
}

async function rasterize(ops: Op[], cols: number, rows: number, pad: number): Promise<Uint8Array | null> {
  if (!ops.length) return null
  const canvas = document.createElement("canvas")
  canvas.width = cols
  canvas.height = rows
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) return null
  ctx.setTransform(1 / CELL, 0, 0, 1 / CELL, pad / CELL, pad / CELL)
  const rect = (op: Op, r = 0) => {
    ctx.beginPath()
    ctx.roundRect(op.x, op.y, op.w, op.h, Math.min(r, op.w / 2, op.h / 2))
    ctx.fill()
  }
  for (const op of ops) {
    if (op.kind === "box") rect(op, op.r)
    else if (op.kind === "img") {
      await op.el.decode().catch(() => {})
      if (!op.el.naturalWidth) {
        rect(op)
        continue
      }
      const f = fitBox(op.el, op.fit, op.x, op.y, op.w, op.h)
      ctx.save()
      ctx.beginPath()
      ctx.rect(op.x, op.y, op.w, op.h)
      ctx.clip()
      ctx.drawImage(op.el, f.x, f.y, f.w, f.h)
      ctx.restore()
    } else {
      const img = new Image()
      img.src = op.url
      try {
        await img.decode()
        ctx.drawImage(img, op.x, op.y, op.w, op.h)
      } catch {
        rect(op)
      }
    }
  }
  let data: Uint8ClampedArray
  try {
    data = ctx.getImageData(0, 0, cols, rows).data
  } catch {
    // A cross-origin image tainted the canvas: fall back to the boxes things sit in.
    return rasterize(
      ops.map((op) => (op.kind === "box" ? op : { kind: "box", r: 0, x: op.x, y: op.y, w: op.w, h: op.h })),
      cols,
      rows,
      pad
    )
  }
  const solid = new Uint8Array(cols * rows)
  for (let i = 0; i < solid.length; i++) solid[i] = data[i * 4 + 3] > 64 ? 1 : 0
  return solid
}

function boxSolid(cols: number, rows: number, pad: number, w: number, h: number) {
  const solid = new Uint8Array(cols * rows)
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = (col + 0.5) * CELL - pad
      const y = (row + 0.5) * CELL - pad
      if (x >= 0 && x <= w && y >= 0 && y <= h) solid[row * cols + col] = 1
    }
  }
  return solid
}

/** Grows the painted cells by the die-cut border, then finds the centre and the corners. */
function shapeFrom(solid: Uint8Array, cols: number, rows: number, pad: number, grow: number): Shape | null {
  const r = Math.round(grow / CELL)
  let mask = solid
  if (r > 0) {
    mask = new Uint8Array(cols * rows)
    const kernel: number[] = []
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (dx * dx + dy * dy <= r * r + r) kernel.push(dx, dy)
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!solid[row * cols + col]) continue
        for (let i = 0; i < kernel.length; i += 2) {
          const c = col + kernel[i]
          const w = row + kernel[i + 1]
          if (c >= 0 && c < cols && w >= 0 && w < rows) mask[w * cols + c] = 1
        }
      }
    }
  }
  let total = 0
  let sx = 0
  let sy = 0
  const best = DIAGONALS.map(() => ({ score: -Infinity, at: { x: 0, y: 0 } }))
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!mask[row * cols + col]) continue
      const p = { x: (col + 0.5) * CELL - pad, y: (row + 0.5) * CELL - pad }
      total++
      sx += p.x
      sy += p.y
      DIAGONALS.forEach((d, i) => {
        const score = dot(p, d)
        if (score > best[i].score) best[i] = { score, at: p }
      })
    }
  }
  if (!total) return null
  return { pad, cols, rows, mask, total, center: { x: sx / total, y: sy / total }, corners: best.map((b) => b.at) }
}

/* ------------------------------------------------------------------ */
/* Engine: everything per frame lives here, outside React.             */
/* ------------------------------------------------------------------ */

interface Options {
  border: number
  threshold: number
  movable: boolean
  bounded: boolean
  hoverPeel: boolean
  rotate: number
  haptics: boolean
  onPeel: () => void
  onStick: (offset: Pt) => void
  announce: (message: string) => void
}

interface Els {
  root: HTMLDivElement
  mover: HTMLDivElement
  front: HTMLDivElement
  liftShadow: HTMLDivElement
  flapShadow: HTMLDivElement
  back: HTMLDivElement
  shade: HTMLDivElement
}

function createSticker(el: Els, offset: Pt, get: () => Options) {
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const s = {
    w: 0,
    h: 0,
    shape: null as Shape | null,
    build: 0,
    alive: true,
    mode: "idle" as "idle" | "peel" | "carry",
    /** Lifted from the keyboard. */
    held: false,
    heldFrom: { x: 0, y: 0 },
    pointer: null as number | null,
    rect: null as DOMRect | null,
    bounds: null as { x0: number; x1: number; y0: number; y1: number } | null,
    down: { x: 0, y: 0 },
    downRoot: { x: 0, y: 0 },
    v0: { x: 0, y: 0 },
    /** Where the peel starts, on the sticker's edge. */
    anchor: null as Pt | null,
    /** Unit vector from the anchor into the sticker. */
    inward: { x: 0, y: 1 },
    /** The fold: from the anchor to where the anchor has been folded over to. */
    v: { x: 0, y: 0 },
    vv: { x: 0, y: 0 },
    vt: { x: 0, y: 0 },
    vSpring: SPRINGS.back as Spring,
    want: -1,
    wantAmount: 0,
    corner: -1,
    T: { ...offset },
    TV: { x: 0, y: 0 },
    Tt: { ...offset },
    T0: { ...offset },
    lift: 0,
    liftV: 0,
    liftT: 0,
    liftSpring: SPRINGS.lift as Spring,
    tilt: 0,
    tiltV: 0,
    tiltT: 0,
    last: { x: 0, t: 0 },
    raf: 0,
    prev: 0,
  }

  function inside(p: Pt) {
    const sh = s.shape
    if (!sh) {
      const b = get().border
      return p.x >= -b && p.x <= s.w + b && p.y >= -b && p.y <= s.h + b
    }
    const col = Math.floor((p.x + sh.pad) / CELL)
    const row = Math.floor((p.y + sh.pad) / CELL)
    return col >= 0 && col < sh.cols && row >= 0 && row < sh.rows && sh.mask[row * sh.cols + col] === 1
  }

  const center = () => s.shape?.center ?? { x: s.w / 2, y: s.h / 2 }

  /** Walks from `p` along `dir` to the sticker's edge. */
  function edgeFrom(p: Pt, dir: Pt) {
    let q = p
    for (let t = 1, n = s.w + s.h + PAD; t < n; t++) {
      const next = add(p, mul(dir, t))
      if (!inside(next)) break
      q = next
    }
    return q
  }

  /** Share of the sticker on the lifted side of the fold. */
  function progress(m: Pt, u: Pt) {
    const sh = s.shape
    if (!sh) return 0
    let lifted = 0
    for (let row = 0; row < sh.rows; row++) {
      const y = (row + 0.5) * CELL - sh.pad - m.y
      for (let col = 0; col < sh.cols; col++) {
        if (!sh.mask[row * sh.cols + col]) continue
        if (((col + 0.5) * CELL - sh.pad - m.x) * u.x + y * u.y < 0) lifted++
      }
    }
    return lifted / sh.total
  }

  const rootRect = () => s.rect ?? el.root.getBoundingClientRect()
  const ratio = (r: DOMRect) => (s.w ? r.width / s.w : 1) || 1

  /** A pointer position in the sticker's own, unrotated space. */
  function local(cx: number, cy: number): Pt {
    const r = rootRect()
    const k = ratio(r)
    const dx = (cx - (r.left + (s.w / 2 + s.T.x) * k)) / k
    const dy = (cy - (r.top + (s.h / 2 + s.T.y) * k)) / k
    const a = (-(get().rotate + s.tilt) * Math.PI) / 180
    const sc = 1 + LIFT_SCALE * s.lift
    return {
      x: (dx * Math.cos(a) - dy * Math.sin(a)) / sc + s.w / 2,
      y: (dx * Math.sin(a) + dy * Math.cos(a)) / sc + s.h / 2,
    }
  }

  function rootPt(cx: number, cy: number): Pt {
    const r = rootRect()
    const k = ratio(r)
    return { x: (cx - r.left) / k, y: (cy - r.top) / k }
  }

  /** Keeps the sticker's centre inside its parent. */
  function measureBounds() {
    const parent = el.root.parentElement
    if (!get().bounded || !parent) return null
    const r = rootRect()
    const k = ratio(r)
    const p = parent.getBoundingClientRect()
    return {
      x0: (p.left - r.left) / k - s.w / 2,
      x1: (p.right - r.left) / k - s.w / 2,
      y0: (p.top - r.top) / k - s.h / 2,
      y1: (p.bottom - r.top) / k - s.h / 2,
    }
  }

  /** Past the edge the sticker follows with growing resistance, then springs back in on release. */
  function rubber(v: number, lo: number, hi: number) {
    const give = (d: number) => 48 * (1 - Math.exp(-d / 96))
    if (v < lo) return lo - give(lo - v)
    if (v > hi) return hi + give(v - hi)
    return v
  }

  function inBounds(t: Pt, soft: boolean): Pt {
    const b = s.bounds
    if (!b) return t
    if (soft) return { x: rubber(t.x, b.x0, b.x1), y: rubber(t.y, b.y0, b.y1) }
    return { x: clamp(t.x, b.x0, Math.max(b.x0, b.x1)), y: clamp(t.y, b.y0, Math.max(b.y0, b.y1)) }
  }

  function raise() {
    el.root.style.zIndex = String(++topLayer)
  }

  function setState(state: "peeling" | "held" | null) {
    if (state) el.mover.dataset.state = state
    else delete el.mover.dataset.state
  }

  const hide = (node: HTMLElement) => {
    node.style.visibility = "hidden"
  }

  function render() {
    const { rotate } = get()
    el.mover.style.transform = `translate(${s.T.x.toFixed(2)}px, ${s.T.y.toFixed(2)}px) rotate(${(rotate + s.tilt).toFixed(2)}deg) scale(${(1 + LIFT_SCALE * s.lift).toFixed(4)})`
    const up = Math.max(0, s.lift)
    el.liftShadow.style.opacity = (up * 0.32).toFixed(3)
    el.liftShadow.style.transform = `translate(0, ${(2 + up * 12).toFixed(2)}px)`
    el.liftShadow.style.visibility = up > 0.002 ? "visible" : "hidden"

    const n = len(s.v)
    if (!s.anchor || n < 0.4 || dot(s.v, s.inward) <= 0) {
      el.front.style.clipPath = ""
      hide(el.back)
      hide(el.shade)
      hide(el.flapShadow)
      return
    }
    const u = mul(s.v, 1 / n)
    const m = add(s.anchor, mul(s.v, 0.5))
    const box = [
      { x: -PAD, y: -PAD },
      { x: s.w + PAD, y: -PAD },
      { x: s.w + PAD, y: s.h + PAD },
      { x: -PAD, y: s.h + PAD },
    ]
    el.front.style.clipPath = polygon(clipHalf(box, m, u, 1), 0)
    const lifted = polygon(clipHalf(box, m, u, -1), PAD)

    // Reflection across the fold. It fixes the fold line and lands the anchor on its folded spot.
    const d = 2 * dot(m, u)
    const b = -2 * u.x * u.y
    const mirror = `matrix(${1 - 2 * u.x * u.x}, ${b}, ${b}, ${1 - 2 * u.y * u.y}, ${d * u.x}, ${d * u.y})`
    const fade = Math.min(1, n / 14)

    for (const node of [el.back, el.shade, el.flapShadow]) {
      node.style.visibility = "visible"
      node.style.clipPath = lifted
    }
    el.back.style.transform = mirror
    el.shade.style.transform = mirror
    el.flapShadow.style.transform = `translate(${(u.x * 1.5).toFixed(2)}px, ${(u.y * 1.5 + 1.5).toFixed(2)}px) ${mirror}`
    el.flapShadow.style.opacity = (fade * 0.42).toFixed(3)

    // Crease shading on the back of the flap, darkest at the fold, laid out in the layer's box.
    const W = s.w + PAD * 2
    const H = s.h + PAD * 2
    const dir = { x: -u.x, y: -u.y }
    const L = Math.abs(W * dir.x) + Math.abs(H * dir.y)
    const start = { x: W / 2 - (dir.x * L) / 2, y: H / 2 - (dir.y * L) / 2 }
    const p0 = (m.x + PAD - start.x) * dir.x + (m.y + PAD - start.y) * dir.y
    const deg = (Math.atan2(dir.x, -dir.y) * 180) / Math.PI
    const reach = Math.max(10, n * 0.4)
    const mask = `linear-gradient(${deg.toFixed(2)}deg, #000 ${p0.toFixed(1)}px, rgb(0 0 0 / 0.45) ${(p0 + 2.5).toFixed(1)}px, transparent ${(p0 + reach).toFixed(1)}px)`
    el.shade.style.setProperty("mask-image", mask)
    el.shade.style.setProperty("-webkit-mask-image", mask)
    el.shade.style.opacity = (fade * 0.34).toFixed(3)
  }

  function curlVector() {
    const size = clamp(Math.min(s.w, s.h) * 0.2, 10, 30)
    return mul(s.inward, size * s.wantAmount)
  }

  /** Moves the hover peel between corners, flattening the old one before lifting the next. */
  function reconcileHover() {
    if (s.want !== s.corner) {
      if (len(s.v) < 0.6) {
        s.corner = s.want
        s.v = { x: 0, y: 0 }
        s.vv = { x: 0, y: 0 }
        const at = s.corner >= 0 ? s.shape?.corners[s.corner] : undefined
        s.anchor = at ?? null
        if (at) s.inward = unit(sub(center(), at))
      } else s.vt = { x: 0, y: 0 }
      s.vSpring = SPRINGS.hover
    }
    if (s.want === s.corner && s.corner >= 0) {
      s.vt = curlVector()
      s.vSpring = SPRINGS.hover
    }
  }

  function integrate(x: number, vel: number, target: number, [k, c]: Spring, dt: number) {
    const a = -k * (x - target) - c * vel
    vel += a * dt
    return [x + vel * dt, vel] as const
  }

  function frame(now: number) {
    s.raf = 0
    const elapsed = Math.min(1 / 30, s.prev ? (now - s.prev) / 1000 : 1 / 60)
    s.prev = now
    const snap = reduced()
    if (s.mode === "idle" && !s.held) reconcileHover()

    const steps = Math.max(1, Math.ceil(elapsed / (1 / 120)))
    const dt = elapsed / steps
    for (let i = 0; i < steps; i++) {
      if (s.mode !== "peel") {
        ;[s.v.x, s.vv.x] = integrate(s.v.x, s.vv.x, s.vt.x, s.vSpring, dt)
        ;[s.v.y, s.vv.y] = integrate(s.v.y, s.vv.y, s.vt.y, s.vSpring, dt)
      }
      ;[s.T.x, s.TV.x] = integrate(s.T.x, s.TV.x, s.Tt.x, SPRINGS.follow, dt)
      ;[s.T.y, s.TV.y] = integrate(s.T.y, s.TV.y, s.Tt.y, SPRINGS.follow, dt)
      ;[s.lift, s.liftV] = integrate(s.lift, s.liftV, s.liftT, s.liftSpring, dt)
      ;[s.tilt, s.tiltV] = integrate(s.tilt, s.tiltV, s.tiltT, SPRINGS.tilt, dt)
    }
    // A fold springing flat must never swing through to the other side.
    if (s.anchor && s.mode !== "peel" && dot(s.v, s.inward) <= 0) {
      s.v = { x: 0, y: 0 }
      s.vv = { x: 0, y: 0 }
    }
    s.tiltT *= Math.exp(-elapsed * 8)
    if (snap) {
      if (s.mode !== "peel") s.v = { ...s.vt }
      s.T = { ...s.Tt }
      s.lift = s.liftT
      s.tilt = 0
      s.tiltT = 0
    }
    render()

    const busy =
      len(sub(s.v, s.vt)) > 0.02 ||
      len(s.vv) > 0.02 ||
      len(sub(s.T, s.Tt)) > 0.02 ||
      len(s.TV) > 0.02 ||
      Math.abs(s.lift - s.liftT) > 0.001 ||
      Math.abs(s.liftV) > 0.001 ||
      Math.abs(s.tilt) > 0.01 ||
      Math.abs(s.tiltV) > 0.01 ||
      s.want !== s.corner
    if (busy) kick()
    else {
      s.prev = 0
      if (s.mode === "idle" && s.corner < 0 && len(s.v) < 0.05) s.anchor = null
    }
  }

  function kick() {
    if (!s.raf && s.alive) s.raf = requestAnimationFrame(frame)
  }

  function buzz() {
    if (get().haptics) navigator.vibrate?.(10)
  }

  function peelOff(e: PointerEvent) {
    s.mode = "carry"
    setState("held")
    s.vt = { x: 0, y: 0 }
    s.vSpring = SPRINGS.unfold
    s.liftT = 1
    s.liftSpring = SPRINGS.lift
    const r = rootPt(e.clientX, e.clientY)
    s.Tt = inBounds(add(s.T0, sub(r, s.downRoot)), true)
    s.last = { x: r.x, t: performance.now() }
    buzz()
    get().onPeel()
    kick()
  }

  function stick() {
    s.mode = "idle"
    s.held = false
    setState(null)
    s.Tt = inBounds(s.Tt, false)
    s.liftT = 0
    s.liftSpring = SPRINGS.slap
    s.tiltT = 0
    buzz()
    get().onStick({ ...s.Tt })
    kick()
  }

  async function rebuild() {
    const id = ++s.build
    if (!s.w || !s.h) return
    const { border } = get()
    const pad = Math.ceil(border) + 2
    const cols = Math.ceil((s.w + pad * 2) / CELL)
    const rows = Math.ceil((s.h + pad * 2) / CELL)
    const fallback = () => shapeFrom(boxSolid(cols, rows, pad, s.w, s.h), cols, rows, pad, border)
    if (!s.shape) s.shape = fallback()
    // Measure untransformed, so a rotated sticker reads its own layout.
    const saved = el.mover.style.transform
    el.mover.style.transform = "none"
    let ops: Op[]
    try {
      ops = measure(el.front, ratio(el.front.getBoundingClientRect()))
    } finally {
      el.mover.style.transform = saved
    }
    const solid = await rasterize(ops, cols, rows, pad)
    if (id !== s.build || !s.alive) return
    s.shape = (solid && shapeFrom(solid, cols, rows, pad, border)) || fallback()
  }

  return {
    resize() {
      const w = el.front.offsetWidth
      const h = el.front.offsetHeight
      if (w === s.w && h === s.h) return
      s.w = w
      s.h = h
      s.shape = null
      void rebuild()
      render()
    },
    rebuild,
    sync() {
      render()
    },
    down(e: PointerEvent, target: HTMLElement) {
      if (s.pointer !== null || s.held) return
      if (e.pointerType === "mouse" && e.button !== 0) return
      s.rect = el.root.getBoundingClientRect()
      const p = local(e.clientX, e.clientY)
      if (!inside(p)) {
        s.rect = null
        return
      }
      s.pointer = e.pointerId
      target.setPointerCapture(e.pointerId)
      raise()
      s.mode = "peel"
      setState("peeling")
      s.down = p
      s.downRoot = rootPt(e.clientX, e.clientY)
      s.T0 = { ...s.Tt }
      s.bounds = measureBounds()
      // Pressing on a corner that's already curling carries on from that curl.
      if (s.corner >= 0 && s.anchor && len(s.v) > 0.5) s.v0 = { ...s.v }
      else {
        s.v0 = { x: 0, y: 0 }
        s.v = { x: 0, y: 0 }
        s.anchor = null
      }
      s.vv = { x: 0, y: 0 }
      s.corner = -1
      s.want = -1
      render()
    },
    move(e: PointerEvent) {
      if (s.pointer === null) {
        if (e.pointerType !== "mouse" || !get().hoverPeel || reduced() || s.mode !== "idle" || s.held || !s.shape) return
        const p = local(e.clientX, e.clientY)
        const zone = Math.min(s.w, s.h) * 0.32 + get().border
        let best = -1
        let gap = zone
        s.shape.corners.forEach((c, i) => {
          const d = len(sub(p, c))
          if (d < gap) {
            best = i
            gap = d
          }
        })
        s.want = best
        s.wantAmount = best < 0 ? 0 : clamp(1.2 - gap / zone, 0.45, 1)
        kick()
        return
      }
      if (e.pointerId !== s.pointer) return

      if (s.mode === "peel") {
        const p = local(e.clientX, e.clientY)
        const drag = sub(p, s.down)
        let v = add(s.v0, drag)
        if (!s.anchor) {
          if (len(drag) < 3) return
          const c = center()
          const rel = sub(s.down, c)
          // Peel from the edge nearest the press. From the middle, peel from the side being dragged away from.
          const dir = len(rel) > Math.min(s.w, s.h) * 0.12 ? unit(rel) : unit(mul(drag, -1))
          s.anchor = edgeFrom(s.down, dir)
          const into = sub(c, s.anchor)
          s.inward = len(into) > 1 ? unit(into) : mul(dir, -1)
        }
        // Dragging outward still peels, folding the edge back over the sticker.
        const into = dot(v, s.inward)
        if (into < 0) v = sub(v, mul(s.inward, 2 * into))
        s.v = v
        s.vt = { x: 0, y: 0 }
        const n = len(v)
        if (n > 0.4 && get().movable) {
          const u = mul(v, 1 / n)
          if (progress(add(s.anchor, mul(v, 0.5)), u) >= get().threshold) {
            peelOff(e)
            return
          }
        }
        render()
        return
      }

      if (s.mode === "carry") {
        const r = rootPt(e.clientX, e.clientY)
        const now = performance.now()
        const speed = (r.x - s.last.x) / Math.max(1, now - s.last.t)
        s.last = { x: r.x, t: now }
        if (!reduced()) s.tiltT = clamp(s.tiltT * 0.5 + speed * 5, -10, 10)
        s.Tt = inBounds(add(s.T0, sub(r, s.downRoot)), true)
        kick()
      }
    },
    up(e: PointerEvent) {
      if (e.pointerId !== s.pointer) return
      s.pointer = null
      s.rect = null
      if (s.mode === "peel") {
        // Let go early: the flap falls back flat.
        s.mode = "idle"
        setState(null)
        s.vt = { x: 0, y: 0 }
        s.vSpring = SPRINGS.back
        kick()
      } else if (s.mode === "carry") stick()
    },
    leave() {
      s.want = -1
      kick()
    },
    key(e: KeyboardEvent) {
      const lifting = e.key === "Enter" || e.key === " "
      if (lifting) {
        if (e.repeat || s.pointer !== null) return true
        if (!s.held) {
          s.held = true
          s.want = -1
          s.heldFrom = { ...s.Tt }
          s.bounds = measureBounds()
          s.liftT = 1
          s.liftSpring = SPRINGS.lift
          raise()
          setState("held")
          get().onPeel()
          get().announce("Peeled off. Arrow keys move it, Enter sticks it down, Escape puts it back.")
        } else {
          stick()
          get().announce("Stuck down.")
        }
        kick()
        return true
      }
      if (!s.held) return false
      if (e.key === "Escape") {
        s.Tt = { ...s.heldFrom }
        stick()
        get().announce("Put back.")
        return true
      }
      const step = e.shiftKey ? 40 : 10
      const moves: Record<string, Pt> = {
        ArrowLeft: { x: -step, y: 0 },
        ArrowRight: { x: step, y: 0 },
        ArrowUp: { x: 0, y: -step },
        ArrowDown: { x: 0, y: step },
      }
      const by = moves[e.key]
      if (!by) return false
      s.Tt = inBounds(add(s.Tt, by), false)
      kick()
      return true
    },
    blur() {
      if (s.held) stick()
    },
    destroy() {
      s.alive = false
      cancelAnimationFrame(s.raf)
    },
  }
}

type Engine = ReturnType<typeof createSticker>

/* ------------------------------------------------------------------ */

/** A copy of the sticker behind or over the real one: inert, hidden from assistive tech, padded for overspill. */
function Layer({
  ref,
  children,
  filter,
}: {
  ref: React.Ref<HTMLDivElement>
  children: React.ReactNode
  filter: string
}) {
  return (
    <div
      ref={ref}
      aria-hidden
      inert
      className="pointer-events-none absolute"
      style={{ inset: -PAD, transformOrigin: `${PAD}px ${PAD}px`, filter, visibility: "hidden" }}
    >
      <div className="absolute grid" style={{ inset: PAD }}>
        {children}
      </div>
    </div>
  )
}

/** Grows the sticker's alpha by the border, rounded rather than boxy, into `grown`. */
function Grow({ border }: { border: number }) {
  if (border <= 0) {
    return (
      <feComponentTransfer in="SourceAlpha" result="grown">
        <feFuncA type="identity" />
      </feComponentTransfer>
    )
  }
  return (
    <>
      <feMorphology in="SourceAlpha" operator="dilate" radius={border * 0.5} result="dilated" />
      <feGaussianBlur in="dilated" stdDeviation={border * 0.35} result="soft" />
      <feComponentTransfer in="soft" result="grown">
        <feFuncA type="linear" slope={8} intercept={-0.6} />
      </feComponentTransfer>
    </>
  )
}

export interface StickerProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** The sticker's artwork: an image, an inline SVG, or any element. Its painted shape becomes the die cut. */
  children: React.ReactNode
  /** Width of the die-cut border, in px. `0` for none. */
  border?: number
  /** Colour of the die-cut border. */
  borderColor?: string
  /** Colour of the sticker's back, seen on the peeled flap. */
  backColor?: string
  /** Tilt, in degrees. */
  rotate?: number
  /** Share of the sticker, 0 to 1, that has to be peeled before it comes off in your hand. */
  threshold?: number
  /** Let the sticker come off and be stuck down somewhere else. When `false` it only peels and falls back. */
  movable?: boolean
  /** Keep a moved sticker's centre inside its parent. */
  bounded?: boolean
  /** Curl the nearest corner up as the mouse comes close. */
  hoverPeel?: boolean
  /** Where the sticker starts, relative to its place in the layout, in px. */
  defaultOffset?: { x: number; y: number }
  /** Called when the sticker comes off, by peeling or the keyboard. */
  onPeel?: () => void
  /** Called when the sticker is stuck down, with its offset from its place in the layout. */
  onStick?: (offset: { x: number; y: number }) => void
  /** Accessible name. Defaults to "Sticker". */
  label?: string
  /** Buzz the device as the sticker comes off and goes down, where the Vibration API exists. */
  haptics?: boolean
}

export function Sticker({
  children,
  border = 6,
  borderColor = "#ffffff",
  backColor = "#eceae4",
  rotate = 0,
  threshold = 0.4,
  movable = true,
  bounded = true,
  hoverPeel = true,
  defaultOffset,
  onPeel,
  onStick,
  label = "Sticker",
  haptics = true,
  className,
  style,
  ...props
}: StickerProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const moverRef = React.useRef<HTMLDivElement>(null)
  const frontRef = React.useRef<HTMLDivElement>(null)
  const liftShadowRef = React.useRef<HTMLDivElement>(null)
  const flapShadowRef = React.useRef<HTMLDivElement>(null)
  const backRef = React.useRef<HTMLDivElement>(null)
  const shadeRef = React.useRef<HTMLDivElement>(null)
  const engineRef = React.useRef<Engine | null>(null)
  const [message, setMessage] = React.useState("")

  const uid = `sticker-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const hintId = `${uid}-hint`
  const ids = { cut: `${uid}-cut`, back: `${uid}-back`, ink: `${uid}-ink` }
  const start = React.useRef(defaultOffset ?? { x: 0, y: 0 }).current

  const options = React.useRef<Options>(null!)
  options.current = {
    border,
    threshold,
    movable,
    bounded,
    hoverPeel,
    rotate,
    haptics,
    onPeel: () => onPeel?.(),
    onStick: (offset) => onStick?.(offset),
    announce: setMessage,
  }

  React.useEffect(() => {
    const engine = createSticker(
      {
        root: rootRef.current!,
        mover: moverRef.current!,
        front: frontRef.current!,
        liftShadow: liftShadowRef.current!,
        flapShadow: flapShadowRef.current!,
        back: backRef.current!,
        shade: shadeRef.current!,
      },
      start,
      () => options.current
    )
    engineRef.current = engine
    engine.resize()
    const front = frontRef.current!
    const ro = new ResizeObserver(() => engine.resize())
    ro.observe(front)
    // Re-read the silhouette when the artwork changes or an image finishes loading.
    let queued = 0
    const refresh = () => {
      cancelAnimationFrame(queued)
      queued = requestAnimationFrame(() => void engine.rebuild())
    }
    // The engine writes the front's own clip-path every frame, so only changes inside it count.
    const mo = new MutationObserver((records) => {
      if (records.some((r) => r.target !== front)) refresh()
    })
    mo.observe(front, { subtree: true, childList: true, attributes: true, characterData: true })
    front.addEventListener("load", refresh, true)
    return () => {
      ro.disconnect()
      mo.disconnect()
      front.removeEventListener("load", refresh, true)
      cancelAnimationFrame(queued)
      engine.destroy()
      engineRef.current = null
    }
  }, [start])

  React.useEffect(() => {
    void engineRef.current?.rebuild()
  }, [border])

  React.useEffect(() => {
    engineRef.current?.sync()
  }, [rotate])

  return (
    <div
      ref={rootRef}
      className={cn("pointer-events-none relative inline-block align-top", className)}
      style={style}
      {...props}
    >
      <svg aria-hidden width="0" height="0" className="absolute">
        <defs>
          <filter id={ids.cut} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
            <Grow border={border} />
            <feFlood floodColor={borderColor} />
            <feComposite in2="grown" operator="in" result="paper" />
            <feGaussianBlur in="grown" stdDeviation="0.8" />
            <feOffset dy="0.8" result="tightBlur" />
            <feFlood floodColor="#000" floodOpacity="0.24" />
            <feComposite in2="tightBlur" operator="in" result="tight" />
            <feGaussianBlur in="grown" stdDeviation="3" />
            <feOffset dy="2.5" result="softBlur" />
            <feFlood floodColor="#000" floodOpacity="0.12" />
            <feComposite in2="softBlur" operator="in" result="soft" />
            <feMerge>
              <feMergeNode in="soft" />
              <feMergeNode in="tight" />
              <feMergeNode in="paper" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={ids.back} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
            <Grow border={border} />
            <feFlood floodColor={backColor} />
            <feComposite in2="grown" operator="in" />
          </filter>
          <filter id={ids.ink} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
            <Grow border={border} />
            <feFlood floodColor="#000" />
            <feComposite in2="grown" operator="in" />
          </filter>
        </defs>
      </svg>

      <div
        ref={moverRef}
        role={movable ? "button" : undefined}
        tabIndex={movable ? 0 : undefined}
        aria-label={movable ? label : undefined}
        aria-roledescription={movable ? "sticker" : undefined}
        aria-describedby={movable ? hintId : undefined}
        className={cn(
          "pointer-events-auto relative touch-none rounded-md outline-none select-none [-webkit-tap-highlight-color:transparent]",
          "cursor-grab data-state:cursor-grabbing",
          "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        )}
        style={{ transform: `translate(${start.x}px, ${start.y}px) rotate(${rotate}deg)` }}
        onPointerDown={(e) => engineRef.current?.down(e.nativeEvent, e.currentTarget)}
        onPointerMove={(e) => engineRef.current?.move(e.nativeEvent)}
        onPointerUp={(e) => engineRef.current?.up(e.nativeEvent)}
        onPointerCancel={(e) => engineRef.current?.up(e.nativeEvent)}
        onLostPointerCapture={(e) => engineRef.current?.up(e.nativeEvent)}
        onPointerLeave={() => engineRef.current?.leave()}
        onDragStart={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (!movable) return
          if (engineRef.current?.key(e.nativeEvent)) e.preventDefault()
        }}
        onBlur={() => engineRef.current?.blur()}
      >
        <Layer ref={liftShadowRef} filter={`url(#${ids.ink}) blur(9px)`}>
          {children}
        </Layer>
        <div ref={frontRef} className="relative grid" style={{ filter: `url(#${ids.cut})` }}>
          {children}
        </div>
        <Layer ref={flapShadowRef} filter={`url(#${ids.ink}) blur(3px)`}>
          {children}
        </Layer>
        <Layer ref={backRef} filter={`url(#${ids.back})`}>
          {children}
        </Layer>
        <Layer ref={shadeRef} filter={`url(#${ids.ink})`}>
          {children}
        </Layer>
      </div>

      {movable && (
        <span id={hintId} className="sr-only">
          Drag to peel it off and stick it somewhere else, or press Enter to lift it and use the arrow keys.
        </span>
      )}
      <span aria-live="polite" className="sr-only">
        {message}
      </span>
    </div>
  )
}
