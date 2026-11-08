"use client";

import { useState, useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Arrow from "@/components/atoms/Arrow";
import FeatureCard from "@/components/molecules/FeatureCard";
import { features } from "@/data/home";

gsap.registerPlugin(ScrollTrigger);

export default function FeaturesSection() {
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stInstance = useRef<ScrollTrigger | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 992px)", () => {
        const track = trackRef.current;
        const wrap = wrapRef.current;
        if (!track || !wrap) return;

        const getDistance = () => {
          return track.scrollWidth - window.innerWidth + 140;
        };

        const tween = gsap.to(track, {
          x: () => -getDistance(),
          ease: "none",
          scrollTrigger: {
            trigger: wrap,
            start: "top top",
            end: () =>
              `+=${Math.max(window.innerHeight * 2, getDistance() * 1.4)}`,
            pin: true,
            scrub: 1.2,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const cardIdx = Math.min(
                features.length - 1,
                Math.max(
                  0,
                  Math.floor(self.progress * features.length * 0.999),
                ),
              );
              setActive(cardIdx);
            },
          },
        });

        stInstance.current = tween.scrollTrigger ?? null;
      });
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  const goToCard = (index: number) => {
    const clamped = Math.max(0, Math.min(features.length - 1, index));
    setActive(clamped);

    const st = stInstance.current;
    if (st && window.innerWidth >= 992) {
      const targetRatio = clamped / (features.length - 1);
      const targetScroll = st.start + targetRatio * (st.end - st.start);
      window.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
    } else if (trackRef.current) {
      const card = trackRef.current.children[clamped] as HTMLElement;
      if (card) {
        card.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  };

  return (
    <section className="bg-white overflow-hidden py-100 px-0 relative feat:h-screen feat:min-h-700 feat:p-0 feat:flex feat:flex-col feat:justify-center feat:relative feat:overflow-hidden" id="fitur" ref={wrapRef}>
      <div className="w-full feat:flex feat:flex-col feat:justify-center feat:w-full">
        <div className="my-0 mx-auto max-w-1680 py-0 px-20 relative w-full md:py-0 md:px-40 lg:py-0 lg:px-80 [.auth>&]:relative [.auth>&]:z-1 [.page-hero>&]:relative [.page-hero>&]:z-1 container">
          <div className="items-end flex flex-wrap gap-40 justify-between mb-60 [&_h2]:max-w-1100 feat:mb-50">
            <h2 className="text-[5.2rem] font-[320] tracking-[-0.04em] leading-[1] md:text-[8rem] lg:text-[12rem]">Yang dikerjakan SAKSI</h2>
          </div>
        </div>

        <div className="overflow-hidden w-full feat:overflow-hidden feat:w-full">
          <div className="gap-x-20 flex overflow-x-auto py-0 px-20 [scroll-padding:0_2rem] [scroll-snap-type:x_mandatory] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-x-30 md:py-0 md:px-40 md:[scroll-padding:0_4rem] feat:gap-x-36 feat:overflow-x-visible feat:[scroll-snap-type:none] feat:w-max feat:[will-change:transform] feat:[--edge:max(8rem,_calc((100vw_-_168rem)_/_2_+_8rem))] feat:py-0 feat:px-[var(--edge)]" ref={trackRef}>
            {features.map((feature, i) => (
              <FeatureCard key={feature.title} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
