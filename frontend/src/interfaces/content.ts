import type { IllustrationName } from '@/data/illustrations'

/* Static copy shown on the landing pages. */

export interface NavLink {
  label: string
  href: string
}

export interface Feature {
  title: string
  text: string
  image: IllustrationName
  tag?: string
}

export interface Benefit {
  title: string
  text: string
  image: IllustrationName
}

export interface ScopeFolderItem {
  title: string
  note: string
  doc: string
  clause: string
  suggestion: string
  text: string
}

export interface AboutItem {
  title: string
  text: string
}

export interface FlowItem {
  label: string
  desc: string
  art: IllustrationName
}

export interface FaqEntry {
  question: string
  answer: string
}

export interface ReportCategory {
  title: string
  note: string
}
