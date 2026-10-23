export type Testimonial = {
  quote: string
  name: string
  /** "Role at Company", or just the role. */
  role: string
  href?: string
  /** Path under /public. Falls back to the person's initials when omitted. */
  avatar?: string
}

/* Add testimonials here: real quotes only, with the person's permission.
   While this is empty the section shows an invitation to share one. */
export const TESTIMONIALS: Testimonial[] = []
