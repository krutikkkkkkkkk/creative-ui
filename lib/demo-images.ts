/** Classical artworks from Unsplash, shared by the component previews. */

const unsplash = (id: string, width = 900) =>
  `https://images.unsplash.com/photo-${id}?w=${width}&q=80&auto=format&fit=crop`

export const demoImages = {
  statue: { src: unsplash("1566054757965-8c4085344c96"), alt: "Marble statue" },
  portrait: { src: unsplash("1576773689115-5cd2b0223523"), alt: "Pre-Raphaelite painting of a woman in robes" },
  stillLife: { src: unsplash("1579783902614-a3fb3927b6a5"), alt: "Floral still life" },
  waterJar: { src: unsplash("1577720643272-265f09367456"), alt: "Painting of a woman carrying a water jar" },
  lakeside: { src: unsplash("1578926375605-eaf7559b1458", 1200), alt: "Lakeside landscape painting" },
  pastoral: { src: unsplash("1578301978693-85fa9c0320b9", 1200), alt: "Pastoral landscape with sheep" },
}
