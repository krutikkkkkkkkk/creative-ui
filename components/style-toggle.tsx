"use client"

import { UI_STYLE_COOKIE, isUiStyle, type UiStyle } from "@/lib/ui-style"
import { cn } from "@/lib/utils"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

/* Switches the whole site between its two looks. Each option is set in its own display face,
   so "Aa" in serif and "Aa" in tight sans say what they do. The looks are separate prerendered
   trees (app/[style]), so a switch saves the cookie and reloads into the other one. */

const OPTIONS: { value: UiStyle; label: string; face: string }[] = [
  { value: "classic", label: "Classic look", face: "font-[family-name:var(--font-geist-serif-regular)] font-normal" },
  { value: "modern", label: "Modern look", face: "font-sans font-semibold tracking-[-0.06em]" },
]

export function StyleToggle({ style, className }: { style: UiStyle; className?: string }) {
  function choose(value: string) {
    if (!isUiStyle(value) || value === style) return
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
        className={cn("h-8 gap-0.5 rounded-full border p-0.5", className)}
      >
        {OPTIONS.map((o) => (
          <Tooltip key={o.value}>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value={o.value}
                aria-label={o.label}
                className={cn(
                  "h-full min-w-0 rounded-full px-2 text-[13px] leading-none text-muted-foreground hover:bg-transparent hover:text-foreground data-[state=on]:bg-foreground data-[state=on]:text-background",
                  o.face
                )}
              >
                Aa
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent side="bottom">{o.label}</TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroup>
    </TooltipProvider>
  )
}
