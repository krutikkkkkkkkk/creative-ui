/* Its own file, so the header and footer don't pull in the docs sidebar (and its Radix bundle). */
export function Logo({ className = "size-8" }: { className?: string }) {
  return (
    <div
      className={`${className} relative grid shrink-0 place-items-center overflow-hidden rounded-lg bg-foreground text-background`}
    >
      <span className="font-serif text-lg leading-none italic">c</span>
      <span className="absolute right-1 bottom-1 size-1.5 rounded-full bg-amber-400" />
    </div>
  )
}
