export type Keyword = {
  id: string
  name: string
  position: string
  /** null means root */
  relativeTo: string | null
  slug: string
}
