"use client"

import * as React from "react"

import { COLLECTIONS, LIVE_UI_STYLES, UI_STYLE_COOKIE, isLiveUiStyle, isUiStyle, type UiStyle } from "@/lib/ui-style"
import { cn } from "@/lib/utils"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

/* Switches the whole site between its two looks, and with them its two collections. Each option
   is set in its own display face, so "Aa" in serif and "Aa" in tight sans say what they do. The
   looks are separate prerendered trees (app/[style]), so a switch saves the cookie and reloads
   into the other one. A look that is not live yet stays in the toggle, marked as work in
   progress: it cannot be chosen, and pressing it says why. */

const FACES: Record<UiStyle, string> = {
  classic: "font-[family-name:var(--font-geist-serif-regular)] font-normal",
  modern: "font-sans font-semibold tracking-[-0.06em]",
}

const OPTIONS = (Object.keys(FACES) as UiStyle[]).map((value) => {
  const live = LIVE_UI_STYLES.includes(value)
  return {
    value,
    live,
    label: live ? `${COLLECTIONS[value].label}: ${COLLECTIONS[value].tag}` : `${COLLECTIONS[value].label}: work in progress`,
    face: FACES[value],
  }
})

/** How long a press holds the work-in-progress note open. A tap has no hover to keep it up. */
const NOTE_MS = 2200

export function StyleToggle({ style, className }: { style: UiStyle; className?: string }) {
  const [noteOpen, setNoteOpen] = React.useState(false)
  const heldUntil = React.useRef(0)
  const timer = React.useRef<number | undefined>(undefined)
  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  function holdNote() {
    heldUntil.current = Date.now() + NOTE_MS
    setNoteOpen(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setNoteOpen(false), NOTE_MS)
  }

  // The tooltip closes itself on press; while the note is held, that close is ignored.
  function onNoteOpenChange(open: boolean) {
    if (!open && Date.now() < heldUntil.current) return
    setNoteOpen(open)
  }

  function choose(value: string) {
    if (!isUiStyle(value) || value === style) return
    if (!isLiveUiStyle(value)) return holdNote()
    document.cookie = `${UI_STYLE_COOKIE}=${value}; path=/; max-age=31536000; samesite=lax`
    window.location.reload()
  }

  return (
    <TooltipProvider delayDuration={300}>
      <ToggleGroup
        type="single"
        value={style}
        onValueChange={choose}
        aria-label="Site look"
        // A spacing other than 0 keeps the items as separate pills; at 0 the group squares them off.
        spacing={0.5}
        className={cn("h-8 rounded-full border p-0.5", className)}
      >
        {OPTIONS.map((o) => (
          <Tooltip
            key={o.value}
            open={o.live ? undefined : noteOpen}
            onOpenChange={o.live ? undefined : onNoteOpenChange}
          >
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value={o.value}
                aria-label={o.label}
                aria-disabled={o.live ? undefined : true}
                onPointerDown={o.live ? undefined : holdNote}
                // Selected is styled from aria-checked: the tooltip trigger overwrites data-state.
                className={cn(
                  "h-full min-w-0 rounded-full px-2 text-[13px] leading-none text-muted-foreground hover:bg-transparent hover:text-foreground aria-checked:bg-foreground aria-checked:text-background aria-checked:hover:bg-foreground aria-checked:hover:text-background",
                  o.face,
                  !o.live && "cursor-not-allowed gap-1 text-muted-foreground/55 hover:text-muted-foreground/55"
                )}
              >
                Aa
                {!o.live && (
                  <span
                    aria-hidden
                    className="hidden font-mono text-[9px] font-medium tracking-[.08em] text-muted-foreground uppercase lg:inline"
                  >
                    WIP
                  </span>
                )}
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent side="bottom">{o.label}</TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroup>
    </TooltipProvider>
  )
}
