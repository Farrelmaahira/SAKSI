import type { LogoTone } from '@/interfaces/logo'

/* line: outlines, seal, eraser. accent: house and pencil body. paper: sheet and pencil tip. check: tick on the seal. door: the door has its own pair so it stays visible on a solid house. */
export const logoTones: Record<LogoTone, Record<string, string>> = {
  color: { '--logo-line': '#0B0B0C', '--logo-accent': '#2563EB', '--logo-paper': '#FFFFFF', '--logo-check': '#FFFFFF', '--logo-door-fill': '#FFFFFF', '--logo-door-line': '#0B0B0C' },
  white: { '--logo-line': '#FFFFFF', '--logo-accent': '#FFFFFF', '--logo-paper': 'none', '--logo-check': '#0B0B0C', '--logo-door-fill': '#0B0B0C', '--logo-door-line': '#0B0B0C' },
  black: { '--logo-line': '#0B0B0C', '--logo-accent': '#0B0B0C', '--logo-paper': 'none', '--logo-check': '#FFFFFF', '--logo-door-fill': '#FFFFFF', '--logo-door-line': '#FFFFFF' },
}
