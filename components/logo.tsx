import Image from "next/image"

import { cn } from "@/lib/utils"

/* Its own file, so the header and footer don't pull in the docs sidebar (and its Radix bundle). */
export function Logo({ className = "size-8" }: { className?: string }) {
  return (
    <Image
      src="/creative-ui-logo.png"
      alt=""
      width={455}
      height={461}
      sizes="40px"
      priority
      className={cn(className, "shrink-0 object-contain")}
    />
  )
}
