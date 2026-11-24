"use client"

import * as React from "react"

export type BillowGalleryItem = {
  src: string
  alt?: string
  /** Width over height of the card. The image is cropped to fill it. Defaults cycle through a few portrait shapes. */
  aspect?: number
  /** Turns the card into a link. */
  href?: string
  target?: "_self" | "_blank"
}

export interface BillowGalleryProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onSelect"> {
  items: BillowGalleryItem[]

  /* Layout */
  /** Card width in px. Scaled down on narrow containers. */
  columnWidth?: number
  /** Space between cards in px. */
  gap?: number
  /** Card corner radius in px. */
  radius?: number

  /* Paper */
  /** How far the sheets curl while the wall is moving. 0 keeps them flat. */
  bend?: number
  /** Height of the swell rolling across the wall. 0 stills it. */
  crest?: number
  /** Camera distance in px. Lower exaggerates the depth. */
  perspective?: number
  shadow?: boolean
  /** Shadow colour as `#rrggbb`. */
  shadowColor?: string

  /* Motion */
  /** Idle drift in px per second. Eases to a stop while hovered. 0 turns it off. */
  drift?: number
  draggable?: boolean
  /** Pan with the mouse wheel or trackpad while hovering. */
  wheel?: boolean

  /** Called when a card is clicked or tapped (not dragged). */
  onSelect?: (item: BillowGalleryItem, index: number) => void
}

const DEFAULTS = {
  columnWidth: 260,
  gap: 56,
  radius: 10,
  bend: 1,
  crest: 1,
  perspective: 1100,
  shadow: true,
  shadowColor: "#26303d",
  drift: 18,
  draggable: true,
  wheel: true,
}

type Settings = typeof DEFAULTS

/** Portrait shapes cycled through when an item has no `aspect`. */
const ASPECTS = [0.78, 0.68, 0.84, 0.72, 0.9, 0.66]
const SEGMENTS = 22
/** Wavelength of the swell, px. */
const SWELL = 920
/** How high a hovered or focused card lifts toward the camera, px. */
const LIFT = 42
/** Oblique view: how far a point shifts on screen per px it rises. */
const TILT_X = -0.28
const TILT_Y = -0.5

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const mod = (a: number, n: number) => ((a % n) + n) % n
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  const v = m ? parseInt(m[1], 16) : 0x26303d
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255]
}

/** The swell at a screen point, -1 to 1. Mirrors `swell()` in the vertex shader. */
function swell(x: number, y: number, t: number) {
  const k = (Math.PI * 2) / SWELL
  return (
    Math.sin((x * 0.62 + y * 0.78) * k - t * 0.6) * 0.65 +
    Math.sin((-x * 0.8 + y * 0.6) * k * 1.6 + t * 0.45 + 1.3) * 0.35
  )
}

/* ------------------------------------------------------------------ */
/* Layout: staggered columns that wrap on both axes.                   */
/* ------------------------------------------------------------------ */

type Cell = { item: number; x: number; y: number; w: number; h: number; col: number; seed: number }
type Layout = {
  cells: Cell[]
  periodX: number
  periodY: number[]
  /** Lower bounds used when wrapping, so a card straddling the edge is still drawn. */
  loX: number
  loY: number
  margin: number
  scale: number
  step: number
}

function buildLayout(items: BillowGalleryItem[], viewW: number, viewH: number, s: Settings): Layout {
  const n = items.length
  const scale = clamp(viewW / 720, 0.56, 1)
  const colW = s.columnWidth * scale
  const gap = s.gap * scale
  const step = colW + gap
  const maxH = colW / 0.4
  // Headroom past the edges, so cards bending in from outside are already there.
  const margin = colW * 0.5 + gap
  const loX = margin + colW
  const loY = margin + maxH
  const cols = Math.max(2, Math.ceil((viewW + margin + loX) / step) + 1)
  // Stride between neighbouring columns, so the same image rarely sits side by side.
  const skip = n > 2 ? Math.max(1, Math.round(n * 0.382)) : 1

  const cells: Cell[] = []
  const periodY: number[] = []
  for (let c = 0; c < cols; c++) {
    const offset = ((c % 2) * 0.5 + hash(c) * 0.35) * colW
    let y = 0
    let r = 0
    while (y < viewH + margin + loY || r < 2) {
      const item = (c * skip + r) % n
      const aspect = clamp(items[item].aspect ?? ASPECTS[item % ASPECTS.length], 0.4, 2.5)
      const h = colW / aspect
      cells.push({ item, x: c * step, y: y + offset, w: colW, h, col: c, seed: hash(c * 31 + r * 7 + 1) })
      y += h + gap
      r++
    }
    periodY.push(y)
  }
  return { cells, periodX: cols * step, periodY, loX, loY, margin, scale, step }
}

/* ------------------------------------------------------------------ */
/* Shaders                                                             */
/* ------------------------------------------------------------------ */

const PROJECT = /* glsl */ `
uniform vec2 uView;
uniform float uPersp;
vec4 project(vec2 p, float z) {
  vec2 c = uView * 0.5;
  z = min(z, uPersp * 0.6);
  // A slightly oblique view: raised paper shifts up and left, away from its shadow.
  p += z * vec2(${TILT_X.toFixed(2)}, ${TILT_Y.toFixed(2)});
  vec2 s = c + (p - c) * (uPersp / (uPersp - z));
  vec2 clip = s / uView * 2.0 - 1.0;
  return vec4(clip.x, -clip.y, 0.0, 1.0);
}
`

const CARD_VERT = /* glsl */ `
attribute vec2 aUv;
uniform vec4 uRect;
uniform vec2 uBend;
uniform float uAmp;
uniform float uCrest;
uniform float uTime;
uniform float uSeed;
uniform float uLift;
varying vec2 vUv;
varying float vShade;
${PROJECT}

float swell(vec2 p) {
  float k = 6.2831853 / ${SWELL.toFixed(1)};
  return sin(dot(p, vec2(0.62, 0.78)) * k - uTime * 0.6) * 0.65
       + sin(dot(p, vec2(-0.8, 0.6)) * k * 1.6 + uTime * 0.45 + 1.3) * 0.35;
}

float height(vec2 uv) {
  vec2 p = uRect.xy + uv * uRect.zw;
  vec2 q = uv * 2.0 - 1.0;
  float seed = uSeed * 6.2831853;

  // The swell rolling under the whole wall, plus each sheet's own slow flutter.
  float z = uCrest * swell(p);
  z += uCrest * 0.55 * sin(q.x * 1.6 + uTime * 0.7 + seed) * cos(q.y * 1.2 - uTime * 0.5 + seed * 0.5);
  // Each sheet has one corner that won't lie flat.
  vec2 corner = vec2(cos(seed * 1.7), sin(seed * 2.3));
  float curl = max(dot(q, normalize(corner)) - 0.2, 0.0);
  z += uCrest * 1.1 * curl * curl * (0.75 + 0.25 * sin(uTime * 0.9 + seed));

  // Moving: the sheet bows along its direction of travel and twists a little.
  float m = length(uBend);
  if (m > 0.0001) {
    vec2 d = uBend / m;
    float s = dot(q, d);
    float t = dot(q, vec2(-d.y, d.x));
    float give = 0.7 + 0.6 * fract(uSeed * 7.13);
    z += uAmp * m * give * (0.9 * s * s - 0.35 + (0.5 * uSeed - 0.25) * 1.6 * s * t);
  }

  // Lifting a sheet smooths it out.
  return z * (1.0 - 0.75 * uLift) + uLift * ${LIFT.toFixed(1)};
}

void main() {
  float e = 1.0 / ${SEGMENTS.toFixed(1)};
  float z = height(aUv);
  float dzx = (height(aUv + vec2(e, 0.0)) - height(aUv - vec2(e, 0.0))) / (2.0 * e * uRect.z);
  float dzy = (height(aUv + vec2(0.0, e)) - height(aUv - vec2(0.0, e))) / (2.0 * e * uRect.w);
  vec3 n = normalize(vec3(-dzx, -dzy, 1.0));
  vec3 l = normalize(vec3(-0.45, -0.65, 1.0));
  vShade = dot(n, l) / l.z;
  vUv = aUv;
  gl_Position = project(uRect.xy + aUv * uRect.zw, z);
}
`

const CARD_FRAG = /* glsl */ `
precision mediump float;
uniform sampler2D uTex;
uniform vec4 uCrop;
uniform vec2 uSize;
uniform float uRadius;
uniform float uAlpha;
uniform float uRing;
uniform vec3 uRingColor;
varying vec2 vUv;
varying float vShade;

void main() {
  vec2 size = uSize;
  vec2 px = (vUv - 0.5) * size;
  vec2 d = abs(px) - (size * 0.5 - uRadius);
  float sd = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - uRadius;
  float a = clamp(0.5 - sd, 0.0, 1.0) * uAlpha;

  vec3 col = texture2D(uTex, uCrop.xy + vUv * uCrop.zw).rgb;
  // Darken the faces turned away from the light, add a little sheen to the ones facing it.
  col *= mix(1.0, vShade, 0.85);
  col += max(vShade - 1.0, 0.0) * 0.35;

  // Focus ring: a light band with a dark edge, inside the card.
  float band = smoothstep(-6.0, -5.0, sd) * (1.0 - smoothstep(-3.0, -2.0, sd));
  float edge = smoothstep(-3.0, -2.0, sd);
  col = mix(col, vec3(1.0), band * uRing);
  col = mix(col, uRingColor, edge * uRing);

  gl_FragColor = vec4(col * a, a);
}
`

const SHADOW_VERT = /* glsl */ `
attribute vec2 aUv;
uniform vec4 uRect;
uniform float uPad;
varying vec2 vPx;
${PROJECT}
void main() {
  vec2 size = uRect.zw + uPad * 2.0;
  vPx = (aUv - 0.5) * size;
  gl_Position = project(uRect.xy - uPad + aUv * size, 0.0);
}
`

const SHADOW_FRAG = /* glsl */ `
precision mediump float;
uniform vec2 uSize;
uniform float uRadius;
uniform float uBlur;
uniform float uStrength;
uniform vec3 uColor;
varying vec2 vPx;
void main() {
  vec2 d = abs(vPx) - (uSize * 0.5 - uRadius);
  float sd = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - uRadius;
  float a = uStrength * (1.0 - smoothstep(-uBlur * 0.7, uBlur, sd));
  gl_FragColor = vec4(uColor * a, a);
}
`

/* ------------------------------------------------------------------ */
/* GL helpers                                                          */
/* ------------------------------------------------------------------ */

type GL = WebGLRenderingContext | WebGL2RenderingContext

function compile(gl: GL, vert: string, frag: string) {
  const make = (type: number, src: string) => {
    const shader = gl.createShader(type)!
    gl.shaderSource(shader, src)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) ?? "Shader failed to compile")
    }
    return shader
  }
  const program = gl.createProgram()!
  gl.attachShader(program, make(gl.VERTEX_SHADER, vert))
  gl.attachShader(program, make(gl.FRAGMENT_SHADER, frag))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? "Program failed to link")
  }
  const uniforms: Record<string, WebGLUniformLocation | null> = {}
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(program, i)
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name)
  }
  return { program, uniforms, aUv: gl.getAttribLocation(program, "aUv") }
}

/** WebGL1 can only mipmap power-of-two textures, so redraw the image onto one. */
function toPowerOfTwo(img: HTMLImageElement) {
  const pot = (v: number) => clamp(2 ** Math.round(Math.log2(v)), 64, 1024)
  const canvas = document.createElement("canvas")
  canvas.width = pot(img.naturalWidth)
  canvas.height = pot(img.naturalHeight)
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas
}

type Tex = { img: HTMLImageElement; tex: WebGLTexture | null; ready: number; aspect: number }

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

function splitProps(props: Record<string, unknown>) {
  const settings: Record<string, unknown> = { ...DEFAULTS }
  const rest: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(props)) {
    if (key in DEFAULTS) {
      if (value !== undefined) settings[key] = value
    } else rest[key] = value
  }
  return { settings: settings as Settings, rest: rest as React.HTMLAttributes<HTMLDivElement> }
}

type Visible = { cell: number; item: number; x: number; y: number; w: number; h: number; z: number }

export function BillowGallery({
  items,
  onSelect,
  className,
  style,
  "aria-label": ariaLabel = "Image gallery",
  ...props
}: BillowGalleryProps) {
  const { settings: s, rest } = splitProps(props)
  const [fallback, setFallback] = React.useState(false)

  const rootRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const linkRefs = React.useRef<(HTMLElement | null)[]>([])
  const settingsRef = React.useRef(s)
  const itemsRef = React.useRef(items)
  const onSelectRef = React.useRef(onSelect)

  const state = React.useRef({
    cam: { x: 0, y: 0 },
    prevCam: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    seek: null as { x: number; y: number } | null,
    bend: { x: 0, y: 0 },
    bendVel: { x: 0, y: 0 },
    motion: { x: 0, y: 0 },
    driftAmount: 1,
    dragging: false,
    hovering: false,
    focused: false,
    pointer: null as { x: number; y: number } | null,
    hoverCell: -1,
    focusCell: -1,
    lift: new Map<number, number>(),
    visible: [] as Visible[],
    layout: null as Layout | null,
    layoutDirty: true,
    view: { w: 0, h: 0 },
    onScreen: true,
    reduced: false,
  })
  const drag = React.useRef<{
    id: number
    startX: number
    startY: number
    lastX: number
    lastY: number
    moved: boolean
    samples: { t: number; x: number; y: number }[]
  } | null>(null)

  React.useEffect(() => {
    const prev = settingsRef.current
    if (prev.columnWidth !== s.columnWidth || prev.gap !== s.gap) state.current.layoutDirty = true
    settingsRef.current = s
    itemsRef.current = items
    onSelectRef.current = onSelect
  })

  // Items are compared by their sources so an inline array doesn't rebuild the wall every render.
  const itemsKey = items.map((i) => `${i.src}|${i.aspect ?? ""}`).join("\n")
  React.useEffect(() => {
    state.current.layoutDirty = true
  }, [itemsKey])

  React.useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return

    const attrs: WebGLContextAttributes = { alpha: true, antialias: true, premultipliedAlpha: true }
    const gl = (canvas.getContext("webgl2", attrs) ?? canvas.getContext("webgl", attrs)) as GL | null
    if (!gl) {
      setFallback(true)
      return
    }
    const isGL2 = typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext
    const st = state.current
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    st.reduced = mq.matches

    let card: ReturnType<typeof compile>
    let shade: ReturnType<typeof compile>
    let mesh: { vbo: WebGLBuffer; ibo: WebGLBuffer; count: number }
    let quad: WebGLBuffer
    let blank: WebGLTexture
    const textures = new Map<string, Tex>()

    const upload = (t: Tex) => {
      const tex = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, isGL2 ? t.img : toPowerOfTwo(t.img))
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      t.tex = tex
    }

    const textureFor = (src: string) => {
      let t = textures.get(src)
      if (t) return t
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.decoding = "async"
      t = { img, tex: null, ready: 0, aspect: 1 }
      const entry = t
      img.onload = () => {
        if (gl.isContextLost()) return
        entry.aspect = img.naturalWidth / img.naturalHeight
        upload(entry)
        entry.ready = performance.now()
      }
      img.src = src
      textures.set(src, t)
      return t
    }

    const init = () => {
      card = compile(gl, CARD_VERT, CARD_FRAG)
      shade = compile(gl, SHADOW_VERT, SHADOW_FRAG)

      const verts: number[] = []
      for (let y = 0; y <= SEGMENTS; y++)
        for (let x = 0; x <= SEGMENTS; x++) verts.push(x / SEGMENTS, y / SEGMENTS)
      const idx: number[] = []
      for (let y = 0; y < SEGMENTS; y++)
        for (let x = 0; x < SEGMENTS; x++) {
          const a = y * (SEGMENTS + 1) + x
          const b = a + SEGMENTS + 1
          idx.push(a, b, a + 1, a + 1, b, b + 1)
        }
      const vbo = gl.createBuffer()!
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW)
      const ibo = gl.createBuffer()!
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW)
      mesh = { vbo, ibo, count: idx.length }

      quad = gl.createBuffer()!
      gl.bindBuffer(gl.ARRAY_BUFFER, quad)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW)

      blank = gl.createTexture()!
      gl.bindTexture(gl.TEXTURE_2D, blank)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]))

      gl.disable(gl.DEPTH_TEST)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

      for (const t of textures.values()) {
        t.tex = null
        if (t.img.complete && t.img.naturalWidth) upload(t)
      }
    }

    try {
      init()
    } catch (err) {
      console.error(err)
      setFallback(true)
      return
    }

    let dpr = 1
    const resize = () => {
      const rect = root.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      st.view = { w: rect.width, h: rect.height }
      canvas.width = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = Math.max(1, Math.round(rect.height * dpr))
      st.layoutDirty = true
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(root)

    const io = new IntersectionObserver(([entry]) => {
      st.onScreen = entry.isIntersecting
    })
    io.observe(root)

    const onMotion = () => {
      st.reduced = mq.matches
    }
    mq.addEventListener("change", onMotion)

    let lost = false
    const onLost = (e: Event) => {
      e.preventDefault()
      lost = true
    }
    const onRestored = () => {
      try {
        init()
        lost = false
      } catch {
        setFallback(true)
      }
    }
    canvas.addEventListener("webglcontextlost", onLost)
    canvas.addEventListener("webglcontextrestored", onRestored)

    const start = performance.now()
    let last = start
    let raf = 0
    let cursor = ""

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if (lost || !st.onScreen || document.hidden || dt <= 0) return
      const c = settingsRef.current
      const list = itemsRef.current
      const { w: vw, h: vh } = st.view
      if (!list.length || vw < 1 || vh < 1) return

      if (st.layoutDirty || !st.layout) {
        st.layout = buildLayout(list, vw, vh, c)
        st.layoutDirty = false
        st.lift.clear()
        st.hoverCell = -1
        st.focusCell = -1
      }
      const L = st.layout
      const frames = dt * 60
      const reduced = st.reduced
      const t = reduced ? 0 : (now - start) / 1000

      /* Camera */
      const held = st.hovering || st.focused || st.dragging
      const driftGoal = c.drift > 0 && !reduced && !held ? 1 : 0
      st.driftAmount += (driftGoal - st.driftAmount) * (1 - Math.pow(0.95, frames))

      if (st.seek) {
        const k = reduced ? 1 : 1 - Math.pow(1 - 0.2, frames)
        st.cam.x += (st.seek.x - st.cam.x) * k
        st.cam.y += (st.seek.y - st.cam.y) * k
        if (Math.hypot(st.seek.x - st.cam.x, st.seek.y - st.cam.y) < 0.5) {
          st.cam = { ...st.seek }
          st.seek = null
        }
      } else if (!st.dragging) {
        st.cam.x += st.vel.x * dt
        st.cam.y += st.vel.y * dt
        const glide = Math.pow(reduced ? 0.8 : 0.94, frames)
        st.vel.x *= glide
        st.vel.y *= glide
        if (Math.hypot(st.vel.x, st.vel.y) < 2) st.vel = { x: 0, y: 0 }
      }
      st.cam.y += c.drift * L.scale * st.driftAmount * dt

      /* Bend: a soft spring chasing the wall's velocity, so sheets flutter back when it stops. */
      const mx = (st.cam.x - st.prevCam.x) / dt
      const my = (st.cam.y - st.prevCam.y) / dt
      st.prevCam = { ...st.cam }
      st.motion.x += (mx - st.motion.x) * 0.5
      st.motion.y += (my - st.motion.y) * 0.5
      let tx = -st.motion.x / 1400
      let ty = -st.motion.y / 1400
      const tm = Math.hypot(tx, ty)
      if (tm > 1.2) {
        tx *= 1.2 / tm
        ty *= 1.2 / tm
      }
      for (let i = 0; i < 4; i++) {
        const h = dt / 4
        st.bendVel.x += (170 * (tx - st.bend.x) - 15 * st.bendVel.x) * h
        st.bendVel.y += (170 * (ty - st.bend.y) - 15 * st.bendVel.y) * h
        st.bend.x += st.bendVel.x * h
        st.bend.y += st.bendVel.y * h
      }

      /* Place the cards on screen */
      const crestPx = c.crest * 44 * L.scale
      const visible: Visible[] = []
      for (let i = 0; i < L.cells.length; i++) {
        const cell = L.cells[i]
        const x = mod(cell.x - st.cam.x + L.loX, L.periodX) - L.loX
        const y = mod(cell.y - st.cam.y + L.loY, L.periodY[cell.col]) - L.loY
        if (x > vw + L.margin || y > vh + L.margin || x + cell.w < -L.margin || y + cell.h < -L.margin) continue
        const z = crestPx * swell(x + cell.w / 2, y + cell.h / 2, t)
        visible.push({ cell: i, item: cell.item, x, y, w: cell.w, h: cell.h, z })
      }
      st.visible = visible

      /* Hover: the card under the pointer lifts */
      const scaleAt = (z: number) => c.perspective / (c.perspective - z)
      let hover = -1
      if (st.pointer && !st.dragging) {
        const p = st.pointer
        for (let i = visible.length - 1; i >= 0; i--) {
          const v = visible[i]
          const z = v.z + (st.lift.get(v.cell) ?? 0) * LIFT
          const k = scaleAt(z)
          const x0 = vw / 2 + (v.x + z * TILT_X - vw / 2) * k
          const y0 = vh / 2 + (v.y + z * TILT_Y - vh / 2) * k
          if (p.x >= x0 && p.x <= x0 + v.w * k && p.y >= y0 && p.y <= y0 + v.h * k) {
            hover = v.cell
            break
          }
        }
      }
      st.hoverCell = hover
      const want = hover >= 0 && (list[L.cells[hover].item]?.href || onSelectRef.current) ? "pointer" : ""
      const nextCursor = st.dragging ? "grabbing" : want || (c.draggable ? "grab" : "")
      if (nextCursor !== cursor) {
        cursor = nextCursor
        root.style.cursor = cursor
      }

      const liftEase = 1 - Math.pow(reduced ? 0.5 : 0.82, frames)
      for (const v of visible) {
        const goal = v.cell === st.hoverCell || v.cell === st.focusCell ? 1 : 0
        const cur = st.lift.get(v.cell) ?? 0
        if (cur === goal) continue
        const next = cur + (goal - cur) * liftEase
        st.lift.set(v.cell, Math.abs(goal - next) < 0.002 ? goal : next)
      }

      /* Draw */
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      // Lifted cards draw last, on top of their neighbours.
      visible.sort((a, b) => (st.lift.get(a.cell) ?? 0) - (st.lift.get(b.cell) ?? 0))

      const alphaOf = (v: Visible) => {
        const tex = textureFor(list[v.item].src)
        if (!tex.tex || !tex.ready) return { tex, alpha: 0 }
        const k = clamp((now - tex.ready) / 520, 0, 1)
        return { tex, alpha: reduced ? 1 : 1 - Math.pow(1 - k, 3) }
      }

      if (c.shadow) {
        const [r, g, b] = hexToRgb(c.shadowColor)
        gl.useProgram(shade.program)
        gl.bindBuffer(gl.ARRAY_BUFFER, quad)
        gl.enableVertexAttribArray(shade.aUv)
        gl.vertexAttribPointer(shade.aUv, 2, gl.FLOAT, false, 0, 0)
        const u = shade.uniforms
        gl.uniform2f(u.uView, vw, vh)
        gl.uniform1f(u.uPersp, c.perspective)
        gl.uniform3f(u.uColor, r, g, b)
        for (const v of visible) {
          const { alpha } = alphaOf(v)
          if (alpha <= 0) continue
          const lift = st.lift.get(v.cell) ?? 0
          // Sheets riding high on the swell cast longer, softer shadows.
          const height = clamp((v.z / Math.max(crestPx, 1)) * 0.5 + 0.5, 0, 1) * (crestPx > 0 ? 1 : 0)
          const inset = v.w * 0.06
          const blur = (22 + 12 * height + 18 * lift) * L.scale
          const drop = (20 + 14 * height + 22 * lift) * L.scale
          gl.uniform4f(u.uRect, v.x + inset, v.y + drop, v.w - inset * 2, v.h - inset)
          gl.uniform2f(u.uSize, v.w - inset * 2, v.h - inset)
          gl.uniform1f(u.uPad, blur * 1.2)
          gl.uniform1f(u.uRadius, Math.min(c.radius * 2, v.w / 2))
          gl.uniform1f(u.uBlur, blur)
          gl.uniform1f(u.uStrength, (0.2 + 0.05 * lift - 0.04 * height) * alpha)
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        }
      }

      gl.useProgram(card.program)
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vbo)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.ibo)
      gl.enableVertexAttribArray(card.aUv)
      gl.vertexAttribPointer(card.aUv, 2, gl.FLOAT, false, 0, 0)
      const u = card.uniforms
      gl.uniform2f(u.uView, vw, vh)
      gl.uniform1f(u.uPersp, c.perspective)
      gl.uniform1f(u.uTime, t)
      gl.uniform1f(u.uCrest, reduced ? 0 : crestPx)
      gl.uniform1f(u.uAmp, c.bend * 110 * L.scale * (reduced ? 0.3 : 1))
      gl.uniform2f(u.uBend, st.bend.x, st.bend.y)
      const [rr, rg, rb] = hexToRgb(c.shadowColor)
      gl.uniform3f(u.uRingColor, rr, rg, rb)
      gl.uniform1i(u.uTex, 0)
      gl.activeTexture(gl.TEXTURE0)
      for (const v of visible) {
        const { tex, alpha } = alphaOf(v)
        if (alpha <= 0) continue
        const cardAspect = v.w / v.h
        let sx = 1
        let sy = 1
        if (tex.aspect > cardAspect) sx = cardAspect / tex.aspect
        else sy = tex.aspect / cardAspect
        gl.bindTexture(gl.TEXTURE_2D, tex.tex ?? blank)
        gl.uniform4f(u.uRect, v.x, v.y, v.w, v.h)
        gl.uniform2f(u.uSize, v.w, v.h)
        gl.uniform4f(u.uCrop, (1 - sx) / 2, (1 - sy) / 2, sx, sy)
        gl.uniform1f(u.uSeed, L.cells[v.cell].seed)
        gl.uniform1f(u.uLift, st.lift.get(v.cell) ?? 0)
        gl.uniform1f(u.uRadius, Math.min(c.radius, v.w / 2))
        gl.uniform1f(u.uAlpha, alpha)
        gl.uniform1f(u.uRing, v.cell === st.focusCell ? 1 : 0)
        gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0)
      }
    }
    raf = requestAnimationFrame(tick)

    // Wheel and trackpad pan the wall. Needs a non-passive listener to stop the page scrolling.
    const onWheel = (e: WheelEvent) => {
      if (!settingsRef.current.wheel) return
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? st.view.h : 1
      let dx = e.deltaX * unit
      let dy = e.deltaY * unit
      if (e.shiftKey && !dx) [dx, dy] = [dy, 0]
      if (!dx && !dy) return
      e.preventDefault()
      st.seek = null
      st.vel = { x: 0, y: 0 }
      st.cam.x += dx
      st.cam.y += dy
    }
    root.addEventListener("wheel", onWheel, { passive: false })

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      mq.removeEventListener("change", onMotion)
      canvas.removeEventListener("webglcontextlost", onLost)
      canvas.removeEventListener("webglcontextrestored", onRestored)
      root.removeEventListener("wheel", onWheel)
      for (const t of textures.values()) {
        t.img.onload = null
        if (t.tex) gl.deleteTexture(t.tex)
      }
      if (!gl.isContextLost()) {
        gl.deleteTexture(blank)
        gl.deleteBuffer(mesh.vbo)
        gl.deleteBuffer(mesh.ibo)
        gl.deleteBuffer(quad)
        gl.deleteProgram(card.program)
        gl.deleteProgram(shade.program)
      }
    }
  }, [])

  /* Pointer */

  const localPoint = (e: React.PointerEvent) => {
    const rect = rootRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const activate = (cellIndex: number) => {
    const L = state.current.layout
    if (!L || cellIndex < 0) return
    const index = L.cells[cellIndex].item
    const item = items[index]
    if (!item) return
    onSelectRef.current?.(item, index)
    if (item.href) linkRefs.current[index]?.click()
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || drag.current) return
    const st = state.current
    st.seek = null
    st.vel = { x: 0, y: 0 }
    drag.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      moved: false,
      samples: [{ t: performance.now(), x: st.cam.x, y: st.cam.y }],
    }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = state.current
    if (e.pointerType === "mouse") st.pointer = localPoint(e)
    const d = drag.current
    if (!d || d.id !== e.pointerId || !s.draggable) return
    if (!d.moved) {
      if (Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 5) return
      // Capture only once it's clearly a drag, so a plain tap still selects a card.
      d.moved = true
      st.dragging = true
      e.currentTarget.setPointerCapture(e.pointerId)
      d.lastX = e.clientX
      d.lastY = e.clientY
    }
    st.cam.x -= e.clientX - d.lastX
    st.cam.y -= e.clientY - d.lastY
    d.lastX = e.clientX
    d.lastY = e.clientY
    const now = performance.now()
    d.samples.push({ t: now, x: st.cam.x, y: st.cam.y })
    while (d.samples.length > 2 && now - d.samples[0].t > 100) d.samples.shift()
  }

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    drag.current = null
    const st = state.current
    if (!d.moved) {
      if (e.type === "pointerup") {
        // A tap: find the card under it. Touch has no hover, so test the point directly.
        st.pointer = localPoint(e)
        requestAnimationFrame(() => {
          activate(st.hoverCell)
          if (e.pointerType !== "mouse") st.pointer = null
        })
      }
      return
    }
    st.dragging = false
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
    const now = performance.now()
    const first = d.samples[0]
    const lastSample = d.samples[d.samples.length - 1]
    if (now - lastSample.t > 80 || now <= first.t) return
    const k = 1000 / (now - first.t)
    st.vel = {
      x: clamp((lastSample.x - first.x) * k, -4000, 4000),
      y: clamp((lastSample.y - first.y) * k, -4000, 4000),
    }
  }

  /* Keyboard: arrows pan, links in the hidden list bring their card into view. */

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const st = state.current
    const L = st.layout
    if (!L) return
    const step = L.step
    const dir: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    }
    const move = dir[e.key]
    if (!move) return
    e.preventDefault()
    const base = st.seek ?? st.cam
    st.vel = { x: 0, y: 0 }
    st.seek = { x: base.x + move[0], y: base.y + move[1] }
  }

  const focusItem = (index: number) => {
    const st = state.current
    const L = st.layout
    if (!L) return
    st.focused = true
    // Bring the nearest copy of the item to the centre.
    const cx = st.view.w / 2
    const cy = st.view.h / 2
    let best: { cell: number; dx: number; dy: number; dist: number } | null = null
    for (let i = 0; i < L.cells.length; i++) {
      const cell = L.cells[i]
      if (cell.item !== index) continue
      const x = mod(cell.x - st.cam.x + L.loX, L.periodX) - L.loX
      const y = mod(cell.y - st.cam.y + L.loY, L.periodY[cell.col]) - L.loY
      const dx = x + cell.w / 2 - cx
      const dy = y + cell.h / 2 - cy
      const dist = Math.hypot(dx, dy)
      if (!best || dist < best.dist) best = { cell: i, dx, dy, dist }
    }
    if (!best) return
    st.focusCell = best.cell
    st.vel = { x: 0, y: 0 }
    st.seek = { x: st.cam.x + best.dx, y: st.cam.y + best.dy }
  }

  const blurItem = () => {
    state.current.focusCell = -1
  }

  if (fallback) {
    return (
      <div
        {...rest}
        role="region"
        aria-label={ariaLabel}
        className={["relative overflow-auto", className].filter(Boolean).join(" ")}
        style={style}
      >
        <ul className="m-0 list-none p-6" style={{ columnWidth: s.columnWidth, columnGap: s.gap }}>
          {items.map((item, i) => {
            const img = (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.src}
                alt={item.alt ?? ""}
                loading="lazy"
                className="block w-full object-cover"
                style={{
                  aspectRatio: item.aspect ?? ASPECTS[i % ASPECTS.length],
                  borderRadius: s.radius,
                }}
              />
            )
            return (
              <li key={i} className="break-inside-avoid" style={{ marginBottom: s.gap }}>
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.target}
                    rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                    onClick={() => onSelect?.(item, i)}
                  >
                    {img}
                  </a>
                ) : onSelect ? (
                  <button type="button" className="block w-full" onClick={() => onSelect(item, i)}>
                    {img}
                  </button>
                ) : (
                  img
                )}
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  return (
    <div
      {...rest}
      ref={rootRef}
      role="region"
      aria-roledescription="gallery"
      aria-label={ariaLabel}
      tabIndex={0}
      className={[
        "relative overflow-hidden select-none outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ touchAction: s.draggable ? "none" : "pan-y", ...style }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") state.current.hovering = true
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return
        state.current.hovering = false
        state.current.pointer = null
      }}
      onFocus={(e) => {
        if (e.target === e.currentTarget) state.current.focused = true
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          state.current.focused = false
          state.current.focusCell = -1
        }
      }}
      onKeyDown={onKeyDown}
    >
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 block size-full" />
      {/* The wall is drawn on a canvas; this list carries it for screen readers and keyboard users. */}
      <ul className="sr-only">
        {items.map((item, i) => {
          const ref = (el: HTMLElement | null) => {
            linkRefs.current[i] = el
          }
          const handlers = { onFocus: () => focusItem(i), onBlur: blurItem }
          return (
            <li key={i}>
              {item.href ? (
                <a
                  ref={ref}
                  href={item.href}
                  target={item.target}
                  rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                  {...handlers}
                >
                  {item.alt || item.href}
                </a>
              ) : onSelect ? (
                <button ref={ref} type="button" onClick={() => onSelect(item, i)} {...handlers}>
                  {item.alt || `Image ${i + 1}`}
                </button>
              ) : (
                <span>{item.alt}</span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
