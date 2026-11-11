"use client";

import { useHeroSink } from "@/hooks/use-hero-sink";
import { useLoreRings } from "@/hooks/use-lore-rings";
import { useReveal } from "@/hooks/use-reveal";
import { useTextReveal } from "@/hooks/use-text-reveal";

/* Renders nothing; starts the scroll animations of the home page. */
export default function HomeEffects() {
  useReveal();
  useHeroSink();
  useTextReveal();
  useLoreRings();
  return null;
}
