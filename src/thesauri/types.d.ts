export type Thesaurus = {
  about: string
  cardMax: string
  cardMin: string
  date: string
  description: string
  facet: boolean
  id: string
  identifier: string
  order: string
  slug: string
  title: string
}

export type ThesaurusKeyword = {
  about: string
  altLabel: string
  id: string
  thesaurus: string
}

export type ThesaurusKeywordLabel = {
  id: string
  keyword: string
  label: string
  lang: string
}
