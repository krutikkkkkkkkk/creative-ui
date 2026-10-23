"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/** Small, dependency-free controls for the component previews. */

export function DemoPanel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex w-full max-w-3xl flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-6",
        className
      )}
      {...props}
    />
  )
}

export function DemoControls({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex w-full shrink-0 flex-col gap-4 rounded-xl border bg-card p-4 sm:w-56", className)}
      {...props}
    />
  )
}

export function DemoStage({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex min-w-0 flex-1 items-center justify-center", className)} {...props} />
}

export function Range({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  format = (v: number) => String(v),
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  format?: (v: number) => string
}) {
  const id = React.useId()
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5 text-xs">
      <span className="flex items-center justify-between text-muted-foreground">
        {label}
        <span className="font-mono text-foreground tabular-nums">{format(value)}</span>
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-foreground"
      />
    </label>
  )
}

export function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-col gap-1.5 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <Button
            key={o.value}
            type="button"
            size="xs"
            variant={o.value === value ? "default" : "outline"}
            aria-pressed={o.value === value}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

export function Swatches({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            title={o.label}
            aria-label={o.label}
            aria-pressed={o.value === value}
            onClick={() => onChange(o.value)}
            className={cn(
              "size-6 rounded-full border transition-shadow",
              o.value === value && "ring-2 ring-ring ring-offset-2 ring-offset-background"
            )}
            style={{ background: o.value }}
          />
        ))}
      </div>
    </div>
  )
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-xs text-muted-foreground">
      {label}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-3.5 accent-foreground"
      />
    </label>
  )
}
