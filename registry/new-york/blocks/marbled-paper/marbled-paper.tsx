"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type MarbledPattern = "stone" | "combed" | "nonpareil" | "bouquet"
export type MarbledPalette = "endpaper" | "nocturne" | "tide" | "ochre"

/** Pattern names in picker order. */
export const marbledPaperPatterns: readonly MarbledPattern[] = ["stone", "combed", "nonpareil", "bouquet"]

/** Colour sets as hex. The first colour is the bath, the rest are dropped onto it as ink. */
export const marbledPaperPalettes: Record<MarbledPalette, string[]> = {
  endpaper: ["#f4f1ea", "#b8893a", "#387478", "#241d17", "#6e2a24"],
  nocturne: ["#1c1713", "#b08d4a", "#387478", "#e8dfcc", "#6e2a24"],
  tide: ["#eef0ea", "#387478", "#1d3a46", "#a9c4bf", "#b08d4a"],
  ochre: ["#efe4cc", "#b8893a", "#7c4a23", "#241d17", "#d9b77a"],
}

type RGB = [number, number, number]

/** Parses #rgb and #rrggbb into 0 to 1 channels. */
function parseHex(input: string): RGB | null {
  const hex = input.trim().replace(/^#/, "")
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex.slice(0, 6)
  const n = Number.parseInt(full, 16)
  if (full.length !== 6 || Number.isNaN(n)) return null
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

/** Seeded PRNG, so the server and the client lay down the same sheet. */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * One step in making the sheet, after Jaffer and Lu's "Mathematical Marbling". Every step is an
 * area-preserving map with an exact inverse, so a pixel can be traced back through the steps to the ink
 * it came from.
 * - drop: ink spreads from a point and pushes everything already on the bath outwards.
 * - comb: a rake of parallel tines, `spacing` apart, drawn along (dx, dy). Ink moves by `shift` at a
 *   tine and half as far every `sharpness` units away from it.
 * - wave: a sine shear along (dx, dy). Wrapped around a comb it bends the tines into a serpentine.
 */
type Op =
  | { kind: "drop"; x: number; y: number; r: number; color: number }
  | { kind: "comb"; dx: number; dy: number; shift: number; sharpness: number; spacing: number; offset: number }
  | { kind: "wave"; dx: number; dy: number; amplitude: number; frequency: number; phase: number }

/** Sheet half-extents: the longer side of the element spans -1 to 1. */
const SHEET = 1

function marble(pattern: MarbledPattern, seed: number, colorCount: number, scale: number, budget: number): Op[] {
  const rand = mulberry32(seed * 7919 + 17)
  const ops: Op[] = []
  // Combing drags ink in from beyond the visible edge, so the bath has to be wider than the view.
  const reach = pattern === "stone" ? 0.25 : 0.55
  const extent = SHEET / scale + reach
  const comb = pattern !== "stone"
  const combSlots = comb ? 14 : 4

  // Sprinkle one colour at a time over the whole bath, as a marbler does. Each round's drops push the
  // earlier rounds aside into veins, and push each other into polygons, so the last colour forms the
  // stones. Drops sit on a shuffled, jittered grid so the cover is even but the order is random.
  const inks = Array.from({ length: colorCount - 1 }, (_, i) => i + 1)
  for (let i = inks.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[inks[i], inks[j]] = [inks[j], inks[i]]
  }
  // The bath colour goes in early too, so pale veins run between the stones.
  const rounds = [...inks]
  rounds.splice(1 + Math.floor(rand() * (rounds.length - 1)), 0, 0)
  // Early rounds end up as thin veins, so they need few drops; the last round makes the stones.
  const drops = budget - combSlots
  // Where each drop's centre has been pushed to by the drops after it, to keep new drops off old ones.
  const live: { x: number; y: number; r: number; color: number }[] = []
  rounds.forEach((color, round) => {
    const last = round === rounds.length - 1
    const share = last ? 0.55 : 0.45 / (rounds.length - 1)
    const target = comb ? 0.2 : last ? 0.2 : 0.3
    // Stones in the last round cost about 1.8 drops each with their liners.
    const perCell = last && !comb ? 1.8 : 1
    const cells = Math.max(3, Math.min(Math.ceil((2 * extent) / target), Math.floor(Math.sqrt((drops * share) / perCell))))
    const cell = (2 * extent) / cells
    const order = Array.from({ length: cells * cells }, (_, i) => i)
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[order[i], order[j]] = [order[j], order[i]]
    }
    for (const index of order) {
      // Each round spreads until its drops meet, as ink does on size, squeezing what came before into veins.
      const r = cell * 0.5 * (0.75 + rand() * 0.5)
      // The stones mix every ink, so neighbours differ and the sheet does not read as one colour.
      const ink = last ? inks[Math.floor(rand() * inks.length)] : color
      // Landing inside another colour rings the new drop with it, which is the look. Landing inside the
      // same colour just swells that stone, so try a few spots in the cell and give up if all are taken.
      let x = 0
      let y = 0
      let free = false
      for (let attempt = 0; attempt < 6 && !free; attempt++) {
        x = -extent + (index % cells + 0.1 + rand() * 0.8) * cell
        y = -extent + (Math.floor(index / cells) + 0.1 + rand() * 0.8) * cell
        free = live.every((d) => d.color !== ink || Math.hypot(d.x - x, d.y - y) > d.r * 1.05)
      }
      if (!free) continue
      // Liners: a tiny drop of another ink under the stone is spread by it into a hairline ring, about
      // r² / 2R wide. One or two of them give the banded outline of a battal stone.
      let spread = r * r
      if (last && !comb) {
        const liners = rand() < 0.75 ? (rand() < 0.45 ? 2 : 1) : 0
        let under = ink
        for (let i = 0; i < liners; i++) {
          under = (under + 1 + Math.floor(rand() * (colorCount - 1))) % colorCount
          if (under === ink) under = (under + 1) % colorCount
          const rl = r * (0.26 + rand() * 0.16)
          ops.push({ kind: "drop", x, y, r: rl, color: under })
          spread += rl * rl
        }
      }
      for (const d of live) {
        const dx = d.x - x
        const dy = d.y - y
        const k = Math.sqrt(1 + spread / Math.max(dx * dx + dy * dy, 1e-9))
        d.x = x + dx * k
        d.y = y + dy * k
      }
      live.push({ x, y, r: Math.sqrt(spread), color: ink })
      ops.push({ kind: "drop", x, y, r, color: ink })
    }
  })

  const tilt = (rand() - 0.5) * 0.12
  const along = (angle: number) => ({ dx: Math.cos(angle + tilt), dy: Math.sin(angle + tilt) })
  const offset = () => rand() * 2

  if (comb) {
    // Rake back and forth along x to pull the drops into long stripes.
    const s1 = 0.13
    const o1 = offset()
    ops.push({ kind: "comb", ...along(0), shift: 0.42, sharpness: 0.035, spacing: s1, offset: o1 })
    ops.push({ kind: "comb", ...along(0), shift: -0.42, sharpness: 0.035, spacing: s1, offset: o1 + s1 / 2 })
    // Gel-git: a coarse rake out along y and back with the tines offset, folding the stripes into chevrons.
    const s2 = 0.34
    const o2 = offset()
    const z2 = pattern === "combed" ? 0.2 : pattern === "nonpareil" ? 0.07 : 0.14
    ops.push({ kind: "comb", ...along(Math.PI / 2), shift: z2, sharpness: 0.06, spacing: s2, offset: o2 })
    ops.push({ kind: "comb", ...along(Math.PI / 2), shift: -z2, sharpness: 0.06, spacing: s2, offset: o2 + s2 / 2 })
  }
  if (pattern === "nonpareil") {
    // One pass of a fine comb across the stripes pulls each into a row of small nested points.
    ops.push({ kind: "comb", ...along(-Math.PI / 2), shift: 0.075, sharpness: 0.014, spacing: 0.045, offset: offset() })
  }
  if (pattern === "bouquet") {
    // A fine comb drawn on a serpentine path: straighten the path, comb, bend it back.
    const amplitude = 0.05
    const frequency = 15
    const phase = rand() * 6.283
    ops.push({ kind: "wave", ...along(0), amplitude: -amplitude, frequency, phase })
    ops.push({ kind: "comb", ...along(Math.PI / 2), shift: 0.11, sharpness: 0.016, spacing: 0.085, offset: offset() })
    ops.push({ kind: "wave", ...along(0), amplitude, frequency, phase })
  }
  // A last slow shear so no stone is a perfect circle.
  ops.push({ kind: "wave", ...along(rand() * 3.14), amplitude: 0.025, frequency: 2.4, phase: rand() * 6.283 })
  return ops
}

/** Packs ops newest first, as the shader walks them backwards. Drops take one vec4, combs and waves two. */
function packOps(ops: Op[], slots: number) {
  const data = new Float32Array(slots * 4)
  let k = 0
  for (let i = ops.length - 1; i >= 0; i--) {
    const op = ops[i]
    const need = op.kind === "drop" ? 1 : 2
    // Out of room: the oldest ops are the ones buried deepest under later ink, so they go first.
    if (k + need > slots) break
    const o = k * 4
    if (op.kind === "drop") data.set([op.x, op.y, op.r, op.color], o)
    else if (op.kind === "comb") data.set([op.dx, op.dy, op.shift, -1, op.sharpness, op.spacing, op.offset, 0], o)
    else data.set([op.dx, op.dy, 0, -2, op.amplitude, op.frequency, op.phase, 0], o)
    k += need
  }
  return { data, count: k }
}

/** Idle drift: two slow cross shears, each area preserving, like the size settling in the tray. */
function drift(q: [number, number], amount: number, t: number) {
  q[0] += amount * Math.sin(q[1] * 1.9 + t * 0.53)
  q[1] += amount * Math.sin(q[0] * 1.6 - t * 0.41 + 1.7)
}

/** CPU twin of the fragment shader, for browsers without WebGL. Point sampled, so render it small. */
function traceInk(ops: Op[], x: number, y: number): number {
  let qx = x
  let qy = y
  for (let i = ops.length - 1; i >= 0; i--) {
    const op = ops[i]
    if (op.kind === "drop") {
      const dx = qx - op.x
      const dy = qy - op.y
      const l = Math.hypot(dx, dy)
      if (l < op.r) return op.color
      const k = Math.sqrt(l * l - op.r * op.r) / l
      qx = op.x + dx * k
      qy = op.y + dy * k
    } else if (op.kind === "comb") {
      let d = qx * -op.dy + qy * op.dx - op.offset
      d = Math.abs((((d + op.spacing / 2) % op.spacing) + op.spacing) % op.spacing - op.spacing / 2)
      const e = op.shift * Math.pow(2, -d / op.sharpness)
      qx -= op.dx * e
      qy -= op.dy * e
    } else {
      const s = op.amplitude * Math.sin(op.frequency * (qx * -op.dy + qy * op.dx) + op.phase)
      qx -= op.dx * s
      qy -= op.dy * s
    }
  }
  return 0
}

function paintFallback(canvas: HTMLCanvasElement, ops: Op[], colors: RGB[], width: number, height: number, scale: number) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  // About 60k samples, whatever the size: enough to read as marbling, cheap enough to run once.
  const k = Math.min(1, Math.sqrt(60000 / Math.max(1, width * height)))
  const w = Math.max(1, Math.round(width * k))
  const h = Math.max(1, Math.round(height * k))
  canvas.width = w
  canvas.height = h
  const image = ctx.createImageData(w, h)
  const long = Math.max(w, h)
  const q: [number, number] = [0, 0]
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      q[0] = (((px + 0.5) * 2 - w) / long) * SHEET / scale
      q[1] = ((h - (py + 0.5) * 2) / long) * SHEET / scale
      drift(q, 0.02, 0)
      const c = colors[traceInk(ops, q[0], q[1])] ?? colors[0]
      const o = (py * w + px) * 4
      image.data[o] = c[0] * 255
      image.data[o + 1] = c[1] * 255
      image.data[o + 2] = c[2] * 255
      image.data[o + 3] = 255
    }
  }
  ctx.putImageData(image, 0, 0)
}

const VERTEX = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

/**
 * The comb field stores, per cell, how far back to look for the ink that sits there now. Two signed
 * 16-bit numbers packed into RGBA8, so it works on every WebGL1 device without float targets. Packed
 * values cannot be filtered by the GPU, hence the manual bilinear.
 */
const FIELD_LIB = `
uniform sampler2D uField;
uniform vec2 uTexel;
float unpack(vec2 c) { return (floor(c.x * 255.0 + 0.5) * 256.0 + floor(c.y * 255.0 + 0.5) - 32768.0) / 8192.0; }
vec2 fetch(vec2 uv) { vec4 t = texture2D(uField, uv); return vec2(unpack(t.rg), unpack(t.ba)); }
vec2 field(vec2 uv) {
  vec2 st = uv / uTexel - 0.5;
  vec2 i = floor(st);
  vec2 f = st - i;
  vec2 b = (i + 0.5) * uTexel;
  vec2 a = mix(fetch(b), fetch(b + vec2(uTexel.x, 0.0)), f.x);
  vec2 c = mix(fetch(b + vec2(0.0, uTexel.y)), fetch(b + uTexel), f.x);
  return mix(a, c, f.y);
}`

const FIELD_FRAGMENT = `
precision highp float;
varying vec2 vUv;
uniform vec2 uAspect;
uniform vec2 uA;
uniform vec2 uB;
uniform float uWidth;
uniform float uGain;
uniform float uDecay;
${FIELD_LIB}
vec4 pack(vec2 v) {
  vec2 n = clamp(floor(v * 8192.0 + 0.5) + 32768.0, 0.0, 65535.0);
  vec2 hi = floor(n / 256.0);
  vec2 lo = n - hi * 256.0;
  return vec4(hi.x, lo.x, hi.y, lo.y) / 255.0;
}
void main() {
  vec2 p = (vUv - 0.5) * 2.0 * uAspect;
  vec2 v = uB - uA;
  vec2 s = vec2(0.0);
  float vv = dot(v, v);
  if (uGain > 0.0 && vv > 0.0) {
    float h = clamp(dot(p - uA, v) / vv, 0.0, 1.0);
    float d = length(p - uA - v * h) / uWidth;
    // Ink under the stylus travels with it; the wake falls off smoothly to either side.
    s = v * uGain * exp2(-d * d);
  }
  // Semi-Lagrangian step: the ink here now is the ink that was one stylus step behind.
  gl_FragColor = pack((field(vUv - s / (2.0 * uAspect)) - s) * uDecay);
}`

const MARBLE_FRAGMENT = (slots: number) => `
precision highp float;
#define SLOTS ${slots}
varying vec2 vUv;
uniform vec4 uOps[SLOTS];
uniform int uCount;
uniform vec3 uColors[8];
uniform vec2 uAspect;
uniform float uPx;
uniform float uScale;
uniform float uTime;
uniform float uDrift;
uniform float uGrain;
uniform float uFieldOn;
${FIELD_LIB}
vec3 ink(float k) {
  vec3 c = uColors[0];
  for (int j = 1; j < 8; j++) if (abs(float(j) - k) < 0.5) c = uColors[j];
  return c;
}
float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + 1.0), f.x), f.y);
}
void main() {
  vec2 p = (vUv - 0.5) * 2.0 * uAspect;
  float px = uPx / uScale;
  mat2 J = mat2(px);
  if (uFieldOn > 0.5) {
    // A stroke stretches the sheet; carry that into the footprint so dragged threads stay smooth.
    vec2 f0 = field(vUv);
    vec2 e = uPx / (2.0 * uAspect);
    vec2 fx = field(vUv + vec2(e.x, 0.0)) - f0;
    vec2 fy = field(vUv + vec2(0.0, e.y)) - f0;
    J = mat2(vec2(px, 0.0) + fx / uScale, vec2(0.0, px) + fy / uScale);
    p += f0;
  }
  vec2 q = p / uScale;
  q.x += uDrift * sin(q.y * 1.9 + uTime * 0.53);
  q.y += uDrift * sin(q.x * 1.6 - uTime * 0.41 + 1.7);
  vec2 q0 = q;

  // Trace the pixel back through every step, newest first. The first drop it lands in is its colour.
  // J carries the pixel's footprint through the steps (the Jacobian of the trace, in sheet units per
  // pixel), so each drop edge is blended over exactly one pixel, front to back. Veins squeezed thinner
  // than a pixel average out instead of shimmering, and everything else stays sharp.
  vec3 col = vec3(0.0);
  float T = 1.0;
  bool skip = false;
  for (int i = 0; i < SLOTS; i++) {
    if (i >= uCount) break;
    if (skip) { skip = false; continue; }
    vec4 o = uOps[i];
    if (o.w >= 0.0) {
      vec2 d = q - o.xy;
      float l = max(length(d), 1e-6);
      vec2 n = d / l;
      float r = o.z;
      float we = max(length(n * J), px * 0.5);
      float a = clamp((r - l) / we + 0.5, 0.0, 1.0);
      if (a > 0.0) {
        // Pigment gathers a little at the rim of a drop.
        float rim = 1.0 - (0.03 + 0.12 * uGrain) * exp2(-max(r - l, 0.0) / (0.003 + px));
        col += T * a * ink(o.w) * rim;
        T *= 1.0 - a;
        if (T < 0.004) break;
      }
      // Undo the drop: radially, l becomes sqrt(l^2 - r^2). Stretch along n, squeeze across it.
      float le = max(l, r + 0.5 * we);
      float g = max(sqrt(le * le - r * r) / le, 0.02);
      q = o.xy + n * (g * le);
      mat2 nn = mat2(n * n.x, n * n.y);
      J = (g * (mat2(1.0) - nn) + nn / g) * J;
    } else {
      vec4 k = uOps[i + 1];
      vec2 m = o.xy;
      vec2 nrm = vec2(-m.y, m.x);
      float dn = dot(q, nrm);
      float slope;
      if (o.w > -1.5) {
        float t = mod(dn - k.z + 0.5 * k.y, k.y) - 0.5 * k.y;
        float e = exp2(-abs(t) / k.x);
        q -= m * (o.z * e);
        slope = o.z * e * 0.6931 / k.x * sign(t);
      } else {
        float ph = k.y * dn + k.z;
        q -= m * (k.x * sin(ph));
        slope = -k.x * k.y * cos(ph);
      }
      J = (mat2(1.0) + slope * mat2(m * nrm.x, m * nrm.y)) * J;
      skip = true;
    }
  }
  col += T * uColors[0];

  // Pigment mottle travels with the ink; paper tooth stays put on the sheet.
  col *= 1.0 + uGrain * 0.06 * (noise(q0 * 40.0) - 0.5);
  col += uGrain * 0.05 * (hash(floor(gl_FragCoord.xy)) - 0.5);
  gl_FragColor = vec4(col, 1.0);
}`

/**
 * Contexts released on unmount, by canvas. React can remount onto the same canvas (StrictMode, fast
 * refresh), and that canvas hands back its lost context, so the remount has to restore it.
 */
const released = new WeakMap<HTMLCanvasElement, WEBGL_lose_context>()

const INTERACTIVE = "a,button,input,select,textarea,label,summary,[role=button],[role=link],[contenteditable=true]"

export interface MarbledPaperProps extends Omit<React.ComponentProps<"div">, "children"> {
  /**
   * "stone" is battal: drops pushed into each other. "combed" is gel-git: raked into stripes, then
   * into chevrons. "nonpareil" adds a fine comb. "bouquet" draws the fine comb on a serpentine path.
   * Default "stone".
   */
  pattern?: MarbledPattern
  /** Hex colours, up to 8. The first is the bath, the rest are dropped onto it. Default the endpaper palette. */
  colors?: string[]
  /** Idle drift speed, 0 to 3. 0 holds the sheet still. Default 1. */
  speed?: number
  /** Drag through the ink to comb it like a stylus. Default true. */
  interactive?: boolean
  /** How much ink the stylus carries, 0 to 2. Faster strokes also pull a wider wake. Default 1. */
  combStrength?: number
  /** Seconds for a stroke to relax halfway back. 0 keeps strokes for good. Default 5. */
  relax?: number
  /** Size of the marbling, 0.5 to 2. Higher shows bigger stones. Default 1. */
  scale?: number
  /** Seed for the drop layout and comb positions. Change it to marble a new sheet. Default 1. */
  seed?: number
  /** Paper tooth, pigment mottle and rim darkening, 0 to 1. Default 0.5. */
  paper?: number
  /** Class names for the content wrapper around `children`. */
  contentClassName?: string
  /** Content laid over the paper. */
  children?: React.ReactNode
}

type Settings = {
  speed: number
  interactive: boolean
  combStrength: number
  relax: number
  paper: number
  scale: number
  ops: Op[]
  colors: RGB[]
}

/**
 * A living sheet of marbled paper. The pattern is traced per pixel through exact, area-preserving drop
 * and comb maps, so edges stay crisp at any size; dragging combs the ink with a stylus.
 */
export function MarbledPaper({
  pattern = "stone",
  colors = marbledPaperPalettes.endpaper,
  speed = 1,
  interactive = true,
  combStrength = 1,
  relax = 5,
  scale = 1,
  seed = 1,
  paper = 0.5,
  contentClassName,
  className,
  style,
  children,
  ...props
}: MarbledPaperProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const fallbackRef = React.useRef<HTMLCanvasElement>(null)

  // Keyed by value so an inline `colors={[...]}` does not redraw on every parent render.
  const colorKey = colors.slice(0, 8).join(",")
  const palette = React.useMemo(() => {
    const parsed = colorKey.split(",").map((c) => parseHex(c) ?? ([0, 0, 0] as RGB))
    return parsed.length >= 2 ? parsed : (marbledPaperPalettes.endpaper.map(parseHex) as RGB[])
  }, [colorKey])
  const size = Math.min(2, Math.max(0.5, scale))
  const ops = React.useMemo(() => marble(pattern, seed, palette.length, size, 230), [pattern, seed, palette.length, size])

  const settings = React.useRef<Settings>({
    speed,
    interactive,
    combStrength,
    relax,
    paper,
    scale: size,
    ops,
    colors: palette,
  })
  const wakeRef = React.useRef<(reset?: boolean, repaint?: boolean) => void>(() => {})

  React.useEffect(() => {
    const s = settings.current
    // A new sheet starts with no strokes; a new palette keeps them.
    const reset = s.ops !== ops || s.scale !== size
    const repaint = reset || s.colors !== palette
    Object.assign(s, { speed, interactive, combStrength, relax, paper, scale: size, ops, colors: palette })
    wakeRef.current(reset, repaint)
  }, [speed, interactive, combStrength, relax, paper, size, ops, palette])

  React.useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    const fallback = fallbackRef.current
    if (!root || !canvas || !fallback) return
    const cfg = settings.current

    let gl: WebGLRenderingContext | null = null
    let marbleProgram: WebGLProgram | null = null
    let fieldProgram: WebGLProgram | null = null
    let quad: WebGLBuffer | null = null
    let textures: WebGLTexture[] = []
    let buffers: WebGLFramebuffer[] = []
    let current = 0
    let slots = 0
    let uploaded: Op[] | null = null
    let lost = false

    let width = 0
    let height = 0
    let fieldW = 1
    let fieldH = 1
    let aspect: [number, number] = [1, 1]
    let fieldOn = false
    let energy = 0
    let time = 0
    let raf = 0
    let last = 0
    let dirty = true
    // Render scale, lowered step by step if frames keep running long on a slow GPU.
    let quality = 1
    let slow = 0
    let pending = 0
    const colorData = new Float32Array(24)
    let colorsFor: RGB[] | null = null
    let shown = false
    let visible = true
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")

    // Pointer state lives here, never in React state.
    let active: number | null = null
    let rect: DOMRect | null = null
    let prev: { x: number; y: number; t: number } | null = null
    const strokes: { ax: number; ay: number; bx: number; by: number; dt: number }[] = []

    const uniforms = new Map<string, WebGLUniformLocation | null>()
    const loc = (program: WebGLProgram, name: string) => {
      const key = (program === marbleProgram ? "m:" : "f:") + name
      if (!uniforms.has(key)) uniforms.set(key, gl!.getUniformLocation(program, name))
      return uniforms.get(key) ?? null
    }

    const compile = (g: WebGLRenderingContext, fragment: string) => {
      const make = (type: number, source: string) => {
        const shader = g.createShader(type)!
        g.shaderSource(shader, source)
        g.compileShader(shader)
        return shader
      }
      const program = g.createProgram()!
      const vs = make(g.VERTEX_SHADER, VERTEX)
      const fs = make(g.FRAGMENT_SHADER, fragment)
      g.attachShader(program, vs)
      g.attachShader(program, fs)
      g.bindAttribLocation(program, 0, "aPos")
      g.linkProgram(program)
      g.deleteShader(vs)
      g.deleteShader(fs)
      if (!g.getProgramParameter(program, g.LINK_STATUS)) {
        g.deleteProgram(program)
        return null
      }
      return program
    }

    const makeField = (g: WebGLRenderingContext, w: number, h: number) => {
      const tex = g.createTexture()!
      g.bindTexture(g.TEXTURE_2D, tex)
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.NEAREST)
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.NEAREST)
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE)
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE)
      g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, w, h, 0, g.RGBA, g.UNSIGNED_BYTE, null)
      const fb = g.createFramebuffer()!
      g.bindFramebuffer(g.FRAMEBUFFER, fb)
      g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, tex, 0)
      return { tex, fb }
    }

    const clearField = () => {
      if (!gl) return
      for (const fb of buffers) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
        gl.viewport(0, 0, fieldW, fieldH)
        // Packed zero: 32768 is 128 high, 0 low, per axis.
        gl.clearColor(128 / 255, 0, 128 / 255, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)
      }
      fieldOn = false
      energy = 0
    }

    const init = () => {
      const attrs: WebGLContextAttributes = {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
      }
      const g = (canvas.getContext("webgl2", attrs) ?? canvas.getContext("webgl", attrs)) as WebGLRenderingContext | null
      if (!g || g.isContextLost()) return false
      const high = g.getShaderPrecisionFormat(g.FRAGMENT_SHADER, g.HIGH_FLOAT)
      if (!high || high.precision < 16) return false
      // Leave room for the other uniforms; very old GPUs only guarantee a few hundred vectors.
      slots = Math.min(256, (g.getParameter(g.MAX_FRAGMENT_UNIFORM_VECTORS) as number) - 24)
      if (slots < 48) return false
      gl = g
      marbleProgram = compile(g, MARBLE_FRAGMENT(slots))
      fieldProgram = compile(g, FIELD_FRAGMENT)
      if (!marbleProgram || !fieldProgram) return false
      quad = g.createBuffer()
      g.bindBuffer(g.ARRAY_BUFFER, quad)
      g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW)
      g.enableVertexAttribArray(0)
      g.vertexAttribPointer(0, 2, g.FLOAT, false, 0, 0)
      uploaded = null
      uniforms.clear()
      textures = []
      buffers = []
      return true
    }

    const sizeField = () => {
      if (!gl || !fieldProgram) return
      // About one cell per 2 CSS px: the stylus wake is smooth, so it needs no more.
      const k = Math.min(1 / 2, 512 / Math.max(width, height, 1))
      const w = Math.max(2, Math.round(width * k))
      const h = Math.max(2, Math.round(height * k))
      if (w === fieldW && h === fieldH && textures.length) return
      const old = textures.length ? { tex: textures[current], w: fieldW, h: fieldH } : null
      const next = [makeField(gl, w, h), makeField(gl, w, h)]
      const oldTextures = textures
      const oldBuffers = buffers
      textures = next.map((n) => n.tex)
      buffers = next.map((n) => n.fb)
      current = 0
      fieldW = w
      fieldH = h
      if (old && fieldOn) {
        // Carry existing strokes over to the new size instead of wiping them.
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffers[0])
        gl.viewport(0, 0, w, h)
        gl.useProgram(fieldProgram)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, old.tex)
        gl.uniform1i(loc(fieldProgram, "uField"), 0)
        gl.uniform2f(loc(fieldProgram, "uTexel"), 1 / old.w, 1 / old.h)
        gl.uniform2f(loc(fieldProgram, "uAspect"), aspect[0], aspect[1])
        gl.uniform1f(loc(fieldProgram, "uGain"), 0)
        gl.uniform1f(loc(fieldProgram, "uDecay"), 1)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
      } else {
        clearField()
      }
      oldTextures.forEach((t) => gl!.deleteTexture(t))
      oldBuffers.forEach((b) => gl!.deleteFramebuffer(b))
    }

    const resize = () => {
      const box = root.getBoundingClientRect()
      width = Math.max(1, box.width)
      height = Math.max(1, box.height)
      const long = Math.max(width, height)
      aspect = [width / long, height / long]
      if (lost || !gl) {
        if (!gl) paintFallback(fallback, cfg.ops, cfg.colors, width, height, cfg.scale)
        return
      }
      // Cap the pixel count as well as the ratio: the trace costs per pixel, and big sections add up.
      let dpr = Math.min(window.devicePixelRatio || 1, 2)
      dpr = Math.min(dpr, Math.sqrt(2_000_000 / (width * height))) * quality
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      sizeField()
      dirty = true
      // Resizing clears the canvas, so repaint in the same task to avoid a blank frame.
      render(0)
    }

    const fieldPass = (seg: { ax: number; ay: number; bx: number; by: number } | null, widthS: number, gain: number, decay: number) => {
      const g = gl!
      const program = fieldProgram!
      const src = current
      const dst = 1 - current
      g.bindFramebuffer(g.FRAMEBUFFER, buffers[dst])
      g.viewport(0, 0, fieldW, fieldH)
      g.useProgram(program)
      g.activeTexture(g.TEXTURE0)
      g.bindTexture(g.TEXTURE_2D, textures[src])
      g.uniform1i(loc(program, "uField"), 0)
      g.uniform2f(loc(program, "uTexel"), 1 / fieldW, 1 / fieldH)
      g.uniform2f(loc(program, "uAspect"), aspect[0], aspect[1])
      g.uniform2f(loc(program, "uA"), seg?.ax ?? 0, seg?.ay ?? 0)
      g.uniform2f(loc(program, "uB"), seg?.bx ?? 0, seg?.by ?? 0)
      g.uniform1f(loc(program, "uWidth"), widthS)
      g.uniform1f(loc(program, "uGain"), seg ? gain : 0)
      g.uniform1f(loc(program, "uDecay"), decay)
      g.drawArrays(g.TRIANGLES, 0, 3)
      current = dst
    }

    const relaxing = () => fieldOn && cfg.relax > 0 && !reduced.matches
    const drifting = () => cfg.speed > 0 && !reduced.matches
    const animating = () => drifting() || strokes.length > 0 || relaxing()

    const render = (dt: number) => {
      const g = gl
      if (!g || lost || !marbleProgram) return
      if (drifting()) time += dt * Math.min(3, cfg.speed)
      const pxS = 2 / Math.max(width, height)

      // Comb strokes queued since the last frame, split so no step moves ink further than the wake is wide.
      let decay = relaxing() ? Math.pow(0.5, dt / cfg.relax) : 1
      if (strokes.length) {
        let length = 0
        let duration = 0
        for (const s of strokes) {
          length += Math.hypot(s.bx - s.ax, s.by - s.ay)
          duration += s.dt
        }
        const speedPx = length / pxS / Math.max(duration / 1000, 1 / 120)
        const fast = Math.min(1, Math.max(0, (speedPx - 150) / 1800))
        const strength = Math.min(2, Math.max(0, cfg.combStrength))
        // Ink right under the stylus keeps pace with it (gain near 1) and is drawn out into a long thread;
        // fast strokes also pull a wider wake. Above 1 the ink would overtake the stylus and fold.
        const widthS = 9 * pxS * (0.6 + 0.4 * strength) * (1 + 1.2 * fast)
        const gain = Math.min(0.98, strength * (0.86 + 0.1 * fast))
        const steps = Math.min(24, Math.max(strokes.length, Math.ceil(length / (widthS * 0.6))))
        const per = length / steps
        let passes = 0
        for (const s of strokes) {
          const len = Math.hypot(s.bx - s.ax, s.by - s.ay)
          const n = Math.max(1, Math.round(len / Math.max(per, 1e-6)))
          for (let i = 0; i < n && passes < 32; i++, passes++) {
            const t0 = i / n
            const t1 = (i + 1) / n
            fieldPass(
              {
                ax: s.ax + (s.bx - s.ax) * t0,
                ay: s.ay + (s.by - s.ay) * t0,
                bx: s.ax + (s.bx - s.ax) * t1,
                by: s.ay + (s.by - s.ay) * t1,
              },
              widthS,
              gain,
              decay
            )
            decay = 1
          }
        }
        energy = Math.min(4, energy + length * gain)
        strokes.length = 0
        fieldOn = gain > 0 || fieldOn
      } else if (decay < 1) {
        fieldPass(null, 1, 0, decay)
      }
      energy *= decay
      // Settled to well under a pixel: drop the field and skip its lookups.
      if (fieldOn && cfg.relax > 0 && !reduced.matches && energy < pxS * 0.25) clearField()

      if (uploaded !== cfg.ops) {
        const packed = packOps(cfg.ops, slots)
        g.useProgram(marbleProgram)
        g.uniform4fv(loc(marbleProgram, "uOps"), packed.data)
        g.uniform1i(loc(marbleProgram, "uCount"), packed.count)
        uploaded = cfg.ops
      }
      const program = marbleProgram
      g.bindFramebuffer(g.FRAMEBUFFER, null)
      g.viewport(0, 0, canvas.width, canvas.height)
      g.useProgram(program)
      g.activeTexture(g.TEXTURE0)
      g.bindTexture(g.TEXTURE_2D, textures[current] ?? null)
      g.uniform1i(loc(program, "uField"), 0)
      g.uniform2f(loc(program, "uTexel"), 1 / fieldW, 1 / fieldH)
      if (colorsFor !== cfg.colors) {
        colorData.fill(0)
        cfg.colors.forEach((c, i) => colorData.set(c, i * 3))
        colorsFor = cfg.colors
      }
      g.uniform3fv(loc(program, "uColors"), colorData)
      g.uniform2f(loc(program, "uAspect"), aspect[0], aspect[1])
      g.uniform1f(loc(program, "uPx"), (2 * aspect[0]) / canvas.width)
      g.uniform1f(loc(program, "uScale"), cfg.scale)
      g.uniform1f(loc(program, "uTime"), time)
      g.uniform1f(loc(program, "uDrift"), 0.02)
      g.uniform1f(loc(program, "uGrain"), Math.min(1, Math.max(0, cfg.paper)))
      g.uniform1f(loc(program, "uFieldOn"), fieldOn ? 1 : 0)
      g.drawArrays(g.TRIANGLES, 0, 3)
      dirty = false

      if (!shown) {
        shown = true
        canvas.style.opacity = "1"
      }
    }

    const frame = (now: number) => {
      raf = 0
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000))
      last = now
      pending += dt
      // Idle drift moves well under a pixel a frame, so 30fps is enough and halves the GPU cost.
      // Strokes and relaxing follow the hand, so they get every frame.
      const live = strokes.length > 0 || relaxing()
      if (dirty || live || (drifting() && pending >= 1 / 30 - 0.004)) {
        render(pending)
        pending = 0
      }
      if (!animating()) return
      // About a second of frames over 24ms: drop the resolution a notch, down to half.
      slow = dt > 0.024 ? slow + 1 : Math.max(0, slow - 2)
      if (slow > 50 && quality > 0.55) {
        quality *= 0.85
        slow = 0
        resize()
      }
      schedule()
    }
    const schedule = () => {
      if (raf || lost || !gl || !visible || document.visibilityState !== "visible") return
      raf = requestAnimationFrame(frame)
    }
    const wake = (reset?: boolean, repaint?: boolean) => {
      if (!gl) {
        if (repaint) paintFallback(fallback, cfg.ops, cfg.colors, width, height, cfg.scale)
        return
      }
      if (reset) clearField()
      dirty = true
      if (!raf) {
        last = performance.now()
        pending = 0
      }
      schedule()
    }
    wakeRef.current = wake

    const toSheet = (e: PointerEvent) => {
      const box = rect ?? root.getBoundingClientRect()
      return {
        x: (((e.clientX - box.left) / box.width) * 2 - 1) * aspect[0],
        y: (1 - ((e.clientY - box.top) / box.height) * 2) * aspect[1],
        t: e.timeStamp,
      }
    }
    const onDown = (e: PointerEvent) => {
      if (!cfg.interactive || !gl || active !== null) return
      if (e.pointerType === "mouse" && e.button !== 0) return
      if (e.target instanceof Element && e.target.closest(INTERACTIVE)) return
      active = e.pointerId
      rect = root.getBoundingClientRect()
      prev = toSheet(e)
      root.setPointerCapture?.(e.pointerId)
      // Stops text selection under the stylus. Touch keeps its default so vertical scrolling still works.
      if (e.pointerType === "mouse") e.preventDefault()
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== active || !prev) return
      const events = e.getCoalescedEvents?.() ?? []
      for (const ev of events.length ? events : [e]) {
        const p = toSheet(ev)
        if (p.x === prev.x && p.y === prev.y) continue
        strokes.push({ ax: prev.x, ay: prev.y, bx: p.x, by: p.y, dt: Math.max(1, p.t - prev.t) })
        prev = p
      }
      if (!raf) {
        last = performance.now()
        pending = 0
      }
      schedule()
    }
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== active) return
      active = null
      prev = null
      rect = null
      if (root.hasPointerCapture?.(e.pointerId)) root.releasePointerCapture(e.pointerId)
    }

    const onLost = (e: Event) => {
      e.preventDefault()
      lost = true
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      canvas.style.visibility = "hidden"
      paintFallback(fallback, cfg.ops, cfg.colors, width, height, cfg.scale)
      fallback.style.display = "block"
    }
    const onRestored = () => {
      lost = false
      if (!init()) {
        gl = null
        return
      }
      canvas.style.visibility = ""
      fallback.style.display = "none"
      fieldW = fieldH = 0
      resize()
      schedule()
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) wake()
    })
    const onVisibility = () => wake()
    const onMotion = () => wake(true)
    const ro = new ResizeObserver(resize)

    const parked = released.get(canvas)
    if (!init()) {
      gl = null
      fallback.style.display = "block"
      if (parked && (canvas.getContext("webgl2") ?? canvas.getContext("webgl"))?.isContextLost()) {
        // Show the CPU sheet until the restored event re-runs init.
        lost = true
        released.delete(canvas)
        parked.restoreContext()
      }
    }
    resize()
    ro.observe(root)
    io.observe(root)
    document.addEventListener("visibilitychange", onVisibility)
    reduced.addEventListener("change", onMotion)
    canvas.addEventListener("webglcontextlost", onLost)
    canvas.addEventListener("webglcontextrestored", onRestored)
    root.addEventListener("pointerdown", onDown)
    root.addEventListener("pointermove", onMove)
    root.addEventListener("pointerup", onUp)
    root.addEventListener("pointercancel", onUp)
    root.addEventListener("lostpointercapture", onUp)
    schedule()

    return () => {
      if (raf) cancelAnimationFrame(raf)
      wakeRef.current = () => {}
      ro.disconnect()
      io.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      reduced.removeEventListener("change", onMotion)
      canvas.removeEventListener("webglcontextlost", onLost)
      canvas.removeEventListener("webglcontextrestored", onRestored)
      root.removeEventListener("pointerdown", onDown)
      root.removeEventListener("pointermove", onMove)
      root.removeEventListener("pointerup", onUp)
      root.removeEventListener("pointercancel", onUp)
      root.removeEventListener("lostpointercapture", onUp)
      if (gl) {
        textures.forEach((t) => gl!.deleteTexture(t))
        buffers.forEach((b) => gl!.deleteFramebuffer(b))
        gl.deleteBuffer(quad)
        gl.deleteProgram(marbleProgram)
        gl.deleteProgram(fieldProgram)
        // Browsers cap live contexts; hand this one back now rather than at garbage collection.
        const ext = gl.getExtension("WEBGL_lose_context")
        if (ext) {
          ext.loseContext()
          released.set(canvas, ext)
        }
      }
    }
  }, [])

  return (
    <div
      ref={rootRef}
      data-slot="marbled-paper"
      className={cn("relative isolate overflow-hidden", className)}
      style={{
        backgroundColor: colors[0],
        // Horizontal drags comb; vertical drags still scroll the page on touch.
        touchAction: interactive ? "pan-y pinch-zoom" : undefined,
        ...style,
      }}
      {...props}
    >
      <canvas
        ref={fallbackRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden size-full"
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 block size-full opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
      />
      {children !== undefined && (
        <div data-slot="marbled-paper-content" className={cn("relative size-full", contentClassName)}>
          {children}
        </div>
      )}
    </div>
  )
}
