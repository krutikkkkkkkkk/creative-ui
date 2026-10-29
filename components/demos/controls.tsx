"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

/** Small controls for the component previews, built on shadcn primitives. */

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
  return <Card className={cn("w-full shrink-0 gap-4 p-4 shadow-none sm:w-56", className)} {...props} />
}

export function DemoStage({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex min-w-0 flex-1 items-center justify-center", className)} {...props} />
}

function ControlLabel({ children, ...props }: React.ComponentProps<typeof Label>) {
  return (
    <Label className="justify-between text-xs font-normal text-muted-foreground" {...props}>
      {children}
    </Label>
  )
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
  return (
    <div className="flex flex-col gap-2.5">
      <ControlLabel asChild>
        <span>
          {label}
          <span className="font-mono text-foreground tabular-nums">{format(value)}</span>
        </span>
      </ControlLabel>
      <Slider
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
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
  const id = React.useId()
  return (
    <div className="flex flex-col gap-1.5">
      <ControlLabel id={id} asChild>
        <span>{label}</span>
      </ControlLabel>
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        spacing={1}
        aria-labelledby={id}
        value={value}
        // Radix lets a single group deselect; keep one option always picked.
        onValueChange={(v) => v && onChange(v as T)}
        className="flex-wrap"
      >
        {options.map((o) => (
          <ToggleGroupItem
            key={o.value}
            value={o.value}
            className="h-6 min-w-0 px-2 text-xs data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            {o.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
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
  const id = React.useId()
  return (
    <div className="flex flex-col gap-1.5">
      <ControlLabel id={id} asChild>
        <span>{label}</span>
      </ControlLabel>
      <ToggleGroup
        type="single"
        spacing={1.5}
        aria-labelledby={id}
        value={value}
        onValueChange={(v) => v && onChange(v)}
        className="flex-wrap"
      >
        {options.map((o) => (
          <ToggleGroupItem
            key={o.value}
            value={o.value}
            title={o.label}
            aria-label={o.label}
            className="size-6 min-w-0 rounded-full border p-0 transition-shadow hover:bg-transparent data-[state=on]:bg-transparent data-[state=on]:ring-2 data-[state=on]:ring-ring data-[state=on]:ring-offset-2 data-[state=on]:ring-offset-background"
            style={{ background: o.value }}
          />
        ))}
      </ToggleGroup>
    </div>
  )
}

export function Text({
  label,
  value,
  onChange,
  placeholder,
  maxLength = 32,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  maxLength?: number
}) {
  const id = React.useId()
  return (
    <div className="flex flex-col gap-1.5">
      <ControlLabel htmlFor={id}>{label}</ControlLabel>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        spellCheck={false}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
        // 16px below md stops iOS zooming in on focus.
        className="h-8 md:text-xs"
      />
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
  const id = React.useId()
  return (
    <div className="flex items-center justify-between gap-3">
      <ControlLabel htmlFor={id}>{label}</ControlLabel>
      <Switch id={id} size="sm" checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
